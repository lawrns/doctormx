'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { BadgeCheck, Star, MapPin } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const testimonials = [
  {
    name: 'María García L.',
    role: 'Paciente verificada',
    location: 'Ciudad de México',
    initials: 'MG',
    bg: 'bg-[#ffe4dc]',
    text: 'text-[#0a1533]',
    content:
      'Encontré un cardiólogo excelente en 10 minutos. La videoconsulta fue tan profesional como ir al consultorio, pero sin perder 3 horas en traslados. Ya llevo 4 consultas de seguimiento.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Dr. Carlos Mendoza R.',
    role: 'Cardiólogo · Cédula 8745632',
    location: 'Guadalajara, Jal.',
    initials: 'CM',
    bg: 'bg-[#eef4ff]',
    text: 'text-[#0a1533]',
    content:
      'Doctor.mx me permite atender pacientes de todo México sin limitarme a mi consultorio físico. El sistema de pagos es confiable y el soporte resuelve cualquier duda en minutos.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Ana Rodríguez P.',
    role: 'Paciente verificada',
    location: 'Monterrey, N.L.',
    initials: 'AR',
    bg: 'bg-[#d7f5e6]',
    text: 'text-[#0a1533]',
    content:
      'Usé Dr. Simeon para entender mis síntomas antes de mi consulta. Me ayudó a preparar las preguntas correctas. La segunda opinión que obtuve me dio tranquilidad antes de decidir mi tratamiento.',
    rating: 5,
    verified: true,
  },
]

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      {/* Subtle background orb */}
      <div
        className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eef4ff]/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mb-10 text-center"
        >
          <Eyebrow className="mb-4 justify-center">Historias reales</Eyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533]">
            Pacientes y doctores{' '}
            <em className="font-serif italic font-normal text-[#1a3ab8]">confían en nosotros</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.5] text-[#5c6783]">
            Más de 10,000 consultas realizadas con un 98% de satisfacción
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0, 0, 0.2, 1],
              }}
            >
              <Card
                className="relative h-full border-[#e3e6ee]/80 bg-gradient-to-b from-white to-[#f7f8fb] p-8 shadow-[0_16px_40px_rgba(15,37,95,0.08)] transition-shadow duration-300 hover:shadow-[0_22px_56px_rgba(15,37,95,0.12)] focus-within:ring-2 focus-within:ring-[#3a66f5] focus-within:ring-offset-2"
                tabIndex={0}
                role="article"
                aria-label={`Testimonio de ${testimonial.name}`}
              >
                {/* Stars */}
                <div
                  className="mb-4 flex gap-1"
                  role="img"
                  aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={
                        prefersReducedMotion
                          ? {}
                          : {
                              delay: 0.3 + i * 0.08,
                              type: 'spring',
                              stiffness: 400,
                              damping: 17,
                            }
                      }
                    >
                      <Star className="h-5 w-5 fill-[#f4a736] text-[#f4a736]" aria-hidden="true" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <p className="relative z-10 mb-6 text-lg leading-relaxed text-[#0a1533]">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="mt-auto flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${testimonial.bg} ${testimonial.text} font-display text-sm font-bold shadow-sm`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-display text-sm font-semibold text-[#0a1533]">
                        {testimonial.name}
                      </p>
                      {testimonial.verified && (
                        <BadgeCheck
                          className="h-4 w-4 text-[#00a878]"
                          aria-label="Usuario verificado"
                          role="img"
                        />
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-[#5c6783]">
                      {testimonial.role}
                      <span className="mx-1 text-[#d4d9e3]" aria-hidden="true">
                        •
                      </span>
                      <MapPin className="h-3 w-3" aria-hidden="true" />
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
