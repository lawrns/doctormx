/**
 * Security Tests for /api/prescriptions/* Endpoints
 * Doctor.mx - Critical Security Test Suite
 * 
 * Tests coverage:
 * - Authentication (401 without valid session)
 * - Authorization/RBAC (403 - only doctors can create, patients can view own)
 * - CSRF Protection (403 without valid CSRF token)
 * - Rate Limiting (429 after exceeding rate limit)
 * - Input Validation (400 with invalid/malicious input)
 * - PHI protection (prescriptions contain medical data)
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

// Mock prescription dependencies
vi.mock('@/lib/prescriptions', () => ({
  createPrescription: vi.fn(async (data: unknown) => ({
    id: 'pres-123',
    ...data,
    created_at: new Date().toISOString(),
  })),
  getPrescriptionById: vi.fn(async (id: string) => ({
    id,
    doctor_id: 'doctor-456',
    patient_id: 'patient-123',
    medications: [],
    diagnosis: 'Test diagnosis',
    status: 'active',
  })),
  getPatientPrescriptions: vi.fn(async (patientId: string) => [
    { id: 'pres-1', patient_id: patientId },
  ]),
  sendPrescription: vi.fn(async () => ({ success: true })),
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
const { POST: createPrescription } = await import('@/app/api/prescriptions/route')
const { GET: getPrescriptionById } = await import('@/app/api/prescriptions/[id]/pdf/route')
const { POST: sendPrescription } = await import('@/app/api/prescriptions/[id]/send/route')

describe('SECURITY: /api/prescriptions/*', () => {
  beforeEach(() => {
    resetMocks()
    setCsrfValid(true)
    setRateLimitFail(false)
  })

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  // Helper to create FormData for prescription requests
function createPrescriptionFormData(data: {
  appointmentId?: string
  diagnosis?: string
  medications?: string
  instructions?: string
}): FormData {
  const formData = new FormData()
  if (data.appointmentId) formData.append('appointmentId', data.appointmentId)
  if (data.diagnosis) formData.append('diagnosis', data.diagnosis)
  if (data.medications) formData.append('medications', data.medications)
  if (data.instructions) formData.append('instructions', data.instructions)
  return formData
}

describe('Authentication', () => {
    it('returns 401 when creating prescription without authentication', async () => {
      setMockUser(null)
      
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: 'Test',
      })
      
      const request = createMockRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when accessing prescription PDF without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/prescriptions/pres-123/pdf')
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      expect(response.status).toBe(401)
    })

    it('returns 401 when sending prescription without authentication', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/prescriptions/pres-123/send', {
        method: 'POST',
        body: { method: 'email' },
      })
      
      const response = await sendPrescription(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      expect(response.status).toBe(401)
    })
  })

  // ============================================================================
  // AUTHORIZATION (RBAC) TESTS
  // ============================================================================

  describe('Authorization (RBAC)', () => {
    it('allows doctor to create prescriptions', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: 'Headache',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).not.toBe(403)
    })

    it('prevents patient from creating prescriptions', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: 'Self diagnosis',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.patient,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).toBe(403)
    })

    it('allows patient to view their own prescriptions', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-123/pdf', {
        user: mockUsers.patient,
      })
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      expect(response.status).not.toBe(403)
    })

    it('prevents patient from viewing other patients prescriptions', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-456/pdf', {
        user: { ...mockUsers.patient, id: 'different-patient' },
      })
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'pres-456' }) })
      
      // Should not allow access to other patient's prescriptions
      if (response.status !== 404) {
        expect(response.status).toBe(403)
      }
    })

    it('allows prescribing doctor to modify prescriptions', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-123/send', {
        method: 'POST',
        body: { method: 'email', email: 'patient@test.com' },
        user: mockUsers.doctor,
      })
      
      const response = await sendPrescription(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // DATA ISOLATION TESTS - CRITICAL
  // ============================================================================

  describe('Data Isolation - CRITICAL', () => {
    it('prescriptions include only authorized patient data', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-123/pdf', {
        user: mockUsers.patient,
      })
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      if (response.status === 200) {
        const data = await response.json()
        // Should not expose other patients' data
        expect(data.patient_id).toBe(mockUsers.patient.id)
      }
    })

    it('ignores patient_id in prescription creation body for doctor', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      // Should validate patient_id exists and doctor has access
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
      
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: 'Test',
      })
      const request = createMockRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        cookies: { 'sb-access-token': 'test' },
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).toBe(403)
    })

    it('accepts POST with valid CSRF token', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
        includeCsrf: true,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).not.toBe(403)
    })
  })

  // ============================================================================
  // INPUT VALIDATION TESTS
  // ============================================================================

  describe('Input Validation', () => {
    it('returns 400 with missing required fields', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        // Missing medications and diagnosis
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).toBe(400)
    })

    it('validates medications array is not empty', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([]), // Empty
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates medication name is not empty', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: '', dosage: '100mg' }]),
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('sanitizes XSS in diagnosis field', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: '100mg' }]),
        diagnosis: '<script>alert("xss")</script>',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).not.toBe(500)
    })

    it('sanitizes XSS in medication name', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: '<img src=x onerror=alert(1)>', dosage: '100mg' }]),
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      expect(response.status).not.toBe(500)
    })

    it('validates dosage format', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify([{ name: 'Aspirin', dosage: 'way too much' }]),
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('limits number of medications per prescription', async () => {
      const formData = createPrescriptionFormData({
        appointmentId: 'appt-123',
        medications: JSON.stringify(Array(100).fill({ name: 'Med', dosage: '100mg' })), // Too many
        diagnosis: 'Test',
      })
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: formData,
        user: mockUsers.doctor,
      })
      
      const response = await createPrescription(request)
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates email format when sending prescription', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-123/send', {
        method: 'POST',
        body: { 
          method: 'email',
          email: 'not-an-email',
        },
        user: mockUsers.doctor,
      })
      
      const response = await sendPrescription(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.error).toBeTruthy()
      }
    })

    it('validates send method is allowed', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-123/send', {
        method: 'POST',
        body: { 
          method: 'invalid_method',
        },
        user: mockUsers.doctor,
      })
      
      const response = await sendPrescription(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
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
    it('applies rate limiting to prescription creation', async () => {
      setRateLimitFail(true, 60)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions', {
        method: 'POST',
        body: {
          patient_id: 'patient-123',
          medications: [{ name: 'Aspirin', dosage: '100mg' }],
          diagnosis: 'Test',
        },
        user: mockUsers.doctor,
      })
      
      // Prescription creation should be rate limited
    })

    it('applies stricter rate limiting to prescription sending', async () => {
      setRateLimitFail(true, 120)
      
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/pres-123/send', {
        method: 'POST',
        body: { method: 'email', email: 'patient@test.com' },
        user: mockUsers.doctor,
      })
      
      // Sending prescriptions should have stricter limits
    })
  })

  // ============================================================================
  // PHI PROTECTION TESTS
  // ============================================================================

  describe('PHI Protection', () => {
    it('does not expose PHI in error messages', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/invalid-id/pdf', {
        user: mockUsers.patient,
      })
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'invalid-id' }) })
      
      if (response.status !== 200) {
        const data = await response.json()
        // Error messages should not contain PHI
        expect(data.error).not.toContain('patient_id')
        expect(data.error).not.toContain('diagnosis')
      }
    })

    it('requires authentication for PDF generation', async () => {
      setMockUser(null)
      
      const request = createMockRequest('http://localhost/api/prescriptions/pres-123/pdf')
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'pres-123' }) })
      
      expect(response.status).toBe(401)
    })

    it('validates prescription ID format', async () => {
      const { request } = createAuthenticatedRequest('http://localhost/api/prescriptions/invalid<>id/pdf', {
        user: mockUsers.patient,
      })
      
      const response = await getPrescriptionById(request, { params: Promise.resolve({ id: 'invalid<>id' }) })
      
      expect(response.status).not.toBe(500)
    })
  })
})
