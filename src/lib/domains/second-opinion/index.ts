// Second Opinion Domain Module
// Input: Patient case data, medical documents
// Process: AI triage → Doctor matching → Review → Delivery
// Output: Validated second opinion with doctor sign-off

import { createServiceClient } from '@/lib/supabase/server'

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
  message: string
  attachments: string[]
  read_at?: string
  created_at: string
}

export interface CreateSecondOpinionInput {
  patient_id: string
  type: SecondOpinionType
  chief_complaint: string
  current_diagnosis?: string
  current_treatment?: string
  medical_history?: string
  allergies?: string
  medications?: string
  questions?: string[]
}

/**
 * Create a new second opinion request (draft status)
 */
export async function createSecondOpinionRequest(
  input: CreateSecondOpinionInput
): Promise<{ id: string }> {
  const supabase = await createServiceClient()
  
  const price_cents = SECOND_OPINION_CONFIG.PRICES[input.type]
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + SECOND_OPINION_CONFIG.REVIEW_WINDOW_HOURS)
  
  const { data, error } = await supabase
    .from('second_opinion_requests')
    .insert({
      patient_id: input.patient_id,
      type: input.type,
      status: 'draft',
      chief_complaint: input.chief_complaint,
      current_diagnosis: input.current_diagnosis,
      current_treatment: input.current_treatment,
      medical_history: input.medical_history,
      allergies: input.allergies,
      medications: input.medications,
      questions: input.questions || [],
      price_cents,
      currency: 'MXN',
      payment_status: 'pending',
      expires_at: expires_at.toISOString(),
    })
    .select('id')
    .single()
  
  if (error) {
    throw new Error(`Failed to create second opinion request: ${error.message}`)
  }
  
  return { id: data.id }
}

/**
 * Submit a second opinion request for review (after payment)
 */
export async function submitSecondOpinionRequest(
  requestId: string,
  paymentId: string
): Promise<void> {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('second_opinion_requests')
    .update({
      status: 'submitted',
      payment_id: paymentId,
      payment_status: 'paid',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'draft')
  
  if (error) {
    throw new Error(`Failed to submit request: ${error.message}`)
  }
}

/**
 * Assign a doctor to review a request
 */
export async function assignDoctorToRequest(
  requestId: string,
  doctorId: string,
  notes?: string
): Promise<void> {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('second_opinion_requests')
    .update({
      assigned_doctor_id: doctorId,
      assigned_at: new Date().toISOString(),
      assignment_notes: notes,
      status: 'pending_review',
    })
    .eq('id', requestId)
    .in('status', ['submitted', 'ai_processing'])
  
  if (error) {
    throw new Error(`Failed to assign doctor: ${error.message}`)
  }
}

/**
 * Submit doctor's opinion for a request
 */
export async function submitDoctorOpinion(
  requestId: string,
  doctorId: string,
  opinion: string,
  recommendations?: string,
  followUpNeeded?: boolean
): Promise<void> {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('second_opinion_requests')
    .update({
      doctor_opinion: opinion,
      doctor_recommendations: recommendations,
      doctor_follow_up_needed: followUpNeeded,
      reviewed_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', requestId)
    .eq('assigned_doctor_id', doctorId)
    .in('status', ['pending_review', 'in_review'])
  
  if (error) {
    throw new Error(`Failed to submit opinion: ${error.message}`)
  }
}

/**
 * Get a second opinion request by ID
 */
export async function getSecondOpinionRequest(
  requestId: string
): Promise<SecondOpinionRequest | null> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('second_opinion_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to get request: ${error.message}`)
  }
  
  return data as SecondOpinionRequest
}

/**
 * Get documents for a second opinion request
 */
export async function getSecondOpinionDocuments(
  requestId: string
): Promise<SecondOpinionDocument[]> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('second_opinion_documents')
    .select('*')
    .eq('request_id', requestId)
    .order('uploaded_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to get documents: ${error.message}`)
  }
  
  return data as SecondOpinionDocument[]
}
