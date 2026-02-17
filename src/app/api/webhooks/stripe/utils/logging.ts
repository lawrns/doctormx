import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import type Stripe from 'stripe'
import type { WebhookEventStatus } from '../types'

/**
 * Log webhook event for audit purposes
 */
export async function logWebhookEvent(
  event: Stripe.Event,
  status: WebhookEventStatus,
  errorMessage?: string
): Promise<void> {
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
 * Log incoming webhook event
 */
export function logIncomingEvent(event: Stripe.Event): void {
  const createdDate = event.created && !isNaN(event.created) 
    ? new Date(event.created * 1000).toISOString() 
    : new Date().toISOString()
  logger.info(`Stripe webhook received: ${event.type}`, {
    eventId: event.id,
    eventType: event.type,
    created: createdDate,
  })
}

/**
 * Log handler success
 */
export function logHandlerSuccess(
  eventType: string,
  eventId: string,
  details?: Record<string, unknown>
): void {
  logger.info(`Handler completed for ${eventType}`, { eventId, ...details })
}

/**
 * Log handler error
 */
export function logHandlerError(
  eventType: string,
  eventId: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  logger.error(`Handler failed for ${eventType}`, {
    eventId,
    error: errorMessage,
    ...context,
  })
}
