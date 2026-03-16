// Stripe Webhook Handler with Platform Fees
// Processes payment_intent.succeeded and creates platform fee records

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { confirmPaymentWithFees } from '@/lib/payment-with-fees'
import { logger } from '@/lib/observability/logger'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = (await headers()).get('stripe-signature')!

    let event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      logger.error('Stripe webhook signature verification failed:', { error: err })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    logger.info('Stripe webhook received:', { type: event.type, id: event.id })

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        
        // Get appointment ID from metadata
        const appointmentId = paymentIntent.metadata?.appointmentId
        
        if (!appointmentId) {
          logger.error('Payment intent missing appointment ID:', { 
            paymentIntentId: paymentIntent.id 
          })
          return NextResponse.json(
            { error: 'Missing appointment ID' },
            { status: 400 }
          )
        }

        // Process payment with platform fees
        try {
          const result = await confirmPaymentWithFees(paymentIntent.id, appointmentId)
          
          logger.info('Payment confirmed with fees:', {
            paymentIntentId: paymentIntent.id,
            appointmentId,
            platformFee: result.platformFee,
            doctorNet: result.doctorNetAmount,
          })
        } catch (error) {
          logger.error('Failed to confirm payment with fees:', {
            error,
            paymentIntentId: paymentIntent.id,
            appointmentId,
          })
          // Still return 200 to Stripe to prevent retries
          // We'll handle this manually
        }
        
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
        const invoice = event.data.object
        
        logger.info('Subscription payment succeeded:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: (invoice as any).subscription,
        })
        
        break
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellations
        const subscription = event.data.object
        
        logger.info('Subscription cancelled:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        })
        
        // Update doctor subscription status
        const supabase = (await import('@/lib/supabase/server')).createServiceClient()
        await supabase
          .from('doctor_subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id)
        
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

    return NextResponse.json({ received: true })

  } catch (error) {
    logger.error('Webhook handler error:', { error })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
