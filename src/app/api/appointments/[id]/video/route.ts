import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { createVideoRoom, getJoinToken, updateVideoStatus, isVideoAppointmentJoinable } from '@/lib/video/videoService'
import { logger } from '@/lib/observability/logger'

/**
 * GET /api/appointments/[id]/video
 * Get video room details and join token for an appointment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params
    const { user, supabase } = await requireRole('patient')

    // Get appointment details
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Check if appointment is video type
    if (appointment.appointment_type !== 'video') {
      return NextResponse.json(
        { error: 'Esta cita no es una videoconsulta' },
        { status: 400 }
      )
    }

    // Check if appointment is joinable (within 15 minutes or already started)
    const now = new Date()
    const startTime = new Date(appointment.start_ts)
    const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000)

    if (!isVideoAppointmentJoinable(appointment) && now < fifteenMinutesBefore) {
      return NextResponse.json(
        {
          error: 'La videoconsulta no está disponible aún',
          joinableAt: fifteenMinutesBefore.toISOString(),
        },
        { status: 403 }
      )
    }

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const userName = profile?.full_name || 'Paciente'

    // Get join token
    const token = await getJoinToken(
      appointmentId,
      user.id,
      'patient',
      userName
    )

    // Update video status to 'in_progress' if joining
    if (appointment.video_status === 'ready' || appointment.video_status === 'pending') {
      await updateVideoStatus(supabase, appointmentId, 'in_progress', {
        videoStartedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      roomUrl: appointment.video_room_url,
      roomId: appointment.video_room_id,
      token,
      appointment: {
        id: appointment.id,
        startTs: appointment.start_ts,
        endTs: appointment.end_ts,
        doctorId: appointment.doctor_id,
      },
    })
  } catch (error) {
    logger.error('[API] Error getting video room:', { err: error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointments/[id]/video
 * Create or update video room for an appointment
 * (Typically called by the system when appointment is confirmed)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params
    const { user, supabase } = await requireRole('doctor')

    // Get appointment details
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Check if video room already exists
    if (appointment.video_room_url && appointment.video_room_id) {
      return NextResponse.json({
        roomUrl: appointment.video_room_url,
        roomId: appointment.video_room_id,
        exists: true,
      })
    }

    // Create new video room
    const videoRoom = await createVideoRoom({
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      scheduledFor: new Date(appointment.start_ts),
    })

    // Update appointment with video room details
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        video_room_url: videoRoom.roomUrl,
        video_room_id: videoRoom.roomId,
        video_status: 'ready',
      })
      .eq('id', appointmentId)

    if (updateError) {
      throw new Error(`Failed to update appointment: ${updateError.message}`)
    }

    return NextResponse.json({
      roomUrl: videoRoom.roomUrl,
      roomId: videoRoom.roomId,
      exists: false,
    })
  } catch (error) {
    logger.error('[API] Error creating video room:', { err: error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/appointments/[id]/video
 * Update video status (end call, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params
    const { user, supabase } = await requireRole('patient')

    const body = await request.json()
    const { action, consultationNotes } = body

    // Get appointment to verify ownership
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    if (action === 'end') {
      await updateVideoStatus(supabase, appointmentId, 'completed', {
        videoEndedAt: new Date().toISOString(),
        consultationNotes,
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'join') {
      await updateVideoStatus(supabase, appointmentId, 'in_progress', {
        videoStartedAt: appointment.video_started_at || new Date().toISOString(),
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Acción inválida' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('[API] Error updating video status:', { err: error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
