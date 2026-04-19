import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { Card } from '@/components/ui/card'
import { getDiseases } from '@/lib/diseases'
import { Search, ArrowRight, Activity, Stethoscope } from 'lucide-react'
import { DiseaseSearch } from './disease-search'

export const metadata: Metadata = {
  title: 'Enfermedades y Condiciones | Doctor.mx',
  description:
    'Guia completa de enfermedades y condiciones medicas en Mexico. Conoce sintomas, causas, tratamientos y prevencion. Encuentra doctores especialistas para cada condicion.',
  keywords:
    'enfermedades Mexico, condiciones medicas, sintomas, tratamientos, prevencion, doctores especialistas, guia de salud',
  alternates: {
    canonical: 'https://doctor.mx/enfermedades',
  },
  openGraph: {
    title: 'Enfermedades y Condiciones | Doctor.mx',
    description:
      'Guia completa de enfermedades y condiciones medicas en Mexico. Sintomas, causas, tratamientos y prevencion.',
    url: 'https://doctor.mx/enfermedades',
  },
}

export default async function EnfermedadesPage() {
  const [allDiseases, popularDiseases] = await Promise.all([
    getDiseases(),
    getDiseases(true),
  ])

  // Group all diseases by first letter
  const grouped = allDiseases.reduce<Record<string, typeof allDiseases>>((acc, disease) => {
    const letter = disease.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(disease)
    return acc
  }, {})

  const sortedLetters = Object.keys(grouped).sort()

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <PublicSectionHeading
              eyebrow="Guia de salud"
              title="Enfermedades y"
              accent="condiciones"
              description="Informacion confiable sobre enfermedades comunes en Mexico. Conoce los sintomas, causas, tratamientos y como prevenir cada condicion."
            />
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <DiseaseSearch diseases={allDiseases} />
          </div>
        </div>
      </section>

      {/* Popular Diseases Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Enfermedades mas consultadas
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularDiseases.map((disease) => (
              <Link
                key={disease.id}
                href={`/enfermedades/${disease.slug}`}
                className="group block h-full"
              >
                <Card className="relative p-6 h-full bg-white/70 backdrop-blur-sm border-neutral-100 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-200 group-hover:border-blue-200 group-hover:-translate-y-1">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {disease.name}
                    </h3>
                    {disease.description && (
                      <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
                        {disease.description}
                      </p>
                    )}
                    <div className="pt-3 flex items-center justify-between border-t border-neutral-50">
                      <span className="text-xs font-medium text-neutral-400">
                        {disease.symptoms?.length || 0} sintomas
                      </span>
                      <div className="w-7 h-7 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Alphabetical Index */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Todas las enfermedades
            </h2>
          </div>

          {/* Letter navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {sortedLetters.map((letter) => (
              <a
                key={letter}
                href={`#letra-${letter}`}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-neutral-100 text-sm font-semibold text-neutral-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                {letter}
              </a>
            ))}
          </div>

          {/* Grouped lists */}
          <div className="space-y-10">
            {sortedLetters.map((letter) => (
              <div key={letter} id={`letra-${letter}`}>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 sticky top-20 bg-[#FDFCFB] py-2">
                  {letter}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grouped[letter].map((disease) => (
                    <Link
                      key={disease.id}
                      href={`/enfermedades/${disease.slug}`}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-100 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <span className="text-neutral-900 font-medium group-hover:text-blue-600 transition-colors">
                        {disease.name}
                      </span>
                      {disease.popular && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          Popular
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden pb-0">
        <div className="absolute inset-0 bg-neutral-900" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center py-20">
          <div className="p-12 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md">
            <PublicSectionHeading
              eyebrow="Orientacion asistida"
              title="No sabes que"
              accent="enfermedad tienes?"
              description="Dr. Simeon IA puede analizar tus sintomas y orientarte sobre que especialista consultar."
              theme="dark"
            />
            <Link href="/app/second-opinion">
              <button className="mt-8 px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all inline-flex items-center gap-3 shadow-xl shadow-blue-600/20">
                Consultar con IA Gratis
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
