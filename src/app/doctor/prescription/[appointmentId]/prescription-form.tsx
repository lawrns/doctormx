'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import { LoadingButton } from '@/components'
import { Plus, Trash2, Eye, Send, Download } from 'lucide-react'
import PharmacySuggestions from '@/components/PharmacySuggestions'

const medicationSchema = z.object({
  name: z.string().min(1, 'Nombre del medicamento requerido'),
  dosage: z.string().min(1, 'Dosis requerida'),
  frequency: z.string().min(1, 'Frecuencia requerida'),
  duration: z.string().min(1, 'Duración requerida'),
  quantity: z.string().min(1, 'Cantidad requerida'),
})

const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnóstico requerido'),
  medications: z.array(medicationSchema).min(1, 'Agregue al menos un medicamento'),
  instructions: z.string().optional(),
})

type PrescriptionFormData = z.infer<typeof prescriptionSchema>

interface PatientInfo {
  full_name: string
  date_of_birth?: string
  phone?: string
  email?: string
}

interface AppointmentInfo {
  id: string
  start_ts: string
  end_ts: string
  status: string
  patient: PatientInfo
}

interface ExistingPrescription {
  id: string
  diagnosis: string
  medications: string
  instructions: string
}

interface PrescriptionPageClientProps {
  appointment: AppointmentInfo
  existingPrescription: ExistingPrescription | null
}

export default function PrescriptionPageClient({
  appointment,
  existingPrescription,
}: PrescriptionPageClientProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [currentMedications, setCurrentMedications] = useState<Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
  }>>([])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: existingPrescription?.diagnosis || '',
      instructions: existingPrescription?.instructions || '',
      medications: existingPrescription?.medications
        ? (() => {
            try {
              const parsed = JSON.parse(existingPrescription.medications)
              return Array.isArray(parsed) ? parsed : []
            } catch {
              return []
            }
          })()
        : [
            {
              name: '',
              dosage: '',
              frequency: '',
              duration: '',
              quantity: '',
            },
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  })

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      const formData = new FormData()
      formData.append('appointmentId', appointment.id)
      formData.append('diagnosis', data.diagnosis)
      formData.append('medications', JSON.stringify(data.medications))
      formData.append('instructions', data.instructions || '')

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save prescription')
      }

      setCurrentMedications(data.medications)
      window.location.href = '/doctor'
    } catch (error) {
      console.error('Error saving prescription:', error)
      alert('Error al guardar la receta. Por favor intente de nuevo.')
    }
  }

  const generatePreview = async () => {
    const data = getValues()
    if (!data.diagnosis || fields.length === 0) {
      alert('Complete el diagnóstico y al menos un medicamento')
      return
    }

    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('diagnosis', data.diagnosis)
      formData.append('medications', JSON.stringify(data.medications))
      formData.append('instructions', data.instructions || '')

      const response = await fetch('/api/prescriptions/preview', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate preview')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfPreviewUrl(url)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating preview:', error)
      alert('Error al generar previsualización')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPdf = () => {
    if (!pdfPreviewUrl) return
    const a = document.createElement('a')
    a.href = pdfPreviewUrl
    a.download = `receta-${appointment.id.slice(0, 8)}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const sendToPatient = async () => {
    const data = getValues()
    if (!data.diagnosis || fields.length === 0) {
      alert('Complete el diagnóstico y al menos un medicamento')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/prescriptions/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnosis: data.diagnosis,
          medications: data.medications,
          instructions: data.instructions || '',
          appointmentId: appointment.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send prescription')
      }

      alert('Receta enviada exitosamente al paciente')
    } catch (error) {
      console.error('Error sending prescription:', error)
      alert('Error al enviar la receta. Por favor intente de nuevo.')
    } finally {
      setIsSending(false)
    }
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} años`
  }

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
          <Link href="/doctor" className="text-sm text-blue-600 hover:text-blue-700">
            ← Volver al dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingPrescription ? 'Editar Receta' : 'Crear Receta'}
          </h1>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Paciente: {appointment.patient.full_name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Fecha de nacimiento:</strong> {calculateAge(appointment.patient.date_of_birth)}
              </div>
              <div>
                <strong>Fecha de consulta:</strong> {formatDate(appointment.start_ts)}
              </div>
              <div>
                <strong>Hora:</strong> {formatTime(appointment.start_ts)}
              </div>
              <div>
                <strong>Email del paciente:</strong> {appointment.patient.email || 'No disponible'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico (ICD-10)
              </label>
              <input
                type="text"
                {...register('diagnosis')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: J06.9 - Infección aguda de las vías respiratorias superiores"
              />
              {errors.diagnosis && (
                <p className="mt-1 text-sm text-red-600">{errors.diagnosis.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Medicamentos
                </label>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      name: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      quantity: '',
                    })
                  }
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Agregar medicamento
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Medicamento {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <input
                          type="text"
                          {...register(`medications.${index}.name`)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del medicamento"
                        />
                        {errors.medications?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.medications[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          {...register(`medications.${index}.dosage`)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Dosis (ej: 500mg)"
                        />
                        {errors.medications?.[index]?.dosage && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.medications[index]?.dosage?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          {...register(`medications.${index}.frequency`)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Frecuencia (ej: cada 8 horas)"
                        />
                        {errors.medications?.[index]?.frequency && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.medications[index]?.frequency?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          {...register(`medications.${index}.duration`)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Duración (ej: 5 días)"
                        />
                        {errors.medications?.[index]?.duration && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.medications[index]?.duration?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          {...register(`medications.${index}.quantity`)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Cantidad (ej: 15)"
                        />
                        {errors.medications?.[index]?.quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.medications[index]?.quantity?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.medications && typeof errors.medications.message === 'string' && (
                <p className="mt-2 text-sm text-red-600">{errors.medications.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrucciones Adicionales
              </label>
              <textarea
                {...register('instructions')}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Recomendaciones adicionales, cuidados, seguimiento..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {existingPrescription ? 'Actualizar Receta' : 'Crear Receta'}
              </LoadingButton>

              <button
                type="button"
                onClick={generatePreview}
                disabled={isGenerating}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
              >
                <Eye size={18} />
                {isGenerating ? 'Generando...' : 'Previsualizar PDF'}
              </button>

              <button
                type="button"
                onClick={downloadPdf}
                disabled={!pdfPreviewUrl}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={18} />
                Descargar PDF
              </button>

              <button
                type="button"
                onClick={sendToPatient}
                disabled={isSending}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <Send size={18} />
                {isSending ? 'Enviando...' : 'Enviar al Paciente'}
              </button>

              <Link
                href="/doctor"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t">
            <PharmacySuggestions
              appointmentId={appointment.id}
              medications={currentMedications.length > 0 ? currentMedications : fields.map(f => ({
                name: f.name || '',
                dosage: f.dosage || '',
                frequency: f.frequency || '',
                duration: f.duration || '',
                quantity: f.quantity || '',
              }))}
              patientPhone={appointment.patient.phone || undefined}
            />
          </div>

          {existingPrescription && (
            <div className="mt-6 pt-6 border-t">
              <a
                href={`/api/prescriptions/${existingPrescription.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                📄 Ver PDF existente de la receta
              </a>
            </div>
          )}
        </div>
      </main>

      {showPreview && pdfPreviewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Previsualización de Receta</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
