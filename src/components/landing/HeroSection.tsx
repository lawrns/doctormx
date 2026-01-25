'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Shield, Gift, ArrowRight, BadgeCheck, Clock, Users, Lock } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

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

const floatVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: [-8, 8, -8],
    transition: {
      opacity: { duration: 0.6, delay: 1.2 },
      y: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.8 },
    },
  },
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Warm Doctronic Background */}
      <div className="absolute inset-0 -z-10 bg-[#fdfaf6]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfaf6] via-[#fdfaf6] to-[#f4f1ed]" />

        {/* Animated gradient orbs - respect reduced motion */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-gradient-to-br from-primary-200/40 to-primary-100/20 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-accent-50/40 to-primary-50/30 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Dr. Simeon Avatar + Live Badge - Main Trust Signal */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {/* Dr. Simeon Photo */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src="/images/simeon.png"
                  alt="Dr. Simeon - Tu asistente médico IA"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              {/* Online indicator */}
              <span
                className="absolute bottom-1 right-1 w-5 h-5 bg-teal-500 border-2 border-white rounded-full flex items-center justify-center"
                aria-label="En linea"
                role="status"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true" />
              </span>
            </div>

            {/* Live status badge */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-xs font-medium text-teal-700">En línea ahora</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">Dr. Simeon</p>
              <p className="text-xs text-text-muted">Asistente médico IA</p>
            </div>
          </div>
        </motion.div>

        {/* Main Headline - HUGE, Doctronic style */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-text-primary mb-6 leading-[1.1] tracking-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Atencion medica de confianza
          <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              en minutos, no en dias
            </span>
            {/* Animated underline */}
            <motion.span
              className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
            />
          </span>
        </motion.h1>

        {/* Subheadline - Conversational */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          Conecta con mas de 500 doctores verificados. Describe tus sintomas a Dr. Simeon y recibe orientacion medica inmediata — o agenda una videoconsulta con un especialista certificado.
        </motion.p>

        {/* Key Benefits - Lighter, Less Prominent (Fixed per analysis) */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-10 text-sm text-text-muted"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Orientacion medica en segundos
          </span>
          <span className="text-neutral-300" aria-hidden="true">•</span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
            Datos 100% protegidos
          </span>
          <span className="text-neutral-300" aria-hidden="true">•</span>
          <span className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-primary-500" aria-hidden="true" />
            Primera consulta sin costo
          </span>
        </motion.div>

        {/* CTA Buttons - Single Dominant Action with Pulsing Glow */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full"
        >
          <Link href="/app/second-opinion" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 min-h-[48px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
              aria-label="Hablar con Dr. Simeon gratis - Iniciar consulta de orientacion medica"
            >
              {/* Pulsing glow ring */}
              <span className="absolute inset-0 rounded-2xl animate-pulse-ring" />

              <span className="relative z-10 flex items-center justify-center gap-3">
                Hablar con Dr. Simeon — Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </span>
              {/* Shimmer Effect - subtle, respects reduced motion */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.button>
          </Link>

          {/* Secondary CTA - Much more subtle (Fixed per analysis) */}
          <Link href="/doctors" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] text-text-secondary hover:text-text-primary font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
            >
              Buscar un Especialista
            </motion.button>
          </Link>
        </motion.div>

        {/* Tertiary CTA for Doctors */}
        <motion.div variants={itemVariants} className="mb-12">
          <Link
            href="/for-doctors"
            className="text-sm text-text-muted hover:text-primary-600 transition-colors"
          >
            Eres doctor? Unete a la red
          </Link>
        </motion.div>

        {/* Trust Indicators - Visual Grouping with Container */}
        <motion.div
          variants={itemVariants}
          className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-neutral-200/50 shadow-sm"
        >
          {[
            { icon: BadgeCheck, text: 'Doctores con cedula verificada', value: '500+' },
            { icon: Users, text: 'Consultas realizadas', value: '10,000+' },
            { icon: Clock, text: 'Disponible', value: '24/7' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-text-secondary text-sm">
              {i > 0 && <div className="hidden sm:block w-px h-6 bg-neutral-300/50 -ml-2 mr-2" />}
              <item.icon className="w-5 h-5 text-primary-500 flex-shrink-0" aria-hidden="true" />
              <span className="font-semibold text-text-primary">{item.value}</span>
              <span className="hidden sm:inline whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Compliance Note */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-text-muted max-w-md mx-auto mt-4"
        >
          Servicio de orientacion medica. No sustituye la consulta presencial.
        </motion.p>
      </motion.div>

      {/* Floating Chat Card with Dr. Simeon Face */}
      <motion.div
        className="absolute top-32 right-12 hidden lg:block"
        variants={prefersReducedMotion ? undefined : floatVariants}
        initial={prefersReducedMotion ? { opacity: 1 } : 'initial'}
        animate={prefersReducedMotion ? { opacity: 1 } : 'animate'}
      >
        <div className="bg-white rounded-2xl p-4 shadow-2xl border border-neutral-100 w-72">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-100">
              <Image
                src="/images/simeon.png"
                alt="Dr. Simeon"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">Dr. Simeon</p>
              <p className="text-xs text-teal-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                En línea
              </p>
            </div>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 mb-2">
            <p className="text-sm text-text-secondary">¡Hola! Soy tu asistente médico. ¿En qué puedo ayudarte hoy?</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Lock className="w-3 h-3" aria-hidden="true" />
            <span>Conversacion privada y segura</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
