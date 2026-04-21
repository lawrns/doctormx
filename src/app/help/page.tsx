'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  Calendar,
  CreditCard,
  Video,
  User,
  Search
} from 'lucide-react'

const faqs = [
  {
    category: 'Citas y Consultas',
    icon: Calendar,
    questions: [
      {
        q: '¿Cómo agendo una cita?',
        a: 'Busca un doctor en nuestra plataforma, selecciona el horario disponible que prefieras y confirma tu cita. Recibirás un correo de confirmación con los detalles.'
      },
      {
        q: '¿Puedo cancelar o reprogramar mi cita?',
        a: 'Sí, puedes cancelar o reprogramar tu cita desde tu panel de usuario hasta 24 horas antes de la consulta sin cargo alguno.'
      },
      {
        q: '¿Cuánto tiempo dura una consulta?',
        a: 'Las consultas generalmente duran entre 20 y 30 minutos, dependiendo de la especialidad y complejidad del caso.'
      }
    ]
  },
  {
    category: 'Videoconsultas',
    icon: Video,
    questions: [
      {
        q: '¿Qué necesito para una videoconsulta?',
        a: 'Solo necesitas un dispositivo con cámara y micrófono (computadora, tablet o celular), conexión a internet estable y un lugar tranquilo.'
      },
      {
        q: '¿Las videoconsultas son seguras?',
        a: 'Sí, utilizamos encriptación de extremo a extremo para proteger tu privacidad. Todas las consultas cumplen con las normas de protección de datos.'
      }
    ]
  },
  {
    category: 'Pagos',
    icon: CreditCard,
    questions: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), transferencias bancarias y pagos en OXXO.'
      },
      {
        q: '¿Puedo obtener un reembolso?',
        a: 'Sí, si cancelas tu cita con más de 24 horas de anticipación. Para casos especiales, contacta a nuestro equipo de soporte.'
      }
    ]
  },
  {
    category: 'Cuenta y Perfil',
    icon: User,
    questions: [
      {
        q: '¿Cómo creo una cuenta?',
        a: 'Haz clic en "Registrarse", ingresa tu correo electrónico y completa tu perfil. El proceso toma menos de 2 minutos.'
      },
      {
        q: '¿Cómo actualizo mi información?',
        a: 'Ingresa a tu cuenta, ve a "Mi Perfil" y podrás editar tu información personal, historial médico y preferencias.'
      }
    ]
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b border-border last:border-0">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-accent px-4 -mx-4 rounded-lg transition-colors h-auto"
      >
        <span className="font-medium text-foreground text-left">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            ¿Cómo podemos ayudarte hoy?
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">Chat en vivo</h3>
              <p className="text-muted-foreground text-sm mb-4">Respuesta en minutos</p>
              <Button variant="outline" className="w-full">Iniciar chat</Button>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-vital-soft rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-vital" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">Llámanos</h3>
              <p className="text-muted-foreground text-sm mb-4">Lun-Vie 9am-6pm</p>
              <Button variant="outline" className="w-full">55 1234 5678</Button>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground text-sm mb-4">Respuesta en 24h</p>
              <Link href="/contact">
                <Button variant="outline" className="w-full">Enviar mensaje</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-8 text-center">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-8">
            {faqs.map((category) => (
              <Card key={category.category} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{category.category}</h3>
                </div>
                <div className="space-y-0">
                  {category.questions.map((faq, index) => (
                    <FAQItem key={index} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
            ¿Aún necesitas ayuda?
          </h2>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo de soporte está listo para asistirte
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Contactar soporte
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
