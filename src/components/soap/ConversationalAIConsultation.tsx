'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot, Loader2, AlertCircle, ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { RecommendedDoctors } from '@/components/soap/RecommendedDoctors'
import { TreatmentPlanDisplay } from '@/components/soap/TreatmentPlanDisplay'
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

export function ConversationalAIConsultation({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy tu asistente médico de Doctor.mx. ¿Qué te está molestando hoy? Describe tus síntomas de forma natural y te ayudaré a entender qué podría estar pasando.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ConsultationResult | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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

      const data = await response.json()

      if (data.complete) {
        setResult(data.result)
        setIsComplete(true)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.message,
            metadata: {
              specialists: data.result.specialists.map((s: any) => s.name),
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
        messages={messages}
        onNewConsultation={() => {
          setIsComplete(false)
          setResult(null)
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: 'Hola, soy tu asistente médico de Doctor.mx. ¿Qué te está molestando hoy?',
            },
          ])
        }}
        userId={userId}
      />
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold">Consulta con Dr. Simeon</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Describe tus síntomas de forma natural. Te ayudaré a entender qué podría estar pasando.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-4 min-h-0">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Los especialistas están analizando...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex-shrink-0 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Describe tus síntomas..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
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
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </motion.div>
  )
}

function ResultsView({
  result,
  messages,
  onNewConsultation,
  userId,
}: {
  result: ConsultationResult
  messages: Message[]
  onNewConsultation: () => void
  userId: string
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Resultado de tu Consulta</h2>
            <p className="text-gray-500">Análisis multi-especialista completado</p>
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
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-600 font-medium">Diagnóstico Principal</p>
            <p className="text-lg font-semibold text-gray-900">{result.primaryDiagnosis}</p>
            <p className="text-sm text-gray-500">Confianza: {Math.round(result.confidence * 100)}%</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-sm text-amber-600 font-medium">Nivel de Urgencia</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{result.urgency}</p>
            <p className="text-sm text-gray-500">
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
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">{specialist.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{specialist.name}</p>
                      <span className="text-sm text-gray-500">{specialist.specialty}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{specialist.assessment}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Confianza: {Math.round(specialist.confidence * 100)}%
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
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      <RecommendedDoctors
        consultationId={result.id}
        consensus={result.consensus}
        patientHistory={{}}
        onSelectDoctor={() => {}}
      />
    </div>
  )
}
