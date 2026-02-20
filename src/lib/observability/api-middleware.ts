/**
 * API Middleware for Observability - OBS-005 Implementation
 * 
 * Provides middleware functions for API route logging, error handling,
 * and performance tracking. Compatible with Next.js App Router.
 * 
 * Usage:
 * ```typescript
 * // In your API route (e.g., app/api/example/route.ts)
 * import { withLogging, withErrorHandling } from '@/lib/observability/api-middleware'
 * 
 * export const GET = withLogging(withErrorHandling(async (request) => {
 *   // Your handler code
 *   return NextResponse.json({ data: 'example' })
 * }))
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  withRequestLogging, 
  RequestLoggerConfig,
  logApiError,
  generateRequestId,
} from './request-logger'
import { logger } from './logger'
import { metrics } from './metrics'

// ============================================================================
// Types
// ============================================================================

export type ApiHandler = (request: NextRequest) => Promise<Response>

export interface ErrorResponse {
  error: string
  message?: string
  code?: string
  requestId: string
  timestamp: string
}

export interface MiddlewareConfig extends RequestLoggerConfig {
  /** 
   * Enable error tracking with Sentry
   * @default true
   */
  enableSentry?: boolean
  /** 
   * Enable performance metrics
   * @default true
   */
  enableMetrics?: boolean
  /** 
   * Include stack trace in error responses (development only)
   * @default process.env.NODE_ENV === 'development'
   */
  includeStackTrace?: boolean
  /** 
   * Custom error handler
   */
  onError?: (error: Error, request: NextRequest) => void | Promise<void>
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  enableSentry: true,
  enableMetrics: true,
  includeStackTrace: process.env.NODE_ENV === 'development',
  logLevel: 'info',
  errorLogLevel: 'warn',
  sampleRate: 1,
}

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Standard error response codes and their HTTP status codes
 */
const ERROR_CODE_MAP: Record<string, number> = {
  'UNAUTHORIZED': 401,
  'FORBIDDEN': 403,
  'NOT_FOUND': 404,
  'VALIDATION_ERROR': 422,
  'RATE_LIMITED': 429,
  'INTERNAL_ERROR': 500,
  'BAD_REQUEST': 400,
  'CONFLICT': 409,
  'GONE': 410,
  'SERVICE_UNAVAILABLE': 503,
}

/**
 * Create a standardized error response
 */
function createErrorResponse(
  error: Error,
  requestId: string,
  includeStackTrace: boolean
): NextResponse {
  const statusCode = ERROR_CODE_MAP[(error as { code?: string }).code ?? ''] ?? 500
  
  const body: ErrorResponse = {
    error: error.name,
    message: error.message,
    code: (error as { code?: string }).code,
    requestId,
    timestamp: new Date().toISOString(),
  }
  
  // Include stack trace in development
  if (includeStackTrace && statusCode >= 500) {
    (body as ErrorResponse & { stack?: string }).stack = error.stack
  }
  
  return NextResponse.json(body, { 
    status: statusCode,
    headers: {
      'x-request-id': requestId,
      'content-type': 'application/json',
    },
  })
}

/**
 * Higher-order function for error handling in API routes
 * 
 * @example
 * ```typescript
 * export const GET = withErrorHandling(async (request) => {
 *   const data = await fetchData() // May throw
 *   return NextResponse.json({ data })
 * })
 * ```
 */
export function withErrorHandling(
  handler: ApiHandler,
  config: Partial<MiddlewareConfig> = {}
): ApiHandler {
  const mergedConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config }
  
  return async function errorHandledHandler(request: NextRequest): Promise<Response> {
    const requestId = request.headers.get('x-request-id') || generateRequestId()
    
    try {
      // Call the actual handler
      const response = await handler(request)
      
      // Ensure request ID is in response headers
      if (response instanceof NextResponse) {
        response.headers.set('x-request-id', requestId)
      }
      
      return response
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      // Log the error
      logApiError(requestId, err, {
        path: new URL(request.url).pathname,
        method: request.method,
      })
      
      // Call custom error handler if provided
      if (mergedConfig.onError) {
        await mergedConfig.onError(err, request)
      }
      
      // Record error metric
      if (mergedConfig.enableMetrics) {
        metrics.increment('api_errors_total', 1, {
          path: new URL(request.url).pathname,
          method: request.method,
          error_type: err.name,
        })
      }
      
      // Send to Sentry if enabled
      if (mergedConfig.enableSentry) {
        try {
          // Dynamic import to avoid issues if Sentry is not configured
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Sentry = await import('@sentry/react') as any
          if (Sentry?.captureException) {
            Sentry.captureException(err, {
              tags: {
                requestId,
                path: new URL(request.url).pathname,
                method: request.method,
              },
            })
          }
        } catch {
          // Sentry not available, ignore
        }
      }
      
      // Return standardized error response
      return createErrorResponse(err, requestId, mergedConfig.includeStackTrace!)
    }
  }
}

// ============================================================================
// Logging Middleware
// ============================================================================

/**
 * Higher-order function for request/response logging in API routes
 * 
 * This is an alias for withRequestLogging with better documentation
 * 
 * @example
 * ```typescript
 * export const GET = withLogging(async (request) => {
 *   return NextResponse.json({ data: 'example' })
 * })
 * ```
 */
export function withLogging(
  handler: ApiHandler,
  config: Partial<RequestLoggerConfig> = {}
): ApiHandler {
  return withRequestLogging(handler, config)
}

// ============================================================================
// Performance Tracking Middleware
// ============================================================================

/**
 * Higher-order function for performance tracking in API routes
 * 
 * @example
 * ```typescript
 * export const GET = withPerformanceTracking(async (request) => {
 *   return NextResponse.json({ data: 'example' })
 * })
 * ```
 */
export function withPerformanceTracking(
  handler: ApiHandler,
  config: Partial<MiddlewareConfig> = {}
): ApiHandler {
  const mergedConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config }
  
  return async function performanceTrackedHandler(request: NextRequest): Promise<Response> {
    const startTime = performance.now()
    const path = new URL(request.url).pathname
    const method = request.method
    
    try {
      const response = await handler(request)
      
      // Record metrics
      if (mergedConfig.enableMetrics) {
        const durationMs = Math.round(performance.now() - startTime)
        metrics.apiRequest(path, method, response.status, durationMs)
      }
      
      return response
    } catch (error) {
      // Record error metric
      if (mergedConfig.enableMetrics) {
        const durationMs = Math.round(performance.now() - startTime)
        metrics.apiRequest(path, method, 500, durationMs)
      }
      
      throw error
    }
  }
}

// ============================================================================
// Combined Middleware
// ============================================================================

/**
 * Combined middleware that applies logging, error handling, and performance tracking
 * 
 * @example
 * ```typescript
 * // Simple usage
 * export const GET = withApiMiddleware(async (request) => {
 *   return NextResponse.json({ data: 'example' })
 * })
 * 
 * // With custom configuration
 * export const POST = withApiMiddleware(
 *   async (request) => {
 *     return NextResponse.json({ data: 'example' })
 *   },
 *   { 
 *     logLevel: 'debug',
 *     enableSentry: true,
 *     sampleRate: 0.5 // 50% sampling
 *   }
 * )
 * ```
 */
export function withApiMiddleware(
  handler: ApiHandler,
  config: Partial<MiddlewareConfig> = {}
): ApiHandler {
  // Apply middlewares in order: error handling -> logging -> performance -> handler
  return withErrorHandling(
    withLogging(
      withPerformanceTracking(handler, config),
      config
    ),
    config
  )
}

// ============================================================================
// Middleware Chain Helper
// ============================================================================

/**
 * Create a middleware chain from multiple handlers
 * 
 * @example
 * ```typescript
 * const middleware = chain(
 *   withAuth,
 *   withRateLimit,
 *   withLogging
 * )
 * 
 * export const GET = middleware(async (request) => {
 *   return NextResponse.json({ data: 'example' })
 * })
 * ```
 */
export function chain(...middlewares: Array<(handler: ApiHandler, config?: Partial<MiddlewareConfig>) => ApiHandler>) {
  return function createHandler(handler: ApiHandler, config: Partial<MiddlewareConfig> = {}): ApiHandler {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc, config),
      handler
    )
  }
}

// ============================================================================
// CORS Middleware
// ============================================================================

export interface CorsConfig {
  /** Allowed origins */
  allowedOrigins?: string[] | ((origin: string) => boolean)
  /** Allowed methods */
  allowedMethods?: string[]
  /** Allowed headers */
  allowedHeaders?: string[]
  /** Allow credentials */
  allowCredentials?: boolean
  /** Max age for preflight cache */
  maxAge?: number
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  allowCredentials: true,
  maxAge: 86400,
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(
  origin: string,
  allowedOrigins: CorsConfig['allowedOrigins']
): boolean {
  if (!allowedOrigins || allowedOrigins.length === 0) return false
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin) || allowedOrigins.includes('*')
  }
  return allowedOrigins(origin)
}

/**
 * CORS middleware for API routes
 * 
 * @example
 * ```typescript
 * export const GET = withCors(async (request) => {
 *   return NextResponse.json({ data: 'example' })
 * }, {
 *   allowedOrigins: ['https://doctor.mx', 'https://app.doctor.mx']
 * })
 * ```
 */
export function withCors(
  handler: ApiHandler,
  corsConfig: CorsConfig = {}
): ApiHandler {
  const config = { ...DEFAULT_CORS_CONFIG, ...corsConfig }
  
  return async function corsHandler(request: NextRequest): Promise<Response> {
    const origin = request.headers.get('origin') || ''
    const isAllowed = isOriginAllowed(origin, config.allowedOrigins)
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const headers = new Headers()
      
      if (isAllowed) {
        headers.set('Access-Control-Allow-Origin', origin)
      }
      
      headers.set('Access-Control-Allow-Methods', config.allowedMethods!.join(', '))
      headers.set('Access-Control-Allow-Headers', config.allowedHeaders!.join(', '))
      headers.set('Access-Control-Max-Age', String(config.maxAge))
      
      if (config.allowCredentials) {
        headers.set('Access-Control-Allow-Credentials', 'true')
      }
      
      return new NextResponse(null, { status: 204, headers })
    }
    
    // Handle actual request
    const response = await handler(request)
    
    // Add CORS headers to response
    if (isAllowed && response instanceof NextResponse) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      
      if (config.allowCredentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
    }
    
    return response
  }
}

// ============================================================================
// Export Aliases
// ============================================================================

export { withRequestLogging as withRequestLog }
export { withErrorHandling as withErrorHandler }
export { withPerformanceTracking as withPerfTrack }
export { withApiMiddleware as apiMiddleware }

// Default export
export default {
  withLogging,
  withErrorHandling,
  withPerformanceTracking,
  withApiMiddleware,
  withCors,
  withRequestLog: withRequestLogging,
  withErrorHandler: withErrorHandling,
  withPerfTrack: withPerformanceTracking,
  apiMiddleware: withApiMiddleware,
  chain,
}
