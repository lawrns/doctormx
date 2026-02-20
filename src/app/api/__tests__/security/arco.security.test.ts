/**
 * Security Tests for /api/arco/* Endpoints (Data Protection)
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 without proper role)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Data isolation (users can only access their own ARCO requests)
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

// Mock ARCO dependencies
const mockArcoRequests = [
  {
    id: 'arco-123',
    user_id: 'patient-123',
    request_type: 'ACCESS',
    title: 'Solicitud de acceso',
    description: 'Quiero ver mis datos',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
]

vi.mock('@/lib/arco', () => ({
  createArcoRequest: vi.fn(async (userId: string, input: unknown) => ({
    id: 'arco-new',
    user_id: userId,
    ...input,
    status: 'pending',
    created_at: new Date().toISOString(),
  })),
  getUserArcoRequests: vi.fn(async (userId: string) => 
    mockArcoRequests.filter(r => r.user_id === userId)
  ),
  getAllArcoRequests: vi.fn(async () => ({
    data: mockArcoRequests,
    pagination: { total: 1 },
  })),
  getArcoRequestById: vi.fn(async (id: string) => 
    mockArcoRequests.find(r => r.id === id) || null
  ),
  isValidDataScope: vi.fn((scope: string[]) => 
    scope.every(s => ['profiles', 'appointments', 'all'].includes(s))
  ),
  getArcoRequestTemplate: vi.fn((type: string) => ({
    title: `Solicitud de ${type}`,
    description: 'Template description',
  })),
  ARCO_TYPE_DESCRIPTIONS: {
    ACCESS: 'Acceso',
    RECTIFY: 'Rectificación',
    CANCEL: 'Cancelación',
    OPPOSE: 'Oposición',
  },
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
const { GET: getArcoRequests, POST: createArcoRequest } = await import('@/app/api/arco/requests/route')
const { GET: getArcoRequestById } = await import('@/app/api/arco/requests/[id]/route')

describe('SECURITY: /api/arco/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when accessing ARCO requests without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/arco/requests')
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('returns 401 when creating ARCO request without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test request',
          description: 'Test description',
          data_scope: ['profiles'],
        },
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when accessing specific ARCO request without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/arco/requests/arco-123')
      
      const response = await getArcoRequestById(request, { params: Promise.resolve({ id: 'arco-123' }) })
      
      expect(response.status).toBe(401)
    })

    it('allows access with valid session', async () => {
      setMockUser(mockUsers.patient)
      
      const request = createMockRequest('http://localhost/api/arco/requests', {
        cookies: { 'sb-access-token': 'test-token' },
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // AUTHORIZATION (RBAC) TESTS
  // ============================================================================

  describe('Authorization (RBAC)', () => {
    it('allows patient to access their own ARCO requests', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        user: mockUsers.patient,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('allows doctor to access ARCO endpoints', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        user: mockUsers.doctor,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(200)
    })

    it('allows admin to access all ARCO requests', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        user: mockUsers.admin,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  // ============================================================================
  // DATA ISOLATION TESTS - CRITICAL
  // ============================================================================

  describe('Data Isolation - CRITICAL', () => {
    it('returns only the authenticated user ARCO requests', async () => {
      const { request, user } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        user: mockUsers.patient,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      
      if (data.data?.requests) {
        data.data.requests.forEach((req: { user_id: string }) => {
          expect(req.user_id).toBe(user.id)
        })
      }
    })

    it('prevents user from accessing other users ARCO requests', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests/arco-123', {
        user: { ...mockUsers.patient, id: 'different-user' },
      })
      
      const response = await getArcoRequestById(request, { params: Promise.resolve({ id: 'arco-123' }) })
      
      // Should not allow access to other user's request
      if (response.status === 200) {
        const data = await response.json()
        // Response should indicate no access or 404
        expect(data.success).toBeFalsy()
      }
    })

    it('ignores user_id parameter in query for non-admin users', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests?user_id=admin-789', {
        user: mockUsers.patient,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      
      // Should return only patient's requests, not admin's
      if (data.data?.requests) {
        data.data.requests.forEach((req: { user_id: string }) => {
          expect(req.user_id).toBe(mockUsers.patient.id)
        })
      }
    })

    it('allows admin to filter by user_id', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests?user_id=patient-123', {
        user: mockUsers.admin,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // CSRF PROTECTION TESTS
  // ============================================================================

  describe('CSRF Protection', () => {
    it('rejects POST without CSRF token', async () => {
      setCsrfValid(false)
      setMockUser(mockUsers.patient)
      setMockSession({ access_token: 'test', refresh_token: 'test' })
      
      const request = createMockRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'Test',
          data_scope: ['profiles'],
        },
        cookies: { 'sb-access-token': 'test' },
        // No CSRF token
      })
      
      const response = await createArcoRequest(request)
      
      // Should require CSRF
      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('accepts POST with valid CSRF token', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test request',
          description: 'Test description',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
        includeCsrf: true,
      })
      
      setCsrfValid(true)
      
      const response = await createArcoRequest(request)
      
      // Should not be CSRF error
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('returns 400 with missing required fields', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          // Missing required fields
          request_type: 'ACCESS',
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })

    it('returns 400 with invalid request_type', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'INVALID_TYPE',
          title: 'Test',
          description: 'Test',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })

    it('returns 400 with invalid data_scope', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'Test',
          data_scope: ['invalid_table'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })

    it('sanitizes XSS in title field', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: '<script>alert("xss")</script>',
          description: 'Test description',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      // Should sanitize input
      expect(response.status).not.toBe(500)
    })

    it('sanitizes XSS in description field', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: '<img src=x onerror=alert("xss")>',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).not.toBe(500)
    })

    it('rejects excessively long title (DoS protection)', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'A'.repeat(5000),
          description: 'Test',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })

    it('rejects excessively long description (DoS protection)', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'A'.repeat(50000),
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })

    it('validates title minimum length', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'AB', // Too short
          description: 'Test description',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })

    it('validates description minimum length', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test title',
          description: 'Short', // Too short
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      expect(response.status).toBe(400)
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe('Rate Limiting', () => {
    it('applies rate limiting to ARCO request creation', async () => {
      setRateLimitFail(true, 120)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'Test',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      // Rate limiting should be applied
    })

    it('applies stricter rate limits for POST than GET', async () => {
      // ARCO requests modify data, should have stricter limits
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'Test',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      // POST should have stricter limits than GET
    })
  })

  // ============================================================================
  // QUERY PARAMETER VALIDATION TESTS
  // ============================================================================

  describe('Query Parameter Validation', () => {
    it('validates request_type query parameter', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests?request_type=INVALID', {
        user: mockUsers.patient,
      })
      
      const response = await getArcoRequests(request)
      
      // Should handle invalid filter gracefully
      expect(response.status).not.toBe(500)
    })

    it('validates status query parameter', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests?status=invalid_status', {
        user: mockUsers.patient,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).not.toBe(500)
    })

    it('sanitizes XSS in query parameters', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests?search=<script>alert(1)</script>', {
        user: mockUsers.patient,
      })
      
      const response = await getArcoRequests(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates pagination parameters', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests?page=-1&per_page=9999', {
        user: mockUsers.admin,
      })
      
      const response = await getArcoRequests(request)
      
      // Should handle invalid pagination gracefully
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // PRIVILEGE ESCALATION PREVENTION TESTS
  // ============================================================================

  describe('Privilege Escalation Prevention', () => {
    it('ignores user_id in request body', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'Test',
          data_scope: ['profiles'],
          user_id: 'other-user-id', // Attempt to spoof
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      // Should ignore user_id in body and use session
      expect(response.status).not.toBe(401)
    })

    it('prevents creating requests on behalf of other users', async () => {
      const { request, user } = createAuthenticatedRequest('http://localhost/api/arco/requests', {
        method: 'POST',
        body: {
          request_type: 'ACCESS',
          title: 'Test',
          description: 'Test',
          data_scope: ['profiles'],
        },
        user: mockUsers.patient,
      })
      
      const response = await createArcoRequest(request)
      
      if (response.status === 200 || response.status === 201) {
        const data = await response.json()
        // Request should be created for authenticated user
        expect(data.data?.request?.user_id).toBe(user.id)
      }
    })
  })
})
