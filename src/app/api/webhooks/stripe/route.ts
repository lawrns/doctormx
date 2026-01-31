import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for payment processing including:
 * - Card payments (payment_intent.succeeded, payment_intent.payment_failed)
 * - OXXO voucher payments (charge.succeeded, charge.failed)
 * - SPEI bank transfers (customer_balance.funding_source.created, customer_balance.funding_source.failed)
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    logger.warn('Stripe webhook received without signature')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Webhook signature verification failed:', { error: errorMessage })
    return NextResponse.json(
      { error: 'Invalid signature', details: errorMessage },
      { status: 400 }
    )
  }

  // Log all incoming events for audit
  logger.info(`Stripe webhook received: ${event.type}`, {
    eventId: event.id,
    eventType: event.type,
    created: new Date(event.created * 1000).toISOString(),
  })

  try {
    switch (event.type) {
      // Card payment events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      // OXXO-specific events (voucher-based payments)
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge)
        break

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge)
        break

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`)
    }

    // Log successful processing
    await logWebhookEvent(event, 'processed')

    return NextResponse.json({ received: true, event: event.type })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error processing Stripe webhook:', {
      error: errorMessage,
      eventType: event.type,
      eventId: event.id,
    })

    // Log failed processing
    await logWebhookEvent(event, 'failed', errorMessage)

    return NextResponse.json(
      { error: 'Webhook processing failed', details: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Handle successful card payment
 * Updates payment status to 'paid' and confirms the appointment
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent succeeded but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', paymentIntent.id)
    .eq('event_type', 'payment_intent.succeeded')
    .single()

  if (existingEvent) {
    logger.info(`Payment intent ${paymentIntent.id} already processed, skipping`)
    return
  }

  // Update payment status
  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      payment_method: paymentIntent.payment_method_types?.[0] || 'card',
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
    logger.info(`Appointment ${appointmentId} confirmed after successful payment`, {
      paymentIntentId: paymentIntent.id,
    })

    // Send notifications (non-blocking)
    await sendPaymentNotifications(appointment, 'card')
  }
}

/**
 * Handle failed card payment
 * Updates payment status to 'failed' and cancels the appointment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent failed but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', paymentIntent.id)
    .eq('event_type', 'payment_intent.payment_failed')
    .single()

  if (existingEvent) {
    logger.info(`Payment intent failure ${paymentIntent.id} already processed, skipping`)
    return
  }

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
      cancellation_reason: 'Payment failed: ' + (paymentIntent.last_payment_error?.message || 'Unknown error'),
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
    logger.info(`Appointment ${appointmentId} cancelled due to payment failure`, {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    })

    // Send failure notification (non-blocking)
    await sendPaymentFailureNotifications(appointment)
  }
}

/**
 * Handle canceled payment intent
 * Updates payment status and cancels the appointment
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()
  const appointmentId = paymentIntent.metadata?.appointment_id

  if (!appointmentId) {
    logger.warn('Payment intent canceled but no appointment_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return
  }

  // Check for idempotency
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', paymentIntent.id)
    .eq('event_type', 'payment_intent.canceled')
    .single()

  if (existingEvent) {
    logger.info(`Payment intent cancellation ${paymentIntent.id} already processed, skipping`)
    return
  }

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

  logger.info(`Appointment ${appointmentId} cancelled due to payment cancellation`, {
    paymentIntentId: paymentIntent.id,
  })
}

/**
 * Handle OXXO voucher payment success
 * Triggered when customer pays at OXXO store
 */
async function handleChargeSucceeded(charge: Stripe.Charge) {
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
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', charge.id)
    .eq('event_type', 'charge.succeeded.oxxo')
    .single()

  if (existingEvent) {
    logger.info(`OXXO charge ${charge.id} already processed, skipping`)
    return
  }

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
    logger.info(`Appointment ${payment.appointment_id} confirmed after OXXO payment`, {
      chargeId: charge.id,
    })

    // Send notifications (non-blocking)
    await sendPaymentNotifications(appointment, 'oxxo')
  }
}

/**
 * Handle OXXO voucher expiration/failure
 * Triggered when OXXO voucher expires without payment
 */
async function handleChargeFailed(charge: Stripe.Charge) {
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
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', charge.id)
    .eq('event_type', 'charge.failed.oxxo')
    .single()

  if (existingEvent) {
    logger.info(`OXXO charge failure ${charge.id} already processed, skipping`)
    return
  }

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
    logger.info(`Appointment ${payment.appointment_id} cancelled due to expired OXXO voucher`, {
      chargeId: charge.id,
    })

    // Send notification (non-blocking)
    await sendPaymentFailureNotifications(appointment, 'oxxo_expired')
  }
}


/**
 * Send payment success notifications (email and WhatsApp)
 */
async function sendPaymentNotifications(appointment: any, method: 'card' | 'oxxo' | 'spei') {
  const methodNames = {
    card: 'tarjeta',
    oxxo: 'OXXO',
    spei: 'transferencia SPEI',
  }

  // Send email notification
  if (appointment.patient?.email) {
    try {
      const { sendPaymentReceipt } = await import('@/lib/notifications')
      await sendPaymentReceipt(
        appointment.id,
        appointment.patient.email,
        appointment.patient.full_name || 'Paciente'
      )
      logger.info(`Payment receipt email sent for appointment ${appointment.id}`)
    } catch (error) {
      logger.error('Failed to send payment receipt email:', { error, appointmentId: appointment.id })
    }
  }

  // Send WhatsApp notification
  if (appointment.patient?.phone) {
    try {
      const { sendPaymentReceipt: sendWhatsAppReceipt, getDoctorName } = await import('@/lib/whatsapp-notifications')

      const doctorName = await getDoctorName(appointment.doctor_id)
      const startTs = new Date(appointment.start_ts)
      const dateStr = startTs.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
      const timeStr = startTs.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

      await sendWhatsAppReceipt(
        appointment.patient.phone,
        appointment.patient.full_name || 'Paciente',
        doctorName || 'tu médico',
        dateStr,
        timeStr,
        appointment.price_cents || 0,
        appointment.currency || 'MXN',
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/consultation/${appointment.id}`
      )
      logger.info(`Payment receipt WhatsApp sent for appointment ${appointment.id}`)
    } catch (error) {
      logger.error('Failed to send payment receipt WhatsApp:', { error, appointmentId: appointment.id })
    }
  }
}

/**
 * Send payment failure notifications
 */
async function sendPaymentFailureNotifications(appointment: any, reason: string = 'payment_failed') {
  // Send email notification
  if (appointment.patient?.email) {
    try {
      const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

      const reasonMessages: Record<string, string> = {
        payment_failed: 'El pago con tarjeta fue rechazado. Por favor intenta con otro método de pago.',
        oxxo_expired: 'El voucher de OXXO expiró sin ser pagado. Puedes generar uno nuevo desde tu cuenta.',
      }

      const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu cita no pudo ser confirmada debido a un problema con el pago.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        ${reasonMessages[reason] || 'Hubo un problema con el pago. Por favor intenta nuevamente.'}
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Si necesitas ayuda, contacta a nuestro equipo de soporte.
</p>
`
      const html = getEmailTemplate(content, appointment.patient.full_name || 'Paciente')

      await sendEmail({
        to: appointment.patient.email,
        subject: 'Problema con tu pago - Doctor.mx',
        html,
        tags: [
          { name: 'type', value: 'payment_failed' },
          { name: 'appointmentId', value: appointment.id },
        ],
      })
      logger.info(`Payment failure email sent for appointment ${appointment.id}`)
    } catch (error) {
      logger.error('Failed to send payment failure email:', { error, appointmentId: appointment.id })
    }
  }

  // Send WhatsApp notification
  if (appointment.patient?.phone) {
    try {
      const { sendWhatsAppNotification } = await import('@/lib/whatsapp-notifications')

      const reasonMessages: Record<string, string> = {
        payment_failed: 'Tu pago fue rechazado. Por favor intenta con otro método.',
        oxxo_expired: 'Tu voucher de OXXO expiró. Genera uno nuevo desde tu cuenta.',
      }

      await sendWhatsAppNotification(
        appointment.patient.phone,
        'appointment_confirmation',
        {
          patientName: appointment.patient.full_name,
          bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/dashboard`,
        }
      )
      logger.info(`Payment failure WhatsApp sent for appointment ${appointment.id}`)
    } catch (error) {
      logger.error('Failed to send payment failure WhatsApp:', { error, appointmentId: appointment.id })
    }
  }
}

/**
 * Log webhook event for audit purposes
 */
async function logWebhookEvent(event: Stripe.Event, status: 'processed' | 'failed', errorMessage?: string) {
  const supabase = await createClient()

  try {
    await supabase.from('webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      status,
      error_message: errorMessage || null,
      processed_at: status === 'processed' ? new Date().toISOString() : null,
    })
  } catch (error) {
    // Don't throw - logging failure shouldn't break the webhook
    logger.error('Failed to log webhook event:', { error, eventId: event.id })
  }
}

/**
 * GET handler for webhook verification (Stripe dashboard)
 */
export async function GET() {
  return NextResponse.json({
    status: 'Stripe webhook endpoint active',
    supportedEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'payment_intent.canceled',
      'charge.succeeded',
      'charge.failed',
    ],
  })
}
