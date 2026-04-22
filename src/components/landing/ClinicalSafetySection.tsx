'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, ShieldCheck, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { DxButton } from '@/components/DxButton'
import { Eyebrow } from '@/components/Eyebrow'

const safetySignals = [
  'Dificultad para respirar',
  'Dolor de pecho',
  'Cefalea súbita intensa',
  'Rigidez de nuca',
]

const safeSignals = [
  'Síntomas estructurados',
  'Contexto clínico básico',
  'Doctor verificado',
  'Pago ligado al horario',
]

export function ClinicalSafetySection() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fb] py-16 sm:py-22">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />
      <div className="editorial-shell">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.42, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Eyebrow className="mb-5">IA con límites</Eyebrow>
            <h2 className="max-w-[11ch] font-display text-4xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-5xl">
              No todo debe terminar en reserva.
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground">
              La experiencia debe vender consultas, pero no a costa de seguridad clínica. Doctor.mx separa casos aptos para videoconsulta de señales que deben ir a urgencias.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/ai-consulta">
                <DxButton variant="primary" size="lg" className="w-full sm:w-auto">
                  Probar orientación
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </DxButton>
              </Link>
              <Link href="/security">
                <DxButton variant="ghost" size="lg" className="w-full sm:w-auto">
                  Ver criterios de seguridad
                </DxButton>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_0.76fr] md:items-stretch">
              <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_70px_hsl(var(--shadow-color)/0.10)]">
                <div className="border-b border-border bg-ink px-5 py-4 text-primary-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/50">
                        Safety gate
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">
                        Revisión antes de recomendar
                      </h3>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-vital" aria-hidden="true" />
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vital/10 text-vital">
                        <Stethoscope className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">Caso apto para consulta</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Sin señales de alarma, disponibilidad hoy, paciente informado del precio.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {safeSignals.map((signal, index) => (
                      <motion.div
                        key={signal}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.06, duration: 0.28 }}
                        className="flex items-center gap-3 border-t border-border/80 pt-3"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-vital" aria-hidden="true" />
                        <span className="text-sm text-ink">{signal}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-coral/20 bg-coral/10 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/15 text-coral">
                      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-coral">
                        Salida urgente
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-ink">No reservar</h3>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    {safetySignals.map((signal) => (
                      <div key={signal} className="text-sm leading-6 text-ink/80">
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-border bg-card p-5">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-4 text-sm font-semibold text-ink">Contexto para el doctor</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    El intake llega a la consulta como señales, respuestas y alertas, no como una conversación perdida.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
