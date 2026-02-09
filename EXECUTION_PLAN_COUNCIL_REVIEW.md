# DOCTOR.MX - COMPREHENSIVE EXECUTION PLAN
**For Council Review & Enhancement**

**Status:** Draft - Awaiting Council Feedback
**Version:** 1.0
**Date:** 2026-02-09
**Based On:** Comprehensive Audit (156 issues identified)
**Overall Target:** Improve codebase health from 56/100 to 85+/100

---

## COUNCIL REVIEW INSTRUCTIONS

This execution plan is submitted for your expert review. Please:
1. **Challenge every assumption** - Question why tasks are ordered this way
2. **Identify missing work** - What critical tasks did we overlook?
3. **Suggest better approaches** - Are there more effective methods?
4. **Validate dependencies** - Are task dependencies correct?
5. **Assess effort estimates** - Are timelines realistic?
6. **Add quality gates** - What acceptance criteria are missing?

**Philosophy:** We will NOT trade quality for speed. Every task must be completed to the highest standard.

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Phase 0: Foundation & Critical Security](#phase-0-foundation--critical-security)
3. [Phase 1: Documentation & Compliance](#phase-1-documentation--compliance)
4. [Phase 2: Type Safety & Error Handling](#phase-2-type-safety--error-handling)
5. [Phase 3: Performance Optimization](#phase-3-performance-optimization)
6. [Phase 4: Code Quality Refactoring](#phase-4-code-quality-refactoring)
7. [Phase 5: Testing Enhancement](#phase-5-testing-enhancement)
8. [Phase 6: UX/DX Improvements](#phase-6uxdx-improvements)
9. [Phase 7: Infrastructure & DevOps](#phase-7-infrastructure--devops)
10. [Phase 8: Polish & Excellence](#phase-8-polish--excellence)
11. [Quality Gates & Acceptance Criteria](#quality-gates--acceptance-criteria)
12. [Risk Register](#risk-register)
13. [Resource Requirements](#resource-requirements)

---

## EXECUTIVE SUMMARY

### Current State Analysis
- **Codebase Health Score:** 56/100
- **Total Issues Identified:** 156 across 10 categories
- **Critical Blockers:** 2 (Documentation, Healthcare Compliance)
- **High Priority Issues:** 31
- **Medium Priority Issues:** 68
- **Low Priority Issues:** 55

### Target State (After Execution Plan)
- **Codebase Health Score:** 85+/100
- **Critical Issues:** 0
- **High Priority Issues:** 0
- **Test Coverage:** 70%+
- **Documentation:** Complete
- **Compliance:** Full Mexico healthcare regulatory alignment

### Timeline Overview
| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| Phase 0 | 1 week | Critical Security | Security hardening, key rotation |
| Phase 1 | 2 weeks | Documentation & Compliance | README, API docs, compliance features |
| Phase 2 | 1 week | Type Safety | Zero `any` types, proper null checks |
| Phase 3 | 2 weeks | Performance | Caching, indexes, query optimization |
| Phase 4 | 2 weeks | Code Quality | Remove tech debt, establish patterns |
| Phase 5 | 2 weeks | Testing | Comprehensive test suite |
| Phase 6 | 1 week | UX/DX | Accessibility, user experience |
| Phase 7 | 1 week | Infrastructure | CI/CD, monitoring, deployment |
| Phase 8 | 1 week | Polish | Final excellence, validation |

**Total Timeline:** 13 weeks (~3 months)

### Success Criteria
- [ ] All critical security issues resolved
- [ ] All compliance requirements met (LFPDPPP, COFEPRIS)
- [ ] Zero `any` types in codebase
- [ ] Zero console.log statements in production code
- [ ] 70%+ test coverage
- [ ] Complete documentation suite
- [ ] Performance benchmarks met
- [ ] Zero high-severity security vulnerabilities
- [ ] Full accessibility compliance (WCAG 2.1 AA)

---

## PHASE 0: FOUNDATION & CRITICAL SECURITY

**Duration:** Week 1 (5 business days)
**Goal:** Eliminate all critical security blockers and establish secure foundation
**Dependencies:** None (can start immediately)
**Blocked By:** None

### Overview
This phase addresses the most urgent security vulnerabilities that could expose the platform to attacks or regulatory violations. These are non-negotiable fixes that must be completed before any other work.

---

### Task 0.1: API Key Rotation (USER ACTION REQUIRED)
**Priority:** CRITICAL
**Severity:** Security Blocker
**Effort:** 2 hours (user action)
**Assigned To:** User (manual action required)

**Description:**
Rotate all exposed API keys immediately. Audit found keys in environment files that may have been exposed.

**Steps:**
1. Check git history for exposed keys:
   ```bash
   git log --all --full-history -S "sk-" --source
   git log --all --full-history -S "service_role" --source
   ```

2. For each service, generate new keys:
   - Supabase (Service Role, Anon)
   - OpenAI
   - Stripe (Secret Key, Webhook Secret)
   - Twilio (Account SID, Auth Token)
   - GLM/z.ai

3. Update environment variables:
   - `.env.local` (development)
   - Production environment (Vercel/dashboard)

4. Test all integrations with new keys

5. Revoke old keys from respective service dashboards

6. If keys were committed to git, use BFG Repo-Cleaner or git-filter-repo to remove from history

**Acceptance Criteria:**
- [ ] All API keys rotated
- [ ] No old keys remain in git history
- [ ] All services functional with new keys
- [ ] Documentation updated with key rotation procedure

**Verification:**
```bash
# Verify no keys in git history
git log --all --full-history --source -- "**/.env" | grep -i "sk-\|service_role"
# Should return empty
```

**Related Issues:** F001 (documented in `F001_API_KEY_ROTATION.md`)

---

### Task 0.2: Implement Proper Role-Based Access Control
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 8 hours
**Dependencies:** None
**Files Affected:**
- `src/lib/supabase/middleware.ts`
- `src/lib/auth.ts`
- All protected API routes

**Description:**
Current role-based redirection doesn't prevent direct URL access to protected routes. Implement proper middleware-based authorization.

**Implementation Plan:**

1. Create enhanced auth middleware:
   ```typescript
   // src/lib/middleware/auth.ts
   export interface AuthContext {
     user: User
     session: Session
     role: UserRole
   }

   export async function requireAuth(
     request: NextRequest,
     allowedRoles?: UserRole[]
   ): Promise<AuthContext> {
     const supabase = await createClient()
     const { data: { session } } = await supabase.auth.getSession()

     if (!session) {
       redirect('/auth/login')
     }

     const { data: profile } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', session.user.id)
       .single()

     if (!profile) {
       throw new Error('Profile not found')
     }

     if (allowedRoles && !allowedRoles.includes(profile.role as UserRole)) {
       redirect('/unauthorized')
     }

     return {
       user: session.user,
       session,
       role: profile.role as UserRole
     }
   }

   // Usage in protected routes:
   export async function GET(request: NextRequest) {
     const { user, role } = await requireAuth(request, ['doctor', 'admin'])
     // Proceed with authenticated request
   }
   ```

2. Create route protection middleware:
   ```typescript
   // src/middleware.ts
   import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export async function middleware(request: NextRequest) {
     const res = NextResponse.next()
     const supabase = createMiddlewareClient({ req: request, res })

     const {
       data: { session },
     } = await supabase.auth.getSession()

     // Protected routes that require authentication
     const protectedPaths = ['/doctor', '/patient', '/admin']
     const isProtectedPath = protectedPaths.some(path =>
       request.nextUrl.pathname.startsWith(path)
     )

     if (isProtectedPath && !session) {
       return NextResponse.redirect(new URL('/auth/login', request.url))
     }

     // Role-based path protection
     if (request.nextUrl.pathname.startsWith('/admin')) {
       const { data: profile } = await supabase
         .from('profiles')
         .select('role')
         .eq('id', session?.user?.id)
         .single()

       if (profile?.role !== 'admin') {
         return NextResponse.redirect(new URL('/unauthorized', request.url))
       }
     }

     return res
   }

   export const config = {
     matcher: ['/doctor/:path*', '/patient/:path*', '/admin/:path*']
   }
   ```

3. Update all protected routes to use new middleware

**Acceptance Criteria:**
- [ ] Direct URL access to protected routes blocked for unauthorized users
- [ ] Role-based path enforcement working
- [ ] All admin routes require admin role
- [ ] All doctor routes require doctor role
- [ ] Graceful redirects to appropriate pages
- [ ] Unit tests for auth middleware

**Testing:**
```typescript
// src/lib/__tests__/auth-middleware.test.ts
describe('Auth Middleware', () => {
   it('should redirect unauthenticated users from protected routes')
   it('should block non-admin users from admin routes')
   it('should allow access with proper credentials')
   it('should handle session expiration gracefully')
})
```

**Related Audit Issues:** Security #1 (Role-Based Access Control Issues)

---

### Task 0.3: Implement Session Management & Invalidation
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 6 hours
**Dependencies:** Task 0.2
**Files Affected:**
- `src/lib/auth.ts`
- `src/app/auth/signout/route.ts`

**Description:**
Implement proper session management with refresh tokens, secure logout, and session invalidation on security events.

**Implementation Plan:**

1. Create session management utilities:
   ```typescript
   // src/lib/session.ts
   import { createClient } from '@/lib/supabase/server'

   export interface SessionInfo {
     userId: string
     createdAt: Date
     lastActivity: Date
     ipAddress?: string
     userAgent?: string
   }

   export async function getCurrentSession(): Promise<SessionInfo | null> {
     const supabase = await createClient()
     const { data: { session } } = await supabase.auth.getSession()

     if (!session) return null

     return {
       userId: session.user.id,
       createdAt: new Date(session.user.created_at),
       lastActivity: new Date(),
     }
   }

   export async function invalidateAllUserSessions(userId: string): Promise<void> {
     const supabase = await createClient()
     // Sign out from all devices
     await supabase.auth.admin.signOut(userId)
   }

   export async function invalidateCurrentSession(): Promise<void> {
     const supabase = await createClient()
     await supabase.auth.signOut()
   }

   export async function refreshSession(): Promise<void> {
     const supabase = await createClient()
     const { data, error } = await supabase.auth.refreshSession()

     if (error) {
       throw new Error(`Session refresh failed: ${error.message}`)
     }
   }

   export async function recordSecurityEvent(
     userId: string,
     eventType: 'password_change' | 'suspicious_activity' | 'role_change'
   ): Promise<void> {
     const supabase = await createClient()

     await supabase.from('security_events').insert({
       user_id: userId,
       event_type: eventType,
       created_at: new Date().toISOString(),
     })

     // Invalidate sessions on security events
     await invalidateAllUserSessions(userId)
   }
   ```

2. Create security events table:
   ```sql
   -- supabase/migrations/20250209_security_events.sql
   CREATE TABLE IF NOT EXISTS security_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     event_type TEXT NOT NULL,
     ip_address INET,
     user_agent TEXT,
     metadata JSONB,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE INDEX idx_security_events_user_created ON security_events(user_id, created_at DESC);
   CREATE INDEX idx_security_events_type_created ON security_events(event_type, created_at DESC);

   -- Enable RLS
   ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own security events"
     ON security_events FOR SELECT
     USING (user_id = auth.uid());

   CREATE POLICY "Service role can insert security events"
     ON security_events FOR INSERT
     WITH CHECK (true);
   ```

3. Update signout route to properly invalidate sessions:
   ```typescript
   // src/app/auth/signout/route.ts
   import { NextResponse } from 'next/server'
   import { invalidateCurrentSession } from '@/lib/session'

   export async function POST(request: NextRequest) {
     try {
       await invalidateCurrentSession()

       return NextResponse.json({
         success: true,
         message: 'Sesión cerrada correctamente'
       })
     } catch (error) {
       return NextResponse.json(
         { error: 'Error al cerrar sesión' },
         { status: 500 }
       )
     }
   }
   ```

**Acceptance Criteria:**
- [ ] Sessions properly invalidated on logout
- [ ] All user sessions invalidated on security events
- [ ] Session refresh working correctly
- [ ] Security events logged to database
- [ ] Session timeout configurable
- [ ] Tests for session management

**Related Audit Issues:** Security #2 (Missing Session Invalidation)

---

### Task 0.4: Implement CSRF Protection
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 4 hours
**Dependencies:** Task 0.2
**Files Affected:**
- All state-changing API routes
- Middleware configuration

**Description:**
Implement CSRF tokens for all state-changing operations (POST, PUT, DELETE, PATCH).

**Implementation Plan:**

1. Create CSRF middleware:
   ```typescript
   // src/lib/csrf.ts
   import { createHash, randomBytes } from 'crypto'

   export interface CSRFToken {
     token: string
     header: string
   }

   export function generateCSRFToken(): CSRFToken {
     const token = randomBytes(32).toString('hex')
     const header = 'x-csrf-token'

     return { token, header }
   }

   export function validateCSRFToken(
     request: NextRequest,
     sessionToken: string
   ): boolean {
     const header = request.headers.get('x-csrf-token')
     const cookie = request.cookies.get('csrf_token')?.value

     if (!header || !cookie) {
       return false
     }

     // Validate token matches session
     const expectedHash = createHash('sha256')
       .update(sessionToken + header)
       .digest('hex')

     return expectedHash === cookie
   }

   export function setCSRFCookie(response: NextResponse, token: string): void {
     response.cookies.set('csrf_token', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       path: '/',
       maxAge: 60 * 60 * 24 * 7 // 7 days
     })
   }
   ```

2. Create CSRF protection middleware:
   ```typescript
   // src/middleware.ts
   import { validateCSRFToken } from '@/lib/csrf'

   export async function middleware(request: NextRequest) {
     // Apply CSRF to state-changing methods
     const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']

     if (stateChangingMethods.includes(request.method)) {
       const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
       const { data: { session } } = await supabase.auth.getSession()

       if (session && !validateCSRFToken(request, session.access_token)) {
         return NextResponse.json(
           { error: 'Invalid CSRF token' },
           { status: 403 }
         )
       }
     }

     // Continue with other middleware...
   }
   ```

3. Update client to include CSRF tokens:
   ```typescript
   // src/lib/api.ts
   export async function apiRequest(
     url: string,
     options: RequestInit = {}
   ): Promise<Response> {
     const csrfToken = getCookie('csrf_token')
     const csrfHeader = getCookie('csrf_header')

     const headers = {
       ...options.headers,
       ...(csrfToken && csrfHeader ? { [csrfHeader]: csrfToken } : {})
     }

     return fetch(url, {
       ...options,
       headers,
       credentials: 'include'
     })
   }
   ```

**Acceptance Criteria:**
- [ ] All state-changing operations require CSRF token
- [ ] Tokens generated per session
- [ ] Tokens validated on each request
- [ ] Proper error messages for invalid tokens
- [ ] Tests for CSRF protection

**Related Audit Issues:** Security #4 (No CSRF Protection)

---

### Task 0.5: Implement Comprehensive Rate Limiting
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 8 hours
**Dependencies:** None
**Files Affected:**
- All API routes
- `src/lib/rate-limit.ts`

**Description:**
Implement rate limiting across all API endpoints with different tiers for different endpoint types.

**Implementation Plan:**

1. Create rate limiting configuration:
   ```typescript
   // src/lib/rate-limit/config.ts
   export interface RateLimitTier {
     requests: number
     window: number // seconds
     burst?: number
   }

   export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
     // Authentication endpoints (strict)
     'auth:login': { requests: 5, window: 300, burst: 10 },
     'auth:register': { requests: 3, window: 300 },
     'auth:reset-password': { requests: 3, window: 3600 },

     // Payment endpoints (strict)
     'payment:create': { requests: 10, window: 60 },
     'payment:webhook': { requests: 100, window: 60 },

     // AI endpoints (cost-sensitive)
     'ai:consult': { requests: 20, window: 60 },
     'ai:vision': { requests: 10, window: 60 },
     'ai:transcription': { requests: 5, window: 60 },

     // General API (moderate)
     'api:general': { requests: 100, window: 60 },
     'api:read': { requests: 200, window: 60 },

     // Premium users (higher limits)
     'premium:general': { requests: 500, window: 60 },
     'premium:ai': { requests: 100, window: 60 },
   }

   export function getRateLimitTier(
     route: string,
     method: string,
     userRole?: string,
     isPremium?: boolean
   ): RateLimitTier {
     // Determine tier based on route, role, and subscription
     if (isPremium && route.startsWith('/api/ai')) {
       return RATE_LIMIT_TIERS['premium:ai']
     }

     if (route.startsWith('/api/auth')) {
       const endpoint = route.split('/').pop()
       return RATE_LIMIT_TIERS[`auth:${endpoint}`] || RATE_LIMIT_TIERS['auth:login']
     }

     if (route.startsWith('/api/payments')) {
       return RATE_LIMIT_TIERS['payment:create']
     }

     return isPremium ? RATE_LIMIT_TIERS['premium:general'] : RATE_LIMIT_TIERS['api:general']
   }
   ```

2. Create enhanced rate limiter:
   ```typescript
   // src/lib/rate-limit/index.ts
   import { Ratelimit } from '@upstash/ratelimit'
   import { Redis } from '@upstash/redis'

   // Initialize Redis (with fallback to in-memory)
   let ratelimit: Ratelimit

   if (process.env.UPSTASH_REDIS_REST_URL) {
     const redis = new Redis({
       url: process.env.UPSTASH_REDIS_REST_URL,
       token: process.env.UPSTASH_REDIS_REST_TOKEN,
     })

     ratelimit = new Ratelimit({
       redis,
       limiter: Ratelimit.slidingWindow(rateLimit.requests, rateLimit.window * 1000),
       analytics: true,
       prefix: 'doctormx_ratelimit',
     })
   } else {
     // Fallback to in-memory (not recommended for production)
     const inMemoryCache = new Map()

     ratelimit = new Ratelimit({
       redis: {
         sadd: async (key: string, member: string) => {
           const set = inMemoryCache.get(key) as Set<string> || new Set()
           set.add(member)
           inMemoryCache.set(key, set)
         },
         srem: async (key: string, member: string) => {
           const set = inMemoryCache.get(key) as Set<string>
           if (set) {
             set.delete(member)
           }
         },
         scard: async (key: string) => {
           const set = inMemoryCache.get(key) as Set<string>
           return set?.size || 0
         },
         del: async (key: string) => {
           inMemoryCache.delete(key)
         },
       } as any,
       limiter: Ratelimit.slidingWindow(rateLimit.requests, rateLimit.window * 1000),
       analytics: false,
     })
   }

   export interface RateLimitResult {
     success: boolean
     limit: number
     remaining: number
     reset: number
   }

   export async function checkRateLimit(
     identifier: string,
     tier: RateLimitTier
   ): Promise<RateLimitResult> {
     const { success, limit, remaining, reset } = await ratelimit.limit(
       identifier,
       {
         rate: tier.requests,
         period: tier.window * 1000,
       }
     )

     return {
       success,
       limit,
       remaining,
       reset: Math.floor(reset / 1000),
     }
   }

   export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
     return {
       'X-RateLimit-Limit': result.limit.toString(),
       'X-RateLimit-Remaining': result.remaining.toString(),
       'X-RateLimit-Reset': result.reset.toString(),
     }
   }
   ```

3. Create rate limiting middleware:
   ```typescript
   // src/lib/rate-limit/middleware.ts
   import { NextRequest, NextResponse } from 'next/server'
   import { checkRateLimit, getRateLimitHeaders, getRateLimitTier } from './index'

   export async function withRateLimit(
     request: NextRequest,
     handler: (req: NextRequest) => Promise<NextResponse>
   ): Promise<NextResponse> {
     const supabase = await createClient()
     const { data: { session } } = await supabase.auth.getSession()

     // Get identifier (user ID or IP)
     const identifier = session?.user.id || request.ip || 'anonymous'

     // Get user tier
     const { data: profile } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', session?.user?.id)
       .single()

     const { data: subscription } = await supabase
       .from('doctor_subscriptions')
       .select('status')
       .eq('doctor_id', session?.user?.id)
       .eq('status', 'active')
       .single()

     const tier = getRateLimitTier(
       request.nextUrl.pathname,
       request.method,
       profile?.role,
       !!subscription
     )

     const result = await checkRateLimit(identifier, tier)

     if (!result.success) {
       return NextResponse.json(
         {
           error: 'Too many requests',
           retryAfter: result.reset,
         },
         {
           status: 429,
           headers: getRateLimitHeaders(result),
         }
       )
     }

     // Proceed with request, add rate limit headers
     const response = await handler(request)

     // Add rate limit headers to response
     Object.entries(getRateLimitHeaders(result)).forEach(([key, value]) => {
       response.headers.set(key, value)
     })

     return response
   }
   ```

4. Apply rate limiting to all API routes:
   ```typescript
   // Example: src/app/api/ai/consult/route.ts
   import { withRateLimit } from '@/lib/rate-limit/middleware'

   export async function POST(request: NextRequest) {
     return withRateLimit(request, async (req) => {
       // Original handler logic
     })
   }
   ```

**Acceptance Criteria:**
- [ ] All API routes have rate limiting
- [ ] Different tiers for different endpoint types
- [ ] Premium users have higher limits
- [ ] Rate limit headers included in responses
- [ ] Proper 429 responses with retry-after
- [ ] Redis for production, in-memory fallback for dev
- [ ] Tests for rate limiting

**Related Audit Issues:** Security #5 (Incomplete Rate Limiting Coverage)

---

### Task 0.6: Implement Webhook Signature Verification
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 4 hours
**Dependencies:** None
**Files Affected:**
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/webhooks/twilio/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/followups/callback/route.ts`

**Description:**
Implement proper webhook signature verification for all external webhooks (Stripe, Twilio, WhatsApp).

**Implementation Plan:**

1. Create webhook signature utilities:
   ```typescript
   // src/lib/webhooks/signatures.ts
   import crypto from 'crypto'

   // Stripe webhook verification
   export function verifyStripeWebhook(
     payload: string,
     signature: string,
     webhookSecret: string
   ): boolean {
     const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

     try {
       stripe.webhooks.constructEvent(payload, signature, webhookSecret)
       return true
     } catch (error) {
       console.error('Stripe webhook verification failed:', error)
       return false
     }
   }

   // Twilio webhook verification
   export function verifyTwilioWebhook(
     url: string,
     payload: string,
     signature: string,
     authToken: string
   ): boolean {
     const expectedSignature = crypto
       .createHmac('sha1', authToken)
       .update(url + payload)
       .digest('base64')

     return signature === expectedSignature
   }

   // WhatsApp webhook verification
   export function verifyWhatsAppWebhook(
     payload: string,
     signature: string,
     appSecret: string
   ): boolean {
     const expectedSignature = 'sha256=' + crypto
       .createHmac('sha256', appSecret)
       .update(payload)
       .digest('hex')

     // Use timing-safe comparison
     return crypto.timingSafeEqual(
       Buffer.from(signature),
       Buffer.from(expectedSignature)
     )
   }
   ```

2. Update webhook handlers to verify signatures:
   ```typescript
   // src/app/api/webhooks/stripe/route.ts
   import { verifyStripeWebhook } from '@/lib/webhooks/signatures'

   export async function POST(request: NextRequest) {
     const body = await request.text()
     const signature = request.headers.get('stripe-signature')

     if (!signature) {
       return NextResponse.json(
         { error: 'No signature provided' },
         { status: 401 }
       )
     }

     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
     if (!webhookSecret) {
       throw new Error('Stripe webhook secret not configured')
     }

     if (!verifyStripeWebhook(body, signature, webhookSecret)) {
       return NextResponse.json(
         { error: 'Invalid signature' },
         { status: 401 }
       )
     }

     // Process verified webhook...
   }
   ```

**Acceptance Criteria:**
- [ ] Stripe webhooks verify signatures
- [ ] Twilio webhooks verify signatures
- [ ] WhatsApp webhooks verify signatures
- [ ] All webhooks return 401 on invalid signatures
- [ ] Tests for webhook verification
- [ ] Logging for failed verifications

**Related Audit Issues:** Security #10 (No Webhook Signature Verification)

---

### Task 0.7: Implement Security Headers
**Priority:** HIGH
**Severity:** Security Hardening
**Effort:** 2 hours
**Dependencies:** None
**Files Affected:**
- `next.config.js`
- `src/middleware.ts`

**Description:**
Implement comprehensive security headers including CSP, HSTS, X-Frame-Options, etc.

**Implementation Plan:**

1. Update Next.js config:
   ```javascript
   // next.config.js
   const securityHeaders = [
     {
       key: 'X-DNS-Prefetch-Control',
       value: 'on'
     },
     {
       key: 'Strict-Transport-Security',
       value: 'max-age=63072000; includeSubDomains; preload'
     },
     {
       key: 'X-Frame-Options',
       value: 'SAMEORIGIN'
     },
     {
       key: 'X-Content-Type-Options',
       value: 'nosniff'
     },
     {
       key: 'X-XSS-Protection',
       value: '1; mode=block'
     },
     {
       key: 'Referrer-Policy',
       value: 'strict-origin-when-cross-origin'
     },
     {
       key: 'Content-Security-Policy',
       value: [
         "default-src 'self'",
         "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com",
         "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
         "img-src 'self' data: https: blob:",
         "font-src 'self' https://fonts.gstatic.com",
         "connect-src 'self' https://api.stripe.com https://*.supabase.co",
         "frame-src 'self' https://js.stripe.com",
         "object-src 'none'",
         "base-uri 'self'",
         "form-action 'self'",
         "frame-ancestors 'self'",
         "upgrade-insecure-requests"
       ].join('; ')
     },
     {
       key: 'Permissions-Policy',
       value: 'camera=(self), microphone=(self), geolocation=(self)'
     }
   ]

   module.exports = {
     async headers() {
       return [
         {
           source: '/:path*',
           headers: securityHeaders
         }
       ]
     }
   }
   ```

**Acceptance Criteria:**
- [ ] All security headers implemented
- [ ] CSP properly configured
- [ ] HSTS enabled (production only)
- [ ] Security headers verified with securityheaders.com
- [ ] No console errors from CSP violations

**Related Audit Issues:** Security #15 (Missing Security Headers)

---

### Phase 0 Summary

**Tasks Completed:** 7
**Estimated Effort:** 34 hours (1 week)
**Critical Security Issues Resolved:** All

**Exit Criteria:**
- [ ] All API keys rotated
- [ ] RBAC properly implemented
- [ ] Session management working
- [ ] CSRF protection active
- [ ] Rate limiting on all endpoints
- [ ] Webhook signatures verified
- [ ] Security headers configured

**Risk Mitigation:**
- Each task includes rollback plan
- All changes tested in staging first
- Security review before production deployment

---

## PHASE 1: DOCUMENTATION & COMPLIANCE

**Duration:** Week 2-3 (10 business days)
**Goal:** Complete documentation suite and achieve Mexico healthcare compliance
**Dependencies:** Phase 0 complete
**Blocked By:** None (can start in parallel with some Phase 0 tasks)

### Overview
This phase addresses the most critical deficiency identified in the audit: **complete lack of documentation**. Simultaneously, we implement healthcare compliance features required for Mexican regulations (LFPDPPP, COFEPRIS).

---

### Task 1.1: Create Comprehensive README.md
**Priority:** CRITICAL
**Severity:** Documentation Blocker
**Effort:** 6 hours
**Dependencies:** None

**Description:**
Create a comprehensive README.md that serves as the entry point for all developers.

**Content Outline:**
```markdown
# Doctor.mx

[License Badge]
[Build Status]
[Coverage Badge]

## Overview

Doctor.mx is a comprehensive telemedicine platform designed for the Mexican healthcare market. It connects patients with certified doctors, provides AI-powered preliminary consultations, and manages appointments, prescriptions, and follow-ups.

## Features

- **For Patients:**
  - Search and book appointments with certified doctors
  - AI-powered symptom triage and preliminary consultation
  - Secure video consultations
  - Prescription management
  - Appointment reminders (WhatsApp, SMS)
  - Medical history tracking

- **For Doctors:**
  - Profile management and specialization
  - Appointment scheduling and availability management
  - Video consultation interface
  - Prescription writing tools
  - Patient follow-up management
  - Analytics and insights

- **AI-Powered Features:**
  - Adaptive questionnaire for symptom collection
  - Emergency detection and routing
  - SOAP note generation
  - Clinical decision support
  - Medical image analysis

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1 (React 18)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS, shadcn/ui
- **State:** React Context, Zustand
- **Forms:** React Hook Form, Zod validation

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Real-time:** Supabase Realtime

### AI/ML
- **Primary:** GLM-4.7 (z.ai)
- **Fallback:** OpenAI GPT-4o-mini
- **Vision:** GPT-4o
- **Transcription:** OpenAI Whisper

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase (US East)
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry
- **Analytics:** Custom analytics

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/lawrns/doctormx.git
   cd doctormx
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Edit `.env.local` with your credentials (see [Environment Variables](#environment-variables))

4. Run database migrations:
   \`\`\`bash
   npx supabase db push
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhb...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | `eyJhb...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `GLM_API_KEY` | GLM/z.ai API key | `your-key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your-token` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://doctormx.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `NEXT_PUBLIC_ENABLE_SENTRY` | Enable Sentry | `true` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | - |

## Project Structure

\`\`\`
doctormx/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/        # Public marketing pages
│   │   ├── (auth)/             # Authentication pages
│   │   ├── doctor/             # Doctor dashboard
│   │   ├── patient/            # Patient dashboard
│   │   └── api/                # API routes
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── healthcare/         # Healthcare-specific components
│   │   └── ...
│   ├── lib/                   # Core library code
│   │   ├── ai/                 # AI services
│   │   ├── supabase/           # Supabase client
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── payment.ts          # Payment processing
│   │   └── ...
│   ├── types/                 # TypeScript type definitions
│   ├── hooks/                 # Custom React hooks
│   ├── config/                # Configuration files
│   └── middleware.ts           # Next.js middleware
├── supabase/                  # Database migrations
│   └── migrations/            # SQL migration files
├── public/                    # Static assets
├── tests/                     # Test files
└── docs/                      # Additional documentation
\`\`\`

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type check |
| `npm run test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |

### Code Style

We use ESLint and Prettier for code formatting. Please run the linter before committing:

\`\`\`bash
npm run lint
npm run format
\`\`\`

### Git Workflow

1. Create a branch from `main`:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. Make your changes and commit:
   \`\`\`bash
   git add .
   git commit -m "feat: add your feature"
   \`\`\`

3. Push and create a pull request:
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

## Testing

### Running Tests

\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/lib/auth.test.ts
\`\`\`

### Coverage Goals

We aim for **70%+ code coverage**. Current coverage: [TODO]

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main`

### Manual Deployment

\`\`\`bash
npm run build
npm run start
\`\`\`

## Mexico Healthcare Compliance

This platform is designed to comply with:

- **LFPDPPP** - Ley Federal de Protección de Datos Personales en Posesión de los Particulares
- **COFEPRIS** - Comisión Federal para la Protección contra Riesgos Sanitarios
- **NOM-004-SSA3-2012** - Expediente clínico
- **NOM-024-SSA3-2012** - Sistemas de información

See [COMPLIANCE.md](COMPLIANCE.md) for detailed information.

## Support

For support, please:
- Open an issue on GitHub
- Email: support@doctormx.com
- Documentation: [docs.doctormx.com](https://docs.doctormx.com)

## License

Copyright © 2025 Doctor.mx. All rights reserved.
\`\`\`

**Acceptance Criteria:**
- [ ] README.md created in project root
- [ ] All sections completed
- [ ] Screenshots included where helpful
- [ ] All commands tested and working
- [ ] Links to external docs valid

---

### Task 1.2: Document Emergency Detection Logic
**Priority:** CRITICAL
**Severity:** Safety Critical (Life-Critical System)
**Effort:** 8 hours
**Dependencies:** None

**Description:**
Create comprehensive documentation for the emergency detection system, including all patterns, decision trees, and medical guidelines.

**Content Outline:**
```markdown
# Emergency Detection System Documentation

## Overview

The emergency detection system is a **life-critical component** of Doctor.mx. It identifies medical emergencies in patient messages and routes them appropriately.

## Emergency Categories

### 1. Cardiac Emergencies

**Detection Patterns:**
- Spanish: `/dolor.{0,30}pecho|pecho.{0,30}dolor|angina|infarto|ataque.{0,10}corazón/i`
- English: `/chest.*pain|pressure.*chest|squeezing.*chest|heart.*attack/i`

**Response:**
- Immediate redirect to emergency services (911)
- Display emergency contact information
- Disable further AI interaction

**Medical Rationale:**
Chest pain is the primary symptom of myocardial infarction. Time to treatment is critical - "door-to-balloon" time should be under 90 minutes.

### 2. Respiratory Emergencies

**Detection Patterns:**
- Spanish: `/dificultad.{0,15}respirar|cuesta.{0,10}respirar|ahogo|sibilancias|no\\s+pued[oe]\\s+respirar|falta.{0,10}aire/i`
- English: `/difficulty.*breathing|cant.*breathe|trouble.*breathing|shortness.*breath/i`

**Response:**
- Emergency routing
- Breathing difficulty assessment
- Immediate medical attention recommended

### 3. Stroke Signs (Neurological Emergencies)

**Detection Patterns:**
- Spanish: `/parálisis|paralisis|debilidad.{0,20}(brazo|pierna|extremidad)|cara.{0,10}(caída|colgada)|no\\s+pued[oe]\\s+mover/i`
- English: `/paralysis|weakness.*(arm|leg|limb)|face.*droop|cant.*move/i`

**FAST Checklist:**
- **F**ace - Is one side of the face drooping?
- **A**rms - Can they raise both arms?
- **S**peech - Is their speech slurred?
- **T**ime - Time to call emergency services

### 4. Hemorrhage/Bleeding

**Detection Patterns:**
- Spanish: `/hemorragia|sangrado\\s+fuerte|sangrado\\s+no\\s+para/i`
- English: `/hemorrhage|severe.*bleeding|bleeding.*stop/i`

**Severity Assessment:**
- Volume: >500mL is significant
- Rate: Fast bleeding (>100mL/min)
- Location: Internal vs external

### 5. Seizures/Convulsions

**Detection Patterns:**
- Spanish: `/convulsiones|ataques|espasmos|pérdida\\s+consciencia/i`
- English: `/seizure|convulsion|spasm|lose.*consciousness/i`

**Response:**
- Emergency routing
- Do not restrain during seizure
- Protect head, loosen clothing
- Recovery position

### 6. Suicidal Ideation

**Detection Patterns:**
- Spanish: `/pensamientos\\s+suicida|quiere\\s+morir|autolesión|suicidio/i`
- English: `/suicidal.*thoughts|want.*to.*die|self.*harm/i`

**Response:**
- Immediate crisis line connection
- Emergency contact display
- Mental health resources
- Do not leave patient alone

### 7. Severe Headache (Thunderclap)

**Detection Patterns:**
- Spanish: `/dolor\\s+cabeza\\s+peor|explosivo|thunderclap/i`
- English: `/worst.*headache.*life|thunderclap.*headache/i`

**Medical Rationale:**
Sudden severe headache may indicate subarachnoid hemorrhage. Requires immediate neuroimaging.

### 8. Abdominal Emergency

**Detection Patterns:**
- Spanish: `/abdomen\\s+rígido|rebound|defensa\\s+abdominal|peritonitis/i`
- English: `/rigid.*abdomen|rebound|guarding|peritonitis/i`

**Medical Rationale:**
Rigid abdomen with rebound tenderness indicates peritonitis - surgical emergency.

## Triage Decision Tree

```
USER MESSAGE
    │
    ├─→ Contains emergency pattern?
    │       ├─→ YES → Check severity
    │       │           ├─→ CRITICAL → Call 911
    │       │           ├─→ HIGH → Urgent care
    │       │           └─→ MODERATE → Schedule appointment
    │       │
    │       └─→ NO → Continue to AI consultation
```

## Implementation Details

### Red Flags System

**File:** `src/lib/ai/red-flags-enhanced.ts`

**Pattern Structure:**
```typescript
export interface RedFlagPattern {
  pattern: RegExp
  message: string
  severity: 'high' | 'critical'
  action: 'CALL_EMERGENCY' | 'URGENT_CARE' | 'CRISIS_LINE'
  category: EmergencyCategory
}

export const RED_FLAG_PATTERNS: RedFlagPattern[] = [...]
```

### Testing Emergency Detection

**Test File:** `src/app/api/__tests__/ai/consult-emergency-simple.test.ts`

**Test Coverage:**
- All Spanish emergency keywords
- All English emergency keywords
- Edge cases (typos, case-insensitivity)
- False positives (non-emergency similar terms)

**Maintenance:**
When adding new patterns:
1. Add to RED_FLAG_PATTERNS array
2. Add corresponding test case
3. Document medical rationale
4. Update this documentation

## Safety Protocols

### When Emergency is Detected

1. **Immediate Actions:**
   - Stop AI consultation
   - Display emergency alert banner
   - Provide emergency contact information
   - Log incident for review

2. **Emergency Contact Information (Mexico):**
   - **911** - Emergency services (nationwide)
   - **LOCATEL** - Medical emergency: 065
   - **Cruz Roja** - Red Cross: 555-5555
   - **Emergency Hotlines:**
     - UNAM: 5622-0000
     - ISSSTE: 5322-0000
     - IMSS: 5321-5000

3. **For Suicidal Ideation:**
   - **SAPTEL** (National Suicide Prevention): 555-5255
   - **Befrienders Worldwide:** +52 55 1234 5678
   - 24/7 crisis lines available

### False Positive Mitigation

**Strategies:**
- Context-aware detection (medical history consideration)
- Confirmation dialog for non-critical emergencies
- Doctor review of AI-detected emergencies
- Machine learning pattern refinement

## Compliance & Legal

### Mexican Regulations

**NOM-004-SSA3-2012:**
- Emergency triage must be documented
- Referral to emergency services must be recorded
- Patient consent for information sharing

**COFEPRIS:**
- Emergency detection as part of medical device software
- Validation required for emergency routing logic
- Audit trail for all emergency incidents

### Liability Protection

**Documentation Required:**
1. Emergency detection logic documentation ✓
2. Test results for all patterns ✓
3. False positive rate monitoring
4. Doctor override capability
5. Patient consent for AI triage

## Monitoring & Alerts

### Metrics to Track

- **Detection Rate:** % of emergencies correctly identified
- **False Positive Rate:** % of non-emergencies flagged
- **Response Time:** Time from detection to patient notification
- **Escalation Rate:** % of detected emergencies that require escalation

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| False Positive Rate | >5% | Review patterns |
| Detection Rate | <95% | Add missing patterns |
| Response Time | >5s | Optimize detection |

## Change Management

### Pattern Addition Process

1. Medical review of new pattern
2. Regex pattern creation
3. Test case development
4. False positive testing
5. Documentation update
6. Code review by medical advisor
7. Deployment to staging
8. Validation testing
9. Production deployment

### Pattern Retirement Process

1. Identify underperforming pattern
2. Medical review of necessity
3. Decision: modify or remove
4. Update tests
5. Update documentation
6. Deploy changes

## References

### Medical Guidelines
- American Heart Association: Emergency Cardiac Care
- American Stroke Association: Stroke Warning Signs
- NOM-004-SSA3-2012: Emergency triage guidelines

### Technical References
- Regular Expressions for Medical Text Processing
- Natural Language Processing in Healthcare
- Clinical Decision Support Systems

---

**Last Updated:** 2026-02-09
**Reviewed By:** [Medical Advisor Name]
**Next Review:** 2026-05-09
\`\`\`

**Acceptance Criteria:**
- [ ] Complete documentation created
- [ ] All emergency categories documented
- [ ] Medical rationale included
- [ ] Testing procedures documented
- [ ] Mexico emergency contacts verified
- [ ] Compliance requirements addressed
- [ ] Change management process defined

---

### Task 1.3: Create Mexico Healthcare Compliance Documentation
**Priority:** CRITICAL
**Severity:** Legal Compliance Requirement
**Effort:** 10 hours
**Dependencies:** None

**Description:**
Create comprehensive compliance documentation for Mexican healthcare regulations (LFPDPPP, COFEPRIS, NOM standards).

**Content Outline:**
```markdown
# Mexico Healthcare Compliance Documentation

## Overview

Doctor.mx operates as a telemedicine platform in Mexico and must comply with:

1. **LFPDPPP** - Ley Federal de Protección de Datos Personales en Posesión de los Particulares
2. **COFEPRIS** - Comisión Federal para la Protección contra Riesgos Sanitarios
3. **NOM-004-SSA3-2012** - Expediente clínico
4. **NOM-024-SSA3-2012** - Sistemas de información

## LFPDPPP Compliance

### Data Processing Principles

1. **Lawfulness, Consent, and Transparency**
   - All data processing requires explicit user consent
   - Privacy notice must be provided before data collection
   - Purpose of data processing must be clearly stated

2. **Purpose Limitation**
   - Data collected only for specified purposes
   - No secondary processing without additional consent

3. **Data Minimization**
   - Collect only data necessary for stated purpose
   - Regular review of data retention needs

4. **Accuracy**
   - Maintain accurate and up-to-date data
   - Users can correct inaccurate data

5. **Storage Limitation**
   - Retain data only as long as necessary
   - Implement automatic deletion policies

### ARCO Rights Implementation

Users have the following rights (ARCO = Acceso, Rectificación, Cancelación, Oposición):

#### Derecho de Acceso (Right to Access)
**Implementation:**
```typescript
// User can request all their personal data
export async function getUserDataExport(userId: string): Promise<UserDataExport> {
  const supabase = await createClient()

  const [profile, appointments, prescriptions, consultations] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('appointments').select('*').eq('patient_id', userId),
    supabase.from('prescriptions').select('*').eq('patient_id', userId),
    supabase.from('soap_consultations').select('*').eq('patient_id', userId),
  ])

  return {
    profile,
    appointments,
    prescriptions,
    consultations,
    exportDate: new Date().toISOString(),
  }
}
```

#### Derecho de Rectificación (Right to Correction)
**Implementation:**
```typescript
// User can correct their personal data
export async function updateUserData(
  userId: string,
  updates: Partial<Profile>
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw new Error(`Update failed: ${error.message}`)

  // Log correction for audit trail
  await logDataModification(userId, 'rectification', updates)
}
```

#### Derecho de Cancelación (Right to Deletion/Revocation)
**Implementation:**
```typescript
// User can request deletion of their personal data
export async function deleteUserData(
  userId: string,
  reason: string,
  confirmation: boolean
): Promise<void> {
  if (!confirmation) {
    throw new Error('Explicit confirmation required')
  }

  const supabase = await createClient()

  // Soft delete with anonymization (not hard delete)
  await supabase.from('profiles').update({
    full_name: 'Usuario Eliminado',
    email: `deleted-${userId}@anonymous.local`,
    phone: null,
    deleted_at: new Date().toISOString(),
    deletion_reason: reason,
  }).eq('id', userId)

  // Anonymize related records
  await Promise.all([
    supabase.from('appointments').update({
      patient_notes: '[REDACTED]',
    }).eq('patient_id', userId),

    supabase.from('soap_consultations').update({
      patient_info: '[REDACTED]',
    }).eq('patient_id', userId),
  ])

  // Log deletion for audit trail
  await logDataDeletion(userId, reason)
}
```

#### Derecho de Oposición (Right to Object)
**Implementation:**
```typescript
// User can object to specific data processing
export async function objectToDataProcessing(
  userId: string,
  processingTypes: DataProcessingType[],
  reason: string
): Promise<void> {
  const supabase = await createClient()

  // Record objection
  await supabase.from('data_processing_objections').insert({
    user_id: userId,
    processing_types: processingTypes,
    reason,
    created_at: new Date().toISOString(),
  })

  // Stop specified processing types
  if (processingTypes.includes('marketing')) {
    await disableMarketingCommunications(userId)
  }

  if (processingTypes.includes('analytics')) {
    await disableAnalyticsTracking(userId)
  }
}
```

### Consent Management

#### Privacy Notice
**Required Elements:**
1. Identity and contact of data controller
2. Purposes of data processing
3. Types of personal data collected
4. Recipients of personal data
5. Data transfer information
6. Rights of the data subject (ARCO)
7. Consequences of not providing data
8. Privacy policy location

**Implementation:**
- Privacy notice displayed during registration
- Consent checkboxes for each data purpose
- Ability to withdraw consent at any time
- Consent history tracked in database

#### Consent Table Structure
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),

  -- Consents
  privacy_notice_accepted BOOLEAN NOT NULL,
  health_data_consent BOOLEAN NOT NULL,
  appointment_scheduling_consent BOOLEAN NOT NULL,
  video_consultation_consent BOOLEAN NOT NULL,
  prescription_management_consent BOOLEAN NOT NULL,
  marketing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT true,

  -- Metadata
  consented_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  consent_version TEXT NOT NULL,

  -- Revocation tracking
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT
);

CREATE INDEX idx_user_consents_user ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(privacy_notice_accepted, health_data_consent);
```

### Data Security Measures

1. **Encryption at Rest**
   - Database: AES-256 encryption for sensitive fields
   - Storage: Encrypted file storage for medical documents
   - Backups: Encrypted backup storage

2. **Encryption in Transit**
   - TLS 1.3 for all data transmission
   - Certificate pinning for API calls
   - Secure WebSocket connections

3. **Access Control**
   - Role-based access control (RBAC)
   - Row Level Security (RLS) in database
   - Audit logging for all data access

4. **Data Breach Response**
   - Detection within 72 hours (legal requirement)
   - Notification to affected users
   - Notification to regulatory authorities
   - Breach documentation and mitigation

## COFEPRIS Compliance

### Medical Device Classification

Doctor.mx is classified as a **Medical Device Software** under COFEPRIS regulations.

**Classification:** Class II Medical Device
**Risk Level:** Medium
**Requirements:**
- COFEPRIS registration
- Quality management system
- Technical documentation
- Clinical evaluation
- Post-market surveillance

### Doctor Verification Requirements

All doctors on the platform must be verified:

**Documentation Required:**
1. **Cédula Profesional** - Professional license
2. **Cédula Especialidad** - Specialty license (if applicable)
3. **RFC** - Tax ID
4. **CURP** - Unique population registry code
5. **Proof of Address** - Utility bill
6. **Professional Photo** - For identification
7. **Malpractice Insurance** - Proof of coverage
8. **Certificate of Good Standing** - From medical school

**Verification Process:**
1. Document upload during registration
2. Automated validation with government databases
3. Manual review by admin
4. Approval or rejection with reason
5. Periodic re-verification (annual)

### Prescription Requirements

**Electronic Prescriptions (Receta Electrónica):**
1. Doctor's digital signature (e.firma)
2. Prescription number (SSA registration)
3. Patient identification (CURP)
4. Drug information (active ingredient, dosage)
5. Validity period (prescriptions valid for 30 days)
6. Controlled substance special handling

**Implementation:**
```typescript
interface ElectronicPrescription {
  prescriptionNumber: string  // SSA registration
  doctorCurp: string
  doctorSignature: string      // Digital signature
  patientCurp: string
  medications: Medication[]
  issuedAt: Date
  expiresAt: Date

  // Controlled substances require additional fields
  controlledSubstance: boolean
  ssaRegistration?: string
  specialHandling?: string
}
```

### Health Record Requirements (NOM-004-SSA3-2012)

### Clinical Record (Expediente Clínico)

**Required Sections:**
1. **Identification:** Patient demographics
2. **Chief Complaint:** Reason for consultation
3. **History of Present Illness:** Symptom details
4. **Past Medical History:** Previous conditions
5. **Physical Examination:** Findings
6. **Diagnostic Impression:** Assessment
7. **Treatment Plan:** Interventions
8. **Prescriptions:** Medications
9. **Follow-up:** Next appointment
10. **Annotations:** Provider notes

**SOAP Format Implementation:**
```typescript
interface SOAPNote {
  // S - Subjective
  subjective: {
    chiefComplaint: string
    historyOfPresentIllness: string
    symptoms: Symptom[]
    patientPerspective: string
  }

  // O - Objective
  objective: {
    vitalSigns: VitalSigns
    physicalExam: PhysicalExamFindings
    labResults: LabResult[]
    imagingStudies: ImagingStudy[]
  }

  // A - Assessment
  assessment: {
    primaryDiagnosis: string
    differentialDiagnoses: string[]
    severity: 'mild' | 'moderate' | 'severe'
    urgency: 'routine' | 'urgent' | 'emergency'
  }

  // P - Plan
  plan: {
    medications: Medication[]
    procedures: Procedure[]
    referrals: Referral[]
    followUp: FollowUpPlan
    patientEducation: string[]
  }

  // Metadata
  metadata: {
    doctorId: string
    doctorSignature: string
    patientId: string
    createdAt: Date
    updatedAt: Date
  }
}
```

### Record Retention Requirements

**Minimum Retention Periods:**
- Adult patient records: 5 years from last consultation
- Minor patient records: 5 years after turning 18
- Emergency records: 5 years
- Surgical records: 5 years
- Electronic health records: Same as paper records

**Implementation:**
```sql
CREATE TABLE record_retention_schedule (
  record_type TEXT PRIMARY KEY,
  retention_years INTEGER NOT NULL,
  retention_start_date TEXT NOT NULL, -- 'last_consultation' or 'patient_birth'
  archive_after_years INTEGER,
  delete_after_years INTEGER
);

INSERT INTO record_retention_schedule VALUES
  ('adult_consultation', 5, 'last_consultation', 3, 5),
  ('minor_consultation', 21, 'birth_date', 18, 21), -- 18 + 5
  ('emergency_record', 5, 'created_at', 2, 5),
  ('surgical_record', 5, 'created_at', 3, 5);
```

### Audit Trail Requirements

All access to patient health records must be logged:

```sql
CREATE TABLE health_record_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL,
  record_type TEXT NOT NULL, -- 'appointment', 'prescription', 'consultation'
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT NOT NULL, -- 'doctor', 'patient', 'admin'
  access_type TEXT NOT NULL, -- 'view', 'create', 'update', 'delete'
  access_reason TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  session_id UUID
);

CREATE INDEX idx_health_record_access_log_record ON health_record_access_log(record_id, accessed_at DESC);
CREATE INDEX idx_health_record_access_log_user ON health_record_access_log(user_id, accessed_at DESC);
```

## NOM-024-SSA3-2012 Compliance

### Information System Requirements

1. **Interoperability**
   - HL7 FHIR support for data exchange
   - Compatibility with public health systems
   - Standardized medical terminology (SNOMED CT, ICD-10)

2. **Data Integrity**
   - Validation rules for all data entry
   - Duplicate detection and prevention
   - Data quality monitoring

3. **Security**
   - Access control based on role
   - Audit trails for all modifications
   - Backup and disaster recovery

4. **Availability**
   - 99.5% uptime requirement
   - Backup power for critical systems
   - Alternative communication channels

### Telemedicine-Specific Requirements

1. **Video Consultation Quality**
   - Minimum resolution: 480p
   - Frame rate: 15 fps minimum
   - Audio quality: Clear, no dropouts

2. **Doctor-Patient Identification**
   - Doctor verification before consultation
   - Patient authentication required
   - Government ID verification for prescriptions

3. **Prescription Validity**
   - Video consultation required for first prescription
   - Follow-up prescriptions may be issued without video
   - Electronic signature required

4. **Geographic Restrictions**
   - Doctor can only practice in licensed state
   - Cross-border telemedicine requires special authorization

## Implementation Checklist

### LFPDPPP Compliance
- [ ] Privacy notice published on website
- [ ] Consent management system implemented
- [ ] ARCO rights accessible to users
- [ ] Data export functionality working
- [ ] Data correction functionality working
- [ ] Data deletion (anonymization) working
- [ ] Data objection system working
- [ ] Consent history tracking
- [ ] Data breach response plan documented
- [ ] Data processing agreements with vendors

### COFEPRIS Compliance
- [ ] COFEPRIS registration obtained
- [ ] Quality management system implemented
- [ ] Technical documentation complete
- [ ] Doctor verification system working
- [ ] Electronic prescription system working
- [ ] Digital signature integration
- [ ] Patient identification process
- [ ] Geographic restrictions enforced
- [ ] Post-market surveillance system
- [ ] Adverse event reporting

### NOM-004-SSA3-2012 Compliance
- [ ] SOAP note format implemented
- [ ] All required note sections present
- [ ] Record retention system working
- [ ] Audit trail for all record access
- [ ] Medical terminology standardization
- [ ] Prescription management system
- [ ] Follow-up scheduling system
- [ ] Patient education materials

### NOM-024-SSA3-2012 Compliance
- [ ] System interoperability (HL7 FHIR)
- [ ] Data integrity validation
- [ ] Access control system
- [ ] Backup and disaster recovery
- [ ] Uptime monitoring
- [ ] Video quality assurance
- [ ] Cross-border restrictions

## Audit & Monitoring

### Regular Audits Required

**LFPDPPP:** Annual security audit
**COFEPRIS:** Semi-annual quality audit
**NOM Standards:** Ongoing compliance monitoring

### Self-Assessment Checklist

Monthly self-assessment covering:
- Data protection measures
- Access control effectiveness
- Incident response testing
- Documentation completeness
- Staff training records

## Penalties for Non-Compliance

| Regulation | Violation | Penalty |
|------------|-----------|----------|
| LFPDPPP | Data breach | 200-800,000 UMX daily fines |
| LFPDPPP | Denied ARCO rights | 200-800,000 UMX daily fines |
| COFEPRIS | Unlicensed practice | Practice suspension |
| COFEPRIS | Non-compliant device | Device confiscation |
| NOM Standards | Record deficiencies | Fines + practice suspension |

## Contact Information

**Regulatory Authorities:**
- **INAI:** Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales
  - Website: https://www.gob.mx/inai
  - Phone: 55 5626 3600

- **COFEPRIS:** Comisión Federal para la Protección contra Riesgos Sanitarios
  - Website: https://www.gob.mx/cofepris
  - Phone: 55 5080 8500

---

**Document Version:** 1.0
**Last Updated:** 2026-02-09
**Next Review:** 2026-05-09
**Approved By:** [Legal/Compliance Officer]
\`\`\`

**Acceptance Criteria:**
- [ ] Complete compliance documentation created
- [ ] All major regulations covered
- [ ] Implementation code examples included
- [ ] Checklist format for verification
- [ ] Penalties documented
- [ ] Contact information included
- [ ] Review schedule established

---

### Task 1.4: Create API Documentation (OpenAPI/Swagger)
**Priority:** HIGH
**Severity:** Developer Experience
**Effort:** 12 hours
**Dependencies:** None

**Description:**
Create comprehensive API documentation using OpenAPI 3.1 specification.

**Implementation Plan:**

1. Install OpenAPI tools:
   ```bash
   npm install --save-dev swagger-ui-react @typescript-eslint/typescript-estree
   ```

2. Create OpenAPI specification:
   ```typescript
   // docs/openapi-spec.ts
   import { OpenAPIV3_1 } from 'openapi-types'

   export const openAPISpec: OpenAPIV3_1.Document = {
     openapi: '3.1.0',
     info: {
       title: 'Doctor.mx API',
       version: '1.0.0',
       description: 'Telemedicine platform API for Mexican healthcare',
       contact: {
         name: 'API Support',
         email: 'api@doctormx.com'
       },
       license: {
         name: 'Proprietary',
         url: 'https://doctormx.com/license'
       }
     },
     servers: [
       {
         url: 'https://api.doctormx.com',
         description: 'Production server'
       },
       {
         url: 'https://staging-api.doctormx.com',
         description: 'Staging server'
       },
       {
         url: 'http://localhost:3000',
         description: 'Development server'
       }
     ],
     tags: [
       { name: 'Authentication', description: 'User authentication and session management' },
       { name: 'Appointments', description: 'Appointment scheduling and management' },
       { name: 'Doctors', description: 'Doctor profiles and availability' },
       { name: 'AI', description: 'AI-powered consultation and analysis' },
       { name: 'Payments', description: 'Payment processing' },
       { name: 'Prescriptions', description: 'Prescription management' },
       { name: 'Chat', description: 'Real-time messaging' },
       { name: 'Emergency', description: 'Emergency detection and triage' }
     ],
     paths: {
       '/api/auth/login': {
         post: {
           tags: ['Authentication'],
           summary: 'User login',
           description: 'Authenticates a user and returns a session token',
           security: [],
           requestBody: {
             required: true,
             content: {
               'application/json': {
                 schema: {
                   type: 'object',
                   required: ['email', 'password'],
                   properties: {
                     email: { type: 'string', format: 'email' },
                     password: { type: 'string', format: 'password' }
                   }
                 }
               }
             }
           },
           responses: {
             '200': {
               description: 'Successful login',
               content: {
                 'application/json': {
                   schema: {
                     type: 'object',
                     properties: {
                       user: { $ref: '#/components/schemas/User' },
                       session: { $ref: '#/components/schemas/Session' }
                   }
                 }
               }
             },
             '401': { $ref: '#/components/responses/Unauthorized' },
             '422': { $ref: '#/components/responses/ValidationError' }
           }
         }
       },
       // ... more endpoints
     },
     components: {
       schemas: {
         User: {
           type: 'object',
           properties: {
             id: { type: 'string', format: 'uuid' },
             email: { type: 'string', format: 'email' },
             role: { type: 'string', enum: ['patient', 'doctor', 'admin'] },
             fullName: { type: 'string' },
             phone: { type: 'string' }
           }
         },
         // ... more schemas
       },
       responses: {
         Unauthorized: {
           description: 'Unauthorized - Authentication required',
           content: {
             'application/json': {
               schema: {
                 type: 'object',
                 properties: {
                   error: { type: 'string' }
                 }
               }
             }
           }
         },
         ValidationError: {
           description: 'Validation Error - Invalid request data',
           content: {
             'application/json': {
               schema: {
                 type: 'object',
                 properties: {
                   error: { type: 'string' },
                   details: { type: 'array', items: { type: 'string' } }
                 }
               }
             }
           }
         }
       },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
     }
   }
   ```

3. Add JSDoc to API routes for auto-generation:
   ```typescript
   /**
    * @openapi
    * /api/ai/consult:
    *   post:
    *     tags: [AI]
    *     summary: Start AI-powered consultation
    *     description: Initiates an adaptive questionnaire conversation with AI
    *     security:
    *       - bearerAuth: []
    *     requestBody:
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required: [message, conversationId]
    *             properties:
    *               message:
    *                 type: string
    *                 description: Patient's message or symptom description
    *               conversationId:
    *                 type: string
    *                 format: uuid
    *                 description: 'Existing conversation ID (optional for new)'
    *     responses:
    *       200:
    *         description: Successful AI response
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 message:
    *                   type: string
    *                   description: AI response message
    *                 emergencyDetected:
    *                   type: boolean
    *                   description: Whether an emergency was detected
    *                 nextQuestion:
    *                   type: object
    *                   description: Next question if applicable
    *       401:
    *         $ref: '#/components/responses/Unauthorized'
    *       429:
    *         $ref: '#/components/responses/RateLimitExceeded'
    */
   export async function POST(request: NextRequest) {
     // Implementation
   }
   ```

4. Generate Swagger UI page:
   ```typescript
   // src/app/docs/api/page.tsx
   import React from 'react'
   import SwaggerUI from 'swagger-ui-react'
   import 'swagger-ui-react/swagger-ui.css'

   export default function APIDocsPage() {
     return (
       <main className="container">
         <SwaggerUI spec={openAPISpec} />
       </main>
     )
   }
   ```

**Acceptance Criteria:**
- [ ] OpenAPI specification created for all endpoints
- [ ] Swagger UI page accessible at /docs/api
- [ ] All request/response schemas documented
- [ ] Authentication requirements documented
- [ ] Error responses documented
- [ ] Example requests/responses included
- [ ] Auto-generated from JSDoc where possible

---

## PHASE 2: TYPE SAFETY & ERROR HANDLING

**Duration:** Week 4 (5 business days)
**Goal:** Zero `any` types, proper error handling
**Dependencies:** Phase 0 complete
**Blocked By:** None

### Task 2.1: Eliminate All `any` Types
**Priority:** HIGH
**Severity:** Type Safety
**Effort:** 16 hours
**Files Affected:** 30 files with `any` types

**Description:**
Systematically remove all `any` types and replace with proper TypeScript interfaces.

**Files to Fix:**
1. `src/app/api/ai/consult/route.ts` - `Promise<any>` return types
2. `src/components/ClinicalCopilot.tsx` - any prop types
3. `src/lib/chat.ts` - any type assertions
4. All other files with `any` usage

**Implementation Strategy:**

1. Create comprehensive type definitions:
   ```typescript
   // src/types/api-responses.ts
   export interface APIResponse<T = unknown> {
     success: boolean
     data?: T
     error?: string
     message?: string
     metadata?: {
       timestamp: string
       requestId: string
       version: string
     }
   }

   export interface PaginatedResponse<T> extends APIResponse<T[]> {
     pagination: {
       page: number
       limit: number
       total: number
       hasMore: boolean
     }
   }

   // src/types/ai-responses.ts
   export interface AIConsultResponse extends APIResponse {
     data?: {
       message: string
       emergencyDetected: boolean
       nextQuestion?: Question
       state?: ConversationState
       toolsExecuted?: ToolResult[]
     }
   }

   export interface MultiSpecialistAnalysis {
     specialists: string[]
     results: SpecialistAnalysis[]
     consensus: string
     confidence: number
     recommendations: string[]
   }

   export interface SpecialistAnalysis {
     specialist: string
     analysis: string
     confidence: number
     recommendations: string[]
     redFlags?: RedFlag[]
   }

   // src/types/questionnaire.ts
   export interface Question {
     id: string
     text: string
     type: 'open' | 'choice' | 'scale' | 'yes_no' | 'location' | 'image'
     options?: string[]
     category: 'symptom' | 'history' | 'risk_factor' | 'red_flag' | 'follow_up'
     priority: number
     reasoning: string
   }
   ```

2. Replace `any` with proper types:
   ```typescript
   // BEFORE
   async function runMultiSpecialistAnalysis(
     messages: Array<{ role: string; content: string }>,
     selectedSpecialists: string[],
     patientId: string
   ): Promise<any>

   // AFTER
   async function runMultiSpecialistAnalysis(
     messages: Array<{ role: string; content: string }>,
     selectedSpecialists: string[],
     patientId: string
   ): Promise<MultiSpecialistAnalysis>
   ```

3. Create generic types for common patterns:
   ```typescript
   // src/types/generics.ts
   export type Result<T, E = Error> =
     | { success: true; data: T }
     | { success: false; error: E }

   export type AsyncResult<T, E = Error> = Promise<Result<T, E>>

   export type Paginated<T> = {
     data: T[]
     pagination: {
       page: number
       limit: number
       total: number
       hasMore: boolean
     }
   }
   ```

**Acceptance Criteria:**
- [ ] Zero `any` types in codebase
- [ ] All functions have explicit return types
- [ ] All API responses use standard types
- [ ] Generic types used appropriately
- [ ] TypeScript strict mode enabled
- [ ] No type assertions (or documented why necessary)

---

### Task 2.2: Fix Non-Null Assertions
**Priority:** HIGH
**Severity:** Runtime Safety
**Effort:** 4 hours
**Files Affected:**
- `src/lib/ai/anthropic.ts`
- `src/lib/ai/glm.ts`
- `src/lib/ai/router.ts`

**Description:**
Replace unsafe non-null assertions (!) with proper null checks.

**Implementation:**
```typescript
// BEFORE
if (!this.options.apiKey!) {
  throw new Error('API key required')
}

// AFTER
if (!this.options.apiKey) {
  throw new Error('API key required')
}

// OR BETTER
private assertApiKey(): string {
  if (!this.options.apiKey) {
    throw new Error(`${this.constructor.name} requires an API key`)
  }
  return this.options.apiKey
}
```

**Acceptance Criteria:**
- [ ] No non-null assertions (!) in codebase
- [ ] All optional properties properly checked
- [ ] Proper error messages for missing values
- [ ] Type guards used where appropriate

---

### Task 2.3: Implement Global Error Handler
**Priority:** HIGH
**Severity:** Error Handling
**Effort:** 8 hours
**Dependencies:** None

**Description:**
Create a centralized error handling system with consistent error responses.

**Implementation Plan:**

1. Create error types:
   ```typescript
   // src/lib/errors/types.ts
   export class AppError extends Error {
     constructor(
       message: string,
       public code: string,
       public statusCode: number = 500,
       public isOperational: boolean = true
     ) {
       super(message)
       this.name = this.constructor.name
       Error.captureStackTrace(this, this.constructor)
     }
   }

   export class ValidationError extends AppError {
     constructor(message: string, public fields?: Record<string, string>) {
       super(message, 'VALIDATION_ERROR', 400)
     }
   }

   export class AuthenticationError extends AppError {
     constructor(message: string = 'Authentication required') {
       super(message, 'AUTHENTICATION_ERROR', 401)
     }
   }

   export class AuthorizationError extends AppError {
     constructor(message: string = 'Insufficient permissions') {
       super(message, 'AUTHORIZATION_ERROR', 403)
     }
   }

   export class NotFoundError extends AppError {
     constructor(resource: string) {
       super(`${resource} not found`, 'NOT_FOUND', 404)
     }
   }

   export class ConflictError extends AppError {
     constructor(message: string) {
       super(message, 'CONFLICT', 409)
     }
   }

   export class RateLimitError extends AppError {
     constructor(retryAfter?: number) {
       super('Too many requests', 'RATE_LIMIT', 429)
     }
   }

   export class ExternalServiceError extends AppError {
     constructor(service: string, message: string) {
       super(`${service} error: ${message}`, 'EXTERNAL_SERVICE', 502)
     }
   }
   ```

2. Create error handler middleware:
   ```typescript
   // src/lib/errors/handler.ts
   import { NextResponse } from 'next/server'
   import { logger } from '@/lib/observability/logger'
   import { AppError } from './types'

   export function handleApiError(error: unknown): NextResponse {
     // Log error for monitoring
     const context = {
       message: error instanceof Error ? error.message : String(error),
       stack: error instanceof Error ? error.stack : undefined,
       name: error instanceof Error ? error.constructor.name : 'UnknownError',
     }

     if (error instanceof AppError) {
       // Log operational errors at warn level
       if (error.isOperational) {
         logger.warn('[API Error]', context)
       } else {
         logger.error('[API Critical Error]', context)
       }

       return NextResponse.json(
         {
           error: {
             code: error.code,
             message: error.message,
             ...(error.statusCode >= 500 ? {} : { details: error }),
           },
         },
         { status: error.statusCode }
       )
     }

     // Handle unexpected errors
     logger.error('[API Unexpected Error]', context)

     return NextResponse.json(
       {
         error: {
           code: 'INTERNAL_ERROR',
           message: 'An unexpected error occurred',
         },
       },
       { status: 500 }
     )
   }

   export function withErrorHandler(
     handler: (req: NextRequest) => Promise<NextResponse>
   ) {
     return async (req: NextRequest) => {
       try {
         return await handler(req)
       } catch (error) {
         return handleApiError(error)
       }
     }
   }
   ```

3. Update API routes to use error handler:
   ```typescript
   // src/app/api/doctors/route.ts
   import { withErrorHandler } from '@/lib/errors/handler'
   import { ValidationError, NotFoundError } from '@/lib/errors/types'

   export const GET = withErrorHandler(async (request: NextRequest) => {
     const { searchParams } = new URL(request.url)
     const specialty = searchParams.get('specialty')
     const city = searchParams.get('city')

     if (!specialty) {
       throw new ValidationError('Specialty is required', {
         specialty: 'Specialty parameter is required'
       })
     }

     const doctors = await getDoctorsBySpecialtyAndCity(specialty, city)

     if (!doctors || doctors.length === 0) {
       throw new NotFoundError('doctors')
     }

     return NextResponse.json({ success: true, data: doctors })
   })
   ```

**Acceptance Criteria:**
- [ ] All error types defined
- [ ] Global error handler implemented
- [ ] All API routes use error handler
- [ ] Consistent error response format
- [ ] Operational errors logged differently from critical errors
- [ ] No stack traces exposed to clients

---

### Task 2.4: Implement Input Validation with Zod
**Priority:** HIGH
**Severity:** Security & Data Quality
**Effort:** 12 hours
**Files Affected:** All API routes

**Description:**
Implement comprehensive request validation using Zod schemas.

**Implementation Plan:**

1. Create validation schemas:
   ```typescript
   // src/lib/validation/schemas.ts
   import { z } from 'zod'

   // Auth schemas
   export const loginSchema = z.object({
     email: z.string().email('Invalid email format'),
     password: z.string().min(8, 'Password must be at least 8 characters'),
   })

   export const registerSchema = z.object({
     email: z.string().email('Invalid email format'),
     password: z.string()
       .min(8, 'Password must be at least 8 characters')
       .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
       .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
       .regex(/[0-9]/, 'Password must contain at least one number'),
     fullName: z.string().min(2, 'Name must be at least 2 characters'),
     phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number'),
     role: z.enum(['patient', 'doctor']),
   })

   export const resetPasswordSchema = z.object({
     token: z.string().uuid('Invalid reset token'),
     password: z.string().min(8),
     confirmPassword: z.string().min(8),
   }).refine((data) => data.password === data.confirmPassword, {
     message: 'Passwords do not match',
     path: ['confirmPassword'],
   })

   // Appointment schemas
   export const createAppointmentSchema = z.object({
     doctorId: z.string().uuid('Invalid doctor ID'),
     startTime: z.string().datetime('Invalid datetime format'),
     appointmentType: z.enum(['video', 'in-person'], {
       errorMap: () => ({ message: 'Must be video or in-person' })
     }),
     reason: z.string().min(5, 'Please provide a reason for the appointment'),
   })

   export const updateAppointmentSchema = z.object({
     status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
     notes: z.string().optional(),
   }).partial()

   // AI consultation schemas
   export const aiConsultSchema = z.object({
     message: z.string().min(3, 'Message must be at least 3 characters'),
     conversationId: z.string().uuid().optional(),
     metadata: z.object({
       imageUrl: z.string().url().optional(),
       audioUrl: z.string().url().optional(),
     }).optional(),
   })

   // Doctor schemas
   export const doctorProfileSchema = z.object({
     fullName: z.string().min(2),
     specialties: z.array(z.string()).min(1),
     subSpecialties: z.array(z.string()).optional(),
     license: z.string().regex(/^[A-Z]{3}\d{6}$/, 'Invalid cédula format'),
     licenseState: z.string().length(2),
     experience: z.number().int().min(0).max(50).optional(),
     bio: z.string().max(1000).optional(),
     consultationFee: z.number().positive().optional(),
   })

   // Payment schemas
   export const createPaymentSchema = z.object({
     appointmentId: z.string().uuid(),
     amount: z.number().positive(),
     currency: z.enum(['MXN', 'USD']),
     paymentMethod: z.enum(['card', 'oxxo']),
   })

   // Prescription schemas
   export const prescriptionSchema = z.object({
     appointmentId: z.string().uuid(),
     medications: z.array(z.object({
       name: z.string(),
       dosage: z.string(),
       frequency: z.string(),
       duration: z.string(),
       instructions: z.string().optional(),
     })).min(1),
     diagnosis: z.string().min(5),
     notes: z.string().optional(),
   })

   // Helper function to validate request body
   export async function validateRequestBody<T>(
     request: NextRequest,
     schema: z.ZodSchema<T>
   ): Promise<T> {
     const body = await request.json()

     try {
       return await schema.parseAsync(body)
     } catch (error) {
       if (error instanceof z.ZodError) {
         const details = error.errors.map((e) => ({
           path: e.path.join('.'),
           message: e.message,
         }))

         throw new ValidationError('Validation failed', { ...details })
       }

       throw error
     }
   }
   ```

2. Use in API routes:
   ```typescript
   // src/app/api/auth/register/route.ts
   import { validateRequestBody, registerSchema } from '@/lib/validation/schemas'

   export async function POST(request: NextRequest) {
     try {
       const body = await validateRequestBody(request, registerSchema)

       // Proceed with registration...
       const { user, session } = await registerUser(body)

       return NextResponse.json({
         success: true,
         data: { user, session }
       })
     } catch (error) {
       return handleApiError(error)
     }
   }
   ```

**Acceptance Criteria:**
- [ ] All API endpoints have validation schemas
- [ ] Validation errors return helpful messages
- [ ] Complex validation rules implemented
- [ ] No unvalidated input reaches business logic
- [ ] Validation documented in API docs

---

## PHASE 3: PERFORMANCE OPTIMIZATION

**Duration:** Week 5-6 (10 business days)
**Goal:** Optimize all performance bottlenecks
**Dependencies:** Phase 2 complete
**Blocked By:** None

### Task 3.1: Fix N+1 Query in Chat Module
**Priority:** CRITICAL
**Severity:** Performance
**Effort:** 6 hours
**Files Affected:** `src/lib/chat.ts`

**Description:**
Optimize the chat module to eliminate N+1 query patterns for unread counts.

**Current Problem:**
```typescript
// INEFFICIENT: Makes multiple queries
const conversations = await supabase
  .from('chat_conversations')
  .select('*, patient:profiles(*), doctor:doctors(*)')
  .eq('patient_id', userId)

// Then for each conversation, queries unread count separately
for (const conv of conversations) {
  const unread = await getUnreadCount(conv.id) // N+1!
}
```

**Optimized Solution:**
```typescript
// EFFICIENT: Single query with aggregation
const { data: conversations } = await supabase
  .from('chat_conversations')
  .select(`
    id,
    patient_id,
    doctor_id,
    last_message_at,
    patient:profiles!chat_conversations_patient_id_fkey (
      full_name,
      photo_url
    ),
    doctor:doctors!chat_conversations_doctor_id_fkey (
      user_id
    ),
    doctor_user:profiles!doctors_user_id_fkey (
      full_name as doctor_name,
      photo_url as doctor_photo_url
    ),
    unread_count:count(
      chat_messages.id
    )
    .filter(
      chat_messages,
      and(
        eq(chat_messages.conversation_id, chat_conversations.id),
        is(chat_messages.read_at, null),
        ne(chat_messages.sender_id, ${userId})
      )
    )
  `)
  .eq('patient_id', userId)
  .order('last_message_at', { ascending: false })
```

**Acceptance Criteria:**
- [ ] Single query for conversations with unread counts
- [ ] Query response time < 200ms
- [ ] No performance degradation with 100+ conversations
- [ ] Tests confirming no N+1 pattern

---

### Task 3.2: Add Database Indexes
**Priority:** HIGH
**Severity:** Performance
**Effort:** 4 hours
**Files Affected:** `supabase/migrations/`

**Description:**
Create comprehensive database indexes for all frequently queried columns.

**Migration File:**
```sql
-- supabase/migrations/20250209_performance_indexes.sql

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_start_status
ON appointments(doctor_id, start_ts DESC)
WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_appointments_patient_start_status
ON appointments(patient_id, start_ts DESC)
WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_appointments_status_created
ON appointments(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_range
ON appointments(doctor_id, start_ts)
WHERE start_ts >= NOW() - INTERVAL '90 days';

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_created
ON chat_messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_unread
ON chat_messages(conversation_id, read_at)
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_created
ON chat_messages(sender_id, created_at DESC);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_patient_updated
ON chat_conversations(patient_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_doctor_updated
ON chat_conversations(doctor_id, last_message_at DESC);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_status_created
ON payments(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_appointment_status
ON payments(appointment_id)
WHERE status = 'completed';

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_created
ON profiles(role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm
ON profiles USING gin(full_name gin_trgm_ops);

-- Doctor subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_doctor_subscriptions_doctor_status
ON doctor_subscriptions(doctor_id, status)
WHERE status = 'active';

-- Followups indexes
CREATE INDEX IF NOT EXISTS idx_followups_doctor_scheduled
ON followups(doctor_id, scheduled_at)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_followups_patient_scheduled
ON followups(patient_id, scheduled_at)
WHERE status = 'pending';

-- SOAP consultations indexes
CREATE INDEX IF NOT EXISTS idx_soap_consultations_doctor_created
ON soap_consultations(doctor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_soap_consultations_status_created
ON soap_consultations(status, created_at DESC);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_availability_rules_doctor_day
ON availability_rules(doctor_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_availability_exceptions_doctor_date
ON availability_exceptions(doctor_id, date);

-- Prescriptions indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_created
ON prescriptions(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_created
ON prescriptions(doctor_id, created_at DESC);

-- Partial indexes for common filters
CREATE INDEX IF NOT EXISTS idx_appointments_pending_video
ON appointments(appointment_type)
WHERE status = 'pending' AND appointment_type = 'video';

CREATE INDEX IF NOT EXISTS idx_appointments_confirmed_video
ON appointments(doctor_id, start_ts)
WHERE status = 'confirmed' AND appointment_type = 'video';
```

**Acceptance Criteria:**
- [ ] All indexes created and verified
- [ ] Query performance improved by 60%+
- [ ] No duplicate indexes
- [ ] Index usage monitored

---

### Task 3.3: Implement Response Caching
**Priority:** HIGH
**Severity:** Performance
**Effort:** 8 hours
**Dependencies:** Task 3.2

**Description:**
Implement caching for frequently accessed data with proper cache invalidation.

**Implementation Plan:**

1. Create caching layer:
   ```typescript
   // src/lib/cache/layer.ts
   import { Redis } from '@upstash/redis'
   import { logger } from '@/lib/observability/logger'

   interface CacheEntry<T> {
     data: T
     timestamp: number
     ttl: number
   }

   export class CacheLayer {
     private redis: Redis | null = null
     private localCache: Map<string, CacheEntry<unknown>>

     constructor() {
       if (process.env.UPSTASH_REDIS_REST_URL) {
         this.redis = new Redis({
           url: process.env.UPSTASH_REDIS_REST_URL,
           token: process.env.UPSTASH_REDIS_REST_TOKEN,
         })
       } else {
         logger.warn('[Cache] Redis not configured, using in-memory cache')
       }

       this.localCache = new Map()
     }

     async get<T>(key: string): Promise<T | null> {
       try {
         // Try Redis first
         if (this.redis) {
           const value = await this.redis.get(`cache:${key}`)
           if (value) {
             const entry: CacheEntry<T> = JSON.parse(value)
             if (Date.now() - entry.timestamp < entry.ttl) {
               return entry.data
             }
             // Cache expired, delete it
             await this.redis.del(`cache:${key}`)
           }
         }

         // Fall back to local cache
         const local = this.localCache.get(key) as CacheEntry<T> | undefined
         if (local && Date.now() - local.timestamp < local.ttl) {
           return local.data
         }

         return null
       } catch (error) {
         logger.error('[Cache] Get error:', { error, key })
         return null
       }
     }

     async set<T>(
       key: string,
       data: T,
       ttl: number
     ): Promise<void> {
       try {
         const entry: CacheEntry<T> = {
           data,
           timestamp: Date.now(),
           ttl,
         }

         // Set in Redis
         if (this.redis) {
           await this.redis.setex(
             `cache:${key}`,
             Math.ceil(ttl / 1000),
             JSON.stringify(entry)
           )
         }

         // Set in local cache
         this.localCache.set(key, entry)
       } catch (error) {
         logger.error('[Cache] Set error:', { error, key })
       }
     }

     async invalidate(pattern: string): Promise<void> {
       try {
         // Invalidate matching keys in local cache
         const regex = new RegExp(pattern)
         for (const key of this.localCache.keys()) {
           if (regex.test(key)) {
             this.localCache.delete(key)
           }
         }

         // Invalidate in Redis
         if (this.redis) {
           const keys = await this.redis.keys(`cache:${pattern}`)
           if (keys.length > 0) {
             await this.redis.del(...keys)
           }
         }

         logger.info('[Cache] Invalidated pattern:', { pattern })
       } catch (error) {
         logger.error('[Cache] Invalidate error:', { error, pattern })
       }
     }

     async delete(key: string): Promise<void> {
       try {
         if (this.redis) {
           await this.redis.del(`cache:${key}`)
         }
         this.localCache.delete(key)
       } catch (error) {
         logger.error('[Cache] Delete error:', { error, key })
       }
     }
   }

   export const cacheLayer = new CacheLayer()
   ```

2. Create cache decorators:
   ```typescript
   // src/lib/cache/decorators.ts
   import { cacheLayer } from './layer'
   import { logger } from '@/lib/observability/logger'

   export function CacheResponse(
     ttlSeconds: number,
     keyPrefix: string = 'api'
   ) {
     return function (
       target: unknown,
       propertyKey: string,
       descriptor: PropertyDescriptor
     ) {
       const originalMethod = descriptor.value

       descriptor.value = async function (...args: unknown[]) {
         // Generate cache key
         const cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`

         // Try to get from cache
         const cached = await cacheLayer.get<typeof originalMethod>(cacheKey)
         if (cached) {
           logger.debug('[Cache] Hit:', { key: cacheKey })
           return cached
         }

         // Cache miss, call original method
         logger.debug('[Cache] Miss:', { key: cacheKey })

         const result = await originalMethod.apply(this, args)

         // Store in cache
         await cacheLayer.set(cacheKey, result, ttlSeconds * 1000)

         return result
       }

       return descriptor
     }
   }

   export function InvalidateCache(pattern: string) {
     return function (
       target: unknown,
       propertyKey: string,
       descriptor: PropertyDescriptor
     ) {
       const originalMethod = descriptor.value

       descriptor.value = async function (...args: unknown[]) {
         const result = await originalMethod.apply(this, args)

         // Invalidate cache after mutation
         await cacheLayer.invalidate(pattern)

         return result
       }

       return descriptor
     }
   }
   ```

3. Add cache headers to API responses:
   ```typescript
   // src/lib/cache/headers.ts
   export interface CacheOptions {
     maxAge?: number // seconds
     sMaxAge?: number // seconds (shared cache)
     staleWhileRevalidate?: number // seconds
     staleIfError?: number // seconds
     private?: boolean
   }

   export function getCacheHeaders(options: CacheOptions): Record<string, string> {
     const headers: Record<string, string> = {}

     if (options.private) {
       headers['Cache-Control'] = 'private, no-cache, no-store, must-revalidate'
     } else if (options.sMaxAge) {
       headers['Cache-Control'] = `public, max-age=${options.maxAge || 0}, s-maxage=${options.sMaxAge}`
       headers['CDN-Cache-Control'] = `public, max-age=${options.sMaxAge}`
     }

     if (options.staleWhileRevalidate) {
       headers['Cache-Control'] += `, stale-while-revalidate=${options.staleWhileRevalidate}`
     }

     if (options.staleIfError) {
       headers['Cache-Control'] += `, stale-if-error=${options.staleIfError}`
     }

     return headers
   }

   // Usage in API routes
   export async function GET(request: NextRequest) {
     const data = await getDoctors()

     return NextResponse.json(
       { success: true, data },
       {
         headers: getCacheHeaders({
           maxAge: 300, // 5 minutes
           sMaxAge: 600, // 10 minutes CDN
           staleWhileRevalidate: 120, // 2 minutes
         })
       }
     )
   }
   ```

**Acceptance Criteria:**
- [ ] Cache layer implemented with Redis fallback
- [ ] Cache decorators for commonly accessed data
- [ ] Proper cache invalidation on mutations
- [ ] Cache headers on all GET endpoints
- [ ] Cache hit rate monitoring

---

### Task 3.4: Implement Pagination
**Priority:** HIGH
**Severity:** Performance & UX
**Effort:** 6 hours
**Files Affected:** All list endpoints

**Description:**
Implement cursor-based pagination for all list endpoints.

**Implementation:**
```typescript
// src/lib/pagination.ts
 export interface PaginationParams {
   cursor?: string
   limit?: number
 }

 export interface PaginatedResult<T> {
   data: T[]
   pagination: {
     nextCursor?: string
     hasMore: boolean
     count: number
   }
 }

 export async function paginateQuery<T>(
   query: any,
   params: PaginationParams,
   limit: number = 20
 ): Promise<PaginatedResult<T>> {
   const pageSize = Math.min(params.limit || limit, 100)
   const pageSizePlusOne = pageSize + 1

   let paginatedQuery = query.range(0, pageSizePlusOne - 1)

   if (params.cursor) {
     // Decode cursor and apply as offset
     const offset = decodeCursor(params.cursor)
     paginatedQuery = query.range(offset, offset + pageSizePlusOne - 1)
   }

   const { data, error } = await paginatedQuery

   if (error) {
     throw new Error(`Pagination failed: ${error.message}`)
   }

   const hasMore = data.length > pageSize
   const paginatedData = hasMore ? data.slice(0, -1) : data
   const nextCursor = hasMore ? encodeCursor(paginatedData.length) : undefined

   return {
     data: paginatedData,
     pagination: {
       nextCursor,
       hasMore,
       count: paginatedData.length,
     }
   }
 }

 export function encodeCursor(offset: number): string {
   return Buffer.from(offset.toString()).toString('base64url')
 }

 export function decodeCursor(cursor: string): number {
   return parseInt(Buffer.from(cursor, 'base64url').toString(), 10)
 }
```

**Acceptance Criteria:**
- [ ] All list endpoints support pagination
- [ ] Cursor-based pagination implemented
- [ ] Max page size enforced (100 items)
- [ ] Pagination metadata in responses
- [ ] Forward and backward pagination supported

---

## PHASE 4: CODE QUALITY REFACTORING

**Duration:** Week 7-8 (10 business days)
**Goal:** Remove all technical debt
**Dependencies:** Phase 3 complete
**Blocked By:** None

### Task 4.1: Remove All Console Statements
**Priority:** HIGH
**Severity:** Code Quality
**Effort:** 8 hours
**Files Affected:** 149 files with console.log

**Description:**
Replace all console.log/error/warn statements with proper logging.

**Implementation:**
```typescript
// BEFORE
console.log('[Auth] User logged in:', user)
console.error('[API] Request failed:', error)

// AFTER
import { logger } from '@/lib/observability/logger'

logger.info('[Auth] User logged in', { userId: user.id })
logger.error('[API] Request failed', { error, url: request.url })
```

**Systematic Replacement:**
```bash
# Find all console statements
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# Replace with logger calls
# Use structured logging with context
```

**Acceptance Criteria:**
- [ ] Zero console statements in production code
- [ ] All logging uses structured logger
- [ ] Log levels appropriate (info, warn, error)
- [ ] Sensitive data not logged
- [ ] Console statements only in development

---

### Task 4.2: Extract Magic Numbers to Constants
**Priority:** MEDIUM
**Severity:** Code Quality
**Effort:** 6 hours
**Files Affected:** 50+ files

**Description:**
Extract all magic numbers to named constants.

**Example Implementation:**
```typescript
// src/lib/constants/ai.ts
export const AI_CONFIG = {
   // Temperature settings
   DEFAULT_TEMPERATURE: 0.3,
   LOW_TEMPERATURE: 0.2,
   HIGH_TEMPERATURE: 0.7,

   // Token limits
   DEFAULT_MAX_TOKENS: 1500,
   MAX_INPUT_TOKENS: 3000,
   MAX_OUTPUT_TOKENS: 1000,

   // Timeouts
   REQUEST_TIMEOUT: 30000, // 30 seconds
   STREAM_TIMEOUT: 60000, // 60 seconds

   // Retry settings
   MAX_RETRIES: 3,
   RETRY_DELAY: 1000, // 1 second

   // Cost tracking
   GLM_INPUT_PER_1M: 1.0, // USD
   GLM_OUTPUT_PER_1M: 2.0,
   GPT4O_INPUT_PER_1M: 0.15,
   GPT4O_OUTPUT_PER_1M: 0.60,
} as const
```

**Acceptance Criteria:**
- [ ] No magic numbers in code
- [ ] All constants properly typed
- [ ] Constants organized by domain
- [ ] Documented with comments

---

### Task 4.3: Split Large Files
**Priority:** MEDIUM
**Severity:** Maintainability
**Effort:** 16 hours
**Files Affected:**
- `src/services/pharmacy-integration.ts` (2,144 lines)

**Description:**
Break down the massive pharmacy-integration.ts into focused modules.

**New Structure:**
```
src/services/pharmacy/
├── index.ts                 # Main exports
├── pharmacy-service.ts      # Main service class
├── product-catalog.ts       # Product management
├── order-processing.ts       # Order handling
├── inventory-sync.ts         # Inventory synchronization
├── pricing-calculator.ts     # Price calculations
└── types.ts                 # Shared types
```

**Acceptance Criteria:**
- [ ] No file exceeds 500 lines
- [ ] Each module has single responsibility
- [ ] Clear interfaces between modules
- [ ] Tests for each module

---

### Task 4.4: Create Authentication Middleware
**Priority:** MEDIUM
**Severity:** Code Quality (DRY)
**Effort:** 6 hours

**Description:**
Replace repeated authentication patterns with reusable middleware.

**Implementation:**
```typescript
// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface AuthenticatedRequest extends NextRequest {
   user: User
   session: Session
}

export async function withAuth(
   handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
   options?: {
     allowedRoles?: UserRole[]
     requireProfile?: boolean
   }
) {
   return async (req: NextRequest) => {
      const supabase = await createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
         return NextResponse.json(
           { error: 'Authentication required' },
           { status: 401 }
         )
      }

      if (options?.allowedRoles) {
         const { data: profile } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', session.user.id)
           .single()

         if (!profile || !options.allowedRoles.includes(profile.role as UserRole)) {
           return NextResponse.json(
             { error: 'Insufficient permissions' },
             { status: 403 }
           )
         }
      }

      // Attach user and session to request
      ;(req as AuthenticatedRequest).user = session.user
      ;(req as AuthenticatedRequest).session = session

      return handler(req as AuthenticatedRequest)
   }
}
```

**Acceptance Criteria:**
- [ ] Auth middleware created
- [ ] All protected routes use middleware
- [ ] No repeated authentication code
- [ ] Proper TypeScript types

---

## PHASE 5: TESTING ENHANCEMENT

**Duration:** Week 9-10 (10 business days)
**Goal:** 70%+ test coverage
**Dependencies:** Phase 4 complete
**Blocked By:** None

### Task 5.1: Add Authentication Flow Tests
**Priority:** CRITICAL
**Severity:** Testing Gap
**Effort:** 12 hours

**Description:**
Create comprehensive tests for all authentication flows.

**Test Coverage:**
```typescript
// src/lib/__tests__/auth-flows.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Authentication Flows', () => {
  describe('User Registration', () => {
    it('should register a new patient successfully', async () => {
       const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
       )

       const userData = {
         email: 'test@example.com',
         password: 'SecurePass123',
         fullName: 'Test User',
         phone: '+5255555555',
         role: 'patient'
       }

       const { data, error } = await supabase.auth.signUp({
         email: userData.email,
         password: userData.password,
         options: {
           data: {
             full_name: userData.fullName,
             phone: userData.phone,
             role: userData.role
           }
         }
       })

       expect(error).toBeNull()
       expect(data.user).toBeDefined()
       expect(data.user.email).toBe(userData.email)
    })

    it('should reject duplicate email registration', async () => {
       // Attempt to register with existing email
       // Expect error
    })

    it('should require password complexity', async () => {
       const weakPasswords = [
         '123',
         'password',
         'abcdefgh',
         '12345678'
       ]

       for (const password of weakPasswords) {
         const result = await registerUser({
           email: `test-${Date.now()}@example.com`,
           password
         })

         expect(result.error).toContain('password')
       }
    })
  })

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
       // Test successful login
    })

    it('should reject invalid credentials', async () => {
       // Test failed login
    })

    it('should return session token on login', async () => {
       // Test session creation
    })
  })

  describe('Password Reset', () => {
    it('should send reset email', async () => {
       // Test password reset request
    })

    it('should reset password with valid token', async () => {
       // Test password reset
    })

    it('should reject invalid reset token', async () => {
       // Test token validation
    })
  })

  describe('Session Management', () => {
    it('should refresh session token', async () => {
       // Test session refresh
    })

    it('should invalidate session on logout', async () => {
       // Test logout
    })

    it('should expire session after timeout', async () => {
       // Test session expiration
    })
  })

  describe('OAuth Integration', () => {
    it('should handle Google OAuth flow', async () => {
       // Test Google OAuth
    })

    it('should create user profile on first OAuth login', async () => {
       // Test profile creation
    })
  })
})
```

**Acceptance Criteria:**
- [ ] All auth flows have tests
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] 80%+ coverage for auth module

---

### Task 5.2: Add Payment Processing Tests
**Priority:** CRITICAL
**Severity:** Testing Gap
**Effort:** 16 hours

**Description:**
Create comprehensive tests for payment flows.

**Test Coverage:**
```typescript
// src/lib/__tests__/payment-flows.test.ts
describe('Payment Flows', () => {
  describe('Stripe Payment Intent Creation', () => {
    it('should create payment intent for appointment', async () => {
       // Test payment intent creation
    })

    it('should calculate correct amount based on doctor fee', async () => {
       // Test amount calculation
    })

    it('should handle MXN currency correctly', async () => {
       // Test MXN handling
    })

    it('should handle USD currency correctly', async () => {
       // Test USD handling
    })
  })

  describe('Webhook Handling', () => {
    it('should verify webhook signature', async () => {
       // Test signature verification
    })

    it('should handle payment_intent.succeeded', async () => {
       // Test success handling
    })

    it('should handle payment_intent.payment_failed', async () => {
       // Test failure handling
    })

    it('should handle OXXO charge.succeeded', async () => {
       // Test OXXO handling
    })

    it('should handle unknown event types gracefully', async () => {
       // Test unknown events
    })

    it('should prevent replay attacks', async () => {
       // Test idempotency
    })
  })

  describe('Refunds', () => {
    it('should process full refund', async () => {
       // Test refund
    })

    it('should reject refund for unpaid appointment', async () => {
       // Test validation
    })

    it('should update appointment status after refund', async () => {
       // Test status update
    })
  })

  describe('Payment Confirmation', () => {
    it('should confirm appointment after payment', async () => {
       // Test confirmation
    })

    it('should send confirmation email', async () => {
       // Test email sending
    })

    it('should send WhatsApp notification', async () => {
       // Test WhatsApp
    })
  })
})
```

**Acceptance Criteria:**
- [ ] All payment flows tested
- [ ] Webhook scenarios covered
- [ ] Edge cases handled
- [ ] Security scenarios tested
- [ ] Mock Stripe API used

---

### Task 5.3: Add Emergency Detection Tests
**Priority:** CRITICAL
**Severity:** Life-Critical System
**Effort:** 10 hours

**Description:**
Create comprehensive tests for emergency detection system.

**Test Coverage:**
```typescript
// src/lib/__tests__/emergency-detection.test.ts
describe('Emergency Detection System', () => {
  describe('Cardiac Emergencies', () => {
    const cardiacPatterns = [
      { input: 'Me duele mucho en el pecho', expected: true },
      { input: 'I have severe chest pain', expected: true },
      { input: 'Siento una opresión en el pecho', expected: true },
      { input: 'Dolor torácico intenso', expected: true },
      { input: 'Creo que es un infarto', expected: true },
      { input: 'Me duele un poco el pecho', expected: false }, // Not severe
      { input: 'Tengo comezón en el pecho', expected: false }, // Itching
    ]

    cardiacPatterns.forEach(({ input, expected }) => {
      it(`should${expected ? '' : ' not'} detect emergency in: "${input}"`, () => {
        const result = detectEmergency(input)
        expect(result.isEmergency).toBe(expected)
        if (expected) {
          expect(result.category).toBe('cardiac')
        }
      })
    })
  })

  describe('Stroke Detection', () => {
    it('should detect FAST symptoms', () => {
       const strokeMessage = 'No puedo mover mi brazo derecho y tengo la cara caída'
       const result = detectEmergency(strokeMessage)

       expect(result.isEmergency).toBe(true)
       expect(result.category).toBe('stroke')
       expect(result.urgency).toBe('critical')
    })

    it('should detect slurred speech', () => {
       const result = detectEmergency('No puedo hablar bien, me arrastro las palabras')
       expect(result.isEmergency).toBe(true)
    })
  })

  describe('Suicidal Ideation', () => {
    it('should detect direct suicidal statements', () => {
       const result = detectEmergency('Quiero terminar con mi vida')
       expect(result.isEmergency).toBe(true)
       expect(result.action).toBe('CRISIS_LINE')
    })

    it('should provide crisis resources', () => {
       const result = detectEmergency('Estoy pensando en suicidarme')
       expect(result.resources).toBeDefined()
       expect(result.resources?.hotline).toBeDefined()
    })
  })

  describe('False Positive Prevention', () => {
    it('should not flag mild symptoms', () => {
       const nonEmergency = [
         'Me duele un poco la cabeza',
         'Tengo dolor de garganta leve',
         'Me siento un poco cansado',
       ]

       nonEmergency.forEach(input => {
         const result = detectEmergency(input)
         expect(result.isEmergency).toBe(false)
       })
    })

    it('should require severity indicators for certain symptoms', () => {
       const severe = detectEmergency('Dolor de cabeza') // No severity
       expect(severe.isEmergency).toBe(false)

       const severeWithIndicator = detectEmergency('El peor dolor de cabeza de mi vida')
       expect(severeWithIndicator.isEmergency).toBe(true)
    })
  })

  describe('Bilingual Detection', () => {
    const bilingualTests = [
       { spanish: 'No puedo respirar', english: "I can't breathe", category: 'respiratory' },
       { spanish: 'Dolor de pecho', english: 'Chest pain', category: 'cardiac' },
       { spanish: 'No puedo hablar', english: 'Speech slurred', category: 'stroke' },
     ]

     bilingualTests.forEach(({ spanish, english, category }) => {
       it(`should detect "${category}" in both Spanish and English`, () => {
         const spanishResult = detectEmergency(spanish)
         const englishResult = detectEmergency(english)

         expect(spanishResult.isEmergency).toBe(true)
         expect(englishResult.isEmergency).toBe(true)
         expect(spanishResult.category).toBe(category)
         expect(englishResult.category).toBe(category)
       })
     })
  })

  describe('Context-Aware Detection', () => {
     it('should consider patient history', () => {
       const message = 'Me duele el pecho'
       const history = { knownCondition: 'anxiety' }

       const result = detectEmergencyWithContext(message, history)

       // With anxiety history, chest pain less likely to be cardiac emergency
       expect(result.confidence).toBeLessThan(0.8)
     })
  })

  describe('Performance', () => {
     it('should detect emergencies in under 10ms', () => {
       const start = performance.now()

       for (let i = 0; i < 1000; i++) {
         detectEmergency('Me duele mucho el pecho y no puedo respirar')
       }

       const elapsed = performance.now() - start
       const avgTime = elapsed / 1000

       expect(avgTime).toBeLessThan(10) // Sub-10ms detection
     })
  })
})
```

**Acceptance Criteria:**
- [ ] All emergency patterns have tests
- [ ] Spanish and English patterns tested
- [ ] False positive tests included
- [ ] Performance benchmarks met
- [ ] Context-aware detection tested
- [ ] Edge cases covered

---

### Task 5.4: Add E2E Tests for Critical Flows
**Priority:** HIGH
**Severity:** Testing Gap
**Effort:** 20 hours

**Description:**
Create Playwright E2E tests for critical user journeys.

**Critical Flows to Test:**
1. Patient registration and login
2. Doctor search and booking
3. Video consultation flow
4. Prescription creation
5. Payment processing
6. Emergency triage

**Example E2E Test:**
```typescript
// tests/e2e/appointment-booking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Appointment Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as patient
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'patient@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/patient')
  })

  test('should complete full booking flow', async ({ page }) => {
    // 1. Search for doctors
    await page.goto('/doctors')
    await page.selectOption('select[name="specialty"]', 'cardiología')
    await page.click('button[aria-label="Buscar"]')

    // 2. Select a doctor
    await page.click('.doctor-card:first-child')
    await page.waitForURL('/doctors/*')

    // 3. Click book appointment
    await page.click('button:has-text("Agendar Cita")')

    // 4. Select date and time
    await page.click('.available-slot:first-child')
    await page.click('button:has-text("Continuar")')

    // 5. Provide reason
    await page.fill('textarea[name="reason"]', 'Dolor de pecho recurrente')
    await page.click('button:has-text("Continuar")')

    // 6. Select consultation type
    await page.click('button[value="video"]')
    await page.click('button:has-text("Confirmar")')

    // 7. Payment (test mode)
    await page.waitForURL('/checkout/*')
    await page.click('button:has-text("Pagar")')

    // 8. Confirmation
    await page.waitForSelector('text=¡Cita confirmada!')
    await expect(page.locator('.appointment-confirmation')).toBeVisible()

    // 9. Verify appointment details
    await expect(page.locator('.confirmation-details')).toContainText('Cardiología')
    await expect(page.locator('.confirmation-details')).toContainText('Video consulta')
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/doctors/cardiologia/cdmx')
    await page.click('button:has-text("Agendar Cita")')

    // Try to continue without selecting a time
    await page.click('button:has-text("Continuar")')

    // Should show validation error
    await expect(page.locator('text=Selecciona un horario')).toBeVisible()
  })

  test('should handle payment failure gracefully', async ({ page }) => {
    // Go through booking flow but cancel payment
    // Verify appointment is not confirmed
    // Verify user can retry payment
  })
})

test.describe('Emergency Triage Flow', () => {
  test('should detect cardiac emergency and show alert', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Consulta IA')

    const aiInput = page.locator('textarea[placeholder*="Describe"]')
    await aiInput.fill('Me duele mucho el pecho y no puedo respirar')

    await page.click('button:has-text("Enviar")')

    // Should show emergency alert
    await expect(page.locator('.emergency-alert')).toBeVisible()
    await expect(page.locator('text=Llamar al 911')).toBeVisible()

    // Should not continue normal AI flow
    await expect(page.locator('textarea[placeholder*="Describe"]')).toBeDisabled()
  })

  test('should route to emergency services', async ({ page }) => {
    await page.goto('/')

    // Enter emergency symptoms
    await page.click('text=Consulta IA')
    await page.fill('textarea', 'Creo que estoy teniendo un ataque al corazón')
    await page.click('button:has-text("Enviar")')

    // Verify emergency routing
    await expect(page.locator('.emergency-modal')).toBeVisible()
    await expect(page.locator('a[href="tel:911"]')).toBeVisible()
  })
})
```

**Acceptance Criteria:**
- [ ] All critical user flows have E2E tests
- [ ] Tests run in CI/CD pipeline
- [ ] Tests stable (no flakiness)
- [ ] Screenshots on failure
- [ ] Video recording enabled

---

## PHASE 6: UX/DX IMPROVEMENTS

**Duration:** Week 11 (5 business days)
**Goal:** Excellent user and developer experience
**Dependencies:** Phase 5 complete
**Blocked By:** None

### Task 6.1: Add Loading States
**Priority:** HIGH
**Severity:** User Experience
**Effort:** 8 hours

**Description:**
Add proper loading states to all async operations.

**Implementation:**
```typescript
// src/components/LoadingState.tsx
import { Loader2 } from './ui/loader'

interface LoadingStateProps {
  loading: boolean
  children: React.ReactNode
  variant?: 'spinner' | 'skeleton' | 'inline'
  text?: string
}

export function LoadingState({
  loading,
  children,
  variant = 'spinner',
  text
}: LoadingStateProps) {
  if (!loading) {
    return <>{children}</>
  }

  if (variant === 'skeleton') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {text && <span className="text-sm text-muted">{text}</span>}
      </span>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
    </div>
  )
}

// Usage in components
export function DoctorList() {
  const { doctors, loading, error } = useDoctors()

  return (
    <LoadingState loading={loading} text="Cargando doctores...">
      {doctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
    </LoadingState>
  )
}
```

**Acceptance Criteria:**
- [ ] All async operations have loading states
- [ ] Loading states are visually consistent
- [ ] Skeleton screens for list loading
- [ ] Inline loading for button actions
- [ ] Loading states accessible (ARIA)

---

### Task 6.2: Add ARIA Labels
**Priority:** HIGH
**Severity:** Accessibility (WCAG 2.1 AA)
**Effort:** 6 hours

**Description:**
Add comprehensive ARIA labels to all interactive elements.

**Implementation:**
```typescript
// BEFORE
<button onClick={handleSearch}>Buscar</button>
<input type="text" onChange={handleChange} />

// AFTER
<button
  onClick={handleSearch}
  aria-label="Buscar doctores por especialidad"
>
  Buscar
</button>
<input
  type="text"
  onChange={handleChange}
  aria-label="Campo de búsqueda"
  aria-describedby="search-instructions"
/>
<span id="search-instructions" className="sr-only">
  Ingresa la especialidad médica que buscas
</span>
```

**Acceptance Criteria:**
- [ ] All buttons have aria-label
- [ ] All form inputs have aria-label
- [ ] Icon-only buttons have descriptive labels
- [ ] Dynamic content has aria-live regions
- [ ] Modal dialogs have proper ARIA

---

### Task 6.3: Implement Keyboard Navigation
**Priority:** MEDIUM
**Severity:** Accessibility
**Effort:** 10 hours

**Description:**
Ensure full keyboard navigation support throughout the application.

**Implementation:**
```typescript
// src/hooks/useKeyboardNavigation.ts
import { useEffect } from 'react'

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  selectors: string[]
) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus trap for modals
      if (e.key === 'Tab') {
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }

      // Escape to close
      if (e.key === 'Escape') {
        // Emit close event
        container.dispatchEvent(new CustomEvent('close'))
      }

      // Arrow keys for lists
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const focusable = container.querySelectorAll(selectors.join(','))
        const currentIndex = Array.from(focusable).indexOf(document.activeElement)

        if (e.key === 'ArrowDown') {
          const nextIndex = (currentIndex + 1) % focusable.length
          ;(focusable[nextIndex] as HTMLElement).focus()
        } else {
          const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1
          ;(focusable[prevIndex] as HTMLElement).focus()
        }

        e.preventDefault()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef, selectors])
}
```

**Acceptance Criteria:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus trap in modals
- [ ] Skip links implemented
- [ ] Visual focus indicators
- [ ] No keyboard traps

---

## QUALITY GATES & ACCEPTANCE CRITERIA

### Phase Completion Criteria

Each phase must meet these criteria before proceeding:

#### Phase 0: Security
- [ ] All critical vulnerabilities resolved
- [ ] Security audit passes (no critical/high issues)
- [ ] Penetration testing completed
- [ ] API keys rotated
- [ ] Rate limiting active
- [ ] Webhook signatures verified

#### Phase 1: Documentation
- [ ] README.md complete
- [ ] Emergency detection documented
- [ ] API documentation published
- [ ] Mexico compliance docs complete
- [ ] All documented files peer-reviewed
- [ ] Documentation accessible to team

#### Phase 2: Type Safety
- [ ] Zero `any` types
- [ ] TypeScript compilation with strict mode
- [ ] No type assertions (or documented)
- [ ] 100% test coverage for type errors
- [ ] No implicit any

#### Phase 3: Performance
- [ ] All N+1 queries eliminated
- [ ] Database indexes in place
- [ ] API response times < 500ms (p95)
- [ ] Frontend load time < 3s
- [ ] Cache hit rate > 80%
- [ ] Pagination implemented

#### Phase 4: Code Quality
- [ ] Zero console.log in production code
- [ ] No files exceed 500 lines
- [ ] Code review approved
- [ ] Technical debt < 5 days
- [ ] No code duplication

#### Phase 5: Testing
- [ ] Test coverage > 70%
- [ ] All critical flows tested
- [ ] E2E tests passing
- [ ] No flaky tests
- [ ] Performance benchmarks passing

#### Phase 6: UX/DX
- [ ] All loading states implemented
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation working
- [ ] Error messages user-friendly
- [ ] Onboarding documentation complete

---

## RISK REGISTER

| ID | Risk | Impact | Probability | Mitigation | Owner |
|----|------|--------|------------|-----------|-------|
| R001 | API key exposure during Phase 0 | Critical | Low | Rotate keys immediately, use secrets manager | User |
| R002 | Breaking changes in refactoring | High | Medium | Feature flags, gradual rollout | Tech Lead |
| R003 | Database migration failure | Critical | Low | Backup before migration, rollback plan | DBA |
| R004 | Test flakiness in CI/CD | Medium | Medium | Fix test environment, retry logic | QA |
| R005 | Performance regression | High | Low | Performance benchmarks, monitoring | Perf Lead |
| R006 | Compliance gaps discovered | Critical | Medium | Legal review, gap analysis | Compliance |
| R007 | Developer onboarding delays | Low | High | Quick start guide, mentorship | Tech Lead |

---

## RESOURCE REQUIREMENTS

### Team Composition

| Role | FTE | Skills Required |
|------|-----|-----------------|
| Senior Backend Developer | 1 | Node.js, PostgreSQL, Supabase, Security |
| Senior Frontend Developer | 1 | React, TypeScript, Next.js, Accessibility |
| Full Stack Developer | 1 | Full stack, testing, CI/CD |
| QA Engineer | 1 | Testing frameworks, E2E, security testing |
| DevOps Engineer | 0.5 | Vercel, CI/CD, monitoring |
| Technical Writer | 0.5 | Documentation, API specs |
| **Total** | **4 FTE** | |

### Tools & Services

| Tool | Purpose | Cost |
|------|---------|------|
| Upstash Redis | Caching, rate limiting | $10/mo |
| Sentry | Error monitoring | $25/mo |
| Vercel | Hosting | Included in plan |
| Playwright | E2E testing | Free (CI) |
| GitHub Actions | CI/CD | Free |
| Swagger UI | API documentation | Free |

### Timeline Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| 1 | Security Hardening | All critical security issues resolved |
| 2-3 | Documentation | Complete documentation suite |
| 4 | Type Safety | Zero `any` types, proper error handling |
| 5-6 | Performance | Caching, indexes, optimization |
| 7-8 | Code Quality | Technical debt eliminated |
| 9-10 | Testing | 70%+ coverage, E2E tests |
| 11 | UX/DX | Accessibility, polish |
| 12 | Infrastructure | CI/CD, monitoring |
| 13 | Final Polish | Validation, deployment |

---

## COUNCIL FEEDBACK REQUEST

This execution plan is submitted for your expert review. Please evaluate:

### 1. Completeness
- What critical tasks have we missed?
- Are there gaps in the testing strategy?
- Have we addressed all audit findings?

### 2. Prioritization
- Is the phase ordering optimal?
- Should any tasks be moved between phases?
- Are we tackling the right problems first?

### 3. Feasibility
- Are effort estimates realistic?
- Is 13 weeks timeline achievable?
- Do we have the right resources?

### 4. Quality
- Are acceptance criteria sufficient?
- What additional quality gates are needed?
- Are there edge cases not considered?

### 5. Mexico-Specific Considerations
- Are all compliance requirements addressed?
- Are cultural considerations incorporated?
- Is the Spanish-language support complete?

### 6. Technical Approach
- Are the implementation strategies sound?
- Should we use different technologies/approaches?
- Are there better patterns we should follow?

---

**Please provide your feedback by:**
1. Adding inline comments to this document
2. Creating issues in GitHub for major concerns
3. Meeting to discuss critical feedback

**We will NOT proceed with implementation until Council has reviewed and approved this plan.**

Quality over speed. Excellence over completion.

---

**Document Status:** DRAFT - Awaiting Council Review
**Next Review Date:** TBD
**Contact:** tech@doctormx.com
