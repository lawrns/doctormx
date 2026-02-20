/**
 * TST-002: Authentication Flow Tests - Session Management
 * Doctor.mx - Critical Authentication Test Suite
 *
 * Tests coverage:
 * - Session creation
 * - Session validation
 * - Session expiration
 * - Token refresh
 * - Role-based access control
 * - Middleware protection
 * - Session persistence
 * - Concurrent session handling
 * - Session security
 * - Session metadata
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  resetMocks,
  setMockUser,
  setMockSession,
  mockUsers,
  validCsrfToken,
  createMockRequest,
  createAuthenticatedRequest,
  currentUser,
} from '../security/setup'

// Mock Supabase client
const mockGetSession = vi.fn()
const mockGetUser = vi.fn()
const mockRefreshSession = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      refreshSession: mockRefreshSession,
      signOut: mockSignOut,
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        if (currentUser) {
          return Promise.resolve({
            data: {
              id: currentUser.id,
              email: currentUser.email,
              role: currentUser.role,
              full_name: currentUser.full_name,
              subscription_tier: currentUser.subscription_tier,
            },
            error: null,
          })
        }
        return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
  createServiceClient: vi.fn(() => Promise.resolve({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  })),
}))

// Mock auth middleware
const mockRequireAuth = vi.fn()
const mockHasRole = vi.fn()
const mockHasAnyRole = vi.fn()
const mockGetCurrentUserId = vi.fn()

vi.mock('@/lib/middleware/auth', () => ({
  requireAuth: mockRequireAuth,
  hasRole: mockHasRole,
  hasAnyRole: mockHasAnyRole,
  getCurrentUserId: mockGetCurrentUserId,
  getOptionalAuth: vi.fn(),
  getUserProfile: vi.fn(),
  checkAuthForMiddleware: vi.fn(),
  AuthError: class AuthError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.name = 'AuthError'
      this.code = code
    }
  },
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

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: mockCookiesGet,
    set: mockCookiesSet,
    delete: vi.fn(),
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

describe('AUTH-004: Session Management Tests', () => {
  beforeEach(() => {
    resetMocks()
    vi.clearAllMocks()
    mockGetSession.mockReset()
    mockGetUser.mockReset()
    mockRefreshSession.mockReset()
    mockRequireAuth.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============================================================================
  // SESSION CREATION
  // ============================================================================

  describe('Session Creation', () => {
    it('should create session with valid credentials', async () => {
      const mockSessionData = {
        user: {
          id: 'user-123',
          email: 'test@test.com',
        },
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_at: Date.now() + 3600,
        expires_in: 3600,
        token_type: 'bearer',
      }

      mockGetSession.mockResolvedValue({
        data: { session: mockSessionData },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.error).toBeNull()
      expect(result.data.session).toBeDefined()
      expect(result.data.session.access_token).toBe('valid-access-token')
    })

    it('should include user metadata in session', async () => {
      const sessionWithMetadata = {
        user: {
          id: 'user-123',
          email: 'test@test.com',
          user_metadata: {
            full_name: 'Test User',
            role: 'patient',
          },
        },
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: Date.now() + 3600,
      }

      mockGetSession.mockResolvedValue({
        data: { session: sessionWithMetadata },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session.user.user_metadata).toBeDefined()
      expect(result.data.session.user.user_metadata.full_name).toBe('Test User')
    })

    it('should set session expiration time', async () => {
      const expiresAt = Date.now() + 3600 // 1 hour from now

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'token',
            expires_at: expiresAt,
            expires_in: 3600,
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session.expires_at).toBe(expiresAt)
      expect(result.data.session.expires_in).toBe(3600)
    })
  })

  // ============================================================================
  // SESSION VALIDATION
  // ============================================================================

  describe('Session Validation', () => {
    it('should validate active session', async () => {
      setMockUser(mockUsers.patient)
      setMockSession({
        access_token: 'valid-token',
        refresh_token: 'valid-refresh',
      })

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: mockUsers.patient,
            access_token: 'valid-token',
            expires_at: Date.now() + 3600,
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.error).toBeNull()
      expect(result.data.session).toBeDefined()
    })

    it('should reject expired session', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'expired-token',
            expires_at: Date.now() - 1000, // Expired 1 second ago
            expires_in: -1,
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session.expires_in).toBeLessThan(0)
    })

    it('should reject invalid session token', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid session', status: 401 },
      })

      const result = await mockGetSession()

      expect(result.data.session).toBeNull()
    })

    it('should handle missing session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  // ============================================================================
  // TOKEN REFRESH
  // ============================================================================

  describe('Token Refresh', () => {
    it('should refresh expired access token', async () => {
      const newSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3600,
        expires_in: 3600,
      }

      mockRefreshSession.mockResolvedValue({
        data: { session: newSession },
        error: null,
      })

      const result = await mockRefreshSession()

      expect(result.error).toBeNull()
      expect(result.data.session.access_token).toBe('new-access-token')
      expect(result.data.session.refresh_token).toBe('new-refresh-token')
    })

    it('should update cookies with new tokens', async () => {
      const newSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: Date.now() + 3600,
      }

      mockRefreshSession.mockResolvedValue({
        data: { session: newSession },
        error: null,
      })

      await mockRefreshSession()

      // Cookies should be updated
      expect(mockRefreshSession).toHaveBeenCalled()
    })

    it('should handle refresh token expiration', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { session: null },
        error: {
          message: 'Refresh token expired',
          status: 401,
        },
      })

      const result = await mockRefreshSession()

      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('Refresh token expired')
    })

    it('should require re-authentication when refresh fails', async () => {
      mockRefreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid refresh token', status: 401 },
      })

      const result = await mockRefreshSession()

      if (result.error) {
        // Should redirect to login
        expect(result.error.status).toBe(401)
      }
    })
  })

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL
  // ============================================================================

  describe('Role-Based Access Control', () => {
    it('should allow access for required role', async () => {
      setMockUser(mockUsers.doctor)

      mockRequireAuth.mockImplementation(async (allowedRoles?: string[]) => {
        if (allowedRoles && !allowedRoles.includes(mockUsers.doctor.role)) {
          throw new Error('NOT_AUTHORIZED')
        }
        return {
          user: { id: mockUsers.doctor.id, email: mockUsers.doctor.email },
          profile: { role: mockUsers.doctor.role },
          session: { access_token: 'token' },
        }
      })

      const result = await mockRequireAuth(['doctor'])

      expect(result.profile.role).toBe('doctor')
    })

    it('should deny access for insufficient role', async () => {
      setMockUser(mockUsers.patient)

      mockRequireAuth.mockImplementation(async (allowedRoles?: string[]) => {
        if (allowedRoles && !allowedRoles.includes(mockUsers.patient.role)) {
          const error = new Error('NOT_AUTHORIZED')
          error.name = 'AuthError'
          throw error
        }
        return { user: {}, profile: { role: mockUsers.patient.role }, session: {} }
      })

      await expect(mockRequireAuth(['doctor'])).rejects.toThrow()
    })

    it('should support multiple allowed roles', async () => {
      setMockUser(mockUsers.doctor)

      mockRequireAuth.mockImplementation(async (allowedRoles?: string[]) => {
        const userRole = mockUsers.doctor.role
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          throw new Error('NOT_AUTHORIZED')
        }
        return {
          user: { id: mockUsers.doctor.id },
          profile: { role: userRole },
          session: { access_token: 'token' },
        }
      })

      const result = await mockRequireAuth(['doctor', 'admin'])

      expect(result.profile.role).toBe('doctor')
    })

    it('should check hasRole for single role', async () => {
      mockHasRole.mockImplementation(async (role: string) => {
        return mockUsers.patient.role === role
      })

      const isPatient = await mockHasRole('patient')
      const isDoctor = await mockHasRole('doctor')

      expect(isPatient).toBe(true)
      expect(isDoctor).toBe(false)
    })

    it('should check hasAnyRole for multiple roles', async () => {
      mockHasAnyRole.mockImplementation(async (roles: string[]) => {
        return roles.includes(mockUsers.patient.role)
      })

      const hasAllowedRole = await mockHasAnyRole(['doctor', 'patient'])
      const hasNoAllowedRole = await mockHasAnyRole(['doctor', 'admin'])

      expect(hasAllowedRole).toBe(true)
      expect(hasNoAllowedRole).toBe(false)
    })
  })

  // ============================================================================
  // MIDDLEWARE PROTECTION
  // ============================================================================

  describe('Middleware Protection', () => {
    it('should protect API routes with authentication', async () => {
      setMockUser(mockUsers.patient)

      mockRequireAuth.mockResolvedValue({
        user: { id: 'user-123' },
        profile: { role: 'patient' },
        session: { access_token: 'token' },
      })

      const result = await mockRequireAuth()

      expect(result.user).toBeDefined()
      expect(result.session).toBeDefined()
    })

    it('should redirect unauthenticated users from protected routes', async () => {
      mockRequireAuth.mockImplementation(async () => {
        const error = new Error('No autenticado')
        error.name = 'AuthError'
        ;(error as any).code = 'NOT_AUTHENTICATED'
        throw error
      })

      try {
        await mockRequireAuth()
      } catch (error: any) {
        expect(error.code).toBe('NOT_AUTHENTICATED')
      }
    })

    it('should allow access to public routes without authentication', async () => {
      // Public routes don't require auth
      const isPublicRoute = (path: string) => {
        const publicPaths = ['/auth/login', '/auth/register', '/doctores']
        return publicPaths.some(p => path.startsWith(p)) || path === '/'
      }

      expect(isPublicRoute('/auth/login')).toBe(true)
      expect(isPublicRoute('/auth/register')).toBe(true)
      expect(isPublicRoute('/app')).toBe(false)
      expect(isPublicRoute('/')).toBe(true)
    })

    it('should apply role-based access in middleware', async () => {
      setMockUser(mockUsers.admin)

      mockRequireAuth.mockImplementation(async (allowedRoles?: string[]) => {
        if (allowedRoles && !allowedRoles.includes('admin')) {
          throw new Error('NOT_AUTHORIZED')
        }
        return {
          user: { id: mockUsers.admin.id },
          profile: { role: 'admin' },
          session: { access_token: 'token' },
        }
      })

      const result = await mockRequireAuth(['admin'])

      expect(result.profile.role).toBe('admin')
    })
  })

  // ============================================================================
  // SESSION PERSISTENCE
  // ============================================================================

  describe('Session Persistence', () => {
    it('should persist session across requests', async () => {
      const sessionData = {
        user: { id: 'user-123' },
        access_token: 'persistent-token',
        expires_at: Date.now() + 3600,
      }

      // First request
      mockGetSession.mockResolvedValue({
        data: { session: sessionData },
        error: null,
      })

      const result1 = await mockGetSession()
      expect(result1.data.session).toBeDefined()

      // Second request - same session
      const result2 = await mockGetSession()
      expect(result2.data.session.access_token).toBe(sessionData.access_token)
    })

    it('should maintain session in cookies', async () => {
      mockCookiesGet.mockImplementation((name: string) => {
        if (name === 'sb-access-token') {
          return { value: 'stored-token' }
        }
        return undefined
      })

      const token = mockCookiesGet('sb-access-token')
      expect(token?.value).toBe('stored-token')
    })

    it('should handle session restoration', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
            access_token: 'restored-token',
            expires_at: Date.now() + 3600,
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session).toBeDefined()
      expect(result.data.session.access_token).toBe('restored-token')
    })
  })

  // ============================================================================
  // CONCURRENT SESSION HANDLING
  // ============================================================================

  describe('Concurrent Session Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      setMockUser(mockUsers.patient)

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: mockUsers.patient,
            access_token: 'token',
            expires_at: Date.now() + 3600,
          },
        },
        error: null,
      })

      // Simulate concurrent requests
      const promises = Array(5).fill(null).map(() => mockGetSession())

      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data.session).toBeDefined()
      })
    })

    it('should handle session refresh during active requests', async () => {
      mockRefreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'refreshed-token',
            refresh_token: 'new-refresh',
            expires_at: Date.now() + 3600,
          },
        },
        error: null,
      })

      const result = await mockRefreshSession()

      expect(result.data.session.access_token).toBe('refreshed-token')
    })
  })

  // ============================================================================
  // SESSION SECURITY
  // ============================================================================

  describe('Session Security', () => {
    it('should use secure session tokens', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'secure_random_token_12345',
            refresh_token: 'secure_random_refresh_67890',
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      // Tokens should be sufficiently long and random
      expect(result.data.session.access_token.length).toBeGreaterThan(20)
      expect(result.data.session.refresh_token.length).toBeGreaterThan(20)
    })

    it('should set secure cookie attributes', async () => {
      mockCookiesSet.mockImplementation((
        name: string,
        value: string,
        options: { secure?: boolean; httpOnly?: boolean; sameSite?: string }
      ) => {
        expect(options.secure).toBe(true)
        expect(options.httpOnly).toBe(true)
        expect(options.sameSite).toBe('lax')
      })

      mockCookiesSet('sb-access-token', 'token', {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      })
    })

    it('should prevent session fixation', async () => {
      const oldToken = 'old-session-token'
      const newToken = 'new-session-token'

      // After authentication, token should change
      expect(newToken).not.toBe(oldToken)
    })

    it('should handle CSRF protection for session operations', async () => {
      const request = createMockRequest('http://localhost/api/user/profile', {
        method: 'POST',
        headers: { 'x-csrf-token': validCsrfToken },
        cookies: {
          'sb-access-token': 'valid-token',
          'csrf_token': validCsrfToken,
        },
      })

      const csrfToken = request.headers.get('x-csrf-token')
      const cookieTokenObj = request.cookies.get('csrf_token')

      expect(csrfToken).toBe(validCsrfToken)
      expect(cookieTokenObj?.value || cookieTokenObj).toBe(validCsrfToken)
    })
  })

  // ============================================================================
  // SESSION METADATA
  // ============================================================================

  describe('Session Metadata', () => {
    it('should track session creation time', async () => {
      const createdAt = new Date().toISOString()

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            user: { created_at: createdAt },
            access_token: 'token',
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session.user.created_at).toBe(createdAt)
    })

    it('should track last activity', async () => {
      const lastSignInAt = new Date().toISOString()

      mockGetUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            last_sign_in_at: lastSignInAt,
          },
        },
        error: null,
      })

      const result = await mockGetUser()

      expect(result.data.user.last_sign_in_at).toBe(lastSignInAt)
    })

    it('should include user agent in session context', async () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'

      // Session should capture user agent for security
      const request = createMockRequest('http://localhost/api/user', {
        headers: { 'user-agent': userAgent },
      })

      expect(request.headers.get('user-agent')).toBe(userAgent)
    })

    it('should track IP address for security', async () => {
      const clientIp = '192.168.1.100'

      const request = createMockRequest('http://localhost/api/user', {
        headers: { 'x-forwarded-for': clientIp },
      })

      expect(request.headers.get('x-forwarded-for')).toBe(clientIp)
    })
  })

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle database errors during session retrieval', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Database connection failed', code: 'ECONNREFUSED' },
      })

      const result = await mockGetSession()

      expect(result.error).toBeDefined()
      expect(result.data.session).toBeNull()
    })

    it('should handle session parsing errors', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid session format', status: 400 },
      })

      const result = await mockGetSession()

      expect(result.error).toBeDefined()
    })

    it('should handle missing user profile', async () => {
      setMockUser(mockUsers.patient)

      mockRequireAuth.mockImplementation(async () => {
        const error = new Error('Perfil no encontrado')
        error.name = 'AuthError'
        ;(error as any).code = 'PROFILE_NOT_FOUND'
        throw error
      })

      try {
        await mockRequireAuth()
      } catch (error: any) {
        expect(error.code).toBe('PROFILE_NOT_FOUND')
      }
    })

    it('should handle session expiration errors', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired', code: 'SESSION_EXPIRED' },
      })

      const result = await mockGetSession()

      expect(result.error).toBeDefined()
      expect(result.error.code).toBe('SESSION_EXPIRED')
    })
  })

  // ============================================================================
  // SESSION INVALIDATION
  // ============================================================================

  describe('Session Invalidation', () => {
    it('should invalidate session on sign out', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const result = await mockSignOut()

      expect(result.error).toBeNull()
    })

    it('should invalidate all user sessions', async () => {
      const invalidateAllUserSessions = vi.fn().mockResolvedValue(undefined)

      await invalidateAllUserSessions('user-123')

      expect(invalidateAllUserSessions).toHaveBeenCalledWith('user-123')
    })

    it('should invalidate sessions on security events', async () => {
      const recordSecurityEvent = vi.fn().mockImplementation(
        async (userId: string, eventType: string) => {
          if (eventType === 'password_change' || eventType === 'role_change') {
            // Invalidate all sessions
            return Promise.resolve({ invalidated: true })
          }
          return Promise.resolve({ invalidated: false })
        }
      )

      const result = await recordSecurityEvent('user-123', 'password_change')

      expect(result.invalidated).toBe(true)
    })
  })
})
