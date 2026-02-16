import { Search, Calendar, MessageCircle, User, ClipboardList, Sparkles, Users, ChevronRight, Bot } from 'lucide-react'
import { formatDoctorName } from '@/lib/utils'
import { requireRole } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/appointments'
import { PatientDashboardContent, HealthTips, QuickStats } from '@/components/PatientDashboardContent'
import { WelcomeBanner } from '@/components/OnboardingChecklist'
import AppNavigation from '@/components/app/AppNavigation'
import Link from 'next/link'
import type { AppointmentWithDoctor, Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PatientDashboard() {
  const { user, profile } = await requireRole('patient')
  const appointments = await getPatientAppointments(user.id)

  // Get upcoming appointments
  const upcomingAppointments = (appointments as AppointmentWithDoctor[]).filter(apt =>
    ['confirmed', 'pending_payment'].includes(apt.status) && new Date(apt.start_ts) > new Date()
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: 'bg-yellow-50 text-yellow-700',
      confirmed: 'bg-teal-50 text-teal-700',
      completed: 'bg-blue-50 text-blue-700',
      cancelled: 'bg-red-50 text-red-700',
      no_show: 'bg-gray-50 text-gray-600',
      refunded: 'bg-gray-50 text-gray-600',
    }
    return styles[status] || 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app" />

      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <WelcomeBanner patientName={profile?.full_name?.split(' ')[0] || 'Usuario'} />

          {upcomingAppointments.length > 0 && (
            <Card className="mb-8 border-l-4 border-l-blue-500">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2 bg-blue-100 text-blue-700">Próxima consulta</Badge>
                    <h3 className="text-xl font-bold">{formatDoctorName(upcomingAppointments[0].doctor?.profile?.full_name)}</h3>
                    <p className="text-gray-600">{new Date(upcomingAppointments[0].start_ts).toLocaleString('es-MX', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                    <Badge variant={upcomingAppointments[0].video_room_url ? 'success' : 'info'} className="mt-2">
                      {upcomingAppointments[0].video_room_url ? 'Videoconsulta' : 'Presencial'}
                    </Badge>
                  </div>
                  <Link href="/app/appointments">
                    <Button>Ver detalles</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          <PatientDashboardContent appointments={appointments as AppointmentWithDoctor[]} />
          <QuickStats appointments={appointments as AppointmentWithDoctor[]} />
          <HealthTips />

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { href: '/app/ai-consulta', icon: Bot, title: 'Consulta IA', desc: 'Dr. Simeon - Asistente médico virtual' },
              { href: '/doctores', icon: Search, title: 'Buscar Doctor', desc: 'Especialistas verificados' },
              { href: '/app/upload-image', icon: ClipboardList, title: 'Analizar Imagen', desc: 'Análisis médico con IA' }
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="group p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" /> Consultas Recientes
              </h2>
              <Link href="/app/appointments" className="text-sm text-blue-500 hover:text-blue-600">Ver todas</Link>
            </div>
            <div className="p-6">
              {!appointments?.length ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No tienes consultas</p>
                  <Link href="/doctores" className="text-blue-500 hover:text-blue-600 font-medium">Buscar doctor</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((apt: AppointmentWithDoctor) => (
                    <div key={apt.id} className="border rounded-xl p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <User className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-semibold">{formatDoctorName(apt.doctor?.profile?.full_name)}</p>
                            <p className="text-sm text-gray-500">{new Date(apt.start_ts).toLocaleString('es-MX')}</p>
                          </div>
                        </div>
                        <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
