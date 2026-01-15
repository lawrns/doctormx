'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

const testimonials = [
  {
    name: 'María García',
    role: 'Paciente',
    location: 'Ciudad de México',
    image: '/testimonials/maria.jpg',
    content: 'Encontré un excelente cardiólogo en minutos. La videoconsulta fue muy profesional y me ahorraron tiempo y dinero.',
    rating: 5,
  },
  {
    name: 'Dr. Carlos Mendoza',
    role: 'Cardiólogo',
    location: 'Guadalajara',
    image: '/testimonials/carlos.jpg',
    content: 'Como doctor, Doctory me ha permitido expandir mi práctica y llegar a más pacientes. La plataforma es intuitiva.',
    rating: 5,
  },
  {
    name: 'Ana Rodríguez',
    role: 'Paciente',
    location: 'Monterrey',
    image: '/testimonials/ana.jpg',
    content: 'La segunda opinión que obtuve fue invaluable. Me dio la tranquilidad que necesitaba antes de mi cirugía.',
    rating: 5,
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

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.svg
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
                      className="w-5 h-5 text-warning-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>

                {/* Content */}
                <p className="text-text-primary text-lg leading-relaxed mb-6 relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center overflow-hidden">
                    {testimonial.role === 'Paciente' ? (
                      <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{testimonial.name}</p>
                    <p className="text-sm text-text-muted">{testimonial.role} • {testimonial.location}</p>
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
