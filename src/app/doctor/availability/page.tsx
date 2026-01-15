import { requireRole } from '@/lib/auth'
import { getDoctorAvailability } from '@/lib/availability'
import DoctorLayout from '@/components/DoctorLayout'
import { redirect } from 'next/navigation'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

export default async function DoctorAvailabilityPage() {
  const { user, profile, supabase } = await requireRole('doctor')
  const availability = await getDoctorAvailability(user.id)

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca completó onboarding
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/availability">
      <div className="max-w-4xl">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Disponibilidad</h2>
        <p className="text-gray-600 mb-6 lg:mb-8">Configura tus horarios de atención</p>

        <div className="bg-white rounded-lg shadow border p-4 lg:p-6">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
            Horarios de atención
          </h3>

          <form action="/api/doctor/availability" method="POST" className="space-y-4 lg:space-y-6">
            {DAYS.map((day) => {
              const dayAvailability = availability.filter((a: { day_of_week: number; start_time: string; end_time: string }) => a.day_of_week === day.value)
              const isEnabled = dayAvailability.length > 0
              const startTime = isEnabled ? dayAvailability[0].start_time : '09:00'
              const endTime = isEnabled ? dayAvailability[0].end_time : '17:00'

              return (
                <div key={day.value} className="border rounded-lg p-3 lg:p-4">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <label className="flex items-center gap-2 lg:gap-3">
                      <input
                        type="checkbox"
                        name={`enabled_${day.value}`}
                        defaultChecked={isEnabled}
                        className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 rounded"
                      />
                      <span className="font-medium text-gray-900 text-sm lg:text-base">
                        {day.label}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4 ml-6 lg:ml-8">
                    <div>
                      <label className="block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        name={`start_${day.value}`}
                        defaultValue={startTime}
                        className="w-full px-2 lg:px-3 py-1.5 lg:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">
                        Hora fin
                      </label>
                      <input
                        type="time"
                        name={`end_${day.value}`}
                        defaultValue={endTime}
                        className="w-full px-2 lg:px-3 py-1.5 lg:py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm lg:text-base"
              >
                Guardar disponibilidad
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 lg:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4">
          <p className="text-xs lg:text-sm text-blue-900">
            <strong>Consejo:</strong> Las citas se generan en bloques de 30 minutos.
            Los pacientes podrán reservar solo en horarios que marques como disponibles.
          </p>
        </div>
      </div>
    </DoctorLayout>
  )
}
