import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

/**
 * GET /api/doctor/analytics/ai-referrals
 * Get AI referral metrics for doctor dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')

    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'month'

    const supabase = await createClient()

    // Get doctor's profile to check specialty
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, specialty_id')
      .eq('user_id', user.id)
      .single()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()

    switch (timeframe) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Fetch AI referrals for this doctor
    const { data: referrals, error } = await supabase
      .from('ai_doctor_referrals')
      .select('*')
      .eq('doctor_id', doctor.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching referrals:', error)
    }

    // Calculate weekly trend
    const weeklyTrend = calculateWeeklyTrend(referrals || [], startDate, now)

    // Calculate conversion rate
    const totalReferrals = referrals?.length || 0
    const convertedReferrals = referrals?.filter((r: any) => r.status === 'booked').length || 0
    const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0

    // Get previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const { data: previousReferrals } = await supabase
      .from('ai_doctor_referrals')
      .select('*')
      .eq('doctor_id', doctor.id)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const lastMonth = previousReferrals?.length || 0

    // Aggregate by specialty
    const specialtyCounts = referrals?.reduce((acc: any, r: any) => {
      const specialty = r.referral_context?.specialty || 'Otro'
      acc[specialty] = (acc[specialty] || 0) + 1
      return acc
    }, {})

    const topSpecialties = Object.entries(specialtyCounts)
      .map(([specialty, count]) => ({ specialty, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      totalReferrals,
      thisMonth: referrals?.length || 0,
      lastMonth,
      conversionRate: Math.round(conversionRate),
      avgResponseTime: 2.4, // Mock data - would calculate from actual data
      topSpecialties,
      weeklyTrend,
    })
  } catch (error) {
    console.error('AI metrics API error:', error)
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    )
  }
}

function calculateWeeklyTrend(referrals: any[], startDate: Date, endDate: Date) {
  const weeks = []
  const currentWeek = new Date(startDate)

  while (currentWeek <= endDate) {
    const weekEnd = new Date(currentWeek)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekReferrals = referrals.filter((r) => {
      const refDate = new Date(r.created_at)
      return refDate >= currentWeek && refDate <= weekEnd
    })

    weeks.push({
      week: `${currentWeek.getDate()}/${currentWeek.getMonth() + 1}`,
      referrals: weekReferrals.length,
    })

    currentWeek.setDate(currentWeek.getDate() + 7)
  }

  // Ensure we always have data
  if (weeks.length === 0) {
    return [
      { week: '1/1', referrals: 0 },
      { week: '8/1', referrals: 0 },
      { week: '15/1', referrals: 0 },
      { week: '22/1', referrals: 0 },
    ]
  }

  return weeks
}
