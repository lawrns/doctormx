import { rateLimit } from './cache'

// Type for rate limiter (either real Ratelimit or noop)
type RateLimiterLike = {
  limit: (identifier: string) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>
}

export type RateLimitConfig = {
  limit: number
  windowMs: number
}

export const endpointRateLimits: Record<string, RateLimitConfig> = {
  '/api/chat': { limit: 20, windowMs: 60000 },
  '/api/ai/*': { limit: 10, windowMs: 60000 },
  '/api/ai/copilot': { limit: 10, windowMs: 60000 },
  '/api/ai/clinical': { limit: 10, windowMs: 60000 },
  '/api/auth/*': { limit: 5, windowMs: 60000 },
  '/api/*': { limit: 100, windowMs: 60000 },
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
