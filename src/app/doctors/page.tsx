import { discoverDoctors, getAvailableSpecialties } from '@/lib/discovery'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import type { Doctor } from '@/types'

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { specialty?: string }
}) {
  // Sistema de descubrimiento maneja filtros
  const [doctors, specialties] = await Promise.all([
    discoverDoctors({
      specialtySlug: searchParams.specialty,
    }),
    getAvailableSpecialties(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simple */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Doctory
            </Link>
            <div className="flex gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctores Verificados
          </h1>
          <p className="text-gray-600">
            Todos nuestros doctores están verificados con cédula profesional
          </p>
        </div>

        {/* Filtros Simples */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Filtrar por especialidad</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/doctors"
              className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm hover:bg-gray-800"
            >
              Todas
            </Link>
            {specialties.map((specialty) => (
              <Link
                key={specialty.id}
                href={`/doctors?specialty=${specialty.slug}`}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
              >
                {specialty.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Lista de Doctores */}
        {doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay doctores disponibles</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor: Doctor & { specialties?: { specialty: { name: string } }[] }) => (
              <Link
                key={doctor.id}
                href={`/doctors/${doctor.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                    {doctor.profile?.photo_url ? (
                      <Image
                        src={doctor.profile.photo_url}
                        alt={doctor.profile.full_name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        👨‍⚕️
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Dr. {doctor.profile?.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        ✓ Verificado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Especialidades */}
                {doctor.specialties && doctor.specialties.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      {doctor.specialties.map((s: { specialty: { name: string } }) => s.specialty.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {doctor.city && (
                    <p>📍 {doctor.city}, {doctor.state}</p>
                  )}
                  {doctor.years_experience && (
                    <p>⏱️ {doctor.years_experience} años de experiencia</p>
                  )}
                  {doctor.rating && (
                    <p>⭐ {doctor.rating.toFixed(1)} ({doctor.total_reviews} reseñas)</p>
                  )}
                </div>

                {/* Precio */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(doctor.price_cents, doctor.currency)}
                  </p>
                  <p className="text-sm text-gray-600">por consulta</p>
                </div>

                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Ver perfil
                </button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
