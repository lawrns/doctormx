# UI Audit Report — Doctor.mx Full UI Pass

## Anti-Patterns Verdict: ⚠️ PASS WITH RESERVATIONS

The core design system (Editorial suite, LandingPageClient, DoctorLayout) is **well above average** — custom fonts, thoughtful token usage, motion entrances, and a distinct voice. However, **ALL admin pages and ALL patient dashboard pages are bare standalone containers** that look like they were auto-generated. The public SEO/marketing pages fall between these extremes.

**AI slop tells present:**
- `.gradient-text` utility in globals.css (banned by frontend-design rules)
- `.glass`, `.glass-subtle` glassmorphism utilities (banned)
- `animate-pulse-ring`, bounce-style easings (dated)
- 12 pages use the "4 stat card" hero metrics pattern
- Admin pages: inline headers, no layout wrapper, raw divs with `p-6`

---

## Executive Summary

| Category | Pages Affected | Severity |
|----------|---------------|----------|
| **No layout shell** (admin pages) | 6 pages | Critical |
| **No layout shell** (patient pages) | 9 pages | Critical |
| **AI slop tells** (gradient, glass, bounce) | globals.css + 4 components | High |
| **Card grid monotony** | 18 pages | High |
| **Hardcoded colors** (not tokens) | 15+ pages | Medium |
| **Missing/inconsistent empty states** | 8 pages | Medium |
| **Inconsistent typography hierarchy** | 10+ pages | Low |
| **No responsive mobile adaptation** | Most admin/patient pages | Low |

**Overall: 42/43 pages render, but ~25 look amateur vs the 5 that look world-class.**

---

## Detailed Findings

### 🔴 Critical — No Layout Wrapper (Admin Pages)

**Affected:**
- admin/outbound, admin/churn, admin/analytics, admin/pharmacy, admin/premium, admin/doctors

**Problem:** Each page is a raw `<div className="p-6 max-w-7xl mx-auto">` with an inline `<div className="mb-8">` header. No sidebar nav, no breadcrumbs, no admin shell.

**Impact:** These 6 pages look like internal tools from 2018 — completely disconnected from the rest of the app's polish.

**Fix:** Create `AdminShell` layout component (mirroring DoctorLayout pattern) with sidebar nav linking to all admin sections.

### 🔴 Critical — No Layout Wrapper (Patient Pages)

**Affected:**
- app/suscripcion, app/historial, app/second-opinion, app/premium, app/referrals

**Problem:** Each uses `<div className="max-w-3xl mx-auto px-4 py-8">`. No sidebar, no patient nav, no breadcrumbs.

**Impact:** These look like unauthenticated public pages, not premium patient dashboard sections.

**Fix:** Create `PatientShell` layout with sidebar nav (Dashboard, Citas, Chat, Historial, Suscripción, Referidos, Segunda Opinión, Premium).

### 🟠 High — AI Slop Tells in globals.css

**Location:** `src/app/globals.css`
- `.gradient-text` — gradient text on headings (banned: "DON'T use gradient text for 'impact'")
- `.glass`, `.glass-subtle` — glassmorphism utilities (banned: "DON'T use glassmorphism everywhere")
- `.animate-pulse-ring` — filled circle expansion (banned: taste rules)
- `animate-spin` utility — not an issue, but `animate-pulse-ring` is

**Fix:** Remove `.gradient-text`, `.glass`, `.glass-subtle`, `.animate-pulse-ring` from globals.css. Replace usages with token-based alternatives.

### 🟠 High — Card Grid Monotony (Hero Metrics Pattern)

**Problem:** 18 pages use the "4 stat cards across top" pattern. The StatCard component is used identically on:
- admin/analytics, admin/churn, admin/outbound, admin/pharmacy, admin/premium
- doctor/analytics, doctor/dashboard
- app/suscripcion, app/referrals, app/dashboard
- consulta-online, doctores-online

**Fix:** Vary the stat presentation. Use the `HeroStat` editorial component instead of raw StatCard grids. Break the 4-card grid into 2+2 or 3+1 layouts.

### 🟠 High — Inline Component Definitions

**Problem:** Multiple pages define local components inline (StatCard in analytics, FeatureCard in premium, etc.) rather than using the shared editorial system already built.

**Affected:** admin/premium, app/premium, app/historial, app/suscripcion, doctor/referrals, consulta-online

**Fix:** Extract all inline components to `src/components/` and use the editorial design system already built (Eyebrow, SignatureCard, HeroStat, etc.).

### 🟡 Medium — Hardcoded Colors Instead of Design Tokens

**Common patterns found across 15+ files:**
- `bg-[#0a1533]` → should use `bg-ink` or `bg-brand-ink`
- `text-[#5c6783]` → should use `text-muted-foreground`
- `border-[#d4d9e3]` → should use `border-border`
- `bg-[#f7f8fb]` → should use `bg-muted`
- `text-[#0d72d6]` → should use `text-vital` or `text-primary`

### 🟡 Medium — Missing Empty States

**Affected:** admin/doctors (no doctors message), clinicas (no clinics), admin/churn (no at-risk doctors), app/chat (no conversations), app/historial (basic)

**Fix:** Add proper empty states with relevant CTAs, not just gray text.

### 🟡 Medium — Inconsistent Heading Hierarchy

**Problem:** Pages jump between `<h1>`, `<h2>`, styled `<p>`, and inline-styled divs for page titles. Some use `text-2xl font-bold`, others use `text-3xl font-display`. Editorials use `.eyebrow` correctly — other pages don't.

### 🟢 Low — Missing Responsive Adaptations

**Problem:** Most admin/patient pages are desktop-only (no mobile nav). DoctorLayout has mobile support — others don't.

---

## Positive Findings

1. **DoctorLayout** is excellent — sidebar + mobile drawer + trial banner + status badges
2. **LandingPageClient** is distinctive — editorial shell, staggered motion, trust-by-evidence approach
3. **Editorial design system** (Eyebrow, HeroStat, SignatureCard, PageHero) is genuinely good
4. **DrSimeonProtocolChat** (ai-consulta) is complex and well-executed (696 lines)
5. **Footer** is well-structured with proper dark theme
6. **OnboardingChecklist/WelcomeBanner** is polished
7. **auth/register** multi-step wizard with AnimatePresence is well done
8. **Token system** (cobalt, ink, vital, coral) is distinctive and well-defined
9. **CSS easings** `--ease-dx` is properly defined
10. **prefers-reduced-motion** is respected

---

## Execution Plan (Priority Order)

### PHASE 1: Create Layout Shells (highest impact, most pages fixed at once)
1. Build `AdminShell` component with sidebar nav + mobile drawer
2. Build `PatientShell` component with sidebar nav + mobile drawer
3. Wrap all 6 admin pages in AdminShell
4. Wrap all 5 patient dashboard pages in PatientShell

### PHASE 2: Scrub AI Slop Tells
1. Remove `.gradient-text`, `.glass`, `.glass-subtle`, `.animate-pulse-ring` from globals.css
2. Replace any usage with token-based alternatives
3. Migrate bounce easings to `--ease-dx`

### PHASE 3: Break Card Grid Monotony
1. Replace StatCard grids with HeroStat + editorial layouts
2. Vary stat presentations across pages
3. Extract inline components to shared library

### PHASE 4: Token Enforcement
1. Replace all hardcoded colors with design tokens
2. Standardize heading hierarchy

### PHASE 5: Empty States & Polish
1. Add empty states to all list pages
2. Add loading skeletons consistently
3. Add motion entrances to key surfaces

---

**TOTAL PAGES TOUCHED: ~35**
**ESTIMATED IMPACT: 15 amateur pages → world-class**
