import { getDoctorProfile } from '@/lib/discovery'
import { formatCurrency } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function DoctorProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const doctor = await getDoctorProfile(params.id)

  if (!doctor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Doctory
            </Link>
            <Link
              href="/doctors"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Volver al directorio
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info del Doctor */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                  {doctor.profile?.photo_url ? (
                    <Image
                      src={doctor.profile.photo_url}
                      alt={doctor.profile.full_name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      👨‍⚕️
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dr. {doctor.profile?.full_name}
                  </h1>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Verificado
                    </span>
                    {doctor.specialties?.map((s: { specialty: { id: string; name: string } }) => (
                      <span
                        key={s.specialty.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {s.specialty.name}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    {doctor.years_experience && (
                      <div>
                        <span className="font-semibold text-gray-900">
                          {doctor.years_experience}
                        </span>{' '}
                        años de experiencia
                      </div>
                    )}
                    {doctor.rating && (
                      <div>
                        ⭐{' '}
                        <span className="font-semibold text-gray-900">
                          {doctor.rating.toFixed(1)}
                        </span>{' '}
                        ({doctor.total_reviews} reseñas)
                      </div>
                    )}
                    {doctor.city && (
                      <div>
                        📍 {doctor.city}, {doctor.state}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {doctor.bio && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Sobre el Doctor
                </h2>
                <p className="text-gray-700 whitespace-pre-line">{doctor.bio}</p>
              </div>
            )}

            {/* Idiomas */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Idiomas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Agendar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Precio de consulta</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(doctor.price_cents, doctor.currency)}
                </p>
              </div>

              <Link
                href={`/book/${doctor.id}`}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-center block"
              >
                Agendar Consulta
              </Link>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Consulta por videollamada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Pago seguro en línea</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Receta electrónica</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Doctor verificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
