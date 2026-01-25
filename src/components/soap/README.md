# SOAP Multi-Agent Consultation UI Components

Beautiful, animated, and accessible UI components for medical consultation workflows using the SOAP (Subjective, Objective, Assessment, Plan) methodology.

## Components

### 1. SpecialistConsultation

Displays a grid of specialist agent cards with animated confidence bars and assessments.

**Features:**
- Avatar-based specialist cards
- Animated confidence percentage (0-100%)
- Color-coded by specialty
- Three states: pending, thinking, completed
- Staggered entrance animations (0.1s delay per card)
- Responsive: mobile (vertical stack) → desktop (2x2 grid)

**Usage:**
```tsx
import { SpecialistConsultation } from '@/components/soap';

const specialists = [
  {
    id: '1',
    name: 'Dr. María González',
    specialty: 'cardiology',
    confidence: 87,
    assessment: 'Los síntomas sugieren...',
    status: 'completed',
  },
  // ... more specialists
];

<SpecialistConsultation agents={specialists} />
```

### 2. ConsensusMatrix

Displays multi-specialist consensus results with Kendall's W scoring.

**Features:**
- Animated circular consensus score (spring physics)
- Primary diagnosis prominently displayed
- Differential diagnoses list
- Clinical reasoning section
- Consensus level badge (high/moderate/low)
- Agreement percentage indicator

**Usage:**
```tsx
import { ConsensusMatrix } from '@/components/soap';

const consensus = {
  score: 82.3, // Kendall's W * 100
  level: 'high',
  primaryDiagnosis: 'Taquicardia Paroxística...',
  differentialDiagnoses: ['Diagnosis 1', 'Diagnosis 2'],
  clinicalReasoning: 'Basado en el consenso...',
  agreementPercentage: 85,
};

<ConsensusMatrix consensus={consensus} />
```

### 3. SOAPTimeline

Visual timeline showing progress through SOAP phases.

**Features:**
- 4 phases: Subjective, Objective, Assessment, Plan
- Status indicators: completed, in-progress, pending
- Phase-specific icons and colors
- Smooth connector line animations
- Timestamps for completed phases
- Responsive: vertical (mobile) → horizontal (desktop)

**Usage:**
```tsx
import { SOAPTimeline } from '@/components/soap';

const phases = [
  {
    phase: 'subjective',
    status: 'completed',
    timestamp: new Date(),
  },
  {
    phase: 'objective',
    status: 'in-progress',
  },
  // ... more phases
];

<SOAPTimeline phases={phases} currentPhase="objective" />
```

### 4. ConsultationProgress

Real-time progress indicator showing which agents are actively analyzing.

**Features:**
- Overall progress bar
- Pulsing avatars for active agents
- Animated "thinking" indicators
- Estimated time remaining
- Current phase display

**Usage:**
```tsx
import { ConsultationProgress } from '@/components/soap';

const progress = {
  currentPhase: 'assessment',
  activeAgents: ['agent-1', 'agent-2'],
  completedAgents: ['agent-3'],
  totalAgents: 4,
  estimatedTimeRemaining: 45, // seconds
};

const agentDetails = [
  { id: 'agent-1', name: 'Dr. Smith', avatar: '/avatars/smith.jpg' },
  // ... more agents
];

<ConsultationProgress progress={progress} agentDetails={agentDetails} />
```

## Accessibility Features (WCAG 2.1 AA)

All components include:

### Visual Accessibility
- **4.5:1 minimum contrast ratio** on all text
- **Semantic HTML** with proper headings and landmarks
- **Color is not the only indicator** - icons and text accompany all color cues

### Motor Accessibility
- **44x44px minimum touch targets** (exceeds 24x24px requirement)
- **Keyboard navigation** support for all interactive elements
- **No gesture-only controls** - all actions have alternatives

### Cognitive Accessibility
- **Clear, simple Spanish language** avoiding medical jargon where possible
- **Progress indicators** for all loading states
- **Predictable behavior** with consistent interaction patterns

### Motion Accessibility
- **`useReducedMotion` hook** automatically detects user preference
- **All animations disabled** when `prefers-reduced-motion: reduce`
- **No essential information conveyed only through animation**

### Screen Reader Support
- **ARIA labels** on all icons and interactive elements
- **`aria-live` regions** for dynamic content updates
- **Semantic HTML** structure (nav, section, etc.)
- **`role` attributes** where appropriate

## Responsive Design

All components are mobile-first and fully responsive:

### Breakpoints
- **Mobile**: 375px+ (min-width for WCAG compliance)
- **Tablet**: 768px+ (`md:` prefix in Tailwind)
- **Desktop**: 1024px+ (`lg:` prefix in Tailwind)

### Mobile Optimizations
- Vertical stacking of cards
- Larger touch targets (48x48px on mobile)
- Simplified layouts
- Bottom-aligned CTAs for thumb-friendly access

## Animation Guidelines

### Principles
1. **Purposeful** - Every animation enhances understanding
2. **Subtle** - Animations should feel natural, not distracting
3. **Fast** - Keep durations under 500ms for most transitions
4. **Respectful** - Honor user's motion preferences

### Common Patterns

**Entrance animations:**
```tsx
initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

**Progress animations (spring):**
```tsx
const scoreSpring = useSpring(0, {
  stiffness: shouldReduceMotion ? 500 : 100,
  damping: shouldReduceMotion ? 100 : 20,
});
```

**Pulsing indicators:**
```tsx
animate={{
  scale: shouldReduceMotion ? 1 : [1, 1.2, 1],
  opacity: shouldReduceMotion ? 0.7 : [0.7, 1, 0.7],
}}
transition={{
  duration: 1.5,
  repeat: Infinity,
  ease: 'easeInOut',
}}
```

## Type Definitions

All components use TypeScript with strict types defined in `/src/types/soap.ts`:

```typescript
export type SpecialistType =
  | 'general'
  | 'cardiology'
  | 'dermatology'
  | 'neurology'
  | 'orthopedics'
  | 'oncology'
  | 'radiology'
  | 'psychology';

export interface SpecialistAgent {
  id: string;
  name: string;
  specialty: SpecialistType;
  avatar?: string;
  confidence: number; // 0-100
  assessment: string;
  status: 'pending' | 'thinking' | 'completed';
}

// ... more types in soap.ts
```

## Styling

Components use shadcn/ui primitives with Tailwind CSS utility classes:

### Theme Variables
- `--primary` - Primary brand color
- `--muted` - Muted backgrounds
- `--border` - Border colors
- `--foreground` - Text colors

### Dark Mode
All components support dark mode automatically via the `dark:` prefix:

```tsx
className="text-foreground dark:text-foreground"
```

## Demo

See all components in action:

```tsx
import { SOAPDemo } from '@/components/soap/SOAPDemo';

<SOAPDemo />
```

## Implementation Notes

### Based on Research
Components follow best practices from `/docs/SOAP-MULTIAGENT-RESEARCH.md`:

1. **SOAP Framework** - Standard clinical documentation methodology
2. **Multi-Agent Consensus** - Kendall's W coefficient for agreement measurement
3. **UX Patterns** - Mobile-first, emotional design, purposeful animations
4. **Accessibility** - WCAG 2.1 AA compliance (HHS mandate by May 2026)

### Dependencies
- `framer-motion` - Animation library
- `@radix-ui/react-*` - Accessible component primitives
- `lucide-react` - Icon library
- `class-variance-authority` - Variant management
- `tailwind-merge` - Class merging utility

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## License

Part of Doctory v2 - Medical consultation platform.
