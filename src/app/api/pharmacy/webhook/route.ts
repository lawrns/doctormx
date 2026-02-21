import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redeemReferral, getPharmacyByEmail } from '@/lib/pharmacy'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referralCode, pharmacyId, pharmacyEmail, medicationTotalCents } = body

    if (!referralCode || (!pharmacyId && !pharmacyEmail)) {
      return NextResponse.json(
        { error: 'Referral code and pharmacy identification are required' },
        { status: 400 }
      )
    }

    let actualPharmacyId = pharmacyId

    if (!actualPharmacyId && pharmacyEmail) {
      const pharmacy = await getPharmacyByEmail(pharmacyEmail)
      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 })
      }
      actualPharmacyId = pharmacy.id
    }

    const supabase = createServiceClient()
    const { data: pharmacyProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', pharmacyEmail)
      .single()

    if (!pharmacyProfile) {
      return NextResponse.json({ error: 'Pharmacy account not found' }, { status: 404 })
    }

    const result = await redeemReferral(
      referralCode,
      actualPharmacyId,
      pharmacyProfile.id,
      medicationTotalCents
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Referral redeemed successfully',
    })
  } catch (error) {
    logger.error('Error redeeming referral:', { err: error })
    return NextResponse.json({ error: 'Failed to redeem referral' }, { status: 500 })
  }
}
