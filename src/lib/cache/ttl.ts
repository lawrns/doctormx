/**
 * Cache TTL (Time-To-Live) Constants
 *
 * Defines cache expiration durations for different data types.
 * Values are in seconds.
 *
 * TTL Strategy:
 * - Static data (rarely changes): 24 hours
 * - Semi-static data (changes occasionally): 1-4 hours
 * - Dynamic data (changes frequently): 5-15 minutes
 * - Real-time data (changes constantly): 1-2 minutes
 */

// ============================================================================
// Core TTL Constants
// ============================================================================

/**
 * Very short TTL for highly dynamic data
 * Used for: rate limiting, real-time availability
 */
export const TTL_MINIMAL = 60 // 1 minute

/**
 * Short TTL for frequently changing data
 * Used for: appointment availability, active sessions
 */
export const TTL_SHORT = 300 // 5 minutes

/**
 * Medium TTL for moderately dynamic data
 * Used for: user sessions, doctor status, premium checks
 */
export const TTL_MEDIUM = 900 // 15 minutes

/**
 * Long TTL for relatively static data
 * Used for: doctor profiles, user profiles
 */
export const TTL_LONG = 3600 // 1 hour

/**
 * Very long TTL for rarely changing data
 * Used for: specialties list, configuration data
 */
export const TTL_EXTENDED = 86400 // 24 hours

// ============================================================================
// Domain-Specific TTL Constants
// ============================================================================

/**
 * Doctor profile TTL
 * Doctor profiles change infrequently (bio, photo, credentials)
 * Invalidated on profile update
 */
export const TTL_DOCTOR_PROFILE = TTL_LONG // 1 hour

/**
 * Doctor list TTL
 * Lists of doctores (by specialty, location, etc.)
 * Invalidated when any doctor profile changes
 */
export const TTL_DOCTOR_LIST = TTL_MEDIUM // 15 minutes

/**
 * Specialty list TTL
 * List of medical specialties rarely changes
 * Very long TTL with manual invalidation on admin changes
 */
export const TTL_SPECIALTIES_LIST = TTL_EXTENDED // 24 hours

/**
 * Appointment availability TTL
 * Real-time availability changes frequently
 * Short TTL to balance freshness with performance
 */
export const TTL_APPOINTMENT_AVAILABILITY = TTL_SHORT // 5 minutes

/**
 * Premium subscription status TTL
 * Subscription status changes on renewal/cancellation
 * Invalidated on subscription changes
 */
export const TTL_PREMIUM_STATUS = TTL_MEDIUM // 15 minutes

/**
 * User session TTL
 * Active user sessions
 */
export const TTL_USER_SESSION = TTL_MEDIUM // 15 minutes

/**
 * Rate limit TTL
 * How long rate limit counters persist
 */
export const TTL_RATE_LIMIT = TTL_SHORT // 5 minutes

/**
 * Cache tag TTL
 * How long tag-to-key mappings persist
 * Should be longer than any cached item
 */
export const TTL_CACHE_TAG = TTL_EXTENDED // 24 hours

// ============================================================================
// Feature-Specific TTL Constants
// ============================================================================

/**
 * AI copilot response TTL
 * Cached AI responses to reduce API calls
 */
export const TTL_AI_RESPONSE = TTL_LONG // 1 hour

/**
 * Triage result TTL
 * Medical triage assessments
 */
export const TTL_TRIAGE_RESULT = TTL_LONG // 1 hour

/**
 * Prescription data TTL
 * Generated prescriptions
 */
export const TTL_PRESCRIPTION = TTL_LONG // 1 hour

/**
 * Review TTL
 * Doctor reviews and ratings
 */
export const TTL_REVIEW = TTL_MEDIUM // 15 minutes

/**
 * Analytics data TTL
 * Aggregated analytics and statistics
 */
export const TTL_ANALYTICS = TTL_MEDIUM // 15 minutes

/**
 * Search results TTL
 * Cached search results
 */
export const TTL_SEARCH_RESULTS = TTL_SHORT // 5 minutes

/**
 * Location-based data TTL
 * City/region specific data
 */
export const TTL_LOCATION_DATA = TTL_LONG // 1 hour

// ============================================================================
// TTL Utilities
// ============================================================================

/**
 * Convert TTL to milliseconds
 */
export function ttlToMs(ttl: number): number {
  return ttl * 1000
}

/**
 * Convert TTL to minutes
 */
export function ttlToMinutes(ttl: number): number {
  return Math.floor(ttl / 60)
}

/**
 * Convert TTL to hours
 */
export function ttlToHours(ttl: number): number {
  return Math.floor(ttl / 3600)
}

/**
 * Convert minutes to TTL (seconds)
 */
export function minutesToTtl(minutes: number): number {
  return minutes * 60
}

/**
 * Convert hours to TTL (seconds)
 */
export function hoursToTtl(hours: number): number {
  return hours * 3600
}

/**
 * Convert days to TTL (seconds)
 */
export function daysToTtl(days: number): number {
  return days * 86400
}

/**
 * Get a human-readable TTL description
 */
export function getTtlDescription(ttl: number): string {
  if (ttl < 60) return `${ttl} seconds`
  if (ttl < 3600) return `${ttlToMinutes(ttl)} minutes`
  if (ttl < 86400) return `${ttlToHours(ttl)} hours`
  return `${ttlToHours(ttl) / 24} days`
}

// ============================================================================
// TTL Groups for Bulk Operations
// ============================================================================

/**
 * All TTL values as a mapping for easy access
 */
export const TTL_MAP = {
  minimal: TTL_MINIMAL,
  short: TTL_SHORT,
  medium: TTL_MEDIUM,
  long: TTL_LONG,
  extended: TTL_EXTENDED,

  doctor_profile: TTL_DOCTOR_PROFILE,
  doctor_list: TTL_DOCTOR_LIST,
  specialties_list: TTL_SPECIALTIES_LIST,
  appointment_availability: TTL_APPOINTMENT_AVAILABILITY,
  premium_status: TTL_PREMIUM_STATUS,
  user_session: TTL_USER_SESSION,
  rate_limit: TTL_RATE_LIMIT,
  cache_tag: TTL_CACHE_TAG,

  ai_response: TTL_AI_RESPONSE,
  triage_result: TTL_TRIAGE_RESULT,
  prescription: TTL_PRESCRIPTION,
  review: TTL_REVIEW,
  analytics: TTL_ANALYTICS,
  search_results: TTL_SEARCH_RESULTS,
  location_data: TTL_LOCATION_DATA,
} as const

export type TtlKey = keyof typeof TTL_MAP

/**
 * Get TTL by key
 */
export function getTtl(key: TtlKey): number {
  return TTL_MAP[key]
}

// ============================================================================
// Default Exports
// ============================================================================

export default {
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
}

