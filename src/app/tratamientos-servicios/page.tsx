import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { Card } from '@/components/ui/card'
import { getTreatments, getTreatmentCategories } from '@/lib/treatments'
import { ArrowRight, Activity, Stethoscope } from 'lucide-react'
import { TreatmentSearch } from './treatment-search'

export const metadata: Metadata = {
  title: 'Tratamientos y Servicios Medicos | Doctor.mx',
  description:
    'Directorio completo de tratamientos y servicios medicos en Mexico. Consultas, estudios de diagnostico, cirugias, rehabilitacion y mas. Encuentra el especialista indicado.',
  keywords:
    'tratamientos medicos Mexico, servicios medicos, estudios de diagnostico, consultas medicas, cirugias, rehabilitacion',
  alternates: {
    canonical: 'https://doctor.mx/tratamientos-servicios',
  },
  openGraph: {
    title: 'Tratamientos y Servicios Medicos | Doctor.mx',
    description:
      'Directorio completo de tratamientos y servicios medicos en Mexico.',
    url: 'https://doctor.mx/tratamientos-servicios',
  },
}

export default async function TratamientosPage() {
  const [allTreatments, popularTreatments, categories] = await Promise.all([
    getTreatments(),
    getTreatments(true),
    getTreatmentCategories(),
  ])

  // Group by category
  const grouped = categories.reduce<
    Record<string, typeof allTreatments>
  >((acc, category) => {
    acc[category] = allTreatments.filter((t) => t.category === category)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort()

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <PublicSectionHeading
              eyebrow="Directorio medico"
              title="Tratamientos y"
              accent="servicios medicos"
              description="Encuentra informacion sobre tratamientos, estudios de diagnostico, procedimientos y servicios medicos disponibles en Mexico."
            />
          </div>

          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <TreatmentSearch treatments={allTreatments} />
          </div>
        </div>
      </section>

      {/* Popular Treatments Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Servicios mas buscados
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTreatments.map((treatment) => (
              <Link
                key={treatment.id}
                href={`/tratamientos-servicios/${treatment.slug}`}
                className="group block h-full"
              >
                <Card className="relative p-6 h-full bg-card/70 backdrop-blur-sm border-border hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-200 group-hover:border-primary/20 group-hover:-translate-y-1">
                  <div className="space-y-3">
                    {treatment.category && (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {treatment.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {treatment.name}
                    </h3>
                    {treatment.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {treatment.description}
                      </p>
                    )}
                    <div className="pt-3 border-t border-border">
                      <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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

      {/* Category Grouped Lists */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Todos los servicios por categoria
            </h2>
          </div>

          {/* Category navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {sortedCategories.map((category) => (
              <a
                key={category}
                href={`#cat-${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                {category}
              </a>
            ))}
          </div>

          {/* Grouped lists */}
          <div className="space-y-10">
            {sortedCategories.map((category) => (
              <div
                key={category}
                id={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <h3 className="text-xl font-bold text-foreground mb-4 sticky top-20 bg-[#FDFCFB] py-2">
                  {category}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grouped[category].map((treatment) => (
                    <Link
                      key={treatment.id}
                      href={`/tratamientos-servicios/${treatment.slug}`}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-sm transition-all"
                    >
                      <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                        {treatment.name}
                      </span>
                      {treatment.popular && (
                        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
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

      <Footer />
    </main>
  )
}
