// Doctor Referrals API - GET /api/doctor/referrals
// Returns referral code, stats, and rewards for logged-in doctor

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referrals'

export async function GET() {
  try {
    const supabase = await createServiceClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify doctor role
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, status')
      .eq('id', user.id)
      .single()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Get or create referral code
    const referralCode = await getOrCreateReferralCode(doctor.id)

    // Get stats
    const stats = await getReferralStats(doctor.id)

    return NextResponse.json({
      success: true,
      code: referralCode.code,
      url: referralCode.url,
      totalReferrals: stats.totalReferrals,
      converted: stats.converted,
      pending: stats.pending,
      nextReward: stats.nextReward,
      totalRewards: stats.totalRewards,
    })

  } catch (error) {
    console.error('Referrals API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}
