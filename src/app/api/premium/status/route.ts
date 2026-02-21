import { NextRequest, NextResponse } from 'next/server'
import { type PremiumFeature, getTierFromPlanId } from '@/lib/premium-features'
import { requireRole } from '@/lib/auth'
import { logger } from '@/lib/observability/logger'

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
    // Check user role and return appropriate response
    let userId: string
    let supabaseClient: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>
    let userRole: 'doctor' | 'patient' | null = null

    // Try to get doctor role
    try {
      const { user, supabase } = await requireRole('doctor')
      userId = user.id
      supabaseClient = supabase
      userRole = 'doctor'
    } catch {
      // Not a doctor - check if patient
      try {
        const { user, supabase } = await requireRole('patient')
        userId = user.id
        supabaseClient = supabase
        userRole = 'patient'
      } catch {
        // Not authenticated or no role
        const { searchParams } = new URL(request.url)
        const featureParam = searchParams.get('feature')

        if (featureParam && Object.keys(limitMap).includes(featureParam)) {
          return NextResponse.json({
            feature: featureParam,
            hasAccess: false,
            tier: 'starter',
            tierName: 'Starter',
            used: 0,
            limit: 0,
            remaining: 0,
            needsUpgrade: true,
            upgradeTo: 'pro',
            pricePerUse: null,
            isIncluded: false,
          })
        }

        return NextResponse.json({
          tier: 'starter',
          tierName: 'Starter',
          hasSubscription: false,
          featureStatus: {},
          includedFeatures: [],
        })
      }
    }

    const { searchParams } = new URL(request.url)
    const featureParam = searchParams.get('feature')

    // Patient flow - give 3 free image analyses per month
    if (userRole === 'patient') {
      if (featureParam === 'image_analysis') {
        // Get patient's usage this month
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const { data: patientUsage } = await supabaseClient
          .from('medical_image_analyses')
          .select('id')
          .eq('patient_id', userId)
          .gte('created_at', monthStart)

        const used = patientUsage?.length || 0
        const limit = 3
        const remaining = Math.max(0, limit - used)
        const hasAccess = used < limit

        return NextResponse.json({
          feature: 'image_analysis',
          hasAccess,
          tier: 'patient',
          tierName: 'Paciente',
          used,
          limit,
          remaining,
          needsUpgrade: !hasAccess,
          upgradeTo: 'premium',
          pricePerUse: null,
          isIncluded: true,
          userRole: 'patient',
        })
      }

      // For other features, patients don't have access
      if (featureParam && Object.keys(limitMap).includes(featureParam)) {
        return NextResponse.json({
          feature: featureParam,
          hasAccess: false,
          tier: 'patient',
          tierName: 'Paciente',
          used: 0,
          limit: 0,
          remaining: 0,
          needsUpgrade: false,
          upgradeTo: null,
          pricePerUse: null,
          isIncluded: false,
          userRole: 'patient',
        })
      }

      // Return all feature status for patients
      const featureStatus: Record<string, {
        hasAccess: boolean
        used: number
        limit: number | null
        remaining: number
        isIncluded: boolean
      }> = {}

      for (const key of Object.keys(limitMap)) {
        if (key === 'image_analysis') {
          const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
          const { data: patientUsage } = await supabaseClient
            .from('medical_image_analyses')
            .select('id')
            .eq('patient_id', userId)
            .gte('created_at', monthStart)

          const used = patientUsage?.length || 0
          featureStatus[key] = {
            hasAccess: used < 3,
            used,
            limit: 3,
            remaining: Math.max(0, 3 - used),
            isIncluded: true,
          }
        } else {
          featureStatus[key] = {
            hasAccess: false,
            used: 0,
            limit: 0,
            remaining: 0,
            isIncluded: false,
          }
        }
      }

      return NextResponse.json({
        tier: 'patient',
        tierName: 'Paciente',
        hasSubscription: false,
        featureStatus,
        includedFeatures: ['image_analysis'],
        userRole: 'patient',
      })
    }

    // Doctor flow - get subscription info
    // searchParams and featureParam already declared above
    const { data: subscription } = await supabaseClient
      .from('doctor_subscriptions')
      .select('plan_id, status, current_period_start, current_period_end')
      .eq('doctor_id', userId)
      .eq('status', 'active')
      .single()

    const tier = subscription ? getTierFromPlanId(subscription.plan_id) : 'starter'
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1)

    const { data: usageRecords } = await supabaseClient
      .from('premium_feature_usage')
      .select('feature_key, usage_count')
      .eq('doctor_id', userId)
      .eq('period_start', subscription?.current_period_start || new Date().toISOString()) as { data: Array<{ feature_key: string; usage_count: number }> | null }

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
    logger.error('Error checking premium status:', { err: error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
