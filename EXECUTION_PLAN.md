# DOCTORY EXECUTION PLAN

## Autonomous Implementation Roadmap

**Generated:** January 2026 **Target:** $20M Year 1 Revenue from 10,000+ Mexican
Doctors

---

## CODEBASE ASSESSMENT

### Current State

- **Stack:** Next.js 16 App Router, Supabase, Stripe, React 19
- **Database:** 135 tables already exist (doctors, subscriptions, appointments,
  etc.)
- **Components:** 42 UI components using custom design system
- **Lib modules:** 28 feature modules (subscription, whatsapp, pharmacy, etc.)
- **Status:** Ready for testing per PROJECT_STATUS.md

### Existing Capabilities

- ✅ Doctor registration and onboarding
- ✅ Subscription tiers (starter/pro/elite at 499/999/1499 MXN)
- ✅ Appointment booking and payments
- ✅ AI features (copilot, vision analysis)
- ✅ WhatsApp notifications
- ✅ Pharmacy integration
- ✅ Prescription management

### Gaps to Address (from Master Plan)

1. **Second Opinion System** — Not yet implemented
2. **National Directory with SEO** — Programmatic pages needed
3. **Doctor Claim Flow** — For unclaimed profiles
4. **Referral Network** — Doctor-to-doctor referrals
5. **AI SOAP Notes** — Voice transcription → structured notes
6. **Feature Flags** — For safe rollouts
7. **Enhanced Observability** — Error tracking, audit logs
8. **Domain Module Structure** — Cleaner architecture

---

## PR BATCH SEQUENCE

### PR #1: Domain Module Architecture + Feature Flags

**Scope:** 1-2 days | **Priority:** Foundation

### PR #2: Second Opinion Database Schema

**Scope:** 1 day | **Priority:** Revenue feature

### PR #3: Second Opinion Intake Flow (UI + API)

**Scope:** 2 days | **Priority:** Revenue feature

### PR #4: Doctor Directory Claim Flow

**Scope:** 1-2 days | **Priority:** Growth

### PR #5: Programmatic SEO Pages

**Scope:** 2 days | **Priority:** Growth/SEO

### PR #6: Doctor Referral Network

**Scope:** 1-2 days | **Priority:** Retention

### PR #7: AI SOAP Notes Foundation

**Scope:** 2 days | **Priority:** Value prop

### PR #8: Enhanced Observability

**Scope:** 1 day | **Priority:** Operations

---

## MILESTONES

### Week 1-2: Foundation

- [ ] PR #1: Domain modules + feature flags
- [ ] PR #2: Second opinion schema

### Month 1: Core Features

- [ ] PR #3: Second opinion UI
- [ ] PR #4: Doctor claim flow
- [ ] PR #5: SEO pages

### Month 2-3: Growth Features

- [ ] PR #6: Referral network
- [ ] PR #7: AI SOAP notes
- [ ] PR #8: Observability

---

## ASSUMPTIONS

1. Current database schema is production-ready
2. Stripe integration is functional
3. Supabase RLS policies are correctly configured
4. WhatsApp Business API credentials available
5. OpenAI API key configured for AI features

## DEPENDENCIES

1. **Second Opinion:** Requires doctors table, subscriptions
2. **SEO Pages:** Requires specialties, cities data
3. **AI SOAP Notes:** Requires OpenAI Whisper + GPT-4
4. **Feature Flags:** Can use simple DB-backed flags initially

## ACCEPTANCE CRITERIA

Each PR must:

1. Pass TypeScript compilation (`npm run typecheck`)
2. Pass ESLint (`npm run lint`)
3. Include rollback procedure
4. Have test plan documented
5. Leave app in runnable state
