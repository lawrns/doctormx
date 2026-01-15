import { NextRequest, NextResponse } from 'next/server'
import { trackFeatureUsage, type PremiumFeature } from '@/lib/premium-features'
import { requireRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')

    const body = await request.json()
    const { feature, amount = 1 } = body as {
      feature: PremiumFeature
      amount?: number
    }

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature is required' },
        { status: 400 }
      )
    }

    const { data: subscription } = await supabase
      .from('doctor_subscriptions')
      .select('plan_id')
      .eq('doctor_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      )
    }

    const result = await trackFeatureUsage(user.id, feature, amount)

    return NextResponse.json({
      success: true,
      feature,
      newCount: result.newCount,
      limit: result.limit,
      remaining: result.limit ? result.limit - result.newCount : -1,
    })
  } catch (error) {
    console.error('Error tracking premium feature usage:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')
    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature') as PremiumFeature | null

    const { data: subscription } = await supabase
      .from('doctor_subscriptions')
      .select('plan_id, current_period_start, current_period_end')
      .eq('doctor_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        tier: 'none',
        usage: {},
      })
    }

    const { data: usageRecords } = await supabase
      .from('premium_feature_usage')
      .select('feature_key, usage_count')
      .eq('doctor_id', user.id)
      .eq('period_start', subscription.current_period_start)

    const usage: Record<string, { used: number; limit: number | null }> = {}

    if (feature) {
      const tierMap: Record<string, string> = {
        basic_499: 'starter',
        pro_499: 'pro',
        elite_999: 'elite',
      }
       const tier = tierMap[subscription.plan_id] || 'none'

       const limitMap: Record<string, Record<string, number | null>> = {
        image_analysis: { none: 0, starter: 0, pro: 5, elite: 10 },
        clinical_copilot: { none: 0, starter: 0, pro: 0, elite: null },
        extended_chat: { none: 0, starter: 0, pro: 500, elite: null },
        premium_consultation: { none: 0, starter: 0, pro: 20, elite: 50 },
        unlimited_whatsapp: { none: 30, starter: 100, pro: 100, elite: null },
        priority_listing: { none: 0, starter: 0, pro: null, elite: null },
        featured_badge: { none: 0, starter: 0, pro: 0, elite: null },
        api_access: { none: 0, starter: 0, pro: 0, elite: null },
      }

      const used = usageRecords?.find(r => r.feature_key === feature)?.usage_count || 0
      const limit = limitMap[feature]?.[tier] ?? null

      return NextResponse.json({
        feature,
        tier,
        used,
        limit,
        remaining: limit === null ? -1 : Math.max(0, limit - used),
      })
    }

    const tierMap: Record<string, string> = {
      basic_499: 'starter',
      pro_499: 'pro',
      elite_999: 'elite',
    }
    const tier = tierMap[subscription.plan_id] || 'none'

    const limitMap: Record<string, Record<string, number | null>> = {
      image_analysis: { none: 0, starter: 0, pro: 5, elite: 10 },
      clinical_copilot: { none: 0, starter: 0, pro: 0, elite: null },
      extended_chat: { none: 0, starter: 0, pro: 500, elite: null },
      premium_consultation: { none: 0, starter: 0, pro: 20, elite: 50 },
      unlimited_whatsapp: { none: 30, starter: 100, pro: 100, elite: null },
      priority_listing: { none: 0, starter: 0, pro: null, elite: null },
      featured_badge: { none: 0, starter: 0, pro: 0, elite: null },
      api_access: { none: 0, starter: 0, pro: 0, elite: null },
    }

    for (const [key, limits] of Object.entries(limitMap)) {
      const used = usageRecords?.find(r => r.feature_key === key)?.usage_count || 0
      usage[key] = {
        used,
        limit: limits[tier as keyof typeof limits] ?? null,
      }
    }

    return NextResponse.json({
      hasSubscription: true,
      tier,
      usage,
    })
  } catch (error) {
    console.error('Error getting premium usage:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
