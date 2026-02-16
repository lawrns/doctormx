/**
 * API Security Tests Index
 * Doctor.mx - Critical Security Test Suite
 * 
 * This module exports all security tests for API routes.
 * Run with: npm test -- src/app/api/__tests__/security/
 */

// Export test setup and utilities
export {
  resetMocks,
  setMockUser,
  setMockSession,
  setCsrfValid,
  setRateLimitFail,
  createMockRequest,
  createAuthenticatedRequest,
  mockUsers,
  validCsrfToken,
  mockCalls,
  expectUnauthorized,
  expectForbidden,
  expectRateLimited,
  expectBadRequest,
  expectSuccess,
} from './setup'

// Export types
export type { MockUser } from './setup'

// Re-export vitest for convenience
export { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
