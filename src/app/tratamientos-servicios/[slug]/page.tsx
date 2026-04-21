import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { getTreatmentBySlug } from '@/lib/treatments'
import { BreadcrumbSchema, FAQSchema } from '@/components/StructuredData'
import {
  ArrowRight,
  Stethoscope,
  Shield,
  Heart,
  ChevronRight,
  Users,
  HelpCircle,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const treatment = await getTreatmentBySlug(slug)

  if (!treatment) {
    return { title: 'Tratamiento no encontrado | Doctor.mx' }
  }

  return {
    title: `${treatment.name} - Tratamiento Medico | Doctor.mx`,
    description: treatment.description
      ? treatment.description.slice(0, 160)
      : `Informacion sobre ${treatment.name}. Encuentra doctores especialistas certificados en Doctor.mx.`,
    keywords: `${treatment.name}, ${treatment.category}, tratamiento medico Mexico`,
    alternates: {
      canonical: `https://doctor.mx/tratamientos-servicios/${treatment.slug}`,
    },
    openGraph: {
      title: `${treatment.name} - Tratamiento Medico | Doctor.mx`,
      description: treatment.description?.slice(0, 200) || undefined,
      url: `https://doctor.mx/tratamientos-servicios/${treatment.slug}`,
    },
  }
}

function buildFAQ(
  name: string,
  description: string | null,
  specialties: { name: string }[]
) {
  const faqs: { question: string; answer: string }[] = []

  faqs.push({
    question: `Que es ${name.toLowerCase()}?`,
    answer:
      description ||
      `${name} es un servicio medico disponible a traves de Doctor.mx. Consulta con un especialista para mas informacion.`,
  })

  if (specialties.length > 0) {
    faqs.push({
      question: `Que especialistas realizan ${name.toLowerCase()}?`,
      answer: `${name} es realizado por especialistas en: ${specialties.map((s) => s.name).join(', ')}. Puedes encontrar doctores certificados en Doctor.mx.`,
    })
  }

  faqs.push({
    question: `Como puedo agendar ${name.toLowerCase()}?`,
    answer: `Puedes agendar ${name.toLowerCase()} a traves de Doctor.mx. Busca un especialista, elige el horario que te convenga y agenda tu cita en linea en minutos.`,
  })

  return faqs
}

export default async function TreatmentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const treatment = await getTreatmentBySlug(slug)

  if (!treatment) {
    notFound()
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx'
  const faqs = buildFAQ(
    treatment.name,
    treatment.description,
    treatment.specialties
  )

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* JSON-LD */}
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: BASE_URL },
          {
            name: 'Tratamientos y servicios',
            url: `${BASE_URL}/tratamientos-servicios`,
          },
          {
            name: treatment.name,
            url: `${BASE_URL}/tratamientos-servicios/${treatment.slug}`,
          },
        ]}
      />
      <FAQSchema faqs={faqs} />

      {/* Breadcrumb */}
      <nav className="pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link
                href="/tratamientos-servicios"
                className="hover:text-primary transition-colors"
              >
                Tratamientos y servicios
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-foreground font-medium">{treatment.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {treatment.category && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                {treatment.category}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              {treatment.name}
            </h1>
            {treatment.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {treatment.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Specialties */}
      {treatment.specialties && treatment.specialties.length > 0 && (
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Especialidades que ofrecen este servicio
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {treatment.specialties.map((specialty) => (
                <Link
                  key={specialty.id}
                  href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                  className="group flex items-center justify-between p-5 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {specialty.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ver doctores disponibles
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card
                key={i}
                className="p-6 bg-card/70 backdrop-blur-sm border-border"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Necesitas {treatment.name.toLowerCase()}?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Encuentra doctores certificados que ofrecen{' '}
              {treatment.name.toLowerCase()} y agenda tu cita en linea hoy
              mismo.
            </p>
            <Link
              href={`/doctors?search=${encodeURIComponent(treatment.name)}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-semibold hover:bg-primary transition-all shadow-lg shadow-primary/20"
            >
              Buscar especialistas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
