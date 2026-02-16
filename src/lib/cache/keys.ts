/**
 * Cache Key Generators
 *
 * Provides standardized, type-safe cache key generation.
 * Uses a consistent naming pattern for easy debugging and invalidation.
 *
 * Key Pattern:
 *   {namespace}:{entity}:{identifier}:{optional-params}
 *
 * Examples:
 *   doctor:profile:abc123
 *   doctor:list:specialty:cardiologia:city:cdmx
 *   appointment:availability:abc123:2024-01-15
 */

// ============================================================================
// Namespaces
// ============================================================================

export const CacheNamespace = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  APPOINTMENT: 'appointment',
  SPECIALTY: 'specialty',
  SUBSCRIPTION: 'subscription',
  PREMIUM: 'premium',
  SESSION: 'session',
  RATE_LIMIT: 'ratelimit',
  AI: 'ai',
  TRIAGE: 'triage',
  PRESCRIPTION: 'prescription',
  REVIEW: 'review',
  ANALYTICS: 'analytics',
  SEARCH: 'search',
  TAG: 'tag',
  LOCATION: 'location',
} as const

export type CacheNamespace = (typeof CacheNamespace)[keyof typeof CacheNamespace]

// ============================================================================
// Doctor Cache Keys
// ============================================================================

/**
 * Generate key for a single doctor's profile
 * @param doctorId - Doctor's UUID
 */
export function doctorProfileKey(doctorId: string): string {
  return `${CacheNamespace.DOCTOR}:profile:${doctorId}`
}

/**
 * Generate key for doctor list with filters
 * @param filters - Query filters (specialty, city, etc.)
 */
export function doctorListKey(filters: Record<string, unknown> = {}): string {
  // Sort filters for consistent keys
  const sortedEntries = Object.entries(filters).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  const filterString = sortedEntries
    .map(([key, value]) => `${key}:${value}`)
    .join(':')

  return filterString
    ? `${CacheNamespace.DOCTOR}:list:${filterString}`
    : `${CacheNamespace.DOCTOR}:list:all`
}

/**
 * Generate key for doctores by specialty
 * @param specialtySlug - Specialty URL slug
 * @param city - Optional city filter
 */
export function doctorBySpecialtyKey(specialtySlug: string, city?: string): string {
  return city
    ? `${CacheNamespace.DOCTOR}:specialty:${specialtySlug}:city:${city}`
    : `${CacheNamespace.DOCTOR}:specialty:${specialtySlug}`
}

/**
 * Generate key for doctor availability rules
 * @param doctorId - Doctor's UUID
 */
export function doctorAvailabilityKey(doctorId: string): string {
  return `${CacheNamespace.DOCTOR}:availability:${doctorId}`
}

/**
 * Generate key for doctor's subscription status
 * @param doctorId - Doctor's UUID
 */
export function doctorSubscriptionKey(doctorId: string): string {
  return `${CacheNamespace.DOCTOR}:subscription:${doctorId}`
}

/**
 * Generate key for doctor's premium status
 * @param doctorId - Doctor's UUID
 */
export function doctorPremiumStatusKey(doctorId: string): string {
  return `${CacheNamespace.PREMIUM}:status:${doctorId}`
}

/**
 * Generate key for doctor's usage statistics
 * @param doctorId - Doctor's UUID
 */
export function doctorUsageKey(doctorId: string): string {
  return `${CacheNamespace.DOCTOR}:usage:${doctorId}`
}

// ============================================================================
// Appointment Cache Keys
// ============================================================================

/**
 * Generate key for available appointment slots
 * @param doctorId - Doctor's UUID
 * @param date - Date in YYYY-MM-DD format
 */
export function appointmentAvailabilityKey(doctorId: string, date: string): string {
  return `${CacheNamespace.APPOINTMENT}:availability:${doctorId}:${date}`
}

/**
 * Generate key for occupied appointment slots
 * @param doctorId - Doctor's UUID
 * @param date - Date in YYYY-MM-DD format
 */
export function appointmentOccupiedKey(doctorId: string, date: string): string {
  return `${CacheNamespace.APPOINTMENT}:occupied:${doctorId}:${date}`
}

/**
 * Generate key for a specific appointment
 * @param appointmentId - Appointment's UUID
 */
export function appointmentKey(appointmentId: string): string {
  return `${CacheNamespace.APPOINTMENT}:${appointmentId}`
}

/**
 * Generate key for patient's appointments
 * @param patientId - Patient's UUID
 */
export function patientAppointmentsKey(patientId: string): string {
  return `${CacheNamespace.APPOINTMENT}:patient:${patientId}`
}

/**
 * Generate key for doctor's appointments
 * @param doctorId - Doctor's UUID
 */
export function doctorAppointmentsKey(doctorId: string): string {
  return `${CacheNamespace.APPOINTMENT}:doctor:${doctorId}`
}

// ============================================================================
// Specialty Cache Keys
// ============================================================================

/**
 * Generate key for specialties list
 */
export function specialtiesListKey(): string {
  return `${CacheNamespace.SPECIALTY}:list:all`
}

/**
 * Generate key for a single specialty
 * @param specialtyId - Specialty's UUID
 */
export function specialtyKey(specialtyId: string): string {
  return `${CacheNamespace.SPECIALTY}:${specialtyId}`
}

/**
 * Generate key for specialty by slug
 * @param slug - Specialty URL slug
 */
export function specialtyBySlugKey(slug: string): string {
  return `${CacheNamespace.SPECIALTY}:slug:${slug}`
}

// ============================================================================
// Patient Cache Keys
// ============================================================================

/**
 * Generate key for patient profile
 * @param patientId - Patient's UUID
 */
export function patientProfileKey(patientId: string): string {
  return `${CacheNamespace.PATIENT}:profile:${patientId}`
}

/**
 * Generate key for patient's medical history
 * @param patientId - Patient's UUID
 */
export function patientMedicalHistoryKey(patientId: string): string {
  return `${CacheNamespace.PATIENT}:medical-history:${patientId}`
}

// ============================================================================
// Subscription & Premium Cache Keys
// ============================================================================

/**
 * Generate key for subscription status
 * @param doctorId - Doctor's UUID
 */
export function subscriptionStatusKey(doctorId: string): string {
  return `${CacheNamespace.SUBSCRIPTION}:status:${doctorId}`
}

/**
 * Generate key for subscription details
 * @param doctorId - Doctor's UUID
 */
export function subscriptionDetailsKey(doctorId: string): string {
  return `${CacheNamespace.SUBSCRIPTION}:details:${doctorId}`
}

/**
 * Generate key for subscription usage tracking
 * @param doctorId - Doctor's UUID
 * @param feature - Feature name (whatsapp, ai_copilot, image_analysis)
 */
export function subscriptionUsageKey(doctorId: string, feature: string): string {
  return `${CacheNamespace.SUBSCRIPTION}:usage:${doctorId}:${feature}`
}

/**
 * Generate key for premium features access
 * @param doctorId - Doctor's UUID
 */
export function premiumAccessKey(doctorId: string): string {
  return `${CacheNamespace.PREMIUM}:access:${doctorId}`
}

// ============================================================================
// AI Cache Keys
// ============================================================================

/**
 * Generate key for AI copilot response
 * @param queryHash - Hash of the query for deduplication
 */
export function aiResponseKey(queryHash: string): string {
  return `${CacheNamespace.AI}:response:${queryHash}`
}

/**
 * Generate key for AI triage result
 * @param symptomsHash - Hash of symptoms for deduplication
 */
export function aiTriageKey(symptomsHash: string): string {
  return `${CacheNamespace.AI}:triage:${symptomsHash}`
}

/**
 * Generate key for AI usage count
 * @param doctorId - Doctor's UUID
 * @param feature - Feature name (copilot, vision, etc.)
 */
export function aiUsageKey(doctorId: string, feature: string): string {
  return `${CacheNamespace.AI}:usage:${doctorId}:${feature}`
}

// ============================================================================
// Rate Limiting Cache Keys
// ============================================================================

/**
 * Generate key for rate limiting
 * @param identifier - IP address, user ID, or other identifier
 * @param endpoint - API endpoint or action
 */
export function rateLimitKey(identifier: string, endpoint: string): string {
  return `${CacheNamespace.RATE_LIMIT}:${identifier}:${endpoint}`
}

/**
 * Generate key for quota tracking
 * @param userId - User's UUID
 * @param resource - Resource type (api_calls, messages, etc.)
 */
export function quotaKey(userId: string, resource: string): string {
  return `${CacheNamespace.RATE_LIMIT}:quota:${userId}:${resource}`
}

// ============================================================================
// Session & Authentication Cache Keys
// ============================================================================

/**
 * Generate key for user session
 * @param userId - User's UUID
 * @param sessionId - Session token or ID
 */
export function sessionKey(userId: string, sessionId: string): string {
  return `${CacheNamespace.SESSION}:${userId}:${sessionId}`
}

/**
 * Generate key for CSRF token
 * @param sessionId - Session ID
 */
export function csrfTokenKey(sessionId: string): string {
  return `${CacheNamespace.SESSION}:csrf:${sessionId}`
}

// ============================================================================
// Tag-Based Cache Keys
// ============================================================================

/**
 * Generate key for a cache tag (stores set of related cache keys)
 * @param tag - Tag name
 */
export function tagKey(tag: string): string {
  return `${CacheNamespace.TAG}:${tag}`
}

/**
 * Generate key for entity tags (all tags for an entity)
 * @param entityType - Type of entity (doctor, patient, etc.)
 * @param entityId - Entity's UUID
 */
export function entityTagsKey(entityType: string, entityId: string): string {
  return `${CacheNamespace.TAG}:entity:${entityType}:${entityId}`
}

// ============================================================================
// Review & Rating Cache Keys
// ============================================================================

/**
 * Generate key for doctor reviews
 * @param doctorId - Doctor's UUID
 */
export function doctorReviewsKey(doctorId: string): string {
  return `${CacheNamespace.REVIEW}:doctor:${doctorId}`
}

/**
 * Generate key for doctor's average rating
 * @param doctorId - Doctor's UUID
 */
export function doctorRatingKey(doctorId: string): string {
  return `${CacheNamespace.REVIEW}:rating:${doctorId}`
}

// ============================================================================
// Search & Discovery Cache Keys
// ============================================================================

/**
 * Generate key for search results
 * @param queryHash - Hash of search query
 * @param filters - Additional search filters
 */
export function searchResultsKey(queryHash: string, filters: Record<string, unknown> = {}): string {
  const filterString = Object.entries(filters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(':')

  return filterString
    ? `${CacheNamespace.SEARCH}:${queryHash}:${filterString}`
    : `${CacheNamespace.SEARCH}:${queryHash}`
}

/**
 * Generate key for location-based data
 * @param city - City name or slug
 * @param specialty - Optional specialty filter
 */
export function locationDataKey(city: string, specialty?: string): string {
  return specialty
    ? `${CacheNamespace.LOCATION}:${city}:specialty:${specialty}`
    : `${CacheNamespace.LOCATION}:${city}`
}

// ============================================================================
// Key Utilities
// ============================================================================

/**
 * Parse a cache key to extract components
 * @param key - Cache key string
 */
export function parseCacheKey(key: string): {
  namespace: string
  entity?: string
  identifier?: string
  params: string[]
} {
  const parts = key.split(':')
  return {
    namespace: parts[0],
    entity: parts[1],
    identifier: parts[2],
    params: parts.slice(3),
  }
}

/**
 * Check if a key matches a pattern
 * @param key - Cache key string
 * @param pattern - Pattern with * as wildcard
 */
export function keyMatchesPattern(key: string, pattern: string): boolean {
  const regex = new RegExp(
    '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
  )
  return regex.test(key)
}

/**
 * Extract namespace from a cache key
 * @param key - Cache key string
 */
export function getKeyNamespace(key: string): string | null {
  const match = key.match(/^([^:]+):/)
  return match ? match[1] : null
}

/**
 * Generate a hash from an object for cache keys
 * @param obj - Object to hash
 */
export async function hashObject(obj: Record<string, unknown>): Promise<string> {
  const str = JSON.stringify(obj)

  // Simple hash function (for production, use crypto.subtle.digest)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36)
}

// ============================================================================
// Tag Names
// ============================================================================

export const CacheTags = {
  // Doctor tags
  DOCTOR_PROFILE: 'doctor:profile',
  DOCTOR_LIST: 'doctor:list',
  DOCTOR_AVAILABILITY: 'doctor:availability',
  DOCTOR_SUBSCRIPTION: 'doctor:subscription',

  // Specialty tags
  SPECIALTIES: 'specialties',

  // Appointment tags
  APPOINTMENT_AVAILABILITY: 'appointment:availability',
  APPOINTMENT_LIST: 'appointment:list',

  // Premium tags
  PREMIUM_STATUS: 'premium:status',

  // Patient tags
  PATIENT_PROFILE: 'patient:profile',
  PATIENT_APPOINTMENTS: 'patient:appointments',

  // AI tags
  AI_RESPONSES: 'ai:responses',
  AI_USAGE: 'ai:usage',

  // Search tags
  SEARCH_RESULTS: 'search:results',
} as const

export type CacheTag = (typeof CacheTags)[keyof typeof CacheTags]

// ============================================================================
// Default Exports
// ============================================================================

export default {
  CacheNamespace,
  CacheTags,
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
}

