// Second Opinion Domain Module - Shared Types and Constants
// This file contains only types and constants that can be safely imported by client components
// Unified with index.ts — uses assigned_doctor_id, ai_preliminary_summary, file_path

export const SECOND_OPINION_CONFIG = {
  // Pricing in MXN cents
  PRICES: {
    basic: 50000, // 500 MXN - GP review
    specialist: 150000, // 1500 MXN - Specialist review
    panel: 300000, // 3000 MXN - Multi-specialist panel
  },
  // Time limits
  REVIEW_WINDOW_HOURS: 72,
  PRELIMINARY_AI_TIMEOUT_MS: 30000,
  // Doctor requirements
  MIN_DOCTOR_RATING: 4.0,
  MIN_COMPLETED_CONSULTATIONS: 50,
} as const

export type SecondOpinionType = 'basic' | 'specialist' | 'panel'

export type SecondOpinionStatus =
  | 'draft'
  | 'submitted'
  | 'ai_processing'
  | 'pending_review'
  | 'in_review'
  | 'completed'
  | 'expired'
  | 'cancelled'

export type SecondOpinionDocumentType =
  | 'lab_result'
  | 'imaging'
  | 'pathology'
  | 'prescription'
  | 'referral'
  | 'medical_record'
  | 'other'

export interface SecondOpinionRequest {
  id: string
  patient_id: string
  patient_name?: string
  patient_age?: number
  patient_gender?: string
  type: SecondOpinionType
  status: SecondOpinionStatus
  chief_complaint: string
  current_diagnosis?: string
  current_treatment?: string
  medical_history?: string
  allergies?: string
  medications?: string
  questions: string[]
  price_cents: number
  currency: string
  payment_id?: string
  payment_status: string
  ai_preliminary_summary?: string
  ai_suggested_specialty?: string
  ai_urgency_score?: number
  ai_processed_at?: string
  assigned_doctor_id?: string
  assigned_at?: string
  assignment_notes?: string
  doctor_opinion?: string
  doctor_recommendations?: string
  doctor_follow_up_needed?: boolean
  reviewed_at?: string
  created_at: string
  submitted_at?: string
  completed_at?: string
  expires_at?: string
  updated_at: string
}

export interface SecondOpinionDocument {
  id: string
  request_id: string
  type: SecondOpinionDocumentType
  file_name: string
  file_path: string
  mime_type: string
  size_bytes: number
  ai_analysis?: string
  ai_extracted_data?: Record<string, unknown>
  ai_analyzed_at?: string
  uploaded_by: string
  uploaded_at: string
}

export interface SecondOpinionMessage {
  id: string
  request_id: string
  sender_id: string
  sender_role: 'patient' | 'doctor' | 'system'
  content: string
  attachment_url?: string
  created_at: string
}
