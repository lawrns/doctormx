// Admin Revenue API - GET /api/admin/revenue
// Returns revenue summary and daily breakdown for dashboard

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getRevenueSummary, projectAnnualRevenue } from '@/lib/payment-with-fees'

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse time range
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    let days = 30
    switch (range) {
      case '7d': days = 7; break
      case '30d': days = 30; break
      case '90d': days = 90; break
      case '1y': days = 365; break
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get revenue summary
    const summary = await getRevenueSummary(startDate, endDate)

    // Get daily revenue
    const { data: dailyRevenue, error: dailyError } = await supabase
      .from('daily_revenue')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (dailyError) {
      console.error('Error fetching daily revenue:', dailyError)
    }

    // Get subscription revenue for this period
    const { data: subscriptions } = await supabase
      .from('doctor_subscriptions')
      .select('plan_price_cents, created_at')
      .eq('status', 'active')
      .gte('created_at', startDate.toISOString())

    const subscriptionRevenue = (subscriptions || [])
      .reduce((sum, sub) => sum + (sub.plan_price_cents || 0), 0)

    // Calculate ARR projection
    const projection = await projectAnnualRevenue()

    return NextResponse.json({
      success: true,
      summary: {
        ...summary,
        subscriptionRevenue,
      },
      daily: (dailyRevenue || []).map(day => ({
        date: day.date,
        subscriptionRevenueCents: day.subscription_revenue_cents,
        platformFeeRevenueCents: day.platform_fee_revenue_cents,
        totalConsults: day.total_consults,
        doctorPayoutsCents: day.doctor_payouts_cents,
      })),
      projection,
      range,
    })

  } catch (error) {
    console.error('Revenue API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
