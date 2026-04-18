import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  getReferralSummaryForUser,
  redeemReferralAtSignup,
} from '@/lib/domains/patient-referrals'
import { ANALYTICS_EVENTS, trackServerEvent } from '@/lib/analytics/posthog'

const redeemRequestSchema = z.object({
  referralCode: z.string().optional().nullable(),
})

async function getAuthenticatedUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return user?.id || null
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const summary = await getReferralSummaryForUser(userId)

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error('[PatientReferrals] Failed to load summary:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to load referral summary' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = redeemRequestSchema.safeParse(await request.json().catch(() => ({})))
    if (!body.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid referral payload',
          details: body.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const result = await redeemReferralAtSignup({
      newUserId: userId,
      referralCode: body.data.referralCode || null,
    })

    const summary = await getReferralSummaryForUser(userId)

    if (result.applied && result.reason !== 'no_code') {
      await trackServerEvent({
        event: ANALYTICS_EVENTS.REFERRAL_CODE_REDEEMED,
        distinctId: userId,
        userId,
        pathname: '/api/patient-referrals',
        properties: {
          referralCodeProvided: Boolean(body.data.referralCode),
          reason: result.reason || 'rewarded',
          monthlyCapExceeded: result.reason === 'monthly_cap_exceeded',
        },
      })
    }

    return NextResponse.json({
      success: true,
      result,
      summary,
    })
  } catch (error) {
    console.error('[PatientReferrals] Failed to redeem referral:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to redeem referral' },
      { status: 500 }
    )
  }
}
