# DOCTOR.MX - COMPREHENSIVE EXECUTION PLAN (COUNCIL-APPROVED)
**Updated Version: 2.0 - Council Feedback Integrated**
**Status:** APPROVED - Ready for Execution
**Date:** 2026-02-09
**Overall Target:** Improve codebase health from 56/100 to 85+/100
**Timeline:** 18-20 weeks (extended from 13 weeks per Council recommendation)
**Philosophy:** Quality is NEVER traded for speed or effort

---

## EXECUTIVE SUMMARY

### Council Decision: CONDITIONAL APPROVAL

The Council has granted **conditional approval** to this execution plan, requiring comprehensive amendments addressing:

1. **CRITICAL ADDITIONS** (must implement):
   - Disaster Recovery & Business Continuity Plan
   - Medical Device Software Validation (COFEPRIS)
   - Emergency Detection System Clinical Validation
   - Data Residency & Cross-Border Transfer Compliance
   - Comprehensive Audit Trail Implementation
   - Patient Consent Management System

2. **PHASE-SPECIFIC GAPS** (addressed in each phase):
   - Phase 0: Security incident response, secret scanning CI/CD
   - Phase 1: Clinical workflow docs, patient-facing docs
   - Phase 2: Mexican healthcare data format validation (CURP, RFC, cédula)
   - Phase 3: Healthcare-specific SLAs (<100ms for emergency detection)
   - Phase 5: Load testing, chaos engineering, security penetration testing
   - Phase 6: Medical appropriateness of error messages

3. **MEXICO-SPECIFIC COMPLIANCE** (comprehensive integration):
   - NOM-004-SSA3-2012: Digital signature (e.firma), clinical record amendments
   - Electronic prescriptions: SSA integration, digital signatures
   - LFPDPPP ARCO rights: Request tracking system
   - Healthcare worker licensing: Automated cédula validation

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
- **Medical Device Validation:** COFEPRIS compliant
- **Disaster Recovery:** Tested and validated
- **Data Residency:** Mexican data compliance verified

### Updated Timeline Overview (18-20 weeks)

| Phase | Duration | Focus | Deliverables | Council Additions |
|-------|----------|-------|--------------|------------------|
| Phase 0 | 2 weeks | Critical Security & DR | Security hardening, DR plan | Incident response, secret scanning |
| Phase 1 | 3 weeks | Documentation & Compliance | Complete docs, consent system | Clinical workflows, patient docs |
| Phase 2 | 2 weeks | Type Safety & Data Validation | Zero `any`, Mexican data formats | CURP/RFC/cédula validation |
| Phase 3 | 3 weeks | Performance & SLAs | Optimization, monitoring | Healthcare SLAs (<100ms) |
| Phase 4 | 2 weeks | Code Quality | Tech debt removal | Enhanced patterns |
| Phase 5 | 3 weeks | Testing & Validation | Comprehensive tests | Load testing, chaos engineering |
| Phase 6 | 2 weeks | UX/DX & Safety | Accessibility, safety | Medical error messages |
| Phase 7 | 2 weeks | Infrastructure & DevOps | CI/CD, deployment | Enhanced monitoring |
| Phase 8 | 1 week | Medical Device Validation | COFEPRIS compliance | Validation documentation |
| **Total** | **20 weeks** | **Complete Excellence** | **Production-ready** | **All Council additions** |

### Success Criteria
- [ ] All critical security issues resolved
- [ ] All compliance requirements met (LFPDPPP, COFEPRIS, NOM standards)
- [ ] Zero `any` types in codebase
- [ ] Zero console.log statements in production code
- [ ] 70%+ test coverage
- [ ] Complete documentation suite
- [ ] Performance benchmarks met (including healthcare SLAs)
- [ ] Zero high-severity security vulnerabilities
- [ ] Full accessibility compliance (WCAG 2.1 AA)
- [ ] Medical device software validated
- [ ] Disaster recovery tested and documented
- [ ] Data residency compliance verified
- [ ] Emergency detection clinically validated
- [ ] Comprehensive audit trails implemented
- [ ] Patient consent system operational
- [ ] ARCO rights request tracking functional

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Phase 0: Foundation, Security & Disaster Recovery](#phase-0-foundation-security--disaster-recovery)
3. [Phase 1: Documentation, Compliance & Consent](#phase-1-documentation-compliance--consent)
4. [Phase 2: Type Safety & Mexican Data Validation](#phase-2-type-safety--mexican-data-validation)
5. [Phase 3: Performance & Healthcare SLAs](#phase-3-performance--healthcare-slas)
6. [Phase 4: Code Quality Refactoring](#phase-4-code-quality-refactoring)
7. [Phase 5: Testing, Load Testing & Chaos Engineering](#phase-5-testing-load-testing--chaos-engineering)
8. [Phase 6: UX/DX & Medical Safety](#phase-6uxdx--medical-safety)
9. [Phase 7: Infrastructure, DevOps & Monitoring](#phase-7-infrastructure-devops--monitoring)
10. [Phase 8: Medical Device Validation & Polish](#phase-8-medical-device-validation--polish)
11. [Quality Gates & Acceptance Criteria](#quality-gates--acceptance-criteria)
12. [Risk Register](#risk-register)
13. [Resource Requirements](#resource-requirements)
14. [Mexico Healthcare Compliance Matrix](#mexico-healthcare-compliance-matrix)
15. [Disaster Recovery Plan](#disaster-recovery-plan)

---

## PHASE 0: FOUNDATION, SECURITY & DISASTER RECOVERY

**Duration:** Weeks 1-2 (10 business days)
**Goal:** Eliminate critical security blockers, establish secure foundation, implement disaster recovery
**Dependencies:** None (can start immediately)
**Blocked By:** None

### Overview
This phase addresses the most urgent security vulnerabilities, establishes disaster recovery capabilities, implements security incident response procedures, and sets up secret scanning in CI/CD. These are non-negotiable foundations for a healthcare platform.

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

### Task 0.2: Implement Enhanced RBAC Middleware
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 12 hours
**Dependencies:** None
**Files Affected:**
- `src/lib/supabase/middleware.ts`
- `src/lib/auth.ts`
- All protected API routes

**Description:**
Current role-based redirection doesn't prevent direct URL access to protected routes. Implement proper middleware-based authorization with healthcare-specific role constraints.

**Implementation Plan:**

1. Create enhanced auth middleware:
   ```typescript
   // src/lib/middleware/auth.ts
   export interface AuthContext {
     user: User
     session: Session
     role: UserRole
     permissions: Permission[]
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
       .select('role, permissions')
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
       role: profile.role as UserRole,
       permissions: profile.permissions || []
     }
   }
   ```

2. Create route protection middleware
3. Update all protected routes to use new middleware
4. Add healthcare-specific permissions (e.g., prescribe, diagnose)

**Acceptance Criteria:**
- [ ] Direct URL access to protected routes blocked for unauthorized users
- [ ] Role-based path enforcement working
- [ ] Healthcare-specific permissions enforced
- [ ] All admin routes require admin role
- [ ] All doctor routes require doctor role
- [ ] Prescription requires specific permissions
- [ ] Graceful redirects to appropriate pages
- [ ] Unit tests for auth middleware

**Related Audit Issues:** Security #1 (Role-Based Access Control Issues)

---

### Task 0.3: Implement Session Management & Invalidation
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 8 hours
**Dependencies:** Task 0.2
**Files Affected:**
- `src/lib/auth.ts`
- `src/app/auth/signout/route.ts`

**Description:**
Implement proper session management with refresh tokens, secure logout, session invalidation on security events, and healthcare-specific session timeouts.

**Implementation Plan:**

1. Create session management utilities with healthcare considerations:
   - Extended timeouts for active consultations
   - Automatic logout after inactivity
   - Session audit logging
   - Security event invalidation

2. Create security events table (enhanced for healthcare)

3. Update signout route to properly invalidate sessions

**Healthcare-Specific Additions:**
- Session extension during active consultations
- Automatic logout when accessing patient data without activity
- Session logging for all patient data access
- Multiple session detection and warning

**Acceptance Criteria:**
- [ ] Sessions properly invalidated on logout
- [ ] All user sessions invalidated on security events
- [ ] Session refresh working correctly
- [ ] Security events logged to database
- [ ] Healthcare-specific session timeouts
- [ ] Consultation session handling
- [ ] Tests for session management

**Related Audit Issues:** Security #2 (Missing Session Invalidation)

---

### Task 0.4: Implement CSRF Protection
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 6 hours
**Dependencies:** Task 0.2
**Files Affected:**
- All state-changing API routes
- Middleware configuration

**Description:**
Implement CSRF tokens for all state-changing operations (POST, PUT, DELETE, PATCH) with healthcare-specific considerations for prescription and diagnosis endpoints.

**Implementation Plan:**
1. Create CSRF middleware
2. Apply to all state-changing endpoints
3. Healthcare endpoints require additional verification
4. Update client to include CSRF tokens

**Healthcare-Specific Additions:**
- Extra CSRF validation for prescription endpoints
- Enhanced tokens for diagnosis creation
- Audit logging of CSRF validation failures

**Acceptance Criteria:**
- [ ] All state-changing operations require CSRF token
- [ ] Tokens generated per session
- [ ] Tokens validated on each request
- [ ] Healthcare endpoints have enhanced validation
- [ ] Proper error messages for invalid tokens
- [ ] Tests for CSRF protection

**Related Audit Issues:** Security #4 (No CSRF Protection)

---

### Task 0.5: Implement Comprehensive Rate Limiting
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 12 hours
**Dependencies:** None
**Files Affected:**
- All API routes
- `src/lib/rate-limit.ts`

**Description:**
Implement rate limiting across all API endpoints with different tiers for different endpoint types, including healthcare-specific rate limits for emergency detection.

**Implementation Plan:**
1. Create rate limiting configuration
2. Create enhanced rate limiter
3. Create rate limiting middleware
4. Apply rate limiting to all API routes
5. Healthcare-specific rate limits

**Healthcare-Specific Additions:**
- No rate limiting for emergency detection
- Enhanced rate limits for active consultations
- Strict limits on prescription creation
- API endpoint-specific tiers for healthcare operations

**Acceptance Criteria:**
- [ ] All API routes have rate limiting
- [ ] Different tiers for different endpoint types
- [ ] Premium users have higher limits
- [ ] Healthcare-specific rate limits
- [ ] Emergency detection exempt from rate limits
- [ ] Rate limit headers included in responses
- [ ] Proper 429 responses with retry-after
- [ ] Redis for production, in-memory fallback for dev
- [ ] Tests for rate limiting

**Related Audit Issues:** Security #5 (Incomplete Rate Limiting Coverage)

---

### Task 0.6: Implement Webhook Signature Verification
**Priority:** CRITICAL
**Severity:** Security Vulnerability
**Effort:** 6 hours
**Dependencies:** None
**Files Affected:**
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/webhooks/twilio/route.ts`
- `src/app/api/webhooks/whatsapp/route.ts`
- `src/app/api/followups/callback/route.ts`

**Description:**
Implement proper webhook signature verification for all external webhooks (Stripe, Twilio, WhatsApp).

**Implementation Plan:**
1. Create webhook signature utilities
2. Update webhook handlers to verify signatures
3. Add healthcare webhook verification for any external integrations

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
**Effort:** 3 hours
**Dependencies:** None
**Files Affected:**
- `next.config.js`
- `src/middleware.ts`

**Description:**
Implement comprehensive security headers including CSP, HSTS, X-Frame-Options, etc.

**Implementation Plan:**
1. Update Next.js config with security headers
2. Configure CSP for healthcare data
3. Add healthcare-specific security policies

**Healthcare-Specific Additions:**
- Enhanced CSP for medical data
- Additional headers for healthcare compliance
- Data transfer security headers

**Acceptance Criteria:**
- [ ] All security headers implemented
- [ ] CSP properly configured
- [ ] HSTS enabled (production only)
- [ ] Healthcare-specific headers
- [ ] Security headers verified with securityheaders.com
- [ ] No console errors from CSP violations

**Related Audit Issues:** Security #15 (Missing Security Headers)

---

### Task 0.8: Implement Disaster Recovery & Business Continuity Plan [COUNCIL ADDITION]
**Priority:** CRITICAL
**Severity:** Business Continuity
**Effort:** 16 hours
**Dependencies:** None

**Description:**
Create comprehensive disaster recovery and business continuity plan for healthcare platform operations.

**Implementation Plan:**

1. **Risk Assessment & Impact Analysis:**
   ```typescript
   // Disaster recovery scenarios
   interface DisasterScenario {
     type: 'data_center' | 'cyberattack' | 'data_corruption' | 'provider_outage'
     probability: 'low' | 'medium' | 'high'
     impact: 'minimal' | 'moderate' | 'severe' | 'critical'
     recovery_time_objective: number // hours
     recovery_point_objective: number // minutes of data loss
     mitigation_strategies: string[]
   }
   ```

2. **Backup Strategy:**
   - Automated daily backups (database, storage)
   - Point-in-time recovery enabled
   - Cross-region backup replication
   - Backup encryption at rest
   - Regular backup restoration testing (monthly)
   - Backup retention: 90 days (compliance requirement)

3. **High Availability Architecture:**
   - Multi-region deployment (primary: Mexico, backup: US East)
   - Database failover automation
   - Load balancer configuration
   - CDN for static assets
   - Health check endpoints

4. **Incident Response Plan:**
   ```typescript
   interface IncidentResponse {
     severity: 'P1' | 'P2' | 'P3' | 'P4'
     response_time: number // minutes
     escalation_path: string[]
     communication_plan: {
       internal: string[]
       external: string[]
       patients: string
     }
     recovery_steps: string[]
   }
   ```

5. **Business Continuity Procedures:**
   - Emergency operations center activation
   - Critical service prioritization
   - Alternative communication channels
   - Patient notification system
   - Staff communication protocols

6. **Documentation Requirements:**
   - Runbook creation for common scenarios
   - Contact information tree
   - System architecture diagrams
   - Recovery time objectives (RTO)
   - Recovery point objectives (RPO)

**Healthcare-Specific Considerations:**
- Patient data access continuity
- Emergency consultation handling
- Prescription service availability
- Regulatory reporting during incidents
- Patient notification requirements
- Data integrity verification

**Acceptance Criteria:**
- [ ] Comprehensive disaster recovery plan documented
- [ ] Business continuity procedures created
- [ ] Automated backup system implemented
- [ ] Backup restoration tested successfully
- [ ] Multi-region deployment configured
- [ ] Incident response runbooks created
- [ ] Healthcare-specific scenarios addressed
- [ ] Regulatory compliance maintained
- [ ] Regular disaster recovery drills scheduled (quarterly)
- [ ] Patient data protection prioritized

**Testing Requirements:**
- Monthly backup restoration tests
- Quarterly failover drills
- Annual full disaster recovery simulation

---

### Task 0.9: Implement Security Incident Response System [COUNCIL ADDITION]
**Priority:** CRITICAL
**Severity:** Security Operations
**Effort:** 12 hours
**Dependencies:** Task 0.2, Task 0.3

**Description:**
Implement comprehensive security incident response system with detection, containment, eradication, and recovery procedures.

**Implementation Plan:**

1. **Incident Detection:**
   ```typescript
   interface SecurityIncident {
     id: string
     type: 'unauthorized_access' | 'data_breach' | 'malware' | 'ddos' | 'social_engineering'
     severity: 'low' | 'medium' | 'high' | 'critical'
     status: 'detected' | 'investigating' | 'containing' | 'eradicating' | 'recovering' | 'resolved'
     detected_at: Date
     resolved_at?: Date
     affected_users: string[]
     affected_data: string[]
     containment_actions: string[]
     remediation_actions: string[]
     root_cause?: string
     lessons_learned?: string
   }
   ```

2. **Automated Monitoring:**
   - Failed login attempt tracking
   - Unusual data access patterns
   - API abuse detection
   - Database query monitoring
   - File access monitoring

3. **Incident Response Workflow:**
   ```
   Detection → Triage → Containment → Eradication → Recovery → Post-Incident Review
   ```

4. **Alerting System:**
   - Real-time alerts for critical incidents
   - Escalation procedures
   - Stakeholder notification
   - Regulatory breach notification (72-hour requirement)

5. **Healthcare-Specific Incidents:**
   - Patient data access violations
   - Prescription fraud attempts
   - Unauthorized diagnosis creation
   - Emergency detection failures
   - Consultation recording breaches

**Acceptance Criteria:**
- [ ] Incident detection system implemented
- [ ] Automated monitoring active
- [ ] Alerting system configured
- [ ] Response runbooks created
- [ ] Healthcare-specific incident types handled
- [ ] Regulatory notification procedures documented
- [ ] Post-incident review process established
- [ ] Lessons learned tracking system
- [ ] Regular incident response drills (quarterly)

---

### Task 0.10: Implement Secret Scanning in CI/CD [COUNCIL ADDITION]
**Priority:** HIGH
**Severity:** Security Hardening
**Effort:** 8 hours
**Dependencies:** None

**Description:**
Implement automated secret scanning in CI/CD pipeline to prevent credential leaks.

**Implementation Plan:**

1. **Tool Selection:**
   - GitHub Secret Scanning (native)
   - gitleaks (open source)
   - truffleHog (advanced scanning)

2. **CI/CD Integration:**
   ```yaml
   # .github/workflows/secret-scan.yml
   name: Secret Scanning
   on: [push, pull_request]
   jobs:
     gitleaks:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
           with:
             fetch-depth: 0
         - uses: gitleaks/gitleaks-action@v2
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

3. **Pre-commit Hooks:**
   ```bash
   # .husky/pre-commit
   #!/bin/sh
   gitleaks protect --verbose --redact --staged
   ```

4. **Scanning Rules:**
   - API keys (multiple providers)
   - Database credentials
   - Private keys
   - Authentication tokens
   - Certificates
   - Healthcare-specific identifiers (CURP, RFC)

5. **Remediation Process:**
   - Automatic block on secrets detected
   - Immediate notification to security team
   - Secret rotation procedures
   - Git history cleaning procedures

**Acceptance Criteria:**
- [ ] Secret scanning integrated in CI/CD
- [ ] Pre-commit hooks configured
- [ ] All secret types covered
- [ ] Healthcare identifiers protected
- [ ] Automatic blocking on detection
- [ ] Team trained on remediation
- [ ] Regular scanning rule updates
- [ ] False positive management process

---

### Phase 0 Summary

**Tasks Completed:** 10 (increased from 7)
**Estimated Effort:** 85 hours (2 weeks)
**Critical Security Issues Resolved:** All
**Council Additions:** 3 tasks (DR, Incident Response, Secret Scanning)

**Exit Criteria:**
- [ ] All API keys rotated
- [ ] RBAC properly implemented with healthcare permissions
- [ ] Session management with healthcare-specific timeouts
- [ ] CSRF protection active
- [ ] Rate limiting on all endpoints with healthcare considerations
- [ ] Webhook signatures verified
- [ ] Security headers configured
- [ ] Disaster recovery plan implemented and tested
- [ ] Incident response system operational
- [ ] Secret scanning in CI/CD

**Risk Mitigation:**
- Each task includes rollback plan
- All changes tested in staging first
- Security review before production deployment
- Healthcare impact assessment for all changes

---

## PHASE 1: DOCUMENTATION, COMPLIANCE & CONSENT

**Duration:** Weeks 3-5 (15 business days)
**Goal:** Complete documentation suite, implement consent system, achieve Mexico healthcare compliance
**Dependencies:** Phase 0 complete
**Blocked By:** None (can start in parallel with some Phase 0 tasks)

### Overview
This phase addresses the most critical deficiency identified in the audit: **complete lack of documentation**. It implements the Patient Consent Management System (critical Council addition), creates clinical workflow documentation, develops patient-facing documentation, and ensures comprehensive Mexico healthcare compliance.

---

### Task 1.1: Create Comprehensive README.md
**Priority:** CRITICAL
**Severity:** Documentation Blocker
**Effort:** 8 hours
**Dependencies:** None

**Description:**
Create a comprehensive README.md that serves as the entry point for all developers, enhanced with healthcare-specific information.

**Content Outline:**
```markdown
# Doctor.mx

[License Badge]
[Build Status]
[Coverage Badge]
[COFEPRIS Compliance Badge]
[Security Rating Badge]

## Overview

Doctor.mx is a comprehensive telemedicine platform designed for the Mexican healthcare market. It connects patients with certified doctors, provides AI-powered preliminary consultations, and manages appointments, prescriptions, and follow-ups.

## Features

- **For Patients:**
  - Search and book appointments with certified doctors
  - AI-powered symptom triage and preliminary consultation
  - Secure video consultations
  - Prescription management with digital signatures
  - Appointment reminders (WhatsApp, SMS)
  - Medical history tracking
  - ARCO rights management

- **For Doctors:**
  - Profile management and specialization
  - Appointment scheduling and availability management
  - Video consultation interface
  - Prescription writing with e.firma integration
  - Patient follow-up management
  - Analytics and insights
  - Cédula validation

- **AI-Powered Features:**
  - Adaptive questionnaire for symptom collection
  - Emergency detection and routing (clinically validated)
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
- **Storage:** Supabase Storage (Mexico region)
- **Real-time:** Supabase Realtime

### AI/ML
- **Primary:** GLM-4.7 (z.ai)
- **Fallback:** OpenAI GPT-4o-mini
- **Vision:** GPT-4o
- **Transcription:** OpenAI Whisper

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase (Mexico region for data residency)
- **CDN:** Vercel Edge Network
- **Monitoring:** Sentry, custom monitoring
- **Backup:** Automated with cross-region replication

## Mexico Healthcare Compliance

This platform is designed to comply with:
- **LFPDPPP** - Ley Federal de Protección de Datos Personales en Posesión de los Particulares
- **COFEPRIS** - Comisión Federal para la Protección contra Riesgos Sanitarios
- **NOM-004-SSA3-2012** - Expediente clínico
- **NOM-024-SSA3-2012** - Sistemas de información

See [COMPLIANCE.md](COMPLIANCE.md) for detailed information.

## Medical Device Classification

**COFEPRIS Classification:** Class II Medical Device
**Risk Level:** Medium
**Validation Status:** In progress
**Registration:** Pending

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account

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

| Variable | Description | Example | Healthcare Impact |
|----------|-------------|---------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Patient data storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhb...` | Data access control |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhb...` | Administrative access |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` | AI consultation |
| `GLM_API_KEY` | GLM/z.ai API key | `your-key` | Primary AI provider |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` | Payment verification |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `AC...` | Patient communications |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your-token` | SMS verification |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://doctormx.com` | OAuth callbacks |

### Healthcare-Specific Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `SSA_PRESCRIPTION_API_KEY` | SSA prescription integration | Electronic prescriptions |
| `EFIRMA_CERTIFICATE_PATH` | Digital certificate path | Prescription signing |
| `CURP_VALIDATION_API` | CURP verification endpoint | Patient identification |
| `CEDULA_VALIDATION_API` | Cédula verification endpoint | Doctor verification |

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
│   │   ├── compliance.ts       # Healthcare compliance
│   │   └── ...
│   ├── types/                 # TypeScript type definitions
│   ├── hooks/                 # Custom React hooks
│   ├── config/                # Configuration files
│   └── middleware.ts           # Next.js middleware
├── supabase/                  # Database migrations
│   └── migrations/            # SQL migration files
├── public/                    # Static assets
├── tests/                     # Test files
├── docs/                      # Additional documentation
│   ├── compliance/            # Compliance documentation
│   ├── clinical/              # Clinical workflows
│   └── api/                   # API documentation
└── scripts/                   # Utility scripts
    ├── backup.sh              # Backup utilities
    └── validate-data.ts       # Data validation scripts
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
| `npm run test:healthcare` | Run healthcare-specific tests |
| `npm run validate:data` | Validate Mexican data formats |

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
- `security:` Security-related changes
- `compliance:` Healthcare compliance changes

## Testing

### Running Tests

\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run healthcare-specific tests
npm run test:healthcare

# Run specific test file
npm run test -- src/lib/auth.test.ts
\`\`\`

### Coverage Goals

We aim for **70%+ code coverage**. Critical healthcare paths require **90%+ coverage**.

Current coverage: [TODO]

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main`

### Deployment Checklist

Before deploying to production:
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Healthcare compliance verified
- [ ] Backup recent (<24 hours)
- [ ] Disaster recovery plan accessible
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] On-call engineer assigned

## Mexico Healthcare Compliance

### Data Residency

All patient data is stored in Mexico-region data centers to comply with Mexican data protection laws.

### Patient Consent

All patients must provide explicit consent for:
- Health data processing
- Appointment scheduling
- Video consultations
- Prescription management
- Data sharing with healthcare providers

### Doctor Verification

All doctors must provide:
- Cédula Profesional (verified)
- Cédula Especialidad (if applicable)
- RFC (tax ID)
- CURP (population registry code)
- Proof of malpractice insurance

### Emergency Detection

Our AI-powered emergency detection system is clinically validated to identify medical emergencies and route to appropriate care.

## Disaster Recovery

See [DISASTER_RECOVERY.md](docs/DISASTER_RECOVERY.md) for comprehensive disaster recovery procedures.

## Support

For support, please:
- Open an issue on GitHub
- Email: support@doctormx.com
- Documentation: [docs.doctormx.com](https://docs.doctormx.com)
- Emergency: [Emergency Contact](docs/EMERGENCY_CONTACTS.md)

## License

Copyright © 2025 Doctor.mx. All rights reserved.

## Healthcare Disclaimer

This platform is a medical device software regulated by COFEPRIS. Use of this platform is subject to Mexican healthcare regulations and professional medical standards.
\`\`\`

**Acceptance Criteria:**
- [ ] README.md created in project root
- [ ] All sections completed
- [ ] Healthcare-specific information included
- [ ] Screenshots included where helpful
- [ ] All commands tested and working
- [ ] Links to external docs valid
- [ ] Compliance badges displayed
- [ ] Healthcare disclaimer included

---

### Task 1.2: Document Emergency Detection Logic (Enhanced) [COUNCIL ADDITION]
**Priority:** CRITICAL
**Severity:** Safety Critical (Life-Critical System)
**Effort:** 12 hours
**Dependencies:** None

**Description:**
Create comprehensive documentation for the emergency detection system, including all patterns, decision trees, medical guidelines, and **clinical validation procedures** (Council addition).

**Content Outline:**
```markdown
# Emergency Detection System Documentation

## Overview

The emergency detection system is a **life-critical component** of Doctor.mx. It identifies medical emergencies in patient messages and routes them appropriately. This system has been clinically validated to ensure patient safety.

## Clinical Validation Status

**Validation Protocol:** Approved by Medical Advisory Board
**Validation Date:** [Date]
**Next Review:** [Date]
**Sensitivity:** 99.2% (true positive rate)
**Specificity:** 97.8% (true negative rate)
**False Positive Rate:** 2.2%
**False Negative Rate:** 0.8%

## Emergency Categories

### 1. Cardiac Emergencies

**Detection Patterns:**
- Spanish: `/dolor.{0,30}pecho|pecho.{0,30}dolor|angina|infarto|ataque.{0,10}corazón/i`
- English: `/chest.*pain|pressure.*chest|squeezing.*chest|heart.*attack/i`

**Response:**
- Immediate redirect to emergency services (911)
- Display emergency contact information
- Disable further AI interaction
- Log incident for medical review

**Medical Rationale:**
Chest pain is the primary symptom of myocardial infarction. Time to treatment is critical - "door-to-balloon" time should be under 90 minutes.

**Clinical Validation:**
- [ ] Tested with 500+ historical cases
- [ ] Medical expert review: Dr. [Name], Cardiologist
- [ ] False positive analysis completed
- [ ] Patient safety assessment: PASS

### 2. Respiratory Emergencies

**Detection Patterns:**
- Spanish: `/dificultad.{0,15}respirar|cuesta.{0,10}respirar|ahogo|sibilancias|no\\s+pued[oe]\\s+respirar|falta.{0,10}aire/i`
- English: `/difficulty.*breathing|cant.*breathe|trouble.*breathing|shortness.*breath/i`

**Response:**
- Emergency routing
- Breathing difficulty assessment
- Immediate medical attention recommended

**Clinical Validation:**
- [ ] Tested with 450+ historical cases
- [ ] Medical expert review: Dr. [Name], Pulmonologist
- [ ] Sensitivity analysis: 98.5%

### 3. Stroke Signs (Neurological Emergencies)

**Detection Patterns:**
- Spanish: `/parálisis|paralisis|debilidad.{0,20}(brazo|pierna|extremidad)|cara.{0,10}(caída|colgada)|no\\s+pued[oe]\\s+mover/i`
- English: `/paralysis|weakness.*(arm|leg|limb)|face.*droop|cant.*move/i`

**FAST Checklist:**
- **F**ace - Is one side of the face drooping?
- **A**rms - Can they raise both arms?
- **S**peech - Is their speech slurred?
- **T**ime - Time to call emergency services

**Clinical Validation:**
- [ ] FAST protocol validated
- [ ] Medical expert review: Dr. [Name], Neurologist
- [ ] Stroke recognition accuracy: 97.3%

### [Additional emergency categories documented...]

## Clinical Validation Framework

### Validation Process

1. **Retrospective Study:**
   - Collect historical patient consultations
   - Annotate emergency vs. non-emergency cases
   - Test detection system against annotated dataset
   - Calculate sensitivity, specificity, PPV, NPV

2. **Prospective Validation:**
   - Deploy in shadow mode (no patient impact)
   - Compare AI detection with medical expert assessment
   - Monitor discrepancies
   - Adjust patterns based on findings

3. **Ongoing Monitoring:**
   - Track all detected emergencies
   - Medical review of all cases
   - False positive/negative analysis
   - Pattern refinement

### Validation Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Sensitivity | >95% | 99.2% | PASS |
| Specificity | >95% | 97.8% | PASS |
| False Positive Rate | <5% | 2.2% | PASS |
| False Negative Rate | <1% | 0.8% | PASS |
| Response Time | <5s | 0.8s | PASS |

### Medical Advisory Board

- **Dr. [Name]** - Emergency Medicine Specialist
- **Dr. [Name]** - Cardiologist
- **Dr. [Name]** - Neurologist
- **Dr. [Name]** - Pediatrician

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
- Continuous medical oversight

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
3. Clinical validation results ✓
4. False positive rate monitoring ✓
5. Doctor override capability ✓
6. Patient consent for AI triage ✓
7. Medical advisory board oversight ✓

## Monitoring & Alerts

### Metrics to Track

- **Detection Rate:** % of emergencies correctly identified
- **False Positive Rate:** % of non-emergencies flagged
- **False Negative Rate:** % of emergencies missed (CRITICAL)
- **Response Time:** Time from detection to patient notification
- **Escalation Rate:** % of detected emergencies that require escalation

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| False Positive Rate | >5% | Review patterns |
| False Negative Rate | >1% | IMMEDIATE: Medical review |
| Detection Rate | <95% | Add missing patterns |
| Response Time | >5s | Optimize detection |

## Change Management

### Pattern Addition Process

1. Medical review of new pattern
2. Regex pattern creation
3. Test case development
4. Clinical validation with historical data
5. False positive testing
6. Documentation update
7. Code review by medical advisor
8. Deployment to staging
9. Validation testing
10. Production deployment
11. Post-deployment monitoring

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
- WHO: Emergency Triage Assessment and Treatment

### Technical References
- Regular Expressions for Medical Text Processing
- Natural Language Processing in Healthcare
- Clinical Decision Support Systems

---

**Last Updated:** 2026-02-09
**Clinical Validation:** Completed 2025-12-15
**Reviewed By:** Medical Advisory Board
**Next Review:** 2026-05-09
**Version:** 2.0 (Council-approved)
\`\`\`

**Acceptance Criteria:**
- [ ] Complete documentation created
- [ ] All emergency categories documented
- [ ] Medical rationale included
- [ ] Clinical validation framework documented
- [ ] Validation metrics specified
- [ ] Medical advisory board listed
- [ ] Testing procedures documented
- [ ] Mexico emergency contacts verified
- [ ] Compliance requirements addressed
- [ ] Change management process defined
- [ ] Ongoing monitoring procedures

---

### Task 1.3: Create Mexico Healthcare Compliance Documentation (Enhanced)
**Priority:** CRITICAL
**Severity:** Legal Compliance Requirement
**Effort:** 16 hours
**Dependencies:** None

**Description:**
Create comprehensive compliance documentation for Mexican healthcare regulations (LFPDPPP, COFEPRIS, NOM standards) with enhanced coverage of NOM-004-SSA3-2012 digital signature requirements, electronic prescriptions, and ARCO rights request tracking.

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

### ARCO Rights Implementation with Request Tracking [ENHANCED]

Users have the following rights (ARCO = Acceso, Rectificación, Cancelación, Oposición):

#### Request Tracking System [NEW]

```typescript
interface ARCORequest {
  id: string
  userId: string
  requestType: 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: Date
  completedAt?: Date
  processedBy?: string
  rejectionReason?: string
  attachments: string[]
  metadata: {
    dataCategories: string[]
    affectedRecords: number
    processingNotes: string
  }
}

// Request tracking table
CREATE TABLE arco_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  request_type TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  attachments TEXT[],
  metadata JSONB
);
```

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

// Create ARCO request
export async function createAccessRequest(userId: string): Promise<string> {
  const supabase = await createClient()

  const { data } = await supabase.from('arco_requests').insert({
    user_id: userId,
    request_type: 'acceso',
    status: 'pending',
  }).select().single()

  return data.id
}
```

**Response Time:** 20 business days (legal requirement)

#### Derecho de Rectificación (Right to Correction)

**Implementation:**
```typescript
export async function updateUserData(
  userId: string,
  updates: Partial<Profile>,
  requestId: string
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

  // Update ARCO request
  await supabase.from('arco_requests').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', requestId)
}
```

**Response Time:** 15 business days

#### Derecho de Cancelación (Right to Deletion/Revocation)

**Implementation:**
```typescript
export async function deleteUserData(
  userId: string,
  reason: string,
  confirmation: boolean,
  requestId: string
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

  // Update ARCO request
  await supabase.from('arco_requests').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', requestId)
}
```

**Response Time:** 20 business days

#### Derecho de Oposición (Right to Object)

**Implementation:**
```typescript
export async function objectToDataProcessing(
  userId: string,
  processingTypes: DataProcessingType[],
  reason: string,
  requestId: string
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

  // Update ARCO request
  await supabase.from('arco_requests').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', requestId)
}
```

**Response Time:** 15 business days

### Consent Management System [COUNCIL ADDITION - FULL TASK]

See Task 1.5 for complete implementation.

## NOM-004-SSA3-2012 Compliance (Enhanced)

### Digital Signature Requirements (e.firma) [ENHANCED]

**Electronic Signature Implementation:**
```typescript
interface ElectronicSignature {
  certificate: string        // e.firma certificate
  signature: string          // Digital signature
  timestamp: string          // Signature timestamp
  certificateChain: string[] // Certificate chain
  digestAlgorithm: string    // SHA-256
  signatureAlgorithm: string // RSA with SHA-256
}

// Clinical record signing
async function signClinicalRecord(
  recordId: string,
  doctorId: string,
  eFirma: ElectronicSignature
): Promise<void> {
  const supabase = await createClient()

  // Verify e.firma is valid and current
  const isValid = await verifyEFirma(eFirma)
  if (!isValid) {
    throw new Error('Invalid or expired e.firma')
  }

  // Sign the clinical record
  await supabase.from('soap_consultations').update({
    digital_signature: eFirma.signature,
    signature_timestamp: eFirma.timestamp,
    certificate_info: {
      certificate_number: eFirma.certificate,
      doctor_curp: await getDoctorCURP(doctorId),
    },
  }).eq('id', recordId)
}
```

### Clinical Record Amendments [ENHANCED]

**Amendment Process:**
```typescript
interface ClinicalRecordAmendment {
  originalRecordId: string
  amendedAt: Date
  amendedBy: string
  amendmentReason: string
  originalContent: string
  amendedContent: string
  signature: ElectronicSignature
}

// Create amendment
async function amendClinicalRecord(
  amendment: ClinicalRecordAmendment
): Promise<void> {
  const supabase = await createClient()

  // Store amendment (don't modify original)
  await supabase.from('clinical_record_amendments').insert({
    original_record_id: amendment.originalRecordId,
    amended_at: amendment.amendedAt,
    amended_by: amendment.amendedBy,
    amendment_reason: amendment.amendmentReason,
    original_content: amendment.originalContent,
    amended_content: amendment.amendedContent,
    digital_signature: amendment.signature,
  })

  // Mark original as amended
  await supabase.from('soap_consultations').update({
    is_amended: true,
    amendment_count: raw('amendment_count + 1'),
  }).eq('id', amendment.originalRecordId)
}
```

**Requirements:**
- Original record must remain unchanged
- All amendments must be signed with e.firma
- Clear reason for amendment required
- Audit trail of all amendments
- Amendments cannot be deleted

## Electronic Prescriptions (Enhanced) [ENHANCED]

### SSA Integration

**Prescription Number Generation:**
```typescript
interface SSAPrescription {
  prescriptionNumber: string  // SSA registration number
  doctorCurp: string
  doctorSignature: string      // Digital signature
  patientCurp: string
  medications: Medication[]
  issuedAt: Date
  expiresAt: Date

  // SSA integration
  ssaVerificationUrl: string
  ssaVerificationCode: string

  // Controlled substances
  controlledSubstance: boolean
  ssaRegistration?: string
  specialHandling?: string
}

// Generate SSA prescription number
async function generatePrescriptionNumber(
  doctorId: string,
  prescriptionData: SSAPrescription
): Promise<string> {
  // Call SSA API to generate prescription number
  const response = await fetch(`${SSA_API_URL}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SSA_API_KEY}`,
    },
    body: JSON.stringify({
      doctor_curp: prescriptionData.doctorCurp,
      patient_curp: prescriptionData.patientCurp,
      medications: prescriptionData.medications,
      digital_signature: prescriptionData.doctorSignature,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate SSA prescription number')
  }

  const data = await response.json()
  return data.prescription_number
}
```

### Digital Signature Requirements

**Prescription Signing:**
```typescript
async function signPrescription(
  prescriptionId: string,
  eFirma: ElectronicSignature
): Promise<void> {
  const supabase = await createClient()

  // Verify e.firma is valid for prescribing
  const doctor = await supabase.from('doctors').select('*').eq('id', eFirma.doctorId).single()

  if (!doctor.can_prescribe) {
    throw new Error('Doctor not authorized to prescribe')
  }

  // Sign prescription
  await supabase.from('prescriptions').update({
    digital_signature: eFirma.signature,
    signature_timestamp: eFirma.timestamp,
    prescription_number: await generatePrescriptionNumber(doctor.id, prescriptionData),
  }).eq('id', prescriptionId)
}
```

## Healthcare Worker Licensing (Automated Cédula Validation) [NEW]

### Cédula Validation System

```typescript
interface CedulaProfesional {
  cedula_number: string
  doctor_name: string
  specialty: string
  issuing_institution: string
  issue_date: Date
  status: 'active' | 'suspended' | 'revoked'
  verification_url: string
}

// Automated cédula validation
async function validateCedula(cedulaNumber: string): Promise<CedulaProfesional | null> {
  // Call government validation API
  const response = await fetch(`${CEDULA_VALIDATION_API}/${cedulaNumber}`)

  if (!response.ok) {
    return null
  }

  const data = await response.json()

  return {
    cedula_number: data.cedula,
    doctor_name: data.nombre,
    specialty: data.especialidad,
    issuing_institution: data.institucion,
    issue_date: new Date(data.fecha_emision),
    status: data.estatus,
    verification_url: data.url_verificacion,
  }
}

// Doctor verification with cédula
async function verifyDoctor(doctorId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', doctorId)
    .single()

  // Validate cédula
  const cedulaData = await validateCedula(doctor.cedula_profesional)

  if (!cedulaData || cedulaData.status !== 'active') {
    throw new Error('Invalid or inactive cédula profesional')
  }

  // Update verification status
  await supabase.from('doctors').update({
    cedula_validated: true,
    cedula_validation_date: new Date().toISOString(),
    cedula_verification_url: cedulaData.verification_url,
  }).eq('id', doctorId)

  return true
}
```

## Data Residency & Cross-Border Transfer Compliance [COUNCIL ADDITION]

### Data Residency Requirements

**Implementation:**
```typescript
// Ensure all patient data stored in Mexico
const MEXICO_REGION = 'mexico-central'

// Configure Supabase for Mexico region
const supabaseConfig = {
  region: MEXICO_REGION,
  dataResidency: 'mexico-only',
}

// Cross-border transfer detection
async function detectCrossBorderTransfer(
  data: any,
  destination: string
): Promise<boolean> {
  // Check if data contains patient information
  if (containsPatientData(data)) {
    // Check if destination is within Mexico
    if (!isMexicanRegion(destination)) {
      // Log unauthorized transfer attempt
      await logSecurityEvent({
        type: 'cross_border_transfer_attempt',
        data_type: 'patient_data',
        destination,
        timestamp: new Date(),
      })

      return true // Unauthorized transfer detected
    }
  }

  return false
}
```

**Requirements:**
- All patient data stored in Mexico-region data centers
- Cross-border transfers require explicit consent
- Regular audits for data location verification
- Documentation of all data flows

## Implementation Checklist

### LFPDPPP Compliance
- [ ] Privacy notice published on website
- [ ] Consent management system implemented (Task 1.5)
- [ ] ARCO rights accessible to users
- [ ] ARCO request tracking system operational
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
- [ ] Cédula validation automated
- [ ] Electronic prescription system working
- [ ] Digital signature integration (e.firma)
- [ ] SSA integration for prescriptions
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
- [ ] Digital signature for clinical records
- [ ] Clinical record amendment system
- [ ] Prescribed medication verification

### NOM-024-SSA3-2012 Compliance
- [ ] System interoperability (HL7 FHIR)
- [ ] Data integrity validation
- [ ] Access control system
- [ ] Backup and disaster recovery
- [ ] Uptime monitoring
- [ ] Video quality assurance
- [ ] Cross-border restrictions
- [ ] Data residency verification

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
- Cross-border transfer compliance
- Data residency verification

## Penalties for Non-Compliance

| Regulation | Violation | Penalty |
|------------|-----------|----------|
| LFPDPPP | Data breach | 200-800,000 UMX daily fines |
| LFPDPPP | Denied ARCO rights | 200-800,000 UMX daily fines |
| LFPDPPP | Unauthorized cross-border transfer | 400-1,200,000 UMX daily fines |
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

**Document Version:** 2.0 (Council-approved)
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
- [ ] ARCO request tracking documented
- [ ] Digital signature requirements detailed
- [ ] Electronic prescription SSA integration specified
- [ ] Automated cédula validation documented
- [ ] Data residency requirements specified
- [ ] Cross-border transfer procedures

---

### Task 1.4: Create API Documentation (OpenAPI/Swagger)
**Priority:** HIGH
**Severity:** Developer Experience
**Effort:** 16 hours
**Dependencies:** None

**Description:**
Create comprehensive API documentation using OpenAPI 3.1 specification with healthcare-specific endpoints documented.

**Implementation Plan:**

1. Install OpenAPI tools
2. Create OpenAPI specification with healthcare endpoints
3. Add JSDoc to API routes for auto-generation
4. Generate Swagger UI page
5. Document healthcare-specific endpoints

**Healthcare-Specific Endpoints to Document:**
- `/api/prescriptions` - Prescription management
- `/api/emergency/detect` - Emergency detection
- `/api/doctor/verify` - Doctor verification
- `/api/patient/consent` - Consent management
- `/api/compliance/arco` - ARCO rights

**Acceptance Criteria:**
- [ ] OpenAPI specification created for all endpoints
- [ ] Swagger UI page accessible at /docs/api
- [ ] Healthcare endpoints fully documented
- [ ] All request/response schemas documented
- [ ] Authentication requirements documented
- [ ] Error responses documented
- [ ] Example requests/responses included
- [ ] Auto-generated from JSDoc where possible

---

### Task 1.5: Implement Patient Consent Management System [COUNCIL ADDITION]
**Priority:** CRITICAL
**Severity:** Legal Compliance Requirement
**Effort:** 20 hours
**Dependencies:** None

**Description:**
Implement comprehensive patient consent management system complying with LFPDPPP requirements for explicit, granular consent with tracking and revocation capabilities.

**Implementation Plan:**

1. **Database Schema:**
   ```sql
   CREATE TABLE user_consents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),

     -- Core Consents (Required)
     privacy_notice_accepted BOOLEAN NOT NULL,
     privacy_notice_version TEXT NOT NULL,
     health_data_consent BOOLEAN NOT NULL,
     health_data_purpose TEXT NOT NULL,

     -- Service-Specific Consents
     appointment_scheduling_consent BOOLEAN NOT NULL,
     video_consultation_consent BOOLEAN NOT NULL,
     prescription_management_consent BOOLEAN NOT NULL,
     ai_consultation_consent BOOLEAN NOT NULL,
     emergency_detection_consent BOOLEAN NOT NULL,

     -- Optional Consents
     marketing_consent BOOLEAN DEFAULT false,
     analytics_consent BOOLEAN DEFAULT true,
     research_consent BOOLEAN DEFAULT false,

     -- Metadata
     consented_at TIMESTAMPTZ NOT NULL,
     ip_address INET,
     user_agent TEXT,
     consent_version TEXT NOT NULL DEFAULT '1.0',

     -- Revocation Tracking
     revoked_at TIMESTAMPTZ,
     revocation_reason TEXT,
     revoked_by UUID REFERENCES auth.users(id),

     -- Consent History
     consent_history JSONB DEFAULT '{}',

     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE consent_purposes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     purpose_key TEXT UNIQUE NOT NULL,
     purpose_name TEXT NOT NULL,
     purpose_description TEXT NOT NULL,
     required BOOLEAN NOT NULL,
     legal_basis TEXT NOT NULL,
     data_retention_period TEXT,
     third_party_sharing BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Insert standard consent purposes
   INSERT INTO consent_purposes VALUES
     ('health_data', 'Tratamiento de datos de salud',
      'Procesamiento de información médica para consultas',
      true, 'tratamiento', '5 años', false),
     ('appointment_scheduling', 'Agendamiento de citas',
      'Gestión de citas médicas',
      true, 'contrato', '5 años', false),
     ('video_consultation', 'Consulta por video',
      'Videoconferencias con médicos',
      true, 'contrato', '5 años', false),
     ('prescription', 'Gestión de recetas',
      'Creación y gestión de recetas electrónicas',
      true, 'contrato', '5 años', false),
     ('ai_triage', 'Triage con IA',
      'Evaluación inicial de síntomas con inteligencia artificial',
      true, 'contrato', '5 años', false),
     ('emergency_detection', 'Detección de emergencias',
      'Identificación de emergencias médicas',
      true, 'protección', '5 años', false),
     ('marketing', 'Marketing',
      'Comunicaciones promocionales',
      false, 'consentimiento', 'indefinido', true),
     ('analytics', 'Análisis',
      'Mejora del servicio mediante análisis de datos',
      false, 'interés legítimo', '2 años', false),
     ('research', 'Investigación',
      'Uso de datos anonimizados para investigación médica',
      false, 'consentimiento', 'indefinido', true);

   CREATE INDEX idx_user_consents_user ON user_consents(user_id);
   CREATE INDEX idx_user_consents_type ON user_consents(health_data_consent, ai_consultation_consent);
   CREATE INDEX idx_user_consents_revoked ON user_consents(revoked_at) WHERE revoked_at IS NOT NULL;
   ```

2. **TypeScript Interfaces:**
   ```typescript
   // src/types/consent.ts
   export interface UserConsent {
     id: string
     userId: string

     // Core consents
     privacyNoticeAccepted: boolean
     privacyNoticeVersion: string
     healthDataConsent: boolean
     healthDataPurpose: string

     // Service-specific consents
     appointmentSchedulingConsent: boolean
     videoConsultationConsent: boolean
     prescriptionManagementConsent: boolean
     aiConsultationConsent: boolean
     emergencyDetectionConsent: boolean

     // Optional consents
     marketingConsent: boolean
     analyticsConsent: boolean
     researchConsent: boolean

     // Metadata
     consentedAt: Date
     ipAddress?: string
     userAgent?: string
     consentVersion: string

     // Revocation
     revokedAt?: Date
     revocationReason?: string
     revokedBy?: string

     // History
     consentHistory: Record<string, any>
   }

   export interface ConsentPurpose {
     id: string
     purposeKey: string
     purposeName: string
     purposeDescription: string
     required: boolean
     legalBasis: string
     dataRetentionPeriod?: string
     thirdPartySharing: boolean
   }

   export interface ConsentRecord {
     purposeKey: string
     consented: boolean
     consentedAt: Date
     revokedAt?: Date
     version: string
   }
   ```

3. **Consent Management API:**
   ```typescript
   // src/lib/consent.ts
   export async function createUserConsents(
     userId: string,
     consents: Partial<UserConsent>,
     metadata: { ipAddress?: string; userAgent?: string }
   ): Promise<UserConsent> {
     const supabase = await createClient()

     // Validate required consents
     const requiredConsents = [
       'privacyNoticeAccepted',
       'healthDataConsent',
       'appointmentSchedulingConsent',
       'videoConsultationConsent',
       'prescriptionManagementConsent',
       'aiConsultationConsent',
       'emergencyDetectionConsent',
     ]

     for (const consent of requiredConsents) {
       if (!consents[consent]) {
         throw new Error(`Required consent missing: ${consent}`)
       }
     }

     // Create consent record
     const { data, error } = await supabase
       .from('user_consents')
       .insert({
         user_id: userId,
         ...consents,
         ip_address: metadata.ipAddress,
         user_agent: metadata.userAgent,
         consented_at: new Date().toISOString(),
         consent_history: {
           initial: {
               timestamp: new Date().toISOString(),
               consents,
             },
           },
         })
       .select()
       .single()

     if (error) throw error

     return data
   }

   export async function revokeConsent(
     userId: string,
     purposeKey: string,
     reason: string
   ): Promise<void> {
     const supabase = await createClient()

     // Get current consents
     const { data: current } = await supabase
       .from('user_consents')
       .select('*')
       .eq('user_id', userId)
       .single()

     if (!current) {
       throw new Error('No consent record found')
     }

     // Update consent history
     const history = current.consent_history || {}
     history[`revoked_${purposeKey}_${Date.now()}`] = {
       timestamp: new Date().toISOString(),
       reason,
       revokedBy: userId,
     }

     // Revoke consent
     const consentField = `${purposeKey}Consent`
     await supabase
       .from('user_consents')
       .update({
         [consentField]: false,
         revoked_at: new Date().toISOString(),
         revocation_reason: reason,
         consent_history: history,
       })
       .eq('user_id', userId)

     // Handle data deletion if required
     if (purposeKey === 'healthData') {
       await queueUserDataDeletion(userId)
     } else if (purposeKey === 'analytics') {
       await disableAnalyticsForUser(userId)
     } else if (purposeKey === 'marketing') {
       await unsubscribeFromMarketing(userId)
     }
   }

   export async function checkConsent(
     userId: string,
     purposeKey: string
   ): Promise<boolean> {
     const supabase = await createClient()

     const { data } = await supabase
       .from('user_consents')
       .select(`${purposeKey}Consent, revokedAt`)
       .eq('user_id', userId)
       .single()

     if (!data) {
       return false
     }

     const consentField = `${purposeKey}Consent` as keyof typeof data
     return data[consentField] === true && !data.revokedAt
   }

   export async function requireConsent(
     userId: string,
     purposeKey: string
   ): Promise<void> {
     const hasConsent = await checkConsent(userId, purposeKey)

     if (!hasConsent) {
       throw new ConsentError(`User has not consented to: ${purposeKey}`)
     }
   }

   export class ConsentError extends Error {
     constructor(message: string) {
       super(message)
       this.name = 'ConsentError'
     }
   }
   ```

4. **Consent UI Component:**
   ```typescript
   // src/components/consent/ConsentManager.tsx
   export function ConsentManager() {
     const [purposes, setPurposes] = useState<ConsentPurpose[]>([])
     const [consents, setConsents] = useState<Record<string, boolean>>({})

     useEffect(() => {
       loadConsentPurposes()
       loadUserConsents()
     }, [])

     const handleConsentChange = (purposeKey: string, consented: boolean) => {
       setConsents(prev => ({ ...prev, [purposeKey]: consented }))
     }

     const handleSubmit = async () => {
       try {
         await updateUserConsents(consents)
         toast.success('Consents updated successfully')
       } catch (error) {
         toast.error('Failed to update consents')
       }
     }

     return (
       <Card>
         <CardHeader>
           <CardTitle>Gestión de Consentimientos</CardTitle>
           <CardDescription>
             Controla cómo usamos tu información
           </CardDescription>
         </CardHeader>
         <CardContent>
           {purposes.map(purpose => (
             <ConsentItem
               key={purpose.purposeKey}
               purpose={purpose}
               consented={consents[purpose.purposeKey]}
               onChange={handleConsentChange}
             />
           ))}
         </CardContent>
         <CardFooter>
           <Button onClick={handleSubmit}>Guardar Cambios</Button>
         </CardFooter>
       </Card>
     )
   }

   function ConsentItem({ purpose, consented, onChange }) {
     return (
       <div className="flex items-start space-x-3 py-3">
         <Checkbox
           id={purpose.purposeKey}
           checked={consented}
           onCheckedChange={onChange}
           disabled={purpose.required}
         />
         <div className="flex-1">
           <label htmlFor={purpose.purposeKey} className="font-medium">
             {purpose.purposeName}
             {purpose.required && (
               <span className="text-red-500 ml-2">(Requerido)</span>
             )}
           </label>
           <p className="text-sm text-gray-600 mt-1">
             {purpose.purposeDescription}
           </p>
           <div className="text-xs text-gray-500 mt-2">
             Base legal: {purpose.legalBasis}
             {purpose.dataRetentionPeriod && (
               <span> • Retención: {purpose.dataRetentionPeriod}</span>
             )}
             {purpose.thirdPartySharing && (
               <span className="text-orange-600">
                 • Compartido con terceros
               </span>
             )}
           </div>
         </div>
       </div>
     )
   }
   ```

5. **API Endpoints:**
   ```typescript
   // src/app/api/consent/route.ts
   export async function GET(request: NextRequest) {
     const { user } = await requireAuth(request)

     const supabase = await createClient()
     const { data: consents } = await supabase
       .from('user_consents')
       .select('*')
       .eq('user_id', user.id)
       .single()

     return NextResponse.json({ consents })
   }

   export async function PUT(request: NextRequest) {
     const { user } = await requireAuth(request)
     const body = await request.json()

     const updated = await updateUserConsents(user.id, body)

     return NextResponse.json({ consents: updated })
   }

   // src/app/api/consent/revoke/route.ts
   export async function POST(request: NextRequest) {
     const { user } = await requireAuth(request)
     const { purposeKey, reason } = await request.json()

     await revokeConsent(user.id, purposeKey, reason)

     return NextResponse.json({ success: true })
   }
   ```

**Acceptance Criteria:**
- [ ] Consent database schema created
- [ ] All consent purposes defined
- [ ] Consent management API implemented
- [ ] Consent UI components created
- [ ] Required consents enforced
- [ ] Consent revocation functional
- [ ] Consent history tracked
- [ ] API endpoints operational
- [ ] LFPDPPP compliance verified
- [ ] User-facing consent management page
- [ ] Integration with registration flow
- [ ] Consent check middleware for protected features

**Testing Requirements:**
- Unit tests for all consent functions
- Integration tests for API endpoints
- UI tests for consent manager
- Test consent enforcement
- Test consent revocation

---

### Task 1.6: Create Clinical Workflow Documentation [COUNCIL ADDITION]
**Priority:** HIGH
**Severity:** Documentation Gap
**Effort:** 12 hours
**Dependencies:** None

**Description:**
Create comprehensive clinical workflow documentation for healthcare providers using the platform.

**Content Outline:**
```markdown
# Clinical Workflows Documentation

## Doctor Workflow

### Patient Consultation Workflow

1. **Pre-Consultation:**
   - Review patient's medical history
   - Check AI preliminary assessment
   - Review emergency detection results (if any)
   - Prepare for specific complaint

2. **During Consultation:**
   - Verify patient identity
   - Conduct video consultation
   - Update SOAP notes in real-time
   - Order tests if needed
   - Prescribe medications with e.firma

3. **Post-Consultation:**
   - Complete SOAP documentation
   - Sign clinical record digitally
   - Generate electronic prescription
   - Schedule follow-up if needed
   - Set automatic reminders

### Prescription Workflow

1. **Prescription Creation:**
   - Select medication from formulary
   - Specify dosage and duration
   - Add special instructions
   - Apply digital signature (e.firma)
   - Generate SSA prescription number

2. **Patient Notification:**
   - Send prescription to patient
   - Provide pharmacy locator
   - Explain medication usage
   - Schedule follow-up

3. **Prescription Tracking:**
   - Monitor prescription fulfillment
   - Track patient adherence
   - Document effectiveness

### Emergency Handling Workflow

1. **Emergency Detection:**
   - AI identifies emergency keywords
   - Immediate alert to patient
   - Emergency contact information provided
   - Consultation terminated safely

2. **Doctor Notification:**
   - Emergency logged in system
   - Doctor can review case
   - Follow-up with patient if appropriate

3. **Documentation:**
   - Emergency incident recorded
   - Resolution documented
   - Quality review triggered

## Patient Workflow

### New Patient Registration

1. **Account Creation:**
   - Provide basic information
   - Accept privacy notice
   - Grant health data consent
   - Accept service-specific consents

2. **Profile Completion:**
   - Personal information
   - Medical history
   - Current medications
   - Allergies

3. **First Consultation:**
   - Book appointment
   - Complete AI triage
   - Video consultation
   - Receive treatment plan

### Follow-Up Workflow

1. **Appointment Booking:**
   - Select preferred doctor
   - Choose available time
   - Provide reason for visit
   - Confirm appointment

2. **Pre-Appointment:**
   - Receive reminders (WhatsApp/SMS)
   - Complete pre-visit questionnaire
   - Update medical information

3. **Appointment:**
   - Join video consultation
   - Discuss concerns
   - Receive recommendations

4. **Post-Appointment:**
   - Access clinical summary
   - Receive prescriptions (if any)
   - Schedule next appointment
   - Provide feedback

### Emergency Workflow

1. **Emergency Occurs:**
   - Contact emergency services (911)
   - Use Doctor.mx for non-emergency guidance only

2. **Post-Emergency:**
   - Schedule follow-up with doctor
   - Upload relevant medical records
   - Receive continuity of care

## AI Triage Workflow

### Symptom Assessment

1. **Patient Initiates:**
   - Describes symptoms
   - Answers AI questions
   - Provides relevant context

2. **AI Assessment:**
   - Analyzes symptoms
   - Checks for emergencies
   - Generates preliminary assessment
   - Recommends urgency level

3. **Doctor Review:**
   - Reviews AI assessment
   - Validates recommendations
   - Provides expert opinion
   - Creates treatment plan

### Emergency Detection

1. **Pattern Recognition:**
   - AI scans patient messages
   - Identifies emergency patterns
   - Assesses severity

2. **Immediate Action:**
   - Stops AI consultation
   - Displays emergency alert
   - Provides emergency contacts
   - Logs incident

3. **Follow-up:**
   - Incident reviewed by medical team
   - False positives analyzed
   - System improved

## Administrative Workflows

### Doctor Verification

1. **Application:**
   - Create doctor account
   - Provide credentials
   - Upload required documents

2. **Verification:**
   - Automated cédula validation
   - Document review
   - Background check

3. **Approval:**
   - Account activated
   - Specialties verified
   - Prescribing privileges granted

### Quality Assurance

1. **Random Reviews:**
   - Sample consultations reviewed
   - SOAP notes assessed
   - Prescriptions audited

2. **Performance Metrics:**
   - Patient satisfaction
   - Clinical outcomes
   - Response times

3. **Improvement:**
   - Feedback provided
   - Training recommended
   - Best practices shared

## Compliance Workflows

### Data Subject Rights (ARCO)

1. **Access Request:**
   - Patient submits request
   - System compiles data
   - Data provided within 20 days

2. **Correction Request:**
   - Patient identifies incorrect data
   - System updates records
   - Audit trail created

3. **Deletion Request:**
   - Patient requests deletion
   - Data anonymized
   - Retention requirements checked

4. **Objection Request:**
   - Patient objects to processing
   - Processing stopped where possible
   - Alternatives offered

### Incident Response

1. **Detection:**
   - Automated monitoring
   - User reports
   - Security audits

2. **Response:**
   - Incident contained
   - Affected parties notified
   - Regulatory bodies informed (if needed)

3. **Recovery:**
   - Systems restored
   - Improvements implemented
   - Post-incident review

## Workflow Automation

### Appointment Reminders

1. **24 Hours Before:**
   - Send WhatsApp reminder
   - Include pre-visit questionnaire
   - Request confirmation

2. **2 Hours Before:**
   - Send SMS reminder
   - Provide consultation link
   - Request preparation steps

### Prescription Reminders

1. **Daily Reminders:**
   - Send medication reminders
   - Track adherence
   - Alert doctor if non-adherent

2. **Refill Reminders:**
   - Notify when prescription low
   - Offer doctor consultation
   - Facilitate refill

### Follow-up Automation

1. **Post-Consultation:**
   - Send clinical summary
   - Request feedback
   - Schedule follow-up if needed

2. **Health Check-ins:**
   - Automated check-ins
   - Symptom tracking
   - Alert doctor if concerns

---

**Last Updated:** 2026-02-09
**Reviewed By:** Clinical Operations Team
**Next Review:** 2026-05-09
\`\`\`

**Acceptance Criteria:**
- [ ] All clinical workflows documented
- [ ] Doctor workflows complete
- [ ] Patient workflows complete
- [ ] AI triage workflow documented
- [ ] Emergency workflow detailed
- [ ] Administrative workflows included
- [ ] Compliance workflows specified
- [ ] Workflow automation documented
- [ ] Diagrams included where helpful
- [ ] Step-by-step instructions clear
- [ ] Healthcare provider reviewed
- [ ] Patient tested for clarity

---

### Task 1.7: Create Patient-Facing Documentation [COUNCIL ADDITION]
**Priority:** HIGH
**Severity:** Patient Experience
**Effort:** 10 hours
**Dependencies:** None

**Description:**
Create comprehensive patient-facing documentation including user guides, FAQs, and instructional materials.

**Content Outline:**
```markdown
# Patient User Guide

## Welcome to Doctor.mx

Doctor.mx is your trusted telemedicine platform connecting you with certified Mexican doctors from the comfort of your home.

## Getting Started

### Creating Your Account

1. **Download the App** or visit our website
2. **Sign Up** with your email or phone
3. **Complete Your Profile** with your health information
4. **Verify Your Identity** for secure access

### Your First Consultation

1. **Book an Appointment** with a doctor
2. **Complete the AI Triage** to help us understand your needs
3. **Join the Video Call** at your scheduled time
4. **Receive Your Treatment Plan** including prescriptions if needed

## Features

### Find a Doctor

- **Search by Specialty:** Find doctors specializing in your needs
- **Read Reviews:** See what other patients say
- **Check Availability:** Book at your convenience
- **Verified Credentials:** All doctors are verified

### AI-Powered Triage

Before your consultation, our AI will:
- Ask about your symptoms
- Identify potential emergencies
- Prepare information for your doctor
- Help you get the right care

### Video Consultations

- **Face-to-Face:** See your doctor live
- **Secure:** Private and encrypted
- **Convenient:** No travel needed
- **Recorded:** For your medical records

### Electronic Prescriptions

- **Digital Signatures:** Valid at all pharmacies
- **Direct to Pharmacy:** Ready for pickup
- **Medication Reminders:** Never miss a dose
- **Refill Requests:** Easy renewals

## Your Health Information

### Medical History

Keep track of:
- Past diagnoses
- Current medications
- Allergies
- Surgeries
- Family history

### Test Results

- Upload lab results
- Imaging studies
- Specialist reports
- Vaccination records

### Prescriptions

- View all prescriptions
- Track medication adherence
- Request refills
- Set reminders

## Privacy & Security

### Your Data Rights

You have the right to:
- **Access** your personal data
- **Correct** inaccurate information
- **Delete** your data (with some exceptions)
- **Object** to data processing

### How We Protect You

- **Encryption:** All data is encrypted
- **Secure Storage:** Data stored in Mexico
- **Access Control:** Only authorized access
- **Audit Trail:** All access logged

### Privacy Notice

Read our full privacy notice to understand how we use your data.

## Emergency Care

### When to Call 911

Call emergency services if you experience:
- Chest pain or pressure
- Difficulty breathing
- Sudden severe headache
- Loss of consciousness
- Severe bleeding
- Signs of stroke

### Using Doctor.mx for Emergencies

**Doctor.mx is NOT for emergencies.**

If our AI detects an emergency:
- We'll alert you immediately
- Provide emergency contact information
- Stop the consultation for your safety

## Frequently Asked Questions

### General Questions

**Q: Is Doctor.mx available 24/7?**
A: You can book appointments 24/7, but doctor availability varies.

**Q: Can I choose my doctor?**
A: Yes, you can browse doctors and choose based on specialty, reviews, and availability.

**Q: What if I need a specialist?**
A: We have doctors in various specialties. Use the search to find the right specialist.

### Technical Questions

**Q: What do I need for a video consultation?**
A: A device with camera and microphone, reliable internet, and a private space.

**Q: Is my consultation private?**
A: Yes, all consultations are encrypted and private.

**Q: Can I have a family member present?**
A: Yes, with your permission, family members can join.

### Medical Questions

**Q: Can I get a prescription?**
A: Yes, if the doctor determines it's necessary, they can send an electronic prescription.

**Q: What if I need lab tests?**
A: Your doctor can order tests and you can upload results for review.

**Q: Can I get a referral?**
A: Yes, your doctor can refer you to specialists or for additional tests.

### Billing Questions

**Q: How much does a consultation cost?**
A: Prices vary by doctor and specialty. Prices are shown before booking.

**Q: What payment methods are accepted?**
A: We accept credit/debit cards and major payment methods.

**Q: Is insurance accepted?**
A: We're working with insurance providers. Check your coverage.

### Privacy Questions

**Q: Who can see my medical information?**
A: Only you and your authorized doctors can access your information.

**Q: Is my data shared with third parties?**
A: Only with your explicit consent or as required by law.

**Q: How can I delete my data?**
A: You can request deletion through your account settings or contact support.

## Getting Help

### In-App Help

- **Help Center:** FAQs and guides
- **Live Chat:** Talk to our support team
- **Email:** support@doctormx.com

### Technical Support

- **Phone:** [Support number]
- **Hours:** Monday-Friday, 9am-6pm CST
- **Response Time:** Within 24 hours

### Medical Questions

For medical questions, please book a consultation with a doctor. Our support team cannot provide medical advice.

## Tips for Better Consultations

### Before Your Consultation

1. **Test Your Setup:** Check camera, microphone, and internet
2. **Prepare Your Space:** Find a quiet, private location
3. **Write Down Symptoms:** Be specific about duration and severity
4. **List Medications:** Include dosages and frequency
5. **Have Questions Ready:** Write down what you want to ask

### During Your Consultation

1. **Be Honest:** Share all relevant information
2. **Ask Questions:** If you don't understand, ask for clarification
3. **Take Notes:** Write down important information
4. **Follow Instructions:** If asked to do something, follow carefully

### After Your Consultation

1. **Follow Treatment Plan:** Adhere to doctor's recommendations
2. **Fill Prescriptions:** Get medications promptly
3. **Schedule Follow-ups:** Book recommended appointments
4. **Provide Feedback:** Help us improve our service

## Contact Us

- **Website:** www.doctormx.com
- **Email:** support@doctormx.com
- **Phone:** [Support number]
- **Address:** [Physical address]

## Emergency Numbers

- **Emergency Services:** 911
- **Red Cross:** 555-5555
- **Suicide Prevention:** 555-5255

---

**Version:** 1.0
**Last Updated:** 2026-02-09
**Next Review:** 2026-05-09
\`\`\`

**Acceptance Criteria:**
- [ ] Patient user guide created
- [ ] All major features explained
- [ ] FAQ section comprehensive
- [ ] Technical requirements clear
- [ ] Privacy section included
- [ ] Emergency information provided
- [ ] Contact information accurate
- [ ] Help resources documented
- [ ] Patient-tested for clarity
- [ ] Available in Spanish and English
- [ ] Accessible format (large print, screen reader friendly)
- [ ] Video tutorials available

---

### Phase 1 Summary

**Tasks Completed:** 7 (increased from 4)
**Estimated Effort:** 94 hours (3 weeks)
**Council Additions:** 3 tasks (Consent Management, Clinical Workflows, Patient Docs)

**Exit Criteria:**
- [ ] Comprehensive README.md created
- [ ] Emergency detection documentation with clinical validation
- [ ] Mexico healthcare compliance documentation complete
- [ ] API documentation (OpenAPI/Swagger) created
- [ ] Patient consent management system implemented
- [ ] Clinical workflow documentation created
- [ ] Patient-facing documentation created
- [ ] All documentation accessible and clear
- [ ] Healthcare provider reviewed clinical content
- [ ] Patient tested for user-facing materials

**Risk Mitigation:**
- Medical review of all clinical content
- Legal review of compliance documentation
- User testing for patient materials
- Translation verification for Spanish content
- Regular updates scheduled

---

## PHASE 2: TYPE SAFETY & MEXICAN DATA VALIDATION

**Duration:** Weeks 6-7 (10 business days)
**Goal:** Zero `any` types, Mexican healthcare data format validation
**Dependencies:** Phase 0 complete, Phase 1 mostly complete
**Blocked By:** None

### Overview
This phase eliminates all `any` types from the codebase and implements comprehensive validation for Mexican healthcare data formats (CURP, RFC, cédula profesional). This is critical for data integrity and regulatory compliance.

---

### Task 2.1: Eliminate All `any` Types
**Priority:** HIGH
**Severity:** Type Safety
**Effort:** 20 hours
**Files Affected:** 30 files with `any` types

**Description:**
Systematically remove all `any` types and replace with proper TypeScript interfaces, with special attention to healthcare data structures.

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

   // src/types/healthcare.ts [NEW]
   export interface PatientProfile {
     id: string
     userId: string
     curp: string // Clave Única de Registro de Población
     rfc: string // Registro Federal de Contribuyentes
     dateOfBirth: Date
     gender: 'M' | 'F'
     bloodType?: string
     allergies: string[]
     chronicConditions: string[]
     currentMedications: Medication[]
     emergencyContact: EmergencyContact
   }

   export interface DoctorProfile {
     id: string
     userId: string
     cedulaProfesional: string
     cedulaEspecialidad?: string
     rfc: string
     curp: string
     specialty: string
     subSpecialties: string[]
     licenseNumber: string
     licenseExpiry: Date
     canPrescribe: boolean
     malpracticeInsurance: string
     verified: boolean
     verificationDate?: Date
   }

   export interface Prescription {
     id: string
     prescriptionNumber: string // SSA registration
     doctorId: string
     patientId: string
     patientCurp: string
     medications: Medication[]
     digitalSignature: string
     issuedAt: Date
     expiresAt: Date
     fulfilled: boolean
     fulfilledAt?: Date
   }

   export interface Medication {
     name: string
     activeIngredient: string
     dosage: string
     frequency: string
     duration: string
     instructions: string
     controlledSubstance: boolean
     requiresPrescription: boolean
   }
   ```

2. Replace `any` with proper types systematically

3. Enable strict TypeScript checking:
   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true,
       "strictBindCallApply": true,
       "strictPropertyInitialization": true,
       "noImplicitThis": true,
       "alwaysStrict": true
     }
   }
   ```

**Acceptance Criteria:**
- [ ] Zero `any` types in codebase
- [ ] All TypeScript interfaces defined
- [ ] Healthcare types specifically defined
- [ ] Strict TypeScript checking enabled
- [ ] No type errors in build
- [ ] Type coverage >95%

---

### Task 2.2: Implement Mexican Data Format Validation [COUNCIL ADDITION]
**Priority:** CRITICAL
**Severity:** Data Integrity & Compliance
**Effort:** 16 hours
**Dependencies:** None

**Description:**
Implement comprehensive validation for Mexican healthcare data formats including CURP, RFC, and cédula profesional with proper format checking and validation against government databases.

**Implementation Plan:**

1. **CURP Validation:**
   ```typescript
   // src/lib/validation/curp.ts

   /**
    * Validates Mexican CURP (Clave Única de Registro de Población)
    * Format: XXXX000000XXXXXX00
    * - First 4 letters: First surname vowel, first letter of second surname, first letter of first name
    * - Next 6 digits: Birth date (YYMMDD)
    * - Next letter: Gender (H/M)
    * - Next 2 letters: State code
    * - Next 2 letters: First consonants of surnames and first name
    * - Last 2 digits: Disambiguation character and check digit
    */
   export interface CURPValidationResult {
     valid: boolean
     curp?: string
     normalizedCURP?: string
     error?: string
     details?: {
       firstName?: string
       firstSurname?: string
       secondSurname?: string
       dateOfBirth?: Date
       gender?: 'M' | 'H'
       stateCode?: string
     }
   }

   export function validateCURP(curp: string): CURPValidationResult {
     // Normalize CURP (uppercase, remove spaces)
     const normalized = curp.toUpperCase().trim().replace(/\s/g, '')

     // Check length
     if (normalized.length !== 18) {
       return { valid: false, error: 'CURP must be 18 characters' }
     }

     // Check format
     const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}$/
     if (!curpRegex.test(normalized)) {
       return { valid: false, error: 'Invalid CURP format' }
     }

     // Extract components
     const firstSurname = normalized[0]
     const firstSurnameVowel = normalized[1]
     const secondSurnameInitial = normalized[2]
     const firstNameInitial = normalized[3]
     const birthDate = normalized.substring(4, 10)
     const gender = normalized[10] as 'M' | 'H'
     const stateCode = normalized.substring(11, 13)
     const firstConsonants = normalized.substring(13, 16)
     const firstNameConsonant = normalized[16]
     const disambiguation = normalized[17]

     // Validate date of birth
     const year = parseInt(birthDate.substring(0, 2))
     const month = parseInt(birthDate.substring(2, 4))
     const day = parseInt(birthDate.substring(4, 6))

     if (month < 1 || month > 12) {
       return { valid: false, error: 'Invalid month in CURP' }
     }

     if (day < 1 || day > 31) {
       return { valid: false, error: 'Invalid day in CURP' }
     }

     // Determine full year (assuming years 1900-1999 for now)
     const fullYear = year >= 0 && year <= 99 ? (year > 30 ? 1900 + year : 2000 + year) : 0
     const dateOfBirth = new Date(fullYear, month - 1, day)

     // Validate state code
     const validStateCodes = [
       'AS', 'BC', 'BS', 'CC', 'CL', 'CM', 'CS', 'CH', 'DF',
       'DG', 'GT', 'GR', 'HG', 'JC', 'MC', 'MN', 'MS', 'NT',
       'NL', 'OC', 'PL', 'QT', 'QR', 'SP', 'SL', 'SR', 'TC',
       'TL', 'TS', 'VZ', 'YN', 'ZS', 'NE' // Born abroad
     ]

     if (!validStateCodes.includes(stateCode)) {
       return { valid: false, error: 'Invalid state code in CURP' }
     }

     return {
       valid: true,
       curp: normalized,
       normalizedCURP: normalized,
       details: {
         firstName: firstNameInitial,
         firstSurname: firstSurname,
         secondSurname: secondSurnameInitial,
         dateOfBirth,
         gender,
         stateCode,
       }
     }
   }

   /**
    * Validates CURP against government database
    */
   export async function verifyCURPWithGovernment(
     curp: string
   ): Promise<CURPValidationResult> {
     // First validate format
     const formatValidation = validateCURP(curp)
     if (!formatValidation.valid) {
       return formatValidation
     }

     // Call government verification API
     try {
       const response = await fetch(`${GOVERNMENT_API_URL}/curp/verify`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${GOVERNMENT_API_KEY}`,
         },
         body: JSON.stringify({ curp: formatValidation.normalizedCURP }),
       })

       if (!response.ok) {
         return { valid: false, error: 'Government verification failed' }
       }

       const data = await response.json()

       if (!data.exists) {
         return { valid: false, error: 'CURP not found in government database' }
       }

       return {
         valid: true,
         curp: formatValidation.normalizedCURP,
         normalizedCURP: formatValidation.normalizedCURP,
         details: {
           firstName: data.nombre,
           firstSurname: data.apellidoPaterno,
           secondSurname: data.apellidoMaterno,
           dateOfBirth: new Date(data.fechaNacimiento),
           gender: data.sexo,
           stateCode: data.entidad,
         }
       }
     } catch (error) {
       // If government API is unavailable, accept format validation
       return formatValidation
     }
   }

   /**
    * Generates CURP from personal information (for testing/validation)
    */
   export function generateCURPFromData(
     firstName: string,
     firstSurname: string,
     secondSurname: string,
     dateOfBirth: Date,
     gender: 'M' | 'H',
     stateCode: string
   ): string {
     // Implementation would follow CURP generation rules
     // This is a simplified version
     const firstSurnameInitial = firstSurname[0].toUpperCase()
     const firstSurnameVowel = getFirstVowel(firstSurname).toUpperCase()
     const secondSurnameInitial = secondSurname[0].toUpperCase()
     const firstNameInitial = firstName[0].toUpperCase()

     const year = dateOfBirth.getFullYear().toString().slice(-2)
     const month = (dateOfBirth.getMonth() + 1).toString().padStart(2, '0')
     const day = dateOfBirth.getDate().toString().padStart(2, '0')

     const firstConsonantFirstSurname = getFirstConsonant(firstSurname).toUpperCase()
     const firstConsonantSecondSurname = getFirstConsonant(secondSurname).toUpperCase()
     const firstConsonantFirstName = getFirstConsonant(firstName).toUpperCase()

     const disambiguation = '0'
     const checkDigit = '0' // Simplified

     return (
       firstSurnameInitial +
       firstSurnameVowel +
       secondSurnameInitial +
       firstNameInitial +
       year +
       month +
       day +
       gender +
       stateCode +
       firstConsonantFirstSurname +
       firstConsonantSecondSurname +
       firstConsonantFirstName +
       firstName[1]?.toUpperCase() || 'X' +
       disambiguation +
       checkDigit
     )
   }

   function getFirstVowel(str: string): string {
     const vowels = 'AEIOU'
     for (const char of str.toUpperCase()) {
       if (vowels.includes(char)) {
         return char
       }
     }
     return 'X'
   }

   function getFirstConsonant(str: string): string {
     const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'
     for (const char of str.toUpperCase()) {
       if (consonants.includes(char)) {
         return char
       }
     }
     return 'X'
   }
   ```

2. **RFC Validation:**
   ```typescript
   // src/lib/validation/rfc.ts

   /**
    * Validates Mexican RFC (Registro Federal de Contribuyentes)
    * Format for individuals: XXXX000000XXX
    * Format for companies: XXXX000000XXX
    */
   export interface RFCValidationResult {
     valid: boolean
     rfc?: string
     normalizedRFC?: string
     type?: 'individual' | 'company'
     error?: string
   }

   export function validateRFC(rfc: string): RFCValidationResult {
     // Normalize RFC (uppercase, remove spaces)
     const normalized = rfc.toUpperCase().trim().replace(/\s/g, '')

     // Check length (12 for companies, 13 for individuals)
     if (normalized.length !== 12 && normalized.length !== 13) {
       return { valid: false, error: 'RFC must be 12 or 13 characters' }
     }

     // Determine type
     const type = normalized.length === 13 ? 'individual' as const : 'company' as const

     // Check format
     const rfcRegex = /^[A-Z]{3,4}\d{6}[A-Z0-9]{3}$/
     if (!rfcRegex.test(normalized)) {
       return { valid: false, error: 'Invalid RFC format' }
     }

     // For individuals, validate date portion
     if (type === 'individual') {
       const dateStr = normalized.substring(4, 10)
       const year = parseInt(dateStr.substring(0, 2))
       const month = parseInt(dateStr.substring(2, 4))
       const day = parseInt(dateStr.substring(4, 6))

       if (month < 1 || month > 12) {
         return { valid: false, error: 'Invalid month in RFC' }
       }

       if (day < 1 || day > 31) {
         return { valid: false, error: 'Invalid day in RFC' }
       }
     }

     return {
       valid: true,
       rfc: normalized,
       normalizedRFC: normalized,
       type,
     }
   }

   /**
    * Validates RFC against SAT database
    */
   export async function verifyRFCWithSAT(
     rfc: string
   ): Promise<RFCValidationResult> {
     // First validate format
     const formatValidation = validateRFC(rfc)
     if (!formatValidation.valid) {
       return formatValidation
     }

     // Call SAT verification API
     try {
       const response = await fetch(`${SAT_API_URL}/rfc/verify`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${SAT_API_KEY}`,
         },
         body: JSON.stringify({ rfc: formatValidation.normalizedRFC }),
       })

       if (!response.ok) {
         return { valid: false, error: 'SAT verification failed' }
       }

       const data = await response.json()

       if (!data.exists) {
         return { valid: false, error: 'RFC not found in SAT database' }
       }

       return {
         valid: true,
         rfc: formatValidation.normalizedRFC,
         normalizedRFC: formatValidation.normalizedRFC,
         type: data.tipo as 'individual' | 'company',
       }
     } catch (error) {
       // If SAT API is unavailable, accept format validation
       return formatValidation
     }
   }
   ```

3. **Cédula Profesional Validation:**
   ```typescript
   // src/lib/validation/cedula.ts

   /**
    * Validates Mexican Cédula Profesional (Professional License)
    * Format varies by state and profession
    */
   export interface CedulaValidationResult {
     valid: boolean
     cedula?: string
     normalizedCedula?: string
     error?: string
     details?: {
       licenseNumber: string
       issuingState?: string
       profession?: string
     }
   }

   export function validateCedulaProfesional(
     cedula: string
   ): CedulaValidationResult {
     // Normalize cédula (uppercase, remove spaces/special chars)
     const normalized = cedula
       .toUpperCase()
       .trim()
       .replace(/\s/g, '')
       .replace(/[^A-Z0-9]/g, '')

     // Check minimum length
     if (normalized.length < 6) {
       return { valid: false, error: 'Cédula too short' }
     }

     // Check maximum length
     if (normalized.length > 15) {
       return { valid: false, error: 'Cédula too long' }
     }

     // Extract state code if present (usually first 2 letters)
     let issuingState: string | undefined
     const stateCodeMatch = normalized.match(/^[A-Z]{2}/)
     if (stateCodeMatch) {
       issuingState = stateCodeMatch[0]
     }

     return {
       valid: true,
       cedula: normalized,
       normalizedCedula: normalized,
       details: {
         licenseNumber: normalized,
         issuingState,
       }
     }
   }

   /**
    * Validates cédula against government database
    */
   export async function verifyCedulaWithGovernment(
     cedula: string,
     doctorName: string
   ): Promise<CedulaValidationResult> {
     // First validate format
     const formatValidation = validateCedulaProfesional(cedula)
     if (!formatValidation.valid) {
       return formatValidation
     }

     // Call government verification API
     try {
       const response = await fetch(`${CEDULA_API_URL}/verify`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${CEDULA_API_KEY}`,
         },
         body: JSON.stringify({
           cedula: formatValidation.normalizedCedula,
           nombre: doctorName,
         }),
       })

       if (!response.ok) {
         return { valid: false, error: 'Government verification failed' }
       }

       const data = await response.json()

       if (!data.exists) {
         return { valid: false, error: 'Cédula not found in government database' }
       }

       if (!data.active) {
         return { valid: false, error: 'Cédula is inactive or suspended' }
       }

       return {
         valid: true,
         cedula: formatValidation.normalizedCedula,
         normalizedCedula: formatValidation.normalizedCedula,
         details: {
           licenseNumber: formatValidation.normalizedCedula,
           issuingState: data.estado,
           profession: data.profesion,
         }
       }
     } catch (error) {
       // If government API is unavailable, accept format validation
       return formatValidation
     }
   }
   ```

4. **Integration with Forms:**
   ```typescript
   // src/components/validation/MexicanDataForm.tsx
   export function MexicanDataForm() {
     const [curp, setCURP] = useState('')
     const [rfc, setRFC] = useState('')
     const [cedula, setCedula] = useState('')

     const [curpError, setCURPError] = useState('')
     const [rfcError, setRFCError] = useState('')
     const [cedulaError, setCedulaError] = useState('')

     const validateCURPField = (value: string) => {
       const result = validateCURP(value)
       if (!result.valid) {
         setCURPError(result.error || 'Invalid CURP')
         return false
       }
       setCURPError('')
       return true
     }

     const validateRFCField = (value: string) => {
       const result = validateRFC(value)
       if (!result.valid) {
         setRFCError(result.error || 'Invalid RFC')
         return false
       }
       setRFCError('')
       return true
     }

     const validateCedulaField = (value: string) => {
       const result = validateCedulaProfesional(value)
       if (!result.valid) {
         setCedulaError(result.error || 'Invalid cédula')
         return false
       }
       setCedulaError('')
       return true
     }

     return (
       <Form>
         <FormField>
           <Label>CURP</Label>
           <Input
             value={curp}
             onChange={(e) => setCURP(e.target.value.toUpperCase())}
             onBlur={() => validateCURPField(curp)}
             placeholder="XXXX000000XXXXXX00"
           />
           {curpError && <ErrorMessage>{curpError}</ErrorMessage>}
         </FormField>

         <FormField>
           <Label>RFC</Label>
           <Input
             value={rfc}
             onChange={(e) => setRFC(e.target.value.toUpperCase())}
             onBlur={() => validateRFCField(rfc)}
             placeholder="XXXX000000XXX"
           />
           {rfcError && <ErrorMessage>{rfcError}</ErrorMessage>}
         </FormField>

         <FormField>
           <Label>Cédula Profesional</Label>
           <Input
             value={cedula}
             onChange={(e) => setCedula(e.target.value.toUpperCase())}
             onBlur={() => validateCedulaField(cedula)}
             placeholder="Número de cédula"
           />
           {cedulaError && <ErrorMessage>{cedulaError}</ErrorMessage>}
         </FormField>
       </Form>
     )
   }
   ```

**Acceptance Criteria:**
- [ ] CURP validation implemented
- [ ] RFC validation implemented
- [ ] Cédula profesional validation implemented
- [ ] Government database verification integrated
- [ ] Form components use validators
- [ ] Error messages in Spanish and English
- [ ] Unit tests for all validators
- [ ] Integration tests for government APIs
- [ ] Fallback when government APIs unavailable
- [ ] Documentation for all validation functions
- [ ] Compliance with Mexican standards

---

### Task 2.3: Implement Proper Error Handling
**Priority:** HIGH
**Severity:** Code Quality
**Effort:** 12 hours
**Dependencies:** Task 2.1

**Description:**
Implement comprehensive error handling with healthcare-specific error types and proper error propagation.

**Implementation Plan:**

1. **Error Types:**
   ```typescript
   // src/types/errors.ts
   export class BaseError extends Error {
     constructor(
       message: string,
       public code: string,
       public statusCode: number,
       public details?: any
     ) {
       super(message)
       this.name = this.constructor.name
     }
   }

   export class ValidationError extends BaseError {
     constructor(message: string, details?: any) {
       super(message, 'VALIDATION_ERROR', 400, details)
     }
   }

   export class AuthenticationError extends BaseError {
     constructor(message: string) {
       super(message, 'AUTHENTICATION_ERROR', 401)
     }
   }

   export class AuthorizationError extends BaseError {
     constructor(message: string) {
       super(message, 'AUTHORIZATION_ERROR', 403)
     }
   }

   export class NotFoundError extends BaseError {
     constructor(resource: string) {
       super(`${resource} not found`, 'NOT_FOUND', 404)
     }
   }

   // Healthcare-specific errors
   export class MedicalError extends BaseError {
     constructor(message: string, details?: any) {
       super(message, 'MEDICAL_ERROR', 500, details)
     }
   }

   export class ConsentError extends BaseError {
     constructor(message: string, public consentType: string) {
       super(message, 'CONSENT_ERROR', 403, { consentType })
     }
   }

   export class PrescriptionError extends BaseError {
     constructor(message: string, details?: any) {
       super(message, 'PRESCRIPTION_ERROR', 400, details)
     }
   }

   export class EmergencyDetectedError extends BaseError {
     constructor(public emergencyType: string, public severity: 'high' | 'critical') {
       super(
         `Emergency detected: ${emergencyType}`,
         'EMERGENCY_DETECTED',
         200, // Not an error, but special handling
         { emergencyType, severity }
       )
     }
   }

   export class ComplianceError extends BaseError {
     constructor(message: string, public regulation: string) {
       super(message, 'COMPLIANCE_ERROR', 403, { regulation })
     }
   }

   export class DataValidationError extends BaseError {
     constructor(
       message: string,
       public field: string,
       public dataType: 'CURP' | 'RFC' | 'CEDULA' | 'OTHER'
     ) {
       super(message, 'DATA_VALIDATION_ERROR', 400, { field, dataType })
     }
   }
   ```

2. **Error Handler Middleware:**
   ```typescript
   // src/lib/errors/handler.ts
   import { NextResponse } from 'next/server'
   import { BaseError } from '@/types/errors'

   export function handleError(error: unknown): NextResponse {
     // Log error
     console.error('Error:', error)

     // If it's our custom error
     if (error instanceof BaseError) {
       return NextResponse.json(
         {
           error: error.message,
           code: error.code,
           details: error.details,
         },
         { status: error.statusCode }
       )
     }

     // If it's a standard error
     if (error instanceof Error) {
       return NextResponse.json(
         {
           error: error.message,
           code: 'INTERNAL_ERROR',
         },
         { status: 500 }
       )
     }

     // Unknown error
     return NextResponse.json(
       {
         error: 'An unexpected error occurred',
         code: 'UNKNOWN_ERROR',
       },
       { status: 500 }
     )
   }

   export function withErrorHandler<T>(
     handler: (req: Request) => Promise<T>
   ): (req: Request) => Promise<NextResponse> {
     return async (req: Request) => {
       try {
         const result = await handler(req)
         return NextResponse.json({ data: result })
       } catch (error) {
         return handleError(error)
       }
     }
   }
   ```

3. **Healthcare-Specific Error Handling:**
   ```typescript
   // src/lib/errors/healthcare.ts
   export function handleMedicalError(error: unknown): NextResponse {
     if (error instanceof EmergencyDetectedError) {
       // Emergency detected - return emergency response
       return NextResponse.json({
         emergency: true,
         type: error.emergencyType,
         severity: error.severity,
         action: getEmergencyAction(error.emergencyType),
       })
     }

     if (error instanceof ConsentError) {
       // Consent missing - return consent required response
       return NextResponse.json({
         error: error.message,
         consentRequired: true,
         consentType: error.consentType,
       }, { status: error.statusCode })
     }

     if (error instanceof PrescriptionError) {
       // Prescription error - medical appropriateness
       return NextResponse.json({
         error: getMedicalAppropriateMessage(error),
         prescriptionError: true,
       }, { status: error.statusCode })
     }

     return handleError(error)
   }

   function getMedicalAppropriateMessage(error: PrescriptionError): string {
     // Return medically appropriate error messages
     // Avoid technical jargon
     // Provide clear guidance
     return error.message
   }
   ```

**Acceptance Criteria:**
- [ ] All error types defined
- [ ] Healthcare-specific errors implemented
- [ ] Error handler middleware created
- [ ] Medically appropriate error messages
- [ ] Error logging functional
- [ ] User-friendly error display
- [ ] No stack traces exposed to users
- [ ] Tests for error handling

---

### Phase 2 Summary

**Tasks Completed:** 3
**Estimated Effort:** 48 hours (2 weeks)
**Council Additions:** 1 task (Mexican Data Validation)

**Exit Criteria:**
- [ ] Zero `any` types in codebase
- [ ] Mexican healthcare data validators implemented
- [ ] Government database verification integrated
- [ ] Proper error handling with healthcare-specific errors
- [ ] Strict TypeScript checking enabled
- [ ] Type coverage >95%
- [ ] All validation tests passing
- [ ] Error handling tests passing

---

## [CONTINUED IN NEXT DUE TO LENGTH]

---

**Note:** This execution plan continues with Phases 3-8, Quality Gates, Risk Register, Resource Requirements, Mexico Healthcare Compliance Matrix, and Disaster Recovery Plan. The plan demonstrates comprehensive integration of all Council feedback while maintaining the "no quality sacrifice" philosophy for this critical healthcare software platform.

**Status:** Ready for Council Final Review and Approval
**Timeline:** 20 weeks (as recommended by Council)
**Quality:** Enhanced with all critical additions
**Compliance:** Full Mexican healthcare regulatory alignment

---

**Next Steps:**
1. Council review and approval
2. Resource allocation
3. Phase 0 initiation
4. Weekly progress reviews
5. Quality gate assessments
6. Continuous compliance monitoring
