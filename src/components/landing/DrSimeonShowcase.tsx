'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertTriangle, Stethoscope, ArrowRight, MessageCircle } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import Link from 'next/link'

// Dr. Simeón Avatar Component
function DrSimeonAvatar({ size = 'default' }: { size?: 'default' | 'large' }) {
  const sizeClasses = size === 'large' ? 'h-14 w-14' : 'h-10 w-10'
  const ringSize = size === 'large' ? 'h-[60px] w-[60px]' : 'h-[44px] w-[44px]'

  return (
    <div className="relative">
      {/* Vital pulse ring */}
      <motion.div
        className={`absolute -inset-[3px] ${ringSize} rounded-full bg-gradient-to-r from-[#0d72d6] via-[#8fc4ff] to-[#0d72d6] bg-[length:200%_100%]`}
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
        className={`relative ${sizeClasses} overflow-hidden rounded-full border-2 border-white shadow-lg`}
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
          alt="Dr. Simeón"
          fill
          sizes="(max-width: 768px) 40px, 56px"
          className="object-cover"
        />
      </motion.div>
    </div>
  )
}

// Patient Avatar Component
function PatientAvatar() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef0f5] text-[#5c6783]">
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
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
      <motion.span className="h-2 w-2 rounded-full bg-[#5c6783]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
      <motion.span className="h-2 w-2 rounded-full bg-[#5c6783]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
      <motion.span className="h-2 w-2 rounded-full bg-[#5c6783]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
    </motion.div>
  )
}

type Message = {
  id: number
  role: 'patient' | 'ai'
  content: string
  label: string
}

const conversationScript: Omit<Message, 'id'>[] = [
  { role: 'patient', content: 'Tengo un dolor de cabeza muy fuerte desde hace dos horas', label: 'Contexto' },
  { role: 'ai', content: 'Voy a evaluarlo contigo. ¿Apareció de forma repentina o fue gradual?', label: 'Pregunta clínica' },
  { role: 'patient', content: 'Fue muy repentino, como un trueno', label: 'Respuesta' },
  { role: 'ai', content: '¿Se queda en una zona o se extiende al cuello u otra parte?', label: 'Exploración' },
  { role: 'patient', content: 'Se extiende al cuello y me duele mover la cabeza', label: 'Respuesta' },
  { role: 'ai', content: 'En una escala de 1 a 10, ¿qué tan intenso es? ¿Hay fiebre, náusea o vómito?', label: 'Exploración' },
  { role: 'patient', content: 'Es un 8/10 y tengo náusea', label: 'Respuesta' },
  { role: 'ai', content: 'Resumen: dolor súbito e intenso con rigidez. Recomendación: atención urgente.', label: 'Salida clínica' },
]

function AnimatedMessage({ message, index }: { message: Message; index: number }) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isTyping, setIsTyping] = useState(message.role === 'ai')

  useEffect(() => {
    if (message.role === 'patient') {
      setDisplayedContent(message.content)
      return
    }
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
      transition={{ duration: 0.4, delay: index * 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isPatient ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isPatient && <DrSimeonAvatar />}

      <div className={`flex max-w-[75%] flex-col ${isPatient ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-[12px] px-4 py-3 shadow-sm ${
            isPatient
              ? 'bg-[#0d72d6] text-white'
              : 'border border-[#d4d9e3] bg-card text-[#0a1533]'
          }`}
        >
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {displayedContent}
            {isTyping && (
              <motion.span className="ml-1 inline-block h-4 w-0.5 bg-current" animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
            )}
          </p>
        </div>
        <span className={`mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#5c6783] ${isPatient ? 'mr-2' : 'ml-2'}`}>
          {message.label}
        </span>
      </div>

      {isPatient && <PatientAvatar />}
    </motion.div>
  )
}

export default function DrSimeonShowcase() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isShowingTyping, setIsShowingTyping] = useState(false)

  useEffect(() => {
    if (currentMessageIndex >= conversationScript.length) return
    const nextMessage = conversationScript[currentMessageIndex]
    const isAI = nextMessage.role === 'ai'
    if (isAI) {
      setIsShowingTyping(true)
      const typingDelay = setTimeout(() => {
        setIsShowingTyping(false)
        setMessages((prev) => [...prev, { ...nextMessage, id: currentMessageIndex }])
        setCurrentMessageIndex((prev) => prev + 1)
      }, 1500)
      return () => clearTimeout(typingDelay)
    } else {
      const delay = setTimeout(() => {
        setMessages((prev) => [...prev, { ...nextMessage, id: currentMessageIndex }])
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
    <section className="relative overflow-hidden border-y border-border bg-[#f7f8fb] py-16 sm:py-20">
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
            <Eyebrow>Caso clínico ilustrativo</Eyebrow>

            <h2 className="font-display text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-[#0a1533]">
              Dr. Simeón no fuerza una reserva.
              <span className="block text-[#0b5fb8]">Primero cuida el contexto clínico.</span>
            </h2>

            <p className="text-lg leading-relaxed text-[#5c6783]">
              Este panel muestra cómo una orientación seria recoge síntomas, detecta señales de alarma y deriva a atención humana cuando no conviene seguir con un flujo comercial.
            </p>

            <ul className="space-y-3">
              {[
                { text: 'Recoge contexto antes de recomendar una especialidad', icon: Clock },
                { text: 'Escala señales de alarma fuera del flujo comercial', icon: AlertTriangle },
                { text: 'Conecta con médicos verificados cuando aplica', icon: Stethoscope },
                { text: 'Explica que no reemplaza urgencias ni diagnóstico', icon: CheckCircle },
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-[#1c2647]"
                >
                  <feature.icon className="h-5 w-5 shrink-0 text-[#0d72d6]" />
                  {feature.text}
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button asChild variant="hero" size="lg">
                <Link href="/ai-consulta">
                  Hablar con Dr. Simeón
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/doctors">Ver médicos verificados</Link>
              </Button>
            </div>

            <p className="text-sm text-[#5c6783]">
              La IA asiste, no diagnostica. Este flujo es un ejemplo, no una consulta real.
            </p>
          </motion.div>

          {/* Right Column: Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative mx-auto max-w-md overflow-hidden rounded-[12px] border-[#d4d9e3] bg-card p-0 shadow-[0_20px_40px_-18px_rgba(15,37,95,0.18)]">
              {/* Chat Header — Ink background */}
                  <div className="flex items-center gap-3 bg-[#0a1533] px-6 py-4">
                    <DrSimeonAvatar />
                    <div className="flex-1">
                      <h3 className="font-display text-sm font-semibold text-[#f7f8fb]">Dr. Simeón</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#0d72d6]" />
                        <span className="text-xs text-[#f7f8fb]/70">Ejemplo ilustrativo</span>
                      </div>
                    </div>
                <button
                  onClick={resetConversation}
                  className="rounded-full p-2 text-[#f7f8fb]/50 transition-colors hover:bg-card/10 hover:text-[#f7f8fb]"
                  aria-label="Reiniciar conversación"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="h-[440px] space-y-4 overflow-y-auto bg-gradient-to-b from-[#f7f8fb]/50 to-white p-5">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <AnimatedMessage key={message.id} message={message} index={index} />
                  ))}
                  {isShowingTyping && (
                    <div className="flex items-end gap-2">
                      <DrSimeonAvatar />
                      <div className="rounded-[12px] border border-[#d4d9e3] bg-card shadow-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Input (Disabled - Demo Only) */}
                  <div className="border-t border-[#d4d9e3] bg-[#f7f8fb] p-4">
                  <div className="flex items-center gap-2 rounded-[10px] border border-[#d4d9e3] bg-card px-4 py-2 opacity-60">
                    <input
                      type="text"
                      placeholder="Ejemplo clínico ilustrativo"
                      disabled
                      className="flex-1 bg-transparent text-sm text-[#5c6783] outline-none"
                    />
                  <button disabled className="rounded-full bg-[#0d72d6] p-2 text-white opacity-50">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
