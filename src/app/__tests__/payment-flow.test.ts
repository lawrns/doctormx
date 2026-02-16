import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, mockStripePaymentIntent, mockStripePaymentIntentSucceeded, mockStripeRefund, createMockAppointment, createMockPayment } from '@/lib/__tests__/mocks'

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
    refunds: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/notifications', () => ({
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
  getPatientPhone: vi.fn().mockResolvedValue('+5215551234567'),
  getDoctorName: vi.fn().mockResolvedValue('Dr. Test'),
}))

// Importar después de los mocks
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete Payment Flow', () => {
    it('should complete full payment: initialize → confirm → receipt', async () => {
      const mockPayment = createMockPayment()
      const mockAppointment = createMockAppointment({ status: 'confirmed' })

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
                  id: 'appointment-1',
                  doctor_id: 'doctor-1',
                  patient_id: 'patient-1',
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
                single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
            select: vi.fn().mockReturnValue(
              createChainableEq({ data: mockPayment, error: null })
            ),
          }
        }
        return mockSupabaseClient.from(table)
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      // Mock stripe payment intent
      const mockedStripe = vi.mocked(stripe)
      mockedStripe.paymentIntents.create = vi.fn().mockResolvedValue(mockStripePaymentIntent)
      mockedStripe.paymentIntents.retrieve = vi.fn().mockResolvedValue(mockStripePaymentIntentSucceeded)

      const { initializePayment, confirmSuccessfulPayment } = await import('@/lib/payment')

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
      const mockAppointment = createMockAppointment({ status: 'cancelled', doctor_id: 'doctor-1', start_ts: new Date().toISOString(), end_ts: new Date(Date.now() + 3600000).toISOString() })
      const mockPayment = createMockPayment({ status: 'failed' })

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
        return mockSupabaseClient.from(table)
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      const { handlePaymentFailure } = await import('@/lib/payment')

      const result = await handlePaymentFailure('appointment-1', 'Card declined')

      expect(result.success).toBe(true)
    })
  })

  describe('Refund Flow', () => {
    it('should process full refund', async () => {
      // Helper para crear el mock de eq encadenable con doble eq
      const createDoubleEqChain = (singleResult: unknown) => {
        const secondEqMock = vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(singleResult),
        })
        const firstEqMock = vi.fn().mockReturnValue({
          eq: secondEqMock,
        })
        return { eq: firstEqMock }
      }

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue(
              createDoubleEqChain({ data: createMockPayment({ status: 'paid', provider_ref: 'pi_test123', amount_cents: 50000 }), error: null })
            ),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        if (table === 'refunds') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'refund-1', payment_id: 'test-payment-id', amount_cents: 50000, status: 'processing', provider_ref: 're_test123', reason: 'Patient requested refund' }, error: null }),
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
      mockedStripe.refunds.create = vi.fn().mockResolvedValue(mockStripeRefund)

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('appointment-1', 'Patient requested refund')

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
    })

    it('should reject refund for unpaid appointment', async () => {
      // Helper para crear el mock de eq encadenable con doble eq
      const createDoubleEqChain = (singleResult: unknown) => {
        const secondEqMock = vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(singleResult),
        })
        const firstEqMock = vi.fn().mockReturnValue({
          eq: secondEqMock,
        })
        return { eq: firstEqMock }
      }

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue(
              createDoubleEqChain({ data: null, error: { message: 'Not found' } })
            ),
          }
        }
        return mockSupabaseClient.from(table)
      })

      const mockedCreateClient = vi.mocked(createClient)
      mockedCreateClient.mockResolvedValue({
        ...mockSupabaseClient,
        from: mockFrom,
      } as unknown as ReturnType<typeof createClient> extends Promise<infer T> ? T : never)

      const { processRefund } = await import('@/lib/payment')

      await expect(processRefund('appointment-1')).rejects.toThrow('No paid payment found for appointment')
    })
  })

  describe('Payment Status Transitions', () => {
    it('should transition from pending to paid', async () => {
      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        if (table === 'appointments') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: createMockAppointment({ status: 'confirmed' }), error: null }),
                }),
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
      mockedStripe.paymentIntents.retrieve = vi.fn().mockResolvedValue(mockStripePaymentIntentSucceeded)

      const { confirmSuccessfulPayment } = await import('@/lib/payment')

      const result = await confirmSuccessfulPayment('pi_test', 'appointment-1')

      expect(result.success).toBe(true)
    })

    it('should transition from paid to refunded', async () => {
      // Helper para crear el mock de eq encadenable con doble eq
      const createDoubleEqChain = (singleResult: unknown) => {
        const secondEqMock = vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(singleResult),
        })
        const firstEqMock = vi.fn().mockReturnValue({
          eq: secondEqMock,
        })
        return { eq: firstEqMock }
      }

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: vi.fn().mockReturnValue(
              createDoubleEqChain({ data: createMockPayment({ status: 'paid', provider_ref: 'pi_test123', amount_cents: 50000 }), error: null })
            ),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        if (table === 'refunds') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: 'refund-1', payment_id: 'test-payment-id', amount_cents: 50000, status: 'processing', provider_ref: 're_test123', reason: 'Customer request' }, error: null }),
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
      mockedStripe.refunds.create = vi.fn().mockResolvedValue(mockStripeRefund)

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('appointment-1', 'Customer request')

      expect(result.success).toBe(true)
    })
  })

  describe('Multi-currency Support', () => {
    it('should handle MXN currency', async () => {
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
                  id: 'appointment-1',
                  doctor_id: 'doctor-1',
                  patient_id: 'patient-1',
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

      expect(result.currency).toBe('MXN')
    })

    it('should handle USD currency', async () => {
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
                  id: 'appointment-1',
                  doctor_id: 'doctor-1',
                  patient_id: 'patient-1',
                  doctor: { price_cents: 2500, currency: 'USD' }
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

      const mockUsdPaymentIntent = { ...mockStripePaymentIntent, currency: 'usd' }
      const mockedStripe = vi.mocked(stripe)
      mockedStripe.paymentIntents.create = vi.fn().mockResolvedValue(mockUsdPaymentIntent)

      const { initializePayment } = await import('@/lib/payment')

      const result = await initializePayment({
        appointmentId: 'appointment-1',
        userId: 'patient-1',
      })

      expect(result.currency).toBe('USD')
    })
  })
})
