'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Users,
  Shield,
  Heart,
  Award,
  CheckCircle,
  Star,
  MapPin,
  GraduationCap,
  Stethoscope,
  Activity,
  ArrowRight
} from 'lucide-react'

const team = [
  {
    name: 'Dr. Ana María García',
    role: 'Medical Director & Co-founder',
    credentials: 'MD, MPH',
    specialty: 'Internal Medicine',
    image: '/team/ana-garcia.jpg',
    bio: '15+ years of clinical practice and healthcare technology innovation. Former Chief Medical Officer at HealthTech MX.',
    education: 'UNAM Faculty of Medicine, Harvard MPH'
  },
  {
    name: 'Dr. Carlos Rodríguez',
    role: 'Head of Clinical Operations',
    credentials: 'MD, MBA',
    specialty: 'Cardiology',
    image: '/team/carlos-rodriguez.jpg',
    bio: 'Leading our clinical quality initiatives and doctor network expansion. Expert in telemedicine protocols.',
    education: 'Tec de Monterrey, IPADE MBA'
  },
  {
    name: 'Dr. Sofía Hernández',
    role: 'Chief Technology Officer',
    credentials: 'PhD Computer Science',
    specialty: 'Healthcare AI',
    image: '/team/sofia-hernandez.jpg',
    bio: 'Pioneering AI applications in healthcare with 10+ years in medical software development.',
    education: 'MIT, Stanford PhD'
  },
  {
    name: 'Dr. Miguel Ángel López',
    role: 'Medical Advisory Board Chair',
    credentials: 'MD, FACC',
    specialty: 'Cardiology',
    image: '/team/miguel-lopez.jpg',
    bio: 'Renowned cardiologist guiding our clinical governance and quality standards.',
    education: 'UNAM, Mayo Clinic Fellowship'
  }
]

const advisors = [
  {
    name: 'Dr. Patricia Morales',
    title: 'Healthcare Policy Expert',
    credentials: 'MD, Health Policy',
    expertise: 'Digital health regulation'
  },
  {
    name: 'Dr. Roberto Sánchez',
    title: 'Patient Safety Advocate',
    credentials: 'MD, Quality Improvement',
    expertise: 'Clinical quality systems'
  },
  {
    name: 'Dr. Laura Jiménez',
    title: 'Telemedicine Specialist',
    credentials: 'MD, Telehealth',
    expertise: 'Virtual care delivery'
  }
]

const stats = [
  { icon: Users, label: 'Verified Doctors', value: '3,742+' },
  { icon: Heart, label: 'Patients Served', value: '50,000+' },
  { icon: Star, label: 'Consultations', value: '100,000+' },
  { icon: MapPin, label: 'Cities Covered', value: '150+' }
]

const certifications = [
  { name: 'COFEPRIS Certified', icon: Shield },
  { name: 'HIPAA Compliant', icon: Activity },
  { name: 'ISO 27001', icon: Award },
  { name: 'End-to-End Encryption', icon: CheckCircle }
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Sobre Doctor.mx
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Estamos ampliando el acceso a la salud en México al conectar pacientes con 
              doctores verificados mediante consultas seguras, convenientes y centradas en la confianza.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/doctors">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Encontrar un doctor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/for-doctors">
                <Button variant="outline" size="lg">
                  Unirme como doctor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra misión</h2>
            <p className="text-lg text-gray-600 mb-8">
              Hacer que la atención médica de calidad sea más accesible para cada persona en México, 
              conectando pacientes con el doctor indicado en el momento correcto, sin importar la distancia.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <Heart className="w-8 h-8 text-red-500 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Primero el paciente</h3>
                <p className="text-sm text-gray-600">
                  Cada decisión prioriza la seguridad, privacidad y calidad clínica para los pacientes.
                </p>
              </Card>
              <Card className="p-6">
                <Stethoscope className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Impulso al médico</h3>
                <p className="text-sm text-gray-600">
                  Damos a los doctores herramientas para crecer su práctica y atender mejor a más pacientes.
                </p>
              </Card>
              <Card className="p-6">
                <Shield className="w-8 h-8 text-green-500 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Confianza y seguridad</h3>
                <p className="text-sm text-gray-600">
                  Cada doctor es verificado y cada consulta se protege con controles de seguridad y privacidad.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Equipo líder</h2>
            <p className="text-lg text-gray-600">
              Profesionales de salud y tecnología enfocados en elevar el estándar de la atención médica digital en México.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-blue-600 mb-1">{member.role}</p>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {member.credentials}
                      </Badge>
                      <p className="text-sm text-gray-600 mb-2">{member.bio}</p>
                      <p className="text-xs text-gray-500">
                        <GraduationCap className="inline w-3 h-3 mr-1" />
                        {member.education}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Advisory Board */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Consejo médico asesor</h2>
            <p className="text-lg text-gray-600">
              Especialistas que supervisan nuestros estándares clínicos, de seguridad y de calidad asistencial.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {advisors.map((advisor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{advisor.name}</h3>
                  <p className="text-sm text-blue-600 mb-1">{advisor.title}</p>
                  <Badge variant="outline" className="text-xs mb-2">
                    {advisor.credentials}
                  </Badge>
                  <p className="text-xs text-gray-600">{advisor.expertise}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Certificaciones y cumplimiento</h2>
            <p className="text-lg text-gray-600 mb-12">
              Operamos con controles orientados a seguridad, privacidad y cumplimiento para salud digital.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <cert.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Construyamos una mejor experiencia de salud
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Ya sea que busques atención médica o quieras crecer tu práctica, Doctor.mx te acompaña con una experiencia confiable y moderna.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/doctors">
                <Button size="lg" variant="secondary">
                  Reservar una consulta
                </Button>
              </Link>
              <Link href="/for-doctors">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Unirme a la red médica
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
