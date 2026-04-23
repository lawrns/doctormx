import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { searchDirectory, getDirectorySpecialties, getDirectoryCities } from '@/lib/domains/directory'

interface PageProps {
  params: Promise<{ specialty: string }>
}

// Generate static params for all specialties
export async function generateStaticParams() {
  try {
    const specialties = await getDirectorySpecialties()
    
    return specialties.map((s) => ({
      specialty: encodeURIComponent(s.specialty.toLowerCase().replace(/\s+/g, '-')),
    }))
  } catch {
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { specialty } = await params
  const specialtyName = decodeURIComponent(specialty).replace(/-/g, ' ')
  
  const title = `${capitalizeWords(specialtyName)} en México | Doctor.mx`
  const description = `Directorio de especialistas en ${specialtyName} en México. Encuentra médicos verificados, lee reseñas y agenda tu consulta en línea.`
  
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
      canonical: `/doctor/${specialty}`,
    },
  }
}

function capitalizeWords(str: string): string {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default async function SpecialtyPage({ params }: PageProps) {
  const { specialty } = await params
  const specialtyName = decodeURIComponent(specialty).replace(/-/g, ' ')
  
  let result: Awaited<ReturnType<typeof searchDirectory>> | null = null
  let cities: { city: string; state: string; count: number }[] | null = []
  
  try {
    [result, cities] = await Promise.all([
      searchDirectory({ specialty: specialtyName, limit: 12 }),
      getDirectoryCities(),
    ])
  } catch {
    notFound()
  }
  
  const doctors = result?.doctors ?? []
  const total = result?.total ?? doctors.length
  const topCities = Array.isArray(cities) ? cities.slice(0, 12) : []
  
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1180px] px-4 py-8 md:py-10">
          <nav className="mb-5 text-sm text-muted-foreground">
            <Link href="/doctors" className="font-medium text-primary hover:text-primary/80">Directorio</Link>
            {' / '}
            <span className="text-foreground">{capitalizeWords(specialtyName)}</span>
          </nav>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_340px] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Directorio médico</p>
              <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {capitalizeWords(specialtyName)} en México
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Consulta perfiles con evidencia visible: cédula cuando está disponible, ubicación, modalidad y reseñas reales.
              </p>
            </div>
            <div className="border-l border-border pl-5">
              <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {total > 0 ? total : 'Sin resultados'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">resultados disponibles para esta búsqueda</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-b bg-card py-6">
        <div className="mx-auto max-w-[1180px] px-4">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Buscar por ciudad
          </h2>
          <div className="flex flex-wrap gap-2">
            {topCities.length > 0 ? topCities.map((c) => (
              <Link
                key={c.city}
                href={`/doctor/${specialty}/${encodeURIComponent(c.city.toLowerCase().replace(/\s+/g, '-'))}`}
                className="rounded-[8px] border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                {c.city}
              </Link>
            )) : (
              <p className="text-sm text-muted-foreground">Las ciudades se muestran cuando existen datos públicos disponibles.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        <h2 className="mb-5 text-xl font-semibold text-foreground">
          Especialistas destacados
        </h2>
        
        {doctors.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              No encontramos especialistas en esta categoría.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} hover className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-lg font-bold text-primary">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold tracking-tight text-foreground">
                      Dr. {doctor.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {doctor.city}, {doctor.state}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-primary">
                      {doctor.conacem_verified ? 'Verificación visible' : 'Perfil pendiente de verificación pública'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link href={`/doctors/${doctor.id}`}>
                    <Button size="sm">Ver perfil</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {total > 12 && (
          <div className="mt-6 text-center">
            <Link href={`/doctors?specialty=${encodeURIComponent(specialtyName)}`}>
              <Button variant="secondary">Ver todos los {total} especialistas</Button>
            </Link>
          </div>
        )}
        
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Encuentra especialistas en {capitalizeWords(specialtyName)}
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-muted-foreground">
            <p>
              Doctor.mx es el directorio de médicos más completo de México. 
              Encuentra especialistas en {specialtyName.toLowerCase()} verificados 
              con cédula profesional y certificaciones.
            </p>
            <h3 className="font-medium text-foreground">
              ¿Qué hace un especialista en {specialtyName.toLowerCase()}?
            </h3>
            <p>
              Los especialistas en {specialtyName.toLowerCase()} son médicos 
              certificados que se enfocan en diagnóstico y tratamiento de 
              condiciones específicas de su área de especialidad.
            </p>
            <h3 className="font-medium text-foreground">
              Servicios disponibles
            </h3>
            <ul className="list-inside list-disc">
              <li>Consulta presencial</li>
              <li>Videoconsulta</li>
              <li>Segunda opinión médica</li>
              <li>Seguimiento de tratamiento</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalSpecialty',
            name: capitalizeWords(specialtyName),
            description: `Directorio de especialistas en ${specialtyName} en México`,
          }),
        }}
      />
    </div>
  )
}
