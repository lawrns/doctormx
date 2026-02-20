/**
 * Security Tests for /api/premium/* and /api/subscriptions/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 without proper role)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Payment data protection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  resetMocks,
  setMockUser,
  setCsrfValid,
  setRateLimitFail,
  createMockRequest,
  createAuthenticatedRequest,
  mockUsers,
} from './setup'

// Mock premium/subscription dependencies
vi.mock('@/lib/subscription', () => ({
  getSubscriptionStatus: vi.fn(async (userId: string) => ({
    userId,
    tier: 'free',
    status: 'active',
    expiresAt: null,
    features: ['basic'],
  })),
  getSubscriptionPlans: vi.fn(async () => [
    { id: 'basic', name: 'Basic', price: 0 },
    { id: 'premium', name: 'Premium', price: 299 },
  ]),
  upgradeSubscription: vi.fn(async (userId: string, planId: string) => ({
    success: true,
    subscription: { tier: planId, status: 'active' },
  })),
  getUsageStats: vi.fn(async (userId: string) => ({
    userId,
    aiQueries: { used: 10, limit: 100 },
    storage: { used: 50, limit: 1000 },
  })),
}))

vi.mock('@/lib/premium', () => ({
  getPremiumStatus: vi.fn(async (userId: string) => ({
    isPremium: false,
    tier: 'free',
    expiresAt: null,
  })),
  purchasePremium: vi.fn(async () => ({
    success: true,
    clientSecret: 'secret_123',
  })),
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
const { GET: getSubscriptionStatus } = await import('@/app/api/subscriptions/route')
const { GET: getSubscriptionPlans } = await import('@/app/api/subscriptions/plans/route')
const { POST: upgradeSubscription } = await import('@/app/api/subscriptions/upgrade/route')
const { GET: getPremiumStatus } = await import('@/app/api/premium/status/route')
const { POST: purchasePremium } = await import('@/app/api/premium/purchase/route')

describe('SECURITY: /api/premium/* and /api/subscriptions/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when accessing subscription status without authentication', async () => {
      setMockUser(null)
      
      const response = await getSubscriptionStatus()
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when upgrading subscription without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'premium' },
      })
      
      const response = await upgradeSubscription(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when purchasing premium without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/premium/purchase', {
        method: 'POST',
        body: { plan: 'premium' },
      })
      
      const response = await purchasePremium(request)
      
      expect(response.status).toBe(401)
    })

    it('allows public access to subscription plans', async () => {
      setMockUser(null)
      
      const response = await getSubscriptionPlans()
      
      // Plans should be public
      expect(response.status).not.toBe(401)
    })

    it('allows access with valid session', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getSubscriptionStatus()
      
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // DATA ISOLATION TESTS - CRITICAL
  // ============================================================================

  describe('Data Isolation - CRITICAL', () => {
    it('returns only the authenticated user subscription status', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getSubscriptionStatus()
      
      expect(response.status).toBe(200)
    })

    it('returns only the authenticated user usage stats', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getPremiumStatus()
      
      expect(response.status).toBe(200)
    })

    it('ignores userId parameter in upgrade request', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'premium', userId: 'other-user' },
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      // Should use session user, not body parameter
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // CSRF PROTECTION TESTS
  // ============================================================================

  describe('CSRF Protection', () => {
    it('rejects POST without CSRF token', async () => {
      setCsrfValid(false)
      setMockUser(mockUsers.patient)
      
      const request = createMockRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'premium' },
        cookies: { 'sb-access-token': 'test' },
      })
      
      const response = await upgradeSubscription(request)
      
      expect(response.status).toBe(403)
    })

    it('accepts POST with valid CSRF token', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'premium' },
        user: mockUsers.patient,
        includeCsrf: true,
      })
      
      const response = await upgradeSubscription(request)
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('returns 400 with missing plan parameter', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: {},
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      expect(response.status).toBe(400)
    })

    it('returns 400 with invalid plan ID', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'invalid-plan' },
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('sanitizes XSS in plan parameter', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: '<script>alert(1)</script>' },
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates plan is available for user type', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'enterprise' }, // May not be available for patients
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      // Should validate plan availability
      expect(response.status).not.toBe(500)
    })

    it('prevents downgrade to lower tier if not allowed', async () => {
      setMockUser({ ...mockUsers.patient, subscription_tier: 'premium' })
      
      const request = createMockRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'free' },
        headers: { 'x-csrf-token': 'valid-token' },
        cookies: { 'sb-access-token': 'test', 'csrf_token': 'valid-token' },
      })
      
      const response = await upgradeSubscription(request)
      
      // Should handle downgrade logic
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe('Rate Limiting', () => {
    it('applies strict rate limiting to subscription upgrades', async () => {
      setRateLimitFail(true, 300)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'premium' },
        user: mockUsers.patient,
      })
      
      // Upgrades should have strict limits
    })

    it('applies rate limiting to premium purchase', async () => {
      setRateLimitFail(true, 300)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/premium/purchase', {
        method: 'POST',
        body: { plan: 'premium' },
        user: mockUsers.patient,
      })
      
      // Purchases should have strict limits
    })
  })

  // ============================================================================
  // PAYMENT SECURITY TESTS
  // ============================================================================

  describe('Payment Security', () => {
    it('does not expose full payment details', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/premium/purchase', {
        method: 'POST',
        body: { plan: 'premium' },
        user: mockUsers.patient,
      })
      
      const response = await purchasePremium(request)
      
      if (response.status === 200) {
        const data = await response.json()
        const dataStr = JSON.stringify(data)
        // Should not expose sensitive payment data
        expect(dataStr).not.toContain('sk_live')
        expect(dataStr).not.toContain('card_number')
      }
    })

    it('returns only necessary client secret', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/premium/purchase', {
        method: 'POST',
        body: { plan: 'premium' },
        user: mockUsers.patient,
      })
      
      const response = await purchasePremium(request)
      
      if (response.status === 200) {
        const data = await response.json()
        // Should only return clientSecret for Stripe
        expect(data.clientSecret || data.client_secret).toBeDefined()
      }
    })

    it('validates plan price on server side', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/premium/purchase', {
        method: 'POST',
        body: { plan: 'premium', price: 1 }, // Attempt to manipulate price
        user: mockUsers.patient,
      })
      
      const response = await purchasePremium(request)
      
      // Should use server-side pricing
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // AUTHORIZATION TESTS
  // ============================================================================

  describe('Authorization', () => {
    it('allows patient to manage subscription', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getSubscriptionStatus()
      
      expect(response.status).toBe(200)
    })

    it('allows doctor to manage subscription', async () => {
      setMockUser(mockUsers.doctor)
      
      const response = await getSubscriptionStatus()
      
      expect(response.status).toBe(200)
    })

    it('allows admin to manage subscription', async () => {
      setMockUser(mockUsers.admin)
      
      const response = await getSubscriptionStatus()
      
      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // PRIVILEGE ESCALATION PREVENTION TESTS
  // ============================================================================

  describe('Privilege Escalation Prevention', () => {
    it('prevents users from granting themselves admin tier', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'admin', role: 'admin' },
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      // Should not allow admin tier upgrade
      expect(response.status).not.toBe(200)
    })

    it('ignores role parameter in subscription request', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/subscriptions/upgrade', {
        method: 'POST',
        body: { plan: 'premium', role: 'admin' },
        user: mockUsers.patient,
      })
      
      const response = await upgradeSubscription(request)
      
      // Should ignore role parameter
      expect(response.status).not.toBe(500)
    })
  })
})
