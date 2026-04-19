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
          <ol className="flex items-center gap-2 text-sm text-neutral-400">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li>
              <Link
                href="/tratamientos-servicios"
                className="hover:text-blue-600 transition-colors"
              >
                Tratamientos y servicios
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-neutral-900 font-medium">{treatment.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {treatment.category && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-blue-50 text-blue-600">
                {treatment.category}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              {treatment.name}
            </h1>
            {treatment.description && (
              <p className="text-lg text-neutral-600 leading-relaxed">
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
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Especialidades que ofrecen este servicio
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {treatment.specialties.map((specialty) => (
                <Link
                  key={specialty.id}
                  href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                  className="group flex items-center justify-between p-5 rounded-xl bg-white border border-neutral-100 hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                        {specialty.name}
                      </p>
                      <p className="text-sm text-neutral-400">
                        Ver doctores disponibles
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-600 transition-colors" />
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
            <h2 className="text-2xl font-bold text-neutral-900">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card
                key={i}
                className="p-6 bg-white/70 backdrop-blur-sm border-neutral-100"
              >
                <h3 className="font-semibold text-neutral-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Necesitas {treatment.name.toLowerCase()}?
            </h2>
            <p className="text-neutral-600 mb-8 max-w-lg mx-auto">
              Encuentra doctores certificados que ofrecen{' '}
              {treatment.name.toLowerCase()} y agenda tu cita en linea hoy
              mismo.
            </p>
            <Link
              href={`/doctors?search=${encodeURIComponent(treatment.name)}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
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
