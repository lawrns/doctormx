/**
 * Rate Limit Configuration
 *
 * Defines rate limit tiers for different API endpoints and user roles.
 * Each tier specifies the number of requests allowed within a time window.
 */

import { TIME } from '@/lib/constants'

export interface RateLimitTier {
  /** Maximum number of requests allowed */
  requests: number
  /** Time window in seconds */
  window: number
  /** Optional burst capacity for short-term spikes */
  burst?: number
}

/**
 * Rate limit tiers for different endpoint categories
 *
 * Tiers are organized by:
 * - Endpoint category (auth, payment, ai, general)
 * - User role (premium users get higher limits)
 * - HTTP method (write operations are more restricted)
 */
export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  // Authentication endpoints - strict limits to prevent brute force
  'auth:login': {
    requests: 5,
    window: TIME.RATE_LIMIT_WINDOW_MEDIUM, // 5 minutes
  },
  'auth:register': {
    requests: 3,
    window: TIME.RATE_LIMIT_WINDOW_MEDIUM, // 5 minutes
  },
  'auth:reset-password': {
    requests: 3,
    window: TIME.RATE_LIMIT_WINDOW_LONG, // 1 hour
  },
  'auth:verify': {
    requests: 10,
    window: TIME.RATE_LIMIT_WINDOW_MEDIUM, // 5 minutes
  },

  // Payment endpoints - moderate limits to prevent abuse
  'payment:create': {
    requests: 10,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'payment:webhook': {
    requests: 100,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },

  // AI endpoints - balanced limits for cost management
  'ai:consult': {
    requests: 20,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'ai:vision': {
    requests: 15,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'ai:transcription': {
    requests: 10,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'ai:copilot': {
    requests: 30,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'ai:general': {
    requests: 20,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },

  // General API endpoints
  'api:general': {
    requests: 100,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'api:read': {
    requests: 200,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'api:write': {
    requests: 50,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },

  // Premium user tiers - higher limits for premium users
  'premium:general': {
    requests: 500,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'premium:ai': {
    requests: 100,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
  'premium:consult': {
    requests: 50,
    window: TIME.RATE_LIMIT_WINDOW_SHORT, // 1 minute
  },
}

/**
 * Get the appropriate rate limit tier for a given route and context
 *
 * @param route - The API route path (e.g., '/api/ai/consult')
 * @param method - The HTTP method (GET, POST, etc.)
 * @param userRole - Optional user role for role-based limits
 * @param isPremium - Whether the user has premium access
 * @returns The appropriate RateLimitTier for the request
 */
export function getRateLimitTier(
  route: string,
  method: string,
  userRole?: string,
  isPremium?: boolean
): RateLimitTier {
  // Normalize route for matching
  const normalizedRoute = route.toLowerCase().replace(/\/+/g, '/')

  // Premium users get higher limits
  if (isPremium) {
    if (normalizedRoute.startsWith('/api/ai/consult')) {
      return RATE_LIMIT_TIERS['premium:consult']
    }
    if (normalizedRoute.startsWith('/api/ai')) {
      return RATE_LIMIT_TIERS['premium:ai']
    }
    return RATE_LIMIT_TIERS['premium:general']
  }

  // Authentication endpoints
  if (normalizedRoute.startsWith('/api/auth/login') || normalizedRoute.includes('/login')) {
    return RATE_LIMIT_TIERS['auth:login']
  }
  if (normalizedRoute.startsWith('/api/auth/register') || normalizedRoute.includes('/register')) {
    return RATE_LIMIT_TIERS['auth:register']
  }
  if (normalizedRoute.includes('/reset-password') || normalizedRoute.includes('/forgot-password')) {
    return RATE_LIMIT_TIERS['auth:reset-password']
  }
  if (normalizedRoute.includes('/verify')) {
    return RATE_LIMIT_TIERS['auth:verify']
  }

  // Payment endpoints
  if (normalizedRoute.includes('/payment') || normalizedRoute.includes('/stripe') || normalizedRoute.includes('/checkout')) {
    return RATE_LIMIT_TIERS['payment:create']
  }

  // AI endpoints - specific routes
  if (normalizedRoute.startsWith('/api/ai/consult')) {
    return RATE_LIMIT_TIERS['ai:consult']
  }
  if (normalizedRoute.startsWith('/api/ai/vision')) {
    return RATE_LIMIT_TIERS['ai:vision']
  }
  if (normalizedRoute.startsWith('/api/ai/transcription')) {
    return RATE_LIMIT_TIERS['ai:transcription']
  }
  if (normalizedRoute.startsWith('/api/ai/copilot')) {
    return RATE_LIMIT_TIERS['ai:copilot']
  }
  if (normalizedRoute.startsWith('/api/ai')) {
    return RATE_LIMIT_TIERS['ai:general']
  }

  // General API endpoints with method-based limits
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return RATE_LIMIT_TIERS['api:read']
  }
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return RATE_LIMIT_TIERS['api:write']
  }

  // Default to general limit
  return RATE_LIMIT_TIERS['api:general']
}

/**
 * Get a unique identifier for the rate limit tier based on route and context
 *
 * @param route - The API route path
 * @param method - The HTTP method
 * @param userRole - Optional user role
 * @param isPremium - Whether the user has premium access
 * @returns A unique tier identifier for caching/metrics
 */
export function getRateLimitTierId(
  route: string,
  method: string,
  userRole?: string,
  isPremium?: boolean
): string {
  const tier = getRateLimitTier(route, method, userRole, isPremium)

  // Build tier identifier based on the configuration
  if (isPremium) return `premium:${route}:${method}`
  if (route.includes('/login')) return 'auth:login'
  if (route.includes('/register')) return 'auth:register'
  if (route.includes('/payment')) return 'payment:create'
  if (route.startsWith('/api/ai/consult')) return 'ai:consult'
  if (route.startsWith('/api/ai/vision')) return 'ai:vision'
  if (route.startsWith('/api/ai/transcription')) return 'ai:transcription'
  if (route.startsWith('/api/ai')) return 'ai:general'

  return method === 'GET' ? 'api:read' : 'api:write'
}

