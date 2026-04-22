import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { scheduleAppointmentReminders } from '@/lib/reminders'

// GET — retrieve intake response for an appointment
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appointmentId = searchParams.get('appointment_id')
  const supabase = createServiceClient()

  if (!appointmentId) {
    return NextResponse.json({ error: 'appointment_id required' }, { status: 400 })
  }

  try {
    const { user } = await requireRole('doctor')

    const { data, error } = await supabase
      .from('patient_intake_responses')
      .select('*, template:intake_form_templates(*)')
      .eq('appointment_id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ response: data })
  } catch {
    // Try as patient
    try {
      const { user } = await requireRole('patient')
      const { data, error } = await supabase
        .from('patient_intake_responses')
        .select('*, template:intake_form_templates(*)')
        .eq('appointment_id', appointmentId)
        .eq('patient_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ response: data })
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
}

// POST — patient submits intake form
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole('patient')
    const body = await request.json()
    const supabase = createServiceClient()

    const appointmentId = body.appointment_id
    const responses = body.responses
    const templateId = body.template_id

    if (!appointmentId || !responses || !templateId) {
      return NextResponse.json(
        { error: 'appointment_id, template_id, and responses required' },
        { status: 400 }
      )
    }

    // Verify appointment belongs to patient
    const { data: apt } = await supabase
      .from('appointments')
      .select('doctor_id, status')
      .eq('id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (!apt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (apt.status === 'cancelled') {
      return NextResponse.json({ error: 'Appointment is cancelled' }, { status: 400 })
    }

    // Compute red flags from responses
    const redFlags = detectRedFlags(responses)

    const { data, error } = await supabase
      .from('patient_intake_responses')
      .upsert(
        {
          appointment_id: appointmentId,
          template_id: templateId,
          patient_id: user.id,
          doctor_id: apt.doctor_id,
          responses_json: responses,
          has_red_flags: redFlags.length > 0,
          red_flags: redFlags,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'appointment_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, response: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

// PATCH — doctor marks response as reviewed
export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.appointment_id) {
      return NextResponse.json({ error: 'appointment_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('patient_intake_responses')
      .update({
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('appointment_id', body.appointment_id)
      .eq('doctor_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, response: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

function detectRedFlags(responses: Record<string, unknown>): string[] {
  const flags: string[] = []

  // Check pain level
  const pain = responses['pain_level']
  if (typeof pain === 'number' && pain >= 8) {
    flags.push('Dolor severo reportado (nivel ' + pain + '/10)')
  }

  // Check chief complaint for emergency keywords
  const complaint = String(responses['chief_complaint'] || '').toLowerCase()
  const emergencyKeywords = [
    'dolor de pecho',
    'chest pain',
    'no puedo respirar',
    'difícil respirar',
    'desmayo',
    'sangrado',
    'embarazo',
    'contracciones',
    'parálisis',
    'convulsión',
    'suicidio',
    'autolesión',
    'dolor severo',
  ]

  for (const kw of emergencyKeywords) {
    if (complaint.includes(kw)) {
      flags.push(`Posible emergencia detectada: "${kw}"`)
    }
  }

  return flags
}
