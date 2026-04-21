'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'
import { LoadingButton } from '@/components/LoadingButton'
import { Plus, Trash2, Eye, Send, Download } from 'lucide-react'
import PharmacySuggestions from '@/components/PharmacySuggestions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link href="/doctor" className="text-2xl font-bold text-foreground">
            Doctor.mx
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/doctor" className="text-sm text-primary hover:text-primary/80">
            ← Volver al dashboard
          </Link>
        </div>

        <Card className="bg-card rounded-2xl border border-border shadow-dx-1 p-6">
          <CardContent className="p-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-6">
              {existingPrescription ? 'Editar Receta' : 'Crear Receta'}
            </h1>

            <div className="bg-secondary/50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">
                Paciente: {appointment.patient.full_name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong className="text-foreground">Fecha de nacimiento:</strong> {calculateAge(appointment.patient.date_of_birth)}
                </div>
                <div>
                  <strong className="text-foreground">Fecha de consulta:</strong> {formatDate(appointment.start_ts)}
                </div>
                <div>
                  <strong className="text-foreground">Hora:</strong> {formatTime(appointment.start_ts)}
                </div>
                <div>
                  <strong className="text-foreground">Email del paciente:</strong> {appointment.patient.email || 'No disponible'}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  Diagnóstico (ICD-10)
                </Label>
                <Input
                  type="text"
                  {...register('diagnosis')}
                  placeholder="Ej: J06.9 - Infección aguda de las vías respiratorias superiores"
                />
                {errors.diagnosis && (
                  <p className="mt-1 text-sm text-destructive">{errors.diagnosis.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>
                    Medicamentos
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: '',
                        dosage: '',
                        frequency: '',
                        duration: '',
                        quantity: '',
                      })
                    }
                  >
                    <Plus size={16} />
                    Agregar medicamento
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-secondary/50 rounded-xl border border-border p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-foreground">
                          Medicamento {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Input
                            type="text"
                            {...register(`medications.${index}.name`)}
                            placeholder="Nombre del medicamento"
                          />
                          {errors.medications?.[index]?.name && (
                            <p className="mt-1 text-sm text-destructive">
                              {errors.medications[index]?.name?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="text"
                            {...register(`medications.${index}.dosage`)}
                            placeholder="Dosis (ej: 500mg)"
                          />
                          {errors.medications?.[index]?.dosage && (
                            <p className="mt-1 text-sm text-destructive">
                              {errors.medications[index]?.dosage?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="text"
                            {...register(`medications.${index}.frequency`)}
                            placeholder="Frecuencia (ej: cada 8 horas)"
                          />
                          {errors.medications?.[index]?.frequency && (
                            <p className="mt-1 text-sm text-destructive">
                              {errors.medications[index]?.frequency?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="text"
                            {...register(`medications.${index}.duration`)}
                            placeholder="Duración (ej: 5 días)"
                          />
                          {errors.medications?.[index]?.duration && (
                            <p className="mt-1 text-sm text-destructive">
                              {errors.medications[index]?.duration?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Input
                            type="text"
                            {...register(`medications.${index}.quantity`)}
                            placeholder="Cantidad (ej: 15)"
                          />
                          {errors.medications?.[index]?.quantity && (
                            <p className="mt-1 text-sm text-destructive">
                              {errors.medications[index]?.quantity?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.medications && typeof errors.medications.message === 'string' && (
                  <p className="mt-2 text-sm text-destructive">{errors.medications.message}</p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">
                  Instrucciones Adicionales
                </Label>
                <Textarea
                  {...register('instructions')}
                  rows={4}
                  placeholder="Recomendaciones adicionales, cuidados, seguimiento..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground"
                >
                  {existingPrescription ? 'Actualizar Receta' : 'Crear Receta'}
                </LoadingButton>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={generatePreview}
                  disabled={isGenerating}
                >
                  <Eye size={18} />
                  {isGenerating ? 'Generando...' : 'Previsualizar PDF'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={downloadPdf}
                  disabled={!pdfPreviewUrl}
                >
                  <Download size={18} />
                  Descargar PDF
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={sendToPatient}
                  disabled={isSending}
                >
                  <Send size={18} />
                  {isSending ? 'Enviando...' : 'Enviar al Paciente'}
                </Button>

                <Button asChild variant="outline">
                  <Link href="/doctor">
                    Cancelar
                  </Link>
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-border">
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
              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href={`/api/prescriptions/${existingPrescription.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  📄 Ver PDF existente de la receta
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle>Previsualización de Receta</DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
