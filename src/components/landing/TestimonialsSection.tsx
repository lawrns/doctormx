'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { PublicLandingData } from '@/lib/public-trust'

type TestimonialsSectionProps = {
  trustData?: PublicLandingData | null
}

export function TestimonialsSection({ trustData }: TestimonialsSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const reviews = trustData?.reviewHighlights || []

  if (reviews.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-quiet))_100%)] py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="mb-10 max-w-3xl"
        >
          <Eyebrow className="mb-4">Reseñas verificadas</Eyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[hsl(var(--public-ink))]">
            Opiniones reales de consultas completadas.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-[hsl(var(--public-muted))]">
            Mostramos reseñas de pacientes que cerraron una consulta real, con nombre, contexto y el médico al que calificaron.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.45,
                delay: prefersReducedMotion ? 0 : index * 0.08,
                ease: [0, 0, 0.2, 1],
              }}
            >
              <Card className="surface-panel flex h-full flex-col p-6 shadow-[0_1px_2px_rgba(15,37,95,0.06)]">
                <div
                  className="mb-4 flex gap-1"
                  role="img"
                  aria-label={`Calificación: ${review.rating} de 5 estrellas`}
                >
                  {[...Array(review.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="h-5 w-5 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" aria-hidden="true" />
                  ))}
                </div>

                <p className="mb-6 text-[15px] leading-7 text-[hsl(var(--public-ink))]">
                  "{review.comment}"
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[hsl(var(--surface-tint))]">
                    {review.patientPhotoUrl ? (
                      <Image
                        src={review.patientPhotoUrl}
                        alt={review.patientName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,hsl(var(--surface-strong)),hsl(var(--surface-tint)))] text-sm font-semibold text-[hsl(var(--brand-ocean))]">
                        {review.patientName
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-[hsl(var(--public-ink))]">
                        {review.patientName}
                      </p>
                      <BadgeCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" aria-label="Paciente verificado" />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[hsl(var(--public-muted))]">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="truncate">
                        {review.doctorName} · {review.doctorSpecialty}
                        {review.doctorCity ? ` · ${review.doctorCity}` : ''}
                      </span>
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
