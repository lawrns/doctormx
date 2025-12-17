import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'

export default async function DoctorDashboard() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca completó onboarding (draft)
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  // Si doctor es null (cache issue), mostrar dashboard con valores por defecto
  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor">
      {isPending ? (
        /* Vista para doctores pendientes */
        <div className="max-w-4xl">
          {doctor?.status === 'rejected' ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-900">Tu perfil fue rechazado</h3>
                  <p className="text-red-700 mt-1">
                    Por favor revisa tu información y vuelve a enviarla para verificación.
                    Puedes editar tu perfil usando el botón de abajo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-900">Tu perfil está en revisión</h3>
                  <p className="text-yellow-700 mt-1">
                    Estamos verificando tu información profesional. Este proceso toma entre 24 y 48 horas hábiles.
                    Recibirás un correo electrónico cuando tu perfil sea aprobado.
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mientras esperas</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👤</span>
                <h3 className="text-lg font-semibold text-gray-900">Completa tu perfil</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Asegúrate de que toda tu información esté actualizada y completa.
              </p>
              <a
                href="/doctor/profile"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Editar perfil
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📅</span>
                <h3 className="text-lg font-semibold text-gray-900">Configura tu disponibilidad</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Define tus horarios para empezar a recibir pacientes una vez aprobado.
              </p>
              <a
                href="/doctor/availability"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver disponibilidad
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Estado de verificación</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Perfil completado</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Disponibilidad configurada</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Verificación pendiente</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista para doctores aprobados */
        <div className="max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel del doctor</h2>
          <p className="text-gray-600 mb-8">Gestiona tus consultas y disponibilidad</p>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <p className="text-sm text-gray-600 mb-1">Hoy</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <p className="text-sm text-gray-600 mb-1">Esta semana</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <p className="text-sm text-gray-600 mb-1">Calificación</p>
              <p className="text-3xl font-bold text-gray-900">{doctor?.rating_avg?.toFixed(1) || '—'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <p className="text-sm text-gray-600 mb-1">Pacientes</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
          </div>

          {/* Próximas consultas */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Próximas consultas</h3>
            <p className="text-gray-500 text-center py-8">No tienes consultas programadas</p>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
