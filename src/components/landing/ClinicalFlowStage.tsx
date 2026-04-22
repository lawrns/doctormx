'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from 'lucide-react'

const clinicalSteps = [
  {
    label: 'Síntomas',
    title: 'Dolor de garganta y fiebre',
    body: 'Dr. Simeon estructura el caso y pide contexto útil antes de sugerir una ruta.',
    icon: Stethoscope,
    status: 'Intake completo',
  },
  {
    label: 'Seguridad',
    title: 'Sin señales de alarma',
    body: 'El flujo busca dificultad respiratoria, dolor torácico y otros datos que requieren urgencias.',
    icon: ShieldCheck,
    status: 'Triage aprobado',
  },
  {
    label: 'Match',
    title: 'Dra. Valeria Naranjo',
    body: 'Medicina general verificada, disponibilidad hoy y precio claro antes de reservar.',
    icon: Video,
    status: '4:30 PM disponible',
  },
  {
    label: 'Reserva',
    title: '$499 MXN retenidos',
    body: 'La cita queda ligada al horario y al pago para reducir cancelaciones y doble reserva.',
    icon: CreditCard,
    status: 'Pago protegido',
  },
]

const pulseTransition = {
  duration: 2.8,
  repeat: Infinity,
  ease: 'easeInOut',
} as const

export function ClinicalFlowStage() {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % clinicalSteps.length)
    }, 2600)

    return () => window.clearInterval(interval)
  }, [prefersReducedMotion])

  const activeStep = clinicalSteps[activeIndex]
  const ActiveIcon = activeStep.icon

  const progressWidth = useMemo(() => `${((activeIndex + 1) / clinicalSteps.length) * 100}%`, [activeIndex])

  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="absolute -left-8 top-12 hidden h-40 w-40 rounded-full bg-vital/10 blur-3xl lg:block" aria-hidden="true" />
      <div className="absolute -right-10 bottom-8 hidden h-48 w-48 rounded-full bg-primary/10 blur-3xl lg:block" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 18, rotateX: 7 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.12 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,hsl(var(--card)/0.97),hsl(var(--secondary)/0.92))] text-ink shadow-[0_32px_90px_hsl(var(--shadow-color)/0.34)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,hsl(var(--primary)/0.13),transparent_34%),radial-gradient(circle_at_86%_12%,hsl(var(--brand-leaf)/0.14),transparent_30%)]" aria-hidden="true" />

        <div className="relative border-b border-border/75 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Flujo clínico en vivo
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">
                De orientación a cita confirmada
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-vital/25 bg-vital/10 px-3 py-1.5 text-vital sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-vital"
                  animate={prefersReducedMotion ? undefined : { scale: [1, 2.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={pulseTransition}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-vital" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                Seguro
              </span>
            </div>
          </div>
        </div>

        <div className="relative grid gap-0 lg:grid-cols-[0.93fr_1.07fr]">
          <div className="border-b border-border/75 p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-[0_12px_34px_hsl(var(--shadow-color)/0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-primary-foreground">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Dr. Simeon
                  </p>
                  <p className="text-sm font-semibold text-ink">Intake guiado</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-sm leading-6 text-muted-foreground">
                  Tengo dolor de garganta, fiebre y quiero saber si puedo hacer consulta hoy.
                </p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-vital"
                  animate={{ width: progressWidth }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/80 bg-card/75 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Tiempo</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-ink">5 min</p>
              </div>
              <div className="rounded-2xl border border-vital/20 bg-vital/10 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-vital">Límite</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-ink">Urgencias</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="relative">
              <div className="absolute left-[1.15rem] top-4 h-[calc(100%-2rem)] w-px bg-border" aria-hidden="true" />
              <div className="space-y-3">
                {clinicalSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = activeIndex === index
                  const isComplete = index < activeIndex

                  return (
                    <button
                      key={step.label}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className="relative grid w-full grid-cols-[2.3rem_1fr] gap-3 text-left outline-none"
                    >
                      <motion.span
                        className={`relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                          isActive
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isComplete
                              ? 'border-vital bg-vital text-white'
                              : 'border-border bg-card text-muted-foreground'
                        }`}
                        animate={isActive && !prefersReducedMotion ? { scale: [1, 1.08, 1] } : undefined}
                        transition={pulseTransition}
                      >
                        {isComplete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <StepIcon className="h-4 w-4" aria-hidden="true" />}
                      </motion.span>
                      <span className={`block rounded-2xl border px-4 py-3 transition-colors ${
                        isActive ? 'border-primary/25 bg-primary/10' : 'border-transparent bg-transparent'
                      }`}>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-vital">
                          {step.label}
                        </span>
                        <span className="mt-1 block text-sm font-semibold tracking-tight text-ink">{step.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{step.status}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-border/75 bg-ink p-4 text-primary-foreground sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid gap-4 sm:grid-cols-[2.75rem_1fr_auto] sm:items-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-foreground/10 text-vital">
                <ActiveIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/50">
                  {activeStep.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-primary-foreground/80">{activeStep.body}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-vital/25 bg-vital/10 px-3 py-2 text-xs font-semibold text-vital">
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Cita hoy
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.45 }}
        className="absolute -right-2 top-20 hidden max-w-[230px] rounded-2xl border border-vital/20 bg-card/95 p-3 shadow-[0_20px_50px_hsl(var(--shadow-color)/0.18)] backdrop-blur lg:block"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-vital" aria-hidden="true" />
          <p className="text-xs leading-5 text-muted-foreground">
            Si aparece una señal de alarma, el flujo sale de reserva y prioriza urgencias.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
