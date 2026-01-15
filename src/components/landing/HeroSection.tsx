'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-surface pt-24 pb-12">
      {/* Doctronic Beige Background with Subtle Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface to-neutral-100/30" />
        
        {/* Subtle animated blob */}
        <motion.div
          className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-accent-50/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <Badge className="bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 px-4 py-1.5">
            🩺 Consultas médicas con IA
          </Badge>
        </motion.div>

        {/* Main Headline - Doctronic style "Hi, I'm..." */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Hola, soy{' '}
          <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
            Dr. Simeon
          </span>
        </motion.h1>

        {/* Subheadline - Direct like Doctronic */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Tu asistente médico con inteligencia artificial. Disponible 24/7 para consultas, 
          segundas opiniones y conexión con especialistas certificados en México.
        </motion.p>

        {/* Key Benefits - Clean pills */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { icon: '⚡', text: 'Respuestas instantáneas' },
            { icon: '🔒', text: 'Privado y seguro' },
            { icon: '💰', text: 'Gratis para empezar' },
          ].map((item, i) => (
            <span 
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-full border border-neutral-200 text-sm text-text-secondary"
            >
              <span>{item.icon}</span>
              {item.text}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons with Shimmer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/app/second-opinion">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <button className="relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Comenzar consulta gratis
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </button>
            </motion.div>
          </Link>

          <Link href="/doctors">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <button className="px-8 py-4 border-2 border-neutral-300 text-text-primary font-semibold rounded-xl hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                Ver especialistas
              </button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust Indicators - Minimal */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Doctores verificados</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>50,000+ consultas</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Disponible 24/7</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
