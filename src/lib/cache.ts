/**
 * Legacy Cache Interface (Deprecated)
 *
 * This file now re-exports from the new modular cache structure.
 * For new code, import from '@/lib/cache' instead.
 *
 * @deprecated Use the new cache module from '@/lib/cache' instead
 */

// Re-export everything from the new cache module's index
export {
  cache,
  getCacheClient,
  getCacheHealth,
  TTL,
  CacheTags,
  type CacheResult,
  type CacheSetOptions,
  type CacheStats,
} from './cache/index'

// Re-export Redis for backward compatibility
export { redis } from './cache/client'

// Re-export rate limiters for backward compatibility
import { Ratelimit } from '@upstash/ratelimit'
import { logger } from '@/lib/observability/logger'
import { getCacheClient as getClient } from './cache/client'

// No-op rate limiter for when Redis is not configured
type RateLimitResult = { success: boolean; limit: number; remaining: number; reset: number }
const noopRateLimiter = {
  limit: async (): Promise<RateLimitResult> => ({ success: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 }),
}

// Create rate limiters only when Redis is available
function createRateLimiter(windowSize: number, windowDuration: string, prefix: string) {
  const client = getClient()

  // Check if we're using Redis (has required methods)
  if ('ping' in client && typeof client.ping === 'function') {
    try {
      return new Ratelimit({
        redis: client as any, // Type assertion for Upstash compatibility
        limiter: Ratelimit.slidingWindow(windowSize, windowDuration as Parameters<typeof Ratelimit.slidingWindow>[1]),
        analytics: true,
        prefix,
      })
    } catch (error) {
      logger.warn('Failed to create rate limiter, using noop', { prefix, error })
      return noopRateLimiter
    }
  }

  return noopRateLimiter
}

export const rateLimit = {
  ai: createRateLimiter(10, '1 m', 'ratelimit:ai'),
  chat: createRateLimiter(20, '1 m', 'ratelimit:chat'),
  general: createRateLimiter(100, '1 m', 'ratelimit:general'),
  auth: createRateLimiter(5, '1 m', 'ratelimit:auth'),
  payment: createRateLimiter(10, '1 m', 'ratelimit:payment'),
  write: createRateLimiter(30, '1 m', 'ratelimit:write'),
  read: createRateLimiter(100, '1 m', 'ratelimit:read'),
}

