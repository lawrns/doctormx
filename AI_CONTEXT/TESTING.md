# Testing

## Package Commands

From `package.json`:

- `npm run dev`
- `npm run start`
- `npm run build`
- `npm run typecheck`
- `npm run typecheck:changed`
- `npm run lint`
- `npm run lint:changed`
- `npm run lint:full`
- `npm run audit:ui`
- `npm run test`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run test:watch`
- `npm run preview`
- `npm run verify`

`npm run verify` currently means:

```bash
npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run test:e2e
```

First likely implementation task: make this baseline credible before feature work.

## CI Baseline

GitHub Actions file: `.github/workflows/validate.yml`

Jobs:
- lint: `npm ci`, `npm run lint`
- typecheck: `npm ci`, `npm run typecheck`
- unit: `npm ci`, `npm run test:coverage`, uploads `coverage`
- build: `npm ci`, `npm run build` with Supabase public secrets and `NEXT_PUBLIC_APP_URL=http://localhost:3002`
- e2e: installs Chromium, runs `npm run test:e2e` with Supabase public secrets and `NEXT_PUBLIC_APP_URL=http://localhost:3002`

## Test Layout

Vitest:
- `src/app/__tests__/*`
- `src/lib/__tests__/*`
- `src/lib/**/__tests__/*`
- `tests/*.test.ts`

Observed sensitive tests:
- `src/app/__tests__/phi-logging-security.test.ts`
- `src/app/__tests__/payment-flow.test.ts`
- `src/app/__tests__/stripe-webhook-route.test.ts`
- `src/app/__tests__/soap-notes-security.test.ts`
- `src/app/__tests__/expert-questions-security.test.ts`
- `src/lib/__tests__/booking.test.ts`
- `src/lib/__tests__/payment.test.ts`
- `src/lib/__tests__/prescriptions.test.ts`
- `src/lib/__tests__/video.test.ts`
- `src/lib/triage/__tests__/triage.test.ts`
- `src/lib/ai/__tests__/router.test.ts`

Playwright:
- `e2e/auth.spec.ts`
- `e2e/booking.spec.ts`
- `e2e/consultation.spec.ts`
- `e2e/doctors.spec.ts`
- `e2e/frontend-optimization.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/pharmacy.spec.ts`
- `e2e/production-smoke.spec.ts`
- `e2e/referrals.spec.ts`
- `e2e/scroll.spec.ts`
- `e2e/voice-soap.spec.ts`

Shell/manual:
- `tests/curl-tests.sh`
- `tests/smoke-tests.sh`

## Config

Vitest:
- `vitest.config.ts`
- node environment.
- includes `**/*.test.ts` and `**/*.property.test.ts`.
- coverage thresholds: 80% lines/functions/branches/statements.
- setup: `src/lib/__tests__/setup.ts`.

Playwright:
- `playwright.config.ts`
- base URL `http://localhost:3002`.
- starts `npm run dev -- -p 3002`.
- Chromium only.
- HTML reporter.

Production smoke config:
- `playwright.prod.config.ts`
- base URL `https://doctor.mx`.
- line reporter.
- Chromium only.

## Testing Risks

- `npm run verify` is heavy: lint, typecheck, coverage, build, e2e.
- E2E needs browser install and can depend on Supabase env behavior.
- Build/test may pass through no-op Supabase fallback if env vars are missing; note this explicitly.
- Historical testing reports claim broad production readiness. Do not rely on them without fresh command output.
- Coverage thresholds are strict enough that newly included tests or changed coverage can fail the baseline.

## Recommended Baseline Sequence

For the first implementation task:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

If a command fails, investigate the smallest cause and avoid changing product semantics. If `npm run verify` cannot be made credible quickly, document the blocker and create a narrower `verify:local` or CI-aligned recommendation only after user approval.
