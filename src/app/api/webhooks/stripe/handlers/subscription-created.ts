import { logger } from '@/lib/observability/logger'
import type Stripe from 'stripe'

/**
 * Handle subscription created event
 * Fallback handler for when checkout.session.completed is missed
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  // Get doctor ID from subscription metadata
  const doctorId = (subscription as unknown as { metadata?: { doctor_id?: string } }).metadata?.doctor_id
  
  if (!doctorId) {
    logger.warn('Subscription created without doctor_id in metadata', { subscriptionId: subscription.id })
    return
  }

  logger.info(`Subscription created (backup handler)`, { subscriptionId: subscription.id, doctorId })
  // Main logic handled by checkout.session.completed
  // This is a fallback for audit/logging purposes
}
