'use client'

import { useState, Suspense, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
import {
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  Heart,
  Shield,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react'
import { logger } from '@/lib/observability/logger'
import { FormValidationAnnouncer, FormErrorSummary, FieldErrorMessage, InlineSuccess } from '@/components/ui/FormValidationAnnouncer'

function calculatePasswordStrength(password: string): { strength: number; label: string; color: string } {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 15
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15

  if (strength < 40) return { strength, label: 'Débil', color: 'bg-red-500' }
  if (strength < 70) return { strength, label: 'Media', color: 'bg-yellow-500' }
  return { strength, label: 'Fuerte', color: 'bg-green-500' }
}

const step1Schema = z.object({
  accountType: z.enum(['patient', 'doctor']),
})

const step2Schema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
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

// Validation helper with announcement
interface ValidationState {
  error: string | null;
  touched: boolean;
  valid: boolean;
}

function useAccessibleValidation() {
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [fieldStates, setFieldStates] = useState<Record<string, ValidationState>>({})

  const announce = useCallback((message: string) => {
    setAnnouncement(message)
  }, [])

  const validateField = useCallback((fieldName: string, value: unknown, validator: (val: unknown) => { valid: boolean; message?: string }) => {
    const result = validator(value)
    
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        error: result.valid ? null : (result.message || 'Error de validación'),
        touched: true,
        valid: result.valid
      }
    }))

    if (result.valid) {
      announce(`${fieldName} es válido`)
    } else if (result.message) {
      announce(`Error en ${fieldName}: ${result.message}`)
    }

    return result.valid
  }, [announce])

  const setTouched = useCallback((fieldName: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true
      }
    }))
  }, [])

  return {
    announcement,
    fieldStates,
    validateField,
    setTouched,
    announce
  }
}

function RegisterContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  const [step1Data, setStep1Data] = useState<Step1Data>({ accountType: 'patient' })
  const [step2Data, setStep2Data] = useState<Step2Data>({
    fullName: '',
    email: '',
    phone: '',
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

  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' })
  const [validatedFields, setValidatedFields] = useState<Record<string, boolean>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data,
    mode: 'onBlur',
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data,
    mode: 'onBlur',
  })

  const step3DoctorForm = useForm<Step3DoctorData>({
    resolver: zodResolver(step3DoctorSchema),
    defaultValues: step3DoctorData,
    mode: 'onBlur',
  })

  const step3PatientForm = useForm<Step3PatientData>({
    resolver: zodResolver(step3PatientSchema),
    defaultValues: step3PatientData,
    mode: 'onBlur',
  })

  const announceValidation = useCallback((fieldName: string, message: string, isValid: boolean) => {
    if (isValid) {
      setAnnouncement(`${fieldName} es válido`)
    } else {
      setAnnouncement(`Error en ${fieldName}: ${message}`)
    }
  }, [])

  const handlePasswordChange = (password: string) => {
    const strength = calculatePasswordStrength(password)
    setPasswordStrength(strength)
  }

  const handleFieldValidation = (fieldName: string, isValid: boolean, errorMessage?: string) => {
    setValidatedFields((prev) => ({ ...prev, [fieldName]: isValid }))
    if (!isValid && errorMessage) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: errorMessage }))
    } else if (isValid) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleBlur = (fieldName: string, value: string, validator: (val: string) => boolean, errorMsg: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
    const isValid = validator(value)
    handleFieldValidation(fieldName, isValid, isValid ? undefined : errorMsg)
    announceValidation(fieldName, isValid ? '' : errorMsg, isValid)
  }

  const handleStep1Next = async () => {
    const isValid = await step1Form.trigger()
    if (isValid) {
      setStep1Data(step1Form.getValues())
      setCurrentStep(2)
      setAnnouncement('Paso 1 completado. Continuando al paso 2.')
    } else {
      const errors = step1Form.formState.errors
      const firstError = Object.entries(errors)[0]
      if (firstError) {
        announceValidation(firstError[0], firstError[1]?.message || 'Error de validación', false)
      }
    }
  }

  const handleStep2Next = async () => {
    const isValid = await step2Form.trigger()
    if (isValid) {
      setStep2Data(step2Form.getValues())
      setCurrentStep(3)
      setAnnouncement('Paso 2 completado. Continuando al paso 3.')
    } else {
      const errors = step2Form.formState.errors
      const firstError = Object.entries(errors)[0]
      if (firstError) {
        announceValidation(firstError[0], firstError[1]?.message || 'Error de validación', false)
      }
    }
  }

  const handleStep3Submit = async () => {
    const isDoctor = step1Data.accountType === 'doctor'
    const step3Valid = isDoctor
      ? await step3DoctorForm.trigger()
      : await step3PatientForm.trigger()

    if (!step3Valid) {
      const errors = isDoctor ? step3DoctorForm.formState.errors : step3PatientForm.formState.errors
      const firstError = Object.entries(errors)[0]
      if (firstError) {
        announceValidation(firstError[0], firstError[1]?.message || 'Error de validación', false)
      }
      return
    }

    setLoading(true)
    setError('')
    setAnnouncement('Creando tu cuenta...')

    if (!supabase) {
      setError('Authentication not available')
      setAnnouncement('Error: Autenticación no disponible')
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
        setAnnouncement(`Error al crear cuenta: ${signUpError.message}`)
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
          setAnnouncement(`Error: ${userError.message}`)
          setLoading(false)
          return
        }

        if (step1Data.accountType === 'doctor') {
          const { error: doctorError } = await supabase.from('doctores').insert({
            id: data.user.id,
            price_cents: 50000,
            status: 'draft',
          })

          if (doctorError && doctorError.code !== '23505') {
            logger.error('Doctor insert error', { userId: data.user.id, error: doctorError.message })
          }
        }

        setAnnouncement('Cuenta creada exitosamente')
        const destination = step1Data.accountType === 'doctor' ? '/doctor/onboarding' : '/app'
        router.push(destination)
        router.refresh()
      }
    } catch {
      const errorMsg = 'Ocurrió un error. Por favor intenta de nuevo.'
      setError(errorMsg)
      setAnnouncement(errorMsg)
      setLoading(false)
    }
  }

  const progress = (currentStep / 3) * 100
  const isDoctor = step1Data.accountType === 'doctor'

  // Get current form errors
  const getCurrentErrors = () => {
    if (currentStep === 1) return step1Form.formState.errors
    if (currentStep === 2) return step2Form.formState.errors
    if (currentStep === 3) {
      return isDoctor ? step3DoctorForm.formState.errors : step3PatientForm.formState.errors
    }
    return {}
  }

  const currentErrors = getCurrentErrors()
  const errorSummary = Object.entries(currentErrors).reduce((acc, [key, err]) => {
    if (err?.message) acc[key] = err.message
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Screen reader announcer */}
      <FormValidationAnnouncer message={announcement} politeness="assertive" />

      {/* Left Panel - Image & Branding */}
      <div className="relative hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: isDoctor
              ? 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop)'
              : 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-zinc-900/70" />

        <div className="relative z-20 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
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
                <footer className="text-sm text-zinc-300">
                  Dr. Carlos Mendoza &mdash; Cardiólogo, Monterrey
                </footer>
              </>
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  &ldquo;Encontré a mi especialista en minutos. La consulta por IA me orientó antes de ver al doctor. Una experiencia de salud digital increíble.&rdquo;
                </p>
                <footer className="text-sm text-zinc-300">
                  Ana Rodríguez &mdash; Paciente, Guadalajara
                </footer>
              </>
            )}
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 p-6 border-b">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-neutral-900">Doctor.mx</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[420px] space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Crear cuenta
              </h1>
              <p className="text-sm text-muted-foreground">
                Paso {currentStep} de 3
              </p>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-1.5" aria-label={`Progreso: ${Math.round(progress)}%`} />

            {/* Error Summary */}
            {Object.keys(errorSummary).length > 0 && (
              <FormErrorSummary errors={errorSummary} />
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
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
                    <div className={`w-14 h-14 ${isDoctor ? 'bg-green-50' : 'bg-primary/10'} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Shield className={`w-7 h-7 ${isDoctor ? 'text-green-600' : 'text-primary'}`} />
                    </div>
                    <h2 className="text-lg font-medium">Selecciona tu cuenta</h2>
                    <p className="text-sm text-muted-foreground mt-1">¿Eres paciente o médico?</p>
                  </div>

                  <RadioGroup
                    value={step1Form.watch('accountType')}
                    onValueChange={(value) => {
                      step1Form.setValue('accountType', value as 'patient' | 'doctor')
                      announceValidation('Tipo de cuenta', '', true)
                    }}
                    className="space-y-3"
                    aria-label="Selecciona el tipo de cuenta"
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
                          <div className="font-medium">Soy paciente</div>
                          <div className="text-sm text-muted-foreground">Busco atención médica</div>
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ scale: step1Form.watch('accountType') === 'patient' ? 1 : 0 }}
                          className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      </Label>
                    </div>

                    <div className="relative">
                      <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                      <Label
                        htmlFor="doctor"
                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:border-muted-foreground/25"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Soy médico</div>
                          <div className="text-sm text-muted-foreground">Ofreceré servicios médicos</div>
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ scale: step1Form.watch('accountType') === 'doctor' ? 1 : 0 }}
                          className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      </Label>
                    </div>
                  </RadioGroup>
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
                  <div className="text-center mb-2">
                    <div className={`w-14 h-14 ${isDoctor ? 'bg-green-50' : 'bg-primary/10'} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <User className={`w-7 h-7 ${isDoctor ? 'text-green-600' : 'text-primary'}`} />
                    </div>
                    <h2 className="text-lg font-medium">Información personal</h2>
                    <p className="text-sm text-muted-foreground mt-1">Ingresa tus datos de acceso</p>
                  </div>

                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="fullName" className="text-sm">
                        Nombre completo
                        <span className="text-destructive ml-1" aria-hidden="true">*</span>
                        <span className="sr-only">(requerido)</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="fullName"
                          {...step2Form.register('fullName', {
                            onChange: (e) => {
                              const isValid = e.target.value.length >= 3
                              handleFieldValidation('fullName', isValid, 'Mínimo 3 caracteres')
                            }
                          })}
                          placeholder={isDoctor ? 'Dr. Juan Pérez' : 'Juan Pérez'}
                          aria-invalid={!!step2Form.formState.errors.fullName}
                          aria-describedby={step2Form.formState.errors.fullName ? "fullName-error" : undefined}
                          aria-required="true"
                          onBlur={(e) => handleBlur('Nombre completo', e.target.value, (v) => v.length >= 3, 'El nombre debe tener al menos 3 caracteres')}
                          className={validatedFields.fullName ? "border-green-500 pr-10" : ""}
                        />
                        <AnimatePresence>
                          {validatedFields.fullName && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              aria-hidden="true"
                            >
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <FieldErrorMessage
                        errorId="fullName-error"
                        error={step2Form.formState.errors.fullName?.message || null}
                        touched={touchedFields.fullName || step2Form.formState.touchedFields.fullName || false}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-sm">
                        Correo electrónico
                        <span className="text-destructive ml-1" aria-hidden="true">*</span>
                        <span className="sr-only">(requerido)</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="email"
                          type="email"
                          {...step2Form.register('email', {
                            onChange: (e) => {
                              const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
                              handleFieldValidation('email', isValid, 'Correo inválido')
                            }
                          })}
                          placeholder="tu@email.com"
                          aria-invalid={!!step2Form.formState.errors.email}
                          aria-describedby={step2Form.formState.errors.email ? "email-error" : undefined}
                          aria-required="true"
                          onBlur={(e) => handleBlur('Correo electrónico', e.target.value, (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo electrónico inválido')}
                          className={validatedFields.email ? "border-green-500 pr-10" : ""}
                        />
                        <AnimatePresence>
                          {validatedFields.email && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              aria-hidden="true"
                            >
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <FieldErrorMessage
                        errorId="email-error"
                        error={step2Form.formState.errors.email?.message || null}
                        touched={touchedFields.email || step2Form.formState.touchedFields.email || false}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-sm">Teléfono (opcional)</Label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                        <Input
                          id="phone"
                          type="tel"
                          {...step2Form.register('phone')}
                          placeholder="55 1234 5678"
                          className="pl-10"
                          aria-describedby="phone-hint"
                        />
                      </div>
                      <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
                        Opcional, para notificaciones importantes
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="password" className="text-sm">
                        Contraseña
                        <span className="text-destructive ml-1" aria-hidden="true">*</span>
                        <span className="sr-only">(requerido)</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        {...step2Form.register('password', {
                          onChange: (e) => {
                            handlePasswordChange(e.target.value)
                            const isValid = e.target.value.length >= 6
                            handleFieldValidation('password', isValid, 'Mínimo 6 caracteres')
                          }
                        })}
                        placeholder="Mínimo 6 caracteres"
                        className="mt-1.5"
                        aria-invalid={!!step2Form.formState.errors.password}
                        aria-describedby={step2Form.formState.errors.password ? "password-error password-strength" : "password-strength"}
                        aria-required="true"
                        onBlur={(e) => handleBlur('Contraseña', e.target.value, (v) => v.length >= 6, 'La contraseña debe tener al menos 6 caracteres')}
                      />
                      <FieldErrorMessage
                        errorId="password-error"
                        error={step2Form.formState.errors.password?.message || null}
                        touched={touchedFields.password || step2Form.formState.touchedFields.password || false}
                      />
                      {step2Form.watch('password') && (
                        <div id="password-strength" className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Seguridad:</span>
                            <span className={`font-medium ${
                              passwordStrength.strength < 40 ? 'text-red-500' :
                              passwordStrength.strength < 70 ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden" aria-hidden="true">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength.strength}%` }}
                              transition={{ duration: 0.3 }}
                              className={`h-full ${passwordStrength.color} rounded-full`}
                            />
                          </div>
                          <p className="sr-only">
                            Fortaleza de la contraseña: {passwordStrength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm">
                        Confirmar contraseña
                        <span className="text-destructive ml-1" aria-hidden="true">*</span>
                        <span className="sr-only">(requerido)</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...step2Form.register('confirmPassword', {
                            onChange: (e) => {
                              const isValid = e.target.value === step2Form.watch('password') && e.target.value.length >= 6
                              handleFieldValidation('confirmPassword', isValid, 'Las contraseñas no coinciden')
                            }
                          })}
                          placeholder="Confirma tu contraseña"
                          aria-invalid={!!step2Form.formState.errors.confirmPassword}
                          aria-describedby={step2Form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined}
                          aria-required="true"
                          onBlur={(e) => {
                            const password = step2Form.watch('password')
                            handleBlur('Confirmar contraseña', e.target.value, (v) => v === password && v.length >= 6, 'Las contraseñas no coinciden')
                          }}
                          className={validatedFields.confirmPassword ? "border-green-500 pr-10" : ""}
                        />
                        <AnimatePresence>
                          {validatedFields.confirmPassword && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              aria-hidden="true"
                            >
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <FieldErrorMessage
                        errorId="confirmPassword-error"
                        error={step2Form.formState.errors.confirmPassword?.message || null}
                        touched={touchedFields.confirmPassword || step2Form.formState.touchedFields.confirmPassword || false}
                      />
                    </div>
                  </div>
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
                  <div className="text-center mb-2">
                    <div className={`w-14 h-14 ${isDoctor ? 'bg-green-50' : 'bg-primary/10'} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      {isDoctor ? (
                        <Stethoscope className="w-7 h-7 text-green-600" />
                      ) : (
                        <Heart className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <h2 className="text-lg font-medium">
                      {isDoctor ? 'Perfil profesional' : 'Completa tu registro'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isDoctor ? 'Información profesional' : 'Últimos detalles'}
                    </p>
                  </div>

                  {isDoctor ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="licenseNumber" className="text-sm">
                          Número de cédula profesional (opcional)
                        </Label>
                        <Input
                          id="licenseNumber"
                          {...step3DoctorForm.register('licenseNumber')}
                          placeholder="12345678"
                          className="mt-1.5"
                          aria-describedby="license-hint"
                        />
                        <p id="license-hint" className="text-xs text-muted-foreground mt-1">
                          Puedes agregarlo más tarde en tu perfil
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm">
                          Especialidades
                          <span className="text-destructive ml-1" aria-hidden="true">*</span>
                          <span className="sr-only">(requerido, selecciona al menos una)</span>
                        </Label>
                        <div 
                          className="grid grid-cols-2 gap-2 mt-2"
                          role="group"
                          aria-label="Especialidades médicas"
                        >
                          {specialties.map((specialty) => {
                            const isSelected = step3DoctorForm.watch('specialties')?.includes(specialty)
                            return (
                              <label
                                key={specialty}
                                className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-all text-sm ${
                                  isSelected
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-input hover:border-muted-foreground/25'
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const current = step3DoctorForm.getValues('specialties') || []
                                    if (checked) {
                                      step3DoctorForm.setValue('specialties', [...current, specialty])
                                      announceValidation(specialty, '', true)
                                    } else {
                                      step3DoctorForm.setValue('specialties', current.filter(s => s !== specialty))
                                    }
                                  }}
                                  aria-label={`Especialidad: ${specialty}`}
                                />
                                <span className="font-medium">{specialty}</span>
                              </label>
                            )
                          })}
                        </div>
                        <FieldErrorMessage
                          errorId="specialties-error"
                          error={step3DoctorForm.formState.errors.specialties?.message || null}
                          touched={Boolean(step3DoctorForm.formState.touchedFields.specialties)}
                        />
                      </div>

                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-700 text-sm">
                          Después del registro, completarás tu perfil profesional con más detalles.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer hover:border-muted-foreground/25 transition-all">
                        <Checkbox
                          checked={step3PatientForm.watch('hasMedicalHistory')}
                          onCheckedChange={(checked) =>
                            step3PatientForm.setValue('hasMedicalHistory', checked as boolean)
                          }
                          className="mt-0.5"
                          aria-label="Tengo condiciones médicas previas"
                        />
                        <div>
                          <div className="font-medium text-sm">Historial médico</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Tengo condiciones médicas previas que deben conocer
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer hover:border-muted-foreground/25 transition-all">
                        <Checkbox
                          checked={step3PatientForm.watch('acceptTerms')}
                          onCheckedChange={(checked) => {
                            step3PatientForm.setValue('acceptTerms', checked as boolean)
                            if (checked) {
                              announceValidation('Términos y condiciones', '', true)
                            }
                          }}
                          className="mt-0.5"
                          aria-label="Acepto los términos y condiciones"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            Acepto los términos
                            <span className="text-destructive ml-1" aria-hidden="true">*</span>
                            <span className="sr-only">(requerido)</span>
                          </div>
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
                      <FieldErrorMessage
                        errorId="acceptTerms-error"
                        error={step3PatientForm.formState.errors.acceptTerms?.message || null}
                        touched={step3PatientForm.formState.touchedFields.acceptTerms || false}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link
                href="/doctores"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Buscar doctores</span>
                <span className="sm:hidden">Doctores</span>
              </Link>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(currentStep - 1)
                    setAnnouncement(`Volviendo al paso ${currentStep - 1}`)
                  }}
                  className="flex-1"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                  Atrás
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={currentStep === 1 ? handleStep1Next : handleStep2Next}
                  className={`flex-1 ${
                    isDoctor && currentStep > 1
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleStep3Submit}
                  disabled={loading}
                  className={`flex-1 ${
                    isDoctor ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <Check className="w-4 h-4 ml-1" aria-hidden="true" />
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
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Cargando...</span>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
