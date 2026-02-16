import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { isEventProcessed } from '../utils/event-validation'
import { sendPaymentNotifications } from '../utils/notifications'
import { logHandlerSuccess, logHandlerError } from '../utils/logging'
import type Stripe from 'stripe'

/**
 * Handle OXXO voucher payment success
 * Triggered when customer pays at OXXO store
 */
export async function handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
  // Only process OXXO payments
  if (charge.payment_method_details?.type !== 'oxxo') {
    return
  }

  const supabase = await createClient()
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null

  if (!paymentIntentId) {
    logger.warn('Charge succeeded but no payment_intent reference', { chargeId: charge.id })
    return
  }

  // Check for idempotency
  const alreadyProcessed = await isEventProcessed(charge.id, 'charge.succeeded.oxxo')
  if (alreadyProcessed) {
    logger.info(`OXXO charge ${charge.id} already processed, skipping`)
    return
  }

  try {
    // Get payment and appointment info
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, appointment:appointments!inner(*)')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    if (paymentError || !payment) {
      logger.error('Payment not found for OXXO charge:', { error: paymentError, paymentIntentId })
      throw new Error('Payment not found')
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method: 'oxxo',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    if (updateError) {
      logger.error('Failed to update OXXO payment status:', { error: updateError, paymentId: payment.id })
      throw updateError
    }

    // Update appointment to confirmed
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.appointment_id)
      .eq('status', 'pending_payment')
      .select('*, patient:profiles!patient_id(full_name, email, phone)')
      .single()

    if (appointmentError) {
      logger.error('Failed to confirm appointment for OXXO:', { error: appointmentError, appointmentId: payment.appointment_id })
      throw appointmentError
    }

    if (appointment) {
      logHandlerSuccess('charge.succeeded.oxxo', charge.id, { appointmentId: payment.appointment_id })

      // Send notifications (non-blocking)
      await sendPaymentNotifications(appointment, 'oxxo')
    }
  } catch (error) {
    logHandlerError('charge.succeeded.oxxo', charge.id, error, { paymentIntentId })
    throw error
  }
}
