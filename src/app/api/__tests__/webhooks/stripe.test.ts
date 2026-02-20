import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest'

// Track mock calls
const mockCalls = {
  from: [] as string[],
  select: [] as string[][],
  eq: [] as { column: string; value: string }[],
  update: [] as Record<string, unknown>[],
  insert: [] as Record<string, unknown>[],
  single: 0,
}

// Mock next/headers
const mockHeadersGet = vi.fn()
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({
    get: mockHeadersGet,
  })),
}))

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Create chainable mock that tracks calls
let singleResponse: { data: unknown; error: unknown } = { data: null, error: null }
let singleResponses: { data: unknown; error: unknown }[] = []
let singleCallIndex = 0

const createMockChain = (): {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
} => {
  const chain = {
    select: vi.fn((...args: string[]) => {
      mockCalls.select.push(args)
      return chain
    }),
    eq: vi.fn((column: string, value: string) => {
      mockCalls.eq.push({ column, value })
      return chain
    }),
    update: vi.fn((data: Record<string, unknown>) => {
      mockCalls.update.push(data)
      return chain
    }),
    insert: vi.fn((data: Record<string, unknown>) => {
      mockCalls.insert.push(data)
      return Promise.resolve({ error: null })
    }),
    upsert: vi.fn((data: Record<string, unknown>) => {
      mockCalls.insert.push(data)
      return Promise.resolve({ error: null })
    }),
    single: vi.fn(() => {
      mockCalls.single++
      const response = singleResponses[singleCallIndex++] || singleResponse
      return Promise.resolve(response)
    }),
  }
  return chain
}

const mockFrom = vi.fn(() => createMockChain())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}))

// Mock stripe
const mockConstructEvent = vi.fn()
const mockSubscriptionsRetrieve = vi.fn().mockResolvedValue({
  id: 'sub_test',
  items: { data: [{ price: { id: 'price_test' } }] },
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 2592000,
  cancel_at_period_end: false,
  status: 'active',
})

// Track if constructEvent should throw
let shouldConstructEventThrow = false
const getConstructEventError = () => new Error('Invalid signature')

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn((...args: unknown[]) => {
        if (shouldConstructEventThrow) {
          throw getConstructEventError()
        }
        return mockConstructEvent(...args)
      }),
    },
    subscriptions: {
      retrieve: vi.fn((...args: unknown[]) => mockSubscriptionsRetrieve(...args)),
    },
  },
}))

// Mock other dependencies
vi.mock('@/lib/notifications', () => ({
  sendPaymentReceipt: vi.fn(),
}))

vi.mock('@/lib/whatsapp-notifications', () => ({
  sendPaymentReceipt: vi.fn(),
  getDoctorName: vi.fn().mockResolvedValue('Dr. Test'),
}))

vi.mock('@/lib/webhooks', () => ({
  verifyStripeWebhook: vi.fn().mockReturnValue(true),
  verifyTwilioWebhook: vi.fn().mockReturnValue(true),
  verifyWhatsAppWebhook: vi.fn().mockReturnValue(true),
  isWebhookIpAllowed: vi.fn().mockReturnValue(true),
  getClientIp: vi.fn().mockReturnValue('3.18.12.63'),
}))

// Mock signature verification to avoid Stripe initialization issues
vi.mock('@/app/api/webhooks/stripe/utils/signature-verification', () => ({
  verifySignature: vi.fn((body: string, signature: string) => {
    // Check if webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return { valid: false, error: 'Webhook secret not configured' }
    }
    if (!signature) {
      return { valid: false, error: 'Missing signature' }
    }
    if (signature === 'invalid') {
      return { valid: false, error: 'Invalid signature' }
    }
    // Parse body to construct event
    try {
      const event = JSON.parse(body)
      return { valid: true, event }
    } catch {
      return { valid: false, error: 'Invalid payload' }
    }
  }),
}))

// Helper to control constructEvent behavior
export function setShouldConstructEventThrow(shouldThrow: boolean) {
  shouldConstructEventThrow = shouldThrow
}

// Mock stripe import for types
vi.mock('stripe', () => ({
  default: class Stripe {
    static Stripe = class {}
  },
}))

// Import after mocks
const { POST, GET } = await import('@/app/api/webhooks/stripe/route')

// Test data
const mockPaymentIntentSucceeded = {
  id: 'pi_test_succeeded',
  object: 'payment_intent',
  status: 'succeeded',
  amount: 10000,
  currency: 'mxn',
  metadata: { appointment_id: 'app_123' },
  payment_method_types: ['card'],
  last_payment_error: null,
  created: Math.floor(Date.now() / 1000),
}

const mockPaymentIntentFailed = {
  id: 'pi_test_failed',
  object: 'payment_intent',
  status: 'failed',
  amount: 10000,
  currency: 'mxn',
  metadata: { appointment_id: 'app_124' },
  payment_method_types: ['card'],
  last_payment_error: { message: 'Your card has been declined.', type: 'card_declined' },
  created: Math.floor(Date.now() / 1000),
}

const mockChargeSucceeded = {
  id: 'ch_test_succeeded',
  object: 'charge',
  status: 'succeeded',
  amount: 15000,
  currency: 'mxn',
  payment_method_details: { type: 'oxxo' },
  payment_intent: 'pi_test_oxxo',
  created: Math.floor(Date.now() / 1000),
}

class MockNextRequest {
  url: string
  method: string
  body: string
  headers: Headers
  
  constructor(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
    this.url = url
    this.method = init?.method ?? 'GET'
    this.body = init?.body ?? ''
    this.headers = new Headers(init?.headers)
  }
  
  async text() { return this.body }
  async json() { return JSON.parse(this.body) }
}

describe('Stripe Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalls.from = []
    mockCalls.select = []
    mockCalls.eq = []
    mockCalls.update = []
    mockCalls.insert = []
    mockCalls.single = 0
    singleResponse = { data: null, error: null }
    singleResponses = []
    singleCallIndex = 0
    
    process.env.STRIPE_SECRET_KEY = 'sk_test_key'
    process.env.STRIPE_WEBHOOK_SECRET = 'test_secret'
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'stripe-signature') return 'test_signature'
      return null
    })
  })

  describe('GET handler', () => {
    it('should return supported events list', async () => {
      const response = await GET()
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.status).toBe('Stripe webhook endpoint active')
      expect(Array.isArray(data.supportedEvents)).toBe(true)
      expect(data.supportedEvents).toContain('payment_intent.succeeded')
    })
  })

  describe('POST handler - Signature verification', () => {
    it('should handle missing stripe-signature header', async () => {
      mockHeadersGet.mockReturnValue(null)

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_test', type: 'payment_intent.succeeded' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Missing stripe-signature header')
    })

    it('should handle missing webhook secret', async () => {
      process.env.STRIPE_WEBHOOK_SECRET = ''

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_test', type: 'payment_intent.succeeded' }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Webhook secret not configured')
    })
  })

  describe('POST handler - Event handling', () => {
    it('should handle payment intent succeeded events', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_payment_success',
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntentSucceeded },
        created: Math.floor(Date.now() / 1000),
      })

      singleResponses = [
        { data: null, error: null }, // webhook_events check
        { // appointments update
          data: {
            id: 'app_123',
            doctor_id: 'doc_123',
            start_ts: new Date().toISOString(),
            patient: { email: 'test@example.com', phone: '+1234567890', full_name: 'Test Patient' },
          },
          error: null,
        },
      ]

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_payment_success', type: 'payment_intent.succeeded', data: { object: mockPaymentIntentSucceeded } }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('payment_intent.succeeded')
    })

    it('should handle payment intent failed events', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_payment_failed',
        type: 'payment_intent.payment_failed',
        data: { object: mockPaymentIntentFailed },
        created: Math.floor(Date.now() / 1000),
      })

      singleResponses = [
        { data: null, error: null },
        {
          data: {
            id: 'app_124',
            doctor_id: 'doc_123',
            start_ts: new Date().toISOString(),
            patient: { email: 'test@example.com', phone: '+1234567890', full_name: 'Test Patient' },
          },
          error: null,
        },
      ]

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_payment_failed', type: 'payment_intent.payment_failed', data: { object: mockPaymentIntentFailed } }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('payment_intent.payment_failed')
    })

    it('should handle OXXO charge succeeded events', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_oxxo_success',
        type: 'charge.succeeded',
        data: { object: mockChargeSucceeded },
        created: Math.floor(Date.now() / 1000),
      })

      singleResponses = [
        { data: null, error: null },
        { data: { id: 'pay_123', appointment_id: 'app_125', appointment: { id: 'app_125' } }, error: null },
        {
          data: {
            id: 'app_125',
            doctor_id: 'doc_123',
            start_ts: new Date().toISOString(),
            patient: { email: 'test@example.com', phone: '+1234567890', full_name: 'Test Patient' },
          },
          error: null,
        },
      ]

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_oxxo_success', type: 'charge.succeeded', data: { object: mockChargeSucceeded } }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('charge.succeeded')
    })

    it('should handle unhandled event types', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_unhandled',
        type: 'payment_method.attached',
        data: { object: {} },
        created: Math.floor(Date.now() / 1000),
      })

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_unhandled', type: 'payment_method.attached', data: { object: {} } }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.received).toBe(true)
      expect(data.event).toBe('payment_method.attached')
    })
  })

  describe('POST handler - Error cases', () => {
    it('should handle webhook verification errors', async () => {
      // Temporarily remove webhook secret to trigger verification error
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET
      process.env.STRIPE_WEBHOOK_SECRET = ''
      
      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_invalid', type: 'payment_intent.succeeded' }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'test_sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toContain('configured')
      
      // Restore webhook secret
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret
    })
  })

  describe('POST handler - Edge cases', () => {
    it('should handle events missing appointment_id', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_no_metadata',
        type: 'payment_intent.succeeded',
        data: { object: { ...mockPaymentIntentSucceeded, metadata: {} } },
        created: Math.floor(Date.now() / 1000),
      })

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_no_metadata', type: 'payment_intent.succeeded', data: { object: { ...mockPaymentIntentSucceeded, metadata: {} } } }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.received).toBe(true)
    })

    it('should ignore non-OXXO charge events', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_card_charge',
        type: 'charge.succeeded',
        data: { object: { ...mockChargeSucceeded, payment_method_details: { type: 'card' } } },
        created: Math.floor(Date.now() / 1000),
      })

      const request = new MockNextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_card_charge', type: 'charge.succeeded', data: { object: { ...mockChargeSucceeded, payment_method_details: { type: 'card' } } } }),
        headers: { 'Content-Type': 'application/json', 'stripe-signature': 'sig' },
      })

      const response = await POST(request as any)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.received).toBe(true)
    })
  })
})
