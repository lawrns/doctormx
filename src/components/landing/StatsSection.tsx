'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function AnimatedNumber({ value, suffix = '', skipAnimation = false }: { value: number; suffix?: string; skipAnimation?: boolean }) {
  const [displayValue, setDisplayValue] = useState(skipAnimation ? value : 0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    // Skip animation if user prefers reduced motion
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

        // Eased progress using cubic-bezier(0, 0, 0.2, 1)
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
  }, [isInView, value])

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

const stats = [
  { value: 500, suffix: '+', label: 'Doctores con cédula verificada', iconType: 'doctores' },
  { value: 10000, suffix: '+', label: 'Consultas realizadas', iconType: 'consultations' },
  { value: 50, suffix: '+', label: 'Especialidades médicas', iconType: 'specialties' },
  { value: 98, suffix: '%', label: 'Satisfacción de pacientes', iconType: 'satisfaction' },
]

function StatIcon({ type }: { type: string }) {
  switch (type) {
    case 'doctores':
      return (
        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'consultations':
      return (
        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    case 'specialties':
      return (
        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    case 'satisfaction':
      return (
        <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
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
    <section className="py-20 bg-gradient-to-b from-neutral-0 to-neutral-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <h2 className="section-headline text-3xl sm:text-4xl mb-4">
            Números que respaldan nuestra misión
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Datos actualizados • Enero 2025
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0, 0, 0.2, 1]
              }}
              whileHover={prefersReducedMotion ? {} : { y: -2, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } }}
              className="text-center group"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200"
                style={{
                  boxShadow: '0 4px 6px -1px rgba(85, 136, 255, 0.05), 0 2px 4px -2px rgba(85, 136, 255, 0.05)'
                }}
                whileHover={prefersReducedMotion ? {} : {
                  scale: 1.08,
                  rotate: 3,
                  boxShadow: '0 10px 15px -3px rgba(85, 136, 255, 0.1), 0 4px 6px -4px rgba(85, 136, 255, 0.1)',
                  transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 17
                  }
                }}
              >
                <StatIcon type={stat.iconType} />
              </motion.div>
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} skipAnimation={prefersReducedMotion} />
              </div>
              <p className="text-text-secondary font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-text-muted mt-8">
          Estadísticas basadas en datos internos de Doctor.mx. Satisfacción medida por encuestas post-consulta.
        </p>
      </div>
    </section>
  )
}
