import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, mockStripePaymentIntent, mockStripePaymentIntentSucceeded, createMockAppointment } from '@/lib/__tests__/mocks'

// Mock hoisted al top del archivo - una sola vez
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
}))

vi.mock('@/lib/notifications', () => ({
  sendAppointmentConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendAppointmentConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
  getPatientPhone: vi.fn().mockResolvedValue('+5215551234567'),
  getDoctorName: vi.fn().mockResolvedValue('Dr. Test'),
}))

vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    getDoctorProfile: vi.fn().mockResolvedValue(null),
    setDoctorProfile: vi.fn().mockResolvedValue(undefined),
    getAppointmentAvailability: vi.fn().mockResolvedValue(null),
    setAppointmentAvailability: vi.fn().mockResolvedValue(undefined),
  },
}))

// Importar después de los mocks
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Booking Flow', () => {
    it('should complete full booking: discover → reserve → pay → confirm', async () => {
      const mockAppointment = createMockAppointment({ id: 'appointment-1', patient_id: 'patient-1', doctor_id: 'doctor-1' })
      
      // Helper para crear el mock de eq encadenable
      const createChainableEq = (singleResult: unknown) => {
        const eqMock = vi.fn()
        const chain = {
          eq: eqMock,
          single: vi.fn().mockResolvedValue(singleResult),
        }
        eqMock.mockReturnValue(chain)
        return chain
      }

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'availability_rules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ 
                  data: [
                    { id: 'rule-1', doctor_id: 'doctor-1', day_of_week: 3, start_time: '09:00', end_time: '17:00' }
                  ], 
                  error: null 
                }),
              }),
            }),
          }
        }
        if (table === 'doctores') {
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
                      video_enabled: false,
                      doctor_specialties: [],
                      profiles: { id: 'dp-1', full_name: 'Dr. Test', photo_url: null },
                      doctor_subscriptions: [{ status: 'active', current_period_end: '2026-01-01' }],
                    }], 
                    error: null 
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'appointments') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
              }),
            }),
            select: vi.fn().mockReturnValue(
              createChainableEq({ 
                data: { 
                  ...mockAppointment, 
                  doctor: { price_cents: 50000, currency: 'MXN' }
                }, 
                error: null 
              })
            ),
            update: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
              }),
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        if (table === 'payments') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'payment-1' }, error: null }),
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
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      const mockedCreateServiceClient = vi.mocked(createServiceClient)
      mockedCreateServiceClient.mockReturnValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createServiceClient>)

      const mockedStripe = vi.mocked(stripe)
      mockedStripe.paymentIntents.create = vi.fn().mockResolvedValue(mockStripePaymentIntent)
      mockedStripe.paymentIntents.retrieve = vi.fn().mockResolvedValue(mockStripePaymentIntentSucceeded)

      const { discoverDoctors } = await import('@/lib/discovery')
      const { reserveAppointmentSlot } = await import('@/lib/booking')
      const { initializePayment, confirmSuccessfulPayment } = await import('@/lib/payment')

      const step1Doctors = await discoverDoctors()
      expect(Array.isArray(step1Doctors)).toBe(true)

      const step2Result = await reserveAppointmentSlot({
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        date: '2025-12-31',
        time: '09:30',
      })
      expect(step2Result.success).toBe(true)

      if (step2Result.appointment) {
        const step3Result = await initializePayment({
          appointmentId: step2Result.appointment.id,
          userId: 'patient-1',
        })
        expect(step3Result.clientSecret).toBeDefined()

        const step4Result = await confirmSuccessfulPayment(
          mockStripePaymentIntent.id,
          step2Result.appointment.id
        )
        expect(step4Result.success).toBe(true)
      }
    })

    it('should handle booking failure gracefully', async () => {
      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'availability_rules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ 
                  data: [
                    { id: 'rule-1', doctor_id: 'doctor-1', day_of_week: 3, start_time: '09:00', end_time: '17:00' }
                  ], 
                  error: null 
                }),
              }),
            }),
          }
        }
        if (table === 'appointments') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: null, 
                  error: { message: 'Slot unavailable' } 
                }),
              }),
            }),
          }
        }
        if (table === 'doctor_schedules') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }
        }
        if (table === 'schedule_exceptions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }
        }
        return mockSupabaseClient.from(table)
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      const { reserveAppointmentSlot } = await import('@/lib/booking')

      const result = await reserveAppointmentSlot({
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        date: '2025-12-31',
        time: '09:30',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Booking with Different Payment Methods', () => {
    it('should handle Stripe payment method', async () => {
      // Helper para crear el mock de eq encadenable
      const createChainableEq = (singleResult: unknown) => {
        const eqMock = vi.fn()
        const chain = {
          eq: eqMock,
          single: vi.fn().mockResolvedValue(singleResult),
        }
        eqMock.mockReturnValue(chain)
        return chain
      }

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'appointments') {
          return {
            select: vi.fn().mockReturnValue(
              createChainableEq({ 
                data: { 
                  ...createMockAppointment(), 
                  id: 'appointment-1',
                  patient_id: 'patient-1',
                  doctor_id: 'doctor-1',
                  doctor: { price_cents: 50000, currency: 'MXN' }
                }, 
                error: null 
              })
            ),
          }
        }
        if (table === 'payments') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'payment-1' }, error: null }),
              }),
            }),
          }
        }
        return mockSupabaseClient.from(table)
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      const mockedStripe = vi.mocked(stripe)
      mockedStripe.paymentIntents.create = vi.fn().mockResolvedValue(mockStripePaymentIntent)

      const { initializePayment } = await import('@/lib/payment')

      const result = await initializePayment({
        appointmentId: 'appointment-1',
        userId: 'patient-1',
      })

      expect(result.clientSecret).toBeDefined()
    })
  })

  describe('Booking Cancellation Flow', () => {
    it('should cancel appointment and release slot', async () => {
      const mockAppointment = createMockAppointment({ status: 'cancelled', doctor_id: 'doctor-1', start_ts: new Date().toISOString(), end_ts: new Date(Date.now() + 3600000).toISOString() })

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'appointments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
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
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  lte: vi.fn().mockResolvedValue({ error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
              }),
            }),
          }
        }
        return mockSupabaseClient.from(table)
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      const { handlePaymentFailure } = await import('@/lib/payment')

      const result = await handlePaymentFailure('appointment-1', 'Patient cancelled')

      expect(result.success).toBe(true)
    })
  })
})
