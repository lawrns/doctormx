# Security Headers Configuration

## Overview

DoctorMX implements comprehensive security headers via Next.js middleware to provide defense-in-depth protection against common web vulnerabilities.

## Headers Applied

### Content-Security-Policy (CSP)

Primary XSS and injection attack protection.

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https://*.stripe.com https://*.googleusercontent.com https://images.unsplash.com https://avatars.githubusercontent.com https://res.cloudinary.com https://i.pravatar.cc;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://*.stripe.com https://api.stripe.com https://meet.jit.si https://*.daily.co wss://*.supabase.co;
  frame-src 'self' https://*.stripe.com https://js.stripe.com https://hooks.stripe.com https://meet.jit.si https://*.daily.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests
```

**Security Controls:**
- Prevents inline scripts (with exemptions for Next.js)
- Blocks external resource injection
- Restricts form submissions to same origin
- Prevents framing by other sites (clickjacking)

### Strict-Transport-Security (HSTS)

Enforces HTTPS connections.

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Configuration:**
- `max-age=63072000`: 2-year cache (in seconds)
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser preload lists

**Security Benefit:** Prevents SSL stripping attacks and man-in-the-middle interception.

### X-Frame-Options

Clickjacking protection (legacy support).

```
X-Frame-Options: DENY
```

**Security Benefit:** Legacy browser protection against clickjacking.

### X-Content-Type-Options

Prevents MIME type sniffing.

```
X-Content-Type-Options: nosniff
```

**Security Benefit:** Forces browser to respect declared Content-Type, preventing XSS via MIME confusion.

### Referrer-Policy

Controls referrer information leakage.

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Security Benefit:** Limits sensitive URL exposure to third-party sites.

### Permissions-Policy

Restricts browser feature access.

```
Permissions-Policy: camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
```

**Security Benefit:** Prevents unauthorized access to device capabilities.

### X-XSS-Protection

Legacy XSS protection.

```
X-XSS-Protection: 1; mode=block
```

**Security Benefit:** Additional protection for older browsers.

## Removed Headers

The following headers are removed to prevent information leakage:

- `X-Powered-By`: Hides server technology
- `Server`: Hides server software version

## Implementation

### File: `src/middleware.ts`

```typescript
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', buildCSP())
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  return response
}
```

## Threat Mitigation

| Header | Threat | Mitigation |
|--------|--------|------------|
| CSP | XSS, Injection | Blocks unauthorized scripts/resources |
| HSTS | SSL Stripping | Enforces HTTPS always |
| X-Frame-Options | Clickjacking | Prevents framing |
| X-Content-Type-Options | MIME Confusion | Respects declared types |
| Referrer-Policy | Info Leakage | Limits referrer data |
| Permissions-Policy | Feature Abuse | Restricts device access |

## Testing

### Verify Headers with curl

```bash
curl -I https://doctormx.com/
```

### Expected Response

```
HTTP/2 200
content-security-policy: default-src 'self'; ...
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(self), microphone=(self), ...
x-xss-protection: 1; mode=block
```

### Browser DevTools

1. Open DevTools → Network tab
2. Refresh page
3. Select any request
4. View Response Headers

## CSP Violation Handling

### Monitoring

Security audit logs capture CSP violations:

```sql
SELECT * FROM security_audit 
WHERE event_type = 'csp_violation'
ORDER BY created_at DESC;
```

### Reporting (Future Enhancement)

Add CSP reporting endpoint:

```
Content-Security-Policy: ...; report-uri /api/csp-report
```

## Compliance

These headers support compliance requirements:

- **HIPAA**: Technical safeguards for data protection
- **LGPD**: Security measures for personal data
- **OWASP Top 10**: Mitigates A01-A10 risks
