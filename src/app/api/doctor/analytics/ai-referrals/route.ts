import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

type ReferralRecord = {
  created_at: string
  booked_at?: string | null
  status?: string | null
  referral_context?: {
    specialty?: string
  } | null
}

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
    const typedReferrals = (referrals || []) as ReferralRecord[]
    const weeklyTrend = calculateWeeklyTrend(typedReferrals, startDate, now)

    // Calculate conversion rate
    const totalReferrals = typedReferrals.length
    const convertedReferrals = typedReferrals.filter((r) => r.status === 'booked').length
    const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0
    const avgResponseTime = calculateAverageResponseTimeHours(typedReferrals)

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
    const specialtyCounts = typedReferrals.reduce((acc: Record<string, number>, r) => {
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
      thisMonth: typedReferrals.length,
      lastMonth,
      conversionRate: Math.round(conversionRate),
      avgResponseTime,
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

function calculateWeeklyTrend(referrals: ReferralRecord[], startDate: Date, endDate: Date) {
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

function calculateAverageResponseTimeHours(referrals: ReferralRecord[]) {
  const completed = referrals.filter((referral) => referral.booked_at && referral.created_at)

  if (completed.length === 0) {
    return 0
  }

  const totalHours = completed.reduce((sum, referral) => {
    const createdAt = new Date(referral.created_at).getTime()
    const bookedAt = new Date(referral.booked_at as string).getTime()
    if (Number.isNaN(createdAt) || Number.isNaN(bookedAt) || bookedAt < createdAt) {
      return sum
    }
    return sum + ((bookedAt - createdAt) / (1000 * 60 * 60))
  }, 0)

  return Number((totalHours / completed.length).toFixed(1))
}
