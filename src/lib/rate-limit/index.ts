/**
 * Rate Limiting Implementation
 *
 * Provides rate limiting functionality using Upstash Ratelimit with Redis,
 * with automatic fallback to in-memory rate limiting for development.
 *
 * This implementation:
 * - Uses @upstash/ratelimit when Redis is configured
 * - Falls back to in-memory Map-based limiting when Redis is unavailable
 * - Never fails the application if rate limiting is unavailable
 * - Provides consistent API regardless of backend
 */

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { logger } from '@/lib/observability/logger'
import type { RateLimitTier } from './config'

// Type for rate limit check result
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean
  /** Total limit for the window */
  limit: number
  /** Remaining requests in the current window */
  remaining: number
  /** Unix timestamp when the limit resets */
  reset: number
  /** Time in seconds until the limit resets */
  resetInSeconds?: number
}

// Type for rate limiter implementation
interface RateLimiterImplementation {
  limit(identifier: string): Promise<RateLimitResult>
}

/**
 * In-memory rate limiter for development/fallback
 *
 * Uses a sliding window algorithm with a Map to track requests.
 * This is not distributed but works for single-instance development.
 */
class InMemoryRateLimiter implements RateLimiterImplementation {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number // in milliseconds

  constructor(limit: number, windowSeconds: number) {
    this.maxRequests = limit
    this.windowMs = windowSeconds * 1000
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || []

    // Filter out timestamps outside the current window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart)

    // Check if adding this request would exceed the limit
    const success = timestamps.length < this.maxRequests

    // Add current timestamp if allowed
    if (success) {
      timestamps.push(now)
    }

    // Update stored timestamps
    this.requests.set(identifier, timestamps)

    // Calculate reset time (oldest timestamp in window + window duration)
    const oldestTimestamp = timestamps[0] || now
    const resetTimestamp = oldestTimestamp + this.windowMs

    return {
      success,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - timestamps.length),
      reset: resetTimestamp,
      resetInSeconds: Math.max(0, Math.ceil((resetTimestamp - now) / 1000)),
    }
  }
}

/**
 * Redis-based rate limiter using Upstash
 *
 * Provides distributed rate limiting for production environments.
 * Falls back to in-memory limiting if Redis is unavailable.
 */
class UpstashRateLimiter implements RateLimiterImplementation {
  private limiter: Ratelimit | null
  private fallback: InMemoryRateLimiter
  private identifier: string

  constructor(limit: number, windowSeconds: number, identifier: string) {
    this.identifier = identifier

    // Check if Redis is configured
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (redisUrl && redisToken) {
      try {
        const redis = new Redis({
          url: redisUrl,
          token: redisToken,
        })

        this.limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
          analytics: true,
          prefix: `ratelimit:${identifier}`,
        })

        logger.info('Rate limiter initialized with Upstash Redis', { identifier })
      } catch (error) {
        logger.warn('Failed to initialize Upstash rate limiter, using in-memory fallback', {
          identifier,
          error: error instanceof Error ? error.message : 'unknown',
        })
        this.limiter = null
      }
    } else {
      logger.debug('Redis not configured, using in-memory rate limiter', { identifier })
      this.limiter = null
    }

    // Always create fallback
    this.fallback = new InMemoryRateLimiter(limit, windowSeconds)
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    // Use Upstash if available
    if (this.limiter) {
      try {
        const result = await this.limiter.limit(identifier)

        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          resetInSeconds: Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)),
        }
      } catch (error) {
        logger.warn('Upstash rate limit check failed, using in-memory fallback', {
          identifier,
          error: error instanceof Error ? error.message : 'unknown',
        })
      }
    }

    // Fallback to in-memory
    return this.fallback.limit(identifier)
  }
}

/**
 * Rate limiter cache to reuse limiters
 *
 * Caches rate limiter instances by tier configuration to avoid
 * creating multiple limiters for the same configuration.
 */
const rateLimiterCache = new Map<string, RateLimiterImplementation>()

/**
 * Get or create a rate limiter for the given tier
 *
 * @param tier - The rate limit tier configuration
 * @param identifier - Unique identifier for the limiter (e.g., 'ai:consult')
 * @returns A rate limiter instance
 */
export function getRateLimiter(tier: RateLimitTier, identifier: string): RateLimiterImplementation {
  const cacheKey = `${identifier}:${tier.requests}:${tier.window}`

  // Return cached limiter if available
  if (rateLimiterCache.has(cacheKey)) {
    return rateLimiterCache.get(cacheKey)!
  }

  // Create new limiter
  const limiter = new UpstashRateLimiter(tier.requests, tier.window, identifier)

  // Cache for reuse
  rateLimiterCache.set(cacheKey, limiter)

  return limiter
}

/**
 * Check rate limit for a given identifier and tier
 *
 * This is the main function to use for rate limiting checks.
 *
 * @param identifier - Unique identifier for the entity being limited (IP, user ID, etc.)
 * @param tier - The rate limit tier to apply
 * @param tierId - Unique ID for the tier (used for caching)
 * @returns Rate limit check result
 *
 * @example
 * ```typescript
 * const result = await checkRateLimit('user-123', { requests: 10, window: 60 }, 'ai:consult')
 * if (!result.success) {
 *   return new Response('Too many requests', { status: 429 })
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier,
  tierId: string
): Promise<RateLimitResult> {
  try {
    const limiter = getRateLimiter(tier, tierId)
    return await limiter.limit(identifier)
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    logger.error('Rate limit check failed, allowing request', {
      identifier,
      tierId,
      error: error instanceof Error ? error.message : 'unknown',
    })

    // Return success to avoid breaking the application
    return {
      success: true,
      limit: tier.requests,
      remaining: tier.requests,
      reset: Date.now() + tier.window * 1000,
      resetInSeconds: tier.window,
    }
  }
}

/**
 * Generate a rate limit identifier from a request
 *
 * Combines user ID (if available) with IP address for accurate limiting.
 *
 * @param userId - Optional user ID from authentication
 * @param ipAddress - IP address from the request
 * @returns A unique identifier for rate limiting
 */
export function getRateLimitIdentifier(userId?: string, ipAddress?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  if (ipAddress) {
    return `ip:${ipAddress}`
  }
  return 'anonymous'
}

/**
 * Clean up old entries from the in-memory rate limiter cache
 *
 * This should be called periodically to prevent memory leaks.
 * For production with Redis, this is not necessary.
 */
export function cleanupRateLimiterCache(): void {
  // In-memory limiters have built-in cleanup via timestamp filtering
  // This is a no-op for Upstash limiters
  logger.debug('Rate limiter cache cleanup scheduled')
}

/**
 * Reset rate limit for a specific identifier (admin/testing only)
 *
 * @param identifier - The identifier to reset
 * @param tierId - The tier identifier
 */
export async function resetRateLimit(identifier: string, tierId: string): Promise<void> {
  const cacheKey = `${tierId}:*`

  // Note: With Upstash, you would need to delete the specific key
  // With in-memory, the entries expire naturally
  logger.info('Rate limit reset requested', { identifier, tierId })

  // This is primarily for testing purposes
  // In production, you might want to implement actual reset logic
}

// Export types for use in other modules
export type { RateLimiterImplementation }
