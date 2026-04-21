import { Search, Calendar, User, ClipboardList, Bot, ArrowRight } from 'lucide-react'
import { formatDoctorName } from '@/lib/utils'
import { requireRole } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/appointments'
import { PatientDashboardContent, HealthTips, QuickStats } from '@/components/PatientDashboardContent'
import { WelcomeBanner } from '@/components/OnboardingChecklist'
import Link from 'next/link'
import type { Appointment, Doctor } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eyebrow, SignatureCard } from '@/components/editorial'

export default async function PatientDashboard() {
  const { user, profile } = await requireRole('patient')
  const appointments = await getPatientAppointments(user.id)

  const upcomingAppointments = (appointments as Appointment[]).filter(
    (apt) =>
      ['confirmed', 'pending_payment'].includes(apt.status) &&
      new Date(apt.start_ts) > new Date()
  )

  const getStatusBadge = (status: string) => {
    const variantMap: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info'
    > = {
      pending_payment: 'warning',
      confirmed: 'default',
      completed: 'info',
      cancelled: 'destructive',
      no_show: 'secondary',
      refunded: 'secondary',
    }
    return variantMap[status] || 'secondary'
  }

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      pending_payment: 'Pago pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistió',
      refunded: 'Reembolsada',
    }
    return labelMap[status] || status
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <WelcomeBanner
          patientName={profile?.full_name?.split(' ')[0] || 'Usuario'}
        />

        {/* Upcoming appointment highlight */}
        {upcomingAppointments.length > 0 && (
          <SignatureCard className="mb-8 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <Eyebrow className="mb-3">Próxima consulta</Eyebrow>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  {formatDoctorName(
                    upcomingAppointments[0].doctor?.profile?.full_name
                  )}
                </h3>
                <p className="text-muted-foreground mb-3">
                  {new Date(upcomingAppointments[0].start_ts).toLocaleString(
                    'es-MX',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
                <Badge
                  variant={
                    upcomingAppointments[0].video_room_url
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {upcomingAppointments[0].video_room_url
                    ? 'Videoconsulta'
                    : 'Presencial'}
                </Badge>
              </div>
              <Link href="/app/appointments">
                <Button className="h-12 px-6 bg-ink hover:bg-cobalt-800 text-white rounded-xl">
                  Ver detalles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </SignatureCard>
        )}

        <PatientDashboardContent
          appointments={
            appointments as Array<Appointment & { doctor: Doctor }>
          }
        />
        <QuickStats appointments={appointments as Appointment[]} />
        <HealthTips />

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              href: '/app/ai-consulta',
              icon: Bot,
              title: 'Consulta IA',
              desc: 'Dr. Simeon — Asistente médico virtual',
            },
            {
              href: '/doctors',
              icon: Search,
              title: 'Buscar Doctor',
              desc: 'Especialistas verificados cerca de ti',
            },
            {
              href: '/app/upload-image',
              icon: ClipboardList,
              title: 'Analizar Imagen',
              desc: 'Análisis médico con inteligencia artificial',
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <SignatureCard className="group cursor-pointer h-full">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-cobalt-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-cobalt-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </SignatureCard>
            </Link>
          ))}
        </div>

        {/* Recent appointments */}
        <Card className="rounded-2xl border border-border shadow-dx-1 overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cobalt-700" />
              Consultas Recientes
            </CardTitle>
            <Link
              href="/app/appointments"
              className="text-sm text-cobalt-700 hover:text-cobalt-800 font-medium"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            {!appointments?.length ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No tienes consultas todavía
                </p>
                <Link
                  href="/doctors"
                  className="text-cobalt-700 hover:text-cobalt-800 font-medium"
                >
                  Buscar doctor →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt: any) => (
                  <SignatureCard
                    key={apt.id}
                    hover={false}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-cobalt-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-foreground truncate">
                          {formatDoctorName(
                            apt.doctor?.profile?.full_name
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.start_ts).toLocaleString('es-MX')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(apt.status)}>
                      {getStatusLabel(apt.status)}
                    </Badge>
                  </SignatureCard>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
