/**
 * Security Test Setup - Shared utilities for API security testing
 * Doctor.mx - Critical Security Test Infrastructure
 */

import { vi, type MockedFunction, expect } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// MOCK TRACKING
// ============================================================================

export const mockCalls = {
  from: [] as string[],
  select: [] as string[][],
  eq: [] as { column: string; value: string }[],
  update: [] as Record<string, unknown>[],
  insert: [] as Record<string, unknown>[],
  single: 0,
  auth: {
    getUser: 0,
    getSession: 0,
    signOut: 0,
  },
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

export interface MockUser {
  id: string
  email: string
  role: 'patient' | 'doctor' | 'admin'
  full_name?: string
  subscription_tier?: string
}

export const mockUsers = {
  patient: {
    id: 'patient-123',
    email: 'patient@test.com',
    role: 'patient',
    full_name: 'Test Patient',
    subscription_tier: 'free',
  } as MockUser,
  doctor: {
    id: 'doctor-456',
    email: 'doctor@test.com',
    role: 'doctor',
    full_name: 'Dr. Test Doctor',
    subscription_tier: 'premium',
  } as MockUser,
  admin: {
    id: 'admin-789',
    email: 'admin@test.com',
    role: 'admin',
    full_name: 'Admin User',
    subscription_tier: 'enterprise',
  } as MockUser,
}

// ============================================================================
// MOCK NEXT/HEADERS
// ============================================================================

export const mockHeadersGet = vi.fn()
export const mockCookiesGetAll = vi.fn(() => [])
export const mockCookiesSet = vi.fn()
export const mockCookiesGet = vi.fn()
export const mockCookiesHas = vi.fn(() => false)

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({
    get: mockHeadersGet,
    entries: vi.fn().mockReturnValue([]),
    getSetCookie: vi.fn().mockReturnValue([]),
    has: vi.fn().mockReturnValue(false),
  })),
  cookies: vi.fn(() => Promise.resolve({
    getAll: mockCookiesGetAll,
    set: mockCookiesSet,
    get: mockCookiesGet,
    has: mockCookiesHas,
    delete: vi.fn(),
  })),
}))

// ============================================================================
// MOCK NEXT/SERVER
// ============================================================================

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: () => Promise.resolve(data),
        cookies: {
          set: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
        },
      })),
      redirect: vi.fn((url: string | URL) => ({
        status: 302,
        headers: new Headers({ location: url.toString() }),
        json: () => Promise.resolve({}),
      })),
      next: vi.fn(() => ({
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({}),
        cookies: {
          set: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
        },
      })),
    },
  }
})

// ============================================================================
// MOCK LOGGER
// ============================================================================

vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// ============================================================================
// MOCK RATE LIMITING
// ============================================================================

export let rateLimitShouldFail = false
export let rateLimitResetInSeconds = 60

export function setRateLimitFail(shouldFail: boolean, resetInSeconds = 60) {
  rateLimitShouldFail = shouldFail
  rateLimitResetInSeconds = resetInSeconds
}

vi.mock('@/lib/rate-limit/middleware', () => ({
  withRateLimit: vi.fn(async (request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => {
    if (rateLimitShouldFail) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResetInSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + rateLimitResetInSeconds * 1000),
            'Retry-After': String(rateLimitResetInSeconds),
          },
        }
      )
    }
    return handler(request)
  }),
  rateLimitMiddleware: vi.fn(async () => null),
  getClientIp: vi.fn(() => '127.0.0.1'),
  addRateLimitHeaders: vi.fn((response) => response),
  createRateLimitResponse: vi.fn((result) => NextResponse.json(
    { error: 'Rate limit exceeded', retryAfter: result.resetInSeconds },
    { status: 429 }
  )),
}))

// ============================================================================
// SUPABASE MOCK SETUP
// ============================================================================

export let currentUser: MockUser | null = null
export let mockSession: { access_token: string; refresh_token: string } | null = null

export function setMockUser(user: MockUser | null) {
  currentUser = user
}

export function setMockSession(session: { access_token: string; refresh_token: string } | null) {
  mockSession = session
}

// Create chainable mock for Supabase queries with table context
export function createMockChain(tableName: string): Record<string, ReturnType<typeof vi.fn>> {
  const filters: { column: string; value: string }[] = []
  
  // Helper to get response for single()
  const getSingleResponse = function(this: typeof chain) {
    mockCalls.single++
    
    // If this is after an insert, return the inserted data
    const insertData = (this as any)._insertData
    if (insertData) {
      return Promise.resolve({ data: insertData, error: null })
    }
    
    // If this is after an update, return the updated data
    const updateData = (this as any)._updateData
    if (updateData) {
      return Promise.resolve({ data: { id: 'pres-123', ...updateData }, error: null })
    }
    
    if (!currentUser) {
      return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
    }
    
    // For profiles table
    if (tableName === 'profiles') {
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
    
    // For doctors table
    if (tableName === 'doctors') {
      if (currentUser.role === 'doctor') {
        return Promise.resolve({
          data: { id: currentUser.id, user_id: currentUser.id },
          error: null,
        })
      }
      return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
    }
    
    // For chat_conversations table
    if (tableName === 'chat_conversations') {
      // Check if this is an IDOR test case - look for specific conversation ID filters
      const idFilter = filters.find(f => f.column === 'id')
      const convId = idFilter?.value
      
      // For IDOR tests (conv-other or conv-different-user), return conversation owned by different user
      if (convId === 'conv-other' || convId === 'other-user-conv' || convId?.includes('other')) {
        return Promise.resolve({
          data: {
            id: convId,
            patient_id: 'different-user-id', // Not the current user
            doctor_id: 'another-doctor-id',
            appointment_id: null,
            last_message_preview: null,
            last_message_at: null,
            is_archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        })
      }
      
      return Promise.resolve({
        data: {
          id: convId || 'conv-123',
          patient_id: currentUser.id,
          doctor_id: 'doctor-456',
          appointment_id: null,
          last_message_preview: null,
          last_message_at: null,
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      })
    }
    
    // For appointments table
    if (tableName === 'appointments') {
      const now = new Date().toISOString()
      if (currentUser.role === 'patient') {
        return Promise.resolve({
          data: { id: 'appt-123', doctor_id: 'doctor-456', patient_id: currentUser.id, start_ts: now },
          error: null,
        })
      }
      return Promise.resolve({
        data: { id: 'appt-123', doctor_id: currentUser.id, patient_id: 'patient-123', start_ts: now },
        error: null,
      })
    }
    
    // For prescriptions table
    if (tableName === 'prescriptions') {
      const idFilter = filters.find(f => f.column === 'id')
      const appointmentIdFilter = filters.find(f => f.column === 'appointment_id')
      
      if (idFilter?.value?.includes('<')) {
        return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
      }
      const requestedId = idFilter?.value || 'pres-123'
      const requestedAppointmentId = appointmentIdFilter?.value || 'appt-123'
      
      // For pres-456, return a prescription that belongs to a different patient
      // This is used to test "prevents patient from viewing other patients prescriptions"
      if (requestedId === 'pres-456') {
        return Promise.resolve({
          data: {
            id: requestedId,
            doctor_id: 'doctor-456',
            patient_id: 'patient-123', // Belongs to patient-123, not different-patient
            appointment_id: requestedAppointmentId,
            medications: [],
            diagnosis: 'Test diagnosis',
            status: 'active',
            appointment: { doctor_id: 'doctor-456', patient_id: 'patient-123' },
          },
          error: null,
        })
      }
      return Promise.resolve({
        data: {
          id: requestedId,
          doctor_id: 'doctor-456',
          patient_id: currentUser.id,
          appointment_id: requestedAppointmentId,
          medications: [],
          diagnosis: 'Test diagnosis',
          status: 'active',
          appointment: { doctor_id: 'doctor-456', patient_id: currentUser.id },
        },
        error: null,
      })
    }
    
    // For chat_messages table
    if (tableName === 'chat_messages') {
      return Promise.resolve({ data: [], error: null })
    }
    
    // For chat_message_receipts table
    if (tableName === 'chat_message_receipts') {
      return Promise.resolve({ data: [], error: null })
    }
    
    // For followups table (used by scheduleFollowUp)
    if (tableName === 'followups') {
      // Support both insert().select().single() and regular queries
      return Promise.resolve({
        data: {
          id: 'followup-' + Math.random().toString(36).substring(2, 9),
          appointment_id: 'appt-123',
          patient_id: currentUser?.id || 'patient-123',
          doctor_id: 'doctor-456',
          type: 'medication_reminder',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        error: null,
      })
    }
    
    // Default response
    return Promise.resolve({
      data: { id: currentUser.id, email: currentUser.email, role: currentUser.role },
      error: null,
    })
  }
  
  // Helper to get response for array queries (when awaited)
  const getArrayResponse = () => {
    if (tableName === 'chat_conversations') {
      return Promise.resolve({
        data: [{
          id: 'conv-1',
          patient_id: currentUser?.id || 'patient-123',
          doctor_id: 'doctor-456',
          appointment_id: null,
          last_message_preview: 'Test message',
          last_message_at: new Date().toISOString(),
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }],
        error: null,
      })
    }
    if (tableName === 'chat_messages') {
      return Promise.resolve({ data: [], error: null })
    }
    if (tableName === 'chat_message_receipts') {
      return Promise.resolve({ data: [], error: null })
    }
    return Promise.resolve({ data: [], error: null })
  }
  
  // Create the chain object
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  
  // Chain methods that just return chain for fluent interface
  const chainMethods = ['gt', 'lt', 'gte', 'lte', 'order', 'limit', 'delete', 'match', 'contains', 'or', 'and']
  chainMethods.forEach(method => {
    chain[method] = vi.fn(() => chain)
  })
  
  // Methods with parameters that need to return chain
  chain.neq = vi.fn(() => chain)
  chain.not = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  
  // eq method that tracks filters
  chain.eq = vi.fn((column: string, value: string) => {
    mockCalls.eq.push({ column, value })
    filters.push({ column, value })
    return chain
  })
  
  // select method that tracks calls
  chain.select = vi.fn((...args: string[]) => {
    mockCalls.select.push(args)
    return chain
  })
  
  // Methods that return data - use regular function to preserve 'this'
  chain.single = vi.fn(function(this: typeof chain) { return getSingleResponse.call(this) })
  chain.maybeSingle = vi.fn(function(this: typeof chain) { return getSingleResponse.call(this) })
  
  chain.update = vi.fn(function(this: typeof chain, data: Record<string, unknown>) {
    mockCalls.update.push(data)
    // Store update data so single() can return it
    ;(this as any)._updateData = { ...data }
    return this
  })
  
  chain.insert = vi.fn(function(this: typeof chain, data: Record<string, unknown>) {
    mockCalls.insert.push(data)
    // Store insert data so single() can return it
    ;(this as any)._insertData = { id: `${tableName.slice(0, -1)}-${Math.random().toString(36).substring(2, 9)}`, ...data }
    return this
  })
  
  chain.upsert = vi.fn((data: Record<string, unknown>) => {
    mockCalls.insert.push(data)
    return Promise.resolve({ data: { id: 'upsert-id', ...data }, error: null })
  })
  
  // Make chain thenable for await support - use a real function, not a mock
  Object.defineProperty(chain, 'then', {
    value: (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => {
      return getArrayResponse().then(onFulfilled, onRejected)
    },
    writable: true,
    configurable: true,
  })
  
  return chain
}

export const mockFrom = vi.fn((table: string) => {
  return createMockChain(table)
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
    auth: {
      getUser: vi.fn(() => {
        mockCalls.auth.getUser++
        return Promise.resolve({ data: { user: currentUser }, error: currentUser ? null : { message: 'No user' } })
      }),
      getSession: vi.fn(() => {
        mockCalls.auth.getSession++
        return Promise.resolve({
          data: {
            session: mockSession && currentUser ? {
              user: currentUser,
              access_token: mockSession.access_token,
              refresh_token: mockSession.refresh_token,
              expires_at: Date.now() + 3600,
              expires_in: 3600,
              token_type: 'bearer',
            } : null,
          },
          error: null,
        })
      }),
      signOut: vi.fn(() => {
        mockCalls.auth.signOut++
        currentUser = null
        mockSession = null
        return Promise.resolve({ error: null })
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  })),
  createServiceClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
    auth: {
      admin: {
        deleteUser: vi.fn(),
      },
    },
  })),
}))

// ============================================================================
// MOCK CSRF
// ============================================================================

export let csrfTokenValid = true
export const validCsrfToken = 'valid-csrf-token-12345678901234567890123456789012'

export function setCsrfValid(valid: boolean) {
  csrfTokenValid = valid
}

vi.mock('@/lib/csrf', () => ({
  generateCSRFToken: vi.fn(() => ({ token: validCsrfToken, header: 'x-csrf-token' })),
  validateCSRFToken: vi.fn((request: NextRequest, token: string, detailed?: boolean) => {
    const requestToken = request.headers.get('x-csrf-token')
    const isValid = csrfTokenValid && requestToken === validCsrfToken
    
    if (detailed) {
      return isValid
        ? { valid: true }
        : { valid: false, error: 'INVALID_TOKEN', message: 'CSRF token validation failed' }
    }
    return isValid
  }),
  setCSRFCookie: vi.fn(),
  getCSRFCookie: vi.fn((request: NextRequest) => request.cookies.get('csrf_token')?.value),
  getServerCSRFCookie: vi.fn(() => Promise.resolve(validCsrfToken)),
  generateAndSetCSRFCookie: vi.fn(() => ({ token: validCsrfToken, header: 'x-csrf-token' })),
  requiresCSRFProtection: vi.fn((request: NextRequest) => {
    const method = request.method.toUpperCase()
    return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  }),
  createCSRFErrorResponse: vi.fn((result: { error?: string; message?: string }) => 
    NextResponse.json(
      { error: 'CSRF validation failed', code: result.error, message: result.message },
      { status: 403 }
    )
  ),
}))

// ============================================================================
// MOCK MIDDLEWARE AUTH
// ============================================================================

vi.mock('@/lib/middleware/auth', () => ({
  requireAuth: vi.fn(async (allowedRoles?: string[]) => {
    if (!currentUser) {
      const error = new Error('No autenticado')
      error.name = 'AuthError'
      ;(error as any).code = 'NOT_AUTHENTICATED'
      throw error
    }
    
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      const error = new Error(`Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`)
      error.name = 'AuthError'
      ;(error as any).code = 'NOT_AUTHORIZED'
      throw error
    }
    
    return {
      user: {
        id: currentUser.id,
        email: currentUser.email,
        app_metadata: {},
        user_metadata: { full_name: currentUser.full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      profile: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        full_name: currentUser.full_name,
        subscription_tier: currentUser.subscription_tier,
      },
      session: {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_at: Date.now() + 3600,
        expires_in: 3600,
        token_type: 'bearer',
      },
    }
  }),
  getOptionalAuth: vi.fn(async () => {
    if (!currentUser) return null
    return {
      user: { id: currentUser.id, email: currentUser.email },
      profile: { id: currentUser.id, role: currentUser.role },
      session: { access_token: 'test-token', refresh_token: 'test-refresh', expires_at: Date.now() + 3600, expires_in: 3600, token_type: 'bearer' },
    }
  }),
  hasRole: vi.fn(async (role: string) => currentUser?.role === role),
  hasAnyRole: vi.fn(async (roles: string[]) => currentUser ? roles.includes(currentUser.role) : false),
  getCurrentUserId: vi.fn(async () => currentUser?.id || null),
  getUserProfile: vi.fn(async (userId: string) => {
    if (currentUser?.id === userId) {
      return { id: currentUser.id, role: currentUser.role, full_name: currentUser.full_name }
    }
    return null
  }),
  checkAuthForMiddleware: vi.fn(async () => ({
    authenticated: !!currentUser,
    authorized: true,
    userId: currentUser?.id,
    role: currentUser?.role,
  })),
  AuthError: class AuthError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.name = 'AuthError'
      this.code = code
    }
  },
}))

// ============================================================================
// AUTH ERROR CLASS
// ============================================================================

export class AuthError extends Error {
  code: 'NOT_AUTHENTICATED' | 'NOT_AUTHORIZED' | 'PROFILE_NOT_FOUND' | 'SESSION_EXPIRED'
  constructor(
    message: string,
    code: 'NOT_AUTHENTICATED' | 'NOT_AUTHORIZED' | 'PROFILE_NOT_FOUND' | 'SESSION_EXPIRED'
  ) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

// ============================================================================
// MOCK LEGACY AUTH
// ============================================================================

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(async () => {
    if (!currentUser) {
      throw new AuthError('No autenticado', 'NOT_AUTHENTICATED')
    }
    return {
      user: { id: currentUser.id, email: currentUser.email },
      supabase: { from: mockFrom },
    }
  }),
  requireRole: vi.fn(async (role: string) => {
    if (!currentUser) {
      throw new AuthError('No autenticado', 'NOT_AUTHENTICATED')
    }
    if (currentUser.role !== role) {
      throw new AuthError(`Se requiere rol: ${role}`, 'NOT_AUTHORIZED')
    }
    return {
      user: { id: currentUser.id, email: currentUser.email },
      profile: { id: currentUser.id, role: currentUser.role, full_name: currentUser.full_name },
      supabase: { from: mockFrom },
    }
  }),
  getProfile: vi.fn(async (userId: string) => {
    if (currentUser?.id === userId) {
      return { id: currentUser.id, role: currentUser.role, full_name: currentUser.full_name }
    }
    return null
  }),
  AuthError: class AuthError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.name = 'AuthError'
      this.code = code
    }
  },
}))

// ============================================================================
// MOCK MIDDLEWARE AUTH (for routes that import from @/lib/middleware/auth)
// ============================================================================

vi.mock('@/lib/middleware/auth', () => ({
  requireAuth: vi.fn(async (allowedRoles?: string[]) => {
    if (!currentUser) {
      const error = new AuthError('No autenticado', 'NOT_AUTHENTICATED')
      throw error
    }
    
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role as unknown as any)) {
      const error = new AuthError(`Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`, 'NOT_AUTHORIZED')
      throw error
    }
    
    return {
      user: {
        id: currentUser.id,
        email: currentUser.email,
        app_metadata: {},
        user_metadata: { full_name: currentUser.full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      profile: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        full_name: currentUser.full_name,
        subscription_tier: currentUser.subscription_tier,
      },
      session: {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_at: Date.now() + 3600,
        expires_in: 3600,
        token_type: 'bearer',
      },
    }
  }),
  getOptionalAuth: vi.fn(async () => {
    if (!currentUser) return null
    return {
      user: { id: currentUser.id, email: currentUser.email },
      profile: { id: currentUser.id, role: currentUser.role },
      session: { access_token: 'test-token', refresh_token: 'test-refresh', expires_at: Date.now() + 3600, expires_in: 3600, token_type: 'bearer' },
    }
  }),
  hasRole: vi.fn(async (role: string) => currentUser?.role === role),
  hasAnyRole: vi.fn(async (roles: string[]) => currentUser ? roles.includes(currentUser.role) : false),
  getCurrentUserId: vi.fn(async () => currentUser?.id || null),
  getUserProfile: vi.fn(async (userId: string) => {
    if (currentUser?.id === userId) {
      return { id: currentUser.id, role: currentUser.role, full_name: currentUser.full_name }
    }
    return null
  }),
  checkAuthForMiddleware: vi.fn(async () => ({
    authenticated: !!currentUser,
    authorized: true,
    userId: currentUser?.id,
    role: currentUser?.role,
  })),
  AuthError: class AuthError extends Error {
    code: 'NOT_AUTHENTICATED' | 'NOT_AUTHORIZED' | 'PROFILE_NOT_FOUND' | 'SESSION_EXPIRED'
    constructor(
      message: string,
      code: 'NOT_AUTHENTICATED' | 'NOT_AUTHORIZED' | 'PROFILE_NOT_FOUND' | 'SESSION_EXPIRED'
    ) {
      super(message)
      this.name = 'AuthError'
      this.code = code
    }
  },
}))

// ============================================================================
// TEST HELPERS
// ============================================================================

export function resetMocks() {
  mockCalls.from = []
  mockCalls.select = []
  mockCalls.eq = []
  mockCalls.update = []
  mockCalls.insert = []
  mockCalls.single = 0
  mockCalls.auth.getUser = 0
  mockCalls.auth.getSession = 0
  mockCalls.auth.signOut = 0
  currentUser = null
  mockSession = null
  csrfTokenValid = true
  rateLimitShouldFail = false
}

// Helper to create a mock NextRequest
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    cookies?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body, headers = {}, cookies = {} } = options
  
  // Create headers
  const requestHeaders = new Headers(headers)
  
  // Handle body based on type
  let requestBody: BodyInit | undefined
  if (body) {
    // Check if body is FormData (using constructor name for cross-environment compatibility)
    const isFormData = body && typeof body === 'object' && 
      (body instanceof FormData || body.constructor?.name === 'FormData' || typeof (body as FormData).append === 'function')
    
    if (isFormData) {
      // FormData is handled directly, don't set content-type (browser sets it with boundary)
      requestBody = body as FormData
    } else if (!requestHeaders.has('content-type')) {
      requestHeaders.set('content-type', 'application/json')
      requestBody = JSON.stringify(body)
    } else {
      requestBody = JSON.stringify(body)
    }
  }
  
  // Create request
  const request = new NextRequest(new URL(url, 'http://localhost'), {
    method,
    headers: requestHeaders,
    body: requestBody,
  })
  
  // Mock cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value)
  })
  
  return request
}

// Helper to create authenticated request
export function createAuthenticatedRequest(
  url: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    user?: MockUser
    includeCsrf?: boolean
  } = {}
): { request: NextRequest; user: MockUser } {
  const { method = 'GET', body, headers = {}, user = mockUsers.patient, includeCsrf = true } = options
  
  // Set the current user
  setMockUser(user)
  setMockSession({ access_token: 'test-token', refresh_token: 'test-refresh' })
  
  const requestHeaders: Record<string, string> = { ...headers }
  
  // Add CSRF token for state-changing methods
  if (includeCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    requestHeaders['x-csrf-token'] = validCsrfToken
  }
  
  const request = createMockRequest(url, {
    method,
    body,
    headers: requestHeaders,
    cookies: {
      'sb-access-token': 'test-token',
      'csrf_token': validCsrfToken,
    },
  })
  
  return { request, user }
}

// Helper to expect unauthorized response
export function expectUnauthorized(response: { status: number; json: () => Promise<unknown> }) {
  expect(response.status).toBe(401)
}

// Helper to expect forbidden response
export function expectForbidden(response: { status: number; json: () => Promise<unknown> }) {
  expect(response.status).toBe(403)
}

// Helper to expect rate limit response
export function expectRateLimited(response: { status: number; headers: Headers }) {
  expect(response.status).toBe(429)
  expect(response.headers.get('Retry-After')).toBeTruthy()
}

// Helper to expect bad request response
export function expectBadRequest(response: { status: number }) {
  expect(response.status).toBe(400)
}

// Helper to expect success response
export function expectSuccess(response: { status: number }) {
  expect(response.status).toBe(200)
}
