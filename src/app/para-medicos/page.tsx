import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { BookOpen, TrendingUp, FileText, Monitor, Users, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recursos para Médicos | Digitaliza tu Consultorio con Doctor.mx',
  description: 'Guías, herramientas y recursos para médicos mexicanos que quieren digitalizar su práctica. Expediente clínico electrónico, telemedicina y más.',
  openGraph: {
    title: 'Recursos para Médicos Mexicanos | Doctor.mx',
    description: 'Todo lo que necesitas para digitalizar tu consultorio y conseguir más pacientes.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/para-medicos',
  },
}

const resourceCards = [
  {
    title: 'Guía para digitalizar tu consultorio',
    description: 'Aprende paso a paso cómo transformar tu consultorio tradicional en una práctica digital. Desde el expediente electrónico hasta la agenda en línea.',
    icon: <Monitor className="w-6 h-6" />,
    category: 'Guía práctica',
    href: '/blog/digitalizar-consultorio-medico-2026',
  },
  {
    title: 'Cómo conseguir más pacientes',
    description: 'Estrategias probadas para atraer más pacientes sin gastar en publicidad. SEO médico, WhatsApp Business y marketing de contenidos para doctores.',
    icon: <TrendingUp className="w-6 h-6" />,
    category: 'Marketing médico',
    href: '/blog/conseguir-pacientes-sin-publicidad',
  },
  {
    title: 'Expediente clínico electrónico',
    description: 'Guía completa sobre el expediente clínico electrónico en México: NOM-024-SSA3-2012, beneficios, implementación y comparativa de plataformas.',
    icon: <FileText className="w-6 h-6" />,
    category: 'Tecnología',
    href: '/blog/expediente-clinico-electronico-medicos',
  },
  {
    title: 'Telemedicina en México 2026',
    description: 'El panorama actual de la telemedicina en México: regulación, plataformas, mejores prácticas y cómo empezar a ofrecer consultas en línea.',
    icon: <Users className="w-6 h-6" />,
    category: 'Tendencias',
    href: '/blog/telemedicina-mexico-guia-medicos',
  },
  {
    title: 'Ventajas de la receta electrónica',
    description: 'Cómo funciona la receta electrónica en México, requisitos legales y beneficios para médicos y pacientes. Implementación paso a paso.',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'Legal',
    href: '/blog/ventajas-receta-electronica-mexico',
  },
  {
    title: 'WhatsApp Business para médicos',
    description: 'Guía práctica para usar WhatsApp Business en tu consultorio: catálogo de servicios, respuestas rápidas y automatización de citas.',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'Herramientas',
    href: '/blog/whatsapp-medicos-business-consultorio',
  },
]

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default function ParaMedicosPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Header />

      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="editorial-shell py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recursos para médicos</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Digitaliza tu práctica médica
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Guías, herramientas y recursos para médicos mexicanos que quieren modernizar su consultorio, atraer más pacientes y optimizar su práctica.
            </p>
          </div>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="editorial-shell py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resourceCards.map((resource, i) => (
              <Card key={i} hover padding="lg" className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {resource.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {resource.category}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {resource.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {resource.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    href={resource.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Leer más
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-card border-y border-border py-12">
        <div className="editorial-shell">
          <div className="mx-auto max-w-4xl grid gap-8 text-center md:grid-cols-3">
            {[
              { value: '500+', label: 'Médicos registrados', sublabel: 'En todo México' },
              { value: '$499', label: 'Precio mensual', sublabel: 'vs $2,400 de Doctoralia' },
              { value: '14 días', label: 'Prueba gratuita', sublabel: 'Sin tarjeta de crédito' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-display text-4xl font-bold text-primary">{stat.value}</p>
                <p className="mt-2 font-semibold text-foreground">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-12 md:py-16">
        <div className="editorial-shell">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground">
              ¿Listo para digitalizar tu consultorio?
            </h2>
            <p className="mt-4 text-primary-foreground/70">
              Crea tu perfil verificado en minutos. IA para notas clínicas, pacientes por WhatsApp y videoconsultas incluidas.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/connect"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-foreground px-6 text-sm font-semibold text-ink transition-transform active:scale-[0.98] hover:bg-primary-foreground/90"
              >
                Crear perfil verificado gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/alternativa-doctoralia"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 active:scale-[0.98]"
              >
                Comparar con Doctoralia
              </Link>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/50">14 días gratis • $499 MXN/mes después • Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
