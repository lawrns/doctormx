# Doctor.mx Design System Book

Version: 1.1  
Owner: Product + Design Engineering  
Status: Official source of truth for public-facing Doctor.mx surfaces

## North Star

Doctor.mx is an AI-doctor-first healthcare platform. The first user action should feel like clinical orientation with Dr. Simeón, not generic directory browsing. The verified doctor marketplace is the handoff layer after the patient has described symptoms, received initial guidance, and understands the next step.

## Brand Positioning

Primary message: describe symptoms to Dr. Simeón, receive initial clinical guidance, and get connected to the right verified doctor.

Secondary message: browse and book verified doctors online or in person across México.

Anti-positioning:
- Do not present Doctor.mx as a generic doctor directory first.
- Do not use green as a brand or success color.
- Do not inflate proof with unverifiable statistics.
- Do not make the AI feel like a toy chatbot.
- Do not hide the human doctor handoff.

## Design Principles

Clarity:
The patient should understand the next clinical step within five seconds.

Evidence:
Trust claims must connect to visible proof: cédula, verification state, review source, modality, price, availability, security.

Human Warmth:
Use real doctor/patient photography where possible. Avoid initials-only avatars on public trust surfaces.

Calm Premium:
Doctor.mx should feel polished, high-trust, and medically serious without looking cold or bureaucratic.

Data Honesty:
If a datum is not verified, do not present it as certainty. Use honest fallbacks such as "cuando existe", "sin inflar", or "por confirmar".

Marketplace Utility:
Doctor.mx competes in a Doctoralia-shaped user mental model: fast search, tight cards, visible location/specialty inputs, and immediate availability. Our execution should feel calmer, more AI-first, and more premium, but never bulky or overly rounded.

## Core Visual Language

Palette:
- Deep navy is the premium foundation.
- Soft medical blue is the brand action and verification color.
- Bright blue is reserved for active CTAs, selection, and focused UI.
- Soft cool grays structure surfaces.
- White keeps clinical clarity.
- Amber and coral are reserved for rating/warning/destructive states.
- Green is not a Doctor.mx brand color.

Typography:
- Display and UI use Plus Jakarta Sans.
- Mono labels use IBM Plex Mono.
- Headlines should be confident but not bulky.
- Use tight tracking for display text and restrained uppercase mono labels.
- Avoid decorative fonts except limited italic emphasis in hero copy.

Layout:
- Use asymmetric editorial sections for public landing surfaces.
- Use dense-but-readable marketplace modules after the AI story.
- Use cards only when they communicate hierarchy or containment.
- Trust bars may overlap hero sections when they anchor proof.
- Mobile must collapse to a single-column hierarchy with primary CTA visible before rich panels.

Material:
- Borders are 1px cool-gray or low-opacity white on dark surfaces.
- Shadows are blue/navy tinted, never generic black glow.
- Radius should be refined, not cartoonish: controls around 6px, compact cards around 8px, major public panels around 12px, and hero media/panels capped around 14px unless a true pill/circle is intentional.
- Marketplace surfaces should prefer hairline borders, compact rows, and restrained elevation over large bubbly cards.

Motion:
- Motion should clarify flow, not entertain.
- Animate only transform and opacity.
- Avoid layout-jumping full-screen heroes.
- AI panels may use subtle active states, but no neon, particles, or sci-fi grids.

## Canonical Tokens

Core colors:
- Ink: `#0A1533`
- Blue 700: `#0B5FB8`
- Blue 600: `#0D72D6`
- Blue 500: `#2688E6`
- Blue 300: `#8FC4FF`
- Soft Blue: `#E8F3FF`
- Background: `#F4F5F8`
- Surface: `#FFFFFF`
- Border: `#DDE1EC`
- Muted text: `#5C6783`
- Gold rating: `#F4A736`
- Coral destructive: `#FF5A3D`

CSS variables:
- `--brand-ink`
- `--brand-ocean`
- `--brand-sky`
- `--brand-clay`
- `--brand-leaf` mapped to blue for legacy compatibility
- `--success` mapped to blue for legacy compatibility
- `--public-radius-card`
- `--public-radius-control`
- `--public-shadow-soft`
- `--public-shadow-medium`
- `--public-shadow-strong`

Tailwind aliases:
- `ink`
- `cobalt` legacy alias for the soft blue ramp
- `vital` mapped to Doctor.mx blue for legacy compatibility
- `coral`
- `amber`

## Public Homepage Rules

Required order:
1. Dr. Simeón-first hero.
2. AI-to-doctor handoff visual.
3. Proof/trust bar.
4. Guided marketplace preview.
5. How it works.
6. Trust/clinical limits.
7. Features and reviews.
8. Final AI-first CTA.

Hero requirements:
- Primary CTA: "Hablar con Dr. Simeón".
- Secondary CTA: doctor marketplace or verified doctors.
- Show symptom input, AI response, specialty recommendation, and doctor handoff.
- Show a real or realistic doctor visual above the fold.
- Include trust proof, not vague claims.

Forbidden:
- Directory-first headline as the dominant message.
- Specialties as the first screen story.
- Green brand accents.
- Fake availability or fake proof.
- Oversized, blocky H1s that overpower the UI.

## Doctor Cards

Required information:
- Doctor photo.
- Name.
- Specialty.
- City/state.
- Rating and review count when real.
- Price.
- Modality.
- Cédula or verification affordance when available.
- Strong booking/availability CTA.

Card tone:
- Compact and trust-dense.
- Avoid bulky rounded tiles, oversized padding, thick shadows, or decorative empty space.
- Prefer Doctoralia-like information density with a softer premium blue system and clearer AI-to-doctor handoff.

Card geometry:
- Directory cards: 8px radius, 1px border, white background, small tinted shadow only on hover.
- Homepage doctor cards: 8-10px radius, compact photo crop, visible price/slot/verification.
- Booking/profile decision panels: 10-12px radius, tighter row hierarchy, no ornamental shells.
- Pills remain fully rounded only for status, modality, selected filters, or slot chips.

## AI Surfaces

Dr. Simeón must feel clinically serious:
- Use structured questions and summaries.
- Explain clinical limits.
- Escalate urgent symptoms away from commercial booking.
- Preserve referral context into booking.
- Avoid toy chatbot patterns, emojis, playful avatars, and fake timestamps.

## Booking Surfaces

Booking should feel like continuation:
- Preserve `date`, `time`, `appointmentType`, `consultationId`, and pre-consulta context where available.
- Use a two-column reservation flow on desktop.
- Keep the doctor summary visible.
- Explain payment/security/cancellation expectations before commitment.
- Show hold expiry and next steps.

## Doctor Connect

Doctor Connect is the doctor acquisition landing flow at `/connect`.

Purpose:
- Help doctors claim an existing unclaimed profile or create a profile from a public practice result.
- Reduce blank-form friction with AI-prepared suggestions.
- Make the doctor feel the product is operationally intelligent without implying unverified medical proof.

Required UI patterns:
- Practice search panel with clear source labeling: Doctor.mx directory, Google Places, Brave Search, or demo fallback.
- AI enrichment timeline: search, extraction, draft, doctor confirmation.
- Suggested field review table with field, value, source, confidence/state, and responsibility.
- Profile completion checklist for photo, cédula, hours, services, price, modality, insurance, and location.
- Loading, empty, and error states shaped like the final layout, not generic spinners.

Trust rules:
- No dato sugerido se publica como verificado.
- Cédula, SEP, identity, specialty certification, and documents require doctor/admin confirmation.
- Brave Search and AI may inform suggestions only.
- If Google Places is unavailable, fallback results must be labeled as demo/fallback and never presented as live data.

## Copy Rules

Voice:
- Spanish, clear, calm, medically serious.
- Concrete verbs: describe, orienta, verifica, agenda.
- Prefer short sentences.
- Explain what happens next.

Avoid:
- Startup language: "revoluciona", "seamless", "next-gen".
- Overpromising: "diagnóstico instantáneo", "100% seguro" unless legally verified.
- Vague claims: "miles confían" unless backed by real metrics.

## Accessibility Rules

- Every interactive element needs visible focus.
- Do not rely on color alone for state.
- Use real button/link semantics.
- Keep contrast AA or better.
- Mobile CTAs must not clip.
- Motion must respect reduced-motion preferences where possible.

## Engineering Rules

Canonical primitives:
- Buttons: `src/components/ui/button.tsx`
- Badges: `src/components/ui/badge.tsx`
- Cards: `src/components/ui/card.tsx`
- Logo: `src/components/brand/DoctorMxLogo.tsx`

Implementation constraints:
- Use CSS variables and Tailwind tokens instead of hardcoded one-off colors.
- If a legacy token says `vital` or `brand-leaf`, it must render as blue unless a surface is explicitly clinical-state-only.
- Avoid adding another button/card/badge primitive.
- Use `editorial-shell` for major public sections.
- Use `public-section` and `public-section-compact` for section rhythm.
- Use `apply_patch` for manual edits in Codex workflows.

## Doctoralia-Informed Competitive Rules

Use Doctoralia as the marketplace-density benchmark, not as a visual identity to copy:
- Search and filter surfaces should be compact, obvious, and form-like.
- Doctor result cards should be row-oriented, scannable, and information-dense.
- White cards, thin borders, and small radii should dominate marketplace pages.
- Availability and location should appear close to the doctor identity, not buried.
- Trust signals should be factual: cédula, rating count, modality, city, payment/security expectations.
- Avoid oversized rounded panels, bubble cards, fake status UI, or large decorative metric blocks.

## QA Checklist

Before shipping a public-facing UI:
- Dr. Simeón is the primary entry point.
- Verified doctor marketplace is clearly the handoff layer.
- CTAs are AI-first above the fold.
- No green brand accents are visible.
- No fake metrics, fake availability, or fake reviews are presented as real.
- Doctor cards expose trust proof.
- Mobile header and CTAs do not clip.
- Colors match the blue/navy/cool-gray palette.
- Shadows are subtle and navy-tinted.
- Type is clean and not bulky.
- Radius audit passes: no public marketing card above 14px except true circular avatars or pill chips.
- Marketplace pages feel compact and decision-oriented, not spacious SaaS marketing.
- All altered files pass TypeScript and targeted lint.

## Visual Book

The live visual reference lives at:

`/design-system`

Use it for color swatches, typography specimens, spacing, component states, cards, AI panels, marketplace preview, and do/don't examples.
