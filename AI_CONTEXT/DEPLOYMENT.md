# Deployment And Config

## Deployment Files

Observed:
- `netlify.toml`
- `.netlify/netlify.toml`
- `next.config.ts`
- `.github/workflows/validate.yml`
- `.env.example`
- `.env`
- `.env.local`
- `supabase/`
- `deno.lock`

Do not deploy during ordinary implementation work unless explicitly asked.

## Netlify

Root `netlify.toml`:

- Build command: `npm run build`.
- Publish directory: `.next`.
- Node version: `20`.
- Plugin: `@netlify/plugin-nextjs`.
- Functions:
  - bundler `esbuild`,
  - external module `openai`,
  - `___netlify-server-handler` timeout `26`.

`.netlify/netlify.toml` is generated/local Netlify state with absolute paths under `/Users/lukatenbosch/Downloads/doctory`. Treat as local tool state, not source-of-truth architecture.

## Next Config

`next.config.ts`:

- `output: 'standalone'`.
- Server actions body size limit `2mb`.
- Remote image patterns:
  - `i.pravatar.cc`
  - `lh3.googleusercontent.com`
  - `*.googleusercontent.com`
  - `images.unsplash.com`
  - `avatars.githubusercontent.com`
  - `res.cloudinary.com`
- Widget routes allow framing with CSP `frame-ancestors *`.
- Non-widget routes set `X-Frame-Options: DENY`.
- Permissions policy currently disables camera/microphone/geolocation in configured headers.

Do not change widget framing or app-wide security headers without specific verification.

## Environment Names

From observed code and docs, important env vars include:

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- AI: `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `OLLAMA_PROXY_URL`, `OLLAMA_PROXY_KEY`.
- Video: `DAILY_API_KEY`, `DAILY_DOMAIN`.
- App: `NEXT_PUBLIC_APP_URL`.
- Logging/cache/monitoring values exist in surrounding code/docs; inspect `.env.example` for names, not secret values.

Do not inspect or print real values from `.env` or `.env.local`.

## Supabase/Migrations Warning

Historical `HANDOFF.md` says some migrations were applied/recorded manually on remote Supabase and mentions a remote-only migration history issue. Do not run migration commands or create migrations during feature work unless explicitly requested.

Relevant historical notes:
- Booking widget migration applied remotely around 2026-04-22.
- AutoSOAP production schema reconciliation applied remotely around 2026-04-22.
- Insurance claims migration applied around 2026-04-23.

Treat this as a risk flag, not proof that current production matches local files.

## Deployment Risk

Stale docs include deploy instructions such as `npx netlify deploy --build --prod`. Do not run deploys in routine tasks.

Before any future deployment:
- Confirm clean worktree except intended changes.
- Run credible local/CI baseline.
- Confirm env vars and production integration readiness with the owner.
- Confirm migration state without applying changes.
- Confirm no PHI/customer data exposure in logs or artifacts.
