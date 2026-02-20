'use client'

import { useState, Suspense, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from '@/components/ui/form'
import { FormValidationAnnouncer, FormErrorSummary } from '@/components/ui/FormValidationAnnouncer'

const loginSchema = z.object({
  email: z.string().min(1, 'El correo electrónico es requerido').email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [validatedFields, setValidatedFields] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/app'

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur',
  })

  const { formState: { errors, touchedFields } } = form

  // Announce validation errors to screen readers
  const announceValidation = (fieldName: string, message: string, isValid: boolean) => {
    if (isValid) {
      setAnnouncement(`${fieldName} es válido`)
    } else {
      setAnnouncement(`Error en ${fieldName}: ${message}`)
    }
  }

  // Handle field validation with visual feedback
  const handleFieldValidation = (fieldName: keyof LoginFormValues, isValid: boolean) => {
    setValidatedFields(prev => ({ ...prev, [fieldName]: isValid }))
  }

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    setAnnouncement('Iniciando sesión...')
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      
      if (error) {
        setError(error.message)
        setAnnouncement(`Error al iniciar sesión: ${error.message}`)
      } else {
        setAnnouncement('Inicio de sesión exitoso')
        router.push(redirectTo)
      }
    } catch {
      const errorMsg = 'Error al iniciar sesión'
      setError(errorMsg)
      setAnnouncement(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const onError = () => {
    // Focus first error field
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField && formRef.current) {
      const errorElement = formRef.current.querySelector(
        `[name="${firstErrorField}"]`
      ) as HTMLElement | null
      if (errorElement) {
        errorElement.focus()
      }
    }
    
    // Announce errors
    const errorMessages = Object.entries(errors).map(([field, err]) => {
      return `${field}: ${err?.message || 'Error de validación'}`
    }).join('. ')
    setAnnouncement(`Errores en el formulario: ${errorMessages}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Screen reader announcer */}
      <FormValidationAnnouncer message={announcement} politeness="assertive" />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="mt-2 text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-blue-500 hover:text-blue-600">
              Regístrate
            </Link>
          </p>
        </div>

        {/* Form Error Summary */}
        <FormErrorSummary 
          errors={Object.entries(errors).reduce((acc, [key, err]) => {
            if (err?.message && touchedFields[key as keyof LoginFormValues]) {
              acc[key] = err.message
            }
            return acc
          }, {} as Record<string, string>)}
        />

        {error && (
          <div 
            role="alert"
            aria-live="assertive"
            className="p-3 bg-red-50 text-red-600 rounded-md text-sm"
          >
            {error}
          </div>
        )}

        <Form {...form}>
          <form 
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit, onError)} 
            className="space-y-6"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="email">
                    Correo electrónico
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                    <span className="sr-only">(requerido)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.error ? "email-error" : undefined}
                        aria-required="true"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur()
                          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
                          handleFieldValidation('email', isValid && !fieldState.invalid)
                          if (fieldState.error) {
                            announceValidation('Correo electrónico', fieldState.error.message || '', false)
                          } else if (isValid) {
                            announceValidation('Correo electrónico', '', true)
                          }
                        }}
                        className={validatedFields.email && !fieldState.invalid ? "border-green-500 pr-10" : ""}
                      />
                      {/* Success indicator */}
                      {validatedFields.email && !fieldState.invalid && field.value && (
                        <div 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                          aria-hidden="true"
                        >
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage id="email-error" role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="password">
                    Contraseña
                    <span className="text-destructive ml-1" aria-hidden="true">*</span>
                    <span className="sr-only">(requerido)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.error ? "password-error" : undefined}
                        aria-required="true"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur()
                          const isValid = e.target.value.length >= 6
                          handleFieldValidation('password', isValid && !fieldState.invalid)
                          if (fieldState.error) {
                            announceValidation('Contraseña', fieldState.error.message || '', false)
                          } else if (isValid) {
                            announceValidation('Contraseña', '', true)
                          }
                        }}
                        className={validatedFields.password && !fieldState.invalid ? "border-green-500 pr-20" : "pr-10"}
                      />
                      {/* Success indicator */}
                      {validatedFields.password && !fieldState.invalid && field.value && (
                        <div 
                          className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500"
                          aria-hidden="true"
                        >
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage id="password-error" role="alert" aria-live="polite" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Recordarme en este dispositivo"
                    />
                    <label htmlFor="remember-me" className="text-sm text-gray-700">Recordarme</label>
                  </div>
                )}
              />
              <Link href="/auth/forgot-password" className="text-sm text-blue-500 hover:text-blue-600">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              aria-disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-gray-600">
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className="underline hover:text-gray-700">
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Cargando...</span>
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" aria-hidden="true"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
