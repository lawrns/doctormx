'use client'

import { motion } from 'framer-motion'
import { CalendarCheck, CreditCard, ShieldAlert, Stethoscope } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'

const steps = [
  {
    title: 'Describe síntomas',
    description: 'El intake recoge señales clínicas, contexto y datos básicos sin pedirte elegir especialidad desde cero.',
    icon: Stethoscope,
  },
  {
    title: 'Revisión de seguridad',
    description: 'Si hay dificultad para respirar, dolor de pecho u otra señal de alarma, el flujo cambia a atención urgente.',
    icon: ShieldAlert,
  },
  {
    title: 'Doctor recomendado',
    description: 'Cuando el caso es apto para consulta, se muestra un médico verificado con disponibilidad y precio.',
    icon: CalendarCheck,
  },
  {
    title: 'Reserva con pago',
    description: 'La cita queda ligada al pago y al horario seleccionado para reducir cancelaciones y doble reserva.',
    icon: CreditCard,
  },
]

export function HowItWorks() {
  return (
    <section className="bg-card py-14 sm:py-18">
      <div className="editorial-shell">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="lg:sticky lg:top-24"
          >
            <Eyebrow className="mb-4">Cómo funciona</Eyebrow>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              Un flujo clínico pensado para convertir sin perder seguridad.
            </h2>
            <p className="mt-4 max-w-[58ch] text-base leading-7 text-muted-foreground">
              Doctor.mx no es solo un directorio. La experiencia debe llevar al paciente desde orientación hasta una consulta real, con límites claros para la IA.
            </p>
          </motion.div>

          <div className="divide-y divide-border rounded-xl border border-border bg-background">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
                className="grid gap-4 p-5 sm:grid-cols-[3rem_1fr] sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cobalt-50 text-cobalt-700">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-vital">
                    Paso {(index + 1).toString().padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
