'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { PreConsultaMessage } from '@/lib/ai/types'

export default function SecondOpinionPage() {
  const [isActive] = useState(true)
  const [messages, setMessages] = useState<PreConsultaMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with greeting
  useEffect(() => {
    if (isActive && messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '¡Hola! 👋 Bienvenido a tu consulta de IA Segunda Opinión - completamente GRATIS para todos en México.\n\nMe gustaría ayudarte a obtener una segunda opinión profesional sobre tu diagnóstico o tratamiento actual.\n\n¿Cuál es el motivo principal de tu consulta? Por favor, comparte los detalles de tu situación médica.',
          timestamp: new Date(),
        },
      ])
    }
  }, [isActive, messages.length])

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: PreConsultaMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/preconsulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: [...messages, userMessage],
          mode: 'second-opinion', // Special mode for second opinion
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al procesar tu solicitud')
      }

      const data = await response.json()

      const assistantMessage: PreConsultaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      const errorMessage: PreConsultaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Disculpa, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Doctor.mx</span>
          </Link>
          <Link href="/app" className="text-sm text-gray-600 hover:text-gray-900">
            Volver
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-primary-50 text-primary-600 border-primary-200">
              ✓ GRATIS
            </Badge>
            <Badge className="bg-success-500 bg-opacity-10 text-success-500 border-success-500 border-opacity-30">
              Powered by AI
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Segunda Opinión con IA
          </h1>
          <p className="text-lg text-gray-600">
            Obtén una segunda opinión profesional impulsada por IA. Completamente gratis para todos en México.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="border border-primary-100 shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Iniciando conversación...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-primary-100 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-primary-100 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <Alert variant="destructive" className="border-0 bg-transparent p-0">
                <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta o síntomas..."
                disabled={isLoading}
                className="flex-1 border-primary-200 focus:border-primary-500 focus:ring-primary-500"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {isLoading ? '...' : 'Enviar'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Comparte tu historial médico, síntomas y preguntas específicas para una mejor segunda opinión.
            </p>
          </div>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="p-4 border-primary-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Instant</h3>
                <p className="text-xs text-gray-600 mt-1">Respuestas inmediatas impulsadas por IA</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-primary-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Gratis</h3>
                <p className="text-xs text-gray-600 mt-1">Para todos en México, sin costos</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-primary-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Privado</h3>
                <p className="text-xs text-gray-600 mt-1">Tu información está protegida</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>Aviso:</strong> Esta segunda opinión impulsada por IA es una herramienta de apoyo educativo y no debe considerarse como asesoramiento médico profesional. Siempre consulta con un profesional médico calificado para diagnósticos definitivos y tratamientos médicos.
          </p>
        </div>
      </div>
    </div>
  )
}
