/**
 * Consent Modal Component
 *
 * Modal dialog for presenting consent requests to users.
 * Displays consent text, scope, and allows users to grant/withdraw consent.
 *
 * @component ConsentModal
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, AlertTriangle } from 'lucide-react'

// Types
import type { ConsentType } from '@/lib/consent/client'

// Mock data - replace with actual API calls
const CONSENT_TEMPLATES: Record<
  string,
  {
    title: string
    description: string
    fullText: string
  }
> = {
  marketing_emails: {
    title: 'Consentimiento de Correos Electrónicos',
    description: 'Autorizo el envío de comunicaciones promocionales y actualizaciones sobre servicios.',
    fullText: `
Por medio de la presente, autorizo a Doctor.mx a enviarme mensajes de correo electrónico
con contenido promocional, información sobre nuevos servicios, características, actualizaciones
y ofertas especiales.

Entiendo que:
- Podré darme de baja en cualquier momento
- Mis datos serán protegidos conforme a la ley
- Este consentimiento es voluntario
    `,
  },
  marketing_sms: {
    title: 'Consentimiento de Mensajes SMS',
    description: 'Autorizo el envío de mensajes de texto con promociones.',
    fullText: `
Autorizo a Doctor.mx a enviarme mensajes de texto (SMS) con información promocional,
recordatorios de citas y actualizaciones sobre mi cuenta.

Entiendo que:
- Puedo responder STOP para darme de baja
- Podría haber costos asociados según mi plan móvil
- Mis datos estarán protegidos
    `,
  },
  analytics_consent: {
    title: 'Consentimiento de Analíticas',
    description: 'Permito el análisis de mis datos para mejorar el servicio.',
    fullText: `
Autorizo a Doctor.mx a analizar mi información de uso y datos de navegación
para mejorar la calidad de los servicios, desarrollar nuevas funcionalidades y
personalizar mi experiencia.

Este análisis se realiza de forma agregada y no identifica individualmente a los usuarios.
    `,
  },
  ai_training_consent: {
    title: 'Consentimiento de Entrenamiento de IA',
    description: 'Permito usar mis datos para entrenar modelos de IA.',
    fullText: `
Autorizo a Doctor.mx a utilizar mis datos médicos anonimizados para entrenar
modelos de inteligencia artificial que ayudan a mejorar los servicios médicos.

Los datos utilizados serán:
- Anonimizados (sin información personal identificable)
- Utilizados únicamente para entrenamiento
- No compartidos con terceros sin autorización adicional
    `,
  },
  share_with_insurance: {
    title: 'Compartir con Compañía de Seguros',
    description: 'Autorizo compartir mis datos con mi aseguradora.',
    fullText: `
Autorizo a Doctor.mx a compartir mis datos médicos y de consultas con mi compañía
de seguros especificada para fines de reembolso y verificación de cobertura.

Los datos compartidos incluirán:
- Diagnósticos y tratamientos
- Fechas de consulta
- Recetas médicas
- Montos de consulta
    `,
  },
}

interface ConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consentType: string
  currentConsent?: boolean
  loading?: boolean
  onGrant?: () => void
  onWithdraw?: () => void
}

export function ConsentModal({
  open,
  onOpenChange,
  consentType,
  currentConsent = false,
  loading = false,
  onGrant,
  onWithdraw,
}: ConsentModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const template = CONSENT_TEMPLATES[consentType]

  const handleAgreedChange = (checked: boolean | 'indeterminate') => {
    setAgreedToTerms(checked === true)
  }

  const handleGrant = () => {
    if (!agreedToTerms) return
    onGrant?.()
  }

  const handleWithdraw = () => {
    onWithdraw?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.title}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* AI Training Disclaimer - Always show for AI-related consent */}
          {consentType === 'ai_training_consent' && (
            <Alert variant="default" className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>IMPORTANTE:</strong> Este consentimiento permite el uso de
                sus datos para entrenar modelos de inteligencia artificial. Los datos serán
                anonimizados antes de su uso. Puede retirar este consentimiento en
                cualquier momento.
              </AlertDescription>
            </Alert>
          )}

          {/* Full Consent Text */}
          <div className="rounded-md border p-4 bg-gray-50">
            <h4 className="text-sm font-semibold mb-2">Términos Completos:</h4>
            <ScrollArea className="h-64 w-full rounded-md border bg-white p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {template.fullText}
              </p>
            </ScrollArea>
          </div>

          {/* Current Consent Status */}
          {currentConsent && (
            <Alert variant="default" className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Actualmente tiene otorgado este consentimiento. Si continúa,
                estará actualizando sus preferencias.
              </AlertDescription>
            </Alert>
          )}

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={handleAgreedChange}
              disabled={loading}
            />
            <Label
              htmlFor="agree-terms"
              className="text-sm font-normal leading-relaxed"
            >
              He leído y entiendo los términos descritos arriba. Doy mi
              consentimiento voluntario para el procesamiento de mis datos personales
              según se describe.
            </Label>
          </div>

          {/* Data Protection Notice */}
          <Alert variant="default" className="border-gray-200">
            <AlertDescription className="text-sm text-gray-700">
              <strong>Protección de Datos:</strong> Sus datos serán protegidos
              conforme a la Ley Federal de Protección de Datos Personales en Posesión
              de los Particulares (LFPDPPP). Tiene derecho a acceder, rectificar,
              cancelar u oponerse al tratamiento de sus datos en cualquier momento.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>

          {!currentConsent ? (
            <Button
              onClick={handleGrant}
              disabled={!agreedToTerms || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Procesando...' : 'Aceptar y Otorgar'}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Procesando...' : 'Retirar Consentimiento'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
