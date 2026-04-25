'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SPECIALTIES, PAYMENT_CONFIG } from '@/config/constants'
import { useToast } from '@/components/Toast'
import type { Doctor, Profile } from '@/types'
import { cn, captureError } from '@/lib/utils'
import { clearConnectDraft, getConnectDraft } from '@/lib/connect/session-draft'
import type { ConnectProfileDraft } from '@/lib/connect/types'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-types'
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
import { Check, Loader2, Shield, AlertCircle, CheckCircle, Stethoscope, ArrowRight, ArrowLeft, Upload, Star } from 'lucide-react'
import Link from 'next/link'

type OnboardingFormProps = {
  doctor: Doctor | null
  profile: Profile
}

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'pt', name: 'Portugués' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
]

export default function OnboardingForm({ doctor, profile }: OnboardingFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [connectDraft, setConnectDraft] = useState<ConnectProfileDraft | null>(null)
  const [connectDraftApplied, setConnectDraftApplied] = useState(false)

  // SEP Verification
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean
    message: string
    confidence?: number
  } | null>(null)

  // Step 1: Professional info
  const [specialty, setSpecialty] = useState(doctor?.specialty || '')
  const [licenseNumber, setLicenseNumber] = useState(doctor?.license_number || '')
  const [yearsExperience, setYearsExperience] = useState(doctor?.years_experience?.toString() || '')

  // Step 2: Public profile
  const [photoUrl, setPhotoUrl] = useState(doctor?.profile?.photo_url || profile?.photo_url || '')
  const [bio, setBio] = useState(doctor?.bio || '')
  const [price, setPrice] = useState(doctor?.price_cents ? (doctor.price_cents / 100).toString() : (PAYMENT_CONFIG.DEFAULT_PRICE_CENTS / 100).toString())
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(doctor?.languages || ['es'])

  // Step 3: Availability
  const [availability, setAvailability] = useState({
    monday: { enabled: false, start: '09:00', end: '17:00' },
    tuesday: { enabled: false, start: '09:00', end: '17:00' },
    wednesday: { enabled: false, start: '09:00', end: '17:00' },
    thursday: { enabled: false, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' },
  })

  const isVerified = doctor?.status === 'approved'
  const hasAvailability = Object.values(availability).some((config) => config.enabled)

  // Per-step validation
  const step1Complete = specialty && licenseNumber && yearsExperience
  const step2Complete = bio && price
  const isComplete = step1Complete && step2Complete && hasAvailability

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
  }, [bio, connectDraftApplied, licenseNumber, specialty])

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

  // Auto-save each step to Supabase
  const autoSave = useCallback(async (stepData: Record<string, unknown>) => {
    try {
      await fetch('/api/doctor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData),
      })
    } catch {
      captureError('autoSave', 'OnboardingForm')
    }
  }, [])

  const goNext = useCallback(async (toStep: number) => {
    setCurrentStep(toStep)
    if (toStep === 2 && step1Complete) {
      await autoSave({
        yearsExperience: parseInt(yearsExperience),
        licenseNumber,
        priceCents: Math.round(parseFloat(price) * 100),
        bio,
      })
    }
    if (toStep === 3 && step1Complete && step2Complete) {
      await autoSave({
        yearsExperience: parseInt(yearsExperience),
        licenseNumber,
        bio,
        priceCents: Math.round(parseFloat(price) * 100),
        languages: selectedLanguages,
        photoUrl,
      })
    }
  }, [autoSave, yearsExperience, licenseNumber, price, bio, step1Complete, step2Complete, selectedLanguages, photoUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return

    if (!hasAvailability) {
      setSubmitError('Configura al menos un día de disponibilidad para poder publicar tu perfil y recibir pacientes.')
      return
    }

    setSubmitError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/doctor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearsExperience: parseInt(yearsExperience),
          bio,
          licenseNumber,
          availability,
          priceCents: Math.round(parseFloat(price) * 100),
          languages: selectedLanguages,
          photoUrl,
        }),
      })

      if (res.ok) {
        clearConnectDraft()
        addToast('¡Bienvenido! Tienes 14 días de prueba gratuita. Sin tarjeta requerida.', 'success', 8000)
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

  const steps = [
    { num: 1, label: 'Información profesional' },
    { num: 2, label: 'Tu perfil público' },
    { num: 3, label: 'Disponibilidad y activación' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="nav-sticky sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
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
            Onboarding · Paso {currentStep} de 3
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          {currentStep === 1 && 'Información profesional'}
          {currentStep === 2 && 'Tu perfil público'}
          {currentStep === 3 && 'Disponibilidad y activación'}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-lg">
          {currentStep === 1 && 'Datos que verificaremos con la SEP para validar tu identidad profesional.'}
          {currentStep === 2 && 'Así te verán los pacientes cuando busquen un doctor.'}
          {currentStep === 3 && 'Define cuándo pueden agendarte y comienza tu prueba gratuita de 14 días.'}
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
                  Usamos datos sugeridos para acelerar el alta de {connectDraft.practice.name}. Confirma cada campo antes de guardar.
                </p>
              </div>
              <Badge variant="info">Sugerido por IA</Badge>
            </div>
          </section>
        )}

        {/* Progress pills */}
        <div className="mb-8 flex gap-2">
          {[
            { label: 'Cédula y perfil', done: Boolean(licenseNumber && bio) },
            { label: 'Disponibilidad', done: hasAvailability },
            { label: 'Precio', done: Boolean(price) },
            { label: 'Prueba gratis', done: true },
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

        {/* Stepper */}
        <div className="mb-8 flex items-center">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => currentStep > step.num && setCurrentStep(step.num)}
                className={cn(
                  'flex flex-col items-center flex-1 group',
                  currentStep > step.num ? 'cursor-pointer' : 'cursor-default'
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
                  'text-[11px] mt-2 font-medium transition-colors',
                  currentStep >= step.num ? 'sm:block' : 'sm:block',
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
                  Datos que verificaremos con la SEP
                </p>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
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

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => goNext(2)}
                    disabled={!step1Complete}
                    className="h-10 rounded-[8px] bg-ink px-5 text-white hover:bg-ink"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Public Profile */}
          {currentStep === 2 && (
            <Card className="overflow-hidden rounded-[12px] border border-border shadow-[var(--card-shadow)]">
              <CardHeader className="border-b border-border bg-secondary/30 px-5 py-4">
                <CardTitle className="font-display text-lg font-semibold text-foreground">
                  Tu perfil público
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Así te verán los pacientes cuando busquen un doctor
                </p>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                {/* Photo upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Foto de perfil</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Input
                        type="url"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://... URL de tu foto"
                        className="w-64"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Pega la URL de tu foto. Pronto podrás subirla directamente.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Biografía profesional *</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    required
                    maxLength={500}
                    placeholder="Describe tu experiencia y enfoque profesional..."
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/500</p>
                </div>

                <Separator />

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
                      Precio predefinido: $500 MXN. Puedes cambiarlo después.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Idiomas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los idiomas en los que puedes atender pacientes
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang.code} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50">
                        <Checkbox
                          id={`lang-${lang.code}`}
                          checked={selectedLanguages.includes(lang.code)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLanguages([...selectedLanguages, lang.code])
                            } else {
                              setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code))
                            }
                          }}
                        />
                        <Label htmlFor={`lang-${lang.code}`} className="text-sm text-foreground cursor-pointer">
                          {lang.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="h-10 rounded-[8px] px-5">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={() => goNext(3)}
                    disabled={!step2Complete}
                    className="h-10 rounded-[8px] bg-ink px-5 text-white hover:bg-ink"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Availability & Activation */}
          {currentStep === 3 && (
            <Card className="overflow-hidden rounded-[12px] border border-border shadow-[var(--card-shadow)]">
              <CardHeader className="border-b border-border bg-secondary/30 px-5 py-4">
                <CardTitle className="font-display text-lg font-semibold text-foreground">
                  Disponibilidad y activación
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configura cuándo pueden agendarte y comienza tu prueba gratuita
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

                <Separator />

                {/* Subscription plan preview */}
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Plan de suscripción
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No necesitas tarjeta. Comienza con 14 días gratis en el plan Starter.
                    Activa tu plan cuando quieras desde la página de suscripción.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {(['starter', 'pro', 'elite'] as const).map((tier) => {
                      const plan = SUBSCRIPTION_PLANS[tier]
                      return (
                        <div
                          key={tier}
                          className={cn(
                            'rounded-xl border p-4 text-center',
                            tier === 'starter'
                              ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
                              : 'border-border bg-card'
                          )}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {tier === 'starter' && <Star className="w-4 h-4 text-primary" />}
                            <span className="font-semibold text-foreground text-sm">{plan.name_es}</span>
                          </div>
                          <p className="text-2xl font-bold text-foreground mb-1">${plan.price_mxn.toLocaleString('es-MX')}</p>
                          <p className="text-xs text-muted-foreground">/mes</p>
                          {tier === 'starter' && (
                            <Badge variant="success" className="mt-2">Comienzas aquí</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puedes cambiar de plan en cualquier momento desde{' '}
                    <Link href="/doctor/subscription" className="text-primary underline">Mi Suscripción</Link>
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  {!isComplete && <span className="text-sm text-muted-foreground">* Completa todos los campos requeridos</span>}
                  {isComplete && !hasAvailability && (
                    <span className="text-amber-700 text-sm">
                      Activa al menos un horario para que los pacientes puedan reservar contigo.
                    </span>
                  )}
                  {isVerified && (
                    <span className="text-vital text-sm">
                      Perfil verificado y publicado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="h-10 rounded-[8px] px-5">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isComplete || submitting}
                    className="h-10 rounded-[8px] bg-ink px-6 font-medium text-white hover:bg-ink"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        Comenzar prueba gratis
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
