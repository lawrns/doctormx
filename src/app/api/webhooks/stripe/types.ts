import Stripe from 'stripe'

/**
 * Stripe Webhook Event Types
 */
export type StripeWebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'charge.succeeded'
  | 'charge.failed'
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'

/**
 * Appointment data structure for notifications
 */
export interface Appointment {
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

/**
 * Payment method names in Spanish
 */
export const PAYMENT_METHOD_NAMES: Record<string, string> = {
  card: 'tarjeta',
  oxxo: 'OXXO',
  spei: 'transferencia SPEI',
}

/**
 * Subscription tier mapping
 */
export type SubscriptionTier = 'pro' | 'elite'

/**
 * Handler function type
 */
export type StripeEventHandler<T = Stripe.Event.Data.Object> = (
  eventObject: T
) => Promise<void>

/**
 * Webhook event log status
 */
export type WebhookEventStatus = 'processed' | 'failed'

/**
 * Handler result
 */
export interface HandlerResult {
  success: boolean
  message?: string
  shouldLog: boolean
}
