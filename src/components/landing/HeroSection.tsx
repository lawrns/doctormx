'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Users, Clock } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Eyebrow } from '@/components/Eyebrow'
import { DxButton } from '@/components/DxButton'
import PatientFlowHyperframe from './PatientFlowHyperframe'

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
    <section className="relative overflow-hidden bg-[#f7f8fb] pb-16 pt-16 lg:pb-24 lg:pt-24">
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.08 0 0 0 0 0.18 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient orbs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute -left-24 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#d7f5e6]/30 to-transparent blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-32 bottom-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#dbe7ff]/40 to-transparent blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* 2-column grid */}
      <div className="editorial-shell">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: editorial copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Eyebrow>5 consultas médicas gratis para todos los mexicanos</Eyebrow>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.94] tracking-[-0.03em] text-[#0a1533]"
            >
              Tu salud,
              <br />
              <em className="font-serif italic font-normal text-[#1a3ab8]">
                siempre a un clic
              </em>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-8 max-w-[48ch] font-serif text-lg leading-[1.5] italic text-[#1c2647] sm:text-xl"
            >
              Describe tus síntomas, recibe una evaluación inteligente y conecta con un
              especialista certificado — todo en minutos, sin costo.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Link href="/ai-consulta">
                <DxButton variant="primary" size="lg">
                  Consultar ahora — gratis
                  <ArrowRight className="h-5 w-5" />
                </DxButton>
              </Link>
              <Link href="/doctors">
                <DxButton variant="ghost" size="lg">
                  Buscar especialista
                </DxButton>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[#5c6783]"
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

            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-sm text-xs text-[#5c6783]/80"
            >
              Servicio de orientación médica. No sustituye la consulta presencial.
            </motion.p>
          </motion.div>

          {/* Right: hyperframe */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="relative z-10"
          >
            <PatientFlowHyperframe />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
