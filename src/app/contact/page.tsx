'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PageHero,
  Eyebrow,
  ChapterHeader,
  EditorialSection,
  SignatureCard,
  PulseDot,
} from '@/components/editorial'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* ─── HERO ─── */}
      <PageHero
        eyebrow="Contacto"
        title={
          <>
            Hablemos de{' '}
            <em className="font-serif font-normal">salud</em>
          </>
        }
        lead="Estamos aquí para ayudarte. Ya sea que tengas una pregunta, un problema técnico, o quieras unirte a nuestra red de doctores."
        stats={[
          { value: '< 24h', label: 'Tiempo de respuesta promedio' },
          { value: '98%', label: 'Satisfacción de usuarios' },
        ]}
      >
        <div className="flex items-center gap-3 mt-10">
          <PulseDot />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Equipo de soporte activo
          </span>
        </div>
      </PageHero>

      {/* ─── CHAPTER 1: DÓNDE ENCONTRARNOS ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="01"
            title="Dónde encontrarnos"
            lead="Múltiples canales para que elijas el que prefieras."
          />

          <div className="grid md:grid-cols-3 gap-6">
            <SignatureCard>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cobalt-800 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground block mb-1">
                    Email
                  </span>
                  <p className="font-display text-lg font-semibold text-foreground">
                    soporte@doctor.mx
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Respuesta garantizada en 24 horas
                  </p>
                </div>
              </div>
            </SignatureCard>

            <SignatureCard>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-vital flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground block mb-1">
                    Teléfono
                  </span>
                  <p className="font-display text-lg font-semibold text-foreground">
                    +52 55 1234 5678
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lun–Vie 9:00 – 18:00 CST
                  </p>
                </div>
              </div>
            </SignatureCard>

            <SignatureCard>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cobalt-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground block mb-1">
                    Oficina
                  </span>
                  <p className="font-display text-lg font-semibold text-foreground">
                    Ciudad de México
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Atención solo con cita previa
                  </p>
                </div>
              </div>
            </SignatureCard>
          </div>

          {/* Hours row */}
          <div className="mt-8 flex items-center gap-3 px-6 py-4 border border-border rounded-2xl bg-secondary/30">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Horario:
            </span>
            <span className="text-sm text-foreground">
              Lunes a Viernes 9:00 – 18:00 · Sábados 9:00 – 14:00 · Domingos cerrado
            </span>
          </div>
        </div>
      </EditorialSection>

      {/* ─── CHAPTER 2: ESCRÍBENOS ─── */}
      <EditorialSection>
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <ChapterHeader
            number="02"
            title="Escríbenos"
            lead="Cuéntanos en qué podemos ayudarte. Cuanto más específico seas, mejor podremos asistirte."
          />

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: context */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="pb-6 border-b border-border">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground block mb-2">
                    Para pacientes
                  </span>
                  <p className="text-foreground">
                    Problemas con citas, pagos, o tu cuenta. También puedes escribirnos por WhatsApp para respuesta inmediata.
                  </p>
                </div>
                <div className="pb-6 border-b border-border">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground block mb-2">
                    Para doctores
                  </span>
                  <p className="text-foreground">
                    Verificación de perfil, configuración de disponibilidad, o preguntas sobre tu suscripción.
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground block mb-2">
                    Alianzas
                  </span>
                  <p className="text-foreground">
                    Si representas a una clínica, aseguradora, o institución de salud, escríbenos a{' '}
                    <a href="mailto:alianzas@doctor.mx" className="text-cobalt-700 hover:underline">
                      alianzas@doctor.mx
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-3">
              <SignatureCard className="p-8 md:p-10">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-vital-soft flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-vital" />
                    </div>
                    <h3 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
                      Mensaje enviado
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      Gracias por contactarnos. Te responderemos en las próximas 24 horas.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormState({ name: '', email: '', subject: '', message: '' })
                      }}
                    >
                      Enviar otro mensaje
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          Nombre completo
                        </label>
                        <Input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) =>
                            setFormState({ ...formState, name: e.target.value })
                          }
                          placeholder="Tu nombre"
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          Email
                        </label>
                        <Input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) =>
                            setFormState({ ...formState, email: e.target.value })
                          }
                          placeholder="tu@email.com"
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Asunto
                      </label>
                      <Select
                        value={formState.subject}
                        onValueChange={(value) =>
                          setFormState({ ...formState, subject: value })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecciona un tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Consulta general</SelectItem>
                          <SelectItem value="technical">Problema técnico</SelectItem>
                          <SelectItem value="billing">Facturación</SelectItem>
                          <SelectItem value="doctor">
                            Soy doctor — Quiero unirme
                          </SelectItem>
                          <SelectItem value="partnership">
                            Alianza comercial
                          </SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        Mensaje
                      </label>
                      <Textarea
                        required
                        rows={6}
                        value={formState.message}
                        onChange={(e) =>
                          setFormState({ ...formState, message: e.target.value })
                        }
                        placeholder="¿En qué podemos ayudarte?"
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="w-full h-14 bg-ink hover:bg-cobalt-800 text-white rounded-xl text-[15px] font-medium tracking-tight transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(15,37,95,0.35)]"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Enviando…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Enviar mensaje
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </SignatureCard>
            </div>
          </div>
        </div>
      </EditorialSection>

      <Footer />
    </main>
  )
}
