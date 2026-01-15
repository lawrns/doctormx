'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, Shield, Sparkles, ArrowRight, BadgeCheck, Clock, Users } from 'lucide-react'

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
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Warm Doctronic Background */}
      <div className="absolute inset-0 -z-10 bg-[#fdfaf6]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfaf6] via-[#fdfaf6] to-[#f4f1ed]" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-gradient-to-br from-primary-200/40 to-primary-100/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-accent-50/40 to-primary-50/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
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
        {/* Announcement Badge - Larger, More Prominent */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Consultas médicas con IA • Disponible 24/7</span>
          </div>
        </motion.div>

        {/* Doctor Avatars - Trust Signal */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {[
                'bg-gradient-to-br from-blue-400 to-blue-600',
                'bg-gradient-to-br from-emerald-400 to-emerald-600',
                'bg-gradient-to-br from-purple-400 to-purple-600',
                'bg-gradient-to-br from-amber-400 to-amber-600',
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 ${bg} rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md`}
                >
                  {['Dr', 'Dra', 'Dr', 'Dra'][i]}
                </div>
              ))}
            </div>
            <div className="ml-4 text-left">
              <p className="text-sm font-semibold text-text-primary">+500 Doctores</p>
              <p className="text-xs text-text-muted">Certificados en México</p>
            </div>
          </div>
        </motion.div>

        {/* Main Headline - HUGE, Doctronic style */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-text-primary mb-6 leading-[1.1] tracking-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Hola, soy{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              Dr. Simeon
            </span>
            {/* Animated underline */}
            <motion.span
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
            />
          </span>
        </motion.h1>

        {/* Subheadline - Larger, More Readable */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Tu asistente médico con inteligencia artificial. Consultas gratuitas, 
          segundas opiniones y conexión con especialistas certificados.
        </motion.p>

        {/* Key Benefits - Lucide Icons, Better Styling */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { icon: Zap, text: 'Respuestas en segundos', color: 'text-amber-500' },
            { icon: Shield, text: 'Privado y seguro', color: 'text-emerald-500' },
            { icon: Sparkles, text: 'Gratis para empezar', color: 'text-primary-500' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -2, scale: 1.02 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-full border border-neutral-200 text-sm font-medium text-text-primary shadow-sm hover:shadow-md transition-all cursor-default"
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
              {item.text}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons - Larger, More Impact */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/app/second-opinion">
            <motion.button 
              whileHover={{ scale: 1.04, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Iniciar Consulta Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.button>
          </Link>

          <Link href="/doctors">
            <motion.button 
              whileHover={{ scale: 1.04, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white border-2 border-neutral-200 text-text-primary text-lg font-semibold rounded-2xl hover:border-primary-300 hover:bg-primary-50/30 transition-all shadow-sm"
            >
              Ver Especialistas
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Indicators - More Prominent */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-wrap items-center justify-center gap-8 text-sm"
        >
          {[
            { icon: BadgeCheck, text: 'Doctores verificados', value: '500+' },
            { icon: Users, text: 'Consultas realizadas', value: '50,000+' },
            { icon: Clock, text: 'Disponible', value: '24/7' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-text-secondary">
              <item.icon className="w-5 h-5 text-primary-500" />
              <span className="font-semibold text-text-primary">{item.value}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating Elements - Visual Interest */}
      <motion.div
        className="absolute top-32 right-12 hidden xl:block"
        variants={floatVariants}
        animate="animate"
      >
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-neutral-100 w-64">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">Dr. Simeon</p>
              <p className="text-xs text-emerald-500">● En línea</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary">¿En qué puedo ayudarte hoy?</p>
        </div>
      </motion.div>
    </section>
  )
}
