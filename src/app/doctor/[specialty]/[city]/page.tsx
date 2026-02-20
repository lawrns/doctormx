import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/ui/button'
import { searchDirectory, getDirectorySpecialties, getDirectoryCities } from '@/lib/domains/directory'
import { safeJsonLd } from '@/lib/utils/safeStructuredData'

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
    const topCities = cities.slice(0, 20)
    const topSpecialties = specialties.slice(0, 10)
    
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
  
  // Fetch doctores for this specialty and city
  let result
  try {
    result = await searchDirectory({
      specialty: specialtyName,
      city: cityName,
      limit: 20,
    })
  } catch {
    notFound()
  }
  
  const doctores = result.doctores
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="mb-4 text-sm text-blue-200">
            <Link href="/doctores" className="hover:text-white">Directorio</Link>
            {' / '}
            <Link href={`/doctor/${specialty}`} className="hover:text-white">
              {capitalizeWords(specialtyName)}
            </Link>
            {' / '}
            <span>{capitalizeWords(cityName)}</span>
          </nav>
          <h1 className="text-3xl font-bold md:text-4xl">
            {capitalizeWords(specialtyName)} en {capitalizeWords(cityName)}
          </h1>
          <p className="mt-2 text-lg text-blue-100">
            {result.total} especialistas verificados disponibles
          </p>
        </div>
      </div>
      
      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {doctores.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No encontramos especialistas en esta área
            </h2>
            <p className="mt-2 text-gray-600">
              Intenta buscar en ciudades cercanas o amplía tu búsqueda.
            </p>
            <Link href="/doctores">
              <Button className="mt-4">Ver todos los doctores</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctores.map((doctor) => (
              <Card key={doctor.id} className="flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">
                      Dr. {doctor.full_name}
                    </h2>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {doctor.conacem_verified && (
                        <Badge variant="success">Verificado</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-600">
                    {doctor.city}, {doctor.state}
                  </div>
                  <Link href={`/doctores/${doctor.id}`}>
                    <Button size="sm">Ver perfil</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {result.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: Math.min(result.pages, 5) }, (_, i) => (
              <Link
                key={i}
                href={`/doctor/${specialty}/${city}?page=${i + 1}`}
                className={`rounded-lg px-4 py-2 ${
                  i === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
        
        {/* SEO Content */}
        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Especialistas en {capitalizeWords(specialtyName)} en {capitalizeWords(cityName)}
          </h2>
          <div className="mt-4 text-gray-600">
            <p>
              Encuentra a los mejores especialistas en {specialtyName.toLowerCase()} en {cityName}. 
              En Doctor.mx conectamos pacientes con médicos verificados que ofrecen 
              consultas presenciales y videoconsultas.
            </p>
            <h3 className="mt-4 font-medium text-gray-900">
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
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Búsquedas relacionadas
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link 
              href={`/doctor/${specialty}`}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              {capitalizeWords(specialtyName)} en México
            </Link>
            <Link 
              href="/segunda-opinion"
              className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
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
          __html: safeJsonLd({
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
