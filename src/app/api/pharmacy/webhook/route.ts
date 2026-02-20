/**
 * Pharmacy Webhook Handler
 *
 * Processes referral redemption webhooks from pharmacy partners.
 * Implements comprehensive security measures:
 * - HMAC-SHA256 signature verification
 * - Timestamp validation (replay attack prevention)
 * - IP allowlist validation
 * - Idempotency check (duplicate prevention)
 *
 * @module api/pharmacy/webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redeemReferral, getPharmacyByEmail } from '@/lib/pharmacy'
import { logger } from '@/lib/observability/logger'
import {
  verifyPharmacyWebhook,
  generateTestPharmacySignature,
} from '@/lib/webhooks/signatures'
import { isWebhookIpAllowed, getClientIp } from '@/lib/webhooks/ip-allowlist'
import { WEBHOOK_CONFIG } from '@/lib/webhooks/config'

// ============================================================================
// Types
// ============================================================================

interface PharmacyWebhookPayload {
  referralCode: string
  pharmacyId?: string
  pharmacyEmail?: string
  medicationTotalCents: number
}

// ============================================================================
// Security Verification Functions
// ============================================================================

/**
 * Verify pharmacy webhook signature and timestamp
 */
async function verifyWebhookSecurity(
  request: NextRequest
): Promise<{ valid: boolean; error?: string; payload?: string }> {
  // Get required headers
  const signature = request.headers.get(WEBHOOK_CONFIG.pharmacy.SIGNATURE_HEADER)
  const timestamp = request.headers.get(WEBHOOK_CONFIG.pharmacy.TIMESTAMP_HEADER)

  // Check for missing headers
  if (!signature) {
    logger.warn('Pharmacy webhook: Missing signature header', {
      headers: Array.from(request.headers.keys()),
    })
    return { valid: false, error: 'Missing signature header' }
  }

  if (!timestamp) {
    logger.warn('Pharmacy webhook: Missing timestamp header')
    return { valid: false, error: 'Missing timestamp header' }
  }

  // Get webhook secret
  const secret = process.env[WEBHOOK_CONFIG.pharmacy.SECRET_ENV_VAR]
  if (!secret) {
    logger.error('Pharmacy webhook: Secret not configured')
    return { valid: false, error: 'Webhook secret not configured' }
  }

  // Get raw payload
  const payload = await request.text()

  // Skip verification in development if configured (NOT recommended for production)
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.WEBHOOK_SKIP_VERIFICATION_IN_DEV === 'true'
  ) {
    logger.warn('Pharmacy webhook: Skipping signature verification in development mode')
    return { valid: true, payload }
  }

  // Verify signature
  const isValid = verifyPharmacyWebhook(payload, signature, secret, timestamp)

  if (!isValid) {
    logger.warn('Pharmacy webhook: Invalid signature', {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
    })
    return { valid: false, error: 'Invalid signature' }
  }

  return { valid: true, payload }
}

/**
 * Verify client IP is in pharmacy allowlist
 */
function verifyClientIp(request: NextRequest): boolean {
  const clientIp = getClientIp(request.headers)

  if (!clientIp) {
    logger.warn('Pharmacy webhook: Could not determine client IP')
    // In production, you might want to reject requests without IP
    // For now, we allow but log
    return true
  }

  const isAllowed = isWebhookIpAllowed(clientIp, 'pharmacy')

  if (!isAllowed) {
    logger.warn('Pharmacy webhook: Request from unauthorized IP', {
      clientIp,
    })
    return false
  }

  return true
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function isDuplicateEvent(
  idempotencyKey: string | null
): Promise<{ isDuplicate: boolean; error?: string }> {
  if (!idempotencyKey) {
    // No idempotency key provided, continue processing
    return { isDuplicate: false }
  }

  const supabase = createServiceClient()

  try {
    // Check if we've already processed this event
    const { data: existingEvent, error } = await supabase
      .from('webhook_events')
      .select('id, created_at')
      .eq('provider', 'pharmacy')
      .eq('idempotency_key', idempotencyKey)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected
      logger.error('Pharmacy webhook: Error checking idempotency', {
        error: error.message,
        idempotencyKey,
      })
      return { isDuplicate: false, error: 'Failed to check idempotency' }
    }

    if (existingEvent) {
      logger.info('Pharmacy webhook: Duplicate event detected', {
        idempotencyKey,
        processedAt: existingEvent.created_at,
      })
      return { isDuplicate: true }
    }

    return { isDuplicate: false }
  } catch (error) {
    logger.error('Pharmacy webhook: Exception checking idempotency', {
      error: error instanceof Error ? error.message : 'Unknown error',
      idempotencyKey,
    })
    return { isDuplicate: false, error: 'Failed to check idempotency' }
  }
}

/**
 * Record webhook event for idempotency tracking
 */
async function recordWebhookEvent(
  idempotencyKey: string | null,
  payload: string,
  success: boolean
): Promise<void> {
  if (!idempotencyKey) {
    return
  }

  const supabase = createServiceClient()

  try {
    // Store event with 24-hour TTL (cleanup via cron job or similar)
    const { error } = await supabase.from('webhook_events').insert({
      provider: 'pharmacy',
      idempotency_key: idempotencyKey,
      event_type: 'referral_redeem',
      payload_hash: await hashPayload(payload),
      processed_at: new Date().toISOString(),
      success,
    })

    if (error) {
      logger.error('Pharmacy webhook: Failed to record event', {
        error: error.message,
        idempotencyKey,
      })
    }
  } catch (error) {
    logger.error('Pharmacy webhook: Exception recording event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      idempotencyKey,
    })
  }
}

/**
 * Simple hash function for payload deduplication
 */
async function hashPayload(payload: string): Promise<string> {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder()
  const data = encoder.encode(payload)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * POST handler for pharmacy webhook
 *
 * Security flow:
 * 1. Verify IP allowlist
 * 2. Verify signature and timestamp
 * 3. Check idempotency
 * 4. Process referral redemption
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const idempotencyKey = request.headers.get('x-idempotency-key')

  try {
    // Step 1: Verify IP allowlist
    if (!verifyClientIp(request)) {
      return NextResponse.json(
        { error: 'Forbidden: Unauthorized IP address' },
        { status: 403 }
      )
    }

    // Step 2: Verify signature and timestamp
    const securityCheck = await verifyWebhookSecurity(request)
    if (!securityCheck.valid) {
      return NextResponse.json(
        { error: securityCheck.error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = securityCheck.payload!

    // Step 3: Check idempotency
    const duplicateCheck = await isDuplicateEvent(idempotencyKey)
    if (duplicateCheck.error) {
      return NextResponse.json(
        { error: 'Internal error checking request status' },
        { status: 500 }
      )
    }

    if (duplicateCheck.isDuplicate) {
      // Return 200 for idempotent response (already processed)
      logger.info('Pharmacy webhook: Returning idempotent response', {
        idempotencyKey,
      })
      return NextResponse.json(
        {
          success: true,
          message: 'Referral already processed',
          idempotent: true,
        },
        { status: 200 }
      )
    }

    // Parse payload
    let body: PharmacyWebhookPayload
    try {
      body = JSON.parse(payload)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const { referralCode, pharmacyId, pharmacyEmail, medicationTotalCents } = body

    // Validate required fields
    if (!referralCode || (!pharmacyId && !pharmacyEmail)) {
      return NextResponse.json(
        { error: 'Referral code and pharmacy identification are required' },
        { status: 400 }
      )
    }

    // Step 4: Process referral redemption
    let actualPharmacyId = pharmacyId

    if (!actualPharmacyId && pharmacyEmail) {
      const pharmacy = await getPharmacyByEmail(pharmacyEmail)
      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 })
      }
      actualPharmacyId = pharmacy.id
    }

    const supabase = createServiceClient()
    const { data: pharmacyProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', pharmacyEmail)
      .single()

    if (!pharmacyProfile) {
      return NextResponse.json(
        { error: 'Pharmacy account not found' },
        { status: 404 }
      )
    }

    const result = await redeemReferral(
      referralCode,
      actualPharmacyId!,
      pharmacyProfile.id,
      medicationTotalCents
    )

    // Record event for idempotency (only if we have a key)
    await recordWebhookEvent(idempotencyKey, payload, result.success)

    if (!result.success) {
      logger.warn('Pharmacy webhook: Referral redemption failed', {
        referralCode,
        error: result.error,
      })
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const duration = Date.now() - startTime
    logger.info('Pharmacy webhook: Referral redeemed successfully', {
      referralCode,
      pharmacyId: actualPharmacyId,
      duration,
    })

    return NextResponse.json({
      success: true,
      message: 'Referral redeemed successfully',
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Pharmacy webhook: Unhandled error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      idempotencyKey,
    })
    return NextResponse.json(
      { error: 'Failed to redeem referral' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Test Helpers (for development/testing only)
// ============================================================================

/**
 * Generate test signature for local testing
 * WARNING: Only use this for development/testing!
 *
 * Usage:
 * ```typescript
 * const { signature, timestamp } = generatePharmacyTestSignature(
 *   JSON.stringify(payload),
 *   'your-webhook-secret'
 * );
 *
 * fetch('/api/pharmacy/webhook', {
 *   method: 'POST',
 *   headers: {
 *     'x-pharmacy-signature': signature,
 *     'x-pharmacy-timestamp': timestamp.toString(),
 *     'x-idempotency-key': 'unique-key-123',
 *   },
 *   body: JSON.stringify(payload),
 * });
 * ```
 */
export { generateTestPharmacySignature }
