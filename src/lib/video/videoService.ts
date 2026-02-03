/**
 * Video Service - Daily.co Integration
 *
 * This service handles video room creation, token generation, and status updates
 * for video consultations using Daily.co as the video provider.
 */

export interface VideoRoom {
  roomId: string
  roomUrl: string
  token: string
  expiresAt: Date
}

export interface CreateRoomOptions {
  appointmentId: string
  patientId: string
  doctorId: string
  scheduledFor: Date
}

export interface VideoCallConfig {
  apiKey: string
  domain: string
}

/**
 * Get Daily.co configuration from environment variables
 */
function getVideoConfig(): VideoCallConfig {
  const apiKey = process.env.DAILY_API_KEY || ''
  const domain = process.env.DAILY_DOMAIN || ''

  if (!apiKey || !domain) {
    throw new Error('Daily.co configuration missing. Set DAILY_API_KEY and DAILY_DOMAIN environment variables.')
  }

  return { apiKey, domain }
}

/**
 * Create a new video room for an appointment
 *
 * @param options - Room creation options
 * @returns VideoRoom object with room details
 */
export async function createVideoRoom(options: CreateRoomOptions): Promise<VideoRoom> {
  const config = getVideoConfig()
  const { appointmentId, patientId, doctorId, scheduledFor } = options

  // Generate a unique room name based on appointment ID
  const roomName = `apt-${appointmentId}`

  try {
    // Create room via Daily.co API
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          enable_chat: true,
          enable_screen_sharing: true,
          enable_recording: false, // Can be enabled later
          start_video_off: false,
          start_audio_off: true,
          owner_only_broadcast: false,
        },
        exp: Math.floor(new Date(scheduledFor.getTime() + 2 * 60 * 60 * 1000).getTime() / 1000), // 2 hours after appointment
        nbf: Math.floor(new Date(scheduledFor.getTime() - 15 * 60 * 1000).getTime() / 1000), // 15 minutes before appointment
        max_participants: 4, // Doctor, patient, and up to 2 translators/observers
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create video room: ${JSON.stringify(error)}`)
    }

    const roomData = await response.json()

    // Create the room URL
    const roomUrl = `https://${config.domain}/${roomName}`

    // Create meeting token for the patient
    const tokenResponse = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: 'Patient', // Will be overridden on join
          user_id: patientId,
          is_owner: false,
        },
        exp: Math.floor(new Date(scheduledFor.getTime() + 2 * 60 * 60 * 1000).getTime() / 1000),
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      throw new Error(`Failed to create meeting token: ${JSON.stringify(error)}`)
    }

    const tokenData = await tokenResponse.json()

    return {
      roomId: roomName,
      roomUrl,
      token: tokenData.token,
      expiresAt: new Date(scheduledFor.getTime() + 2 * 60 * 60 * 1000),
    }
  } catch (error) {
    console.error('[VideoService] Error creating video room:', error)
    throw error
  }
}

/**
 * Get a join token for a specific user and role
 *
 * @param appointmentId - The appointment ID
 * @param userId - The user ID (patient or doctor)
 * @param role - 'patient' or 'doctor'
 * @param userName - Display name for the user
 * @returns Meeting token
 */
export async function getJoinToken(
  appointmentId: string,
  userId: string,
  role: 'patient' | 'doctor',
  userName: string
): Promise<string> {
  const config = getVideoConfig()
  const roomName = `apt-${appointmentId}`

  const response = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
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

/**
 * Update video status for an appointment
 *
 * This should be called from the API route, not directly from client code
 *
 * @param supabase - Supabase client
 * @param appointmentId - The appointment ID
 * @param status - New video status
 */
export async function updateVideoStatus(
  supabase: any,
  appointmentId: string,
  status: 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed',
  additionalData?: {
    videoStartedAt?: string
    videoEndedAt?: string
    consultationNotes?: string
  }
): Promise<void> {
  const updateData: any = {
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

  const { error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)

  if (error) {
    console.error('[VideoService] Error updating video status:', error)
    throw new Error(`Failed to update video status: ${error.message}`)
  }
}

/**
 * Check if a video appointment is joinable (within 15 minutes and ready)
 *
 * @param appointment - The appointment object
 * @returns true if the appointment can be joined
 */
export function isVideoAppointmentJoinable(appointment: {
  start_ts: string
  appointment_type?: string
  video_status?: string
  video_room_url?: string | null
}): boolean {
  if (!appointment.video_room_url) {
    return false
  }

  if (appointment.appointment_type !== 'video') {
    return false
  }

  const now = new Date()
  const startTime = new Date(appointment.start_ts)
  const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000)

  return (
    appointment.video_status === 'ready' ||
    appointment.video_status === 'in_progress' ||
    now >= fifteenMinutesBefore
  )
}

/**
 * Calculate video call duration in minutes
 *
 * @param appointment - The appointment object
 * @returns Duration in minutes, or null if not started
 */
export function getVideoCallDuration(appointment: {
  video_started_at?: string | null
  video_ended_at?: string | null
}): number | null {
  if (!appointment.video_started_at) {
    return null
  }

  const startTime = new Date(appointment.video_started_at)
  const endTime = appointment.video_ended_at ? new Date(appointment.video_ended_at) : new Date()

  return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))
}

/**
 * Get video status display text in Spanish
 *
 * @param status - Video status
 * @returns Spanish display text
 */
export function getVideoStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    ready: 'Lista para unirse',
    in_progress: 'En curso',
    completed: 'Completada',
    missed: 'Perdida',
  }

  return statusMap[status] || status
}
