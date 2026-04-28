import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getReferralSummaryForUser,
  redeemReferralAtSignup,
} from '@/lib/domains/patient-referrals'
import { ANALYTICS_EVENTS, trackServerEvent } from '@/lib/analytics/posthog'
import { withAuth } from '@/lib/api-auth'

const redeemRequestSchema = z.object({
  referralCode: z.string().optional().nullable(),
})

export const GET = withAuth(async (request, { user }) => {
  const summary = await getReferralSummaryForUser(user.id)

  return NextResponse.json({
    success: true,
    summary,
  })
})

export const POST = withAuth(async (request, { user }) => {
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
    newUserId: user.id,
    referralCode: body.data.referralCode || null,
  })

  const summary = await getReferralSummaryForUser(user.id)

  if (result.applied && result.reason !== 'no_code') {
    await trackServerEvent({
      event: ANALYTICS_EVENTS.REFERRAL_CODE_REDEEMED,
      distinctId: user.id,
      userId: user.id,
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
})
