# Dr. Simeon Showcase Component

An animated, production-ready chat interface showcasing Dr. Simeon AI's triage capabilities using OPQRST methodology.

## Features

✅ **Animated Chat Interface**
- Staggered message entrance with slide-in animations
- Character-by-character typing animation for AI responses
- Blinking cursor effect during typing
- Breathing pulse animation on avatar
- Smooth typing indicator with bouncing dots

✅ **Visual Design**
- Beige surface background (#f9f7f4) with animated blur blobs
- Blue message bubbles (#5588ff) for patient messages
- White bordered bubbles for AI messages
- Medical cross icon avatar with gradient
- Responsive: Side-by-side on desktop, stacked on mobile

✅ **Realistic Medical Conversation**
- Based on OPQRST triage methodology
- Demonstrates red flag detection (headache + neck stiffness)
- Shows urgency escalation flow
- Includes timestamps like real chat apps

✅ **Interactive Elements**
- Auto-plays conversation on mount
- Reset button to replay conversation
- Disabled input field (demo-only indicator)
- CTA buttons for booking and trying AI

## Usage

### Basic Integration

```tsx
import DrSimeonShowcase from '@/components/landing/DrSimeonShowcase'

export default function LandingPage() {
  return (
    <main>
      {/* Hero section */}
      <DrSimeonShowcase />
      {/* Other sections */}
    </main>
  )
}
```

### Customization

The conversation script is defined in the component and can be modified:

```tsx
const conversationScript: Omit<Message, 'id'>[] = [
  {
    role: 'patient',
    content: 'Your custom patient message',
    timestamp: '10:34',
  },
  {
    role: 'ai',
    content: 'Your custom AI response',
    timestamp: '10:34',
  },
  // Add more messages...
]
```

### Animation Timing

You can adjust the timing constants in the component:

- **Message stagger delay**: `.3s` (line 192: `delay: index * 0.3`)
- **Typing speed**: `20ms` per character (line 159: `20`)
- **Typing indicator delay**: `1.5s` (line 276: `1500`)
- **Patient message delay**: `0.8s` (line 286: `800`)

### Styling

The component uses Tailwind CSS and shadcn components. Key classes:

- Background: `bg-[#f9f7f4]`
- Patient bubbles: `bg-[#5588ff]`
- AI bubbles: `border border-gray-200 bg-white`
- Avatar gradient: `from-blue-500 to-blue-600`

## OPQRST Methodology

The conversation demonstrates:

1. **O (Onset)**: "¿El dolor apareció de manera repentina o fue gradual?"
2. **P (Provocation)**: Not shown in this example (could be "¿Algo lo empeora?")
3. **Q (Quality)**: Not shown (could be "¿Cómo describirías el dolor?")
4. **R (Radiation)**: "¿El dolor se queda en un lugar o se extiende?"
5. **S (Severity)**: "En una escala de 1 a 10, ¿qué tan intenso es?"
6. **T (Timing)**: "¿Cuándo comenzó?" (implicitly covered)

Plus **red flag detection**: Sudden severe headache + neck stiffness → Urgent care needed

## Dependencies

- `framer-motion`: ^12.26.2 (already installed)
- `@/components/ui/card`: shadcn Card component
- `@/components/ui/button`: shadcn Button component

## Performance

- Lightweight: ~7KB gzipped
- No external API calls during animation
- CSS animations via Framer Motion (GPU accelerated)
- Memoization ready (component is pure)

## Accessibility

- Semantic HTML structure
- ARIA label on reset button
- Keyboard navigation ready
- Screen reader friendly timestamps
- High contrast text (WCAG AA compliant)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- Uses CSS Grid and Flexbox

## Next Steps

To integrate into main landing page:

1. Import the component
2. Place between Hero and Features sections
3. Adjust button click handlers for navigation
4. Optional: Add analytics tracking on CTA clicks
5. Optional: Make conversation configurable via props

## Example with Custom CTA Handlers

```tsx
'use client'

import DrSimeonShowcase from '@/components/landing/DrSimeonShowcase'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main>
      <DrSimeonShowcase
        onBookConsultation={() => router.push('/book')}
        onTryAI={() => router.push('/chat')}
      />
    </main>
  )
}
```

Then update the component to accept these props:

```tsx
type Props = {
  onBookConsultation?: () => void
  onTryAI?: () => void
}

export default function DrSimeonShowcase({
  onBookConsultation,
  onTryAI
}: Props) {
  // ... rest of component

  <Button onClick={onBookConsultation}>
    Agendar Consulta
  </Button>
  <Button onClick={onTryAI}>
    Probar IA Ahora
  </Button>
}
```
