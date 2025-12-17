import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'

export default async function DoctorAppointmentsPage() {
  const { user, profile, supabase } = await requireRole('doctor')

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

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/appointments">
      <div className="max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Consultas</h2>
        <p className="text-gray-600 mb-8">Gestiona tus citas médicas</p>

        {isPending ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
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
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Próximas consultas</h3>
            </div>
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">No hay consultas programadas</h3>
              <p className="mt-2 text-sm text-gray-500">
                Las citas aparecerán aquí cuando los pacientes reserven contigo.
              </p>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
