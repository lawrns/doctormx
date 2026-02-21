import { NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_TIERS } from '@/lib/subscription'
import { logger } from '@/lib/observability/logger'

export async function GET() {
    try {
        const plans = SUBSCRIPTION_TIERS.map(tier => {
            const plan = SUBSCRIPTION_PLANS[tier]
            return {
                id: plan.id,
                name: plan.name,
                name_es: plan.name_es,
                price_mxn: plan.price_mxn,
                price_cents: plan.price_cents,
                currency: plan.currency,
                features: plan.features,
                limits: plan.limits,
                highlight: plan.highlight || false,
            }
        })

        return NextResponse.json({
            success: true,
            plans,
        })
    } catch (error) {
        logger.error('Error fetching plans:', { err: error })
        return NextResponse.json(
            { error: 'Failed to fetch plans' },
            { status: 500 }
        )
    }
}
