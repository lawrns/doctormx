# Verification Baseline

This document defines what the current verification commands prove, what they do **not** prove, and how to move from local fallback confidence to production integration confidence.

Last verified locally on branch `docs/ai-session-context` with:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm run verify
```

## Executive summary

`npm run verify` is the recommended local baseline. It proves that the app currently lints, typechecks, runs unit/integration tests, builds with Next.js, and passes Playwright smoke tests in a local environment.

It does **not** prove production readiness for Supabase, Stripe, Resend, Daily.co, Redis, OpenRouter/OpenAI, Sentry, Twilio/WhatsApp, PHI handling, customer data flows, or real payment/booking/video integrations.

Treat this as a green **engineering sanity baseline**, not a launch certificate.

## Command matrix

| Command | Purpose | Expected local result | What it proves | What it does not prove |
| --- | --- | --- | --- | --- |
| `npm ci` | Deterministic install from `package-lock.json` | Passes | Dependencies install from lockfile under Node 20+ | Dependency security or production runtime health |
| `npm run lint` | ESLint over source, e2e, scripts, configs | Passes | Static lint rules are satisfied | Runtime correctness |
| `npm run typecheck` | TypeScript compile check | Passes | TS types compile with `tsc --noEmit` | Runtime correctness or route behavior |
| `npm run test:coverage` | Vitest suite with V8 coverage | Passes | Unit/integration tests pass under test mocks/fallbacks | Real external integrations |
| `npm run build` | Next.js production build | Passes | App compiles and prerenders/builds locally | Production env correctness or deployment health |
| `npm run test:e2e` | Playwright local browser smoke tests | Passes | Public/local UI smoke paths work | Real payment, auth, email, video, or production data flows |
| `npm run verify` | Aggregate baseline | Passes | Current local full baseline is green | Production launch readiness |

## Recommended baseline command

Use this before merging normal application changes:

```bash
npm run verify
```

Use individual commands first when diagnosing failures:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

## Current known skipped tests

The current baseline has intentional/env-dependent skips.

### Vitest skipped files

These suites are skipped when Supabase environment variables are unavailable:

- `tests/profile-creation.test.ts` — 4 skipped tests
  - Requires `NEXT_PUBLIC_SUPABASE_URL`
  - Requires `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `tests/user-stories.test.ts` — 19 skipped tests
  - Requires `NEXT_PUBLIC_SUPABASE_URL`
  - Requires `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Observed local total:

```text
Test Files  33 passed | 2 skipped (35)
Tests       260 passed | 23 skipped (283)
```

### Playwright skipped tests

`e2e/production-smoke.spec.ts` skips when production smoke env vars are not explicitly provided:

- Suite-level skip unless `PROD_URL` is set.
- Mutating registration/login smoke skip unless `RUN_MUTATING_PROD_SMOKE=1` is set.

Observed local total:

```text
29 passed
6 skipped
```

## Local fallback behavior observed

A green local baseline can include these fallback paths:

| Area | Local fallback/no-op behavior | Launch implication |
| --- | --- | --- |
| Supabase public client | Missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` can use no-op fallback clients | Local build/tests may pass without proving DB connectivity or RLS |
| Supabase service role | Missing `SUPABASE_SERVICE_ROLE_KEY` can use service no-op fallback | Background/admin/server flows may not be production-proven |
| Redis/Upstash | Missing Redis env uses in-memory cache fallback | Does not prove distributed cache/rate-limit behavior |
| Resend | Missing API key skips email sends | Does not prove appointment/payment email delivery |
| AI providers | Provider failures can trigger degraded/fallback paths | Does not prove live OpenRouter/OpenAI availability, quotas, or medical AI quality |
| Video | Jitsi/Daily fallback behavior may allow local path success | Does not prove Daily.co room creation or production access control |
| Analytics | Local tests may hit mocked/no-op analytics | Does not prove production analytics ingestion |

## Required env vars for stronger integration checks

Do not print secret values. Only verify presence and behavior.

### Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Use to verify:

- profile creation tests
- user story tests
- auth/session flows
- RLS behavior
- service-role-only operations

### Stripe

```bash
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

Use to verify:

- payment intent creation
- checkout page initialization
- webhook signature verification
- appointment confirmation after trusted payment event
- failed payment behavior

### Resend

```bash
RESEND_API_KEY
```

Use to verify:

- appointment confirmation emails
- payment receipt emails
- reminder/follow-up emails
- no PHI leakage in email logs

### Daily.co / Video

```bash
DAILY_API_KEY
```

Use to verify:

- video room creation
- room access restrictions
- fallback behavior when Daily is unavailable

### Redis / Upstash

```bash
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
# or
REDIS_URL
```

Use to verify:

- distributed cache behavior
- rate limits
- reminder/cron/cache invalidation paths

### AI providers

```bash
OPENROUTER_API_KEY
OPENAI_API_KEY
```

Use to verify:

- pre-consulta provider routing
- degraded fallback behavior
- transcription/vision/provider-specific functionality
- quota and safety boundaries

### Production smoke

```bash
PROD_URL
RUN_MUTATING_PROD_SMOKE=1 # only when disposable production test accounts are explicitly allowed
```

Use to verify:

- deployed public pages
- deployed auth pages
- read-only production smoke
- optional disposable account creation when explicitly enabled

## Proposed verification tiers

### Tier 1 — Local baseline

Default gate for normal PRs:

```bash
npm run verify
```

Pass criteria:

- lint passes
- typecheck passes
- Vitest coverage run passes
- build passes
- Playwright local E2E passes
- generated Playwright artifacts are cleaned before commit

### Tier 2 — Integration baseline

Run only in an environment with real test-mode credentials and seeded non-production data.

Suggested future command:

```bash
npm run verify:integration
```

This command does not exist yet. It should eventually run:

- local baseline
- Supabase-backed profile/user-story tests
- Stripe test-mode payment path
- Resend test/sandbox email path
- Daily test room creation
- Redis-backed cache/rate-limit checks

### Tier 3 — Production smoke

Run only against an explicit deployed URL.

Suggested future command:

```bash
PROD_URL=https://doctor.mx npm run test:e2e -- e2e/production-smoke.spec.ts
```

Mutating production smoke must require explicit opt-in:

```bash
PROD_URL=https://doctor.mx RUN_MUTATING_PROD_SMOKE=1 npm run test:e2e -- e2e/production-smoke.spec.ts
```

## Known noise to reduce next

These logs do not currently fail the baseline, but they weaken signal quality and should be cleaned in a narrow follow-up branch:

1. Empty JSON body handling noise:
   - `src/app/api/analytics/event/route.ts`
   - `src/app/api/ai/quota/route.ts`
2. Playwright shutdown/request-abort noise:
   - `ECONNRESET`
   - `aborted`
3. Payment test mock warning:
   - missing `getPatientPhone` export in the `@/lib/whatsapp-notifications` mock during payment tests
4. Dependency audit output:
   - `npm ci` currently reports 14 vulnerabilities: 1 low, 7 moderate, 6 high
   - Do not run `npm audit fix --force` blindly; handle dependency upgrades in a dedicated branch.

## Protected boundaries

Do not change these while improving the verification baseline without a separate explicit plan and approval:

- PHI handling and logging
- doctor verification policy
- booking semantics
- payment/billing behavior
- Stripe webhook confirmation behavior
- prescriptions
- video consult behavior
- service-role fallback behavior
- medical AI safety boundaries
- auth and role authorization
- production integrations
- customer/patient data
- Supabase migrations
- secrets or environment values
- deployments

## Definition of done for a credible local baseline

A local baseline is credible when:

- `npm ci` succeeds.
- `npm run verify` succeeds.
- skipped tests are documented and classified.
- fallback/no-op behavior is documented and not misrepresented as production readiness.
- generated artifacts are not committed accidentally.
- remaining risks are explicit.

Current status: **Tier 1 local baseline is credible. Tier 2 and Tier 3 are not yet implemented as first-class gates.**
