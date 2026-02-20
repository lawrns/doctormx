import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { logSecurityEvent } from '@/lib/security/audit-logger'

/**
 * POST /api/consultation-notes
 * Save a consultation note (used by offline sync)
 * Security: Validates authentication and appointment ownership before saving
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, patientId, content, type = 'soap' } = body

    // Validation
    if (!appointmentId || !content) {
      return NextResponse.json(
        { error: 'appointmentId and content are required' },
        { status: 400 }
      )
    }

    // SECURITY CHECK: Verify user has access to this appointment
    // Doctors can add notes to their appointments, patients to their own
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      logger.warn('Note creation attempt for non-existent appointment', {
        userId: user.id,
        appointmentId,
      })
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // IDOR Protection: Verify user is either the patient or the doctor for this appointment
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isPatient = appointment.patient_id === user.id
    const isDoctor = profile?.role === 'doctor' && appointment.doctor_id === user.id

    if (!isPatient && !isDoctor) {
      // Log security event for IDOR attempt
      const ipAddress = (request.headers.get('x-forwarded-for') ?? 
                       request.headers.get('x-real-ip')) ?? 'unknown'
      const userAgent = request.headers.get('user-agent') ?? 'unknown'
      
      await logSecurityEvent({
        eventType: 'permission_denied',
        severity: 'high',
        userId: user.id,
        description: `IDOR_ATTEMPT: User ${user.id} attempted to create note for appointment ${appointmentId} without authorization`,
        ipAddress,
        userAgent,
        details: {
          type: 'IDOR_ATTEMPT',
          targetResource: appointmentId,
          resourceType: 'consultation_note',
          action: 'create',
          actualPatient: appointment.patient_id,
          actualDoctor: appointment.doctor_id,
          attemptedBy: user.id,
          timestamp: new Date().toISOString(),
        },
      })

      logger.warn(`IDOR_ATTEMPT_BLOCKED: User ${user.id} tried to create note for appointment ${appointmentId}`, {
        userId: user.id,
        appointmentId,
        actualPatient: appointment.patient_id,
        actualDoctor: appointment.doctor_id,
      })

      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Insert note into database
    const { data, error } = await supabase
      .from('consultation_notes')
      .insert({
        appointment_id: appointmentId,
        patient_id: patientId || appointment.patient_id,
        doctor_id: isDoctor ? user.id : null,
        content,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      logger.error('Database error saving consultation note:', { err: error })
      return NextResponse.json(
        { error: 'Failed to save note' },
        { status: 500 }
      )
    }

    logger.info('Consultation note saved successfully', {
      userId: user.id,
      appointmentId,
      noteId: data.id,
    })

    return NextResponse.json({
      success: true,
      note: data,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Consultation notes error:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/consultation-notes?appointmentId={id}
 * Get notes for a specific appointment
 * Security: Validates authentication and appointment ownership before retrieving
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      )
    }

    // SECURITY CHECK: Verify user has access to this appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      logger.warn('Note retrieval attempt for non-existent appointment', {
        userId: user.id,
        appointmentId,
      })
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // IDOR Protection: Verify user is either the patient or the doctor for this appointment
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isPatient = appointment.patient_id === user.id
    const isDoctor = profile?.role === 'doctor' && appointment.doctor_id === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isPatient && !isDoctor && !isAdmin) {
      // Log security event for IDOR attempt
      const ipAddress = (request.headers.get('x-forwarded-for') ?? 
                       request.headers.get('x-real-ip')) ?? 'unknown'
      const userAgent = request.headers.get('user-agent') ?? 'unknown'
      
      await logSecurityEvent({
        eventType: 'permission_denied',
        severity: 'high',
        userId: user.id,
        description: `IDOR_ATTEMPT: User ${user.id} attempted to retrieve notes for appointment ${appointmentId} without authorization`,
        ipAddress,
        userAgent,
        details: {
          type: 'IDOR_ATTEMPT',
          targetResource: appointmentId,
          resourceType: 'consultation_note',
          action: 'read',
          actualPatient: appointment.patient_id,
          actualDoctor: appointment.doctor_id,
          attemptedBy: user.id,
          timestamp: new Date().toISOString(),
        },
      })

      logger.warn(`IDOR_ATTEMPT_BLOCKED: User ${user.id} tried to retrieve notes for appointment ${appointmentId}`, {
        userId: user.id,
        appointmentId,
        actualPatient: appointment.patient_id,
        actualDoctor: appointment.doctor_id,
      })

      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('consultation_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Database error fetching consultation notes:', { err: error })
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    logger.info('Consultation notes retrieved successfully', {
      userId: user.id,
      appointmentId,
      count: data?.length ?? 0,
    })

    return NextResponse.json({
      notes: data || [],
      count: data?.length ?? 0,
    })
  } catch (error) {
    logger.error('Consultation notes error:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
