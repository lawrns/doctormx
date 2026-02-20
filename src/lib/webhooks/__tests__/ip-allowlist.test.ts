/**
 * Webhook IP Allowlist Tests
 *
 * Comprehensive tests for IP allowlist validation including:
 * - Stripe IP validation
 * - Twilio IP range validation (CIDR)
 * - WhatsApp IP handling (signature-based)
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isIpAllowed,
  isWebhookIpAllowed,
  getClientIp,
  createIpValidator,
  STRIPE_IP_ALLOWLIST,
  TWILIO_IP_RANGES,
  META_IP_RANGES,
} from '../ip-allowlist'

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Webhook IP Allowlist', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NODE_ENV = 'production'
    delete process.env.WEBHOOK_IP_ALLOWLIST_ENABLED
  })

  describe('isIpAllowed', () => {
    it('should allow exact IP matches', () => {
      const allowlist = ['1.2.3.4', '5.6.7.8']
      expect(isIpAllowed('1.2.3.4', allowlist)).toBe(true)
      expect(isIpAllowed('5.6.7.8', allowlist)).toBe(true)
    })

    it('should reject IPs not in allowlist', () => {
      const allowlist = ['1.2.3.4', '5.6.7.8']
      expect(isIpAllowed('1.2.3.5', allowlist)).toBe(false)
      expect(isIpAllowed('9.10.11.12', allowlist)).toBe(false)
    })

    it('should handle CIDR ranges', () => {
      const allowlist = ['192.168.1.0/24']
      expect(isIpAllowed('192.168.1.1', allowlist)).toBe(true)
      expect(isIpAllowed('192.168.1.100', allowlist)).toBe(true)
      expect(isIpAllowed('192.168.1.255', allowlist)).toBe(true)
      expect(isIpAllowed('192.168.2.1', allowlist)).toBe(false)
    })

    it('should handle multiple CIDR ranges', () => {
      const allowlist = ['10.0.0.0/8', '172.16.0.0/12']
      expect(isIpAllowed('10.1.2.3', allowlist)).toBe(true)
      expect(isIpAllowed('172.16.5.6', allowlist)).toBe(true)
      expect(isIpAllowed('192.168.1.1', allowlist)).toBe(false)
    })

    it('should handle mixed exact IPs and CIDR ranges', () => {
      const allowlist = ['1.2.3.4', '192.168.0.0/16']
      expect(isIpAllowed('1.2.3.4', allowlist)).toBe(true)
      expect(isIpAllowed('192.168.1.1', allowlist)).toBe(true)
      expect(isIpAllowed('1.2.3.5', allowlist)).toBe(false)
    })

    it('should handle empty allowlist', () => {
      expect(isIpAllowed('1.2.3.4', [])).toBe(false)
    })

    it('should handle invalid CIDR notation gracefully', () => {
      const allowlist = ['192.168.1.0/invalid']
      expect(isIpAllowed('192.168.1.1', allowlist)).toBe(false)
    })
  })

  describe('isWebhookIpAllowed - Stripe', () => {
    it('should allow known Stripe IPs', () => {
      // Test with a known Stripe IP from the allowlist
      expect(isWebhookIpAllowed('3.18.12.63', 'stripe')).toBe(true)
      expect(isWebhookIpAllowed('54.187.174.169', 'stripe')).toBe(true)
    })

    it('should reject unknown IPs for Stripe', () => {
      expect(isWebhookIpAllowed('1.2.3.4', 'stripe')).toBe(false)
      expect(isWebhookIpAllowed('192.168.1.1', 'stripe')).toBe(false)
    })

    it('should skip validation in development mode', () => {
      process.env.NODE_ENV = 'development'
      expect(isWebhookIpAllowed('1.2.3.4', 'stripe')).toBe(true)
    })

    it('should skip validation when disabled via env var', () => {
      process.env.WEBHOOK_IP_ALLOWLIST_ENABLED = 'false'
      expect(isWebhookIpAllowed('1.2.3.4', 'stripe')).toBe(true)
    })
  })

  describe('isWebhookIpAllowed - Twilio', () => {
    it('should allow IPs in Twilio CIDR ranges', () => {
      // 54.172.60.0/23 allows 54.172.60.0 - 54.172.61.255
      expect(isWebhookIpAllowed('54.172.60.1', 'twilio')).toBe(true)
      expect(isWebhookIpAllowed('54.172.61.255', 'twilio')).toBe(true)
    })

    it('should reject IPs outside Twilio CIDR ranges', () => {
      expect(isWebhookIpAllowed('54.172.62.1', 'twilio')).toBe(false)
      expect(isWebhookIpAllowed('1.2.3.4', 'twilio')).toBe(false)
    })

    it('should skip validation in development mode', () => {
      process.env.NODE_ENV = 'development'
      expect(isWebhookIpAllowed('1.2.3.4', 'twilio')).toBe(true)
    })
  })

  describe('isWebhookIpAllowed - WhatsApp', () => {
    it('should always allow WhatsApp IPs (signature-based security)', () => {
      // WhatsApp/Meta uses dynamic IPs, signature verification is primary
      expect(isWebhookIpAllowed('31.13.24.1', 'whatsapp')).toBe(true)
      expect(isWebhookIpAllowed('1.2.3.4', 'whatsapp')).toBe(true)
    })

    it('should allow in development mode', () => {
      process.env.NODE_ENV = 'development'
      expect(isWebhookIpAllowed('1.2.3.4', 'whatsapp')).toBe(true)
    })
  })

  describe('isWebhookIpAllowed - Unknown provider', () => {
    it('should reject unknown providers', () => {
      expect(isWebhookIpAllowed('1.2.3.4', 'unknown' as any)).toBe(false)
    })
  })

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers({
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      })
      expect(getClientIp(headers)).toBe('1.2.3.4')
    })

    it('should handle single IP in x-forwarded-for', () => {
      const headers = new Headers({
        'x-forwarded-for': '1.2.3.4',
      })
      expect(getClientIp(headers)).toBe('1.2.3.4')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers({
        'x-real-ip': '1.2.3.4',
      })
      expect(getClientIp(headers)).toBe('1.2.3.4')
    })

    it('should extract IP from cf-connecting-ip header', () => {
      const headers = new Headers({
        'cf-connecting-ip': '1.2.3.4',
      })
      expect(getClientIp(headers)).toBe('1.2.3.4')
    })

    it('should prioritize x-forwarded-for over other headers', () => {
      const headers = new Headers({
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '5.6.7.8',
        'cf-connecting-ip': '9.10.11.12',
      })
      expect(getClientIp(headers)).toBe('1.2.3.4')
    })

    it('should return null when no IP headers present', () => {
      const headers = new Headers({})
      expect(getClientIp(headers)).toBeNull()
    })

    it('should handle whitespace in x-forwarded-for', () => {
      const headers = new Headers({
        'x-forwarded-for': '  1.2.3.4  , 5.6.7.8  ',
      })
      expect(getClientIp(headers)).toBe('1.2.3.4')
    })
  })

  describe('createIpValidator', () => {
    it('should create validator for Stripe', () => {
      const validator = createIpValidator('stripe')
      expect(validator('3.18.12.63')).toBe(true)
      expect(validator('1.2.3.4')).toBe(false)
    })

    it('should create validator for Twilio', () => {
      const validator = createIpValidator('twilio')
      expect(validator('54.172.60.1')).toBe(true)
      expect(validator('1.2.3.4')).toBe(false)
    })

    it('should create validator for WhatsApp (always true)', () => {
      const validator = createIpValidator('whatsapp')
      expect(validator('1.2.3.4')).toBe(true)
      expect(validator('any.ip.address')).toBe(true)
    })

    it('should log warnings for unauthorized IPs', async () => {
      const { logger } = await import('@/lib/observability/logger')
      const validator = createIpValidator('stripe')
      validator('1.2.3.4')
      expect(logger.warn).toHaveBeenCalledWith(
        'Webhook request from unauthorized IP',
        expect.objectContaining({
          provider: 'stripe',
          clientIp: '1.2.3.4',
        })
      )
    })
  })

  describe('IP Allowlists Content', () => {
    it('should have Stripe IP allowlist defined', () => {
      expect(STRIPE_IP_ALLOWLIST.length).toBeGreaterThan(0)
      expect(STRIPE_IP_ALLOWLIST).toContain('3.18.12.63')
    })

    it('should have Twilio IP ranges defined', () => {
      expect(TWILIO_IP_RANGES.length).toBeGreaterThan(0)
      expect(TWILIO_IP_RANGES.some(range => range.includes('/'))).toBe(true)
    })

    it('should have Meta IP ranges defined', () => {
      expect(META_IP_RANGES.length).toBeGreaterThan(0)
      expect(META_IP_RANGES.some(range => range.includes('/'))).toBe(true)
    })

    it('should have valid CIDR notation for Twilio ranges', () => {
      for (const range of TWILIO_IP_RANGES) {
        if (range.includes('/')) {
          const [ip, prefix] = range.split('/')
          expect(ip).toMatch(/^\d+\.\d+\.\d+\.\d+$/)
          expect(parseInt(prefix, 10)).toBeGreaterThanOrEqual(0)
          expect(parseInt(prefix, 10)).toBeLessThanOrEqual(32)
        }
      }
    })
  })

  describe('Edge cases', () => {
    it('should handle IPv6 addresses in allowlist (not supported)', () => {
      // IPv6 addresses should be rejected since we only support IPv4
      expect(isIpAllowed('2001:db8::1', ['1.2.3.4'])).toBe(false)
      expect(isIpAllowed('::1', ['1.2.3.4'])).toBe(false)
    })

    it('should handle malformed IPs gracefully', () => {
      const allowlist = ['1.2.3.4']
      expect(isIpAllowed('not-an-ip', allowlist)).toBe(false)
      expect(isIpAllowed('', allowlist)).toBe(false)
    })

    it('should handle very large CIDR ranges', () => {
      // /8 allows all IPs starting with 0.x.x.x
      const allowlist8 = ['0.0.0.0/8']
      expect(isIpAllowed('0.1.2.3', allowlist8)).toBe(true)
      expect(isIpAllowed('255.255.255.255', allowlist8)).toBe(false)
      
      // /1 allows 0.x.x.x to 127.x.x.x
      const allowlist1 = ['0.0.0.0/1']
      expect(isIpAllowed('1.2.3.4', allowlist1)).toBe(true)
      expect(isIpAllowed('128.1.2.3', allowlist1)).toBe(false)
    })

    it('should handle /32 CIDR (single IP)', () => {
      const allowlist = ['192.168.1.1/32']
      expect(isIpAllowed('192.168.1.1', allowlist)).toBe(true)
      expect(isIpAllowed('192.168.1.2', allowlist)).toBe(false)
    })
  })
})
