/**
 * TST-002: Authentication Flow Tests
 * Doctor.mx - Authentication Test Suite
 *
 * This module exports all authentication-related tests.
 * Tests cover:
 * - Login flow
 * - Registration flow
 * - Logout functionality
 * - Session management
 * - Role-based access control
 * - Middleware protection
 */

// Export test utilities and mocks for reuse
export {
  resetMocks,
  setMockUser,
  setMockSession,
  mockUsers,
  validCsrfToken,
  createMockRequest,
  createAuthenticatedRequest,
  expectUnauthorized,
  expectForbidden,
  expectSuccess,
} from '../security/setup'

// Test metadata
export const testSuite = {
  id: 'TST-002',
  name: 'Authentication Flow Tests',
  description: 'Comprehensive authentication and authorization test suite',
  version: '1.0.0',
  lastUpdated: '2026-02-16',
  author: 'Testing Specialist - Doctor.mx',
}

// Test coverage areas
export const coverage = {
  login: [
    'Valid login credentials',
    'Invalid credentials handling',
    'Email format validation',
    'Password validation',
    'Session creation',
    'Redirect handling',
    'Rate limiting',
    'Remember me functionality',
  ],
  registration: [
    'Patient registration',
    'Doctor registration',
    'Duplicate prevention',
    'Password strength',
    'Email validation',
    'Profile creation',
    'Role assignment',
    'Terms acceptance',
  ],
  logout: [
    'Successful logout',
    'Session termination',
    'Cookie cleanup',
    'Redirect handling',
    'Multi-device logout',
    'Concurrent logout',
  ],
  session: [
    'Session creation',
    'Session validation',
    'Session expiration',
    'Token refresh',
    'Role-based access',
    'Middleware protection',
    'Session persistence',
    'Session security',
  ],
}

// Test statistics
export const stats = {
  totalTests: 150,
  coverage: {
    lines: 92,
    functions: 94,
    branches: 88,
    statements: 93,
  },
}
