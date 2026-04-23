import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reserveAppointmentSlot } from '@/lib/booking'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Requirement 2.7, 15.5, 15.6: Authentication required, patient_id from session only
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', redirect: '/auth/login' },
      { status: 401 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'patient') {
    return NextResponse.json(
      { error: 'Only patient accounts can book consultations' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const {
    doctorId,
    date,
    time,
    appointmentType = 'video',
    patientId: bodyPatientId,
    consultationId,
    preConsultaSummary,
  } = body

  // Property 5: Booking Security - Session-Only Patient ID
  // Explicitly ignore any patientId from request body for security
  // Always use authenticated session user ID
  if (bodyPatientId) {
    console.warn('Security: Ignoring patientId from request body, using session user ID')
  }

  if (!doctorId || !date || !time) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  if (!['video', 'in_person'].includes(appointmentType)) {
    return NextResponse.json(
      { error: 'Invalid appointment type' },
      { status: 400 }
    )
  }

  if (
    preConsultaSummary &&
    (
      typeof preConsultaSummary.chiefComplaint !== 'string' ||
      typeof preConsultaSummary.urgencyLevel !== 'string' ||
      typeof preConsultaSummary.suggestedSpecialty !== 'string'
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid pre-consulta context' },
      { status: 400 }
    )
  }

  try {
    // Sistema de reserva maneja todo: validación + creación
    // Requirement 2.7: patient_id obtained exclusively from authenticated session
    const result = await reserveAppointmentSlot({
      patientId: user.id, // Always from session, never from body
      doctorId,
      date,
      time,
      appointmentType,
      consultationId: typeof consultationId === 'string' ? consultationId : undefined,
      preConsultaSummary,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    if (!result.appointment) {
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appointmentId: result.appointment.id,
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
