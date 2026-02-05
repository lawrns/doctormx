# Doctor.mx - Design Context

## Design Context

### Users
**Two primary user groups:**

1. **Patients** - People in Mexico seeking medical care, often with health concerns that cause anxiety. They need clarity, reassurance, and quick access to verified doctors. They may be on mobile devices, in urgent situations, or managing ongoing conditions.

2. **Doctors** - Licensed medical professionals in Mexico who need efficient tools to manage appointments, patient records, prescriptions, and earnings. They value professionalism, time-saving features, and clinical precision.

**Context of use:** Patients are often anxious about their health; doctors are busy managing multiple patients. The interface must respect both emotional states—calm for patients, efficient for doctors.

### Brand Personality
**Three words:** Professional, Trustworthy, Modern

**Voice & Tone:**
- Authoritative but approachable medical voice
- Clear, precise language (bilingual: Spanish primary, English secondary)
- Warm enough to reduce anxiety, serious enough to convey medical credibility
- "Dr. Simeon" AI assistant adds a touch of innovation while maintaining medical professionalism

**Emotional Goals:** Patients should feel confident and reassured; doctors should feel empowered and efficient.

### Aesthetic Direction
**Visual Tone:** Clean, modern medical platform inspired by telehealth leaders (Teladoc, Zocdoc) but with Mexican market positioning.

**Key References:**
- Modern telehealth platforms (clean, trustworthy, video-first)
- Medical booking systems (clarity, efficiency)
- B2B healthcare tools (professional dashboards for doctors)

**Anti-References:**
- Old-school medical websites (clipart doctors, dated blue gradients, sterile stock photos)
- Insurance company portals (cold, bureaucratic, confusing)
- Overly playful health startups (too casual for serious medical concerns)

**Theme:** Light mode default with medical blue (#3b82f6) primary. Dark mode available for late-night doctor use. Teal accents (#14b8a6) for success states and secondary actions.

### Design Principles

1. **Clinical Clarity Above All**
   - Medical information must be unmistakably clear
   - Typography hierarchy guides attention to what matters most
   - Avoid decorative elements that could distract from health information
   - When in doubt, prioritize legibility over ornamentation

2. **Trust Through Professionalism**
   - Use established medical UI patterns (users expect certain conventions)
   - Verified doctor badges, ratings, and credentials prominently displayed
   - Consistent spacing and alignment creates perceived reliability
   - Never sacrifice clarity for trendy design

3. **Reduce Patient Anxiety**
   - Warm, friendly microcopy in anxious moments (loading states, errors)
   - Clear next steps—"What happens next?" should always be obvious
   - Emergency options visible but not alarmist
   - Smooth animations feel reassuring, never jarring

4. **Efficiency for Doctors'
   - Doctors manage multiple patients; optimize for density without clutter
   - Keyboard shortcuts, quick actions, bulk operations where appropriate
   - Information architecture supports quick scanning of patient data
   - Minimal clicks to complete common tasks (prescribe, reschedule, view records)

5. **Mexican Market, Global Standards**
   - Spanish language primary, with Mexican medical terminology
   - Culturally neutral design—works for diverse Mexican population
   - Payment and integration patterns familiar to Mexican users (Stripe, WhatsApp sharing)
   - Accessibility (WCAG AA) ensures inclusive care for all patients

---

## Design System Summary

**Colors:**
- Primary: Medical Blue `#3b82f6` (hsl(217 91% 60%))
- Accent: Teal `#14b8a6` (hsl(173 58% 39%))
- Background: White with subtle gray borders
- Dark mode available for doctors' late-night use

**Typography:**
- Headings: Hedvig Letters Serif (warm, professional)
- Body: Geist Sans (clean, readable)
- Code/Medical Data: Geist Mono (precision)

**Components:**
- shadcn/ui foundation with custom medical variants
- Rounded corners: 0.75rem (approachable but not playful)
- Subtle shadows, refined borders
- Smooth animations (200-300ms) for reassurance, never decoration

**Spacing:**
- Generous whitespace reduces cognitive load for anxious patients
- Consistent 4px/8px grid alignment
- Larger touch targets (44px+) for mobile patients
