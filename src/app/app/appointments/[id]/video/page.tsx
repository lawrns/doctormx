'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface VideoRoomData {
  roomUrl: string
  token: string
  appointment: {
    id: string
    startTs: string
    endTs: string
    doctorId: string
  }
}

type CallState = 'loading' | 'precall' | 'connecting' | 'connected' | 'ended'

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string

  const [callState, setCallState] = useState<CallState>('loading')
  const [roomData, setRoomData] = useState<VideoRoomData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; message: string; time: string }>>([])
  const [chatInput, setChatInput] = useState('')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const dailyRef = useRef<any>(null)

  // Load video room data
  useEffect(() => {
    async function loadRoom() {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}/video`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar la videoconsulta')
        }

        setRoomData(data)
        setCallState('precall')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la videoconsulta')
        setCallState('ended')
      }
    }

    loadRoom()
  }, [appointmentId])

  // Initialize Daily.co when user joins
  const joinCall = async () => {
    if (!roomData) return

    setCallState('connecting')

    try {
      // Dynamically import Daily.co
      const { default: DailyIframe } = await import('@daily-co/daily-js')

      const callFrame = DailyIframe.createFrame({
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
        },
      })

      // Set up event listeners
      callFrame.on('joined-meeting', () => {
        setCallState('connected')
        startCallTimer()
      })

      callFrame.on('left-meeting', () => {
        endCall()
      })

      callFrame.on('error', (e: any) => {
        console.error('Video call error:', e)
        setError('Error en la llamada')
        setCallState('ended')
      })

      // Join the room
      await callFrame.join({
        url: roomData.roomUrl,
        token: roomData.token,
      })

      dailyRef.current = callFrame
    } catch (err) {
      console.error('Failed to join call:', err)
      setError('Error al unirse a la llamada')
      setCallState('ended')
    }
  }

  // Start call duration timer
  const startCallTimer = () => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setCallDuration(minutes * 60 + seconds)
    }, 1000)

    return () => clearInterval(interval)
  }

  // End the call
  const endCall = async () => {
    if (dailyRef.current) {
      try {
        dailyRef.current.leave()
      } catch (e) {
        console.error('Error leaving call:', e)
      }
    }

    // Update video status
    await fetch(`/api/appointments/${appointmentId}/video`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end' }),
    })

    setCallState('ended')
    router.push('/app/appointments')
  }

  const toggleMute = () => {
    if (dailyRef.current) {
      if (isMuted) {
        dailyRef.current.setLocalAudio(true)
      } else {
        dailyRef.current.setLocalAudio(false)
      }
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (dailyRef.current) {
      if (isVideoOff) {
        dailyRef.current.setLocalVideo(true)
      } else {
        dailyRef.current.setLocalVideo(false)
      }
      setIsVideoOff(!isVideoOff)
    }
  }

  const sendChatMessage = () => {
    if (!chatInput.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      sender: 'me',
      message: chatInput,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages([...chatMessages, newMessage])
    setChatInput('')

    // In a real implementation, you would send this via WebSocket or the video service
    // For now, this is a local-only demonstration
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Pre-call checklist
  if (callState === 'precall' && roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Videoconsulta</h1>
            <p className="text-muted-foreground">
              {new Date(roomData.appointment.startTs).toLocaleString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-vital-soft border border-border rounded-xl">
              <svg className="w-6 h-6 text-vital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-foreground">Sala lista</p>
                <p className="text-sm text-muted-foreground">La videoconsulta está configurada y lista para comenzar</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Antes de unirte:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-vital mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Asegúrate de estar en un lugar con buena iluminación
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-vital mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Conexión a internet estable
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-vital mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Usa auriculares para mejor calidad de audio
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-vital mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ten a la mano tus síntomas o preguntas
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={joinCall}
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Unirse a la llamada
              </Button>
              <Link href="/app/appointments">
                <Button size="lg" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Loading state
  if (callState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando videoconsulta...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/app/appointments')} variant="outline">
              Volver a mis citas
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Main video call interface
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="nav-sticky sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/appointments" className="text-foreground hover:text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-foreground font-semibold">Videoconsulta</h1>
            {callState === 'connected' && (
              <p className="text-muted-foreground text-sm">{formatDuration(callDuration)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {callState === 'connected' && (
            <>
              <Badge variant="success">En curso</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(!showChat)}
                className="text-foreground hover:text-muted-foreground relative"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative bg-black">
          {callState === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-foreground">
                <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Conectando...</p>
              </div>
            </div>
          )}

          {/* Daily.co iframe container */}
          <div id="daily-call-frame" className="w-full h-full" />

          {/* Control bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="icon"
                className={`rounded-full h-14 w-14 ${
                  isMuted ? 'bg-muted text-foreground' : 'bg-card text-foreground'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button
                onClick={toggleVideo}
                variant="outline"
                size="icon"
                className={`rounded-full h-14 w-14 ${
                  isVideoOff ? 'bg-muted text-foreground' : 'bg-card text-foreground'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </Button>

              <Button
                onClick={endCall}
                variant="destructive"
                size="icon"
                className="rounded-full h-14 w-14"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Self view (picture-in-picture) */}
          {!isVideoOff && (
            <div className="absolute top-4 right-4 w-40 h-30 bg-card rounded-xl overflow-hidden border-2 border-border shadow-lg">
              {/* Self video would be rendered here by Daily.co */}
            </div>
          )}

          {/* Connection quality indicator */}
          {callState === 'connected' && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-vital rounded-full" />
              <span className="text-foreground text-sm">Buena conexión</span>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-foreground font-semibold">Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.sender === 'me' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                />
                <Button
                  onClick={sendChatMessage}
                  variant="default"
                  size="icon"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18 9 18-2z" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
