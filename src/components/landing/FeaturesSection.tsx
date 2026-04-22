'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/Eyebrow'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Doctores revisados antes de listar',
    description: 'Cada especialista pasa por revisión interna de perfil y credenciales antes de recibir pacientes desde la plataforma.',
  },
  {
    icon: Video,
    title: 'Videoconsulta HD desde casa',
    description: 'Consultas por video con calidad HD y conexión segura. Tu doctor te ve y escucha como si estuvieras en su consultorio.',
  },
  {
    icon: Calendar,
    title: 'Citas en menos de 24 horas',
    description: 'Encuentra disponibilidad en tiempo real. Agenda tu consulta en minutos, no en semanas.',
  },
  {
    icon: FileText,
    title: 'Dr. Simeon: tu copiloto de salud',
    description: 'Nuestro asistente con IA te ayuda a entender síntomas y preparar preguntas para tu doctor. No diagnostica, orienta.',
  },
  {
    icon: Shield,
    title: 'Privacidad de grado médico',
    description: 'Tratamos la información de salud como sensible y limitamos su exposición dentro de los flujos de consulta.',
  },
  {
    icon: MessageSquare,
    title: 'Seguimiento continuo',
    description: 'Mensajea a tu doctor antes y después de la consulta. Tu historial médico siempre accesible.',
  },
]

export function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#f7f8fb] py-16 sm:py-20"
      role="region"
      aria-labelledby="features-section-heading"
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4d9e3] to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
            className="max-w-3xl lg:sticky lg:top-24"
          >
            <Eyebrow className="mb-4">Plataforma</Eyebrow>
            <h2 id="features-section-heading" className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533]">
              Salud digital con puntos de control humanos.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.5] text-[#5c6783]">
              Una plataforma diseñada para conectarte con especialistas mexicanos certificados, de forma rápida, segura y privada.
            </p>
          </motion.div>

          <div className="grid border-t border-border/80 md:grid-cols-2 md:gap-x-10">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: [0, 0, 0.2, 1],
                }}
                className="group flex gap-4 border-b border-border/80 py-6 transition-transform duration-200 hover:-translate-y-0.5"
                aria-label={feature.title}
              >
                <feature.icon className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-[#0a1533]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.55] text-[#5c6783]">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
