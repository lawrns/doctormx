/**
 * Health Endpoint Tests - OBS-001
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch before importing the route
const mockFetch = vi.fn()
// @ts-ignore
global.fetch = mockFetch

// Mock dependencies before importing route
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/cache/client', () => ({
  getCacheClient: vi.fn(),
  isUsingFallbackMemoryCache: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    products: {
      list: vi.fn(),
    },
  },
}))

vi.mock('@/lib/ai/config', () => ({
  AI_CONFIG: {
    glm: { apiKey: 'test-glm-key' },
    openai: { apiKey: null },
  },
}))

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Import route and mocked dependencies after mocks are set up
import { GET } from '../route'
import { createServiceClient } from '@/lib/supabase/server'
import { getCacheClient, isUsingFallbackMemoryCache } from '@/lib/cache/client'
import { stripe } from '@/lib/stripe'

const mockedCreateServiceClient = vi.mocked(createServiceClient)
const mockedGetCacheClient = vi.mocked(getCacheClient)
const mockedIsUsingFallbackMemoryCache = vi.mocked(isUsingFallbackMemoryCache)
const mockedStripeProductsList = vi.mocked(stripe.products.list)

/**
 * Supabase error type for mocking
 */
interface SupabaseError {
  message: string
  code: string
}

describe('Health Endpoint', () => {
  const createMockSupabase = (error: SupabaseError | null = null) => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error }),
  })

  const createMockCacheClient = (pingResult: string = 'PONG') => ({
    ping: vi.fn().mockResolvedValue(pingResult),
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
    
    // Set up default healthy mocks
    mockedCreateServiceClient.mockReturnValue(createMockSupabase() as unknown as ReturnType<typeof createServiceClient>)
    mockedGetCacheClient.mockReturnValue(createMockCacheClient() as unknown as ReturnType<typeof getCacheClient>)
    mockedIsUsingFallbackMemoryCache.mockReturnValue(false)
    mockedStripeProductsList.mockResolvedValue({ data: [] })
    
    // Set required env vars
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456'
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token'
    process.env.TWILIO_ACCOUNT_SID = 'AC123'
    process.env.TWILIO_AUTH_TOKEN = 'test-token'
    process.env.npm_package_version = '1.0.0'
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
    delete process.env.WHATSAPP_ACCESS_TOKEN
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
  })

  it('should return 200 with healthy status when all services are up', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: '123' }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.database.status).toBe('ok')
    expect(data.checks.cache.status).toBe('ok')
    expect(data.checks.stripe.status).toBe('ok')
    expect(data.checks.whatsapp.status).toBe('ok')
    expect(data.checks.twilio.status).toBe('ok')
    expect(data.checks.ai.status).toBe('ok')
    expect(data.timestamp).toBeDefined()
    expect(data.uptime).toBeGreaterThanOrEqual(0)
    expect(data.version).toBe('1.0.0')
    expect(data.environment).toBe('test')
  })

  it('should return 503 when database is down', async () => {
    mockedCreateServiceClient.mockReturnValue(createMockSupabase({ message: 'Connection refused' }) as any)

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: '123' }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.database.status).toBe('error')
    expect(data.checks.database.message).toContain('Connection refused')
  })

  it('should return 200 with degraded status when using in-memory cache', async () => {
    mockedIsUsingFallbackMemoryCache.mockReturnValue(true)

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: '123' }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('degraded')
    expect(data.checks.cache.status).toBe('degraded')
    expect(data.checks.cache.message).toContain('in-memory cache')
  })

  it('should mark external services as skipped when credentials not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
    delete process.env.WHATSAPP_ACCESS_TOKEN
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN

    const response = await GET()
    const data = await response.json()

    expect(data.checks.stripe.status).toBe('skipped')
    expect(data.checks.whatsapp.status).toBe('skipped')
    expect(data.checks.twilio.status).toBe('skipped')
    expect(data.checks.stripe.message).toContain('not configured')
  })

  it('should include latency for each check', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: '123' }),
    } as any)

    const response = await GET()
    const data = await response.json()

    Object.values(data.checks).forEach((check: unknown) => {
      const checkObj = check as { latency: number }
      expect(checkObj.latency).toBeGreaterThanOrEqual(0)
      expect(typeof checkObj.latency).toBe('number')
    })
  })

  it('should return cache-control headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: '123' }),
    } as any)

    const response = await GET()

    expect(response.headers.get('cache-control')).toContain('no-store')
  })

  it('should return 503 when WhatsApp API fails', async () => {
    mockFetch.mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString()
      if (urlStr.includes('facebook.com')) {
        return Promise.resolve({
          ok: false,
          statusText: 'Unauthorized',
          json: vi.fn().mockResolvedValue({ error: { message: 'Invalid token' } }),
        } as any)
      }
      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '123' }),
      } as any)
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.whatsapp.status).toBe('error')
    expect(data.checks.whatsapp.message).toContain('Invalid token')
  })

  it('should return 503 when Twilio API fails', async () => {
    mockFetch.mockImplementation((url: string | URL | Request) => {
      const urlStr = url.toString()
      if (urlStr.includes('twilio.com')) {
        return Promise.resolve({
          ok: false,
          statusText: 'Unauthorized',
          json: vi.fn().mockResolvedValue({ message: 'Invalid credentials' }),
        } as any)
      }
      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '123' }),
      } as any)
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.twilio.status).toBe('error')
    expect(data.checks.twilio.message).toContain('Invalid credentials')
  })
})
