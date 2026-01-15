import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import type { Doctor } from '@/types'

export default async function AdminVerificationPage() {
  const { supabase } = await requireRole('admin')

  // Obtener doctores pendientes con sus documentos
  const { data: pendingDoctors } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:profiles (id, full_name, email, phone)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/admin" className="text-2xl font-bold text-gray-900">
            Doctory Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificación de doctores
          </h1>
          <p className="text-gray-600">
            Revisa y aprueba doctores pendientes de verificación
          </p>
        </div>

        {!pendingDoctors || pendingDoctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay doctores pendientes de verificación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDoctors.map((doctor: Doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Dr. {doctor.profile.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{doctor.profile.email}</p>
                    {doctor.profile.phone && (
                      <p className="text-sm text-gray-600">{doctor.profile.phone}</p>
                    )}
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    Pendiente
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Cédula profesional</p>
                    <p className="font-medium text-gray-900">
                      {doctor.license_number || 'No proporcionada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experiencia</p>
                    <p className="font-medium text-gray-900">
                      {doctor.years_experience ? `${doctor.years_experience} años` : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-medium text-gray-900">
                      {doctor.city && doctor.state
                        ? `${doctor.city}, ${doctor.state}`
                        : 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio de consulta</p>
                    <p className="font-medium text-gray-900">
                      ${(doctor.price_cents / 100).toFixed(2)} {doctor.currency}
                    </p>
                  </div>
                </div>

                {doctor.bio && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">Biografía</p>
                    <p className="text-gray-700">{doctor.bio}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <form action="/api/admin/verify-doctor" method="POST" className="flex-1">
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <input type="hidden" name="action" value="approve" />
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                      ✓ Aprobar
                    </button>
                  </form>

                  <Link
                    href={`/admin/verify/${doctor.id}`}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium text-center"
                  >
                    Ver detalles
                  </Link>

                  <form action="/api/admin/verify-doctor" method="POST" className="flex-1">
                    <input type="hidden" name="doctorId" value={doctor.id} />
                    <input type="hidden" name="action" value="reject" />
                    <button
                      type="submit"
                      className="w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 font-medium"
                    >
                      ✗ Rechazar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
