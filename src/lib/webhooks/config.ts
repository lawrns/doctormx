/**
 * Webhook Configuration Module
 *
 * Centralized configuration for webhook security settings
 *
 * @module webhooks/config
 */

import { LIMITS } from '@/lib/constants'

/**
 * Webhook security configuration
 */
export const WEBHOOK_CONFIG = {
  /**
   * Maximum allowed timestamp difference for webhook verification (in seconds)
   * Used to prevent replay attacks
   * Default: 5 minutes (300 seconds)
   */
  MAX_TIMESTAMP_DIFFERENCE: LIMITS.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,

  /**
   * Whether to enable IP allowlist validation
   * Can be overridden with WEBHOOK_IP_ALLOWLIST_ENABLED env var
   */
  IP_ALLOWLIST_ENABLED: process.env.WEBHOOK_IP_ALLOWLIST_ENABLED !== 'false',

  /**
   * Whether to skip signature verification in development
   * WARNING: Only set to true for local testing
   */
  SKIP_VERIFICATION_IN_DEV: process.env.WEBHOOK_SKIP_VERIFICATION_IN_DEV === 'true',

  /**
   * Stripe-specific configuration
   */
  stripe: {
    /**
     * Stripe webhook secret environment variable name
     */
    SECRET_ENV_VAR: 'STRIPE_WEBHOOK_SECRET',

    /**
     * Stripe signature header name
     */
    SIGNATURE_HEADER: 'stripe-signature',

    /**
     * API key environment variable name (for additional validation)
     */
    API_KEY_ENV_VAR: 'STRIPE_SECRET_KEY',
  },

  /**
   * Twilio-specific configuration
   */
  twilio: {
    /**
     * Twilio auth token environment variable name
     */
    AUTH_TOKEN_ENV_VAR: 'TWILIO_AUTH_TOKEN',

    /**
     * Twilio signature header name
     */
    SIGNATURE_HEADER: 'X-Twilio-Signature',

    /**
     * Twilio account SID environment variable name
     */
    ACCOUNT_SID_ENV_VAR: 'TWILIO_ACCOUNT_SID',
  },

  /**
   * WhatsApp/Meta-specific configuration
   */
  whatsapp: {
    /**
     * Meta app secret environment variable name
     */
    APP_SECRET_ENV_VAR: 'WHATSAPP_APP_SECRET',

    /**
     * Meta signature header name
     */
    SIGNATURE_HEADER: 'X-Hub-Signature-256',

    /**
     * Webhook verification token environment variable name
     */
    VERIFY_TOKEN_ENV_VAR: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
  },
} as const

/**
 * Get webhook secret from environment
 */
export function getWebhookSecret(provider: 'stripe' | 'twilio' | 'whatsapp'): string | undefined {
  switch (provider) {
    case 'stripe':
      return process.env[WEBHOOK_CONFIG.stripe.SECRET_ENV_VAR]
    case 'twilio':
      return process.env[WEBHOOK_CONFIG.twilio.AUTH_TOKEN_ENV_VAR]
    case 'whatsapp':
      return process.env[WEBHOOK_CONFIG.whatsapp.APP_SECRET_ENV_VAR]
    default:
      return undefined
  }
}
