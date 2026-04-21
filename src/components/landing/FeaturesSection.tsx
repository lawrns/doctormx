'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const features = [
  {
    icon: BadgeCheck,
    title: 'Doctores con cédula verificada',
    description: 'Cada especialista está validado con su cédula profesional ante la SEP. Consulta perfiles completos antes de agendar.',
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
    description: 'Encriptación punto a punto y cumplimiento con normativas mexicanas de protección de datos de salud.',
  },
  {
    icon: MessageSquare,
    title: 'Seguimiento continuo',
    description: 'Mensajea a tu doctor antes y después de la consulta. Tu historial médico siempre accesible.',
  },
]

export function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className="relative overflow-hidden bg-[#f7f8fb] py-24 sm:py-28"
      role="region"
      aria-labelledby="features-section-heading"
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4d9e3] to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mb-16 text-center"
        >
          <div id="features-section-heading">
            <Eyebrow className="mb-4 justify-center">Plataforma</Eyebrow>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533]">
              Salud digital,{' '}
              <em className="font-serif italic font-normal text-[#1a3ab8]">
                atención humana
              </em>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.5] text-[#5c6783]">
              Una plataforma diseñada para conectarte con especialistas mexicanos certificados, de forma rápida, segura y privada.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0, 0, 0.2, 1],
              }}
            >
              <Card
                className="group h-full cursor-pointer overflow-hidden border-[#e3e6ee]/80 bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,37,95,0.06),0_1px_1px_rgba(15,37,95,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(15,37,95,0.1)] focus-within:ring-2 focus-within:ring-[#3a66f5] focus-within:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={feature.title}
              >
                <motion.div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#eef4ff]"
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          scale: 1.05,
                          rotate: 3,
                          transition: { type: 'spring', stiffness: 400, damping: 20 },
                        }
                  }
                >
                  <feature.icon className="h-5 w-5 text-[#1f48de]" aria-hidden="true" />
                </motion.div>

                <h3 className="mb-2 font-display text-lg font-semibold text-[#0a1533] transition-colors duration-200 group-hover:text-[#1f48de]">
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-[1.5] text-[#5c6783]">
                  {feature.description}
                </p>

                {/* Arrow indicator on hover */}
                <div
                  className="mt-5 flex justify-end opacity-0 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                  aria-hidden="true"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff]">
                    <svg className="h-4 w-4 text-[#1f48de]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
