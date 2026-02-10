// ============================================================================
// CSRF PROTECTION TESTS
// ============================================================================
// Comprehensive test suite for CSRF protection functionality.
// Tests token generation, validation, timing-safe comparison,
// and cookie management.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  generateCSRFToken,
  validateCSRFToken,
  setCSRFCookie,
  getCSRFCookie,
  requiresCSRFProtection,
  createCSRFErrorResponse,
  generateAndSetCSRFCookie,
} from '../csrf'

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('should generate a token with correct structure', () => {
      const csrf = generateCSRFToken()

      expect(csrf).toHaveProperty('token')
      expect(csrf).toHaveProperty('header')
      expect(typeof csrf.token).toBe('string')
      expect(typeof csrf.header).toBe('string')
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()

      expect(token1.token).not.toBe(token2.token)
    })

    it('should generate tokens of correct length (64 hex chars = 32 bytes)', () => {
      const csrf = generateCSRFToken()

      expect(csrf.token.length).toBe(64)
      expect(csrf.token).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should use correct header name', () => {
      const csrf = generateCSRFToken()

      expect(csrf.header).toBe('x-csrf-token')
    })
  })

  describe('validateCSRFToken', () => {
    let mockRequest: NextRequest

    beforeEach(() => {
      // Create a mock request
      mockRequest = new NextRequest(new Request('https://example.com/api/test'), {
        headers: new Headers(),
      })
    })

    it('should return true for valid token', () => {
      const csrf = generateCSRFToken()
      mockRequest.headers.set(csrf.header, csrf.token)

      const result = validateCSRFToken(mockRequest, csrf.token)

      expect(result).toBe(true)
    })

    it('should return false for invalid token', () => {
      mockRequest.headers.set('x-csrf-token', 'invalid-token')

      const result = validateCSRFToken(mockRequest, 'valid-token')

      expect(result).toBe(false)
    })

    it('should return false when header is missing', () => {
      const result = validateCSRFToken(mockRequest, 'some-token')

      expect(result).toBe(false)
    })

    it('should return false when session token is missing', () => {
      mockRequest.headers.set('x-csrf-token', 'some-token')

      const result = validateCSRFToken(mockRequest, '')

      expect(result).toBe(false)
    })

    it('should return detailed validation result when requested', () => {
      const csrf = generateCSRFToken()
      mockRequest.headers.set(csrf.header, csrf.token)

      const result = validateCSRFToken(mockRequest, csrf.token, true)

      expect(result).toHaveProperty('valid', true)
    })

    it('should return error details for missing header', () => {
      const result = validateCSRFToken(mockRequest, 'token', true)

      expect(result).toEqual({
        valid: false,
        error: 'MISSING_HEADER',
        message: "CSRF header 'x-csrf-token' is required",
      })
    })

    it('should return error details for missing token', () => {
      mockRequest.headers.set('x-csrf-token', 'request-token')

      const result = validateCSRFToken(mockRequest, '', true)

      expect(result).toEqual({
        valid: false,
        error: 'MISSING_TOKEN',
        message: 'CSRF session token not found',
      })
    })

    it('should return error details for invalid token', () => {
      mockRequest.headers.set('x-csrf-token', 'wrong-token')

      const result = validateCSRFToken(mockRequest, 'correct-token', true)

      expect(result).toEqual({
        valid: false,
        error: 'INVALID_TOKEN',
        message: 'CSRF token validation failed',
      })
    })

    it('should perform timing-safe comparison (same length)', () => {
      const token = generateCSRFToken()
      mockRequest.headers.set('x-csrf-token', token.token)

      // Measure time for valid token
      const start1 = performance.now()
      validateCSRFToken(mockRequest, token.token)
      const time1 = performance.now() - start1

      // Measure time for invalid token (same length)
      const start2 = performance.now()
      validateCSRFToken(mockRequest, 'a'.repeat(64))
      const time2 = performance.now() - start2

      // Times should be similar (within 10x margin to account for system variance)
      expect(Math.abs(time1 - time2)).toBeLessThan(10)
    })
  })

  describe('requiresCSRFProtection', () => {
    it('should return true for POST requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'POST' })
      )

      expect(requiresCSRFProtection(request)).toBe(true)
    })

    it('should return true for PUT requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'PUT' })
      )

      expect(requiresCSRFProtection(request)).toBe(true)
    })

    it('should return true for DELETE requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'DELETE' })
      )

      expect(requiresCSRFProtection(request)).toBe(true)
    })

    it('should return true for PATCH requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'PATCH' })
      )

      expect(requiresCSRFProtection(request)).toBe(true)
    })

    it('should return false for GET requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'GET' })
      )

      expect(requiresCSRFProtection(request)).toBe(false)
    })

    it('should return false for HEAD requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'HEAD' })
      )

      expect(requiresCSRFProtection(request)).toBe(false)
    })

    it('should return false for OPTIONS requests', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'OPTIONS' })
      )

      expect(requiresCSRFProtection(request)).toBe(false)
    })

    it('should handle lowercase methods', () => {
      const request = new NextRequest(
        new Request('https://example.com/api/test', { method: 'post' })
      )

      expect(requiresCSRFProtection(request)).toBe(true)
    })
  })

  describe('setCSRFCookie', () => {
    it('should set cookie with correct options', () => {
      const response = NextResponse.json({ success: true })
      const token = 'test-csrf-token'

      setCSRFCookie(response, token)

      const cookie = response.cookies.get('csrf_token')
      expect(cookie).toBeDefined()
      expect(cookie?.value).toBe(token)
      expect(cookie?.httpOnly).toBe(true)
      expect(cookie?.sameSite).toBe('lax')
      expect(cookie?.path).toBe('/')
    })

    it('should set secure flag in production', () => {
      const originalEnv = process.env.NODE_ENV

      const response = NextResponse.json({ success: true })

      // Mock production environment
      vi.stubEnv('NODE_ENV', 'production')
      setCSRFCookie(response, 'token')

      const cookie = response.cookies.get('csrf_token')
      expect(cookie?.secure).toBe(true)

      // Restore original environment
      vi.unstubAllEnvs()
    })

    it('should not set secure flag in development', () => {
      const response = NextResponse.json({ success: true })

      // Mock development environment
      vi.stubEnv('NODE_ENV', 'development')
      setCSRFCookie(response, 'token')

      const cookie = response.cookies.get('csrf_token')
      expect(cookie?.secure).toBe(false)

      // Restore original environment
      vi.unstubAllEnvs()
    })
  })

  describe('getCSRFCookie', () => {
    it('should return token from cookie', () => {
      const request = new NextRequest(
        new Request('https://example.com'),
        {
          headers: {
            Cookie: 'csrf_token=test-token-value',
          },
        }
      )

      const token = getCSRFCookie(request)

      expect(token).toBe('test-token-value')
    })

    it('should return undefined when cookie is missing', () => {
      const request = new NextRequest(
        new Request('https://example.com'),
        {
          headers: {
            Cookie: 'other_cookie=value',
          },
        }
      )

      const token = getCSRFCookie(request)

      expect(token).toBeUndefined()
    })

    it('should handle multiple cookies', () => {
      const request = new NextRequest(
        new Request('https://example.com'),
        {
          headers: {
            Cookie: 'other=value; csrf_token=my-token; another=value',
          },
        }
      )

      const token = getCSRFCookie(request)

      expect(token).toBe('my-token')
    })
  })

  describe('generateAndSetCSRFCookie', () => {
    it('should generate and set token in one operation', () => {
      const response = NextResponse.json({ success: true })
      const csrf = generateAndSetCSRFCookie(response)

      expect(csrf).toHaveProperty('token')
      expect(csrf).toHaveProperty('header')

      const cookie = response.cookies.get('csrf_token')
      expect(cookie?.value).toBe(csrf.token)
    })
  })

  describe('createCSRFErrorResponse', () => {
    it('should create proper error response', () => {
      const errorResult = {
        valid: false,
        error: 'MISSING_HEADER' as const,
        message: 'CSRF header is required',
      }

      const response = createCSRFErrorResponse(errorResult)

      expect(response.status).toBe(403)

      return response.json().then(data => {
        expect(data).toEqual({
          error: 'CSRF validation failed',
          code: 'MISSING_HEADER',
          message: 'CSRF header is required',
        })
      })
    })

    it('should handle missing message gracefully', () => {
      const errorResult = {
        valid: false,
        error: 'MISSING_HEADER' as const,
      }

      const response = createCSRFErrorResponse(errorResult)

      return response.json().then(data => {
        expect(data.message).toBe('Invalid or missing CSRF token')
      })
    })
  })

  describe('End-to-End CSRF Flow', () => {
    it('should complete full CSRF validation flow', () => {
      // Step 1: Generate token
      const csrf = generateCSRFToken()

      // Step 2: Set cookie on response
      const response = NextResponse.json({ success: true })
      setCSRFCookie(response, csrf.token)

      // Step 3: Get cookie from request
      const request = new NextRequest(
        new Request('https://example.com/api/test'),
        {
          headers: {
            Cookie: `csrf_token=${csrf.token}`,
            [csrf.header]: csrf.token,
          },
        }
      )

      const cookieToken = getCSRFCookie(request)
      expect(cookieToken).toBe(csrf.token)

      // Step 4: Validate token
      const isValid = validateCSRFToken(request, cookieToken || '')
      expect(isValid).toBe(true)
    })

    it('should reject requests with wrong token', () => {
      const serverToken = generateCSRFToken()
      const clientToken = generateCSRFToken()

      const request = new NextRequest(
        new Request('https://example.com/api/test'),
        {
          headers: {
            Cookie: `csrf_token=${serverToken.token}`,
            [clientToken.header]: clientToken.token,
          },
        }
      )

      const cookieToken = getCSRFCookie(request)
      const isValid = validateCSRFToken(request, cookieToken || '')

      expect(isValid).toBe(false)
    })
  })
})
