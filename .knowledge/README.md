# DOCTORMX KNOWLEDGE BASE

> **AUTO-LOAD**: This file is automatically loaded into context for all doctormx work.
> **LAST UPDATED:** 2026-02-09
> **STATUS**: Active - Use these resources ALWAYS without being asked

---

## QUICK REFERENCE

**When working on doctormx, ALWAYS consult:**
1. `.knowledge/methods/` - Audit methodologies and prompt templates
2. `.knowledge/mexico-market/` - Market research and regulatory info
3. `.knowledge/prompts/` - Domain-specific prompts for healthcare/telemedicine
4. `AGENT_INSTRUCTIONS.md` - Universal agent instructions
5. `DOCTORMX_COMPREHENSIVE_AUDIT.md` - Latest audit findings

---

## DOMAIN KNOWLEDGE: Mexico Telemedicine Market

### Key Market Data

| Metric | Value | Source |
|--------|-------|--------|
| Mexico telehealth market (2024) | $342M - $1.36B USD | Industry reports |
| Projected 2033 | $1.63B - $5.17B USD | 18.98% CAGR |
| Internet penetration | 83.5% (110M users) | 2025 data |
| WhatsApp users | 69.7M monthly | 4th largest market globally |
| Uninsured population | 29.1% (2023) | Government data |
| Doctors per 1,000 | 2.4 vs 3.5 OECD avg | WHO data |
| Healthcare out-of-pocket | 41% vs 18% OECD | World Bank |

### Competitive Positioning

| Competitor | Price (MXN) | Model | Notes |
|------------|-------------|-------|-------|
| 1DOC3 | $185 | AI + human | Validated model, 300k consultations/month |
| Farmacias Similares | $50-80 | In-pharmacy | Ultra-low cost, 5,000+ locations |
| **Doctormx** | **$499** | **AI + human + WhatsApp** | **Mid-market premium** |
| TelemedMX | $600 | Human only | Higher price, English-speaking |
| Private doctors | $400-800 | In-person | Variable, location-dependent |

### Target Demographics

1. **Middle-class urban families** (MXN 15K-50K/month)
2. **Young professionals** (25-40, WhatsApp power users)
3. **Chronic disease patients** (diabetes, hypertension)
4. **Rural with connectivity** (4G access, limited local care)

---

## REGULATORY COMPLIANCE (Mexico)

### Critical Regulations

| Regulation | Status | Key Requirements |
|------------|--------|------------------|
| **Ley General de Salud** | New Digital Health chapter (Jan 2026) | Trained personnel, secure systems, informed consent |
| **LFPDPPP** | Data protection law | Express consent for sensitive data, privacy notice, ARCO rights |
| **NOM-004-SSA3-2012** | Clinical records | Confidentiality, documentation standards |
| **NOM-024-SSA3-2012** | Electronic health systems | Interoperability, security, access traceability |
| **COFEPRIS** | Medical device/software | SaMD classification, registration required |

### AI Positioning Requirements

**CRITICAL:** Position AI as "triage and information tool" ONLY, NOT diagnostic.

Required disclaimers:
> "Este asistente de salud utiliza inteligencia artificial para ayudar a orientar sus síntomas. NO es un diagnóstico médico. Siempre consulte con un médico calificado para diagnóstico y tratamiento. En caso de emergencia, llame al 911."

### Data Privacy (LFPDPPP)

Health data is "sensitive personal data" - requires:
- Express written consent
- Privacy notice (aviso de privacidad)
- ARCO rights (Access, Rectification, Cancellation, Opposition)
- Security measures (technical and administrative)
- Data breach notification

---

## PHARMACY PARTNERSHIPS

### Major Chains

| Chain | Stores | E-commerce | Notes |
|-------|--------|------------|-------|
| **Farmacias Similares** | ~5,000 | ✅ | $2 doctor consultations, lowest cost |
| **Farmacias Guadalajara** | ~2,500 | ✅ | Strong in northern/Central Mexico |
| **Farmacias del Ahorro** | ~900+ | ✅ | E-commerce leader (#11 in Mexico retail) |
| **Farmacias Benavides** | ~1,000+ | ✅ | Strong regional presence |

### Partnership Models

1. **Revenue Share:** 15-25% of consultation fees
2. **Subscription Bundling:** Telemedicine + pharmacy loyalty program
3. **White-Label:** Branded telemedicine service for pharmacy chains
4. **Referral Fee:** Fixed amount per medication delivery fulfilled

### Delivery Considerations

- Express delivery: 2-3 hours in major cities
- Licensed pharmacists serve as couriers (enables Rx delivery)
- Same-day delivery expectation: Pharmacy category ranks #2 after prepared food

---

## PHYSICIAN NETWORK

### Requirements

| Requirement | Description |
|-------------|-------------|
| **Cédula Profesional** | Professional license from SEP |
| **Specialty Certification** | CONACEM (optional but recommended) |
| **COFEPRIS Registration** | For prescribing controlled substances |
| **Malpractice Insurance** | Strongly recommended, not legally required |

### Compensation Benchmarks

| Role | Per-Consultation | Est. Monthly (120 consults) |
|------|-----------------|----------------------------|
| General Practitioner | MXN 150-250 | MXN 18,000-30,000 |
| Specialist | MXN 300-450 | MXN 36,000-54,000 |

### Initial Network

- **Minimum:** 50 physicians to launch
- **Recommended ratio:** 3-4 GPs per specialist
- **Priority specialties:** Cardiology, Dermatology, Endocrinology, Gynecology, Pediatrics, Psychiatry

---

## PRICING STRATEGY

### Price Positioning

| Service | Price (MXN) | Price (USD) | Comparison |
|---------|-------------|-------------|------------|
| Single consultation | $499 | ~$25 | 2.5x pharmacy, competitive with private |
| 6-month subscription | $1,999 | ~$100 | ~$333/month, 10% below 1DOC3 monthly |

### Value Communication

- Compare to private doctor: Save 30-50%
- Compare to time cost: 3 hours saved per consultation
- Include medication delivery: Added convenience worth $100-200 MXN

---

## TECHNOLOGY STACK

### Core Technologies

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 16, React 18, TypeScript 5.2 | App Router, SSR |
| Styling | Tailwind CSS 3.4, Radix UI | Component library |
| Database | Supabase (PostgreSQL) | RLS policies, real-time |
| Authentication | Supabase Auth | Session-based |
| Payments | Stripe Mexico | OXXO, SPEI, cards |
| AI | OpenAI GPT, Anthropic Claude, GLM | Multi-provider routing |
| Video | Daily.co | HIPAA-compliant option |
| Real-time | Supabase subscriptions | Chat, notifications |
| Testing | Vitest, Playwright | Unit + E2E |
| Monitoring | Sentry | Error tracking |

### External Services

| Service | Purpose | Notes |
|---------|---------|-------|
| Twilio | WhatsApp Business API | Alternative: 360dialog |
| Daily.co | Video consultations | Room creation, tokens |
| OpenAI | AI API | GPT-4 for consultations |
| Anthropic | AI API | Claude as fallback |
| Stripe | Payment processing | Mexico-specific methods |
| Upstash Redis | Rate limiting, caching | Distributed cache |

---

## ARCHITECTURE PATTERNS

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (102 endpoints)
│   ├── auth/              # Authentication pages
│   ├── app/               # Patient dashboard
│   ├── doctor/            # Doctor portal
│   └── book/              # Booking flow
├── components/            # Reusable UI
│   ├── ui/                # Radix UI components
│   ├── soap/              # SOAP note components
│   └── healthcare/        # Healthcare-specific
├── lib/                   # Business logic
│   ├── ai/                # AI integration
│   ├── soap/              # SOAP generation
│   ├── triage/            # Triage logic
│   ├── booking/           # Booking system
│   └── auth/              # Auth utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── services/              # External service integrations
```

### Key Patterns

- **Repository Pattern**: Not yet implemented, recommended
- **Factory Pattern**: AI provider routing (partial)
- **Event-Driven**: Notifications via service
- **State Machines**: XState for SOAP (defined but unused)
- **Real-time**: Supabase subscriptions

---

## KNOWN ISSUES (Latest Audit)

### Critical (Blocking Production)

| Issue | File | Severity |
|-------|------|----------|
| Exposed API keys in .env | `.env` | CRITICAL |
| Service role key in client code | `src/lib/ai/adaptive-questionnaire/service.ts` | CRITICAL |
| Insufficient file upload validation | `api/ai/vision/analyze/route.ts` | CRITICAL |
| XSS via dangerouslySetInnerHTML | `app/doctor/[specialty]/page.tsx` | HIGH |
| Webhooks untested | All webhook routes | CRITICAL |
| Video service untested | `src/lib/video/videoService.ts` | CRITICAL |

### Code Quality Issues

| Issue | Count | Priority |
|-------|-------|----------|
| Console statements | 327 | HIGH |
| `any` types | 48+ files | HIGH |
| Magic numbers | 100+ | MEDIUM |
| Functions > 50 lines | 15+ | MEDIUM |
| Missing JSDoc | 100+ functions | LOW |

### Performance Issues

| Issue | Impact | Solution |
|-------|--------|----------|
| N+1 query in chat | +500-2000ms | Single query with joins |
| Sequential analytics queries | +2000-5000ms | Wrap in Promise.all() |
| Missing composite indexes | +100-500ms | Add (doctor_id, start_ts) |
| No vision caching | +5-15s per image | Hash-based caching |

---

## QUALITY STANDARDS

### Stripe-Level Excellence Required

1. **All states handled:** loading, empty, error, success
2. **Mobile-first responsive:** 70%+ of Mexican users on mobile
3. **Smooth transitions:** Micro-interactions throughout
4. **Edge cases covered:** Boundary conditions, failures
5. **Accessibility:** ARIA labels, keyboard navigation, screen readers
6. **Performance:** <500ms API responses, <2s page loads

### Code Review Checklist

- [ ] No console.log in production code
- [ ] Proper error handling (Result type or similar)
- [ ] Type-safe (no `any` in critical paths)
- [ ] Mobile responsive (test all breakpoints)
- [ ] Accessibility reviewed (ARIA, keyboard)
- [ ] Tests written (70%+ coverage for critical paths)
- [ ] JSDoc on complex functions (>20 lines)
- [ ] No magic numbers (use constants)

---

## QUICK WINS (Always Apply)

When writing code for doctormx, ALWAYS:

1. **Use the logger** - Never console.log
   ```typescript
   import { logger } from '@/lib/observability/logger'
   logger.error('Error message', { error, context })
   ```

2. **Use Result type** - For database operations
   ```typescript
   type Result<T, E = Error> =
     | { success: true; data: T }
     | { success: false; error: E }
   ```

3. **Add JSDoc** - For complex functions
   ```typescript
   /**
    * Process appointment booking
    * @param request - Booking request data
    * @returns Promise resolving to appointment or error
    */
   ```

4. **Use constants** - No magic numbers
   ```typescript
   const CONSULTATION_PRICE_MXN = 499
   const SUBSCRIPTION_6_MONTHS_MXN = 1999
   ```

5. **Handle all states** - Loading, error, empty, success
   ```typescript
   if (loading) return <Skeleton />
   if (error) return <ErrorState error={error} />
   if (!data) return <EmptyState />
   return <SuccessView data={data} />
   ```

---

## PROMPT TEMPLATES

See `.knowledge/prompts/` for:
- `healthcare-code-review.md` - Healthcare-specific code review prompts
- `telemedicine-architecture.md` - Architecture decision prompts
- `security-audit.md` - Healthcare security audit prompts
- `compliance-check.md` - Mexico compliance checking prompts

---

## WORKING WITH AGENT TEAMS

See `AGENT_TEAMS.md` for team structure.

**Team Roles:**
- Coordinator (Lead) - Orchestration
- Frontend Specialist - UI/UX, components, pages
- Backend Specialist - Business logic, APIs
- Database Specialist - Schema, migrations, tests
- AI/ML Specialist - AI features, prompts, LLMs

**Worktrees:**
```bash
~/doctormx/              # Main (coordinator)
~/doctormx/worktrees/frontend   # Frontend specialist
~/doctormx/worktrees/backend    # Backend specialist
~/doctormx/worktrees/database   # Database specialist
~/doctormx/worktrees/ai         # AI specialist
```

---

## USEFUL COMMANDS

```bash
# Audit checks
npm run build          # Check TypeScript errors
npm run test           # Run tests
npm run lint           # Check linting

# Worktree management
cd ~/doctormx && git worktree list
cd ~/doctormx && git worktree add worktrees/new-feature -b feature/new-feature

# Database
npx supabase db push   # Push migrations
npx supabase db reset  # Reset local database

# Testing
npx vitest            # Unit tests
npx playwright test   # E2E tests
```

---

**Remember:** This knowledge base is ALWAYS available. Use these resources without being asked. Quality over speed. Stripe-level excellence.
