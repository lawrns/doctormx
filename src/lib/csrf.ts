// ============================================================================
// CSRF PROTECTION LIBRARY
// ============================================================================
// Comprehensive Cross-Site Request Forgery protection implementation for
// Doctor.mx healthcare platform. Provides secure token generation, validation,
// and cookie management with timing-safe comparison to prevent timing attacks.
//
// SECURITY FEATURES:
// - Cryptographically secure random token generation
// - Timing-safe comparison using crypto.timingSafeEqual()
// - HttpOnly, Secure, SameSite cookies for token storage
// - Separate token and header names for defense in depth
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * CSRF token container with both token value and header name
 * Using separate header names adds defense in depth
 */
export interface CSRFToken {
  /** The actual CSRF token value */
  token: string
  /** The header name that must contain this token in requests */
  header: string
}

/**
 * CSRF validation result with detailed error information
 */
export interface CSRFValidationResult {
  /** Whether the CSRF token is valid */
  valid: boolean
  /** Error code if validation failed */
  error?: 'MISSING_TOKEN' | 'INVALID_TOKEN' | 'MISSING_HEADER'
  /** Human-readable error message */
  message?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Cookie name for storing CSRF tokens */
const CSRF_COOKIE_NAME = 'csrf_token'

/** Header name for CSRF token in requests */
const CSRF_HEADER_NAME = 'x-csrf-token'

/** Token length in bytes (32 bytes = 256 bits) */
const TOKEN_LENGTH = 32

/** Maximum age for CSRF cookies (24 hours in seconds) */
const COOKIE_MAX_AGE = 24 * 60 * 60

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate a cryptographically secure random CSRF token
 *
 * Uses Web Crypto API to generate 32 bytes (256 bits) of random data,
 * then encodes it as hexadecimal for safe transport in HTTP headers.
 *
 * @returns CSRFToken object containing token and required header name
 *
 * @example
 * ```ts
 * const { token, header } = generateCSRFToken()
 * console.log(`Include ${token} in ${header} header`)
 * ```
 */
export function generateCSRFToken(): CSRFToken {
  // Generate cryptographically secure random bytes
  const array = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(array)

  // Convert to hexadecimal string for safe transport
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')

  return {
    token,
    header: CSRF_HEADER_NAME,
  }
}

// ============================================================================
// TOKEN VALIDATION
// ============================================================================

/**
 * Timing-safe string comparison to prevent timing attacks
 *
 * Regular string comparison (===) can leak information through timing
 * differences when comparing strings of different lengths or with
 * mismatched characters. This function always compares the full length
 * to prevent such timing side-channels.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings are identical, false otherwise
 *
 * @example
 * ```ts
 * const safe = timingSafeEqual('token1', 'token2') // false
 * ```
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Different lengths = definitely not equal, but still do full comparison
  // to prevent timing leaks from length check
  if (a.length !== b.length) {
    // Create a dummy comparison to normalize timing
    const dummy = new Array(Math.max(a.length, b.length) + 1).join('x')
    let result = 0
    for (let i = 0; i < dummy.length; i++) {
      result |= dummy.charCodeAt(i) ^ 0
    }
    return result === 0
  }

  // Compare each byte using XOR to prevent timing leaks
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Validate CSRF token from request against stored session token
 *
 * Performs timing-safe comparison of the provided token against the
 * stored cookie token. Returns detailed validation result for debugging.
 *
 * @param request - Next.js request object
 * @param sessionToken - Expected CSRF token from session/cookie
 * @returns CSRFValidationResult with validation status and error details
 *
 * @example
 * ```ts
 * const result = validateCSRFToken(request, storedToken)
 * if (!result.valid) {
 *   return NextResponse.json({ error: result.message }, { status: 403 })
 * }
 * ```
 */
export function validateCSRFToken(
  request: NextRequest,
  sessionToken: string
): boolean

export function validateCSRFToken(
  request: NextRequest,
  sessionToken: string,
  detailed: true
): CSRFValidationResult

export function validateCSRFToken(
  request: NextRequest,
  sessionToken: string,
  detailed?: boolean
): boolean | CSRFValidationResult {
  // Get token from request header
  const requestToken = request.headers.get(CSRF_HEADER_NAME)

  // Check if header is present
  if (!requestToken) {
    return detailed
      ? {
          valid: false,
          error: 'MISSING_HEADER',
          message: `CSRF header '${CSRF_HEADER_NAME}' is required`,
        }
      : false
  }

  // Check if session token exists
  if (!sessionToken) {
    return detailed
      ? {
          valid: false,
          error: 'MISSING_TOKEN',
          message: 'CSRF session token not found',
        }
      : false
  }

  // Timing-safe comparison to prevent timing attacks
  const isValid = timingSafeEqual(requestToken, sessionToken)

  if (!isValid && detailed) {
    return {
      valid: false,
      error: 'INVALID_TOKEN',
      message: 'CSRF token validation failed',
    }
  }

  return detailed ? { valid: true } : isValid
}

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Set CSRF token as HttpOnly cookie on response
 *
 * Sets the CSRF token in a cookie with security best practices:
 * - HttpOnly: Prevents JavaScript access (XSS protection)
 * - Secure: Only sent over HTTPS in production
 * - SameSite=Lax: Prevents CSRF while allowing legitimate navigation
 * - Max-Age: Token expires after 24 hours
 *
 * @param response - Next.js response object
 * @param token - CSRF token to store
 *
 * @example
 * ```ts
 * const { token } = generateCSRFToken()
 * setCSRFCookie(response, token)
 * ```
 */
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Get CSRF token from request cookies
 *
 * Extracts the CSRF token from the request cookies for validation.
 * Returns undefined if cookie doesn't exist.
 *
 * @param request - Next.js request object
 * @returns CSRF token string or undefined if not found
 *
 * @example
 * ```ts
 * const token = getCSRFCookie(request)
 * if (!token) {
 *   // Handle missing token
 * }
 * ```
 */
export function getCSRFCookie(request: NextRequest): string | undefined {
  // Try NextRequest cookies API first
  const cookieValue = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (cookieValue) {
    return cookieValue
  }

  // Fallback: parse Cookie header manually (needed for tests and some edge cases)
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie')
  if (!cookieHeader) {
    return undefined
  }

  // Parse cookie string: "name1=value1; name2=value2"
  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      return valueParts.join('=') // Handle values that might contain '='
    }
  }

  return undefined
}

/**
 * Get CSRF token from server-side cookies (for App Router)
 *
 * Alternative method for reading cookies in Next.js App Router
 * server components where NextRequest is not available.
 *
 * @returns CSRF token string or undefined if not found
 *
 * @example
 * ```ts
 * // In a server component or route handler
 * const token = await getServerCSRFCookie()
 * ```
 */
export async function getServerCSRFCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value
}

/**
 * Generate and set CSRF token in one operation
 *
 * Convenience function that generates a new token and sets it
 * as a cookie on the response in a single call.
 *
 * @param response - Next.js response object
 * @returns The generated CSRF token
 *
 * @example
 * ```ts
 * const csrf = generateAndSetCSRFCookie(response)
 * return NextResponse.json({ csrf })
 * ```
 */
export function generateAndSetCSRFCookie(response: NextResponse): CSRFToken {
  const csrf = generateCSRFToken()
  setCSRFCookie(response, csrf.token)
  return csrf
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if request method requires CSRF protection
 *
 * State-changing methods (POST, PUT, DELETE, PATCH) require CSRF
 * validation. Safe methods (GET, HEAD, OPTIONS) do not.
 *
 * @param request - Next.js request object
 * @returns true if CSRF protection is required
 *
 * @example
 * ```ts
 * if (requiresCSRFProtection(request)) {
 *   // Validate CSRF token
 * }
 * ```
 */
export function requiresCSRFProtection(request: NextRequest): boolean {
  const method = request.method.toUpperCase()
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
}

/**
 * Create standardized CSRF error response
 *
 * Generates a consistent 403 Forbidden response for CSRF failures.
 *
 * @param result - CSRFValidationResult from validateCSRFToken
 * @returns NextResponse with 403 status and error details
 *
 * @example
 * ```ts
 * const result = validateCSRFToken(request, token, true)
 * if (!result.valid) {
 *   return createCSRFErrorResponse(result)
 * }
 * ```
 */
export function createCSRFErrorResponse(
  result: CSRFValidationResult
): NextResponse {
  return NextResponse.json(
    {
      error: 'CSRF validation failed',
      code: result.error,
      message: result.message || 'Invalid or missing CSRF token',
    },
    { status: 403 }
  )
}

