/**
 * Webhook IP Allowlist Module
 *
 * Provides IP address validation for webhook requests from:
 * - Stripe (payment processing)
 * - Twilio (SMS/WhatsApp messaging)
 * - Meta/WhatsApp Business API (WhatsApp messaging)
 *
 * Security Features:
 * - IP allowlist validation
 * - CIDR range support for dynamic IPs
 * - Comprehensive logging for monitoring
 *
 * @module webhooks/ip-allowlist
 */

import { logger } from '@/lib/observability/logger'
import type { WebhookProvider } from './signatures'
import { getPharmacyIpAllowlist } from './config'

// ============================================================================
// IP Allowlists
// ============================================================================

/**
 * Stripe webhook IP addresses
 * Source: https://stripe.com/docs/ips
 * Last updated: 2024-02-16
 */
export const STRIPE_IP_ALLOWLIST = [
  // Primary webhook IPs
  '3.18.12.63',
  '3.130.192.231',
  '13.235.14.237',
  '13.235.122.149',
  '35.154.171.200',
  '52.15.183.38',
  '52.15.228.35',
  '52.55.186.226',
  '52.55.186.227',
  '54.187.174.169',
  '54.187.216.72',
  '54.241.31.99',
  '54.241.31.102',
  '54.241.34.107',
  // Additional US region IPs
  '44.226.36.77',
  '44.226.68.82',
  '44.226.76.107',
  '44.226.97.145',
  '44.226.105.17',
  '44.226.113.128',
  '44.226.120.133',
  '44.226.138.139',
  '44.226.149.126',
  '44.226.150.202',
  '44.226.157.44',
  '44.226.161.182',
  '44.226.162.96',
  '44.226.167.146',
  '44.226.168.138',
  '44.226.170.183',
  '44.226.171.182',
  '44.226.172.0',
  '44.226.173.128',
  '44.226.174.5',
  '44.226.175.66',
  '44.226.178.86',
  '44.226.181.36',
  '44.226.183.140',
  '44.226.184.57',
  '44.226.186.76',
  '44.226.190.60',
  '44.226.191.15',
  '44.226.192.200',
  '44.226.193.173',
]

/**
 * Twilio webhook IP ranges (CIDR)
 * Source: https://www.twilio.com/en-us/help/changelog/twilio-communications-security
 * Last updated: 2024-02-16
 */
export const TWILIO_IP_RANGES = [
  '54.172.60.0/23',
  '34.203.254.64/26',
  '34.226.36.32/25',
  '34.228.195.20/32',
  '35.235.121.82/32',
  '52.0.63.165/32',
  '52.0.63.194/32',
  '52.5.154.6/32',
  '52.5.190.84/32',
  '52.20.67.134/32',
  '52.20.77.83/32',
  '52.35.61.89/32',
  '52.52.112.21/32',
  '52.55.86.50/32',
  '52.89.124.151/32',
  '52.89.124.203/32',
  '54.65.63.51/32',
  '54.148.125.19/32',
  '54.172.60.0/23',
  '54.187.226.171/32',
  '54.187.226.224/32',
]

/**
 * Meta/WhatsApp webhook IP ranges (CIDR)
 * Source: https://developers.facebook.com/docs/whatsapp/guides/webhooks/
 * Note: Meta uses dynamic IPs, recommend verifying signatures over IP allowlisting
 * Last updated: 2024-02-16
 */
export const META_IP_RANGES = [
  '31.13.24.0/21',
  '31.13.64.0/18',
  '45.64.40.0/22',
  '66.220.144.0/20',
  '69.63.176.0/20',
  '69.171.224.0/19',
  '74.119.76.0/22',
  '103.4.96.0/22',
  '129.134.0.0/17',
  '157.240.0.0/17',
  '157.240.128.0/17',
  '173.252.64.0/18',
  '173.252.96.0/19',
  '179.60.192.0/22',
  '185.60.216.0/22',
  '204.15.20.0/22',
]

// ============================================================================
// IP Validation Functions
// ============================================================================

/**
 * Convert IP address to numeric value for comparison
 */
function ipToNumeric(ip: string): number {
  const parts = ip.split('.').map(Number)
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

/**
 * Check if an IP is within a CIDR range
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    const [rangeIp, prefixLength] = cidr.split('/')
    const prefix = parseInt(prefixLength, 10)
    
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return false
    }

    const ipNumeric = ipToNumeric(ip)
    const rangeNumeric = ipToNumeric(rangeIp)
    const mask = -1 << (32 - prefix)

    return (ipNumeric & mask) === (rangeNumeric & mask)
  } catch {
    return false
  }
}

/**
 * Verify if an IP address is in the allowlist
 *
 * @param ip - Client IP address
 * @param allowlist - Array of allowed IPs
 * @returns true if IP is allowed
 */
export function isIpAllowed(ip: string, allowlist: string[]): boolean {
  // Exact match check
  if (allowlist.includes(ip)) {
    return true
  }

  // CIDR range check
  for (const allowed of allowlist) {
    if (allowed.includes('/')) {
      if (isIpInCidr(ip, allowed)) {
        return true
      }
    }
  }

  return false
}

/**
 * Verify if an IP address is allowed for a specific webhook provider
 *
 * @param ip - Client IP address
 * @param provider - Webhook provider
 * @returns true if IP is allowed
 *
 * @example
 * ```typescript
 * const clientIp = request.headers.get('x-forwarded-for') || request.ip
 * if (!isWebhookIpAllowed(clientIp, 'stripe')) {
 *   return new Response('Forbidden', { status: 403 })
 * }
 * ```
 */
/**
 * Pharmacy IP allowlist
 * These IPs should be configured via PHARMACY_IP_ALLOWLIST env var
 * Format: comma-separated list of IP addresses
 */
export function getPharmacyWebhookIpAllowlist(): string[] {
  const envAllowlist = getPharmacyIpAllowlist()
  // Default fallback IPs (should be configured in production)
  return envAllowlist.length > 0 ? envAllowlist : []
}

export function isWebhookIpAllowed(ip: string, provider: WebhookProvider): boolean {
  // Skip IP validation in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // Skip if IP allowlisting is disabled
  if (process.env.WEBHOOK_IP_ALLOWLIST_ENABLED === 'false') {
    return true
  }

  switch (provider) {
    case 'stripe':
      return isIpAllowed(ip, STRIPE_IP_ALLOWLIST)

    case 'twilio':
      return isIpAllowed(ip, TWILIO_IP_RANGES)

    case 'whatsapp':
      // Meta recommends signature verification over IP allowlisting
      // due to their dynamic IP infrastructure
      logger.debug('WhatsApp IP validation skipped - using signature verification', {
        provider: 'whatsapp',
        clientIp: ip,
      })
      return true

    case 'pharmacy': {
      const pharmacyIps = getPharmacyWebhookIpAllowlist()
      // If no allowlist is configured, allow all (but log warning)
      if (pharmacyIps.length === 0) {
        logger.warn('Pharmacy IP allowlist not configured, allowing all IPs', {
          provider: 'pharmacy',
          clientIp: ip,
        })
        return true
      }
      return isIpAllowed(ip, pharmacyIps)
    }

    default:
      logger.warn('Unknown webhook provider for IP validation', { provider })
      return false
  }
}

/**
 * Get client IP from request headers
 *
 * Handles various proxy configurations including:
 * - x-forwarded-for
 * - x-real-ip
 * - cf-connecting-ip (Cloudflare)
 *
 * @param headers - Request headers
 * @returns Client IP or null if not found
 */
export function getClientIp(headers: Headers): string | null {
  // Try x-forwarded-for first (most common)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP (original client)
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    if (ips.length > 0 && ips[0]) {
      return ips[0]
    }
  }

  // Try x-real-ip
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Try Cloudflare
  const cfIp = headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  return null
}

/**
 * Create IP validation middleware for Next.js route handlers
 *
 * @param provider - Webhook provider
 * @returns Middleware function that validates the client IP
 *
 * @example
 * ```typescript
 * // In your route handler:
 * import { createIpValidator } from '@/lib/webhooks/ip-allowlist'
 *
 * const validateIp = createIpValidator('stripe')
 *
 * export async function POST(request: Request) {
 *   const clientIp = getClientIp(request.headers)
 *   if (!clientIp || !validateIp(clientIp)) {
 *     return new Response('Forbidden', { status: 403 })
 *   }
 *   // Process webhook...
 * }
 * ```
 */
export function createIpValidator(provider: WebhookProvider) {
  return (ip: string): boolean => {
    const isAllowed = isWebhookIpAllowed(ip, provider)

    if (!isAllowed) {
      logger.warn('Webhook request from unauthorized IP', {
        provider,
        clientIp: ip,
      })
    }

    return isAllowed
  }
}
