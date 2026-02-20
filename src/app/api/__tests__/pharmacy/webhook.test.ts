/**
 * SEC-016: Pharmacy Webhook Security Tests
 *
 * Comprehensive security tests for pharmacy webhook endpoint:
 * - HMAC-SHA256 signature verification
 * - Timestamp validation (replay attack prevention)
 * - IP allowlist validation
 * - Idempotency handling
 * - Error handling
 *
 * @module api/__tests__/pharmacy/webhook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock crypto for signature verification
const mockCreateHmac = vi.fn()
const mockTimingSafeEqual = vi.fn()

vi.mock('crypto', () => ({
  createHmac: (...args: unknown[]) => mockCreateHmac(...args),
  timingSafeEqual: (...args: unknown[]) => mockTimingSafeEqual(...args),
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
    insert: vi.fn(() => Promise.resolve({ error: null })),
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
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

vi.mock('@/lib/observability/logger', () => ({
  logger: mockLogger,
}))

// Mock pharmacy functions
vi.mock('@/lib/pharmacy', () => ({
  redeemReferral: vi.fn(() => Promise.resolve({ success: true, data: { id: 'ref_123' } })),
  getPharmacyByEmail: vi.fn(() => Promise.resolve({ id: 'pharm_123', email: 'pharmacy@test.com' })),
}))

// Mock webhooks module
const mockVerifyPharmacyWebhook = vi.fn()
const mockIsWebhookIpAllowed = vi.fn()
const mockGetClientIp = vi.fn()

vi.mock('@/lib/webhooks/signatures', () => ({
  verifyPharmacyWebhook: (...args: unknown[]) => mockVerifyPharmacyWebhook(...args),
  generateTestPharmacySignature: (payload: string, secret: string, timestamp?: number) => {
    const ts = timestamp ?? Date.now()
    // Simple mock signature for testing
    return {
      signature: `sig_${payload.slice(0, 10)}_${secret.slice(0, 5)}`,
      timestamp: ts,
    }
  },
}))

vi.mock('@/lib/webhooks/ip-allowlist', () => ({
  isWebhookIpAllowed: (...args: unknown[]) => mockIsWebhookIpAllowed(...args),
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
}))

// Import route after mocks
const { POST } = await import('@/app/api/pharmacy/webhook/route')

describe('Pharmacy Webhook Security Tests (SEC-016)', () => {
  const WEBHOOK_SECRET = 'pharmacy_webhook_secret_key'
  const VALID_PAYLOAD = {
    referralCode: 'REF123456',
    pharmacyEmail: 'pharmacy@test.com',
    medicationTotalCents: 150000,
  }
  const VALID_TIMESTAMP = Date.now().toString()
  const VALID_SIGNATURE = 'valid_signature_hash'

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient = createMockSupabaseClient()

    // Set environment variables
    process.env.PHARMACY_WEBHOOK_SECRET = WEBHOOK_SECRET
    process.env.NODE_ENV = 'test'
    delete process.env.WEBHOOK_SKIP_VERIFICATION_IN_DEV

    // Default mocks
    mockVerifyPharmacyWebhook.mockReturnValue(true)
    mockIsWebhookIpAllowed.mockReturnValue(true)
    mockGetClientIp.mockReturnValue('192.168.1.100')

    // Mock successful Supabase responses
    const chain = mockSupabaseClient.from()
    chain.single
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows' } }) // idempotency check (not found = not duplicate)
      .mockResolvedValueOnce({ data: { id: 'profile_123' }, error: null }) // pharmacy profile lookup
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================================
  // SIGNATURE VERIFICATION TESTS
  // ============================================================================
  describe('Signature Verification', () => {
    it('should accept webhook with valid signature', async () => {
      mockVerifyPharmacyWebhook.mockReturnValue(true)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'unique-key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(mockVerifyPharmacyWebhook).toHaveBeenCalledWith(
        JSON.stringify(VALID_PAYLOAD),
        VALID_SIGNATURE,
        WEBHOOK_SECRET,
        VALID_TIMESTAMP
      )
    })

    it('should reject webhook without signature header', async () => {
      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('signature')
    })

    it('should reject webhook without timestamp header', async () => {
      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('timestamp')
    })

    it('should reject webhook with invalid signature', async () => {
      mockVerifyPharmacyWebhook.mockReturnValue(false)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': 'invalid_signature',
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('Invalid signature')
    })

    it('should reject webhook when secret not configured', async () => {
      delete process.env.PHARMACY_WEBHOOK_SECRET

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toContain('not configured')
    })
  })

  // ============================================================================
  // TIMESTAMP VALIDATION TESTS (Replay Attack Prevention)
  // ============================================================================
  describe('Timestamp Validation (Replay Attack Prevention)', () => {
    it('should reject webhook with timestamp too old', async () => {
      const oldTimestamp = (Date.now() - 10 * 60 * 1000).toString() // 10 minutes ago

      mockVerifyPharmacyWebhook.mockImplementation(() => {
        // Simulate the timestamp check failing
        return false
      })

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': oldTimestamp,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should reject webhook with timestamp in the future', async () => {
      const futureTimestamp = (Date.now() + 10 * 60 * 1000).toString() // 10 minutes in future

      mockVerifyPharmacyWebhook.mockReturnValue(false)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': futureTimestamp,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('should accept webhook with timestamp within 5 minute window', async () => {
      const recentTimestamp = (Date.now() - 2 * 60 * 1000).toString() // 2 minutes ago

      mockVerifyPharmacyWebhook.mockReturnValue(true)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': recentTimestamp,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // IP ALLOWLIST TESTS
  // ============================================================================
  describe('IP Allowlist Validation', () => {
    it('should accept webhook from allowed IP', async () => {
      mockIsWebhookIpAllowed.mockReturnValue(true)
      mockGetClientIp.mockReturnValue('192.168.1.100')

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
          'x-forwarded-for': '192.168.1.100',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockIsWebhookIpAllowed).toHaveBeenCalledWith('192.168.1.100', 'pharmacy')
    })

    it('should reject webhook from unauthorized IP', async () => {
      mockIsWebhookIpAllowed.mockReturnValue(false)
      mockGetClientIp.mockReturnValue('10.0.0.1')

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-forwarded-for': '10.0.0.1',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toContain('Forbidden')
    })

    it('should allow webhook when IP cannot be determined', async () => {
      mockGetClientIp.mockReturnValue(null)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      // Should proceed but log warning
      expect(response.status).toBe(200)
    })
  })

  // ============================================================================
  // IDEMPOTENCY TESTS
  // ============================================================================
  describe('Idempotency Handling', () => {
    it('should return 200 for duplicate events (idempotent)', async () => {
      // Mock that event already exists
      const { createServiceClient } = await import('@/lib/supabase/server')
      const mockDuplicateClient = {
        from: vi.fn((table: string) => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ 
                  data: { id: 'evt_123', created_at: '2024-01-01T00:00:00Z' }, 
                  error: null 
                }))
              }))
            }))
          }))
        }))
      }
      vi.mocked(createServiceClient).mockReturnValueOnce(mockDuplicateClient as any)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'duplicate-key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.idempotent).toBe(true)
      expect(data.message).toContain('already processed')
    })

    it('should process new events with unique idempotency key', async () => {
      const chain = mockSupabaseClient.from()
      chain.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116', message: 'No rows' },
        })
        .mockResolvedValueOnce({ data: { id: 'profile_123' }, error: null })

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'unique-key-456',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.idempotent).toBeUndefined()
    })

    it('should process events without idempotency key (no duplicate check)', async () => {
      // When no idempotency key, the check is skipped, only profile lookup is done
      const { createServiceClient } = await import('@/lib/supabase/server')
      const mockNoKeyClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { id: 'profile_123' }, error: null }))
            }))
          }))
        }))
      }
      vi.mocked(createServiceClient).mockReturnValueOnce(mockNoKeyClient as any)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          // No x-idempotency-key header
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should handle idempotency check errors gracefully', async () => {
      // Mock the isDuplicateEvent to return an error
      // We need to override the default behavior
      const { createServiceClient } = await import('@/lib/supabase/server')
      const mockErrorClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.reject(new Error('Database connection failed')))
              }))
            }))
          }))
        }))
      }
      vi.mocked(createServiceClient).mockReturnValueOnce(mockErrorClient as any)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      // The implementation returns 500 when idempotency check fails
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Internal error')
    })
  })

  // ============================================================================
  // PAYLOAD VALIDATION TESTS
  // ============================================================================
  describe('Payload Validation', () => {
    it('should reject invalid JSON payload', async () => {
      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: 'not valid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid JSON')
    })

    it('should reject missing referral code', async () => {
      const invalidPayload = {
        pharmacyEmail: 'pharmacy@test.com',
        medicationTotalCents: 150000,
      }

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(invalidPayload),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Referral code')
    })

    it('should reject missing pharmacy identification', async () => {
      const invalidPayload = {
        referralCode: 'REF123456',
        medicationTotalCents: 150000,
      }

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(invalidPayload),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('pharmacy identification')
    })
  })

  // ============================================================================
  // BUSINESS LOGIC TESTS
  // ============================================================================
  describe('Business Logic', () => {
    it('should return 404 when pharmacy not found', async () => {
      const { getPharmacyByEmail } = await import('@/lib/pharmacy')
      vi.mocked(getPharmacyByEmail).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toContain('Pharmacy not found')
    })

    it('should return 404 when pharmacy profile not found', async () => {
      // Create a fresh mock for this test that simulates profile not found
      const { createServiceClient } = await import('@/lib/supabase/server')
      
      let fromCallCount = 0
      const mockProfileNotFoundClient = {
        from: vi.fn((table: string) => {
          fromCallCount++
          if (table === 'webhook_events') {
            // First table query - idempotency check
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
                  }))
                }))
              }))
            }
          }
          // profiles table - return not found
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
              }))
            }))
          }
        })
      }
      vi.mocked(createServiceClient).mockReturnValueOnce(mockProfileNotFoundClient as any)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toContain('Pharmacy account not found')
    })

    it('should return 400 when referral redemption fails', async () => {
      const { redeemReferral } = await import('@/lib/pharmacy')
      vi.mocked(redeemReferral).mockResolvedValueOnce({
        success: false,
        error: 'Invalid referral code',
      })

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid referral code')
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling', () => {
    it('should return 500 on unexpected errors', async () => {
      mockVerifyPharmacyWebhook.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': VALID_SIGNATURE,
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('Failed to redeem')
    })

    it('should log security events', async () => {
      mockVerifyPharmacyWebhook.mockReturnValue(false)

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': 'invalid_sig',
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      await POST(request)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Pharmacy webhook: Invalid signature',
        expect.any(Object)
      )
    })
  })

  // ============================================================================
  // DEVELOPMENT MODE TESTS
  // ============================================================================
  describe('Development Mode', () => {
    it('should skip verification in dev mode when configured', async () => {
      process.env.NODE_ENV = 'development'
      process.env.WEBHOOK_SKIP_VERIFICATION_IN_DEV = 'true'
      mockVerifyPharmacyWebhook.mockReturnValue(false) // Would fail normally

      const request = new NextRequest('http://localhost/api/pharmacy/webhook', {
        method: 'POST',
        headers: {
          'x-pharmacy-signature': 'any_sig',
          'x-pharmacy-timestamp': VALID_TIMESTAMP,
          'x-idempotency-key': 'key-123',
        },
        body: JSON.stringify(VALID_PAYLOAD),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Pharmacy webhook: Skipping signature verification in development mode'
      )
    })
  })
})
