'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────

type BodyArea = 'Cabeza' | 'Pecho' | 'Espalda' | 'Abdomen' | 'Piel' | 'Otro'
type Duration = 'Hoy' | 'Esta semana' | 'Este mes' | 'Más de un mes'
type Intensity = 'Leve (1-3)' | 'Moderado (4-6)' | 'Intenso (7-10)'

interface QuizState {
  area: BodyArea | null
  duration: Duration | null
  intensity: Intensity | null
}

// ── Specialty mapping ───────────────────────────────────────────────────────

const specialtyMap: Record<BodyArea, { slug: string; label: string; desc: string }> = {
  Cabeza: {
    slug: 'neurologia',
    label: 'Neurólogo',
    desc: 'Los síntomas en cabeza pueden indicar migraña, tensión muscular u otras condiciones neurológicas. Un neurólogo o médico general puede orientarte.',
  },
  Pecho: {
    slug: 'cardiologia',
    label: 'Cardiólogo',
    desc: 'El malestar en el pecho puede relacionarse con el corazón o los pulmones. Un cardiólogo o neumólogo es el especialista indicado.',
  },
  Espalda: {
    slug: 'traumatologia',
    label: 'Traumatólogo',
    desc: 'El dolor de espalda frecuentemente tiene origen musculoesquelético. Un traumatólogo u ortopeda puede evaluarte con precisión.',
  },
  Abdomen: {
    slug: 'gastroenterologia',
    label: 'Gastroenterólogo',
    desc: 'Las molestias abdominales suelen estar relacionadas con el sistema digestivo. Un gastroenterólogo o médico general puede ayudarte.',
  },
  Piel: {
    slug: 'dermatologia',
    label: 'Dermatólogo',
    desc: 'Los problemas de piel, desde erupciones hasta lesiones, son mejor evaluados por un dermatólogo.',
  },
  Otro: {
    slug: 'medicina-general',
    label: 'Médico General',
    desc: 'Un médico general es el punto de partida ideal. Puede orientarte hacia el especialista correcto según tu caso.',
  },
}

// ── Step option definitions ─────────────────────────────────────────────────

const areaOptions: { label: BodyArea; emoji: string }[] = [
  { label: 'Cabeza', emoji: '🧠' },
  { label: 'Pecho', emoji: '🫁' },
  { label: 'Espalda', emoji: '🦴' },
  { label: 'Abdomen', emoji: '🫃' },
  { label: 'Piel', emoji: '🩹' },
  { label: 'Otro', emoji: '🔍' },
]

const durationOptions: Duration[] = ['Hoy', 'Esta semana', 'Este mes', 'Más de un mes']

const intensityOptions: Intensity[] = ['Leve (1-3)', 'Moderado (4-6)', 'Intenso (7-10)']

// ── Motion config ───────────────────────────────────────────────────────────

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: 'easeOut' as const },
}

// ── Main component ──────────────────────────────────────────────────────────

export default function SintomasPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 'result'>(1)
  const [quiz, setQuiz] = useState<QuizState>({ area: null, duration: null, intensity: null })

  const progress = step === 'result' ? 100 : ((step as number) / 3) * 100

  const handleArea = (area: BodyArea) => {
    setQuiz((q) => ({ ...q, area }))
    setStep(2)
  }

  const handleDuration = (duration: Duration) => {
    setQuiz((q) => ({ ...q, duration }))
    setStep(3)
  }

  const handleIntensity = (intensity: Intensity) => {
    setQuiz((q) => ({ ...q, intensity }))
    setStep('result')
  }

  const goBack = () => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 'result') setStep(3)
  }

  const restart = () => {
    setQuiz({ area: null, duration: null, intensity: null })
    setStep(1)
  }

  const specialty = quiz.area ? specialtyMap[quiz.area] : null
  const isUrgent = quiz.intensity === 'Intenso (7-10)' && quiz.duration === 'Hoy'

  const stepLabel =
    step === 'result'
      ? 'Resultado'
      : `Paso ${step} de 3`

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-soft))] flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-[hsl(var(--surface-card))] border-b border-[hsl(var(--border-color))] shadow-[var(--shadow-sm)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-[hsl(var(--interactive))] tracking-tight">
            Doctor.mx
          </Link>
          <Link
            href="/"
            className="text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a inicio
          </Link>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="bg-[hsl(var(--surface-card))] border-b border-[hsl(var(--border-color))]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs font-semibold text-[hsl(var(--ink-soft))] tabular-nums w-24 shrink-0">
            {stepLabel}
          </span>
          <div className="flex-1 h-1.5 bg-[hsl(var(--secondary))] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[hsl(var(--interactive))] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 1 — Body area */}
            {step === 1 && (
              <motion.div key="step1" {...stepMotion}>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--ink))] mb-2">
                  ¿Dónde te duele?
                </h1>
                <p className="text-[hsl(var(--ink-soft))] mb-8 text-base">
                  Selecciona la zona donde sientes la molestia principal.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {areaOptions.map(({ label, emoji }) => (
                    <button
                      key={label}
                      onClick={() => handleArea(label)}
                      className="group min-h-14 flex items-center gap-3 px-4 py-4 rounded-xl border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-card))] hover:border-[hsl(var(--interactive)/0.5)] hover:bg-[hsl(var(--interactive-soft))] hover:shadow-[var(--shadow-md)] active:scale-[0.97] transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                      // Taste: tap-friendly large targets with clear hover state
                    >
                      <span className="text-xl leading-none select-none">{emoji}</span>
                      <span className="font-semibold text-[hsl(var(--ink))] text-sm group-hover:text-[hsl(var(--interactive))] transition-colors">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Duration */}
            {step === 2 && (
              <motion.div key="step2" {...stepMotion}>
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Atrás
                </button>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--ink))] mb-2">
                  ¿Desde cuándo?
                </h1>
                <p className="text-[hsl(var(--ink-soft))] mb-8 text-base">
                  ¿Hace cuánto tiempo empezaste a sentir este síntoma?
                </p>
                <div className="flex flex-col gap-3">
                  {durationOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleDuration(option)}
                      className="min-h-14 flex items-center px-5 py-4 rounded-xl border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-card))] hover:border-[hsl(var(--interactive)/0.5)] hover:bg-[hsl(var(--interactive-soft))] hover:shadow-[var(--shadow-md)] active:scale-[0.97] transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                    >
                      <span className="font-semibold text-[hsl(var(--ink))] text-base">{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Intensity */}
            {step === 3 && (
              <motion.div key="step3" {...stepMotion}>
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Atrás
                </button>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--ink))] mb-2">
                  ¿Qué tan intenso?
                </h1>
                <p className="text-[hsl(var(--ink-soft))] mb-8 text-base">
                  Evalúa la intensidad del dolor o malestar en una escala del 1 al 10.
                </p>
                <div className="flex flex-col gap-3">
                  {intensityOptions.map((option, i) => {
                    const colors = [
                      'hover:border-[hsl(var(--trust)/0.5)] hover:bg-[hsl(var(--trust-soft))]',
                      'hover:border-[hsl(var(--warning)/0.5)] hover:bg-[hsl(var(--warning-soft))]',
                      'hover:border-[hsl(var(--danger)/0.5)] hover:bg-[hsl(var(--danger-soft))]',
                    ]
                    return (
                      <button
                        key={option}
                        onClick={() => handleIntensity(option)}
                        className={`min-h-14 flex items-center px-5 py-4 rounded-xl border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-card))] ${colors[i]} hover:shadow-[var(--shadow-md)] active:scale-[0.97] transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]`}
                      >
                        <span className="font-semibold text-[hsl(var(--ink))] text-base">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Result */}
            {step === 'result' && specialty && (
              <motion.div key="result" {...stepMotion}>
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] mb-6 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cambiar respuesta
                </button>

                {/* Result card */}
                <div className="rounded-2xl border border-[hsl(var(--interactive)/0.2)] bg-[hsl(var(--surface-card))] shadow-[var(--shadow-lg)] overflow-hidden">
                  <div className="px-6 py-5 bg-[hsl(var(--interactive-soft))] border-b border-[hsl(var(--border-color))]">
                    <Badge variant="default" className="mb-3">Recomendación</Badge>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-[hsl(var(--ink))]">
                      {specialty.label}
                    </h2>
                  </div>

                  <div className="px-6 py-6 space-y-5">
                    <p className="text-[hsl(var(--ink-soft))] text-base leading-relaxed">
                      {specialty.desc}
                    </p>

                    {/* Summary chips */}
                    <div className="flex flex-wrap gap-2">
                      {quiz.area && (
                        <Badge variant="secondary">{quiz.area}</Badge>
                      )}
                      {quiz.duration && (
                        <Badge variant="secondary">{quiz.duration}</Badge>
                      )}
                      {quiz.intensity && (
                        <Badge variant="secondary">{quiz.intensity}</Badge>
                      )}
                    </div>

                    {/* Urgency note */}
                    {isUrgent && (
                      <div className="flex items-start gap-3 rounded-xl bg-[hsl(var(--danger-soft))] border border-[hsl(var(--danger)/0.25)] px-4 py-3 motion-reduce:animate-none">
                        <AlertTriangle className="w-4 h-4 text-[hsl(var(--danger))] shrink-0 mt-0.5" />
                        <p className="text-sm text-[hsl(var(--danger))] font-medium leading-snug">
                          Síntoma intenso de inicio reciente — considera ir a urgencias si empeora.
                        </p>
                      </div>
                    )}

                    {/* Primary CTA */}
                    <Link href={`/doctors?specialty=${specialty.slug}`} className="block">
                      <Button size="lg" variant="primary" className="w-full">
                        Ver {specialty.label}s disponibles
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* Secondary CTA */}
                    <Link
                      href="/ai-consulta"
                      className="block text-center text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--interactive))] transition-colors py-1"
                    >
                      Prefiero hablar con Dr. Simeón
                    </Link>
                  </div>
                </div>

                {/* Restart */}
                <button
                  onClick={restart}
                  className="mt-6 text-sm text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))] transition-colors block mx-auto"
                >
                  Volver a empezar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
