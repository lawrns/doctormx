/**
 * Cache Module Index
 *
 * Centralized export for all caching functionality.
 *
 * Usage:
 *   import { cache, TTL, CacheTags } from '@/lib/cache'
 *
 *   // Set doctor profile with 1 hour TTL
 *   await cache.setDoctorProfile(doctorId, profile)
 *
 *   // Get with custom TTL
 *   await cache.set('key', value, TTL.MINUTES_30)
 *
 *   // Tag-based invalidation
 *   await cache.invalidateTag(CacheTags.DOCTOR_PROFILE)
 */

// Re-export rate limiters (must be before other imports that might use them)
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/observability/logger'
import { getCacheClient as getClient } from './client'
import { TIME, LIMITS } from '@/lib/constants'

// No-op rate limiter for when Redis is not configured
type RateLimitResult = { success: boolean; limit: number; remaining: number; reset: number }
const noopRateLimiter = {
  limit: async (): Promise<RateLimitResult> => ({ 
    success: true, 
    limit: LIMITS.PAGINATION_MAX_LIMIT, 
    remaining: 999, 
    reset: Date.now() + TIME.MINUTE_IN_MS 
  }),
}

// Create rate limiters only when Redis is available
function createRateLimiter(windowSize: number, windowDuration: string, prefix: string) {
  const client = getClient()

  // Check if we're using Redis (has required methods)
  if ('ping' in client && typeof client.ping === 'function') {
    try {
      return new Ratelimit({
        redis: client as unknown as Redis, // Type assertion for Upstash compatibility
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
  ai: createRateLimiter(LIMITS.RATE_LIMIT_AI, '1 m', 'ratelimit:ai'),
  chat: createRateLimiter(LIMITS.RATE_LIMIT_CHAT, '1 m', 'ratelimit:chat'),
  general: createRateLimiter(LIMITS.RATE_LIMIT_GENERAL, '1 m', 'ratelimit:general'),
  auth: createRateLimiter(LIMITS.RATE_LIMIT_AUTH, '1 m', 'ratelimit:auth'),
  payment: createRateLimiter(LIMITS.RATE_LIMIT_AI, '1 m', 'ratelimit:payment'),
  write: createRateLimiter(30, '1 m', 'ratelimit:write'),
  read: createRateLimiter(LIMITS.RATE_LIMIT_GENERAL, '1 m', 'ratelimit:read'),
}

// Core cache operations
export { cache } from './cache'
export { getCacheClient, redis } from './client'

// Re-export core types
export type { CacheResult, CacheSetOptions, CacheStats } from './cache'

// TTL constants
export {
  TTL_MINIMAL,
  TTL_SHORT,
  TTL_MEDIUM,
  TTL_LONG,
  TTL_EXTENDED,
  TTL_DOCTOR_PROFILE,
  TTL_DOCTOR_LIST,
  TTL_SPECIALTIES_LIST,
  TTL_APPOINTMENT_AVAILABILITY,
  TTL_PREMIUM_STATUS,
  TTL_USER_SESSION,
  TTL_RATE_LIMIT,
  TTL_CACHE_TAG,
  TTL_AI_RESPONSE,
  TTL_TRIAGE_RESULT,
  TTL_PRESCRIPTION,
  TTL_REVIEW,
  TTL_ANALYTICS,
  TTL_SEARCH_RESULTS,
  TTL_LOCATION_DATA,
  TTL_MAP,
  getTtl,
  getTtlDescription,
  ttlToMs,
  ttlToMinutes,
  ttlToHours,
  minutesToTtl,
  hoursToTtl,
  daysToTtl,
} from './ttl'

// Tag type
export type { CacheTag } from './keys'

// Cache tags
export { CacheTags } from './keys'

// Key generators
export {
  doctorProfileKey,
  doctorListKey,
  doctorBySpecialtyKey,
  doctorAvailabilityKey,
  doctorSubscriptionKey,
  doctorPremiumStatusKey,
  doctorUsageKey,
  appointmentAvailabilityKey,
  appointmentOccupiedKey,
  appointmentKey,
  patientAppointmentsKey,
  doctorAppointmentsKey,
  specialtiesListKey,
  specialtyKey,
  specialtyBySlugKey,
  patientProfileKey,
  patientMedicalHistoryKey,
  subscriptionStatusKey,
  subscriptionDetailsKey,
  subscriptionUsageKey,
  premiumAccessKey,
  aiResponseKey,
  aiTriageKey,
  aiUsageKey,
  rateLimitKey,
  quotaKey,
  sessionKey,
  csrfTokenKey,
  tagKey,
  entityTagsKey,
  doctorReviewsKey,
  doctorRatingKey,
  searchResultsKey,
  locationDataKey,
  parseCacheKey,
  keyMatchesPattern,
  getKeyNamespace,
  hashObject,
  CacheNamespace,
} from './keys'

// Client utilities
export {
  getCacheHealth,
  isUsingFallbackMemoryCache,
  resetCacheClient,
} from './client'

// Re-export client for direct usage if needed
export type { CacheClient } from './client'

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * TTL object for easy access
 */
export const TTL = {
  MINIMAL: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 900, // 15 minutes
  LONG: 3600, // 1 hour
  EXTENDED: 86400, // 24 hours

  // Domain-specific
  DOCTOR_PROFILE: 3600, // 1 hour
  DOCTOR_LIST: 900, // 15 minutes
  SPECIALTIES_LIST: 86400, // 24 hours
  APPOINTMENT_AVAILABILITY: 300, // 5 minutes
  PREMIUM_STATUS: 900, // 15 minutes

  // Helpers
  MINUTES_5: 300,
  MINUTES_15: 900,
  MINUTES_30: 1800,
  HOUR_1: 3600,
  HOURS_4: 14400,
  HOURS_24: 86400,
  DAYS_7: 604800,
} as const

// ============================================================================
// Default Export
// ============================================================================

import { cache } from './cache'
import { getCacheClient, getCacheHealth } from './client'
import { CacheTags } from './keys'

export default {
  cache,
  TTL,
  CacheTags,
  getCacheClient,
  getCacheHealth,
  rateLimit,
}
