import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkSubscriptionStatus } from '@/lib/subscription'
import { stripe } from '@/lib/stripe'

type PlanId = 'starter' | 'pro' | 'elite' | 'clinic'
type BillingInterval = 'month' | 'year'

const PRICE_ENV_KEYS: Record<PlanId, Record<BillingInterval, string>> = {
    starter: {
        month: 'STRIPE_STARTER_PRICE_ID',
        year: 'STRIPE_STARTER_ANNUAL_PRICE_ID',
    },
    pro: {
        month: 'STRIPE_PRO_PRICE_ID',
        year: 'STRIPE_PRO_ANNUAL_PRICE_ID',
    },
    elite: {
        month: 'STRIPE_ELITE_PRICE_ID',
        year: 'STRIPE_ELITE_ANNUAL_PRICE_ID',
    },
    clinic: {
        month: 'STRIPE_CLINIC_PRICE_ID',
        year: 'STRIPE_CLINIC_ANNUAL_PRICE_ID',
    },
}

function getPriceId(planId: PlanId, billingInterval: BillingInterval) {
    const envKey = PRICE_ENV_KEYS[planId]?.[billingInterval]
    const priceId = envKey ? process.env[envKey] : undefined

    if (!priceId) {
        throw new Error(`Missing Stripe price env var: ${envKey}`)
    }

    return priceId
}

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
        const planId = (body.planId || 'starter') as PlanId
        const billingInterval = (body.billingInterval || 'month') as BillingInterval

        if (!PRICE_ENV_KEYS[planId] || !['month', 'year'].includes(billingInterval)) {
            return NextResponse.json(
                { error: 'Invalid subscription plan' },
                { status: 400 }
            )
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', user.id)
            .single()

        if (profileError || profile?.role !== 'doctor') {
            return NextResponse.json(
                { error: 'Only doctors can create subscriptions' },
                { status: 403 }
            )
        }

        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .select('id, stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (doctorError || !doctor) {
            return NextResponse.json(
                { error: 'Doctor profile not found' },
                { status: 404 }
            )
        }

        const { data: activeSubscription } = await supabase
            .from('doctor_subscriptions')
            .select('id')
            .eq('doctor_id', user.id)
            .eq('status', 'active')
            .maybeSingle()

        if (activeSubscription) {
            return NextResponse.json(
                { error: 'Doctor already has an active subscription' },
                { status: 409 }
            )
        }

        let customerId = doctor.stripe_customer_id as string | null

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email || undefined,
                name: profile.full_name || undefined,
                metadata: {
                    doctorId: user.id,
                    doctor_id: user.id,
                },
            })

            customerId = customer.id

            await supabase
                .from('doctors')
                .update({
                    stripe_customer_id: customerId,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
        }

        const origin = request.nextUrl.origin
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: getPriceId(planId, billingInterval),
                    quantity: 1,
                },
            ],
            success_url: `${origin}/doctor?subscribed=1`,
            cancel_url: `${origin}/doctor/subscription`,
            subscription_data: {
                metadata: {
                    doctorId: user.id,
                    doctor_id: user.id,
                    planId,
                    tier: planId,
                    billingInterval,
                },
            },
            metadata: {
                doctorId: user.id,
                doctor_id: user.id,
                planId,
                tier: planId,
                billingInterval,
            },
        })

        return NextResponse.json({
            success: true,
            checkoutUrl: session.url,
        })
    } catch (error) {
        console.error('Error creating subscription:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create subscription' },
            { status: 500 }
        )
    }
}
