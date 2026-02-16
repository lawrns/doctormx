import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { sendPaymentFailureNotifications } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle OXXO voucher expiration/failure
 * Triggered when OXXO voucher expires without payment
 */
export async function handleChargeFailed(charge: Stripe.Charge): Promise<void> {
  // Only process OXXO payments
  if (charge.payment_method_details?.type !== 'oxxo') {
    return
  }

  const supabase = await createClient()
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null

  if (!paymentIntentId) {
    logger.warn('Charge failed but no payment_intent reference', { chargeId: charge.id })
    return
  }

  // Check for idempotency
  const alreadyProcessed = await isEventProcessed(charge.id, 'charge.failed.oxxo')
  if (alreadyProcessed) {
    logger.info(`OXXO charge failure ${charge.id} already processed, skipping`)
    return
  }

  try {
    // Get payment info
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, appointment:appointments!inner(*)')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (paymentError || !payment) {
      logger.error('Payment not found for failed OXXO charge:', { error: paymentError, paymentIntentId })
      throw new Error('Payment not found')
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (updateError) {
      logger.error('Failed to update OXXO payment status:', { error: updateError, paymentId: payment.id })
      throw updateError
    }

    // Update appointment to cancelled
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: 'OXXO voucher expired without payment',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.appointment_id)
      .eq('status', 'pending_payment')
      .select('*, patient:profiles!patient_id(full_name, email, phone)')
      .single()

    if (appointmentError) {
      logger.error('Failed to cancel appointment for expired OXXO:', { error: appointmentError, appointmentId: payment.appointment_id })
      throw appointmentError
    }

    if (appointment) {
      logHandlerSuccess('charge.failed.oxxo', charge.id, { appointmentId: payment.appointment_id })

      // Send notification (non-blocking)
      await sendPaymentFailureNotifications(appointment, 'oxxo_expired')
    }
  } catch (error) {
    logHandlerError('charge.failed.oxxo', charge.id, error, { paymentIntentId })
    throw error
  }
}
