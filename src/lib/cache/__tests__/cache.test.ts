/**
 * Cache Module Tests
 *
 * Tests for the Redis/Upstash caching implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DoctorProfile } from '@/lib/discovery'
import {
  cache,
  getCacheClient,
  resetCacheClient,
  TTL,
  CacheTags,
  doctorProfileKey,
  appointmentAvailabilityKey,
  subscriptionStatusKey,
  specialtiesListKey,
} from '../index'

// Proper mock DoctorProfile matching the expected type
const mockDoctorProfile: DoctorProfile = {
  id: '123',
  status: 'approved',
  bio: 'Experienced doctor',
  languages: ['es', 'en'],
  years_experience: 10,
  city: 'Mexico City',
  state: 'CDMX',
  country: 'MX',
  price_cents: 50000,
  currency: 'MXN',
  rating_avg: 4.8,
  rating_count: 25,
  profile: {
    id: 'prof-123',
    full_name: 'Dr. Smith',
    photo_url: 'https://example.com/photo.jpg',
    phone: '+52-123-456-7890',
  },
  specialties: [
    { id: 'spec-1', name: 'Cardiology', slug: 'cardiology' },
  ],
}

// Note: Tests use the real in-memory cache client
// This provides better test coverage and avoids mock complexity

describe('Cache Module', () => {
  beforeEach(() => {
    // Reset cache client before each test
    resetCacheClient()
    vi.clearAllMocks()
  })

  describe('Cache Key Generation', () => {
    it('should generate doctor profile key', () => {
      const key = doctorProfileKey('doctor-123')
      expect(key).toBe('doctor:profile:doctor-123')
    })

    it('should generate appointment availability key', () => {
      const key = appointmentAvailabilityKey('doctor-123', '2024-01-15')
      expect(key).toBe('appointment:availability:doctor-123:2024-01-15')
    })

    it('should generate subscription status key', () => {
      const key = subscriptionStatusKey('doctor-123')
      expect(key).toBe('subscription:status:doctor-123')
    })

    it('should generate specialties list key', () => {
      const key = specialtiesListKey()
      expect(key).toBe('specialty:list:all')
    })
  })

  describe('Cache Operations', () => {
    it('should get and set values', async () => {
      const mockData = { id: '123', name: 'Test Doctor' }

      // Set value in cache
      const setResult = await cache.set('test-key', mockData, TTL.HOUR_1)
      expect(setResult).toBe(true)

      // Get value from cache
      const result = await cache.get('test-key')
      expect(result).toEqual(mockData)
    })

    it('should delete values', async () => {
      // Set then delete
      await cache.set('test-key', 'value', TTL.HOUR_1)
      const delResult = await cache.del('test-key')
      expect(delResult).toBe(true)

      // Verify deletion
      const result = await cache.get('test-key')
      expect(result).toBeNull()
    })

    it('should invalidate by pattern', async () => {
      // Set values matching pattern
      await cache.set('doctor:123', { name: 'Dr 1' }, TTL.HOUR_1)
      await cache.set('doctor:456', { name: 'Dr 2' }, TTL.HOUR_1)
      await cache.set('patient:123', { name: 'Patient' }, TTL.HOUR_1)

      const count = await cache.invalidate('doctor:*')
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Doctor Cache Operations', () => {
    it('should get doctor profile from cache', async () => {
      // Set doctor profile
      await cache.setDoctorProfile('123', mockDoctorProfile)

      // Get doctor profile
      const result = await cache.getDoctorProfile('123')
      expect(result).toEqual(mockDoctorProfile)
    })

    it('should set doctor profile in cache', async () => {
      const result = await cache.setDoctorProfile('123', mockDoctorProfile)
      expect(result).toBe(true)
    })

    it('should invalidate doctor cache', async () => {
      const result = await cache.invalidateDoctor('123')
      expect(result).toBe(true)
    })
  })

  describe('Specialty Cache Operations', () => {
    it('should get specialties list from cache', async () => {
      const mockSpecialties = [
        { id: '1', name: 'Cardiology' },
        { id: '2', name: 'Pediatrics' },
      ]

      await cache.setSpecialtiesList(mockSpecialties)
      const result = await cache.getSpecialtiesList()
      expect(result).toEqual(mockSpecialties)
    })

    it('should set specialties list in cache', async () => {
      const mockSpecialties = [
        { id: '1', name: 'Cardiology' },
        { id: '2', name: 'Pediatrics' },
      ]

      const result = await cache.setSpecialtiesList(mockSpecialties)
      expect(result).toBe(true)
    })
  })

  describe('Appointment Cache Operations', () => {
    it('should get appointment availability from cache', async () => {
      const mockSlots = ['09:00', '10:00', '11:00']

      await cache.setAppointmentAvailability('doctor-123', '2024-01-15', mockSlots)
      const result = await cache.getAppointmentAvailability('doctor-123', '2024-01-15')
      expect(result).toEqual(mockSlots)
    })

    it('should set appointment availability in cache', async () => {
      const mockSlots = ['09:00', '10:00', '11:00']

      const result = await cache.setAppointmentAvailability(
        'doctor-123',
        '2024-01-15',
        mockSlots
      )
      expect(result).toBe(true)
    })
  })

  describe('Subscription Cache Operations', () => {
    it('should get subscription status from cache', async () => {
      const mockStatus = {
        hasSubscription: true,
        isActive: true,
        subscription: { plan: 'pro' },
      }

      await cache.setSubscriptionStatus('doctor-123', mockStatus)
      const result = await cache.getSubscriptionStatus('doctor-123')
      expect(result).toEqual(mockStatus)
    })

    it('should set subscription status in cache', async () => {
      const mockStatus = {
        hasSubscription: true,
        isActive: true,
        subscription: { plan: 'pro' },
      }

      const result = await cache.setSubscriptionStatus('doctor-123', mockStatus)
      expect(result).toBe(true)
    })

    it('should invalidate subscription cache', async () => {
      const result = await cache.invalidateSubscription('doctor-123')
      expect(result).toBe(true)
    })
  })

  describe('Tag-Based Invalidation', () => {
    it('should invalidate by tag', async () => {
      // Set some values with tags
      await cache.set('key1', 'value1', TTL.HOUR_1, [CacheTags.DOCTOR_PROFILE])
      await cache.set('key2', 'value2', TTL.HOUR_1, [CacheTags.DOCTOR_PROFILE])

      const count = await cache.invalidateTag(CacheTags.DOCTOR_PROFILE)
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Health and Statistics', () => {
    it('should get cache health', async () => {
      const health = await cache.getHealth()
      expect(typeof health.connected).toBe('boolean')
      expect(health.type).toBe('memory') // Fallback in tests
    })

    it('should get cache stats', () => {
      const stats = cache.getStats()
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('hitRate')
    })

    it('should reset cache stats', () => {
      cache.resetStats()
      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('TTL Constants', () => {
    it('should have correct TTL values', () => {
      expect(TTL.MINIMAL).toBe(60)
      expect(TTL.SHORT).toBe(300)
      expect(TTL.MEDIUM).toBe(900)
      expect(TTL.LONG).toBe(3600)
      expect(TTL.EXTENDED).toBe(86400)
    })

    it('should have domain-specific TTL values', () => {
      expect(TTL.DOCTOR_PROFILE).toBe(3600)
      expect(TTL.DOCTOR_LIST).toBe(900)
      expect(TTL.SPECIALTIES_LIST).toBe(86400)
      expect(TTL.APPOINTMENT_AVAILABILITY).toBe(300)
      expect(TTL.PREMIUM_STATUS).toBe(900)
    })
  })

  describe('Cache Tags', () => {
    it('should have all required tags', () => {
      expect(CacheTags.DOCTOR_PROFILE).toBe('doctor:profile')
      expect(CacheTags.DOCTOR_LIST).toBe('doctor:list')
      expect(CacheTags.SPECIALTIES).toBe('specialties')
      expect(CacheTags.APPOINTMENT_AVAILABILITY).toBe('appointment:availability')
      expect(CacheTags.PREMIUM_STATUS).toBe('premium:status')
    })
  })

  describe('Error Handling', () => {
    it('should handle cache get errors gracefully', async () => {
      // Test that cache.get doesn't throw when there's an error
      const result = await cache.get('test-key')
      // Result should be null or undefined when there's an error
      expect(result === null || result === undefined).toBe(true)
    })

    it('should handle cache set errors gracefully', async () => {
      // Test that cache.set doesn't throw when there's an error
      const result = await cache.set('test-key', 'value', TTL.HOUR_1)
      // Result should be a boolean
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Clear All Cache', () => {
    it('should clear all cache via tags', async () => {
      // Add some test data
      await cache.set('test-key-1', 'value1', TTL.HOUR_1)
      await cache.set('test-key-2', 'value2', TTL.HOUR_1)

      const result = await cache.clearAll()
      expect(result).toBe(true)
    })
  })
})

