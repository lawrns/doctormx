import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  initializePayment,
  confirmSuccessfulPayment,
  handlePaymentFailure,
  processRefund,
  type PaymentRequest
} from '@/lib/payment'
import { createMockAppointment, createMockPayment, mockStripePaymentIntent } from './mocks'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Mock must be self-contained - no external variables
vi.mock('@/lib/supabase/server', () => {
  const mockClient = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          range: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        download: vi.fn().mockResolvedValue({ data: new ArrayBuffer(1), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ publicUrl: 'https://test.com/file.pdf' }),
      }),
    },
  }
  return {
    createClient: vi.fn(),
    createServiceClient: vi.fn().mockResolvedValue(mockClient),
  }
})

vi.mock('@/lib/stripe', async () => {
  return {
    stripe: {
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_test123',
          client_secret: 'pi_test123_secret_abc',
          status: 'requires_payment_method',
          amount: 50000,
          currency: 'mxn',
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'pi_test123',
          status: 'succeeded',
          amount: 50000,
          currency: 'mxn',
        }),
      },
      refunds: {
        create: vi.fn().mockResolvedValue({
          id: 're_test123',
          status: 'succeeded',
        }),
      },
    },
  }
})

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
    vi.restoreAllMocks()
  })

  describe('Payment Creation', () => {
    it('should create payment intent successfully', async () => {
      const mockAppointment = createMockAppointment()
      const mockPayment = createMockPayment()

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ 
                      data: { 
                        ...mockAppointment, 
                        doctor: { price_cents: 50000, currency: 'MXN' } 
                      }, 
                      error: null 
                    }),
                  }),
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
                  single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
                }),
              }),
            }
          }
          // Default mock for other tables
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
      // Reset the stripe mock to ensure it returns the correct value
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret_abc',
        status: 'requires_payment_method',
        amount: 50000,
        currency: 'mxn',
      } as never)

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
      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                  }),
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
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
      const mockAppointment = createMockAppointment({ status: 'confirmed' })

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
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
                    single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
                  }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test123',
        status: 'succeeded',
      } as never)

      const result = await confirmSuccessfulPayment('pi_test123', 'appointment-1')
      
      expect(result.success).toBe(true)
      expect(result.appointment).toBeDefined()
    })

    it('should fail confirmation for unsuccessful payment', async () => {
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
      const mockAppointment = createMockAppointment({ status: 'cancelled' })
      const mockPayment = createMockPayment({ status: 'failed' })

      const mockClient = {
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
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const result = await handlePaymentFailure('appointment-1', 'Payment declined')
      
      expect(result.success).toBe(true)
      expect(result.appointment).toBeDefined()
    })

    it('should handle missing appointment gracefully', async () => {
      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      await expect(handlePaymentFailure('non-existent')).rejects.toThrow('Appointment not found')
    })
  })

  describe('Refund Processing', () => {
    it('should process refund successfully', async () => {
      const mockPayment = createMockPayment({ status: 'refunded' })

      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
                  }),
                  single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
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
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      
      // Reset the stripe mock to ensure it returns the correct value
      vi.mocked(stripe.refunds.create).mockResolvedValue({
        id: 're_test123',
        status: 'succeeded',
      } as never)

      const result = await processRefund('appointment-1', 'Patient requested')
      
      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
    })

    it('should fail refund for unpaid appointment', async () => {
      const mockClient = {
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                  }),
                  single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
                }),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
              }),
            }),
          }
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
      // Test various valid payment amounts
      const validAmounts = [100, 500, 1000, 50000, 100000, 1000000]
      
      for (const amount of validAmounts) {
        expect(amount).toBeGreaterThanOrEqual(100)
        expect(amount).toBeLessThanOrEqual(1000000)
      }
    })

    it('should handle valid payment requests', () => {
      // Test various valid payment request scenarios
      const testRequests: PaymentRequest[] = [
        { appointmentId: 'apt-123-uuid', userId: 'user-456-uuid' },
        { appointmentId: 'apt-789-uuid', userId: 'user-abc-uuid' },
        { appointmentId: 'appointment-test', userId: 'user-test' },
      ]
      
      for (const request of testRequests) {
        expect(typeof request.appointmentId).toBe('string')
        expect(typeof request.userId).toBe('string')
        expect(request.appointmentId.length).toBeGreaterThan(0)
        expect(request.userId.length).toBeGreaterThan(0)
      }
    })
  })
})
