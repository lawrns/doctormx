// Second Opinion Domain Module
// Input: Patient case data, medical documents
// Process: AI triage → Doctor matching → Review → Delivery
// Output: Validated second opinion with doctor sign-off

import { createServiceClient } from '@/lib/supabase/server'
import { requireDoctorAuth, requireDoctorRole, requireAssignedDoctor } from '@/lib/auth-guard'
import {
  addCareMemory,
  appendCareEvent,
  createCareCase,
  getActiveCareCaseForPatient,
  linkSecondOpinionRequest,
  routeCaseWithContext,
} from '@/lib/care-orchestration'
import type { CareTriage } from '@/lib/types/care-case'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/observability/logger'

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
): Promise<{ id: string; careCaseId: string }> {
  const supabase = await createServiceClient()
  
  const price_cents = SECOND_OPINION_CONFIG.PRICES[input.type]
  const expires_at = new Date()
  expires_at.setHours(expires_at.getHours() + SECOND_OPINION_CONFIG.REVIEW_WINDOW_HOURS)

  const activeCareCase = await getActiveCareCaseForPatient(input.patient_id)
  const careCase = activeCareCase ?? await createCareCase({
    channel: 'web',
    patientId: input.patient_id,
  })
  
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

  await linkSecondOpinionRequest(data.id, careCase.id)
  await addCareMemory({
    careCaseId: careCase.id,
    patientId: input.patient_id,
    sourceType: 'second-opinion',
    sourceId: data.id,
    title: 'Solicitud de segunda opinión creada',
    summary: input.chief_complaint,
    tags: ['second-opinion', input.type],
  })
  
  return { id: data.id, careCaseId: careCase.id }
}

/**
 * Submit a second opinion request for review (after payment)
 */
export async function submitSecondOpinionRequest(
  requestId: string,
  paymentId: string
): Promise<void> {
  // Any authenticated doctor can submit a request on behalf of a patient after payment
  await requireDoctorRole()
  const supabase = await createServiceClient()

  // Fetch request while still in draft — orchestration steps must succeed
  // BEFORE we mark the payment as paid to avoid inconsistency on failure.
  const request = await getSecondOpinionRequest(requestId)
  if (!request) {
    return
  }

  const careCase = await getActiveCareCaseForPatient(request.patient_id)
  if (careCase) {
    const triage: CareTriage = {
      chiefComplaint: request.chief_complaint,
      symptoms: [],
      urgency: 'medium',
      specialty: request.ai_suggested_specialty || 'medicina-general',
      specialtyConfidence: request.ai_suggested_specialty ? 0.75 : 0.4,
      redFlags: [],
      recommendedAction: 'second-opinion',
      reasoning: request.ai_preliminary_summary || 'Paciente solicitó segunda opinión clínica.',
    }

    await routeCaseWithContext({
      careCaseId: careCase.id,
      routing: {
        decision: 'second-opinion',
        specialty: triage.specialty,
        urgency: triage.urgency,
        reason: 'follow-up-review',
        notes: 'Second opinion submitted after payment',
      },
    })

    await appendCareEvent(careCase.id, 'message', 'patient', request.patient_id, {
      workflow: 'second-opinion',
      requestId,
      paymentId,
    })
  }

  // Mark payment as paid LAST — only after all orchestration steps succeed
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
  // Admin-level: any authenticated doctor can assign another doctor to a request
  await requireDoctorRole()
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

  const request = await getSecondOpinionRequest(requestId)
  if (!request) {
    return
  }

  const careCase = await getActiveCareCaseForPatient(request.patient_id)
  if (careCase) {
    await appendCareEvent(careCase.id, 'doctor_assigned', 'system', doctorId, {
      workflow: 'second-opinion',
      requestId,
      notes: notes ?? null,
    })
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
  await requireAssignedDoctor(requestId)
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

  const request = await getSecondOpinionRequest(requestId)
  if (!request) {
    return
  }

  const careCase = await getActiveCareCaseForPatient(request.patient_id)
  if (careCase) {
    await addCareMemory({
      careCaseId: careCase.id,
      patientId: request.patient_id,
      sourceType: 'second-opinion',
      sourceId: requestId,
      title: 'Segunda opinión completada',
      summary: opinion,
      tags: ['second-opinion', 'completed'],
    })

    await appendCareEvent(careCase.id, 'follow_up_sent', 'doctor', doctorId, {
      workflow: 'second-opinion',
      requestId,
      recommendations: recommendations ?? null,
      followUpNeeded: followUpNeeded ?? false,
    })
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
 * Create a Stripe payment intent for a second opinion request
 */
export async function createSecondOpinionPayment(
  requestId: string,
  patientId: string,
  type: SecondOpinionType
): Promise<{ clientSecret: string; amount: number; currency: string }> {
  const amount = SECOND_OPINION_CONFIG.PRICES[type]
  const currency = 'mxn'

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        second_opinion_request_id: requestId,
        patient_id: patientId,
        type,
        amount_cents: String(amount),
      },
      payment_method_types: ['card', 'oxxo', 'customer_balance'],
      payment_method_options: {
        oxxo: { expires_after_days: 3 },
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: { type: 'mx_bank_transfer' },
        },
      },
    })

    const supabase = await createServiceClient()
    await supabase.from('payments').insert({
      provider: 'stripe',
      provider_ref: paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount_cents: amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      fee_cents: 0,
      net_cents: amount,
      metadata: {
        type: 'second_opinion',
        second_opinion_request_id: requestId,
      },
    })

    await supabase
      .from('second_opinion_requests')
      .update({
        payment_id: paymentIntent.id,
        payment_status: 'pending',
      })
      .eq('id', requestId)

    return {
      clientSecret: paymentIntent.client_secret!,
      amount,
      currency: currency.toUpperCase(),
    }
  } catch (error) {
    logger.error('Failed to create second opinion payment', { error })
    throw new Error('Error al crear el pago para la segunda opinión')
  }
}

/**
 * Get messages for a second opinion request
 */
export async function getSecondOpinionMessages(
  requestId: string
): Promise<SecondOpinionMessage[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('second_opinion_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`)
  }

  return data as SecondOpinionMessage[]
}

/**
 * Send a message in a second opinion request
 */
export async function sendSecondOpinionMessage(
  requestId: string,
  senderId: string,
  senderRole: 'patient' | 'doctor' | 'system',
  content: string,
  attachmentUrl?: string
): Promise<SecondOpinionMessage> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('second_opinion_messages')
    .insert({
      request_id: requestId,
      sender_id: senderId,
      sender_role: senderRole,
      content,
      attachment_url: attachmentUrl || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`)
  }

  return data as SecondOpinionMessage
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
