'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Doctores Verificados',
    description: 'Todos nuestros especialistas están verificados con cédula profesional y credenciales médicas.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Video,
    title: 'Videoconsultas HD',
    description: 'Consulta con especialistas desde la comodidad de tu hogar con video HD seguro.',
    color: 'text-primary-500',
    bgColor: 'bg-primary-50',
  },
  {
    icon: Calendar,
    title: 'Citas Inmediatas',
    description: 'Agenda citas en menos de 24 horas con disponibilidad en tiempo real.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: FileText,
    title: 'Segunda Opinión IA',
    description: 'Obtén una segunda opinión médica de Dr. Simeon, nuestra IA certificada.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Shield,
    title: 'Seguridad Total',
    description: 'Tu información médica está protegida con encriptación de nivel bancario.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: MessageSquare,
    title: 'Chat Médico 24/7',
    description: 'Comunícate directamente con tu doctor antes y después de tu consulta.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-neutral-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            className="inline-block px-4 py-1.5 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full mb-4"
          >
            ¿Por qué elegirnos?
          </motion.span>
          <h2 className="section-headline text-3xl sm:text-4xl lg:text-5xl mb-4">
            Todo lo que necesitas para tu salud
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Una plataforma completa diseñada para conectarte con los mejores especialistas de forma rápida y segura
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0, 0, 0.2, 1]
              }}
            >
              <Card className="h-full p-6 lg:p-8 hover:shadow-xl interactive group cursor-pointer relative overflow-hidden border-neutral-200/60 bg-white"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <motion.div
                  className={`relative w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-5`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 17
                    }
                  }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </motion.div>

                <h3 className="relative text-xl font-bold text-text-primary mb-3 group-hover:text-primary-600 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="relative text-text-secondary leading-relaxed">
                  {feature.description}
                </p>

                {/* Arrow indicator on hover */}
                <motion.div
                  className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  initial={{ x: -8, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
