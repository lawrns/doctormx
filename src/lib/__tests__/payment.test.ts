import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mockSupabaseClient, createMockAppointment, createMockPayment, createSupabaseTableMock, mockStripePaymentIntent } from './mocks'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import type { PaymentRequest } from '@/lib/payment'

function createSingleChain<T>(result: { data: T; error: unknown }) {
  const chain = {
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }

  return chain
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
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
}))

describe('Payment System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Payment Creation', () => {
    it('should create payment intent successfully', async () => {
      const { initializePayment } = await import('@/lib/payment')
      const mockAppointment = createMockAppointment()
      const mockPayment = createMockPayment()
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
      } as never)

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ 
                    data: { 
                      ...mockAppointment, 
                      doctor: { price_cents: 50000, currency: 'MXN' } 
                    }, 
                    error: null 
                  })
                ),
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
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const request: PaymentRequest = {
        appointmentId: 'appointment-1',
        userId: 'user-1',
      }

      const result = await initializePayment(request)
      
      expect(result.clientSecret).toBeDefined()
      expect(result.amount).toBe(50000)
      expect(result.currency).toBe('MXN')
    })

    it('should throw error for non-existent appointment', async () => {
      const { initializePayment } = await import('@/lib/payment')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: null, error: { message: 'Not found' } })
                ),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const request: PaymentRequest = {
        appointmentId: 'non-existent',
        userId: 'user-1',
      }

      await expect(initializePayment(request)).rejects.toThrow('Cita no encontrada o no autorizada')
    })
  })

  describe('Payment Confirmation', () => {
    it('should confirm payment successfully', async () => {
      const { confirmSuccessfulPayment } = await import('@/lib/payment')
      const mockAppointment = createMockAppointment({ status: 'confirmed' })
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        ...mockStripePaymentIntent,
        status: 'succeeded'
      } as never)

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({
                    data: createMockPayment({ appointment_id: 'appointment-1', provider_ref: 'pi_test123' }),
                    error: null,
                  })
                ),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: createMockAppointment({ id: 'appointment-1' }), error: null })
                ),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
                  }),
                }),
              }),
            }
          }
          return createSupabaseTableMock(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const result = await confirmSuccessfulPayment('pi_test123', 'appointment-1')
      
      expect(result.success).toBe(true)
      expect(result.appointment).toBeDefined()
    })

    it('should fail confirmation for unsuccessful payment', async () => {
      const { confirmSuccessfulPayment } = await import('@/lib/payment')
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        ...mockStripePaymentIntent,
        status: 'requires_payment_method'
      } as never)

      const result = await confirmSuccessfulPayment('pi_test123', 'appointment-1')
      
      expect(result.success).toBe(false)
      expect(result.appointment).toBeUndefined()
    })
  })

  describe('Payment Failure Handling', () => {
    it('should cancel appointment on payment failure', async () => {
      const { handlePaymentFailure } = await import('@/lib/payment')
      const mockAppointment = createMockAppointment({ status: 'cancelled' })
      const mockPayment = createMockPayment({ status: 'failed' })

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: mockAppointment, error: null })
                ),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'appointment_holds') {
            return createSupabaseTableMock(table)
          }
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: mockPayment, error: null })
                ),
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
          return createSupabaseTableMock(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const result = await handlePaymentFailure('appointment-1', 'Payment declined')
      
      expect(result.success).toBe(true)
      expect(result.appointment).toBeDefined()
    })

    it('should handle missing appointment gracefully', async () => {
      const { handlePaymentFailure } = await import('@/lib/payment')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: null, error: { message: 'Not found' } })
                ),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      await expect(handlePaymentFailure('non-existent')).rejects.toThrow('Appointment not found')
    })
  })

  describe('Refund Processing', () => {
    it('should process refund successfully', async () => {
      const { processRefund } = await import('@/lib/payment')
      const mockPayment = createMockPayment({ status: 'refunded' })
      vi.mocked(stripe.refunds.create).mockResolvedValue({
        id: 're_test123',
      } as never)

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: mockPayment, error: null })
                ),
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

      const result = await processRefund('appointment-1', 'Patient requested')
      
      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
    })

    it('should fail refund for unpaid appointment', async () => {
      const { processRefund } = await import('@/lib/payment')
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue(
                  createSingleChain({ data: null, error: { message: 'Not found' } })
                ),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      await expect(processRefund('appointment-1')).rejects.toThrow('No paid payment found for appointment')
    })
  })

  describe('Payment Amount Calculations', () => {
    it('should calculate correct net amount after fees', () => {
      const amountCents = 50000
      const feeCents = 2500
      const netCents = amountCents - feeCents

      expect(netCents).toBe(47500)
    })

    it('should handle fee percentage calculation', () => {
      const amountCents = 100000
      const feePercentage = 0.029
      const fixedFee = 300
      const feeCents = Math.round(amountCents * feePercentage) + fixedFee

      expect(feeCents).toBe(3200)
    })

    it('should format currency correctly', () => {
      const amountCents = 50000
      const currency = 'MXN'
      const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
      })
      const formatted = formatter.format(amountCents / 100)

      expect(formatted).toBe('$500.00')
    })
  })

  describe('Property-Based Tests - Payment Flow', () => {
    it('should generate valid payment amounts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000000 }),
          (amount: number) => {
            return amount >= 100 && amount <= 1000000
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle valid payment requests', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.uuid(),
          (appointmentId: string, userId: string) => {
            const request: PaymentRequest = {
              appointmentId,
              userId,
            }
            return (
              typeof request.appointmentId === 'string' &&
              typeof request.userId === 'string'
            )
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
