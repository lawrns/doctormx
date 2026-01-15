'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
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
  AlertCircle
} from 'lucide-react'

// Password strength calculator
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

// Validation schemas for each step
const step1Schema = z.object({
  accountType: z.enum(['patient', 'doctor']).catch('patient'),
})

const step2Schema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
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
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Form state
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

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' })
  const [validatedFields, setValidatedFields] = useState<Record<string, boolean>>({})

  // Forms for each step
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
        // Create user record in profiles table
        const { error: userError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: step2Data.fullName,
          phone: step2Data.phone || null,
          role: step1Data.accountType,
        })

        // If user already exists (409 or 23505), that's okay - continue to profile completion
        if (userError && userError.code !== '23505' && userError.code !== '409') {
          setError(userError.message)
          setLoading(false)
          return
        }

        // Redirect to profile completion page
        router.push('/auth/complete-profile')
        router.refresh()
      }
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-neutral-900">Doctory</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 shadow-xl border-neutral-200">
            {/* Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <motion.span
                  key={currentStep}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium text-neutral-600"
                >
                  Paso {currentStep} de 3
                </motion.span>
                <span className="text-sm font-medium text-primary-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 mb-6" />

              {/* Step Title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 ${step1Data.accountType === 'doctor' ? 'bg-green-50' : 'bg-primary-50'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {currentStep === 1 && (
                      <Shield className={`w-8 h-8 ${step1Data.accountType === 'doctor' ? 'text-green-600' : 'text-primary-500'}`} />
                    )}
                    {currentStep === 2 && (
                      <User className={`w-8 h-8 ${step1Data.accountType === 'doctor' ? 'text-green-600' : 'text-primary-500'}`} />
                    )}
                    {currentStep === 3 && (
                      step1Data.accountType === 'doctor' ? (
                        <Stethoscope className="w-8 h-8 text-green-600" />
                      ) : (
                        <Heart className="w-8 h-8 text-primary-500" />
                      )
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {currentStep === 1 && 'Selecciona tu cuenta'}
                    {currentStep === 2 && 'Información personal'}
                    {currentStep === 3 && (step1Data.accountType === 'doctor' ? 'Perfil profesional' : 'Completa tu registro')}
                  </h1>
                  <p className="text-neutral-500 mt-2">
                    {currentStep === 1 && '¿Eres paciente o médico?'}
                    {currentStep === 2 && 'Ingresa tus datos de acceso'}
                    {currentStep === 3 && (step1Data.accountType === 'doctor' ? 'Información profesional' : 'Últimos detalles')}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
                  className="space-y-6"
                >
                  <RadioGroup
                    value={step1Form.watch('accountType')}
                    onValueChange={(value) => step1Form.setValue('accountType', value as 'patient' | 'doctor')}
                    className="space-y-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                      <Label
                        htmlFor="patient"
                        className="flex items-center gap-4 p-6 rounded-xl border-2 border-neutral-200 cursor-pointer transition-all peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:bg-primary-50/50 peer-data-[state=checked]:shadow-sm hover:border-neutral-300"
                      >
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900">Soy paciente</div>
                          <div className="text-sm text-neutral-500">Busco atención médica</div>
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ scale: step1Form.watch('accountType') === 'patient' ? 1 : 0 }}
                          className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      </Label>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                      <Label
                        htmlFor="doctor"
                        className="flex items-center gap-4 p-6 rounded-xl border-2 border-neutral-200 cursor-pointer transition-all peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50/50 peer-data-[state=checked]:shadow-sm hover:border-neutral-300"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <Stethoscope className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900">Soy médico</div>
                          <div className="text-sm text-neutral-500">Ofreceré servicios médicos</div>
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ scale: step1Form.watch('accountType') === 'doctor' ? 1 : 0 }}
                          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      </Label>
                    </motion.div>
                  </RadioGroup>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
                  className="stagger-animation space-y-5"
                >
                  <div>
                    <Label htmlFor="fullName" className="mb-2">
                      <User className="w-4 h-4" />
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        {...step2Form.register('fullName', {
                          onChange: (e) => {
                            const isValid = e.target.value.length >= 3
                            handleFieldValidation('fullName', isValid)
                          }
                        })}
                        placeholder={step1Data.accountType === 'doctor' ? 'Dr. Juan Pérez' : 'Juan Pérez'}
                        className="h-12"
                      />
                      <AnimatePresence>
                        {validatedFields.fullName && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {step2Form.formState.errors.fullName && (
                      <p className="text-sm text-red-500 mt-1">{step2Form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-2">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        {...step2Form.register('email', {
                          onChange: (e) => {
                            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
                            handleFieldValidation('email', isValid)
                          }
                        })}
                        placeholder="tu@email.com"
                        className="h-12"
                      />
                      <AnimatePresence>
                        {validatedFields.email && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {step2Form.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{step2Form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="mb-2">
                      <Phone className="w-4 h-4" />
                      Teléfono (opcional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...step2Form.register('phone')}
                      placeholder="55 1234 5678"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="mb-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      {...step2Form.register('password', {
                        onChange: (e) => {
                          handlePasswordChange(e.target.value)
                          const isValid = e.target.value.length >= 6
                          handleFieldValidation('password', isValid)
                        }
                      })}
                      placeholder="Mínimo 6 caracteres"
                      className="h-12"
                    />
                    {step2Form.formState.errors.password && (
                      <p className="text-sm text-red-500 mt-1">{step2Form.formState.errors.password.message}</p>
                    )}
                    {step2Form.watch('password') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">Seguridad:</span>
                          <span className={`font-medium ${
                            passwordStrength.strength < 40 ? 'text-red-500' :
                            passwordStrength.strength < 70 ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.strength}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full ${passwordStrength.color} rounded-full`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="mb-2">
                      <Lock className="w-4 h-4" />
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...step2Form.register('confirmPassword', {
                          onChange: (e) => {
                            const isValid = e.target.value === step2Form.watch('password') && e.target.value.length >= 6
                            handleFieldValidation('confirmPassword', isValid)
                          }
                        })}
                        placeholder="Confirma tu contraseña"
                        className="h-12"
                      />
                      <AnimatePresence>
                        {validatedFields.confirmPassword && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {step2Form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{step2Form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
                  className="space-y-5"
                >
                  {step1Data.accountType === 'doctor' ? (
                    <>
                      <div>
                        <Label htmlFor="licenseNumber" className="mb-2">
                          Número de cédula profesional (opcional)
                        </Label>
                        <Input
                          id="licenseNumber"
                          {...step3DoctorForm.register('licenseNumber')}
                          placeholder="12345678"
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Label className="mb-3">Especialidades</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {specialties.map((specialty) => {
                            const isSelected = step3DoctorForm.watch('specialties')?.includes(specialty)
                            return (
                              <motion.div
                                key={specialty}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <label
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-neutral-200 hover:border-neutral-300'
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
                                  <span className="text-sm font-medium text-neutral-900">{specialty}</span>
                                </label>
                              </motion.div>
                            )
                          })}
                        </div>
                        {step3DoctorForm.formState.errors.specialties && (
                          <p className="text-sm text-red-500 mt-2">{step3DoctorForm.formState.errors.specialties.message}</p>
                        )}
                      </div>

                      <Alert className="bg-green-50 border-green-200">
                        <AlertDescription className="text-green-700 text-sm">
                          Después del registro, completarás tu perfil profesional con más detalles.
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-neutral-200 cursor-pointer hover:border-neutral-300 transition-all">
                          <Checkbox
                            checked={step3PatientForm.watch('hasMedicalHistory')}
                            onCheckedChange={(checked) =>
                              step3PatientForm.setValue('hasMedicalHistory', checked as boolean)
                            }
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-neutral-900">Historial médico</div>
                            <div className="text-sm text-neutral-500 mt-1">
                              Marcar si tienes condiciones médicas previas que debemos conocer
                            </div>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-neutral-200 cursor-pointer hover:border-neutral-300 transition-all">
                          <Checkbox
                            checked={step3PatientForm.watch('acceptTerms')}
                            onCheckedChange={(checked) =>
                              step3PatientForm.setValue('acceptTerms', checked as boolean)
                            }
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-neutral-900">Acepto los términos y condiciones</div>
                            <div className="text-sm text-neutral-500 mt-1">
                              He leído y acepto los{' '}
                              <Link href="/terms" className="text-primary-500 hover:underline">
                                Términos de Servicio
                              </Link>
                              {' '}y la{' '}
                              <Link href="/privacy" className="text-primary-500 hover:underline">
                                Política de Privacidad
                              </Link>
                            </div>
                          </div>
                        </label>
                        {step3PatientForm.formState.errors.acceptTerms && (
                          <p className="text-sm text-red-500">{step3PatientForm.formState.errors.acceptTerms.message}</p>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={currentStep === 1 ? handleStep1Next : handleStep2Next}
                  className={`flex-1 h-12 font-semibold ${
                    step1Data.accountType === 'doctor' && currentStep > 1
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-primary-500 hover:bg-[#0052A3]'
                  }`}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleStep3Submit}
                  disabled={loading}
                  className={`flex-1 h-12 font-semibold ${
                    step1Data.accountType === 'doctor'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-primary-500 hover:bg-[#0052A3]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creando cuenta...
                    </span>
                  ) : (
                    <>
                      Crear cuenta
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-center text-neutral-500 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-primary-500 hover:text-[#0052A3] font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </Card>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-6"
          >
            <Link href="/" className="text-gray-400 hover:text-primary-500 text-sm transition-colors inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#0066CC] border-t-transparent rounded-full"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
