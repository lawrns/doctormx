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
    title: 'Dr. Simeon: orientación con límites',
    description: 'El asistente ayuda a entender síntomas y preparar preguntas para el doctor. No diagnostica, orienta.',
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
      className="relative overflow-hidden border-t border-border bg-[#f7f8fb] py-16 sm:py-20"
      role="region"
      aria-labelledby="features-section-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-3xl lg:sticky lg:top-24"
          >
            <Eyebrow className="mb-4">Plataforma</Eyebrow>
            <h2 id="features-section-heading" className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              Salud digital con puntos de control humanos.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Una plataforma diseñada para conectar orientación, seguridad, agenda, pago y seguimiento sin convertir cada módulo en una superficie pesada.
            </p>

            <div className="mt-7 hidden max-w-sm border-t border-border pt-5 lg:block">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-vital">
                IA con límites clínicos
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                La orientación inicial ayuda a ordenar el caso; las señales de alarma siguen saliendo del flujo hacia atención urgente.
              </p>
            </div>
          </motion.div>

          <div className="grid border-t border-border/80 md:grid-cols-2 md:gap-x-10">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.32,
                  delay: index * 0.04,
                  ease: [0.2, 0.7, 0.2, 1],
                }}
                className="group flex gap-4 border-b border-border/80 py-6"
                aria-label={feature.title}
              >
                <feature.icon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.55] text-muted-foreground">
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
