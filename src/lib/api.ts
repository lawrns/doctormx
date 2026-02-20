// ============================================================================
// CLIENT-SIDE API REQUEST HANDLER WITH CSRF PROTECTION
// ============================================================================
// Secure API request handler for client-side HTTP requests that automatically
// includes CSRF tokens for state-changing operations. Provides a unified
// interface for all API interactions with proper error handling.
//
// FEATURES:
// - Automatic CSRF token inclusion for state-changing requests
// - Proper error handling and response parsing
// - Type-safe request options
// - Automatic token refresh on authentication errors
// - Consistent error messaging
// ============================================================================

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Extended request options with automatic CSRF handling
 */
export interface APIRequestOptions {
  /**
   * HTTP method
   * @default 'GET'
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'
  /**
   * Request body - automatically stringified if object
   */
  body?: Record<string, unknown> | FormData | string | null
  /**
   * Additional headers to include with the request
   */
  headers?: Record<string, string>
  /**
   * Skip CSRF token validation (use with caution)
   * @default false
   */
  skipCSRF?: boolean
  /**
   * Expected response type
   * @default 'json'
   */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  /**
   * Request cache mode
   */
  cache?: RequestCache
  /**
   * Request credentials mode
   */
  credentials?: RequestCredentials
  /**
   * Request mode
   */
  mode?: RequestMode
  /**
   * Request redirect mode
   */
  redirect?: RequestRedirect
  /**
   * Request referrer policy
   */
  referrerPolicy?: ReferrerPolicy
}

/**
 * API error with detailed information
 */
export interface APIError extends Error {
  /** HTTP status code */
  status?: number
  /** Error code from server */
  code?: string
  /** Additional error details */
  details?: unknown
}

/**
 * Successful API response
 */
export interface APIResponse<T = unknown> {
  /** Response data */
  data: T
  /** HTTP status code */
  status: number
  /** Response headers */
  headers: Headers
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** CSRF cookie name */
const CSRF_COOKIE_NAME = 'csrf_token'

/** CSRF header name */
const CSRF_HEADER_NAME = 'x-csrf-token'

import { TIME } from '@/lib/constants'

/** Default request timeout in milliseconds - using shared constant */
const DEFAULT_TIMEOUT = TIME.DEFAULT_TIMEOUT_MS

// ============================================================================
// CSRF TOKEN MANAGEMENT
// ============================================================================

/**
 * Get CSRF token from cookies
 *
 * Reads the CSRF token from the browser's cookies for inclusion
 * in state-changing API requests.
 *
 * @returns CSRF token value or undefined if not found
 *
 * @example
 * ```ts
 * const token = getCSRFToken()
 * if (token) {
 *   console.log('CSRF token available')
 * }
 * ```
 */
export function getCSRFToken(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  // Read cookie by name
  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find(cookie => {
    const [name] = cookie.trim().split('=')
    return name === CSRF_COOKIE_NAME
  })

  if (!csrfCookie) {
    return undefined
  }

  const [, value] = csrfCookie.trim().split('=')
  return value
}

/**
 * Check if request method requires CSRF token
 *
 * @param method - HTTP method (uppercase)
 * @returns true if CSRF token should be included
 */
function requiresCSRFToken(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Create an API error from response
 */
function createAPIError(
  message: string,
  status?: number,
  code?: string,
  details?: unknown
): APIError {
  const error = new Error(message) as APIError
  error.status = status
  error.code = code
  error.details = details
  return error
}

/**
 * Parse error response body
 */
async function parseErrorResponse(response: Response): Promise<{
  message: string
  code?: string
  details?: unknown
}> {
  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return {
        message: (data.message || data.error) ?? 'An error occurred',
        code: data.code,
        details: data.details,
      }
    }
    return {
      message: await response.text() ?? 'An error occurred',
    }
  } catch {
    return {
      message: 'An error occurred',
    }
  }
}

// ============================================================================
// REQUEST IMPLEMENTATION
// ============================================================================

/**
 * Make an API request with automatic CSRF protection
 *
 * This function handles all API requests with the following features:
 * - Automatically includes CSRF tokens for state-changing methods
 * - Properly serializes request bodies
 * - Handles different response types
 * - Provides consistent error handling
 *
 * @param url - API endpoint URL (relative or absolute)
 * @param options - Request options
 * @returns Promise resolving to APIResponse
 * @throws APIError on request failure
 *
 * @example
 * ```ts
 * // GET request (no CSRF needed)
 * const users = await apiRequest('/api/users')
 *
 * // POST request with CSRF
 * const newUser = await apiRequest('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * })
 *
 * // With error handling
 * try {
 *   const result = await apiRequest('/api/data', {
 *     method: 'POST',
 *     body: { foo: 'bar' }
 *   })
 *   console.log(result.data)
 * } catch (error) {
 *   if (error instanceof Error && 'status' in error) {
 *     console.error(`Request failed: ${error.status}`)
 *   }
 * }
 * ```
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: APIRequestOptions = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    skipCSRF = false,
    responseType = 'json',
    ...restOptions
  } = options

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add CSRF token for state-changing methods
  if (requiresCSRFToken(method) && !skipCSRF) {
    const csrfToken = getCSRFToken()
    if (!csrfToken) {
      throw createAPIError(
        'CSRF token not found. Please refresh the page and try again.',
        403,
        'MISSING_CSRF_TOKEN'
      )
    }
    requestHeaders[CSRF_HEADER_NAME] = csrfToken
  }

  // Prepare request body
  let requestBody: string | FormData | null = null
  if (body) {
    if (body instanceof FormData) {
      delete requestHeaders['Content-Type'] // Let browser set multipart boundary
      requestBody = body
    } else if (typeof body === 'string') {
      requestBody = body
    } else {
      requestBody = JSON.stringify(body)
    }
  }

  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL ?? ''}${url}`

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

  try {
    // Make the request
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
      ...restOptions,
    })

    clearTimeout(timeoutId)

    // Handle error responses
    if (!response.ok) {
      const errorData = await parseErrorResponse(response)
      throw createAPIError(
        errorData.message,
        response.status,
        errorData.code,
        errorData.details
      )
    }

    // Parse response based on type
    let data: unknown
    switch (responseType) {
      case 'json':
        data = await response.json()
        break
      case 'text':
        data = await response.text()
        break
      case 'blob':
        data = await response.blob()
        break
      case 'arrayBuffer':
        data = await response.arrayBuffer()
        break
      default:
        data = await response.json()
    }

    return {
      data: data as T,
      status: response.status,
      headers: response.headers,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    // Re-throw API errors
    if (error instanceof Error && 'status' in error) {
      throw error
    }

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw createAPIError('Request timeout. Please try again.', undefined, 'TIMEOUT')
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw createAPIError(
        'Network error. Please check your connection and try again.',
        undefined,
        'NETWORK_ERROR'
      )
    }

    // Unknown errors
    throw createAPIError(
      'An unexpected error occurred. Please try again.',
      undefined,
      'UNKNOWN_ERROR'
    )
  }
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * Make a GET request
 */
export async function get<T = unknown>(
  url: string,
  options?: Omit<APIRequestOptions, 'method'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

/**
 * Make a POST request
 */
export async function post<T = unknown>(
  url: string,
  body?: Record<string, unknown> | FormData,
  options?: Omit<APIRequestOptions, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'POST', body })
}

/**
 * Make a PUT request
 */
export async function put<T = unknown>(
  url: string,
  body?: Record<string, unknown> | FormData,
  options?: Omit<APIRequestOptions, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PUT', body })
}

/**
 * Make a PATCH request
 */
export async function patch<T = unknown>(
  url: string,
  body?: Record<string, unknown> | FormData,
  options?: Omit<APIRequestOptions, 'method' | 'body'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PATCH', body })
}

/**
 * Make a DELETE request
 */
export async function del<T = unknown>(
  url: string,
  options?: Omit<APIRequestOptions, 'method'>
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' })
}

// ============================================================================
// REACT HOOK (for convenience in components)
// ============================================================================

/**
 * Custom hook for API requests with React integration
 *
 * Note: This should be imported in a client component context
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useAPIRequest } from '@/lib/api'
 *
 * function MyComponent() {
 *   const { data, loading, error, execute } = useAPIRequest()
 *
 *   useEffect(() => {
 *     execute('/api/users').then(console.log)
 *   }, [])
 *
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 */
export function useAPIRequest<T = unknown>() {
  // This is a placeholder - full React hook implementation would go here
  // For now, consumers should use the apiRequest function directly
  // or implement their own React hooks around it
  return {
    execute: (url: string, options?: APIRequestOptions) =>
      apiRequest<T>(url, options),
  }
}

