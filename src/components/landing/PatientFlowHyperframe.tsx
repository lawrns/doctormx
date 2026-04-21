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
  { id: 'chat', icon: MessageCircle, label: 'Cuéntanos', accent: '#1f48de' },
  { id: 'analysis', icon: Brain, label: 'Analizamos', accent: '#00a878' },
  { id: 'match', icon: Stethoscope, label: 'Conectamos', accent: '#1f48de' },
  { id: 'confirm', icon: CalendarCheck, label: 'Listo', accent: '#00a878' },
] as const

const STEP_DURATION = 3500

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 px-4 pt-2.5 pb-1">
      {STEPS.map((step, i) => {
        const isActive = i === currentStep
        const isDone = i < currentStep
        return (
          <div key={step.id} className="flex items-center">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300"
              style={{
                backgroundColor: isDone ? '#00a878' : isActive ? step.accent : '#eef0f5',
              }}
            >
              {isDone ? (
                <CheckCircle2 className="h-3 w-3 text-white" />
              ) : (
                <step.icon className="h-3 w-3" style={{ color: isActive ? '#fff' : '#5c6783' }} />
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="mx-1.5 h-px w-4 transition-colors duration-300"
                style={{ backgroundColor: isDone ? '#00a878' : '#eef0f5' }}
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
    { role: 'ai' as const, text: 'Voy a evaluarte mejor, María.' },
  ]

  return (
    <div className="flex h-full flex-col gap-2.5 px-3.5 py-2.5">
      <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fb] px-2.5 py-1.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1f48de] to-[#0f255f]">
          <Heart className="h-3 w-3 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#0a1533]">Dr. Simeon</p>
          <p className="text-[8px] text-[#00a878]">En línea</p>
        </div>
      </div>
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 12 : -12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: i * 0.4 + 0.15, duration: 0.35, ease: 'easeOut' }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
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
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.25 }}
        className="mt-auto flex items-center gap-2 rounded-full border border-[#d4d9e3] bg-white px-2.5 py-1.5"
      >
        <span className="flex-1 text-[10px] text-[#5c6783]/60">Escribe tus síntomas...</span>
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f48de]">
          <ChevronRight className="h-2.5 w-2.5 text-white" />
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
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-3">
      <motion.div
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a878]/10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'backOut' }}
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Brain className="h-6 w-6 text-[#00a878]" />
        </motion.div>
      </motion.div>
      <motion.p
        className="text-[13px] font-semibold text-[#0a1533]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        Analizando tu caso...
      </motion.p>
      <div className="w-full space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 + 0.25, duration: 0.25 }}
            className="flex items-center gap-2 rounded-lg border border-[#d4d9e3] bg-white px-2.5 py-1.5"
          >
            {step.done ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#00a878]" />
            ) : (
              <motion.div
                className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#1f48de] border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <span className="text-[11px] text-[#1c2647]">{step.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function DoctorMatchStep() {
  return (
    <div className="flex h-full flex-col gap-2 px-3.5 py-2.5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-lg bg-[#d7f5e6] px-2.5 py-1.5 text-center"
      >
        <p className="text-[10px] font-medium text-[#00a878]">
          Especialidad recomendada: <strong>Neurología</strong>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
        className="rounded-xl border border-[#d4d9e3] bg-white p-3 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbe7ff]">
            <Stethoscope className="h-4 w-4 text-[#1f48de]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-[#0a1533]">Dra. Elena Vázquez</p>
            <p className="text-[10px] text-[#5c6783]">Neuróloga · 4.9 ★ · $400 MXN</p>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#5c6783]">Próxima cita: hoy 3:00 PM</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.25 }}
        className="rounded-lg border border-[#eef0f5] bg-white p-2.5 opacity-40"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef0f5]">
            <Stethoscope className="h-3 w-3 text-[#5c6783]" />
          </div>
          <p className="text-[10px] text-[#5c6783]">Dr. Carlos Méndez · Disponible mañana</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.25 }}
        className="mt-auto flex items-center justify-center rounded-xl bg-[#1f48de] py-2 text-[11px] font-semibold text-white shadow-md"
      >
        Agendar con Dra. Vázquez
        <ChevronRight className="ml-1 h-3 w-3" />
      </motion.div>
    </div>
  )
}

function ConfirmationStep() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 px-4 py-3">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: 'backOut' }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00a878]/10"
      >
        <CheckCircle2 className="h-7 w-7 text-[#00a878]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-[14px] font-bold text-[#0a1533]">Cita confirmada</p>
        <p className="text-[11px] text-[#5c6783]">Hoy a las 3:00 PM</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="w-full rounded-lg border border-[#d4d9e3] bg-white p-2.5"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbe7ff]">
            <Stethoscope className="h-4 w-4 text-[#1f48de]" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#0a1533]">Dra. Elena Vázquez</p>
            <p className="text-[9px] text-[#5c6783]">Video consulta · Neurología</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full rounded-md bg-[#f7f8fb] px-2.5 py-1.5 text-center"
      >
        <p className="text-[9px] text-[#5c6783]">
          Confirmación enviada a tu correo y WhatsApp
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
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* Phone frame */}
      <div className="relative rounded-[1.75rem] border border-[#d4d9e3] bg-white shadow-[0_24px_48px_-12px_rgba(10,21,51,0.14),0_0_0_1px_rgba(10,21,51,0.03)]">
        {/* Status bar */}
        <div className="flex items-center justify-between rounded-t-[1.75rem] bg-[#0a1533] px-5 py-2">
          <span className="text-[9px] font-medium text-[#f7f8fb]/70">9:41</span>
          <div className="h-2 w-4 rounded-sm border border-[#f7f8fb]/40">
            <div className="h-full w-3/4 rounded-sm bg-[#00a878]" />
          </div>
        </div>

        {/* Step indicator */}
        <div className="border-b border-[#eef0f5] bg-[#f7f8fb]/80">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Content area — tight fit for all steps */}
        <div className="relative h-[320px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home indicator */}
        <div className="flex items-center justify-center rounded-b-[1.75rem] bg-[#f7f8fb] px-5 py-1.5">
          <div className="h-[3px] w-20 rounded-full bg-[#d4d9e3]" />
        </div>
      </div>
    </div>
  )
}
