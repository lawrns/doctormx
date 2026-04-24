// SOAP Notes Domain Module
// Input: Voice recording, consultation context
// Process: Transcribe → AI SOAP generation → Doctor review
// Output: Approved structured SOAP note

import { createServiceClient } from '@/lib/supabase/server'
import { getAIClient, glm } from '@/lib/openai'
import { GLM_CONFIG, isGLMConfigured } from '@/lib/ai/glm'

export const SOAP_NOTES_CONFIG = {
  MAX_AUDIO_DURATION_SECONDS: 3600,
  MAX_TRANSCRIPT_LENGTH: 50000,
  AI_MODEL: 'gpt-4-turbo-preview',
  WHISPER_MODEL: 'whisper-1',
} as const

export type SoapNoteStatus =
  | 'draft'
  | 'transcribing'
  | 'generating'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'archived'

export interface SoapNote {
  id: string
  consultation_id?: string
  appointment_id?: string
  doctor_id: string
  patient_id?: string
  status: SoapNoteStatus
  audio_file_path?: string
  audio_duration_seconds?: number
  transcript_raw?: string
  soap_subjective?: string
  soap_objective?: string
  soap_assessment?: string
  soap_plan?: string
  soap_json?: Record<string, unknown>
  ai_confidence_score?: number
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface GenerateSoapInput {
  doctor_id: string
  transcript: string
  patient_context?: {
    name?: string
    age?: number
    gender?: string
    medical_history?: string
  }
  consultation_id?: string
  appointment_id?: string
  patient_id?: string
}

const SOAP_PROMPT = `Eres un asistente médico experto que genera notas SOAP estructuradas en español mexicano.

Basándote en la transcripción de la consulta médica, genera una nota SOAP completa con las siguientes secciones:

SUBJETIVO (S): Lo que el paciente reporta - síntomas, duración, historia médica relevante
OBJETIVO (O): Hallazgos del examen físico, signos vitales, resultados de estudios
ANÁLISIS (A): Diagnóstico diferencial, impresión diagnóstica
PLAN (P): Tratamiento propuesto, medicamentos, estudios solicitados, seguimiento

Responde ÚNICAMENTE en formato JSON con esta estructura:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "...",
  "icd10_codes": ["..."],
  "medications": [{"name": "...", "dosage": "...", "frequency": "...", "duration": "..."}],
  "followup": "..."
}`

/**
 * Generate SOAP note from transcript using AI
 */
export async function generateSoapNote(
  input: GenerateSoapInput
): Promise<{ id: string; status: SoapNoteStatus }> {
  const supabase = await createServiceClient()
  
  // Create initial record
  const { data: note, error: createError } = await supabase
    .from('soap_notes')
    .insert({
      doctor_id: input.doctor_id,
      consultation_id: input.consultation_id,
      appointment_id: input.appointment_id,
      patient_id: input.patient_id,
      transcript_raw: input.transcript,
      status: 'generating',
    })
    .select('id')
    .single()
  
  if (createError) {
    throw new Error(`Failed to create note: ${createError.message}`)
  }
  
  try {
    // Use GLM as primary provider for SOAP note generation
    const client = isGLMConfigured() ? glm : getAIClient()
    const model = isGLMConfigured() ? GLM_CONFIG.models.reasoning : SOAP_NOTES_CONFIG.AI_MODEL

    const contextStr = input.patient_context
      ? `\nContexto del paciente: ${JSON.stringify(input.patient_context)}`
      : ''

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SOAP_PROMPT },
        { role: 'user', content: `Transcripción de consulta:${contextStr}\n\n${input.transcript}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })
    
    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }
    
    const soapData = JSON.parse(content)
    
    // Update with generated content
    const { error: updateError } = await supabase
      .from('soap_notes')
      .update({
        soap_subjective: soapData.subjective,
        soap_objective: soapData.objective,
        soap_assessment: soapData.assessment,
        soap_plan: soapData.plan,
        soap_json: soapData,
        ai_model: model,
        ai_generated_at: new Date().toISOString(),
        ai_tokens_used: completion.usage?.total_tokens,
        status: 'pending_review',
      })
      .eq('id', note.id)
    
    if (updateError) {
      throw new Error(`Failed to update note: ${updateError.message}`)
    }
    
    return { id: note.id, status: 'pending_review' }
    
  } catch (error) {
    // Mark as failed
    await supabase
      .from('soap_notes')
      .update({ status: 'rejected', rejection_reason: String(error) })
      .eq('id', note.id)
    
    throw error
  }
}

/**
 * Approve a SOAP note
 */
export async function approveSoapNote(
  noteId: string,
  doctorId: string,
  edits?: Partial<{ subjective: string; objective: string; assessment: string; plan: string }>
): Promise<void> {
  const supabase = await createServiceClient()
  
  const updates: Record<string, unknown> = {
    status: 'approved',
    approved_by: doctorId,
    approved_at: new Date().toISOString(),
  }
  
  if (edits) {
    updates.doctor_edits = edits
    if (edits.subjective) updates.soap_subjective = edits.subjective
    if (edits.objective) updates.soap_objective = edits.objective
    if (edits.assessment) updates.soap_assessment = edits.assessment
    if (edits.plan) updates.soap_plan = edits.plan
  }
  
  const { error } = await supabase
    .from('soap_notes')
    .update(updates)
    .eq('id', noteId)
    .eq('doctor_id', doctorId)
    .eq('status', 'pending_review')
  
  if (error) {
    throw new Error(`Failed to approve note: ${error.message}`)
  }
}

/**
 * Get SOAP note by ID
 */
export async function getSoapNote(noteId: string): Promise<SoapNote | null> {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('soap_notes')
    .select('*')
    .eq('id', noteId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to get note: ${error.message}`)
  }
  
  return data as SoapNote
}

/**
 * List SOAP notes for a doctor
 */
export async function listSoapNotes(
  doctorId: string,
  status?: SoapNoteStatus,
  limit = 20
): Promise<SoapNote[]> {
  const supabase = await createServiceClient()
  
  let query = supabase
    .from('soap_notes')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to list notes: ${error.message}`)
  }
  
  return data as SoapNote[]
}
