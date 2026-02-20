/**
 * Webhook Signature Verification Tests
 *
 * Comprehensive tests for webhook signature verification including:
 * - Stripe webhooks
 * - Twilio webhooks
 * - WhatsApp/Meta webhooks
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  verifyStripeWebhook,
  verifyTwilioWebhook,
  verifyWhatsAppWebhook,
  verifyPharmacyWebhook,
  verifyWebhookSignature,
  createWebhookVerifier,
  generateTestStripeSignature,
  generateTestWhatsAppSignature,
  generateTestTwilioSignature,
  generateTestPharmacySignature,
} from '../signatures'

describe('Webhook Signature Verification', () => {
  describe('verifyStripeWebhook', () => {
    const webhookSecret = 'whsec_test_secret_key_1234567890abcdef'

    it('should verify valid Stripe webhook signatures', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateTestStripeSignature(payload, webhookSecret)

      const result = verifyStripeWebhook(payload, signature, webhookSecret)
      expect(result).toBe(true)
    })

    it('should reject invalid Stripe webhook signatures', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = 't=1234567890,v1=invalid_signature'

      const result = verifyStripeWebhook(payload, signature, webhookSecret)
      expect(result).toBe(false)
    })

    it('should reject expired Stripe webhooks', () => {
      const payload = JSON.stringify({ test: 'data' })
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400 // 400 seconds ago
      const signature = `t=${oldTimestamp},v1=fake_signature`

      const result = verifyStripeWebhook(payload, signature, webhookSecret)
      expect(result).toBe(false)
    })

    it('should reject missing parameters', () => {
      expect(verifyStripeWebhook('', 'signature', webhookSecret)).toBe(false)
      expect(verifyStripeWebhook('payload', '', webhookSecret)).toBe(false)
      expect(verifyStripeWebhook('payload', 'signature', '')).toBe(false)
    })

    it('should reject malformed signature format', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = 'invalid_format'

      const result = verifyStripeWebhook(payload, signature, webhookSecret)
      expect(result).toBe(false)
    })

    it('should handle empty payload', () => {
      const payload = ''
      const signature = generateTestStripeSignature(payload, webhookSecret)

      const result = verifyStripeWebhook(payload, signature, webhookSecret)
      expect(result).toBe(true)
    })
  })

  describe('verifyTwilioWebhook', () => {
    const authToken = 'test_auth_token_12345'

    it('should verify valid Twilio webhook signatures', () => {
      const url = 'https://example.com/api/webhooks/twilio'
      const payload = 'From=+1234567890&Body=Hello'
      const signature = generateTestTwilioSignature(url, payload, authToken)

      const result = verifyTwilioWebhook(url, payload, signature, authToken)
      expect(result).toBe(true)
    })

    it('should verify valid Twilio webhook signatures without payload', () => {
      const url = 'https://example.com/api/webhooks/twilio'
      const payload = ''
      const signature = generateTestTwilioSignature(url, payload, authToken)

      const result = verifyTwilioWebhook(url, payload, signature, authToken)
      expect(result).toBe(true)
    })

    it('should reject invalid Twilio webhook signatures', () => {
      const url = 'https://example.com/api/webhooks/twilio'
      const payload = 'From=+1234567890&Body=Hello'
      const signature = 'invalid_signature'

      const result = verifyTwilioWebhook(url, payload, signature, authToken)
      expect(result).toBe(false)
    })

    it('should reject missing parameters', () => {
      expect(verifyTwilioWebhook('', 'payload', 'signature', authToken)).toBe(false)
      expect(verifyTwilioWebhook('url', 'payload', '', authToken)).toBe(false)
      expect(verifyTwilioWebhook('url', 'payload', 'signature', '')).toBe(false)
    })

    it('should handle form data with sorted parameters', () => {
      const url = 'https://example.com/api/webhooks/twilio'
      // Parameters intentionally out of order
      const payload = 'Body=Hello&From=+1234567890'
      const signature = generateTestTwilioSignature(url, payload, authToken)

      const result = verifyTwilioWebhook(url, payload, signature, authToken)
      expect(result).toBe(true)
    })
  })

  describe('verifyWhatsAppWebhook', () => {
    const appSecret = 'test_app_secret_12345'

    it('should verify valid WhatsApp webhook signatures', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateTestWhatsAppSignature(payload, appSecret)

      const result = verifyWhatsAppWebhook(payload, signature, appSecret)
      expect(result).toBe(true)
    })

    it('should verify valid WhatsApp webhook signatures without sha256 prefix', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signatureWithoutPrefix = generateTestWhatsAppSignature(payload, appSecret)
        .replace('sha256=', '')

      const result = verifyWhatsAppWebhook(payload, signatureWithoutPrefix, appSecret)
      expect(result).toBe(true)
    })

    it('should reject invalid WhatsApp webhook signatures', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = 'sha256=invalid_signature'

      const result = verifyWhatsAppWebhook(payload, signature, appSecret)
      expect(result).toBe(false)
    })

    it('should reject missing parameters', () => {
      expect(verifyWhatsAppWebhook('', 'signature', appSecret)).toBe(false)
      expect(verifyWhatsAppWebhook('payload', '', appSecret)).toBe(false)
      expect(verifyWhatsAppWebhook('payload', 'signature', '')).toBe(false)
    })

    it('should reject malformed signature format', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = 'invalid_format'

      const result = verifyWhatsAppWebhook(payload, signature, appSecret)
      expect(result).toBe(false)
    })

    it('should handle empty payload', () => {
      const payload = ''
      const signature = generateTestWhatsAppSignature(payload, appSecret)

      const result = verifyWhatsAppWebhook(payload, signature, appSecret)
      expect(result).toBe(true)
    })
  })

  describe('verifyWebhookSignature', () => {
    it('should verify Stripe webhooks', () => {
      const webhookSecret = 'whsec_test_secret_key_1234567890abcdef'
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateTestStripeSignature(payload, webhookSecret)

      const result = verifyWebhookSignature({
        provider: 'stripe',
        secret: webhookSecret,
        payload,
        signature,
      })

      expect(result.valid).toBe(true)
      expect(result.provider).toBe('stripe')
    })

    it('should verify Twilio webhooks', () => {
      const authToken = 'test_auth_token_12345'
      const url = 'https://example.com/api/webhooks/twilio'
      const payload = 'From=+1234567890&Body=Hello'
      const signature = generateTestTwilioSignature(url, payload, authToken)

      const result = verifyWebhookSignature({
        provider: 'twilio',
        secret: authToken,
        payload,
        signature,
        url,
      })

      expect(result.valid).toBe(true)
      expect(result.provider).toBe('twilio')
    })

    it('should verify WhatsApp webhooks', () => {
      const appSecret = 'test_app_secret_12345'
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateTestWhatsAppSignature(payload, appSecret)

      const result = verifyWebhookSignature({
        provider: 'whatsapp',
        secret: appSecret,
        payload,
        signature,
      })

      expect(result.valid).toBe(true)
      expect(result.provider).toBe('whatsapp')
    })

    it('should return error for Twilio without URL', () => {
      const result = verifyWebhookSignature({
        provider: 'twilio',
        secret: 'test_secret',
        payload: 'test',
        signature: 'test',
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('URL is required')
    })

    it('should reject unsupported providers', () => {
      const result = verifyWebhookSignature({
        provider: 'unsupported' as any,
        secret: 'test_secret',
        payload: 'test',
        signature: 'test',
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unsupported webhook provider')
    })
  })

  describe('createWebhookVerifier', () => {
    it('should create a verifier for Stripe webhooks', async () => {
      const webhookSecret = 'whsec_test_secret_key_1234567890abcdef'
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateTestStripeSignature(payload, webhookSecret)

      const verify = createWebhookVerifier('stripe', () => webhookSecret)

      const request = new Request('https://example.com/api/webhooks/stripe', {
        method: 'POST',
        body: payload,
        headers: {
          'stripe-signature': signature,
        },
      })

      const result = await verify(request)
      expect(result.valid).toBe(true)
    })

    it('should create a verifier for Twilio webhooks', async () => {
      const authToken = 'test_auth_token_12345'
      const url = 'https://example.com/api/webhooks/twilio'
      const payload = 'From=+1234567890&Body=Hello'
      const signature = generateTestTwilioSignature(url, payload, authToken)

      const verify = createWebhookVerifier('twilio', () => authToken)

      const request = new Request(url, {
        method: 'POST',
        body: payload,
        headers: {
          'X-Twilio-Signature': signature,
        },
      })

      const result = await verify(request)
      expect(result.valid).toBe(true)
    })

    it('should create a verifier for WhatsApp webhooks', async () => {
      const appSecret = 'test_app_secret_12345'
      const payload = JSON.stringify({ test: 'data' })
      const signature = generateTestWhatsAppSignature(payload, appSecret)

      const verify = createWebhookVerifier('whatsapp', () => appSecret)

      const request = new Request('https://example.com/api/webhooks/whatsapp', {
        method: 'POST',
        body: payload,
        headers: {
          'X-Hub-Signature-256': signature,
        },
      })

      const result = await verify(request)
      expect(result.valid).toBe(true)
    })

    it('should return error when secret is not configured', async () => {
      const verify = createWebhookVerifier('stripe', () => '')

      const request = new Request('https://example.com/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
        headers: {
          'stripe-signature': 'test',
        },
      })

      const result = await verify(request)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not configured')
    })

    it('should return error when signature header is missing', async () => {
      const verify = createWebhookVerifier('stripe', () => 'secret')

      const request = new Request('https://example.com/api/webhooks/stripe', {
        method: 'POST',
        body: '{}',
      })

      const result = await verify(request)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('missing')
    })
  })

  describe('Timing-safe comparison', () => {
    it('should use timing-safe comparison for all verifications', () => {
      const webhookSecret = 'whsec_test_secret_key_1234567890abcdef'
      const payload = JSON.stringify({ test: 'data' })

      // Generate multiple valid signatures
      const validSignature = generateTestStripeSignature(payload, webhookSecret)
      const invalidSignature = validSignature.replace('v1=', 'v1=wrong')

      // Both should complete without timing differences (we can't test timing directly,
      // but we can verify both return false for invalid signatures)
      const validResult = verifyStripeWebhook(payload, validSignature, webhookSecret)
      const invalidResult = verifyStripeWebhook(payload, invalidSignature, webhookSecret)

      expect(validResult).toBe(true)
      expect(invalidResult).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle special characters in payload', () => {
      const webhookSecret = 'whsec_test_secret_key_1234567890abcdef'
      const payload = JSON.stringify({
        test: 'data with特殊 characters and 🎉 emoji',
        nested: { key: 'value with quotes " and apostrophes \'' },
      })
      const signature = generateTestStripeSignature(payload, webhookSecret)

      const result = verifyStripeWebhook(payload, signature, webhookSecret)
      expect(result).toBe(true)
    })

    it('should handle large payloads', () => {
      const webhookSecret = 'whsec_test_secret_key_1234567890abcdef'
      const largePayload = JSON.stringify({
        data: 'x'.repeat(10000),
        nested: { array: Array(100).fill('item') },
      })
      const signature = generateTestStripeSignature(largePayload, webhookSecret)

      const result = verifyStripeWebhook(largePayload, signature, webhookSecret)
      expect(result).toBe(true)
    })

    it('should handle Unicode in WhatsApp payloads', () => {
      const appSecret = 'test_app_secret_12345'
      const payload = JSON.stringify({
        message: 'Hola! ¿Cómo estás? 🚀',
        emoji: '👨‍⚕️👩‍⚕️💊🏥',
      })
      const signature = generateTestWhatsAppSignature(payload, appSecret)

      const result = verifyWhatsAppWebhook(payload, signature, appSecret)
      expect(result).toBe(true)
    })
  })

  describe('verifyPharmacyWebhook', () => {
    const webhookSecret = 'pharmacy_webhook_secret_key_12345'

    it('should verify valid Pharmacy webhook signatures', () => {
      const payload = JSON.stringify({ test: 'data' })
      const timestamp = Date.now().toString()
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(timestamp))

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, timestamp)
      expect(result).toBe(true)
    })

    it('should reject invalid Pharmacy webhook signatures', () => {
      const payload = JSON.stringify({ test: 'data' })
      const timestamp = Date.now().toString()

      const result = verifyPharmacyWebhook(payload, 'invalid_signature', webhookSecret, timestamp)
      expect(result).toBe(false)
    })

    it('should reject expired Pharmacy webhooks (older than 5 minutes)', () => {
      const payload = JSON.stringify({ test: 'data' })
      const oldTimestamp = (Date.now() - 6 * 60 * 1000).toString() // 6 minutes ago
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(oldTimestamp))

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, oldTimestamp)
      expect(result).toBe(false)
    })

    it('should reject Pharmacy webhooks with future timestamps', () => {
      const payload = JSON.stringify({ test: 'data' })
      const futureTimestamp = (Date.now() + 6 * 60 * 1000).toString() // 6 minutes in future
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(futureTimestamp))

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, futureTimestamp)
      expect(result).toBe(false)
    })

    it('should accept Pharmacy webhooks within 5 minute window', () => {
      const payload = JSON.stringify({ test: 'data' })
      const recentTimestamp = (Date.now() - 2 * 60 * 1000).toString() // 2 minutes ago
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(recentTimestamp))

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, recentTimestamp)
      expect(result).toBe(true)
    })

    it('should reject missing parameters', () => {
      const payload = JSON.stringify({ test: 'data' })
      const timestamp = Date.now().toString()
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(timestamp))

      expect(verifyPharmacyWebhook('', signature, webhookSecret, timestamp)).toBe(false)
      expect(verifyPharmacyWebhook(payload, '', webhookSecret, timestamp)).toBe(false)
      expect(verifyPharmacyWebhook(payload, signature, '', timestamp)).toBe(false)
      expect(verifyPharmacyWebhook(payload, signature, webhookSecret, '')).toBe(false)
    })

    it('should reject invalid timestamp format', () => {
      const payload = JSON.stringify({ test: 'data' })
      const invalidTimestamp = 'not_a_number'
      const { signature } = generateTestPharmacySignature(payload, webhookSecret)

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, invalidTimestamp)
      expect(result).toBe(false)
    })

    it('should handle empty payload', () => {
      const payload = ''
      const timestamp = Date.now().toString()
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(timestamp))

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, timestamp)
      expect(result).toBe(true)
    })

    it('should use timing-safe comparison', () => {
      const payload = JSON.stringify({ test: 'data' })
      const timestamp = Date.now().toString()
      const { signature: validSignature } = generateTestPharmacySignature(
        payload,
        webhookSecret,
        parseInt(timestamp)
      )
      const invalidSignature = validSignature.slice(0, -5) + '00000'

      const validResult = verifyPharmacyWebhook(payload, validSignature, webhookSecret, timestamp)
      const invalidResult = verifyPharmacyWebhook(payload, invalidSignature, webhookSecret, timestamp)

      expect(validResult).toBe(true)
      expect(invalidResult).toBe(false)
    })

    it('should handle special characters in payload', () => {
      const payload = JSON.stringify({
        referralCode: 'REF-123_TEST',
        pharmacyEmail: 'pharmacy@test.com',
        medicationTotalCents: 150000,
        special: 'Special chars: ñáéíóú 中文 🎉',
      })
      const timestamp = Date.now().toString()
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(timestamp))

      const result = verifyPharmacyWebhook(payload, signature, webhookSecret, timestamp)
      expect(result).toBe(true)
    })
  })

  describe('createWebhookVerifier for Pharmacy', () => {
    it('should create a verifier for Pharmacy webhooks', async () => {
      const webhookSecret = 'pharmacy_webhook_secret_key_12345'
      const payload = JSON.stringify({ test: 'data' })
      const timestamp = Date.now().toString()
      const { signature } = generateTestPharmacySignature(payload, webhookSecret, parseInt(timestamp))

      const verify = createWebhookVerifier('pharmacy', () => webhookSecret)

      const request = new Request('https://example.com/api/pharmacy/webhook', {
        method: 'POST',
        body: payload,
        headers: {
          'x-pharmacy-signature': signature,
          'x-pharmacy-timestamp': timestamp,
        },
      })

      const result = await verify(request)
      expect(result.valid).toBe(true)
      expect(result.provider).toBe('pharmacy')
    })

    it('should return error when timestamp header is missing for Pharmacy', async () => {
      const webhookSecret = 'pharmacy_webhook_secret_key_12345'
      const payload = JSON.stringify({ test: 'data' })
      const { signature } = generateTestPharmacySignature(payload, webhookSecret)

      const verify = createWebhookVerifier('pharmacy', () => webhookSecret)

      const request = new Request('https://example.com/api/pharmacy/webhook', {
        method: 'POST',
        body: payload,
        headers: {
          'x-pharmacy-signature': signature,
          // Missing x-pharmacy-timestamp
        },
      })

      const result = await verify(request)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Timestamp header missing')
    })
  })
})

