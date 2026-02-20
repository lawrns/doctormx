# TST-002: Authentication Flow Tests

## Overview

Comprehensive authentication and authorization test suite for Doctor.mx platform.

## Test Files

### 1. `login.test.ts` - Login Flow Tests
**Scenarios Covered:**
- ✅ Successful login with valid credentials
- ✅ Invalid credentials handling
- ✅ Email format validation
- ✅ Password validation
- ✅ Session creation after login
- ✅ Redirect after login
- ✅ Rate limiting on failed attempts
- ✅ Remember me functionality
- ✅ SQL injection prevention
- ✅ XSS prevention

**Test Count:** ~45 tests

### 2. `register.test.ts` - Registration Flow Tests
**Scenarios Covered:**
- ✅ Patient registration flow
- ✅ Doctor registration flow
- ✅ Duplicate email prevention
- ✅ Password strength requirements
- ✅ Email validation
- ✅ Profile creation
- ✅ Role assignment
- ✅ Terms and conditions acceptance
- ✅ Phone validation
- ✅ Email confirmation handling

**Test Count:** ~40 tests

### 3. `logout.test.ts` - Logout Tests
**Scenarios Covered:**
- ✅ Successful logout
- ✅ Session termination
- ✅ Cookie cleanup
- ✅ Redirect after logout
- ✅ Logout without active session
- ✅ Multi-device logout
- ✅ Concurrent logout handling
- ✅ Security header cleanup
- ✅ Error handling

**Test Count:** ~35 tests

### 4. `session.test.ts` - Session Management Tests
**Scenarios Covered:**
- ✅ Session creation
- ✅ Session validation
- ✅ Session expiration
- ✅ Token refresh
- ✅ Role-based access control
- ✅ Middleware protection
- ✅ Session persistence
- ✅ Concurrent session handling
- ✅ Session security
- ✅ Session metadata
- ✅ Session invalidation

**Test Count:** ~50 tests

## Running the Tests

```bash
# Run all auth tests
npm test src/app/api/__tests__/auth/

# Run specific test file
npm test src/app/api/__tests__/auth/login.test.ts
npm test src/app/api/__tests__/auth/register.test.ts
npm test src/app/api/__tests__/auth/logout.test.ts
npm test src/app/api/__tests__/auth/session.test.ts

# Run with coverage
npm test -- --coverage src/app/api/__tests__/auth/
```

## Mocked Dependencies

### Supabase Auth
- `signInWithPassword()`
- `signUp()`
- `signOut()`
- `getSession()`
- `getUser()`
- `refreshSession()`

### Middleware
- `requireAuth()`
- `hasRole()`
- `hasAnyRole()`
- `getCurrentUserId()`

### Session Management
- `invalidateCurrentSession()`
- `invalidateAllUserSessions()`
- `getCurrentSession()`
- `refreshSession()`

## Test Utilities

### Mock Users
```typescript
mockUsers.patient   // Patient user
mockUsers.doctor    // Doctor user
mockUsers.admin     // Admin user
```

### Helper Functions
```typescript
createMockRequest(url, options)      // Create mock NextRequest
createAuthenticatedRequest(url, opts) // Create authenticated request
setMockUser(user)                    // Set current mock user
setMockSession(session)              // Set mock session
resetMocks()                         // Reset all mocks
```

## Coverage Targets

| Module | Lines | Functions | Branches | Statements |
|--------|-------|-----------|----------|------------|
| Login  | 92%   | 95%       | 88%      | 93%        |
| Register | 90% | 92%       | 85%      | 91%        |
| Logout | 95%   | 96%       | 90%      | 95%        |
| Session | 93%  | 94%       | 89%      | 93%        |
| **Overall** | **92%** | **94%** | **88%** | **93%** |

## Security Test Coverage

### Authentication Security
- [x] SQL injection prevention
- [x] XSS attack prevention
- [x] CSRF protection
- [x] Session fixation prevention
- [x] Secure cookie attributes
- [x] Rate limiting
- [x] Account lockout
- [x] Concurrent session handling

### Authorization Security
- [x] Role-based access control
- [x] Middleware protection
- [x] API route protection
- [x] Resource-level permissions

## CI/CD Integration

These tests are configured to run:
- On every pull request
- Before deployment to staging
- Before deployment to production
- Nightly regression testing

## Maintenance

### Adding New Tests
1. Identify the appropriate test file
2. Add tests to the relevant `describe` block
3. Follow existing test patterns
4. Update coverage statistics in this README

### Updating Mocks
When auth implementation changes:
1. Update mocks in `/security/setup.ts`
2. Update test expectations
3. Run full test suite
4. Update documentation

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
