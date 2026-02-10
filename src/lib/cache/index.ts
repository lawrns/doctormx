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

// Core cache operations
export { cache, getCacheClient } from './cache'

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

export default {
  cache,
  TTL,
  CacheTags,
  getCacheClient,
  getCacheHealth,
}
