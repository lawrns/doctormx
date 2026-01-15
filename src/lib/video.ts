// Sistema de videollamadas - Simple usando Daily.co
// Alternativa: Puedes usar Whereby, Jitsi, o Zoom API

const DAILY_API_KEY = process.env.DAILY_API_KEY || ''
const DAILY_API_URL = 'https://api.daily.co/v1'

// Helper: Crear sala de videollamada
export async function createVideoRoom(appointmentId: string) {
  // Opción simple: Generar URL única sin API externa
  // Puedes usar servicios como daily.co, whereby.com, o jitsi

  const roomName = `doctory-${appointmentId}`

  if (!DAILY_API_KEY) {
    // Fallback: URL simple usando Jitsi (gratis, no requiere API)
    return {
      url: `https://meet.jit.si/doctory-${appointmentId}`,
      roomName,
      provider: 'jitsi',
    }
  }

  // Con Daily.co API (requiere configuración)
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
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 7200, // 2 horas
        },
      }),
    })

    const room = await response.json()
    return {
      url: room.url,
      roomName: room.name,
      provider: 'daily',
    }
  } catch {
    // Fallback a Jitsi si Daily falla
    return {
      url: `https://meet.jit.si/doctory-${appointmentId}`,
      roomName,
      provider: 'jitsi',
    }
  }
}

// Helper: Obtener URL de videollamada para cita
export async function getOrCreateVideoRoom(appointmentId: string) {
  // En producción, guardarías esto en la tabla appointments
  // Por ahora, generamos URL simple
  return {
    url: `https://meet.jit.si/doctory-${appointmentId}`,
    provider: 'jitsi',
  }
}
