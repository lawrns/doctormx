# Design Document: Doctory Telemedicine Platform

## Overview

Doctory is a telemedicine platform built with Next.js 16 App Router, Supabase
(PostgreSQL + Auth + Storage), Stripe for payments, and Jitsi Meet for video
consultations. The platform follows a system-based architecture where each
domain (booking, payment, discovery, availability, auth) is completely
independent in its own file with clear Input → Process → Output patterns.

The design prioritizes:

- **Claridad antes que complejidad**: Self-explanatory code
- **Sistema antes que feature**: Think in systems, not screens
- **Proceso antes que código**: Flow is more important than design
- **Mínimo viable**: Build only what works today

## Architecture

### System Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App Router                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages (src/app/)           │  API Routes (src/app/api/)        │
│  - Server Components        │  - Route Handlers                  │
│  - Client Components        │  - Server-side validation          │
├─────────────────────────────────────────────────────────────────┤
│                    Independent Systems (src/lib/)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ booking  │ │ payment  │ │discovery │ │availability│          │
│  │   .ts    │ │   .ts    │ │   .ts    │ │    .ts    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │  auth    │ │  video   │ │   ai/    │                        │
│  │   .ts    │ │   .ts    │ │ (module) │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│                    AI Module (src/lib/ai/)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ drSimeon.ts  │ │ knowledge.ts │ │  vision.ts   │            │
│  │ (AI Doctor)  │ │ (RAG/Embed)  │ │ (Image AI)   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ copilot.ts   │ │orchestrator.ts│ │ prompts.ts   │            │
│  │ (Clinical)   │ │ (Chat Flow)  │ │ (Templates)  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    Supabase Client Layer                         │
│  ┌──────────────────┐ ┌──────────────────┐                      │
│  │  server.ts       │ │  client.ts       │                      │
│  │  (Server-side)   │ │  (Client-side)   │                      │
│  └──────────────────┘ └──────────────────┘                      │
├─────────────────────────────────────────────────────────────────┤
│                    External Services                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Supabase │ │  Stripe  │ │  Jitsi   │ │  OpenAI  │           │
│  │   DB     │ │ Payments │ │  Video   │ │   AI     │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Pattern

```
User Action → Page/API Route → System Function → Supabase/External → Response
```

Each system file follows:

```typescript
// Input: Clear parameters
// Process: Business logic
// Output: Typed result
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Middleware (src/middleware.ts)              │
│  1. Check if route is public                                     │
│  2. Validate Supabase session                                    │
│  3. Redirect unauthenticated to /auth/login?redirect=...        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Page/API Route                              │
│  Server: requireAuth() or requireRole('doctor')                  │
│  Client: Check currentUser prop, redirect if null                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase RLS                                │
│  Database enforces row-level security as final guard             │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core System Interfaces

```typescript
// src/lib/booking.ts
interface ReservationRequest {
    patientId: string; // From authenticated session, never from body
    doctorId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    preConsultaSummary?: PreConsultaSummary;
}

interface ReservationResult {
    success: boolean;
    appointment?: Appointment;
    error?: string;
}

// src/lib/payment.ts
interface PaymentRequest {
    appointmentId: string;
    patientId: string; // From authenticated session
}

interface PaymentResult {
    success: boolean;
    clientSecret?: string; // Stripe PaymentIntent client secret
    error?: string;
}

interface PaymentConfirmation {
    appointmentId: string;
    paymentIntentId: string;
    status: "succeeded" | "failed";
}

// src/lib/discovery.ts
interface DoctorSearchParams {
    specialty?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
    page?: number;
    limit?: number;
}

interface DoctorSearchResult {
    doctors: DoctorWithProfile[];
    total: number;
    page: number;
    totalPages: number;
}

// src/lib/availability.ts
interface AvailabilityRule {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    slotMinutes: number; // Default 30
    bufferMinutes: number; // Default 0
    active: boolean;
}

interface AvailabilityException {
    startTs: string; // ISO timestamp
    endTs: string; // ISO timestamp
    type: "blocked" | "extra";
    reason?: string;
}

// src/lib/auth.ts
interface AuthResult {
    user: User;
    profile: Profile;
    supabase: SupabaseClient;
}
```

### AI System Interfaces

```typescript
// src/lib/ai/types.ts
interface PreConsultaMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
}

interface PreConsultaSummary {
    chiefComplaint: string;
    symptoms: string[];
    urgencyLevel: "low" | "medium" | "high" | "emergency";
    severityColor: "green" | "yellow" | "orange" | "red";
    suggestedSpecialty: string;
    aiConfidence: number;
    redFlags: string[];
    recommendedAction: "book-appointment" | "seek-emergency" | "self-care";
}

interface ConversationStage {
    stage: "initial" | "followup" | "detailed" | "referral";
    historyLength: number;
}

interface TranscriptionRequest {
    appointmentId: string;
    audioFile: File; // MP3, WAV, M4A, WebM up to 25MB
}

interface TranscriptionResult {
    success: boolean;
    transcript?: string;
    segments?: TranscriptionSegment[];
    summary?: ConsultationSummary;
    error?: string;
}

interface TranscriptionSegment {
    text: string;
    speaker?: "doctor" | "patient";
    timestamp: number;
    confidence?: number;
}

interface ConsultationSummary {
    chiefComplaint: string;
    symptoms: string[];
    diagnosis: string;
    differentialDiagnosis: Array<{
        name: string;
        probability: number;
        reasoning: string;
    }>;
    prescriptions: PrescriptionItem[];
    followUpInstructions: string;
    nextSteps: string[];
}

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface ClinicalCopilotAnalysis {
    soap: SOAPNote;
    diagnosis: Array<{
        name: string;
        probability: number;
        reasoning: string;
    }>;
    suggestions: string[]; // Quick reply suggestions for doctor
}

interface FollowUpSchedule {
    appointmentId: string;
    type: "24h-check" | "7d-progress" | "30d-outcome";
    scheduledFor: string;
    channel: "whatsapp" | "email" | "sms";
    message: string;
    status: "pending" | "sent" | "responded" | "no-response" | "escalated";
}

// Medical Knowledge Base (RAG)
interface MedicalDocument {
    id: string;
    content: string;
    source: string;
    specialty: string;
    embedding: number[];
    metadata: {
        title?: string;
        author?: string;
        year?: number;
        type?: "nom" | "imss" | "issste" | "who" | "cdc" | "uptodate";
        keywords?: string[];
    };
}

interface RetrievedContext {
    documents: MedicalDocument[];
    relevanceScores: number[];
    totalResults: number;
    query: string;
}

// Medical Image Analysis
interface MedicalImageAnalysis {
    imageType:
        | "xray"
        | "ct"
        | "mri"
        | "ultrasound"
        | "lab_result"
        | "skin"
        | "general";
    findings: string[];
    confidence: number; // 0-100
    recommendations: string[];
    urgency: "low" | "medium" | "high" | "critical";
    disclaimer: string;
}

interface VisionAnalysisRequest {
    imageBase64: string;
    imageType: string;
    patientAge?: number;
    patientGender?: string;
    symptoms?: string;
    medicalHistory?: string;
}

// OTC Medication Recommendations
interface OTCRecommendation {
    category: string;
    product: string;
    dosage: string;
    frequency: string;
    duration: string;
    purpose: string;
    warnings: string[];
    contraindications: string[];
}
```

### UI Component Interfaces

```typescript
// Reusable components
interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

interface ButtonProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

interface InputProps {
    label: string;
    type?: "text" | "email" | "password" | "number" | "date" | "time";
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
}

interface SelectProps {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

interface ToastProps {
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
}
```

## Data Models

### Database Schema (Supabase PostgreSQL)

```sql
-- Core Enums
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE doctor_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE appointment_status AS ENUM (
  'pending_payment', 'confirmed', 'cancelled', 
  'completed', 'no_show', 'refunded'
);
CREATE TYPE payment_status AS ENUM (
  'requires_action', 'pending', 'paid', 'failed', 'refunded'
);
CREATE TYPE document_type AS ENUM ('license', 'id', 'certificate', 'tax_id');

-- Profiles (extends auth.users)
profiles (
  id: UUID PRIMARY KEY REFERENCES auth.users(id),
  role: user_role NOT NULL DEFAULT 'patient',
  full_name: TEXT NOT NULL,
  phone: TEXT,
  photo_url: TEXT,
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
)

-- Doctors
doctors (
  id: UUID PRIMARY KEY REFERENCES profiles(id),
  status: doctor_status NOT NULL DEFAULT 'pending',
  bio: TEXT,
  languages: TEXT[] DEFAULT ['es'],
  license_number: TEXT,
  years_experience: INTEGER,
  city: TEXT,
  state: TEXT,
  country: TEXT DEFAULT 'MX',
  price_cents: INTEGER NOT NULL,
  currency: TEXT DEFAULT 'MXN',
  video_enabled: BOOLEAN DEFAULT false,
  accepts_insurance: BOOLEAN DEFAULT false,
  rating_avg: NUMERIC(3,2) DEFAULT 0,
  rating_count: INTEGER DEFAULT 0,
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
)

-- Specialties
specialties (
  id: UUID PRIMARY KEY,
  name: TEXT NOT NULL UNIQUE,
  slug: TEXT NOT NULL UNIQUE,
  description: TEXT,
  icon: TEXT
)

-- Doctor Specialties (many-to-many)
doctor_specialties (
  doctor_id: UUID REFERENCES doctors(id),
  specialty_id: UUID REFERENCES specialties(id),
  PRIMARY KEY (doctor_id, specialty_id)
)

-- Doctor Verification Documents
doctor_verification_documents (
  id: UUID PRIMARY KEY,
  doctor_id: UUID REFERENCES doctors(id),
  type: document_type NOT NULL,
  storage_path: TEXT NOT NULL,
  status: TEXT DEFAULT 'pending',
  review_notes: TEXT,
  reviewed_by: UUID REFERENCES profiles(id),
  reviewed_at: TIMESTAMPTZ,
  created_at: TIMESTAMPTZ
)

-- Availability Rules
availability_rules (
  id: UUID PRIMARY KEY,
  doctor_id: UUID REFERENCES doctors(id),
  day_of_week: INTEGER CHECK (0-6),
  start_time: TIME NOT NULL,
  end_time: TIME NOT NULL,
  slot_minutes: INTEGER DEFAULT 30,
  buffer_minutes: INTEGER DEFAULT 0,
  active: BOOLEAN DEFAULT true,
  UNIQUE (doctor_id, day_of_week, start_time)
)

-- Availability Exceptions
availability_exceptions (
  id: UUID PRIMARY KEY,
  doctor_id: UUID REFERENCES doctors(id),
  start_ts: TIMESTAMPTZ NOT NULL,
  end_ts: TIMESTAMPTZ NOT NULL,
  type: exception_type NOT NULL,
  reason: TEXT
)

-- Appointments
appointments (
  id: UUID PRIMARY KEY,
  patient_id: UUID REFERENCES profiles(id),
  doctor_id: UUID REFERENCES doctors(id),
  service_id: UUID REFERENCES doctor_services(id),
  start_ts: TIMESTAMPTZ NOT NULL,
  end_ts: TIMESTAMPTZ NOT NULL,
  status: appointment_status DEFAULT 'pending_payment',
  cancellation_reason: TEXT,
  cancelled_by: UUID REFERENCES profiles(id),
  cancelled_at: TIMESTAMPTZ,
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
)

-- Payments
payments (
  id: UUID PRIMARY KEY,
  appointment_id: UUID REFERENCES appointments(id),
  provider: payment_provider NOT NULL,
  provider_ref: TEXT NOT NULL,
  amount_cents: INTEGER NOT NULL,
  currency: TEXT DEFAULT 'MXN',
  status: payment_status DEFAULT 'pending',
  fee_cents: INTEGER DEFAULT 0,
  net_cents: INTEGER NOT NULL,
  metadata: JSONB DEFAULT '{}',
  UNIQUE (provider, provider_ref)
)

-- Prescriptions
prescriptions (
  id: UUID PRIMARY KEY,
  appointment_id: UUID REFERENCES appointments(id),
  data_json: JSONB NOT NULL,
  pdf_path: TEXT,
  created_by: UUID REFERENCES profiles(id),
  created_at: TIMESTAMPTZ
)

-- Reviews
reviews (
  id: UUID PRIMARY KEY,
  appointment_id: UUID REFERENCES appointments(id) UNIQUE,
  patient_id: UUID REFERENCES profiles(id),
  doctor_id: UUID REFERENCES doctors(id),
  rating: INTEGER CHECK (1-5),
  comment: TEXT,
  created_at: TIMESTAMPTZ
)

-- AI Tables
pre_consulta_sessions (
  id: UUID PRIMARY KEY,
  patient_id: UUID REFERENCES profiles(id),
  doctor_id: UUID REFERENCES doctors(id),
  specialty: TEXT,
  messages: JSONB DEFAULT '[]',
  summary: JSONB,
  status: TEXT DEFAULT 'active',
  created_at: TIMESTAMPTZ,
  completed_at: TIMESTAMPTZ
)

consultation_transcripts (
  id: UUID PRIMARY KEY,
  appointment_id: UUID REFERENCES appointments(id) UNIQUE,
  audio_url: TEXT NOT NULL,
  segments: JSONB DEFAULT '[]',
  summary: JSONB,
  status: TEXT DEFAULT 'pending',
  metadata: JSONB,
  created_at: TIMESTAMPTZ,
  processed_at: TIMESTAMPTZ
)

follow_up_schedules (
  id: UUID PRIMARY KEY,
  appointment_id: UUID REFERENCES appointments(id),
  patient_id: UUID REFERENCES profiles(id),
  type: TEXT CHECK ('24h-check', '7d-progress', '30d-outcome'),
  scheduled_for: TIMESTAMPTZ NOT NULL,
  status: TEXT DEFAULT 'pending',
  channel: TEXT DEFAULT 'whatsapp',
  message: TEXT NOT NULL,
  response: TEXT,
  responded_at: TIMESTAMPTZ,
  UNIQUE (appointment_id, type)
)

ai_audit_logs (
  id: UUID PRIMARY KEY,
  operation: TEXT NOT NULL,
  user_id: UUID REFERENCES profiles(id),
  user_type: TEXT NOT NULL,
  input: JSONB NOT NULL,
  output: JSONB NOT NULL,
  model: TEXT NOT NULL,
  tokens: INTEGER,
  cost: NUMERIC(10,6),
  latency_ms: INTEGER NOT NULL,
  status: TEXT NOT NULL,
  error: TEXT,
  timestamp: TIMESTAMPTZ DEFAULT now()
)

-- Medical Knowledge Base (RAG)
medical_knowledge (
  id: UUID PRIMARY KEY,
  content: TEXT NOT NULL,
  source: TEXT NOT NULL,
  specialty: TEXT NOT NULL,
  embedding: vector(1536), -- OpenAI text-embedding-3-small
  metadata: JSONB DEFAULT '{}',
  created_at: TIMESTAMPTZ DEFAULT now(),
  updated_at: TIMESTAMPTZ DEFAULT now()
)

-- Index for vector similarity search
CREATE INDEX idx_medical_knowledge_embedding ON medical_knowledge 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### TypeScript Types

```typescript
// src/types/index.ts
export type UserRole = "patient" | "doctor" | "admin";
export type DoctorStatus = "pending" | "approved" | "suspended";
export type AppointmentStatus =
    | "pending_payment"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "no_show"
    | "refunded";
export type PaymentStatus =
    | "requires_action"
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    phone?: string;
    photo_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Doctor {
    id: string;
    status: DoctorStatus;
    bio?: string;
    languages: string[];
    license_number?: string;
    years_experience?: number;
    city?: string;
    state?: string;
    country: string;
    price_cents: number;
    currency: string;
    video_enabled: boolean;
    accepts_insurance: boolean;
    rating_avg: number;
    rating_count: number;
    profile?: Profile;
    specialties?: Specialty[];
}

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    service_id?: string;
    start_ts: string;
    end_ts: string;
    status: AppointmentStatus;
    cancellation_reason?: string;
    cancelled_by?: string;
    cancelled_at?: string;
    doctor?: Doctor;
    patient?: Profile;
}

export interface Payment {
    id: string;
    appointment_id: string;
    provider: "stripe" | "openpay" | "mercadopago";
    provider_ref: string;
    amount_cents: number;
    currency: string;
    status: PaymentStatus;
    fee_cents: number;
    net_cents: number;
    metadata: Record<string, unknown>;
}

export interface Prescription {
    id: string;
    appointment_id: string;
    data_json: {
        diagnosis: string;
        medications: {
            name: string;
            dosage: string;
            frequency: string;
            duration: string;
        }[];
        instructions: string;
        follow_up_date?: string;
    };
    pdf_path?: string;
    created_by: string;
    created_at: string;
}

export interface Review {
    id: string;
    appointment_id: string;
    patient_id: string;
    doctor_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}
```

### Subscription System Interfaces

```typescript
// src/lib/subscription.ts
type SubscriptionStatus = "active" | "past_due" | "paused" | "cancelled";
type SubscriptionPlan = "basic_499" | "premium_999" | "enterprise";

interface DoctorSubscription {
    id: string;
    doctorId: string;
    plan: SubscriptionPlan;
    amountCents: number;
    currency: string;
    provider: "stripe";
    providerSubscriptionId: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    handoffsUsed: number;
    handoffsLimit: number;
    createdAt: string;
    updatedAt: string;
}

interface SubscriptionCreateRequest {
    doctorId: string;
    plan: SubscriptionPlan;
    paymentMethodId: string;
}

interface SubscriptionResult {
    success: boolean;
    subscription?: DoctorSubscription;
    clientSecret?: string; // For 3D Secure
    error?: string;
}
```

### WhatsApp Doctor System Interfaces

```typescript
// src/lib/whatsapp.ts
type WhatsAppSessionState = "triage" | "handoff" | "consult" | "closed";
type WhatsAppOutcome =
    | "book_consultation"
    | "refer_pharmacy"
    | "emergency_redirect";

interface WhatsAppSession {
    id: string;
    phone: string;
    state: WhatsAppSessionState;
    linkedPatientId?: string;
    linkedDoctorId?: string;
    triageSummary?: PreConsultaSummary;
    outcome?: WhatsAppOutcome;
    createdAt: string;
    updatedAt: string;
}

interface WhatsAppMessage {
    id: string;
    sessionId: string;
    role: "user" | "system" | "assistant";
    content: string;
    timestamp: string;
}

interface WhatsAppHandoff {
    sessionId: string;
    doctorId: string;
    outcome: WhatsAppOutcome;
    bookingUrl?: string;
    pharmacySuggestion?: PharmacySuggestion;
}

interface PharmacySuggestion {
    pharmacyId: string;
    name: string;
    deliveryAvailable: boolean;
    sponsored: boolean; // Always true for suggestions
    disclosureText: string; // "Patrocinado"
}
```

### Pharmacy Sponsorship System Interfaces

```typescript
// src/lib/pharmacy.ts
interface PharmacySponsor {
    id: string;
    name: string;
    coverageCities: string[];
    deliveryEnabled: boolean;
    active: boolean;
    monthlyFeeCents: number;
    createdAt: string;
}

interface AppointmentSponsorship {
    id: string;
    appointmentId: string;
    pharmacyId: string;
    type: "delivery" | "coupon";
    disclosed: boolean; // Must always be true
    patientOptedOut: boolean;
    createdAt: string;
}

interface PharmacyMatchRequest {
    patientCity: string;
    prescriptionId: string;
}

interface PharmacyMatchResult {
    success: boolean;
    pharmacy?: PharmacySponsor;
    disclosureRequired: boolean; // Always true
    error?: string;
}
```

### Additional Database Tables (Monetization)

```sql
-- Subscription Status Enum
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'paused', 'cancelled');

-- Doctor Subscriptions (REQUIRED for catalog visibility)
doctor_subscriptions (
  id: UUID PRIMARY KEY,
  doctor_id: UUID REFERENCES doctors(id) UNIQUE,
  plan: TEXT NOT NULL DEFAULT 'basic_499',
  amount_cents: INTEGER NOT NULL DEFAULT 49900,
  currency: TEXT DEFAULT 'MXN',
  provider: TEXT NOT NULL DEFAULT 'stripe',
  provider_subscription_id: TEXT,
  status: subscription_status DEFAULT 'active',
  current_period_start: TIMESTAMPTZ,
  current_period_end: TIMESTAMPTZ,
  handoffs_used: INTEGER DEFAULT 0,
  handoffs_limit: INTEGER DEFAULT 30,
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
)

-- WhatsApp Sessions
whatsapp_sessions (
  id: UUID PRIMARY KEY,
  phone: TEXT NOT NULL,
  state: TEXT NOT NULL DEFAULT 'triage',
  linked_patient_id: UUID REFERENCES profiles(id),
  linked_doctor_id: UUID REFERENCES doctors(id),
  triage_summary: JSONB,
  outcome: TEXT,
  created_at: TIMESTAMPTZ,
  updated_at: TIMESTAMPTZ
)

-- WhatsApp Messages (audit trail)
whatsapp_messages (
  id: UUID PRIMARY KEY,
  session_id: UUID REFERENCES whatsapp_sessions(id),
  role: TEXT NOT NULL,
  content: TEXT NOT NULL,
  timestamp: TIMESTAMPTZ DEFAULT now()
)

-- Pharmacy Sponsors
pharmacy_sponsors (
  id: UUID PRIMARY KEY,
  name: TEXT NOT NULL,
  coverage_cities: TEXT[],
  delivery_enabled: BOOLEAN DEFAULT true,
  active: BOOLEAN DEFAULT true,
  monthly_fee_cents: INTEGER,
  created_at: TIMESTAMPTZ
)

-- Appointment Sponsorships (tracks pharmacy suggestions)
appointment_sponsorships (
  id: UUID PRIMARY KEY,
  appointment_id: UUID REFERENCES appointments(id),
  pharmacy_id: UUID REFERENCES pharmacy_sponsors(id),
  type: TEXT CHECK (type IN ('delivery', 'coupon')),
  disclosed: BOOLEAN DEFAULT true,  -- MUST always be true
  patient_opted_out: BOOLEAN DEFAULT false,
  created_at: TIMESTAMPTZ
)

-- Index for catalog query enforcement
CREATE INDEX idx_doctors_catalog ON doctors(status) 
  WHERE status = 'approved';

-- Catalog visibility query (CRITICAL: enforces subscription requirement)
-- SELECT d.* FROM doctors d
-- JOIN doctor_subscriptions s ON d.id = s.doctor_id
-- WHERE d.status = 'approved' AND s.status = 'active'
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all
valid executions of a system—essentially, a formal statement about what the
system should do. Properties serve as the bridge between human-readable
specifications and machine-verifiable correctness guarantees._

### Property 1: Catalog Visibility Enforcement

_For any_ doctor query to the public catalog, the result SHALL only include
doctors where status = 'approved' AND subscription.status = 'active'. No doctor
without both conditions met shall ever appear in public search results.

**Validates: Requirements 1.1, 18.1, 18.8**

### Property 2: Search Filter Correctness

_For any_ search query with filters (specialty, price range, city), all returned
doctors SHALL match ALL specified filter criteria. The result set size shall be
less than or equal to the unfiltered set.

**Validates: Requirements 1.4**

### Property 3: Slot Availability Consistency

_For any_ date and doctor, the generated available slots SHALL be derived from
availability_rules minus existing appointments minus availability_exceptions of
type 'blocked', plus availability_exceptions of type 'extra'.

**Validates: Requirements 2.1, 8.6**

### Property 4: Authentication Redirect Preservation

_For any_ unauthenticated user attempting to access a protected route, the
redirect to /auth/login SHALL include a redirect parameter that, when followed
after successful authentication, returns the user to their original destination
with all query parameters preserved.

**Validates: Requirements 2.3, 15.3**

### Property 5: Booking Security - Session-Only Patient ID

_For any_ appointment creation request, the patient_id used SHALL be obtained
exclusively from the authenticated server-side session. Any patient_id provided
in the request body SHALL be ignored.

**Validates: Requirements 2.7, 15.6**

### Property 6: Slot Double-Booking Prevention

_For any_ two concurrent booking attempts for the same doctor and time slot, at
most one SHALL succeed. The second attempt SHALL receive an error indicating the
slot is no longer available.

**Validates: Requirements 2.4, 2.5**

### Property 7: Payment State Consistency

_For any_ successful payment, the system SHALL atomically: (1) update
appointment status to 'confirmed', (2) create a payment record with correct
amount and provider_ref. Both operations succeed or both fail.

**Validates: Requirements 3.3, 3.4**

### Property 8: Payment Failure Slot Release

_For any_ failed payment attempt, the associated appointment slot SHALL be
released (appointment deleted or status reset) within the payment timeout
window, making it available for other patients.

**Validates: Requirements 3.6**

### Property 9: Consultation Access Authorization

_For any_ consultation room access attempt, the system SHALL verify that the
requesting user is either the patient_id or doctor_id of the appointment. All
other users SHALL be denied access.

**Validates: Requirements 4.1, 15.4**

### Property 10: Time-Based Button State

_For any_ appointment and current time, the "join consultation" button state
SHALL be: enabled if (appointment.start_ts - current_time) <= 10 minutes AND
appointment.status = 'confirmed', disabled otherwise.

**Validates: Requirements 4.4, 4.5, 9.3**

### Property 11: Video Room Consistency

_For any_ appointment, the video room URL generated for the patient SHALL be
identical to the URL generated for the doctor. Both parties SHALL join the same
room.

**Validates: Requirements 4.6, 9.4**

### Property 12: Doctor Registration Initial State

_For any_ successful doctor registration, the created doctor record SHALL have
status = 'pending' and no subscription record. The doctor SHALL NOT appear in
the public catalog.

**Validates: Requirements 5.4, 18.1**

### Property 13: Onboarding Validation Completeness

_For any_ onboarding form submission, the system SHALL reject submissions where
any required field (license_number, bio, price_cents, at least one availability
slot) is missing or invalid.

**Validates: Requirements 6.5, 6.8, 6.9**

### Property 14: Admin Rejection Requires Reason

_For any_ admin rejection action, the system SHALL require a non-empty rejection
reason. Rejection attempts with empty reason SHALL be prevented.

**Validates: Requirements 7.5, 7.6**

### Property 15: Approval Triggers Subscription Prompt

_For any_ doctor status change from 'pending' to 'approved', the system SHALL
prompt the doctor to set up a subscription before appearing in the catalog.

**Validates: Requirements 7.4, 18.3**

### Property 16: Consultation Completion Effects

_For any_ appointment marked as 'completed', the system SHALL create exactly
three follow_up_schedules records with types '24h-check', '7d-progress', and
'30d-outcome' with correct scheduled_for timestamps.

**Validates: Requirements 9.6, 9.7, 14.1**

### Property 17: Rating Calculation Correctness

_For any_ doctor with reviews, rating_avg SHALL equal the arithmetic mean of all
review ratings, and rating_count SHALL equal the count of reviews. Adding a new
review SHALL update both values correctly.

**Validates: Requirements 11.4**

### Property 18: Review Uniqueness

_For any_ appointment, at most one review record SHALL exist. Attempts to create
a second review for the same appointment SHALL be rejected.

**Validates: Requirements 11.5**

### Property 19: Pre-Consulta Audit Trail

_For any_ pre-consulta session, all messages and the final summary SHALL be
stored in pre_consulta_sessions, and an ai_audit_logs entry SHALL be created
with operation = 'pre-consulta'.

**Validates: Requirements 12.6, 12.8**

### Property 20: Transcription File Validation

_For any_ transcription upload, the system SHALL accept only files with
extensions MP3, WAV, M4A, or WebM and size <= 25MB. All other files SHALL be
rejected with appropriate error.

**Validates: Requirements 13.2**

### Property 21: Subscription Status Catalog Effect

_For any_ subscription status change to 'past_due' or 'cancelled', the
associated doctor SHALL immediately stop appearing in public catalog queries.

**Validates: Requirements 18.5, 18.7, 18.8**

### Property 22: WhatsApp Handoff Limit Enforcement

_For any_ doctor with subscription plan 'basic_499', the system SHALL track
handoffs_used and prevent new handoffs when handoffs_used >= handoffs_limit
(30).

**Validates: Requirements 19.10**

### Property 23: Pharmacy Sponsorship Disclosure

_For any_ pharmacy suggestion displayed to a user, the disclosed field SHALL be
true and the UI SHALL display "Patrocinado" label. Suggestions without
disclosure SHALL NOT be shown.

**Validates: Requirements 20.3, 20.6**

### Property 24: Pharmacy Independence from Prescription

_For any_ prescription, the prescription validity SHALL NOT depend on any
pharmacy selection. Prescriptions SHALL be valid at any pharmacy.

**Validates: Requirements 20.5**

### Property 25: Role-Based Route Access

_For any_ authenticated user, accessing a route outside their role's allowed
routes SHALL redirect them to their role's dashboard (/app for patient, /doctor
for doctor, /admin for admin).

**Validates: Requirements 15.4**

### Property 26: Pre-Consulta Red Flag Detection

_For any_ pre-consulta conversation containing critical symptoms (chest pain +
sweating, sudden weakness, severe breathing difficulty, pregnancy + bleeding),
the system SHALL classify urgency as 'emergency' or 'red' and recommend
immediate emergency action.

**Validates: Requirements 12.6, 12.7**

### Property 27: Pre-Consulta Conversation Stage Progression

_For any_ pre-consulta session, the conversation stage SHALL progress from
'initial' → 'followup' → 'detailed' → 'referral' based on message count and
content, never skipping stages or regressing.

**Validates: Requirements 12.4**

### Property 28: Medical Knowledge Retrieval Relevance

_For any_ symptom query to the medical knowledge base, the retrieved documents
SHALL have relevance scores > 0.5 and SHALL prioritize Mexican guidelines (NOM,
IMSS, ISSSTE) over international sources.

**Validates: Requirements 23.6, 23.7**

### Property 29: OTC Recommendation Safety

_For any_ medication recommendation generated by the AI, the medication SHALL be
from the approved OTC list and SHALL NOT include any prescription-only
medications (antibiotics, antihypertensives, psychotropics, opioids, etc.).

**Validates: Requirements 25.5**

### Property 30: Medical Image Analysis Disclaimer

_For any_ medical image analysis result, the response SHALL include a disclaimer
stating it is not a definitive diagnosis and SHALL recommend specialist
consultation.

**Validates: Requirements 24.5, 24.8**

### Property 31: Clinical Copilot SOAP Completeness

_For any_ clinical copilot analysis of a consultation, the generated SOAP note
SHALL contain non-empty values for all four sections (Subjective, Objective,
Assessment, Plan).

**Validates: Requirements 22.2**

### Property 32: AI Audit Log Completeness

_For any_ AI operation (pre-consulta, transcription, vision, copilot), an
ai_audit_logs entry SHALL be created with operation type, user_id, input,
output, model, tokens, cost, latency_ms, and status.

**Validates: Requirements 12.11, 13.9, 22.7, 24.7**

## Error Handling

### Error Categories and Responses

| Category                | HTTP Status | User Message                                | System Action                           |
| ----------------------- | ----------- | ------------------------------------------- | --------------------------------------- |
| Authentication Required | 401         | "Inicia sesión para continuar"              | Redirect to /auth/login with return URL |
| Authorization Denied    | 403         | "No tienes permiso para esta acción"        | Log attempt, redirect to dashboard      |
| Resource Not Found      | 404         | "No encontramos lo que buscas"              | Show 404 page with navigation           |
| Validation Error        | 400         | Field-specific messages                     | Highlight fields, preserve form state   |
| Slot Unavailable        | 409         | "Este horario ya no está disponible"        | Refresh slots, show alternatives        |
| Payment Failed          | 402         | Stripe error message                        | Allow retry, preserve appointment       |
| Rate Limited            | 429         | "Demasiadas solicitudes, espera un momento" | Exponential backoff                     |
| Server Error            | 500         | "Algo salió mal, intenta de nuevo"          | Log error, show retry option            |

### Error Handling Patterns

```typescript
// API Route Error Handler
async function handleApiError(error: unknown): Promise<NextResponse> {
    if (error instanceof ValidationError) {
        return NextResponse.json(
            { error: error.message, fields: error.fields },
            { status: 400 },
        );
    }

    if (error instanceof AuthenticationError) {
        return NextResponse.json(
            { error: "Unauthorized", redirect: "/auth/login" },
            { status: 401 },
        );
    }

    // Log unexpected errors, return generic message
    console.error("Unexpected error:", error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
    );
}

// Client-side Error Boundary
function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="error-container">
            <h2>Algo salió mal</h2>
            <p>{error.message}</p>
            <button onClick={reset}>Intentar de nuevo</button>
        </div>
    );
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit tests for specific examples and edge cases
with property-based tests for universal correctness guarantees.

### Unit Tests

- Test specific examples that demonstrate correct behavior
- Test edge cases (empty inputs, boundary values, null handling)
- Test error conditions and error messages
- Test integration points between components

### Property-Based Tests

- Use fast-check library for TypeScript property-based testing
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: doctory-telemedicine-platform, Property {number}:
  {property_text}**

### Test Categories

| Category                | Type     | Coverage                  |
| ----------------------- | -------- | ------------------------- |
| Catalog Visibility      | Property | Properties 1, 21          |
| Search Filtering        | Property | Property 2                |
| Slot Generation         | Property | Property 3                |
| Authentication          | Property | Properties 4, 5, 25       |
| Booking Race Conditions | Property | Property 6                |
| Payment Flow            | Property | Properties 7, 8           |
| Consultation Access     | Property | Properties 9, 10, 11      |
| Doctor Onboarding       | Property | Properties 12, 13, 14, 15 |
| Consultation Completion | Property | Property 16               |
| Reviews                 | Property | Properties 17, 18         |
| AI Pre-Consulta         | Property | Properties 19, 26, 27     |
| AI Transcription        | Property | Property 20               |
| Subscriptions           | Property | Properties 21, 22         |
| Pharmacy                | Property | Properties 23, 24         |
| Medical Knowledge Base  | Property | Property 28               |
| OTC Recommendations     | Property | Property 29               |
| Medical Image Analysis  | Property | Property 30               |
| Clinical Copilot        | Property | Property 31               |
| AI Audit Logging        | Property | Property 32               |

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["**/*.test.ts", "**/*.property.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", ".next/"],
        },
    },
});

// Property test example
import * as fc from "fast-check";

describe("Property 1: Catalog Visibility Enforcement", () => {
    it("only returns approved doctors with active subscriptions", () => {
        fc.assert(
            fc.property(
                fc.array(arbitraryDoctor()),
                (doctors) => {
                    const catalogResults = filterForCatalog(doctors);
                    return catalogResults.every(
                        (d) =>
                            d.status === "approved" &&
                            d.subscription?.status === "active",
                    );
                },
            ),
            { numRuns: 100 },
        );
    });
});
```
