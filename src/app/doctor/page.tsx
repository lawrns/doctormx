import { requireRole } from '@/lib/auth'
import { getDoctorRecordByUserId, getDoctorOperationalRecordId } from '@/lib/doctor-record'
import { getDoctorInboxCases } from '@/lib/care-orchestration'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { AppointmentCardCompact, EmptyState } from '@/components'
import Link from 'next/link'
import { Calendar, CheckCircle, Clock, Video, FileText, HelpCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eyebrow, SignatureCard, HeroStat } from '@/components/editorial'

export default async function DoctorDashboard() {
  const { user, profile, supabase } = await requireRole('doctor')
  const doctor = await getDoctorRecordByUserId(user.id)
  const doctorRecordId = getDoctorOperationalRecordId(doctor, user.id)

  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  let todayCount = 0
  let weekCount = 0
  let totalPatients = 0
  let pendingPaymentCount = 0
  let inboxCases: Awaited<ReturnType<typeof getDoctorInboxCases>> = []
  let upcomingAppointments: Array<{
    id: string
    patient_name: string
    start_ts: string
    end_ts: string
    status: string
    service_name: string | null
  }> = []

  let queuePosition = 0
  let totalPending = 0
  if (isPending) {
    const { count } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('created_at', doctor?.created_at || new Date().toISOString())

    const { count: totalCount } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    queuePosition = count || 0
    totalPending = totalCount || 0
  }

  if (!isPending) {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorRecordId)
      .in('status', ['confirmed', 'completed'])
      .gte('start_ts', startOfToday)
      .lt('start_ts', endOfToday)

    todayCount = todayAppointments || 0

    const { count: weekAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorRecordId)
      .in('status', ['confirmed', 'completed'])
      .gte('start_ts', startOfWeek.toISOString())
      .lt('start_ts', endOfWeek.toISOString())

    weekCount = weekAppointments || 0

    const { data: patientData } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', doctorRecordId)
      .in('status', ['confirmed', 'completed'])

    if (patientData) {
      const uniquePatients = new Set(patientData.map((a: { patient_id: string }) => a.patient_id))
      totalPatients = uniquePatients.size
    }

    const { count: pendingPayment } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorRecordId)
      .eq('status', 'pending_payment')
      .gte('start_ts', now.toISOString())

    pendingPaymentCount = pendingPayment || 0

    try {
      inboxCases = await getDoctorInboxCases(user.id)
    } catch {
      inboxCases = []
    }

    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(
        `
        id,
        start_ts,
        end_ts,
        status,
        patient:profiles!appointments_patient_id_fkey(full_name),
        service:doctor_services(name)
      `
      )
      .eq('doctor_id', doctorRecordId)
      .in('status', ['confirmed', 'pending_payment'])
      .gte('start_ts', now.toISOString())
      .order('start_ts', { ascending: true })
      .limit(5)

    if (appointmentsData) {
      upcomingAppointments = appointmentsData.map(
        (apt: {
          id: string
          start_ts: string
          end_ts: string
          status: string
          patient: unknown
          service: unknown
        }) => ({
          id: apt.id,
          patient_name:
            (apt.patient as unknown as { full_name: string } | null)?.full_name ||
            'Paciente',
          start_ts: apt.start_ts,
          end_ts: apt.end_ts,
          status: apt.status,
          service_name:
            (apt.service as unknown as { name: string } | null)?.name || null,
        })
      )
    }
  }

  return (
    <DoctorLayout
      profile={profile!}
      isPending={isPending}
      currentPath="/doctor"
      pendingAppointments={pendingPaymentCount}
    >
      {isPending ? (
        /* ─── PENDING VIEW ─── */
        <div className="max-w-4xl mx-auto">
          {doctor?.status === 'rejected' ? (
            <SignatureCard className="mb-8 border-l-4 border-l-destructive">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-destructive"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-destructive">
                    Tu perfil fue rechazado
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Revisa tu información y vuelve a enviarla para verificación.
                  </p>
                </div>
              </div>
            </SignatureCard>
          ) : (
            <SignatureCard className="mb-8 border-l-4 border-l-amber-500">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Tu perfil está en revisión
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Estamos verificando tu información profesional con la SEP.
                  </p>

                  {totalPending > 0 && (
                    <div className="mt-6 bg-secondary/50 rounded-2xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Tu posición en la fila
                        </span>
                        <span className="font-display text-xl font-bold text-foreground">
                          #{queuePosition} de {totalPending}
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.max(
                              5,
                              ((totalPending - queuePosition) / totalPending) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-3">
                        Tiempo estimado: ~{Math.max(1, Math.round(queuePosition * 2))} horas hábiles
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SignatureCard>
          )}

          <Eyebrow className="mb-6">Mientras esperas</Eyebrow>

          {/* Checklist */}
          <Card className="rounded-2xl border border-border shadow-dx-1 mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg font-semibold">
                Lista de verificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: 'Perfil completado', done: true },
                  { icon: CheckCircle, text: 'Disponibilidad configurada', done: true },
                  { icon: Clock, text: 'Verificación de cédula SEP', done: false },
                ].map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      check.done
                        ? 'bg-vital-soft/50 text-vital'
                        : 'bg-secondary/50 text-foreground'
                    }`}
                  >
                    <check.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-sm">{check.text}</span>
                    <Badge
                      variant={check.done ? 'default' : 'secondary'}
                      className={check.done ? 'bg-vital text-white' : ''}
                    >
                      {check.done ? 'Completado' : 'En proceso'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <SignatureCard>
              <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center mb-4">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Prueba tu equipo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Verifica que tu cámara y micrófono funcionen correctamente.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/doctor/availability">
                  Probar ahora
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </SignatureCard>

            <SignatureCard>
              <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Guía de primera consulta
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Consejos para ofrecer la mejor experiencia a tus pacientes.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/help">
                  Leer guía
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </SignatureCard>
          </div>
        </div>
      ) : (
        /* ─── APPROVED VIEW ─── */
        <div className="max-w-6xl">
          <Eyebrow className="mb-3">Dashboard</Eyebrow>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
            Panel del doctor
          </h2>
          <p className="text-muted-foreground mb-8">
            Gestiona tus consultas, disponibilidad y pacientes.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
            {[
              { label: 'Hoy', value: todayCount },
              { label: 'Esta semana', value: weekCount },
              {
                label: 'Calificación',
                value: doctor?.rating_avg
                  ? doctor.rating_avg.toFixed(1)
                  : '—',
              },
              { label: 'Pacientes', value: totalPatients },
            ].map((stat, i) => (
              <SignatureCard key={i} hover={false} className="p-4 lg:p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <p className="font-display text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </SignatureCard>
            ))}
            <Link href="/doctor/chat" className="block">
              <SignatureCard className="p-4 lg:p-5 h-full flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Mensajes
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    Ver chats
                  </p>
                </div>
              </SignatureCard>
            </Link>
          </div>

          {/* Upcoming appointments */}
          <Card className="rounded-2xl border border-border shadow-dx-1">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
              <CardTitle className="font-display text-lg font-semibold">
                Próximas consultas
              </CardTitle>
              <Link
                href="/doctor/appointments"
                className="text-sm text-ink hover:text-ink font-medium"
              >
                Ver todas
              </Link>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-border">
                  {upcomingAppointments.map((apt) => (
                    <AppointmentCardCompact
                      key={apt.id}
                      appointment={apt}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No tienes consultas programadas"
                  description="Las citas aparecerán aquí cuando los pacientes reserven contigo."
                  iconName="calendar"
                  action={{
                    label: 'Ver mi perfil público',
                    href: `/doctors/${user.id}`,
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Inbox */}
          <Card className="rounded-2xl border border-border shadow-dx-1 mt-8">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
              <div>
                <CardTitle className="font-display text-lg font-semibold">
                  Inbox de casos
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Casos activos enrutados desde preconsulta y seguimiento
                </p>
              </div>
              <Badge variant="info">{inboxCases.length} activos</Badge>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {inboxCases.length > 0 ? (
                <div className="space-y-3">
                  {inboxCases.slice(0, 5).map((careCase) => (
                    <SignatureCard
                      key={careCase.id}
                      hover={false}
                      className="p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <p className="font-display font-semibold text-foreground">
                            {careCase.triage?.chiefComplaint ||
                              'Caso sin motivo principal'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {careCase.triage?.specialty || 'medicina-general'} ·
                            urgencia {careCase.triage?.urgency || 'media'}
                          </p>
                          {careCase.triage?.redFlags?.length ? (
                            <p className="text-sm text-amber-600 mt-2">
                              Red flags:{' '}
                              {careCase.triage.redFlags.slice(0, 3).join(', ')}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                          <p>{careCase.status}</p>
                          <p>{careCase.channel}</p>
                        </div>
                      </div>
                    </SignatureCard>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No tienes casos en inbox"
                  description="Los casos triageados aparecerán aquí para darte contexto antes de la consulta."
                  iconName="clipboard"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DoctorLayout>
  )
}
