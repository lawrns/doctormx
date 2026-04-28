import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Soporte - Doctor.mx',
  description:
    'Centro de soporte para pacientes y doctores. Correo electrónico, horarios de atención y preguntas frecuentes.',
  alternates: { canonical: '/support' },
}

const hours = [
  { day: 'Lunes a viernes', time: '8:00 AM – 8:00 PM' },
  { day: 'Sábado', time: '9:00 AM – 6:00 PM' },
  { day: 'Domingo', time: 'Cerrado' },
]

const faqLinks = [
  { label: '¿Cómo agendo una cita?', href: '/help#citas' },
  { label: '¿Cómo funciona la videoconsulta?', href: '/help#videoconsulta' },
  { label: 'Métodos de pago disponibles', href: '/help#pagos' },
  { label: 'Política de cancelación', href: '/faq' },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Soporte
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Estamos aquí para ayudarte.
            </h1>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Si tienes dudas sobre tu cuenta, una cita o el funcionamiento de la plataforma, revisa los recursos abajo o escríbenos.
          </p>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <Card className="p-5 space-y-4 border-border">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Correo
                </p>
                <a href="mailto:soporte@doctor.mx" className="mt-1 block text-lg font-semibold tracking-tight text-foreground">
                  soporte@doctor.mx
                </a>
              </div>
            </Card>

            <Card className="p-5 space-y-4 border-border">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Teléfono
                </p>
                <a href="tel:+525512345678" className="mt-1 block text-lg font-semibold tracking-tight text-foreground">
                  (55) 1234 5678
                </a>
              </div>
            </Card>

            <Card className="p-5 space-y-4 border-border">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Horario
                </p>
                <div className="mt-2 space-y-1">
                  {hours.map((h) => (
                    <div key={h.day} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{h.day}</span>
                      <span className="font-medium text-foreground">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </aside>

          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="h-5 w-5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Preguntas frecuentes
                </p>
              </div>
              <div className="divide-y divide-border rounded-[12px] border border-border bg-card">
                {faqLinks.map((faq) => (
                  <Link
                    key={faq.label}
                    href={faq.href}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/50"
                  >
                    <span className="text-sm font-medium text-foreground">{faq.label}</span>
                    <span className="text-sm text-primary">Ver respuesta</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[12px] border border-border bg-card p-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
                ¿No encuentras lo que buscas?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Escríbenos por correo o usa el formulario de contacto. Incluye nombre, tipo de usuario y número de cita si aplica.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/contact">Ir a contacto</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/help">Centro de ayuda</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
