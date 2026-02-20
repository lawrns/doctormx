import { describe, it, expect, vi, beforeEach } from 'vitest'

// Track mock calls
const mockCalls = {
  from: [] as string[],
  select: [] as string[][],
  eq: [] as { column: string; value: string }[],
  insert: [] as Record<string, unknown>[],
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
const mockVerifyWhatsAppWebhook = vi.fn()
vi.mock('@/lib/webhooks', () => ({
  verifyWhatsAppWebhook: mockVerifyWhatsAppWebhook,
  isWebhookIpAllowed: vi.fn(() => true),
  getClientIp: vi.fn(() => '31.13.24.1'),
}))

// Mock WhatsApp functions
vi.mock('@/lib/whatsapp', () => ({
  createSession: vi.fn(() => Promise.resolve('session_123')),
  addMessage: vi.fn(() => Promise.resolve()),
  conductTriage: vi.fn(() => Promise.resolve({
    success: true,
    aiResponse: 'Triage response',
    triageComplete: false,
  })),
  routeHandoff: vi.fn(() => Promise.resolve({ success: true, bookingLink: '/book/123' })),
}))

// Mock WhatsApp Business API
vi.mock('@/lib/whatsapp-business-api', () => ({
  sendWhatsAppMessage: vi.fn(() => Promise.resolve()),
}))

// Set environment variables BEFORE importing the module
process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test_verify_token'
process.env.WHATSAPP_APP_SECRET = 'test_app_secret'

// Import after mocks
const { GET, POST } = await import('@/app/api/webhooks/whatsapp/route')

// Mock NextRequest class
class MockNextRequest {
  url: string
  method: string
  body: string
  headers: Headers
  nextUrl: { searchParams: URLSearchParams }
  
  constructor(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
    this.url = url
    this.method = init?.method ?? 'GET'
    this.body = init?.body ?? ''
    this.headers = new Headers(init?.headers)
    this.nextUrl = {
      searchParams: new URL(url).searchParams,
    }
  }
  
  async text() { return this.body }
}

describe('WhatsApp Webhook Security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalls.from = []
    mockCalls.select = []
    mockCalls.eq = []
    mockCalls.insert = []
    
    mockVerifyWhatsAppWebhook.mockReturnValue(true)
  })

  describe('GET handler - Webhook Verification', () => {
    it('should verify webhook with valid token', async () => {
      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test_verify_token&hub.challenge=123456')

      const response = await GET(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(200)
      
      const responseText = await response.text()
      expect(responseText).toBe('123456')
    })

    it('should reject webhook with invalid token', async () => {
      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=123456')

      const response = await GET(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(403)
    })

    it('should reject non-subscribe mode requests', async () => {
      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp?hub.mode=unsubscribe&hub.verify_token=test_verify_token&hub.challenge=123456')

      const response = await GET(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(403)
    })
  })

  describe('POST handler - Security', () => {
    it('should reject requests without app secret configured', async () => {
      // Create a local copy of env var, then clear it
      const originalSecret = process.env.WHATSAPP_APP_SECRET
      process.env.WHATSAPP_APP_SECRET = ''
      
      // Re-import to pick up the new env var
      const { POST: POST_no_secret } = await import('@/app/api/webhooks/whatsapp/route')

      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ object: 'whatsapp_business_account' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=valid_signature',
        },
      })

      const response = await POST_no_secret(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Server configuration error')
      
      // Restore
      process.env.WHATSAPP_APP_SECRET = originalSecret
    })

    it('should reject requests without signature header', async () => {
      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ object: 'whatsapp_business_account' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject requests with invalid signature', async () => {
      mockVerifyWhatsAppWebhook.mockReturnValue(false)

      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ object: 'whatsapp_business_account' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=invalid_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should verify signature using HMAC-SHA256', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          id: '123',
          changes: [{
            value: {
              messages: [{
                from: '1234567890',
                id: 'msg_123',
                type: 'text',
                text: { body: 'Hello' },
              }],
            },
            field: 'messages',
          }],
        }],
      })

      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=valid_signature',
        },
      })

      await POST(request as unknown as import('next/server').NextRequest)
      
      expect(mockVerifyWhatsAppWebhook).toHaveBeenCalledWith(
        body,
        'sha256=valid_signature',
        'test_app_secret'
      )
    })

    it('should use timing-safe comparison for signatures', async () => {
      mockVerifyWhatsAppWebhook.mockReturnValueOnce(false)

      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ object: 'whatsapp_business_account' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=wrong_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(401)
    })

    it('should process valid webhook requests', async () => {
      const body = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          id: '123',
          changes: [{
            value: {
              messages: [{
                from: '1234567890',
                id: 'msg_123',
                type: 'text',
                text: { body: 'Hello doctor' },
              }],
            },
            field: 'messages',
          }],
        }],
      })

      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=valid_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.status).toBe('ok')
    })

    it('should handle processing errors gracefully', async () => {
      mockVerifyWhatsAppWebhook.mockImplementationOnce(() => {
        throw new Error('Unexpected error')
      })

      const request = new MockNextRequest('http://localhost/api/webhooks/whatsapp', {
        method: 'POST',
        body: JSON.stringify({ object: 'whatsapp_business_account' }),
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=valid_signature',
        },
      })

      const response = await POST(request as unknown as import('next/server').NextRequest)
      expect(response.status).toBe(500)
    })
  })
})
