# UI/UX Context

## Product Experience

Doctory is a clinical marketplace, not a playful wellness app. The interface should communicate:

- medical trust,
- fast booking,
- clear doctor credentials,
- payment confidence,
- calm clinical triage,
- patient privacy,
- professional doctor workflows.

## Existing Design Notes

Historical `HANDOFF.md` states design preferences:

- Use restrained clinical UI.
- Lucide React icons.
- Avoid emojis and neon styling.
- Use spring-like motion where motion exists.
- Avoid loud gradients and oversized card stacks in clinical flows.
- Keep specialist detail behind disclosure in AI consult surfaces.

`CARDS.md` includes card/category guidance and warns against oversized decorative icon boxes.

The repo has many design artifacts:
- `docs/brand/doctor-mx-design-system.md`
- `docs/brand/doctory.style-guide.json`
- `docs/brand/public-spacing.md`
- `docs/designs/*.html`
- root HTML mockups such as `AI Consulta.html`, `Doctors Directory v2.html`, `Doctor.mx Design System.html`.

Treat old mockups as reference, not automatically as implementation truth.

## AI Consult UX

Current important files:
- `src/components/ai-consulta/DrSimeonProtocolChat.tsx`
- `src/components/ai-consulta/protocol.ts`
- `src/app/ai-consulta/page.tsx`
- `src/app/app/ai-consulta/page.tsx`

Observed behavior:
- First asks for first name before symptoms.
- Uses structured protocol steps.
- Detects emergency phrases and directs to 911/urgent care.
- Keeps "Dr. Simeon" as orientation/initial guidance.
- Supports degraded provider fallback.

Do not turn AI consultation into definitive diagnosis or an opaque multi-agent spectacle. The main job is triage, case organization, doctor referral, and safe escalation.

## Marketplace UX

Money path views should make these obvious:

- Who the doctor is.
- Whether they are verified/approved.
- Specialty/city/modality.
- Price/currency and payment method.
- Slot availability.
- What happens after payment.
- How to join video.
- How patient data and clinical context are handled.

Do not hide verification state, pricing, appointment type, or payment state behind decorative UI.

## Doctor/Admin UX

Doctor/admin surfaces are operational tools. Prioritize:

- dense but scan-friendly tables/lists,
- clear statuses,
- auditability,
- low-friction review,
- minimal ambiguity between draft/pending/approved/rejected/confirmed/cancelled states.

Admin verification UI and doctor credential display are trust-critical.

## UI Testing

Relevant commands:

```bash
npm run audit:ui
npm run test:e2e
```

Relevant E2E files:
- `e2e/navigation.spec.ts`
- `e2e/booking.spec.ts`
- `e2e/consultation.spec.ts`
- `e2e/doctors.spec.ts`
- `e2e/frontend-optimization.spec.ts`
- `e2e/scroll.spec.ts`

Before major UI changes, verify desktop and mobile layouts with Playwright/browser screenshots.
