import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { getDiseaseBySlug } from '@/lib/diseases'
import {
  BreadcrumbSchema,
  MedicalConditionSchema,
} from '@/components/StructuredData'
import {
  ArrowRight,
  AlertCircle,
  Stethoscope,
  Shield,
  Heart,
  ChevronRight,
  Users,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const disease = await getDiseaseBySlug(slug)

  if (!disease) {
    return { title: 'Enfermedad no encontrada | Doctor.mx' }
  }

  return {
    title: `${disease.name} - Sintomas, Causas y Tratamiento | Doctor.mx`,
    description: disease.description
      ? disease.description.slice(0, 160)
      : `Informacion completa sobre ${disease.name}: sintomas, causas, tratamientos y prevencion. Encuentra doctores especialistas en Doctor.mx.`,
    keywords: `${disease.name}, sintomas ${disease.name}, tratamiento ${disease.name}, ${disease.symptoms?.join(', ')}`,
    alternates: {
      canonical: `https://doctor.mx/enfermedades/${disease.slug}`,
    },
    openGraph: {
      title: `${disease.name} - Sintomas, Causas y Tratamiento | Doctor.mx`,
      description: disease.description?.slice(0, 200) || undefined,
      url: `https://doctor.mx/enfermedades/${disease.slug}`,
    },
  }
}

export default async function DiseaseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const disease = await getDiseaseBySlug(slug)

  if (!disease) {
    notFound()
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx'

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* Breadcrumb */}
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: BASE_URL },
          { name: 'Enfermedades', url: `${BASE_URL}/enfermedades` },
          {
            name: disease.name,
            url: `${BASE_URL}/enfermedades/${disease.slug}`,
          },
        ]}
      />
      <MedicalConditionSchema
        name={disease.name}
        description={disease.description || ''}
        symptoms={disease.symptoms || undefined}
        url={`${BASE_URL}/enfermedades/${disease.slug}`}
      />

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
                href="/enfermedades"
                className="hover:text-blue-600 transition-colors"
              >
                Enfermedades
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="text-neutral-900 font-medium">{disease.name}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 tracking-tight">
              {disease.name}
            </h1>
            {disease.description && (
              <p className="text-lg text-neutral-600 leading-relaxed">
                {disease.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Symptoms */}
          {disease.symptoms && disease.symptoms.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Sintomas
                </h2>
              </div>
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-neutral-100">
                <ul className="grid sm:grid-cols-2 gap-3">
                  {disease.symptoms.map((symptom, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-neutral-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Causes */}
          {disease.causes && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">Causas</h2>
              </div>
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-neutral-100">
                <p className="text-neutral-700 leading-relaxed">
                  {disease.causes}
                </p>
              </Card>
            </div>
          )}

          {/* Treatments */}
          {disease.treatments && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Tratamiento
                </h2>
              </div>
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-neutral-100">
                <p className="text-neutral-700 leading-relaxed">
                  {disease.treatments}
                </p>
              </Card>
            </div>
          )}

          {/* Prevention */}
          {disease.prevention && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Prevencion
                </h2>
              </div>
              <Card className="p-6 bg-white/70 backdrop-blur-sm border-neutral-100">
                <p className="text-neutral-700 leading-relaxed">
                  {disease.prevention}
                </p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Related Doctors / Specialties */}
      {disease.specialties && disease.specialties.length > 0 && (
        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Doctores que tratan esta enfermedad
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {disease.specialties.map((specialty) => (
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

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Necesitas consultar un especialista?
            </h2>
            <p className="text-neutral-600 mb-8">
              Encuentra doctores certificados que tratan{' '}
              {disease.name.toLowerCase()} y agenda tu cita en linea.
            </p>
            <Link
              href={`/doctors?search=${encodeURIComponent(disease.name)}`}
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
