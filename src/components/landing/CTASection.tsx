'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, CheckCircle, Star, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function CTASection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Background orbs - positioned absolutely to prevent layout shifts, respect reduced motion */}
      <div
        className={`absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`}
        style={{ willChange: 'opacity' }}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`}
        style={{ animationDelay: prefersReducedMotion ? undefined : '1s', willChange: 'opacity' }}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`}
        style={{ animationDelay: prefersReducedMotion ? undefined : '0.5s', willChange: 'opacity' }}
      />

      {/* Subtle plus pattern - medical theme */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Glassmorphism Card with subtle hover effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 sm:p-12 shadow-2xl transition-colors duration-300"
            whileHover={prefersReducedMotion ? {} : {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              transition: { duration: 0.3 }
            }}
          >
            {/* Live badge */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-white text-sm mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
              </span>
              Mas de 100 especialistas en linea ahora
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Tu salud merece
              <span className="block text-blue-200">atencion inmediata</span>
            </h2>

            <p className="text-white/80 text-lg mb-8">
              Mas de 10,000 consultas realizadas. Unete a los mexicanos que ya cuidan su salud con Doctor.mx.
            </p>

            {/* Single dominant CTA */}
            <Link href="/auth/register" className="block">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 min-h-[48px] bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
                aria-label="Registrarme ahora - Crear cuenta gratuita"
              >
                Registrarme ahora
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </motion.button>
            </Link>

            {/* Secondary link for doctors */}
            <Link
              href="/for-doctors"
              className="block mt-4 text-white/80 hover:text-white text-sm underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700 rounded py-2 min-h-[44px] flex items-center justify-center sm:inline-block sm:min-h-0 sm:py-0"
            >
              Eres medico? Conoce como crecer tu practica
            </Link>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> Datos encriptados
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> Sin tarjeta requerida
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-current flex-shrink-0" aria-hidden="true" /> 4.9 de 2,500+ resenas
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional trust text */}
        <p className="text-center text-white/50 text-sm mt-8">
          Primera orientación gratis - Sin compromiso - Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
