# Doctory - Plataforma de Teleconsultas Médicas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen)](./docs/testing/COVERAGE_REQUIREMENTS.md)

> Plataforma moderna de teleconsultas médicas que conecta pacientes con doctores a través de videollamadas, integrando IA cooperativa para mejorar la experiencia de atención médica en México.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Mexico Compliance](#mexico-compliance)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

Doctory is a comprehensive telemedicine platform designed to bridge the gap between patients and healthcare providers in Mexico. The platform features:

- **AI-Powered Triage**: Intelligent pre-consultation system that assesses symptoms and urgency
- **Doctor Discovery**: Advanced search and filtering to find the right specialist
- **Seamless Booking**: Real-time availability management and appointment scheduling
- **Secure Video Consultations**: Integrated video calls with medical professionals
- **Digital Prescriptions**: Electronic prescription generation and pharmacy integration
- **Subscription Management**: Flexible pricing with Stripe integration
- **Patient Follow-up**: Automated post-consultation tracking and monitoring

**Problem It Solves**: Mexico faces significant healthcare access challenges, including long wait times, geographic barriers, and specialist shortages. Doctory addresses these by providing immediate access to qualified physicians through an intuitive digital platform.

**Target Users**:
- Patients seeking convenient, affordable medical consultations
- Licensed physicians looking to expand their practice
- Healthcare organizations wanting to modernize patient access

---

## Tech Stack

### Frontend & Framework
- **Next.js 16** - React framework with App Router for optimal performance
- **React 18.3** - UI library with modern features
- **TypeScript 5.2** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Production-ready motion library

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Supabase SSR** - Server-side rendering utilities for Next.js
- **Edge Functions** - Serverless API routes

### AI & Machine Learning
- **OpenAI GPT-4o** - Advanced medical consultation and diagnosis support
- **OpenAI GPT-4o-mini** - Cost-effective triage and general inquiries
- **OpenAI Whisper** - Medical consultation transcription
- **Anthropic Claude** - Emergency case handling and second opinions
- **RAG System** - Retrieval-Augmented Generation with medical knowledge base

### Payment & Communication
- **Stripe** - Payment processing and subscription management
- **Daily.co** - Video consultation infrastructure
- **Resend** - Transactional email service
- **WhatsApp Business API** - Patient notifications and follow-ups

### Monitoring & Quality
- **Sentry** - Error tracking and performance monitoring
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting and formatting

### Additional Libraries
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **TanStack Query** - Data fetching and caching
- **XState** - State machine for complex workflows
- **date-fns** - Date manipulation
- **PDFKit** - Prescription PDF generation
- **QRCode** - QR code generation for prescriptions

---

## Key Features

### For Patients
- **Anonymous AI Triage**: Get preliminary health guidance without registration
- **Smart Doctor Matching**: AI-powered recommendations based on symptoms and specialty
- **Real-time Availability**: See actual doctor schedules and book instantly
- **Secure Video Calls**: HD video consultations with screen sharing
- **Digital Prescriptions**: Electronic prescriptions sent directly to pharmacies
- **Follow-up Care**: Automated check-ins and progress tracking
- **Prescription History**: Complete medical record access

### For Doctors
- **Profile Management**: Professional profile with specialties and availability
- **Calendar Integration**: Flexible scheduling with recurring availability
- **Video Consultation Room**: Built-in video call interface
- **Prescription Writer**: Digital prescription generation with PDF export
- **Patient History**: Complete patient medical records
- **Analytics Dashboard**: Performance metrics and revenue tracking
- **Subscription Management**: Premium features and earnings optimization

### For Administrators
- **Doctor Verification**: Review and approve physician applications
- **AI Monitoring**: Track AI performance and safety metrics
- **Platform Analytics**: Comprehensive usage and financial insights
- **User Management**: Control access and permissions

---

## Quick Start

Get Doctory running in 5 minutes with these steps:

### Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free tier works)
- Stripe account (test mode)
- OpenAI API key

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/doctormx.git
cd doctormx

# Install dependencies
npm install
# or
bun install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Redis (Upstash)
REDIS_URL=redis://your-redis-url

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token

# Feature Flags
NEXT_PUBLIC_AI_PRECONSULTA_ENABLED=true
NEXT_PUBLIC_VIDEO_APPOINTMENTS_ENABLED=true
NEXT_PUBLIC_PRESCRIPTIONS_ENABLED=true
```

### 3. Initialize Database

Run these SQL migrations in your Supabase SQL Editor (in order):

```sql
-- 1. Complete schema
-- Copy contents of: supabase/migrations/001_complete_schema.sql

-- 2. SOAP consultations
-- Copy contents of: supabase/migrations/002_soap_consultations.sql

-- 3. AI referrals tracking
-- Copy contents of: supabase/migrations/003_ai_referrals_tracking.sql

-- 4-10. Additional migrations (run in numerical order)
```

### 4. Create Admin User

After database setup, create your first admin user:

```sql
-- In Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 6. Test the Application

1. Register as a patient
2. Explore doctor profiles
3. Try the AI pre-consulta
4. Book a test appointment
5. Complete a video consultation
6. Generate a prescription

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `OPENAI_API_KEY` | OpenAI API key for server-side | `sk-proj-...` |
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI key for client-side (optional) | `sk-proj-...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis cache for AI responses | None (uses memory cache) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking | None |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | None |
| `NEXT_PUBLIC_APP_VERSION` | App version for Sentry | `0.1.0` |
| `NEXT_PUBLIC_AI_PRECONSULTA_ENABLED` | Enable AI pre-consulta | `true` |
| `NEXT_PUBLIC_VIDEO_APPOINTMENTS_ENABLED` | Enable video calls | `true` |
| `NEXT_PUBLIC_PRESCRIPTIONS_ENABLED` | Enable prescriptions | `true` |

### Feature Flags

```bash
# AI Features
NEXT_PUBLIC_AI_PRECONSULTA_ENABLED=true
NEXT_PUBLIC_AI_TRANSCRIPTION_ENABLED=true
NEXT_PUBLIC_AI_FOLLOWUP_ENABLED=true
NEXT_PUBLIC_DOCTOR_IMAGE_ANALYSIS_ENABLED=true

# Core Features
NEXT_PUBLIC_VIDEO_APPOINTMENTS_ENABLED=true
NEXT_PUBLIC_PRESCRIPTIONS_ENABLED=true

# Future Features
NEXT_PUBLIC_ENABLE_COMMUNITY=false
NEXT_PUBLIC_ENABLE_BROADCASTING=false
NEXT_PUBLIC_ENABLE_EDUCATIONAL_CONTENT=false

# Custom Instructions (Optional)
VITE_DOCTOR_INSTRUCTIONS="Eres un médico virtual compasivo y profesional."
```

---

## Project Structure

```
doctormx/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Radix UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── forms/            # Form components
│   │   └── shared/           # Shared components
│   │
│   ├── lib/                   # Core business logic
│   │   ├── ai/              # AI-related functions
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── booking.ts       # Booking system
│   │   ├── payment.ts       # Stripe integration
│   │   ├── availability.ts  # Doctor availability
│   │   ├── discovery.ts     # Doctor search
│   │   ├── prescriptions.ts # Prescription generation
│   │   ├── followup.ts      # Patient follow-up
│   │   └── supabase/        # Database clients
│   │
│   ├── types/                # TypeScript type definitions
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React context providers
│   └── utils/                # Utility functions
│
├── supabase/
│   └── migrations/           # Database migrations
│       ├── 001_complete_schema.sql
│       ├── 002_soap_consultations.sql
│       └── ...
│
├── docs/                     # Documentation
│   ├── architecture/         # System architecture docs
│   ├── operations/           # Deployment and ops
│   └── testing/              # Testing guides
│
├── public/                   # Static assets
├── tests/                    # Test files
└── scripts/                  # Build and utility scripts
```

### Key Architecture Principles

1. **Independent Systems**: Each major feature (booking, payment, discovery) is self-contained
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Server-First**: Business logic lives in server components and API routes
4. **Security-First**: RLS policies, CSRF protection, input validation
5. **AI-Augmented**: AI assists, never replaces human medical decisions

---

## Development Workflow

### Branching Strategy

```bash
main           # Production-ready code
├── develop    # Integration branch for features
├── feature/*  # Feature branches
└── fix/*      # Bugfix branches
```

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add AI pre-consulta feature
fix: resolve video connection timeout
docs: update deployment guide
refactor: simplify booking flow
test: add consultation flow tests
chore: upgrade dependencies
```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

### Testing Strategy

- **Unit Tests**: Vitest for business logic (`*.test.ts`)
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for critical user flows
- **Manual Testing**: See `docs/testing/MANUAL_TESTING_GUIDE.md`

### Code Review Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all tests pass
4. Submit pull request
5. Require at least one approval
6. Merge to `develop` after approval

---

## Deployment

### Deployment Options

#### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Advantages**: Zero-config deployment, automatic HTTPS, edge functions

#### 2. Netlify

```bash
# Build command
npm run build

# Deploy
netlify deploy --prod
```

#### 3. Docker

```bash
# Build image
docker build -t doctory .

# Run container
docker run -p 3000:3000 --env-file .env doctory
```

See [Deployment Guide](docs/operations/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Troubleshooting

If you encounter issues during development or deployment, check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md) for common problems and solutions.

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Sentry initialized (if using)
- [ ] SSL certificates active
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

### Environment-Specific Configurations

**Development**:
- Use test Stripe keys
- Enable debug mode
- Use local Supabase instance

**Staging**:
- Use production-like data
- Test with real Stripe (test mode)
- Enable Sentry

**Production**:
- Use production Stripe keys
- Enable all monitoring
- Set appropriate rate limits
- Configure CDN caching

---

## Mexico Compliance

Doctory is designed to comply with Mexican healthcare regulations. Key compliance areas:

### Data Protection (LFPDPPP)

- Health data classified as "sensitive personal data"
- Express written consent required
- Privacy notice (Aviso de Privacidad) mandatory
- ARCO rights (Access, Rectify, Cancel, Oppose)
- Data retention policies enforced
- Cross-border data transfer restrictions

### Medical Regulations

- **COFEPRIS**: Compliance with sanitary regulations
- **NOM-004-SSA3-2012**: Clinical record standards
- **NOM-024-SSA3-2012**: Electronic health records
- **Cédula Profesional**: Physician license verification required
- **Telemedicine Law**: January 2026 Digital Health reform compliance

### AI Healthcare Framework

- AI classified as "Software as Medical Device" (SaMD)
- Risk-based classification (Class I/II/III)
- Human oversight mandatory
- Disclaimers on all AI outputs
- No definitive diagnoses by AI
- Emergency detection and escalation
- Audit trail for all AI decisions

### Prescription Regulations

- Electronic prescriptions with digital signature
- COFEPRIS integration for controlled substances
- QR code validation
- Pharmacy partnership compliance
- Traceability requirements

### Consumer Protection

- **PROFECO** compliance for subscription services
- Clear pricing and terms
- Cancellation and refund policies
- Advertising restrictions
- No misleading health claims

See `skills/kimi-agent/mexico_ai_healthcare_regulatory_framework.md` for comprehensive legal analysis.

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint for code formatting
- Write tests for new features
- Document complex logic
- Update relevant documentation

### Feature Guidelines

- Small, focused pull requests
- Clear descriptions of changes
- Reference related issues
- Include screenshots for UI changes

### Reporting Issues

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

---

## Support

### Documentation

- [Architecture Docs](docs/architecture/)
- [Deployment Guide](docs/operations/DEPLOYMENT_GUIDE.md)
- [Testing Guide](docs/testing/MANUAL_TESTING_GUIDE.md)
- [AI Architecture](docs/architecture/AI_DOCTOR_ARCHITECTURE.md)
- [Error Codes Reference](docs/errors/ERROR_CODES.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Decision Log](DECISIONES.md)

### Getting Help

- Open an issue on GitHub
- Check existing documentation
- Review the architecture decisions
- Contact the maintainers

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Third-Party Licenses

This project uses open-source software with their respective licenses:
- Next.js (MIT)
- React (MIT)
- Supabase (MIT)
- Stripe (MIT)
- Radix UI (MIT)

---

## Acknowledgments

- **Medical Community**: For feedback and guidance on clinical workflows
- **OpenAI**: For GPT-4 API enabling AI-assisted consultations
- **Supabase**: For excellent developer experience and infrastructure
- **Stripe**: For seamless payment processing
- **Next.js Team**: For the amazing framework

---

## Roadmap

### Current Focus (Q1 2026)
- [x] Core booking and video consultation system
- [x] AI pre-consulta integration
- [x] Digital prescription generation
- [x] Patient follow-up system
- [x] Subscription billing with Stripe

### Upcoming Features
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced AI diagnostic support
- [ ] Pharmacy delivery integration
- [ ] Insurance provider integration
- [ ] Multi-language support (English/Spanish)
- [ ] Wearable device integration

### Long-term Vision
- [ ] AI-powered second opinions
- [ ] Predictive health analytics
- [ ] Community health features
- [ ] Hospital network integration

---

**Built with ❤️ for better healthcare access in Mexico**

*Last Updated: February 2026*
