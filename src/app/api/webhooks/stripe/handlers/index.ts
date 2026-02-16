import { logger } from '@/lib/observability/logger'
import type Stripe from 'stripe'
import type { StripeWebhookEventType } from '../types'

// Import all handlers
import { handlePaymentIntentSucceeded } from './payment-intent-succeeded'
import { handlePaymentIntentFailed } from './payment-intent-failed'
import { handlePaymentIntentCanceled } from './payment-intent-canceled'
import { handleChargeSucceeded } from './charge-succeeded'
import { handleChargeFailed } from './charge-failed'
import { handleCheckoutSessionCompleted } from './checkout-session-completed'
import { handleSubscriptionCreated } from './subscription-created'
import { handleSubscriptionUpdated } from './subscription-updated'
import { handleSubscriptionDeleted } from './subscription-deleted'
import { handleInvoicePaymentSucceeded } from './invoice-payment-succeeded'
import { handleInvoicePaymentFailed } from './invoice-payment-failed'

// Export individual handlers
export {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handlePaymentIntentCanceled,
  handleChargeSucceeded,
  handleChargeFailed,
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
}

/**
 * Generic handler type for Stripe events
 */
type StripeEventHandler = (data: Stripe.Event.Data.Object) => Promise<void>

/**
 * Event handler mapping with type assertions
 */
const HANDLER_MAP: Record<string, StripeEventHandler> = {
  // Card payment events
  'payment_intent.succeeded': handlePaymentIntentSucceeded as StripeEventHandler,
  'payment_intent.payment_failed': handlePaymentIntentFailed as StripeEventHandler,
  'payment_intent.canceled': handlePaymentIntentCanceled as StripeEventHandler,

  // OXXO-specific events (voucher-based payments)
  'charge.succeeded': handleChargeSucceeded as StripeEventHandler,
  'charge.failed': handleChargeFailed as StripeEventHandler,

  // Subscription billing events
  'checkout.session.completed': handleCheckoutSessionCompleted as StripeEventHandler,
  'customer.subscription.created': handleSubscriptionCreated as StripeEventHandler,
  'customer.subscription.updated': handleSubscriptionUpdated as StripeEventHandler,
  'customer.subscription.deleted': handleSubscriptionDeleted as StripeEventHandler,
  'invoice.payment_succeeded': handleInvoicePaymentSucceeded as StripeEventHandler,
  'invoice.payment_failed': handleInvoicePaymentFailed as StripeEventHandler,
}

/**
 * List of supported event types
 */
export const SUPPORTED_EVENTS: StripeWebhookEventType[] = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'charge.succeeded',
  'charge.failed',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]

/**
 * Check if an event type has a registered handler
 */
export function hasHandler(eventType: string): boolean {
  return eventType in HANDLER_MAP
}

/**
 * Dispatch event to appropriate handler
 * @returns true if handler was found and executed, false otherwise
 */
export async function dispatchEvent(
  eventType: string,
  eventData: Stripe.Event.Data.Object
): Promise<boolean> {
  const handler = HANDLER_MAP[eventType]

  if (!handler) {
    logger.info(`No handler registered for event type: ${eventType}`)
    return false
  }

  await handler(eventData)
  return true
}

/**
 * Get handler for a specific event type
 */
export function getHandler(eventType: string): StripeEventHandler | undefined {
  return HANDLER_MAP[eventType]
}
