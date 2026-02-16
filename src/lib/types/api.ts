/**
 * Shared TypeScript types for API routes
 * Common interfaces and types used across the codebase
 */

import { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// Supabase Types
// =============================================================================

export type SupabaseClientType = SupabaseClient;

// =============================================================================
// Doctor Types
// =============================================================================

export interface DoctorProfile {
  id: string;
  full_name: string;
  photo_url: string | null;
}

export interface DoctorSpecialty {
  id: string;
  name_es: string;
}

export interface DoctorSubscription {
  current_period_end: string;
  status: string;
}

export interface DoctorWithDetails {
  id: string;
  price_cents: number;
  rating_avg: number | null;
  rating_count: number;
  years_experience: number;
  city: string;
  state: string;
  status: string;
  profiles: DoctorProfile | DoctorProfile[];
  doctor_specialties: DoctorSpecialtyItem[];
  doctor_subscriptions: DoctorSubscription[];
}

export interface DoctorSpecialtyItem {
  specialties: DoctorSpecialty | DoctorSpecialty[];
}

export interface RecommendedDoctor {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  priceCents: number;
  city: string;
  state: string;
  nextAvailable: string | null;
  videoConsultation: boolean;
  verified: boolean;
}

// =============================================================================
// Appointment Types
// =============================================================================

export interface AppointmentWithPatient {
  id: string;
  doctor_id: string;
  patient_id: string;
  start_ts: string;
  status: string;
  price_cents: number | null;
  currency: string | null;
  patient?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface DoctorRecord {
  id: string;
  specialty: string | null;
  price_cents: number | null;
  currency: string | null;
  rating: number | null;
}

export interface AppointmentRecord {
  id: string;
  doctor_id: string;
  patient_id: string;
  start_ts: string;
  status: string;
  price_cents: number | null;
  currency: string | null;
}

export interface EnrichedAppointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  start_ts: string;
  status: string;
  price_cents: number | null;
  currency: string | null;
  doctor: {
    id: string;
    specialty: string | null;
    price_cents: number | null;
    currency: string | null;
    rating: number | null;
    profile: {
      id: string;
      full_name: string;
      photo_url: string | null;
    } | null;
  } | null;
}

// =============================================================================
// AI Referral Types
// =============================================================================

export interface AIReferralAnalytics {
  id: string;
  session_id: string;
  specialty: string;
  urgency: string;
  avg_score: number;
  doctores_available: number;
  doctores_matched: number;
  timestamp: string;
}

export interface AnalyticsBySpecialty {
  [specialty: string]: {
    count: number;
    avgScore: number;
  };
}

export interface AnalyticsByUrgency {
  [urgency: string]: {
    count: number;
    avgScore: number;
  };
}

export interface AnalyticsStats {
  total: number;
  avgScore: number;
  avgDoctorsAvailable: number;
  avgDoctorsMatched: number;
  bySpecialty: AnalyticsBySpecialty;
  byUrgency: AnalyticsByUrgency;
}

// =============================================================================
// Doctor Referral Types
// =============================================================================

export interface AIDoctorReferral {
  id: string;
  doctor_id: string;
  status: string;
  referral_context?: {
    specialty?: string;
  };
  created_at: string;
}

export interface SpecialtyCounts {
  [specialty: string]: number;
}

export interface TopSpecialty {
  specialty: string;
  count: number;
}

export interface WeeklyTrendItem {
  week: string;
  referrals: number;
}

// =============================================================================
// Pre-Consulta Types
// =============================================================================

export interface PreConsultaReferral {
  id: string;
  name: string;
  specialty: string;
  availability: string;
  nextAvailable: string;
}

// =============================================================================
// WhatsApp Types
// =============================================================================

export interface WhatsAppMessage {
  id: string;
  from: string;
  type: 'text' | 'image' | 'document' | 'audio';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    caption?: string;
  };
  document?: {
    id: string;
    caption?: string;
  };
  audio?: {
    id: string;
  };
}

export interface WhatsAppStatusUpdate {
  id: string;
  recipient_id: string;
  status: string;
  timestamp: number;
}

// =============================================================================
// Stripe Types
// =============================================================================

export interface StripeSubscriptionMetadata {
  doctor_id?: string;
}

export interface StripeSubscriptionWithMetadata {
  id: string;
  metadata: StripeSubscriptionMetadata;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  status: string;
}

export interface StripeInvoiceWithSubscription {
  id: string;
  subscription: string | null;
  amount_due: number;
}

// =============================================================================
// Questionnaire Types
// =============================================================================

export interface QuestionnaireRequestBody {
  conversationId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Pharmacy Types
// =============================================================================

export interface PharmacySearchResult {
  query: string;
  results: Array<unknown>;
  total: number;
  searchTimeMs: number;
  pharmacies: string[];
}

export interface CachedResult<T = unknown> {
  data: T;
  timestamp: number;
}

// =============================================================================
// AI Consult Types
// =============================================================================

export interface UrgencyLevel {
  emergency: string;
  urgent: string;
  moderate: string;
  routine: string;
  'self-care': string;
}

export type UrgencyLevelType = keyof UrgencyLevel;

// =============================================================================
// Consultation Analysis Types
// =============================================================================

export interface SpecialistAnalysisResult {
  id: string;
  name: string;
  specialty: string;
  primaryDiagnosis: string;
  confidence: number;
  assessment: string;
  differentialDiagnoses: string[];
  recommendations: string[];
  urgency: string;
}

export interface MultiSpecialistAnalysisResult {
  id: string;
  primaryDiagnosis: string;
  confidence: number;
  specialists: SpecialistAnalysisResult[];
  differentialDiagnoses: string[];
  urgency: string;
  recommendations: string[];
  nextSteps: string[];
  consensus: {
    kendallW: number;
    agreementLevel: string;
    primaryDiagnosis: string | null;
    differentialDiagnoses: string[];
    consensusCategory: string;
    urgencyLevel: string;
    combinedRedFlags: string[];
    recommendedSpecialty: string | null;
    recommendedTests: string[];
    supervisorSummary: string;
    confidenceScore: number;
    requiresHumanReview: boolean;
  };
}

