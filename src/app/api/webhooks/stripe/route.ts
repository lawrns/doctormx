import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updateSubscriptionStatus } from '@/lib/subscription'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for subscription management
 */
export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing signature' },
            { status: 400 }
        )
    }

    let event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
        logger.error('Webhook signature verification failed:', { error })
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        )
    }

    try {
        switch (event.type) {
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as unknown as { status: string; id: string; current_period_start: number; current_period_end: number })
                break

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as unknown as { id: string })
                break

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as { subscription?: string; created: number })
                break

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object as { subscription?: string; last_payment_error?: { message: string } })
                break

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object as { id: string; metadata?: { appointment_id?: string } })
                break

            default:
                logger.info(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        logger.error('Error processing webhook:', { error })
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: { status: string; id: string; current_period_start: number; current_period_end: number }) {
    try {
        const status = subscription.status === 'active' ? 'active' : 'past_due'

        await updateSubscriptionStatus(
            subscription.id,
            status,
            {
                current_period_start: subscription.current_period_start.toString(),
                current_period_end: subscription.current_period_end.toString(),
            }
        )

        logger.info(`Subscription ${subscription.id} updated to ${status}`)
    } catch (error) {
        logger.error('Error handling subscription updated:', { error })
        throw error
    }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: { id: string }) {
    try {
        await updateSubscriptionStatus(subscription.id, 'cancelled')

        logger.info(`Subscription ${subscription.id} cancelled`)
    } catch (error) {
        logger.error('Error handling subscription deleted:', { error })
        throw error
    }
}

/**
 * Handle invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: { subscription?: string; created: number }) {
    try {
        if (invoice.subscription) {
            await updateSubscriptionStatus(invoice.subscription, 'active', {
                last_payment_date: invoice.created.toString(),
            })

            logger.info(`Payment succeeded for subscription ${invoice.subscription}`)
        }
    } catch (error) {
        logger.error('Error handling invoice payment succeeded:', { error })
        throw error
    }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: { subscription?: string; last_payment_error?: { message: string } }) {
    try {
        if (invoice.subscription) {
            const metadata: Record<string, string | number | boolean> = {}
            if (invoice.last_payment_error?.message) {
                metadata.last_payment_error = invoice.last_payment_error.message
            }
            await updateSubscriptionStatus(invoice.subscription, 'past_due', metadata)

            logger.warn(`Payment failed for subscription ${invoice.subscription}`)
        }
    } catch (error) {
        logger.error('Error handling invoice payment failed:', { error })
        throw error
    }
}

/**
 * Handle payment intent succeeded event - confirms appointment payment
 */
async function handlePaymentIntentSucceeded(paymentIntent: { id: string; metadata?: { appointment_id?: string } }) {
    try {
        const supabase = createServiceClient()
        
        // Check for idempotency - don't process same event twice
        const { data: existingEvent } = await supabase
            .from('webhook_events')
            .select('id')
            .eq('stripe_event_id', paymentIntent.id)
            .single()
        
        if (existingEvent) {
            logger.info(`Payment intent ${paymentIntent.id} already processed, skipping`)
            return
        }
        
        // Record this event for idempotency
        await supabase.from('webhook_events').insert({
            stripe_event_id: paymentIntent.id,
            event_type: 'payment_intent.succeeded',
            payload: paymentIntent
        })
        
        // If this payment is for an appointment, confirm it
        const appointmentId = paymentIntent.metadata?.appointment_id
        if (appointmentId) {
            const { error } = await supabase
                .from('appointments')
                .update({ 
                    status: 'confirmed',
                    payment_status: 'paid',
                    payment_intent_id: paymentIntent.id,
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', appointmentId)
                .eq('status', 'pending_payment')
            
            if (error) {
                logger.error('Failed to confirm appointment:', { error, appointmentId })
                throw error
            }
            
            logger.info(`Appointment ${appointmentId} confirmed after payment`)
        }
    } catch (error) {
        logger.error('Error handling payment intent succeeded:', { error })
        throw error
    }
}
