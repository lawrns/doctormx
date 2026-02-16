import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { sendSubscriptionPaymentFailedNotification } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle failed invoice payment (subscription payment failed)
 * Marks subscription as past_due and sends notification
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const supabase = await createClient()

  const invoiceSubscriptionId = (invoice as unknown as { subscription?: string }).subscription
  if (!invoiceSubscriptionId) {
    return
  }

  try {
    // Find subscription by stripe_subscription_id
    const { data: existingSub } = await supabase
      .from('doctor_subscriptions')
      .select('doctor_id, tier')
      .eq('stripe_subscription_id', invoiceSubscriptionId)
      .single()

    if (!existingSub) {
      logger.warn('Invoice failed but subscription not found', { subscriptionId: invoiceSubscriptionId })
      return
    }

    // Update subscription status
    await supabase
      .from('doctor_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoiceSubscriptionId)

    logHandlerSuccess('invoice.payment_failed', invoice.id, {
      doctorId: existingSub.doctor_id,
      amount: invoice.amount_due,
    })

    // Send payment failure notification
    await sendSubscriptionPaymentFailedNotification(existingSub.doctor_id, existingSub.tier)
  } catch (error) {
    logHandlerError('invoice.payment_failed', invoice.id, error, { subscriptionId: invoiceSubscriptionId })
    throw error
  }
}
