import { Search, Calendar, MessageCircle, User, ClipboardList, Sparkles, Users, ChevronRight, Bot } from 'lucide-react'
import { formatDoctorName } from '@/lib/utils'
import { requireRole } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/appointments'
import { PatientDashboardContent, HealthTips, QuickStats, RecentConsultationsEmpty } from '@/components/PatientDashboardContent'
import { WelcomeBanner } from '@/components/OnboardingChecklist'
import Link from 'next/link'
import type { Appointment, Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PatientDashboard() {
  const { user, profile } = await requireRole('patient')
  const appointments = await getPatientAppointments(user.id)

  // Get upcoming appointments
  const upcomingAppointments = (appointments as Appointment[]).filter(apt =>
    ['confirmed', 'pending_payment'].includes(apt.status) && new Date(apt.start_ts) > new Date()
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_payment: 'bg-yellow-50 text-yellow-700',
      confirmed: 'bg-teal-50 bg-teal-700',
      completed: 'bg-blue-50 text-blue-700',
      cancelled: 'bg-red-50 text-red-700',
      no_show: 'bg-gray-50 text-gray-600',
      refunded: 'bg-gray-50 text-gray-600',
    }
    return styles[status] || 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Compact Welcome Banner */}
        <WelcomeBanner patientName={profile?.full_name?.split(' ')[0] || 'Usuario'} />

        {/* Quick Action Cards - Now at the TOP */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { href: '/app/ai-consulta', icon: Bot, title: 'Consulta IA', desc: 'Simeon - Asistente de orientación de salud' },
            { href: '/doctors', icon: Search, title: 'Buscar Doctor', desc: 'Especialistas verificados' },
            { href: '/app/upload-image', icon: ClipboardList, title: 'Analizar Imagen', desc: 'Análisis médico con IA' }
          ].map((item) => (
            <Link key={item.href} href={item.href} className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
              <Card className="group p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* First Consultation CTA Card */}
        <QuickStats appointments={appointments as Appointment[]} />

        {/* Review Trigger and Upcoming Appointments */}
        <PatientDashboardContent appointments={appointments as Array<Appointment & { doctor: Doctor }>} />

        {/* Health Tips Carousel */}
        <HealthTips />

        {/* Recent Consultations */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" /> Consultas Recientes
            </h2>
            <Link href="/app/appointments" className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">Ver todas</Link>
          </div>
          <div className="p-6">
            {!appointments?.length ? (
              <RecentConsultationsEmpty />
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((apt: any) => (
                  <div key={apt.id} className="border rounded-xl p-4 hover:bg-muted transition-colors duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold text-text-primary">{formatDoctorName(apt.doctor?.profile?.full_name)}</p>
                          <p className="text-sm text-text-muted">{new Date(apt.start_ts).toLocaleString('es-MX')}</p>
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
  )
}
