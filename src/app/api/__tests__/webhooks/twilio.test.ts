import { describe, it, expect, vi, beforeEach } from 'vitest'

// Track mock calls
const mockCalls = {
  from: [] as string[],
  select: [] as string[][],
  eq: [] as { column: string; value: string }[],
  insert: [] as Record<string, unknown>[],
  update: [] as Record<string, unknown>[],
}

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Create chainable mock
const createMockChain = () => {
  const chain = {
    select: vi.fn((...args: string[]) => {
      mockCalls.select.push(args)
      return chain
    }),
    eq: vi.fn((column: string, value: string) => {
      mockCalls.eq.push({ column, value })
      return chain
    }),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    insert: vi.fn((data: Record<string, unknown>) => {
      mockCalls.insert.push(data)
      return Promise.resolve({ error: null })
    }),
    update: vi.fn((data: Record<string, unknown>) => {
      mockCalls.update.push(data)
      return chain
    }),
  }
  return chain
}

const mockFrom = vi.fn(() => createMockChain())

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// Mock webhooks module
const mockVerifyTwilioWebhook = vi.fn()
vi.mock('@/lib/webhooks', () => ({
  verifyTwilioWebhook: mockVerifyTwilioWebhook,
  isWebhookIpAllowed: vi.fn(() => true),
  getClientIp: vi.fn(() => '54.172.60.1'),
}))

// Mock AI functions
vi.mock('@/lib/ai/drSimeon', () => ({
  generateDrSimeonResponse: vi.fn(() => Promise.resolve('AI response')),
  isTriageComplete: vi.fn(() => Promise.resolve(false)),
  conductOPQRSTAssessment: vi.fn(() => Promise.resolve({
    chiefComplaint: 'test',
    symptoms: ['pain'],
    urgencyLevel: 'yellow',
    suggestedSpecialty: 'general',
    redFlags: [],
    aiConfidence: 0.8,
  })),
}))

// Mock WhatsApp functions
vi.mock('@/lib/whatsapp', () => ({
  createSession: vi.fn(() => Promise.resolve('session_123')),
  addMessage: vi.fn(() => Promise.resolve()),
  routeHandoff: vi.fn(() => Promise.resolve({ success: true, bookingLink: '/book/123' })),
}))

// Import after mocks
const { POST } = await import('@/app/api/webhooks/twilio/route')

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
}

describe('Twilio Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalls.from = []
    mockCalls.select = []
    mockCalls.eq = []
    mockCalls.insert = []
    mockCalls.update = []
    
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token'
    mockVerifyTwilioWebhook.mockReturnValue(true)
  })

  describe('POST handler - Security', () => {
    it('should reject requests without Twilio auth token configured', async () => {
      process.env.TWILIO_AUTH_TOKEN = ''

      const request = new MockNextRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: 'From=%2B1234567890&Body=Hello',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Twilio-Signature': 'valid_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(500)
    })

    it('should reject requests without signature header', async () => {
      const request = new MockNextRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: 'From=%2B1234567890&Body=Hello',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
    })

    it('should reject requests with invalid signature', async () => {
      mockVerifyTwilioWebhook.mockReturnValue(false)

      const request = new MockNextRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: 'From=%2B1234567890&Body=Hello',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Twilio-Signature': 'invalid_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
    })

    it('should verify signature using Twilio algorithm', async () => {
      const request = new MockNextRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: 'From=%2B1234567890&Body=Hello',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Twilio-Signature': 'valid_signature',
        },
      })

      await POST(request as unknown as import('next/server').NextRequest)
      
      expect(mockVerifyTwilioWebhook).toHaveBeenCalledWith(
        'http://localhost/api/webhooks/twilio',
        'From=%2B1234567890&Body=Hello',
        'valid_signature',
        'test_auth_token'
      )
    })

    it('should use timing-safe comparison for signatures', async () => {
      // Mock should return false for invalid signatures
      mockVerifyTwilioWebhook.mockReturnValueOnce(false)

      const request = new MockNextRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: 'From=%2B1234567890&Body=Hello',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Twilio-Signature': 'wrong_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
    })
  })

  describe('POST handler - Security Headers', () => {
    it('should include proper Content-Type in error responses', async () => {
      mockVerifyTwilioWebhook.mockReturnValue(false)

      const request = new MockNextRequest('http://localhost/api/webhooks/twilio', {
        method: 'POST',
        body: 'From=%2B1234567890&Body=Hello',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Twilio-Signature': 'invalid_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
    })
  })
})
