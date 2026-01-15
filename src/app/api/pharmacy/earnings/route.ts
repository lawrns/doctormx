import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getDoctorEarnings, getDoctorReferrals } from '@/lib/pharmacy'

export async function GET() {
  try {
    const { user, supabase } = await requireRole('doctor')

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
    }

    const earnings = await getDoctorEarnings(doctor.id)
    const referrals = await getDoctorReferrals(doctor.id)

    const recentReferrals = referrals.slice(0, 10)
    const pendingReferrals = referrals.filter((r) => r.status !== 'redeemed' && r.status !== 'cancelled' && r.status !== 'expired')
    const redeemedReferrals = referrals.filter((r) => r.status === 'redeemed')

    return NextResponse.json({
      success: true,
      earnings: {
        ...earnings,
        formatted: {
          totalReferralFees: (earnings.totalReferralFees / 100).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
          }),
          totalCommissions: (earnings.totalCommissions / 100).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
          }),
          platformFees: (earnings.platformFees / 100).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
          }),
          netEarnings: (earnings.netEarnings / 100).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
          }),
        },
      },
      stats: {
        totalReferrals: referrals.length,
        pendingReferrals: pendingReferrals.length,
        redeemedReferrals: redeemedReferrals.length,
        conversionRate: referrals.length > 0
          ? ((redeemedReferrals.length / referrals.length) * 100).toFixed(1)
          : '0',
      },
      recentReferrals: recentReferrals.map((r) => ({
        id: r.id,
        referral_code: r.referral_code,
        status: r.status,
        created_at: r.created_at,
        pharmacy_name: r.pharmacy?.name,
        medications_summary: r.medications_summary,
        estimated_total_cents: r.estimated_total_cents,
      })),
    })
  } catch (error) {
    console.error('Error getting earnings:', error)
    return NextResponse.json(
      { error: 'Failed to get earnings' },
      { status: 500 }
    )
  }
}
