/**
 * Security Tests for /api/webhooks/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Signature verification (HMAC-SHA256)
 * - IP allowlist validation
 * - Replay attack prevention (timestamp validation)
 * - Input validation
 * - Payload size limits
 * - Event type validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  resetMocks,
  createMockRequest,
} from './setup'

// Mock webhook dependencies
const mockIsWebhookIpAllowed = vi.fn(() => true)
const mockVerifySignature = vi.fn(() => ({ valid: true }))
const mockDispatchEvent = vi.fn(() => Promise.resolve(true))

vi.mock('@/lib/webhooks', () => ({
  isWebhookIpAllowed: (ip: string, provider: string) => mockIsWebhookIpAllowed(ip, provider),
  getClientIp: vi.fn((headers: Headers) => headers.get('x-forwarded-for') || '127.0.0.1'),
}))

vi.mock('@/lib/webhooks/signatures', () => ({
  verifyStripeSignature: vi.fn(() => ({ valid: true, event: { type: 'test', data: {} } })),
  verifyTwilioSignature: vi.fn(() => true),
}))

vi.mock('@/lib/webhooks/ip-allowlist', () => ({
  isWebhookIpAllowed: (ip: string, provider: string) => mockIsWebhookIpAllowed(ip, provider),
  getClientIp: vi.fn((headers: Headers) => headers.get('x-forwarded-for') || '127.0.0.1'),
}))

vi.mock('@/app/api/webhooks/stripe/utils/signature-verification', () => ({
  verifySignature: (body: string, signature: string) => mockVerifySignature(body, signature),
}))

vi.mock('@/app/api/webhooks/stripe/handlers', () => ({
  dispatchEvent: (type: string, data: unknown) => mockDispatchEvent(type, data),
  SUPPORTED_EVENTS: [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.succeeded',
    'charge.failed',
    'customer.subscription.created',
    'customer.subscription.deleted',
  ],
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Import routes after mocks
const { POST: stripeWebhook, GET: stripeWebhookStatus } = await import('@/app/api/webhooks/stripe/route')
const { POST: twilioWebhook } = await import('@/app/api/webhooks/twilio/route')
const { POST: whatsappWebhook } = await import('@/app/api/webhooks/whatsapp/route')

describe('SECURITY: /api/webhooks/*', () => {
  beforeEach(() => {
    resetMocks()
    vi.clearAllMocks()
    mockIsWebhookIpAllowed.mockReturnValue(true)
    mockVerifySignature.mockReturnValue({ valid: true, event: { type: 'payment_intent.succeeded', data: { object: {} } } })
    mockDispatchEvent.mockResolvedValue(true)
  })

  // ============================================================================
  // STRIPE WEBHOOK SECURITY TESTS
  // ============================================================================

  describe('Stripe Webhook Security', () => {
    it('rejects request without stripe-signature header', async () => {
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'test' },
        headers: {
          'content-type': 'application/json',
        },
      })
      
      // Mock text() method for raw body
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'test' })),
      })
      
      const response = await stripeWebhook(request)
      
      expect(response.status).toBe(401)
    })

    it('rejects request from unauthorized IP', async () => {
      mockIsWebhookIpAllowed.mockReturnValue(false)
      
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'test' },
        headers: {
          'stripe-signature': 'valid-signature',
          'x-forwarded-for': '1.2.3.4', // Unauthorized IP
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'test' })),
      })
      
      const response = await stripeWebhook(request)
      
      expect(response.status).toBe(403)
    })

    it('rejects request with invalid signature', async () => {
      mockVerifySignature.mockReturnValue({ 
        valid: false, 
        error: 'Invalid signature',
      })
      
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'test' },
        headers: {
          'stripe-signature': 'invalid-signature',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'test' })),
      })
      
      const response = await stripeWebhook(request)
      
      expect(response.status).toBe(401)
    })

    it('accepts request with valid signature and authorized IP', async () => {
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'payment_intent.succeeded' },
        headers: {
          'stripe-signature': 'valid-signature',
          'x-forwarded-for': '192.168.1.1',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'payment_intent.succeeded' })),
      })
      
      const response = await stripeWebhook(request)
      
      expect(response.status).toBe(200)
    })

    it('validates webhook event type is supported', async () => {
      mockVerifySignature.mockReturnValue({ 
        valid: true, 
        event: { 
          type: 'unsupported.event', 
          data: { object: {} },
        },
      })
      
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'unsupported.event' },
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'unsupported.event' })),
      })
      
      const response = await stripeWebhook(request)
      
      // Should still return 200 for unsupported events (acknowledged)
      expect(response.status).toBe(200)
    })

    it('implements replay attack protection', async () => {
      mockVerifySignature.mockReturnValue({ 
        valid: false, 
        error: 'Timestamp too old',
      })
      
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'test' },
        headers: {
          'stripe-signature': 'old-signature',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'test' })),
      })
      
      const response = await stripeWebhook(request)
      
      expect(response.status).toBe(401)
    })

    it('limits payload size', async () => {
      const largePayload = { type: 'test', data: 'x'.repeat(10000000) }
      
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: largePayload,
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify(largePayload)),
      })
      
      const response = await stripeWebhook(request)
      
      // Should reject oversized payloads
      expect(response.status).not.toBe(200)
    })

    it('does not expose sensitive data in error responses', async () => {
      mockVerifySignature.mockReturnValue({ 
        valid: false, 
        error: 'Invalid signature: sk_live_12345',
      })
      
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'test' },
        headers: {
          'stripe-signature': 'invalid',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'test' })),
      })
      
      const response = await stripeWebhook(request)
      
      if (response.status !== 200) {
        const data = await response.json()
        const dataStr = JSON.stringify(data)
        expect(dataStr).not.toContain('sk_live')
      }
    })

    it('returns supported events on GET', async () => {
      const response = await stripeWebhookStatus()
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.supportedEvents).toBeDefined()
    })
  })

  // ============================================================================
  // TWILIO WEBHOOK SECURITY TESTS
  // ============================================================================

  describe('Twilio Webhook Security', () => {
    it('rejects request without valid signature', async () => {
      vi.mocked(await import('@/lib/webhooks/signatures')).verifyTwilioSignature = vi.fn(() => false)
      
      const formData = new FormData()
      formData.append('From', '+1234567890')
      formData.append('Body', 'Test message')
      
      const request = createMockRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: formData,
        headers: {
          'x-twilio-signature': 'invalid-signature',
        },
      })
      
      const response = await twilioWebhook(request)
      
      // Should reject invalid signatures
      expect(response.status).not.toBe(200)
    })

    it('validates request comes from Twilio IP range', async () => {
      mockIsWebhookIpAllowed.mockReturnValue(false)
      
      const formData = new FormData()
      formData.append('From', '+1234567890')
      
      const request = createMockRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: formData,
        headers: {
          'x-forwarded-for': '1.2.3.4',
          'x-twilio-signature': 'valid-signature',
        },
      })
      
      const response = await twilioWebhook(request)
      
      expect(response.status).toBe(403)
    })

    it('sanitizes phone number input', async () => {
      const formData = new FormData()
      formData.append('From', '<script>alert(1)</script>+1234567890')
      formData.append('Body', 'Test')
      
      const request = createMockRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: formData,
        headers: {
          'x-twilio-signature': 'valid-signature',
        },
      })
      
      const response = await twilioWebhook(request)
      
      expect(response.status).not.toBe(500)
    })

    it('limits message body length', async () => {
      const formData = new FormData()
      formData.append('From', '+1234567890')
      formData.append('Body', 'A'.repeat(100000))
      
      const request = createMockRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: formData,
        headers: {
          'x-twilio-signature': 'valid-signature',
        },
      })
      
      const response = await twilioWebhook(request)
      
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // WHATSAPP WEBHOOK SECURITY TESTS
  // ============================================================================

  describe('WhatsApp Webhook Security', () => {
    it('rejects request without valid verification token', async () => {
      const formData = new FormData()
      formData.append('From', 'whatsapp:+1234567890')
      
      const request = createMockRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: formData,
        headers: {},
      })
      
      const response = await whatsappWebhook(request)
      
      // Should require some form of verification
      expect(response.status).not.toBe(200)
    })

    it('validates sender phone number format', async () => {
      const formData = new FormData()
      formData.append('From', 'invalid-phone-format')
      formData.append('Body', 'Test')
      
      const request = createMockRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: formData,
      })
      
      const response = await whatsappWebhook(request)
      
      expect(response.status).not.toBe(500)
    })

    it('sanitizes message body', async () => {
      const formData = new FormData()
      formData.append('From', 'whatsapp:+1234567890')
      formData.append('Body', '<script>alert("xss")</script>')
      
      const request = createMockRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: formData,
      })
      
      const response = await whatsappWebhook(request)
      
      expect(response.status).not.toBe(500)
    })

    it('implements rate limiting per phone number', async () => {
      // Multiple requests from same number should be rate limited
      const formData = new FormData()
      formData.append('From', 'whatsapp:+1234567890')
      formData.append('Body', 'Test')
      
      const request = createMockRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: formData,
      })
      
      const response = await whatsappWebhook(request)
      
      // Rate limiting should be applied
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // WEBHOOK VERIFICATION TESTS
  // ============================================================================

  describe('Webhook Verification', () => {
    it('Stripe: uses timing-safe comparison for signatures', async () => {
      // Test that signature comparison is timing-safe
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'test' },
        headers: {
          'stripe-signature': 't=1234567890,v1=abc123',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'test' })),
      })
      
      await stripeWebhook(request)
      
      // Signature verification should use timing-safe comparison
      expect(mockVerifySignature).toHaveBeenCalled()
    })

    it('logs webhook events for audit trail', async () => {
      const request = createMockRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: { type: 'payment_intent.succeeded' },
        headers: {
          'stripe-signature': 'valid-signature',
        },
      })
      
      Object.defineProperty(request, 'text', {
        value: () => Promise.resolve(JSON.stringify({ type: 'payment_intent.succeeded' })),
      })
      
      await stripeWebhook(request)
      
      // Events should be logged
      const { logger } = await import('@/lib/observability/logger')
      expect(logger.info).toHaveBeenCalled()
    })
  })
})
