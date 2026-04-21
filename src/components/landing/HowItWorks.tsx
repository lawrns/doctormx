'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Stethoscope, Video } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const steps = [
  {
    num: '01',
    title: 'Describe tus síntomas',
    description: 'Chatea con Dr. Simeon. Evaluación completa en 5 minutos.',
    icon: MessageSquare,
  },
  {
    num: '02',
    title: 'Recibe orientación',
    description: 'La IA analiza tu caso y te recomienda el especialista ideal.',
    icon: Stethoscope,
  },
  {
    num: '03',
    title: 'Consulta con un doctor',
    description: 'Videollamada o chat con un médico certificado. Receta digital incluida.',
    icon: Video,
  },
]

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mb-10 text-center"
        >
          <Eyebrow className="mb-4 justify-center">Cómo funciona</Eyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533]">
            Tres pasos.{' '}
            <em className="font-serif italic font-normal text-[#1a3ab8]">
              Ninguna fila.
            </em>
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0, 0, 0.2, 1],
              }}
              className="relative text-center md:text-left"
            >
              {/* Step number + icon */}
              <div className="mb-5 flex flex-col items-center gap-4 md:items-start">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#00a878]">
                  Paso {step.num}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#eef4ff]">
                  <step.icon className="h-5 w-5 text-[#1f48de]" aria-hidden="true" />
                </div>
              </div>

              <h3 className="mb-3 font-display text-lg font-semibold text-[#0a1533]">
                {step.title}
              </h3>
              <p className="text-[15px] leading-[1.5] text-[#5c6783]">
                {step.description}
              </p>

              {/* Connector line on desktop */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-12 left-full w-full -translate-x-1/2"
                  aria-hidden="true"
                >
                  <div className="mx-auto h-px w-16 bg-[#d4d9e3]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
