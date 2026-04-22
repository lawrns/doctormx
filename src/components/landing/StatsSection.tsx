'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/Eyebrow'
import { BadgeCheck, ClipboardCheck, CreditCard, MessageCircle } from 'lucide-react'

const stats = [
  { value: 'Cédula', label: 'Revisión manual antes de listar', icon: BadgeCheck },
  { value: 'Triage', label: 'Escalación para síntomas de alarma', icon: ClipboardCheck },
  { value: 'Pago', label: 'Reserva ligada a una cita concreta', icon: CreditCard },
  { value: '24/7', label: 'Orientación inicial disponible en línea', icon: MessageCircle },
]

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fb] py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mb-10 max-w-3xl"
        >
          <Eyebrow className="mb-4">Sistema operativo</Eyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533]">
            Los puntos que tienen que funcionar antes de escalar.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#5c6783]">
            La interfaz debe reforzar el circuito de confianza: caso clínico, revisión de seguridad, médico verificado y pago vinculado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-7 border-t border-border/80 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0, 0, 0.2, 1],
              }}
              className="group border-b border-border/70 pb-6 sm:min-h-[132px] lg:border-b-0"
            >
              <div className="mb-4 text-primary">
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="mb-2 font-display text-2xl font-semibold leading-tight tracking-tight text-[#0a1533]">
                {stat.value}
              </div>
              <p className="text-sm font-medium leading-6 text-[#5c6783]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 max-w-lg text-xs leading-5 text-[#5c6783]/80">
          Evitamos métricas públicas infladas. Las cifras comerciales deben aparecer aquí solo cuando estén verificadas por analítica y operaciones.
        </p>
      </div>
    </section>
  )
}
