# SOAP Consultation UX: Accessibility & Family-Friendly Recommendations

**Date**: 2026-01-26
**Prepared by**: Research Specialist (Empathetic Exploratory)
**Status**: Ready for Implementation
**Priority**: CRITICAL - Accessibility is not optional

---

## Executive Summary

The current SOAP consultation implementation has a solid foundation but requires significant enhancements to serve families effectively and meet WCAG accessibility standards. This document provides **actionable, prioritized recommendations** to transform the consultation experience into an inclusive, anxiety-reducing, family-centered health journey.

### Key Findings

**Strengths:**
- Clean, progressive disclosure flow (9-step linear process)
- Good visual hierarchy with card-based layouts
- Existing motion animations (Framer Motion) provide visual feedback
- Input components have basic ARIA attributes

**Critical Gaps:**
- **No accessibility testing** - Missing ARIA labels, keyboard navigation, screen reader support
- **Adult-centric design** - Touch targets too small for children (44px minimum, need 72px for pediatric)
- **No age-adaptive patterns** - Single interface serves all ages
- **Missing emotional support** - No character guide during 60-second wait periods
- **Limited multimodal input** - Text-only symptom description, no body map
- **Anxiety-inducing language** - "Insoportable" (unbearable), clinical tone throughout

**Expected Impact:**
- 25-30% reduction in user anxiety (based on Wysa research)
- 15% increase in form completion rate
- 60%+ usage of body map for symptom input
- Full compliance with WCAG 2.1 AA standards
- Inclusive experience for ages 4+

---

## Part 1: Accessibility Audit Checklist

### 1.1 WCAG 2.1 Compliance (Priority: CRITICAL)

#### Perceivable
- [ ] **Color Contrast**: All text must meet 7:1 contrast ratio (AAA standard)
  - Current: Blue gradients may not meet contrast for low-vision users
  - Action: Test all text/background combinations with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - Target: 7:1 for normal text, 4.5:1 for large text (18pt+)

- [ ] **Text Sizing**: Support 200% zoom without loss of content
  - Current: Fixed breakpoints may break layout
  - Action: Use `container queries` and `fluid typography` (clamp() functions)
  - Test: Zoom to 200% in browser, verify horizontal scrolling is not required

- [ ] **Alternative Text**: All images/icons need descriptive alt text
  - Missing: Icon-only buttons (Users icon, CheckCircle2, ArrowRight)
  - Current `<ArrowRight className="w-4 h-4 ml-2" />`
  - Fix: `<ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />`
  - Add `aria-label="Continuar a siguiente paso"` to parent button

- [ ] **Audio Alternatives**: Transcripts for any audio content
  - Future: Voice input feature will need text transcript display

#### Operable
- [ ] **Keyboard Navigation**: Full functionality without mouse
  - Current: Tab navigation works but focus indicators are weak
  - Action: Add visible focus rings (currently has `focus-ring` class, verify visibility)
  - Test: Navigate entire flow with Tab/Shift+Tab/Enter/Escape

- [ ] **Touch Target Size**: Minimum 44x44px (WCAG), 72x72px for children
  - Current: Duration buttons are 2-column grid, may be too small
  - Action: Ensure all interactive elements meet size thresholds
  - Pediatric mode: 72x72px minimum (4x larger than adult standard)

- [ ] **Timeout Warnings**: 60-second AI processing needs warning
  - Current: No warning before timeout
  - Action: Show countdown at 45 seconds, allow extension
  - Add: "¿Necesitas más tiempo? Mantén la sesión activa" button

- [ ] **Error Recovery**: Clear error messages and recovery paths
  - Current: Generic error display (line 594-610)
  - Action: Add specific error messages and suggested corrections
  - Example: "No entendí 'dolor de cabesa'. Quisiste decir 'dolor de cabeza'?"

#### Understandable
- [ ] **Language Declaration**: Add `<html lang="es">`
  - Current: Not verified in codebase
  - Action: Ensure all pages have proper lang attribute

- [ ] **Reading Level**: Content must be understandable by users with limited education
  - Current: Medical terms like "Análisis simultáneo", "Consenso médico"
  - Action: Provide plain language alternatives
  - Add: "¿Qué significa esto?" tooltips with simple explanations

- [ ] **Consistent Navigation**: Same elements in same order across screens
  - Current: "Volver" button location varies (sometimes top-right, sometimes bottom)
  - Action: Standardize placement (recommend top-left for "Volver", bottom-right for "Continuar")

#### Robust
- [ ] **Screen Reader Compatibility**: Test with NVDA, JAWS, VoiceOver
  - Current: Basic ARIA attributes exist but not comprehensive
  - Action: Full screen reader testing cycle
  - Add: `role="navigation"`, `aria-current="step"`, live regions for updates

- [ ] **Semantic HTML**: Use proper elements instead of div soup
  - Current: Heavy use of `<div>` instead of `<button>`, `<section>`, etc.
  - Action: Refactor to semantic HTML
  - Example: Suggestions buttons should be `<button>` not `<div onClick={...}>`

---

### 1.2 Accessibility Testing Plan

#### Automated Testing
```bash
# Install accessibility audit tools
npm install --save-dev @axe-core/react axe-core

# Run automated audit
npx axe http://localhost:3000/app/ai-consulta --tags wcag2a,wcag2aa,wcag21aa
```

#### Manual Testing Checklist
- [ ] Navigate entire flow using only keyboard (Tab/Enter/Escape/Arrow keys)
- [ ] Test with VoiceOver (macOS): Cmd+F5 to enable
- [ ] Test with NVDA (Windows): Ctrl+Alt+N to enable
- [ ] Test at 200% browser zoom
- [ ] Test with high contrast mode enabled (Windows: Shift+Alt+PrintScreen)
- [ ] Test with color blindness simulators
  - Use [Chrome DevTools Rendering > Emulate vision deficiencies]
  - Test: Protanopia, Deuteranopia, Tritanopia, Achromatopsia
- [ ] Test with screen magnification tools
- [ ] Test with voice input (Dragon NaturallySpeaking, Windows Speech Recognition)

#### User Testing
- [ ] Recruit 5 users with disabilities
  - 2 screen reader users
  - 1 keyboard-only user (motor impairment)
  - 1 low-vision user
  - 1 color-blind user
- [ ] Observe them completing the consultation flow
- [ ] Document pain points and fix in priority order

---

## Part 2: Age-Adaptive Enhancements

### 2.1 Age Group Profiles

| Age Group | Cognitive Level | Motor Skills | Anxiety Level | Parent Role |
|-----------|----------------|--------------|---------------|-------------|
| **4-6 years** | Pre-operational | Developing fine motor | High (white coat anxiety) | Required - active participant |
| **7-12 years** | Concrete operational | Good motor skills | Medium | Supervision - child-led |
| **13-17 years** | Formal operational | Adult motor skills | Low-Medium | Optional - on request |
| **18+ years** | Adult | Full motor skills | Varies | N/A |

### 2.2 Pediatric Mode Specifications

#### Age Detection Strategy
```typescript
// Add to user profile / onboarding
interface UserProfile {
  dateOfBirth: Date;
  pediatricMode: 'auto' | 'force-on' | 'force-off';
}

// Auto-calculate age-appropriate mode
function getAgeGroup(dob: Date): AgeGroup {
  const age = calculateAge(dob);
  if (age < 7) return '4-6';
  if (age < 13) return '7-12';
  if (age < 18) return '13-17';
  return '18+';
}
```

#### Visual Adaptations by Age

**4-6 Years (Preschool/Early Elementary)**
```typescript
const pediatricPreschoolConfig = {
  // Layout
  docuSize: 240, // px - large character
  touchTargetSize: 72, // px - 4x adult standard

  // Typography
  baseFontSize: 18, // px (vs 16 for adults)
  lineHeight: 1.8, // Extra spacing
  fontWeight: 'Semi-Bold', // Better readability

  // Colors
  primaryColor: '#4ade80', // Soft green (less alarming than blue)
  backgroundColor: '#F0FDF4', // Very light green
  alertColor: '#FECACA', // Soft red (not alarming)

  // Language
  languageStyle: 'playful',
  useEmojis: true,
  sentenceLength: 'short', // 5-7 words max
  useAnimations: true,

  // Interaction
  inputMethod: 'visual', // Prefer buttons over typing
  parentMode: 'co-view', // Split screen
  readingLevel: 'age-5',
}
```

**7-12 Years (Elementary/Middle)**
```typescript
const pediatricSchoolAgeConfig = {
  docuSize: 200,
  touchTargetSize: 64,
  baseFontSize: 17,
  primaryColor: '#3b82f6', // Standard blue
  languageStyle: 'explanatory',
  useEmojis: false,
  inputMethod: 'hybrid', // Visual + limited text
  parentMode: 'supervision', // Parent can observe
  readingLevel: 'age-10',
}
```

**13-17 Years (Teen)**
```typescript
const teenConfig = {
  docuSize: 160,
  touchTargetSize: 48,
  baseFontSize: 16,
  primaryColor: '#3b82f6',
  languageStyle: 'semi-adult',
  inputMethod: 'text',
  parentMode: 'optional',
  readingLevel: 'age-14',
}
```

### 2.3 Pain Scale Adaptations

#### Wong-Baker FACES Scale (Ages 3-7)
```typescript
// Replace numeric slider with visual faces
const wongBakerScale = [
  { value: 0, face: '😊', label: 'No me duele nada' },
  { value: 2, face: '😊', label: 'Me duele un poquito' },
  { value: 4, face: '😐', label: 'Me duele un poco' },
  { value: 6, face: '😕', label: 'Me duele bastante' },
  { value: 8, face: '😢', label: 'Me duele mucho' },
  { value: 10, face: '😭', label: 'Me duele muchísimo' },
]
```

#### Faces + Numbers Scale (Ages 8-12)
```typescript
const facesWithNumbers = [
  { value: 1, face: '🙂', color: '#86efac' }, // Light green
  { value: 3, face: '😐', color: '#bef264' },
  { value: 5, face: '😕', color: '#fde047' }, // Yellow
  { value: 7, face: '😣', color: '#fdba74' },
  { value: 9, face: '😢', color: '#fca5a5' }, // Light red
  { value: 10, face: '😭', color: '#ef4444' }, // Red
]
```

#### Numeric Scale (Ages 13+)
```typescript
// Keep existing slider but add better visual anchors
const numericScaleAnchors = {
  1: { label: 'Muy leve', color: '#86efac', icon: '☀️' },
  3: { label: 'Leve', color: '#bef264', icon: '🌤️' },
  5: { label: 'Moderado', color: '#fde047', icon: '⛅' },
  7: { label: 'Intenso', color: '#fdba74', icon: '🌥️' },
  10: { label: 'Muy intenso', color: '#ef4444', icon: '⛈️' },
}
```

---

## Part 3: Emotional Design Elements

### 3.1 Anxiety-Reducing Language Patterns

#### Language Transformation Examples

**Current (Anxiety-Inducing):**
- ❌ "Insoportable" (unbearable)
- ❌ "Evaluación completada" (cold, clinical)
- ❌ "Los especialistas reachan un diagnóstico" (typo + formal)
- ❌ "Plan de acción con próximos pasos específicos"

**Recommended (Warm, Reassuring):**
- ✅ "Mucho malestar" (much discomfort) - not "unbearable"
- ✅ "¡Ya entiendo lo que sientes!" (I understand what you're feeling)
- ✅ "Los doctores están pensando contigo" (warm, supportive)
- ✅ "Juntos haremos un plan para sentirte mejor" (collaborative, hopeful)

#### Emotional Support Messages by Phase

**Welcome Phase**
```typescript
const welcomeMessages = {
  adult: [
    "Hola, soy Docu. Estoy aquí para guiarte.",
    "Cuéntame, ¿cómo te sientes hoy?",
    "No hay respuestas incorrectas. Solo cuéntame tu experiencia.",
  ],
  child: [
    "¡Hola amigo! 🐾 Soy Docu, tu perrito doctor.",
    "¿Sabes qué? ¡Los superhéroes también se sienten mal a veces!",
    "Vamos a jugar a los médicos. ¿Me cuentas qué te pasa?",
  ],
  parent: [
    "Gracias por ayudarles hoy.",
    "Tu apoyo hace todo la diferencia.",
    "Los niños expresan el dolor diferente. Confía en tu observación.",
  ],
}
```

**Processing Phase (60-second wait)**
```typescript
const processingMessages = {
  adult: [
    "Los doctores están conectando los puntos...",
    "Estamos siendo muy cuidadosos contigo...",
    "Casi listo. La precisión toma un momento...",
    "Gracias por tu paciencia. Queremos asegurarnos de entender bien.",
  ],
  child: [
    "¿Sabes qué? Los doctores están pensando como detectives 🕵️",
    "Docu está esperando contigo. ¡Casi listo!",
    "Mira las vueltas que da Docu 🐕",
    "¡Los doctores son muy cuidadosos! Están pensando mucho...",
  ],
}
```

**Results Phase**
```typescript
const resultsMessages = {
  highUrgency: {
    adult: "Esto necesita atención pronto. Estoy contigo.",
    child: "Los doctores dicen que necesitas ver a un médico de verdad hoy. ¡Tus papás te cuidan!",
  },
  moderateUrgency: {
    adult: "Esto es tratable. Tenemos un plan.",
    child: "¡Buenas noticias! Podemos hacer muchas cosas para que te sientas mejor.",
  },
  lowUrgency: {
    adult: "Esto es muy común. Te compartiremos cómo manejarlo.",
    child: "¡Super buena noticia! Es algo que podemos cuidar en casa. ¡Tú puedes!",
  },
}
```

### 3.2 Animation Specifications

#### Character Animations (Docu the St. Bernard)

**Animation Timing Guidelines**
- IDLE: 3-second breathing cycle (subtle, not distracting)
- LISTENING: Head tilt 15° over 0.3s (responsive feel)
- THINKING: Paw under chin, slow blink (calming presence)
- CONCERNED: Eyebrows lower, gentle forward lean (empathy)
- HAPPY: Tail wag 0.5s cycle, slight bounce (joy)
- CELEBRATING: Small hop + confetti (reward)
- SLEEPING: Z bubble animation after 30s wait (humor during delays)

```css
/* Breathing animation for IDLE state */
@keyframes gentle-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.docu-idle {
  animation: gentle-breathe 3s ease-in-out infinite;
}

/* Concerned expression */
@keyframes show-concern {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px) rotate(-2deg); }
}

.docu-concerned {
  animation: show-concern 0.5s ease-out forwards;
}
```

#### Progress Celebrations

**Milestone Confetti**
```typescript
// Use canvas-confetti library
import confetti from 'canvas-confetti';

const celebrateMilestone = (milestone: string) => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4ade80', '#3b82f6', '#fbbf24'], // Calming colors
  });
};

// Trigger at each step completion
const milestones = [
  'welcome-complete',
  'symptoms-captured',
  'body-map-selected',
  'specialists-consulted',
  'plan-received',
];
```

**Streak Fire Animation (Duolingo-style)**
```css
@keyframes flicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.streak-fire {
  animation: flicker 0.5s ease-in-out infinite;
}
```

---

## Part 4: Family Mode Specifications

### 4.1 Parent-Child Collaborative Interface

#### Split-Screen Layout (Ages 4-7)

```typescript
// Layout for parent-child mode
<div className="grid grid-cols-2 gap-4 pediatric-split">
  {/* Left side - Child's view */}
  <section className="child-view" aria-label="Área del niño">
    <CharacterAvatar size={240} state="listening" />
    <h2>¿Cómo te sientes?</h2>
    <VisualSymptomSelector /> // Large touch targets, emojis
  </section>

  {/* Right side - Parent's view */}
  <section className="parent-view" aria-label="Área del padre">
    <h3>Ayuda a tu hijo a describir:</h3>
    <ParentObservationForm />
    <TipsForParents />
  </section>
</div>
```

#### Dual-Cursor Interaction

```typescript
// Allow simultaneous input from parent and child
const useDualCursorMode = () => {
  const [childInput, setChildInput] = useState('');
  const [parentInput, setParentInput] = useState('');

  return {
    childInput,
    parentInput,
    setChildInput,
    setParentInput,
    combinedInput: mergeInputs(childInput, parentInput),
  };
};
```

### 4.2 Parent Guidance System

#### Contextual Tips for Parents

```typescript
const parentTips = {
  'chief-complaint': [
    "Déjale que use sus propias palabras",
    "Los niños dicen 'me duele todo' cuando están cansados",
    "Observa si señala una zona específica",
  ],
  'duration': [
    "Los niños tienen poco sentido del tiempo",
    "Usa referencias: '¿Empezó antes o después de la escuela?'",
    "Verifica con la otra persona que los cuida",
  ],
  'severity': [
    "El dolor afecta sus actividades normales",
    "¿Está comiendo? ¿Durmiendo? ¿Jugando?",
    "Observa su comportamiento general",
  ],
  'associated-symptoms': [
    "Los niños no siempre conectan síntomas",
    "Observa: ¿Está más tranquilo de lo normal?",
    "Revisa temperatura si puedes",
  ],
};
```

#### Observation Checklist for Parents

```typescript
const parentObservationChecklist = [
  {
    category: 'Comportamiento',
    items: [
      'Más irritable de lo normal',
      'Menos activo/juguetón',
      'No quiere comer',
      'Duerme más o menos de lo usual',
    ],
  },
  {
    category: 'Físico',
    items: [
      'Palidez',
      'Ojos rojos/cansados',
      'Respiración diferente',
      'Temperatura (si tiene termómetro)',
    ],
  },
  {
    category: 'Emocional',
    items: [
      'Más pegajoso (busca contacto)',
      'Más retraído (se aleja)',
      'Llanto frecuente',
      'Miedos inusuales',
    ],
  },
];
```

---

## Part 5: Implementation Roadmap

### Phase 1: Accessibility Foundation (Week 1-2) - CRITICAL

**Priority: BLOCKER** - Must complete before other phases

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Implement semantic HTML refactor | 2 days | HIGH | Frontend Dev |
| Add comprehensive ARIA labels | 1 day | HIGH | Frontend Dev |
| Keyboard navigation testing & fixes | 2 days | HIGH | QA + Frontend |
| Color contrast audit & fixes | 1 day | HIGH | Designer + Dev |
| Screen reader testing cycle | 2 days | HIGH | QA |
| Focus indicator improvements | 0.5 day | MEDIUM | Frontend Dev |
| Add timeout warnings | 1 day | MEDIUM | Frontend Dev |
| Language attribute & meta tags | 0.5 day | LOW | Frontend Dev |

**Success Criteria:**
- ✅ Passes automated axe-core audit with 0 errors
- ✅ Keyboard-only users can complete entire flow
- ✅ Screen reader users can complete entire flow
- ✅ All text meets 7:1 contrast ratio

### Phase 2: Quick Wins (Week 3) - HIGH IMPACT

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Replace anxiety-inducing language | 1 day | HIGH | Copywriter + Dev |
| Add encouraging microcopy | 1 day | HIGH | Copywriter + Dev |
| Implement warm color palette | 0.5 day | MEDIUM | Designer + Dev |
| Add progress celebrations (confetti) | 0.5 day | MEDIUM | Frontend Dev |
| Larger touch targets (all users) | 1 day | MEDIUM | Frontend Dev |
| Add "¿Qué significa esto?" tooltips | 1 day | MEDIUM | UX Writer + Dev |

**Success Criteria:**
- ✅ User anxiety surveys show 15% reduction
- ✅ 25% increase in form completion rate
- ✅ Touch targets meet WCAG 44x44px minimum

### Phase 3: Age-Adaptive Patterns (Week 4-6) - STRATEGIC

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Age detection & user profile enhancement | 2 days | HIGH | Backend + Frontend |
| Wong-Baker FACES scale implementation | 2 days | HIGH | Frontend Dev |
| Pediatric mode UI components | 3 days | HIGH | Frontend Dev |
| Parent-child split screen | 3 days | HIGH | Frontend Dev |
| Parent guidance tooltips | 2 days | MEDIUM | UX Writer + Dev |
| Character animations (Docu states) | 3 days | MEDIUM | Motion Designer + Dev |

**Success Criteria:**
- ✅ Children ages 4-12 can complete consultation with parent help
- ✅ 40% of users opt into pediatric mode when eligible
- ✅ Parent satisfaction score >4/5

### Phase 4: Body Map Integration (Week 7-9) - TRANSFORMATIONAL

| Task | Effort | Impact | Owner |
|------|--------|--------|-------|
| Install @mjcdev/react-body-highlighter | 0.5 day | HIGH | Frontend Dev |
| Body map component development | 3 days | HIGH | Frontend Dev |
| Symptom-to-body-region mapping | 2 days | HIGH | Backend |
| Intensity selector (long-press) | 1 day | MEDIUM | Frontend Dev |
| Pediatric body map (simplified regions) | 2 days | MEDIUM | Frontend Dev |
| Front/posterior view toggle | 1 day | LOW | Frontend Dev |

**Success Criteria:**
- ✅ 60%+ users select body regions for symptom localization
- ✅ Body map improves diagnosis accuracy by 15%
- ✅ Children can use body map with parent guidance

---

## Part 6: Metrics & Success Measurement

### 6.1 Accessibility Metrics

**Automated Testing**
```bash
# Target: 0 accessibility errors in axe-core audit
npx axe http://localhost:3000/app/ai-consulta --tags wcag2aa
```

**Manual Testing**
- [ ] Keyboard-only: Complete flow in <5 minutes
- [ ] Screen reader: Complete flow in <8 minutes
- [ ] 200% zoom: No horizontal scroll
- [ ] High contrast mode: All content readable

**User Testing**
- [ ] 5/5 users with disabilities can complete consultation
- [ ] Average task completion time <8 minutes (disabled users)
- [ ] System Usability Scale (SUS) score >70

### 6.2 Family-Friendly Metrics

**Age-Appropriate Usage**
- Pediatric mode adoption rate: Target >40% (for eligible users)
- Parent satisfaction: Target >4.2/5
- Child engagement (time-on-task): Target <10 minutes (ages 4-7)

**Anxiety Reduction**
- Pre-consultation anxiety survey: Baseline
- Post-consultation anxiety survey: Target 20-30% reduction
- "Felt supported" score: Target >4.5/5

**Engagement Metrics**
- Form completion rate: Baseline → Target +15%
- Body map usage: Target >60% (when implemented)
- Progress milestone celebration: 100% trigger rate
- Character helpfulness: Target >4/5

### 6.3 Quality of Care Metrics

**Data Collection Quality**
- Symptom detail completeness: Target +25%
- Body region specificity: Target +40% (with body map)
- Parent observation inclusion: Target >70% (pediatric mode)

**Diagnostic Accuracy**
- Specialist confidence scores: Baseline → Track improvement
- Consensus agreement level: Baseline → Track improvement
- User-reported accuracy: Target >4/5

---

## Part 7: Component Library Extensions

### 7.1 New Accessibility Components

```typescript
// src/components/soap/accessibility/Announcer.tsx
// Live region for screen reader announcements
export function Announcer({ message, priority = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Usage
<Announcer message="Dr. Garcia ha completado su evaluación" priority="polite" />
```

```typescript
// src/components/soap/accessibility/FocusTrap.tsx
// Trap focus within modal/step
export function FocusTrap({ children, active }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[
      focusableElements.length - 1
    ] as HTMLElement;

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [active]);

  return <div ref={containerRef}>{children}</div>;
}
```

### 7.2 Pediatric Components

```typescript
// src/components/soap/pediatric/WongBakerScale.tsx
export function WongBakerScale({ onSelect, selected }) {
  const faces = [
    { value: 0, face: '😊', label: 'No me duele' },
    { value: 2, face: '😊', label: 'Un poquito' },
    { value: 4, face: '😐', label: 'Un poco' },
    { value: 6, face: '😕', label: 'Bastante' },
    { value: 8, face: '😢', label: 'Mucho' },
    { value: 10, face: '😭', label: 'Muchísimo' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4" role="radiogroup">
      {faces.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={`
            p-6 rounded-2xl border-4 transition-all
            ${selected === item.value
              ? 'border-green-500 bg-green-50 scale-110'
              : 'border-gray-200 hover:border-green-300'
            }
          `}
          aria-label={item.label}
          aria-pressed={selected === item.value}
          style={{ minWidth: '120px', minHeight: '120px' }} // 72px touch target
        >
          <div className="text-5xl mb-2">{item.face}</div>
          <div className="text-sm font-bold">{item.label}</div>
        </button>
      ))}
    </div>
  );
}
```

```typescript
// src/components/soap/pediatric/ParentGuidance.tsx
export function ParentGuidance({ currentStep }) {
  const tips = parentTips[currentStep];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">
            Consejos para padres
          </h4>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
```

### 7.3 Character Component

```typescript
// src/components/soap/character/DocuCharacter.tsx
export function DocuCharacter({
  state = 'idle',
  size = 120,
  ageGroup = 'adult',
}) {
  const sizeMap = {
    '4-6': 240,
    '7-12': 200,
    '13-17': 160,
    '18+': 120,
  };

  const actualSize = sizeMap[ageGroup] || size;

  return (
    <figure
      className={`docu-character docu-${state}`}
      style={{ width: actualSize, height: actualSize }}
      role="img"
      aria-label={`Docu el perro doctor - ${state}`}
    >
      {/* SVG illustration of St. Bernard */}
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Character artwork - simplified for example */}
        <circle cx="100" cy="100" r="80" fill="#C4876B" /> // Body
        <circle cx="100" cy="60" r="50" fill="#C4876B" /> // Head
        {/* Add ears, collar, medical cross */}
      </svg>

      {/* Speech bubble for dialogue */}
      {state === 'listening' && (
        <div className="speech-bubble" aria-live="polite">
          Te escucho...
        </div>
      )}
    </figure>
  );
}
```

---

## Part 8: Copy & Content Guidelines

### 8.1 Plain Language Principles

**Reading Level Targets**
- Adults: 8th grade reading level (Flesch-Kincaid)
- Teens: 6th grade reading level
- Children: 3rd-5th grade reading level (age-dependent)

**Sentence Structure**
- Max 15 words per sentence (adults)
- Max 10 words per sentence (teens)
- Max 7 words per sentence (children)

**Example Translations**

| Original (Clinical) | Plain Language | Pediatric |
|---------------------|----------------|-----------|
| "Dolor abdominal" | "Dolor de barriga" | "¿Te duele la panza?" |
| "Náuseas" | "Ganas de vomitar" | "¿Sientes que vas a devolver?" |
| "Inicio gradual" | "Empezó poco a poco" | "¿Empezó despuesito o de golpe?" |
| "Factores agravantes" | "Qué lo empeora" | "¿Qué hace que te sientas peor?" |
| "Antecedentes médicos" | "Historia de salud" | "¿Has estado enfermo antes?" |

### 8.2 Emoji Usage Guidelines

**Pediatric Mode (Ages 4-7)**
- ✅ Use emojis as visual anchors: 😊 🏥 💊 🌡️
- ✅ Use emojis for symptom buttons: 🤢 🤕 🤒
- ✅ Use emojis for feedback: ⭐ 🌟 ✨
- ❌ Avoid medical emojis that may scare: 🩸 💉 🏚️

**Teen/Adult Mode**
- ✅ Minimal emoji use
- ✅ Only for celebration: ✨ ⭐
- ❌ No emojis in questions or instructions

---

## Part 9: Technical Implementation Notes

### 9.1 Internationalization (i18n)

The consultation flow should support multiple languages. Structure all copy for translation:

```typescript
// locales/es/pediatric.json
{
  "wongBaker": {
    "0": { "face": "😊", "label": "No me duele nada" },
    "2": { "face": "😊", "label": "Me duele un poquito" },
    // ...
  },
  "welcome": {
    "adult": "Hola, soy Docu. Estoy aquí para guiarte.",
    "child": "¡Hola amigo! 🐾 Soy Docu, tu perrito doctor.",
  }
}

// Usage
import { useTranslations } from 'next-intl';

function PediatricPainScale() {
  const t = useTranslations('pediatric.wongBaker');
  // ...
}
```

### 9.2 Accessibility Props Pattern

All interactive components should accept accessibility props:

```typescript
interface AccessibleButtonProps {
  children: ReactNode;
  ariaLabel?: string;
  ariaDescribedby?: string;
  role?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
  // ... standard button props
}

export function AccessibleButton({
  children,
  ariaLabel,
  ariaDescribedby,
  role,
  ...props
}: AccessibleButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      role={role}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 9.3 Progressive Enhancement Strategy

1. **Base Layer**: Semantic HTML, works without JavaScript
2. **Enhancement Layer**: React state management for smooth UX
3. **Experience Layer**: Animations, character interactions (optional)

```typescript
// Example: Progressive form submission
async function submitConsultation(data: FormData) {
  // Base: HTML form submission (no-JS fallback)
  const formData = new FormData(formRef.current);

  // Enhancement: Client-side validation
  if (!validate(data)) {
    showError('Por favor completa todos los campos');
    return;
  }

  // Experience: Optimistic UI updates
  setSubmitting(true);
  setCurrentStep('consulting');

  // API call
  try {
    await api.submit(data);
  } catch (error) {
    // Graceful degradation
    setCurrentStep('history');
    setSubmitting(false);
  }
}
```

---

## Part 10: Testing Protocols

### 10.1 Accessibility Testing Checklist

**Before Each Release:**
- [ ] Run axe-core automated audit
- [ ] Test keyboard navigation (full flow)
- [ ] Test with screen reader (VoiceOver + NVDA)
- [ ] Test at 200% zoom
- [ ] Test color contrast (all text)
- [ ] Test with high contrast mode
- [ ] Test with Windows Narrator
- [ ] Test with Dragon NaturallySpeaking (voice control)

**Weekly:**
- [ ] Manual accessibility review of new features
- [ ] Screen reader user testing (if available)
- [ ] Keyboard-only user testing

**Quarterly:**
- [ ] Full accessibility audit with disabled users
- [ ] Update accessibility statement
- [ ] Review WCAG compliance (target: 2.1 AA)

### 10.2 Family-Friendly Testing

**Pediatric Usability Testing:**

Recruit 5 families per age group:
1. Preschool (4-6) with parent
2. School age (7-12) with parent
3. Teen (13-17) optional parent

**Task Scenarios:**
1. Complete consultation for "dolor de barriga"
2. Complete consultation for "fiebre y dolor de cabeza"
3. Complete consultation for "dolor al respirar"

**Measure:**
- Time to complete
- Parent-child interaction quality
- Child engagement level
- Completion rate
- Satisfaction score

---

## Conclusion & Next Steps

### Immediate Actions (This Week)

1. **CRITICAL**: Run automated accessibility audit
   ```bash
   npm install --save-dev @axe-core/react
   npx axe http://localhost:3000/app/ai-consulta
   ```

2. **HIGH PRIORITY**: Refactor step navigation buttons to use semantic HTML
   - Change `<div onClick={...}>` to `<button>`
   - Add proper ARIA labels

3. **HIGH PRIORITY**: Replace anxiety-inducing language
   - Audit all user-facing copy
   - Replace "insoportable" with "muy intenso"
   - Add encouraging messages

### Implementation Priority Order

1. **Week 1-2**: Accessibility foundation (BLOCKER)
2. **Week 3**: Quick wins (language, colors, microcopy)
3. **Week 4-6**: Age-adaptive patterns (pediatric mode)
4. **Week 7-9**: Body map integration
5. **Week 10-12**: Character animations & polish
6. **Ongoing**: User testing & iteration

### Success Criteria

**Accessibility:**
- ✅ WCAG 2.1 AA compliant
- ✅ Passes automated audit with 0 errors
- ✅ Keyboard/screen reader users can complete flow

**Family-Friendly:**
- ✅ 60%+ body map usage
- ✅ 15% increase in completion rate
- ✅ 20-30% anxiety reduction
- ✅ Children ages 4+ can participate with parent help

---

**Document Version**: 1.0
**Last Updated**: 2026-01-26
**Next Review**: After Phase 1 completion (2 weeks)

**Appendices:**
- A: WCAG 2.1 Checklist
- B: User Testing Scripts
- C: Character Animation Specifications
- D: Body Map Integration Guide
- E: Copy Translation Template

---

*"The measure of a society is found in how they treat their weakest and most helpless citizens."* - Accessibility is not a feature, it's a fundamental right.
