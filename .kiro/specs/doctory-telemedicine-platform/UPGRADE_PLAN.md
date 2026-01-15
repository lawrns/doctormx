# Doctory Upgrade Plan - Critical Issues Resolution

## Current Status

The application is experiencing critical database schema and authentication issues that prevent registration, login, and doctor discovery from functioning. The platform is approximately 60% complete with significant gaps in:

1. **Database Schema**: Missing tables and relationships
2. **Authentication Flow**: Session validation and profile fetching broken
3. **Doctor Discovery**: Catalog query failing due to schema issues
4. **Data Consistency**: Profile and doctor data not syncing correctly

## Critical Issues (Blocking)

### Issue 1: Missing Database Tables
**Error**: `relation "public.specialties" does not exist`
**Impact**: Doctor discovery page crashes (500 error)
**Root Cause**: Database migrations incomplete or not applied

**Solution**:
- Run all pending Supabase migrations
- Verify all tables exist: specialties, doctor_specialties, availability_rules, etc.
- Check foreign key constraints are properly set up

### Issue 2: Foreign Key Relationship Missing
**Error**: `Could not find a relationship between 'doctors' and 'profiles'`
**Impact**: Doctor queries fail, discovery system broken
**Root Cause**: Missing foreign key constraint or incorrect schema

**Solution**:
- Verify `doctors.id` references `profiles.id` as foreign key
- Check `doctor_specialties` table exists and has correct relationships
- Ensure all indexes are created for performance

### Issue 3: Profile Fetch Failures
**Error**: `Profile fetch error: { message: 'Bad Request' }`
**Impact**: User authentication broken, can't load user data
**Root Cause**: Supabase RLS policies or query issues

**Solution**:
- Verify RLS policies on profiles table allow authenticated users to read their own profile
- Check Supabase Auth integration is working
- Validate session middleware is correctly extracting user ID

### Issue 4: Authentication Redirect Not Working
**Error**: Unauthenticated users can access booking page without redirect
**Impact**: Security vulnerability, booking system broken
**Root Cause**: Middleware not enforcing authentication on protected routes

**Solution**:
- Update middleware to check authentication on `/book/*` routes
- Implement proper redirect with state preservation
- Add session validation on booking API

## Upgrade Plan - Phase 1: Critical Fixes (1-2 days)

### Phase 1.1: Database Schema Repair (2-3 hours)

**Task 1.1.1**: Audit current database schema
- [ ] Connect to Supabase and list all tables
- [ ] Verify these tables exist:
  - `profiles` (extends auth.users)
  - `doctors` (references profiles)
  - `specialties`
  - `doctor_specialties` (many-to-many)
  - `availability_rules`
  - `availability_exceptions`
  - `appointments`
  - `payments`
  - `prescriptions`
  - `reviews`
  - `pre_consulta_sessions`
  - `consultation_transcripts`
  - `follow_up_schedules`
  - `ai_audit_logs`
  - `doctor_subscriptions` (for monetization)
  - `whatsapp_sessions` (for WhatsApp system)
  - `pharmacy_sponsors` (for pharmacy sponsorship)

**Task 1.1.2**: Create missing migration
- [ ] Create new migration file: `004_complete_schema.sql`
- [ ] Add all missing tables with correct relationships
- [ ] Add all indexes for performance
- [ ] Add RLS policies for security
- [ ] Run migration against Supabase

**Task 1.1.3**: Verify foreign keys and constraints
- [ ] Verify `doctors.id` → `profiles.id` foreign key
- [ ] Verify `doctor_specialties` relationships
- [ ] Verify `appointments` relationships
- [ ] Verify `payments` relationships
- [ ] Add missing constraints if needed

### Phase 1.2: Authentication & Session Fix (2-3 hours)

**Task 1.2.1**: Fix middleware authentication
- [ ] Update `src/middleware.ts` to properly validate sessions
- [ ] Add explicit authentication check for protected routes
- [ ] Implement proper redirect with state preservation
- [ ] Test redirect flow with query parameters

**Task 1.2.2**: Fix profile fetching
- [ ] Update `src/lib/supabase/server.ts` to handle profile queries correctly
- [ ] Add error handling for missing profiles
- [ ] Implement profile creation on first login if needed
- [ ] Test profile fetch with real Supabase session

**Task 1.2.3**: Fix booking page authentication
- [ ] Update `/app/book/[doctorId]/page.tsx` to check authentication
- [ ] Add redirect to login with state preservation
- [ ] Preserve selected date/time in redirect URL
- [ ] Test full booking flow

### Phase 1.3: Doctor Discovery Fix (1-2 hours)

**Task 1.3.1**: Fix discovery query
- [ ] Update `src/lib/discovery.ts` to handle missing specialties gracefully
- [ ] Add proper error handling for schema issues
- [ ] Test discovery query with real data
- [ ] Verify doctor cards render correctly

**Task 1.3.2**: Seed initial data
- [ ] Create script to seed specialties
- [ ] Create script to seed test doctors
- [ ] Verify data appears in discovery page

### Phase 1.4: Testing & Validation (1-2 hours)

**Task 1.4.1**: Test critical flows
- [ ] Test user registration (patient)
- [ ] Test user login
- [ ] Test doctor discovery page
- [ ] Test doctor detail page
- [ ] Test booking page authentication redirect
- [ ] Test booking flow

**Task 1.4.2**: Verify no errors in console
- [ ] Check for 500 errors
- [ ] Check for database errors
- [ ] Check for authentication errors
- [ ] Verify all pages load without errors

## Upgrade Plan - Phase 2: Complete Monetization (2-3 days)

### Phase 2.1: Doctor Subscription System
- [ ] Implement subscription database tables
- [ ] Create subscription management module
- [ ] Update catalog query to enforce subscription requirement
- [ ] Create subscription setup page
- [ ] Implement Stripe webhook handler

### Phase 2.2: WhatsApp Doctor System
- [ ] Create WhatsApp database tables
- [ ] Implement WhatsApp triage flow
- [ ] Create Twilio webhook handler
- [ ] Implement handoff routing with limits

### Phase 2.3: Pharmacy Sponsorship System
- [ ] Create pharmacy database tables
- [ ] Implement pharmacy matching logic
- [ ] Add pharmacy suggestion UI
- [ ] Implement disclosure enforcement

## Upgrade Plan - Phase 3: AI Features (3-5 days)

### Phase 3.1: Dr. Simeon AI Doctor
- [ ] Implement Dr. Simeon module with OPQRST methodology
- [ ] Implement severity classification and red flag detection
- [ ] Create chat orchestrator for conversation stages
- [ ] Integrate into pre-consulta flow

### Phase 3.2: Medical Knowledge Base (RAG)
- [ ] Set up pgvector extension
- [ ] Create medical knowledge table
- [ ] Seed Mexican medical guidelines
- [ ] Implement semantic search

### Phase 3.3: Clinical Copilot & Image Analysis
- [ ] Implement clinical copilot for doctor assistance
- [ ] Implement medical image analysis with GPT-4 Vision
- [ ] Implement OTC medication recommendations

## Estimated Timeline

- **Phase 1 (Critical Fixes)**: 1-2 days
  - Database schema repair: 2-3 hours
  - Authentication fixes: 2-3 hours
  - Discovery fixes: 1-2 hours
  - Testing: 1-2 hours

- **Phase 2 (Monetization)**: 2-3 days
  - Subscription system: 1 day
  - WhatsApp system: 1 day
  - Pharmacy system: 0.5 day

- **Phase 3 (AI Features)**: 3-5 days
  - Dr. Simeon: 1-2 days
  - Knowledge base: 1 day
  - Copilot & image analysis: 1-2 days

**Total**: 6-10 days to full production readiness

## Recommended Approach

1. **Start with Phase 1** - Fix critical blocking issues first
2. **Validate each phase** - Test thoroughly before moving to next phase
3. **Deploy incrementally** - Each phase can be deployed independently
4. **Monitor errors** - Watch for new issues as you progress

## Next Steps

1. Review this upgrade plan
2. Confirm you want to proceed with Phase 1 (Critical Fixes)
3. I'll help you execute each task in the plan
4. We'll validate each phase before moving to the next

Would you like to start with Phase 1: Critical Fixes?
