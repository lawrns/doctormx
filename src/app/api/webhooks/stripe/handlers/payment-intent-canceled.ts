import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle canceled payment intent
 * Updates payment status and cancels the appointment
 */
export async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent canceled but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency
  const alreadyProcessed = await isEventProcessed(paymentIntent.id, 'payment_intent.canceled')
  if (alreadyProcessed) {
    logger.info(`Payment intent cancellation ${paymentIntent.id} already processed, skipping`)
    return
  }

  try {
    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      logger.error('Failed to update payment status:', { error: paymentError, paymentIntentId: paymentIntent.id })
      throw paymentError
    }

    // Update appointment status to cancelled
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: 'Payment canceled by customer or system',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('status', 'pending_payment')

    if (appointmentError) {
      logger.error('Failed to cancel appointment:', { error: appointmentError, appointmentId })
      throw appointmentError
    }

    logHandlerSuccess('payment_intent.canceled', paymentIntent.id, { appointmentId })
  } catch (error) {
    logHandlerError('payment_intent.canceled', paymentIntent.id, error, { appointmentId })
    throw error
  }
}
