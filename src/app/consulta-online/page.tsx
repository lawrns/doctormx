import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import {
  Video,
  ShieldCheck,
  MapPin,
  CreditCard,
  FileText,
  Calendar,
  MessageSquare,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { getAvailableSpecialties } from '@/lib/discovery'
import { discoverDoctors } from '@/lib/discovery'

export const metadata: Metadata = {
  title: 'Consulta en Linea con Especialistas | Doctor.mx',
  description:
    'Consulta en linea con especialistas certificados desde cualquier lugar de Mexico. Sin filas de espera, pago seguro y notas medicas digitales. Agenda ahora.',
  openGraph: {
    title: 'Consulta en Linea con Especialistas | Doctor.mx',
    description:
      'Consulta en linea con especialistas certificados desde cualquier lugar de Mexico.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/consulta-online',
  },
}

const benefits = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Sin filas de espera',
    description:
      'Conectate con un especialista certificado desde tu hogar. Olvidate de las salas de espera.',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Desde cualquier lugar',
    description:
      'Consulta desde tu computadora, tablet o celular. Solo necesitas internet.',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Pago seguro',
    description:
      'Tarjeta, SPEI u OXXO. Tu pago esta protegido y el reembolso es automatico si el doctor no conecta.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Notas medicas digitales',
    description:
      'Recibe tu diagnostico, receta y notas medicas directamente en tu perfil. Disponibles siempre.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Elige a tu especialista',
    description:
      'Busca por especialidad, calificacion o disponibilidad. Todos los doctores estan verificados con cedula profesional.',
  },
  {
    number: '02',
    title: 'Agenda y paga',
    description:
      'Selecciona el horario que te convenga y realiza el pago seguro. Recibiras confirmacion inmediata.',
  },
  {
    number: '03',
    title: 'Consulta por video, chat o llamada',
    description:
      'Conectate con tu doctor en el horario agendado. Recibes notas medicas y recetas digitales al terminar.',
  },
]

const testimonials = [
  {
    name: 'Maria G.',
    location: 'Ciudad de Mexico',
    text: 'Pude consultar con un dermatologo sin salir de casa. La receta llego a mi perfil en minutos. Excelente servicio.',
    rating: 5,
  },
  {
    name: 'Roberto L.',
    location: 'Monterrey',
    text: 'Agende una videoconsulta con un cardiologo para mi papa. El proceso fue facil y el doctor muy profesional.',
    rating: 5,
  },
  {
    name: 'Ana P.',
    location: 'Guadalajara',
    text: 'Me gusto poder pagar en OXXO. La consulta fue rapida y el diagnostico claro. Ya he recomendado Doctor.mx.',
    rating: 4,
  },
]

export default async function ConsultaOnlinePage() {
  const [specialties, onlineDoctors] = await Promise.all([
    getAvailableSpecialties(),
    discoverDoctors({ onlineOnly: true, sortBy: 'rating' }),
  ])
  const ratingTotal = onlineDoctors.reduce((sum, doctor) => sum + Math.max(doctor.rating_count, 0), 0)
  const averageRating =
    ratingTotal > 0
      ? Math.round(
          (onlineDoctors.reduce((sum, doctor) => sum + doctor.rating_avg * Math.max(doctor.rating_count, 0), 0) /
            ratingTotal) *
            10
        ) / 10
      : null

  return (
    <div className="min-h-screen bg-transparent">
      <main className="editorial-shell py-8 sm:py-10 lg:py-12">
        {/* Hero Section */}
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="luxe">Telemedicina certificada</Badge>
              <PublicSectionHeading
                align="left"
                eyebrow="Consulta en linea"
                title="Consulta en linea con"
                accent="especialistas certificados"
                description="Conectate con doctores verificados desde cualquier lugar de Mexico. Sin filas de espera, pago seguro y recetas digitales."
              />
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg" className="gap-2">
                  <Link href="/doctores-online">
                    <Video className="h-5 w-5" />
                    Encuentra a tu especialista
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/doctors">
                    Ver todos los doctores
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-[hsl(var(--text-secondary))]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                  Doctores verificados
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                  Pago seguro
                </span>
              </div>
            </div>

            {/* Stats Panel */}
            <Card className="surface-panel p-6 space-y-4">
              <div className="text-center space-y-2">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <Video className="h-8 w-8" />
                </div>
                <p className="text-3xl font-bold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                  {onlineDoctors.length}
                </p>
                <p className="text-sm text-[hsl(var(--text-soft))]">Doctores disponibles en linea</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--text-secondary))]">Especialidades</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">
                    {specialties.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--text-secondary))]">Calificacion promedio</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">
                    {averageRating ? `${averageRating.toFixed(1)} / 5.0` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--text-secondary))]">Disponibilidad actual</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))]">Según catálogo real</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <PublicSectionHeading
              eyebrow="Beneficios"
              title="Por que elegir"
              accent="la consulta en linea"
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="surface-panel p-6 text-center">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  {benefit.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <PublicSectionHeading
              eyebrow="Proceso simple"
              title="Como funciona"
              accent="la consulta en linea"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={index} className="surface-panel p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-bold text-[hsl(var(--surface-quiet))] tracking-tighter">
                  {step.number}
                </div>
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-ocean))] text-white font-bold">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Available Specialties */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <PublicSectionHeading
              eyebrow="Especialidades"
              title="Especialidades disponibles"
              accent="en consulta en linea"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map((s: { id: string; slug: string; name: string }) => (
              <Link key={s.id} href={`/doctors?specialty=${s.slug}&appointmentType=video`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-4 py-2.5 text-sm hover:bg-[hsl(var(--surface-tint))] transition-colors"
                >
                  {s.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <PublicSectionHeading
              eyebrow="Testimonios"
              title="Lo que dicen"
              accent="nuestros pacientes"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="surface-panel p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= testimonial.rating
                          ? 'fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]'
                          : 'text-[hsl(var(--text-soft))]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[hsl(var(--surface-tint))] flex items-center justify-center text-sm font-semibold text-[hsl(var(--brand-ocean))]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-soft))]">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <Card className="surface-panel-strong inline-block p-8 sm:p-12">
            <PublicSectionHeading
              title="Comienza tu consulta"
              accent="en linea hoy"
              description="Encuentra al especialista correcto y agenda tu videoconsulta en minutos."
            />
            <div className="mt-6">
              <Button asChild variant="hero" size="lg" className="gap-2">
                <Link href="/doctores-online">
                  Encuentra a tu especialista
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      {/* Structured Data - MedicalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalBusiness',
            name: 'Doctor.mx - Consulta en Linea',
            description:
              'Consulta en linea con especialistas certificados desde cualquier lugar de Mexico.',
            url: 'https://doctor.mx/consulta-online',
            availableService: {
              '@type': 'MedicalTherapy',
              name: 'Videoconsulta medica',
              description: 'Consulta medica en linea por video, chat o llamada.',
            },
            areaServed: {
              '@type': 'Country',
              name: 'Mexico',
            },
          }),
        }}
      />
    </div>
  )
}
