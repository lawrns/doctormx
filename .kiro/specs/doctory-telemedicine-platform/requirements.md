# Requirements Document

## Introduction

Doctory is a telemedicine platform that connects patients with verified doctors
for video consultations. The platform enables patients to discover doctors, book
appointments, pay securely, and attend video consultations. Doctors can
register, complete verification, manage availability, conduct consultations, and
generate prescriptions. The system includes AI-assisted features for
pre-consultation triage, transcription, and follow-up care.

This specification covers the complete implementation to bring the platform to
100% production readiness across all documented flows, UI/UX, security, and AI
features.

## Glossary

- **Patient**: A user with role 'patient' who books and attends medical
  consultations
- **Doctor**: A user with role 'doctor' who provides medical consultations after
  verification
- **Admin**: A user with role 'admin' who verifies doctors and manages the
  platform
- **Appointment**: A scheduled consultation between a patient and doctor with
  associated payment
- **Slot**: A specific date/time window when a doctor is available for
  consultation
- **Verification**: The admin approval process for doctors before they appear in
  the public catalog
- **Subscription**: Monthly payment (499 MXN) required for doctors to appear in
  the public catalog
- **WhatsApp_Doctor**: The WhatsApp-based entry point for patient triage and
  consultation booking
- **Handoff**: When a WhatsApp triage session is routed to a specific doctor for
  consultation
- **Pre-consulta**: AI-assisted triage chat before booking to assess urgency and
  gather symptoms
- **Transcription**: AI-powered audio-to-text conversion of consultations with
  structured summaries
- **Follow-up**: Automated post-consultation check-ins with patients via
  WhatsApp/email
- **Pharmacy_Sponsor**: A partner pharmacy that pays for sponsored placement in
  prescription delivery suggestions
- **Patrocinado**: Spanish label indicating sponsored content (required for
  pharmacy suggestions)

## Requirements

### Requirement 1: Patient Discovers Doctors

**User Story:** As a patient, I want to browse and search for doctors without
logging in, so that I can find a suitable doctor before committing to
registration.

#### Acceptance Criteria

1. THE Public_Catalog SHALL display all doctors with status 'approved' without
   requiring authentication
2. WHEN a patient visits /doctors, THE Discovery_System SHALL display doctor
   cards showing name, specialty, rating, price, and availability indicator
3. WHEN a patient clicks on a doctor card, THE Discovery_System SHALL navigate
   to /doctors/[id] showing full profile with bio, experience, languages, and
   available slots
4. WHEN a patient applies search filters, THE Discovery_System SHALL filter
   doctors by specialty, price range, and availability
5. THE Discovery_System SHALL display doctor ratings as average stars (1-5) with
   review count
6. WHEN no doctors match the search criteria, THE Discovery_System SHALL display
   a helpful empty state with suggestions

### Requirement 2: Patient Books Appointment

**User Story:** As a patient, I want to book an appointment with a doctor, so
that I can receive medical consultation.

#### Acceptance Criteria

1. WHEN a patient selects a date on /book/[doctorId], THE Booking_System SHALL
   fetch and display available time slots for that date
2. WHEN a patient selects a time slot, THE Booking_System SHALL visually
   highlight the selected slot
3. WHEN an unauthenticated patient clicks "Continuar al pago", THE
   Booking_System SHALL redirect to /auth/login with redirect parameter back to
   booking page preserving date and time selection
4. WHEN an authenticated patient submits booking, THE Booking_System SHALL
   validate the slot is still available before creating the appointment
5. IF the selected slot is no longer available, THEN THE Booking_System SHALL
   display an error message and refresh available slots
6. WHEN appointment is created successfully, THE Booking_System SHALL redirect
   to /checkout/[appointmentId]
7. THE Booking_API SHALL obtain patient_id from the authenticated session, never
   from request body
8. WHEN a slot is selected, THE Booking_System SHALL display the total price
   including any fees

### Requirement 3: Patient Completes Payment

**User Story:** As a patient, I want to pay for my appointment securely, so that
my consultation is confirmed.

#### Acceptance Criteria

1. WHEN a patient arrives at /checkout/[appointmentId], THE Payment_System SHALL
   display appointment details and total amount
2. THE Payment_System SHALL create a Stripe PaymentIntent for the appointment
   amount
3. WHEN payment succeeds, THE Payment_System SHALL update appointment status to
   'confirmed'
4. WHEN payment succeeds, THE Payment_System SHALL create a payment record with
   provider_ref and amount
5. IF payment fails, THEN THE Payment_System SHALL display the Stripe error
   message and allow retry
6. IF payment fails, THEN THE Booking_System SHALL release the slot for other
   patients
7. WHEN payment is confirmed, THE Notification_System SHALL send confirmation
   email to patient and doctor
8. THE Payment_System SHALL support MXN currency with Stripe

### Requirement 4: Patient Attends Consultation

**User Story:** As a patient, I want to join my video consultation at the
scheduled time, so that I can receive medical care.

#### Acceptance Criteria

1. WHEN a patient visits /consultation/[appointmentId], THE Consultation_System
   SHALL verify the patient owns this appointment
2. IF the appointment status is not 'confirmed', THEN THE Consultation_System
   SHALL display appropriate message and redirect
3. THE Consultation_System SHALL display appointment details including doctor
   name, date, and time
4. WHEN the current time is within 10 minutes before the appointment start time,
   THE Consultation_System SHALL enable the "Ingresar a Consulta" button
5. WHILE the current time is more than 10 minutes before appointment, THE
   Consultation_System SHALL display countdown and disable the join button
6. WHEN patient clicks join button, THE Video_System SHALL generate a Jitsi Meet
   room URL and open in new tab
7. THE Consultation_System SHALL display instructions for camera, microphone,
   and connection requirements

### Requirement 5: Doctor Registers Account

**User Story:** As a doctor, I want to create an account and indicate my
profession, so that I can start the verification process.

#### Acceptance Criteria

1. WHEN a user visits /auth/register with type=doctor parameter, THE Auth_System
   SHALL display doctor registration form
2. THE Auth_System SHALL collect email, password, and full name for registration
3. WHEN registration succeeds, THE Auth_System SHALL create a profile with role
   'doctor'
4. WHEN registration succeeds, THE Auth_System SHALL create a doctor record with
   status 'pending'
5. WHEN registration succeeds, THE Auth_System SHALL redirect to
   /doctor/onboarding
6. IF email is already registered, THEN THE Auth_System SHALL display
   appropriate error message

### Requirement 6: Doctor Completes Onboarding

**User Story:** As a doctor, I want to complete my professional profile with all
required information, so that I can be verified and start receiving patients.

#### Acceptance Criteria

1. WHEN a doctor visits /doctor/onboarding, THE Onboarding_System SHALL display
   a single-page scrollable form with all required fields
2. THE Onboarding_Form SHALL collect: specialty, years of experience,
   professional license number (cédula), bio, city, state, and consultation
   price
3. THE Onboarding_Form SHALL collect weekly availability with day, start time,
   end time, and slot duration
4. THE Onboarding_Form SHALL allow uploading verification documents:
   professional license (required), ID document (required), certificates
   (optional)
5. WHEN a required field is empty, THE Onboarding_Form SHALL prevent submission
   and highlight missing fields
6. WHEN all required fields are complete, THE Onboarding_System SHALL enable the
   submit button
7. WHEN doctor submits complete profile, THE Onboarding_System SHALL update
   doctor status to 'pending' and display "En revisión" message
8. THE Onboarding_Form SHALL validate price is within configured MIN_PRICE_CENTS
   and MAX_PRICE_CENTS range
9. THE Onboarding_Form SHALL require at least one availability slot to be
   configured
10. WHEN documents are uploaded, THE Document_System SHALL store files in
    Supabase Storage with secure paths

### Requirement 7: Admin Verifies Doctor

**User Story:** As an admin, I want to review and verify doctor applications, so
that only qualified doctors appear in the public catalog.

#### Acceptance Criteria

1. WHEN an admin visits /admin/verify, THE Verification_System SHALL display all
   doctors with status 'pending' ordered by created_at ascending
2. THE Verification_System SHALL display doctor information: name, email, phone,
   license number, experience, location, price, and bio
3. THE Verification_System SHALL display uploaded verification documents with
   preview capability
4. WHEN admin clicks "Aprobar", THE Verification_System SHALL update doctor
   status to 'approved'
5. WHEN admin clicks "Rechazar", THE Verification_System SHALL require a
   rejection reason before submission
6. IF rejection reason is empty, THEN THE Verification_System SHALL prevent
   rejection and display validation error
7. WHEN doctor status changes, THE Notification_System SHALL send email
   notification to the doctor
8. WHEN doctor is approved, THE Doctor SHALL immediately appear in the public
   catalog

### Requirement 8: Doctor Manages Availability

**User Story:** As a doctor, I want to configure my weekly schedule and block
specific dates, so that patients can only book when I'm available.

#### Acceptance Criteria

1. WHEN a doctor visits /doctor/availability, THE Availability_System SHALL
   display current weekly schedule
2. THE Availability_System SHALL allow configuring multiple time blocks per day
   of week
3. THE Availability_System SHALL allow setting slot duration (default 30
   minutes) and buffer time between appointments
4. THE Availability_System SHALL allow blocking specific dates/times as
   exceptions
5. THE Availability_System SHALL allow adding extra availability as exceptions
6. WHEN availability is saved, THE Availability_System SHALL update
   availability_rules and availability_exceptions tables
7. THE Availability_System SHALL prevent changes that would affect appointments
   within 48 hours (future implementation)

### Requirement 9: Doctor Conducts Consultation

**User Story:** As a doctor, I want to conduct video consultations and document
the visit, so that I can provide proper medical care.

#### Acceptance Criteria

1. WHEN a doctor visits /doctor/appointments, THE Appointment_System SHALL
   display upcoming and past appointments
2. THE Appointment_System SHALL display a "Unirse a consulta" button for
   confirmed appointments
3. WHEN the current time is within 10 minutes before appointment, THE
   Consultation_System SHALL enable the join button for doctor
4. WHEN doctor joins consultation, THE Video_System SHALL open the same Jitsi
   room as the patient
5. THE Consultation_System SHALL provide a "Finalizar consulta" button for the
   doctor
6. WHEN doctor clicks "Finalizar consulta", THE Consultation_System SHALL update
   appointment status to 'completed'
7. WHEN appointment is completed, THE Follow_Up_System SHALL schedule automated
   follow-up messages

### Requirement 10: Doctor Creates Prescription

**User Story:** As a doctor, I want to create digital prescriptions after
consultations, so that patients have documented treatment plans.

#### Acceptance Criteria

1. WHEN a doctor visits /doctor/prescription/[appointmentId], THE
   Prescription_System SHALL display prescription form
2. THE Prescription_Form SHALL collect: diagnosis, medications (name, dosage,
   frequency, duration), instructions, and follow-up date
3. WHEN AI transcription is enabled, THE Prescription_System SHALL allow
   uploading consultation audio
4. WHEN audio is uploaded, THE Transcription_System SHALL transcribe using
   Whisper API and extract structured data
5. WHEN transcription completes, THE Prescription_System SHALL auto-fill form
   fields from extracted data
6. WHEN prescription is saved, THE Prescription_System SHALL store in
   prescriptions table with data_json
7. THE Prescription_System SHALL generate downloadable PDF of the prescription

### Requirement 11: Patient Rates Consultation

**User Story:** As a patient, I want to rate my consultation experience, so that
other patients can make informed decisions.

#### Acceptance Criteria

1. WHEN appointment status changes to 'completed', THE Review_System SHALL
   enable rating for the patient
2. THE Review_System SHALL display rating form with 1-5 stars and optional
   comment
3. WHEN patient submits rating, THE Review_System SHALL create review record
   linked to appointment
4. WHEN review is created, THE Rating_System SHALL update doctor's rating_avg
   and rating_count
5. THE Review_System SHALL allow only one review per appointment
6. THE Review_System SHALL display reviews on doctor profile page

### Requirement 12: AI Pre-Consulta Triage (Dr. Simeon)

**User Story:** As a patient, I want AI-assisted symptom assessment before
booking, so that I can determine if I need a consultation and provide context to
the doctor.

#### Acceptance Criteria

1. WHEN AI pre-consulta is enabled and patient clicks book, THE
   PreConsulta_System SHALL display chat modal before showing slots
2. THE PreConsulta_Chat SHALL present Dr. Simeon, a virtual medical assistant
   specialized in telemedicine for Mexico
3. THE PreConsulta_Chat SHALL use structured clinical methodology (OPQRST:
   Onset, Provocation, Quality, Radiation, Severity, Timing) to gather symptom
   information
4. THE PreConsulta_Chat SHALL ask 3-5 questions about symptoms, duration, and
   severity using conversational stages (initial, followup, detailed, referral)
5. THE PreConsulta_System SHALL analyze responses and determine urgency level
   using severity classification (green/yellow/orange/red)
6. IF urgency is 'red' (emergency), THEN THE PreConsulta_System SHALL display
   emergency instructions with specific red flags identified and recommend
   calling 911 or going to ER immediately
7. THE PreConsulta_System SHALL detect critical red flags including:
   cardiovascular (chest pain + sweating + nausea), neurological (sudden
   weakness, speech difficulty), respiratory (severe breathing difficulty, blue
   lips), abdominal (rigid abdomen + fever), obstetric (pregnancy + bleeding),
   pediatric (infant fever > 38°C), psychiatric (active suicidal ideation)
8. WHEN pre-consulta completes, THE PreConsulta_System SHALL generate structured
   summary including chief complaint, symptoms, urgency level, suggested
   specialty, and AI confidence score
9. THE PreConsulta_System SHALL store session in pre_consulta_sessions table
10. THE PreConsulta_System SHALL display disclaimer: "La IA asiste, no
    diagnostica. Esta consulta es orientativa y no sustituye la evaluación
    médica presencial."
11. THE PreConsulta_System SHALL log all interactions in ai_audit_logs table
    with operation type, tokens used, cost, and latency
12. THE PreConsulta_System SHALL recommend appropriate specialty based on
    symptoms and provide referral guidance

### Requirement 13: AI Consultation Transcription

**User Story:** As a doctor, I want AI-powered transcription of consultations,
so that I can save time on documentation.

#### Acceptance Criteria

1. WHEN AI transcription is enabled, THE Transcription_System SHALL display
   upload button on prescription page
2. THE Transcription_System SHALL accept audio files: MP3, WAV, M4A, WebM up to
   25MB
3. WHEN audio is uploaded, THE Transcription_System SHALL send to Whisper API
   for transcription with Spanish language setting
4. WHEN transcription completes, THE Transcription_System SHALL use GPT-4 to
   extract structured SOAP note (Subjective, Objective, Assessment, Plan)
5. THE Transcription_Summary SHALL include: chief complaint, symptoms,
   diagnosis, differential diagnoses with probabilities, treatment plan,
   follow-up instructions
6. THE Transcription_System SHALL attempt speaker diarization to identify doctor
   vs patient segments
7. THE Transcription_System SHALL store results in consultation_transcripts
   table with segments, summary, and metadata
8. THE Transcription_System SHALL display cost estimate before processing based
   on audio duration
9. THE Transcription_System SHALL log operation in ai_audit_logs table with
   duration, tokens, and cost

### Requirement 22: Clinical Copilot for Doctors

**User Story:** As a doctor, I want AI-assisted clinical decision support during
consultations, so that I can provide better care and documentation.

#### Acceptance Criteria

1. WHEN a doctor is in an active consultation, THE Clinical_Copilot SHALL
   provide real-time analysis of the conversation
2. THE Clinical_Copilot SHALL generate structured SOAP notes from consultation
   messages
3. THE Clinical_Copilot SHALL suggest top 3 differential diagnoses with
   probability percentages and reasoning
4. THE Clinical_Copilot SHALL provide 3-4 smart quick reply suggestions for the
   doctor in Spanish
5. THE Clinical_Copilot SHALL analyze patient information (age, gender, history)
   to contextualize suggestions
6. THE Clinical_Copilot SHALL clearly indicate that suggestions are AI-assisted
   and the doctor has final decision authority
7. THE Clinical_Copilot SHALL log all analyses in ai_audit_logs for compliance

### Requirement 23: Medical Knowledge Base (RAG)

**User Story:** As a platform operator, I want the AI to reference authoritative
Mexican medical guidelines, so that recommendations are evidence-based and
locally relevant.

#### Acceptance Criteria

1. THE Medical_Knowledge_Base SHALL store medical guidelines with embeddings for
   semantic search
2. THE Medical_Knowledge_Base SHALL include Mexican official norms (NOM-004,
   NOM-024 for telemedicine)
3. THE Medical_Knowledge_Base SHALL include IMSS and ISSSTE clinical protocols
4. THE Medical_Knowledge_Base SHALL include WHO and CDC guidelines for
   international standards
5. WHEN generating AI responses, THE System SHALL retrieve relevant medical
   context using vector similarity search
6. THE System SHALL augment AI prompts with retrieved medical context and cite
   sources
7. THE System SHALL prioritize Mexican guidelines (NOM, IMSS, ISSSTE) over
   international sources when conflicts exist
8. THE Medical_Knowledge_Base SHALL track document metadata including source,
   specialty, year, and type

### Requirement 24: Medical Image Analysis

**User Story:** As a patient, I want to share medical images for AI-assisted
preliminary analysis, so that I can get faster guidance on my condition.

#### Acceptance Criteria

1. WHEN a patient uploads a medical image during pre-consulta, THE Vision_System
   SHALL analyze it using GPT-4 Vision
2. THE Vision_System SHALL support image types: X-ray, CT, MRI, ultrasound, lab
   results, skin conditions
3. THE Vision_System SHALL provide findings, confidence level (0-100%), and
   recommendations
4. THE Vision_System SHALL classify urgency as low/medium/high/critical
5. THE Vision_System SHALL always include disclaimer: "Esta es una segunda
   opinión basada en análisis de imagen. Siempre consulte con un médico
   especialista para diagnóstico definitivo."
6. THE Vision_System SHALL support specialized analysis by medical specialty
   (cardiology, dermatology, orthopedics, etc.)
7. THE Vision_System SHALL log all image analyses in ai_audit_logs with
   confidence scores
8. THE Vision_System SHALL never provide definitive diagnoses, only preliminary
   observations

### Requirement 25: OTC Medication Recommendations

**User Story:** As a patient, I want safe over-the-counter medication
recommendations, so that I can manage minor symptoms appropriately.

#### Acceptance Criteria

1. WHEN appropriate for the condition, THE AI_System SHALL recommend OTC
   medications available in Mexican pharmacies
2. THE AI_System SHALL provide specific dosage, frequency, and duration for each
   recommendation
3. THE AI_System SHALL include warnings, contraindications, and when to stop and
   seek help
4. THE AI_System SHALL categorize recommendations: analgesics/antipyretics,
   antigripales, gastrointestinal, topical, ophthalmic, vitamins/supplements
5. THE AI_System SHALL NEVER recommend prescription medications including:
   antibiotics, antihypertensives, hypoglycemics, psychotropics, opioids,
   systemic steroids, anticoagulants
6. THE AI_System SHALL format recommendations in a clear table with product,
   dose, frequency, duration, and purpose
7. THE AI_System SHALL respect Mexican cultural context and mention generic
   alternatives when appropriate

### Requirement 14: Automated Follow-Up

**User Story:** As a patient, I want automated check-ins after my consultation,
so that my recovery is monitored.

#### Acceptance Criteria

1. WHEN appointment status changes to 'completed', THE FollowUp_System SHALL
   schedule three follow-ups: 24h, 7d, 30d
2. THE FollowUp_System SHALL send 24h and 7d check-ins via WhatsApp (if
   configured) or email
3. THE FollowUp_System SHALL send 30d outcome survey via email
4. THE FollowUp_Message SHALL include personalized questions based on
   consultation summary
5. WHEN patient responds, THE FollowUp_System SHALL store response in
   follow_up_schedules table
6. IF patient response indicates worsening symptoms, THEN THE FollowUp_System
   SHALL alert the doctor
7. THE FollowUp_System SHALL update status to 'escalated' when doctor
   notification is triggered

### Requirement 15: Authentication and Authorization

**User Story:** As a system administrator, I want secure authentication and
role-based access, so that user data is protected.

#### Acceptance Criteria

1. THE Auth_System SHALL use Supabase Auth for email/password authentication
2. THE Auth_System SHALL enforce session validation on all protected routes via
   middleware
3. THE Auth_System SHALL redirect unauthenticated users to /auth/login with
   redirect parameter
4. THE Authorization_System SHALL enforce role-based access: patients to /app,
   doctors to /doctor, admins to /admin
5. THE API_System SHALL validate authentication on all API routes using
   server-side session
6. THE API_System SHALL never trust user IDs from request body, always use
   session
7. THE Database_System SHALL enforce Row Level Security (RLS) policies on all
   tables
8. THE Auth_System SHALL support secure password reset flow

### Requirement 16: Notification System

**User Story:** As a user, I want to receive timely notifications about my
appointments, so that I don't miss important events.

#### Acceptance Criteria

1. WHEN appointment is confirmed, THE Notification_System SHALL send
   confirmation email to patient and doctor
2. THE Notification_System SHALL send reminder email 15 minutes before
   appointment
3. WHEN doctor status changes, THE Notification_System SHALL send email
   notification to doctor
4. WHEN payment fails, THE Notification_System SHALL send email with retry
   instructions
5. THE Notification_System SHALL use Resend API for email delivery
6. THE Notification_System SHALL include appointment details and action links in
   emails

### Requirement 17: Error Handling

**User Story:** As a user, I want clear error messages and graceful recovery, so
that I can complete my tasks even when issues occur.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Error_System SHALL display user-friendly
   message with retry option
2. WHEN a validation error occurs, THE Error_System SHALL highlight specific
   fields with clear messages
3. WHEN a payment error occurs, THE Error_System SHALL display Stripe error
   message and allow retry
4. WHEN a slot becomes unavailable during booking, THE Error_System SHALL
   refresh slots and notify user
5. IF doctor deactivates during booking, THEN THE Error_System SHALL cancel
   appointment and initiate refund
6. THE Error_System SHALL log all errors for debugging without exposing
   sensitive data to users
7. THE Error_System SHALL maintain form state during errors to prevent data loss

### Requirement 18: Doctor Subscription System

**User Story:** As a platform operator, I want doctors to pay a monthly
subscription to appear in the catalog, so that the platform generates recurring
revenue.

#### Acceptance Criteria

1. THE Subscription_System SHALL require doctors to have an active subscription
   to appear in the public catalog
2. THE Subscription_System SHALL support a 'basic_499' plan at 499 MXN/month
3. WHEN a doctor is approved by admin, THE Subscription_System SHALL prompt for
   subscription setup via Stripe
4. WHEN subscription payment succeeds, THE Subscription_System SHALL create a
   doctor_subscriptions record with status 'active'
5. WHEN subscription payment fails, THE Subscription_System SHALL update status
   to 'past_due' and remove doctor from catalog
6. THE Subscription_System SHALL send reminder emails 7 days and 1 day before
   subscription renewal
7. WHEN subscription is cancelled, THE Subscription_System SHALL update status
   to 'cancelled' and remove doctor from catalog
8. THE Catalog_Query SHALL enforce: status = 'approved' AND subscription.status
   = 'active' for doctor visibility
9. THE Subscription_System SHALL track current_period_start and
   current_period_end for billing cycles
10. THE Subscription_System SHALL support future plan tiers (priority routing,
    unlimited handoffs, branding badge)

### Requirement 19: WhatsApp Doctor System

**User Story:** As a potential patient, I want to interact with Doctory via
WhatsApp for quick triage and consultation booking, so that I can get medical
guidance without downloading an app.

#### Acceptance Criteria

1. THE WhatsApp_System SHALL accept incoming messages from non-registered users
   via Twilio WhatsApp Business API
2. WHEN a new user messages, THE WhatsApp_System SHALL create a
   whatsapp_sessions record with state 'triage'
3. THE WhatsApp_System SHALL conduct AI-powered triage conversation (3-5
   questions about symptoms)
4. THE WhatsApp_System SHALL determine urgency level and recommend:
   book_consultation, refer_pharmacy, or emergency_redirect
5. IF outcome is 'book_consultation', THEN THE WhatsApp_System SHALL send
   booking link with pre-filled triage summary
6. IF outcome is 'refer_pharmacy', THEN THE WhatsApp_System SHALL suggest
   sponsored pharmacy with clear "Patrocinado" label
7. IF outcome is 'emergency_redirect', THEN THE WhatsApp_System SHALL provide
   emergency instructions and nearby hospital information
8. THE WhatsApp_System SHALL link sessions to patient profiles when user
   registers or logs in
9. THE WhatsApp_System SHALL route handoffs to doctors in the WhatsApp routing
   pool (doctors with active subscriptions)
10. THE WhatsApp_System SHALL limit handoffs per doctor based on subscription
    tier (basic: 30/month)
11. THE WhatsApp_System SHALL log all interactions in whatsapp_messages table
    for audit
12. THE WhatsApp_System SHALL display disclaimer: "La IA asiste, no diagnostica"
    in triage flow

### Requirement 20: Pharmacy Sponsorship System

**User Story:** As a platform operator, I want to partner with pharmacies for
sponsored delivery, so that patients get convenient medication access and the
platform generates sponsorship revenue.

#### Acceptance Criteria

1. THE Pharmacy_System SHALL maintain a pharmacy_sponsors table with coverage
   cities and delivery capability
2. THE Pharmacy_System SHALL NOT allow doctors to choose or influence pharmacy
   selection
3. WHEN suggesting a pharmacy, THE Pharmacy_System SHALL clearly label it as
   "Patrocinado" in all interfaces
4. THE Pharmacy_System SHALL match pharmacies based on patient city and delivery
   availability
5. THE Prescription_System SHALL NOT tie prescription validity to any specific
   pharmacy
6. WHEN a sponsored pharmacy is suggested, THE Pharmacy_System SHALL create an
   appointment_sponsorships record with disclosed=true
7. THE Pharmacy_System SHALL track sponsorship type: 'delivery' or 'coupon'
8. THE Pharmacy_System SHALL allow patients to opt-out of pharmacy suggestions
9. THE Pharmacy_System SHALL display pharmacy suggestions only after
   prescription is created, never during consultation
10. THE Audit_System SHALL log all pharmacy sponsorship interactions for
    compliance

### Requirement 21: UI/UX Design System

**User Story:** As a user, I want a calm, clinical, and trustworthy interface,
so that I feel confident using the platform.

#### Acceptance Criteria

1. THE Design_System SHALL use the Doctory brand colors: background #FAFAFA,
   text #2E3238, accent #4A7FB5
2. THE Design_System SHALL use Inter font family with weights 400, 500, 600
3. THE Design_System SHALL use border-radius of 8px or 16px for components
4. THE Design_System SHALL limit accent color usage to maximum 15% of interface
5. THE Design_System SHALL use line icons with uniform stroke and rounded
   corners
6. THE Design_System SHALL provide generous padding and high negative space
7. THE Design_System SHALL display loading states with skeleton components
8. THE Design_System SHALL be fully responsive for mobile, tablet, and desktop
9. THE Design_System SHALL meet WCAG 2.1 AA accessibility standards
