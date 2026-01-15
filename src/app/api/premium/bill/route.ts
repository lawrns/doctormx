import { NextRequest, NextResponse } from 'next/server'
import type { PremiumFeature } from '@/lib/premium-features'
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
      .select('plan_id, stripe_customer_id')
      .eq('doctor_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 403 }
      )
    }

    const tierMap: Record<string, string> = {
      basic_499: 'starter',
      pro_499: 'pro',
      elite_999: 'elite',
    }
    const tier = tierMap[subscription.plan_id] || 'none'

    const priceMap: Record<string, Record<string, number>> = {
      image_analysis: { none: 500, starter: 0, pro: 0, elite: 0 },
      clinical_copilot: { none: 0, starter: 0, pro: 0, elite: 0 },
      extended_chat: { none: 200, starter: 200, pro: 0, elite: 0 },
      premium_consultation: { none: 1000, starter: 1000, pro: 0, elite: 0 },
      priority_listing: { none: 0, starter: 0, pro: 20000, elite: 0 },
      featured_badge: { none: 0, starter: 0, pro: 0, elite: 50000 },
      unlimited_whatsapp: { none: 0, starter: 0, pro: 0, elite: 0 },
      api_access: { none: 0, starter: 0, pro: 0, elite: 0 },
    }

    const pricePerUse = priceMap[feature]?.[tier] ?? 0

    if (pricePerUse === 0) {
      return NextResponse.json({
        success: true,
        amountCents: 0,
        description: 'Feature included in subscription',
        billed: false,
      })
    }

    const totalAmount = pricePerUse * amount

    const { error: billError } = await supabase
      .from('premium_billing_records')
      .insert({
        doctor_id: user.id,
        feature_key: feature,
        amount_cents: totalAmount,
        currency: 'MXN',
        description: `Uso de ${feature} - ${amount} unidad(es)`,
        status: 'pending',
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (billError) {
      throw new Error(`Failed to create billing record: ${billError.message}`)
    }

    return NextResponse.json({
      success: true,
      amountCents: totalAmount,
      description: `Uso de ${feature} - ${amount} unidad(es)`,
      billed: true,
    })
  } catch (error) {
    console.error('Error billing premium feature:', error)
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
    const period = searchParams.get('period') || 'current'

    const { data: subscription } = await supabase
      .from('doctor_subscriptions')
      .select('current_period_start, current_period_end')
      .eq('doctor_id', user.id)
      .eq('status', 'active')
      .single()

    let startDate: string
    let endDate: string

    if (period === 'current' && subscription) {
      startDate = subscription.current_period_start
      endDate = subscription.current_period_end
    } else {
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    }

    const { data: billingRecords } = await supabase
      .from('premium_billing_records')
      .select('*')
      .eq('doctor_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    const totalBilled = billingRecords?.reduce(
      (sum, r) => sum + (r.status === 'completed' ? r.amount_cents : 0),
      0
    ) || 0

    const pendingAmount = billingRecords
      ?.filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount_cents, 0) || 0

    const byFeature: Record<string, number> = {}
    for (const record of billingRecords || []) {
      byFeature[record.feature_key] =
        (byFeature[record.feature_key] || 0) + record.amount_cents
    }

    return NextResponse.json({
      period: { start: startDate, end: endDate },
      totalBilled,
      pendingAmount,
      byFeature,
      transactions: billingRecords?.length || 0,
    })
  } catch (error) {
    console.error('Error getting billing history:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
