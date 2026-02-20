/**
 * Restriction Request Form Component - GDPR Article 18
 *
 * Form for users to request restriction of processing of their personal data.
 * Implements the right to restriction of processing under GDPR Article 18.
 *
 * @component RestrictionRequestForm
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Shield, 
  Info, 
  AlertTriangle, 
  Send, 
  Clock, 
  Lock, 
  Scale,
  FileWarning,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { logger } from '@/lib/observability/logger'
import type { RestrictionReason, DataTableScope } from '@/lib/arco'

// Data scope options
const DATA_SCOPES: Record<DataTableScope, { label: string; description: string }> = {
  profiles: { 
    label: 'Perfil', 
    description: 'Información personal como nombre, email, teléfono' 
  },
  appointments: { 
    label: 'Citas', 
    description: 'Historial de citas médicas programadas' 
  },
  prescriptions: { 
    label: 'Recetas', 
    description: 'Recetas médicas emitidas' 
  },
  soap_consultations: { 
    label: 'Consultas Médicas', 
    description: 'Notas médicas SOAP y diagnósticos' 
  },
  chat_conversations: { 
    label: 'Conversaciones de Chat', 
    description: 'Historial de conversaciones en chat' 
  },
  chat_messages: { 
    label: 'Mensajes de Chat', 
    description: 'Mensajes individuales del chat' 
  },
  payments: { 
    label: 'Pagos', 
    description: 'Historial de pagos y facturación' 
  },
  follow_up_schedules: { 
    label: 'Seguimientos', 
    description: 'Programas de seguimiento médico' 
  },
  all: { 
    label: 'Todos los Datos', 
    description: 'Toda la información personal almacenada' 
  },
}

// Restriction reasons
const RESTRICTION_REASONS: Record<RestrictionReason, { 
  label: string; 
  description: string;
  icon: React.ReactNode;
  gdpr_article: string;
}> = {
  accuracy_contested: {
    label: 'Exactitud impugnada',
    description: 'Impugno la exactitud de mis datos personales y se debe verificar',
    icon: <FileWarning className="h-4 w-4" />,
    gdpr_article: 'Art. 18(1)(a)',
  },
  unlawful_processing: {
    label: 'Tratamiento ilícito',
    description: 'El tratamiento es ilícito pero prefiero restringir en lugar de eliminar',
    icon: <AlertTriangle className="h-4 w-4" />,
    gdpr_article: 'Art. 18(1)(b)',
  },
  legal_claims: {
    label: 'Reclamaciones legales',
    description: 'Necesito los datos para la formulación, ejercicio o defensa de reclamaciones',
    icon: <Scale className="h-4 w-4" />,
    gdpr_article: 'Art. 18(1)(c)',
  },
  objection_pending: {
    label: 'Oposición pendiente',
    description: 'He presentado oposición y se está verificando si los motivos prevalecen',
    icon: <Clock className="h-4 w-4" />,
    gdpr_article: 'Art. 18(1)(d)',
  },
  public_interest: {
    label: 'Interés público',
    description: 'Se requiere verificación de interés público en el tratamiento',
    icon: <Info className="h-4 w-4" />,
    gdpr_article: 'Art. 18(1)(d)',
  },
}

interface RestrictionRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
  onSubmit?: (data: RestrictionRequestData) => Promise<void>
}

export interface RestrictionRequestData {
  data_scope: DataTableScope[]
  restriction_reason: RestrictionReason
  description: string
  restriction_details?: string
  duration_type: 'permanent' | 'temporary'
  duration_days?: number
  apply_immediately: boolean
}

export function RestrictionRequestForm({
  open,
  onOpenChange,
  loading = false,
  onSubmit,
}: RestrictionRequestFormProps) {
  const [dataScope, setDataScope] = useState<DataTableScope[]>(['all'])
  const [restrictionReason, setRestrictionReason] = useState<RestrictionReason>('accuracy_contested')
  const [description, setDescription] = useState('')
  const [restrictionDetails, setRestrictionDetails] = useState('')
  const [durationType, setDurationType] = useState<'permanent' | 'temporary'>('permanent')
  const [durationDays, setDurationDays] = useState<number>(30)
  const [applyImmediately, setApplyImmediately] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setDataScope(['all'])
      setRestrictionReason('accuracy_contested')
      setDescription('')
      setRestrictionDetails('')
      setDurationType('permanent')
      setDurationDays(30)
      setApplyImmediately(true)
      setShowConfirmation(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      return
    }

    const data: RestrictionRequestData = {
      data_scope: dataScope,
      restriction_reason: restrictionReason,
      description,
      restriction_details: restrictionDetails,
      duration_type: durationType,
      duration_days: durationType === 'temporary' ? durationDays : undefined,
      apply_immediately: applyImmediately,
    }

    try {
      await onSubmit?.(data)
    } catch (error) {
      logger.error('Error submitting restriction request', { 
        error: error instanceof Error ? error.message : String(error) 
      })
    }
  }

  const handleScopeToggle = (scope: DataTableScope) => {
    setDataScope((prev) => {
      if (prev.includes('all')) {
        return scope === 'all' ? [scope] : [scope]
      } else if (scope === 'all') {
        return ['all']
      } else {
        const newScope = prev.includes(scope)
          ? prev.filter((s) => s !== scope)
          : [...prev, scope]
        return newScope.length === 0 ? ['all'] : newScope
      }
    })
  }

  const isScopeSelected = (scope: string) => {
    return dataScope.includes('all') || dataScope.includes(scope as DataTableScope)
  }

  const selectedReason = RESTRICTION_REASONS[restrictionReason]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle>Solicitud de Restricción de Tratamiento</DialogTitle>
              <DialogDescription>
                Ejercicio del derecho de restricción según el Artículo 18 del GDPR
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GDPR Notice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>GDPR Artículo 18:</strong> Tiene derecho a obtener la restricción del 
              tratamiento de sus datos personales cuando:
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li>Impugne la exactitud de los datos (durante la verificación)</li>
                <li>El tratamiento sea ilícito pero se oponga a la supresión</li>
                <li>Los datos sean necesarios para reclamaciones legales</li>
                <li>Haya presentado oposición (mientras se verifica)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Restriction Reason Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Motivo de la Restricción *</Label>
            <p className="text-sm text-gray-600">
              Seleccione el motivo por el cual solicita la restricción
            </p>

            <RadioGroup
              value={restrictionReason}
              onValueChange={(value) => setRestrictionReason(value as RestrictionReason)}
              className="space-y-3"
            >
              {(Object.keys(RESTRICTION_REASONS) as RestrictionReason[]).map((reason) => {
                const info = RESTRICTION_REASONS[reason]
                return (
                  <div
                    key={reason}
                    className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                      restrictionReason === reason
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={reason} id={`reason_${reason}`} className="mt-1" />
                    <Label htmlFor={`reason_${reason}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        {info.icon}
                        <span className="font-medium">{info.label}</span>
                        <span className="text-xs text-gray-500">({info.gdpr_article})</span>
                      </div>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Data Scope Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Alcance de la Restricción</Label>
            <p className="text-sm text-gray-600 mb-3">
              Seleccione los tipos de datos que desea restringir
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(DATA_SCOPES) as DataTableScope[]).map((scope) => {
                const info = DATA_SCOPES[scope]
                const isSelected = isScopeSelected(scope)
                return (
                  <div
                    key={scope}
                    className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      id={`scope_${scope}`}
                      checked={isSelected}
                      onCheckedChange={() => handleScopeToggle(scope)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`scope_${scope}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-sm">{info.label}</div>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción de la Solicitud *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa por qué solicita la restricción del tratamiento de sus datos..."
              rows={4}
              disabled={loading}
              className="resize-none"
              required
            />
            <p className="text-xs text-gray-500">
              Proporcione detalles sobre su solicitud para ayudarnos a procesarla correctamente.
            </p>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Detalles Adicionales (opcional)</Label>
            <Textarea
              id="details"
              value={restrictionDetails}
              onChange={(e) => setRestrictionDetails(e.target.value)}
              placeholder="Información adicional relevante para su solicitud..."
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Duración de la Restricción</Label>
            
            <RadioGroup
              value={durationType}
              onValueChange={(value) => setDurationType(value as 'permanent' | 'temporary')}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="permanent" id="permanent" />
                <Label htmlFor="permanent" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Permanente</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    La restricción permanecerá hasta que usted solicite su levantamiento
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="temporary" id="temporary" />
                <Label htmlFor="temporary" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Temporal</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    La restricción se aplicará por un período específico
                  </p>
                  
                  {durationType === 'temporary' && (
                    <div className="mt-3 flex items-center gap-3">
                      <Label htmlFor="duration_days" className="text-sm whitespace-nowrap">
                        Duración (días):
                      </Label>
                      <Input
                        id="duration_days"
                        type="number"
                        min={1}
                        max={365}
                        value={durationDays}
                        onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                        className="w-24"
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-500">
                        (Máximo 365 días)
                      </span>
                    </div>
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Immediate Application */}
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="apply_immediately"
              checked={applyImmediately}
              onCheckedChange={(checked) => setApplyImmediately(checked as boolean)}
              disabled={loading}
            />
            <Label htmlFor="apply_immediately" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Aplicar restricción inmediatamente</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Los cambios se aplicarán de inmediato. Si desmarca esta opción, 
                la restricción se aplicará solo después de que un administrador revise su solicitud.
              </p>
            </Label>
          </div>

          <Separator />

          {/* Effects Notice */}
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              <strong>Efectos de la restricción:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Sus datos <strong>solo se almacenarán</strong>, no se procesarán</li>
                <li>No se compartirán con terceros (aseguradoras, farmacias, laboratorios)</li>
                <li>No se utilizarán para análisis, marketing o personalización</li>
                <li>Se mantendrán para posibles reclamaciones legales</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* SLA Notice */}
          <Alert variant="default" className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              El plazo de respuesta es de <strong>20 días hábiles</strong> según el GDPR. 
              Será notificado del estado de su solicitud por correo electrónico.
            </AlertDescription>
          </Alert>

          {/* Submit Buttons */}
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
              disabled={loading || !description.trim()}
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
