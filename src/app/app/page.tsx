import { 
  Search, 
  Calendar, 
  MessageCircle, 
  User, 
  ClipboardList, 
  Image as ImageIcon, 
  Sparkles 
} from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/appointments'
import { PatientDashboardContent, HealthTips, QuickStats } from '@/components/PatientDashboardContent'
import { WelcomeBanner } from '@/components/OnboardingChecklist'
import Link from 'next/link'
import type { Appointment, Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PatientDashboard() {
  const { user, profile } = await requireRole('patient')
  const appointments = await getPatientAppointments(user.id)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-green-50 text-green-700 border-green-200',
      completed: 'bg-blue-50 text-primary-500 border-blue-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-gray-50 text-gray-600 border-gray-200',
      refunded: 'bg-gray-50 text-gray-600 border-gray-200',
    }
    return styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Doctor.mx</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">{profile?.full_name}</span>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <WelcomeBanner patientName={profile?.full_name?.split(' ')[0] || 'Usuario'} />

        {/* Review Trigger */}
        <PatientDashboardContent appointments={appointments as Array<Appointment & { doctor: Doctor }>} />

        {/* Quick Stats */}
        <QuickStats appointments={appointments as Appointment[]} />

        {/* Health Tips */}
        <HealthTips />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/doctors">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Buscar Doctor</h3>
                  <p className="text-sm text-gray-500">Encuentra especialistas</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/appointments">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Mis Consultas</h3>
                  <p className="text-sm text-gray-500">Ver historial</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/chat">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Mensajes</h3>
                  <p className="text-sm text-gray-500">Chatea con doctores</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/profile">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Mi Perfil</h3>
                  <p className="text-sm text-gray-500">Configuración</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Additional Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/app/followups">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Seguimientos</h3>
                  <p className="text-sm text-gray-500">Ver mensajes de doctores</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/upload-image">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Subir Imagen</h3>
                  <p className="text-sm text-gray-500">Análisis médico con IA</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/app/premium">
            <Card className="group p-6 border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">Premium</h3>
                  <p className="text-sm text-gray-500">Funciones IA avanzadas</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Appointments */}
        <Card className="overflow-hidden border-gray-200">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consultas Recientes
            </h2>
            <Link href="/app/appointments" className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="p-6">
            {!appointments || appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2">No tienes consultas aún</p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Buscar un doctor
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment: Appointment & { doctor: Doctor }) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Dr. {appointment.doctor.profile.full_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(appointment.start_ts).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(appointment.status)}>
                        {appointment.status === 'pending_payment' && 'Pendiente de pago'}
                        {appointment.status === 'confirmed' && 'Confirmada'}
                        {appointment.status === 'completed' && 'Completada'}
                        {appointment.status === 'cancelled' && 'Cancelada'}
                        {appointment.status === 'no_show' && 'No asistió'}
                        {appointment.status === 'refunded' && 'Reembolsada'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Doctor.mx</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
