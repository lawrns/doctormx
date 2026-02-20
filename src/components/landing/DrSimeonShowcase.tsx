'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertTriangle, Stethoscope } from 'lucide-react'
import { getBlurDataURL } from '@/lib/performance/image-blur'

// Dr. Simeon Avatar Component - Now with real face and gradient ring!
function DrSimeonAvatar({ size = 'default' }: { size?: 'default' | 'large' }) {
  const sizeClasses = size === 'large' ? 'h-14 w-14' : 'h-10 w-10'
  const ringSize = size === 'large' ? 'h-[60px] w-[60px]' : 'h-[44px] w-[44px]'

  return (
    <div className="relative">
      {/* Animated gradient ring */}
      <motion.div
        className={`absolute -inset-[3px] ${ringSize} rounded-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-[length:200%_100%]`}
        animate={{
          backgroundPosition: ['0% center', '200% center'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className={`relative ${sizeClasses} rounded-full overflow-hidden shadow-lg border-2 border-white`}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Image
          src="/images/simeon.png"
          alt="Dr. Simeon"
          fill
          sizes="(max-width: 768px) 40px, 56px"
          className="object-cover"
          placeholder="blur"
          blurDataURL={getBlurDataURL('simeon')}
        />
      </motion.div>
    </div>
  )
}

// Patient Avatar Component
function PatientAvatar() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  )
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center space-x-1 px-4 py-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <motion.span
        className="h-2 w-2 rounded-full bg-gray-400"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-gray-400"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-gray-400"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </motion.div>
  )
}

type Message = {
  id: number
  role: 'patient' | 'ai'
  content: string
  timestamp: string
}

const conversationScript: Omit<Message, 'id'>[] = [
  {
    role: 'patient',
    content: 'Hola, tengo un dolor de cabeza muy fuerte desde hace 2 horas',
    timestamp: '10:34',
  },
  {
    role: 'ai',
    content:
      'Entiendo, María. Vamos a evaluar esto juntos. ¿El dolor apareció de manera repentina o fue gradual?',
    timestamp: '10:34',
  },
  {
    role: 'patient',
    content: 'Fue muy repentino, como un trueno',
    timestamp: '10:35',
  },
  {
    role: 'ai',
    content:
      '¿El dolor se queda en un lugar o se extiende hacia el cuello u otra zona?',
    timestamp: '10:35',
  },
  {
    role: 'patient',
    content: 'Se extiende hacia mi cuello y me duele al mover la cabeza',
    timestamp: '10:36',
  },
  {
    role: 'ai',
    content:
      'En una escala de 1 a 10, ¿qué tan intenso es el dolor? ¿Has tenido fiebre, náusea o vómito?',
    timestamp: '10:36',
  },
  {
    role: 'patient',
    content: 'Es un 8/10. Sí, tengo náusea pero no he vomitado',
    timestamp: '10:37',
  },
  {
    role: 'ai',
    content:
      'Resumen: Dolor de cabeza súbito e intenso con rigidez de nuca.\n\nRecomendación: Busca atención médica urgente. Te conectaré con un neurólogo disponible ahora.',
    timestamp: '10:38',
  },
]

function AnimatedMessage({
  message,
  index,
}: {
  message: Message
  index: number
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isTyping, setIsTyping] = useState(message.role === 'ai')

  useEffect(() => {
    if (message.role === 'patient') {
      setDisplayedContent(message.content)
      return
    }

    // Typing animation for AI messages
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= message.content.length) {
        setDisplayedContent(message.content.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 20)

    return () => clearInterval(typingInterval)
  }, [message])

  const isPatient = message.role === 'patient'

  return (
    <motion.div
      initial={{ opacity: 0, x: isPatient ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.3,
        ease: 'easeOut',
      }}
      className={`flex items-end gap-2 ${isPatient ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isPatient && <DrSimeonAvatar />}

      <div
        className={`flex max-w-[75%] flex-col ${isPatient ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isPatient
              ? 'bg-[#5588ff] text-white'
              : 'border border-gray-200 bg-white text-gray-900'
          }`}
        >
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {displayedContent}
            {isTyping && (
              <motion.span
                className="ml-1 inline-block h-4 w-0.5 bg-current"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>
        </div>
        <span
          className={`mt-1 text-xs text-gray-400 ${isPatient ? 'mr-2' : 'ml-2'}`}
        >
          {message.timestamp}
        </span>
      </div>

      {isPatient && <PatientAvatar />}
    </motion.div>
  )
}

// Animated background blobs
function AnimatedBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export default function DrSimeonShowcase() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isShowingTyping, setIsShowingTyping] = useState(false)

  useEffect(() => {
    if (currentMessageIndex >= conversationScript.length) {
      return
    }

    const nextMessage = conversationScript[currentMessageIndex]
    const isAI = nextMessage.role === 'ai'

    // Show typing indicator for AI messages
    if (isAI) {
      setIsShowingTyping(true)
      const typingDelay = setTimeout(() => {
        setIsShowingTyping(false)
        setMessages((prev) => [
          ...prev,
          { ...nextMessage, id: currentMessageIndex },
        ])
        setCurrentMessageIndex((prev) => prev + 1)
      }, 1500)

      return () => clearTimeout(typingDelay)
    } else {
      // Patient messages appear immediately
      const delay = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { ...nextMessage, id: currentMessageIndex },
        ])
        setCurrentMessageIndex((prev) => prev + 1)
      }, 800)

      return () => clearTimeout(delay)
    }
  }, [currentMessageIndex])

  const resetConversation = () => {
    setMessages([])
    setCurrentMessageIndex(0)
    setIsShowingTyping(false)
  }

  return (
    <section className="relative overflow-hidden bg-[#f9f7f4] py-24">
      <AnimatedBlobs />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Column: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              Asistente IA Médico
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Dr. Simeon AI
              <span className="block text-blue-600">
                Tu Evaluación Inicial Inteligente
              </span>
            </h2>

            <p className="text-lg leading-relaxed text-gray-600">
              Nuestro asistente con IA médica realiza una evaluación completa
              de tus síntomas usando metodología OPQRST, detecta señales de
              alerta y te conecta con el especialista adecuado en minutos.
            </p>

            <ul className="space-y-3">
              {[
                { text: 'Evaluación de síntomas en 5 minutos', icon: Clock },
                { text: 'Detección de emergencias médicas', icon: AlertTriangle },
                { text: 'Recomendación de especialista ideal', icon: Stethoscope },
                { text: 'Disponible 24/7, siempre contigo', icon: CheckCircle },
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <feature.icon className="h-5 w-5 shrink-0 text-blue-600" />
                  {feature.text}
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Agendar Consulta
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-200 hover:bg-blue-50"
              >
                Probar IA Ahora
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              La IA asiste, no diagnostica. Respaldo médico certificado.
            </p>
          </motion.div>

          {/* Right Column: Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative mx-auto max-w-md overflow-hidden bg-white shadow-2xl">
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                <DrSimeonAvatar />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Dr. Simeon</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                    <span className="text-xs text-gray-500">En línea</span>
                  </div>
                </div>
                <button
                  onClick={resetConversation}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Reiniciar conversación"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-[500px] space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <AnimatedMessage
                      key={message.id}
                      message={message}
                      index={index}
                    />
                  ))}

                  {isShowingTyping && (
                    <div className="flex items-end gap-2">
                      <DrSimeonAvatar />
                      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Input (Disabled - Demo Only) */}
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 opacity-60">
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    disabled
                    className="flex-1 bg-transparent text-sm text-gray-400 outline-none"
                  />
                  <button
                    disabled
                    className="rounded-full bg-blue-600 p-2 text-white opacity-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
