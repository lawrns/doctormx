'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const features = [
  {
    icon: BadgeCheck,
    title: 'Doctores con cédula verificada',
    description: 'Cada especialista está validado con su cédula profesional ante la SEP. Consulta perfiles completos antes de agendar.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    featured: false,
  },
  {
    icon: Video,
    title: 'Videoconsulta HD desde casa',
    description: 'Consultas por video con calidad HD y conexión segura. Tu doctor te ve y escucha como si estuvieras en su consultorio.',
    color: 'text-primary-500',
    bgColor: 'bg-primary-50',
    featured: false,
  },
  {
    icon: Calendar,
    title: 'Citas en menos de 24 horas',
    description: 'Encuentra disponibilidad en tiempo real. Agenda tu consulta en minutos, no en semanas.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    featured: false,
  },
  {
    icon: FileText,
    title: 'Dr. Simeon: tu copiloto de salud',
    description: 'Nuestro asistente con IA te ayuda a entender síntomas y preparar preguntas para tu doctor. No diagnostica, orienta.',
    color: 'text-white',
    bgColor: 'bg-white/20',
    featured: true,
  },
  {
    icon: Shield,
    title: 'Privacidad de grado médico',
    description: 'Encriptación punto a punto y cumplimiento con normativas mexicanas de protección de datos de salud.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    featured: false,
  },
  {
    icon: MessageSquare,
    title: 'Seguimiento continuo',
    description: 'Mensajea a tu doctor antes y después de la consulta. Tu historial médico siempre accesible.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    featured: false,
  },
]

export function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      className="py-24 bg-neutral-0 relative overflow-hidden"
      role="region"
      aria-labelledby="features-section-heading"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            className="inline-block px-4 py-1.5 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full mb-4"
          >
            Cómo funciona
          </motion.span>
          <h2
            id="features-section-heading"
            className="section-headline text-3xl sm:text-4xl lg:text-5xl mb-4"
          >
            Salud digital, atencion humana
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Una plataforma diseñada para conectarte con especialistas mexicanos certificados, de forma rápida, segura y privada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0, 0, 0.2, 1]
              }}
            >
              <Card
                className={`h-full p-5 sm:p-6 lg:p-8 hover:shadow-xl interactive group cursor-pointer relative overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 ${
                  feature.featured
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-0'
                    : 'border-neutral-200/60 bg-white'
                }`}
                tabIndex={0}
                role="article"
                aria-label={feature.title}
              >
                {/* Hover gradient overlay - only for non-featured */}
                {!feature.featured && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <motion.div
                  className={`relative w-14 h-14 ${feature.bgColor} ${feature.featured ? 'backdrop-blur-sm' : ''} rounded-2xl flex items-center justify-center mb-5`}
                  whileHover={prefersReducedMotion ? {} : {
                    scale: 1.05,
                    rotate: 3,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 20
                    }
                  }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} aria-hidden="true" />
                </motion.div>

                <h3 className={`relative text-xl font-bold mb-3 transition-colors duration-200 ${
                  feature.featured
                    ? 'text-white'
                    : 'text-text-primary group-hover:text-primary-600'
                }`}>
                  {feature.title}
                </h3>
                <p className={`relative leading-relaxed ${
                  feature.featured ? 'text-white/90' : 'text-text-secondary'
                }`}>
                  {feature.description}
                </p>

                {/* Arrow indicator on hover - smooth slide-in */}
                <div
                  className="absolute bottom-6 right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
                  aria-hidden="true"
                >
                  <div className={`w-8 h-8 ${feature.featured ? 'bg-white/20' : 'bg-primary-100'} rounded-full flex items-center justify-center`}>
                    <svg className={`w-4 h-4 ${feature.featured ? 'text-white' : 'text-primary-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
