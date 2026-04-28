import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { searchDirectory, getDirectorySpecialties, getDirectoryCities } from '@/lib/domains/directory'
import { ArrowRight } from 'lucide-react'

interface PageProps {
  params: Promise<{ specialty: string; city: string }>
}

// Generate static params for top city/specialty combos
export async function generateStaticParams() {
  try {
    const [specialties, cities] = await Promise.all([
      getDirectorySpecialties(),
      getDirectoryCities(),
    ])
    
    const params: { specialty: string; city: string }[] = []
    
    // Generate top 100 combinations
    const topCities = Array.isArray(cities) ? cities.slice(0, 20) : []
    const topSpecialties = Array.isArray(specialties) ? specialties.slice(0, 10) : []
    
    for (const specialty of topSpecialties) {
      for (const city of topCities) {
        params.push({
          specialty: encodeURIComponent(specialty.specialty.toLowerCase().replace(/\s+/g, '-')),
          city: encodeURIComponent(city.city.toLowerCase().replace(/\s+/g, '-')),
        })
      }
    }
    
    return params.slice(0, 200) // Limit for build time
  } catch {
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { specialty, city } = await params
  const specialtyName = decodeURIComponent(specialty).replace(/-/g, ' ')
  const cityName = decodeURIComponent(city).replace(/-/g, ' ')
  
  const title = `${capitalizeWords(specialtyName)} en ${capitalizeWords(cityName)} | Doctor.mx México`
  const description = `Encuentra los mejores especialistas en ${specialtyName} en ${cityName}. Consulta perfiles verificados, lee reseñas y agenda tu cita en línea.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_MX',
    },
    alternates: {
      canonical: `/doctor/${specialty}/${city}`,
    },
  }
}

function capitalizeWords(str: string): string {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default async function SpecialtyCityPage({ params }: PageProps) {
  const { specialty, city } = await params
  const specialtyName = decodeURIComponent(specialty).replace(/-/g, ' ')
  const cityName = decodeURIComponent(city).replace(/-/g, ' ')
  
  let result: Awaited<ReturnType<typeof searchDirectory>> | null = null
  try {
    result = await searchDirectory({
      specialty: specialtyName,
      city: cityName,
      limit: 20,
    })
  } catch {
    notFound()
  }
  
  const doctors = result?.doctors ?? []
  const total = result?.total ?? doctors.length
  const pages = result?.pages ?? 0
  
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1180px] px-4 py-8 md:py-10">
          <nav className="mb-5 text-sm text-muted-foreground">
            <Link href="/doctors" className="font-medium text-primary hover:text-primary/80">Directorio</Link>
            {' / '}
            <Link href={`/doctor/${specialty}`} className="font-medium text-primary hover:text-primary/80">
              {capitalizeWords(specialtyName)}
            </Link>
            {' / '}
            <span className="text-foreground">{capitalizeWords(cityName)}</span>
          </nav>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Búsqueda local</p>
              <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {capitalizeWords(specialtyName)} en {capitalizeWords(cityName)}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Perfiles médicos organizados para decidir con menos fricción: evidencia, ubicación y modalidad antes del contacto.
              </p>
            </div>
            <div className="border-l border-border pl-5">
              <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {total > 0 ? total : 'Sin resultados'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">resultados disponibles en esta ciudad</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Doctor Acquisition CTA — shown for underserved markets (< 5 doctors) */}
      {doctors.length > 0 && doctors.length < 5 && (
        <div className="mx-auto max-w-[1180px] px-4 pt-8">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  ¿Eres {capitalizeWords(specialtyName)} en {capitalizeWords(cityName)}?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aparece en esta página. Crea tu perfil verificado en minutos.
                </p>
              </div>
              <Link href="/connect" className="flex-shrink-0">
                <Button>
                  Crear perfil verificado <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1180px] px-4 py-8">
        {doctors.length === 0 ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground">
              No encontramos especialistas en esta área
            </h2>
            <p className="mt-2 text-muted-foreground">
              Intenta buscar en ciudades cercanas o amplía tu búsqueda.
            </p>
            <Link href="/doctors">
              <Button className="mt-4">Ver todos los doctores</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} variant="interactive" className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-lg font-bold text-primary">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold tracking-tight text-foreground">
                      Dr. {doctor.full_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {doctor.conacem_verified && (
                        <Badge variant="success">Verificado</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-4 md:border-t-0 md:pt-0">
                  <div className="text-sm text-muted-foreground">
                    {doctor.city}, {doctor.state}
                  </div>
                  <Link href={`/doctors/${doctor.id}`}>
                    <Button size="sm">Ver perfil</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => (
              <Link
                key={i}
                href={`/doctor/${specialty}/${city}?page=${i + 1}`}
                className={`rounded-[8px] px-4 py-2 text-sm font-medium ${
                  i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Especialistas en {capitalizeWords(specialtyName)} en {capitalizeWords(cityName)}
          </h2>
          <div className="mt-4 max-w-3xl text-muted-foreground">
            <p>
              Encuentra a los mejores especialistas en {specialtyName.toLowerCase()} en {cityName}. 
              En Doctor.mx conectamos pacientes con médicos verificados que ofrecen 
              consultas presenciales y videoconsultas.
            </p>
            <h3 className="mt-4 font-medium text-foreground">
              ¿Por qué elegir Doctor.mx?
            </h3>
            <ul className="mt-2 list-inside list-disc">
              <li>Médicos verificados con cédula profesional</li>
              <li>Reseñas de pacientes reales</li>
              <li>Agenda tu cita en línea 24/7</li>
              <li>Videoconsultas disponibles</li>
              <li>Segunda opinión médica</li>
            </ul>
          </div>
        </div>
        
        {/* Related Searches */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Búsquedas relacionadas
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link 
              href={`/doctor/${specialty}`}
              className="rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              {capitalizeWords(specialtyName)} en México
            </Link>
            <Link 
              href="/app/second-opinion"
              className="rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              Segunda opinión médica
            </Link>
          </div>
        </div>
      </div>
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalBusiness',
            name: `${capitalizeWords(specialtyName)} en ${capitalizeWords(cityName)}`,
            description: `Directorio de especialistas en ${specialtyName} en ${cityName}`,
            address: {
              '@type': 'PostalAddress',
              addressLocality: cityName,
              addressCountry: 'MX',
            },
            areaServed: {
              '@type': 'City',
              name: cityName,
            },
          }),
        }}
      />
    </div>
  )
}
