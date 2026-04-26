'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, CreditCard, Mail, MessageSquare, Search, Video } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const faqs = [
  {
    category: 'Citas',
    icon: Calendar,
    questions: [
      ['¿Cómo agendo una cita?', 'Busca un doctor, revisa modalidad, precio y perfil. Después selecciona horario y confirma la reserva.'],
      ['¿Puedo reprogramar?', 'Sí, desde tu cuenta cuando la política de la cita lo permita. Si el pago ya se procesó, soporte puede orientarte.'],
    ],
  },
  {
    category: 'Videoconsulta',
    icon: Video,
    questions: [
      ['¿Qué necesito?', 'Un dispositivo con cámara, micrófono, conexión estable y un espacio privado.'],
      ['¿Es segura?', 'El flujo limita datos sensibles al contexto clínico y usa controles de acceso para proteger la sesión.'],
    ],
  },
  {
    category: 'Pagos',
    icon: CreditCard,
    questions: [
      ['¿Qué métodos aceptan?', 'Tarjeta, SPEI y OXXO cuando estén habilitados para la consulta seleccionada.'],
      ['¿Dónde veo el precio?', 'El precio debe aparecer antes de confirmar la reserva y depende del doctor, modalidad y servicio.'],
    ],
  },
]

function FAQRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-0 py-4 text-left"
      >
        <span className="font-semibold text-foreground">{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-6 text-muted-foreground">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="pt-24 md:pt-28">
        <div className="editorial-shell">
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Centro de ayuda
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground md:text-6xl">
                Respuestas claras para reservar con confianza.
              </h1>
            </div>
            <div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Encuentra ayuda sobre citas, videoconsulta, pagos y cuenta. Si el caso es clínico o urgente, usa atención médica directa.
              </p>
              <div className="relative mt-5 max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar en ayuda..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="divide-y divide-border rounded-[10px] border border-border bg-card">
              <Link href="/contact" className="flex items-center gap-3 p-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60">
                <MessageSquare className="h-4 w-4 text-primary" />
                Contactar soporte
              </Link>
              <a href="mailto:soporte@doctor.mx" className="flex items-center gap-3 p-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60">
                <Mail className="h-4 w-4 text-primary" />
                soporte@doctor.mx
              </a>
            </div>
          </aside>

          <div className="space-y-4">
            {faqs.map((category) => (
              <section key={category.category} className="rounded-[12px] border border-border bg-card p-5">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[hsl(var(--surface-tint))] text-primary">
                    <category.icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{category.category}</h2>
                </div>
                {category.questions.map(([question, answer]) => (
                  <FAQRow key={question} question={question} answer={answer} />
                ))}
              </section>
            ))}

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
              <Button asChild variant="primary">
                <Link href="/contact">Contactar soporte</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/faq">Ver FAQ completo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
