/**
 * Medical Disclaimer Component
 * 
 * Displays a prominent medical disclaimer before AI consultation.
 * Users must acknowledge this disclaimer before proceeding.
 * 
 * @component MedicalDisclaimer
 */

'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Shield, Clock, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

/**
 * Props for the MedicalDisclaimer component
 */
interface MedicalDisclaimerProps {
  /** Callback when user acknowledges the disclaimer */
  onAcknowledge: (timestamp: string) => void
  /** Callback when user declines/cancels */
  onCancel?: () => void
  /** Optional additional content */
  children?: React.ReactNode
  /** Disable the proceed button until acknowledged */
  requireAcknowledgment?: boolean
  /** Show emergency contact information */
  showEmergencyInfo?: boolean
}

/**
 * Medical Disclaimer Component
 * 
 * Displays a prominent medical disclaimer that users must acknowledge
 * before using AI consultation features. This is a legal requirement
 * to ensure users understand the limitations of AI medical advice.
 */
export function MedicalDisclaimer({
  onAcknowledge,
  onCancel,
  children,
  requireAcknowledgment = true,
  showEmergencyInfo = true,
}: MedicalDisclaimerProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAcknowledge = async () => {
    if (requireAcknowledgment && !acknowledged) {
      return
    }

    setIsSubmitting(true)
    const timestamp = new Date().toISOString()
    
    try {
      await onAcknowledge(timestamp)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Aviso Médico Importante
          </h1>
          <p className="text-gray-600">
            Antes de continuar con la consulta, por favor lea cuidadosamente
          </p>
        </div>

        {/* Main Disclaimer Card */}
        <Card className="border-amber-200 shadow-lg mb-6">
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-amber-600" />
              <div>
                <CardTitle className="text-amber-900">Descargo de Responsabilidad Médica</CardTitle>
                <CardDescription className="text-amber-700">
                  Este es un aviso legal requerido para su protección
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Primary Disclaimer */}
            <Alert className="border-amber-300 bg-amber-50">
              <AlertTitle className="text-amber-900 font-bold text-lg">
                IMPORTANTE
              </AlertTitle>
              <AlertDescription className="text-amber-800 text-base mt-2">
                <p className="font-semibold">
                  Esta herramienta es solo para recopilar información. NO proporciona diagnóstico médico.
                </p>
                <p className="mt-2">
                  Si tiene una emergencia, llame al 911 o vaya a urgencias inmediatamente.
                </p>
              </AlertDescription>
            </Alert>

            {/* Detailed Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Lo que esta herramienta PUEDE hacer:
              </h3>
              <ul className="space-y-2 pl-7 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Recopilar información sobre sus síntomas de manera estructurada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Organizar su información médica para el médico
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Ayudar a preparar su consulta médica
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Facilitar la comunicación con su médico
                </li>
              </ul>

              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mt-6">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Lo que esta herramienta NO PUEDE hacer:
              </h3>
              <ul className="space-y-2 pl-7 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  Diagnosticar condiciones médicas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  Reemplazar la consulta con un médico profesional
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  Prescribir medicamentos o tratamientos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  Atender emergencias médicas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  Sustituir el juicio clínico de un profesional de la salud
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Protección de Datos
              </h4>
              <p className="text-sm text-blue-800">
                Toda la información proporcionada está protegida bajo la Ley Federal de Protección de Datos 
                Personales en Posesión de los Particulares (LFPDPPP). Sus datos solo serán compartidos con 
                los médicos que usted autorice.
              </p>
            </div>

            {/* Emergency Information */}
            {showEmergencyInfo && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  En caso de emergencia
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="font-bold">Emergencias:</span>
                    <a href="tel:911" className="underline hover:text-red-900">911</a>
                  </div>
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="font-bold">Cruz Roja:</span>
                    <a href="tel:065" className="underline hover:text-red-900">065</a>
                  </div>
                </div>
                <p className="text-red-700 text-xs mt-2">
                  Si experimenta dificultad para respirar, dolor de pecho, sangrado severo, 
                  pérdida de consciencia o cualquier otra emergencia, llame inmediatamente.
                </p>
              </div>
            )}

            {/* Timestamp Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Este reconocimiento será registrado con fecha y hora para su seguridad y la nuestra.
              </span>
            </div>

            {children}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 bg-gray-50 border-t">
            {/* Acknowledgment Checkbox */}
            <div className="w-full">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <Checkbox
                  id="medical-disclaimer-ack"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-900 block">
                    Entiendo y acepto
                  </span>
                  <span className="text-xs text-gray-600 block">
                    He leído y comprendo que esta herramienta no proporciona diagnóstico médico. 
                    Entiendo que debo consultar a un profesional de la salud para cualquier diagnóstico 
                    o tratamiento. Acepto que mi reconocimiento será registrado.
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}
              <Button
                onClick={handleAcknowledge}
                disabled={requireAcknowledgment && !acknowledged}
                loading={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Continuar
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>
            Para más información, consulte nuestros{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
          </p>
          <p>
            Si tiene preguntas sobre este aviso, contacte a{' '}
            <a href="mailto:legal@doctor.mx" className="text-blue-600 hover:underline">
              legal@doctor.mx
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Medical Disclaimer for use in dialogs or sidebars
 */
export function CompactMedicalDisclaimer({
  onAcknowledge,
  onCancel,
}: Omit<MedicalDisclaimerProps, 'children' | 'showEmergencyInfo'>) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAcknowledge = async () => {
    setIsSubmitting(true)
    const timestamp = new Date().toISOString()
    
    try {
      await onAcknowledge(timestamp)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="border-amber-300 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900">Aviso Importante</AlertTitle>
        <AlertDescription className="text-amber-800">
          Esta herramienta es solo para recopilar información. NO proporciona diagnóstico médico. 
          Si tiene una emergencia, llame al 911 o vaya a urgencias inmediatamente.
        </AlertDescription>
      </Alert>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          className="mt-0.5"
        />
        <span className="text-sm text-gray-700">
          Entiendo que esta herramienta no reemplaza la consulta médica profesional.
        </span>
      </label>

      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1" size="sm">
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleAcknowledge}
          disabled={!acknowledged}
          loading={isSubmitting}
          className="flex-1"
          size="sm"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}

export default MedicalDisclaimer
