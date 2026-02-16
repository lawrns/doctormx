import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

/**
 * Check if event has already been processed (idempotency)
 */
export async function isEventProcessed(
  stripeEventId: string,
  eventType: string
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', stripeEventId)
      .eq('event_type', eventType)
      .single()

    return !!existingEvent
  } catch (error) {
    // If error, assume not processed to be safe
    logger.warn('Error checking event idempotency:', { stripeEventId, eventType, error })
    return false
  }
}

/**
 * Validate required metadata fields
 */
export function validateMetadata(
  metadata: Record<string, string | undefined>,
  requiredFields: string[]
): { valid: true; values: Record<string, string> } | { valid: false; missing: string[] } {
  const missing: string[] = []
  const values: Record<string, string> = {}

  for (const field of requiredFields) {
    const value = metadata[field]
    if (!value) {
      missing.push(field)
    } else {
      values[field] = value
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return { valid: true, values }
}
