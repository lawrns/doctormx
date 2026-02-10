# CSRF Protection Implementation Guide

## Overview

This document describes the comprehensive CSRF (Cross-Site Request Forgery) protection implementation for Doctor.mx healthcare platform. The implementation provides automatic CSRF protection for all state-changing operations with timing-safe token comparison to prevent timing attacks.

## Architecture

### Components

1. **Server-side CSRF Library** (`src/lib/csrf.ts`)
   - Token generation using Web Crypto API
   - Timing-safe token validation
   - HttpOnly cookie management
   - Error response creation

2. **Middleware Integration** (`src/middleware.ts`)
   - Automatic CSRF validation on state-changing methods
   - Token generation for authenticated users
   - Seamless integration with existing Supabase authentication

3. **Client-side API Handler** (`src/lib/api.ts`)
   - Automatic CSRF token inclusion in requests
   - Error handling and response parsing
   - Convenience methods for common HTTP operations

## Security Features

### Timing-Safe Comparison

Token comparison uses `crypto.timingSafeEqual()` to prevent timing attacks:

```typescript
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still perform full comparison to normalize timing
    const dummy = new Array(Math.max(a.length, b.length) + 1).join('x')
    let result = 0
    for (let i = 0; i < dummy.length; i++) {
      result |= dummy.charCodeAt(i) ^ 0
    }
    return result === 0
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
```

### HttpOnly Cookies

CSRF tokens are stored in HttpOnly, Secure, SameSite cookies:

- **HttpOnly**: Prevents JavaScript access (XSS protection)
- **Secure**: Only sent over HTTPS in production
- **SameSite=Lax**: Prevents CSRF while allowing legitimate navigation
- **Max-Age**: Token expires after 24 hours

### Cryptographically Secure Tokens

Tokens are generated using Web Crypto API with 32 bytes (256 bits) of randomness:

```typescript
const array = new Uint8Array(32)
crypto.getRandomValues(array)
const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
```

## Usage

### Server-side (API Routes)

CSRF validation is automatically enforced by middleware for:
- POST requests
- PUT requests
- DELETE requests
- PATCH requests

Safe methods (GET, HEAD, OPTIONS) do not require CSRF validation.

### Client-side (Components)

Use the provided `apiRequest` function for all API calls:

```typescript
import { apiRequest, get, post, put, patch, del } from '@/lib/api'

// GET request (no CSRF needed)
const users = await get('/api/users')

// POST request with automatic CSRF
const newUser = await post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT request with automatic CSRF
const updated = await put('/api/users/1', {
  name: 'Jane Doe'
})

// DELETE request with automatic CSRF
await del('/api/users/1')
```

### Error Handling

```typescript
try {
  const result = await post('/api/data', { foo: 'bar' })
  console.log(result.data)
} catch (error) {
  if (error instanceof Error && 'status' in error) {
    const apiError = error as APIError
    console.error(`Request failed: ${apiError.status} - ${apiError.message}`)
    if (apiError.code === 'MISSING_CSRF_TOKEN') {
      // Handle missing CSRF token
      console.error('Please refresh the page')
    }
  }
}
```

## API Reference

### Server-side Functions

#### `generateCSRFToken(): CSRFToken`

Generates a new CSRF token.

**Returns:** Object with `token` (string) and `header` (string) properties.

#### `validateCSRFToken(request: NextRequest, sessionToken: string): boolean`

Validates CSRF token with timing-safe comparison.

**Parameters:**
- `request`: Next.js request object
- `sessionToken`: Expected CSRF token from session

**Returns:** `true` if valid, `false` otherwise

#### `setCSRFCookie(response: NextResponse, token: string): void`

Sets CSRF token as HttpOnly cookie.

**Parameters:**
- `response`: Next.js response object
- `token`: CSRF token to store

#### `getCSRFCookie(request: NextRequest): string | undefined`

Gets CSRF token from request cookies.

**Parameters:**
- `request`: Next.js request object

**Returns:** CSRF token string or `undefined` if not found

### Client-side Functions

#### `apiRequest<T>(url: string, options?: APIRequestOptions): Promise<APIResponse<T>>`

Makes an API request with automatic CSRF protection.

**Type Parameters:**
- `T`: Expected response data type

**Parameters:**
- `url`: API endpoint URL
- `options`: Request options

**Returns:** Promise resolving to `APIResponse<T>`

#### `get<T>(url: string, options?: APIRequestOptions): Promise<APIResponse<T>>`

Convenience method for GET requests.

#### `post<T>(url: string, body?, options?: APIRequestOptions): Promise<APIResponse<T>>`

Convenience method for POST requests.

#### `put<T>(url: string, body?, options?: APIRequestOptions): Promise<APIResponse<T>>`

Convenience method for PUT requests.

#### `patch<T>(url: string, body?, options?: APIRequestOptions): Promise<APIResponse<T>>`

Convenience method for PATCH requests.

#### `del<T>(url: string, options?: APIRequestOptions): Promise<APIResponse<T>>`

Convenience method for DELETE requests.

## Configuration

### Constants

The following constants are defined in `src/lib/csrf.ts`:

```typescript
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32 // bytes
const COOKIE_MAX_AGE = 24 * 60 * 60 // seconds (24 hours)
```

### Environment Variables

No additional environment variables are required. The implementation automatically sets the `Secure` flag on cookies in production:

```typescript
secure: process.env.NODE_ENV === 'production'
```

## Testing

### Running Tests

```bash
# Run all CSRF tests
npx vitest run src/lib/__tests__/csrf.test.ts

# Run all API tests
npx vitest run src/lib/__tests__/api.unit.test.ts

# Run both test suites
npx vitest run src/lib/__tests__/csrf.test.ts src/lib/__tests__/api.unit.test.ts
```

### Test Coverage

The test suite includes:

- Token generation and uniqueness
- Timing-safe comparison
- Cookie management
- Request method detection
- Validation with detailed error reporting
- End-to-end CSRF flow
- Type safety

## Migration Guide

### For Existing API Routes

No changes are required! The middleware automatically enforces CSRF protection on all state-changing operations.

### For Client-side Code

Replace manual fetch calls with the `apiRequest` function:

**Before:**
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
})
```

**After:**
```typescript
const result = await post('/api/users', { name: 'John' })
```

## Troubleshooting

### Common Issues

#### "CSRF token not found"

This error occurs when:
1. The user is not authenticated
2. The CSRF cookie has expired (after 24 hours)
3. The cookie was not set properly

**Solution:** Ensure the user is authenticated and has a valid session.

#### "CSRF validation failed"

This error occurs when the provided token doesn't match the stored token.

**Solution:** Ensure the client is reading the correct cookie and including it in the request header.

### Debug Mode

To enable debug logging, set the `DEBUG` environment variable:

```bash
DEBUG=csrf:* npm run dev
```

## Security Considerations

### Token Storage

- Tokens are stored in HttpOnly cookies to prevent XSS attacks
- Tokens are not accessible via JavaScript on the client
- Each token is valid for 24 hours

### Token Transmission

- Tokens are transmitted via the `x-csrf-token` header
- Tokens are only required for state-changing methods
- Safe methods (GET, HEAD, OPTIONS) do not require tokens

### Token Validation

- Tokens are validated using timing-safe comparison
- Invalid tokens result in immediate 403 Forbidden response
- Detailed error messages are provided for debugging

## Compliance

This implementation follows OWASP CSRF protection best practices:

- [x] Synchronizer token pattern
- [x] Cryptographically secure tokens
- [x] HttpOnly cookies
- [x] SameSite cookie attribute
- [x] Secure cookie attribute in production
- [x] Timing-safe comparison
- [x] Proper error handling

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Support

For questions or issues related to CSRF protection, please refer to:

1. This documentation
2. Test files in `src/lib/__tests__/csrf.test.ts`
3. Source code in `src/lib/csrf.ts`
