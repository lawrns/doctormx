/**
 * Guardian Consent Form Component
 *
 * Form for parental/guardian consent when user is a minor.
 * Required for compliance with LFPDPPP when handling minors' data.
 *
 * @component GuardianConsentForm
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, UserPlus, FileText } from 'lucide-react'
import type { ConsentType } from '@/lib/consent/client'
import { validateRFC } from '@/lib/validation'

interface GuardianConsentFormProps {
  minorUserId: string
  minorName?: string | null
  onSubmit: (data: GuardianConsentData) => Promise<void>
  loading?: boolean
}

export interface GuardianConsentData {
  guardian_full_name: string
  guardian_rfc: string
  guardian_relationship: 'father' | 'mother' | 'legal_guardian' | 'other'
  guardian_phone: string
  guardian_email: string
  consent_types: ConsentType[]
  minor_date_of_birth: string
  accepts_legal_responsibility: boolean
  signature: string // Digital signature representation
}

const RELATIONSHIP_OPTIONS = [
  { value: 'father', label: 'Padre' },
  { value: 'mother', label: 'Madre' },
  { value: 'legal_guardian', label: 'Tutor Legal' },
  { value: 'other', label: 'Otro Familiar' },
] as const

const CONSENT_TYPE_LABELS: Record<string, string> = {
  marketing_emails: 'Correos promocionales',
  marketing_sms: 'Mensajes SMS',
  analytics_consent: 'Analíticas de uso',
  personalization_consent: 'Personalización',
  research_consent: 'Investigación',
  ai_training_consent: 'Entrenamiento de IA',
  share_with_insurance: 'Compartir con aseguradora',
  share_with_pharmacies: 'Compartir con farmacias',
}

export function GuardianConsentForm({
  minorUserId,
  minorName,
  onSubmit,
  loading = false,
}: GuardianConsentFormProps) {
  const [formData, setFormData] = useState<GuardianConsentData>({
    guardian_full_name: '',
    guardian_rfc: '',
    guardian_relationship: 'father',
    guardian_phone: '',
    guardian_email: '',
    consent_types: [],
    minor_date_of_birth: '',
    accepts_legal_responsibility: false,
    signature: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedConsents, setSelectedConsents] = useState<Set<ConsentType>>(new Set())

  const handleConsentToggle = (consentType: ConsentType) => {
    setSelectedConsents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(consentType)) {
        newSet.delete(consentType)
      } else {
        newSet.add(consentType)
      }
      return newSet
    })

    setFormData((prev) => ({
      ...prev,
      consent_types: Array.from(
        selectedConsents.has(consentType)
          ? [...prev.consent_types.filter((c) => c !== consentType)]
          : [...prev.consent_types, consentType]
      ),
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Guardian name validation
    if (!formData.guardian_full_name.trim()) {
      newErrors.guardian_full_name = 'El nombre completo del tutor es requerido'
    } else if (formData.guardian_full_name.trim().length < 5) {
      newErrors.guardian_full_name = 'El nombre debe tener al menos 5 caracteres'
    }

    // RFC validation (using centralized validator)
    if (!formData.guardian_rfc.trim()) {
      newErrors.guardian_rfc = 'El RFC del tutor es requerido'
    } else {
      const rfcResult = validateRFC(formData.guardian_rfc.trim())
      if (!rfcResult.isValid) {
        newErrors.guardian_rfc = rfcResult.error ?? 'Formato de RFC inválido (ejemplo: XAXX000000XXX)'
      }
    }

    // Phone validation
    if (!formData.guardian_phone.trim()) {
      newErrors.guardian_phone = 'El teléfono es requerido'
    } else if (!/^\d{10}$/.test(formData.guardian_phone.trim())) {
      newErrors.guardian_phone = 'Formato de teléfono inválido (10 dígitos)'
    }

    // Email validation
    if (!formData.guardian_email.trim()) {
      newErrors.guardian_email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardian_email.trim())) {
      newErrors.guardian_email = 'Formato de correo inválido'
    }

    // At least one consent type
    if (formData.consent_types.length === 0) {
      newErrors.consent_types = 'Seleccione al menos un tipo de consentimiento'
    }

    // Legal responsibility acceptance
    if (!formData.accepts_legal_responsibility) {
      newErrors.accepts_legal_responsibility = 'Debe aceptar la responsabilidad legal'
    }

    // Date of birth validation
    if (!formData.minor_date_of_birth) {
      newErrors.minor_date_of_birth = 'La fecha de nacimiento es requerida'
    } else {
      const dob = new Date(formData.minor_date_of_birth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      if (age >= 18) {
        newErrors.minor_date_of_birth = 'El usuario debe ser menor de 18 años'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        ...formData,
        consent_types: Array.from(selectedConsents),
      })
    } catch (error) {
      setErrors({ _submit: (error as Error).message })
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Consentimiento de Tutor</CardTitle>
            <CardDescription>
              {minorName
                ? `Registro de consentimiento para menor: ${minorName}`
                : 'Registro de consentimiento para menor de edad'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Legal Notice */}
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-sm text-amber-800">
              <strong>IMPORTANTE:</strong> De acuerdo con la LFPDPPP, se requiere
              consentimiento expreso del padre, madre o tutor legal para el procesamiento de
              datos personales de menores de 18 años. Al proporcionar este consentimiento,
              usted declara que tiene la autoridad legal para otorgarlo.
            </AlertDescription>
          </Alert>

          {/* Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Tutor</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardian_name">Nombre Completo *</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_full_name}
                  onChange={(e) => setFormData({ ...formData, guardian_full_name: e.target.value })}
                  placeholder="Ejemplo: Juan Pérez López"
                  disabled={loading}
                  className={errors.guardian_full_name ? 'border-red-500' : ''}
                />
                {errors.guardian_full_name && (
                  <p className="text-sm text-red-600">{errors.guardian_full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_rfc">RFC del Tutor *</Label>
                <Input
                  id="guardian_rfc"
                  value={formData.guardian_rfc}
                  onChange={(e) => setFormData({ ...formData, guardian_rfc: e.target.value.toUpperCase() })}
                  placeholder="XAXX000000XXX"
                  maxLength={13}
                  disabled={loading}
                  className={errors.guardian_rfc ? 'border-red-500' : ''}
                />
                {errors.guardian_rfc && (
                  <p className="text-sm text-red-600">{errors.guardian_rfc}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Parentesco *</Label>
                <Select
                  value={formData.guardian_relationship}
                  onValueChange={(value) =>
                    setFormData({ ...formData, guardian_relationship: value as GuardianConsentData['guardian_relationship'] })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione parentesco" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_phone">Teléfono *</Label>
                <Input
                  id="guardian_phone"
                  type="tel"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  placeholder="5512345678"
                  maxLength={10}
                  disabled={loading}
                  className={errors.guardian_phone ? 'border-red-500' : ''}
                />
                {errors.guardian_phone && (
                  <p className="text-sm text-red-600">{errors.guardian_phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardian_email">Correo Electrónico *</Label>
              <Input
                id="guardian_email"
                type="email"
                value={formData.guardian_email}
                onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                placeholder="tutor@ejemplo.com"
                disabled={loading}
                className={errors.guardian_email ? 'border-red-500' : ''}
              />
              {errors.guardian_email && (
                <p className="text-sm text-red-600">{errors.guardian_email}</p>
                )}
            </div>
          </div>

          {/* Minor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Menor</h3>

            <div className="space-y-2">
              <Label htmlFor="dob">Fecha de Nacimiento *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.minor_date_of_birth}
                onChange={(e) => setFormData({ ...formData, minor_date_of_birth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className={errors.minor_date_of_birth ? 'border-red-500' : ''}
              />
              {errors.minor_date_of_birth && (
                <p className="text-sm text-red-600">{errors.minor_date_of_birth}</p>
              )}
              <p className="text-sm text-gray-600">
                El usuario debe ser menor de 18 años para requerir consentimiento de tutor.
              </p>
            </div>
          </div>

          {/* Consent Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tipos de Consentimiento a Otorgar
            </h3>
            <p className="text-sm text-gray-600">
              Seleccione todos los tipos de consentimiento para los cuales autoriza al menor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(CONSENT_TYPE_LABELS).map(([value, label]) => {
                const isSelected = selectedConsents.has(value as ConsentType)
                return (
                  <div key={value} className="flex items-start space-x-2 p-3 border rounded-md hover:bg-gray-50">
                    <Checkbox
                      id={`consent_${value}`}
                      checked={isSelected}
                      onCheckedChange={() => handleConsentToggle(value as ConsentType)}
                      disabled={loading}
                    />
                    <Label
                      htmlFor={`consent_${value}`}
                      className="text-sm cursor-pointer normal-case"
                    >
                      {label}
                    </Label>
                  </div>
                )
              })}
            </div>
            {errors.consent_types && (
              <p className="text-sm text-red-600">{errors.consent_types}</p>
            )}
          </div>

          {/* Legal Responsibility Acceptance */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 border rounded-md bg-gray-50">
              <Checkbox
                id="legal_responsibility"
                checked={formData.accepts_legal_responsibility}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, accepts_legal_responsibility: checked === true })
                }
                disabled={loading}
              />
              <Label
                htmlFor="legal_responsibility"
                className="text-sm cursor-pointer leading-relaxed"
              >
                Declaro bajo protesta que tengo la autoridad legal para otorgar
                consentimiento en nombre del menor y que entiendo mi responsabilidad
                legal como tutor. Entiendo que este consentimiento permanecerá vigente
                hasta que yo lo revoque o el menor alcance la mayoría de edad (18 años).
              </Label>
            </div>
            {errors.accepts_legal_responsibility && (
              <p className="text-sm text-red-600 ml-6">
                {errors.accepts_legal_responsibility}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors._submit && (
            <Alert variant="destructive">
              <AlertDescription>Error al enviar: {errors._submit}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Procesando...' : 'Registrar Consentimiento'}
            </Button>
          </div>

          {/* Data Protection Notice */}
          <Alert variant="default" className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Protección de Datos:</strong> La información proporcionada será
              procesada conforme a la LFPDPPP. Puede acceder, rectificar o cancelar
              estos datos en cualquier momento. Para más información, contacte a
              privacidad@doctormx.com
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  )
}
