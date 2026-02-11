/**
 * Rate Limit Middleware
 *
 * Provides Next.js middleware-compatible rate limiting functionality.
 * Can be used in route handlers or as global middleware.
 *
 * Features:
 * - Automatic tier detection based on route and user role
 * - Proper 429 responses with retry-after headers
 * - Rate limit headers in all responses
 * - TypeScript support with full type safety
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRateLimitTier, getRateLimitTierId } from './config'
import {
  checkRateLimit,
  getRateLimitIdentifier,
  type RateLimitResult,
} from './index'

/**
 * Rate limit headers to include in responses
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
  'Retry-After'?: string
}

/**
 * Get client IP address from request
 *
 * @param request - Next.js request object
 * @returns IP address string or undefined
 */
export function getClientIp(request: NextRequest): string | undefined {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0]?.trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to remote address if available
  return undefined
}

/**
 * Add rate limit headers to a NextResponse
 *
 * @param response - The NextResponse to modify
 * @param result - The rate limit check result
 * @returns The modified NextResponse
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())

  if (result.resetInSeconds && !result.success) {
    response.headers.set('Retry-After', result.resetInSeconds.toString())
  }

  return response
}

/**
 * Create a rate limit exceeded response
 *
 * @param result - The rate limit check result
 * @returns NextResponse with 429 status
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: result.resetInSeconds,
    },
    { status: 429 }
  )

  return addRateLimitHeaders(response, result)
}

/**
 * Extract user information for rate limiting
 *
 * @param request - Next.js request object
 * @returns Object with user ID, role, and premium status
 */
export async function getUserInfo(request: NextRequest): Promise<{
  userId?: string
  userRole?: string
  isPremium: boolean
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { isPremium: false }
    }

    // Get user profile to check premium status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, role')
      .eq('id', user.id)
      .single()

    return {
      userId: user.id,
      userRole: profile?.role,
      isPremium: profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'enterprise',
    }
  } catch {
    // If we can't get user info, default to non-premium
    return { isPremium: false }
  }
}

/**
 * Middleware function to apply rate limiting to API routes
 *
 * This function wraps route handlers with rate limiting logic.
 * It automatically:
 * - Detects the appropriate rate limit tier
 * - Checks the rate limit
 * - Adds rate limit headers to responses
 * - Returns 429 if limit is exceeded
 *
 * @param request - Next.js request object
 * @param handler - The route handler function to wrap
 * @param options - Optional configuration overrides
 * @returns NextResponse from handler or rate limit response
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   return withRateLimit(request, async (req) => {
 *     // Your handler logic here
 *     return NextResponse.json({ data: 'success' })
 *   })
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    tierId?: string
    userId?: string
    skipRateLimit?: boolean
  }
): Promise<NextResponse> {
  // Skip rate limiting if explicitly disabled
  if (options?.skipRateLimit) {
    return handler(request)
  }

  try {
    // Get route information
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Get user information
    const userInfo = options?.userId
      ? { userId: options.userId, isPremium: false, userRole: undefined }
      : await getUserInfo(request)

    // Get IP address
    const ipAddress = getClientIp(request)

    // Determine rate limit tier
    const tier = getRateLimitTier(
      pathname,
      method,
      userInfo.userRole,
      userInfo.isPremium
    )

    const tierId = options?.tierId || getRateLimitTierId(
      pathname,
      method,
      userInfo.userRole,
      userInfo.isPremium
    )

    // Generate identifier for rate limiting
    const identifier = getRateLimitIdentifier(userInfo.userId, ipAddress)

    // Check rate limit
    const result = await checkRateLimit(identifier, tier, tierId)

    // If rate limit exceeded, return 429 response
    if (!result.success) {
      logger.warn('Rate limit exceeded', {
        identifier,
        tierId,
        pathname,
        method,
        userId: userInfo.userId,
        reset: result.reset,
      })

      return createRateLimitResponse(result)
    }

    // Execute handler and add rate limit headers
    const response = await handler(request)
    return addRateLimitHeaders(response, result)

  } catch (error) {
    // If rate limiting fails, log but allow the request
    logger.error('Rate limiting error, allowing request', {
      error: error instanceof Error ? error.message : 'unknown',
      pathname: request.nextUrl.pathname,
    })

    // Still execute the handler
    return handler(request)
  }
}

/**
 * Global rate limit middleware for Next.js middleware.ts
 *
 * Use this in your root middleware.ts file to apply rate limiting
 * to all API routes globally.
 *
 * @param request - Next.js request object
 * @returns NextResponse or null (to continue to next middleware)
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { rateLimitMiddleware } from '@/lib/rate-limit/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   const result = await rateLimitMiddleware(request)
 *   if (result) return result
 *   return NextResponse.next()
 * }
 * ```
 */
export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return null
  }

  try {
    // Get user information (non-blocking)
    const userInfo = await getUserInfo(request)

    // Get IP address
    const ipAddress = getClientIp(request)

    // Determine rate limit tier
    const tier = getRateLimitTier(
      request.nextUrl.pathname,
      request.method,
      userInfo.userRole,
      userInfo.isPremium
    )

    const tierId = getRateLimitTierId(
      request.nextUrl.pathname,
      request.method,
      userInfo.userRole,
      userInfo.isPremium
    )

    // Generate identifier
    const identifier = getRateLimitIdentifier(userInfo.userId, ipAddress)

    // Check rate limit
    const result = await checkRateLimit(identifier, tier, tierId)

    // If rate limit exceeded, return 429 response
    if (!result.success) {
      logger.warn('Rate limit exceeded (global middleware)', {
        identifier,
        tierId,
        pathname: request.nextUrl.pathname,
        method: request.method,
        userId: userInfo.userId,
      })

      return createRateLimitResponse(result)
    }

    // Create response with rate limit headers
    const response = NextResponse.next()
    return addRateLimitHeaders(response, result)

  } catch (error) {
    // If rate limiting fails, allow the request
    logger.error('Global rate limit middleware error', {
      error: error instanceof Error ? error.message : 'unknown',
      pathname: request.nextUrl.pathname,
    })
    return null
  }
}

// Import logger for use in middleware
import { logger } from '@/lib/observability/logger'

