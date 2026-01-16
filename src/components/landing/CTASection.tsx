'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, CheckCircle, Star, ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Animated background orbs - no stripes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Subtle plus pattern - medical theme */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 sm:p-12 shadow-2xl">
            {/* Live badge */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-white text-sm mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              +100 doctores disponibles ahora
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Comienza a cuidar tu salud
              <span className="block text-blue-200">hoy mismo</span>
            </h2>

            <p className="text-white/80 text-lg mb-8">
              Únete a miles de pacientes que ya disfrutan de atención médica de calidad
            </p>

            {/* Single dominant CTA */}
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-10 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center gap-2"
              >
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> SSL Seguro
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Sin costo
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-current" /> 4.9 estrellas
              </span>
            </div>
          </div>
        </motion.div>

        {/* Additional trust text */}
        <p className="text-center text-white/50 text-sm mt-8">
          Sin tarjeta de crédito • Consulta gratis incluida • Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
