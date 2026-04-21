'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Users, Clock } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Eyebrow } from '@/components/Eyebrow'
import { DxButton } from '@/components/DxButton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16 pb-16">
      {/* Warm paper background */}
      <div className="absolute inset-0 -z-20 bg-[#f7f8fb]" />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.08 0 0 0 0 0.18 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Single slow cobalt orb — right side only */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#dbe7ff]/50 to-transparent blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.div variants={itemVariants} className="mb-8">
          <Eyebrow>5 consultas médicas gratis para todos los mexicanos</Eyebrow>
        </motion.div>

        {/* Headline — Display with serif italic accent */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-[#0a1533]"
        >
          5 consultas médicas
          <br />
          <em className="font-serif italic font-normal text-[#1a3ab8]">
            100% gratis
          </em>
        </motion.h1>

        {/* Lead — Serif italic for editorial warmth */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mb-10 max-w-[52ch] font-serif text-xl leading-[1.45] italic text-[#1c2647] sm:text-[22px]"
        >
          Salud accesible para todos los mexicanos. Consulta con IA médica sin registrar tarjeta. Cuando necesites un especialista, te conectamos en minutos.
        </motion.p>

        {/* Single CTA */}
        <motion.div variants={itemVariants}>
          <Link href="/ai-consulta">
            <DxButton variant="primary" size="lg">
              Consultar ahora — gratis
              <ArrowRight className="h-5 w-5" />
            </DxButton>
          </Link>
        </motion.div>

        {/* Tertiary link */}
        <motion.p variants={itemVariants} className="mt-6 text-sm text-[#5c6783]">
          o{' '}
          <Link
            href="/doctors"
            className="underline underline-offset-4 transition-colors hover:text-[#0a1533]"
          >
            buscar un especialista
          </Link>
        </motion.p>

        {/* Trust indicators — simplified */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[#5c6783] sm:gap-8"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#00a878]" aria-hidden="true" />
            COFEPRIS
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#0f255f]" aria-hidden="true" />
            500+ doctores
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#0f255f]" aria-hidden="true" />
            24/7
          </span>
        </motion.div>

        {/* Compliance note */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-md text-xs text-[#5c6783]/80"
        >
          Servicio de orientación médica. No sustituye la consulta presencial.
        </motion.p>
      </motion.div>
    </section>
  )
}
