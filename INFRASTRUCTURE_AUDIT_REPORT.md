# DoctorMX Infrastructure & Database Audit Report
**Date:** 2026-01-28  
**Auditor:** DevOps & Database Expert  
**Application:** DoctorMX - AI-Powered Healthcare Platform  
**Stack:** Next.js + TypeScript + Supabase + Netlify

---

## Executive Summary

This is a **CRITICAL READINESS ASSESSMENT** for the DoctorMX healthcare application. Multiple **CRITICAL SECURITY ISSUES** have been identified that MUST be resolved before production launch. The application handles sensitive PHI (Protected Health Information) and processes payments, requiring strict compliance and security measures.

### Risk Assessment: 🔴 HIGH RISK

| Category | Status | Risk Level |
|----------|--------|------------|
| Database Security | ⚠️ Partial | Medium |
| Environment Secrets | 🔴 Exposed | **CRITICAL** |
| API Security | 🔴 Compromised | **CRITICAL** |
| Compliance (HIPAA/GDPR) | 🔴 Non-compliant | **CRITICAL** |
| Backup/DR | 🔴 Missing | **CRITICAL** |
| Monitoring | 🟡 Partial | Medium |
| Rate Limiting | 🟢 Implemented | Low |

---

## 1. 🔴 CRITICAL ISSUES - MUST FIX BEFORE LAUNCH

### 1.1 EXPOSED API KEYS & SECRETS - CRITICAL

**Issue:** Production API keys and credentials are committed to source control.

**Files Affected:**
- `.env` (lines 1-4): Contains hardcoded OpenAI API key (`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`)
- `.env.local` (lines 1-22): Contains full Supabase credentials and Redis URL with password
- `netlify/functions/standard-model.js` (lines 47-51): Hardcoded fallback API keys
- `.env.example`: Shows correct structure but real values exist in committed files

**Security Impact:**
- OpenAI API key exposed: Potential for unauthorized usage and billing abuse
- Supabase credentials exposed: Full database access possible
- Redis credentials exposed: Cache poisoning and data breach risk

**Immediate Actions:**
```bash
# 1. Rotate ALL exposed keys immediately
# OpenAI Dashboard: https://platform.openai.com/api-keys
# Supabase Dashboard: Settings > API > New API Key
# Redis Labs: Security > Rotate Password

# 2. Remove from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*" >> .gitignore

# 4. Force push (coordination required with team)
git push origin --force --all
```

### 1.2 HARDCODED FALLBACK CREDENTIALS IN NETLIFY FUNCTIONS - CRITICAL

**File:** `netlify/functions/standard-model.js`

**Issues:**
- Lines 47-48: Hardcoded Supabase URL and anon key as fallbacks
- Line 51: Hardcoded OpenAI API key as fallback (`FALLBACK_KEY`)
- Lines 54-68: Extensive console logging of API key details
- Line 110: CORS header allows any origin (`'*'`)

**Code Section:**
```javascript
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const FALLBACK_KEY = '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';
```

**Fix Required:**
```javascript
// Remove all fallback values - fail securely
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseAnonKey || !openaiKey) {
  throw new Error('Required environment variables not configured');
}

// Remove all console.log statements with API key info
// Replace with proper logger that redacts sensitive data
```

### 1.3 CORS MISCONFIGURATION - CRITICAL

**File:** `netlify/functions/standard-model.js` (line 110)

```javascript
'Access-Control-Allow-Origin': '*', // Allow any origin - restrict this in production
```

**Fix:**
```javascript
const allowedOrigins = [
  'https://doctormx.com',
  'https://www.doctormx.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean);

const origin = event.headers.origin;
const headers = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};
```

### 1.4 HIPAA COMPLIANCE GAPS - CRITICAL

**Missing HIPAA Requirements:**

1. **No Business Associate Agreement (BAA) Documentation**
   - Supabase BAA status unclear
   - OpenAI BAA not configured
   - Stripe BAA not confirmed

2. **No Data Encryption at Rest Documentation**
   - Supabase has encryption but no configuration evidence
   - No field-level encryption for PHI

3. **No Access Audit Logs**
   - No table for tracking data access
   - No login/logout audit trail

4. **No Data Retention Policy**
   - No automatic data purging
   - No patient data deletion mechanism

5. **Missing HIPAA-Required Fields:**
   - No encryption key rotation tracking
   - No security incident tracking

**Required New Tables:**
```sql
-- Audit logging for HIPAA compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention tracking
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  auto_purge BOOLEAN DEFAULT false,
  last_purge_at TIMESTAMPTZ
);
```

### 1.5 GDPR COMPLIANCE GAPS - CRITICAL

**Missing:**
- No data processing consent tracking
- No right-to-be-forgotten implementation
- No data portability mechanism
- No privacy policy confirmation tracking
- No cookie consent mechanism

**Required:**
```sql
-- User consent tracking
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  consent_type TEXT NOT NULL, -- 'privacy_policy', 'data_processing', 'marketing'
  version TEXT NOT NULL,
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE(user_id, consent_type, version)
);
```

---

## 2. 🟠 IMPORTANT INFRASTRUCTURE IMPROVEMENTS

### 2.1 Missing Database Indexes

**Current indexes are basic. Add these for production performance:**

```sql
-- Composite indexes for common queries
CREATE INDEX idx_appointments_doctor_status ON appointments(doctor_id, status);
CREATE INDEX idx_appointments_patient_status ON appointments(patient_id, status);
CREATE INDEX idx_appointments_date_range ON appointments(start_ts, end_ts);

-- Full-text search for doctor search
CREATE INDEX idx_doctors_search ON doctors USING gin(
  to_tsvector('spanish', coalesce(bio, '') || ' ' || coalesce(city, ''))
);

-- Partial index for active subscriptions
CREATE INDEX idx_doctor_subscriptions_active ON doctor_subscriptions(doctor_id) 
WHERE status = 'active';

-- Index for recent consultations
CREATE INDEX idx_soap_consultations_recent ON soap_consultations(created_at DESC) 
WHERE status NOT IN ('archived', 'error');
```

### 2.2 Database Constraints Missing

**File:** `supabase/migrations/001_complete_schema.sql`

**Missing Constraints:**
```sql
-- Price validation
ALTER TABLE doctors ADD CONSTRAINT check_price_positive 
  CHECK (price_cents > 0);

-- Rating bounds
ALTER TABLE doctors ADD CONSTRAINT check_rating_range 
  CHECK (rating_avg >= 0 AND rating_avg <= 5);

-- Phone format validation (Mexican numbers)
ALTER TABLE profiles ADD CONSTRAINT check_phone_format 
  CHECK (phone ~ '^\+?\d{10,15}$');

-- Date validations
ALTER TABLE appointments ADD CONSTRAINT check_appointment_future 
  CHECK (start_ts > created_at);

-- Email validation at application level (not DB constraint due to auth.users)
```

### 2.3 Connection Pooling Not Configured

**Issue:** No evidence of Supabase connection pooling configuration.

**Fix for `src/lib/supabase/server.ts`:**
```typescript
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      db: {
        schema: 'public',
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        // Add request timeout
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000), // 10 second timeout
          })
        },
      },
      cookies: {
        // ... existing cookie config
      },
    }
  )
}
```

### 2.4 Redis Configuration Incomplete

**File:** `src/lib/cache.ts`

**Issue:** Falls back to in-memory cache in production if Redis unavailable - dangerous for multi-instance deployments.

**Fix:**
```typescript
// Fail in production if Redis not configured
if (!isRedisConfigured && process.env.NODE_ENV === 'production') {
  throw new Error(
    'Redis is required in production. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
  )
}
```

### 2.5 Missing Health Check Endpoint

**Add to API routes:**
```typescript
// src/app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/cache'

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  }
  
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('profiles').select('id').limit(1)
    checks.database = true
  } catch (e) {
    // Database check failed
  }
  
  try {
    if (redis) {
      await redis.ping()
      checks.redis = true
    }
  } catch (e) {
    // Redis check failed
  }
  
  const status = checks.database ? 200 : 503
  return Response.json(checks, { status })
}
```

---

## 3. 🔵 COMPLIANCE GAPS

### 3.1 Terms of Service / Privacy Policy

**Status:** No evidence of legal documents

**Required Files:**
- `/public/privacy-policy.html`
- `/public/terms-of-service.html`
- `/public/cookies-policy.html`

**Minimum Content for Privacy Policy (GDPR + HIPAA):**
- Data controller information
- Types of health data collected
- Legal basis for processing (consent + contract)
- Data retention periods
- Third-party processors (Supabase, OpenAI, Stripe)
- User rights (access, rectification, erasure, portability)
- Contact for data protection inquiries
- Breach notification procedures

### 3.2 Cookie Consent Banner

**Missing:** GDPR-compliant cookie consent mechanism

**Required for:**
- Analytics cookies
- Authentication cookies
- Preference cookies

### 3.3 Data Processing Agreement Evidence

**Required Documentation:**
- Signed BAA with Supabase
- Signed BAA with OpenAI (Enterprise/Healthcare plan)
- DPA with Netlify
- DPA with Stripe

---

## 4. 🟡 MONITORING & OBSERVABILITY

### 4.1 Sentry Configuration Partial

**Current Status:**
- ✅ Sentry SDK installed
- ✅ Sentry config file exists (`src/sentry.config.ts`)
- ⚠️ Auth token in `.sentryclirc` (should be env var)
- ❌ Missing Sentry DSN in environment
- ❌ No performance monitoring for database queries

**Required in `.env.local`:**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx  # Move from .sentryclirc
SENTRY_ORG=fyves
SENTRY_PROJECT=doctormx
```

### 4.2 Structured Logging Good but Incomplete

**File:** `src/lib/observability/logger.ts`

**Strengths:**
- ✅ JSON formatting for production
- ✅ Context support
- ✅ Timing support

**Gaps:**
- No log shipping to external system
- No log rotation strategy
- No PII redaction

### 4.3 Missing Application Metrics

**File:** `src/lib/observability/metrics.ts`

**Should add:**
- Active users gauge
- Appointment booking rate
- AI consultation success rate
- Payment failure rate
- API response time histograms

### 4.4 No Alerting Configuration

**Missing:**
- Error rate alerts (Sentry)
- Database connection alerts
- API latency alerts
- Payment failure alerts

---

## 5. 🔴 BACKUP & DISASTER RECOVERY

### 5.1 No Backup Strategy Documented

**Critical Gaps:**
- No automated backup schedule
- No backup retention policy
- No restore testing procedure
- No disaster recovery runbook

**Required Supabase Configuration:**
```sql
-- Enable Point-in-Time Recovery (PITR)
-- This is done in Supabase Dashboard > Database > Backups
-- Cost: ~$11/month for projects > 4GB

-- Document backup schedule
-- Recommended: Daily automated backups + PITR
```

### 5.2 No Database Migration Rollback Strategy

**Issue:** Migrations in `supabase/migrations/` have no rollback scripts.

**Required:**
Create `supabase/migrations/rollback/` directory with:
- `rollback_001_complete_schema.sql`
- `rollback_002_soap_consultations.sql`
- etc.

### 5.3 Missing Disaster Recovery Plan

**Required Document:** `DISASTER_RECOVERY.md`

```markdown
# Disaster Recovery Plan

## RPO (Recovery Point Objective): 1 hour
## RTO (Recovery Time Objective): 4 hours

## Scenarios:

### 1. Database Corruption
1. Pause application (maintenance mode)
2. Restore from latest backup
3. Replay WAL logs to point before corruption
4. Verify data integrity
5. Resume application

### 2. Supabase Outage
1. Switch to read-only mode
2. Enable maintenance page
3. Contact Supabase support
4. If extended (>2hrs), consider failover to backup project

### 3. Complete Region Failure
1. Activate DR region (us-east-1)
2. Update DNS to DR endpoint
3. Restore database from cross-region backup
4. Notify users of degraded service
```

---

## 6. 🟢 PRODUCTION CHECKLIST - PARTIALLY COMPLETE

### 6.1 SSL/HTTPS - ✅ Configured

**File:** `next.config.ts` (lines 44-72)

Security headers are well configured:
- X-Frame-Options: DENY ✅
- X-Content-Type-Options: nosniff ✅
- Referrer-Policy: strict-origin-when-cross-origin ✅
- X-XSS-Protection: 1; mode=block ✅
- Permissions-Policy for camera/microphone/geolocation ✅

**Missing:**
```typescript
// Add HSTS header
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains; preload',
}
```

### 6.2 Rate Limiting - ✅ Implemented

**File:** `src/lib/rate-limit.ts` and `src/lib/cache.ts`

Well implemented with Redis-backed rate limiting:
- AI endpoints: 10 req/min ✅
- Auth endpoints: 5 req/min ✅
- Chat: 20 req/min ✅
- General: 100 req/min ✅

### 6.3 Domain Configuration - ❌ Missing

**No evidence of:**
- Custom domain setup (doctormx.com)
- DNS configuration
- CDN (Cloudflare) setup

**Recommended:**
```
doctormx.com        A record → Netlify Load Balancer
www.doctormx.com    CNAME → doctormx.netlify.app
api.doctormx.com    CNAME → [if using separate API]
```

### 6.4 DDoS Protection - ❌ Missing

**Recommendations:**
- Enable Cloudflare (free plan sufficient for start)
- Configure Netlify DDoS protection
- Add rate limiting at edge

### 6.5 Build Configuration - ✅ Good

**File:** `next.config.ts`

```typescript
output: 'standalone', // ✅ Good for containerization
images: {
  remotePatterns: [...], // ✅ Well configured
  minimumCacheTTL: 31536000, // ✅ 1 year cache
}
```

---

## 7. 📋 SPECIFIC FILES REQUIRING ATTENTION

### High Priority (Fix Immediately)

| File | Issue | Priority |
|------|-------|----------|
| `.env` | OpenAI key exposed | 🔴 CRITICAL |
| `.env.local` | All credentials exposed | 🔴 CRITICAL |
| `netlify/functions/standard-model.js` | Hardcoded keys + CORS | 🔴 CRITICAL |
| `.sentryclirc` | Auth token in file | 🔴 CRITICAL |
| `CREDENTIALS.md` | Test credentials documented | 🟠 HIGH |
| `TEST_CREDENTIALS.md` | Stripe test keys partial | 🟠 HIGH |

### Medium Priority (Fix Before Launch)

| File | Issue | Priority |
|------|-------|----------|
| `supabase/migrations/001_complete_schema.sql` | Missing indexes | 🟠 HIGH |
| `src/lib/cache.ts` | In-memory fallback in prod | 🟠 HIGH |
| `next.config.ts` | Missing HSTS header | 🟡 MEDIUM |
| `netlify.toml` | Missing security headers | 🟡 MEDIUM |

### Lower Priority (Post-Launch)

| File | Issue | Priority |
|------|-------|----------|
| Multiple | Console.log statements | 🟢 LOW |
| `src/lib/observability/logger.ts` | No external log shipping | 🟢 LOW |
| Various | TODO/FIXME comments | 🟢 LOW |

---

## 8. 🎯 RECOMMENDED ACTION PLAN

### Week 1: Security Lockdown (BLOCK LAUNCH IF NOT COMPLETE)

- [ ] Rotate ALL exposed API keys
- [ ] Remove `.env` and `.env.local` from git history
- [ ] Fix `standard-model.js` hardcoded credentials
- [ ] Implement secure CORS configuration
- [ ] Move Sentry token to environment variable
- [ ] Add pre-commit hooks to prevent secret commits (husky + detect-secrets)

### Week 2: Compliance Foundation

- [ ] Draft Privacy Policy (GDPR + HIPAA compliant)
- [ ] Draft Terms of Service
- [ ] Implement cookie consent banner
- [ ] Create user consent tracking table
- [ ] Document BAA status with all vendors
- [ ] Add audit logging table

### Week 3: Production Hardening

- [ ] Add missing database indexes
- [ ] Add database constraints
- [ ] Implement health check endpoint
- [ ] Configure Supabase PITR backups
- [ ] Create migration rollback scripts
- [ ] Set up custom domain + SSL

### Week 4: Monitoring & Observability

- [ ] Configure Sentry with proper DSN
- [ ] Set up error alerting
- [ ] Implement application metrics
- [ ] Create monitoring dashboard
- [ ] Write disaster recovery runbook

---

## 9. 📊 COMPLIANCE CHECKLIST

### HIPAA Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Access Controls | ⚠️ Partial | RLS enabled, need audit logs |
| Audit Controls | 🔴 Missing | No audit_logs table |
| Integrity Controls | ⚠️ Partial | RLS policies, need checksums |
| Transmission Security | 🟢 Yes | HTTPS enforced |
| Data Backup | 🔴 Missing | No documented strategy |
| Data Retention | 🔴 Missing | No retention policy |
| BAA with Vendors | ❓ Unknown | Needs verification |

### GDPR Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Consent Management | 🔴 Missing | No consent tracking |
| Right to Access | ⚠️ Partial | Can view data, no formal process |
| Right to Erasure | 🔴 Missing | No deletion mechanism |
| Data Portability | 🔴 Missing | No export feature |
| Privacy Policy | 🔴 Missing | No document |
| Cookie Consent | 🔴 Missing | No banner |
| Data Processing Records | 🔴 Missing | No documentation |

---

## 10. 💰 COST IMPLICATIONS

### Required Additional Spend

| Item | Monthly Cost | Justification |
|------|--------------|---------------|
| Supabase PITR | ~$11 | Required for HIPAA/data protection |
| Cloudflare Pro | $20 | DDoS protection + security |
| Sentry Teams | $26 | Error tracking + performance |
| OpenAI Enterprise | Custom | HIPAA BAA requirement |
| Legal Review | One-time | Privacy policy, TOS drafting |

### Estimated Total Additional Monthly Cost: ~$57+ USD

---

## CONCLUSION

**The DoctorMX application CANNOT be launched to production in its current state due to critical security vulnerabilities and compliance gaps.**

### Summary of Critical Issues:

1. **Exposed API Keys** - Immediate credential rotation required
2. **No HIPAA Compliance Framework** - Healthcare data without proper safeguards
3. **No GDPR Compliance** - European users cannot be served legally
4. **No Backup/DR Strategy** - Risk of permanent data loss
5. **Incomplete Monitoring** - No visibility into production issues

### Estimated Time to Production Readiness: 3-4 weeks

With dedicated effort addressing the critical and high-priority items, the application could be production-ready within 3-4 weeks.

---

**Report Prepared By:** DevOps & Database Audit  
**Date:** 2026-01-28  
**Next Review:** After critical issues resolved
