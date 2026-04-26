import { requireRole } from '@/lib/auth'
import { ensureVideoRoomForAppointment } from '@/lib/video'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function ConsultationRoomPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const { user, supabase } = await requireRole('patient')

  // Obtener cita
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors (
        *,
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .eq('patient_id', user.id)
    .single()

  if (!appointment || appointment.status !== 'confirmed') {
    notFound()
  }

  // Generar URL de videollamada
  const videoRoom = await ensureVideoRoomForAppointment(appointmentId)

  return (
    <div className="min-h-screen bg-background">
      <header className="nav-sticky sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/app" className="text-2xl font-bold text-foreground">
            Doctor.mx
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
            Sala de Consulta
          </h1>

          {/* Info de la cita */}
          <div className="bg-secondary/50 rounded-xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4">
              Consulta con Dr. {appointment.doctor.profile.full_name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>Fecha:</strong> {formatDate(appointment.start_ts)}
              </div>
              <div>
                <strong>Hora:</strong> {formatTime(appointment.start_ts)}
              </div>
            </div>
          </div>

          {/* Ingresar a videollamada */}
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Haz clic en el botón para ingresar a la videollamada con tu doctor
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 font-semibold text-lg"
            >
              <a
                href={videoRoom.roomUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                📹 Ingresar a Consulta
              </a>
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              La videollamada se abrirá en una nueva pestaña
            </p>
          </div>

          {/* Instrucciones */}
          <div className="mt-8 pt-8 border-t border-border space-y-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Instrucciones:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Asegúrate de tener una conexión a internet estable</li>
              <li>Permite el acceso a tu cámara y micrófono</li>
              <li>Ten a la mano tu identificación si el doctor la solicita</li>
              <li>Anota cualquier receta o indicación que te de el doctor</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
