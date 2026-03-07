'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
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
    title: 'Pacientes de todo México',
    description: 'Tu perfil visible para miles de pacientes que buscan especialistas como tú. Verificación de cédula incluida.',
  },
  {
    icon: Calendar,
    title: 'Agenda que trabaja por ti',
    description: 'Sincronización con Google Calendar. Recordatorios automáticos. Cero citas perdidas.',
  },
  {
    icon: Video,
    title: 'Telemedicina de primer nivel',
    description: 'Video HD cifrado, recetas digitales válidas, y expediente clínico integrado.',
  },
  {
    icon: CreditCard,
    title: 'Cobra sin perseguir',
    description: 'Pagos directos a tu cuenta en 48 horas. Tarjetas, SPEI, y OXXO Pay.',
  },
  {
    icon: TrendingUp,
    title: 'Analítica para crecer',
    description: 'Dashboard con métricas de tu práctica: pacientes nuevos, retención, ingresos mensuales.',
  },
  {
    icon: Shield,
    title: 'Cumplimiento garantizado',
    description: 'Plataforma alineada con NOM y LFPDPPP. Tus datos y los de tus pacientes, protegidos.',
  },
]

const stats = [
  { value: '500+', label: 'Doctores activos' },
  { value: '10,000+', label: 'Consultas realizadas' },
  { value: '98%', label: 'Satisfacción' },
  { value: '48h', label: 'Tiempo de pago' },
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
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-[hsl(var(--surface-tint))] to-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))] rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-[hsl(var(--brand-ocean))]" />
                Más de 500 médicos ya crecen con nosotros
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[hsl(var(--text-primary))] mb-6 leading-tight">
                Más pacientes. Menos administración.{' '}
                <span className="text-[hsl(var(--brand-ocean))]">Crece con Doctor.mx</span>
              </h1>

              <p className="text-xl text-[hsl(var(--text-secondary))] mb-8 leading-relaxed">
                La plataforma de telemedicina #1 en México. Conecta con pacientes de todo el país, gestiona citas automáticamente, y recibe pagos seguros — sin complicaciones técnicas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register?role=doctor">
                  <Button size="lg" className="bg-[hsl(var(--brand-ocean))] hover:bg-[hsl(var(--brand-ocean))]/90 text-lg px-8 py-6 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2">
                    Registrarme gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/doctor/pricing">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2">
                    Ver planes y precios
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 mt-8 text-sm text-[hsl(var(--text-muted))]">
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
              <div className="relative bg-gradient-to-br from-[hsl(var(--surface-tint))] to-[hsl(var(--surface-quiet))] rounded-3xl p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ¡Nuevo!
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-[hsl(var(--card))] rounded-full flex items-center justify-center shadow-lg">
                    <Video className="w-12 h-12 text-[hsl(var(--brand-ocean))]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">Videoconsultas HD</h3>
                  <p className="text-[hsl(var(--text-secondary))] mb-6">Atiende pacientes desde cualquier lugar</p>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    {['Grabación opcional', 'Chat integrado', 'Recetas digitales', 'Pagos seguros'].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
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
      <section className="py-16 bg-[hsl(var(--surface-quiet))]">
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
                <div className="text-4xl md:text-5xl font-bold text-[hsl(var(--brand-ocean))] mb-2">
                  {stat.value}
                </div>
                <div className="text-[hsl(var(--text-secondary))]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="public-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <PublicSectionHeading
              eyebrow="Herramientas clave"
              title="Todo lo que necesitas"
              accent="para tu práctica"
              description="Herramientas profesionales diseñadas para médicos mexicanos"
            />
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
                  <div className="w-12 h-12 bg-[hsl(var(--surface-tint))] rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-[hsl(var(--brand-ocean))]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-[hsl(var(--text-secondary))]">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="public-section bg-[hsl(var(--surface-quiet))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <PublicSectionHeading
              eyebrow="Prueba social"
              title="Lo que dicen"
              accent="nuestros doctores"
            />
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
                  <p className="text-[hsl(var(--text-secondary))] text-lg mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-[hsl(var(--text-primary))]">{testimonial.name}</div>
                      <div className="text-sm text-[hsl(var(--text-muted))]">{testimonial.specialty} • {testimonial.location}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="public-section bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <PublicSectionHeading
            eyebrow="Listo para empezar"
            title="Empieza a crecer"
            accent="hoy"
            description="Crea tu perfil gratuito y comienza a recibir pacientes esta semana"
            theme="dark"
          />
          <Link href="/auth/register?role=doctor">
            <Button size="lg" className="bg-white text-[hsl(var(--brand-ocean))] hover:bg-[hsl(var(--surface-quiet))] text-lg px-10 py-6 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2">
              Registrarme gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-blue-200 text-sm mt-6">
            Registro gratuito - Perfil listo en 10 minutos - Sin cuota mensual obligatoria
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
