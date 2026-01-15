import { NextRequest, NextResponse } from 'next/server'
import { type PremiumFeature, getTierFromPlanId } from '@/lib/premium-features'
import { requireRole } from '@/lib/auth'

const limitMap: Record<string, Record<string, number | null>> = {
  image_analysis: { starter: 0, pro: 0, elite: 10 },
  clinical_copilot: { starter: 0, pro: 50, elite: -1 },
  extended_transcription: { starter: 0, pro: 0, elite: -1 },
  priority_ai_response: { starter: 0, pro: 0, elite: -1 },
}

const includedFeatures: Record<string, string[]> = {
  starter: [],
  pro: ['clinical_copilot'],
  elite: ['image_analysis', 'clinical_copilot', 'extended_transcription', 'priority_ai_response'],
}

export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')
    const { searchParams } = new URL(request.url)
    const featureParam = searchParams.get('feature')

    const { data: subscription } = await supabase
      .from('doctor_subscriptions')
      .select('plan_id, status, current_period_start, current_period_end')
      .eq('doctor_id', user.id)
      .eq('status', 'active')
      .single()

    const tier = subscription ? getTierFromPlanId(subscription.plan_id) : 'starter'
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)

    const { data: usageRecords } = await supabase
      .from('premium_feature_usage')
      .select('feature_key, usage_count')
      .eq('doctor_id', user.id)
      .eq('period_start', subscription?.current_period_start || new Date().toISOString())

    if (featureParam && Object.keys(limitMap).includes(featureParam)) {
      const featureKey = featureParam as PremiumFeature
      const isIncluded = includedFeatures[tier].includes(featureKey)
      const limit = limitMap[featureParam]?.[tier] ?? null
      const used = usageRecords?.find(r => r.feature_key === featureParam)?.usage_count || 0
      const remaining = limit === null ? -1 : Math.max(0, limit - used)
      const hasAccess = isIncluded && (limit === null || used < limit)

      let needsUpgrade = false
      let upgradeTo: 'pro' | 'elite' | undefined

      if (!hasAccess) {
        if (tier === 'starter') {
          needsUpgrade = true
          upgradeTo = 'pro'
        } else if (tier === 'pro') {
          needsUpgrade = true
          upgradeTo = 'elite'
        }
      }

      const pricePerUse = null

      return NextResponse.json({
        feature: featureKey,
        hasAccess,
        tier,
        tierName,
        used,
        limit,
        remaining,
        needsUpgrade,
        upgradeTo,
        pricePerUse: pricePerUse || null,
        isIncluded,
      })
    }

    const featureStatus: Record<string, {
      hasAccess: boolean
      used: number
      limit: number | null
      remaining: number
      isIncluded: boolean
    }> = {}

    for (const key of Object.keys(limitMap)) {
      const isIncluded = includedFeatures[tier].includes(key)
      const limit = limitMap[key]?.[tier] ?? null
      const used = usageRecords?.find(r => r.feature_key === key)?.usage_count || 0
      const remaining = limit === null ? -1 : Math.max(0, limit - used)
      const hasAccess = isIncluded && (limit === null || used < limit)

      featureStatus[key] = {
        hasAccess,
        used,
        limit,
        remaining,
        isIncluded,
      }
    }

    return NextResponse.json({
      tier,
      tierName,
      hasSubscription: !!subscription,
      featureStatus,
      includedFeatures: includedFeatures[tier],
    })
  } catch (error) {
    console.error('Error checking premium status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
