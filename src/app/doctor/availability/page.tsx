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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Disponibilidad</h2>
        <p className="text-gray-600 mb-8">Configura tus horarios de atención</p>

        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Horarios de atención
          </h3>

          <form action="/api/doctor/availability" method="POST" className="space-y-6">
            {DAYS.map((day) => {
              const dayAvailability = availability.filter((a: { day_of_week: number; start_time: string; end_time: string }) => a.day_of_week === day.value)
              const isEnabled = dayAvailability.length > 0
              const startTime = isEnabled ? dayAvailability[0].start_time : '09:00'
              const endTime = isEnabled ? dayAvailability[0].end_time : '17:00'

              return (
                <div key={day.value} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name={`enabled_${day.value}`}
                        defaultChecked={isEnabled}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="font-medium text-gray-900">
                        {day.label}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 ml-8">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Hora inicio
                      </label>
                      <input
                        type="time"
                        name={`start_${day.value}`}
                        defaultValue={startTime}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Hora fin
                      </label>
                      <input
                        type="time"
                        name={`end_${day.value}`}
                        defaultValue={endTime}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Guardar disponibilidad
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Consejo:</strong> Las citas se generan en bloques de 30 minutos.
            Los pacientes podrán reservar solo en horarios que marques como disponibles.
          </p>
        </div>
      </div>
    </DoctorLayout>
  )
}
