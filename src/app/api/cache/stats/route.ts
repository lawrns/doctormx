import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/cache'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/observability/logger'

async function getCacheStats(): Promise<{
  connected: boolean
  keyCount: number
}> {
  if (!redis) {
    return { connected: false, keyCount: 0 }
  }
  try {
    const ping = await redis.ping()
    const keys = await redis.keys('*')

    return {
      connected: ping === 'PONG',
      keyCount: keys.length,
    }
  } catch {
    return {
      connected: false,
      keyCount: 0,
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profileData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await checkRateLimit(ip, '/api/cache/stats')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', remaining: rateLimitResult.remaining },
        { status: 429 }
      )
    }

    const stats = await getCacheStats()

    // Get detailed cache key counts only if Redis is available
    let doctorCacheKeys: string[] = []
    let availabilityCacheKeys: string[] = []
    let listCacheKeys: string[] = []

    if (redis) {
      doctorCacheKeys = await redis.keys('doctor:*')
      availabilityCacheKeys = await redis.keys('availability:*')
      listCacheKeys = await redis.keys('doctores:list:*')
    }

    return NextResponse.json({
      status: stats,
      cacheKeys: {
        doctores: doctorCacheKeys.length,
        availability: availabilityCacheKeys.length,
        lists: listCacheKeys.length,
        total: stats.keyCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Cache stats error:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
