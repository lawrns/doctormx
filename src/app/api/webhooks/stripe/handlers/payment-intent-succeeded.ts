import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { sendPaymentNotifications } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle successful card payment
 * Updates payment status to 'paid' and confirms the appointment
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent succeeded but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency
  const alreadyProcessed = await isEventProcessed(paymentIntent.id, 'payment_intent.succeeded')
  if (alreadyProcessed) {
    logger.info(`Payment intent ${paymentIntent.id} already processed, skipping`)
    return
  }

  try {
    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method: paymentIntent.payment_method_types?.[0] ?? 'card',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      logger.error('Failed to update payment status:', { error: paymentError, paymentIntentId: paymentIntent.id })
      throw paymentError
    }

    // Update appointment status to confirmed
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('status', 'pending_payment')
      .select('*, patient:profiles!patient_id(full_name, email, phone)')
      .single()

    if (appointmentError) {
      logger.error('Failed to confirm appointment:', { error: appointmentError, appointmentId })
      throw appointmentError
    }

    if (appointment) {
      logHandlerSuccess('payment_intent.succeeded', paymentIntent.id, { appointmentId })

      // Send notifications (non-blocking)
      await sendPaymentNotifications(appointment, 'card')
    }
  } catch (error) {
    logHandlerError('payment_intent.succeeded', paymentIntent.id, error, { appointmentId })
    throw error
  }
}
