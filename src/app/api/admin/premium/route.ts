import { NextRequest, NextResponse } from 'next/server'
import { INDIVIDUAL_PREMIUM_FEATURES, type PremiumFeature } from '@/lib/premium-features'
import { requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireRole('admin')
    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature') as PremiumFeature | null

    const { data: subscriptions } = await supabase
      .from('doctor_subscriptions')
      .select('doctor_id, plan_id, status, current_period_start, current_period_end, created_at')
      .eq('status', 'active')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')

    const { data: usageRecords } = await supabase
      .from('premium_feature_usage')
      .select('*')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const tierMap: Record<string, string> = {
      basic_499: 'starter',
      pro_499: 'pro',
      elite_999: 'elite',
    }

    const doctorsByTier: Record<string, Array<{
      id: string
      name: string
      email: string
      periodStart: string | null
      periodEnd: string | null
    }>> = {
      none: [],
      starter: [],
      pro: [],
      elite: [],
    }

    const doctorMap: Record<string, { name: string; email: string }> = {}
    for (const p of profiles || []) {
      doctorMap[p.id] = { name: p.full_name, email: p.email || '' }
    }

    for (const sub of subscriptions || []) {
      const tier = tierMap[sub.plan_id] || 'none'
      const doctor = doctorMap[sub.doctor_id]
      doctorsByTier[tier].push({
        id: sub.doctor_id,
        name: doctor?.name || 'Unknown',
        email: doctor?.email || '',
        periodStart: sub.current_period_start,
        periodEnd: sub.current_period_end,
      })
    }

    const { data: billingRecords } = await supabase
      .from('premium_billing_records')
      .select('*')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const revenueByFeature: Record<string, number> = {}
    const revenueByTier: Record<string, number> = {
      none: 0,
      starter: 0,
      pro: 0,
      elite: 0,
    }
    let totalRevenue = 0
    let pendingRevenue = 0

    for (const record of billingRecords || []) {
      const tier = tierMap[subscriptions?.find(s => s.doctor_id === record.doctor_id)?.plan_id || ''] || 'none'
      revenueByFeature[record.feature_key] =
        (revenueByFeature[record.feature_key] || 0) + record.amount_cents
      revenueByTier[tier] += record.amount_cents
      totalRevenue += record.amount_cents
      if (record.status === 'pending') {
        pendingRevenue += record.amount_cents
      }
    }

    if (feature) {
      const featureDefinition = INDIVIDUAL_PREMIUM_FEATURES[feature]
      const doctorsWithAccess = Object.entries(doctorsByTier).filter(([tier]) =>
        featureDefinition.tierAccess[tier as keyof typeof featureDefinition.tierAccess]?.included
      ).flatMap(([, docs]) => docs)

      const featureUsage = (usageRecords || [])
        .filter(r => r.feature_key === feature)
        .reduce((sum, r) => sum + r.usage_count, 0)

      return NextResponse.json({
        feature,
        featureName: featureDefinition.name,
        doctorsByTier: Object.fromEntries(
          Object.entries(doctorsByTier).filter(([tier]) =>
            featureDefinition.tierAccess[tier as keyof typeof featureDefinition.tierAccess]?.included
          )
        ),
        totalDoctorsWithAccess: doctorsWithAccess.length,
        totalUsage: featureUsage,
        revenue: revenueByFeature[feature] || 0,
      })
    }

    return NextResponse.json({
      summary: {
        totalDoctors: Object.values(doctorsByTier).reduce((sum, d) => sum + d.length, 0),
        byTier: {
          none: doctorsByTier.none.length,
          starter: doctorsByTier.starter.length,
          pro: doctorsByTier.pro.length,
          elite: doctorsByTier.elite.length,
        },
      },
      doctorsByTier,
      revenue: {
        total: totalRevenue,
        pending: pendingRevenue,
        byFeature: revenueByFeature,
        byTier: revenueByTier,
      },
      usage: (usageRecords || []).reduce((sum, r) => sum + r.usage_count, 0),
      transactions: billingRecords?.length || 0,
    })
  } catch (error) {
    console.error('Error getting admin premium status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
