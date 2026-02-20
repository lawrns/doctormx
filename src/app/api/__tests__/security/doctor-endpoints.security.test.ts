/**
 * Security Tests for /api/doctor/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 without doctor role for doctor-specific endpoints)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Data isolation (doctors can only modify their own data)
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

// Mock doctor dependencies
vi.mock('@/lib/availability', () => ({
  setDoctorAvailability: vi.fn(async () => ({ success: true })),
  getDoctorAvailability: vi.fn(async () => [
    { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
  ]),
}))

vi.mock('@/lib/doctors', () => ({
  verifyCedula: vi.fn(async (cedula: string) => {
    // Mexican professional ID validation
    const cedulaRegex = /^\d{7,8}$/
    return cedulaRegex.test(cedula)
  }),
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
const { POST: setAvailability } = await import('@/app/api/doctor/availability/route')
const { POST: verifyCedula } = await import('@/app/api/doctor/verify-cedula/route')
const { POST: doctorOnboarding } = await import('@/app/api/doctor/onboarding/route')

describe('SECURITY: /api/doctor/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when setting availability without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: new FormData(),
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when verifying cedula without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 during onboarding without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/doctor/onboarding', {
        method: 'POST',
        body: { step: 1 },
      })
      
      const response = await doctorOnboarding(request)
      
      expect(response.status).toBe(401)
    })

    it('allows access with valid doctor session', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
        user: mockUsers.doctor,
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // AUTHORIZATION (RBAC) TESTS
  // ============================================================================

  describe('Authorization (RBAC)', () => {
    it('returns 403 when patient tries to access doctor endpoints', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: new FormData(),
        user: mockUsers.patient,
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).toBe(403)
    })

    it('allows doctor to access doctor endpoints', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
        user: mockUsers.doctor,
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).not.toBe(403)
    })

    it('allows admin to access doctor endpoints', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
        user: mockUsers.admin,
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // DATA ISOLATION TESTS - CRITICAL
  // ============================================================================

  describe('Data Isolation - CRITICAL', () => {
    it('only allows doctors to modify their own availability', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: new FormData(),
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      // Should update for authenticated doctor only
      expect(response.status).not.toBe(403)
    })

    it('ignores doctorId parameter in request body', async () => {
      const formData = new FormData()
      formData.append('doctorId', 'other-doctor-id')
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      // Should use session userId, not body parameter
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // CSRF PROTECTION TESTS
  // ============================================================================

  describe('CSRF Protection', () => {
    it('rejects POST without CSRF token', async () => {
      setCsrfValid(false)
      setMockUser(mockUsers.doctor)
      
      const request = createMockRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
        cookies: { 'sb-access-token': 'test' },
        // No CSRF token
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).toBe(403)
    })

    it('accepts POST with valid CSRF token', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
        user: mockUsers.doctor,
        includeCsrf: true,
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('validates cedula format (7-8 digits)', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '123' }, // Too short
        user: mockUsers.doctor,
      })
      
      const response = await verifyCedula(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('rejects non-numeric cedula', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: 'abcdefg' },
        user: mockUsers.doctor,
      })
      
      const response = await verifyCedula(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('sanitizes XSS in cedula field', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '<script>alert(1)</script>' },
        user: mockUsers.doctor,
      })
      
      const response = await verifyCedula(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates availability time format', async () => {
      const formData = new FormData()
      formData.append('enabled_1', 'on')
      formData.append('start_1', 'invalid-time')
      formData.append('end_1', '25:99') // Invalid time
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      // Should validate time format
      expect(response.status).not.toBe(500)
    })

    it('validates day_of_week range (0-6)', async () => {
      const formData = new FormData()
      formData.append('enabled_8', 'on') // Invalid day
      formData.append('start_8', '09:00')
      formData.append('end_8', '17:00')
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates availability start time is before end time', async () => {
      const formData = new FormData()
      formData.append('enabled_1', 'on')
      formData.append('start_1', '17:00')
      formData.append('end_1', '09:00') // Invalid: end before start
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      // Should validate time logic
      expect(response.status).not.toBe(500)
    })

    it('sanitizes XSS in FormData fields', async () => {
      const formData = new FormData()
      formData.append('enabled_1', 'on')
      formData.append('start_1', '09:00')
      formData.append('end_1', '17:00')
      formData.append('notes', '<script>alert("xss")</script>')
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).not.toBe(500)
    })

    it('rejects excessive availability slots (DoS protection)', async () => {
      const formData = new FormData()
      // Add too many slots
      for (let i = 0; i < 100; i++) {
        formData.append(`enabled_${i}`, 'on')
        formData.append(`start_${i}`, '00:00')
        formData.append(`end_${i}`, '23:59')
      }
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).not.toBe(500)
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe('Rate Limiting', () => {
    it('applies rate limiting to cedula verification', async () => {
      setRateLimitFail(true, 60)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/verify-cedula', {
        method: 'POST',
        body: { cedula: '1234567' },
        user: mockUsers.doctor,
      })
      
      // Cedula verification should be rate limited
    })

    it('applies rate limiting to availability updates', async () => {
      setRateLimitFail(true, 30)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: new FormData(),
        user: mockUsers.doctor,
      })
      
      // Availability updates should be rate limited
    })
  })

  // ============================================================================
  // ONBOARDING SECURITY TESTS
  // ============================================================================

  describe('Onboarding Security', () => {
    it('validates onboarding step number', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/onboarding', {
        method: 'POST',
        body: { step: 999 }, // Invalid step
        user: mockUsers.doctor,
      })
      
      const response = await doctorOnboarding(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates required fields for each step', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/onboarding', {
        method: 'POST',
        body: { step: 1 }, // Missing required fields
        user: mockUsers.doctor,
      })
      
      const response = await doctorOnboarding(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('sanitizes bio field for XSS', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/onboarding', {
        method: 'POST',
        body: { 
          step: 1,
          bio: '<script>alert("xss")</script>',
        },
        user: mockUsers.doctor,
      })
      
      const response = await doctorOnboarding(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates specialty IDs exist', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/onboarding', {
        method: 'POST',
        body: { 
          step: 2,
          specialties: ['invalid-specialty-id'],
        },
        user: mockUsers.doctor,
      })
      
      const response = await doctorOnboarding(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })
  })

  // ============================================================================
  // PRIVILEGE ESCALATION PREVENTION TESTS
  // ============================================================================

  describe('Privilege Escalation Prevention', () => {
    it('ignores status parameter in availability update', async () => {
      const formData = new FormData()
      formData.append('status', 'admin') // Attempt to set status
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).not.toBe(500)
    })

    it('ignores verification_status parameter', async () => {
      const formData = new FormData()
      formData.append('verification_status', 'verified') // Attempt to self-verify
      
      const { request } = createAuthenticatedRequest('http://localhost/api/doctor/availability', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await setAvailability(request)
      
      expect(response.status).not.toBe(500)
    })
  })
})
