import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, mockStripePaymentIntent, mockStripePaymentIntentSucceeded, mockStripeRefund, createMockAppointment, createMockPayment, createSupabaseTableMock } from '@/lib/__tests__/mocks'

function createEqSingleChain<T>(result: { data: T; error: unknown }) {
  return {
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
      single: vi.fn().mockResolvedValue(result),
    }),
  }
}

function createDeleteRangeChain() {
  return {
    eq: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }
}

function createUpdateSelectSingleChain<T>(result: { data: T; error: unknown }) {
  return {
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue(mockStripePaymentIntent),
      retrieve: vi.fn().mockResolvedValue(mockStripePaymentIntentSucceeded),
    },
    refunds: {
      create: vi.fn().mockResolvedValue(mockStripeRefund),
    },
  },
  createPaymentIntent: vi.fn(async () => mockStripePaymentIntent),
  verifyPayment: vi.fn(async () => true),
}))

vi.mock('@/lib/notifications', () => ({
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
  sendReceiptEmail: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
  sendReceiptWhatsApp: vi.fn().mockResolvedValue({ success: true }),
  getPatientPhone: vi.fn().mockResolvedValue('+525511111111'),
  getDoctorName: vi.fn().mockResolvedValue('Dr. Test'),
}))

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Payment Flow', () => {
    it('should complete full payment: initialize → confirm → receipt', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockPayment = createMockPayment()
      const mockAppointment = createMockAppointment({ status: 'confirmed' })

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: createMockAppointment({ id: 'appointment-1' }),
                    error: null,
                  }),
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
              }),
              update: vi.fn().mockReturnValue(createUpdateSelectSingleChain({ data: mockAppointment, error: null })),
            }
          }
          if (table === 'payments') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
                }),
              }),
            }
          }
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { email: 'patient@test.com', full_name: 'Paciente Test' },
                    error: null,
                  }),
                }),
              }),
            }
          }
          return createSupabaseTableMock(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const stripeModule = await import('@/lib/stripe')
      vi.mocked(stripeModule.stripe.paymentIntents.create).mockResolvedValue(mockStripePaymentIntent as never)
      vi.mocked(stripeModule.stripe.paymentIntents.retrieve).mockResolvedValue(mockStripePaymentIntentSucceeded as never)

      const { initializePayment } = await import('@/lib/payment')
      const { confirmSuccessfulPayment } = await import('@/lib/payment')

      const step1Result = await initializePayment({
        appointmentId: 'appointment-1',
        userId: 'patient-1',
      })

      expect(step1Result.clientSecret).toBeDefined()
      expect(step1Result.amount).toBe(50000)
      expect(step1Result.currency).toBe('MXN')

      const step2Result = await confirmSuccessfulPayment(
        mockStripePaymentIntent.id,
        'appointment-1'
      )

      expect(step2Result.success).toBe(true)
      expect(step2Result.appointment).toBeDefined()
    })

    it('should handle payment failure scenario', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockAppointment = createMockAppointment({ status: 'cancelled' })
      const mockPayment = createMockPayment({ status: 'failed' })

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
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'appointment_holds') {
            return createSupabaseTableMock(table)
          }
          if (table === 'slot_locks') {
            return {
              delete: vi.fn().mockReturnValue(createDeleteRangeChain()),
            }
          }
          return createSupabaseTableMock(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { handlePaymentFailure } = await import('@/lib/payment')

      const result = await handlePaymentFailure('appointment-1', 'Card declined')

      expect(result.success).toBe(true)
    })
  })

  describe('Refund Flow', () => {
    it('should process full refund', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: createMockPayment(), error: null }),
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
                  single: vi.fn().mockResolvedValue({ data: { id: 'refund-1' }, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const stripeModule = await import('@/lib/stripe')
      vi.mocked(stripeModule.stripe.refunds.create).mockResolvedValue(mockStripeRefund as never)

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('appointment-1', 'Patient requested refund')

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
    })

    it('should reject refund for unpaid appointment', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { processRefund } = await import('@/lib/payment')

      await expect(processRefund('appointment-1')).rejects.toThrow('No paid payment found for appointment')
    })
  })

  describe('Payment Status Transitions', () => {
    it('should transition from pending to paid', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: createMockPayment({ appointment_id: 'appointment-1', provider_ref: 'pi_test123' }),
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: createMockAppointment({ id: 'appointment-1' }),
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue(createUpdateSelectSingleChain({ data: createMockAppointment({ status: 'confirmed' }), error: null })),
            }
          }
          return createSupabaseTableMock(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const stripeModule = await import('@/lib/stripe')
      vi.mocked(stripeModule.stripe.paymentIntents.retrieve).mockResolvedValue(mockStripePaymentIntentSucceeded as never)

      const { confirmSuccessfulPayment } = await import('@/lib/payment')

      const result = await confirmSuccessfulPayment('pi_test', 'appointment-1')

      expect(result.success).toBe(true)
    })

    it('should transition from paid to refunded', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: createMockPayment({ status: 'paid' }), error: null }),
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
                  single: vi.fn().mockResolvedValue({ data: { id: 'refund-1' }, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const stripeModule = await import('@/lib/stripe')
      vi.mocked(stripeModule.stripe.refunds.create).mockResolvedValue(mockStripeRefund as never)

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('appointment-1', 'Customer request')

      expect(result.success).toBe(true)
    })
  })

  describe('Multi-currency Support', () => {
    it('should handle MXN currency', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { 
                        doctor: { price_cents: 50000, currency: 'MXN' }
                      }, 
                      error: null 
                    }),
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

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const stripeModule = await import('@/lib/stripe')
      vi.mocked(stripeModule.stripe.paymentIntents.create).mockResolvedValue(mockStripePaymentIntent as never)

      const { initializePayment } = await import('@/lib/payment')

      const result = await initializePayment({
        appointmentId: 'appointment-1',
        userId: 'patient-1',
      })

      expect(result.currency).toBe('MXN')
    })

    it('should handle USD currency', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { 
                        doctor: { price_cents: 2500, currency: 'USD' }
                      }, 
                      error: null 
                    }),
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

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const stripeModule = await import('@/lib/stripe')
      vi.mocked(stripeModule.stripe.paymentIntents.create).mockResolvedValue({
        ...mockStripePaymentIntent,
        currency: 'usd',
      } as never)

      const { initializePayment } = await import('@/lib/payment')

      const result = await initializePayment({
        appointmentId: 'appointment-1',
        userId: 'patient-1',
      })

      expect(result.currency).toBe('USD')
    })
  })
})
