/**
 * Webhook Signature Verification Module
 *
 * Provides secure signature verification for external webhooks including:
 * - Stripe (payment processing)
 * - Twilio (SMS/WhatsApp messaging)
 * - Meta/WhatsApp Business API (WhatsApp messaging)
 *
 * Security Features:
 * - Timing-safe comparison to prevent timing attacks
 * - HMAC-based signature verification
 * - Comprehensive logging for monitoring
 * - No sensitive data in logs
 *
 * @module webhooks/signatures
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { logger } from '@/lib/observability/logger'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Result of webhook signature verification
 */
export interface VerificationResult {
  /** Whether the signature is valid */
  valid: boolean
  /** Error message if verification failed (without sensitive data) */
  error?: string
  /** Webhook provider for logging */
  provider: WebhookProvider
}

/**
 * Supported webhook providers
 */
export type WebhookProvider = 'stripe' | 'twilio' | 'whatsapp' | 'pharmacy'

/**
 * Configuration for signature verification
 */
interface VerificationConfig {
  /** Webhook provider */
  provider: WebhookProvider
  /** Secret/key for verification */
  secret: string
  /** Request URL (required for Twilio) */
  url?: string
  /** Payload to verify */
  payload: string
  /** Signature from request header */
  signature: string
}

// ============================================================================
// Constants
// ============================================================================

import { LIMITS } from '@/lib/constants'

/**
 * Maximum allowed timestamp difference for webhook verification (in seconds)
 * Used to prevent replay attacks
 */
const MAX_TIMESTAMP_DIFFERENCE = LIMITS.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS // 5 minutes

/**
 * Maximum allowed timestamp difference for pharmacy webhooks (in milliseconds)
 * Used to prevent replay attacks - 5 minutes
 */
const PHARMACY_MAX_TIMESTAMP_DIFFERENCE_MS = 5 * 60 * 1000

/**
 * Stripe signature header format
 * Example: t=1234567890,v1=abc123,v2=def456
 */
const STRIPE_SIGNATURE_PREFIX = 't='
const STRIPE_VERSION_PREFIX = 'v1='

// ============================================================================
// Custom Errors
// ============================================================================

export class WebhookVerificationError extends Error {
  constructor(
    message: string,
    public readonly provider: WebhookProvider,
    public readonly code: string
  ) {
    super(message)
    this.name = 'WebhookVerificationError'
    Object.setPrototypeOf(this, WebhookVerificationError.prototype)
  }
}

// ============================================================================
// Stripe Webhook Verification
// ============================================================================

/**
 * Verify Stripe webhook signature
 *
 * Stripe uses HMAC-SHA256 to sign webhook payloads.
 * The signature is sent in the `stripe-signature` header.
 *
 * Format: t={timestamp},v1={signature}
 *
 * @param payload - Raw request body as string
 * @param signature - Value from stripe-signature header
 * @param webhookSecret - Stripe webhook secret (whsec_...)
 * @returns true if signature is valid
 *
 * @example
 * ```typescript
 * const isValid = verifyStripeWebhook(
 *   rawBody,
 *   request.headers.get('stripe-signature')!,
 *   process.env.STRIPE_WEBHOOK_SECRET!
 * )
 * if (!isValid) {
 *   return new Response('Invalid signature', { status: 401 })
 * }
 * ```
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    // Validate inputs (payload can be empty string, but not null/undefined)
    if (payload === null || payload === undefined || !signature || !webhookSecret) {
      logger.warn('Stripe webhook verification failed: Missing required parameters', {
        provider: 'stripe',
        hasPayload: payload !== null && payload !== undefined,
        hasSignature: !!signature,
        hasSecret: !!webhookSecret,
      })
      return false
    }

    // Parse signature header
    const elements = signature.split(',')
    let timestamp = ''
    let signatureHash = ''

    for (const element of elements) {
      const [key, value] = element.split('=')
      if (key === 't') {
        timestamp = value
      } else if (key === 'v1') {
        signatureHash = value
      }
    }

    if (!timestamp || !signatureHash) {
      logger.warn('Stripe webhook verification failed: Invalid signature format', {
        provider: 'stripe',
      })
      return false
    }

    // Check timestamp to prevent replay attacks
    const webhookTimestamp = parseInt(timestamp, 10)
    const currentTime = Math.floor(Date.now() / 1000)
    const timeDifference = Math.abs(currentTime - webhookTimestamp)

    if (timeDifference > MAX_TIMESTAMP_DIFFERENCE) {
      logger.warn('Stripe webhook verification failed: Timestamp too old', {
        provider: 'stripe',
        timestampDifference: timeDifference,
        maxAllowed: MAX_TIMESTAMP_DIFFERENCE,
      })
      return false
    }

    // Construct signed payload
    const signedPayload = `${timestamp}.${payload}`

    // Compute expected signature
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex')

    // Timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const providedBuffer = Buffer.from(signatureHash, 'utf8')

    if (expectedBuffer.length !== providedBuffer.length) {
      logger.warn('Stripe webhook verification failed: Signature length mismatch', {
        provider: 'stripe',
      })
      return false
    }

    const isValid = timingSafeEqual(expectedBuffer, providedBuffer)

    if (!isValid) {
      logger.warn('Stripe webhook verification failed: Signature mismatch', {
        provider: 'stripe',
      })
    }

    return isValid
  } catch (error) {
    logger.error('Stripe webhook verification error', {
      provider: 'stripe',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

// ============================================================================
// Twilio Webhook Verification
// ============================================================================

/**
 * Verify Twilio webhook signature
 *
 * Twilio uses HMAC-SHA1 or HMAC-SHA256 to sign webhook URLs with parameters.
 * The signature is sent in the `X-Twilio-Signature` header.
 *
 * @param url - The full URL of the webhook endpoint (with query string)
 * @param payload - Raw request body (form-data as string)
 * @param signature - Value from X-Twilio-Signature header
 * @param authToken - Twilio auth token
 * @returns true if signature is valid
 *
 * @example
 * ```typescript
 * const isValid = verifyTwilioWebhook(
 *   request.url,
 *   await request.text(),
 *   request.headers.get('X-Twilio-Signature')!,
 *   process.env.TWILIO_AUTH_TOKEN!
 * )
 * if (!isValid) {
 *   return new Response('Invalid signature', { status: 401 })
 * }
 * ```
 */
export function verifyTwilioWebhook(
  url: string,
  payload: string,
  signature: string,
  authToken: string
): boolean {
  try {
    // Validate inputs
    if (!url || !signature || !authToken) {
      logger.warn('Twilio webhook verification failed: Missing required parameters', {
        provider: 'twilio',
        hasUrl: !!url,
        hasSignature: !!signature,
        hasToken: !!authToken,
      })
      return false
    }

    // Twilio signs the full URL concatenated with the POST body
    // If there's a payload (form data), we need to sort the parameters
    let dataToSign = url

    if (payload) {
      // For form-data, Twilio expects sorted parameters
      // Parse the form data and sort it
      const params = new URLSearchParams(payload)
      const sortedParams = Array.from(params.entries()).sort(
        ([a], [b]) => a.localeCompare(b)
      )

      // Build sorted query string
      const sortedQueryString = sortedParams
        .map(([key, value]) => `${key}${value}`)
        .join('')

      dataToSign += sortedQueryString
    }

    // Compute expected signature (Twilio uses SHA1)
    const expectedSignature = createHmac('sha1', authToken)
      .update(dataToSign)
      .digest('base64')

    // Timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const providedBuffer = Buffer.from(signature, 'utf8')

    if (expectedBuffer.length !== providedBuffer.length) {
      logger.warn('Twilio webhook verification failed: Signature length mismatch', {
        provider: 'twilio',
      })
      return false
    }

    const isValid = timingSafeEqual(expectedBuffer, providedBuffer)

    if (!isValid) {
      logger.warn('Twilio webhook verification failed: Signature mismatch', {
        provider: 'twilio',
      })
    }

    return isValid
  } catch (error) {
    logger.error('Twilio webhook verification error', {
      provider: 'twilio',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

// ============================================================================
// Meta/WhatsApp Business API Webhook Verification
// ============================================================================

/**
 * Verify Meta/WhatsApp Business API webhook signature
 *
 * Meta uses HMAC-SHA256 to sign webhook payloads.
 * The signature is sent in the `X-Hub-Signature-256` header.
 *
 * Format: sha256={signature}
 *
 * @param payload - Raw request body as string
 * @param signature - Value from X-Hub-Signature-256 header
 * @param appSecret - Meta app secret
 * @returns true if signature is valid
 *
 * @example
 * ```typescript
 * const isValid = verifyWhatsAppWebhook(
 *   await request.text(),
 *   request.headers.get('X-Hub-Signature-256')!,
 *   process.env.WHATSAPP_APP_SECRET!
 * )
 * if (!isValid) {
 *   return new Response('Invalid signature', { status: 401 })
 * }
 * ```
 */
export function verifyWhatsAppWebhook(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  try {
    // Validate inputs (payload can be empty string, but not null/undefined)
    if (payload === null || payload === undefined || !signature || !appSecret) {
      logger.warn('WhatsApp webhook verification failed: Missing required parameters', {
        provider: 'whatsapp',
        hasPayload: payload !== null && payload !== undefined,
        hasSignature: !!signature,
        hasSecret: !!appSecret,
      })
      return false
    }

    // Remove 'sha256=' prefix if present
    const signatureHash = signature.startsWith('sha256=')
      ? signature.substring(7)
      : signature

    if (!signatureHash) {
      logger.warn('WhatsApp webhook verification failed: Invalid signature format', {
        provider: 'whatsapp',
      })
      return false
    }

    // Compute expected signature
    const expectedSignature = createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex')

    // Timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const providedBuffer = Buffer.from(signatureHash, 'utf8')

    if (expectedBuffer.length !== providedBuffer.length) {
      logger.warn('WhatsApp webhook verification failed: Signature length mismatch', {
        provider: 'whatsapp',
      })
      return false
    }

    const isValid = timingSafeEqual(expectedBuffer, providedBuffer)

    if (!isValid) {
      logger.warn('WhatsApp webhook verification failed: Signature mismatch', {
        provider: 'whatsapp',
      })
    }

    return isValid
  } catch (error) {
    logger.error('WhatsApp webhook verification error', {
      provider: 'whatsapp',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

// ============================================================================
// Pharmacy Webhook Verification
// ============================================================================

/**
 * Verify Pharmacy webhook signature
 *
 * Pharmacy webhooks use HMAC-SHA256 to sign webhook payloads.
 * The signature is sent in the `x-pharmacy-signature` header.
 *
 * Security features:
 * - HMAC-SHA256 signature verification
 * - Timestamp validation to prevent replay attacks
 * - Timing-safe comparison to prevent timing attacks
 *
 * @param payload - Raw request body as string
 * @param signature - Value from x-pharmacy-signature header
 * @param webhookSecret - Pharmacy webhook secret
 * @param timestamp - Value from x-pharmacy-timestamp header (Unix timestamp in ms)
 * @returns true if signature is valid
 *
 * @example
 * ```typescript
 * const isValid = verifyPharmacyWebhook(
 *   rawBody,
 *   request.headers.get('x-pharmacy-signature')!,
 *   process.env.PHARMACY_WEBHOOK_SECRET!,
 *   request.headers.get('x-pharmacy-timestamp')!
 * )
 * if (!isValid) {
 *   return new Response('Invalid signature', { status: 401 })
 * }
 * ```
 */
export function verifyPharmacyWebhook(
  payload: string,
  signature: string,
  webhookSecret: string,
  timestamp: string
): boolean {
  try {
    // Validate inputs
    if (payload === null || payload === undefined || !signature || !webhookSecret || !timestamp) {
      logger.warn('Pharmacy webhook verification failed: Missing required parameters', {
        provider: 'pharmacy',
        hasPayload: payload !== null && payload !== undefined,
        hasSignature: !!signature,
        hasSecret: !!webhookSecret,
        hasTimestamp: !!timestamp,
      })
      return false
    }

    // Parse and validate timestamp
    const webhookTimestamp = parseInt(timestamp, 10)
    if (isNaN(webhookTimestamp)) {
      logger.warn('Pharmacy webhook verification failed: Invalid timestamp format', {
        provider: 'pharmacy',
        timestamp,
      })
      return false
    }

    // Check timestamp to prevent replay attacks
    const currentTime = Date.now()
    const timeDifference = Math.abs(currentTime - webhookTimestamp)

    if (timeDifference > PHARMACY_MAX_TIMESTAMP_DIFFERENCE_MS) {
      logger.warn('Pharmacy webhook verification failed: Timestamp too old', {
        provider: 'pharmacy',
        timestampDifference: timeDifference,
        maxAllowed: PHARMACY_MAX_TIMESTAMP_DIFFERENCE_MS,
        webhookTimestamp,
        currentTime,
      })
      return false
    }

    // Compute expected signature (HMAC-SHA256 of payload)
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')

    // Timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    const providedBuffer = Buffer.from(signature, 'utf8')

    if (expectedBuffer.length !== providedBuffer.length) {
      logger.warn('Pharmacy webhook verification failed: Signature length mismatch', {
        provider: 'pharmacy',
        expectedLength: expectedBuffer.length,
        providedLength: providedBuffer.length,
      })
      return false
    }

    const isValid = timingSafeEqual(expectedBuffer, providedBuffer)

    if (!isValid) {
      logger.warn('Pharmacy webhook verification failed: Signature mismatch', {
        provider: 'pharmacy',
      })
    }

    return isValid
  } catch (error) {
    logger.error('Pharmacy webhook verification error', {
      provider: 'pharmacy',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return false
  }
}

// ============================================================================
// Generic Verification Helper
// ============================================================================

/**
 * Generic webhook signature verification
 *
 * Automatically detects the webhook provider based on the config
 * and calls the appropriate verification function.
 *
 * @param config - Verification configuration
 * @returns Verification result with provider information
 *
 * @example
 * ```typescript
 * const result = verifyWebhookSignature({
 *   provider: 'stripe',
 *   secret: process.env.STRIPE_WEBHOOK_SECRET!,
 *   payload: await request.text(),
 *   signature: request.headers.get('stripe-signature')!,
 * })
 *
 * if (!result.valid) {
 *   logger.error('Webhook verification failed', { result })
 *   return new Response('Invalid signature', { status: 401 })
 * }
 * ```
 */
export function verifyWebhookSignature(config: VerificationConfig): VerificationResult {
  const { provider, secret, payload, signature, url } = config

  switch (provider) {
    case 'stripe':
      return {
        valid: verifyStripeWebhook(payload, signature, secret),
        provider,
      }

    case 'twilio':
      if (!url) {
        return {
          valid: false,
          error: 'URL is required for Twilio webhook verification',
          provider,
        }
      }
      return {
        valid: verifyTwilioWebhook(url, payload, signature, secret),
        provider,
      }

    case 'whatsapp':
      return {
        valid: verifyWhatsAppWebhook(payload, signature, secret),
        provider,
      }

    case 'pharmacy':
      // For pharmacy, we need to extract timestamp from a custom header
      // This is handled differently, see createWebhookVerifier for pharmacy
      return {
        valid: false,
        error: 'Use verifyPharmacyWebhook directly for pharmacy webhooks',
        provider,
      }

    default:
      return {
        valid: false,
        error: `Unsupported webhook provider: ${provider}`,
        provider,
      }
  }
}

// ============================================================================
// Middleware Helpers
// ============================================================================

/**
 * Create a webhook verification middleware for Next.js route handlers
 *
 * @param provider - Webhook provider
 * @param getSecret - Function to retrieve the secret/key
 * @returns Middleware function that verifies the webhook signature
 *
 * @example
 * ```typescript
 * // In your route handler:
 * import { createWebhookVerifier } from '@/lib/webhooks/signatures'
 *
 * const verifyStripeWebhook = createWebhookVerifier('stripe', () =>
 *   process.env.STRIPE_WEBHOOK_SECRET!
 * )
 *
 * export async function POST(request: Request) {
 *   const verification = await verifyStripeWebhook(request)
 *   if (!verification.valid) {
 *     return new Response('Invalid signature', { status: 401 })
 *   }
 *
 *   // Process webhook...
 * }
 * ```
 */
export function createWebhookVerifier(
  provider: WebhookProvider,
  getSecret: () => string
) {
  return async (request: Request): Promise<VerificationResult> => {
    try {
      const secret = getSecret()

      if (!secret) {
        logger.error('Webhook secret not configured', { provider })
        return {
          valid: false,
          error: 'Webhook secret not configured',
          provider,
        }
      }

      const payload = await request.text()
      let signature = ''
      let url = ''

      // Extract signature based on provider
      let timestamp = ''
      switch (provider) {
        case 'stripe':
          signature = request.headers.get('stripe-signature') ?? ''
          break

        case 'twilio':
          signature = request.headers.get('X-Twilio-Signature') ?? ''
          url = request.url
          break

        case 'whatsapp':
          signature = request.headers.get('X-Hub-Signature-256') ?? ''
          break

        case 'pharmacy':
          signature = request.headers.get('x-pharmacy-signature') ?? ''
          timestamp = request.headers.get('x-pharmacy-timestamp') ?? ''
          break
      }

      if (!signature) {
        logger.warn('Webhook signature header missing', { provider })
        return {
          valid: false,
          error: 'Signature header missing',
          provider,
        }
      }

      // Special handling for pharmacy webhooks (needs timestamp)
      if (provider === 'pharmacy') {
        if (!timestamp) {
          logger.warn('Webhook timestamp header missing', { provider })
          return {
            valid: false,
            error: 'Timestamp header missing',
            provider,
          }
        }
        return {
          valid: verifyPharmacyWebhook(payload, signature, secret, timestamp),
          provider,
        }
      }

      return verifyWebhookSignature({
        provider,
        secret,
        payload,
        signature,
        url,
      })
    } catch (error) {
      logger.error('Webhook verification middleware error', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return {
        valid: false,
        error: 'Verification failed',
        provider,
      }
    }
  }
}

// ============================================================================
// Testing Helpers (for development only)
// ============================================================================

/**
 * Generate a test Stripe webhook signature
 * WARNING: Only use this for testing purposes!
 *
 * @param payload - The payload to sign
 * @param webhookSecret - The webhook secret
 * @returns The signature header value
 */
export function generateTestStripeSignature(
  payload: string,
  webhookSecret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const signedPayload = `${timestamp}.${payload}`
  const signature = createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('hex')

  return `t=${timestamp},v1=${signature}`
}

/**
 * Generate a test WhatsApp webhook signature
 * WARNING: Only use this for testing purposes!
 *
 * @param payload - The payload to sign
 * @param appSecret - The app secret
 * @returns The signature header value
 */
export function generateTestWhatsAppSignature(
  payload: string,
  appSecret: string
): string {
  const signature = createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex')

  return `sha256=${signature}`
}

/**
 * Generate a test Twilio webhook signature
 * WARNING: Only use this for testing purposes!
 *
 * @param url - The full URL
 * @param payload - The payload (form data string)
 * @param authToken - The auth token
 * @returns The signature header value
 */
export function generateTestTwilioSignature(
  url: string,
  payload: string,
  authToken: string
): string {
  let dataToSign = url

  if (payload) {
    const params = new URLSearchParams(payload)
    const sortedParams = Array.from(params.entries()).sort(
      ([a], [b]) => a.localeCompare(b)
    )
    const sortedQueryString = sortedParams
      .map(([key, value]) => `${key}${value}`)
      .join('')
    dataToSign += sortedQueryString
  }

  return createHmac('sha1', authToken).update(dataToSign).digest('base64')
}

/**
 * Generate a test Pharmacy webhook signature
 * WARNING: Only use this for testing purposes!
 *
 * @param payload - The payload to sign
 * @param webhookSecret - The webhook secret
 * @param timestamp - Unix timestamp in milliseconds (defaults to current time)
 * @returns Object containing signature and timestamp
 */
export function generateTestPharmacySignature(
  payload: string,
  webhookSecret: string,
  timestamp?: number
): { signature: string; timestamp: number } {
  const ts = timestamp ?? Date.now()
  const signature = createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return { signature, timestamp: ts }
}

