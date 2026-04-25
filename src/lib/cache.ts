import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import IORedis from 'ioredis'
import { logger } from '@/lib/observability/logger'

// Check if Redis is properly configured
const runtimeEnv = process.env as Record<string, string | undefined>
const UPSTASH_REST_URL = runtimeEnv['UPSTASH_REDIS_REST_URL']
const UPSTASH_REST_TOKEN = runtimeEnv['UPSTASH_REDIS_REST_TOKEN']
const REDIS_URL = runtimeEnv['REDIS_URL']
const isUpstashRestConfigured = Boolean(UPSTASH_REST_URL && UPSTASH_REST_TOKEN)
const isRedisUrlConfigured = Boolean(REDIS_URL)
const isRedisConfigured = isUpstashRestConfigured || isRedisUrlConfigured

// In-memory cache fallback for development/missing Redis
const memoryCache = new Map<string, { value: string; expires: number }>()
const MAX_MEMORY_CACHE_SIZE = 1000
let setOperationCount = 0
const CLEANUP_INTERVAL = 100

// Only create Redis client if credentials are available
const upstashRedis = isUpstashRestConfigured
  ? new Redis({ url: UPSTASH_REST_URL!, token: UPSTASH_REST_TOKEN! })
  : null

const redisUrlClient = !upstashRedis && REDIS_URL
  ? new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
    })
  : null

const redis = upstashRedis || redisUrlClient

// Log once at startup if Redis is not configured
if (!isRedisConfigured) {
  logger.warn('Redis not configured - using in-memory cache fallback', {
    hint: 'Set UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN or REDIS_URL for production',
  })
}

async function ensureRedisUrlConnected() {
  if (redisUrlClient && redisUrlClient.status === 'wait') {
    await redisUrlClient.connect()
  }
}

async function redisGet(key: string) {
  if (upstashRedis) return upstashRedis.get(key)
  if (!redisUrlClient) return null
  await ensureRedisUrlConnected()
  return redisUrlClient.get(key)
}

async function redisSetex(key: string, ttlSeconds: number, value: string) {
  if (upstashRedis) return upstashRedis.setex(key, ttlSeconds, value)
  if (!redisUrlClient) return null
  await ensureRedisUrlConnected()
  return redisUrlClient.setex(key, ttlSeconds, value)
}

async function redisDel(...keys: string[]) {
  if (upstashRedis) return upstashRedis.del(...keys)
  if (!redisUrlClient || keys.length === 0) return 0
  await ensureRedisUrlConnected()
  return redisUrlClient.del(...keys)
}

async function redisKeys(pattern: string) {
  if (upstashRedis) return upstashRedis.keys(pattern)
  if (!redisUrlClient) return []
  await ensureRedisUrlConnected()
  // Use SCAN instead of KEYS (non-blocking) for ioredis
  const keys: string[] = []
  let cursor = '0'
  do {
    const [nextCursor, batch] = await redisUrlClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = nextCursor
    keys.push(...batch)
  } while (cursor !== '0')
  return keys
}

async function redisPing() {
  if (upstashRedis) return upstashRedis.ping()
  if (!redisUrlClient) return null
  await ensureRedisUrlConnected()
  return redisUrlClient.ping()
}

function pruneExpiredMemoryCache(): void {
  const now = Date.now()
  for (const [key, entry] of memoryCache) {
    if (now > entry.expires) {
      memoryCache.delete(key)
    }
  }
}

function evictOldestMemoryCache(): void {
  // Evict oldest entries (by insertion order, which Map preserves)
  const entriesToDelete = memoryCache.size - MAX_MEMORY_CACHE_SIZE
  if (entriesToDelete <= 0) return

  const keys = [...memoryCache.keys()]
  for (let i = 0; i < Math.min(entriesToDelete, keys.length); i++) {
    memoryCache.delete(keys[i])
  }
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      // Use Redis if available
      if (redis) {
        const value = await redisGet(key)
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
        await redisSetex(key, ttlSeconds, serialized)
        return true
      }

      // Fallback to memory cache
      memoryCache.set(key, {
        value: serialized,
        expires: Date.now() + ttlSeconds * 1000,
      })

      // Enforce size limit
      if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
        evictOldestMemoryCache()
      }

      // Periodic pruning of expired entries
      setOperationCount++
      if (setOperationCount >= CLEANUP_INTERVAL) {
        setOperationCount = 0
        pruneExpiredMemoryCache()
      }

      return true
    } catch (error) {
      logger.debug('Cache set failed', { key, error: error instanceof Error ? error.message : 'unknown' })
      return false
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      if (redis) {
        await redisDel(key)
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
        const keys = await redisKeys(pattern)
        if (keys.length > 0) {
          await redisDel(...keys)
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

  clearExpired(): number {
    const now = Date.now()
    let removed = 0
    for (const [key, entry] of memoryCache) {
      if (now > entry.expires) {
        memoryCache.delete(key)
        removed++
      }
    }
    return removed
  },

  async getDoctorList(filters?: Record<string, unknown>): Promise<unknown[]> {
    const key = `doctors:list:${JSON.stringify(filters || {})}`
    const result = await this.get(key) as unknown[] | null
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
    const result = await this.get(`availability:${doctorId}:${date}`) as string[] | null
    return result || []
  },

  async setAvailability(doctorId: string, date: string, slots: string[]): Promise<boolean> {
    return this.set(`availability:${doctorId}:${date}`, slots, 120)
  },

  async invalidateDoctor(doctorId: string): Promise<boolean> {
    await this.del(`doctor:${doctorId}`)
    await this.invalidate('doctors:list:*')
    // Also invalidate SEO search caches for this doctor's cities/specialties
    await this.invalidate(`search:*`)
    return true
  },

  async invalidateAvailability(doctorId: string): Promise<boolean> {
    await this.invalidate(`availability:${doctorId}:*`)
    return true
  },

  // SEO search caching - frequently accessed specialty x city combinations
  async getSEOSearchResults(specialty: string, city: string, filtersHash: string): Promise<unknown[] | null> {
    const key = `search:${specialty}:${city}:${filtersHash}`
    return this.get<unknown[]>(key)
  },

  async setSEOSearchResults(specialty: string, city: string, filtersHash: string, results: unknown[]): Promise<boolean> {
    const key = `search:${specialty}:${city}:${filtersHash}`
    // Cache for 15 minutes (900 seconds)
    return this.set(key, results, 900)
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
  if (upstashRedis) {
    return new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(windowSize, windowDuration as Parameters<typeof Ratelimit.slidingWindow>[1]),
      analytics: true,
      prefix,
    })
  }

  if (redisUrlClient) {
    return {
      async limit(identifier: string): Promise<RateLimitResult> {
        await ensureRedisUrlConnected()
        const now = Date.now()
        const windowMs = parseWindowDuration(windowDuration)
        const key = `${prefix}:${identifier}:${Math.floor(now / windowMs)}`
        const count = await redisUrlClient.incr(key)
        if (count === 1) {
          await redisUrlClient.pexpire(key, windowMs)
        }
        const reset = Math.ceil(now / windowMs) * windowMs
        return {
          success: count <= windowSize,
          limit: windowSize,
          remaining: Math.max(0, windowSize - count),
          reset,
        }
      },
    }
  }

  return noopRateLimiter
}

function parseWindowDuration(duration: string) {
  const [amountRaw, unitRaw] = duration.trim().split(/\s+/)
  const amount = Number(amountRaw)
  const unit = unitRaw?.toLowerCase()

  if (!Number.isFinite(amount) || amount <= 0) return 60_000
  if (unit?.startsWith('s')) return amount * 1000
  if (unit?.startsWith('m')) return amount * 60_000
  if (unit?.startsWith('h')) return amount * 60 * 60_000
  return amount
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
