'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/Eyebrow'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Perfil y cédula visibles',
    description: 'Cuando el expediente lo permite, el doctor muestra foto real, cédula y estado de verificación SEP.',
  },
  {
    icon: Video,
    title: 'Videoconsulta o presencial',
    description: 'La modalidad se muestra solo cuando el doctor la tiene habilitada en su perfil y agenda.',
  },
  {
    icon: Calendar,
    title: 'Disponibilidad real',
    description: 'Los horarios vienen del calendario de reserva, no de una estimación visual.',
  },
  {
    icon: FileText,
    title: 'Dr. Simeón con límites',
    description: 'La IA ayuda a ordenar el caso y a identificar señales de alarma antes de agendar.',
  },
  {
    icon: Shield,
    title: 'Privacidad explícita',
    description: 'La información sensible se limita al flujo clínico y se explica en la política de seguridad.',
  },
  {
    icon: MessageSquare,
    title: 'Reseñas completadas',
    description: 'Las historias de confianza provienen de citas terminadas y valoraciones reales.',
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
              Una plataforma diseñada para conectar orientación, evidencia, agenda y pago sin disfrazar la interfaz de promesa comercial.
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
