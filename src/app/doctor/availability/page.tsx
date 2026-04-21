import { requireRole } from '@/lib/auth'
import { getDoctorAvailability } from '@/lib/availability'
import DoctorLayout from '@/components/DoctorLayout'
import { EmptyState } from '@/components'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Mi\u00E9rcoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'S\u00E1bado' },
]

export default async function DoctorAvailabilityPage() {
  const { user, profile, supabase } = await requireRole('doctor')
  const availability = await getDoctorAvailability(user.id)
  const hasAvailability = availability.length > 0

  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  // Solo redirigir si nunca complet\u00F3 onboarding
  if (doctor?.status === 'draft') {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/availability">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Disponibilidad</h2>
        <p className="text-muted-foreground mb-6 lg:mb-8">Configura tus horarios de atenci\u00F3n</p>

        {!hasAvailability && (
          <div className="mb-6">
            <EmptyState
              iconName="calendar"
              title="A\u00FAn no has abierto horarios para pacientes"
              description="Configura al menos un bloque de atenci\u00F3n para que tu perfil pueda empezar a recibir reservas con claridad." 
              className="items-start text-left"
            >
              <div className="w-full rounded-2xl border border-border bg-secondary/50 p-4 text-sm text-foreground">
                Recomendaci\u00F3n: comienza con 2 o 3 bloques semanales y ajusta tu agenda cuando lleguen tus primeras reservas.
              </div>
            </EmptyState>
          </div>
        )}

        <Card className="rounded-2xl border border-border shadow-dx-1 p-4 lg:p-6 gap-4">
          <CardHeader className="p-0 pb-0">
            <CardTitle className="text-lg lg:text-xl font-semibold">Horarios de atenci\u00F3n</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form action="/api/doctor/availability" method="POST" className="space-y-4 lg:space-y-6">
              {DAYS.map((day) => {
                const dayAvailability = availability.filter((a: { day_of_week: number; start_time: string; end_time: string }) => a.day_of_week === day.value)
                const isEnabled = dayAvailability.length > 0
                const startTime = isEnabled ? dayAvailability[0].start_time : '09:00'
                const endTime = isEnabled ? dayAvailability[0].end_time : '17:00'

                return (
                  <div key={day.value} className="border border-border rounded-xl p-3 lg:p-4">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Switch
                          name={`enabled_${day.value}`}
                          defaultChecked={isEnabled}
                          id={`enabled_${day.value}`}
                        />
                        <Label htmlFor={`enabled_${day.value}`} className="font-medium text-foreground text-sm lg:text-base">
                          {day.label}
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:gap-4 ml-6 lg:ml-8">
                      <div>
                        <Label className="block text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">
                          Hora inicio
                        </Label>
                        <Input
                          type="time"
                          name={`start_${day.value}`}
                          defaultValue={startTime}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="block text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">
                          Hora fin
                        </Label>
                        <Input
                          type="time"
                          name={`end_${day.value}`}
                          defaultValue={endTime}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="flex gap-4 pt-2">
                <Button type="submit">
                  Guardar disponibilidad
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 lg:mt-6 bg-card rounded-2xl border border-border shadow-dx-1 p-3 lg:p-4">
          <p className="text-xs lg:text-sm text-muted-foreground">
            <strong className="text-foreground">Consejo:</strong> Las citas se generan en bloques de 30 minutos.
            Los pacientes podr\u00E1n reservar solo en horarios que marques como disponibles.
          </p>
        </div>
      </div>
    </DoctorLayout>
  )
}
