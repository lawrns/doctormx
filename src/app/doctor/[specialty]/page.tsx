import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { searchDirectory, getDirectorySpecialties, getDirectoryCities } from '@/lib/domains/directory'
import { purify } from '@/lib/utils/dompurify'

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
  
  // Fetch data
  let result
  let cities: { city: string; state: string; count: number }[] = []
  
  try {
    [result, cities] = await Promise.all([
      searchDirectory({ specialty: specialtyName, limit: 12 }),
      getDirectoryCities(),
    ])
  } catch {
    notFound()
  }
  
  const doctores = result.doctores
  const topCities = cities.slice(0, 20)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="mb-4 text-sm text-blue-200">
            <Link href="/doctores" className="hover:text-white">Directorio</Link>
            {' / '}
            <span>{capitalizeWords(specialtyName)}</span>
          </nav>
          <h1 className="text-3xl font-bold md:text-4xl">
            {capitalizeWords(specialtyName)} en México
          </h1>
          <p className="mt-2 text-lg text-blue-100">
            {result.total} especialistas verificados en todo el país
          </p>
        </div>
      </div>
      
      {/* City Links */}
      <div className="border-b bg-white py-6">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Buscar por ciudad
          </h2>
          <div className="flex flex-wrap gap-2">
            {topCities.map((c) => (
              <Link
                key={c.city}
                href={`/doctor/${specialty}/${encodeURIComponent(c.city.toLowerCase().replace(/\s+/g, '-'))}`}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              >
                {c.city}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured Doctors */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          Especialistas destacados
        </h2>
        
        {doctores.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              No encontramos especialistas en esta categoría.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctores.map((doctor) => (
              <Card key={doctor.id} className="flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Dr. {doctor.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doctor.city}, {doctor.state}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href={`/doctores/${doctor.id}`}>
                    <Button size="sm">Ver perfil</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {result.total > 12 && (
          <div className="mt-6 text-center">
            <Link href={`/doctores?specialty=${encodeURIComponent(specialtyName)}`}>
              <Button variant="secondary">Ver todos los {result.total} especialistas</Button>
            </Link>
          </div>
        )}
        
        {/* SEO Content */}
        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Encuentra especialistas en {capitalizeWords(specialtyName)}
          </h2>
          <div className="mt-4 space-y-4 text-gray-600">
            <p>
              Doctor.mx es el directorio de médicos más completo de México. 
              Encuentra especialistas en {specialtyName.toLowerCase()} verificados 
              con cédula profesional y certificaciones.
            </p>
            <h3 className="font-medium text-gray-900">
              ¿Qué hace un especialista en {specialtyName.toLowerCase()}?
            </h3>
            <p>
              Los especialistas en {specialtyName.toLowerCase()} son médicos 
              certificados que se enfocan en diagnóstico y tratamiento de 
              condiciones específicas de su área de especialidad.
            </p>
            <h3 className="font-medium text-gray-900">
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
            name: capitalizeWords(purify.sanitize(specialtyName)),
            description: `Directorio de especialistas en ${purify.sanitize(specialtyName)} en México`,
          }),
        }}
      />
    </div>
  )
}
