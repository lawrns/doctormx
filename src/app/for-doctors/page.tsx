'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  CheckCircle,
  Users,
  Calendar,
  Video,
  CreditCard,
  TrendingUp,
  Shield,
  Star,
  ArrowRight
} from 'lucide-react'

const benefits = [
  {
    icon: Users,
    title: 'Alcanza más pacientes',
    description: 'Conecta con miles de pacientes que buscan atención médica de calidad en México.',
  },
  {
    icon: Calendar,
    title: 'Agenda inteligente',
    description: 'Sistema de citas automatizado que se sincroniza con tu calendario existente.',
  },
  {
    icon: Video,
    title: 'Videoconsultas HD',
    description: 'Plataforma de telemedicina segura y fácil de usar para consultas remotas.',
  },
  {
    icon: CreditCard,
    title: 'Pagos seguros',
    description: 'Recibe pagos directamente. Sin complicaciones, sin demoras.',
  },
  {
    icon: TrendingUp,
    title: 'Crece tu práctica',
    description: 'Herramientas de marketing y análisis para hacer crecer tu consultorio.',
  },
  {
    icon: Shield,
    title: 'Respaldo legal',
    description: 'Cumplimiento con normativas de salud y protección de datos.',
  },
]

const stats = [
  { value: '500+', label: 'Doctores activos' },
  { value: '50,000+', label: 'Consultas realizadas' },
  { value: '98%', label: 'Satisfacción' },
  { value: '24/7', label: 'Soporte' },
]

const testimonials = [
  {
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cardiólogo',
    location: 'Guadalajara',
    content: 'Doctor.mx me ha permitido expandir mi práctica y llegar a pacientes que antes no podía atender. La plataforma es intuitiva y el soporte es excelente.',
    rating: 5,
  },
  {
    name: 'Dra. Ana López',
    specialty: 'Dermatóloga',
    location: 'CDMX',
    content: 'Las videoconsultas han transformado mi práctica. Ahora puedo atender a pacientes de todo el país sin sacrificar la calidad de la atención.',
    rating: 5,
  },
]

export default function ForDoctorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-blue-500" />
                Únete a +500 doctores en México
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Haz crecer tu práctica médica con{' '}
                <span className="text-blue-600">Doctor.mx</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                La plataforma de telemedicina #1 en México. Conecta con pacientes, 
                gestiona citas y recibe pagos de forma segura.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register?role=doctor">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                    Registrarme gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/doctor/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Ver planes y precios
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Sin costo de registro
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Cancela cuando quieras
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ¡Nuevo!
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Video className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Videoconsultas HD</h3>
                  <p className="text-gray-600 mb-6">Atiende pacientes desde cualquier lugar</p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    {['Grabación opcional', 'Chat integrado', 'Recetas digitales', 'Pagos seguros'].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu práctica
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas para médicos mexicanos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros doctores
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.specialty} • {testimonial.location}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Comienza a crecer tu práctica hoy
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a más de 500 doctores que ya confían en Doctor.mx
          </p>
          <Link href="/auth/register?role=doctor">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6">
              Registrarme gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-blue-200 text-sm mt-6">
            Sin tarjeta de crédito • Configuración en 5 minutos
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
