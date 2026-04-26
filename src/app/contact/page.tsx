'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Loader2,
  Mail,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
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
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const contactTracks = [
  {
    title: 'Pacientes',
    body: 'Citas, pagos, videoconsulta, cuenta o seguimiento posterior a una reserva.',
    icon: Stethoscope,
  },
  {
    title: 'Doctores',
    body: 'Alta de perfil, cédula, modalidades, agenda, precio o publicación en directorio.',
    icon: ShieldCheck,
  },
  {
    title: 'Clínicas y alianzas',
    body: 'Equipos médicos, operación multi-sede, integraciones o colaboración institucional.',
    icon: Building2,
  },
]

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Contacto
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Soporte claro para pacientes, doctores y clínicas.
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Describe el problema con contexto médico u operativo suficiente. Si se trata de una urgencia o señal de alarma, busca atención médica inmediata.
            </p>
            <div className="border border-amber/30 bg-amber/10 p-4 text-sm leading-relaxed text-amber-700">
              <AlertTriangle className="mb-2 h-4 w-4" />
              Doctor.mx no atiende emergencias por este canal.
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <Mail className="h-5 w-5 text-primary" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Canal directo
            </p>
            <a href="mailto:soporte@doctor.mx" className="mt-3 block text-lg font-semibold tracking-tight text-foreground">
              soporte@doctor.mx
            </a>
            <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
              Incluye nombre, correo de cuenta, tipo de usuario y número de cita si aplica.
            </p>
          </aside>

          <div className="space-y-10">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                A quién escribir
              </p>
              <div className="mt-5 divide-y divide-border border-y border-border bg-card">
                {contactTracks.map((track) => (
                  <div key={track.title} className="grid gap-4 p-5 md:grid-cols-[44px_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                      <track.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">{track.title}</h2>
                      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{track.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Mensaje
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Un formulario breve, sin prometer tiempos no auditados.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Este flujo captura la información mínima para orientar el caso. Los tiempos dependen del tipo de solicitud y datos disponibles.
                </p>
              </div>

              <div className="border border-border bg-card p-6 shadow-[var(--public-shadow-soft)]">
                {isSubmitted ? (
                  <div className="py-10">
                    <CheckCircle className="h-8 w-8 text-[hsl(var(--trust))]" />
                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                      Mensaje preparado
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Gracias. Si tu caso incluye información clínica sensible, revisa que sea necesaria antes de enviarla.
                    </p>
                    <Button className="mt-6" onClick={() => setIsSubmitted(false)}>
                      Escribir otro mensaje
                    </Button>
                  </div>
                ) : (
                  <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      setIsSubmitting(true)
                      const formData = new FormData(event.currentTarget)
                      const data = Object.fromEntries(formData)

                      try {
                        const res = await fetch('/api/contact', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(data),
                        })
                        if (res.ok) {
                          setIsSubmitted(true)
                        } else {
                          alert('Error al enviar. Intenta de nuevo.')
                        }
                      } catch {
                        alert('Error de conexión. Intenta de nuevo.')
                      } finally {
                        setIsSubmitting(false)
                      }
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Nombre</span>
                        <Input name="name" required placeholder="Tu nombre" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Correo</span>
                        <Input name="email" type="email" required placeholder="correo@ejemplo.com" />
                      </label>
                    </div>

                    <label className="space-y-2 block">
                      <span className="text-sm font-medium text-foreground">Tipo de solicitud</span>
                      <Select name="subject" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paciente">Paciente</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="clinica">Clínica o alianza</SelectItem>
                          <SelectItem value="seguridad">Privacidad o seguridad</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>

                    <label className="space-y-2 block">
                      <span className="text-sm font-medium text-foreground">Mensaje</span>
                      <Textarea
                        name="message"
                        required
                        rows={6}
                        placeholder="Describe el caso, número de cita si aplica y qué necesitas resolver."
                      />
                    </label>

                    <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Preparar mensaje
                    </Button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
