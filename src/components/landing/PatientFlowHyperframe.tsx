'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  MessageCircle,
  Brain,
  Stethoscope,
  CalendarCheck,
  CheckCircle2,
  Star,
  ChevronRight,
  Heart,
} from 'lucide-react'

const STEPS = [
  {
    id: 'chat',
    icon: MessageCircle,
    label: '1. Cuéntanos',
    accent: '#1f48de',
  },
  {
    id: 'analysis',
    icon: Brain,
    label: '2. Analizamos',
    accent: '#00a878',
  },
  {
    id: 'match',
    icon: Stethoscope,
    label: '3. Conectamos',
    accent: '#1f48de',
  },
  {
    id: 'confirm',
    icon: CalendarCheck,
    label: '4. Listo',
    accent: '#00a878',
  },
] as const

const STEP_DURATION = 3500

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between px-5 pt-3">
      {STEPS.map((step, i) => {
        const isActive = i === currentStep
        const isDone = i < currentStep
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <motion.div
              className="flex items-center gap-1.5"
              animate={{ opacity: isActive || isDone ? 1 : 0.35 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDone
                    ? '#00a878'
                    : isActive
                      ? step.accent
                      : '#eef0f5',
                }}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : (
                  <step.icon
                    className="h-3 w-3"
                    style={{
                      color: isActive ? '#fff' : '#5c6783',
                    }}
                  />
                )}
              </div>
              <span
                className="hidden text-[10px] font-medium sm:block"
                style={{
                  color: isActive ? '#0a1533' : '#5c6783',
                }}
              >
                {step.label}
              </span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div
                className="mx-1 h-px w-3 sm:w-6"
                style={{
                  backgroundColor: isDone ? '#00a878' : '#eef0f5',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChatStep() {
  const messages = [
    { role: 'user' as const, text: 'Tengo migraña desde ayer y no me deja dormir' },
    { role: 'ai' as const, text: 'Voy a hacerte unas preguntas para evaluarte mejor, María.' },
  ]

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-3">
      <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fb] px-3 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1f48de] to-[#0f255f]">
          <Heart className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#0a1533]">Dr. Simeon</p>
          <p className="text-[9px] text-[#00a878]">En línea</p>
        </div>
      </div>
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12, x: msg.role === 'user' ? 16 : -16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: i * 0.5 + 0.2, duration: 0.4, ease: 'easeOut' }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? 'rounded-br-sm bg-[#1f48de] text-white'
                : 'rounded-bl-sm border border-[#d4d9e3] bg-white text-[#0a1533]'
            }`}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.3 }}
        className="mt-auto flex items-center gap-2 rounded-full border border-[#d4d9e3] bg-white px-3 py-2"
      >
        <span className="flex-1 text-[11px] text-[#5c6783]/60">Escribe tus síntomas...</span>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1f48de]">
          <ChevronRight className="h-3 w-3 text-white" />
        </div>
      </motion.div>
    </div>
  )
}

function AnalysisStep() {
  const steps = [
    { label: 'Analizando síntomas', done: true },
    { label: 'Evaluando severidad', done: true },
    { label: 'Identificando especialidad', done: false },
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-5 py-4">
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00a878]/10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'backOut' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="h-8 w-8 text-[#00a878]" />
        </motion.div>
      </motion.div>
      <motion.p
        className="text-center text-sm font-semibold text-[#0a1533]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Analizando tu caso...
      </motion.p>
      <div className="w-full space-y-2.5">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 + 0.3, duration: 0.3 }}
            className="flex items-center gap-2.5 rounded-lg border border-[#d4d9e3] bg-white px-3 py-2"
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00a878]" />
            ) : (
              <motion.div
                className="h-4 w-4 shrink-0 rounded-full border-2 border-[#1f48de] border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <span className="text-[12px] text-[#1c2647]">{step.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function DoctorMatchStep() {
  return (
    <div className="flex h-full flex-col gap-3 px-4 py-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg bg-[#00a878]/8 px-3 py-2 text-center"
      >
        <p className="text-[11px] font-medium text-[#00a878]">
          Especialidad recomendada: <strong>Neurología</strong>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        className="rounded-xl border border-[#d4d9e3] bg-white p-3.5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dbe7ff]">
            <Stethoscope className="h-5 w-5 text-[#1f48de]" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#0a1533]">Dra. Elena Vázquez</p>
            <p className="text-[11px] text-[#5c6783]">Neuróloga · Cédula 12345678</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < 5 ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#d4d9e3]'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#5c6783]">4.9 (324 reseñas)</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-[#5c6783]">
            <span>Próxima cita: hoy 3:00 PM</span>
          </div>
          <span className="text-[13px] font-semibold text-[#0a1533]">$400 MXN</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="rounded-xl border border-[#d4d9e3] bg-white p-3 opacity-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f5]">
            <Stethoscope className="h-4 w-4 text-[#5c6783]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#5c6783]">Dr. Carlos Méndez</p>
            <p className="text-[10px] text-[#5c6783]/70">Neurólogo · Disponible mañana</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="mt-auto flex items-center justify-center rounded-xl bg-[#1f48de] py-2.5 text-[12px] font-semibold text-white shadow-md"
      >
        Agendar con Dra. Vázquez
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </motion.div>
    </div>
  )
}

function ConfirmationStep() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-5 py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00a878]/10"
      >
        <CheckCircle2 className="h-9 w-9 text-[#00a878]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-[15px] font-bold text-[#0a1533]">Cita confirmada</p>
        <p className="mt-1 text-[12px] text-[#5c6783]">Hoy a las 3:00 PM</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-2 w-full rounded-xl border border-[#d4d9e3] bg-white p-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dbe7ff]">
            <Stethoscope className="h-5 w-5 text-[#1f48de]" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#0a1533]">Dra. Elena Vázquez</p>
            <p className="text-[10px] text-[#5c6783]">Consulta por video · Neurología</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 w-full rounded-lg bg-[#f7f8fb] px-3 py-2 text-center"
      >
        <p className="text-[10px] text-[#5c6783]">
          Se envió confirmación a tu correo y WhatsApp
        </p>
      </motion.div>
    </div>
  )
}

const stepComponents = [ChatStep, AnalysisStep, DoctorMatchStep, ConfirmationStep]

export default function PatientFlowHyperframe() {
  const [currentStep, setCurrentStep] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  const advance = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % STEPS.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(advance, STEP_DURATION)
    return () => clearInterval(timer)
  }, [advance])

  const StepComponent = stepComponents[currentStep]

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      {/* Ambient glow */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#dbe7ff]/40 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#d7f5e6]/30 blur-3xl"
            animate={{ x: [0, -15, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Phone frame */}
      <div className="relative rounded-[2rem] border border-[#d4d9e3] bg-white shadow-[0_32px_64px_-16px_rgba(10,21,51,0.18),0_0_0_1px_rgba(10,21,51,0.04)]">
        {/* Status bar */}
        <div className="flex items-center justify-between rounded-t-[2rem] bg-[#0a1533] px-6 py-2.5">
          <span className="text-[10px] font-medium text-[#f7f8fb]/70">9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-4 rounded-sm border border-[#f7f8fb]/40">
              <div className="h-full w-3/4 rounded-sm bg-[#00a878]" />
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="border-b border-[#eef0f5] bg-[#f7f8fb] pb-2">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Content area */}
        <div className="relative h-[360px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-center rounded-b-[2rem] bg-[#f7f8fb] px-6 py-2">
          <div className="h-1 w-24 rounded-full bg-[#d4d9e3]" />
        </div>
      </div>
    </div>
  )
}
