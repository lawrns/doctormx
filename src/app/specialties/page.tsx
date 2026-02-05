'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import {
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Stethoscope,
  Activity,
  Scissors,
  Smile,
  Shield,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const specialties = [
  { 
    name: 'Cardiología', 
    icon: Heart, 
    description: 'Corazón y sistema cardiovascular', 
    doctors: 45, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50/50',
    borderColor: 'group-hover:border-rose-200'
  },
  { 
    name: 'Neurología', 
    icon: Brain, 
    description: 'Cerebro y sistema nervioso', 
    doctors: 32, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-50/50',
    borderColor: 'group-hover:border-indigo-200'
  },
  { 
    name: 'Oftalmología', 
    icon: Eye, 
    description: 'Ojos y visión', 
    doctors: 28, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50/50',
    borderColor: 'group-hover:border-blue-200'
  },
  { 
    name: 'Traumatología', 
    icon: Bone, 
    description: 'Huesos y articulaciones', 
    doctors: 38, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50/50',
    borderColor: 'group-hover:border-amber-200'
  },
  { 
    name: 'Pediatría', 
    icon: Baby, 
    description: 'Salud infantil', 
    doctors: 52, 
    color: 'text-pink-500', 
    bg: 'bg-pink-50/50',
    borderColor: 'group-hover:border-pink-200'
  },
  {
    name: 'Medicina General',
    icon: Stethoscope,
    description: 'Atención primaria',
    doctors: 89,
    color: 'text-blue-600',
    bg: 'bg-blue-50/50',
    borderColor: 'group-hover:border-blue-200'
  },
  { 
    name: 'Dermatología', 
    icon: Shield, 
    description: 'Piel, cabello y uñas', 
    doctors: 41, 
    color: 'text-orange-500', 
    bg: 'bg-orange-50/50',
    borderColor: 'group-hover:border-orange-200'
  },
  { 
    name: 'Ginecología', 
    icon: Users, 
    description: 'Salud femenina', 
    doctors: 47, 
    color: 'text-rose-400', 
    bg: 'bg-rose-50/50',
    borderColor: 'group-hover:border-rose-100'
  },
]

export default function SpecialtiesPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />
      
      {/* Hero Section with Ambient Glow */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Directorio de Especialistas
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-neutral-900 tracking-tight mb-6">
              Encuentra al <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">especialista ideal</span>
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Cuidado médico de alta precisión con los mejores doctores certificados de México.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <Link href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`} className="group block h-full">
                  <Card className={`relative p-8 h-full bg-white/70 backdrop-blur-sm border-neutral-100 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 ${specialty.borderColor} group-hover:-translate-y-1`}>
                    <div className={`w-14 h-14 ${specialty.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                      <specialty.icon className={`w-7 h-7 ${specialty.color}`} />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                        {specialty.name}
                      </h3>
                      <p className="text-neutral-500 leading-relaxed min-h-[3rem]">
                        {specialty.description}
                      </p>
                      
                      <div className="pt-6 flex items-center justify-between border-t border-neutral-50">
                        <span className="text-sm font-medium text-neutral-400">
                          {specialty.doctors} doctores disponibles
                        </span>
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern AI CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              ¿No sabes qué especialista necesitas?
            </h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
              Simeon puede analizar tus síntomas y recomendarte al especialista adecuado en segundos.
            </p>
            <Link href="/app/second-opinion">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(59,130,246,0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-blue-600/20"
              >
                <Sparkles className="w-5 h-5" />
                Iniciar Consulta IA Gratis
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
