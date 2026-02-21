import { NextRequest, NextResponse } from 'next/server'
import { INDIVIDUAL_PREMIUM_FEATURES, createFeaturePurchase, type PremiumFeature } from '@/lib/premium-features'
import { requireRole } from '@/lib/auth'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')

    const body = await request.json()
    const { feature, purchaseType } = body as {
      feature: PremiumFeature
      purchaseType: 'single' | 'bundle'
    }

    if (!feature || !INDIVIDUAL_PREMIUM_FEATURES[feature]) {
      return NextResponse.json(
        { error: 'Invalid feature' },
        { status: 400 }
      )
    }

    if (!purchaseType || (purchaseType !== 'single' && purchaseType !== 'bundle')) {
      return NextResponse.json(
        { error: 'Valid purchase type (single or bundle) is required' },
        { status: 400 }
      )
    }

    const session = await createFeaturePurchase(user.id, feature, purchaseType)

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    })
  } catch (error) {
    logger.error('Error creating purchase session:', { err: error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
