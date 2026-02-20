import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { sendPaymentFailureNotifications } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle failed card payment
 * Updates payment status to 'failed' and cancels the appointment
 */
export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent failed but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency
  const alreadyProcessed = await isEventProcessed(paymentIntent.id, 'payment_intent.payment_failed')
  if (alreadyProcessed) {
    logger.info(`Payment intent failure ${paymentIntent.id} already processed, skipping`)
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
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: 'Payment failed: ' + (paymentIntent.last_payment_error?.message ?? 'Unknown error'),
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('status', 'pending_payment')
      .select('*, patient:profiles!patient_id(full_name, email, phone)')
      .single()

    if (appointmentError) {
      logger.error('Failed to cancel appointment:', { error: appointmentError, appointmentId })
      throw appointmentError
    }

    if (appointment) {
      logHandlerSuccess('payment_intent.payment_failed', paymentIntent.id, {
        appointmentId,
        error: paymentIntent.last_payment_error?.message,
      })

      // Send failure notification (non-blocking)
      await sendPaymentFailureNotifications(appointment)
    }
  } catch (error) {
    logHandlerError('payment_intent.payment_failed', paymentIntent.id, error, { appointmentId })
    throw error
  }
}
