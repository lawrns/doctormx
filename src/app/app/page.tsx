import { requireRole } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/appointments'
import Link from 'next/link'
import type { Appointment, Doctor } from '@/types'

export default async function PatientDashboard() {
  const { user, profile } = await requireRole('patient')
  const appointments = await getPatientAppointments(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctory</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Hola, {profile?.full_name}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Paciente
          </h2>
          <p className="text-gray-600">
            Gestiona tus consultas y encuentra doctores verificados
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/doctors"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Buscar Doctor</h3>
                <p className="text-sm text-gray-600">Encuentra especialistas</p>
              </div>
            </div>
          </Link>

          <Link
            href="/app/appointments"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mis Consultas</h3>
                <p className="text-sm text-gray-600">Ver historial</p>
              </div>
            </div>
          </Link>

          <Link
            href="/app/profile"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
                <p className="text-sm text-gray-600">Configuración</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Consultas Recientes
            </h3>
          </div>
          <div className="p-6">
            {!appointments || appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tienes consultas aún</p>
                <Link
                  href="/doctors"
                  className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  Buscar un doctor
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment: Appointment & { doctor: Doctor }) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {appointment.doctor.profile.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.start_ts).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
