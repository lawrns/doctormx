// Process Referral API - POST /api/auth/process-referral
// Called during registration when a referral code is used

import { NextRequest, NextResponse } from 'next/server'
import { processReferral } from '@/lib/referrals'

export async function POST(request: NextRequest) {
  try {
    const { referralCode, newDoctorId } = await request.json()

    if (!referralCode || !newDoctorId) {
      return NextResponse.json(
        { error: 'Missing referral code or doctor ID' },
        { status: 400 }
      )
    }

    const result = await processReferral(referralCode, newDoctorId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      reward: result.reward,
      message: result.reward 
        ? `¡Felicidades! Ganaste: ${result.reward.description}`
        : 'Referido registrado correctamente',
    })

  } catch (error) {
    console.error('Process referral API error:', error)
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    )
  }
}
