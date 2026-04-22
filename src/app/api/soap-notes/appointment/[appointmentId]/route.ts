import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/soap-notes/appointment/[appointmentId]
 * Fetch the SOAP note for a given appointment (if it exists)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['doctor', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: note, error } = await supabase
      .from('soap_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('doctor_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[SOAPNotes] Fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch SOAP note' }, { status: 500 })
    }

    return NextResponse.json({ note })
  } catch (err) {
    console.error('[SOAPNotes] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/soap-notes/appointment/[appointmentId]
 * Create a new SOAP note draft for an appointment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'doctor') {
      return NextResponse.json({ error: 'Only doctors can create SOAP notes' }, { status: 403 })
    }

    // Verify the doctor owns this appointment
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id, status')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if note already exists
    const { data: existing } = await supabase
      .from('soap_notes')
      .select('id')
      .eq('appointment_id', appointmentId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'SOAP note already exists for this appointment' }, { status: 409 })
    }

    const body = await request.json().catch(() => ({}))

    const { data: note, error: insertError } = await supabase
      .from('soap_notes')
      .insert({
        appointment_id: appointmentId,
        doctor_id: user.id,
        patient_id: appointment.patient_id,
        status: 'draft',
        transcript_raw: body.transcript || null,
        transcript_sources: body.transcript_sources || [],
      })
      .select()
      .single()

    if (insertError) {
      console.error('[SOAPNotes] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create SOAP note' }, { status: 500 })
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (err) {
    console.error('[SOAPNotes] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/soap-notes/appointment/[appointmentId]
 * Update an existing SOAP note (doctor edits, approval, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    // Build updates dynamically
    const updates: Record<string, unknown> = {}
    const allowedFields = [
      'soap_subjective',
      'soap_objective',
      'soap_assessment',
      'soap_plan',
      'soap_json',
      'transcript_raw',
      'transcript_sources',
      'doctor_edits',
      'patient_summary',
      'status',
      'rejection_reason',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (body.status === 'approved') {
      updates.approved_by = user.id
      updates.approved_at = new Date().toISOString()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: note, error } = await supabase
      .from('soap_notes')
      .update(updates)
      .eq('appointment_id', appointmentId)
      .eq('doctor_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[SOAPNotes] Update error:', error)
      return NextResponse.json({ error: 'Failed to update SOAP note' }, { status: 500 })
    }

    return NextResponse.json({ note })
  } catch (err) {
    console.error('[SOAPNotes] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
