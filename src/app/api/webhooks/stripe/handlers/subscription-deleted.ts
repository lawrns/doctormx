import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { sendSubscriptionCanceledNotification } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle subscription deleted/canceled event
 * Marks subscription as canceled and resets usage
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const supabase = await createClient()

  try {
    // Find subscription by stripe_subscription_id
    const { data: existingSub } = await supabase
      .from('doctor_subscriptions')
      .select('doctor_id, tier')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!existingSub) {
      logger.warn('Subscription deleted but not found in database', { subscriptionId: subscription.id })
      return
    }

    // Update subscription status
    const { error } = await supabase
      .from('doctor_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      logger.error('Failed to cancel subscription', { error, subscriptionId: subscription.id })
      throw error
    }

    // Reset usage counters to free tier limits
    await supabase
      .from('doctor_subscription_usage')
      .update({
        whatsapp_patients_used: 0,
        ai_copilot_used: 0,
        image_analysis_used: 0,
        whatsapp_patients_limit: 30,
        ai_copilot_limit: 0,
        image_analysis_limit: 0,
      })
      .eq('doctor_id', existingSub.doctor_id)

    logHandlerSuccess('customer.subscription.deleted', subscription.id, {
      doctorId: existingSub.doctor_id,
    })

    // Send cancellation notification
    await sendSubscriptionCanceledNotification(existingSub.doctor_id)
  } catch (error) {
    logHandlerError('customer.subscription.deleted', subscription.id, error)
    throw error
  }
}
