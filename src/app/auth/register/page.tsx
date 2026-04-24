'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { IconBadge } from '@/components/ui/icon-badge'
import { ReferralShareCard } from '@/components/referrals'
import { ANALYTICS_EVENTS, trackClientEvent } from '@/lib/analytics/posthog'
import type { ReferralSummary } from '@/lib/domains/patient-referrals'
import { getConnectDraft } from '@/lib/connect/session-draft'
import type { ConnectProfileDraft } from '@/lib/connect/types'
import { formatCurrency } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  Heart,
  Shield,
  AlertCircle,
  Loader2,
} from 'lucide-react'

function calculatePasswordStrength(password: string): { strength: number; label: string; color: string; textColor: string } {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 15
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15

  if (strength < 40) return { strength, label: 'Débil', color: 'bg-destructive', textColor: 'text-destructive' }
  if (strength < 70) return { strength, label: 'Media', color: 'bg-amber', textColor: 'text-amber' }
  return { strength, label: 'Fuerte', color: 'bg-vital', textColor: 'text-vital' }
}

const step1Schema = z.object({
  accountType: z.enum(['patient', 'doctor']),
})

const step2Schema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

const step3DoctorSchema = z.object({
  licenseNumber: z.string().optional(),
  specialties: z.array(z.string()).min(1, 'Selecciona al menos una especialidad'),
})

const step3PatientSchema = z.object({
  hasMedicalHistory: z.boolean(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3DoctorData = z.infer<typeof step3DoctorSchema>
type Step3PatientData = z.infer<typeof step3PatientSchema>

const specialties = [
  'Medicina General',
  'Pediatría',
  'Cardiología',
  'Dermatología',
  'Ginecología',
  'Psiquiatría',
  'Oftalmología',
  'Traumatología',
]

function RegisterContent() {
  const searchParams = useSearchParams()
  const isConnectFlow = searchParams.get('connect') === '1'
  const [currentStep, setCurrentStep] = useState(isConnectFlow ? 2 : 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const initialAccountType = searchParams.get('role') === 'doctor' || isConnectFlow ? 'doctor' : 'patient'
  const initialEmail = searchParams.get('email') || ''
  const initialReferralCode = (searchParams.get('ref') || '').trim().toUpperCase()
  const redirectTarget = searchParams.get('redirect')
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  const [step1Data, setStep1Data] = useState<Step1Data>({ accountType: initialAccountType })
  const [step2Data, setStep2Data] = useState<Step2Data>({
    fullName: '',
    email: initialEmail,
    phone: '',
    referralCode: initialReferralCode,
    password: '',
    confirmPassword: '',
  })
  const [step3DoctorData] = useState<Step3DoctorData>({
    licenseNumber: '',
    specialties: [],
  })
  const [step3PatientData] = useState<Step3PatientData>({
    hasMedicalHistory: false,
    acceptTerms: false,
  })

  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '', textColor: '' })
  const [validatedFields, setValidatedFields] = useState<Record<string, boolean>>({})
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null)
  const [connectDraft, setConnectDraft] = useState<ConnectProfileDraft | null>(null)

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data,
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data,
  })

  const step3DoctorForm = useForm<Step3DoctorData>({
    resolver: zodResolver(step3DoctorSchema),
    defaultValues: step3DoctorData,
  })

  const step3PatientForm = useForm<Step3PatientData>({
    resolver: zodResolver(step3PatientSchema),
    defaultValues: step3PatientData,
  })

  const handlePasswordChange = (password: string) => {
    const strength = calculatePasswordStrength(password)
    setPasswordStrength(strength)
  }

  const handleFieldValidation = (fieldName: string, isValid: boolean) => {
    setValidatedFields((prev) => ({ ...prev, [fieldName]: isValid }))
  }

  useEffect(() => {
    void trackClientEvent(ANALYTICS_EVENTS.SIGNUP_STARTED, {
      surface: 'register',
      accountType: initialAccountType,
      referralCodePresent: Boolean(initialReferralCode),
    })
  // We want one event per page load, not per render.
  }, [])

  useEffect(() => {
    if (!isConnectFlow) return

    const draft = getConnectDraft()
    setConnectDraft(draft)
    setStep1Data({ accountType: 'doctor' })
    step1Form.setValue('accountType', 'doctor')

    if (!draft) return

    const fieldValue = (key: string) => draft.fields.find((field) => field.key === key)?.value || ''
    const suggestedName = fieldValue('doctorName') || (/^(dr|dra)\.?\s/i.test(draft.practice.name) ? draft.practice.name : '')
    const suggestedCedula = fieldValue('cedula')
    const suggestedSpecialty = fieldValue('specialty')

    if (suggestedName && !step2Form.getValues('fullName')) {
      step2Form.setValue('fullName', suggestedName)
      setStep2Data((current) => ({ ...current, fullName: suggestedName }))
    }

    if (suggestedCedula && !step3DoctorForm.getValues('licenseNumber')) {
      step3DoctorForm.setValue('licenseNumber', suggestedCedula)
    }

    if (suggestedSpecialty) {
      const matchingSpecialty = specialties.find((specialty) =>
        specialty.toLowerCase().includes(suggestedSpecialty.toLowerCase())
          || suggestedSpecialty.toLowerCase().includes(specialty.toLowerCase())
      )

      if (matchingSpecialty && step3DoctorForm.getValues('specialties').length === 0) {
        step3DoctorForm.setValue('specialties', [matchingSpecialty])
      }
    }
  }, [isConnectFlow, step1Form, step2Form, step3DoctorForm])

  const handleStep1Next = async () => {
    const isValid = await step1Form.trigger()
    if (isValid) {
      setStep1Data(step1Form.getValues())
      setCurrentStep(2)
    }
  }

  const handleStep2Next = async () => {
    const isValid = await step2Form.trigger()
    if (isValid) {
      setStep2Data(step2Form.getValues())
      setCurrentStep(3)
    }
  }

  const handleStep3Submit = async () => {
    const isDoctor = step1Data.accountType === 'doctor'
    const step3Valid = isDoctor
      ? await step3DoctorForm.trigger()
      : await step3PatientForm.trigger()

    if (!step3Valid) return

    setLoading(true)
    setError('')

    if (!supabase) {
      setError('Authentication not available')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: step2Data.email,
        password: step2Data.password,
        options: {
          data: {
            full_name: step2Data.fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const { error: userError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: step2Data.fullName,
          phone: step2Data.phone || null,
          role: step1Data.accountType,
        })

        if (userError && userError.code !== '23505' && userError.code !== '409') {
          setError(userError.message)
          setLoading(false)
          return
        }

        if (step1Data.accountType === 'doctor') {
          const { error: doctorError } = await supabase.from('doctors').insert({
            id: data.user.id,
            price_cents: 50000,
            status: 'draft',
          })

          if (doctorError && doctorError.code !== '23505') {
            console.error('Doctor insert error:', doctorError)
          }
        }

        if (step1Data.accountType === 'doctor') {
          void trackClientEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
            surface: 'register',
            accountType: 'doctor',
          })
          router.push(isConnectFlow ? '/doctor/onboarding?connect=1' : '/doctor/onboarding')
          router.refresh()
          return
        }

        const referralCode = (step2Data.referralCode || initialReferralCode || '').trim().toUpperCase() || null
        let referralResult: ReferralSummary | null = null

        try {
          const referralResponse = await fetch('/api/patient-referrals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ referralCode }),
          })

          const referralPayload = await referralResponse.json().catch(() => null)

          if (referralResponse.ok && referralPayload?.summary) {
            referralResult = referralPayload.summary as ReferralSummary
          } else if (referralPayload?.error) {
            console.warn('[Register] Referral redemption warning:', referralPayload.error)
          }
        } catch (referralError) {
          console.warn('[Register] Referral redemption failed:', referralError)
        }

        void trackClientEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
          surface: 'register',
          accountType: 'patient',
          referralCodePresent: Boolean(referralCode),
          referralRewardGranted: Boolean(referralResult),
        })

        if (referralResult) {
          setReferralSummary(referralResult)
          setLoading(false)
          return
        }

        router.push(redirectTarget || '/app')
        router.refresh()
      }
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  const progress = (currentStep / 3) * 100
  const isDoctor = step1Data.accountType === 'doctor'
  const hasReferralSuccess = Boolean(referralSummary && step1Data.accountType === 'patient')

  if (hasReferralSuccess && referralSummary) {
    const destination = redirectTarget || '/app'

    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col justify-between bg-ink p-10 text-white">
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-card/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-border/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-semibold">Doctor.mx</span>
          </div>

          <div className="relative z-10 max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/90">
              Cuenta lista
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] leading-tight">
              Ya tienes tu código listo para compartir.
            </h1>
            <p className="text-base leading-7 text-white/78">
              Terminaste el registro. Ahora puedes enviar tu enlace por WhatsApp, copiarlo o mostrar el QR a tu familia.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="rounded-[10px] border border-white/10 bg-card/10 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-white/60">Tu beneficio</div>
                <div className="mt-1 text-lg font-semibold">1 consulta gratis</div>
              </div>
              <div className="rounded-[10px] border border-white/10 bg-card/10 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-white/60">Crédito</div>
                <div className="mt-1 text-lg font-semibold">
                  {referralSummary.creditsCents > 0
                    ? formatCurrency(referralSummary.creditsCents)
                    : 'Se acumula con tus referidos'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-4 sm:p-8 bg-background">
          <div className="mx-auto w-full max-w-3xl">
            <ReferralShareCard
              code={referralSummary.code}
              shareUrl={referralSummary.shareUrl}
              freeConsultsRemaining={referralSummary.freeConsultsRemaining}
              creditsCents={referralSummary.creditsCents}
              patientName={step2Data.fullName}
              continueLabel="Ir a mi panel"
              onContinue={() => {
                router.push(destination)
                router.refresh()
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Image & Branding */}
      <div className="relative hidden lg:flex flex-col justify-between bg-ink p-10 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: isDoctor
              ? 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop)'
              : 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-ink/70" />

        <div className="relative z-20 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-card/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-border/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold">Doctor.mx</span>
        </div>

        <div className="relative z-20">
          <blockquote className="space-y-2">
            {isDoctor ? (
              <>
                <p className="text-lg leading-relaxed">
                  &ldquo;Desde que me registré en Doctor.mx, he aumentado mi base de pacientes un 40%. La plataforma me permite ofrecer consultas virtuales y presenciales de forma sencilla.&rdquo;
                </p>
                <footer className="text-sm text-white/70">
                  Dr. Carlos Mendoza &mdash; Cardiólogo, Monterrey
                </footer>
              </>
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  &ldquo;Encontré a mi especialista en minutos. La consulta por IA me orientó antes de ver al doctor. Una experiencia de salud digital increíble.&rdquo;
                </p>
                <footer className="text-sm text-white/70">
                  Ana Rodríguez &mdash; Paciente, Guadalajara
                </footer>
              </>
            )}
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex flex-col bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center gap-2.5 p-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground">Doctor.mx</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-5 rounded-[12px] border border-[hsl(var(--foreground)/0.07)] bg-card p-5 shadow-[var(--card-shadow)] sm:p-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Crear cuenta
              </h1>
              <p className="text-sm text-muted-foreground">
                Paso {currentStep} de 3
              </p>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-1.5" />

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isConnectFlow && (
              <div className="rounded-[10px] border border-primary/20 bg-primary/5 p-4 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Perfil preparado con Doctor Connect
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {connectDraft
                    ? `Importaremos sugerencias de “${connectDraft.practice.name}”. Confirma cada campo antes de publicarlo.`
                    : 'Puedes crear el perfil desde cero. Si venías de una búsqueda, vuelve a /connect para elegir una práctica.'}
                </p>
              </div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {/* Step 1: Account Type */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-2">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <IconBadge icon={Shield} size="md" />
                      <h2 className="text-lg font-medium text-foreground">Selecciona tu cuenta</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">¿Eres paciente o médico?</p>
                  </div>

                  <Form {...step1Form}>
                    <RadioGroup
                      value={step1Form.watch('accountType')}
                      onValueChange={(value) => step1Form.setValue('accountType', value as 'patient' | 'doctor')}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                        <Label
                          htmlFor="patient"
                          className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-muted-foreground/25"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">Soy paciente</div>
                            <div className="text-sm text-muted-foreground">Busco atención médica</div>
                          </div>
                          <motion.div
                            initial={false}
                            animate={{ scale: step1Form.watch('accountType') === 'patient' ? 1 : 0 }}
                            className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                        <Label
                          htmlFor="doctor"
                          className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-muted-foreground/25"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <Stethoscope className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">Soy médico</div>
                            <div className="text-sm text-muted-foreground">Ofreceré servicios médicos</div>
                          </div>
                          <motion.div
                            initial={false}
                            animate={{ scale: step1Form.watch('accountType') === 'doctor' ? 1 : 0 }}
                            className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </Form>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="mb-2 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <IconBadge icon={User} size="md" />
                      <h2 className="text-lg font-medium text-foreground">Información personal</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Ingresa tus datos de acceso</p>
                  </div>

                  <Form {...step2Form}>
                    <form className="space-y-3">
                      <FormField
                        control={step2Form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder={isDoctor ? 'Dr. Juan Pérez' : 'Juan Pérez'}
                                  className="pr-10"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    handleFieldValidation('fullName', e.target.value.length >= 3)
                                  }}
                                />
                                <AnimatePresence>
                                  {validatedFields.fullName && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step2Form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="email"
                                  placeholder="tu@email.com"
                                  className="pr-10"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    handleFieldValidation('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value))
                                  }}
                                />
                                <AnimatePresence>
                                  {validatedFields.email && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step2Form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="55 1234 5678"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step2Form.control}
                        name="referralCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código de referido (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="AB12CD"
                                className="font-mono tracking-[0.24em]"
                                {...field}
                              />
                            </FormControl>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Si alguien te invitó, pega su código aquí. Si no, déjalo vacío.
                            </p>
                            {initialReferralCode && (
                              <p className="mt-1 text-xs font-medium text-primary">
                                Código aplicado desde tu enlace: <span className="font-mono">{initialReferralCode}</span>
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step2Form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handlePasswordChange(e.target.value)
                                  handleFieldValidation('password', e.target.value.length >= 6)
                                }}
                              />
                            </FormControl>
                            {step2Form.watch('password') && (
                              <div className="mt-2 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Seguridad:</span>
                                  <span className={`font-medium ${passwordStrength.textColor}`}>
                                    {passwordStrength.label}
                                  </span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${passwordStrength.strength}%` }}
                                    transition={{ duration: 0.3 }}
                                    className={`h-full ${passwordStrength.color} rounded-full`}
                                  />
                                </div>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step2Form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Confirmar contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="password"
                                  placeholder="Confirma tu contraseña"
                                  className="pr-10"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    handleFieldValidation('confirmPassword', e.target.value === step2Form.watch('password') && e.target.value.length >= 6)
                                  }}
                                />
                                <AnimatePresence>
                                  {validatedFields.confirmPassword && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </motion.div>
              )}

              {/* Step 3: Final Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="mb-2 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <IconBadge icon={isDoctor ? Stethoscope : Heart} size="md" />
                      <h2 className="text-lg font-medium text-foreground">
                        {isDoctor ? 'Perfil profesional' : 'Completa tu registro'}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isDoctor ? 'Información profesional' : 'Últimos detalles'}
                    </p>
                  </div>

                  {isDoctor ? (
                    <Form {...step3DoctorForm}>
                      <form className="space-y-4">
                        <FormField
                          control={step3DoctorForm.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de cédula profesional (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="12345678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={step3DoctorForm.control}
                          name="specialties"
                          render={() => (
                            <FormItem>
                              <FormLabel>Especialidades</FormLabel>
                              {connectDraft?.fields.find((field) => field.key === 'specialty')?.value && (
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  Sugerido por IA: {connectDraft.fields.find((field) => field.key === 'specialty')?.value}. Confírmalo solo si corresponde a tu práctica.
                                </p>
                              )}
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {specialties.map((specialty) => {
                                  const isSelected = step3DoctorForm.watch('specialties')?.includes(specialty)
                                  return (
                                    <label
                                      key={specialty}
                                      className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-all text-sm ${
                                        isSelected
                                          ? 'border-primary bg-primary/5 text-primary'
                                          : 'border-input hover:border-muted-foreground/25'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const current = step3DoctorForm.getValues('specialties') || []
                                          if (checked) {
                                            step3DoctorForm.setValue('specialties', [...current, specialty])
                                          } else {
                                            step3DoctorForm.setValue('specialties', current.filter(s => s !== specialty))
                                          }
                                        }}
                                      />
                                      <span className="font-medium">{specialty}</span>
                                    </label>
                                  )
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Alert className="bg-primary/10 border-primary/20">
                          <AlertDescription className="text-primary text-sm">
                            Después del registro, completarás tu perfil profesional con más detalles.
                          </AlertDescription>
                        </Alert>
                      </form>
                    </Form>
                  ) : (
                    <Form {...step3PatientForm}>
                      <form className="space-y-3">
                        <FormField
                          control={step3PatientForm.control}
                          name="hasMedicalHistory"
                          render={({ field }) => (
                            <FormItem>
                              <label className="flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer hover:border-muted-foreground/25 transition-all">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-0.5"
                                  />
                                </FormControl>
                                <div>
                                  <div className="font-medium text-sm text-foreground">Historial médico</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Tengo condiciones médicas previas que deben conocer
                                  </div>
                                </div>
                              </label>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={step3PatientForm.control}
                          name="acceptTerms"
                          render={({ field }) => (
                            <FormItem>
                              <label className="flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer hover:border-muted-foreground/25 transition-all">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-0.5"
                                  />
                                </FormControl>
                                <div>
                                  <div className="font-medium text-sm text-foreground">Acepto los términos</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    He leído y acepto los{' '}
                                    <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                      Términos de Servicio
                                    </Link>
                                    {' '}y la{' '}
                                    <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                      Política de Privacidad
                                    </Link>
                                  </div>
                                </div>
                              </label>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Atrás
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={currentStep === 1 ? handleStep1Next : handleStep2Next}
                  className="flex-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleStep3Submit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <Check className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground pt-2">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
