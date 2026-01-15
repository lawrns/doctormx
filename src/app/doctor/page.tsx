import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { AppointmentCardCompact, EmptyState } from '@/components'
import Link from 'next/link'

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

  // Fetch stats and appointments only for approved doctors
  let todayCount = 0
  let weekCount = 0
  let totalPatients = 0
  let pendingPaymentCount = 0
  let upcomingAppointments: Array<{
    id: string
    patient_name: string
    start_ts: string
    end_ts: string
    status: string
    service_name: string | null
  }> = []

  if (!isPending) {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    // Count today's appointments
    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .in('status', ['confirmed', 'completed'])
      .gte('start_ts', startOfToday)
      .lt('start_ts', endOfToday)

    todayCount = todayAppointments || 0

    // Count this week's appointments
    const { count: weekAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .in('status', ['confirmed', 'completed'])
      .gte('start_ts', startOfWeek.toISOString())
      .lt('start_ts', endOfWeek.toISOString())

    weekCount = weekAppointments || 0

    // Count unique patients
    const { data: patientData } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('doctor_id', user.id)
      .in('status', ['confirmed', 'completed'])

    if (patientData) {
      const uniquePatients = new Set(patientData.map(a => a.patient_id))
      totalPatients = uniquePatients.size
    }

    // Count pending payment appointments
    const { count: pendingPayment } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('status', 'pending_payment')
      .gte('start_ts', now.toISOString())

    pendingPaymentCount = pendingPayment || 0

    // Get upcoming appointments (next 5)
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select(`
        id,
        start_ts,
        end_ts,
        status,
        patient:profiles!appointments_patient_id_fkey(full_name),
        service:doctor_services(name)
      `)
      .eq('doctor_id', user.id)
      .in('status', ['confirmed', 'pending_payment'])
      .gte('start_ts', now.toISOString())
      .order('start_ts', { ascending: true })
      .limit(5)

    if (appointmentsData) {
      upcomingAppointments = appointmentsData.map(apt => ({
        id: apt.id,
        patient_name: (apt.patient as unknown as { full_name: string } | null)?.full_name || 'Paciente',
        start_ts: apt.start_ts,
        end_ts: apt.end_ts,
        status: apt.status,
        service_name: (apt.service as unknown as { name: string } | null)?.name || null,
      }))
    }
  }

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor" pendingAppointments={pendingPaymentCount}>
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

          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Mientras esperas</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👤</span>
                <h3 className="text-lg font-semibold text-neutral-900">Completa tu perfil</h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Asegúrate de que toda tu información esté actualizada y completa.
              </p>
              <Link
                href="/doctor/profile"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Editar perfil
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📅</span>
                <h3 className="text-lg font-semibold text-neutral-900">Configura tu disponibilidad</h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Define tus horarios para empezar a recibir pacientes una vez aprobado.
              </p>
              <Link
                href="/doctor/availability"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver disponibilidad
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-primary-50 p-6 rounded-lg border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">Estado de verificación</h3>
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
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Panel del doctor</h2>
          <p className="text-neutral-600 mb-8">Gestiona tus consultas y disponibilidad</p>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow border">
              <p className="text-sm text-neutral-600 mb-1">Hoy</p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-900">{todayCount}</p>
            </div>
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow border">
              <p className="text-sm text-neutral-600 mb-1">Esta semana</p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-900">{weekCount}</p>
            </div>
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow border">
              <p className="text-sm text-neutral-600 mb-1">Calificación</p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-900">{doctor?.rating_avg ? doctor.rating_avg.toFixed(1) : '—'}</p>
            </div>
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow border">
              <p className="text-sm text-neutral-600 mb-1">Pacientes</p>
              <p className="text-2xl lg:text-3xl font-bold text-neutral-900">{totalPatients}</p>
            </div>
            <Link
              href="/doctor/chat"
              className="bg-white p-4 lg:p-6 rounded-lg shadow border hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Mensajes</p>
                  <p className="text-lg font-bold text-neutral-900">Ver chats</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Próximas consultas */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-900">Próximas consultas</h3>
              <Link
                href="/doctor/appointments"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todas
              </Link>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="divide-y">
                {upcomingAppointments.map((apt) => (
                  <AppointmentCardCompact key={apt.id} appointment={apt} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tienes consultas programadas"
                description="Las citas aparecerán aquí cuando los pacientes reserven contigo."
                icon={
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            )}
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
