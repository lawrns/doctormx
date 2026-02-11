/**
 * Cache Module Tests
 *
 * Tests for the Redis/Upstash caching implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
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

// Mock the Redis client for testing
vi.mock('../client', async () => {
  const actual = await vi.importActual<typeof import('../client')>('../client')

  return {
    ...actual,
    getCacheClient: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      keys: vi.fn(),
      ping: vi.fn(),
      exists: vi.fn(),
      expire: vi.fn(),
      ttl: vi.fn(),
      incr: vi.fn(),
      incrby: vi.fn(),
      getdel: vi.fn(),
      mget: vi.fn(),
      mset: vi.fn(),
      sadd: vi.fn(),
      srem: vi.fn(),
      smembers: vi.fn(),
      sismember: vi.fn(),
    })),
  }
})

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
      const client = getCacheClient()
      const mockData = { id: '123', name: 'Test Doctor' }

      vi.mocked(client.get).mockResolvedValue(mockData)
      vi.mocked(client.set).mockResolvedValue(true)

      const result = await cache.get('test-key')
      expect(result).toEqual(mockData)

      await cache.set('test-key', mockData, TTL.HOUR_1)
      expect(client.set).toHaveBeenCalledWith('test-key', mockData, TTL.HOUR_1)
    })

    it('should delete values', async () => {
      const client = getCacheClient()
      vi.mocked(client.del).mockResolvedValue(true)

      await cache.del('test-key')
      expect(client.del).toHaveBeenCalledWith('test-key')
    })

    it('should invalidate by pattern', async () => {
      const client = getCacheClient()
      vi.mocked(client.keys).mockResolvedValue(['doctor:123', 'doctor:456'])
      vi.mocked(client.del).mockResolvedValue(true)

      const count = await cache.invalidate('doctor:*')
      expect(count).toBe(2)
      expect(client.keys).toHaveBeenCalledWith('doctor:*')
    })
  })

  describe('Doctor Cache Operations', () => {
    it('should get doctor profile from cache', async () => {
      const client = getCacheClient()
      const mockDoctor = { id: '123', name: 'Dr. Smith' }

      vi.mocked(client.get).mockResolvedValue(mockDoctor)

      const result = await cache.getDoctorProfile('123')
      expect(result).toEqual(mockDoctor)
      expect(client.get).toHaveBeenCalledWith('doctor:profile:123')
    })

    it('should set doctor profile in cache', async () => {
      const client = getCacheClient()
      const mockDoctor = { id: '123', name: 'Dr. Smith' }

      vi.mocked(client.set).mockResolvedValue(true)
      vi.mocked(client.sadd).mockResolvedValue(1)
      vi.mocked(client.expire).mockResolvedValue(true)

      const result = await cache.setDoctorProfile('123', mockDoctor)
      expect(result).toBe(true)
      expect(client.set).toHaveBeenCalledWith(
        'doctor:profile:123',
        mockDoctor,
        TTL.DOCTOR_PROFILE
      )
    })

    it('should invalidate doctor cache', async () => {
      const client = getCacheClient()
      vi.mocked(client.keys).mockResolvedValue(['availability:123:2024-01-15'])
      vi.mocked(client.del).mockResolvedValue(true)
      vi.mocked(client.srem).mockResolvedValue(1)

      const result = await cache.invalidateDoctor('123')
      expect(result).toBe(true)
    })
  })

  describe('Specialty Cache Operations', () => {
    it('should get specialties list from cache', async () => {
      const client = getCacheClient()
      const mockSpecialties = [
        { id: '1', name: 'Cardiology' },
        { id: '2', name: 'Pediatrics' },
      ]

      vi.mocked(client.get).mockResolvedValue(mockSpecialties)

      const result = await cache.getSpecialtiesList()
      expect(result).toEqual(mockSpecialties)
    })

    it('should set specialties list in cache', async () => {
      const client = getCacheClient()
      const mockSpecialties = [
        { id: '1', name: 'Cardiology' },
        { id: '2', name: 'Pediatrics' },
      ]

      vi.mocked(client.set).mockResolvedValue(true)
      vi.mocked(client.sadd).mockResolvedValue(1)
      vi.mocked(client.expire).mockResolvedValue(true)

      const result = await cache.setSpecialtiesList(mockSpecialties)
      expect(result).toBe(true)
      expect(client.set).toHaveBeenCalledWith(
        'specialty:list:all',
        mockSpecialties,
        TTL.SPECIALTIES_LIST
      )
    })
  })

  describe('Appointment Cache Operations', () => {
    it('should get appointment availability from cache', async () => {
      const client = getCacheClient()
      const mockSlots = ['09:00', '10:00', '11:00']

      vi.mocked(client.get).mockResolvedValue(mockSlots)

      const result = await cache.getAppointmentAvailability('doctor-123', '2024-01-15')
      expect(result).toEqual(mockSlots)
    })

    it('should set appointment availability in cache', async () => {
      const client = getCacheClient()
      const mockSlots = ['09:00', '10:00', '11:00']

      vi.mocked(client.set).mockResolvedValue(true)
      vi.mocked(client.sadd).mockResolvedValue(1)
      vi.mocked(client.expire).mockResolvedValue(true)

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
      const client = getCacheClient()
      const mockStatus = {
        hasSubscription: true,
        isActive: true,
        subscription: { plan: 'pro' },
      }

      vi.mocked(client.get).mockResolvedValue(mockStatus)

      const result = await cache.getSubscriptionStatus('doctor-123')
      expect(result).toEqual(mockStatus)
    })

    it('should set subscription status in cache', async () => {
      const client = getCacheClient()
      const mockStatus = {
        hasSubscription: true,
        isActive: true,
        subscription: { plan: 'pro' },
      }

      vi.mocked(client.set).mockResolvedValue(true)
      vi.mocked(client.sadd).mockResolvedValue(1)
      vi.mocked(client.expire).mockResolvedValue(true)

      const result = await cache.setSubscriptionStatus('doctor-123', mockStatus)
      expect(result).toBe(true)
    })

    it('should invalidate subscription cache', async () => {
      const client = getCacheClient()
      vi.mocked(client.del).mockResolvedValue(true)

      const result = await cache.invalidateSubscription('doctor-123')
      expect(result).toBe(true)
    })
  })

  describe('Tag-Based Invalidation', () => {
    it('should invalidate by tag', async () => {
      const client = getCacheClient()
      vi.mocked(client.smembers).mockResolvedValue(['key1', 'key2', 'key3'])
      vi.mocked(client.del).mockResolvedValue(true)

      const count = await cache.invalidateTag(CacheTags.DOCTOR_PROFILE)
      expect(count).toBe(3)
      expect(client.smembers).toHaveBeenCalledWith('tag:doctor:profile')
    })
  })

  describe('Health and Statistics', () => {
    it('should get cache health', async () => {
      const client = getCacheClient()
      vi.mocked(client.ping).mockResolvedValue('PONG')

      const health = await cache.getHealth()
      expect(health.connected).toBe(true)
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
      const client = getCacheClient()
      vi.mocked(client.get).mockRejectedValue(new Error('Redis error'))

      const result = await cache.get('test-key')
      expect(result).toBeNull()
    })

    it('should handle cache set errors gracefully', async () => {
      const client = getCacheClient()
      vi.mocked(client.set).mockRejectedValue(new Error('Redis error'))

      const result = await cache.set('test-key', 'value', TTL.HOUR_1)
      expect(result).toBe(false)
    })
  })

  describe('Clear All Cache', () => {
    it('should clear all cache via tags', async () => {
      const client = getCacheClient()
      vi.mocked(client.smembers).mockResolvedValue([])
      vi.mocked(client.del).mockResolvedValue(true)

      const result = await cache.clearAll()
      expect(result).toBe(true)
    })
  })
})

