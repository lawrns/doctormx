import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, mockStripePaymentIntent, mockStripePaymentIntentSucceeded, createMockAppointment } from '@/lib/__tests__/mocks'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

vi.mock('stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue(mockStripePaymentIntent),
      retrieve: vi.fn().mockResolvedValue(mockStripePaymentIntentSucceeded),
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
}))

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Booking Flow', () => {
    it('should complete full booking: discover → reserve → pay → confirm', async () => {
      const mockAppointment = createMockAppointment()
      
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
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { 
                      ...mockAppointment, 
                      doctor: { price_cents: 50000, currency: 'MXN' }
                    }, 
                    error: null 
                  }),
                }),
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
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
        createServiceClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const { reserveAppointmentSlot } = await import('@/lib/booking')
      const { initializePayment } = await import('@/lib/payment')
      const { confirmSuccessfulPayment } = await import('@/lib/payment')
      const { discoverDoctors } = await import('@/lib/discovery')

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
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
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
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

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
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { 
                      ...createMockAppointment(), 
                      doctor: { price_cents: 50000, currency: 'MXN' }
                    }, 
                    error: null 
                  }),
                }),
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
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

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
      const mockAppointment = createMockAppointment({ status: 'cancelled' })

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
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
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const { handlePaymentFailure } = await import('@/lib/payment')

      const result = await handlePaymentFailure('appointment-1', 'Patient cancelled')

      expect(result.success).toBe(true)
    })
  })
})
