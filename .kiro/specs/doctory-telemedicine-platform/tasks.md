# Implementation Plan: Doctory Telemedicine Platform

## Overview

This implementation plan transforms the Doctory telemedicine platform from ~60%
complete to 100% production-ready. Tasks are organized by priority: critical
fixes first, then monetization systems, then enhancements. Each task builds
incrementally on previous work.

## Tasks

-
  1. [ ] Fix Critical Authentication & Security Issues
  - [ ] 1.1 Fix booking page authentication checkpoint
    - Convert `/book/[doctorId]/page.tsx` to validate auth before allowing
      booking submission
    - Add redirect to `/auth/login?redirect=/book/[doctorId]` for
      unauthenticated users
    - Preserve selected date and time in redirect URL
    - _Requirements: 2.3, 2.7, 15.3_
  - [ ] 1.2 Write property test for authentication redirect preservation
    - **Property 4: Authentication Redirect Preservation**
    - **Validates: Requirements 2.3, 15.3**
  - [ ] 1.3 Fix appointments API to use session-only patient ID
    - Update `/api/appointments/route.ts` to ignore body patientId
    - Always use `user.id` from authenticated session
    - Add explicit validation that session exists
    - _Requirements: 2.7, 15.5, 15.6_
  - [ ] 1.4 Write property test for session-only patient ID
    - **Property 5: Booking Security - Session-Only Patient ID**
    - **Validates: Requirements 2.7, 15.6**

-
  2. [ ] Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  3. [ ] Complete Doctor Onboarding Flow
  - [ ] 3.1 Implement document upload component
    - Create `DocumentUploader.tsx` component for Supabase Storage
    - Support license (required), ID (required), certificates (optional)
    - Display upload progress and preview
    - Store paths in `doctor_verification_documents` table
    - _Requirements: 6.4, 6.10_
  - [ ] 3.2 Implement availability configuration UI
    - Add availability section to `OnboardingForm.tsx`
    - Support multiple time blocks per day
    - Include slot duration and buffer time settings
    - Save to `availability_rules` table
    - _Requirements: 6.3, 8.2, 8.3_
  - [ ] 3.3 Add onboarding form validation
    - Validate all required fields before enabling submit
    - Validate price within MIN/MAX range
    - Require at least one availability slot
    - Highlight missing/invalid fields
    - _Requirements: 6.5, 6.6, 6.8, 6.9_
  - [ ] 3.4 Write property test for onboarding validation
    - **Property 13: Onboarding Validation Completeness**
    - **Validates: Requirements 6.5, 6.8, 6.9**
  - [ ] 3.5 Update onboarding API to save all fields
    - Update `/api/doctor/onboarding/route.ts` to handle documents,
      availability, price
    - Set status to 'pending' on complete submission
    - _Requirements: 6.7_

-
  4. [ ] Fix Admin Verification Flow
  - [ ] 4.1 Add rejection reason validation
    - Make rejection reason required in frontend form
    - Prevent submission if rejecting without reason
    - Display validation error message
    - _Requirements: 7.5, 7.6_
  - [ ] 4.2 Write property test for rejection reason requirement
    - **Property 14: Admin Rejection Requires Reason**
    - **Validates: Requirements 7.5, 7.6**
  - [ ] 4.3 Add document preview in admin verification
    - Display uploaded documents with preview capability
    - Support image and PDF preview
    - _Requirements: 7.3_

-
  5. [ ] Checkpoint - Ensure onboarding and verification tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  6. [ ] Implement Doctor Subscription System
  - [ ] 6.1 Create subscription database migration
    - Add `subscription_status` enum
    - Create `doctor_subscriptions` table
    - Add index for catalog query optimization
    - _Requirements: 18.1, 18.9_
  - [ ] 6.2 Implement subscription system module
    - Create `src/lib/subscription.ts` with interfaces
    - Implement `createSubscription()` with Stripe integration
    - Implement `cancelSubscription()` and `pauseSubscription()`
    - Implement `checkSubscriptionStatus()`
    - _Requirements: 18.2, 18.3, 18.4, 18.7_
  - [ ] 6.3 Update catalog query to enforce subscription
    - Modify `src/lib/discovery.ts` to join with subscriptions
    - Enforce `status = 'approved' AND subscription.status = 'active'`
    - _Requirements: 18.1, 18.8_
  - [ ] 6.4 Write property test for catalog visibility enforcement
    - **Property 1: Catalog Visibility Enforcement**
    - **Validates: Requirements 1.1, 18.1, 18.8**
  - [ ] 6.5 Write property test for subscription status catalog effect
    - **Property 21: Subscription Status Catalog Effect**
    - **Validates: Requirements 18.5, 18.7, 18.8**
  - [ ] 6.6 Create subscription setup page
    - Create `/doctor/subscription/page.tsx`
    - Display plan options (basic_499 for now)
    - Integrate Stripe Elements for payment
    - Redirect from approval to subscription setup
    - _Requirements: 18.3, 18.10_
  - [ ] 6.7 Implement subscription webhook handler
    - Create `/api/webhooks/stripe/route.ts`
    - Handle `invoice.paid`, `invoice.payment_failed`,
      `customer.subscription.deleted`
    - Update subscription status accordingly
    - _Requirements: 18.4, 18.5, 18.7_

-
  7. [ ] Checkpoint - Ensure subscription system tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  8. [ ] Implement WhatsApp Doctor System
  - [ ] 8.1 Create WhatsApp database migration
    - Create `whatsapp_sessions` table
    - Create `whatsapp_messages` table
    - Add indexes for phone lookup and session state
    - _Requirements: 19.2, 19.11_
  - [ ] 8.2 Implement WhatsApp system module
    - Create `src/lib/whatsapp.ts` with interfaces
    - Implement `createSession()`, `addMessage()`, `updateSessionState()`
    - Implement `linkToPatient()` for account linking
    - _Requirements: 19.2, 19.8_
  - [ ] 8.3 Implement WhatsApp triage flow
    - Create AI-powered triage conversation (3-5 questions)
    - Determine urgency and outcome (book/pharmacy/emergency)
    - Generate triage summary
    - _Requirements: 19.3, 19.4_
  - [ ] 8.4 Implement WhatsApp webhook handler
    - Create `/api/webhooks/twilio/route.ts`
    - Handle incoming messages from Twilio
    - Route to triage or handoff based on session state
    - _Requirements: 19.1_
  - [ ] 8.5 Implement handoff routing with limits
    - Route handoffs to doctors with active subscriptions
    - Track `handoffs_used` per doctor
    - Enforce `handoffs_limit` based on plan
    - _Requirements: 19.9, 19.10_
  - [ ] 8.6 Write property test for handoff limit enforcement
    - **Property 22: WhatsApp Handoff Limit Enforcement**
    - **Validates: Requirements 19.10**
  - [ ] 8.7 Implement booking link generation
    - Generate pre-filled booking URL with triage summary
    - Include doctor ID from handoff
    - _Requirements: 19.5_

-
  9. [ ] Implement Pharmacy Sponsorship System
  - [ ] 9.1 Create pharmacy database migration
    - Create `pharmacy_sponsors` table
    - Create `appointment_sponsorships` table
    - Add constraint for `disclosed = true`
    - _Requirements: 20.1, 20.6_
  - [ ] 9.2 Implement pharmacy system module
    - Create `src/lib/pharmacy.ts` with interfaces
    - Implement `matchPharmacy()` based on patient city
    - Implement `createSponsorship()` with disclosure enforcement
    - _Requirements: 20.4, 20.6_
  - [ ] 9.3 Write property test for pharmacy disclosure requirement
    - **Property 23: Pharmacy Sponsorship Disclosure**
    - **Validates: Requirements 20.3, 20.6**
  - [ ] 9.4 Add pharmacy suggestion UI to prescription page
    - Display pharmacy suggestion after prescription is saved
    - Show "Patrocinado" label clearly
    - Include opt-out option
    - _Requirements: 20.3, 20.8, 20.9_
  - [ ] 9.5 Write property test for prescription independence
    - **Property 24: Prescription Independence from Pharmacy**
    - **Validates: Requirements 20.5**

-
  10. [ ] Checkpoint - Ensure monetization systems tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  11. [ ] Complete Consultation Flow
  - [ ] 11.1 Add time-based join button logic
    - Enable button only when within 10 minutes of appointment
    - Display countdown when more than 10 minutes away
    - Apply to both patient and doctor views
    - _Requirements: 4.4, 4.5, 9.3_
  - [ ] 11.2 Write property test for time-based button state
    - **Property 10: Time-Based Button State**
    - **Validates: Requirements 4.4, 4.5, 9.3**
  - [ ] 11.3 Add "Finalizar consulta" button for doctor
    - Add button to doctor consultation view
    - Update appointment status to 'completed' on click
    - Trigger follow-up scheduling
    - _Requirements: 9.5, 9.6_
  - [ ] 11.4 Implement follow-up scheduling on completion
    - Create 3 follow-up records (24h, 7d, 30d) when completed
    - Set correct scheduled_for timestamps
    - Set appropriate channels (WhatsApp for 24h/7d, email for 30d)
    - _Requirements: 9.7, 14.1, 14.2, 14.3_
  - [ ] 11.5 Write property test for consultation completion effects
    - **Property 16: Consultation Completion Effects**
    - **Validates: Requirements 9.6, 9.7, 14.1**
  - [ ] 11.6 Ensure video room consistency
    - Verify same Jitsi room URL for patient and doctor
    - Use appointment ID as room identifier
    - _Requirements: 4.6, 9.4_
  - [ ] 11.7 Write property test for video room consistency
    - **Property 11: Video Room Consistency**
    - **Validates: Requirements 4.6, 9.4**

-
  12. [ ] Implement Review System
  - [ ] 12.1 Create review UI component
    - Create `ReviewForm.tsx` with 1-5 star rating
    - Include optional comment field
    - Display after appointment is completed
    - _Requirements: 11.1, 11.2_
  - [ ] 12.2 Implement review API
    - Create `/api/reviews/route.ts`
    - Validate appointment is completed and owned by patient
    - Enforce one review per appointment
    - _Requirements: 11.3, 11.5_
  - [ ] 12.3 Write property test for review uniqueness
    - **Property 18: Review Uniqueness**
    - **Validates: Requirements 11.5**
  - [ ] 12.4 Implement rating calculation trigger
    - Update doctor rating_avg and rating_count on new review
    - Use database trigger or application logic
    - _Requirements: 11.4_
  - [ ] 12.5 Write property test for rating calculation
    - **Property 17: Rating Calculation Correctness**
    - **Validates: Requirements 11.4**
  - [ ] 12.6 Display reviews on doctor profile
    - Show reviews on `/doctors/[id]` page
    - Display rating, comment, and date
    - _Requirements: 11.6_

-
  13. [ ] Checkpoint - Ensure consultation and review tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  14. [ ] Implement Notification System
  - [ ] 14.1 Set up Resend email integration
    - Configure Resend API client
    - Create email templates for notifications
    - _Requirements: 16.5_
  - [ ] 14.2 Implement appointment confirmation emails
    - Send to patient and doctor on payment success
    - Include appointment details and action links
    - _Requirements: 16.1, 16.6_
  - [ ] 14.3 Implement appointment reminder emails
    - Schedule reminder 15 minutes before appointment
    - Include join consultation link
    - _Requirements: 16.2_
  - [ ] 14.4 Implement doctor status change notifications
    - Send email when doctor is approved or rejected
    - Include next steps (subscription setup for approved)
    - _Requirements: 7.7, 16.3_
  - [ ] 14.5 Implement payment failure notifications
    - Send email with retry instructions
    - Include link to retry payment
    - _Requirements: 16.4_

-
  15. [ ] Implement Slot Management
  - [ ] 15.1 Implement slot availability validation
    - Validate slot is available before creating appointment
    - Handle race conditions with database constraints
    - _Requirements: 2.4_
  - [ ] 15.2 Write property test for slot double-booking prevention
    - **Property 6: Slot Double-Booking Prevention**
    - **Validates: Requirements 2.4, 2.5**
  - [ ] 15.3 Implement slot release on payment failure
    - Delete or reset appointment on payment failure
    - Make slot available for other patients
    - _Requirements: 3.6_
  - [ ] 15.4 Write property test for payment failure slot release
    - **Property 8: Payment Failure Slot Release**
    - **Validates: Requirements 3.6**

-
  16. [ ] Checkpoint - Ensure notification and slot management tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  17. [ ] Implement Search and Discovery Enhancements
  - [ ] 17.1 Implement search filters
    - Add specialty, price range, city filters to `/doctors`
    - Update discovery query to apply filters
    - _Requirements: 1.4_
  - [ ] 17.2 Write property test for search filter correctness
    - **Property 2: Search Filter Correctness**
    - **Validates: Requirements 1.4**
  - [ ] 17.3 Implement empty state for no results
    - Display helpful message when no doctors match
    - Suggest alternative search terms or popular doctors
    - _Requirements: 1.6_

-
  18. [ ] Implement Enhanced AI Features (Dr. Simeon)
  - [ ] 18.1 Implement Dr. Simeon AI doctor module
    - Create `src/lib/ai/drSimeon.ts` with comprehensive medical AI
    - Implement OPQRST clinical methodology for symptom gathering
    - Implement severity classification (green/yellow/orange/red)
    - Implement red flag detection for emergencies
    - Include Mexican cultural context and Spanish language
    - _Requirements: 12.2, 12.3, 12.5, 12.6, 12.7_
  - [ ] 18.2 Write property test for red flag detection
    - **Property 26: Pre-Consulta Red Flag Detection**
    - **Validates: Requirements 12.6, 12.7**
  - [ ] 18.3 Implement chat orchestrator for conversation stages
    - Create `src/lib/ai/orchestrator.ts` for stage management
    - Implement stage progression (initial → followup → detailed → referral)
    - Generate contextual chips and forms based on stage
    - _Requirements: 12.4_
  - [ ] 18.4 Write property test for conversation stage progression
    - **Property 27: Pre-Consulta Conversation Stage Progression**
    - **Validates: Requirements 12.4**
  - [ ] 18.5 Verify pre-consulta audit logging
    - Ensure all pre-consulta sessions are stored
    - Ensure ai_audit_logs entries are created
    - _Requirements: 12.9, 12.11_
  - [ ] 18.6 Write property test for pre-consulta audit trail
    - **Property 19: Pre-Consulta Audit Trail**
    - **Validates: Requirements 12.9, 12.11**
  - [ ] 18.7 Verify transcription file validation
    - Ensure only valid file types are accepted
    - Ensure file size limit is enforced
    - _Requirements: 13.2_
  - [ ] 18.8 Write property test for transcription file validation
    - **Property 20: Transcription File Validation**
    - **Validates: Requirements 13.2**

-
  19. [ ] Checkpoint - Ensure enhanced AI tests pass
  - Ensure all tests pass, ask the user if questions arise.

-
  20. [ ] Implement Medical Knowledge Base (RAG)
  - [ ] 20.1 Create medical knowledge database migration
    - Add pgvector extension for embeddings
    - Create `medical_knowledge` table with vector column
    - Create index for vector similarity search
    - _Requirements: 23.1_
  - [ ] 20.2 Implement knowledge base module
    - Create `src/lib/ai/knowledge.ts` with RAG functionality
    - Implement `generateEmbedding()` using OpenAI text-embedding-3-small
    - Implement `retrieveMedicalContext()` for semantic search
    - Implement `generateAugmentedPrompt()` to inject context
    - _Requirements: 23.5, 23.6_
  - [ ] 20.3 Seed initial medical guidelines
    - Add Mexican NOM guidelines (NOM-004, NOM-024)
    - Add IMSS protocols (hypertension, diabetes, respiratory)
    - Add ISSSTE protocols
    - Add WHO and CDC guidelines
    - _Requirements: 23.2, 23.3, 23.4_
  - [ ] 20.4 Write property test for knowledge retrieval relevance
    - **Property 28: Medical Knowledge Retrieval Relevance**
    - **Validates: Requirements 23.6, 23.7**

-
  21. [ ] Implement Clinical Copilot
  - [ ] 21.1 Create clinical copilot module
    - Create `src/lib/ai/copilot.ts` for doctor assistance
    - Implement `analyzeConsultation()` for SOAP note generation
    - Implement differential diagnosis suggestions with probabilities
    - Implement quick reply suggestions in Spanish
    - _Requirements: 22.1, 22.2, 22.3, 22.4_
  - [ ] 21.2 Write property test for SOAP completeness
    - **Property 31: Clinical Copilot SOAP Completeness**
    - **Validates: Requirements 22.2**
  - [ ] 21.3 Add copilot UI to doctor consultation view
    - Display SOAP notes panel
    - Display differential diagnosis suggestions
    - Display quick reply chips
    - Include AI disclaimer
    - _Requirements: 22.5, 22.6_

-
  22. [ ] Implement Medical Image Analysis
  - [ ] 22.1 Create vision analysis module
    - Create `src/lib/ai/vision.ts` for image analysis
    - Implement `analyzeMedicalImage()` using GPT-4 Vision
    - Support multiple image types (xray, ct, mri, ultrasound, skin, lab)
    - Implement specialty-specific analysis prompts
    - _Requirements: 24.1, 24.2, 24.6_
  - [ ] 22.2 Write property test for image analysis disclaimer
    - **Property 30: Medical Image Analysis Disclaimer**
    - **Validates: Requirements 24.5, 24.8**
  - [ ] 22.3 Add image upload to pre-consulta chat
    - Allow image upload during triage
    - Display analysis results with confidence
    - Include urgency classification
    - _Requirements: 24.3, 24.4_

-
  23. [ ] Implement OTC Medication Recommendations
  - [ ] 23.1 Create OTC recommendation module
    - Create approved OTC medication list for Mexico
    - Implement recommendation formatting with dosage tables
    - Include warnings and contraindications
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.6_
  - [ ] 23.2 Write property test for OTC safety
    - **Property 29: OTC Recommendation Safety**
    - **Validates: Requirements 25.5**
  - [ ] 23.3 Integrate OTC recommendations into Dr. Simeon responses
    - Add medication suggestions for appropriate conditions
    - Format as clear tables with product, dose, frequency, duration
    - Include generic alternatives
    - _Requirements: 25.6, 25.7_

-
  24. [ ] Implement AI Audit Logging
  - [ ] 24.1 Complete ai_audit_logs implementation
    - Implement database insert for all AI operations
    - Track operation type, tokens, cost, latency
    - Include input/output for compliance
    - _Requirements: 12.11, 13.9, 22.7, 24.7_
  - [ ] 24.2 Write property test for audit log completeness
    - **Property 32: AI Audit Log Completeness**
    - **Validates: Requirements 12.11, 13.9, 22.7, 24.7**

-
  25. [ ] Checkpoint - Ensure all AI feature tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 32 correctness properties are covered by tests

-
  26. [ ] Implement Role-Based Access Control
  - [ ] 26.1 Update middleware for role-based routing
    - Redirect users to correct dashboard based on role
    - Prevent cross-role access
    - _Requirements: 15.4_
  - [ ] 26.2 Write property test for role-based route access
    - **Property 25: Role-Based Route Access**
    - **Validates: Requirements 15.4**
  - [ ] 26.3 Verify RLS policies on all tables
    - Audit all tables have RLS enabled
    - Test policies with different user roles
    - _Requirements: 15.7_

-
  27. [ ] Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 32 correctness properties are covered by tests
  - Run full test suite with coverage report

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (32 total)
- Unit tests validate specific examples and edge cases
- Critical fixes (Tasks 1-5) should be completed before monetization systems
- Monetization systems (Tasks 6-10) are essential for revenue generation
- AI features (Tasks 18-26) implement Dr. Simeon and advanced medical AI
- All database migrations should be run in order before implementing features
- Use fast-check library for property-based testing with minimum 100 iterations
  per test
- Dr. Simeon AI should match or exceed the quality of the previous codebase
  implementation
