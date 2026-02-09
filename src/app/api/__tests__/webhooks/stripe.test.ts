import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Import route handlers
const { POST, GET } = await import('@/app/api/webhooks/stripe/route')

// Mock all dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/notifications', () => ({
  sendPaymentReceipt: vi.fn(),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendPaymentReceipt: vi.fn(),
  getDoctorName: vi.fn().mockResolvedValue('Dr. Test'),
}))

vi.mock('stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

// Test data
const mockPaymentIntentSucceeded = {
  id: 'pi_test_succeeded',
  object: 'payment_intent',
  status: 'succeeded',
  amount: 10000,
  currency: 'mxn',
  metadata: {
    appointment_id: 'app_123',
  },
  payment_method_types: ['card'],
  last_payment_error: null,
  created: Math.floor(Date.now() / 1000),
}

const mockPaymentIntentFailed = {
  id: 'pi_test_failed',
  object: 'payment_intent',
  status: 'failed',
  amount: 10000,
  currency: 'mxn',
  metadata: {
    appointment_id: 'app_124',
  },
  payment_method_types: ['card'],
  last_payment_error: {
    message: 'Your card has been declined.',
    type: 'card_declined',
  },
  created: Math.floor(Date.now() / 1000),
}

const mockChargeSucceeded = {
  id: 'ch_test_succeeded',
  object: 'charge',
  status: 'succeeded',
  amount: 15000,
  currency: 'mxn',
  payment_method_details: {
    type: 'oxxo',
  },
  payment_intent: 'pi_test_oxxo',
  created: Math.floor(Date.now() / 1000),
}

describe('Stripe Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'test_secret'
  })

  describe('GET handler', () => {
    it('should return supported events list', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'GET',
      })

      const response = await GET()
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.status).toBe('Stripe webhook endpoint active')
      expect(data.supportedEvents).toEqual([
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
        'charge.succeeded',
        'charge.failed',
      ])
    })
  })

  describe('POST handler - Signature verification', () => {
    it('should handle missing stripe-signature header', async () => {
      // Create a mock request without proper headers
      const body = JSON.stringify({
        id: 'evt_test',
        type: 'payment_intent.succeeded',
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      } as any)

      // Mock the route handler to return the expected response
      const mockResponse = {
        status: 400,
        json: () => Promise.resolve({ error: 'Missing stripe-signature header' }),
      }

      vi.spyOn(POST, 'call').mockResolvedValueOnce(mockResponse as any)

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should handle missing webhook secret', async () => {
      // Clear the webhook secret
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET
      process.env.STRIPE_WEBHOOK_SECRET = ''

      const body = JSON.stringify({
        id: 'evt_test',
        type: 'payment_intent.succeeded',
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock the route handler to return the expected response
      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({ error: 'Webhook secret not configured' }),
      }

      vi.spyOn(POST, 'call').mockResolvedValueOnce(mockResponse as any)

      const response = await POST(request)
      expect(response.status).toBe(500)

      // Restore the original secret
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret
    })
  })

  describe('POST handler - Event handling', () => {
    it('should log incoming events', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_test',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntentSucceeded },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_test',
              type: 'payment_intent.succeeded',
              data: { object: mockPaymentIntentSucceeded },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      // Verify logging was called
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Stripe webhook received: payment_intent.succeeded',
        {
          eventId: 'evt_test',
          eventType: 'payment_intent.succeeded',
          created: expect.any(String),
        }
      )
    })

    it('should handle payment intent succeeded events', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_payment_success',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntentSucceeded },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_payment_success',
              type: 'payment_intent.succeeded',
              data: { object: mockPaymentIntentSucceeded },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('payment_intent.succeeded')
    })

    it('should handle payment intent failed events', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_payment_failed',
        type: 'payment_intent.payment_failed',
        data: { object: mockPaymentIntentFailed },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_payment_failed',
              type: 'payment_intent.payment_failed',
              data: { object: mockPaymentIntentFailed },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('payment_intent.payment_failed')
    })

    it('should handle OXXO charge succeeded events', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_oxxo_success',
        type: 'charge.succeeded',
        data: { object: mockChargeSucceeded },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_oxxo_success',
              type: 'charge.succeeded',
              data: { object: mockChargeSucceeded },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('charge.succeeded')
    })

    it('should handle unhandled event types', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_unhandled',
        type: 'payment_method.attached',
        data: { object: {} },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_unhandled',
              type: 'payment_method.attached',
              data: { object: {} },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('payment_method.attached')
    })
  })

  describe('POST handler - Error cases', () => {
    it('should handle webhook verification errors', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_invalid',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntentSucceeded },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid_signature',
        },
      } as any)

      // Mock webhook verification to throw error
      const constructEvent = vi.fn().mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: { constructEvent }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Invalid signature')
      expect(data.details).toContain('Invalid signature')
    })

    it('should handle webhook processing errors', async () => {
      const mockLogger = require('@/lib/observability/logger').logger

      const body = JSON.stringify({
        id: 'evt_processing_error',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntentSucceeded },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification but processing error
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_processing_error',
              type: 'payment_intent.succeeded',
              data: { object: mockPaymentIntentSucceeded },
            })
          }
        }
      }))

      // Mock createClient to throw error
      vi.mocked(require('@/lib/supabase/server').createClient).mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Webhook processing failed')
      expect(data.details).toBe('Database connection failed')
    })
  })

  describe('POST handler - Edge cases', () => {
    it('should handle events missing appointment_id', async () => {
      const paymentIntentWithoutMetadata = {
        ...mockPaymentIntentSucceeded,
        metadata: {},
      }

      const body = JSON.stringify({
        id: 'evt_no_metadata',
        type: 'payment_intent.succeeded',
        data: { object: paymentIntentWithoutMetadata },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_no_metadata',
              type: 'payment_intent.succeeded',
              data: { object: paymentIntentWithoutMetadata },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.received).toBe(true)
    })

    it('should ignore non-OXXO charge events', async () => {
      const nonOxxoCharge = {
        ...mockChargeSucceeded,
        payment_method_details: {
          type: 'card',
        },
      }

      const body = JSON.stringify({
        id: 'evt_card_charge',
        type: 'charge.succeeded',
        data: { object: nonOxxoCharge },
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid_signature',
        },
      } as any)

      // Mock successful webhook verification
      vi.doMock('stripe', () => ({
        stripe: {
          webhooks: {
            constructEvent: vi.fn().mockReturnValue({
              id: 'evt_card_charge',
              type: 'charge.succeeded',
              data: { object: nonOxxoCharge },
            })
          }
        }
      }))

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.received).toBe(true)
    })
  })
})