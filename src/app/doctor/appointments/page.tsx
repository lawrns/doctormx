import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { AppointmentCard, AppointmentFilters, EmptyState } from '@/components'
import { Card, CardContent } from '@/components/ui/card'

type SearchParams = {
  status?: string
  time?: string
  search?: string
}

export default async function DoctorAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { user, profile, supabase } = await requireRole('doctor')
  const params = await searchParams

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca completó onboarding
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  // Si doctor es null (cache) o no está aprobado, mostrar como pending
  const isPending = !doctor || doctor.status !== 'approved'

  // Fetch appointments with filters
  let appointments: Array<{
    id: string
    patient_name: string
    start_ts: string
    end_ts: string
    status: string
    service_name: string | null
    appointment_type?: 'video' | 'in_person' | null
    video_status?: string | null
  }> = []

  if (!isPending) {
    const now = new Date()
    const statusFilter = params.status || 'all'
    const timeFilter = params.time || 'upcoming'
    const searchFilter = params.search?.toLowerCase().trim() || ''

    let query = supabase
      .from('appointments')
      .select(`
        id,
        start_ts,
        end_ts,
        status,
        appointment_type,
        video_status,
        patient:profiles!appointments_patient_id_fkey(full_name),
        service:doctor_services(name)
      `)
      .eq('doctor_id', user.id)

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    // Apply time filter
    if (timeFilter === 'upcoming') {
      query = query.gte('start_ts', now.toISOString())
    } else if (timeFilter === 'past') {
      query = query.lt('start_ts', now.toISOString())
    } else if (timeFilter === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
      query = query.gte('start_ts', startOfToday).lt('start_ts', endOfToday)
    } else if (timeFilter === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
      query = query.gte('start_ts', startOfWeek.toISOString()).lt('start_ts', endOfWeek.toISOString())
    }

    // Order by start time
    const isAscending = timeFilter === 'upcoming' || timeFilter === 'today' || timeFilter === 'week'
    query = query.order('start_ts', { ascending: isAscending })

    const { data: appointmentsData } = await query.limit(100)

    if (appointmentsData) {
      type AppointmentQueryRow = {
        id: string
        start_ts: string
        end_ts: string
        status: string
        appointment_type?: 'video' | 'in_person' | null
        video_status?: string | null
        patient?: { full_name: string } | { full_name: string }[] | null
        service?: { name: string } | { name: string }[] | null
      }

      let mapped = (appointmentsData as unknown as AppointmentQueryRow[]).map((apt) => {
        const patient = Array.isArray(apt.patient) ? apt.patient[0] : apt.patient
        const service = Array.isArray(apt.service) ? apt.service[0] : apt.service
        return {
        id: apt.id,
        patient_name: patient?.full_name || 'Paciente',
        start_ts: apt.start_ts,
        end_ts: apt.end_ts,
        status: apt.status,
        appointment_type: apt.appointment_type,
        video_status: apt.video_status,
        service_name: service?.name || null,
      }})

      // Apply client-side search filter (since Supabase can't filter on joined fields)
      if (searchFilter) {
        mapped = mapped.filter(apt =>
          apt.patient_name.toLowerCase().includes(searchFilter)
        )
      }

      appointments = mapped.slice(0, 50)
    }
  }

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/appointments">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Consultas</h2>
        <p className="text-sm text-muted-foreground mb-8">Gestiona tus citas médicas</p>

        {isPending ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-900">Sección no disponible</h3>
                <p className="text-yellow-700 mt-1">
                  Podrás gestionar tus consultas una vez que tu perfil sea aprobado por nuestro equipo.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Card className="rounded-2xl border border-border shadow-dx-1">
            <CardContent className="p-6">
              <AppointmentFilters />

              {appointments.length > 0 ? (
                <div className="space-y-4 mt-6">
                  {appointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No hay consultas"
                  description="No se encontraron citas con los filtros seleccionados."
                  iconName="calendar"
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  )
}
