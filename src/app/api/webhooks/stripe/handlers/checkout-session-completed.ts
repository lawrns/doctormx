import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { sendSubscriptionWelcomeNotification } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'
import type { SubscriptionTier } from '../types'

/**
 * Handle checkout.session.completed for subscription purchases
 * Creates or updates doctor subscription record
 */
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const supabase = await createClient()
  const doctorId = session.metadata?.doctor_id
  const targetTier = session.metadata?.target_tier

  if (!doctorId || !targetTier) {
    logger.warn('Checkout session completed missing metadata', { sessionId: session.id })
    return
  }

  // Check for idempotency
  const alreadyProcessed = await isEventProcessed(session.id, 'checkout.session.completed')
  if (alreadyProcessed) {
    logger.info(`Checkout session ${session.id} already processed, skipping`)
    return
  }

  try {
    // Get subscription ID from session
    const subscriptionId = session.subscription as string
    if (!subscriptionId) {
      logger.warn('Checkout session completed without subscription', { sessionId: session.id })
      return
    }

    // Retrieve subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
    const priceId = stripeSubscription.items.data[0]?.price?.id

    if (!priceId) {
      logger.error('No price ID found in subscription', { subscriptionId })
      return
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single()

    if (!plan) {
      logger.error('Plan not found for Stripe price', { priceId })
      return
    }

    // Map price to tier
    const stripePricePro = process.env.STRIPE_PRICE_PRO
    const stripePriceElite = process.env.STRIPE_PRICE_ELITE

    const priceToTier: Record<string, SubscriptionTier> = {}
    if (stripePricePro) priceToTier[stripePricePro] = 'pro'
    if (stripePriceElite) priceToTier[stripePriceElite] = 'elite'

    const tier = priceToTier[priceId] || targetTier as SubscriptionTier

    // Create or update subscription record
    const { error: subError } = await supabase
      .from('doctor_subscriptions')
      .upsert({
        doctor_id: doctorId,
        plan_id: plan.id,
        tier: tier,
        status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date((stripeSubscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
        current_period_end: new Date((stripeSubscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      })

    if (subError) {
      logger.error('Failed to upsert subscription', { error: subError, doctorId })
      throw subError
    }

    // Create usage record
    const { data: existingUsage } = await supabase
      .from('doctor_subscription_usage')
      .select('doctor_id')
      .eq('doctor_id', doctorId)
      .single()

    if (!existingUsage) {
      await supabase.from('doctor_subscription_usage').insert({
        doctor_id: doctorId,
        whatsapp_patients_used: 0,
        ai_copilot_used: 0,
        image_analysis_used: 0,
        whatsapp_patients_limit: (plan.limits as { whatsapp_patients?: number })?.whatsapp_patients || 30,
        ai_copilot_limit: (plan.limits as { ai_copilot?: number })?.ai_copilot || 0,
        image_analysis_limit: (plan.limits as { image_analysis?: number })?.image_analysis || 0,
      })
    }

    logHandlerSuccess('checkout.session.completed', session.id, { doctorId, tier, subscriptionId })

    // Send welcome notification
    await sendSubscriptionWelcomeNotification(doctorId, tier)
  } catch (error) {
    logHandlerError('checkout.session.completed', session.id, error, { doctorId, targetTier })
    throw error
  }
}
