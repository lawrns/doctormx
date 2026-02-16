import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle subscription updated event
 * Updates subscription status and period info
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const supabase = await createClient()

  try {
    // Find subscription by stripe_subscription_id
    const { data: existingSub } = await supabase
      .from('doctor_subscriptions')
      .select('doctor_id, tier')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!existingSub) {
      logger.warn('Subscription updated but not found in database', { subscriptionId: subscription.id })
      return
    }

    const newStatus = subscription.status === 'active' || subscription.status === 'trialing'
      ? 'active'
      : subscription.status === 'canceled' || subscription.status === 'incomplete_expired'
        ? 'canceled'
        : subscription.status === 'past_due' || subscription.status === 'unpaid'
          ? 'past_due'
          : 'incomplete'

    // Update subscription record
    const { error } = await supabase
      .from('doctor_subscriptions')
      .update({
        status: newStatus,
        current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      logger.error('Failed to update subscription', { error, subscriptionId: subscription.id })
      throw error
    }

    logHandlerSuccess('customer.subscription.updated', subscription.id, {
      doctorId: existingSub.doctor_id,
      newStatus,
    })
  } catch (error) {
    logHandlerError('customer.subscription.updated', subscription.id, error)
    throw error
  }
}
