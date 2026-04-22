// Stripe Webhook Handler with Platform Fees
// Processes payment_intent.succeeded and creates platform fee records

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { confirmPaymentWithFees } from '@/lib/payment-with-fees'
import { logger } from '@/lib/observability/logger'
import { sendEmail, getEmailTemplate, sendDoctorStatusEmail } from '@/lib/notifications'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notifications'
import type Stripe from 'stripe'
import { createHash } from 'crypto'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const PRICE_TO_PLAN = new Map(
  [
    ['STRIPE_STARTER_PRICE_ID', 'starter'],
    ['STRIPE_STARTER_ANNUAL_PRICE_ID', 'starter'],
    ['STRIPE_PRO_PRICE_ID', 'pro'],
    ['STRIPE_PRO_ANNUAL_PRICE_ID', 'pro'],
    ['STRIPE_ELITE_PRICE_ID', 'elite'],
    ['STRIPE_ELITE_ANNUAL_PRICE_ID', 'elite'],
    ['STRIPE_CLINIC_PRICE_ID', 'clinic'],
    ['STRIPE_CLINIC_ANNUAL_PRICE_ID', 'clinic'],
  ]
    .map(([envKey, plan]) => [process.env[envKey], plan])
    .filter(([priceId]) => Boolean(priceId)) as Array<[string, string]>
)

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}

function getSubscriptionTier(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price
  const planFromMetadata =
    subscription.metadata?.tier ||
    subscription.metadata?.planId ||
    price?.metadata?.tier ||
    price?.metadata?.planId

  return planFromMetadata || PRICE_TO_PLAN.get(price?.id || '') || 'starter'
}

function getBillingInterval(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.recurring?.interval || 'month'
}

async function claimWebhookEvent(event: Stripe.Event, payload: string) {
  const supabase = (await import('@/lib/supabase/server')).createServiceClient()
  const payloadHash = createHash('sha256').update(payload).digest('hex')

  const { error } = await supabase
    .from('webhook_events')
    .insert({
      provider: 'stripe',
      event_id: event.id,
      status: 'processing',
      payload_hash: payloadHash,
    })

  if (!error) return true

  if (error.code === '23505') {
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('status')
      .eq('provider', 'stripe')
      .eq('event_id', event.id)
      .maybeSingle()

    if (existing?.status === 'failed') {
      await supabase
        .from('webhook_events')
        .update({
          status: 'processing',
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('provider', 'stripe')
        .eq('event_id', event.id)

      return true
    }

    logger.info('Skipping duplicate Stripe webhook event:', { eventId: event.id, type: event.type })
    return false
  }

  if (error.code === '42P01') {
    logger.warn('webhook_events table missing; processing Stripe event without idempotency:', { eventId: event.id })
    return true
  }

  throw new Error(`Failed to claim Stripe webhook event: ${error.message}`)
}

async function markWebhookEvent(event: Stripe.Event, status: 'processed' | 'failed', error?: unknown) {
  const supabase = (await import('@/lib/supabase/server')).createServiceClient()
  await supabase
    .from('webhook_events')
    .update({
      status,
      processed_at: new Date().toISOString(),
      error: error ? String(error instanceof Error ? error.message : error) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('provider', 'stripe')
    .eq('event_id', event.id)
}

async function getDoctorIdForSubscription(subscription: Stripe.Subscription) {
  const metadataDoctorId = subscription.metadata?.doctorId || subscription.metadata?.doctor_id
  if (metadataDoctorId) return metadataDoctorId

  const supabase = (await import('@/lib/supabase/server')).createServiceClient()
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('stripe_customer_id', subscription.customer as string)
    .maybeSingle()

  return doctor?.id as string | undefined
}

async function upsertDoctorSubscription(subscription: Stripe.Subscription) {
  const supabase = (await import('@/lib/supabase/server')).createServiceClient()
  const doctorId = await getDoctorIdForSubscription(subscription)

  if (!doctorId) {
    logger.warn('Unable to resolve doctor for subscription webhook:', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    })
    return
  }

  const tier = getSubscriptionTier(subscription)
  const billingInterval = getBillingInterval(subscription)
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription)
  const status = subscription.status === 'active' || subscription.status === 'trialing'
    ? 'active'
    : subscription.status === 'canceled'
      ? 'cancelled'
      : 'past_due'

  const { error } = await supabase
    .from('doctor_subscriptions')
    .upsert({
      doctor_id: doctorId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      tier,
      plan_id: tier,
      plan_name: tier,
      plan_price_cents: subscription.items.data[0]?.price?.unit_amount || 0,
      plan_currency: subscription.items.data[0]?.price?.currency?.toUpperCase() || 'MXN',
      billing_interval: billingInterval,
      status,
      current_period_start: new Date(((subscription as Stripe.Subscription & { current_period_start?: number }).current_period_start || Date.now() / 1000) * 1000).toISOString(),
      current_period_end: currentPeriodEnd,
      payment_failed_at: null,
      grace_period_ends_at: null,
      payment_recovery_url: null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    })

  if (error) {
    logger.error('Failed to upsert doctor subscription:', { error, subscriptionId: subscription.id })
    return
  }

  if (status === 'active') {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('status')
      .eq('id', doctorId)
      .maybeSingle()

    await supabase
      .from('doctors')
      .update({
        is_listed: doctor?.status === 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', doctorId)

    const { data: doctorProfile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', doctorId)
      .maybeSingle()

    if (doctorProfile?.email) {
      await sendDoctorStatusEmail({
        to: doctorProfile.email,
        doctorName: doctorProfile.full_name || 'Doctor',
        status: 'subscription_activated',
      })
    }

    if (doctorProfile?.phone) {
      await sendWhatsAppNotification(doctorProfile.phone, 'subscription_activated', {
        patientName: doctorProfile.full_name || 'Doctor',
        bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctor/subscription`,
      })
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = (await import('@/lib/supabase/server')).createServiceClient()
  const doctorId = await getDoctorIdForSubscription(subscription)

  await supabase
    .from('doctor_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (doctorId) {
    const { count: activeCount } = await supabase
      .from('doctor_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctorId)
      .eq('status', 'active')

    if (!activeCount) {
      await supabase
        .from('doctors')
        .update({
          is_listed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = (await import('@/lib/supabase/server')).createServiceClient()
  const customerId = invoice.customer as string | undefined
  const invoiceSubscription = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription
  const subscriptionId = typeof invoiceSubscription === 'string' ? invoiceSubscription : invoiceSubscription?.id
  if (!customerId || !subscriptionId) return

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, profile:profiles(full_name, phone)')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!doctor) return

  await supabase
    .from('doctor_subscriptions')
    .update({
      status: 'past_due',
      payment_failed_at: new Date().toISOString(),
      grace_period_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      payment_recovery_url: invoice.hosted_invoice_url,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  const profile = Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
  const doctorName = profile?.full_name || 'Doctor'
  const retryUrl = invoice.hosted_invoice_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctor/subscription`
  let customerEmail = invoice.customer_email || undefined

  if (!customerEmail) {
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer.deleted) {
      customerEmail = customer.email || undefined
    }
  }

  if (customerEmail) {
    await sendEmail({
      to: customerEmail,
      subject: 'No pudimos procesar el pago de tu suscripción',
      html: getEmailTemplate(`
        <p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">No pudimos procesar el pago de tu suscripción de Doctory.</p>
        <p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">Tienes 3 días para actualizar tu método de pago antes de que tu perfil deje de aparecer en el directorio.</p>
        <p style="margin:0;"><a href="${retryUrl}" style="color:#0066cc;">Actualizar pago</a></p>
      `, doctorName),
      tags: [{ name: 'type', value: 'subscription_payment_failed' }],
    })
  }

  if (profile?.phone) {
    await sendWhatsAppNotification(profile.phone, 'subscription_payment_failed', {
      patientName: doctorName,
      bookingLink: retryUrl,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = (await headers()).get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: unknown) {
      logger.error('Stripe webhook signature verification failed:', { error: err })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    logger.info('Stripe webhook received:', { type: event.type, id: event.id })

    const shouldProcess = await claimWebhookEvent(event, payload)
    if (!shouldProcess) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object

          // Get appointment ID from metadata
          const appointmentId = paymentIntent.metadata?.appointmentId

          if (!appointmentId) {
            logger.error('Payment intent missing appointment ID:', {
              paymentIntentId: paymentIntent.id
            })
            await markWebhookEvent(event, 'failed', 'Missing appointment ID')
            return NextResponse.json(
              { error: 'Missing appointment ID' },
              { status: 400 }
            )
          }

          const result = await confirmPaymentWithFees(paymentIntent.id, appointmentId)

          logger.info('Payment confirmed with fees:', {
            paymentIntentId: paymentIntent.id,
            appointmentId,
            platformFee: result.platformFee,
            doctorNet: result.doctorNetAmount,
          })

          break
        }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        logger.warn('Payment failed:', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error,
        })
        
        // Cancel the appointment
        const appointmentId = paymentIntent.metadata?.appointmentId
        if (appointmentId) {
          const { handlePaymentFailure } = await import('@/lib/payment')
          await handlePaymentFailure(appointmentId, 'Payment failed')
        }
        
        break
      }

      case 'invoice.payment_succeeded': {
        // Handle subscription renewals
        const invoice = event.data.object as Stripe.Invoice
        const invoiceSubscription = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription
        const subscriptionId = typeof invoiceSubscription === 'string' ? invoiceSubscription : invoiceSubscription?.id
        
        logger.info('Subscription payment succeeded:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId,
        })

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await upsertDoctorSubscription(subscription)
        }
        
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await upsertDoctorSubscription(event.data.object as Stripe.Subscription)
        break
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellations
        const subscription = event.data.object as Stripe.Subscription
        
        logger.info('Subscription cancelled:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        })
        
        await handleSubscriptionDeleted(subscription)
        
        break
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await upsertDoctorSubscription(subscription)
        }
        break
      }

      case 'transfer.created': {
        // Log doctor payouts
        const transfer = event.data.object
        
        logger.info('Doctor transfer created:', {
          transferId: transfer.id,
          amount: transfer.amount,
          destination: transfer.destination,
        })
        
        break
      }

        default: {
          logger.info('Unhandled webhook event:', { type: event.type })
        }
      }

      await markWebhookEvent(event, 'processed')
    } catch (error) {
      await markWebhookEvent(event, 'failed', error)
      throw error
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    logger.error('Webhook handler error:', { error })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
