# API Security Tests - Doctor.mx

## Overview

This directory contains comprehensive security tests for all critical API endpoints in the Doctor.mx healthcare platform. These tests ensure proper implementation of authentication, authorization, CSRF protection, rate limiting, and input validation.

## Test Coverage

### 1. Authentication Tests (`*.security.test.ts`)
- **401 Unauthorized**: Verifies endpoints reject requests without valid session
- **Session Validation**: Ensures expired/invalid tokens are rejected
- **Token Refresh**: Verifies automatic session refresh

### 2. Authorization/RBAC Tests
- **403 Forbidden**: Verifies role-based access control
- **Patient Access**: Ensures patients can't access doctor/admin endpoints
- **Doctor Access**: Ensures doctors can't access admin endpoints  
- **Admin Access**: Verifies admin privileges work correctly
- **Data Isolation**: Ensures users can only access their own data

### 3. CSRF Protection Tests
- **Missing Token**: Rejects state-changing requests without CSRF token
- **Invalid Token**: Rejects requests with invalid/expired CSRF token
- **Valid Token**: Accepts requests with valid CSRF token
- **Safe Methods**: Verifies GET requests don't require CSRF

### 4. Rate Limiting Tests
- **429 Too Many Requests**: Verifies rate limits are enforced
- **Retry-After Header**: Ensures proper headers are returned
- **Tier Differences**: Validates different limits for different user types
- **IP-based Limiting**: Verifies anonymous user limits

### 5. Input Validation Tests
- **400 Bad Request**: Rejects malformed/invalid input
- **XSS Prevention**: Sanitizes script injection attempts
- **SQL Injection**: Prevents database injection attacks
- **Type Validation**: Validates expected data types
- **Range Validation**: Validates numeric ranges

## Test Files

| File | Endpoints Covered |
|------|-------------------|
| `appointments.security.test.ts` | `/api/appointments/*` |
| `admin.security.test.ts` | `/api/admin/*` |
| `user.security.test.ts` | `/api/user/*` |
| `payments.security.test.ts` | `/api/create-payment-intent`, `/api/confirm-payment` |
| `middleware.security.test.ts` | Global middleware (CSRF, sessions, headers) |

## Running Tests

### Run all security tests
```bash
npm test -- src/app/api/__tests__/security/
```

### Run specific test file
```bash
npm test -- src/app/api/__tests__/security/appointments.security.test.ts
```

### Run with coverage
```bash
npm test -- --coverage src/app/api/__tests__/security/
```

### Run in watch mode
```bash
npm test -- --watch src/app/api/__tests__/security/
```

### Run with verbose output
```bash
npm test -- --reporter=verbose src/app/api/__tests__/security/
```

## Test Utilities

### Setup (`setup.ts`)
Provides mocked dependencies and helper functions:

```typescript
// Mock users for different roles
const { patient, doctor, admin } = mockUsers

// Set current user for authentication
setMockUser(mockUsers.patient)
setMockSession({ access_token: '...', refresh_token: '...' })

// Control CSRF validation
setCsrfValid(true) // or false

// Control rate limiting
setRateLimitFail(true, 60) // fail with 60s retry

// Create authenticated request
const { request, user } = createAuthenticatedRequest('/api/endpoint', {
  method: 'POST',
  body: { data: 'test' },
  user: mockUsers.patient,
  includeCsrf: true,
})
```

### Assertions
```typescript
// Authentication
expectUnauthorized(response) // expects 401

// Authorization  
expectForbidden(response) // expects 403

// Rate Limiting
expectRateLimited(response) // expects 429

// Validation
expectBadRequest(response) // expects 400

// Success
expectSuccess(response) // expects 200
```

## Critical Security Requirements

### 1. Patient Data Protection (HIPAA/GDPR)
- Users can only access their own medical records
- Appointment data is isolated per user
- Payment information is never exposed in responses

### 2. Admin Endpoint Protection
- All `/api/admin/*` endpoints require admin role
- Non-admin users receive 403 Forbidden
- Admin actions are logged for audit

### 3. Payment Security
- CSRF protection mandatory for all payment operations
- Strict rate limiting on payment endpoints
- Input validation prevents tampering with amounts
- Payment intent IDs are validated

### 4. Session Security
- Expired sessions are rejected with 401
- Invalid tokens are cleared
- Sessions are refreshed automatically when possible

## Adding New Tests

When adding security tests for new endpoints:

1. Create test file following naming: `{endpoint}.security.test.ts`
2. Import utilities from `./setup`
3. Mock all external dependencies
4. Test all security aspects (auth, RBAC, CSRF, rate limit, validation)
5. Run tests to verify coverage

Example:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  resetMocks,
  createAuthenticatedRequest,
  mockUsers,
} from './setup'

describe('SECURITY: /api/new-endpoint', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('returns 401 without authentication', async () => {
    // Test implementation
  })

  it('returns 403 without required role', async () => {
    // Test implementation
  })
})
```

## CI/CD Integration

These tests should be run:
- On every pull request
- Before deployment to staging/production
- As part of security audit process

## Security Test Checklist

Before deploying API changes:

- [ ] All authentication tests pass
- [ ] All authorization tests pass
- [ ] All CSRF protection tests pass
- [ ] All rate limiting tests pass
- [ ] All input validation tests pass
- [ ] New endpoints have security tests
- [ ] No sensitive data in error messages
- [ ] Security headers are present

## Troubleshooting

### Tests failing unexpectedly
1. Check if mocks are properly reset in `beforeEach`
2. Verify route imports happen after mock declarations
3. Check if `vi.mock` calls are at the top of the file

### CSRF tests not working
- Ensure `x-csrf-token` header is set for POST requests
- Verify `csrf_token` cookie is set
- Check that `setCsrfValid(true)` is called

### Rate limit tests not working
- Rate limiting may be bypassed in test environment
- Check if `withRateLimit` middleware is being used
- Verify `setRateLimitFail(true)` is called before request

## Contact

For security-related questions or to report vulnerabilities:
- Security Team: security@doctormx.com
- Lead Developer: dev@doctormx.com
