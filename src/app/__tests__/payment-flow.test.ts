import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, mockStripePaymentIntent, mockStripePaymentIntentSucceeded, mockStripeRefund, createMockAppointment, createMockPayment } from '@/lib/__tests__/mocks'

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
    refunds: {
      create: vi.fn().mockResolvedValue(mockStripeRefund),
    },
  },
}))

vi.mock('@/lib/notifications', () => ({
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendPaymentReceipt: vi.fn().mockResolvedValue({ success: true }),
}))

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

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
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
              update: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockAppointment, error: null }),
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
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

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

      const result = await handlePaymentFailure('appointment-1', 'Card declined')

      expect(result.success).toBe(true)
    })
  })

  describe('Refund Flow', () => {
    it('should process full refund', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: createMockPayment(), error: null }),
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

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('appointment-1', 'Patient requested refund')

      expect(result.success).toBe(true)
      expect(result.refund).toBeDefined()
    })

    it('should reject refund for unpaid appointment', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
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
        }),
      }

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const { processRefund } = await import('@/lib/payment')

      await expect(processRefund('appointment-1')).rejects.toThrow('No paid payment found for appointment')
    })
  })

  describe('Payment Status Transitions', () => {
    it('should transition from pending to paid', async () => {
      const mockClient = {
        ...mockSupabaseClient,
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
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: createMockAppointment({ status: 'confirmed' }), error: null }),
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

      const { confirmSuccessfulPayment } = await import('@/lib/payment')

      const result = await confirmSuccessfulPayment('pi_test', 'appointment-1')

      expect(result.success).toBe(true)
    })

    it('should transition from paid to refunded', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'payments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: createMockPayment({ status: 'paid' }), error: null }),
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

      vi.mock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue(mockClient),
      }))

      const { processRefund } = await import('@/lib/payment')

      const result = await processRefund('appointment-1', 'Customer request')

      expect(result.success).toBe(true)
    })
  })

  describe('Multi-currency Support', () => {
    it('should handle MXN currency', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { 
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

      expect(result.currency).toBe('MXN')
    })

    it('should handle USD currency', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: { 
                      doctor: { price_cents: 2500, currency: 'USD' }
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

      expect(result.currency).toBe('USD')
    })
  })
})
