import { rateLimit } from './cache'
import { TIME, LIMITS } from '@/lib/constants'

// Type for rate limiter (either real Ratelimit or noop)
type RateLimiterLike = {
  limit: (identifier: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>
}

export type RateLimitConfig = {
  limit: number
  windowMs: number
}

export const endpointRateLimits: Record<string, RateLimitConfig> = {
  '/api/chat': { limit: LIMITS.RATE_LIMIT_CHAT, windowMs: TIME.MINUTE_IN_MS },
  '/api/ai/*': { limit: LIMITS.RATE_LIMIT_AI, windowMs: TIME.MINUTE_IN_MS },
  '/api/ai/copilot': { limit: LIMITS.RATE_LIMIT_AI, windowMs: TIME.MINUTE_IN_MS },
  '/api/ai/clinical': { limit: LIMITS.RATE_LIMIT_AI, windowMs: TIME.MINUTE_IN_MS },
  '/api/auth/*': { limit: LIMITS.RATE_LIMIT_AUTH, windowMs: TIME.MINUTE_IN_MS },
  '/api/*': { limit: LIMITS.RATE_LIMIT_GENERAL, windowMs: TIME.MINUTE_IN_MS },
}

export function getRateLimiter(endpoint: string): RateLimiterLike {
  if (endpoint.startsWith('/api/ai')) {
    return rateLimit.ai
  }
  if (endpoint.startsWith('/api/chat')) {
    return rateLimit.chat
  }
  if (endpoint.startsWith('/api/auth')) {
    return rateLimit.auth
  }
  if (endpoint.includes('/payment') || endpoint.includes('/stripe') || endpoint.includes('/checkout') || endpoint.includes('/create-payment')) {
    return rateLimit.payment
  }
  return rateLimit.general
}

export function getRateLimiterByMethod(method: string, endpoint: string): RateLimiterLike {
  // Special endpoints get their specific limiters
  if (endpoint.startsWith('/api/ai')) return rateLimit.ai
  if (endpoint.startsWith('/api/chat')) return rateLimit.chat
  if (endpoint.startsWith('/api/auth')) return rateLimit.auth
  if (endpoint.includes('/payment') || endpoint.includes('/stripe') || endpoint.includes('/checkout')) {
    return rateLimit.payment
  }
  
  // Method-based rate limiting for general endpoints
  if (method === 'GET') return rateLimit.read
  if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
    return rateLimit.write
  }
  
  return rateLimit.general
}

export async function checkRateLimit(identifier: string, endpoint: string): Promise<{
  success: boolean
  remaining: number
  reset: number
}> {
  const limiter = getRateLimiter(endpoint)
  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}

// Note: createRateLimiter requires Redis to be configured
// If Redis is not available, use getRateLimiter() instead which has fallback
export function createRateLimiter(): RateLimiterLike {
  // Return noop limiter if Redis is not configured
  return rateLimit.general
}

export const rateLimitMiddleware = async (
  endpoint: string,
  ip: string
): Promise<boolean> => {
  const { success } = await checkRateLimit(ip, endpoint)
  return success
}

