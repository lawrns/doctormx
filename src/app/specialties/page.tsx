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
  ArrowRight
} from 'lucide-react'

const specialties = [
  { name: 'Cardiología', icon: Heart, description: 'Corazón y sistema cardiovascular', doctors: 45, color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Neurología', icon: Brain, description: 'Cerebro y sistema nervioso', doctors: 32, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Oftalmología', icon: Eye, description: 'Ojos y visión', doctors: 28, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Traumatología', icon: Bone, description: 'Huesos y articulaciones', doctors: 38, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Pediatría', icon: Baby, description: 'Salud infantil', doctors: 52, color: 'text-pink-500', bg: 'bg-pink-50' },
  { name: 'Medicina General', icon: Stethoscope, description: 'Atención primaria', doctors: 89, color: 'text-green-500', bg: 'bg-green-50' },
  { name: 'Dermatología', icon: Shield, description: 'Piel, cabello y uñas', doctors: 41, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Ginecología', icon: Users, description: 'Salud femenina', doctors: 47, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Psiquiatría', icon: Brain, description: 'Salud mental', doctors: 36, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Endocrinología', icon: Activity, description: 'Hormonas y metabolismo', doctors: 24, color: 'text-teal-500', bg: 'bg-teal-50' },
  { name: 'Cirugía General', icon: Scissors, description: 'Procedimientos quirúrgicos', doctors: 33, color: 'text-slate-500', bg: 'bg-slate-50' },
  { name: 'Odontología', icon: Smile, description: 'Salud dental', doctors: 56, color: 'text-cyan-500', bg: 'bg-cyan-50' },
]

export default function SpecialtiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Especialidades Médicas
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra especialistas certificados en más de 50 áreas médicas
            </p>
          </motion.div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}>
                  <Card className="p-6 h-full hover:shadow-lg hover:border-blue-200 transition-all group cursor-pointer">
                    <div className={`w-12 h-12 ${specialty.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <specialty.icon className={`w-6 h-6 ${specialty.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {specialty.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{specialty.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{specialty.doctors} doctores</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            ¿No encuentras tu especialidad?
          </h2>
          <p className="text-gray-600 mb-6">
            Consulta con Dr. Simeon, nuestro asistente IA, para orientación médica inmediata
          </p>
          <Link href="/app/second-opinion">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Consultar con Dr. Simeon IA
            </motion.button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
