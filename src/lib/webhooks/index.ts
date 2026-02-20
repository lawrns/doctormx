/**
 * Webhooks Module
 *
 * Comprehensive webhook signature verification and utilities for Doctor.mx
 *
 * Security Features:
 * - HMAC signature verification for Stripe, Twilio, and Meta/WhatsApp
 * - Timing-safe comparison to prevent timing attacks
 * - Timestamp validation for replay attack prevention (Stripe)
 * - IP allowlist validation
 * - Comprehensive logging for monitoring
 *
 * @module webhooks
 */

// ============================================================================
// Signature Verification
// ============================================================================

export {
  verifyStripeWebhook,
  verifyTwilioWebhook,
  verifyWhatsAppWebhook,
  verifyWebhookSignature,
  createWebhookVerifier,
  generateTestStripeSignature,
  generateTestWhatsAppSignature,
  generateTestTwilioSignature,
} from './signatures'

export type {
  VerificationResult,
  WebhookProvider,
} from './signatures'

export { WebhookVerificationError } from './signatures'

// ============================================================================
// IP Allowlist
// ============================================================================

export {
  isIpAllowed,
  isWebhookIpAllowed,
  getClientIp,
  createIpValidator,
  STRIPE_IP_ALLOWLIST,
  TWILIO_IP_RANGES,
  META_IP_RANGES,
} from './ip-allowlist'

// ============================================================================
// Configuration
// ============================================================================

export { WEBHOOK_CONFIG, getWebhookSecret } from './config'

