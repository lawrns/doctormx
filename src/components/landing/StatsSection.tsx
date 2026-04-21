'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Eyebrow } from '@/components/Eyebrow'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function AnimatedNumber({
  value,
  suffix = '',
  skipAnimation = false,
}: {
  value: number
  suffix?: string
  skipAnimation?: boolean
}) {
  const [displayValue, setDisplayValue] = useState(skipAnimation ? value : 0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (skipAnimation) {
      setDisplayValue(value)
      return
    }
    if (isInView) {
      const duration = 2000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = Math.floor(value * easeOut)
        setDisplayValue(current)
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(value)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, value, skipAnimation])

  return <span ref={ref}>{displayValue.toLocaleString()}{suffix}</span>
}

const stats = [
  { value: 500, suffix: '+', label: 'Doctores con cédula verificada', iconType: 'doctors' },
  { value: 10000, suffix: '+', label: 'Consultas realizadas', iconType: 'consultations' },
  { value: 50, suffix: '+', label: 'Especialidades médicas', iconType: 'specialties' },
  { value: 98, suffix: '%', label: 'Satisfacción de pacientes', iconType: 'satisfaction' },
]

function StatIcon({ type }: { type: string }) {
  switch (type) {
    case 'doctors':
      return (
        <svg className="h-5 w-5 text-[#1f48de]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'consultations':
      return (
        <svg className="h-5 w-5 text-[#1f48de]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    case 'specialties':
      return (
        <svg className="h-5 w-5 text-[#1f48de]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    case 'satisfaction':
      return (
        <svg className="h-5 w-5 text-[#1f48de]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    default:
      return null
  }
}

export function StatsSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#f7f8fb] py-14 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mb-10 text-center"
        >
          <Eyebrow className="mb-4 justify-center">Impacto real</Eyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533]">
            Números que respaldan{' '}
            <em className="font-serif italic font-normal text-[#1a3ab8]">nuestra misión</em>
          </h2>
          <p className="mx-auto mt-3 max-w-md font-mono text-[11px] uppercase tracking-[0.12em] text-[#5c6783]">
            Datos actualizados · Abril 2026
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0, 0, 0.2, 1],
              }}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : { y: -2, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } }
              }
              className="group text-center"
            >
              <motion.div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#eef4ff]"
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: 1.08,
                        rotate: 3,
                        transition: { type: 'spring', stiffness: 400, damping: 17 },
                      }
                }
              >
                <StatIcon type={stat.iconType} />
              </motion.div>
              <div className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#0a1533] mb-2">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  skipAnimation={prefersReducedMotion}
                />
              </div>
              <p className="text-[15px] font-medium leading-[1.5] text-[#5c6783]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-[#5c6783]/70">
          Estadísticas basadas en datos internos de Doctor.mx. Satisfacción medida por encuestas post-consulta.
        </p>
      </div>
    </section>
  )
}
