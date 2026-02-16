import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle successful invoice payment (subscription renewal)
 * Resets usage counters for new billing period
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const supabase = await createClient()

  const invoiceSubscriptionId = (invoice as unknown as { subscription?: string }).subscription
  if (!invoiceSubscriptionId) {
    return
  }

  try {
    // Find subscription by stripe_subscription_id
    const { data: existingSub } = await supabase
      .from('doctor_subscriptions')
      .select('doctor_id')
      .eq('stripe_subscription_id', invoiceSubscriptionId)
      .single()

    if (!existingSub) {
      logger.warn('Invoice succeeded but subscription not found', { subscriptionId: invoiceSubscriptionId })
      return
    }

    // Reset usage counters for new period
    await supabase
      .from('doctor_subscription_usage')
      .update({
        whatsapp_patients_used: 0,
        ai_copilot_used: 0,
        image_analysis_used: 0,
      })
      .eq('doctor_id', existingSub.doctor_id)

    logHandlerSuccess('invoice.payment_succeeded', invoice.id, {
      doctorId: existingSub.doctor_id,
    })
  } catch (error) {
    logHandlerError('invoice.payment_succeeded', invoice.id, error, { subscriptionId: invoiceSubscriptionId })
    throw error
  }
}
