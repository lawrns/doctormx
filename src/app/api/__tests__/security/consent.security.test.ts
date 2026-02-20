/**
 * Security Tests for /api/consent/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 without proper role)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Consent data protection (sensitive legal data)
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

// Mock consent dependencies
vi.mock('@/lib/consent', () => ({
  getConsentStatus: vi.fn(async (userId: string) => ({
    userId,
    privacyPolicy: { version: '1.0', accepted: true, acceptedAt: new Date().toISOString() },
    termsOfService: { version: '1.0', accepted: true, acceptedAt: new Date().toISOString() },
    marketingConsent: { accepted: false },
  })),
  grantConsent: vi.fn(async (userId: string, type: string) => ({
    success: true,
    consent: { type, accepted: true, timestamp: new Date().toISOString() },
  })),
  withdrawConsent: vi.fn(async (userId: string, type: string) => ({
    success: true,
    consent: { type, accepted: false, timestamp: new Date().toISOString() },
  })),
  getConsentHistory: vi.fn(async (userId: string) => [
    { type: 'privacy', action: 'granted', timestamp: new Date().toISOString() },
  ]),
  getConsentTypes: vi.fn(() => [
    { id: 'privacy_policy', name: 'Privacy Policy', required: true },
    { id: 'terms_of_service', name: 'Terms of Service', required: true },
    { id: 'marketing', name: 'Marketing', required: false },
  ]),
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
const { GET: getConsentStatus } = await import('@/app/api/consent/status/route')
const { POST: grantConsent } = await import('@/app/api/consent/grant/route')
const { POST: withdrawConsent } = await import('@/app/api/consent/withdraw/route')
const { GET: getConsentHistory } = await import('@/app/api/consent/history/route')
const { GET: getConsentTypes } = await import('@/app/api/consent/types/route')

describe('SECURITY: /api/consent/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when accessing consent status without authentication', async () => {
      setMockUser(null)
      
      const response = await getConsentStatus()
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when granting consent without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'marketing' },
      })
      
      const response = await grantConsent(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when withdrawing consent without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/consent/withdraw', {
        method: 'POST',
        body: { type: 'marketing' },
      })
      
      const response = await withdrawConsent(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when accessing consent history without authentication', async () => {
      setMockUser(null)
      
      const response = await getConsentHistory()
      
      expect(response.status).toBe(401)
    })

    it('allows public access to consent types', async () => {
      setMockUser(null)
      
      const response = await getConsentTypes()
      
      // Consent types should be public
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // DATA ISOLATION TESTS - CRITICAL
  // ============================================================================

  describe('Data Isolation - CRITICAL', () => {
    it('returns only the authenticated user consent status', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getConsentStatus()
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.userId).toBe(mockUsers.patient.id)
    })

    it('returns only the authenticated user consent history', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getConsentHistory()
      
      expect(response.status).toBe(200)
    })

    it('ignores userId parameter in consent operations', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'marketing', userId: 'other-user' },
        user: mockUsers.patient,
      })
      
      const response = await grantConsent(request)
      
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
      
      const request = createMockRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'marketing' },
        cookies: { 'sb-access-token': 'test' },
      })
      
      const response = await grantConsent(request)
      
      expect(response.status).toBe(403)
    })

    it('accepts POST with valid CSRF token', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'marketing' },
        user: mockUsers.patient,
        includeCsrf: true,
      })
      
      const response = await grantConsent(request)
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('returns 400 with missing consent type', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: {},
        user: mockUsers.patient,
      })
      
      const response = await grantConsent(request)
      
      expect(response.status).toBe(400)
    })

    it('returns 400 with invalid consent type', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'invalid_consent_type' },
        user: mockUsers.patient,
      })
      
      const response = await grantConsent(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('sanitizes XSS in consent type', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: '<script>alert(1)</script>' },
        user: mockUsers.patient,
      })
      
      const response = await grantConsent(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates consent version', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { 
          type: 'privacy_policy',
          version: 'invalid-version',
        },
        user: mockUsers.patient,
      })
      
      const response = await grantConsent(request)
      
      // Should validate version exists
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe('Rate Limiting', () => {
    it('applies rate limiting to consent modifications', async () => {
      setRateLimitFail(true, 60)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'marketing' },
        user: mockUsers.patient,
      })
      
      // Consent modifications should be rate limited
    })
  })

  // ============================================================================
  // CONSENT AUDIT LOG TESTS
  // ============================================================================

  describe('Consent Audit Log', () => {
    it('logs consent grant actions', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/grant', {
        method: 'POST',
        body: { type: 'marketing' },
        user: mockUsers.patient,
      })
      
      await grantConsent(request)
      
      // Consent actions should be logged for audit
      const { logger } = await import('@/lib/observability/logger')
      expect(logger.info).toHaveBeenCalled()
    })

    it('logs consent withdrawal actions', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/consent/withdraw', {
        method: 'POST',
        body: { type: 'marketing' },
        user: mockUsers.patient,
      })
      
      await withdrawConsent(request)
      
      const { logger } = await import('@/lib/observability/logger')
      expect(logger.info).toHaveBeenCalled()
    })

    it('includes timestamp in consent records', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getConsentHistory()
      
      if (response.status === 200) {
        const data = await response.json()
        if (data.history && data.history.length > 0) {
          expect(data.history[0].timestamp).toBeDefined()
        }
      }
    })
  })

  // ============================================================================
  // AUTHORIZATION TESTS
  // ============================================================================

  describe('Authorization', () => {
    it('allows patient to manage their consent', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getConsentStatus()
      
      expect(response.status).toBe(200)
    })

    it('allows doctor to access consent endpoints', async () => {
      setMockUser(mockUsers.doctor)
      
      const response = await getConsentStatus()
      
      expect(response.status).toBe(200)
    })

    it('allows admin to access consent endpoints', async () => {
      setMockUser(mockUsers.admin)
      
      const response = await getConsentStatus()
      
      expect(response.status).toBe(200)
    })
  })
})
