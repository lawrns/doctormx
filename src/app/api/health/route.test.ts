/**
 * Health Check Endpoint Tests
 * 
 * Tests for the /api/health endpoint that verifies service status
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Set required env vars before importing the route
process.env.STRIPE_SECRET_KEY = 'sk_test_123'

// Mock dependencies
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
    openai: { apiKey: 'test-openai-key' },
  },
}))

// Import route after mocks
const { GET, OPTIONS } = await import('./route')

import { createServiceClient } from '@/lib/supabase/server'
import { getCacheClient, isUsingFallbackMemoryCache } from '@/lib/cache/client'
import { stripe } from '@/lib/stripe'

const mockCreateServiceClient = vi.mocked(createServiceClient)
const mockGetCacheClient = vi.mocked(getCacheClient)
const mockIsUsingFallbackMemoryCache = vi.mocked(isUsingFallbackMemoryCache)
const mockStripeList = vi.mocked(stripe.products.list)

describe('Health Check Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset env var
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
  })

  describe('GET /api/health', () => {
    it('should return healthy status when all services are OK', async () => {
      // Mock all services healthy
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.status).toBe('healthy')
      expect(body.checks.database.status).toBe('ok')
      expect(body.checks.cache.status).toBe('ok')
      expect(body.checks.stripe.status).toBe('ok')
      expect(body.checks.ai.status).toBe('ok')
      expect(body.timestamp).toBeDefined()
      expect(body.version).toBeDefined()
      expect(body.uptime).toBeGreaterThanOrEqual(0)
      expect(body.environment).toBeDefined()
    })

    it('should return degraded status when using memory cache fallback', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(true)

      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.status).toBe('degraded')
      expect(body.checks.cache.status).toBe('degraded')
      expect(body.checks.cache.message).toContain('in-memory cache')
    })

    it('should return 503 when database check fails', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Connection refused' } 
            }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(503)
      expect(body.status).toBe('unhealthy')
      expect(body.checks.database.status).toBe('error')
      expect(body.checks.database.message).toContain('Connection refused')
    })

    it('should return 503 when cache check fails', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
      } as any)

      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(503)
      expect(body.status).toBe('unhealthy')
      expect(body.checks.cache.status).toBe('error')
      expect(body.checks.cache.message).toContain('Redis connection failed')
    })

    it('should return 503 when Stripe check fails', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      mockStripeList.mockRejectedValue(new Error('Invalid API key'))

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(503)
      expect(body.status).toBe('unhealthy')
      expect(body.checks.stripe.status).toBe('error')
      expect(body.checks.stripe.message).toContain('Invalid API key')
    })

    it('should skip Stripe check when STRIPE_SECRET_KEY is not configured', async () => {
      // Remove Stripe key
      delete process.env.STRIPE_SECRET_KEY

      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      const response = await GET()
      const body = await response.json()

      expect(body.checks.stripe.status).toBe('skipped')
      expect(body.checks.stripe.message).toContain('STRIPE_SECRET_KEY not configured')
      
      // Restore
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    })

    it('should include latency metrics for all checks', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      expect(body.checks.database.latency).toBeGreaterThanOrEqual(0)
      expect(body.checks.cache.latency).toBeGreaterThanOrEqual(0)
      expect(body.checks.stripe.latency).toBeGreaterThanOrEqual(0)
      expect(body.checks.ai.latency).toBeGreaterThanOrEqual(0)
    })

    it('should handle Stripe empty product list gracefully', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      // Stripe returns empty list in test mode without products
      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      expect(body.checks.stripe.status).toBe('ok')
    })

    it('should handle Stripe missing products error gracefully', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      // Stripe error for missing products should be treated as connected
      const error = new Error('No such product: prod_xxx')
      mockStripeList.mockRejectedValue(error)

      const response = await GET()
      const body = await response.json()

      expect(body.checks.stripe.status).toBe('ok')
      expect(body.checks.stripe.message).toBe('Connected (no products found)')
    })
  })

  describe('OPTIONS /api/health', () => {
    it('should return 204 with CORS headers', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
    })
  })

  describe('Response Structure', () => {
    it('should return correct response structure', async () => {
      mockCreateServiceClient.mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      mockGetCacheClient.mockReturnValue({
        ping: vi.fn().mockResolvedValue('PONG'),
      } as any)

      mockIsUsingFallbackMemoryCache.mockReturnValue(false)

      mockStripeList.mockResolvedValue({ data: [] } as any)

      const response = await GET()
      const body = await response.json()

      // Verify response structure
      expect(body).toHaveProperty('status')
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('version')
      expect(body).toHaveProperty('uptime')
      expect(body).toHaveProperty('environment')
      expect(body).toHaveProperty('checks')

      // Verify checks structure
      expect(body.checks).toHaveProperty('database')
      expect(body.checks).toHaveProperty('cache')
      expect(body.checks).toHaveProperty('stripe')
      expect(body.checks).toHaveProperty('ai')

      // Each check should have required fields
      Object.values(body.checks).forEach((check: unknown) => {
        const checkObj = check as { status: string; latency: number }
        expect(checkObj).toHaveProperty('status')
        expect(checkObj).toHaveProperty('latency')
      })
    })
  })
})
