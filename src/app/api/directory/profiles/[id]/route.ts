// Directory Profile API - Get unclaimed profile details
// GET: Fetch unclaimed profile by ID

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Fetch unclaimed profile
    const { data: profile, error } = await supabase
      .from('unclaimed_doctor_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    
    // Increment page views
    await supabase
      .from('unclaimed_doctor_profiles')
      .update({ 
        page_views: (profile.page_views ?? 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    
    return NextResponse.json({ profile })
    
  } catch (error) {
    logger.error('[DirectoryProfile] Error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
