// src/lib/video.ts — CANONICAL video service
// Uses Daily.co when configured, gracefully falls back to Jitsi Meet

const DAILY_API_KEY = process.env.DAILY_API_KEY || ''
const DAILY_DOMAIN = process.env.DAILY_DOMAIN || ''
const DAILY_API_URL = 'https://api.daily.co/v1'

export interface VideoRoom {
  roomId: string
  roomUrl: string
  token: string
  expiresAt: Date
  provider: 'daily' | 'jitsi'
}

// Create a Daily.co room or fall back to Jitsi
export async function createVideoRoom(appointmentId: string, options?: {
  patientId?: string
  doctorId?: string
  scheduledFor?: Date
}): Promise<VideoRoom> {
  const roomName = `doctory-${appointmentId}`

  // Fallback: Jitsi Meet (no API key required)
  if (!DAILY_API_KEY || !DAILY_DOMAIN) {
    return {
      roomId: roomName,
      roomUrl: `https://meet.jit.si/${roomName}`,
      token: '',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      provider: 'jitsi',
    }
  }

  // Daily.co with API key
  try {
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: true,
          exp: Math.floor(Date.now() / 1000) + 7200,
        },
      }),
    })

    if (!response.ok) throw new Error(`Daily.co API error: ${response.status}`)

    const room = await response.json()

    // Create meeting token if patientId provided
    let token = ''
    if (options?.patientId) {
      const tokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_name: 'Patient',
            user_id: options.patientId,
            is_owner: false,
          },
          exp: Math.floor(Date.now() / 1000) + 7200,
        }),
      })
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        token = tokenData.token
      }
    }

    return {
      roomId: room.name,
      roomUrl: `https://${DAILY_DOMAIN}/${roomName}`,
      token,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      provider: 'daily',
    }
  } catch (err) {
    console.error('[VideoService] Daily.co error, falling back to Jitsi:', err)
    return {
      roomId: roomName,
      roomUrl: `https://meet.jit.si/${roomName}`,
      token: '',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      provider: 'jitsi',
    }
  }
}

// Get a join token for a specific user and role
export async function getJoinToken(
  appointmentId: string,
  userId: string,
  role: 'patient' | 'doctor',
  userName: string
): Promise<string> {
  const roomName = `doctory-${appointmentId}`

  if (!DAILY_API_KEY || !DAILY_DOMAIN) {
    return ''
  }

  const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        user_id: userId,
        is_owner: role === 'doctor',
        eject_at_room_exp: true,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create meeting token: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.token
}

// Update video status for an appointment
export async function updateVideoStatus(
  supabase: unknown,
  appointmentId: string,
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed',
  additionalData?: {
    videoStartedAt?: string
    videoEndedAt?: string
    consultationNotes?: string
  }
): Promise<void> {
  type SupabaseLike = {
    from(table: string): {
      select(columns?: string): unknown
      update(values: Record<string, unknown>): { eq(column: string, value: unknown): Promise<{ error: { message: string } | null }> }
      eq(column: string, value: unknown): unknown
    }
  }

  const updateData: Record<string, unknown> = {
    video_status: status,
  }

  if (additionalData?.videoStartedAt) {
    updateData.video_started_at = additionalData.videoStartedAt
  }

  if (additionalData?.videoEndedAt) {
    updateData.video_ended_at = additionalData.videoEndedAt
  }

  if (additionalData?.consultationNotes) {
    updateData.consultation_notes = additionalData.consultationNotes
  }

  const client = supabase as SupabaseLike
  const { error } = await client
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)

  if (error) {
    console.error('[VideoService] Error updating video status:', error)
    throw new Error(`Failed to update video status: ${error.message}`)
  }
}

// Ensure a video room exists for an appointment
export async function ensureVideoRoomForAppointment(appointmentId: string, details?: {
  patientId?: string
  doctorId?: string
  scheduledFor?: Date
}): Promise<VideoRoom> {
  return createVideoRoom(appointmentId, details)
}

// Check if a video appointment is joinable
export function isVideoAppointmentJoinable(appointment: {
  start_ts: string
  appointment_type?: string
  video_room_url?: string | null
}): boolean {
  if (!appointment.video_room_url || appointment.appointment_type !== 'video') return false

  const now = new Date()
  const startTime = new Date(appointment.start_ts)
  const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000)

  return now >= fifteenMinutesBefore
}

// Get video status text in Spanish
export function getVideoStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    ready: 'Lista para unirse',
    in_progress: 'En curso',
    completed: 'Completada',
    missed: 'Perdida',
  }
  return map[status] || status
}

// Calculate duration in minutes
export function getVideoCallDuration(startedAt?: string | null, endedAt?: string | null): number | null {
  if (!startedAt) return null
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
}
