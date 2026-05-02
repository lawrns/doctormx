# Current Context

Date: 2026-04-29
Repo: `/Users/lukatenbosch/Downloads/doctory`
Remote: `origin https://github.com/lawrns/doctormx.git`
Branch: `main...origin/main`
Dirty state before context files: clean tracked worktree.

## Product Truth

Doctory / DoctorMX is a telemedicine marketplace for Mexico. The sellable wedge is:

1. Patient starts AI consult or doctor search.
2. Patient sees a recommended doctor or doctor profile.
3. Patient books a slot.
4. Patient pays.
5. Patient joins video consult.
6. Doctor/admin handles consultation, notes, prescriptions, verification, and operations.

This is a PHI and medical-trust product. Do not treat it like a generic booking app. Verification discipline, payment integrity, appointment semantics, medical AI boundaries, and PHI-safe logging are higher priority than feature velocity.

## Repo Identity

- `pwd`: `/Users/lukatenbosch/Downloads/doctory`
- Package name/version: `doctormx@0.1.0`
- Framework: Next.js App Router, React 18, TypeScript.
- README claims Next.js 16, Supabase, Stripe, Daily.co, Sentry, Vitest, Playwright.
- Actual dependency versions observed in `package.json`: `next ^16.1.4`, `react ^18.3.1`, `eslint ^10.2.1`, `vitest ^4.0.18`, `@playwright/test ^1.58.0`.
- Package manager: npm is the documented workflow and CI uses `npm ci`; both `package-lock.json` and `bun.lock` exist.

## Important Local Instructions

- `.github/PROCESO_AGENTE.md` requires reading `PRINCIPIOS.md`, `CONFIGURACION.md`, `DECISIONES.md`, and `FLUJOS.md` before code changes.
- `.github/copilot-instructions.md` requires minimal diffs, no new dependencies unless requested, no invented imports, and `npm run typecheck`.
- This context pass created only files in `AI_CONTEXT`.

## Main Routes

Patient/public:
- `/`
- `/ai-consulta`
- `/app/ai-consulta`
- `/doctors`, `/doctors/[id]`
- `/doctores-online`, `/doctores-online/[slug]`
- `/book/[doctorId]`
- `/checkout/[appointmentId]`
- `/consultation/[appointmentId]`
- `/app/appointments`, `/app/appointments/[id]`, `/app/appointments/[id]/video`
- `/app/intake/[appointmentId]`
- `/app/second-opinion`

Doctor:
- `/doctor`
- `/doctor/appointments`
- `/doctor/availability`
- `/doctor/consultation/[appointmentId]`
- `/doctor/consultation/[appointmentId]/review`
- `/doctor/prescription/[appointmentId]`
- `/doctor/profile`
- `/doctor/finances`
- `/doctor/onboarding`
- `/doctor/widget`
- `/doctor/reminders`
- `/doctor/intake-forms`

Admin:
- `/admin`
- `/admin/verify`
- `/admin/doctors`
- `/admin/doctors/[doctorId]`
- `/admin/analytics`
- `/admin/pharmacy`
- `/admin/premium`
- `/admin/communications`

Widget:
- `/widget/[doctorId]`
- `/widget/pay/[appointmentId]`
- `/widget/success`

## Key API Areas

- AI: `/api/ai/preconsulta`, `/api/ai/consult`, `/api/ai/copilot/*`, `/api/ai/transcription`, `/api/ai/vision/analyze`, `/api/triage`.
- Booking/payment: `/api/appointments`, `/api/appointments/[id]`, `/api/create-payment-intent`, `/api/confirm-payment`, `/api/webhooks/stripe`.
- Video: `/api/appointments/[id]/video`.
- Doctor verification: `/api/admin/verify-doctor`, `/api/doctor/verify-cedula`.
- Prescriptions: `/api/prescriptions`, `/api/prescriptions/[id]/pdf`, `/api/prescriptions/[id]/send`, `/api/prescriptions/preview`.
- SOAP: `/api/soap/*`, `/api/soap-notes/*`.
- Widget: `/api/widget/book`, `/api/widget/config`, `/api/widget/dates`, `/api/widget/slots`.
- Insurance: `/api/insurance/*`, `/api/insurances`.
- Webhooks: `/api/webhooks/stripe`, `/api/webhooks/twilio`, `/api/webhooks/whatsapp`.

## Dirty/Coordination Risk

Before creating `AI_CONTEXT`, `git status --short --branch` showed `## main...origin/main` and no dirty tracked files. After this pass, only `AI_CONTEXT/*` should be dirty. Do not revert or overwrite changes made by others. If future worktree state includes unrelated edits, leave them alone.

## Stale-Doc Warning

There are many historical "ready/complete/production" docs in the repo, including `READY_FOR_PRODUCTION.md`, `COMPREHENSIVE_TESTING_REPORT.md`, `DEPLOYMENT_STATUS.md`, `IMPLEMENTATION_SUMMARY.md`, and others. Treat them as historical leads, not truth. Prefer current code, tests, config, and a fresh verification run.
