import { stripe } from '@/lib/stripe'
import { verifyStripeWebhook } from '@/lib/webhooks'
import { logger } from '@/lib/observability/logger'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * Verify Stripe webhook signature using double verification
 * 1. Custom verification function
 * 2. Stripe SDK constructEvent
 */
export function verifySignature(
  body: string,
  signature: string
): { valid: true; event: ReturnType<typeof stripe.webhooks.constructEvent> } | { valid: false; error: string } {
  // Check if secret is configured
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured', { provider: 'stripe' })
    return { valid: false, error: 'Webhook secret not configured' }
  }

  // Step 1: Custom signature verification
  const isValidSignature = verifyStripeWebhook(body, signature, webhookSecret)

  if (!isValidSignature) {
    logger.warn('Stripe webhook signature verification failed - invalid or expired signature', {
      provider: 'stripe',
      hasSignature: !!signature,
      signaturePrefix: signature.substring(0, 10),
    })
    return { valid: false, error: 'Invalid signature' }
  }

  // Step 2: Stripe SDK verification
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return { valid: true, event }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Webhook event construction failed after signature verification:', {
      provider: 'stripe',
      error: errorMessage,
    })
    return { valid: false, error: `Invalid payload: ${errorMessage}` }
  }
}
