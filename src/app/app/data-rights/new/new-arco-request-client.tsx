/**
 * New ARCO Request Client Component
 *
 * Client-side component for creating new ARCO requests.
 * Provides form for each request type with appropriate fields.
 *
 * @component NewArcoRequestClient
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Eye,
  Edit3,
  Trash2,
  Ban,
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react'
import { ARCO_RIGHTS } from '../data-rights-client'

const DATA_SCOPE_OPTIONS = [
  { value: 'profiles', label: 'Información personal (nombre, teléfono, foto)' },
  { value: 'appointments', label: 'Historial de citas y consultas' },
  { value: 'prescriptions', label: 'Recetas médicas' },
  { value: 'soap_consultations', label: 'Notas médicas SOAP' },
  { value: 'chat_conversations', label: 'Conversaciones de chat' },
  { value: 'chat_messages', label: 'Mensajes individuales' },
  { value: 'payments', label: 'Historial de pagos' },
  { value: 'follow_up_schedules', label: 'Programas de seguimiento' },
  { value: 'all', label: 'Todos mis datos' },
]

interface NewArcoRequestClientProps {
  userId: string
  preselectedType?: string | null
}

const ARCO_TYPES = ['ACCESS', 'RECTIFY', 'CANCEL', 'OPPOSE'] as const

export function NewArcoRequestClient({ userId, preselectedType }: NewArcoRequestClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState<typeof ARCO_TYPES[number] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dataScope, setDataScope] = useState<string[]>([])
  const [specificRecords, setSpecificRecords] = useState<string[]>([])
  const [justification, setJustification] = useState('')

  // Auto-select type from URL param
  useEffect(() => {
    if (preselectedType && ARCO_TYPES.includes(preselectedType as any)) {
      setSelectedType(preselectedType as any)
      const right = ARCO_RIGHTS.find(r => r.type === preselectedType)
      if (right) {
        setTitle(right.title)
        setDescription(right.description)
      }
    }
  }, [preselectedType])

  const selectedRightConfig = ARCO_RIGHTS.find(r => r.type === selectedType)

  const handleScopeChange = (scope: string, checked: boolean) => {
    if (scope === 'all') {
      setDataScope(checked ? ['all'] : [])
    } else {
      setDataScope(prev => {
        const newScope = prev.filter(s => s !== 'all')
        if (checked) {
          return [...newScope, scope]
        }
        return newScope.filter(s => s !== scope)
      })
    }
  }

  const handleSubmit = async () => {
    if (!selectedType) {
      setError('Por favor selecciona un tipo de solicitud')
      return
    }

    if (dataScope.length === 0) {
      setError('Por favor selecciona al menos un alcance de datos')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/arco/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: selectedType,
          title,
          description,
          data_scope: dataScope,
          specific_records: specificRecords.length > 0 ? specificRecords : undefined,
          justification: justification || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Error al crear la solicitud')
      }

      setSuccess(true)

      // Redirect after delay
      setTimeout(() => {
        router.push('/app/data-rights')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la solicitud')
      setSubmitting(false)
    }
  }

  const isOver18 = () => {
    // Simple check - in production this would be verified against profile data
    return true
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Solicitud Creada Exitosamente
            </h2>
            <p className="text-green-800 mb-6">
              Tu solicitud de {selectedRightConfig?.title} ha sido recibida. Nos pondremos en contacto
              dentro de un plazo máximo de 20 días hábiles.
            </p>
            <div className="space-y-2 text-sm text-green-700">
              <p><strong>ID de Solicitud:</strong> {success ? 'Generado' : '...'}</p>
              <p><strong>Plazo de Respuesta:</strong> 20 días hábiles</p>
              <p><strong>Método de Notificación:</strong> Email y Centro de Derechos</p>
            </div>
            <Link href="/app/data-rights">
              <Button className="mt-6 w-full">
                Volver al Centro de Derechos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/data-rights">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Nueva Solicitud ARCO</h1>
            <p className="text-xs text-gray-500">Ejerce tus derechos de protección de datos</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Select Request Type */}
        {!selectedType && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Selecciona el Derecho a Ejercer</CardTitle>
              <CardDescription>
                Elige el tipo de solicitud que deseas realizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ARCO_RIGHTS.map((right) => (
                  <button
                    key={right.type}
                    onClick={() => {
                      setSelectedType(right.type as any)
                      setTitle(right.title)
                      setDescription(right.description)
                    }}
                    className={`text-left p-6 rounded-xl border-2 transition-all hover:shadow-md ${right.bgColor} ${right.borderColor} hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${right.bgColor}`}>
                        <div className={right.color}>
                          {right.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-gray-900 mb-2 ${right.color}`}>
                          {right.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {right.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Request Form */}
        {selectedType && selectedRightConfig && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${selectedRightConfig.bgColor}`}>
                      <div className={selectedRightConfig.color}>
                        {selectedRightConfig.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{selectedRightConfig.title}</CardTitle>
                  </div>
                  <CardDescription>{selectedRightConfig.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedType(null)
                    setTitle('')
                    setDescription('')
                    setDataScope([])
                    setSpecificRecords([])
                    setJustification('')
                  }}
                >
                  Cambiar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Solicitud *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Solicitud de acceso a mis datos personales"
                  className="text-base"
                  disabled={submitting}
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción Detallada *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe en detalle qué derechos deseas ejercer..."
                  rows={4}
                  className="text-base resize-none"
                  disabled={submitting}
                />
                <p className="text-sm text-gray-500">{description.length} / 2000 caracteres</p>
              </div>

              {/* Data Scope Selection */}
              <div className="space-y-3">
                <Label>Alcance de Datos (selecciona al menos uno) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DATA_SCOPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Checkbox
                        id={`scope-${option.value}`}
                        checked={dataScope.includes(option.value)}
                        onCheckedChange={(checked) => handleScopeChange(option.value, checked === true)}
                        disabled={submitting}
                      />
                      <Label
                        htmlFor={`scope-${option.value}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific Records (optional) */}
              {(selectedType === 'RECTIFY' || selectedType === 'CANCEL') && (
                <div className="space-y-2">
                  <Label htmlFor="specific-records">
                    Registros Específicos (opcional)
                    <span className="text-gray-500 font-normal ml-2">
                      - Solo si deseas modificar/eliminar registros específicos
                    </span>
                  </Label>
                  <Input
                    id="specific-records"
                    value={specificRecords.join(', ')}
                    onChange={(e) => setSpecificRecords(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Ej: appointment-123, chat-msg-456 (separados por coma)"
                    className="text-base"
                    disabled={submitting}
                  />
                  <p className="text-sm text-gray-500">
                    Ingresa IDs específicos separados por coma. Déjalo vacío para aplicar a todos.
                  </p>
                </div>
              )}

              {/* Justification (optional) */}
              {selectedType === 'OPPOSE' && (
                <div className="space-y-2">
                  <Label htmlFor="justification">
                    Justificación de Oposición *
                    <span className="text-gray-500 font-normal ml-2">
                      - Explica por qué te opones
                    </span>
                  </Label>
                  <Textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Describe las razones por las que te opones al tratamiento de tus datos..."
                    rows={3}
                    className="text-base resize-none"
                    disabled={submitting}
                  />
                  <p className="text-sm text-gray-500">{justification.length} / 1000 caracteres</p>
                </div>
              )}

              {/* Legal Notice */}
              <Alert className="border-indigo-200 bg-indigo-50">
                <Info className="h-4 w-4 text-indigo-600" />
                <AlertDescription className="text-indigo-900 text-sm">
                  <strong>Plazo de respuesta:</strong> Por ley, tenemos un máximo de 20 días hábiles
                  para responder a tu solicitud. Serás notificado por email cuando haya una actualización.
                </AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/app/data-rights" className="flex-1">
                  <Button variant="outline" className="w-full" disabled={submitting}>
                    Cancelar
                  </Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !title || !description || dataScope.length === 0}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Enviar Solicitud
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Información Legal</h4>
            <p className="text-sm text-amber-800">
              El ejercicio de tus derechos ARCO es gratuito y está protegido por la Ley Federal de Protección
              de Datos Personales en Posesión de los Particulares (LFPDPPP). Tienes derecho a:
            </p>
            <ul className="text-sm text-amber-800 mt-3 space-y-2 list-disc list-inside">
              <li><strong>Confirmación de recepción:</strong> Acuse de recibo en máximo 48 horas</li>
              <li><strong>Respuesta completa:</strong> Máximo 20 días hábiles</li>
              <li><strong>Medios de impugnación:</strong> Recurso ante el INAI y tribunales</li>
              <li><strong>Repetición:</strong> Podrás repetir tu solicitud si no obtienes respuesta</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
