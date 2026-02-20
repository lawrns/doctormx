import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DoctorLayout from '@/components/DoctorLayout'

export default async function DoctorProfilePage() {
  const { user, profile, supabase } = await requireRole('doctor')

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  const { data: doctor } = await supabase
    .from('doctores')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!doctor) {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor.status === 'pending' || doctor.status === 'rejected'

  // Get completed appointments count
  let completedCount = 0
  if (!isPending) {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('status', 'completed')

    completedCount = count ?? 0
  }

  return (
    <DoctorLayout profile={profile} isPending={isPending} currentPath="/doctor/profile">
      <div className="max-w-4xl">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Mi perfil</h2>
        <p className="text-gray-600 mb-6 lg:mb-8">Información profesional y datos de contacto</p>

        {/* Información personal */}
        <div className="bg-white rounded-lg shadow border p-4 lg:p-6 mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Información personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={profile?.full_name ?? ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base truncate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={profile?.phone ?? ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Información profesional */}
        <div className="bg-white rounded-lg shadow border p-4 lg:p-6 mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Información profesional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cédula profesional
              </label>
              <input
                type="text"
                value={doctor.license_number ?? ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Años de experiencia
              </label>
              <input
                type="number"
                value={doctor.years_experience ?? ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía profesional
              </label>
              <textarea
                value={doctor.bio ?? ''}
                disabled
                rows={4}
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Tarifas */}
        <div className="bg-white rounded-lg shadow border p-4 lg:p-6 mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Tarifas</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio por consulta
            </label>
            <div className="flex items-center max-w-xs">
              <span className="text-gray-500 mr-2">$</span>
              <input
                type="number"
                value={doctor.price_cents ? doctor.price_cents / 100 : ''}
                disabled
                className="w-full px-3 lg:px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm lg:text-base"
              />
              <span className="text-gray-500 ml-2">MXN</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {!isPending && (
          <div className="bg-white rounded-lg shadow border p-4 lg:p-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Calificación promedio</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {doctor.rating_avg?.toFixed(1) ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de reseñas</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{doctor.rating_count ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Consultas completadas</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de edición */}
        <div className="mt-4 lg:mt-6 flex gap-4">
          <Link
            href="/doctor/onboarding"
            className="px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm lg:text-base"
          >
            Editar perfil
          </Link>
        </div>

        {/* Nota para pending */}
        {isPending && (
          <div className="mt-4 lg:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              Tu perfil está en revisión. Algunos campos no se pueden modificar hasta que sea aprobado.
            </p>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
