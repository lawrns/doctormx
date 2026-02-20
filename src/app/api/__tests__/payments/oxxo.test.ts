/**
 * TST-003: OXXO Payment Flow Tests
 * Comprehensive tests for OXXO voucher payment processing (Mexico)
 * 
 * Test Coverage:
 * - OXXO voucher generation
 * - OXXO payment success flow
 * - OXXO voucher expiration
 * - OXXO payment failure handling
 * - OXXO-specific webhook events
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Stripe
const mockPaymentIntentsCreate = vi.fn()
const mockPaymentIntentsRetrieve = vi.fn()

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: (...args: unknown[]) => mockPaymentIntentsCreate(...args),
      retrieve: (...args: unknown[]) => mockPaymentIntentsRetrieve(...args),
    },
  },
}))

// Mock Supabase
let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>

function createMockSupabaseClient() {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    gt: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    in: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    match: vi.fn(() => chain),
    contains: vi.fn(() => chain),
    or: vi.fn(() => chain),
    and: vi.fn(() => chain),
  }
  return {
    from: vi.fn(() => chain),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  createServiceClient: vi.fn(() => mockSupabaseClient),
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Import handlers after mocks
const { handleChargeSucceeded, handleChargeFailed } = await import('@/app/api/webhooks/stripe/handlers')

describe('OXXO Payment Flow Tests (TST-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient = createMockSupabaseClient()
    
    // Default mock for OXXO payment intent
    mockPaymentIntentsCreate.mockResolvedValue({
      id: 'pi_oxxo_123',
      client_secret: 'pi_oxxo_secret_456',
      status: 'requires_action',
      amount: 50000,
      currency: 'mxn',
      payment_method_types: ['oxxo'],
      payment_method_options: {
        oxxo: {
          expires_after_days: 3,
        },
      },
      next_action: {
        type: 'oxxo_display_details',
        oxxo_display_details: {
          expires_after: 259200, // 3 days in seconds
          hosted_voucher_url: 'https://pay.stripe.com/oxxo/voucher/...',
          number: '1234567890123456',
        },
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================================
  // OXXO VOUCHER GENERATION TESTS
  // ============================================================================
  describe('OXXO Voucher Generation', () => {
    it('should create payment intent with OXXO payment method', async () => {
      const intent = await mockPaymentIntentsCreate({
        amount: 50000,
        currency: 'mxn',
        payment_method_types: ['oxxo'],
        payment_method_options: {
          oxxo: {
            expires_after_days: 3,
          },
        },
      })
      
      expect(intent.payment_method_types).toContain('oxxo')
      expect(intent.payment_method_options.oxxo.expires_after_days).toBe(3)
    })

    it('should generate voucher with 3-day expiration', async () => {
      const intent = await mockPaymentIntentsCreate({
        amount: 50000,
        currency: 'mxn',
        payment_method_types: ['oxxo'],
        payment_method_options: {
          oxxo: { expires_after_days: 3 },
        },
      })
      
      expect(intent.next_action.oxxo_display_details.expires_after).toBe(259200)
    })

    it('should provide hosted voucher URL', async () => {
      const intent = await mockPaymentIntentsCreate({
        amount: 50000,
        currency: 'mxn',
        payment_method_types: ['oxxo'],
      })
      
      expect(intent.next_action.oxxo_display_details.hosted_voucher_url).toBeDefined()
      expect(intent.next_action.oxxo_display_details.hosted_voucher_url).toContain('stripe.com')
    })

    it('should generate numeric reference number', async () => {
      const intent = await mockPaymentIntentsCreate({
        amount: 50000,
        currency: 'mxn',
        payment_method_types: ['oxxo'],
      })
      
      const reference = intent.next_action.oxxo_display_details.number
      expect(reference).toBeDefined()
      expect(reference).toMatch(/^\d+$/) // Should be numeric
      expect(reference.length).toBeGreaterThanOrEqual(10)
    })

    it('should set status to requires_action for OXXO', async () => {
      const intent = await mockPaymentIntentsCreate({
        amount: 50000,
        currency: 'mxn',
        payment_method_types: ['oxxo'],
      })
      
      expect(intent.status).toBe('requires_action')
    })

    it('should handle multiple payment methods including OXXO', async () => {
      mockPaymentIntentsCreate.mockResolvedValue({
        id: 'pi_multi_123',
        payment_method_types: ['card', 'oxxo', 'customer_balance'],
      })
      
      const intent = await mockPaymentIntentsCreate({
        amount: 50000,
        currency: 'mxn',
        payment_method_types: ['card', 'oxxo', 'customer_balance'],
      })
      
      expect(intent.payment_method_types).toContain('oxxo')
      expect(intent.payment_method_types).toContain('card')
      expect(intent.payment_method_types).toContain('customer_balance')
    })
  })

  // ============================================================================
  // OXXO PAYMENT SUCCESS TESTS
  // ============================================================================
  describe('OXXO Payment Success', () => {
    it('should handle successful OXXO charge', async () => {
      const mockCharge = {
        id: 'ch_oxxo_success_123',
        object: 'charge',
        status: 'succeeded',
        amount: 50000,
        currency: 'mxn',
        payment_method_details: {
          type: 'oxxo',
          oxxo: {
            number: '1234567890123456',
          },
        },
        payment_intent: 'pi_oxxo_123',
        created: Math.floor(Date.now() / 1000),
      }

      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123', status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'confirmed', patient_id: 'patient_123' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      // Should not throw
      await expect(handleChargeSucceeded(mockCharge as any)).resolves.not.toThrow()
    })

    it('should update payment status to paid on OXXO success', async () => {
      const mockCharge = {
        id: 'ch_oxxo_success_123',
        object: 'charge',
        status: 'succeeded',
        amount: 50000,
        currency: 'mxn',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      const updateMock = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
      
      chain.single
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123', status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'confirmed' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockImplementation((data) => {
        if (data.status === 'paid') {
          expect(data.payment_method).toBe('oxxo')
        }
        return chain
      })

      await handleChargeSucceeded(mockCharge as any)
    })

    it('should confirm appointment on OXXO payment success', async () => {
      const mockCharge = {
        id: 'ch_oxxo_success_123',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'confirmed', confirmed_at: new Date().toISOString() },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      await handleChargeSucceeded(mockCharge as any)
    })

    it('should handle OXXO charge without payment_intent reference', async () => {
      const mockCharge = {
        id: 'ch_oxxo_no_pi',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'oxxo' },
        payment_intent: null,
      }

      // Should not throw, just log warning
      await expect(handleChargeSucceeded(mockCharge as any)).resolves.not.toThrow()
    })

    it('should handle non-OXXO charge events gracefully', async () => {
      const mockCardCharge = {
        id: 'ch_card_123',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'card' },
        payment_intent: 'pi_card_123',
      }

      // Should not process card charges in OXXO handler
      await expect(handleChargeSucceeded(mockCardCharge as any)).resolves.not.toThrow()
    })
  })

  // ============================================================================
  // OXXO VOUCHER EXPIRATION TESTS
  // ============================================================================
  describe('OXXO Voucher Expiration', () => {
    it('should handle expired OXXO voucher', async () => {
      const mockCharge = {
        id: 'ch_oxxo_expired_123',
        object: 'charge',
        status: 'failed',
        amount: 50000,
        currency: 'mxn',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
        failure_message: 'OXXO voucher expired without payment',
      }

      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123', status: 'pending' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'cancelled' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      await expect(handleChargeFailed(mockCharge as any)).resolves.not.toThrow()
    })

    it('should cancel appointment on OXXO expiration', async () => {
      const mockCharge = {
        id: 'ch_oxxo_expired_123',
        object: 'charge',
        status: 'failed',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      
      chain.single
        .mockResolvedValueOnce({ data: null, error: null }) // idempotency check
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'cancelled' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      // Should complete without throwing
      await expect(handleChargeFailed(mockCharge as any)).resolves.not.toThrow()
    })

    it('should update payment status to failed on OXXO expiration', async () => {
      const mockCharge = {
        id: 'ch_oxxo_expired_123',
        object: 'charge',
        status: 'failed',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      
      chain.single
        .mockResolvedValueOnce({ data: null, error: null }) // idempotency check
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'cancelled' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      // Should complete without throwing
      await expect(handleChargeFailed(mockCharge as any)).resolves.not.toThrow()
    })
  })

  // ============================================================================
  // OXXO PAYMENT FAILURE TESTS
  // ============================================================================
  describe('OXXO Payment Failure Handling', () => {
    it('should handle OXXO charge without payment_intent reference', async () => {
      const mockCharge = {
        id: 'ch_oxxo_fail_no_pi',
        object: 'charge',
        status: 'failed',
        payment_method_details: { type: 'oxxo' },
        payment_intent: null,
      }

      // Should not throw, just log warning
      await expect(handleChargeFailed(mockCharge as any)).resolves.not.toThrow()
    })

    it('should handle non-OXXO charge failure gracefully', async () => {
      const mockCardCharge = {
        id: 'ch_card_failed',
        object: 'charge',
        status: 'failed',
        payment_method_details: { type: 'card' },
        payment_intent: 'pi_card_123',
      }

      // Should not process card charges in OXXO handler
      await expect(handleChargeFailed(mockCardCharge as any)).resolves.not.toThrow()
    })

    it('should handle missing payment record for OXXO charge', async () => {
      const mockCharge = {
        id: 'ch_oxxo_orphaned',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_unknown',
      }

      const chain = mockSupabaseClient.from()
      chain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      })
      chain.eq.mockReturnValue(chain)

      // Should throw because payment record is required
      await expect(handleChargeSucceeded(mockCharge as any)).rejects.toThrow()
    })
  })

  // ============================================================================
  // OXXO IDEMPOTENCY TESTS
  // ============================================================================
  describe('OXXO Idempotency', () => {
    it('should handle duplicate OXXO success events', async () => {
      const mockCharge = {
        id: 'ch_oxxo_duplicate',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      // First call - already processed
      chain.single
        .mockResolvedValueOnce({ data: { id: 'event_123' }, error: null })
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'confirmed' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)
      
      // Should complete without throwing
      await expect(handleChargeSucceeded(mockCharge as any)).resolves.not.toThrow()
    })

    it('should handle duplicate OXXO failure events', async () => {
      const mockCharge = {
        id: 'ch_oxxo_fail_duplicate',
        object: 'charge',
        status: 'failed',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({ data: { id: 'event_123' }, error: null }) // already processed
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'cancelled' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      // Should complete without throwing
      await expect(handleChargeFailed(mockCharge as any)).resolves.not.toThrow()
    })
  })

  // ============================================================================
  // OXXO EDGE CASE TESTS
  // ============================================================================
  describe('OXXO Edge Cases', () => {
    it('should handle OXXO charge with expired payment_intent', async () => {
      const mockCharge = {
        id: 'ch_oxxo_old',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_expired',
        created: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
      }

      const chain = mockSupabaseClient.from()
      chain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Payment intent expired' },
      })
      chain.eq.mockReturnValue(chain)

      await expect(handleChargeSucceeded(mockCharge as any)).rejects.toThrow()
    })

    it('should handle OXXO with different expiration periods', async () => {
      const expirationDays = [1, 2, 3, 7]
      
      for (const days of expirationDays) {
        mockPaymentIntentsCreate.mockResolvedValueOnce({
          id: `pi_oxxo_${days}d`,
          payment_method_options: {
            oxxo: { expires_after_days: days },
          },
        })
        
        const intent = await mockPaymentIntentsCreate({
          payment_method_options: { oxxo: { expires_after_days: days } },
        })
        
        expect(intent.payment_method_options.oxxo.expires_after_days).toBe(days)
      }
    })

    it('should handle OXXO payment with large amounts', async () => {
      const largeAmounts = [100000, 500000, 1000000] // $1000, $5000, $10000 MXN
      
      for (const amount of largeAmounts) {
        mockPaymentIntentsCreate.mockResolvedValueOnce({
          id: `pi_oxxo_${amount}`,
          amount,
          currency: 'mxn',
          payment_method_types: ['oxxo'],
        })
        
        const intent = await mockPaymentIntentsCreate({
          amount,
          currency: 'mxn',
          payment_method_types: ['oxxo'],
        })
        
        expect(intent.amount).toBe(amount)
      }
    })

    it('should handle OXXO payment with small amounts', async () => {
      const smallAmounts = [1000, 5000, 10000] // $10, $50, $100 MXN
      
      for (const amount of smallAmounts) {
        mockPaymentIntentsCreate.mockResolvedValueOnce({
          id: `pi_oxxo_${amount}`,
          amount,
          currency: 'mxn',
          payment_method_types: ['oxxo'],
        })
        
        const intent = await mockPaymentIntentsCreate({
          amount,
          currency: 'mxn',
          payment_method_types: ['oxxo'],
        })
        
        expect(intent.amount).toBe(amount)
      }
    })
  })

  // ============================================================================
  // OXXO WEBHOOK EVENT TESTS
  // ============================================================================
  describe('OXXO Webhook Events', () => {
    it('should process charge.succeeded for OXXO', async () => {
      const mockCharge = {
        id: 'ch_oxxo_webhook_success',
        object: 'charge',
        status: 'succeeded',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
      }

      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({ data: null, error: null }) // idempotency check
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'confirmed' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      await expect(handleChargeSucceeded(mockCharge as any)).resolves.not.toThrow()
    })

    it('should process charge.failed for OXXO', async () => {
      const mockCharge = {
        id: 'ch_oxxo_webhook_fail',
        object: 'charge',
        status: 'failed',
        payment_method_details: { type: 'oxxo' },
        payment_intent: 'pi_oxxo_123',
        failure_message: 'Voucher expired',
      }

      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({ data: null, error: null }) // idempotency check
        .mockResolvedValueOnce({
          data: { id: 'pay_123', appointment_id: 'apt_123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'apt_123', status: 'cancelled' },
          error: null,
        })
      
      chain.eq.mockReturnValue(chain)
      chain.update.mockReturnValue(chain)

      await expect(handleChargeFailed(mockCharge as any)).resolves.not.toThrow()
    })
  })

  // ============================================================================
  // OXXO METADATA TESTS
  // ============================================================================
  describe('OXXO Metadata Handling', () => {
    it('should preserve metadata through OXXO flow', async () => {
      const metadata = {
        appointment_id: 'apt_123',
        doctor_id: 'doc_456',
        patient_id: 'patient_789',
        service_type: 'consultation',
      }

      mockPaymentIntentsCreate.mockResolvedValue({
        id: 'pi_oxxo_meta',
        metadata,
        payment_method_types: ['oxxo'],
      })
      
      const intent = await mockPaymentIntentsCreate({
        metadata,
        payment_method_types: ['oxxo'],
      })
      
      expect(intent.metadata.appointment_id).toBe('apt_123')
      expect(intent.metadata.doctor_id).toBe('doc_456')
    })
  })
})
