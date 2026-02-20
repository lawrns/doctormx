/**
 * Request Logging Utility - OBS-005 Implementation
 * 
 * Provides structured request/response logging for API routes.
 * Tracks request method, URL, headers, response status, timing,
 * and user information for observability and debugging.
 * 
 * Features:
 * - Structured JSON logging compatible with log aggregation systems
 * - Request timing and latency tracking
 * - User ID extraction from authenticated requests
 * - Error logging with stack traces
 * - Configurable log levels and sampling
 * - Sensitive data redaction
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger, LogContext } from './logger'
import { metrics } from './metrics'

// ============================================================================
// Types
// ============================================================================

export interface RequestLogData {
  /** HTTP method */
  method: string
  /** Request URL */
  url: string
  /** Request path */
  path: string
  /** Query parameters (sanitized) */
  query?: Record<string, string | string[]>
  /** Request headers (sanitized) */
  headers?: Record<string, string>
  /** User agent */
  userAgent?: string
  /** Client IP address */
  ip?: string
  /** Country from GeoIP */
  country?: string
  /** City from GeoIP */
  city?: string
  /** Region from GeoIP */
  region?: string
  /** Request ID for correlation */
  requestId: string
  /** User ID if authenticated */
  userId?: string
  /** Request body size in bytes */
  contentLength?: number
  /** Request timestamp */
  timestamp: string
}

export interface ResponseLogData {
  /** HTTP status code */
  statusCode: number
  /** Response time in milliseconds */
  durationMs: number
  /** Response size in bytes (if available) */
  contentLength?: number
  /** Error message if failed */
  error?: string
  /** Error stack trace if failed */
  stack?: string
  /** Error code if available */
  errorCode?: string
}

export interface RequestLoggerConfig {
  /** 
   * Log level for successful requests 
   * @default 'info'
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  /** 
   * Log level for error responses (>=400)
   * @default 'warn'
   */
  errorLogLevel?: 'debug' | 'info' | 'warn' | 'error'
  /** 
   * Sample rate for logging (0-1). 1 = log all requests
   * @default 1
   */
  sampleRate?: number
  /** 
   * Whether to log request headers
   * @default true
   */
  logHeaders?: boolean
  /** 
   * Whether to log query parameters
   * @default true
   */
  logQuery?: boolean
  /** 
   * Headers to redact (case-insensitive)
   * @default ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
   */
  redactedHeaders?: string[]
  /** 
   * Query parameters to redact
   * @default ['token', 'password', 'api_key', 'apikey', 'secret']
   */
  redactedQueryParams?: string[]
  /** 
   * Paths to exclude from logging (exact match or regex)
   * @default ['/api/health', '/_next', '/static', '/favicon.ico']
   */
  excludePaths?: (string | RegExp)[]
  /** 
   * Whether to record metrics for requests
   * @default true
   */
  recordMetrics?: boolean
  /** 
   * Maximum body size to log (in bytes)
   * @default 10000
   */
  maxBodySize?: number
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: RequestLoggerConfig = {
  logLevel: 'info',
  errorLogLevel: 'warn',
  sampleRate: 1,
  logHeaders: true,
  logQuery: true,
  redactedHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-csrf-token',
    'x-session-token',
  ],
  redactedQueryParams: [
    'token',
    'password',
    'api_key',
    'apikey',
    'secret',
    'access_token',
    'refresh_token',
  ],
  excludePaths: [
    '/api/health',
    '/_next',
    '/static',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ],
  recordMetrics: true,
  maxBodySize: 10000,
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Check if a path should be excluded from logging
 */
function shouldExcludePath(path: string, excludePaths: (string | RegExp)[]): boolean {
  return excludePaths.some(pattern => {
    if (typeof pattern === 'string') {
      return path === pattern || path.startsWith(pattern + '/')
    }
    return pattern.test(path)
  })
}

/**
 * Redact sensitive headers
 */
function sanitizeHeaders(
  headers: Headers,
  redactedHeaders: string[]
): Record<string, string> {
  const sanitized: Record<string, string> = {}
  
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (redactedHeaders.includes(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  })
  
  return sanitized
}

/**
 * Redact sensitive query parameters
 */
function sanitizeQuery(
  searchParams: URLSearchParams,
  redactedParams: string[]
): Record<string, string | string[]> {
  const sanitized: Record<string, string | string[]> = {}
  
  searchParams.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (redactedParams.includes(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else {
      // Handle array parameters
      if (key in sanitized) {
        const existing = sanitized[key]
        if (Array.isArray(existing)) {
          existing.push(value)
        } else {
          sanitized[key] = [existing, value]
        }
      } else {
        sanitized[key] = value
      }
    }
  })
  
  return sanitized
}

/**
 * Extract client IP from request
 */
function extractClientIP(request: NextRequest): string | undefined {
  // Check various headers for client IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-cluster-client-ip',
  ]
  
  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }
  
  return undefined
}

/**
 * Extract user ID from request (if authenticated)
 * This is a placeholder - actual implementation depends on auth mechanism
 */
async function extractUserId(request: NextRequest): Promise<string | undefined> {
  // Check for auth header or session cookie
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    // Could decode JWT here if needed
    return undefined
  }
  
  // Return undefined - will be populated by auth middleware if available
  return undefined
}

// ============================================================================
// Request Context Management
// ============================================================================

// Use AsyncLocalStorage for request context (Node.js 14.8+)
// This allows access to request context anywhere in the call stack
let requestContext: { requestId: string; userId?: string } | null = null

export function getCurrentRequestContext(): { requestId: string; userId?: string } | null {
  return requestContext
}

export function setRequestContext(context: { requestId: string; userId?: string }): void {
  requestContext = context
}

export function clearRequestContext(): void {
  requestContext = null
}

// ============================================================================
// Main Logger Function
// ============================================================================

/**
 * Log an incoming request
 */
export async function logRequest(
  request: NextRequest,
  config: Partial<RequestLoggerConfig> = {}
): Promise<{ requestId: string; startTime: number; requestData: RequestLogData }> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const requestId = generateRequestId()
  const startTime = performance.now()
  
  // Set request context for correlation
  setRequestContext({ requestId })
  
  const url = new URL(request.url)
  const path = url.pathname
  
  // Check if path should be excluded
  if (shouldExcludePath(path, mergedConfig.excludePaths!)) {
    return { requestId, startTime, requestData: null as unknown as RequestLogData }
  }
  
  // Apply sampling
  if (Math.random() > mergedConfig.sampleRate!) {
    return { requestId, startTime, requestData: null as unknown as RequestLogData }
  }
  
  // Build request data
  const requestData: RequestLogData = {
    method: request.method,
    url: request.url,
    path,
    requestId,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || undefined,
    ip: extractClientIP(request),
    country: (request as NextRequest & { geo?: { country?: string } }).geo?.country || undefined,
    city: (request as NextRequest & { geo?: { city?: string } }).geo?.city || undefined,
    region: (request as NextRequest & { geo?: { region?: string } }).geo?.region || undefined,
    contentLength: request.headers.get('content-length') 
      ? parseInt(request.headers.get('content-length')!, 10) 
      : undefined,
  }
  
  // Add headers if enabled
  if (mergedConfig.logHeaders) {
    requestData.headers = sanitizeHeaders(request.headers, mergedConfig.redactedHeaders!)
  }
  
  // Add query params if enabled
  if (mergedConfig.logQuery) {
    requestData.query = sanitizeQuery(url.searchParams, mergedConfig.redactedQueryParams!)
  }
  
  // Try to extract user ID
  requestData.userId = await extractUserId(request)
  
  // Log at debug level for request start
  logger.debug(`Request started: ${request.method} ${path}`, {
    requestId,
    method: requestData.method,
    path: requestData.path,
    userAgent: requestData.userAgent,
    ip: requestData.ip,
  })
  
  return { requestId, startTime, requestData }
}

/**
 * Log a response
 */
export function logResponse(
  requestData: RequestLogData,
  response: NextResponse | Response,
  startTime: number,
  config: Partial<RequestLoggerConfig> = {},
  error?: Error
): void {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Skip if request was excluded
  if (!requestData) {
    clearRequestContext()
    return
  }
  
  const durationMs = Math.round(performance.now() - startTime)
  const isError = response.status >= 400 || error !== undefined
  
  const responseData: ResponseLogData = {
    statusCode: response.status,
    durationMs,
    contentLength: response.headers.get('content-length') 
      ? parseInt(response.headers.get('content-length')!, 10) 
      : undefined,
  }
  
  // Add error info if present
  if (error) {
    responseData.error = error.message
    responseData.stack = error.stack
    responseData.errorCode = (error as { code?: string }).code
  }
  
  // Build log context
  const logContext: LogContext = {
    requestId: requestData.requestId,
    userId: requestData.userId,
    feature: 'api_request',
    method: requestData.method,
    path: requestData.path,
    statusCode: responseData.statusCode,
    durationMs: responseData.durationMs,
    userAgent: requestData.userAgent,
    ip: requestData.ip,
    country: requestData.country,
  }
  
  // Record metrics if enabled
  if (mergedConfig.recordMetrics) {
    metrics.apiRequest(requestData.path, requestData.method, response.status, durationMs)
  }
  
  // Determine log level
  const logLevel = isError ? mergedConfig.errorLogLevel : mergedConfig.logLevel
  
  // Build log message
  const statusEmoji = response.status < 400 ? '✅' : response.status < 500 ? '⚠️' : '❌'
  const message = `${statusEmoji} ${requestData.method} ${requestData.path} ${response.status} - ${durationMs}ms`
  
  // Log based on level
  switch (logLevel) {
    case 'debug':
      logger.debug(message, logContext)
      break
    case 'info':
      logger.info(message, logContext)
      break
    case 'warn':
      logger.warn(message, logContext, error)
      break
    case 'error':
      logger.error(message, logContext, error)
      break
  }
  
  // Clear request context
  clearRequestContext()
}

// ============================================================================
// Middleware Integration
// ============================================================================

/**
 * Middleware-compatible request logging function
 * Returns headers to add to the response for request tracking
 */
export async function logMiddlewareRequest(
  request: NextRequest,
  config: Partial<RequestLoggerConfig> = {}
): Promise<{ requestId: string; headers: Headers }> {
  const { requestId } = await logRequest(request, config)
  
  const headers = new Headers()
  headers.set('x-request-id', requestId)
  
  return { requestId, headers }
}

// ============================================================================
// API Route Wrapper
// ============================================================================

/**
 * Higher-order function to wrap API route handlers with logging
 * 
 * @example
 * ```typescript
 * import { withRequestLogging } from '@/lib/observability/request-logger'
 * 
 * export const GET = withRequestLogging(async (request) => {
 *   // Your handler code
 *   return NextResponse.json({ data: 'example' })
 * })
 * ```
 */
export function withRequestLogging<
  T extends (request: NextRequest, ...args: unknown[]) => Promise<Response>
>(handler: T, config: Partial<RequestLoggerConfig> = {}) {
  return async function loggedHandler(
    request: NextRequest,
    ...args: unknown[]
  ): Promise<Response> {
    const { requestId, startTime, requestData } = await logRequest(request, config)
    
    try {
      // Call the actual handler
      const response = await handler(request, ...args)
      
      // Log the response
      logResponse(requestData, response, startTime, config)
      
      // Add request ID header to response
      if (response instanceof NextResponse) {
        response.headers.set('x-request-id', requestId)
      }
      
      return response
    } catch (error) {
      // Log the error response
      const errorResponse = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
      
      logResponse(requestData, errorResponse, startTime, config, error as Error)
      
      // Re-throw to let Next.js handle it
      throw error
    }
  }
}

// ============================================================================
// Edge-compatible Logger
// ============================================================================

/**
 * Edge-compatible request logging for use in middleware
 * This is a lightweight version that works in Edge runtime
 */
export function createEdgeLogger(requestId: string) {
  const baseContext = { requestId }
  
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => 
      logger.info(message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) => 
      logger.warn(message, { ...baseContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: Error) => 
      logger.error(message, { ...baseContext, ...context }, error),
  }
}

// ============================================================================
// Structured Error Logging
// ============================================================================

/**
 * Log an API error with full context
 */
export function logApiError(
  requestId: string,
  error: Error,
  context?: {
    userId?: string
    path?: string
    method?: string
    [key: string]: unknown
  }
): void {
  const errorContext: LogContext = {
    requestId,
    feature: 'api_error',
    errorName: error.name,
    errorCode: (error as { code?: string }).code,
    ...context,
  }
  
  logger.error(`API Error: ${error.message}`, errorContext, error)
}

// ============================================================================
// Export Configuration Helper
// ============================================================================

/**
 * Create a configured logger with preset settings
 */
export function createRequestLogger(config: Partial<RequestLoggerConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  return {
    logRequest: (request: NextRequest) => logRequest(request, mergedConfig),
    logResponse: (requestData: RequestLogData, response: NextResponse, startTime: number, error?: Error) => 
      logResponse(requestData, response, startTime, mergedConfig, error),
    withLogging: <T extends (request: NextRequest, ...args: unknown[]) => Promise<Response>>(handler: T) => 
      withRequestLogging(handler, mergedConfig),
  }
}

// Default export
export default {
  logRequest,
  logResponse,
  logMiddlewareRequest,
  withRequestLogging,
  createRequestLogger,
  logApiError,
  createEdgeLogger,
  generateRequestId,
  getCurrentRequestContext,
  setRequestContext,
  clearRequestContext,
}
