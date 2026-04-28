# DoctorMX — Telemedicine Platform

Telemedicine platform built with Next.js 16, Supabase, and Stripe.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 18
- **Database:** Supabase (PostgreSQL), 37 migrations
- **Payments:** Stripe (subscriptions, one-time)
- **AI:** OpenRouter (MiniMax M2.7 + Kimi K2.6), OpenAI Whisper
- **Video:** Daily.co
- **CSS:** Tailwind CSS 4, Radix UI primitives
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **Monitoring:** Sentry
- **State:** XState, TanStack React Query
- **Language:** TypeScript, strict mode

## Requirements

- Node.js >= 20.0.0
- npm

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd doctory-v2
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase, Stripe, and other credentials

# Run database migrations
# Open your Supabase Dashboard → SQL Editor
# Run all 37 migration files from supabase/migrations/ in order

# Start development server
npm run dev
# → http://localhost:3000
```

## Testing

```bash
npm test                 # Run unit/integration tests (Vitest)
npm run test:coverage    # Run with coverage report
npm run test:e2e         # Run end-to-end tests (Playwright)
npm run test:watch       # Run in watch mode
```

## Project Structure

```
├── e2e/                          # Playwright E2E tests
├── src/
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Business logic & utilities
│   │   ├── ai/                   # AI services (OpenRouter, Whisper)
│   │   ├── observability/        # Sentry, phi-safe-logger
│   │   ├── supabase/             # Supabase client & helpers
│   │   └── api-auth.ts           # API authentication
│   ├── services/                 # External service integrations
│   ├── hooks/                    # React hooks
│   ├── types/                    # TypeScript type definitions
│   ├── config/                   # App configuration
│   ├── utils/                    # Utility functions
│   ├── middleware.ts             # Next.js middleware
│   └── instrumentation.ts       # Sentry instrumentation
├── supabase/
│   ├── migrations/               # 37 database migrations
│   └── seed.sql                  # Seed data
├── scripts/                      # Build and dev scripts
├── .env.example                  # Environment template
└── DEPLOYMENT_GUIDE.md           # Full deployment instructions
```

## Architecture

The platform is organized as independent subsystems:

- `booking.ts` — Patient + doctor + slot → Appointment
- `availability.ts` — Doctor + date → Available slots
- `payment.ts` — Appointment → Confirmed
- `discovery.ts` — Filters → Doctors
- `auth.ts` — User → Authorized/redirect

## Flows

- **Patient:** Browse without login → View slots → Book → Login → Pay → Video call
- **Doctor:** Register → One-step onboarding → Admin verifies → Published

For deployment, monitoring, and rollback instructions see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
