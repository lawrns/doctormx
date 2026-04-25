// Doctor Referral Stats API – GET /api/doctor/referrals
// Returns referral code, stats, rewards, and leaderboard position

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireDoctorRole } from '@/lib/auth-guard'
import { REFERRAL_REWARDS } from '@/lib/referrals'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx'

export async function GET() {
  try {
    let doctorId: string
    try {
      const result = await requireDoctorRole()
      doctorId = result.doctorId
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('doctor_id', doctorId)
      .single()

    const code = codeData?.code || ''
    const shareUrl = `${BASE_URL}/connect?ref=${code}`
    const registerUrl = `${BASE_URL}/auth/register?ref=${code}`

    const { data: referrals } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_doctor_id', doctorId)

    const total = referrals?.length || 0
    const converted = referrals?.filter((r: { status: string }) => r.status === 'converted').length || 0
    const pending = referrals?.filter((r: { status: string }) => r.status === 'pending').length || 0
    const expired = referrals?.filter((r: { status: string }) => r.status === 'expired').length || 0

    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    const nextMilestone = Object.keys(REFERRAL_REWARDS)
      .map(Number)
      .sort((a, b) => a - b)
      .find(m => m > converted)

    const nextReward = nextMilestone ? {
      threshold: nextMilestone,
      reward: REFERRAL_REWARDS[nextMilestone],
    } : null

    // Leaderboard rank
    const { data: leaderboard } = await supabase.rpc('get_referral_leaderboard', {
      p_limit: 100,
    }).catch(() => ({ data: null }))

    let leaderboardPosition: number | null = null
    if (leaderboard && Array.isArray(leaderboard)) {
      const idx = leaderboard.findIndex((entry: { doctor_id: string }) => entry.doctor_id === doctorId)
      if (idx >= 0) leaderboardPosition = idx + 1
    }

    return NextResponse.json({
      success: true,
      code,
      shareUrl,
      registerUrl,
      stats: {
        total,
        converted,
        pending,
        expired,
      },
      rewards: rewards || [],
      nextReward,
      leaderboardPosition,
    })
  } catch (error) {
    console.error('[DoctorReferrals] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 })
  }
}
