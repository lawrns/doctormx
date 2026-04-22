'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, Search, ShieldCheck, Stethoscope, Video } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import { ClinicalFlowStage } from './ClinicalFlowStage'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ink pb-14 pt-10 text-primary-foreground sm:pb-20 sm:pt-14 lg:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,hsl(var(--primary)/0.22),transparent_32%),radial-gradient(circle_at_82%_10%,hsl(var(--brand-leaf)/0.16),transparent_30%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" aria-hidden="true" />
      <div className="editorial-shell relative">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-3xl"
          >
            <Eyebrow className="mb-5 text-primary-foreground/60">Consulta gratuita de orientación médica</Eyebrow>

            <h1 className="max-w-[11ch] font-display text-5xl font-semibold leading-[0.9] tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl">
              De síntomas a consulta real.
            </h1>

            <p className="mt-6 max-w-[58ch] text-base leading-7 text-primary-foreground/70 sm:text-lg">
              Doctor.mx convierte una duda clínica en una ruta segura: intake guiado, revisión de señales de alarma, doctor verificado y reserva con pago en el mismo flujo.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/ai-consulta">
                <motion.span
                  className="relative inline-flex w-full sm:w-auto"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute -inset-1 rounded-xl bg-vital/20 blur-md" aria-hidden="true" />
                  <span className="relative inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-vital/30 bg-vital px-7 py-4 text-[15px] font-semibold tracking-[-0.005em] text-ink shadow-[0_18px_44px_hsl(var(--brand-leaf)/0.22)] transition-transform sm:w-auto">
                    Consulta gratis con Dr. Simeon
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </motion.span>
              </Link>
              <Link
                href="/doctors"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-primary-foreground/20 bg-primary-foreground/10 px-7 py-4 text-[15px] font-semibold tracking-[-0.005em] text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-foreground/15 sm:w-auto"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Buscar doctor
              </Link>
            </div>

            <div className="mt-8 grid gap-3 border-y border-primary-foreground/15 py-5 text-sm text-primary-foreground/60 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-vital" aria-hidden="true" />
                Doctores revisados
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-vital" aria-hidden="true" />
                Pago y agenda unidos
              </span>
              <span className="inline-flex items-center gap-2">
                <Video className="h-4 w-4 text-vital" aria-hidden="true" />
                Videoconsulta disponible
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs text-primary-foreground/50">
              <Stethoscope className="h-4 w-4 text-vital" aria-hidden="true" />
              <span>La IA orienta y escala; no reemplaza atención médica urgente.</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ClinicalFlowStage />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
