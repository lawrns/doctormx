import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upgradeSubscription, SUBSCRIPTION_TIERS } from '@/lib/subscription'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const { newTier } = body

        if (!newTier || !SUBSCRIPTION_TIERS.includes(newTier)) {
            return NextResponse.json(
                { error: 'Invalid tier. Must be one of: starter, pro, elite' },
                { status: 400 }
            )
        }

        const result = await upgradeSubscription(user.id, newTier)

        return NextResponse.json({
            success: true,
            subscription: result.subscription,
            stripeSubscriptionId: result.stripeSubscriptionId,
        })
    } catch (error) {
        logger.error('Error upgrading subscription:', { err: error })
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upgrade subscription' },
            { status: 500 }
        )
    }
}
