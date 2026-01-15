'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SECOND_OPINION_CONFIG, type SecondOpinionType } from '@/lib/domains/second-opinion/shared'

const OPINION_TYPES: { id: SecondOpinionType; name: string; description: string; price: number }[] = [
  {
    id: 'basic',
    name: 'Opinión Básica',
    description: 'Revisión por médico general en 72 horas',
    price: SECOND_OPINION_CONFIG.PRICES.basic / 100,
  },
  {
    id: 'specialist',
    name: 'Opinión Especialista',
    description: 'Revisión por especialista certificado en 72 horas',
    price: SECOND_OPINION_CONFIG.PRICES.specialist / 100,
  },
  {
    id: 'panel',
    name: 'Panel Médico',
    description: 'Revisión por panel de 3+ especialistas',
    price: SECOND_OPINION_CONFIG.PRICES.panel / 100,
  },
]

export default function SecondOpinionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    type: 'basic' as SecondOpinionType,
    chief_complaint: '',
    current_diagnosis: '',
    current_treatment: '',
    medical_history: '',
    allergies: '',
    medications: '',
    questions: [''],
  })

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addQuestion = () => {
    setFormData(prev => ({ ...prev, questions: [...prev.questions, ''] }))
  }

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...formData.questions]
    newQuestions[index] = value
    setFormData(prev => ({ ...prev, questions: newQuestions }))
  }

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/second-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          questions: formData.questions.filter(q => q.trim()),
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear solicitud')
      }
      
      const data = await response.json()
      router.push(`/app/second-opinion/${data.id}`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = OPINION_TYPES.find(t => t.id === formData.type)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#0066CC] rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Doctory</span>
          </Link>
        </div>
      </header>

      <div className="py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8">
            <Badge className="mb-3 bg-blue-50 text-[#0066CC] border-blue-200">
              Segunda Opinión
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">
              Solicitar Segunda Opinión Médica
            </h1>
            <p className="mt-2 text-gray-600">
              Obtén una evaluación profesional de tu diagnóstico o tratamiento actual
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            {[
              { num: 1, label: 'Tipo' },
              { num: 2, label: 'Información' },
              { num: 3, label: 'Preguntas' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      step >= s.num
                        ? 'bg-[#0066CC] text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.num ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${step >= s.num ? 'text-[#0066CC]' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`mx-4 h-1 w-16 sm:w-24 rounded-full transition-all ${
                      step > s.num ? 'bg-[#0066CC]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        {/* Step 1: Select Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Selecciona el tipo de opinión</h2>
            <div className="grid gap-4">
              {OPINION_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`w-full rounded-lg p-4 text-left transition-all ${
                    formData.type === type.id
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border border-gray-200 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => updateField('type', type.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{type.name}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${type.price.toLocaleString()} MXN
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} className="bg-[#0066CC] hover:bg-[#0052A3]">Continuar</Button>
            </div>
          </div>
        )}

        {/* Step 2: Clinical Information */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Información Clínica</h2>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Motivo de consulta / Síntomas principales *
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Describa detalladamente sus síntomas o el motivo por el que busca una segunda opinión..."
                value={formData.chief_complaint}
                onChange={(e) => updateField('chief_complaint', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Diagnóstico actual (si tiene uno)
              </label>
              <Input
                placeholder="Ej: Hipertensión arterial, Diabetes tipo 2..."
                value={formData.current_diagnosis}
                onChange={(e) => updateField('current_diagnosis', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tratamiento actual (si tiene uno)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                placeholder="Liste los medicamentos y tratamientos que está recibiendo..."
                value={formData.current_treatment}
                onChange={(e) => updateField('current_treatment', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Historial médico relevante
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                placeholder="Enfermedades previas, cirugías, hospitalizaciones..."
                value={formData.medical_history}
                onChange={(e) => updateField('medical_history', e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Alergias
                </label>
                <Input
                  placeholder="Medicamentos, alimentos, etc."
                  value={formData.allergies}
                  onChange={(e) => updateField('allergies', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Medicamentos actuales
                </label>
                <Input
                  placeholder="Liste sus medicamentos"
                  value={formData.medications}
                  onChange={(e) => updateField('medications', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Anterior
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={formData.chief_complaint.length < 10}
                className="bg-[#0066CC] hover:bg-[#0052A3]"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Questions & Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Preguntas para el médico</h2>
            <p className="text-sm text-gray-600">
              ¿Qué preguntas específicas tiene para el médico que revisará su caso?
            </p>

            <div className="space-y-3">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Pregunta ${index + 1}`}
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.questions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addQuestion}>
                + Agregar pregunta
              </Button>
            </div>

            {/* Summary */}
            <Card className="mt-8 p-4">
              <h3 className="mb-4 font-semibold">Resumen de tu solicitud</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de opinión:</span>
                  <span className="font-medium">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo de respuesta:</span>
                  <span className="font-medium">Hasta 72 horas</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${selectedType?.price.toLocaleString()} MXN</span>
                </div>
              </div>
            </Card>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Anterior
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-[#0066CC] hover:bg-[#0052A3]">
                {loading ? 'Creando...' : 'Crear Solicitud'}
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
