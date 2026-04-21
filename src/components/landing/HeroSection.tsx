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
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#f7f8fb] pb-14 pt-10 lg:pb-20 lg:pt-16">
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.10] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.08 0 0 0 0 0.18 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Single subtle orb — contained within section */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#dbe7ff]/30 to-transparent blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="editorial-shell">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: editorial copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <Eyebrow>5 consultas médicas gratis para todos los mexicanos</Eyebrow>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-4 font-display text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-[#0a1533]"
            >
              Tu salud,
              <br />
              <em className="font-serif italic font-normal text-[#1a3ab8]">
                siempre a un clic
              </em>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-6 max-w-[46ch] font-serif text-[17px] leading-[1.5] italic text-[#1c2647] sm:text-lg"
            >
              Describe tus síntomas, recibe una evaluación inteligente y conecta con un
              especialista certificado — todo en minutos, sin costo.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              <Link href="/ai-consulta">
                <DxButton variant="primary" size="lg">
                  Consultar ahora — gratis
                  <ArrowRight className="h-4 w-4" />
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
              className="mt-6 flex flex-wrap items-center gap-5 text-[13px] text-[#5c6783]"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00a878]" aria-hidden="true" />
                COFEPRIS
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#0f255f]" aria-hidden="true" />
                500+ doctores
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#0f255f]" aria-hidden="true" />
                24/7
              </span>
            </motion.div>
          </motion.div>

          {/* Right: hyperframe */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative z-10"
          >
            <PatientFlowHyperframe />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
