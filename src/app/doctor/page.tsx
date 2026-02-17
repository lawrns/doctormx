import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { AppointmentCardCompact, EmptyState } from '@/components'
import Link from 'next/link'
import { Calendar, CheckCircle, Clock, Video, FileText, HelpCircle } from 'lucide-react'

export default async function DoctorDashboard() {
  const { user, profile, supabase } = await requireRole('doctor')

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  const { data: doctor } = await supabase
    .from('doctores')
    .select('*')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca completó onboarding (draft)
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  // Si doctor es null (cache issue), mostrar dashboard con valores por defecto
  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  // Fetch stats and appointments only for approved doctores
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

  // Fetch pending doctores count for queue position (if pending)
  let queuePosition = 0
  let totalPending = 0
  if (isPending) {
    const { count } = await supabase
      .from('doctores')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('created_at', doctor?.created_at || new Date().toISOString())
    
    const { count: totalCount } = await supabase
      .from('doctores')
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
    <DoctorLayout profile={profile} isPending={isPending} currentPath="/doctor" pendingAppointments={pendingPaymentCount}>
      {isPending ? (
        /* Vista mejorada para doctores pendientes */
        <div className="max-w-4xl mx-auto">
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
                <Clock className="w-6 h-6 text-yellow-600 mt-0.5" />
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900">Tu perfil está en revisión</h3>
                  <p className="text-yellow-700 mt-1">
                    Estamos verificando tu información profesional con la SEP.
                  </p>
                  
                  {/* Queue position indicator */}
                  {totalPending > 0 && (
                    <div className="mt-4 bg-white rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tu posición en la fila:</span>
                        <span className="text-lg font-bold text-yellow-700">
                          #{queuePosition} de {totalPending}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(5, ((totalPending - queuePosition) / totalPending) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Tiempo estimado: ~{Math.max(1, Math.round(queuePosition * 2))} horas hábiles
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Mientras esperas</h2>

          {/* Progress checklist */}
          <div className="bg-white rounded-lg shadow border p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Lista de verificación</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="flex-1">Perfil completado</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completado</span>
              </div>
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="flex-1">Disponibilidad configurada</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completado</span>
              </div>
              <div className="flex items-center gap-3 text-yellow-700">
                <Clock className="w-5 h-5" />
                <span className="flex-1">Verificación de cédula SEP</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">En proceso</span>
              </div>
              <Link 
                href="/doctor/availability" 
                className="flex items-center gap-3 text-neutral-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Video className="w-5 h-5" />
                <span className="flex-1">Prueba tu cámara y micrófono</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Recomendado</span>
              </Link>
              <Link 
                href="/help" 
                className="flex items-center gap-3 text-neutral-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="flex-1">Lee la guía de primera consulta</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Opcional</span>
              </Link>
            </div>
          </div>

          {/* Quick actions */}
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
                href="/doctor/onboarding"
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
                <Calendar className="w-6 h-6 text-blue-500" />
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

          {/* Help section */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">¿Tienes preguntas?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Si tienes alguna duda sobre el proceso de verificación, contacta a nuestro equipo de soporte.
                </p>
                <a 
                  href="mailto:soporte@doctormx.com?subject=Pregunta sobre verificación de perfil" 
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                >
                  Contactar soporte →
                </a>
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
                description="Las citas aparecerán aquí cuando los pacientes reserven contigo. Comparte tu perfil para empezar a recibir pacientes."
                iconName="calendar"
                action={{
                  label: "Ver mi perfil público",
                  href: `/doctores/${user.id}`
                }}
              />
            )}
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
