# Doctor.mx Deployment Guide

## Prerequisites

- Node.js 16+ installed
- GitHub repository configured
- Vercel account (for hosting)
- Supabase project configured
- Environment variables set

## Environment Variables

Create `.env.local` (or configure in deployment platform):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Optional: Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Feature Flags
NEXT_PUBLIC_AI_PRECONSULTA=true
NEXT_PUBLIC_AI_TRANSCRIPTION=true
NEXT_PUBLIC_AI_FOLLOWUP=true
```

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t doctor-mx .
docker run -p 3000:3000 doctor-mx
```

## Database Setup

Run migration in Supabase SQL Editor:

```sql
-- Create tables for anonymous quota system
CREATE TABLE IF NOT EXISTS user_free_questions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  questions_used INTEGER DEFAULT 0,
  questions_limit INTEGER DEFAULT 5,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anonymous_email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  session_id TEXT,
  consultation_number INTEGER DEFAULT 1,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS ai_doctor_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  patient_id UUID,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  specialty_matched TEXT,
  match_score DECIMAL(5,2),
  reasons JSONB,
  referral_context JSONB,
  status TEXT DEFAULT 'suggested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_match_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  specialty TEXT,
  urgency TEXT,
  doctors_available INTEGER,
  doctors_matched INTEGER,
  avg_score DECIMAL(5,2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_referrals_doctor ON ai_doctor_referrals(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ai_referrals_status ON ai_doctor_referrals(status);
CREATE INDEX IF NOT EXISTS idx_ai_referrals_created ON ai_doctor_referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON ai_match_analytics(timestamp);
```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Next.js build successful
- [ ] Server starts without errors
- [ ] Anonymous consultation flow works:
  - [ ] Session ID generated
  - [ ] Quota tracking works
  - [ ] AI responds to messages
  - [ ] Doctor recommendations appear
- [ ] WhatsApp sharing functional
- [ ] Email capture modal appears
- [ ] Premium upgrade modal appears after quota exceeded
- [ ] Landing page displays FREE-first messaging
- [ ] Doctor analytics dashboard accessible
- [ ] SSL certificate active
- [ ] Domain pointing correctly

## Monitoring Setup

### Sentry Integration
```bash
# Create Sentry release
npm run sentry:release

# Upload sourcemaps
npm run sentry:upload

# Finalize
npm run sentry:finalize
```

### Analytics (Optional)
- Google Analytics
- PostHog
- Plausible

## Rollback Plan

If deployment fails:

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git revert HEAD~1
vercel --prod
```

## Performance Optimization

- Enable CDN caching for static assets
- Configure Edge Functions for global deployment
- Set up database connection pooling
- Enable image optimization
- Implement rate limiting on API routes

## Security Checklist

- [ ] API keys not exposed in client code
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database RLS policies configured
- [ ] CORS settings correct
- [ ] XSS protection enabled
- [ ] SQL injection prevention
- [ ] CSRF tokens implemented
