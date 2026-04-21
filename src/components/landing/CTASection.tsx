'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, CheckCircle, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Eyebrow } from '@/components/Eyebrow'

export function CTASection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#0a1533] py-24 sm:py-28">
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.08 0 0 0 0 0.18 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Single subtle cobalt orb */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#1f48de]/10 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Eyebrow className="mb-6 justify-center text-[#f7f8fb]/50">
            Más de 100 especialistas en línea
          </Eyebrow>

          <h2 className="mb-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[#f7f8fb]">
            Tu salud merece{' '}
            <em className="font-serif italic font-normal text-[#93b5ff]">
              atención inmediata
            </em>
          </h2>

          <p className="mx-auto mb-10 max-w-lg text-lg text-[#f7f8fb]/70">
            Únete a los mexicanos que ya cuidan su salud con Doctor.mx.
          </p>

          {/* Paper button on ink — maximum contrast */}
          <Link href="/auth/register" className="inline-block">
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#f7f8fb] px-8 py-4 font-display text-sm font-semibold text-[#0a1533] shadow-[0_20px_40px_-12px_rgba(15,37,95,0.15)] transition-colors duration-200 hover:bg-[#dbe7ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f8fb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1533]"
              aria-label="Comenzar consulta gratuita - Regístrate ahora"
            >
              Comenzar consulta gratuita
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </Link>

          {/* Secondary link for doctors */}
          <Link
            href="/for-doctors"
            className="mx-auto mt-5 block text-sm text-[#f7f8fb]/60 underline underline-offset-4 transition-colors hover:text-[#f7f8fb]"
          >
            ¿Eres médico? Conoce cómo crecer tu práctica
          </Link>

          {/* Trust badges */}
          <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-3 text-sm text-[#f7f8fb]/50 sm:flex-row sm:gap-6">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 shrink-0" aria-hidden="true" /> Datos encriptados
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Sin tarjeta requerida
            </span>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-sm text-[#f7f8fb]/40">
          Primera consulta gratis · Sin compromiso · Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
