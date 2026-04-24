'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SPECIALTIES, PAYMENT_CONFIG } from '@/config/constants'
import { useToast } from '@/components/Toast'
import type { Doctor, Profile } from '@/types'
import { cn } from '@/lib/utils'
import { clearConnectDraft, getConnectDraft } from '@/lib/connect/session-draft'
import type { ConnectProfileDraft } from '@/lib/connect/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Check, Loader2, Shield, AlertCircle, CheckCircle, Stethoscope, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type OnboardingFormProps = {
  doctor: Doctor | null
  profile: Profile
}

export default function OnboardingForm({ doctor, profile }: OnboardingFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [connectDraft, setConnectDraft] = useState<ConnectProfileDraft | null>(null)
  const [connectDraftApplied, setConnectDraftApplied] = useState(false)

  // SEP Verification state
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    message: string;
    confidence?: number;
  } | null>(null)

  // Todos los campos en un solo form
  const [specialty, setSpecialty] = useState(doctor?.specialty || '')
  const [yearsExperience, setYearsExperience] = useState(doctor?.years_experience?.toString() || '')
  const [bio, setBio] = useState(doctor?.bio || '')
  const [licenseNumber, setLicenseNumber] = useState(doctor?.license_number || '')
  const [city, setCity] = useState(doctor?.city || '')
  const [state, setState] = useState(doctor?.state || '')
  const [price, setPrice] = useState(doctor?.price_cents ? (doctor.price_cents / 100).toString() : (PAYMENT_CONFIG.DEFAULT_PRICE_CENTS / 100).toString())
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([])
  const [availableInsurances, setAvailableInsurances] = useState<{id: string; name: string; type: string}[]>([])

  // Load insurances on mount
  useState(() => {
    fetch('/api/insurances')
      .then(res => res.json())
      .then(data => {
        if (data.insurances) setAvailableInsurances(data.insurances)
      })
      .catch(() => {})
  })

  const [availability, setAvailability] = useState({
    monday: { enabled: false, start: '09:00', end: '17:00' },
    tuesday: { enabled: false, start: '09:00', end: '17:00' },
    wednesday: { enabled: false, start: '09:00', end: '17:00' },
    thursday: { enabled: false, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' },
  })

  const isComplete = yearsExperience && bio && licenseNumber && price
  const isVerified = doctor?.status === 'approved'
  const hasAvailability = Object.values(availability).some((config) => config.enabled)

  useEffect(() => {
    if (connectDraftApplied) return

    const draft = getConnectDraft()
    if (!draft) {
      setConnectDraftApplied(true)
      return
    }

    const fieldValue = (key: string) => draft.fields.find((field) => field.key === key)?.value || ''
    const suggestedSpecialty = fieldValue('specialty')
    const suggestedBio = fieldValue('bio')
    const suggestedCedula = fieldValue('cedula')

    setConnectDraft(draft)

    if (!bio && suggestedBio) {
      setBio(suggestedBio.slice(0, 500))
    }

    if (!licenseNumber && suggestedCedula) {
      setLicenseNumber(suggestedCedula)
    }

    if (!city && draft.practice.city) {
      setCity(draft.practice.city)
    }

    if (!state && draft.practice.state) {
      setState(draft.practice.state)
    }

    if (!specialty && suggestedSpecialty) {
      const matchingSpec = SPECIALTIES.find((spec) =>
        spec.name.toLowerCase().includes(suggestedSpecialty.toLowerCase())
          || suggestedSpecialty.toLowerCase().includes(spec.name.toLowerCase())
      )
      if (matchingSpec) {
        setSpecialty(matchingSpec.slug)
      }
    }

    setConnectDraftApplied(true)
  }, [bio, city, connectDraftApplied, licenseNumber, specialty, state])

  // SEP Verification handler
  const handleVerifyCedula = useCallback(async () => {
    if (!licenseNumber || licenseNumber.length < 7) {
      setVerificationStatus({
        verified: false,
        message: 'Ingresa una cédula válida (mínimo 7 dígitos)'
      })
      return
    }

    setVerifying(true)
    setVerificationStatus(null)

    try {
      const res = await fetch('/api/doctor/verify-cedula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: licenseNumber,
          fullName: profile?.full_name
        })
      })

      const data = await res.json()

      if (data.success && data.verification) {
        setVerificationStatus({
          verified: data.verification.verified,
          message: data.verification.message,
          confidence: data.verification.confidence
        })

        // Auto-fill data if verified
        if (data.verification.verified && data.autoFillData) {
          if (data.autoFillData.yearsExperience && !yearsExperience) {
            setYearsExperience(data.autoFillData.yearsExperience.toString())
          }
          if (data.autoFillData.specialty && !specialty) {
            const matchingSpec = SPECIALTIES.find(
              s => s.name.toLowerCase().includes(data.autoFillData.specialty.toLowerCase())
            )
            if (matchingSpec) setSpecialty(matchingSpec.slug)
          }
        }
      } else {
        setVerificationStatus({
          verified: false,
          message: data.error || 'Error al verificar'
        })
      }
    } catch {
      setVerificationStatus({
        verified: false,
        message: 'Error de conexión al verificar'
      })
    } finally {
      setVerifying(false)
    }
  }, [licenseNumber, profile?.full_name, yearsExperience, specialty])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return

    if (!hasAvailability) {
      setSubmitError('Configura al menos un día de disponibilidad para poder publicar tu perfil y recibir pacientes.')
      return
    }

    setSubmitError('')
    setSubmitMessage('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/doctor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // specialty, // Temporalmente comentado por cache de Supabase
          yearsExperience: parseInt(yearsExperience),
          bio,
          licenseNumber,
          // city, // Temporalmente comentado por cache de Supabase
          // state, // Temporalmente comentado por cache de Supabase
          availability,
          priceCents: Math.round(parseFloat(price) * 100),
        }),
      })

      if (res.ok) {
        clearConnectDraft()
        addToast('Perfil guardado correctamente.', 'success')
        setSubmitMessage(isVerified
          ? 'Tus cambios se guardaron y tu perfil sigue publicado.'
          : 'Tu perfil quedó guardado. Revisaremos tu información antes de activarlo.')
        router.push('/doctor')
        router.refresh()
      } else {
        const data = await res.json()
        setSubmitError(data.error || 'No pudimos guardar tu perfil. Revisa los campos e intenta nuevamente.')
        setSubmitting(false)
      }
    } catch {
      setSubmitError('Ocurrió un problema de conexión al guardar tu perfil. Intenta nuevamente en unos segundos.')
      setSubmitting(false)
    }
  }

  const dayNames: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  }

  const stateOptions = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'CDMX', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero',
    'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
    'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ]

  const cityByState: Record<string, string[]> = {
    'CDMX': ['Álvaro Obregón', 'Azcapotzalco', 'Benito Juárez', 'Coyoacán', 'Cuajimalpa',
      'Cuauhtémoc', 'Gustavo A. Madero', 'Iztacalco', 'Iztapalapa', 'Magdalena Contreras',
      'Miguel Hidalgo', 'Milpa Alta', 'Tláhuac', 'Tlalpan', 'Venustiano Carranza', 'Xochimilco'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco', 'Puerto Vallarta'],
    'Nuevo León': ['Monterrey', 'San Pedro Garza García', 'Guadalupe', 'San Nicolás de los Garza', 'Apodaca', 'Santa Catarina'],
    'Puebla': ['Puebla', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Cholula'],
    'Querétaro': ['Querétaro', 'San Juan del Río', 'Corregidora', 'El Marqués'],
    'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato', 'San Miguel de Allende'],
    'Yucatán': ['Mérida', 'Valladolid', 'Progreso', 'Tizimín'],
    'Quintana Roo': ['Cancún', 'Playa del Carmen', 'Chetumal', 'Cozumel', 'Tulum'],
    'Veracruz': ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Poza Rica', 'Córdoba', 'Boca del Río'],
    'Chihuahua': ['Chihuahua', 'Ciudad Juárez', 'Delicias', 'Cuauhtémoc'],
    'Baja California': ['Tijuana', 'Mexicali', 'Ensenada', 'Tecate', 'Rosarito'],
    'México': ['Ecatepec', 'Nezahualcóyotl', 'Naucalpan', 'Toluca', 'Tlalnepantla', 'Atizapán'],
    'Sonora': ['Hermosillo', 'Cajeme', 'Nogales', 'San Luis Río Colorado'],
    'Coahuila': ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras'],
    'Tamaulipas': ['Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Victoria'],
  }

  const availableCities = state ? (cityByState[state] || [state]) : []

  const steps = [
    { num: 1, label: 'Profesional' },
    { num: 2, label: 'Ubicación' },
    { num: 3, label: 'Disponibilidad' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-nav sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-cobalt-600 to-cobalt-800 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Doctor.mx</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground hidden sm:inline">Dr. {profile?.full_name}</span>
            <Badge variant={isVerified ? 'default' : 'secondary'} className={isVerified ? 'bg-vital text-white' : ''}>
              {isVerified ? 'Verificado' : 'En revisión'}
            </Badge>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Onboarding
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          {isComplete ? 'Mi perfil profesional' : 'Completa tu perfil'}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-lg">
          {isVerified
            ? 'Tu perfil está verificado y publicado en el catálogo'
            : isComplete
              ? 'Tu perfil está en revisión. Puedes actualizarlo mientras tanto.'
              : 'Completa tu información para comenzar a recibir pacientes'
          }
        </p>

        {connectDraft && (
        <section className="mb-6 rounded-[12px] border border-primary/20 bg-primary/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    Borrador importado desde Doctor Connect
                  </h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Usamos datos sugeridos para acelerar el alta de {connectDraft.practice.name}. Confirma cada campo antes de guardar; cédula y credenciales no se verifican por IA.
                </p>
              </div>
              <Badge variant="info">Sugerido por IA</Badge>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {connectDraft.fields
                .filter((field) => field.status === 'suggested' || field.status === 'missing')
                .slice(0, 6)
                .map((field) => (
                  <div key={field.key} className="rounded-[8px] border border-border bg-card px-3 py-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{field.label}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{field.value || 'Pendiente'}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Progress pills */}
        <div className="mb-8 flex gap-2">
          {[
            { label: 'Cédula y perfil', done: Boolean(licenseNumber && bio) },
            { label: 'Disponibilidad', done: hasAvailability },
            { label: 'Precio', done: Boolean(price) },
          ].map((p, i) => (
            <div
              key={i}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                p.done
                  ? 'bg-vital-soft border-vital/20 text-vital'
                  : 'bg-secondary/50 border-border text-muted-foreground'
              )}
            >
              {p.done && <Check className="w-3 h-3 inline mr-1" />}
              {p.label}
            </div>
          ))}
        </div>

        {submitError && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {submitMessage && (
          <div className="mb-6 rounded-xl border border-vital/20 bg-vital-soft p-4 text-sm text-vital">
            {submitMessage}
          </div>
        )}

        {/* Stepper */}
        <div className="mb-8 flex items-center">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => currentStep > step.num && setCurrentStep(step.num)}
                className={cn(
                  'flex flex-col items-center flex-1 group cursor-default',
                  currentStep > step.num && 'cursor-pointer'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-[8px] border text-sm font-semibold transition-all duration-300',
                  currentStep === step.num
                    ? 'bg-ink text-white border-ink'
                    : currentStep > step.num
                      ? 'bg-vital text-white border-vital'
                      : 'bg-background text-muted-foreground border-border'
                )}>
                  {currentStep > step.num ? <Check className="h-4 w-4" /> : step.num}
                </div>
                <span className={cn(
                  'text-[11px] mt-2 font-medium hidden sm:block transition-colors',
                  currentStep === step.num ? 'text-foreground' :
                  currentStep > step.num ? 'text-vital' :
                  'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              </button>
              {idx < 2 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 sm:mx-4 mb-5 transition-colors duration-300',
                  currentStep > step.num ? 'bg-vital' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Professional Info */}
          {currentStep === 1 && (
            <Card className="overflow-hidden rounded-[12px] border border-border shadow-[var(--card-shadow)]">
              <CardHeader className="border-b border-border bg-secondary/30 px-5 py-4">
                <CardTitle className="font-display text-lg font-semibold text-foreground">
                  Información profesional
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Datos que aparecerán en tu perfil público
                </p>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Especialidad *</Label>
                    <Select value={specialty} onValueChange={setSpecialty} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((spec) => (
                          <SelectItem key={spec.slug} value={spec.slug}>
                            {spec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Años de experiencia *</Label>
                    <Input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      min="0"
                      max="50"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Cédula profesional *
                      <span className="text-xs text-muted-foreground font-normal ml-2">
                        Verificamos con la SEP
                      </span>
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => {
                          setLicenseNumber(e.target.value)
                          setVerificationStatus(null)
                        }}
                        required
                        placeholder="Ej: 12345678"
                        className={cn(
                          'flex-1',
                          verificationStatus?.verified
                            ? 'border-vital bg-vital-soft'
                            : verificationStatus && !verificationStatus.verified
                              ? 'border-destructive/50 bg-destructive/5'
                              : ''
                        )}
                      />
                      {verificationStatus?.verified && (
                        <Badge variant="success">Verificado</Badge>
                      )}
                      {verificationStatus && !verificationStatus.verified && (
                        <Badge variant="destructive">Pendiente</Badge>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVerifyCedula}
                        disabled={verifying || !licenseNumber}
                        className="whitespace-nowrap"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Verificar SEP
                          </>
                        )}
                      </Button>
                    </div>
                    {verificationStatus && (
                      <div className={cn(
                        'mt-2 p-3 rounded-xl text-sm border',
                        verificationStatus.verified
                          ? 'bg-vital-soft text-vital border-vital/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      )}>
                        <div className="flex items-start gap-2">
                          {verificationStatus.verified ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">
                              {verificationStatus.verified ? 'Cédula verificada' : 'Verificación pendiente'}
                            </p>
                            <p className="text-xs mt-0.5 opacity-90">{verificationStatus.message}</p>
                            {verificationStatus.confidence && (
                              <p className="text-xs mt-1 opacity-75">
                                Confianza: {verificationStatus.confidence}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-foreground">Biografía profesional *</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      required
                      maxLength={500}
                      placeholder="Describe tu experiencia y enfoque profesional..."
                    />
                    <p className="text-xs text-muted-foreground">{bio.length}/500</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="h-10 rounded-[8px] bg-ink px-5 text-white hover:bg-ink"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location & Insurance */}
          {currentStep === 2 && (
            <Card className="overflow-hidden rounded-[12px] border border-border shadow-[var(--card-shadow)]">
              <CardHeader className="border-b border-border bg-secondary/30 px-5 py-4">
                <CardTitle className="font-display text-lg font-semibold text-foreground">
                  Ubicación y seguros
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ayuda a los pacientes a encontrarte
                </p>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Estado *</Label>
                    <Select value={state} onValueChange={(val) => { setState(val); setCity(''); }} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Ciudad *</Label>
                    <Select value={city} onValueChange={setCity} required disabled={!state}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={state ? 'Selecciona una ciudad' : 'Primero selecciona un estado'} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Seguros médicos aceptados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los seguros con los que trabajas. Esto ayudará a los pacientes asegurados a encontrarte.
                  </p>
                  {availableInsurances.length > 0 ? (
                    <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-[10px] bg-secondary/50 p-3 md:grid-cols-3">
                      {availableInsurances.map((insurance) => (
                        <div key={insurance.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/70">
                          <Checkbox
                            id={`insurance-${insurance.id}`}
                            checked={selectedInsurances.includes(insurance.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedInsurances([...selectedInsurances, insurance.id])
                              } else {
                                setSelectedInsurances(selectedInsurances.filter(id => id !== insurance.id))
                              }
                            }}
                          />
                          <Label htmlFor={`insurance-${insurance.id}`} className="text-sm text-foreground cursor-pointer">
                            {insurance.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Cargando seguros...</p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="h-10 rounded-[8px] px-5">
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="h-10 rounded-[8px] bg-ink px-5 text-white hover:bg-ink"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Availability & Pricing */}
          {currentStep === 3 && (
            <Card className="overflow-hidden rounded-[12px] border border-border shadow-[var(--card-shadow)]">
              <CardHeader className="border-b border-border bg-secondary/30 px-5 py-4">
                <CardTitle className="font-display text-lg font-semibold text-foreground">
                  Disponibilidad y precio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configura cuándo y a qué precio te pueden reservar
                </p>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Horarios disponibles
                  </h3>
                  {Object.entries(availability).map(([day, config]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 rounded-[10px] border border-border bg-card p-3 transition-colors hover:bg-secondary/30"
                    >
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) =>
                          setAvailability({
                            ...availability,
                            [day]: { ...config, enabled: checked },
                          })
                        }
                      />
                      <span className="w-24 font-medium text-foreground">
                        {dayNames[day]}
                      </span>
                      {config.enabled && (
                        <>
                          <Input
                            type="time"
                            value={config.start}
                            onChange={(e) =>
                              setAvailability({
                                ...availability,
                                [day]: { ...config, start: e.target.value },
                              })
                            }
                            className="w-28"
                          />
                          <span className="text-foreground font-medium">a</span>
                          <Input
                            type="time"
                            value={config.end}
                            onChange={(e) =>
                              setAvailability({
                                ...availability,
                                [day]: { ...config, end: e.target.value },
                              })
                            }
                            className="w-28"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Precio de consulta
                  </h3>
                  <div className="space-y-2 rounded-[10px] bg-secondary/50 p-3">
                    <h4 className="font-medium text-foreground text-sm">Precios de referencia</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Medicina General: $300 - $500 MXN</li>
                      <li>• Especialistas: $500 - $1,000 MXN</li>
                      <li>• Psicología/Nutrición: $400 - $800 MXN</li>
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      Rango: ${PAYMENT_CONFIG.MIN_PRICE_CENTS / 100} - ${PAYMENT_CONFIG.MAX_PRICE_CENTS / 100} MXN
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Precio por consulta *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">$</span>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min={PAYMENT_CONFIG.MIN_PRICE_CENTS / 100}
                        max={PAYMENT_CONFIG.MAX_PRICE_CENTS / 100}
                        step="50"
                        required
                        className="flex-1"
                      />
                      <span className="text-foreground">{PAYMENT_CONFIG.CURRENCY}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Puedes cambiar tu precio en cualquier momento
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    {!isComplete && <span>* Completa todos los campos requeridos</span>}
                    {isComplete && !hasAvailability && (
                      <span className="text-amber-700">
                        Activa al menos un horario para que los pacientes puedan reservar contigo.
                      </span>
                    )}
                    {isComplete && !isVerified && (
                      <span className="text-amber-700">
                        Tu perfil está en revisión. Serás notificado cuando sea verificado.
                      </span>
                    )}
                    {isVerified && (
                      <span className="text-vital">
                        Perfil verificado y publicado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="h-10 rounded-[8px] px-5">
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isComplete || !hasAvailability || submitting}
                      className="h-10 rounded-[8px] bg-ink px-6 font-medium text-white hover:bg-ink"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          Guardar perfil
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
              </CardContent>
            </Card>
          )}
        </form>
      </main>
    </div>
  )
}
