'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, CreditCard, Search, ShieldCheck, Stethoscope, Video } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import { DxButton } from '@/components/DxButton'

const flowSteps = [
  { label: 'Síntomas', value: 'Dolor de garganta y fiebre', icon: Stethoscope },
  { label: 'Triage', value: 'Sin datos de emergencia', icon: ShieldCheck },
  { label: 'Doctor', value: 'Medicina general disponible hoy', icon: Video },
  { label: 'Pago', value: '$499 MXN retenidos al reservar', icon: CreditCard },
]

function ConversionPreview() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-[0_18px_46px_-34px_rgba(15,37,95,0.38)]">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Flujo en vivo
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
              De síntomas a consulta pagada
            </h2>
          </div>
          <span className="rounded-lg border border-vital/20 bg-vital/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-vital">
            24/7
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {flowSteps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 p-4 sm:p-5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt-50 text-cobalt-700">
              <step.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {step.label}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{step.value}</p>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-vital" aria-hidden="true" />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-3 border-t border-border bg-background p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <p className="text-sm font-semibold text-ink">Dra. Valeria Naranjo</p>
          <p className="text-xs text-muted-foreground">Cédula revisada · 4:30 PM · Videoconsulta</p>
        </div>
        <Link
          href="/doctors"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
        >
          Ver disponibilidad
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f7f8fb] pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pb-20">
      <div className="editorial-shell">
        <div className="grid gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-3xl"
          >
            <Eyebrow className="mb-5">Consulta gratuita de orientación médica</Eyebrow>

            <h1 className="font-display text-4xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Consulta médica en línea en México, hoy.
            </h1>

            <p className="mt-5 max-w-[62ch] text-base leading-7 text-[#34405f] sm:text-lg">
              Describe tus síntomas, recibe una orientación segura de Dr. Simeon y agenda con un doctor verificado cuando tu caso lo necesita. Si hay señales de alarma, te guiamos hacia atención urgente.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/ai-consulta">
                <DxButton variant="primary" size="lg" className="w-full sm:w-auto">
                  Consulta gratis con Dr. Simeon
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </DxButton>
              </Link>
              <Link href="/doctors">
                <DxButton variant="ghost" size="lg" className="w-full sm:w-auto">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Buscar doctor
                </DxButton>
              </Link>
            </div>

            <div className="mt-7 grid gap-3 border-y border-border py-5 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-vital" aria-hidden="true" />
                Revisión médica antes de listar
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-cobalt-700" aria-hidden="true" />
                Agenda y pago en el mismo flujo
              </span>
              <span className="inline-flex items-center gap-2">
                <Video className="h-4 w-4 text-cobalt-700" aria-hidden="true" />
                Videoconsulta disponible
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ConversionPreview />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
