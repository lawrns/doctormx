# DOCTORMX EXECUTION PLAN - Council Approved Features
## Quality-First Parallel Development with Specialist Subagents

**Date:** February 9, 2026
**Council Session:** COUNCIL-2026-02-09
**Quality Standard:** Stripe-level (non-negotiable)
**Methodology:** AGENT_INSTRUCTIONS.md with parallel specialist subagents

---

## EXECUTION FRAMEWORK

### Specialist Subagents (Parallel Worktrees)

| Role | Worktree | Branch | Responsibilities |
|------|----------|--------|------------------|
| **Coordinator** | ~/doctormx | `main` | Orchestration, final review, git merges, quality gates |
| **Frontend Specialist** | worktrees/frontend | `feature/frontend-work` | UI components, pages, responsive design, user flows |
| **Backend Specialist** | worktrees/backend | `feature/backend-work` | API routes, business logic, integrations, services |
| **Database Specialist** | worktrees/database | `feature/database-work` | Schema, migrations, testing, data integrity |
| **AI/ML Specialist** | worktrees/ai | `feature/ai-work` | AI features, prompts, LLM integrations, clinical tools |

### Coordination Protocol

1. **Coordinator creates tasks** in TaskList with clear dependencies
2. **Specialists claim tasks** and work independently
3. **Specialists message Coordinator** when complete with summary
4. **Coordinator reviews** work and assigns verification if needed
5. **Quality Gate MUST pass** before task marked complete
6. **Coordinator merges to main** after all approvals

### Quality Gates (Non-Negotiable)

Before ANY feature is marked complete:
- [ ] Functional Testing (all user flows work end-to-end)
- [ ] Error Handling (graceful failures, user-friendly messages)
- [ ] Performance (<3s API response, smooth UI)
- [ ] Security (auth, input validation, data protection)
- [ ] Mobile Responsive (tested on real mobile viewports)
- [ ] Edge Cases (empty states, loading states, error states)
- [ ] Code Review (by Coordinator or peer specialist)
- [ ] Documentation (updated if needed)

---

## COUNCIL DECISIONS SUMMARY

### ✅ ACTIVATE NOW (Weeks 1-3)

| Feature | Owner | Timeline | Dependencies | Status |
|---------|-------|----------|--------------|--------|
| Doctor Matching Expansion | Backend + Frontend | 1-2 weeks | None | ⏳ Pending |
| SOAP Notes Integration | Frontend + AI | 1-2 weeks | None | ⏳ Pending |
| WhatsApp API Templates | Backend + Frontend | 2-3 weeks | Meta approval | ⏳ Pending |

### 🔧 ENHANCE FIRST (Weeks 1-12)

| Feature | Owner | Timeline | Dependencies | Status |
|---------|-------|----------|--------------|--------|
| Premium Billing UI | Frontend + Backend | 3-4 weeks | Tax compliance | ✅ **COMPLETED** 2026-02-09 |
| Follow-ups Verification | Backend + Database | 1-2 weeks | Cron setup | ⏳ Pending |
| Medical RAG | AI + Database | 4-6 weeks | Content sourcing | ✅ **COMPLETED** 2026-02-09 |
| OTC Recommendations | AI + Backend + Legal | 8-12 weeks | Legal/regulatory | ⏳ Pending |
| Second Opinion | Backend + Frontend + AI | 8-12 weeks | Specialist network | ⏳ Pending |

### 📋 BONUS COMPLETED (2026-02-09)

| Feature | Description | Status |
|---------|-------------|--------|
| Admin AI Monitoring Dashboard | `/admin/ai-dashboard` with metrics API, cost tracking, RAG stats | ✅ **COMPLETED** |
| Patient Red Flags Enhancement | 35+ patterns with condition-based detection, medication interactions, urgency scoring (1-10) | ✅ **COMPLETED** |

---

## COMPLETION LOG

### 2026-02-09 - Session Completed

**Phase 2: Revenue Activation - COMPLETE ✅**
- Task 2.1: Premium Billing UI
  - Stripe webhook handlers for subscription lifecycle
  - Public pricing page at `/pricing` (3 tiers: Starter $499, Pro $999, Elite $1999 MXN)
  - Subscription management endpoints
  - Mexico IVA (16%) tax compliance
  - Files: `src/app/api/webhooks/stripe/route.ts`, `src/app/pricing/page.tsx`
  - Commit: `feat: Phase 2 - Premium Billing UI`

**Phase 3: Content & Operations - PARTIAL COMPLETE ✅**
- Task 3.1: Medical Knowledge RAG
  - 50+ authoritative Mexican medical guidelines (expanded from 10)
  - Database migration: `010_medical_knowledge_rag.sql` with vector embeddings
  - RAG integrated into `/api/ai/consult` with citation support
  - Copilot updated to use centralized medical-knowledge module
  - Coverage: 15+ medical specialties (Cardiology, Endocrinología, Neumología, etc.)
  - Files: `src/lib/medical-knowledge/index.ts`, `supabase/migrations/010_medical_knowledge_rag.sql`
  - Commit: `feat: Phase 3 - Medical Knowledge RAG System`

**BONUS: Admin & Safety Infrastructure**
- Admin AI Monitoring Dashboard (`/admin/ai-dashboard`)
  - API metrics, cost tracking, provider breakdown, endpoint usage
  - Clinical Copilot stats, RAG knowledge base stats
  - Daily usage chart, CSV export
  - Commit: `feat: Phase 4 - Admin AI Monitoring Dashboard`

- Patient Red Flags Enhancement
  - 35+ red flag patterns (up from 25)
  - Condition-based detection (diabetes, hypertension, pregnancy, COPD, heart failure, CKD)
  - Medication interaction alerts (warfarin, insulin, beta-blockers, ACE inhibitors, SSRIs)
  - Vital signs integration (BP, SpO2, HR, temperature)
  - Urgency scoring algorithm (1-10)
  - Commit: `feat: Phase 5 - Patient Red Flags Enhancement`

---

## REMAINING WORK

---

## PHASE 1: QUICK WINS (Weeks 1-2)

### Task 1.1: Doctor Matching Expansion
**Owner:** Backend Specialist + Frontend Specialist
**Priority:** P1 (Council Approved)
**Estimated:** 1-2 weeks

**What:** Expand smart doctor referral matching from PreConsultaChat to all consultation exits

**Backend Specialist Tasks:**
1. Create API endpoint `/api/ai/referral/create-from-consultation` (reuse existing logic)
2. Add referral context tracking for different consultation types
3. Add analytics endpoint for tracking referral success rate
4. Rate limiting for referral API (prevent abuse)
5. Integration tests for referral creation and retrieval

**Frontend Specialist Tasks:**
1. Create `RecommendedDoctorsCard` component (reuse existing styles)
2. Add recommendation display to SOAP completion flow
3. Add recommendation display to emergency triage completion
4. Add recommendation display to AI consultation summary
5. Mobile responsive design for doctor cards
6. Loading and error states

**Quality Gates:**
- [ ] All consultation exits show doctor recommendations
- [ ] Recommendations are labeled as "AI suggestions"
- [ ] Patient can still browse all doctors
- [ ] Mobile responsive on all recommendation displays
- [ ] Success rate tracking is working
- [ ] Rate limiting prevents abuse

**Verification:** Coordinator reviews all consultation exits, tests recommendations appear correctly

---

### Task 1.2: SOAP Notes Integration
**Owner:** Frontend Specialist + AI Specialist
**Priority:** P1 (Council Approved)
**Estimated:** 1-2 weeks

**What:** Integrate SOAP Notes AI generation into doctor's post-consultation workflow

**Frontend Specialist Tasks:**
1. Create SOAP notes display component in consultation completion
2. Add "Generate SOAP Notes" button to consultation summary
3. Add loading state with streaming display
4. Add edit capability for generated notes
5. Add "Approve & Save" button
6. Add export to PDF functionality
7. Mobile responsive design

**AI Specialist Tasks:**
1. Create API endpoint `/api/soap-notes/from-consultation`
2. Integrate with existing SOAP generation logic
3. Add consultation context gathering
4. Ensure streaming generation works
5. Add version control for notes

**Quality Gates:**
- [ ] SOAP notes appear in consultation completion flow
- [ ] Generation is fast (<5s) and streaming
- [ ] Notes are editable before saving
- [ ] Approved notes are saved to patient record
- [ ] Export to PDF works
- [ ] Mobile responsive
- [ ] Audit trail is working

**Verification:** Coordinator tests full flow: consultation → generate → edit → approve → save

---

### Task 1.3: Follow-ups Cron Verification
**Owner:** Backend Specialist + Database Specialist
**Priority:** P2 (Council Approved)
**Estimated:** 1 week

**What:** Verify follow-ups cron job is active and working correctly

**Backend Specialist Tasks:**
1. Check if cron job is configured on production server
2. Test follow-up creation and sending
3. Add error monitoring and alerting
4. Add retry logic for failed sends
5. Verify opt-out mechanism works

**Database Specialist Tasks:**
1. Verify followups table schema is correct
2. Add indexes for performance
3. Verify patient consent tracking
4. Add audit trail for follow-ups

**Quality Gates:**
- [ ] Cron job is active and scheduled
- [ ] Follow-ups are being created correctly
- [ ] Notifications are being delivered
- [ ] Failed sends are retried
- [ ] Opt-out mechanism works
- [ ] Consent tracking is working
- [ ] Error monitoring is active

**Verification:** Coordinator monitors cron job execution, verifies test follow-ups are delivered

---

## PHASE 2: REVENUE ACTIVATION (Weeks 3-4)

### Task 2.1: Premium Billing UI
**Owner:** Frontend Specialist + Backend Specialist
**Priority:** P1 (Council Approved)
**Estimated:** 3-4 weeks

**What:** Complete premium billing UI and activate subscription revenue

**Frontend Specialist Tasks:**
1. Create pricing page (`/pricing` or `/premium`)
2. Create checkout flow component
3. Create upgrade prompt components
4. Create usage display dashboard
5. Create subscription management page
6. Mobile responsive design throughout
7. Loading and error states

**Backend Specialist Tasks:**
1. Create API endpoint `/api/premium/checkout` (Stripe integration)
2. Create `/api/premium/usage` endpoint
3. Create `/api/subscriptions/upgrade` endpoint
4. Add webhooks for Stripe events
5. Implement usage tracking for all premium features
6. Add tax calculation for Mexico (IVA 16%)

**Database Specialist Tasks:**
1. Verify premium_features_usage table schema
2. Add indexes for performance
3. Create migration for billing history
4. Add subscription status tracking

**Quality Gates:**
- [ ] Pricing page is clear and compelling
- [ ] Checkout flow is smooth and error-free
- [ ] Upgrade prompts appear at right moments
- [ ] Usage dashboard is accurate
- [ ] Subscription management works
- [ ] Mobile responsive throughout
- [ ] Stripe webhooks handle all events
- [ ] Mexico tax is calculated correctly
- [ ] All premium features track usage

**Verification:** Coordinator runs full test purchase, verifies all states, checks tax calculation

---

## PHASE 3: CONTENT & OPERATIONS (Weeks 5-8)

### Task 3.1: Medical Knowledge RAG
**Owner:** AI Specialist + Database Specialist
**Priority:** P2 (Council Approved)
**Estimated:** 4-6 weeks

**What:** Populate medical knowledge base and integrate RAG into all AI endpoints

**AI Specialist Tasks:**
1. Create content sourcing plan (authoritative medical sources)
2. Create content management system for knowledge base
3. Populate initial knowledge base with 50-100 documents
4. Integrate RAG into `/api/ai/consult` endpoint
5. Integrate RAG into `/api/ai/copilot` endpoints
6. Add citation display to AI responses
7. Add knowledge search endpoint for admins

**Database Specialist Tasks:**
1. Verify medical_knowledge table schema
2. Add vector similarity search function
3. Add indexes for performance
4. Create knowledge admin interface
5. Create content approval workflow

**Frontend Specialist Tasks:**
1. Create knowledge admin page
2. Add citation display to AI responses
3. Add knowledge search interface
4. Mobile responsive design

**Quality Gates:**
- [ ] Knowledge base has 50+ authoritative documents
- [ ] Content approval workflow is working
- [ ] RAG is integrated into all AI endpoints
- [ ] Citations appear in AI responses
- [ ] Knowledge can be searched by admins
- [ ] Vector search performs well (<1s)
- [ ] Mobile responsive admin interface

**Verification:** Coordinator tests AI responses include citations, tests knowledge search

---

### Task 3.2: WhatsApp API Templates
**Owner:** Backend Specialist + Frontend Specialist
**Priority:** P1 (Council Approved)
**Estimated:** 2-3 weeks

**What:** Submit WhatsApp templates for Meta approval and implement messaging

**Backend Specialist Tasks:**
1. Draft WhatsApp message templates for:
   - Appointment confirmation
   - Appointment reminder (24h before)
   - Follow-up reminder
   - Prescription ready notification
2. Submit templates to Meta for approval
3. Create `/api/whatsapp/send-template` endpoint
4. Add opt-in consent tracking
5. Add opt-out mechanism
6. Add message delivery tracking
7. Add error monitoring

**Frontend Specialist Tasks:**
1. Create WhatsApp opt-in consent flow
2. Add opt-out mechanism to user settings
3. Add WhatsApp notification preferences
4. Mobile responsive design

**Quality Gates:**
- [ ] Templates are submitted to Meta
- [ ] Opt-in consent flow is working
- [ ] Opt-out mechanism is functional
- [ ] Message delivery tracking works
- [ ] Error monitoring is active
- [ ] Mobile responsive
- [ ] Privacy requirements are met

**Verification:** Coordinator tests full WhatsApp opt-in flow, verifies messages are sent correctly

---

## PHASE 4: STRATEGIC FEATURES (Weeks 9-12) - Council Review Required

### Task 4.1: OTC Recommendations
**Owner:** AI Specialist + Backend Specialist + Legal (External)
**Priority:** P3 (Council Approved with Legal Review)
**Estimated:** 8-12 weeks (legal/regulatory bottleneck)

**What:** Prepare OTC medication recommendations for activation with full legal/regulatory compliance

**AI Specialist Tasks:**
1. Create comprehensive unit tests for safety validations
2. Create integration tests for recommendation flows
3. Medical review of all prompts with external advisor
4. Red-teaming for adversarial inputs
5. Add monitoring and alerting for safety incidents
6. Add rate limiting and abuse prevention
7. Add user consent tracking

**Backend Specialist Tasks:**
1. Create `/api/ai/otc/recommend` endpoint
2. Create `/api/ai/otc/check-interactions` endpoint
3. Add rate limiting
4. Add user consent tracking
5. Add recommendation history tracking
6. Add adverse event reporting

**Legal/Regulatory (External):**
1. Legal review of liability exposure
2. COFEPRIS regulatory guidance
3. Insurance coverage confirmation
4. Medical advisory board review
5. Gradual rollout plan with monitoring

**Frontend Specialist Tasks:**
1. Create OTC recommendation UI component
2. Add medical disclaimers and warnings
3. Add user consent flow
4. Add recommendation history display
5. Mobile responsive design

**Quality Gates:**
- [ ] Legal review is complete
- [ ] COFEPRIS requirements are clarified
- [ ] Insurance coverage is confirmed
- [ ] Medical advisory board approves
- [ ] All safety tests pass
- [ ] Rate limiting works
- [ ] Consent tracking is working
- [ ] Disclaimers are prominent
- [ ] Monitoring is active
- [ ] Rollback plan is tested

**Verification:** Council reviews all legal/regulatory requirements before activation

---

### Task 4.2: Second Opinion Service
**Owner:** Backend Specialist + Frontend Specialist + AI Specialist
**Priority:** P3 (Council Approved)
**Estimated:** 8-12 weeks

**What:** Complete Second Opinion service with specialist network

**Backend Specialist Tasks:**
1. Create specialist onboarding system
2. Create specialist credential verification
3. Create case assignment logic
4. Create quality review workflow
5. Create specialist payment processing
6. Add second opinion API endpoints
7. Add case tracking and status updates

**Frontend Specialist Tasks:**
1. Create specialist signup flow
2. Create case upload UI
3. Create case tracking dashboard
4. Create payment UI for second opinions
5. Create quality review interface
6. Mobile responsive design

**AI Specialist Tasks:**
1. Create AI case summarization for specialists
2. Create case-matching algorithm for specialists
3. Create quality scoring for opinions

**Database Specialist Tasks:**
1. Create second_opinions schema
2. Create specialists table
3. Create cases table
4. Create opinions table
5. Create migrations

**Quality Gates:**
- [ ] Specialist signup flow is working
- [ ] Credential verification is robust
- [ ] Case upload works smoothly
- [ ] Case assignment is fair and efficient
- [ ] Quality review workflow is functional
- [ ] Payment processing works
- [ ] Mobile responsive throughout
- [ ] Medical oversight is in place

**Verification:** Coordinator tests full second opinion flow from upload to specialist response

---

## VERIFICATION & AUDIT PROTOCOL

### Pre-Integration Audit (Before Any Merge)

**Coordinator MUST verify:**
1. **Code Quality:** No TypeScript errors, no ESLint warnings
2. **Testing:** Unit tests pass, integration tests pass
3. **Mobile:** Test on real mobile viewport (Chrome DevTools)
4. **Edge Cases:** Empty states, loading states, error states
5. **Security:** Authenticated endpoints, input validation
6. **Performance:** API response time <3s, UI smooth
7. **Regression:** Existing features still work

### Post-Sprint Review (After Each Phase)

1. **Consolidation:** Remove unused imports, delete dead code
2. **Build:** `npm run build` without errors
3. **Functionality:** Test all critical user flows
4. **Mobile:** Test all new features on mobile
5. **Documentation:** Update PROJECT.md with learnings

### Zero-Error Verification

**For each completed task, a peer specialist MUST verify:**
1. [ ] Code review completed
2. [ ] All edge cases handled
3. [ ] No console errors
4. [ ] No TypeScript errors
5. [ ] No ESLint warnings
6. [ ] Mobile responsive verified
7. [ ] Accessibility checked (basic ARIA)
8. [ ] Loading states smooth
9. [ ] Error states user-friendly
10. [ ] No loose ends (TODOs, FIXMEs, console.logs)

**If any verification fails:** Return to specialist with specific feedback

---

## PHASE 2 CLEANUP REVIEW (Verify Nothing Was Missed)

### Cleanup Completed (from earlier session):
- ✅ Root directory: 80+ → 8 files
- ✅ 120 files removed from ~/ tracking (security fix)
- ✅ Build artifacts removed from git
- ✅ Documentation organized by content
- ✅ .gitignore updated

### Items to Verify:

1. [ ] Worktrees cleanup deferred (documented, not actioned)
2. [ ] API key rotation action item (F001_API_KEY_ROTATION.md) — **PRIORITY**
3. [ ] No tracked files remain in `~/`
4. [ ] No build artifacts in git
5. [ ] All documentation is properly organized

---

## TASK BREAKDOWN FOR SPECIALISTS

### Frontend Specialist Tasks Summary

| Task | Phase | Files | Est. |
|------|-------|-------|------|
| Recommended Doctors UI | 1 | components/RecommendedDoctorsCard.tsx | 3d |
| SOAP Notes Integration | 1 | consultation/ pages, SOAP components | 5d |
| Premium Billing UI | 2 | pricing page, checkout, usage dashboard | 10d |
| WhatsApp Opt-in Flow | 3 | auth/whatsapp-consent, settings | 3d |
| OTC Recommendations UI | 4 | medical/otc-recommendations | 5d |
| Second Opinion UI | 4 | second-opinion/* | 10d |

### Backend Specialist Tasks Summary

| Task | Phase | Files | Est. |
|------|-------|-------|------|
| Doctor Matching API | 1 | api/referral/* expansion | 3d |
| SOAP Notes API | 1 | api/soap-notes/* integration | 3d |
| Follow-ups Verification | 1 | cron/followups, monitoring | 2d |
| Premium Billing API | 2 | api/premium/*, webhooks/stripe | 7d |
| WhatsApp Templates | 3 | api/whatsapp/* templates | 4d |
| OTC Recommendations API | 4 | api/ai/otc/* | 10d |
| Second Opinion API | 4 | api/second-opinion/* | 10d |

### Database Specialist Tasks Summary

| Task | Phase | Files | Est. |
|------|-------|-------|------|
| Follow-ups Schema | 1 | followups table, indexes | 2d |
| Premium Billing Schema | 2 | subscriptions, usage tables | 3d |
| Medical RAG Schema | 3 | medical_knowledge, vectors | 3d |
| Second Opinion Schema | 4 | specialists, cases, opinions | 3d |

### AI/ML Specialist Tasks Summary

| Task | Phase | Files | Est. |
|------|-------|-------|------|
| SOAP Notes AI | 1 | api/soap-notes/* integration | 2d |
| Medical RAG Integration | 3 | ai/knowledge.ts, ai/router.ts | 10d |
| OTC Recommendations | 4 | ai/otc.ts enhancements, testing | 10d |
| Second Opinion AI | 4 | ai/second-opinion/* | 5d |

---

## QUALITY STANDARDS (Stripe-Level)

### Frontend Quality Checklist
- [ ] All states: loading, empty, error, success
- [ ] Mobile-first: tested on 320px, 375px, 414px viewports
- [ ] Smooth transitions: no janky animations
- [ ] Edge cases: no data, network error, timeout
- [ ] Accessibility: basic ARIA, keyboard navigation
- [ ] Performance: First Contentful Paint <1.5s
- [ ] SEO: meta tags, semantic HTML

### Backend Quality Checklist
- [ ] Error handling: all endpoints handle errors gracefully
- [ ] Input validation: all inputs validated and sanitized
- [ ] Rate limiting: all public endpoints protected
- [ ] Logging: all actions logged for debugging
- [ ] Monitoring: metrics and alerting configured
- [ ] Security: authenticated where required
- [ ] Performance: API response time <3s p95

### Database Quality Checklist
- [ ] Indexes: all queries use appropriate indexes
- [ ] Constraints: data integrity enforced
- [ ] Migrations: reversible and tested
- [ ] Backup: critical data backed up
- [ ] Privacy: sensitive data encrypted

---

## COORDINATION CHECKLIST

### Before Starting Work:
1. [ ] Verify worktrees exist: `git worktree list`
2. [ ] Update all worktrees: `git pull` in each
3. [ ] Create TaskList with all tasks and dependencies
4. [ ] Assign specialists to initial tasks
5. [ ] Verify each specialist has their worktree configured

### During Work:
1. [ ] Coordinator monitors progress via TaskList
2. [ ] Specialists message when blocked or complete
3. [ ] Coordinator reviews work and approves or requests changes
4. [ ] Peer specialist verification for critical tasks
5. [ ] Quality gate checklist before marking complete

### After Each Phase:
1. [ ] Coordinator runs pre-integration audit
2. [ ] Fix any issues found
3. [ ] Merge worktree branches to main
4. [ ] Run post-sprint review checklist
5. [ ] Document learnings in PROJECT.md

---

## SUCCESS CRITERIA

### Phase 1 Success (Weeks 1-2)
- Doctor matching appears in all consultation exits
- SOAP notes can be generated and saved from consultations
- Follow-ups cron job is verified active
- All features work on mobile
- Zero critical bugs

### Phase 2 Success (Weeks 3-4)
- Premium billing UI is complete and functional
- Test purchase flow works end-to-end
- Mexico tax is calculated correctly
- All premium features track usage
- Zero critical bugs

### Phase 3 Success (Weeks 5-8)
- Medical knowledge base has 50+ documents
- RAG is integrated into AI endpoints
- Citations appear in AI responses
- WhatsApp templates are approved
- Zero critical bugs

### Phase 4 Success (Weeks 9-12)
- OTC recommendations have legal/regulatory approval
- Second opinion service is complete
- Specialist network is established
- Quality oversight is in place
- Zero critical bugs

---

## RISK MITIGATION

### Technical Risks
- **Risk:** Worktrees merge conflicts
- **Mitigation:** Clear file ownership matrix, regular coordination

- **Risk:** Mobile responsive issues
- **Mitigation:** Test on real mobile viewports early and often

- **Risk:** API performance degradation
- **Mitigation:** Load testing before activation, monitoring

### Operational Risks
- **Risk:** Specialist availability
- **Mitigation:** TaskList tracking, coordinator oversight

- **Risk:** Quality gate bottlenecks
- **Mitigation:** Parallel verification, clear criteria

### Business Risks
- **Risk:** Legal/regulatory delays
- **Mitigation:** Start legal review early (OTC recommendations)

- **Risk:** Low user adoption
- **Mitigation:** Gradual rollout, monitoring, iteration

---

## NEXT STEPS

1. **Immediate:** Coordinator verifies worktrees exist and creates TaskList
2. **Week 1:** Start Phase 1 tasks in parallel
3. **Week 2:** Complete Phase 1, begin Phase 2 preparation
4. **Week 3:** Begin Phase 2 tasks
5. **Ongoing:** Regular Council reviews for strategic features

---

*This execution plan is approved by the Quality-First Council*
*Quality is non-negotiable. We ship excellence or nothing at all.*

**Coordinator:** [To be assigned - Main repository]
**Specialists:** Frontend, Backend, Database, AI/ML [To work in parallel worktrees]

---

*Generated: 2026-02-09*
*Based on: COUNCIL-2026-02-09 session*
*Methodology: AGENT_INSTRUCTIONS.md*
