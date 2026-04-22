/**
 * Redis Caching Layer for Netlify Functions
 *
 * Provides caching for AI responses to reduce OpenAI API costs
 * and improve response times.
 *
 * Cache Strategy:
 * - TTL: 24 hours for medical Q&A
 * - Key: hash of user question + context
 * - Compression: none (text is small enough)
 */

const Redis = require('ioredis');

// Singleton pattern for serverless functions
let redisClient = null;

/**
 * Get or create Redis client connection
 * Uses singleton pattern for connection pooling in serverless
 */
function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is not configured');
    }

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Connection timeout for serverless
      connectTimeout: 5000,
      // Keep connection alive
      keepAlive: 30000,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      // Don't throw - allow graceful degradation
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });
  }

  return redisClient;
}

/**
 * Generate cache key from user message and context
 * Uses simple hash for consistency
 */
function generateCacheKey(message, context = {}) {
  const crypto = require('crypto');
  const normalizedMessage = message.toLowerCase().trim();
  const contextStr = JSON.stringify(context);
  const combined = `${normalizedMessage}:${contextStr}`;

  return crypto
    .createHash('sha256')
    .update(combined)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Get cached AI response
 * @param {string} message - User message
 * @param {object} context - Conversation context
 * @returns {Promise<string|null>} - Cached response or null
 */
async function getCachedResponse(message, context = {}) {
  try {
    const redis = getRedisClient();
    const cacheKey = `ai:response:${generateCacheKey(message, context)}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache HIT for key: ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`Cache MISS for key: ${cacheKey}`);
    return null;
  } catch (error) {
    console.error('Redis get error:', error.message);
    // Graceful degradation - return null on error
    return null;
  }
}

/**
 * Cache AI response
 * @param {string} message - User message
 * @param {object} context - Conversation context
 * @param {object} response - AI response to cache
 * @param {number} ttl - Time to live in seconds (default: 24 hours)
 */
async function setCachedResponse(message, context, response, ttl = 86400) {
  try {
    const redis = getRedisClient();
    const cacheKey = `ai:response:${generateCacheKey(message, context)}`;

    await redis.setex(cacheKey, ttl, JSON.stringify(response));
    console.log(`Cached response for key: ${cacheKey} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error('Redis set error:', error.message);
    // Silent fail - caching is optional
  }
}

/**
 * Invalidate user cache (e.g., after updating knowledge base)
 * @param {string} pattern - Cache key pattern to invalidate
 */
async function invalidateCache(pattern = 'ai:response:*') {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} cache entries`);
    }
  } catch (error) {
    console.error('Redis invalidate error:', error.message);
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  try {
    const redis = getRedisClient();
    const info = await redis.info('stats');
    const keyCount = await redis.dbsize();

    return {
      connected: redis.status === 'ready',
      totalKeys: keyCount,
      info: info
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Close Redis connection (for cleanup)
 */
async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}

module.exports = {
  getRedisClient,
  getCachedResponse,
  setCachedResponse,
  invalidateCache,
  getCacheStats,
  closeRedisConnection
};
