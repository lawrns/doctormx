import { requireRole } from '@/lib/auth'
import { getOrCreateVideoRoom } from '@/lib/video'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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
      doctor.doctores (
        *,
        profile:profiles (full_name)
      )
    `)
    .eq('id', appointmentId)
    .eq('patient_id', user.id)
    .single()

  const apt = appointment as {
    id: string
    status: string
    start_ts: string
    doctor?: {
      profile?: {
        full_name: string | null
      } | null
    } | null
  } | null
  if (!apt || apt.status !== 'confirmed') {
    notFound()
  }

  // Generar URL de videollamada
  const videoRoom = await getOrCreateVideoRoom(appointmentId)

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href="/app" className="text-2xl font-bold text-neutral-900">
            Doctor.mx
          </Link>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">
            Sala de Consulta
          </h1>

          {/* Info de la cita */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-neutral-900 mb-4">
              Consulta con Dr. {apt?.doctor?.profile?.full_name ?? 'Médico'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
              <div>
                <strong>Fecha:</strong> {formatDate(apt?.start_ts)}
              </div>
              <div>
                <strong>Hora:</strong> {formatTime(apt?.start_ts)}
              </div>
            </div>
          </div>

          {/* Ingresar a videollamada */}
          <div className="text-center">
            <p className="text-neutral-600 mb-6">
              Haz clic en el botón para ingresar a la videollamada con tu doctor
            </p>

            <a
              href={videoRoom.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 font-semibold text-lg"
            >
              📹 Ingresar a Consulta
            </a>

            <p className="text-sm text-neutral-500 mt-4">
              La videollamada se abrirá en una nueva pestaña
            </p>
          </div>

          {/* Instrucciones */}
          <div className="mt-8 pt-8 border-t space-y-3 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-900">Instrucciones:</p>
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
