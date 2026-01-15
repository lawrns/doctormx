import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscription, checkSubscriptionStatus } from '@/lib/subscription'

/**
 * GET /api/subscriptions
 * Get current subscription status for authenticated doctor
 */
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const status = await checkSubscriptionStatus(user.id)

        return NextResponse.json({
            success: true,
            ...status,
        })
    } catch (error) {
        console.error('Error checking subscription:', error)
        return NextResponse.json(
            { error: 'Failed to check subscription status' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/subscriptions
 * Create new subscription for doctor
 */
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
        const { planId = 'starter' } = body

        const result = await createSubscription(user.id, planId)

        return NextResponse.json({
            success: true,
            subscription: result.subscription,
            stripeSubscriptionId: result.stripeSubscriptionId,
        })
    } catch (error) {
        console.error('Error creating subscription:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create subscription' },
            { status: 500 }
        )
    }
}
