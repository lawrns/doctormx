/**
 * Redis/Upstash Client Setup
 *
 * Provides a singleton Redis client with Upstash integration.
 * Includes automatic fallback to in-memory cache for development.
 *
 * Features:
 * - Automatic connection management
 * - Health checks and monitoring
 * - Graceful fallback to in-memory cache
 * - Type-safe Redis operations
 */

import { Redis } from '@upstash/redis'
import { getRedisConfig } from '@/lib/env'
import { logger } from '@/lib/observability/logger'

// ============================================================================
// Types
// ============================================================================

export interface CacheClient {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown, ttl?: number): Promise<boolean>
  del(key: string): Promise<boolean>
  keys(pattern: string): Promise<string[]>
  ping(): Promise<string>
  exists(key: string): Promise<boolean>
  expire(key: string, seconds: number): Promise<boolean>
  ttl(key: string): Promise<number>
  incr(key: string): Promise<number>
  incrby(key: string, increment: number): Promise<number>
  getdel(key: string): Promise<string | null>
  mget(...keys: string[]): Promise<(string | null)[]>
  mset(...items: Array<{ key: string; value: string }>): Promise<boolean>
  sadd(key: string, ...members: string[]): Promise<number>
  srem(key: string, ...members: string[]): Promise<number>
  smembers(key: string): Promise<string[]>
  sismember(key: string, member: string): Promise<boolean>
}

// ============================================================================
// In-Memory Fallback Cache
// ============================================================================

interface MemoryCacheEntry {
  value: string
  expires: number | null
  tags: Set<string>
}

class MemoryCacheClient implements CacheClient {
  private cache = new Map<string, MemoryCacheEntry>()
  private sets = new Map<string, Set<string>>()

  private getEntry(key: string): MemoryCacheEntry | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check expiration
    if (entry.expires !== null && Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  private parseValue<T>(value: string | null): T | null {
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.getEntry(key)
    return entry ? this.parseValue<T>(entry.value) : null
  }

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    const serialized = JSON.stringify(value)
    const expires = ttl !== undefined ? Date.now() + ttl * 1000 : null

    this.cache.set(key, {
      value: serialized,
      expires,
      tags: new Set(),
    })

    return true
  }

  async del(key: string): Promise<boolean> {
    this.cache.delete(key)
    return true
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    )

    return Array.from(this.cache.keys()).filter((key) => regex.test(key))
  }

  async ping(): Promise<string> {
    return 'PONG'
  }

  async exists(key: string): Promise<boolean> {
    return this.getEntry(key) !== null
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false

    entry.expires = Date.now() + seconds * 1000
    return true
  }

  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key)
    if (!entry || entry.expires === null) return -1

    const remaining = Math.floor((entry.expires - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }

  async incr(key: string): Promise<number> {
    const entry = this.getEntry(key)
    const current = entry ? parseInt(entry.value, 10) || 0 : 0
    const newValue = current + 1

    await this.set(key, newValue)
    return newValue
  }

  async incrby(key: string, increment: number): Promise<number> {
    const entry = this.getEntry(key)
    const current = entry ? parseInt(entry.value, 10) || 0 : 0
    const newValue = current + increment

    await this.set(key, newValue)
    return newValue
  }

  async getdel(key: string): Promise<string | null> {
    const entry = this.getEntry(key)
    this.cache.delete(key)
    return entry?.value || null
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return Promise.all(
      keys.map(async (key) => {
        const entry = this.getEntry(key)
        return entry?.value || null
      })
    )
  }

  async mset(...items: Array<{ key: string; value: string }>): Promise<boolean> {
    for (const item of items) {
      await this.set(item.key, item.value)
    }
    return true
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    let set = this.sets.get(key)
    if (!set) {
      set = new Set()
      this.sets.set(key, set)
    }

    let added = 0
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member)
        added++
      }
    }

    return added
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.sets.get(key)
    if (!set) return 0

    let removed = 0
    for (const member of members) {
      if (set.delete(member)) {
        removed++
      }
    }

    if (set.size === 0) {
      this.sets.delete(key)
    }

    return removed
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.sets.get(key)
    return set ? Array.from(set) : []
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const set = this.sets.get(key)
    return set ? set.has(member) : false
  }

  // Clear all entries (useful for testing)
  clear(): void {
    this.cache.clear()
    this.sets.clear()
  }

  // Get cache statistics
  getStats(): { size: number; sets: number } {
    return {
      size: this.cache.size,
      sets: this.sets.size,
    }
  }
}

// ============================================================================
// Upstash Redis Client Wrapper
// ============================================================================

class UpstashClient implements CacheClient {
  private client: Redis

  constructor(redisUrl: string, redisToken: string) {
    this.client = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  }

  private parseValue<T>(value: unknown): T | null {
    if (value === null || value === undefined) return null

    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T
      } catch {
        return value as unknown as T
      }
    }

    return value as T
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      return this.parseValue<T>(value)
    } catch (error) {
      logger.error('Redis get error', { key, error })
      return null
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)

      if (ttl) {
        await this.client.setex(key, ttl, serialized)
      } else {
        await this.client.set(key, serialized)
      }

      return true
    } catch (error) {
      logger.error('Redis set error', { key, error })
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error('Redis del error', { key, error })
      return false
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern)
    } catch (error) {
      logger.error('Redis keys error', { pattern, error })
      return []
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.client.ping()
    } catch (error) {
      logger.error('Redis ping error', { error })
      return 'ERROR'
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Redis exists error', { key, error })
      return false
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds)
      return result === 1
    } catch (error) {
      logger.error('Redis expire error', { key, error })
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key)
    } catch (error) {
      logger.error('Redis ttl error', { key, error })
      return -1
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key)
    } catch (error) {
      logger.error('Redis incr error', { key, error })
      return 0
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment)
    } catch (error) {
      logger.error('Redis incrby error', { key, error })
      return 0
    }
  }

  async getdel(key: string): Promise<string | null> {
    try {
      return await this.client.getdel(key)
    } catch (error) {
      logger.error('Redis getdel error', { key, error })
      return null
    }
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys)
    } catch (error) {
      logger.error('Redis mget error', { keys, error })
      return keys.map(() => null)
    }
  }

  async mset(...items: Array<{ key: string; value: string }>): Promise<boolean> {
    try {
      // Set each key-value pair individually
      for (const item of items) {
        await this.client.set(item.key, item.value)
      }
      return true
    } catch (error) {
      logger.error('Redis mset error', { error })
      return false
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, members)
    } catch (error) {
      logger.error('Redis sadd error', { key, error })
      return 0
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, members)
    } catch (error) {
      logger.error('Redis srem error', { key, error })
      return 0
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key)
    } catch (error) {
      logger.error('Redis smembers error', { key, error })
      return []
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member)
      return result === 1
    } catch (error) {
      logger.error('Redis sismember error', { key, error })
      return false
    }
  }
}

// ============================================================================
// Client Factory
// ============================================================================

let cacheClient: CacheClient | null = null
let isUsingMemoryCache = false

/**
 * Get or create the cache client instance
 * Automatically falls back to in-memory cache if Redis is not configured
 */
export function getCacheClient(): CacheClient {
  if (cacheClient) {
    return cacheClient
  }

  try {
    const config = getRedisConfig()

    if (config.restUrl && config.restToken) {
      logger.info('Using Upstash Redis cache')
      cacheClient = new UpstashClient(config.restUrl, config.restToken)
      isUsingMemoryCache = false
    } else {
      logger.warn('Redis not configured, using in-memory cache', {
        hint: 'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN',
      })
      cacheClient = new MemoryCacheClient()
      isUsingMemoryCache = true
    }
  } catch (error) {
    logger.error('Failed to initialize Redis client, falling back to memory cache', {
      error,
    })
    cacheClient = new MemoryCacheClient()
    isUsingMemoryCache = true
  }

  return cacheClient
}

/**
 * Check if the cache client is using in-memory fallback
 */
export function isUsingFallbackMemoryCache(): boolean {
  return isUsingMemoryCache
}

/**
 * Reset the cache client (useful for testing)
 */
export function resetCacheClient(): void {
  cacheClient = null
  isUsingMemoryCache = false
}

/**
 * Get health status of the cache client
 */
export async function getCacheHealth(): Promise<{
  connected: boolean
  type: 'redis' | 'memory'
  latency?: number
}> {
  const client = getCacheClient()

  try {
    const start = Date.now()
    const pong = await client.ping()
    const latency = Date.now() - start

    return {
      connected: pong === 'PONG',
      type: isUsingMemoryCache ? 'memory' : 'redis',
      latency,
    }
  } catch {
    return {
      connected: false,
      type: isUsingMemoryCache ? 'memory' : 'redis',
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const redis = getCacheClient()

