# Doctor.mx UI Component Inventory

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Components** | 113+ |
| **shadcn/ui Components** | 24 |
| **Custom Components** | 50+ |
| **Duplicate Components** | 6 pairs identified |
| **Theme Inconsistencies** | 3 major issues |
| **Lines of Code** | ~13,683 |

---

## 1. shadcn/ui Components (`src/components/ui/`)

### Core Components (24 total)

| Component | File | Radix UI | Usage Count* | Status |
|-----------|------|----------|--------------|--------|
| Alert | `alert.tsx` | No | Medium | ✅ Active |
| Avatar | `avatar.tsx` | Yes | 3 imports | ✅ Active |
| Badge | `badge.tsx` | Slot | 7 imports | ✅ Active |
| Button | `button.tsx` | Slot | 24 imports | ✅ Active |
| Card | `card.tsx` | No | 23 imports | ✅ Active |
| Checkbox | `checkbox.tsx` | Yes | Low | ✅ Active |
| Dialog | `dialog.tsx` | Yes | Medium | ✅ Active |
| Dropdown Menu | `dropdown-menu.tsx` | Yes | Low | ✅ Active |
| Form | `form.tsx` | Yes | High | ✅ Active |
| Input | `input.tsx` | No | 5 imports | ✅ Active |
| Label | `label.tsx` | Yes | High | ✅ Active |
| Pagination | `pagination.tsx` | No | Low | ✅ Active |
| Popover | `popover.tsx` | Yes | Low | ✅ Active |
| Progress | `progress.tsx` | Yes | Low | ✅ Active |
| Radio Group | `radio-group.tsx` | Yes | Low | ✅ Active |
| Scroll Area | `scroll-area.tsx` | Yes | Low | ✅ Active |
| Select | `select.tsx` | Yes | Low | ✅ Active |
| Separator | `separator.tsx` | Yes | Low | ✅ Active |
| Sheet | `sheet.tsx` | Yes | Medium | ✅ Active |
| Skeleton | `skeleton.tsx` | No | Low | ✅ Active |
| Sonner | `sonner.tsx` | No | Medium | ✅ Active |
| Table | `table.tsx` | No | Low | ✅ Active |
| Tabs | `tabs.tsx` | Yes | Medium | ✅ Active |
| Tooltip | `tooltip.tsx` | Yes | Low | ✅ Active |

*Usage count based on grep analysis of imports

---

## 2. Custom Components (`src/components/`)

### Core UI Components (with shadcn/ui duplicates)

| Component | File | Props Interface | Duplicates | Issue |
|-----------|------|-----------------|------------|-------|
| Button | `Button.tsx` | Custom | ✅ `ui/button` | **CRITICAL** - Different variant system |
| Card | `Card.tsx` | Custom | ✅ `ui/card` | **CRITICAL** - Different styling approach |
| Input | `Input.tsx` | Custom | ✅ `ui/input` | **CRITICAL** - Uses legacy CSS vars |
| Badge | `Badge.tsx` | Custom | ✅ `ui/badge` | **HIGH** - Different variant naming |
| Skeleton | `Skeleton.tsx` | Custom | ✅ `ui/skeleton` | **HIGH** - More elaborate patterns in custom |
| Avatar | `Avatar.tsx` | Custom | ✅ `ui/avatar` | **MEDIUM** - Different features |
| Select | `Select.tsx` | Custom | ✅ `ui/select` | **HIGH** - Legacy styling |
| Modal | `Modal.tsx` | Custom | ✅ `ui/dialog` | **HIGH** - Should use Dialog |
| Pagination | `Pagination.tsx` | Custom | ✅ `ui/pagination` | **MEDIUM** - Feature-rich custom version |

### Layout Components

| Component | File | Dependencies | Description |
|-----------|------|--------------|-------------|
| Header | `layout/Header.tsx` | `ui/button` | Site navigation header |
| Footer | `layout/Footer.tsx` | None | Site footer with links |
| PatientLayout | `PatientLayout.tsx` | Multiple | Patient dashboard layout |
| DoctorLayout | `DoctorLayout.tsx` | Multiple | Doctor dashboard layout |
| DashboardHeader | `DashboardHeader.tsx` | `ui/*` | Dashboard-specific header |
| AppBreadcrumbs | `AppBreadcrumbs.tsx` | - | Navigation breadcrumbs |
| Breadcrumbs | `Breadcrumbs.tsx` | - | Alternative breadcrumbs |

### Domain-Specific Components

#### Healthcare (`src/components/healthcare/`)
| Component | File | Purpose |
|-----------|------|---------|
| DoctorCard | `DoctorCard.tsx` | Doctor profile display card |
| EmptyState | `EmptyState.tsx` | Healthcare-specific empty state |

#### SOAP Components (`src/components/soap/`)
| Component | File | Purpose |
|-----------|------|---------|
| ConsensusMatrix | `ConsensusMatrix.tsx` | AI consensus display |
| ConsultationProgress | `ConsultationProgress.tsx` | Progress indicator |
| ConversationalAIConsultation | `ConversationalAIConsultation.tsx` | AI chat interface |
| ErrorBoundary | `ErrorBoundary.tsx` | Error handling |
| RecommendedDoctors | `RecommendedDoctors.tsx` | Doctor recommendations |
| SOAPDemo | `SOAPDemo.tsx` | Demo component |
| SOAPTimeline | `SOAPTimeline.tsx` | Consultation timeline |
| SpecialistConsultation | `SpecialistConsultation.tsx` | Specialist view |
| TreatmentPlanDisplay | `TreatmentPlanDisplay.tsx` | Treatment display |

#### SOAP Intake (`src/components/soap/intake/`)
| Component | File | Purpose |
|-----------|------|---------|
| ConversationalWelcome | `ConversationalWelcome.tsx` | Welcome screen |
| EnhancedSeveritySlider | `EnhancedSeveritySlider.tsx` | Severity input |
| ProgressStepper | `ProgressStepper.tsx` | Multi-step indicator |
| ProgressiveDisclosure | `ProgressiveDisclosure.tsx` | Progressive UI |
| QuestionCard | `QuestionCard.tsx` | Question display |
| SymptomAutocomplete | `SymptomAutocomplete.tsx` | Symptom search |

#### Landing (`src/components/landing/`)
| Component | File | Purpose |
|-----------|------|---------|
| CTASection | `CTASection.tsx` | Call-to-action |
| DrSimeonShowcase | `DrSimeonShowcase.tsx` | AI doctor showcase |
| FeaturesSection | `FeaturesSection.tsx` | Features grid |
| HeroSection | `HeroSection.tsx` | Landing hero |
| LandingPageClient | `LandingPageClient.tsx` | Landing page shell |
| PressSection | `PressSection.tsx` | Press mentions |
| StatsSection | `StatsSection.tsx` | Stats display |
| TestimonialsSection | `TestimonialsSection.tsx` | User testimonials |

#### Payment (`src/components/payment/`)
| Component | File | Purpose |
|-----------|------|---------|
| OXXOPayment | `OXXOPayment.tsx` | OXXO payment UI |

### Feature Components

| Component | File | Category | Dependencies |
|-----------|------|----------|--------------|
| AdaptiveQuestionnaire | `AdaptiveQuestionnaire.tsx` | AI/ML | Complex |
| AnalyticsFilters | `AnalyticsFilters.tsx` | Dashboard | `ui/*` |
| AppointmentCard | `AppointmentCard.tsx` | Appointments | `ui/*` |
| AppointmentFilters | `AppointmentFilters.tsx` | Appointments | `ui/*` |
| AvailabilityGrid | `AvailabilityGrid.tsx` | Scheduling | Complex |
| Chart | `Chart.tsx` | Analytics | Recharts |
| ChatInput | `ChatInput.tsx` | Chat | `ui/*` |
| ChatList | `ChatList.tsx` | Chat | `ui/*` |
| ClinicalCopilot | `ClinicalCopilot.tsx` | AI | Complex |
| ConfirmDialog | `ConfirmDialog.tsx` | Feedback | `ui/dialog` |
| CookieConsent | `CookieConsent.tsx` | Legal | - |
| DoctorBadges | `DoctorBadges.tsx` | Doctor | - |
| DoctorReviews | `DoctorReviews.tsx` | Doctor | `ui/*` |
| EmailCapture | `EmailCapture.tsx` | Marketing | - |
| EmergencyAlert | `EmergencyAlert.tsx` | Safety | `ui/alert` |
| EmptyState | `EmptyState.tsx` | Feedback | `ui/button`, framer-motion |
| ErrorState | `ErrorState.tsx` | Feedback | `ui/button`, framer-motion |
| Icons | `Icons.tsx` | Utilities | - |
| ImageUploader | `ImageUploader.tsx` | Forms | - |
| LoadingButton | `LoadingButton.tsx` | Feedback | `ui/button` |
| OnboardingChecklist | `OnboardingChecklist.tsx` | Onboarding | - |
| PatientDashboardContent | `PatientDashboardContent.tsx` | Dashboard | Complex |
| PharmacyEarningsWidget | `PharmacyEarningsWidget.tsx` | Pharmacy | - |
| PharmacySuggestions | `PharmacySuggestions.tsx` | Pharmacy | - |
| PreConsultaChat | `PreConsultaChat.tsx` | Chat | Complex |
| PreConsultaChatWrapper | `PreConsultaChatWrapper.tsx` | Chat | - |
| PremiumFeatureGate | `PremiumFeatureGate.tsx` | Monetization | `ui/*` |
| PremiumUpgradeModal | `PremiumUpgradeModal.tsx` | Monetization | `ui/*` |
| PricingBadge | `PricingBadge.tsx` | Monetization | - |
| QuickActionCard | `QuickActionCard.tsx` | Dashboard | - |
| QuotaCounter | `QuotaCounter.tsx` | Monetization | - |
| ReviewTrigger | `ReviewTrigger.tsx` | Reviews | - |
| SearchAssistant | `SearchAssistant.tsx` | Search | - |
| SentryTestButton | `SentryTestButton.tsx` | Debug | `ui/button` |
| SortSelect | `SortSelect.tsx` | List | - |
| StarRating | `StarRating.tsx` | Reviews | - |
| StatCard | `StatCard.tsx` | Dashboard | - |
| StatsBoard | `StatsBoard.tsx` | Dashboard | - |
| StructuredData | `StructuredData.tsx` | SEO | - |
| Toast | `Toast.tsx` | Feedback | - |
| TranscriptionUploader | `TranscriptionUploader.tsx` | Medical | - |
| TrustSignals | `TrustSignals.tsx` | Trust | - |
| WhatsAppShare | `WhatsAppShare.tsx` | Social | - |
| WriteReview | `WriteReview.tsx` | Reviews | `ui/*` |

### Animation Components

| Component | File | Purpose |
|-----------|------|---------|
| Advanced animations | `animations/advanced-animations.tsx` | Complex animations |
| Animation exports | `animations/index.tsx` | Animation utilities |

---

## 3. Component Pattern Analysis

### 3.1 shadcn/ui Consistency

#### ✅ Good Patterns
- All shadcn components use `cn()` utility from `@/lib/utils`
- Consistent use of CSS variables for theming
- Radix UI primitives for accessibility
- `data-slot` attributes for styling hooks

#### ⚠️ Issues Found

| Issue | Severity | Description |
|-------|----------|-------------|
| Missing `tailwind.config` path | MEDIUM | `components.json` has `"config": ""` (should point to actual config) |
| CSS variable mismatch | HIGH | Custom components use legacy `--color-*` vars, shadcn uses `--primary`, etc. |
| Missing animations | LOW | Only basic animations in shadcn components |

### 3.2 Custom Component Architecture

#### Props Interface Patterns

**shadcn/ui Style (Recommended):**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

**Custom Component Style (Legacy):**
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}
```

#### Style Approach Comparison

| Aspect | shadcn/ui | Custom Components |
|--------|-----------|-------------------|
| CSS Variables | `hsl(var(--primary))` | `var(--color-primary-600)` |
| Class merging | `cn()` utility | Template literals |
| Variants | `class-variance-authority` | Plain objects |
| Animation | Radix + CSS | Custom keyframes |
| Icons | Lucide (implied) | Mixed/SVG inline |

### 3.3 Theme Variable Mapping

```
shadcn/ui variable          Custom component equivalent
────────────────────────────────────────────────────────
--primary                   --color-primary-500/600
--secondary                 --color-neutral-*
--accent                    --color-accent-*
--destructive               --color-error-*
--muted                     --color-surface-*
--card                      --color-surface
--border                    --border-default
--input                     --border-default
--ring                      --color-primary-500
```

---

## 4. Critical Issues Identified

### 4.1 Duplicate Components (Consolidation Required)

| Custom Component | shadcn/ui Equivalent | Recommendation |
|------------------|---------------------|----------------|
| `Button` | `ui/button` | **MIGRATE** to shadcn, add loading state |
| `Card` | `ui/card` | **MIGRATE** to shadcn, keep compound pattern |
| `Input` | `ui/input` | **MIGRATE** to shadcn, create wrapper for label/error |
| `Badge` | `ui/badge` | **MIGRATE** to shadcn, add status variants |
| `Skeleton` | `ui/skeleton` | **KEEP BOTH** - custom has specialized patterns |
| `Avatar` | `ui/avatar` | **MERGE** - combine features |
| `Select` | `ui/select` | **MIGRATE** to shadcn, add label wrapper |
| `Modal` | `ui/dialog` | **REPLACE** with Dialog |
| `Pagination` | `ui/pagination` | **EVALUATE** - keep more feature-rich version |

### 4.2 Inconsistent Naming

| File | Issue | Recommendation |
|------|-------|----------------|
| `ConfirmDialog` vs `Dialog` | Naming inconsistency | Rename to `ConfirmModal` or use `ui/dialog` |
| `StatCard` in `Card.tsx` | Multiple exports | Split into separate files |
| `EmptyState` (2 locations) | Duplicate in healthcare | Consolidate to single component |

### 4.3 CSS Variable System Issues

```css
/* CURRENT: Dual system causing confusion */
/* shadcn/ui uses: */
--primary: 217 91% 60%;
--secondary: 210 40% 96%;

/* Custom components use: */
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-surface: #ffffff;
--border-default: #e5e7eb;
```

**Recommendation:** Migrate all to shadcn/ui CSS variable system

### 4.4 Accessibility Gaps

| Component | Issue | Severity |
|-----------|-------|----------|
| Custom `Modal` | No focus trap | **CRITICAL** |
| Custom `Select` | No keyboard navigation | **CRITICAL** |
| Custom `Button` | Missing focus-visible styles | HIGH |
| Custom `Input` | Missing aria-describedby links | MEDIUM |
| Custom `Avatar` | Missing alt text handling | MEDIUM |

### 4.5 Dependency Issues

| Component | Unnecessary Dependency | Recommendation |
|-----------|----------------------|----------------|
| `EmptyState` | framer-motion (required) | Make animation optional |
| `ErrorState` | framer-motion (required) | Make animation optional |
| `HeroSection` | framer-motion + useReducedMotion | Good pattern, document it |

---

## 5. Consolidation Recommendations

### 5.1 High Priority Actions

1. **Migrate Button Components**
   - Extend `ui/button` with `loading` prop
   - Add `leftIcon`/`rightIcon` props
   - Update all 4 imports from `@/components/Button`

2. **Unify Card Components**
   - Keep shadcn `ui/card` as base
   - Create `CardWithHeader` wrapper for complex patterns
   - Migrate 7 imports from `@/components/Card`

3. **Create Input Wrapper**
   - Keep shadcn `ui/input` as base
   - Create `FormInput` with label/error/hint
   - Migrate 3 imports from `@/components/Input`

4. **Replace Modal with Dialog**
   - Update imports from `Modal` to `ui/dialog`
   - Ensure feature parity (size, footer)

### 5.2 Medium Priority Actions

5. **Consolidate Avatar Components**
   - Extend shcn `ui/avatar` with color generation
   - Add status indicator support
   - Add AvatarGroup component

6. **Unify EmptyState**
   - Keep healthcare version (more flexible)
   - Update root `EmptyState.tsx` to re-export
   - Add framer-motion as optional

7. **Standardize Badge**
   - Create status variants in `ui/badge`
   - Migrate status helper functions

### 5.3 Low Priority Actions

8. **Document Animation Patterns**
   - Create animation style guide
   - Standardize reduced motion support

9. **Clean Up Unused Components**
   - Identify and remove dead code
   - Consolidate similar components

---

## 6. Migration Path

### Phase 1: Critical Duplicates (Week 1)
```bash
# 1. Extend shadcn Button with loading state
# 2. Create FormInput wrapper
# 3. Replace Modal with Dialog
# 4. Update all imports
```

### Phase 2: Standardize Patterns (Week 2)
```bash
# 1. Migrate Card usages
# 2. Unify Avatar
# 3. Consolidate EmptyState
```

### Phase 3: Clean Up (Week 3)
```bash
# 1. Remove deprecated components
# 2. Update documentation
# 3. Audit for remaining issues
```

---

## 7. Theme System Status

### CSS Variables in globals.css

| Category | Status | Notes |
|----------|--------|-------|
| shadcn/ui variables | ✅ Complete | All standard variables defined |
| Custom color scales | ⚠️ Redundant | Primary/accent scales in tailwind config |
| Animation keyframes | ✅ Good | Custom animations defined |
| Glassmorphism | ✅ Good | `.glass` utilities |
| Scrollbar styles | ✅ Good | Custom WebKit scrollbar |

### Tailwind Config

| Feature | Status | Notes |
|---------|--------|-------|
| shadcn color mapping | ✅ Complete | Maps to CSS variables |
| Extended color scales | ⚠️ Redundant | primary-50 to primary-900 |
| Border radius | ✅ Good | Uses --radius variable |
| Dark mode | ✅ Good | 'class' strategy |

---

## 8. Component Dependencies Graph

### Most Imported Components

```
ui/button (24) → Most critical
ui/card (23) → Core layout component
ui/label (high) → Form dependency
ui/form (high) → Complex forms
ui/tabs (medium) → Navigation
```

### Custom Components with Most Dependencies

```
DoctorCard → ui/card, ui/badge, ui/button, ui/avatar
EmptyState → ui/button, framer-motion
ErrorState → ui/button, framer-motion
HeroSection → framer-motion, useReducedMotion
```

---

## 9. Appendix: Component Usage Statistics

### Import Analysis Summary

| Import Path | Count | Type |
|-------------|-------|------|
| `@/components/ui/button` | 24 | shadcn |
| `@/components/ui/card` | 23 | shadcn |
| `@/components/ui/input` | 5 | shadcn |
| `@/components/ui/badge` | 7 | shadcn |
| `@/components/ui/avatar` | 3 | shadcn |
| `@/components/Button` | 4 | Custom (deprecated) |
| `@/components/Card` | 7 | Custom (deprecated) |
| `@/components/Input` | 3 | Custom (deprecated) |
| `@/components/Badge` | 5 | Custom (deprecated) |
| `@/components/Avatar` | 0 | Custom (unused?) |

---

## 10. Recommendations Summary

### Immediate Actions (This Week)
1. ✅ Extend `ui/button` with loading and icon support
2. ✅ Create `FormInput` wrapper around `ui/input`
3. ✅ Replace `Modal` usage with `ui/dialog`
4. ✅ Audit accessibility of custom components

### Short Term (Next 2 Weeks)
5. Migrate `Card` usages to `ui/card`
6. Consolidate `Avatar` implementations
7. Unify `EmptyState` components
8. Create migration guide for team

### Long Term (Next Month)
9. Remove all deprecated custom components
10. Standardize on shadcn/ui patterns
11. Add component documentation
12. Set up Storybook for component gallery

---

*Report generated: 2026-02-03*
*Total components analyzed: 113*
*Lines of code: ~13,683*
