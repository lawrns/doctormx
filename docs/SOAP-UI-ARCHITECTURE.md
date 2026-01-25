# SOAP UI Components - Architecture Guide

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      ConsultationPage                        │
│                    (Your Application)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Uses all components
                              ▼
        ┌─────────────────────────────────────────────────┐
        │              SOAP UI Components                  │
        └─────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ SOAPTimeline │    │ ConsultationProg │    │ Specialist   │
│              │    │ ress             │    │ Consultation │
└──────────────┘    └──────────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│ ConsensusMatrix│                        │ SpecialistCard│
│              │                            │ (internal)   │
└──────────────┘                            └──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    shadcn/ui Components                      │
│  Card, Avatar, Badge, Progress, etc.                         │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Radix UI Primitives                       │
│  @radix-ui/react-avatar, @radix-ui/react-progress, etc.     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action
    │
    ▼
┌─────────────────────────────────────────┐
│  SOAP Consultation State Management     │
│  (Your Redux/Zustand/Context)           │
└─────────────────────────────────────────┘
    │
    │ State updates
    │
    ├─► phases: SOAPPhaseStatus[]
    │       │
    │       └─► SOAPTimeline
    │
    ├─► progress: ConsultationProgress
    │       │
    │       └─► ConsultationProgress component
    │
    ├─► agents: SpecialistAgent[]
    │       │
    │       └─► SpecialistConsultation
    │
    └─► consensus: ConsensusResult
            │
            └─► ConsensusMatrix
```

## Component Communication

```
┌───────────────────────────────────────────────────────────┐
│                    Parent Component                        │
│  (Manages SOAP consultation state)                         │
└────────┬──────────────────────────────────────────────────┘
         │
         │ Props down
         │
         ├─────────────────┬──────────────────┬──────────────┐
         │                 │                  │              │
         ▼                 ▼                  ▼              ▼
    ┌────────┐      ┌──────────┐      ┌──────────┐   ┌──────────┐
    │Timeline│      │ Progress │      │Specialist│   │Consensus │
    └────────┘      └──────────┘      └──────────┘   └──────────┘
         │                 │                  │              │
         │                 │                  │              │
         │    Events up    │                  │              │
         └────────┬────────┴──────────────────┴──────────────┘
                  │
                  ▼
         (Optional: callbacks for interaction)
```

## State Machine Integration (Optional)

If using XState or similar state management:

```typescript
import { createMachine } from 'xstate';

const soapMachine = createMachine({
  id: 'soap-consultation',
  initial: 'subjective',
  context: {
    phases: [],
    agents: [],
    progress: null,
    consensus: null,
  },
  states: {
    subjective: {
      on: {
        COMPLETE_SUBJECTIVE: 'objective',
      },
    },
    objective: {
      on: {
        COMPLETE_OBJECTIVE: 'assessment',
      },
    },
    assessment: {
      initial: 'consultingAgents',
      states: {
        consultingAgents: {
          invoke: {
            src: 'consultSpecialists',
            onDone: 'buildingConsensus',
          },
        },
        buildingConsensus: {
          invoke: {
            src: 'buildConsensus',
            onDone: '#soap-consultation.plan',
          },
        },
      },
    },
    plan: {
      type: 'final',
    },
  },
});

// In your component:
const [state, send] = useMachine(soapMachine);

<SOAPTimeline
  phases={state.context.phases}
  currentPhase={state.value}
/>
```

## Real-Time Updates Pattern

For WebSocket integration:

```typescript
import { useEffect, useState } from 'react';

function useSOAPConsultation(consultationId: string) {
  const [agents, setAgents] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://api.doctory.mx/consultations/${consultationId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'AGENT_THINKING':
          setAgents((prev) =>
            prev.map((agent) =>
              agent.id === message.agentId
                ? { ...agent, status: 'thinking' }
                : agent
            )
          );
          break;

        case 'AGENT_RESPONSE':
          setAgents((prev) =>
            prev.map((agent) =>
              agent.id === message.agentId
                ? {
                    ...agent,
                    status: 'completed',
                    confidence: message.confidence,
                    assessment: message.assessment,
                  }
                : agent
            )
          );
          break;

        case 'CONSENSUS_READY':
          setConsensus(message.consensus);
          break;
      }
    };

    return () => ws.close();
  }, [consultationId]);

  return { agents, consensus };
}

// Usage:
function ConsultationView({ consultationId }) {
  const { agents, consensus } = useSOAPConsultation(consultationId);

  return (
    <>
      <SpecialistConsultation agents={agents} />
      {consensus && <ConsensusMatrix consensus={consensus} />}
    </>
  );
}
```

## Integration with Next.js Server Actions

Using React 19 Server Actions pattern:

```typescript
// app/actions/consultation.ts
'use server';

import { SpecialistAgent, ConsensusResult } from '@/types/soap';

export async function consultSpecialists(
  symptoms: string[]
): Promise<SpecialistAgent[]> {
  // Call your AI API
  const response = await fetch('https://api.doctory.mx/consult', {
    method: 'POST',
    body: JSON.stringify({ symptoms }),
  });

  return response.json();
}

export async function buildConsensus(
  agentAssessments: SpecialistAgent[]
): Promise<ConsensusResult> {
  // Calculate Kendall's W and build consensus
  const response = await fetch('https://api.doctory.mx/consensus', {
    method: 'POST',
    body: JSON.stringify({ assessments: agentAssessments }),
  });

  return response.json();
}

// app/consultation/[id]/page.tsx
import { consultSpecialists, buildConsensus } from '@/actions/consultation';
import { SpecialistConsultation, ConsensusMatrix } from '@/components/soap';

export default async function ConsultationPage({
  params,
}: {
  params: { id: string };
}) {
  // Server-side data fetching
  const agents = await consultSpecialists(['headache', 'nausea']);
  const consensus = await buildConsensus(agents);

  return (
    <div className="space-y-8">
      <SpecialistConsultation agents={agents} />
      <ConsensusMatrix consensus={consensus} />
    </div>
  );
}
```

## Optimistic Updates Pattern

For better UX with React 19's useOptimistic:

```typescript
'use client';

import { useOptimistic } from 'react';
import { consultSpecialist } from '@/actions/consultation';

function ConsultationClient({ initialAgents }) {
  const [optimisticAgents, addOptimisticAgent] = useOptimistic(
    initialAgents,
    (state, newAgent) => [...state, newAgent]
  );

  async function handleAddSpecialist(specialistId: string) {
    // Immediately show "thinking" state
    addOptimisticAgent({
      id: specialistId,
      status: 'thinking',
      confidence: 0,
      assessment: '',
    });

    // Actual server call
    const result = await consultSpecialist(specialistId);

    // State will update when server responds
  }

  return <SpecialistConsultation agents={optimisticAgents} />;
}
```

## Styling Customization

### Theme Integration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Custom medical specialty colors
        cardiology: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        },
        neurology: {
          50: '#eef2ff',
          500: '#6366f1',
          900: '#312e81',
        },
        // ... more specialties
      },
    },
  },
};

// Usage in components:
<div className="bg-cardiology-50 text-cardiology-900">
  Cardiology specific styling
</div>
```

### Custom Animation Variants

```typescript
// lib/animation-variants.ts
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

// Usage:
<motion.div
  custom={index}
  initial="hidden"
  animate="visible"
  variants={cardVariants}
>
  {/* content */}
</motion.div>
```

## Performance Optimization

### Lazy Loading Components

```typescript
import { lazy, Suspense } from 'react';

const ConsensusMatrix = lazy(() =>
  import('@/components/soap/ConsensusMatrix').then((mod) => ({
    default: mod.ConsensusMatrix,
  }))
);

function ConsultationPage() {
  return (
    <Suspense fallback={<ConsensusMatrixSkeleton />}>
      <ConsensusMatrix consensus={consensus} />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo } from 'react';

const SpecialistCard = memo(
  ({ agent }: { agent: SpecialistAgent }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.agent.id === nextProps.agent.id &&
      prevProps.agent.status === nextProps.agent.status &&
      prevProps.agent.confidence === nextProps.agent.confidence
    );
  }
);
```

## Testing Strategy

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { SpecialistConsultation } from '@/components/soap';

describe('SpecialistConsultation', () => {
  it('renders specialist cards', () => {
    const agents = [
      {
        id: '1',
        name: 'Dr. Smith',
        specialty: 'cardiology',
        confidence: 85,
        assessment: 'Test assessment',
        status: 'completed',
      },
    ];

    render(<SpecialistConsultation agents={agents} />);
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('respects reduced motion preference', () => {
    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    // Test that animations are disabled
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('SOAP consultation flow', async ({ page }) => {
  await page.goto('/consultation/123');

  // Wait for specialists to load
  await expect(page.getByText('Dr. María González')).toBeVisible();

  // Check confidence animation completes
  await expect(page.getByText('87%')).toBeVisible();

  // Verify consensus is displayed
  await expect(page.getByText('Consenso Diagnóstico')).toBeVisible();
});
```

## Accessibility Testing

```bash
# Using axe-core
npm install --save-dev @axe-core/playwright

# Test script
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/soap-demo');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Component Checklist

When creating new SOAP components, ensure:

- [ ] TypeScript types defined in `/src/types/soap.ts`
- [ ] Uses shadcn/ui primitives
- [ ] Includes `useReducedMotion` hook
- [ ] All text in Spanish
- [ ] ARIA labels on icons and visual elements
- [ ] 44x44px minimum touch targets
- [ ] Responsive mobile-first design
- [ ] Dark mode support
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Storybook story (optional)
- [ ] Unit tests
- [ ] E2E tests
- [ ] Accessibility audit

## Directory Structure

```
src/
├── types/
│   └── soap.ts                          # TypeScript definitions
├── components/
│   ├── ui/                              # shadcn/ui components
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   └── progress.tsx
│   └── soap/                            # SOAP components
│       ├── index.ts                     # Exports
│       ├── README.md                    # Documentation
│       ├── SpecialistConsultation.tsx
│       ├── ConsensusMatrix.tsx
│       ├── SOAPTimeline.tsx
│       ├── ConsultationProgress.tsx
│       └── SOAPDemo.tsx                 # Demo component
├── hooks/
│   ├── index.ts
│   └── useReducedMotion.ts              # Motion preference hook
├── lib/
│   └── utils.ts                         # cn() utility
└── app/
    └── soap-demo/
        └── page.tsx                     # Demo page
```

## Summary

This architecture provides:

1. **Clear separation of concerns** - Types, components, hooks
2. **Reusable patterns** - State management, animations, accessibility
3. **Scalable structure** - Easy to add new components
4. **Production-ready** - Testing, optimization, documentation
5. **Maintainable** - TypeScript, consistent patterns, documentation

The SOAP UI components are designed to work seamlessly with modern Next.js patterns, React 19 features, and your existing Doctory v2 architecture.
