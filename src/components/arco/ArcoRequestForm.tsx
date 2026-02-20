/**
 * ARCO Request Form Component
 *
 * Form for users to submit ARCO (Access, Rectification, Cancellation, Opposition)
 * requests according to LFPDPPP compliance requirements.
 *
 * @component ArcoRequestForm
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FileText, Info, AlertTriangle, Shield, Send } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ArcoRequestType } from '@/types/arco'
import { logger } from '@/lib/observability/logger'

// Mock data - replace with actual API calls
const DATA_SCOPES = {
  profiles: { label: 'Perfil', value: 'profiles' },
  appointments: { label: 'Citas', value: 'appointments' },
  prescriptions: { label: 'Recetas', value: 'prescriptions' },
  soap_consultations: { label: 'Consultas Médicas', value: 'soap_consultations' },
  chat_conversations: { label: 'Chat', value: 'chat_conversations' },
  payments: { label: 'Pagos', value: 'payments' },
} as const

interface ArcoRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestType?: ArcoRequestType
  loading?: boolean
  onSubmit?: (data: ArcoRequestData) => Promise<void>
}

export interface ArcoRequestData {
  request_type: ArcoRequestType
  data_scope: string[]
  reason: string
  current_data?: {
    field_name: string
    current_value: string
    new_value: string
    table_name: string
    record_id: string
  }
  delivery_method: 'email' | 'portal' | 'pickup'
}

const TYPE_DESCRIPTIONS: Record<ArcoRequestType, { title: string; description: string; icon: React.ReactNode }> = {
  ACCESS: {
    title: 'Solicitud de Acceso',
    description: 'Solicito una copia de todos mis datos personales que tiene Doctor.mx',
    icon: <FileText className="h-4 w-4" />,
  },
  RECTIFY: {
    title: 'Solicitud de Rectificación',
    description: 'Solicito corregir información inexacta o incompleta en mis datos',
    icon: <Info className="h-4 w-4" />,
  },
  CANCEL: {
    title: 'Solicitud de Cancelación',
    description: 'Solicito la eliminación de mis datos personales de los sistemas',
    icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
  },
  OPPOSE: {
    title: 'Solicitud de Oposición',
    description: 'Me opongo al uso de mis datos para los siguientes fines específicos',
    icon: <Shield className="h-4 w-4" />,
  },
  RESTRICT: {
    title: 'Solicitud de Restricción',
    description: 'Solicito limitar el tratamiento de mis datos personales (GDPR Art. 18)',
    icon: <Shield className="h-4 w-4 text-blue-600" />,
  },
}

export function ArcoRequestForm({
  open,
  onOpenChange,
  requestType = 'ACCESS',
  loading = false,
  onSubmit,
}: ArcoRequestFormProps) {
  const [selectedType, setSelectedType] = useState<ArcoRequestType>('ACCESS')
  const [dataScope, setDataScope] = useState<string[]>(['all'])
  const [reason, setReason] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'portal' | 'pickup'>('portal')
  const [rectificationData, setRectificationData] = useState<ArcoRequestData['current_data'] | undefined>(undefined)

  const typeInfo = TYPE_DESCRIPTIONS[selectedType]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      return
    }

    const data: ArcoRequestData = {
      request_type: selectedType,
      data_scope: dataScope,
      reason,
      delivery_method: deliveryMethod,
    }

    if (selectedType === 'RECTIFY' && rectificationData) {
      data.current_data = rectificationData
    }

    try {
      await onSubmit?.(data)
    } catch (error) {
      logger.error('Error submitting ARCO request', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value as ArcoRequestType)
  }

  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value as 'email' | 'portal' | 'pickup')
  }

  const handleScopeToggle = (scope: string) => {
    setDataScope((prev) => {
      if (prev.includes('all')) {
        // If "all" is selected, unselect everything else
        return scope === 'all' ? [scope] : []
      } else if (scope === 'all') {
        // If selecting "all", unselect everything
        return ['all']
      } else {
        // Toggle the scope
        const newScope = prev.includes(scope)
          ? prev.filter((s) => s !== scope)
          : [...prev, scope]
        return newScope
      }
    })
  }

  const isScopeSelected = (scope: string) => {
    return dataScope.includes('all') || dataScope.includes(scope)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-1">{typeInfo.icon}</div>
            <div className="flex-1">
              <DialogTitle>{typeInfo.title}</DialogTitle>
              <DialogDescription>{typeInfo.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type Selection */}
          {requestType ? (
            <Alert variant="default" className="mb-4">
              <AlertDescription>
                Tipo de solicitud: <strong>{typeInfo.title}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="mb-4">
              <Label className="text-base font-medium mb-2">Tipo de Solicitud ARCO</Label>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de solicitud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCESS">Acceso a Datos</SelectItem>
                  <SelectItem value="RECTIFY">Rectificación de Datos</SelectItem>
                  <SelectItem value="CANCEL">Cancelación (Derecho al Olvido)</SelectItem>
                  <SelectItem value="OPPOSE">Oposición al Tratamiento</SelectItem>
                  <SelectItem value="RESTRICT">Restricción de Tratamiento (GDPR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Data Scope Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Alcance de la Solicitud</Label>
            <p className="text-sm text-gray-600 mb-3">
              Selecciona los tipos de datos que deseas incluir en esta solicitud.
            </p>

            {selectedType === 'CANCEL' && (
              <Alert variant="destructive" className="mb-3">
                <AlertDescription>
                  <strong>IMPORTANTE:</strong> Al cancelar tu cuenta, todos tus datos
                  serán eliminados de nuestros sistemas de forma permanente. Esta acción
                  <strong>no se puede deshacer</strong>.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(DATA_SCOPES).map(([value, { label }]) => {
                const isSelected = isScopeSelected(value)
                return (
                  <div key={value} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50">
                    <Checkbox
                      id={`scope_${value}`}
                      checked={isSelected}
                      onCheckedChange={() => handleScopeToggle(value)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`scope_${value}`}
                      className="text-sm cursor-pointer normal-case"
                    >
                      {label}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la Solicitud *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe por qué deseas realizar esta solicitud..."
              rows={4}
              disabled={loading}
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Por favor, proporciona el mayor detalle posible sobre tu solicitud.
            </p>
          </div>

          {/* Rectification Data */}
          {selectedType === 'RECTIFY' && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Datos a Rectificar</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="field_name">Campo a Corregir</Label>
                  <Select
                    value={rectificationData?.field_name ?? ''}
                    onValueChange={(value) =>
                      setRectificationData({
                        field_name: value,
                        current_value: rectificationData?.current_value ?? '',
                        new_value: rectificationData?.new_value ?? '',
                        table_name: rectificationData?.table_name ?? 'profiles',
                        record_id: rectificationData?.record_id ?? '',
                      })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_name">Nombre Completo</SelectItem>
                      <SelectItem value="email">Correo Electrónico</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="date_of_birth">Fecha de Nacimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="current_value">Valor Actual</Label>
                  <Input
                    id="current_value"
                    value={rectificationData?.current_value ?? ''}
                    onChange={(e) =>
                      setRectificationData({
                        field_name: rectificationData?.field_name ?? '',
                        current_value: e.target.value,
                        new_value: rectificationData?.new_value ?? '',
                        table_name: rectificationData?.table_name ?? 'profiles',
                        record_id: rectificationData?.record_id ?? '',
                      })
                    }
                    placeholder="Valor actual que deseas corregir"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="new_value">Valor Corregido</Label>
                  <Input
                    id="new_value"
                    value={rectificationData?.new_value ?? ''}
                    onChange={(e) =>
                      setRectificationData({
                        field_name: rectificationData?.field_name ?? '',
                        current_value: rectificationData?.current_value ?? '',
                        new_value: e.target.value,
                        table_name: rectificationData?.table_name ?? 'profiles',
                        record_id: rectificationData?.record_id ?? '',
                      })
                    }
                    placeholder="Nuevo valor correcto"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="table_name">Tabla (opcional)</Label>
                <Input
                  id="table_name"
                  value={rectificationData?.table_name ?? ''}
                  onChange={(e) =>
                    setRectificationData({
                      field_name: rectificationData?.field_name ?? '',
                      current_value: rectificationData?.current_value ?? '',
                      new_value: rectificationData?.new_value ?? '',
                      table_name: e.target.value,
                      record_id: rectificationData?.record_id ?? '',
                    })}
                    placeholder="ej: profiles"
                    disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="record_id">ID del Registro (opcional)</Label>
                <Input
                  id="record_id"
                  value={rectificationData?.record_id ?? ''}
                  onChange={(e) =>
                    setRectificationData({
                      field_name: rectificationData?.field_name ?? '',
                      current_value: rectificationData?.current_value ?? '',
                      new_value: rectificationData?.new_value ?? '',
                      table_name: rectificationData?.table_name ?? 'profiles',
                      record_id: e.target.value,
                    })}
                    placeholder="ID del registro a corregir"
                    disabled={loading}
                  />
                </div>
            </div>
          )}

          {/* Delivery Method */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Método de Entrega de Respuesta</Label>

            <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange} className="space-y-3">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="portal" id="portal" />
                <Label htmlFor="portal" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Portal Web</span>
                    <p className="text-xs text-gray-500">
                      Recibe notificación en tu portal y descarga directamente
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Correo Electrónico</span>
                    <p className="text-xs text-gray-500">
                      Recibe un correo con enlace seguro para descargar
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Recogida en Oficina</span>
                    <p className="text-xs text-gray-500">
                      Disponible solo en ciudades seleccionadas
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* LFPDPPP Notice */}
          <Alert variant="default" className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Derechos ARCO (LFPDPPP):</strong> De acuerdo con la Ley Federal
              de Protección de Datos Personales en Posesión de los Particulares, tienes
              derecho a:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos</li>
                <li><strong>Oposición:</strong> Oponerte al uso de datos para fines específicos</li>
                <li><strong>Restricción:</strong> Limitar el tratamiento (GDPR Art. 18)</li>
              </ul>
              <p className="mt-2">
                El plazo de respuesta es de <strong>20 días hábiles</strong>. Serás notificado
                del estado de tu solicitud.
              </p>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}