/**
 * Cache Operations
 *
 * High-level caching interface with:
 * - Tag-based cache invalidation
 * - Automatic cache key management
 * - Type-safe operations
 * - Performance monitoring
 * - Graceful fallback to in-memory cache
 */

import { getCacheClient, getCacheHealth } from './client'
import {
  doctorProfileKey,
  doctorListKey,
  doctorBySpecialtyKey,
  doctorAvailabilityKey,
  doctorSubscriptionKey,
  doctorPremiumStatusKey,
  doctorUsageKey,
  appointmentAvailabilityKey,
  appointmentOccupiedKey,
  specialtiesListKey,
  specialtyBySlugKey,
  patientProfileKey,
  patientAppointmentsKey,
  subscriptionStatusKey,
  subscriptionDetailsKey,
  subscriptionUsageKey,
  premiumAccessKey,
  tagKey,
  entityTagsKey,
  doctorReviewsKey,
  doctorRatingKey,
  searchResultsKey,
  CacheTags,
  type CacheTag,
} from './keys'
import {
  TTL_DOCTOR_PROFILE,
  TTL_DOCTOR_LIST,
  TTL_SPECIALTIES_LIST,
  TTL_APPOINTMENT_AVAILABILITY,
  TTL_PREMIUM_STATUS,
  TTL_AI_RESPONSE,
  TTL_REVIEW,
  TTL_SEARCH_RESULTS,
  TTL_CACHE_TAG,
} from './ttl'
import { logger } from '@/lib/observability/logger'

// ============================================================================
// Types
// ============================================================================

export interface CacheResult<T> {
  hit: boolean
  data: T | null
  latency: number
}

export interface CacheSetOptions {
  ttl?: number
  tags?: CacheTag[]
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
  connected: boolean
  type: 'redis' | 'memory'
}

// ============================================================================
// Cache Statistics (in-memory)
// ============================================================================

let cacheHits = 0
let cacheMisses = 0

function recordHit(): void {
  cacheHits++
}

function recordMiss(): void {
  cacheMisses++
}

export function getCacheStats(): CacheStats {
  const health = getCacheHealth().then((h) => ({ connected: h.connected, type: h.type }))

  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: cacheHits + cacheMisses > 0 ? cacheHits / (cacheHits + cacheMisses) : 0,
    totalKeys: 0, // Would require async operation
    connected: false, // Placeholder, actual value from health
    type: 'redis', // Placeholder, actual value from health
  }
}

export function resetCacheStats(): void {
  cacheHits = 0
  cacheMisses = 0
}

// ============================================================================
// Core Cache Operations
// ============================================================================

/**
 * Get a value from cache with timing and statistics
 */
async function getFromCache<T>(key: string): Promise<CacheResult<T>> {
  const start = Date.now()
  const client = getCacheClient()

  try {
    const value = await client.get<T>(key)
    const latency = Date.now() - start

    if (value !== null) {
      recordHit()
      return { hit: true, data: value, latency }
    }

    recordMiss()
    return { hit: false, data: null, latency }
  } catch (error) {
    logger.error('Cache get error', { key, error })
    recordMiss()
    return { hit: false, data: null, latency: Date.now() - start }
  }
}

/**
 * Set a value in cache with optional tags and TTL
 */
async function setInCache<T>(
  key: string,
  value: T,
  options: CacheSetOptions = {}
): Promise<boolean> {
  const client = getCacheClient()
  const { ttl, tags } = options

  try {
    // Set the main cache value
    const success = await client.set(key, value, ttl)

    if (!success) {
      logger.warn('Cache set failed', { key, ttl, tags })
      return false
    }

    // Add key to tag sets for invalidation
    if (tags && tags.length > 0) {
      await Promise.all(
        tags.map(async (tag) => {
          try {
            await client.sadd(tagKey(tag), key)
            // Set TTL on tag key to ensure cleanup
            await client.expire(tagKey(tag), TTL_CACHE_TAG)
          } catch (error) {
            logger.error('Failed to add key to tag', { key, tag, error })
          }
        })
      )
    }

    return true
  } catch (error) {
    logger.error('Cache set error', { key, error })
    return false
  }
}

/**
 * Delete a key from cache and remove from all tag sets
 */
async function deleteFromCache(key: string): Promise<boolean> {
  const client = getCacheClient()

  try {
    // Remove from all tag sets
    // Note: This is expensive, in production consider tracking tags separately
    const allTags = Object.values(CacheTags)
    for (const tag of allTags) {
      try {
        await client.srem(tagKey(tag), key)
      } catch {
        // Ignore errors in tag cleanup
      }
    }

    // Delete the key
    await client.del(key)
    return true
  } catch (error) {
    logger.error('Cache delete error', { key, error })
    return false
  }
}

/**
 * Invalidate all cache keys with a specific tag
 */
async function invalidateTag(tag: CacheTag): Promise<number> {
  const client = getCacheClient()

  try {
    const tagSetKey = tagKey(tag)
    const keys = await client.smembers(tagSetKey)

    if (keys.length === 0) {
      return 0
    }

    // Delete all keys in the tag set
    await Promise.all(keys.map((key) => client.del(key)))

    // Clear the tag set
    await client.del(tagSetKey)

    logger.info('Invalidated cache tag', { tag, count: keys.length })
    return keys.length
  } catch (error) {
    logger.error('Tag invalidation error', { tag, error })
    return 0
  }
}

/**
 * Invalidate cache keys matching a pattern
 */
async function invalidatePattern(pattern: string): Promise<number> {
  const client = getCacheClient()

  try {
    const keys = await client.keys(pattern)

    if (keys.length === 0) {
      return 0
    }

    await Promise.all(keys.map((key) => client.del(key)))

    logger.info('Invalidated cache pattern', { pattern, count: keys.length })
    return keys.length
  } catch (error) {
    logger.error('Pattern invalidation error', { pattern, error })
    return 0
  }
}

// ============================================================================
// Doctor Cache Operations
// ============================================================================

/**
 * Get doctor profile from cache
 */
export async function getDoctorProfile(doctorId: string): Promise<unknown | null> {
  const key = doctorProfileKey(doctorId)
  const result = await getFromCache<unknown>(key)

  if (result.hit) {
    logger.debug('Doctor profile cache hit', { doctorId, latency: result.latency })
  }

  return result.data
}

/**
 * Set doctor profile in cache
 */
export async function setDoctorProfile(
  doctorId: string,
  profile: unknown
): Promise<boolean> {
  const key = doctorProfileKey(doctorId)
  return setInCache(key, profile, {
    ttl: TTL_DOCTOR_PROFILE,
    tags: [CacheTags.DOCTOR_PROFILE],
  })
}

/**
 * Invalidate all cache entries for a specific doctor
 */
export async function invalidateDoctor(doctorId: string): Promise<boolean> {
  try {
    // Invalidate doctor profile
    await deleteFromCache(doctorProfileKey(doctorId))

    // Invalidate doctor availability
    await invalidatePattern(`doctor:availability:${doctorId}:*`)

    // Invalidate doctor lists (they contain this doctor)
    await invalidateTag(CacheTags.DOCTOR_LIST)

    // Invalidate doctor subscriptions
    await deleteFromCache(doctorSubscriptionKey(doctorId))
    await deleteFromCache(doctorPremiumStatusKey(doctorId))

    logger.info('Invalidated doctor cache', { doctorId })
    return true
  } catch (error) {
    logger.error('Doctor cache invalidation error', { doctorId, error })
    return false
  }
}

/**
 * Get doctor list from cache
 */
export async function getDoctorList(
  filters: Record<string, unknown> = {}
): Promise<unknown[]> {
  const key = doctorListKey(filters)
  const result = await getFromCache<unknown[]>(key)

  if (result.hit) {
    logger.debug('Doctor list cache hit', { filters, latency: result.latency })
  }

  return result.data || []
}

/**
 * Set doctor list in cache
 */
export async function setDoctorList(
  doctors: unknown[],
  filters: Record<string, unknown> = {}
): Promise<boolean> {
  const key = doctorListKey(filters)
  return setInCache(key, doctors, {
    ttl: TTL_DOCTOR_LIST,
    tags: [CacheTags.DOCTOR_LIST],
  })
}

/**
 * Get doctors by specialty from cache
 */
export async function getDoctorsBySpecialty(
  specialtySlug: string,
  city?: string
): Promise<unknown[]> {
  const key = doctorBySpecialtyKey(specialtySlug, city)
  const result = await getFromCache<unknown[]>(key)

  if (result.hit) {
    logger.debug('Doctors by specialty cache hit', {
      specialtySlug,
      city,
      latency: result.latency,
    })
  }

  return result.data || []
}

/**
 * Set doctors by specialty in cache
 */
export async function setDoctorsBySpecialty(
  specialtySlug: string,
  doctors: unknown[],
  city?: string
): Promise<boolean> {
  const key = doctorBySpecialtyKey(specialtySlug, city)
  return setInCache(key, doctors, {
    ttl: TTL_DOCTOR_LIST,
    tags: [CacheTags.DOCTOR_LIST],
  })
}

// ============================================================================
// Specialty Cache Operations
// ============================================================================

/**
 * Get specialties list from cache
 */
export async function getSpecialtiesList(): Promise<unknown[]> {
  const key = specialtiesListKey()
  const result = await getFromCache<unknown[]>(key)

  if (result.hit) {
    logger.debug('Specialties list cache hit', { latency: result.latency })
  }

  return result.data || []
}

/**
 * Set specialties list in cache
 */
export async function setSpecialtiesList(specialties: unknown[]): Promise<boolean> {
  const key = specialtiesListKey()
  return setInCache(key, specialties, {
    ttl: TTL_SPECIALTIES_LIST,
    tags: [CacheTags.SPECIALTIES],
  })
}

/**
 * Invalidate specialties cache
 */
export async function invalidateSpecialties(): Promise<boolean> {
  try {
    await invalidateTag(CacheTags.SPECIALTIES)
    logger.info('Invalidated specialties cache')
    return true
  } catch (error) {
    logger.error('Specialties cache invalidation error', { error })
    return false
  }
}

// ============================================================================
// Appointment Cache Operations
// ============================================================================

/**
 * Get available appointment slots from cache
 */
export async function getAppointmentAvailability(
  doctorId: string,
  date: string
): Promise<string[]> {
  const key = appointmentAvailabilityKey(doctorId, date)
  const result = await getFromCache<string[]>(key)

  if (result.hit) {
    logger.debug('Appointment availability cache hit', {
      doctorId,
      date,
      latency: result.latency,
    })
  }

  return result.data || []
}

/**
 * Set available appointment slots in cache
 */
export async function setAppointmentAvailability(
  doctorId: string,
  date: string,
  slots: string[]
): Promise<boolean> {
  const key = appointmentAvailabilityKey(doctorId, date)
  return setInCache(key, slots, {
    ttl: TTL_APPOINTMENT_AVAILABILITY,
    tags: [CacheTags.APPOINTMENT_AVAILABILITY],
  })
}

/**
 * Invalidate appointment availability for a doctor
 */
export async function invalidateAppointmentAvailability(
  doctorId: string,
  date?: string
): Promise<boolean> {
  try {
    if (date) {
      await deleteFromCache(appointmentAvailabilityKey(doctorId, date))
    } else {
      await invalidatePattern(`appointment:availability:${doctorId}:*`)
    }

    logger.info('Invalidated appointment availability', { doctorId, date })
    return true
  } catch (error) {
    logger.error('Appointment availability invalidation error', {
      doctorId,
      date,
      error,
    })
    return false
  }
}

// ============================================================================
// Premium/Subscription Cache Operations
// ============================================================================

/**
 * Get premium status from cache
 */
export async function getPremiumStatus(doctorId: string): Promise<unknown | null> {
  const key = doctorPremiumStatusKey(doctorId)
  const result = await getFromCache<unknown>(key)

  if (result.hit) {
    logger.debug('Premium status cache hit', { doctorId, latency: result.latency })
  }

  return result.data
}

/**
 * Set premium status in cache
 */
export async function setPremiumStatus(
  doctorId: string,
  status: unknown
): Promise<boolean> {
  const key = doctorPremiumStatusKey(doctorId)
  return setInCache(key, status, {
    ttl: TTL_PREMIUM_STATUS,
    tags: [CacheTags.PREMIUM_STATUS],
  })
}

/**
 * Get subscription status from cache
 */
export async function getSubscriptionStatus(doctorId: string): Promise<unknown | null> {
  const key = subscriptionStatusKey(doctorId)
  const result = await getFromCache<unknown>(key)

  if (result.hit) {
    logger.debug('Subscription status cache hit', { doctorId, latency: result.latency })
  }

  return result.data
}

/**
 * Set subscription status in cache
 */
export async function setSubscriptionStatus(
  doctorId: string,
  status: unknown
): Promise<boolean> {
  const key = subscriptionStatusKey(doctorId)
  return setInCache(key, status, {
    ttl: TTL_PREMIUM_STATUS,
    tags: [CacheTags.DOCTOR_SUBSCRIPTION],
  })
}

/**
 * Invalidate subscription cache for a doctor
 */
export async function invalidateSubscription(doctorId: string): Promise<boolean> {
  try {
    await deleteFromCache(subscriptionStatusKey(doctorId))
    await deleteFromCache(subscriptionDetailsKey(doctorId))
    await deleteFromCache(doctorPremiumStatusKey(doctorId))
    await deleteFromCache(premiumAccessKey(doctorId))

    logger.info('Invalidated subscription cache', { doctorId })
    return true
  } catch (error) {
    logger.error('Subscription cache invalidation error', { doctorId, error })
    return false
  }
}

// ============================================================================
// Patient Cache Operations
// ============================================================================

/**
 * Get patient profile from cache
 */
export async function getPatientProfile(patientId: string): Promise<unknown | null> {
  const key = patientProfileKey(patientId)
  const result = await getFromCache<unknown>(key)

  if (result.hit) {
    logger.debug('Patient profile cache hit', { patientId, latency: result.latency })
  }

  return result.data
}

/**
 * Set patient profile in cache
 */
export async function setPatientProfile(
  patientId: string,
  profile: unknown
): Promise<boolean> {
  const key = patientProfileKey(patientId)
  return setInCache(key, profile, {
    ttl: TTL_DOCTOR_PROFILE, // Same as doctor profile
    tags: [CacheTags.PATIENT_PROFILE],
  })
}

/**
 * Invalidate patient cache
 */
export async function invalidatePatient(patientId: string): Promise<boolean> {
  try {
    await deleteFromCache(patientProfileKey(patientId))
    await invalidatePattern(`appointment:patient:${patientId}:*`)

    logger.info('Invalidated patient cache', { patientId })
    return true
  } catch (error) {
    logger.error('Patient cache invalidation error', { patientId, error })
    return false
  }
}

// ============================================================================
// Review Cache Operations
// ============================================================================

/**
 * Get doctor reviews from cache
 */
export async function getDoctorReviews(doctorId: string): Promise<unknown[]> {
  const key = doctorReviewsKey(doctorId)
  const result = await getFromCache<unknown[]>(key)

  if (result.hit) {
    logger.debug('Doctor reviews cache hit', { doctorId, latency: result.latency })
  }

  return result.data || []
}

/**
 * Set doctor reviews in cache
 */
export async function setDoctorReviews(
  doctorId: string,
  reviews: unknown[]
): Promise<boolean> {
  const key = doctorReviewsKey(doctorId)
  return setInCache(key, reviews, {
    ttl: TTL_REVIEW,
    tags: [CacheTags.DOCTOR_PROFILE], // Reviews affect profile
  })
}

/**
 * Invalidate reviews cache for a doctor
 */
export async function invalidateDoctorReviews(doctorId: string): Promise<boolean> {
  try {
    await deleteFromCache(doctorReviewsKey(doctorId))
    await deleteFromCache(doctorRatingKey(doctorId))
    // Reviews affect doctor profile
    await deleteFromCache(doctorProfileKey(doctorId))

    logger.info('Invalidated doctor reviews cache', { doctorId })
    return true
  } catch (error) {
    logger.error('Doctor reviews cache invalidation error', { doctorId, error })
    return false
  }
}

// ============================================================================
// Search Cache Operations
// ============================================================================

/**
 * Get search results from cache
 */
export async function getSearchResults(
  queryHash: string,
  filters: Record<string, unknown> = {}
): Promise<unknown[]> {
  const key = searchResultsKey(queryHash, filters)
  const result = await getFromCache<unknown[]>(key)

  if (result.hit) {
    logger.debug('Search results cache hit', { queryHash, latency: result.latency })
  }

  return result.data || []
}

/**
 * Set search results in cache
 */
export async function setSearchResults(
  queryHash: string,
  results: unknown[],
  filters: Record<string, unknown> = {}
): Promise<boolean> {
  const key = searchResultsKey(queryHash, filters)
  return setInCache(key, results, {
    ttl: TTL_SEARCH_RESULTS,
    tags: [CacheTags.SEARCH_RESULTS],
  })
}

/**
 * Invalidate all search results
 */
export async function invalidateSearchResults(): Promise<boolean> {
  try {
    await invalidateTag(CacheTags.SEARCH_RESULTS)
    logger.info('Invalidated search results cache')
    return true
  } catch (error) {
    logger.error('Search results cache invalidation error', { error })
    return false
  }
}

// ============================================================================
// Generic Cache Operations
// ============================================================================

/**
 * Generic get operation
 */
export async function get<T>(key: string): Promise<T | null> {
  const result = await getFromCache<T>(key)
  return result.data
}

/**
 * Generic set operation
 */
export async function set<T>(
  key: string,
  value: T,
  ttl?: number,
  tags?: CacheTag[]
): Promise<boolean> {
  return setInCache(key, value, { ttl, tags })
}

/**
 * Generic delete operation
 */
export async function del(key: string): Promise<boolean> {
  return deleteFromCache(key)
}

/**
 * Generic pattern invalidation
 */
export async function invalidate(pattern: string): Promise<number> {
  return invalidatePattern(pattern)
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAll(): Promise<boolean> {
  const client = getCacheClient()

  try {
    // For Redis, we can't use FLUSHALL due to security restrictions
    // Instead, we'll invalidate all known tags
    const allTags = Object.values(CacheTags)
    await Promise.all(allTags.map((tag) => invalidateTag(tag)))

    logger.warn('Cleared all cache via tag invalidation')
    return true
  } catch (error) {
    logger.error('Cache clear error', { error })
    return false
  }
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Get cache health status
 */
export async function getHealth(): Promise<{
  connected: boolean
  type: 'redis' | 'memory'
  latency: number
  stats: CacheStats
}> {
  const health = await getCacheHealth()
  const stats = getCacheStats()

  return {
    connected: health.connected,
    type: health.type,
    latency: health.latency || 0,
    stats,
  }
}

// ============================================================================
// Default Export - Unified Cache Interface
// ============================================================================

export const cache = {
  // Core operations
  get,
  set,
  del,
  invalidate,

  // Doctor operations
  getDoctorProfile,
  setDoctorProfile,
  getDoctorList,
  setDoctorList,
  getDoctorsBySpecialty,
  setDoctorsBySpecialty,
  invalidateDoctor,

  // Specialty operations
  getSpecialtiesList,
  setSpecialtiesList,
  invalidateSpecialties,

  // Appointment operations
  getAppointmentAvailability,
  setAppointmentAvailability,
  invalidateAppointmentAvailability,

  // Premium/Subscription operations
  getPremiumStatus,
  setPremiumStatus,
  getSubscriptionStatus,
  setSubscriptionStatus,
  invalidateSubscription,

  // Patient operations
  getPatientProfile,
  setPatientProfile,
  invalidatePatient,

  // Review operations
  getDoctorReviews,
  setDoctorReviews,
  invalidateDoctorReviews,

  // Search operations
  getSearchResults,
  setSearchResults,
  invalidateSearchResults,

  // Utilities
  clearAll,
  getHealth,
  getStats: getCacheStats,
  resetStats: resetCacheStats,
}

export default cache
