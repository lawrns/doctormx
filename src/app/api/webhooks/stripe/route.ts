import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import { verifyStripeWebhook } from '@/lib/webhooks'
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
    logger.warn('Stripe webhook received without signature', { provider: 'stripe' })
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 401 }
    )
  }

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured', { provider: 'stripe' })
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Verify signature using our secure verification function
  const isValidSignature = verifyStripeWebhook(body, signature, webhookSecret)

  if (!isValidSignature) {
    logger.warn('Stripe webhook signature verification failed - invalid or expired signature', {
      provider: 'stripe',
      hasSignature: !!signature,
      signaturePrefix: signature.substring(0, 10),
    })
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Webhook event construction failed after signature verification:', {
      provider: 'stripe',
      error: errorMessage,
    })
    return NextResponse.json(
      { error: 'Invalid payload', details: errorMessage },
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

      // Subscription billing events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
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
interface Appointment {
  id: string
  doctor_id: string
  start_ts: string
  price_cents?: number
  currency?: string
  patient?: {
    email?: string
    phone?: string
    full_name?: string
  }
}

async function sendPaymentNotifications(appointment: Appointment, method: 'card' | 'oxxo' | 'spei') {
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
async function sendPaymentFailureNotifications(appointment: Appointment, reason: string = 'payment_failed') {
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
 * Handle checkout.session.completed for subscription purchases
 * Creates or updates doctor subscription record
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createClient()
  const doctorId = session.metadata?.doctor_id
  const targetTier = session.metadata?.target_tier

  if (!doctorId || !targetTier) {
    logger.warn('Checkout session completed missing metadata', { sessionId: session.id })
    return
  }

  // Check for idempotency
  const { data: existingEvent } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', session.id)
    .eq('event_type', 'checkout.session.completed')
    .single()

  if (existingEvent) {
    logger.info(`Checkout session ${session.id} already processed, skipping`)
    return
  }

  // Get subscription ID from session
  const subscriptionId = session.subscription as string
  if (!subscriptionId) {
    logger.warn('Checkout session completed without subscription', { sessionId: session.id })
    return
  }

  // Retrieve subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
  const priceId = stripeSubscription.items.data[0]?.price?.id

  if (!priceId) {
    logger.error('No price ID found in subscription', { subscriptionId })
    return
  }

  // Get plan details
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('stripe_price_id', priceId)
    .single()

  if (!plan) {
    logger.error('Plan not found for Stripe price', { priceId })
    return
  }

  // Map price to tier
  const stripePricePro = process.env.STRIPE_PRICE_PRO
  const stripePriceElite = process.env.STRIPE_PRICE_ELITE

  const priceToTier: Record<string, 'pro' | 'elite'> = {}
  if (stripePricePro) priceToTier[stripePricePro] = 'pro'
  if (stripePriceElite) priceToTier[stripePriceElite] = 'elite'

  const tier = priceToTier[priceId] || targetTier as 'pro' | 'elite'

  // Create or update subscription record
  const { error: subError } = await supabase
    .from('doctor_subscriptions')
    .upsert({
      doctor_id: doctorId,
      plan_id: plan.id,
      tier: tier,
      status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    })

  if (subError) {
    logger.error('Failed to upsert subscription', { error: subError, doctorId })
    throw subError
  }

  // Create usage record
  const { data: existingUsage } = await supabase
    .from('doctor_subscription_usage')
    .select('doctor_id')
    .eq('doctor_id', doctorId)
    .single()

  if (!existingUsage) {
    await supabase.from('doctor_subscription_usage').insert({
      doctor_id: doctorId,
      whatsapp_patients_used: 0,
      ai_copilot_used: 0,
      image_analysis_used: 0,
      whatsapp_patients_limit: plan.limits?.whatsapp_patients || 30,
      ai_copilot_limit: plan.limits?.ai_copilot || 0,
      image_analysis_limit: plan.limits?.image_analysis || 0,
    })
  }

  logger.info(`Doctor subscription created/updated`, { doctorId, tier, subscriptionId })

  // Send welcome notification
  await sendSubscriptionWelcomeNotification(doctorId, tier)
}

/**
 * Handle subscription created event
 * Fallback handler for when checkout.session.completed is missed
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const supabase = await createClient()

  // Get doctor ID from subscription metadata
  const doctorId = (subscription as any).metadata?.doctor_id
  if (!doctorId) {
    logger.warn('Subscription created without doctor_id in metadata', { subscriptionId: subscription.id })
    return
  }

  logger.info(`Subscription created (backup handler)`, { subscriptionId: subscription.id, doctorId })
}

/**
 * Handle subscription updated event
 * Updates subscription status and period info
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = await createClient()

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
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    logger.error('Failed to update subscription', { error, subscriptionId: subscription.id })
    throw error
  }

  logger.info(`Subscription updated`, {
    subscriptionId: subscription.id,
    doctorId: existingSub.doctor_id,
    newStatus,
  })
}

/**
 * Handle subscription deleted/canceled event
 * Marks subscription as canceled and resets usage
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = await createClient()

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

  logger.info(`Subscription canceled`, {
    subscriptionId: subscription.id,
    doctorId: existingSub.doctor_id,
  })

  // Send cancellation notification
  await sendSubscriptionCanceledNotification(existingSub.doctor_id)
}

/**
 * Handle successful invoice payment (subscription renewal)
 * Resets usage counters for new billing period
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const supabase = await createClient()

  const invoiceSubscriptionId = (invoice as any).subscription as string | null
  if (!invoiceSubscriptionId) {
    return
  }

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

  logger.info(`Usage counters reset for new billing period`, {
    doctorId: existingSub.doctor_id,
    invoiceId: invoice.id,
  })
}

/**
 * Handle failed invoice payment (subscription payment failed)
 * Marks subscription as past_due and sends notification
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = await createClient()

  const invoiceSubscriptionId = (invoice as any).subscription as string | null
  if (!invoiceSubscriptionId) {
    return
  }

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

  logger.warn(`Subscription payment failed`, {
    subscriptionId: invoiceSubscriptionId,
    doctorId: existingSub.doctor_id,
    amount: invoice.amount_due,
  })

  // Send payment failure notification
  await sendSubscriptionPaymentFailedNotification(existingSub.doctor_id, existingSub.tier)
}

/**
 * Send welcome notification for new subscription
 */
async function sendSubscriptionWelcomeNotification(doctorId: string, tier: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  if (!profile?.email) {
    return
  }

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const tierNames = {
      pro: 'Profesional',
      elite: 'Élite',
    }

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  ¡Bienvenido a Doctor.mx ${tierNames[tier as keyof typeof tierNames]}!
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #ecfdf5; border-radius: 6px; border-left: 4px solid #10b981;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
        Tu suscripción ha sido activada exitosamente. Ya tienes acceso a todas las funcionalidades de tu plan.
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Si tienes alguna pregunta, no dudes en contactarnos.
</p>
`
    const html = getEmailTemplate(content, profile.full_name || 'Doctor')

    await sendEmail({
      to: profile.email,
      subject: `¡Bienvenido a Doctor.mx ${tierNames[tier as keyof typeof tierNames]}!`,
      html,
      tags: [
        { name: 'type', value: 'subscription_welcome' },
        { name: 'tier', value: tier },
      ],
    })

    logger.info(`Subscription welcome email sent`, { doctorId, tier })
  } catch (error) {
    logger.error('Failed to send subscription welcome email', { error, doctorId })
  }
}

/**
 * Send notification when subscription is canceled
 */
async function sendSubscriptionCanceledNotification(doctorId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  if (!profile?.email) {
    return
  }

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Tu suscripción a Doctor.mx ha sido cancelada.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        Tu suscripción ha finalizado. Si deseas reactivarla, puedes hacerlo desde tu panel de control.
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Esperamos verte de nuevo pronto.
</p>
`
    const html = getEmailTemplate(content, profile.full_name || 'Doctor')

    await sendEmail({
      to: profile.email,
      subject: 'Tu suscripción a Doctor.mx ha sido cancelada',
      html,
      tags: [
        { name: 'type', value: 'subscription_canceled' },
      ],
    })

    logger.info(`Subscription canceled email sent`, { doctorId })
  } catch (error) {
    logger.error('Failed to send subscription canceled email', { error, doctorId })
  }
}

/**
 * Send notification when subscription payment fails
 */
async function sendSubscriptionPaymentFailedNotification(doctorId: string, tier: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', doctorId)
    .single()

  if (!profile?.email) {
    return
  }

  try {
    const { sendEmail, getEmailTemplate } = await import('@/lib/notifications')

    const content = `
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  No pudimos procesar tu pago de suscripción a Doctor.mx.
</p>
<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
        El pago de tu suscripción falló. Por favor actualiza tu método de pago para evitar interrupciones en el servicio.
      </p>
    </td>
  </tr>
</table>
<p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
  Puedes actualizar tu método de pago desde tu panel de control.
</p>
`
    const html = getEmailTemplate(content, profile.full_name || 'Doctor')

    await sendEmail({
      to: profile.email,
      subject: 'Pago de suscripción falló - Doctor.mx',
      html,
      tags: [
        { name: 'type', value: 'subscription_payment_failed' },
      ],
    })

    logger.info(`Subscription payment failed email sent`, { doctorId })
  } catch (error) {
    logger.error('Failed to send subscription payment failed email', { error, doctorId })
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
      // Subscription events
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
  })
}
