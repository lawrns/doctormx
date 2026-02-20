import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminError || adminData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await checkRateLimit(ip, '/api/cache/invalidate')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', remaining: rateLimitResult.remaining },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { pattern, type } = body

    if (!pattern && !type) {
      return NextResponse.json(
        { error: 'pattern or type required' },
        { status: 400 }
      )
    }

    let success = false

    if (type === 'doctor') {
      const { doctorId } = body
      if (doctorId) {
        success = await cache.invalidateDoctor(doctorId)
      } else {
        success = await cache.invalidate('doctor:*')
        success = await cache.invalidate('doctors:list:*') && success
      }
    } else if (type === 'availability') {
      const { doctorId } = body
      success = await cache.invalidateAvailability(doctorId)
    } else if (pattern) {
      success = await cache.invalidate(pattern)
    }

    return NextResponse.json({
      success,
      message: success ? 'Cache invalidated' : 'Invalidation failed',
    })
  } catch (error) {
    console.error('Cache invalidation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
