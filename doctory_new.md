You are taking DoctorMX from “works locally” to production-ready for a two-sided healthcare marketplace: patients seeking fast, trustworthy care, and doctors deciding whether this platform is worth their time, reputation, and money.

Your job is not to make the UI prettier. Your job is to improve conversion, trust, clarity, completion rates, and production reliability across the full product.

Context:
- Product: DoctorMX / Doctory, a telemedicine platform for Mexico.
- Stack: Next.js 16 App Router, React 18, TypeScript, Tailwind, Supabase, Stripe, Daily.co, Sentry, Playwright, Vitest.
- Audiences:
  - Patients need speed, trust, affordability, clarity, mobile usability, low-friction booking, and confidence that AI is not replacing a doctor.
  - Doctors need credibility, clear earning potential, fast onboarding, verification transparency, schedule control, patient quality, and confidence their reputation is protected.
- Healthcare constraints:
  - Do not make unsupported medical/legal claims.
  - Make AI disclosure explicit.
  - Treat privacy, consent, security, and medical trust as first-class UX requirements.
  - Use Mexico-specific trust signals where appropriate: cédula profesional, COFEPRIS language, Spanish-first copy, WhatsApp/SPEI/OXXO expectations, mobile-first behavior.

Start by reading the repo, especially:
- README.md
- PROJECT_STATUS.md
- UX_AUDIT_REPORT.md
- READY_FOR_PRODUCTION.md
- GAP_ANALYSIS_REPORT.md
- FULL_GAP_REPORT.md
- TESTING_REPORT.md
- e2e tests
- src/app, src/components, src/lib, src/services

Then produce a concise but complete audit with:
1. Current product readiness score by area:
   - Patient conversion
   - Doctor conversion
   - Trust and safety
   - Mobile UX
   - Accessibility
   - Performance
   - Error/loading/empty states
   - Onboarding completion
   - Booking/payment completion
   - Production observability
2. P0/P1/P2 gaps, ranked by business impact and user risk.
3. The exact flows that must be production-grade:
   - Anonymous patient discovery
   - AI consultation disclosure and escalation
   - Patient registration
   - Doctor search
   - Doctor profile
   - Appointment booking
   - Payment
   - Video consultation
   - Prescription/follow-up
   - Doctor registration
   - Doctor verification pending state
   - Doctor onboarding
   - Doctor availability setup
   - Doctor dashboard first-use state
4. User stories with acceptance criteria for both audiences.
   Use this format:
   - As a [patient/doctor/admin], I want [goal], so that [business/user outcome].
   - Acceptance criteria: Given / When / Then.
   - Conversion metric affected.
5. A proposed information architecture and user-flow map.
6. A UI/UX redesign plan that is specific to this product, not generic SaaS.
   Avoid card farms, vague hero copy, fake trust, and template layouts.
   Every important page must have:
   - A clear conversion goal
   - A primary CTA
   - A secondary safety/help path
   - Trust reinforcement
   - Loading state
   - Empty state
   - Error state
   - Mobile layout
   - Accessibility behavior
7. A production-readiness implementation plan split into small, verifiable tasks.

After the audit, implement the highest-impact fixes directly in the codebase. Do not stop at recommendations unless blocked.

Implementation priorities:
1. Fix any P0 mobile navigation or broken flow issues.
2. Improve patient conversion:
   - Clear first-screen value proposition
   - Fast path to consult/book
   - Strong doctor/profile trust
   - Transparent AI disclosure
   - Better search, empty states, payment failure paths, and follow-up CTAs
3. Improve doctor conversion:
   - Better registration/onboarding
   - Verification transparency
   - “Mientras tanto” pending checklist
   - Schedule/profile completion guidance
   - Clear earning/reputation/trust story
4. Improve all critical empty/loading/error states.
5. Strengthen accessibility:
   - Keyboard navigation
   - Focus states
   - Touch targets >= 44px
   - Semantic labels
   - Color contrast
6. Add or update tests for changed behavior.
7. Verify with real browser screenshots on desktop and mobile.

Design bar:
- Spanish-first, clear, concrete copy.
- No generic startup phrases like “seamless”, “next-gen”, “elevate”.
- No fake numbers or fake claims.
- Use restrained, trustworthy healthcare visual language.
- Patients should feel: “I can get help safely and quickly.”
- Doctors should feel: “This platform protects my time, income, and reputation.”
- Mobile must feel native-quality, not a squeezed desktop layout.

Technical bar:
- Follow existing project patterns.
- Do not introduce new dependencies unless necessary.
- Keep changes scoped and maintainable.
- Preserve unrelated user changes.
- Use structured APIs and typed models where possible.
- No fragile string hacks.
- No unrelated refactors.

Verification:
Run as many of these as possible:
- npm run lint
- npm run typecheck
- npm run test
- npm run build
- npm run test:e2e
- Browser verification on desktop and mobile
- Screenshot review for key patient and doctor flows

Definition of done:
- The product has a clear conversion strategy for patients and doctors.
- Critical flows are understandable without explanation.
- First-time states are not dead ends.
- Mobile users can complete core flows.
- Doctor pending/verification states reduce anxiety instead of creating limbo.
- Patient AI and medical trust boundaries are explicit.
- Tests/build pass or failures are documented with exact causes.
- Final response includes:
  - What changed
  - Why it matters for conversion
  - Files touched
  - Verification run
  - Remaining risks
