import { Search, Calendar, MessageCircle, User, ClipboardList, Sparkles, Users, ChevronRight, Bot } from 'lucide-react'
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
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/app/ai-consulta">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-white shadow-2xl mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Bot className="w-10 h-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase">Nuevo</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Consulta con Dr. Simeon</h1>
                <p className="text-lg text-blue-100 mb-4">Tu asistente médico virtual • IA personalizada</p>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Iniciar Consulta IA<ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Link>

        <WelcomeBanner patientName={profile?.full_name?.split(' ')[0] || 'Usuario'} />
        <PatientDashboardContent appointments={appointments as Array<Appointment & { doctor: Doctor }>} />
        <QuickStats appointments={appointments as Appointment[]} />
        <HealthTips />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[ 
            { href: '/app/ai-consulta', icon: Users, title: 'Consulta con Dr. Simeon', desc: 'Tu asistente médico IA' },
            { href: '/doctors', icon: Search, title: 'Buscar Doctor', desc: 'Especialistas' },
            { href: '/app/appointments', icon: Calendar, title: 'Mis Consultas', desc: 'Historial' }
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
                <Link href="/doctors" className="text-blue-500 hover:text-blue-600 font-medium">Buscar doctor</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((apt: any) => (
                  <div key={apt.id} className="border rounded-xl p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="font-semibold">Dr. {apt.doctor?.profile?.full_name || 'Doctor'}</p>
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
  )
}
