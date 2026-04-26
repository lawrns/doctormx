import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { createVideoRoom, getJoinToken, updateVideoStatus, isVideoAppointmentJoinable } from '@/lib/video'
import { sendEmail, getEmailTemplate } from '@/lib/notifications'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notifications'

type AppointmentRecord = {
  id: string
  patient_id: string
  doctor_id: string
  start_ts: string
  end_ts: string
  status?: string
  appointment_type?: string
  video_status?: string | null
  video_room_url?: string | null
  video_room_id?: string | null
  video_started_at?: string | null
  consultation_notes?: string | null
}

type ProfileRecord = {
  full_name?: string | null
  email?: string | null
  phone?: string | null
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeNotes(value: unknown) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 20000 ? trimmed.slice(0, 20000) : trimmed
}

function firstProfile(value: unknown): ProfileRecord | null {
  if (Array.isArray(value)) return (value[0] as ProfileRecord | undefined) || null
  return (value as ProfileRecord | null) || null
}

async function getAuthenticatedVideoUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, role: null as string | null, name: null as string | null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return {
    supabase,
    user,
    role: profile?.role || null,
    name: profile?.full_name || null,
  }
}

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
    const { user, supabase, role, name } = await getAuthenticatedVideoUser()

    if (!user || (role !== 'patient' && role !== 'doctor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get appointment details
    const { data: appointmentData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    const appointment = appointmentData as AppointmentRecord | null

    if (
      error ||
      !appointment ||
      (role === 'patient' && appointment.patient_id !== user.id) ||
      (role === 'doctor' && appointment.doctor_id !== user.id)
    ) {
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

    if (
      !isVideoAppointmentJoinable({
        start_ts: appointment.start_ts,
        appointment_type: appointment.appointment_type,
        video_room_url: appointment.video_room_url,
      }) &&
      now < fifteenMinutesBefore
    ) {
      return NextResponse.json(
        {
          error: 'La videoconsulta no está disponible aún',
          joinableAt: fifteenMinutesBefore.toISOString(),
        },
        { status: 403 }
      )
    }

    if (!appointment.video_room_url && role === 'doctor') {
      const videoRoom = await createVideoRoom(appointment.id, {
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        scheduledFor: new Date(appointment.start_ts),
      })

      await supabase
        .from('appointments')
        .update({
          video_room_url: videoRoom.roomUrl,
          video_room_id: videoRoom.roomId,
          video_status: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)

      appointment.video_room_url = videoRoom.roomUrl
      appointment.video_room_id = videoRoom.roomId
      appointment.video_status = 'ready'
    }

    if (!appointment.video_room_url || !appointment.video_room_id) {
      return NextResponse.json(
        { error: 'La sala de video aun no esta lista' },
        { status: 409 }
      )
    }

    const userName = name || (role === 'doctor' ? 'Doctor' : 'Paciente')

    // Get join token
    const token = await getJoinToken(
      appointmentId,
      user.id,
      role as 'patient' | 'doctor',
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
    console.error('[API] Error getting video room:', error)
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
    const { data: appointmentData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    const appointment = appointmentData as AppointmentRecord | null

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    if (appointment.appointment_type !== 'video') {
      return NextResponse.json(
        { error: 'Esta cita no es una videoconsulta' },
        { status: 400 }
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
    const videoRoom = await createVideoRoom(appointment.id, {
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

    const { data: notificationData } = await supabase
      .from('appointments')
      .select(`
        id,
        patient:profiles!appointments_patient_id_fkey(full_name, phone),
        doctor:profiles!appointments_doctor_id_fkey(full_name, phone)
      `)
      .eq('id', appointmentId)
      .single()

    const patientProfile = firstProfile(notificationData?.patient)
    const doctorProfile = firstProfile(notificationData?.doctor)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'

    if (patientProfile?.phone) {
      await sendWhatsAppNotification(patientProfile.phone, 'video_link_ready', {
        patientName: patientProfile.full_name || 'Paciente',
        bookingLink: `${appUrl}/app/appointments/${appointmentId}/video`,
      })
    }

    if (doctorProfile?.phone) {
      await sendWhatsAppNotification(doctorProfile.phone, 'video_link_ready', {
        patientName: doctorProfile.full_name || 'Doctor',
        bookingLink: `${appUrl}/doctor/consultation/${appointmentId}`,
      })
    }

    return NextResponse.json({
      roomUrl: videoRoom.roomUrl,
      roomId: videoRoom.roomId,
      exists: false,
    })
  } catch (error) {
    console.error('[API] Error creating video room:', error)
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
    const { user, supabase, role } = await getAuthenticatedVideoUser()

    if (!user || (role !== 'patient' && role !== 'doctor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const action = body?.action
    const consultationNotes = normalizeNotes(body?.consultationNotes)

    // Get appointment to verify ownership
    const { data: appointmentData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    const appointment = appointmentData as AppointmentRecord | null

    if (
      error ||
      !appointment ||
      (role === 'patient' && appointment.patient_id !== user.id) ||
      (role === 'doctor' && appointment.doctor_id !== user.id)
    ) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    if (action === 'end') {
      if (appointment.video_status === 'completed' && appointment.status === 'completed') {
        return NextResponse.json({ success: true, alreadyCompleted: true })
      }

      await updateVideoStatus(supabase, appointmentId, 'completed', {
        videoEndedAt: new Date().toISOString(),
        consultationNotes,
      })

      if (role === 'doctor') {
        await supabase
          .from('appointments')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointmentId)

        if (consultationNotes) {
          const { data: details } = await supabase
            .from('appointments')
            .select(`
              patient:profiles!appointments_patient_id_fkey(full_name, email),
              doctor:profiles!appointments_doctor_id_fkey(full_name)
            `)
            .eq('id', appointmentId)
            .single()

          const patientProfile = firstProfile(details?.patient)
          const doctorProfile = firstProfile(details?.doctor)

          if (patientProfile?.email) {
            await sendEmail({
              to: patientProfile.email,
              subject: 'Resumen de tu consulta',
              html: getEmailTemplate(`
                <p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">Tu consulta con ${escapeHtml(doctorProfile?.full_name || 'tu medico')} fue completada.</p>
                <p style="margin:0 0 8px;color:#1f2937;font-size:16px;line-height:1.5;"><strong>Notas de la consulta:</strong></p>
                <p style="white-space:pre-wrap;margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">${escapeHtml(consultationNotes)}</p>
              `, patientProfile.full_name || 'Paciente'),
              tags: [{ name: 'type', value: 'appointment_completed' }],
            })
          }
        }
      }

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
    console.error('[API] Error updating video status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
