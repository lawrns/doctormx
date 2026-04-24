import { requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DoctorLayout from '@/components/DoctorLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default async function DoctorProfilePage() {
  const { user, profile, supabase } = await requireRole('doctor')

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!doctor) {
    redirect('/doctor/onboarding')
  }

  const isPending = doctor.status === 'pending' || doctor.status === 'rejected'

  // Get completed appointments count
  let completedCount = 0
  if (!isPending) {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('status', 'completed')

    completedCount = count || 0
  }

  return (
    <DoctorLayout profile={profile!} isPending={isPending} currentPath="/doctor/profile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Mi perfil</h2>
        <p className="text-muted-foreground mb-6 lg:mb-8">Información profesional y datos de contacto</p>

        {/* Información personal */}
        <Card className="mb-4 gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:mb-6 lg:p-5">
          <CardHeader className="p-0 pb-0">
            <CardTitle className="text-lg lg:text-xl font-semibold">Información personal</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nombre completo
                </Label>
                <Input
                  type="text"
                  value={profile?.full_name || ''}
                  disabled
                  className="w-full bg-secondary/50"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Correo electrónico
                </Label>
                <Input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full bg-secondary/50 truncate"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Teléfono
                </Label>
                <Input
                  type="tel"
                  value={profile?.phone || ''}
                  disabled
                  className="w-full bg-secondary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información profesional */}
        <Card className="mb-4 gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:mb-6 lg:p-5">
          <CardHeader className="p-0 pb-0">
            <CardTitle className="text-lg lg:text-xl font-semibold">Información profesional</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Cédula profesional
                </Label>
                <Input
                  type="text"
                  value={doctor.license_number || ''}
                  disabled
                  className="w-full bg-secondary/50"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Años de experiencia
                </Label>
                <Input
                  type="number"
                  value={doctor.years_experience || ''}
                  disabled
                  className="w-full bg-secondary/50"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  Biografía profesional
                </Label>
                <Textarea
                  value={doctor.bio || ''}
                  disabled
                  rows={4}
                  className="w-full bg-secondary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarifas */}
        <Card className="mb-4 gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:mb-6 lg:p-5">
          <CardHeader className="p-0 pb-0">
            <CardTitle className="text-lg lg:text-xl font-semibold">Tarifas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Precio por consulta
              </Label>
              <div className="flex items-center max-w-xs">
                <span className="text-muted-foreground mr-2">$</span>
                <Input
                  type="number"
                  value={doctor.price_cents ? doctor.price_cents / 100 : ''}
                  disabled
                  className="w-full bg-secondary/50"
                />
                <span className="text-muted-foreground ml-2">MXN</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        {!isPending && (
          <Card className="gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:p-5">
            <CardHeader className="p-0 pb-0">
              <CardTitle className="text-lg lg:text-xl font-semibold">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calificación promedio</p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {doctor.rating_avg?.toFixed(1) || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de reseñas</p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{doctor.rating_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consultas completadas</p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botón de edición */}
        <div className="mt-4 lg:mt-6 flex gap-4">
          <Button asChild>
            <Link href="/doctor/onboarding">
              Editar perfil
            </Link>
          </Button>
        </div>

        {/* Nota para pending */}
        {isPending && (
          <div className="mt-4 rounded-[10px] border border-border bg-secondary/50 p-4 lg:mt-6">
            <p className="text-sm text-foreground">
              Tu perfil está en revisión. Algunos campos no se pueden modificar hasta que sea aprobado.
            </p>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
