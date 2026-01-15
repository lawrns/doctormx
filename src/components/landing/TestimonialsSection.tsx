'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { BadgeCheck, Star, MapPin } from 'lucide-react'

const testimonials = [
  {
    name: 'María García',
    role: 'Paciente verificado',
    location: 'CDMX',
    initials: 'MG',
    gradient: 'from-rose-400 to-pink-500',
    content: 'Encontré un excelente cardiólogo en minutos. La videoconsulta fue muy profesional y me ahorraron tiempo y dinero.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Dr. Carlos Mendoza',
    role: 'Cardiólogo certificado',
    location: 'Guadalajara',
    initials: 'CM',
    gradient: 'from-blue-400 to-indigo-500',
    content: 'Como doctor, Doctor.mx me ha permitido expandir mi práctica y llegar a más pacientes. La plataforma es intuitiva.',
    rating: 5,
    verified: true,
  },
  {
    name: 'Ana Rodríguez',
    role: 'Paciente verificado',
    location: 'Monterrey',
    initials: 'AR',
    gradient: 'from-emerald-400 to-teal-500',
    content: 'La segunda opinión que obtuve fue invaluable. Me dio la tranquilidad que necesitaba antes de mi cirugía.',
    rating: 5,
    verified: true,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-neutral-50 to-neutral-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            Testimonios
          </motion.span>
          <h2 className="section-headline text-3xl sm:text-4xl lg:text-5xl mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Miles de pacientes y doctores confían en Doctory para su atención médica
          </p>
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
              <Card className="h-full p-8 hover:shadow-lg interactive group relative overflow-hidden"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-6xl text-primary-100 font-serif leading-none select-none">
                  "
                </div>

                {/* Stars - Using Lucide Star */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + i * 0.08,
                        type: 'spring',
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
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
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-text-muted flex items-center gap-1">
                      {testimonial.role}
                      <span className="text-neutral-300 mx-1">•</span>
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/[0.01] group-hover:to-accent-500/[0.01] transition-all duration-200" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
