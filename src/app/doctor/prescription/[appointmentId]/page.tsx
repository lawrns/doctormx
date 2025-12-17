import { requireRole } from '@/lib/auth'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PrescriptionPage({
  params,
}: {
  params: { appointmentId: string }
}) {
  const { user, supabase } = await requireRole('doctor')

  // Obtener cita
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey (full_name, phone)
    `)
    .eq('id', params.appointmentId)
    .eq('doctor_id', user.id)
    .eq('status', 'confirmed')
    .single()

  if (!appointment) {
    notFound()
  }

  // Obtener receta existente
  const { data: existingPrescription } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('appointment_id', params.appointmentId)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href="/doctor" className="text-2xl font-bold text-gray-900">
            Doctory
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/doctor"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Volver al dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Crear Receta
          </h1>

          {/* Info del paciente */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Paciente: {appointment.patient.full_name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Fecha de consulta:</strong> {formatDate(appointment.start_ts)}
              </div>
              <div>
                <strong>Hora:</strong> {formatTime(appointment.start_ts)}
              </div>
            </div>
          </div>

          {/* Formulario de receta */}
          <form action="/api/prescriptions" method="POST" className="space-y-6">
            <input type="hidden" name="appointmentId" value={params.appointmentId} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico
              </label>
              <textarea
                name="diagnosis"
                rows={3}
                defaultValue={existingPrescription?.diagnosis || ''}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del diagnóstico..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicamentos e Indicaciones
              </label>
              <textarea
                name="medications"
                rows={8}
                defaultValue={existingPrescription?.medications || ''}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="1. Paracetamol 500mg - 1 tableta cada 8 horas por 5 días&#10;2. ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrucciones Adicionales
              </label>
              <textarea
                name="instructions"
                rows={4}
                defaultValue={existingPrescription?.instructions || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Recomendaciones adicionales, cuidados, seguimiento..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {existingPrescription ? 'Actualizar Receta' : 'Crear Receta'}
              </button>
              <Link
                href="/doctor"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>

          {existingPrescription && (
            <div className="mt-6 pt-6 border-t">
              <Link
                href={`/prescription/${existingPrescription.id}/pdf`}
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                📄 Ver PDF de la receta
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
