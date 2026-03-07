'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { BadgeCheck, Star, MapPin } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const testimonials = [
  {
    name: 'María García L.',
    role: 'Paciente verificada',
    location: 'Ciudad de México',
    initials: 'MG',
    gradient: 'from-rose-400 to-pink-500',
    content: 'Encontré un cardiólogo excelente en 10 minutos. La videoconsulta fue tan profesional como ir al consultorio, pero sin perder 3 horas en traslados. Ya llevo 4 consultas de seguimiento.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Dr. Carlos Mendoza R.',
    role: 'Cardiólogo · Cédula 8745632',
    location: 'Guadalajara, Jal.',
    initials: 'CM',
    gradient: 'from-blue-400 to-indigo-500',
    content: 'Doctor.mx me permite atender pacientes de todo México sin limitarme a mi consultorio físico. El sistema de pagos es confiable y el soporte resuelve cualquier duda en minutos.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Ana Rodríguez P.',
    role: 'Paciente verificada',
    location: 'Monterrey, N.L.',
    initials: 'AR',
    gradient: 'from-teal-400 to-cyan-500',
    content: 'Usé Dr. Simeon para entender mis síntomas antes de mi consulta. Me ayudó a preparar las preguntas correctas. La segunda opinión que obtuve me dio tranquilidad antes de decidir mi tratamiento.',
    rating: 5,
    verified: true,
  },
]

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="public-section bg-gradient-to-b from-neutral-50 to-neutral-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mb-16"
        >
          <PublicSectionHeading
            eyebrow="Historias reales"
            title="Pacientes y doctores"
            accent="confían en nosotros"
            description="Más de 10,000 consultas realizadas con un 98% de satisfacción"
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0, 0, 0.2, 1]
              }}
            >
              <Card
                className="surface-panel h-full border-0 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_22px_56px_rgba(15,23,42,0.12)] focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={`Testimonio de ${testimonial.name}`}
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-6xl text-primary-100 font-serif leading-none select-none" aria-hidden="true">
                  "
                </div>

                {/* Stars - Using Lucide Star with stagger animation */}
                <div
                  className="flex gap-1 mb-4"
                  role="img"
                  aria-label={`Calificacion: ${testimonial.rating} de 5 estrellas`}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={prefersReducedMotion ? {} : {
                        delay: 0.3 + i * 0.08,
                        type: 'spring',
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <p className="text-text-primary text-lg leading-relaxed mb-6 relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author - With gradient avatar and verified badge */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-text-primary">{testimonial.name}</p>
                      {testimonial.verified && (
                        <BadgeCheck
                          className="w-4 h-4 text-blue-500"
                          aria-label="Usuario verificado"
                          role="img"
                        />
                      )}
                    </div>
                    <p className="text-sm text-text-muted flex items-center gap-1">
                      {testimonial.role}
                      <span className="text-neutral-300 mx-1" aria-hidden="true">•</span>
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      <span>{testimonial.location}</span>
                    </p>
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
