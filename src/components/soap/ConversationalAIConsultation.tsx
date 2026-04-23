'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Stethoscope, User, Loader2, ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SupportPresenceOrb } from '@/components/support/SupportPresenceOrb'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'
import { cn } from '@/lib/utils'
import { RecommendedDoctors } from '@/components/soap/RecommendedDoctors'
import type { ConsensusResult } from '@/lib/soap/types'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    specialists?: string[]
    confidence?: number
    urgency?: 'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care'
  }
}

interface ConsultationResult {
  id: string
  primaryDiagnosis: string
  confidence: number
  specialists: Array<{
    id: string
    name: string
    specialty: string
    assessment: string
    confidence: number
  }>
  differentialDiagnoses: string[]
  urgency: 'emergency' | 'urgent' | 'moderate' | 'routine' | 'self-care'
  recommendations: string[]
  nextSteps: string[]
  consensus: ConsensusResult
}

type ConsultationApiResponse =
  | {
      complete: true
      message: string
      result: ConsultationResult
    }
  | {
      complete: false
      message: string
      result?: never
    }

export function ConversationalAIConsultation({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy Dr. Simeon. Cuéntame qué te está pasando y te ayudaré a ordenar el caso con una primera orientación clínica.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ConsultationResult | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasTrackedStart = useRef(false)
  const hasTrackedComplete = useRef(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (hasTrackedStart.current) {
      return
    }

    hasTrackedStart.current = true
    void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_STARTED, {
      surface: 'soap-consultation',
      userId,
    })
  }, [userId])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          patientId: userId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data: ConsultationApiResponse = await response.json()

      if (data.complete) {
        setResult(data.result)
        setIsComplete(true)
        if (!hasTrackedComplete.current) {
          hasTrackedComplete.current = true
          void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_COMPLETED, {
            surface: 'soap-consultation',
            userId,
            consultationId: data.result?.id,
            diagnosis: data.result?.primaryDiagnosis,
            urgency: data.result?.urgency,
          })
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message,
            metadata: {
              specialists: data.result.specialists.map((specialist) => specialist.name),
              confidence: data.result.confidence,
              urgency: data.result.urgency,
            },
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message,
          },
        ])
      }
    } catch (error) {
      console.error('Failed to get consultation response', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (isComplete && result) {
    return (
      <ResultsView
        result={result}
        onNewConsultation={() => {
          hasTrackedComplete.current = false
          void trackClientEvent(ANALYTICS_EVENTS.AI_CONSULT_STARTED, {
            surface: 'soap-consultation',
            userId,
            restarted: true,
          })
          setIsComplete(false)
          setResult(null)
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: 'Hola, soy Dr. Simeon. Cuéntame qué te está pasando y seguimos desde ahí.',
            },
          ])
        }}
      />
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-80px)] max-w-3xl flex-col">
      <Card className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border-border/70 shadow-sm">
        <div className="flex-shrink-0 border-b border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-ink" />
            <h2 className="font-semibold font-display">Preconsulta con Dr. Simeon</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Describe tus síntomas de forma natural. Te ayudaré a ordenar el caso antes de consultar con un doctor.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-4 min-h-0">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Dr. Simeon está ordenando el caso...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-border/60 bg-card p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Describe tus síntomas..."
              className="flex-1 rounded-lg border border-border/70 bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-ink hover:bg-ink"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0 pt-0.5">
          <SupportPresenceOrb size="sm" imageClassName="object-cover object-top scale-[1.06]" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-3',
          isUser ? 'bg-ink text-primary-foreground' : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}

function ResultsView({
  result,
  onNewConsultation,
}: {
  result: ConsultationResult
  onNewConsultation: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="rounded-xl border-border/70 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold font-display">Resumen clínico listo</h2>
            <p className="text-muted-foreground">Tu caso quedó ordenado para compartir con un doctor.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/app">
              <Button variant="ghost" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Volver al Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={onNewConsultation}>
              Nueva Consulta
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-sm text-primary font-medium">Orientación principal</p>
            <p className="text-lg font-semibold text-foreground">{result.primaryDiagnosis}</p>
            <p className="text-sm text-muted-foreground">Puede cambiar tras valoración médica.</p>
          </div>
          <div className="bg-coral/5 rounded-xl p-4">
            <p className="text-sm text-coral font-medium">Nivel de Urgencia</p>
            <p className="text-lg font-semibold text-foreground capitalize">{result.urgency}</p>
            <p className="text-sm text-muted-foreground">
              {result.urgency === 'emergency' && 'Ve al hospital ahora'}
              {result.urgency === 'urgent' && 'Consulta en 24-48 horas'}
              {result.urgency === 'moderate' && 'Cita en 1-2 semanas'}
              {result.urgency === 'routine' && 'Cita programada'}
              {result.urgency === 'self-care' && 'Autocuidado recomendado'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Evaluación de Especialistas</h3>
          <div className="grid gap-3">
            {result.specialists.map((specialist) => (
              <Card key={specialist.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg text-primary">{specialist.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{specialist.name}</p>
                      <span className="text-sm text-muted-foreground">{specialist.specialty}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{specialist.assessment}</p>
                    <p className="text-sm text-primary mt-1">
                      Revisión completada
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recomendaciones</h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      <RecommendedDoctors
        consultationId={result.id}
        consensus={result.consensus}
        onSelectDoctor={() => {}}
      />
    </div>
  )
}
