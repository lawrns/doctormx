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

const step1Schema = z.object({
  accountType: z.enum(['patient', 'doctor']),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

const step2Schema = z.object({
  phone: z.string().optional(),
  referralCode: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

function RegisterContent() {
  const searchParams = useSearchParams()
  const isConnectFlow = searchParams.get('connect') === '1'
  const [currentStep, setCurrentStep] = useState(1)
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

  const [step1Data, setStep1Data] = useState<Step1Data>({
    accountType: initialAccountType,
    fullName: '',
    email: initialEmail,
    password: '',
    confirmPassword: '',
  })
  const [step2Data, setStep2Data] = useState<Step2Data>({
    phone: '',
    referralCode: initialReferralCode,
  })

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
    setStep1Data({ accountType: 'doctor', fullName: '', email: initialEmail, password: '', confirmPassword: '' })
    step1Form.setValue('accountType', 'doctor')

    if (!draft) return

    const fieldValue = (key: string) => draft.fields.find((field) => field.key === key)?.value || ''
    const suggestedName = fieldValue('doctorName') || (/^(dr|dra)\.?\s/i.test(draft.practice.name) ? draft.practice.name : '')

    if (suggestedName && !step1Form.getValues('fullName')) {
      step1Form.setValue('fullName', suggestedName)
      setStep1Data((current) => ({ ...current, fullName: suggestedName }))
    }
  }, [isConnectFlow, step1Form, initialEmail])

  const handleStep1Next = async () => {
    const isValid = await step1Form.trigger()
    if (isValid) {
      setStep1Data(step1Form.getValues())
      setCurrentStep(2)
    }
  }

  const handleStep2Submit = async () => {
    const isValid = await step2Form.trigger()
    if (!isValid) return

    setStep2Data(step2Form.getValues())

    setLoading(true)
    setError('')

    if (!supabase) {
      setError('Authentication not available')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            full_name: step1Data.fullName,
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
          full_name: step1Data.fullName,
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
          router.push(isConnectFlow ? '/auth/complete-profile?connect=1' : '/auth/complete-profile')
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

          const referralPayload = await referralResponse.json().catch((parseErr) => {
            console.warn('[Register] Failed to parse referral response:', parseErr)
            return null
          })

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

        router.push(redirectTarget || '/auth/complete-profile')
        router.refresh()
      }
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  const isDoctor = step1Data.accountType === 'doctor'
  const hasReferralSuccess = Boolean(referralSummary && step1Data.accountType === 'patient')

  if (hasReferralSuccess && referralSummary) {
    const destination = redirectTarget || '/app'

    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col justify-between bg-[hsl(var(--ink))] p-10 text-white">
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/15">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-semibold">Doctor.mx</span>
          </div>

          <div className="relative z-10 max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
              Cuenta lista
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] leading-tight">
              Ya tienes tu código listo para compartir.
            </h1>
            <p className="text-base leading-7 text-white/78">
              Terminaste el registro. Ahora puedes enviar tu enlace por WhatsApp, copiarlo o mostrar el QR a tu familia.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="rounded-[10px] border border-white/10 bg-white/10 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-white/60">Tu beneficio</div>
                <div className="mt-1 text-lg font-semibold">1 consulta gratis</div>
              </div>
              <div className="rounded-[10px] border border-white/10 bg-white/10 px-4 py-3">
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
              patientName={step1Data.fullName}
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
      <div className="relative hidden lg:flex flex-col justify-between bg-[hsl(var(--ink))] p-10 text-white">
          <div className="absolute inset-0 bg-[hsl(var(--ink))]" />
        <div className="absolute inset-0 bg-[hsl(var(--ink))]/70" />

        <div className="relative z-20 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/15">
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
        <div className="lg:hidden flex items-center justify-center gap-2.5 px-6 py-4">
          <div className="w-8 h-8 bg-[hsl(var(--interactive))] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground">Doctor.mx</span>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-2 sm:items-center sm:p-4">
          <div className="w-full max-w-md space-y-4 rounded-[12px] border border-[hsl(var(--foreground)/0.07)] bg-card p-4 shadow-[var(--shadow-sm)] sm:space-y-5 sm:p-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Crear cuenta
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Registro seguro: protegemos tus datos personales y de salud. Crear tu cuenta es sin tarjeta; tú decides cuándo publicar o agendar.
              </p>
            </div>

            {/* Step labels */}
            <div className="mb-4 flex items-center gap-3 sm:mb-6">
              <span className={`text-sm font-semibold ${currentStep === 1 ? 'text-[hsl(var(--ink))]' : 'text-[hsl(var(--ink-soft))]'}`}>1. Cuenta</span>
              <span className="text-muted-foreground">→</span>
              <span className={`text-sm font-semibold ${currentStep === 2 ? 'text-[hsl(var(--ink))]' : 'text-[hsl(var(--ink-soft))]'}`}>2. Perfil básico</span>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isConnectFlow && (
              <div className="rounded-[10px] border border-[hsl(var(--interactive)/0.2)] bg-[hsl(var(--interactive)/0.05)] p-4 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Stethoscope className="h-4 w-4 text-[hsl(var(--interactive))]" />
                  Perfil preparado con Doctor Connect
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {connectDraft
                    ? `Importaremos sugerencias de &ldquo;${connectDraft.practice.name}&rdquo;. Confirma cada campo antes de publicarlo.`
                    : 'Puedes crear el perfil desde cero. Si venías de una búsqueda, vuelve a /connect para elegir una práctica.'}
                </p>
              </div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {/* Step 1: Account Type + Personal Info */}
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
                            <div className="text-sm text-muted-foreground">Busco atención médica con datos protegidos</div>
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
                            <div className="text-sm text-muted-foreground">Gana pacientes con perfil verificado y agenda en línea</div>
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

                    <form className="space-y-3 mt-4">
                      <FormField
                        control={step1Form.control}
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
                        control={step1Form.control}
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
                        control={step1Form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleFieldValidation('password', e.target.value.length >= 8)
                                }}
                              />
                            </FormControl>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Al menos 8 caracteres · Incluye una mayúscula · Incluye un número
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={step1Form.control}
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
                                    handleFieldValidation('confirmPassword', e.target.value === step1Form.watch('password') && e.target.value.length >= 8)
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

              {/* Step 2: Phone + Referral */}
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
                      <h2 className="text-lg font-medium text-foreground">Perfil básico</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isDoctor
                        ? 'Después podrás completar especialidad, cédula y disponibilidad antes de publicar.'
                        : 'Información de contacto (opcional)'}
                    </p>
                    {isDoctor && (
                      <div className="mt-3 rounded-[10px] border border-[hsl(var(--interactive)/0.2)] bg-[hsl(var(--interactive)/0.05)] p-3 text-left">
                        <p className="text-sm font-semibold text-foreground">Verificación profesional</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Tu cédula profesional se verificará junto con los datos de práctica antes de mostrar tu perfil a pacientes. El alta inicial es sin tarjeta y sin publicar precios hasta que completes tu perfil.
                        </p>
                      </div>
                    )}
                  </div>

                  <Form {...step2Form}>
                    <form className="space-y-3">
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
                            <FormLabel>¿Tienes un código de referido?</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="AB12CD"
                                className="font-mono tracking-[0.24em]"
                                {...field}
                              />
                            </FormControl>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Ingresa el código y obtén 50% de descuento en tu primer mes.
                            </p>
                            {initialReferralCode && (
                              <p className="mt-1 text-xs font-medium text-[hsl(var(--interactive))]">
                                Código aplicado desde tu enlace: <span className="font-mono">{initialReferralCode}</span>
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
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
              {currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={handleStep1Next}
                  className="flex-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleStep2Submit}
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

            <p className="text-center text-xs leading-5 text-muted-foreground">
              Al continuar aceptas los{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                términos
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                privacidad
              </Link>{' '}
              de Doctor.mx. Usamos seguridad de cuenta para mantener tus datos protegidos.
            </p>

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
