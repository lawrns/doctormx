# Production Readiness Baseline

Captured during execution of the production-readiness roadmap.

## Repository State

- `git status --short`: clean before baseline commands.
- During `npm test -- --coverage`, Vitest prompted to install missing `@vitest/coverage-v8`; this mutated `package.json` and `bun.lock`.

## Baseline Commands

| Command | Result | Evidence |
| --- | --- | --- |
| `git status --short` | Pass | No output before baseline. |
| `npm run lint` | Pass but ineffective | Reported `No lint targets changed.` because it uses `scripts/lint-changed.mjs`. |
| `npm run typecheck` | Pass but ineffective | Reported `No typecheck targets changed.` because it uses `scripts/typecheck-changed.mjs`. |
| `npm run lint:full` | Fail | 2 ESLint errors. |
| `npx tsc --noEmit` | Pass | Exit code 0. |
| `npm test` | Fail | 7 failed files, 13 failed tests, 205 passed, 23 skipped. |
| `npm test -- --coverage` | Fail after installing provider | 6 failed files, 11 failed tests, 207 passed, 23 skipped. |
| `npm run build` | Pass | Next.js build completed and generated 208 static pages. |
| `npx playwright test` | Fail before tests | Web server failed: `EADDRINUSE` on port `3002`. |
| `lsof -nP -iTCP:3002 -sTCP:LISTEN` | Informational | `node` PID `23502` is listening on `*:3002`. |

## Full Lint Failures

- `src/components/referrals/PostConsultationReferral.tsx:55:13`
  - Rule: `no-empty`
  - Issue: empty block statement.
- `src/lib/utils.ts:107:20`
  - Rule: `@typescript-eslint/no-require-imports`
  - Issue: CommonJS `require()` import.

## Unit Test Failure Themes

- **Booking tests:** `src/lib/__tests__/booking.test.ts`
  - `checkConsultationQuota` calls `supabase.from('patient_subscriptions').select(...)`, but test mocks return `undefined` for that table chain.
- **Phase 1 booking test:** `src/lib/__tests__/phase1.test.ts`
  - `expireStalePendingPaymentAppointments` expects `supabase.from('appointment_holds')`, but the mock does not provide `from`.
- **Notifications/payment tests:** `src/lib/__tests__/notifications.test.ts` and `src/lib/__tests__/phase1.test.ts`
  - Timeouts at 5000ms in notification/payment failure paths.
- **Patient referrals tests:** `src/lib/domains/patient-referrals/__tests__/patient-referrals.test.ts`
  - `redeemReferralAtSignup` expects `supabase.rpc`, but mocks do not provide it.

## Coverage Gate Finding

`vitest.config.ts` already declares v8 coverage thresholds at 80%, but `@vitest/coverage-v8` was missing from the installed dependency graph until the coverage command prompted installation. CI currently runs `npm test`, not `vitest run --coverage`, so thresholds are not an authoritative gate.

## Playwright Finding

`playwright.config.ts` starts `npm run dev -- -p 3002` with `reuseExistingServer: !process.env.CI`. In this environment, a `node` process is already listening on port `3002`, but Playwright still attempted to start a server and failed with `EADDRINUSE`.

## Immediate Remediation Order

1. Fix the two existing full-lint errors.
2. Convert `package.json` scripts so `lint` and `typecheck` are authoritative full-project gates, while changed-file scripts remain available as `lint:changed` and `typecheck:changed`.
3. Add `test:coverage`, `test:e2e`, and `verify` scripts.
4. Update `.github/workflows/validate.yml` to use the authoritative scripts and upload coverage/Playwright artifacts.
5. Repair the failing unit-test mocks for booking, phase1, notifications/payment, and patient-referrals.
6. Make Playwright port handling deterministic before requiring e2e in CI.
