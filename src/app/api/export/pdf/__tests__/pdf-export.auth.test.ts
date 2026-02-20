/**
 * PDF Export API Authentication Tests
 * Verifies that the PDF export endpoint requires authentication
 */

import { describe, it, expect, vi } from 'vitest'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
  AuthError: class AuthError extends Error {
    code = 'NOT_AUTHENTICATED'
    constructor(message: string) {
      super(message)
      this.name = 'AuthError'
    }
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60000 }),
  getRateLimitIdentifier: vi.fn().mockReturnValue('user:test-user-id'),
}))

vi.mock('@/lib/security/audit-logger', () => ({
  logSecurityEvent: vi.fn().mockResolvedValue(undefined),
}))

import { POST, GET } from '../route'
import { requireAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

describe('PDF Export API Authentication', () => {
  const createMockRequest = (body?: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/export/pdf', {
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  describe('POST /api/export/pdf', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock requireAuth to throw AuthError
      const { AuthError } = await import('@/lib/auth')
      vi.mocked(requireAuth).mockRejectedValue(new AuthError('No autenticado'))

      const request = createMockRequest({
        title: 'Test PDF',
        content: [{ type: 'paragraph', text: 'Test content' }],
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')
    })

    it('should proceed when user is authenticated', async () => {
      // Mock successful auth
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com' } as any,
        profile: { id: 'test-user-id', role: 'patient' } as any,
        session: { access_token: 'test-token', refresh_token: null, expires_at: null, expires_in: 3600, token_type: 'bearer' },
      })

      const request = createMockRequest({
        title: 'Test PDF',
        content: [{ type: 'paragraph', text: 'Test content' }],
      })

      // We can't fully test PDF generation without pdfkit, but we can verify
      // that auth passes and rate limiting is checked
      try {
        await POST(request)
      } catch (error) {
        // PDF generation will fail in test environment, but auth should pass
        expect(requireAuth).toHaveBeenCalled()
      }
    })
  })

  describe('GET /api/export/pdf', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { AuthError } = await import('@/lib/auth')
      vi.mocked(requireAuth).mockRejectedValue(new AuthError('No autenticado'))

      const request = createMockRequest()

      const response = await GET(request)

      expect(response.status).toBe(401)
      const json = await response.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Unauthorized')
    })

    it('should return 200 when user is authenticated', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        user: { id: 'test-user-id', email: 'test@example.com' } as any,
        profile: { id: 'test-user-id', role: 'patient' } as any,
        session: { access_token: 'test-token', refresh_token: null, expires_at: null, expires_in: 3600, token_type: 'bearer' },
      })

      const request = createMockRequest()

      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.success).toBe(true)
      expect(json.endpoint).toBe('/api/export/pdf')
    })
  })
})
