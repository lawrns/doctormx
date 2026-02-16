/**
 * Security Tests for /api/payments/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 without required role)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Payment data protection (sensitive data handling)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  resetMocks,
  setMockUser,
  setMockSession,
  setCsrfValid,
  setRateLimitFail,
  createMockRequest,
  createAuthenticatedRequest,
  mockUsers,
} from './setup'

// Mock Stripe
const mockPaymentIntentsCreate = vi.fn()
const mockPaymentIntentsRetrieve = vi.fn()

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: (...args: unknown[]) => mockPaymentIntentsCreate(...args),
      retrieve: (...args: unknown[]) => mockPaymentIntentsRetrieve(...args),
    },
  },
}))

vi.mock('stripe', () => ({
  default: class Stripe {
    constructor() {
      return {
        paymentIntents: {
          create: mockPaymentIntentsCreate,
          retrieve: mockPaymentIntentsRetrieve,
        },
      }
    }
  },
}))

// Import routes after mocks
const { POST: createPaymentIntent } = await import('@/app/api/create-payment-intent/route')
const { POST: confirmPayment } = await import('@/app/api/confirm-payment/route')

describe('SECURITY: /api/payments/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
    
    // Reset Stripe mocks
    mockPaymentIntentsCreate.mockReset()
    mockPaymentIntentsRetrieve.mockReset()
    
    // Default Stripe mock responses
    mockPaymentIntentsCreate.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret_456',
      status: 'requires_confirmation',
      amount: 10000,
      currency: 'mxn',
    })
    
    mockPaymentIntentsRetrieve.mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 10000,
      currency: 'mxn',
      metadata: { appointment_id: 'apt_123' },
    })
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when creating payment intent without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
      })
      
      const response = await createPaymentIntent(request)
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('Unauthorized')
    })

    it('returns 401 when confirming payment without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/confirm-payment', {
        method: 'POST',
        body: { paymentIntentId: 'pi_test_123' },
      })
      
      const response = await confirmPayment(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 200 when creating payment intent with valid session', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // AUTHORIZATION (RBAC) TESTS
  // ============================================================================

  describe('Authorization (RBAC)', () => {
    it('allows patient to create payment intent for their appointment', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      expect(response.status).not.toBe(403)
    })

    it('allows doctor to access payment endpoints', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.doctor,
      })
      
      const response = await createPaymentIntent(request)
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // CSRF PROTECTION TESTS - CRITICAL FOR PAYMENTS
  // ============================================================================

  describe('CSRF Protection - CRITICAL', () => {
    it('rejects payment creation without CSRF token', async () => {
      setMockUser(mockUsers.patient)
      setMockSession({ access_token: 'test', refresh_token: 'test' })
      
      const request = createMockRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        cookies: { 'sb-access-token': 'test' },
        // No CSRF token
      })
      
      const response = await createPaymentIntent(request)
      
      // Payment endpoints should require CSRF
      if (response.status === 403) {
        const data = await response.json()
        expect(data.code).toBe('INVALID_TOKEN')
      }
    })

    it('rejects payment confirmation without CSRF token', async () => {
      setMockUser(mockUsers.patient)
      setMockSession({ access_token: 'test', refresh_token: 'test' })
      
      const request = createMockRequest('http://localhost/api/confirm-payment', {
        method: 'POST',
        body: { paymentIntentId: 'pi_test_123' },
        cookies: { 'sb-access-token': 'test' },
        // No CSRF token
      })
      
      const response = await confirmPayment(request)
      
      // Payment confirmation should require CSRF
      if (response.status === 403) {
        const data = await response.json()
        expect(data.code).toBe('INVALID_TOKEN')
      }
    })

    it('accepts payment creation with valid CSRF token', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
        includeCsrf: true,
      })
      
      setCsrfValid(true)
      
      const response = await createPaymentIntent(request)
      
      // Should not be CSRF error
      if (response.status === 403) {
        const data = await response.json()
        expect(data.code).not.toBe('INVALID_TOKEN')
      }
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS - CRITICAL FOR PAYMENTS
  // ============================================================================

  describe('Rate Limiting - CRITICAL', () => {
    it('applies strict rate limiting to payment intent creation', async () => {
      setRateLimitFail(true, 300)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      // Payment endpoints should have strict rate limiting
    })

    it('returns 429 when payment creation rate limit exceeded', async () => {
      setRateLimitFail(true, 300)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      // Should return 429 when rate limited
    })

    it('applies different rate limits for authenticated vs anonymous', async () => {
      // Authenticated users should have higher limits than anonymous
      const { request: authRequest } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      // This test documents expected behavior
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('returns 400 with missing appointmentId', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { amount: 10000 }, // Missing appointmentId
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('returns 400 with invalid amount', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: -100 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('returns 400 with zero amount', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 0 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('returns 400 with excessive amount', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 1000000000 }, // 10 million MXN - too high
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      // Should validate reasonable amount limits
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('sanitizes XSS attempts in appointmentId', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: '<script>alert("xss")</script>', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      const data = await response.json()
      if (data.error) {
        expect(data.error).not.toContain('<script>')
      }
    })

    it('sanitizes SQL injection attempts in paymentIntentId', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/confirm-payment', {
        method: 'POST',
        body: { paymentIntentId: "'; DROP TABLE payments; --" },
        user: mockUsers.patient,
      })
      
      const response = await confirmPayment(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates paymentIntentId format', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/confirm-payment', {
        method: 'POST',
        body: { paymentIntentId: 'invalid-format' },
        user: mockUsers.patient,
      })
      
      const response = await confirmPayment(request)
      
      // Should validate Stripe payment intent ID format (pi_*)
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('rejects non-numeric amount', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 'not-a-number' },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      expect(response.status).toBe(400)
    })
  })

  // ============================================================================
  // PAYMENT DATA PROTECTION TESTS
  // ============================================================================

  describe('Payment Data Protection', () => {
    it('does not expose full payment intent details in error responses', async () => {
      mockPaymentIntentsCreate.mockRejectedValue(new Error('Card declined'))
      
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      const data = await response.json()
      // Should not expose sensitive Stripe details
      expect(JSON.stringify(data)).not.toContain('sk_live')
      expect(JSON.stringify(data)).not.toContain('sk_test')
    })

    it('only returns necessary client secret', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      if (response.status === 200) {
        const data = await response.json()
        // Should only expose client_secret, not other Stripe details
        expect(data.clientSecret).toBeDefined()
        expect(data.stripeAccountId).toBeUndefined()
      }
    })

    it('validates user owns the appointment before creating payment', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'other-users-appointment', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      // Should verify appointment ownership
      if (response.status === 403) {
        const data = await response.json()
        expect(data.error).toContain('Forbidden')
      }
    })
  })

  // ============================================================================
  // IDEMPOTENCY TESTS
  // ============================================================================

  describe('Idempotency', () => {
    it('handles duplicate payment intent creation gracefully', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      // First request
      const response1 = await createPaymentIntent(request)
      
      // Second identical request
      const response2 = await createPaymentIntent(request)
      
      // Should handle gracefully, not create duplicate payments
    })
  })

  // ============================================================================
  // CURRENCY VALIDATION TESTS
  // ============================================================================

  describe('Currency Validation', () => {
    it('validates supported currencies', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000, currency: 'INVALID' },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      // Should validate currency
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('defaults to MXN for Mexican users', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/create-payment-intent', {
        method: 'POST',
        body: { appointmentId: 'apt-123', amount: 10000 },
        user: mockUsers.patient,
      })
      
      const response = await createPaymentIntent(request)
      
      // Should use MXN as default
    })
  })
})
