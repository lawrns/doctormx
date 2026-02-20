import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { logger } from '@/lib/observability/logger'

// Check if Redis is properly configured
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const isRedisConfigured = Boolean(REDIS_URL && REDIS_TOKEN)

// In-memory cache fallback for development/missing Redis
const memoryCache = new Map<string, { value: string; expires: number }>()

// Only create Redis client if credentials are available
const redis = isRedisConfigured
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null

// Log once at startup if Redis is not configured
if (!isRedisConfigured) {
  logger.warn('Redis not configured - using in-memory cache fallback', {
    hint: 'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production',
  })
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      // Use Redis if available
      if (redis) {
        const value = await redis.get(key)
        if (!value) return null
        // Handle both string and object responses from Redis
        if (typeof value === 'string') {
          return JSON.parse(value) as T
        }
        return value as T
      }

      // Fallback to memory cache
      const cached = memoryCache.get(key)
      if (!cached) return null
      if (Date.now() > cached.expires) {
        memoryCache.delete(key)
        return null
      }
      return JSON.parse(cached.value) as T
    } catch (error) {
      logger.debug('Cache get miss', { key, error: error instanceof Error ? error.message : 'unknown' })
      return null
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)

      // Use Redis if available
      if (redis) {
        await redis.setex(key, ttlSeconds, serialized)
        return true
      }

      // Fallback to memory cache
      memoryCache.set(key, {
        value: serialized,
        expires: Date.now() + ttlSeconds * 1000,
      })
      return true
    } catch (error) {
      logger.debug('Cache set failed', { key, error: error instanceof Error ? error.message : 'unknown' })
      return false
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      if (redis) {
        await redis.del(key)
      } else {
        memoryCache.delete(key)
      }
      return true
    } catch (error) {
      logger.debug('Cache del failed', { key, error: error instanceof Error ? error.message : 'unknown' })
      return false
    }
  },

  async invalidate(pattern: string): Promise<boolean> {
    try {
      if (redis) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        // Memory cache pattern matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key)
          }
        }
      }
      return true
    } catch (error) {
      logger.debug('Cache invalidate failed', { pattern, error: error instanceof Error ? error.message : 'unknown' })
      return false
    }
  },

  async getDoctorList(filters?: Record<string, unknown>): Promise<unknown[]> {
    const key = `doctors:list:${JSON.stringify(filters || {})}`
    const result = await this.get<unknown[]>(key)
    return result || []
  },

  async setDoctorList(doctors: unknown[], filters?: Record<string, unknown>): Promise<boolean> {
    const key = `doctors:list:${JSON.stringify(filters || {})}`
    return this.set(key, doctors, 300)
  },

  async getDoctorProfile(doctorId: string): Promise<unknown> {
    return this.get(`doctor:${doctorId}`)
  },

  async setDoctorProfile(doctorId: string, profile: unknown): Promise<boolean> {
    return this.set(`doctor:${doctorId}`, profile, 600)
  },

  async getAvailability(doctorId: string, date: string): Promise<string[]> {
    const result = await this.get<string[]>(`availability:${doctorId}:${date}`)
    return result || []
  },

  async setAvailability(doctorId: string, date: string, slots: string[]): Promise<boolean> {
    return this.set(`availability:${doctorId}:${date}`, slots, 120)
  },

  async invalidateDoctor(doctorId: string): Promise<boolean> {
    await this.del(`doctor:${doctorId}`)
    await this.invalidate('doctors:list:*')
    return true
  },

  async invalidateAvailability(doctorId: string): Promise<boolean> {
    await this.invalidate(`availability:${doctorId}:*`)
    return true
  },

  // Alias methods for compatibility with origin/main code
  async getAppointmentAvailability(doctorId: string, date: string): Promise<string[]> {
    return this.getAvailability(doctorId, date)
  },

  async setAppointmentAvailability(doctorId: string, date: string, slots: string[]): Promise<boolean> {
    return this.setAvailability(doctorId, date, slots)
  },

  async getDoctorsBySpecialty(specialty: string): Promise<unknown[]> {
    const result = await this.get<unknown[]>(`doctors:specialty:${specialty}`)
    return result || []
  },

  async setDoctorsBySpecialty(specialty: string, doctors: unknown[]): Promise<boolean> {
    return this.set(`doctors:specialty:${specialty}`, doctors, 300)
  },

  async getSpecialtiesList(): Promise<unknown[]> {
    const result = await this.get<unknown[]>('specialties:list')
    return result || []
  },

  async setSpecialtiesList(specialties: unknown[]): Promise<boolean> {
    return this.set('specialties:list', specialties, 600)
  },

  async getSubscriptionStatus(userId: string): Promise<unknown> {
    return this.get(`subscription:${userId}`)
  },

  async setSubscriptionStatus(userId: string, status: unknown): Promise<boolean> {
    return this.set(`subscription:${userId}`, status, 300)
  },

  async invalidateSubscription(userId: string): Promise<boolean> {
    await this.del(`subscription:${userId}`)
    return true
  },
}

// No-op rate limiter for when Redis is not configured
type RateLimitResult = { success: boolean; limit: number; remaining: number; reset: number }
const noopRateLimiter = {
  limit: async (): Promise<RateLimitResult> => ({ success: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 }),
}

// Create rate limiters only when Redis is available
function createRateLimiter(windowSize: number, windowDuration: string, prefix: string) {
  if (!redis) return noopRateLimiter
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(windowSize, windowDuration as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: true,
    prefix,
  })
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

export { redis }
