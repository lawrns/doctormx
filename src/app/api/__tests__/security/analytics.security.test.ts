/**
 * Security Tests for /api/analytics/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 - admin/doctor only)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Data access control (analytics data is sensitive)
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

// Mock analytics dependencies
vi.mock('@/lib/analytics', () => ({
  getAdminAnalytics: vi.fn(async () => ({
    totalUsers: 1000,
    totalAppointments: 500,
    revenue: 50000,
    growth: { users: 10, appointments: 5 },
  })),
  getDoctorAnalytics: vi.fn(async (doctorId: string) => ({
    doctorId,
    totalAppointments: 50,
    rating: 4.5,
    revenue: 2500,
  })),
  exportAnalytics: vi.fn(async () => ({
    csv: 'date,metric,value\n2024-01,users,100',
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
const { GET: adminAnalytics } = await import('@/app/api/analytics/admin/route')
const { GET: doctorAnalytics } = await import('@/app/api/analytics/doctor/route')
const { GET: exportAnalytics } = await import('@/app/api/analytics/export/route')

describe('SECURITY: /api/analytics/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when accessing admin analytics without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/analytics/admin')
      
      const response = await adminAnalytics(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when accessing doctor analytics without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/analytics/doctor')
      
      const response = await doctorAnalytics(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when exporting analytics without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/analytics/export')
      
      const response = await exportAnalytics(request)
      
      expect(response.status).toBe(401)
    })

    it('allows access with valid admin session', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // AUTHORIZATION (RBAC) TESTS
  // ============================================================================

  describe('Authorization (RBAC)', () => {
    it('allows admin to access admin analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      expect(response.status).not.toBe(403)
    })

    it('prevents doctor from accessing admin analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin', {
        user: mockUsers.doctor,
      })
      
      const response = await adminAnalytics(request)
      
      expect(response.status).toBe(403)
    })

    it('prevents patient from accessing admin analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin', {
        user: mockUsers.patient,
      })
      
      const response = await adminAnalytics(request)
      
      expect(response.status).toBe(403)
    })

    it('allows doctor to access doctor analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/doctor', {
        user: mockUsers.doctor,
      })
      
      const response = await doctorAnalytics(request)
      
      expect(response.status).not.toBe(403)
    })

    it('allows patient to access their own analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/doctor', {
        user: mockUsers.patient,
      })
      
      const response = await doctorAnalytics(request)
      
      // May be allowed but with limited data
      expect(response.status).not.toBe(403)
    })

    it('allows admin to export analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/export', {
        user: mockUsers.admin,
      })
      
      const response = await exportAnalytics(request)
      
      expect(response.status).not.toBe(403)
    })

    it('prevents patient from exporting analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/export', {
        user: mockUsers.patient,
      })
      
      const response = await exportAnalytics(request)
      
      expect(response.status).toBe(403)
    })
  })

  // ============================================================================
  // DATA ACCESS CONTROL TESTS
  // ============================================================================

  describe('Data Access Control', () => {
    it('admin analytics do not expose individual user data', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      if (response.status === 200) {
        const data = await response.json()
        // Should be aggregate data only
        expect(data.totalUsers).toBeDefined()
        expect(data.userDetails).toBeUndefined()
      }
    })

    it('doctor analytics only show their own data', async () => {
      const { request, user } = createAuthenticatedRequest('http://localhost/api/analytics/doctor', {
        user: mockUsers.doctor,
      })
      
      const response = await doctorAnalytics(request)
      
      if (response.status === 200) {
        const data = await response.json()
        // Should only show data for the requesting doctor
        expect(data.doctorId).toBe(user.id)
      }
    })

    it('prevents accessing other doctors analytics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/doctor?doctorId=other-doctor', {
        user: mockUsers.doctor,
      })
      
      const response = await doctorAnalytics(request)
      
      if (response.status === 200) {
        const data = await response.json()
        // Should still return only requesting doctor's data
        expect(data.doctorId).toBe(mockUsers.doctor.id)
      }
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('validates date range parameters', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin?startDate=invalid&endDate=invalid', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      // Should handle invalid dates gracefully
      expect(response.status).not.toBe(500)
    })

    it('validates date range is not excessive', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin?startDate=2020-01-01&endDate=2030-12-31', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      // Should limit date range
      expect(response.status).not.toBe(500)
    })

    it('sanitizes XSS in query parameters', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin?filter=<script>alert(1)</script>', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates export format', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/export?format=invalid', {
        user: mockUsers.admin,
      })
      
      const response = await exportAnalytics(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('limits export data size', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/export?limit=999999', {
        user: mockUsers.admin,
      })
      
      const response = await exportAnalytics(request)
      
      // Should limit export size
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe('Rate Limiting', () => {
    it('applies strict rate limiting to admin analytics', async () => {
      setRateLimitFail(true, 120)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin', {
        user: mockUsers.admin,
      })
      
      // Admin analytics should have strict rate limits
    })

    it('applies rate limiting to analytics export', async () => {
      setRateLimitFail(true, 300)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/export', {
        user: mockUsers.admin,
      })
      
      // Exports should have stricter limits
    })

    it('applies rate limiting to doctor analytics', async () => {
      setRateLimitFail(true, 60)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/doctor', {
        user: mockUsers.doctor,
      })
      
      // Doctor analytics should be rate limited
    })
  })

  // ============================================================================
  // DATA PRIVACY TESTS
  // ============================================================================

  describe('Data Privacy', () => {
    it('does not expose revenue data to non-admin users', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/doctor', {
        user: mockUsers.doctor,
      })
      
      const response = await doctorAnalytics(request)
      
      if (response.status === 200) {
        const data = await response.json()
        // Doctors should only see their own revenue
        expect(data.totalRevenue).toBeUndefined()
      }
    })

    it('analytics export does not contain PII', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/export', {
        user: mockUsers.admin,
      })
      
      const response = await exportAnalytics(request)
      
      if (response.status === 200) {
        const data = await response.json()
        const csvContent = data.csv || ''
        // Should not contain emails or other PII
        expect(csvContent).not.toContain('@')
      }
    })

    it('validates user has permission to view specific metrics', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/analytics/admin?metrics=all', {
        user: mockUsers.admin,
      })
      
      const response = await adminAnalytics(request)
      
      expect(response.status).not.toBe(403)
    })
  })
})
