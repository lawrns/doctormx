'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Shield,
  Lock,
  Eye,
  CheckCircle,
  Server,
  Database,
  Key,
  FileText,
  AlertTriangle,
  Award,
  Verified,
  Users,
  Activity
} from 'lucide-react'

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All consultations and patient data are encrypted using AES-256 encryption, the same standard used by banks and governments.',
    details: [
      'Video calls use WebRTC with DTLS-SRTP',
      'Chat messages encrypted at rest and in transit',
      'File uploads encrypted before storage'
    ]
  },
  {
    icon: Shield,
    title: 'HIPAA Compliance',
    description: 'Our platform is designed to meet HIPAA requirements for protecting sensitive patient health information.',
    details: [
      'Business Associate Agreements with all partners',
      'Regular security assessments and audits',
      'Staff training on privacy and security protocols'
    ]
  },
  {
    icon: Database,
    title: 'Secure Data Storage',
    description: 'Patient data is stored in secure, redundant data centers with strict access controls.',
    details: [
      'Encrypted databases with field-level security',
      'Automated daily backups with point-in-time recovery',
      'Geographic redundancy for disaster recovery'
    ]
  },
  {
    icon: Key,
    title: 'Access Control',
    description: 'Multi-factor authentication and role-based access ensure only authorized users can access sensitive information.',
    details: [
      '2FA required for all healthcare providers',
      'Role-based permissions (patient, doctor, admin)',
      'Session timeout and automatic logout'
    ]
  }
]

const certifications = [
  {
    name: 'ISO 27001',
    description: 'Information Security Management',
    icon: Verified,
    status: 'In Progress'
  },
  {
    name: 'SOC 2 Type II',
    description: 'Security, Availability, Processing Integrity',
    icon: Award,
    status: 'Planned Q2 2024'
  },
  {
    name: 'COFEPRIS',
    description: 'Mexican Health Authority Compliance',
    icon: CheckCircle,
    status: 'Certified'
  },
  {
    name: 'HITECH',
    description: 'Health Information Technology',
    icon: FileText,
    status: 'Compliant'
  }
]

const complianceAreas = [
  {
    area: 'Data Privacy',
    standards: ['HIPAA', 'LFPDPPP', 'GDPR Ready'],
    icon: Eye
  },
  {
    area: 'Security Operations',
    standards: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
    icon: Server
  },
  {
    area: 'Medical Device',
    standards: ['IEC 62304', 'FDA Guidelines', 'COFEPRIS'],
    icon: Activity
  },
  {
    area: 'Cloud Security',
    standards: ['AWS Well-Architected', 'Cloud Controls Matrix', 'CSA STAR'],
    icon: Database
  }
]

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Seguridad y privacidad
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Proteger tu información de salud es una prioridad. Aplicamos controles de seguridad, privacidad y acceso para cuidar tus datos en cada interacción.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                Controles tipo HIPAA
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Lock className="w-4 h-4 mr-2" />
                Cifrado AES-256
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Shield className="w-4 h-4 mr-2" />
                Alineado con COFEPRIS
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cómo protegemos tu información</h2>
            <p className="text-lg text-gray-600">
              Múltiples capas de protección para resguardar información clínica y datos personales.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cumplimiento y certificaciones</h2>
            <p className="text-lg text-gray-600">
              Operamos con estándares y marcos de referencia para salud digital, privacidad y seguridad.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                  <Badge 
                    variant={cert.status === 'Certified' ? 'default' : cert.status === 'In Progress' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {cert.status}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <area.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{area.area}</h3>
                  </div>
                  <div className="space-y-1">
                    {area.standards.map((standard, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tus derechos y control</h2>
            <p className="text-lg text-gray-600">
              Puedes gestionar el acceso y uso de tu información de salud dentro de la plataforma.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Derechos del paciente</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Acceder a tu historial clínico disponible
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Solicitar correcciones de información
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Obtener una copia de tus datos
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Solicitar la eliminación de cuenta y datos aplicables
                </li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Buenas prácticas de seguridad</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Usa contraseñas fuertes y únicas
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Activa la autenticación en dos pasos cuando esté disponible
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Revisa actividad y accesos con frecuencia
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Reporta actividad sospechosa de inmediato
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Equipo de seguridad</h2>
            <p className="text-lg text-gray-600 mb-8">
              Mantenemos procesos de monitoreo, revisión y respuesta para proteger la plataforma.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <Shield className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-1">Monitoreo continuo</h3>
                <p className="text-sm text-gray-600">
                  Vigilancia operativa y detección temprana de anomalías.
                </p>
              </Card>
              <Card className="p-6">
                <Activity className="w-8 h-8 text-green-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-1">Revisiones periódicas</h3>
                <p className="text-sm text-gray-600">
                  Evaluaciones regulares de controles y exposición de riesgo.
                </p>
              </Card>
              <Card className="p-6">
                <FileText className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-1">Respuesta a incidentes</h3>
                <p className="text-sm text-gray-600">
                  Procedimientos de respuesta para investigar y contener incidentes.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Security */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Tienes dudas de seguridad?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Si necesitas ayuda con privacidad, seguridad o acceso a tus datos, nuestro equipo puede orientarte.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Contactar al equipo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
