// AI Referrals Analytics - Track recommendation success and quality
// GET: Retrieve referral analytics for a session or overall

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { AIReferralAnalytics, AnalyticsStats } from '@/lib/types/api'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const specialty = searchParams.get('specialty')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    const supabase = await createServiceClient()

    // Build query
    let query = supabase
      .from('ai_match_analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    // Filter by session if provided
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    // Filter by specialty if provided
    if (specialty) {
      query = query.eq('specialty', specialty)
    }

    const { data: analytics, error } = await query

    if (error) {
      throw error
    }

    // Calculate aggregate stats
    const stats: AnalyticsStats = {
      total: analytics?.length || 0,
      avgScore: analytics?.reduce((sum: number, a: AIReferralAnalytics) => sum + (a.avg_score || 0), 0) / (analytics?.length || 1) || 0,
      avgDoctorsAvailable: analytics?.reduce((sum: number, a: AIReferralAnalytics) => sum + (a.doctors_available || 0), 0) / (analytics?.length || 1) || 0,
      avgDoctorsMatched: analytics?.reduce((sum: number, a: AIReferralAnalytics) => sum + (a.doctors_matched || 0), 0) / (analytics?.length || 1) || 0,
      bySpecialty: {},
      byUrgency: {},
    }

    // Group by specialty
    analytics?.forEach((a: AIReferralAnalytics) => {
      const specialty = a.specialty || 'unknown'
      if (!stats.bySpecialty[specialty]) {
        stats.bySpecialty[specialty] = { count: 0, avgScore: 0 }
      }
      stats.bySpecialty[specialty].count++
      stats.bySpecialty[specialty].avgScore += a.avg_score || 0
    })

    // Calculate averages by specialty
    Object.keys(stats.bySpecialty).forEach(specialty => {
      stats.bySpecialty[specialty].avgScore /= stats.bySpecialty[specialty].count
    })

    // Group by urgency
    analytics?.forEach((a: AIReferralAnalytics) => {
      const urgency = a.urgency || 'unknown'
      if (!stats.byUrgency[urgency]) {
        stats.byUrgency[urgency] = { count: 0, avgScore: 0 }
      }
      stats.byUrgency[urgency].count++
      stats.byUrgency[urgency].avgScore += a.avg_score || 0
    })

    // Group by urgency
    analytics?.forEach((a: AIReferralAnalytics) => {
      const urgency = a.urgency || 'unknown'
      if (!stats.byUrgency[urgency]) {
        stats.byUrgency[urgency] = { count: 0, avgScore: 0 }
      }
      stats.byUrgency[urgency].count++
      stats.byUrgency[urgency].avgScore += a.avg_score || 0
    })

    // Calculate averages by urgency
    Object.keys(stats.byUrgency).forEach(urgency => {
      stats.byUrgency[urgency].avgScore /= stats.byUrgency[urgency].count
    })

    return NextResponse.json({
      analytics,
      stats,
    })

  } catch (error) {
    logger.error('[AI Referrals Analytics] Error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to retrieve referral analytics' },
      { status: 500 }
    )
  }
}
