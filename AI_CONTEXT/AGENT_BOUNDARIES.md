# Agent Boundaries

## Hard Boundaries

Do not modify these without explicit user approval and a narrow plan:

- PHI handling and logging.
- Doctor verification policy.
- Booking semantics.
- Payment/billing behavior.
- Stripe webhook confirmation behavior.
- Prescriptions.
- Video consult behavior.
- Service-role fallback behavior.
- Medical AI safety boundaries.
- Auth and role authorization.
- Production integrations.
- Customer/patient data.
- Supabase migrations.
- Secrets or environment values.
- Deployments.

Do not run destructive commands:

- No `git reset --hard`.
- No `git checkout --` over local work.
- No `git clean`.
- No stash/pull/merge when dirty.
- No migration creation or database push unless explicitly requested.
- No production deploy unless explicitly requested.

## PHI Boundaries

Key files:
- `src/lib/observability/logger.ts`
- `src/lib/observability/phi-safe-logger.ts`
- `src/app/__tests__/phi-logging-security.test.ts`

Observed risk:
- Base `logger` logs context as-is.
- `phiLogger` redacts known PHI fields, but it is opt-in.
- Tests explicitly assert the regular logger preserves PHI without redaction.

Agent rule:
- Do not add patient names, emails, phone numbers, addresses, diagnosis, notes, transcripts, tokens, cookies, or authorization values to logs.
- Prefer `phiLogger` when adding any log in clinical/patient flows.
- Do not broaden logging of request bodies in AI, triage, prescriptions, booking, payment, or webhooks.

## Medical AI Boundaries

Key files:
- `src/app/api/ai/preconsulta/route.ts`
- `src/app/api/ai/consult/route.ts`
- `src/app/api/triage/route.ts`
- `src/components/ai-consulta/protocol.ts`
- `src/lib/ai/client.ts`
- `src/lib/ai/config.ts`

Observed behavior:
- `/api/ai/preconsulta` has hard-safety emergency handling.
- Provider failures return bounded degraded guidance instead of raw failure for preconsulta.
- Protocol chat asks structured questions and redirects emergency patterns to urgent care/911.
- AI config uses OpenRouter for chat/analysis, Ollama as fallback in the client layer, OpenAI for Whisper.
- `prescriptionAssist` and `smartMatching` feature flags are false in config.

Agent rule:
- Do not make AI sound like it gives definitive diagnosis.
- Do not remove emergency escalation.
- Do not expose confidence/tool internals as a substitute for medical review.
- Do not make prescription suggestions autonomous.
- Preserve "doctor/admin human final authority" framing.

## Service-Role Boundaries

Key file: `src/lib/supabase/server.ts`

Observed behavior:
- `createClient()` returns a no-op fallback if Supabase public env vars are missing.
- `createServiceClient()` returns a no-op fallback if `SUPABASE_SERVICE_ROLE_KEY` is missing.
- Service role is used in cron/background/public-data areas and many domain libs.

Agent rule:
- Do not remove, expand, or change service-role fallback behavior casually.
- Do not use service client for user-scoped operations unless an existing pattern requires it.
- Do not bypass RLS for normal patient/doctor actions.
- Treat no-op fallback as test/build behavior with production implications.

## Secrets

Files present:
- `.env`
- `.env.local`
- `.env.example`

Agent rule:
- Do not read or print secret values.
- `.env.example` is safe to inspect for names.
- Never add real credentials to docs, tests, screenshots, or logs.

## Mocks and Fallbacks

Observed examples:
- Supabase no-op fallback clients.
- Video Daily.co to Jitsi fallback.
- AI provider degraded fallback for preconsulta.
- Redis in-memory fallback in cache layer.
- Historical docs mention mock AutoSOAP fallback.

Agent rule:
- Do not let mock/fallback behavior masquerade as production readiness.
- When testing, state whether behavior used real integration, no-op fallback, local mock, or degraded provider path.
