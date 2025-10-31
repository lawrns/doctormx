# MVP Audit Implementation Summary

**Branch:** `feature/mvp-audit-implementation`  
**Date:** October 31, 2025  
**Status:** 🚧 In Progress

---

## Overview

Implementing critical MVP improvements based on audit feedback to enable:
1. **Image-in-chat** - AI can analyze medical images within consultations
2. **Doctor subscriptions** - $499 MXN/mo for directory visibility
3. **Route consistency** - Canonical routing structure
4. **Production readiness** - CORS, environment, and security hardening

---

## ✅ Completed

### 1. Database Schema (Migration 027)
**File:** `database/migrations/027_mvp_audit_improvements.sql`

**Added Tables:**
- `plans` - Subscription plans for doctors
- `subscriptions` - Active doctor subscriptions  
- `consults` - Patient AI consultations with triage
- `messages` - Chat messages (user/assistant/system)
- `message_images` - Images uploaded in chat with vision analysis
- `red_flags_detected` - Emergency symptom tracking
- `patient_transactions` - Patient purchases and payments

**Key Features:**
- RLS policies for data security
- Functions: `decrement_free_questions()`, `add_questions_to_user()`, `is_doctor_listable()`
- Indexes for performance
- Triggers for timestamps

**Doctor Plans Seeded:**
- Discovery: $499/mo (15% commission, basic features)
- Professional: $499/mo (10% commission, advanced features) ⭐
- Premium: $799/mo (8% commission, dedicated manager)

### 2. Chat with Images API
**File:** `server/providers/chatWithImages.ts`

**Features Implemented:**
- Multi-image upload (up to 5 images, 10MB each)
- Image optimization with Sharp (resize to 1920px, 85% quality)
- Supabase Storage integration (`consult-images` bucket)
- SHA256 hashing for deduplication
- OpenAI Vision API integration for image analysis
- Red flag detection for emergencies
- Triage system (ER / URGENT / PRIMARY / SELFCARE)
- Free questions enforcement
- Structured vision findings

**API Endpoint:**
```
POST /api/chat/message
Content-Type: multipart/form-data

Body:
- message: string (required)
- consultId?: number
- severity?: number (1-10)
- images[]: file[] (optional, jpg/png/heic/webp)

Response:
{
  consultId: number,
  messageId: number,
  careLevel: "ER" | "URGENT" | "PRIMARY" | "SELFCARE",
  redFlags: string[],
  visionFindings: VisionAnalysis[] | null,
  aiReply: string,
  imagesProcessed: number,
  questionsRemaining: number
}
```

**Safety Features:**
- Immediate ER response for critical symptoms
- Red flags logged to database
- Admin notifications for emergencies
- Vision analysis hedged ("posible", "podría indicar")
- Always recommends professional consultation

---

## 🚧 In Progress

### 3. Doctor Subscription Payments
**Next:** Update existing `doctorSubscriptions.ts` or create new Stripe integration

**Requirements:**
- Stripe Checkout Session creation
- Webhook handling for subscription events
- Plan selection UI in `/connect/subscription-setup`
- Directory filtering by `verified && active_subscription`
- Billing dashboard for doctors

### 4. Route Consistency
**Canonical Routes to Implement:**
```
Public:
  / - Landing
  /login - Login
  /register - Register
  /doctors - Directory (was /doctors)
  /doctor/:id - Profile
  /faq, /blog - Content

Patient Protected:
  /doctor-ai - AI Chat (was /doctor)
  /vision - Image analysis
  /ai-referrals - Matched doctors
  /pay/checkout - Payment
  /dashboard - Patient dashboard

Doctor Protected:
  /connect/* - Doctor onboarding & dashboard
```

**Changes Needed:**
- Rename `/doctor` → `/doctor-ai` in routes and navigation
- Update all internal links
- Update sitemap.xml

### 5. Production Environment
**Files to Create/Update:**
- `.env.production` template
- CORS allowlist for https://doctor.mx
- Supabase redirect URLs
- Cookie configuration (domain, SameSite, Secure)
- `/public/sitemap.xml`
- `/public/robots.txt`

---

## 📋 TODO

### High Priority

- [ ] **Add missing npm packages**
  ```bash
  npm install multer @types/multer sharp @types/sharp
  ```

- [ ] **Fix TypeScript errors in chatWithImages.ts**
  - Add Express.User type extension
  - Add multer types

- [ ] **Create Stripe integration for doctor subscriptions**
  - Checkout session endpoint
  - Webhook handler
  - Subscription sync logic

- [ ] **Update directory query to filter listable doctors**
  ```sql
  WHERE verified = true 
  AND EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.doctor_id = doctors.id 
    AND s.status = 'active'
  )
  ```

- [ ] **Create payment checkout for patients**
  - Single consult: $79 MXN
  - Monthly unlimited: $299 MXN
  - Stripe integration

- [ ] **Update routing**
  - Rename `/doctor` → `/doctor-ai`
  - Update navigation components
  - Update sitemap

### Medium Priority

- [ ] **Frontend: Image upload UI**
  - Paperclip button in chat input
  - Image preview/thumbnails
  - Upload progress
  - Lightbox for viewing
  - Consent checkbox

- [ ] **Frontend: Emergency alert UI**
  - Red banner for ER care level
  - 911 call button
  - Nearest ER locator

- [ ] **Frontend: Vision findings display**
  - Structured findings cards
  - Risk indicators
  - Recommendations

- [ ] **Doctor dashboard: Subscription billing**
  - Current plan display
  - Usage statistics
  - Payment method management
  - Upgrade/downgrade options

- [ ] **SEO & Production**
  - Create sitemap.xml
  - Create robots.txt
  - Add OG meta tags
  - Configure CORS for production
  - Set up Sentry error tracking

### Low Priority (Defer)

- [ ] De-scope for v1: Marketplace, full Community, Gamification leaderboards
- [ ] Add SPEI/OXXO via Conekta (after Stripe cards working)
- [ ] Voice calls (Vapi integration)
- [ ] Advanced analytics dashboards

---

## 🔧 Required Package Updates

Add to `package.json`:
```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.0",
    "stripe": "^14.0.0"
  },
  "devDependencies": {
    "@types/multer": "^1.4.11",
    "@types/sharp": "^0.32.0"
  }
}
```

---

## 🏗️ Architecture Decisions

### 1. Image Storage
- **Solution:** Supabase Storage bucket `consult-images`
- **Rationale:** Integrated with existing Supabase stack, RLS support, signed URLs
- **Format:** Optimized JPEG (max 1920px, 85% quality)

### 2. Vision Analysis
- **Solution:** OpenAI GPT-4 Vision API
- **Rationale:** Best-in-class vision understanding, medical knowledge
- **Safety:** Always hedged language, never definitive diagnosis

### 3. Payment Processing
- **Solution:** Stripe (cards + Apple/Google Pay) in MXN
- **Rationale:** Fast to implement, good UX, handles subscriptions
- **Future:** Add SPEI/OXXO via Conekta for local payment methods

### 4. Doctor Monetization
- **Solution:** Subscription-gated directory visibility
- **Rationale:** Recurring revenue, simple for doctors, no per-consultation complexity
- **Price:** $499 MXN/mo (competitive, accessible)

---

## 📊 Expected Metrics (Post-Launch)

### Patient Success
- ≥ 30% of signups ask 1 question in 24h
- ≥ 10% attach image when prompted
- ≥ 5% convert to paid within 3 questions

### Doctor Success  
- 20+ verified doctors subscribed in month 1
- ≥ 5 consultations per doctor per week
- ≥ 4.5 star average rating

### Platform Health
- < 1% red flag false positives
- < 2s average chat response time
- < 5s average vision analysis time
- > 99.5% uptime

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run migration 027 on production database
- [ ] Create Supabase Storage bucket `consult-images`
- [ ] Set RLS policies on bucket
- [ ] Add Stripe API keys to environment
- [ ] Configure Stripe webhooks
- [ ] Update CORS origins
- [ ] Update Supabase redirect URLs
- [ ] Test image upload end-to-end
- [ ] Test payment flow end-to-end
- [ ] Test doctor subscription flow
- [ ] Verify emergency alert triggering
- [ ] Test on mobile devices
- [ ] Load test chat endpoint
- [ ] Set up error monitoring (Sentry)
- [ ] Create sitemap.xml
- [ ] Submit to search engines

---

## 📞 Next Steps

1. **Complete TypeScript setup** - Add missing types and dependencies
2. **Build doctor subscription flow** - Stripe integration + UI
3. **Build patient payment flow** - Stripe checkout for questions/subscriptions
4. **Update routes** - Rename `/doctor` to `/doctor-ai`
5. **Build frontend** - Image upload UI, emergency alerts, vision findings display
6. **Test thoroughly** - All critical paths
7. **Deploy to staging** - Full end-to-end testing
8. **Deploy to production** - Go live with MVP features

---

**Implementation Lead:** Development Team  
**Target Completion:** Week of November 4-8, 2025  
**Status:** 🟡 40% Complete
