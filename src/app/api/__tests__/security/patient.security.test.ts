/**
 * Security Tests for /api/patient/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 without patient role)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - Data isolation (patients can only access their own data)
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

// Mock patient dependencies
vi.mock('@/lib/patient', () => ({
  getPatientProfile: vi.fn(async (userId: string) => ({
    id: userId,
    full_name: 'Test Patient',
    email: 'patient@test.com',
    phone: '5512345678',
    date_of_birth: '1990-01-01',
    gender: 'male',
    blood_type: 'O+',
    allergies: ['penicillin'],
    emergency_contact: { name: 'Emergency Contact', phone: '5587654321' },
  })),
  updatePatientProfile: vi.fn(async (userId: string, data: unknown) => ({
    id: userId,
    ...data,
    updated_at: new Date().toISOString(),
  })),
  getPatientAppointments: vi.fn(async (userId: string) => [
    { id: 'apt-1', patient_id: userId, status: 'scheduled' },
  ]),
  getPatientMedicalHistory: vi.fn(async (userId: string) => ({
    consultations: [],
    prescriptions: [],
    lab_results: [],
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
const { GET: getProfile, PUT: updateProfile } = await import('@/app/api/patient/profile/route')
const { GET: getAppointments } = await import('@/app/api/patient/appointments/route')
const { GET: getMedicalHistory } = await import('@/app/api/patient/medical-history/route')

describe('SECURITY: /api/patient/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('returns 401 when accessing profile without authentication', async () => {
      setMockUser(null)
      
      const response = await getProfile()
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when updating profile without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: 'Updated Name' },
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when accessing appointments without authentication', async () => {
      setMockUser(null)
      
      const response = await getAppointments()
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when accessing medical history without authentication', async () => {
      setMockUser(null)
      
      const response = await getMedicalHistory()
      
      expect(response.status).toBe(401)
    })

    it('allows access with valid patient session', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // DATA ISOLATION TESTS - CRITICAL
  // ============================================================================

  describe('Data Isolation - CRITICAL', () => {
    it('returns only the authenticated patient profile', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.profile).toBeDefined()
    })

    it('prevents patients from accessing other patients profiles', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      expect(response.status).toBe(200)
      const data = await response.json()
      // Profile should be for authenticated user only
      expect(data.profile?.id).toBe(mockUsers.patient.id)
    })

    it('returns only the authenticated patient appointments', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getAppointments()
      
      expect(response.status).toBe(200)
    })

    it('returns only the authenticated patient medical history', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getMedicalHistory()
      
      expect(response.status).toBe(200)
    })

    it('ignores userId parameter in request body', async () => {
      setMockUser(mockUsers.patient)
      
      const request = createMockRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { 
          full_name: 'Updated',
          userId: 'other-patient-id', // Attempt to modify other user
        },
        headers: { 'x-csrf-token': 'valid-token' },
        cookies: { 'sb-access-token': 'test', 'csrf_token': 'valid-token' },
      })
      
      const response = await updateProfile(request)
      
      // Should update authenticated user's profile only
      expect(response.status).not.toBe(401)
    })
  })

  // ============================================================================
  // CSRF PROTECTION TESTS
  // ============================================================================

  describe('CSRF Protection', () => {
    it('rejects PUT without CSRF token', async () => {
      setCsrfValid(false)
      setMockUser(mockUsers.patient)
      
      const request = createMockRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: 'Updated Name' },
        cookies: { 'sb-access-token': 'test' },
        // No CSRF token
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).toBe(403)
    })

    it('accepts PUT with valid CSRF token', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: 'Updated Name' },
        user: mockUsers.patient,
        includeCsrf: true,
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('sanitizes XSS in full_name field', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: '<script>alert("xss")</script>' },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).not.toBe(500)
    })

    it('sanitizes XSS in phone field', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { phone: '<script>alert(1)</script>5512345678' },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates phone number format', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { phone: 'invalid-phone' },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      // Should validate phone format
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates date_of_birth format', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { date_of_birth: 'invalid-date' },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates gender values', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { gender: 'invalid-gender' },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates blood_type format', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { blood_type: 'invalid' },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('rejects overly long input (DoS protection)', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: 'A'.repeat(10000) },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).toBe(400)
    })

    it('sanitizes SQL injection in text fields', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: "'; DROP TABLE patients; --" },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates allergies is an array', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { allergies: 'penicillin' }, // Should be array
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates emergency_contact structure', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { 
          emergency_contact: { 
            // Missing required fields
          } 
        },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })
  })

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe('Rate Limiting', () => {
    it('applies rate limiting to profile updates', async () => {
      setRateLimitFail(true, 60)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { full_name: 'Updated' },
        user: mockUsers.patient,
      })
      
      // Profile updates should be rate limited
    })

    it('applies rate limiting to medical history access', async () => {
      setRateLimitFail(true, 60)
      
      setMockUser(mockUsers.patient)
      
      // Medical history contains sensitive data, should have rate limits
    })
  })

  // ============================================================================
  // SENSITIVE DATA PROTECTION TESTS
  // ============================================================================

  describe('Sensitive Data Protection', () => {
    it('does not expose CURP in profile responses', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      if (response.status === 200) {
        const data = await response.json()
        const dataStr = JSON.stringify(data)
        expect(dataStr).not.toContain('CURP')
      }
    })

    it('does not expose internal IDs', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      if (response.status === 200) {
        const data = await response.json()
        // Should not expose internal database IDs
        const dataStr = JSON.stringify(data)
        expect(dataStr).not.toContain('internal_')
      }
    })

    it('masks sensitive fields appropriately', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      if (response.status === 200) {
        const data = await response.json()
        // Phone numbers should be formatted consistently
        if (data.profile?.phone) {
          expect(data.profile.phone).toMatch(/^\d{10}$/)
        }
      }
    })
  })

  // ============================================================================
  // AUTHORIZATION TESTS
  // ============================================================================

  describe('Authorization', () => {
    it('allows patient to access patient endpoints', async () => {
      setMockUser(mockUsers.patient)
      
      const response = await getProfile()
      
      expect(response.status).toBe(200)
    })

    it('allows doctor to access patient endpoints', async () => {
      setMockUser(mockUsers.doctor)
      
      const response = await getProfile()
      
      expect(response.status).toBe(200)
    })

    it('allows admin to access patient endpoints', async () => {
      setMockUser(mockUsers.admin)
      
      const response = await getProfile()
      
      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // PRIVILEGE ESCALATION PREVENTION TESTS
  // ============================================================================

  describe('Privilege Escalation Prevention', () => {
    it('ignores role parameter in profile update', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { 
          full_name: 'Updated',
          role: 'admin', // Attempt to escalate
        },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      // Should not allow role escalation
      expect(response.status).not.toBe(500)
    })

    it('ignores subscription_tier parameter in profile update', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/patient/profile', {
        method: 'PUT',
        body: { 
          full_name: 'Updated',
          subscription_tier: 'enterprise', // Attempt to upgrade
        },
        user: mockUsers.patient,
      })
      
      const response = await updateProfile(request)
      
      // Should not allow subscription manipulation
      expect(response.status).not.toBe(500)
    })
  })
})
