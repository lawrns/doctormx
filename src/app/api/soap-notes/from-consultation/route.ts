// SOAP Notes from Consultation API
// POST: Generate SOAP note directly from consultation context
// GET: Retrieve SOAP note for review

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import { generateSoapNote } from '@/lib/domains/soap-notes'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ConsultationContext {
  consultation_id?: string
  appointment_id?: string
  patient_id: string
  chief_complaint: string
  symptoms: string[]
  duration?: string
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency'
  specialty?: string
  diagnosis?: string
  treatment?: string
  notes: string
}

interface PatientContext {
  name?: string
  age?: number
  gender?: string
  medical_history?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check feature flag
    const enabled = await isFeatureEnabled('ai_soap_notes_enabled', { userId: user.id })
    if (!enabled) {
      return NextResponse.json(
        { error: 'AI SOAP notes is not available for your subscription' },
        { status: 403 }
      )
    }

    // Verify user is a doctor
    const { data: doctor } = await supabase
      .from('doctores')
      .select('user_id, subscription_tier')
      .eq('user_id', user.id)
      .single()

    if (!doctor) {
      return NextResponse.json(
        { error: 'Only doctores can generate SOAP notes' },
        { status: 403 }
      )
    }

    // Parse body
    const consultation = await request.json() as ConsultationContext
    const patientContext = await request.json() as PatientContext

    // Validate required fields
    if (!consultation.patient_id || !consultation.notes) {
      return NextResponse.json(
        { error: 'patient_id and notes are required' },
        { status: 400 }
      )
    }

    // Build transcript from consultation context
    const transcript = buildTranscriptFromConsultation(consultation, patientContext)

    // Generate SOAP note
    const result = await generateSoapNote({
      doctor_id: user.id,
      transcript,
      patient_context: patientContext,
      consultation_id: consultation.consultation_id,
      appointment_id: consultation.appointment_id,
    })

    // Return the note for review
    const serviceClient = await getServiceClient()
    const { data: note } = await serviceClient
      .from('soap_notes')
      .select('*')
      .eq('id', result.id)
      .single()

    if (!note) {
      return NextResponse.json({ error: 'Failed to retrieve generated note' }, { status: 500 })
    }

    return NextResponse.json({
      id: note.id,
      status: note.status,
      soap_note: {
        subjective: note.soap_subjective,
        objective: note.soap_objective,
        assessment: note.soap_assessment,
        plan: note.soap_plan,
        json: note.soap_json,
      },
      message: 'SOAP note generated. Please review and approve before saving to patient record.',
    }, { status: 201 })

  } catch (error) {
    logger.error('[SOAP Notes] Error generating from consultation:', { err: error })
    return NextResponse.json(
      { error: 'Failed to generate SOAP note from consultation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    // Get note
    const serviceClient = await getServiceClient()
    const { data: note } = await serviceClient
      .from('soap_notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (!note) {
      return NextResponse.json({ error: 'SOAP note not found' }, { status: 404 })
    }

    // Check ownership
    if (note.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      id: note.id,
      status: note.status,
      soap_note: {
        subjective: note.soap_subjective,
        objective: note.soap_objective,
        assessment: note.soap_assessment,
        plan: note.soap_plan,
        json: note.soap_json,
      },
      consultation_id: note.consultation_id,
      appointment_id: note.appointment_id,
      created_at: note.created_at,
      updated_at: note.updated_at,
    })

  } catch (error) {
    logger.error('[SOAP Notes] Error retrieving note:', { err: error })
    return NextResponse.json(
      { error: 'Failed to retrieve SOAP note' },
      { status: 500 }
    )
  }
}

async function getServiceClient() {
  return createServiceClient()
}

function buildTranscriptFromConsultation(
  consultation: ConsultationContext,
  patient: PatientContext
): string {
  const parts: string[] = []

  // Patient context
  if (patient.name) {
    parts.push(`Paciente: ${patient.name}`)
  }
  if (patient.age) {
    parts.push(`Edad: ${patient.age} años`)
  }
  if (patient.gender) {
    parts.push(`Género: ${patient.gender}`)
  }

  // Chief complaint
  parts.push(`Motivo de consulta: ${consultation.chief_complaint}`)

  // Symptoms
  if (consultation.symptoms && consultation.symptoms.length > 0) {
    parts.push(`Síntomas: ${consultation.symptoms.join(', ')}`)
  }

  // Duration
  if (consultation.duration) {
    parts.push(`Duración: ${consultation.duration}`)
  }

  // Urgency
  if (consultation.urgency_level) {
    parts.push(`Urgencia: ${consultation.urgency_level}`)
  }

  // Diagnosis
  if (consultation.diagnosis) {
    parts.push(`Diagnóstico: ${consultation.diagnosis}`)
  }

  // Treatment
  if (consultation.treatment) {
    parts.push(`Tratamiento: ${consultation.treatment}`)
  }

  // Doctor's notes
  parts.push(`Notas del médico: ${consultation.notes}`)

  return parts.join('\n\n')
}
