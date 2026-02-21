import { NextRequest, NextResponse } from 'next/server'
import { TIER_UPGRADE_PRICING } from '@/lib/premium-features'
import { requireRole } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')

    const body = await request.json()
    const { tier: targetTier } = body as { tier: 'pro' | 'elite' }

    if (!targetTier || (targetTier !== 'pro' && targetTier !== 'elite')) {
      return NextResponse.json(
        { error: 'Valid target tier (pro or elite) is required' },
        { status: 400 }
      )
    }

    const tierPricing = TIER_UPGRADE_PRICING[targetTier]

    if (!tierPricing.stripePriceId) {
      return NextResponse.json(
        { error: 'Tier does not have a Stripe price configured' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    const { data: existingSubscription } = await supabase
      .from('doctor_subscriptions')
      .select('stripe_customer_id, plan_id, id')
      .eq('doctor_id', user.id)
      .eq('status', 'active')
      .single()

    let customerId = existingSubscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: profile?.full_name,
        metadata: {
          doctor_id: user.id,
        },
      })
      customerId = customer.id

      if (existingSubscription?.id) {
        await supabase
          .from('doctor_subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('id', existingSubscription.id)
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierPricing.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        doctor_id: user.id,
        target_tier: targetTier,
        upgrade_from: existingSubscription?.plan_id || 'none',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/doctor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/doctor/subscription/cancel`,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    logger.error('Error creating checkout session:', { err: error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
