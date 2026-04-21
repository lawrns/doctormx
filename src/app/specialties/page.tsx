'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
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
    color: 'text-primary', 
    bg: 'bg-primary/10/50',
    borderColor: 'group-hover:border-primary/20'
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
    color: 'text-primary',
    bg: 'bg-primary/10/50',
    borderColor: 'group-hover:border-primary/20'
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
      <section className="relative overflow-hidden public-section pt-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <PublicSectionHeading
              eyebrow="Directorio de especialistas"
              title="Encuentra al"
              accent="especialista ideal"
              description="Cuidado médico de alta precisión con los mejores doctores certificados de México."
            />
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
                <Link href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`} className="group block h-full rounded-2xl focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 outline-none">
                  <Card className={`relative p-8 h-full bg-card/70 backdrop-blur-sm border-border hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-200 ${specialty.borderColor} group-hover:-translate-y-1`}>
                    <div className={`w-14 h-14 ${specialty.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                      <specialty.icon className={`w-7 h-7 ${specialty.color}`} />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {specialty.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed min-h-[3rem]">
                        {specialty.description}
                      </p>
                      
                      <div className="pt-6 flex items-center justify-between border-t border-border">
                        <span className="text-sm font-medium text-muted-foreground">
                          {specialty.doctors} doctores disponibles
                        </span>
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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
      <section className="public-section relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md"
          >
            <PublicSectionHeading
              eyebrow="Orientación asistida"
              title="¿No sabes qué"
              accent="especialista necesitas?"
              description="Dr. Simeon IA puede analizar tus síntomas y recomendarte al especialista adecuado en segundos."
              theme="dark"
            />
            <Link href="/app/second-opinion">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(59,130,246,0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary transition-all flex items-center gap-3 mx-auto shadow-xl shadow-primary/20 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
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
