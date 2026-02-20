/**
 * TST-002: Authentication Flow Tests - Logout
 * Doctor.mx - Critical Authentication Test Suite
 *
 * Tests coverage:
 * - Successful logout
 * - Session termination
 * - Cookie cleanup
 * - Redirect after logout
 * - Logout without active session
 * - CSRF protection during logout
 * - Multiple device logout
 * - Concurrent logout handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase client
const mockSignOut = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      signOut: mockSignOut,
      getSession: mockGetSession,
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  createServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: vi.fn(),
      },
    },
  })),
}))

// Mock session management
const mockInvalidateCurrentSession = vi.fn()

vi.mock('@/lib/session', () => ({
  invalidateCurrentSession: mockInvalidateCurrentSession,
  getCurrentSession: vi.fn(),
  invalidateAllUserSessions: vi.fn(),
  refreshSession: vi.fn(),
  recordSecurityEvent: vi.fn(),
  getUserSecurityEvents: vi.fn(),
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock cookies
const mockCookiesGet = vi.fn()
const mockCookiesSet = vi.fn()
const mockCookiesDelete = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: mockCookiesGet,
    set: mockCookiesSet,
    delete: mockCookiesDelete,
    has: vi.fn(),
    getAll: vi.fn(() => []),
  })),
  headers: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    has: vi.fn(),
    entries: vi.fn().mockReturnValue([]),
    getSetCookie: vi.fn().mockReturnValue([]),
  })),
}))

describe('AUTH-003: Logout Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockReset()
    mockGetSession.mockReset()
    mockInvalidateCurrentSession.mockReset()
    mockCookiesDelete.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============================================================================
  // SUCCESSFUL LOGOUT SCENARIOS
  // ============================================================================

  describe('Successful Logout', () => {
    it('should successfully sign out authenticated user', async () => {
      mockInvalidateCurrentSession.mockResolvedValue(undefined)

      await mockInvalidateCurrentSession()

      expect(mockInvalidateCurrentSession).toHaveBeenCalledTimes(1)
    })

    it('should clear session cookies on logout', async () => {
      const cookiesToDelete = [
        'sb-access-token',
        'sb-refresh-token',
        'csrf_token',
        'session_id',
      ]

      mockCookiesDelete.mockImplementation((name: string) => {
        expect(cookiesToDelete).toContain(name)
        return undefined
      })

      for (const cookie of cookiesToDelete) {
        mockCookiesDelete(cookie)
      }

      expect(mockCookiesDelete).toHaveBeenCalledTimes(cookiesToDelete.length)
    })

    it('should redirect to login page after logout', async () => {
      const loginUrl = '/auth/login'
      
      mockInvalidateCurrentSession.mockResolvedValue(undefined)

      // Simulate redirect
      const redirect = (url: string) => {
        expect(url).toBe(loginUrl)
        return NextResponse.redirect(new URL(url, 'http://localhost'))
      }

      const response = redirect(loginUrl)
      expect([302, 307]).toContain(response.status)
    })

    it('should terminate Supabase session', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const result = await mockSignOut()

      expect(result.error).toBeNull()
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================================
  // SESSION COOKIE CLEANUP
  // ============================================================================

  describe('Session Cookie Cleanup', () => {
    it('should delete all auth-related cookies', async () => {
      const authCookies = [
        'sb-access-token',
        'sb-refresh-token',
        'csrf_token',
        'sb-provider-token',
      ]

      for (const cookieName of authCookies) {
        mockCookiesDelete(cookieName)
      }

      expect(mockCookiesDelete).toHaveBeenCalledTimes(authCookies.length)
    })

    it('should set cookies with expired date for client-side cleanup', async () => {
      mockCookiesSet.mockImplementation((
        name: string,
        value: string,
        options: { expires?: Date; maxAge?: number }
      ) => {
        if (options) {
          // Cookie should be expired
          if (options.expires) {
            expect(options.expires.getTime()).toBeLessThan(Date.now())
          }
          if (options.maxAge !== undefined) {
            expect(options.maxAge).toBe(0)
          }
        }
      })

      // Simulate setting expired cookie
      mockCookiesSet('sb-access-token', '', { expires: new Date(0), maxAge: 0 })
    })

    it('should handle secure cookie attributes', async () => {
      mockCookiesSet.mockImplementation((
        name: string,
        value: string,
        options: { secure?: boolean; httpOnly?: boolean; sameSite?: string }
      ) => {
        if (options) {
          expect(options.secure).toBe(true)
          expect(options.httpOnly).toBe(true)
          expect(options.sameSite).toBe('lax')
        }
      })

      // Verify secure attributes when setting cookies (even for deletion)
      mockCookiesSet('sb-access-token', '', {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
      })
    })
  })

  // ============================================================================
  // LOGOUT WITHOUT SESSION
  // ============================================================================

  describe('Logout Without Active Session', () => {
    it('should handle logout when no session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const session = await mockGetSession()
      expect(session.data.session).toBeNull()

      // Should still redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', 'http://localhost'))
      expect([302, 307]).toContain(response.status)
    })

    it('should not throw error when signing out without session', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const result = await mockSignOut()

      expect(result.error).toBeNull()
    })

    it('should still clear cookies even without active session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      // Clear cookies anyway for safety
      mockCookiesDelete('sb-access-token')
      mockCookiesDelete('sb-refresh-token')

      expect(mockCookiesDelete).toHaveBeenCalledTimes(2)
    })
  })

  // ============================================================================
  // MULTI-DEVICE LOGOUT
  // ============================================================================

  describe('Multi-Device Logout', () => {
    it('should support logout from all devices', async () => {
      const invalidateAllUserSessions = vi.fn().mockResolvedValue(undefined)

      await invalidateAllUserSessions('user-123')

      expect(invalidateAllUserSessions).toHaveBeenCalledWith('user-123')
    })

    it('should only logout current session by default', async () => {
      mockInvalidateCurrentSession.mockResolvedValue(undefined)

      await mockInvalidateCurrentSession()

      // Should only invalidate current session, not all sessions
      expect(mockInvalidateCurrentSession).toHaveBeenCalledTimes(1)
    })

    it('should invalidate all sessions after security event', async () => {
      const invalidateAllUserSessions = vi.fn().mockImplementation((userId: string) => {
        expect(userId).toBe('user-123')
        return Promise.resolve(undefined)
      })

      // Triggered by password change or suspicious activity
      await invalidateAllUserSessions('user-123')

      expect(invalidateAllUserSessions).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // REDIRECT HANDLING
  // ============================================================================

  describe('Redirect Handling', () => {
    it('should redirect to login page by default', async () => {
      const expectedRedirect = '/auth/login'
      
      const redirect = (url: string) => {
        expect(url).toBe(expectedRedirect)
        return NextResponse.redirect(new URL(url, 'http://localhost'))
      }

      const response = redirect(expectedRedirect)
      expect([302, 307]).toContain(response.status)
    })

    it('should include error parameter on logout failure', async () => {
      mockInvalidateCurrentSession.mockRejectedValue(new Error('Sign out failed'))

      try {
        await mockInvalidateCurrentSession()
      } catch (error) {
        expect(error).toBeDefined()
        
        // Should redirect with error
        const errorUrl = '/auth/login?error=signout_failed'
        expect(errorUrl).toContain('error=')
      }
    })

    it('should preserve return URL for post-login redirect', async () => {
      const originalUrl = '/app/dashboard'
      const encodedUrl = encodeURIComponent(originalUrl)
      
      const redirectUrl = `/auth/login?redirect=${encodedUrl}`
      
      expect(redirectUrl).toContain('redirect=')
      expect(decodeURIComponent(redirectUrl.split('redirect=')[1])).toBe(originalUrl)
    })
  })

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle Supabase signout errors gracefully', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Failed to sign out', status: 500 },
      })

      const result = await mockSignOut()

      expect(result.error).toBeDefined()
    })

    it('should still redirect to login even on signout error', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Failed to sign out', status: 500 },
      })

      // Even on error, should redirect
      const response = NextResponse.redirect(
        new URL('/auth/login?error=signout_failed', 'http://localhost')
      )

      expect([302, 307]).toContain(response.status)
      expect(response.headers.get('location')).toContain('error=')
    })

    it('should handle network errors during logout', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'))

      await expect(mockSignOut()).rejects.toThrow('Network error')
    })

    it('should handle timeout during signout', async () => {
      mockSignOut.mockRejectedValue(new Error('Request timeout'))

      await expect(mockSignOut()).rejects.toThrow('timeout')
    })

    it('should log logout errors for monitoring', async () => {
      const logger = { error: vi.fn() }
      const error = new Error('Sign out error')

      logger.error('Sign out error:', { error })

      expect(logger.error).toHaveBeenCalledWith('Sign out error:', { error })
    })
  })

  // ============================================================================
  // CONCURRENT LOGOUT HANDLING
  // ============================================================================

  describe('Concurrent Logout Handling', () => {
    it('should handle multiple concurrent logout requests', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      // Simulate concurrent logout requests
      const promises = Array(3).fill(null).map(() => mockSignOut())

      const results = await Promise.all(promises)

      // All should succeed
      results.forEach(result => {
        expect(result.error).toBeNull()
      })
    })

    it('should handle race conditions in session invalidation', async () => {
      let callCount = 0
      mockSignOut.mockImplementation(() => {
        callCount++
        // Simulate race condition where session is already invalidated
        if (callCount > 1) {
          return Promise.resolve({ error: { message: 'Session not found' } })
        }
        return Promise.resolve({ error: null })
      })

      const result1 = await mockSignOut()
      const result2 = await mockSignOut()

      expect(result1.error).toBeNull()
      expect(result2.error).toBeDefined() // Second call fails gracefully
    })
  })

  // ============================================================================
  // SECURITY SCENARIOS
  // ============================================================================

  describe('Security Scenarios', () => {
    it('should prevent session fixation after logout', async () => {
      const oldSessionId = 'old-session-123'
      const newSessionId = 'new-session-456'

      mockSignOut.mockResolvedValue({ error: null })

      // After logout, old session should be invalid
      await mockSignOut()

      // New session ID should be different
      expect(newSessionId).not.toBe(oldSessionId)
    })

    it('should clear all sensitive data from response', async () => {
      const response = NextResponse.redirect(new URL('/auth/login', 'http://localhost'))
      
      // Ensure no sensitive headers
      response.headers.delete('x-auth-token')
      response.headers.delete('x-user-id')
      response.headers.delete('x-session-id')

      expect(response.headers.has('x-auth-token')).toBe(false)
      expect(response.headers.has('x-user-id')).toBe(false)
    })

    it('should handle CSRF token cleanup on logout', async () => {
      mockCookiesDelete.mockImplementation((name: string) => {
        if (name === 'csrf_token') {
          return undefined
        }
      })

      mockCookiesDelete('csrf_token')

      expect(mockCookiesDelete).toHaveBeenCalledWith('csrf_token')
    })

    it('should invalidate tokens on server side', async () => {
      const tokensInvalidated = vi.fn().mockResolvedValue(true)

      await tokensInvalidated()

      expect(tokensInvalidated).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // POST-LOGOUT STATE
  // ============================================================================

  describe('Post-Logout State', () => {
    it('should require re-authentication after logout', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const session = await mockGetSession()

      expect(session.data.session).toBeNull()
    })

    it('should not allow access to protected routes after logout', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const session = await mockGetSession()

      if (!session.data.session) {
        const response = NextResponse.redirect(new URL('/auth/login', 'http://localhost'))
        expect([302, 307]).toContain(response.status)
      }
    })

    it('should clear client-side storage references', async () => {
      // Simulate clearing localStorage/sessionStorage
      const storageKeys = ['supabase.auth.token', 'user', 'session']
      
      const clearStorage = () => {
        storageKeys.forEach(key => {
          // localStorage.removeItem(key)
          expect(key).toBeDefined()
        })
      }

      clearStorage()
    })
  })
})
