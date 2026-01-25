# SOAP UI Components - Quick Reference

## Import Components

```typescript
import {
  SpecialistConsultation,
  ConsensusMatrix,
  SOAPTimeline,
  ConsultationProgress,
} from '@/components/soap';
```

## Basic Usage

### 1. SOAPTimeline

```tsx
<SOAPTimeline
  phases={[
    { phase: 'subjective', status: 'completed', timestamp: new Date() },
    { phase: 'objective', status: 'in-progress' },
    { phase: 'assessment', status: 'pending' },
    { phase: 'plan', status: 'pending' },
  ]}
  currentPhase="objective"
/>
```

### 2. ConsultationProgress

```tsx
<ConsultationProgress
  progress={{
    currentPhase: 'assessment',
    activeAgents: ['agent-1', 'agent-2'],
    completedAgents: ['agent-3'],
    totalAgents: 4,
    estimatedTimeRemaining: 45, // seconds
  }}
  agentDetails={[
    { id: 'agent-1', name: 'Dr. Smith', avatar: '/avatars/smith.jpg' },
    { id: 'agent-2', name: 'Dr. Jones' },
  ]}
/>
```

### 3. SpecialistConsultation

```tsx
<SpecialistConsultation
  agents={[
    {
      id: '1',
      name: 'Dr. María González',
      specialty: 'cardiology',
      confidence: 87,
      assessment: 'Los síntomas sugieren...',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'general',
      confidence: 0,
      assessment: '',
      status: 'thinking',
    },
  ]}
/>
```

### 4. ConsensusMatrix

```tsx
<ConsensusMatrix
  consensus={{
    score: 82.3,
    level: 'high',
    primaryDiagnosis: 'Taquicardia Paroxística Supraventricular',
    differentialDiagnoses: [
      'Taquicardia sinusal inapropiada',
      'Síndrome de POTS',
    ],
    clinicalReasoning: 'Basado en el consenso de especialistas...',
    agreementPercentage: 85,
  }}
/>
```

## Type Definitions

```typescript
import type {
  SpecialistAgent,
  ConsensusResult,
  SOAPPhaseStatus,
  ConsultationProgress,
  SpecialistType,
  SOAPPhase,
} from '@/types/soap';
```

## Specialist Types

```typescript
type SpecialistType =
  | 'general'        // Médico General - Blue
  | 'cardiology'     // Cardiología - Red
  | 'dermatology'    // Dermatología - Purple
  | 'neurology'      // Neurología - Indigo
  | 'orthopedics'    // Ortopedia - Green
  | 'oncology'       // Oncología - Orange
  | 'radiology'      // Radiología - Cyan
  | 'psychology';    // Psicología - Pink
```

## Agent Status

```typescript
status: 'pending' | 'thinking' | 'completed'

// 'pending'  - Waiting to start (gray, no animation)
// 'thinking' - Currently analyzing (pulsing blue dot)
// 'completed' - Finished assessment (green border, shows results)
```

## SOAP Phases

```typescript
phase: 'subjective' | 'objective' | 'assessment' | 'plan'

// subjective  - Síntomas y antecedentes (Blue)
// objective   - Datos clínicos (Purple)
// assessment  - Análisis multi-especialista (Orange)
// plan        - Recomendaciones (Green)
```

## Phase Status

```typescript
status: 'completed' | 'in-progress' | 'pending'

// completed   - Green checkmark
// in-progress - Spinning loader
// pending     - Gray icon
```

## Consensus Levels

```typescript
level: 'high' | 'moderate' | 'low'

// high     - ≥80 score (Green badge)
// moderate - 60-79 score (Yellow badge)
// low      - <60 score (Orange badge)
```

## Common Patterns

### Full Consultation Flow

```tsx
function ConsultationPage() {
  const [currentPhase, setCurrentPhase] = useState<SOAPPhase>('subjective');
  const [agents, setAgents] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);

  return (
    <div className="space-y-8 p-4">
      {/* Show progress through phases */}
      <SOAPTimeline
        phases={phases}
        currentPhase={currentPhase}
      />

      {/* Show active consultation */}
      {currentPhase === 'assessment' && (
        <>
          <ConsultationProgress
            progress={{
              currentPhase: 'assessment',
              activeAgents: agents
                .filter(a => a.status === 'thinking')
                .map(a => a.id),
              completedAgents: agents
                .filter(a => a.status === 'completed')
                .map(a => a.id),
              totalAgents: agents.length,
            }}
          />
          <SpecialistConsultation agents={agents} />
        </>
      )}

      {/* Show consensus when ready */}
      {consensus && (
        <ConsensusMatrix consensus={consensus} />
      )}
    </div>
  );
}
```

### With Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton';

{isLoading ? (
  <div className="grid gap-4 md:grid-cols-2">
    {[1, 2, 3, 4].map(i => (
      <Skeleton key={i} className="h-[200px] w-full" />
    ))}
  </div>
) : (
  <SpecialistConsultation agents={agents} />
)}
```

### With Error States

```tsx
{error ? (
  <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
    <p className="text-red-900">{error.message}</p>
  </div>
) : (
  <ConsensusMatrix consensus={consensus} />
)}
```

## Styling Tips

### Custom Colors

```tsx
// Override specialty colors
<div className="[&_.specialist-cardiology]:bg-pink-500">
  <SpecialistConsultation agents={agents} />
</div>
```

### Custom Spacing

```tsx
<SpecialistConsultation
  agents={agents}
  className="gap-6" // Increase gap between cards
/>
```

### Dark Mode

```tsx
// All components support dark mode automatically
<div className="dark">
  <ConsensusMatrix consensus={consensus} />
</div>
```

## Accessibility

### Reduced Motion

```tsx
// Automatically detected, no configuration needed
// Users with prefers-reduced-motion will see static UI
```

### Screen Readers

```tsx
// All components include proper ARIA labels
// Live regions announce updates automatically
<ConsultationProgress
  progress={progress}
  // Will announce: "2 de 4 especialistas completados"
/>
```

### Keyboard Navigation

```tsx
// All interactive elements are keyboard accessible
// Tab, Enter, Space navigation supported
```

## Animation Durations

```typescript
// Entrance animations: 300ms
// Stagger delay: 100ms per item
// Progress animations: 1000ms (spring)
// Pulse animations: 1500ms (infinite)
// Phase transitions: 500ms
```

## Responsive Breakpoints

```typescript
// Mobile: < 768px (vertical stack)
// Tablet: 768px - 1023px (transition layouts)
// Desktop: ≥ 1024px (grid layouts)
```

## Performance Tips

1. **Memoize agent arrays:**
   ```tsx
   const memoizedAgents = useMemo(() => agents, [agents]);
   ```

2. **Lazy load on scroll:**
   ```tsx
   const ConsensusMatrix = lazy(() => import('@/components/soap'));
   ```

3. **Debounce rapid updates:**
   ```tsx
   const debouncedProgress = useDebounce(progress, 300);
   ```

## Common Issues

### Animations not working
- Check if user has `prefers-reduced-motion` enabled
- Verify `framer-motion` is installed

### Type errors
- Import types from `@/types/soap`
- Ensure all required fields are provided

### Components not rendering
- Check Next.js config allows client components
- Verify all dependencies are installed

### Dark mode issues
- Ensure parent has `dark` class
- Check Tailwind dark mode is enabled

## Demo

```bash
# View all components
npm run dev
open http://localhost:3000/soap-demo
```

## Documentation

- Full docs: `/src/components/soap/README.md`
- Architecture: `/docs/SOAP-UI-ARCHITECTURE.md`
- Implementation: `/docs/SOAP-UI-COMPONENTS.md`
- Research: `/docs/SOAP-MULTIAGENT-RESEARCH.md`

## Support

For issues or questions:
1. Check component README
2. Review type definitions
3. See demo implementation in `SOAPDemo.tsx`
4. Test in `/soap-demo` page

## Version

Current: 1.0.0
Next.js: 16.0.10
React: 19.2.1
Framer Motion: 12.26.2
