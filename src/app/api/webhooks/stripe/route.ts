import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import { HTTP_STATUS } from '@/lib/constants'
import { verifySignature } from './utils/signature-verification'
import { dispatchEvent, SUPPORTED_EVENTS } from './handlers'
import { logWebhookEvent, logIncomingEvent } from './utils/logging'
import { isWebhookIpAllowed, getClientIp } from '@/lib/webhooks'
import type Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events for payment processing including:
 * - Card payments (payment_intent.succeeded, payment_intent.payment_failed)
 * - OXXO voucher payments (charge.succeeded, charge.failed)
 * - Subscription billing events
 *
 * Security measures:
 * - Signature verification with HMAC-SHA256
 * - Timestamp validation (replay attack prevention)
 * - Timing-safe comparison
 * - IP allowlist validation
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  // Validate signature header
  if (!signature) {
    logger.warn('Stripe webhook received without signature', { provider: 'stripe' })
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  // IP allowlist validation
  const clientIp = getClientIp(headersList)
  if (clientIp && !isWebhookIpAllowed(clientIp, 'stripe')) {
    logger.warn('Stripe webhook received from unauthorized IP', {
      provider: 'stripe',
      clientIp,
    })
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: HTTP_STATUS.FORBIDDEN }
    )
  }

  // Verify signature and construct event
  const verification = verifySignature(body, signature)

  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.error.includes('configured') ? HTTP_STATUS.INTERNAL_SERVER_ERROR : HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const event = verification.event

  // Log incoming event
  logIncomingEvent(event)

  try {
    // Dispatch to appropriate handler
    const handled = await dispatchEvent(event.type, event.data.object)

    if (!handled) {
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
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

/**
 * GET handler for webhook verification (Stripe dashboard)
 */
export async function GET() {
  return NextResponse.json({
    status: 'Stripe webhook endpoint active',
    supportedEvents: SUPPORTED_EVENTS,
  })
}
