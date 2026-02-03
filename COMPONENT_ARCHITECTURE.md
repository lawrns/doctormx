# Doctor.mx Component Architecture

## Visual Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCTOR.MX COMPONENT TREE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 1: FOUNDATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   shadcn/ui │  │  Tailwind   │  │   Radix UI  │  │    CSS Variables    │ │
│  │  Components │  │    Config   │  │  Primitives │  │   (globals.css)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                    │            │
│         └────────────────┴────────────────┴────────────────────┘            │
│                                       │                                      │
│                              ┌────────▼────────┐                            │
│                              │   cn() Utility  │                            │
│                              │  (lib/utils.ts) │                            │
│                              └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 2: UI PRIMITIVES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        shadcn/ui Components (24)                         ││
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────┤│
│  │  Button  │   Card   │  Input   │  Select  │  Dialog  │   Form           ││
│  │  Avatar  │  Badge   │  Alert   │   Tabs   │  Table   │   Sheet          ││
│  │Checkbox  │Popover   │Tooltip   │Separator │Skeleton  │   Sonner         ││
│  │Dropdown  │Progress  │RadioGrp  │ScrollArea│Pagination│   Label          ││
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                   Custom Components (To be consolidated)                 ││
│  ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────┤│
│  │  Button⚠️│   Card⚠️  │  Input⚠️ │  Select⚠️│  Modal⚠️ │  Badge⚠️         ││
│  │  Avatar⚠️│Skeleton⚠️│ Pagination⚠️                                       ││
│  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────┘│
│                                    ⚠️ = Duplicate with shadcn/ui             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 3: COMPOSITE COMPONENTS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         Layout Components                                ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  Header ◄── ui/button                                                   ││
│  │  Footer                                                                 ││
│  │  PatientLayout ◄── Multiple imports                                     ││
│  │  DoctorLayout ◄── Multiple imports                                      ││
│  │  DashboardHeader ◄── ui/*                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Healthcare Components                             ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  DoctorCard ◄── ui/card + ui/badge + ui/button + ui/avatar              ││
│  │  EmptyState ◄── ui/button (healthcare/)                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         SOAP Components                                  ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  ConsensusMatrix                                                        ││
│  │  ConsultationProgress                                                   ││
│  │  ConversationalAIConsultation                                           ││
│  │  SOAPTimeline                                                           │
│  │  TreatmentPlanDisplay                                                   ││
│  │  ├── intake/                                                            ││
│  │  │   ├── ConversationalWelcome                                           ││
│  │  │   ├── EnhancedSeveritySlider                                         ││
│  │  │   ├── ProgressStepper                                                ││
│  │  │   ├── ProgressiveDisclosure                                          ││
│  │  │   ├── QuestionCard                                                   ││
│  │  │   └── SymptomAutocomplete                                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Landing Components                                ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │  HeroSection ◄── framer-motion, useReducedMotion                        ││
│  │  FeaturesSection                                                        ││
│  │  CTASection                                                             ││
│  │  TestimonialsSection                                                    ││
│  │  StatsSection                                                           ││
│  │  PressSection                                                           ││
│  │  DrSimeonShowcase                                                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 4: FEATURE COMPONENTS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   CHAT/AI    │  │  APPOINTMENTS │  │   PAYMENT    │  │    FORMS     │    │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│  │ ChatInput    │  │ AppointmentCard│ │ OXXOPayment  │  │ ImageUploader│    │
│  │ ChatList     │  │ AppointmentFilters│             │  │ Transcription│    │
│  │ PreConsulta  │  │ Availability  │  │              │  │              │    │
│  │ ClinicalCopilot│ │              │  │              │  │              │    │
│  │ SearchAssist │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   REVIEWS    │  │  DASHBOARD    │  │  MONETIZATION │  │   ANALYTICS  │    │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤    │
│  │ StarRating   │  │ StatCard     │  │ PremiumGate  │  │ Chart        │    │
│  │ WriteReview  │  │ StatsBoard   │  │ UpgradeModal │  │ AnalyticsFilter│  │
│  │ ReviewTrigger│  │ QuickAction  │  │ PricingBadge │  │              │    │
│  │ DoctorReviews│  │ Onboarding   │  │ QuotaCounter │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 5: PAGE COMPONENTS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┬──────────────────┬──────────────────┬────────────────┐│
│  │      HOME        │    DASHBOARD     │   APPOINTMENTS   │     AUTH       ││
│  ├──────────────────┼──────────────────┼──────────────────┼────────────────┤│
│  │ HeroSection      │ PatientDashboard │ AppointmentCard  │ Auth forms     ││
│  │ FeaturesSection  │ DoctorDashboard  │ Calendar         │ Login          ││
│  │ CTASection       │ StatsBoard       │ Time slots       │ Register       ││
│  │ Testimonials     │ QuickActionCard  │ Confirmation     │ Onboarding     ││
│  └──────────────────┴──────────────────┴──────────────────┴────────────────┘│
│                                                                              │
│  ┌──────────────────┬──────────────────┬──────────────────┬────────────────┐│
│  │     AI CONSULT   │     DOCTORS      │    PROFILE       │    CHECKOUT    ││
│  ├──────────────────┼──────────────────┼──────────────────┼────────────────┤│
│  │ PreConsultaChat  │ DoctorCard       │ Avatar           │ Payment form   ││
│  │ SOAPTimeline     │ DoctorBadges     │ DoctorReviews    │ OXXOPayment    ││
│  │ TreatmentPlan    │ Filters          │ AvailabilityGrid │ Confirmation   ││
│  │ Recommendations  │ Pagination       │ Verification     │                ││
│  └──────────────────┴──────────────────┴──────────────────┴────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Dependency Flow

```
                    ┌─────────────────┐
                    │   Page Routes   │
                    └────────┬────────┘
                             │
                             ▼
              ┌────────────────────────────┐
              │   Feature Components       │
              │  (Chat, Appointments, etc) │
              └────────────┬───────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐ ┌──────────────┐ ┌─────────────┐
    │   Layout   │ │   Domain     │ │   Shared    │
    │Components  │ │  Components  │ │  Utilities  │
    └─────┬──────┘ └──────┬───────┘ └──────┬──────┘
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
          ┌─────────────────────────────┐
          │    Composite Components     │
          │ (DoctorCard, EmptyState...) │
          └─────────────┬───────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │     UI Primitives           │
          │  ┌─────────┐ ┌─────────┐    │
          │  │ shadcn  │ │ Custom  │    │
          │  │   ui    │ │(legacy) │    │
          │  └────┬────┘ └────┬────┘    │
          │       │           │         │
          │       └─────┬─────┘         │
          │             ▼               │
          │  ┌─────────────────────┐    │
          │  │    cn() Utility     │    │
          │  │  (tailwind-merge    │    │
          │  │   + clsx)           │    │
          │  └─────────────────────┘    │
          └─────────────────────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │      CSS Foundation         │
          │  ┌─────────┐ ┌─────────┐    │
          │  │ globals │ │tailwind │    │
          │  │  .css   │ │.config  │    │
          │  └─────────┘ └─────────┘    │
          └─────────────────────────────┘
```

---

## Import Patterns Analysis

### Recommended Import Structure

```typescript
// ✅ GOOD: Import from ui/ layer
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ✅ GOOD: Import composite components
import { DoctorCard } from '@/components/healthcare/DoctorCard'
import { EmptyState } from '@/components/EmptyState'

// ⚠️ AVOID: Importing from legacy custom components
import { Button } from '@/components/Button'        // ❌ Deprecated
import { Card } from '@/components/Card'            // ❌ Deprecated
import { Input } from '@/components/Input'          // ❌ Deprecated

// ✅ GOOD: Import utilities
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
```

---

## Component Communication Patterns

### Props Drilling (Current)
```
Page → Layout → Dashboard → StatsBoard → StatCard
                    ↓
              AppointmentCard → Button, Badge
```

### Recommended Pattern with Composition
```
Page 
  ├─ Layout
  │   └─ Dashboard (context provider)
  │       ├─ StatsBoard
  │       │   └─ StatCard (consumes context)
  │       └─ AppointmentCard
  │           ├─ ui/button
  │           └─ ui/badge
```

---

## Animation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Animation Sources                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐                                        │
│  │  Tailwind CSS   │  → hover:, focus:, active:             │
│  │  Transitions    │  → transition-all, duration-*, ease-*   │
│  └─────────────────┘                                        │
│                                                              │
│  ┌─────────────────┐                                        │
│  │   Keyframes     │  → Custom in globals.css               │
│  │   (globals.css) │  → fadeIn, fadeInUp, shimmer           │
│  └─────────────────┘                                        │
│                                                              │
│  ┌─────────────────┐                                        │
│  │  Radix UI       │  → Dialog animations                   │
│  │  (built-in)     │  → Accordion animations                │
│  └─────────────────┘                                        │
│                                                              │
│  ┌─────────────────┐                                        │
│  │  Framer Motion  │  → Complex orchestrated animations     │
│  │  (selective)    │  → HeroSection, EmptyState, ErrorState │
│  └─────────────────┘                                        │
│                                                              │
│  ┌─────────────────┐                                        │
│  │  CSS Animations │  → Reduced motion support              │
│  │  (reduced-motion│  → useReducedMotion hook               │
│  │   support)      │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Theme Integration Points

```
Theme Variables Flow
──────────────────────────────────────────────────────────

tailwind.config.ts
    │
    ├── Maps CSS variables to Tailwind classes
    │   background: 'hsl(var(--background))'
    │   primary: { DEFAULT: 'hsl(var(--primary))' }
    │
    ▼
globals.css
    │
    ├── Defines CSS variables
    │   :root {
    │     --primary: 217 91% 60%
    │     --background: 0 0% 100%
    │   }
    │
    ├── .dark overrides
    │
    └── Custom utilities
        .glass, .gradient-text, animations
        
    ▼
Component Usage
    │
    ├── shadcn/ui: bg-primary, text-primary-foreground
    │
    └── Custom (legacy): var(--color-primary-600)
        ⚠️ SHOULD BE MIGRATED
```

---

## Build Impact Analysis

### Current Bundle Considerations

| Category | Impact | Notes |
|----------|--------|-------|
| shadcn/ui components | Medium | Tree-shakeable, Radix deps |
| Custom components | Medium | Some duplication |
| Framer Motion | High | Used in landing, can lazy-load |
| Lucide icons | Low | Tree-shakeable |
| Custom CSS | Low | Purged by Tailwind |

### Post-Consolidation Benefits

```
Before:                    After:
┌─────────────┐           ┌─────────────┐
│ Custom Btn  │  ──────►  │  ui/button  │
│ Custom Card │  ──────►  │   ui/card   │
│ Custom Input│  ──────►  │   ui/input  │
│  + 6 more   │           │  (shared)   │
└─────────────┘           └─────────────┘

Reduction: ~15KB estimated (gzipped)
```
