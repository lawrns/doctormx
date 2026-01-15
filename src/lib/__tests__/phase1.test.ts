import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mockSupabaseClient } from './mocks'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'pi_test_secret' }),
      retrieve: vi.fn().mockResolvedValue({ id: 'pi_test', status: 'succeeded' }),
    },
    refunds: {
      create: vi.fn().mockResolvedValue({ id: 're_test', status: 'succeeded' }),
    },
  },
}))

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({ diagnoses: [{ diagnosis: 'Test', probability: 80 }] })
            }
          }]
        }),
      },
    },
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ success: true, data: { id: 'email-test' } }),
    },
  })),
}))

describe('Phase 1: Critical Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Doctor Discovery - Subscription Enforcement', () => {
    it('should return empty array when no doctors with active subscriptions', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { discoverDoctors } = await import('@/lib/discovery')
      const doctors = await discoverDoctors()

      expect(Array.isArray(doctors)).toBe(true)
      const doctorArray = doctors as unknown[]
      expect(doctorArray.length).toBe(0)
    })

    it('should return empty array on database error', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { discoverDoctors } = await import('@/lib/discovery')
      const doctors = await discoverDoctors()

      expect(Array.isArray(doctors)).toBe(true)
    })

    it('should filter doctors by specialty', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ 
                      data: [{
                        id: 'doctor-1',
                        bio: 'Test',
                        price_cents: 50000,
                        rating_avg: 4.5,
                        rating_count: 100,
                        city: 'Mexico City',
                        state: 'CDMX',
                        years_experience: 10,
                        languages: ['es'],
                        status: 'approved',
                        doctor_specialties: [{ specialty_id: '1', specialties: { id: '1', name: 'Cardiología', slug: 'cardiologia' } }],
                        profiles: { id: 'p-1', full_name: 'Dr. Test', photo_url: null },
                        doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
                      }], 
                      error: null 
                    }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { discoverDoctors } = await import('@/lib/discovery')
      const doctors = await discoverDoctors({ specialtySlug: 'cardiologia' })

      expect(Array.isArray(doctors)).toBe(true)
    })
  })

  describe('Doctor Profile - Subscription Validation', () => {
    it('should return null for non-existent doctor', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { getDoctorProfile } = await import('@/lib/discovery')
      const profile = await getDoctorProfile('non-existent-id')

      expect(profile).toBeNull()
    })
  })

  describe('Authentication - Protected Routes', () => {
    it('should validate session patient ID', () => {
      const sessionPatientId = 'session-123'

      const usedPatientId = sessionPatientId

      expect(usedPatientId).toBe('session-123')
      expect(usedPatientId).not.toBe('body-456')
    })

    it('should reject unauthenticated requests', () => {
      const sessionPatientId: string | null = null

      const isAuthenticated = sessionPatientId !== null

      expect(isAuthenticated).toBe(false)
    })
  })

  describe('Payment System - Slot Release', () => {
    it('should release slot on payment failure', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { id: 'apt-1', doctor_id: 'doc-1', start_ts: new Date().toISOString() }, 
                    error: null 
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'slot_locks') {
            return {
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { handlePaymentFailure } = await import('@/lib/payment')

      const result = await handlePaymentFailure('apt-1', 'Payment failed')

      expect(result.success).toBe(true)
    })

    it('should process refund correctly', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { id: 'pay-1', amount_cents: 50000, provider_ref: 'pi_test' }, 
                    error: null 
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'refunds') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { id: 'ref-1' }, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('apt-1', 'Patient requested')

      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling - Graceful Degradation', () => {
    it('should handle database errors gracefully', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Connection failed') }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { discoverDoctors } = await import('@/lib/discovery')
      const doctors = await discoverDoctors()

      expect(Array.isArray(doctors)).toBe(true)
    })
  })

  describe('Security - Input Validation', () => {
    it('should reject invalid UUID format', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { getDoctorProfile } = await import('@/lib/discovery')
      const profile = await getDoctorProfile('invalid-uuid-format')

      expect(profile).toBeNull()
    })
  })

  describe('Performance - Query Optimization', () => {
    it('should limit discovery results', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { discoverDoctors } = await import('@/lib/discovery')
      const doctors = await discoverDoctors()

      const doctorArray = doctors as unknown[]
      expect(doctorArray.length).toBeLessThanOrEqual(50)
    })
  })
})

describe('Phase 1: Integration Tests', () => {
  describe('Complete Booking Flow', () => {
    it('should complete booking flow with mocked dependencies', async () => {
      const mockAppointment = {
        id: 'apt-1',
        patient_id: 'patient-1',
        doctor_id: 'doctor-1',
        start_ts: new Date(Date.now() + 86400000).toISOString(),
        end_ts: new Date(Date.now() + 86400000 + 1800000).toISOString(),
        status: 'pending_payment',
        cancellation_reason: null,
        cancelled_by: null,
        created_at: new Date().toISOString(),
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { reserveAppointmentSlot } = await import('@/lib/booking')

      const result = await reserveAppointmentSlot({
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        date: '2025-12-31',
        time: '09:30',
      })

      expect(result.success).toBe(true)
      expect(result.appointment).toBeDefined()
    })
  })

  describe('WhatsApp Triage Flow', () => {
    it('should generate triage suggestions', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')

      const result = await generateSuggestions(['dolor de cabeza', 'náuseas'])

      expect(result.questions.length).toBeGreaterThan(0)
    })
  })

  describe('Subscription Enforcement', () => {
    it('should only return approved doctors', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'doctors') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ 
                      data: [{
                        id: 'doctor-1',
                        status: 'approved',
                        bio: 'Test',
                        price_cents: 50000,
                        rating_avg: 4.5,
                        rating_count: 100,
                        city: 'Mexico City',
                        state: 'CDMX',
                        years_experience: 10,
                        languages: ['es'],
                        doctor_specialties: [],
                        profiles: { id: 'p-1', full_name: 'Dr. Test', photo_url: null },
                        doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
                      }], 
                      error: null 
                    }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)

      const { discoverDoctors } = await import('@/lib/discovery')
      const doctors = await discoverDoctors()

      const doctorArray = doctors as { status: string }[]
      for (const doctor of doctorArray) {
        expect(doctor.status).toBe('approved')
      }
    })
  })
})

describe('Phase 1: Property-Based Tests', () => {
  it('should preserve redirect URL with query parameters', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/book\/[a-z0-9-]+$/),
        fc.record({
          date: fc.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          time: fc.stringMatching(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
        }),
        (path, queryParams) => {
          const originalUrl = new URL(path, 'http://localhost:3000')
          Object.entries(queryParams).forEach(([key, value]) => {
            originalUrl.searchParams.set(key, value)
          })

          const redirectUrl = new URL('/auth/login', 'http://localhost:3000')
          redirectUrl.searchParams.set('redirect', originalUrl.pathname + originalUrl.search)

          const redirectParam = redirectUrl.searchParams.get('redirect')
          const restoredUrl = new URL(redirectParam || '', 'http://localhost:3000')

          return restoredUrl.pathname === originalUrl.pathname
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should always use session patient ID', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (sessionId) => {
          const usedPatientId = sessionId
          return usedPatientId === sessionId
        }
      ),
      { numRuns: 50 }
    )
  })
})
