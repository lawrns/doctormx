# COUNCIL BRIEFING: Doctormx Feature Activation Strategy

**Date:** February 9, 2026
**Status:** Awaiting Council Decision
**Quality Mandate:** Quality is non-negotiable. No tradeoffs for speed or effort.

---

## EXECUTIVE SUMMARY

Doctormx has **significantly more built functionality** than is currently exposed to users. The codebase contains production-ready features that, if activated, could unlock immediate revenue and user value.

**The Council must decide:**
1. Which features to activate immediately
2. Which features need enhancement before activation
3. Implementation priority and sequencing
4. Quality standards for each feature

---

## QUALITY MANDATE (READ FIRST)

> "Quality is non-negotiable. We do not trade quality for speed. We do not trade quality for effort. If a feature requires weeks to build correctly, we take weeks. If it requires months, we take months. Patient safety depends on technical excellence."

### Council Composition (Quality-First)

| Council Member | Philosophy | Role |
|---------------|------------|------|
| **Visionary** | Excellence through ambition | Strategic direction |
| **Architect** | Excellence through design | System integrity |
| **Craftsperson** | Excellence through execution | Implementation quality |
| **Conservator** | Excellence through caution | Risk mitigation |

**EXCLUDED:** Pragmatist (would trade quality for speed/effort per user mandate)

### Decision Framework

When evaluating features, the Council MUST consider:
1. **Is it ready?** — Only yes if production-ready quality can be achieved
2. **Is it valuable?** — Does it solve a real user problem?
3. **Is it safe?** — Does it meet medical/ethical standards?
4. **Is it maintainable?** — Can we support this long-term?

**If any answer is "no," the feature is rejected or returns to development.**

---

## FEATURE INVENTORY

### 🔥 TIER 1: Goldmine Features (High Value, Built or Nearly Built)

#### 1. OTC Medication Recommendations
**File:** `src/lib/ai/otc.ts`
**Status:** ⚠️ **COMPLETELY UNUSED** — No imports anywhere

**What it does:**
- AI-powered OTC medication recommendations for symptoms
- Drug interaction checking
- Safe alternative suggestions
- Mexico-specific medication availability
- Prohibited medication filtering (antibiotics, opioids, etc.)
- Database persistence, history tracking

**Code Quality:** Production-ready. Includes safety validations, error handling, proper typing.

**Market Opportunity:** $50M+ OTC market in Mexico.

**Integration Required:** UI component, API route endpoint, consultation flow integration.

**Council Questions:**
- Should this be activated as a paid feature?
- What price point? ($50/consult suggested)
- What medical disclaimers are required?
- How do we handle liability for medication recommendations?

---

#### 2. Premium Features Billing System
**File:** `src/lib/premium-features.ts`
**Status:** ⚠️ **Built, not activated**

**What it does:**
- Individual feature pricing (image analysis, clinical copilot, transcription)
- Tier-based access (starter, pro, elite)
- Usage tracking and quota management
- Stripe checkout integration

**Features defined:**
| Feature | Price | Bundle |
|---------|-------|--------|
| Image Analysis | $50 | $400/10-pack |
| Clinical Copilot | $30/consult | $1200/50-pack |
| Extended Transcription | $20/hour | TBD |
| Priority AI Response | TBD | TBD |

**Code Quality:** Production-ready infrastructure.

**Integration Required:** Checkout UI, upgrade prompts, usage display.

**Council Questions:**
- Are the prices aligned with market?
- Should we offer annual discounts?
- How do we handle freemium vs paid?

---

#### 3. Medical Knowledge RAG System
**File:** `src/lib/ai/knowledge.ts`
**Status:** ⚠️ **Built, underutilized**

**What it does:**
- Vector-based semantic search (OpenAI embeddings)
- RAG (Retrieval Augmented Generation)
- Medical knowledge base with sources and citations
- Specialty-specific retrieval
- Full-text + vector hybrid search

**Code Quality:** Production-ready. Includes proper error handling, logging.

**Value:** Makes AI responses more accurate, citeable, and trustworthy.

**Integration Required:** Add to AI consultation endpoints, populate knowledge base.

**Council Questions:**
- What medical sources should be included?
- How do we verify knowledge quality?
- Should we allow doctors to contribute custom knowledge?

---

### 💎 TIER 2: Hidden Gems (Useful, Need Integration)

#### 4. Smart Doctor Referral Matching
**File:** `src/lib/ai/referral.ts`
**Status:** ✅ Partially used (PreConsultaChat only)

**What it does:**
- Intelligent doctor matching based on symptoms, urgency, location
- Scoring algorithm: rating (30%), experience (20%), language (15%), price (15%), urgency (10%), availability (10%)
- Returns top 3 matches with explanations
- Referral persistence and analytics

**Code Quality:** Production-ready.

**Value:** Improves conversion from AI triage to actual bookings.

**Integration Required:** Add to all consultation exits, not just pre-consulta.

---

#### 5. Pharmacy Affiliate Program
**Files:** `src/lib/pharmacy.ts`, `src/lib/pharmacy-scraper.ts`, `/api/pharmacy/*` (8 endpoints)

**Status:** ✅ Built, not marketed

**What it does:**
- Pharmacy affiliation system
- Earnings tracking and payments
- Recommendation engine for nearby pharmacies
- Commission-based revenue sharing

**Code Quality:** Production-ready.

**Value:** Commission revenue from pharmacy referrals (5-15% typical).

**Integration Required:** Pharmacy signup flow, affiliate dashboard, marketing.

---

#### 6. Second Opinion Service
**API Routes:** `/api/second-opinion/*` (4 endpoints)

**Status:** ✅ Built, not exposed in UI

**What it does:**
- Upload medical documents for second opinion
- AI analysis of medical cases
- Case tracking and status updates
- Connection to specialists

**Code Quality:** Built, may need enhancement.

**Value:** Premium service for complex cases ($100-200 per opinion).

**Integration Required:** Complete UI, specialist network, quality review process.

---

#### 7. SOAP Notes AI Generation
**API Routes:** `/api/soap-notes/*` (3 endpoints)
**Components:** `src/components/soap/*` (15 files)

**Status:** ✅ Built, underutilized

**What it does:**
- Generate SOAP notes from consultation transcript
- Real-time streaming generation
- Doctor approval workflow
- Export to EHR formats

**Code Quality:** Production-ready with excellent UI components.

**Value:** Saves doctors time, improves documentation quality.

**Integration Required:** Add to doctor consultation workflow.

---

### ⚙️ TIER 3: Partial Features (Started, Incomplete)

#### 8. Automated Follow-ups
**File:** `src/lib/followup.ts`, `/api/followups/*`

**Status:** ⚠️ Built, cron job status unknown

**What it does:**
- 24h follow-up notifications
- 7-day follow-up notifications
- Medication reminders
- Prescription refill reminders
- Chronic care check-ins

**Code Quality:** Built, needs testing.

**Integration Required:** Verify cron job is active, test notification delivery.

---

#### 9. WhatsApp Business API Integration
**File:** `src/lib/whatsapp-business-api.ts`

**Status:** ✅ Production-ready

**What it does:**
- Direct WhatsApp Business API integration (Meta)
- Template messaging (approved templates only)
- Message delivery tracking

**Code Quality:** Production-ready.

**Value:** 69.7M WhatsApp users in Mexico — massive engagement channel.

**Integration Required:** Template approval, messaging strategy.

---

## FEATURE READINESS ASSESSMENT

| Feature | Code Quality | UI Ready | API Ready | Tested | Overall |
|---------|--------------|----------|-----------|--------|---------|
| OTC Recommendations | ✅ Production | ❌ None | ❌ None | ⚠️ Minimal | **Needs Work** |
| Premium Billing | ✅ Production | ⚠️ Partial | ✅ Yes | ⚠️ Minimal | **Needs Work** |
| Medical RAG | ✅ Production | ❌ None | ✅ Yes | ⚠️ Minimal | **Needs Work** |
| Doctor Matching | ✅ Production | ✅ Yes | ✅ Yes | ✅ Yes | **Ready** |
| Pharmacy Affiliate | ✅ Production | ❌ None | ✅ Yes | ⚠️ Minimal | **Needs Work** |
| Second Opinion | ⚠️ Partial | ❌ None | ✅ Yes | ❌ None | **Needs Work** |
| SOAP Notes | ✅ Production | ✅ Yes | ✅ Yes | ⚠️ Minimal | **Ready** |
| Follow-ups | ✅ Production | ❌ None | ✅ Yes | ❌ None | **Needs Testing** |
| WhatsApp API | ✅ Production | ⚠️ Partial | ✅ Yes | ✅ Yes | **Ready** |

---

## IMPLEMENTATION COMPLEXITY

### Low Complexity (1-2 weeks)
- Doctor Matching expansion
- WhatsApp API templates
- SOAP notes workflow integration

### Medium Complexity (3-4 weeks)
- Premium billing UI
- Medical RAG integration
- Follow-up automation

### High Complexity (5-8 weeks)
- OTC Recommendations (regulatory, liability)
- Pharmacy Affiliate program (business development)
- Second Opinion (specialist network, QA)

---

## COUNCIL DECISION REQUEST

### For Each Tier 1 & Tier 2 Feature, the Council must decide:

1. **Activate Now** — Approve for immediate implementation
2. **Enhance First** — Return to development for improvements
3. **Defer** — Not a priority at this time
4. **Reject** — Not aligned with product vision

### Additional Questions:

**OTC Recommendations:**
- What medical disclaimers are required?
- How do we handle liability?
- What price point?
- Should this be subscription or per-use?

**Premium Billing:**
- Are the prices competitive?
- Should we offer annual discounts?
- What's the freemium strategy?

**Medical RAG:**
- What sources to include?
- How to verify quality?
- Allow custom doctor knowledge?

---

## QUALITY STANDARDS FOR ACTIVATION

Before any feature is approved for activation, it MUST meet:

1. **Functional Completeness** — All user flows work end-to-end
2. **Error Handling** — Graceful failures, user-friendly messages
3. **Performance** — Acceptable response times (<3s for API calls)
4. **Testing** — Unit tests for business logic, integration tests for APIs
5. **Documentation** — API docs, user guides, admin documentation
6. **Security** — Proper authentication, input validation, data protection
7. **Medical Safety** — Appropriate disclaimers, risk mitigation
8. **Monitoring** — Logging, metrics, alerting

**If any standard is not met, the feature returns to development.**

---

## RECOMMENDATION PATH (Subject to Council Approval)

### Phase 1: Quick Wins (2-3 weeks)
- Expand Doctor Matching to all consultation exits
- Integrate SOAP Notes into doctor workflow
- Activate WhatsApp templates for notifications

### Phase 2: Revenue Activation (4-6 weeks)
- Build and activate Premium Billing UI
- Integrate Medical RAG into all AI endpoints
- Test and activate Follow-up automation

### Phase 3: Strategic Features (8-12 weeks)
- Build OTC Recommendations (with legal review)
- Launch Pharmacy Affiliate program (with business development)
- Complete Second Opinion service (with specialist network)

---

## COUNCIL RESPONSE FORMAT

For each feature, provide:

```
[FEATURE NAME]

Decision: ACTIVATE NOW / ENHANCE FIRST / DEFER / REJECT

Rationale: [Why this decision]

Quality Requirements: [What must be met before activation]

Timeline: [Expected completion if enhancing]

Priority: [1-5, where 1 is highest]

Concerns: [Any concerns or conditions]
```

---

## APPENDIX: Full API Inventory

**100+ API endpoints** exist across:

- **AI** (20+): Consultation, copilot, transcription, vision, quota, triage
- **Appointments** (5): Booking, cancellation, video links
- **Chat** (4): Conversations, messages, read receipts
- **Doctor** (8): Availability, badges, onboarding, verification
- **Followups** (4): Schedule, send, callback, cron
- **Notifications** (4): Email templates for appointments, followups, receipts
- **Patient** (3): Appointments, medical history, profile
- **Pharmacy** (8): Affiliate, earnings, recommend, refer, search, sponsors, webhook
- **Premium** (6): Bill, checkout, purchase, status, usage
- **Prescriptions** (5): Create, preview, PDF, send
- **Questionnaire** (7): Start, message, state, summary, complete, upload
- **Referrals** (2): Create, retrieve
- **Second Opinion** (4): Create, retrieve, documents, submit
- **SOAP** (5): Consult, stream, notes generate, approve
- **Subscriptions** (6): Plans, upgrade, usage tracking
- **Webhooks** (3): Stripe, Twilio, WhatsApp
- **Analytics** (4): Admin, doctor, export, revenue
- **Cache** (2): Invalidate, stats

**Many endpoints are not exposed in the current UI.**

---

*This briefing is confidential and intended for Council use only.*

**Next Council Meeting:** Upon review
**Expected Outcome:** Prioritized feature activation roadmap with quality gates
