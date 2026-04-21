'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, Variants } from 'framer-motion'
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Password strength validator
const getPasswordStrength = (password: string): { strength: number; label: string; colorClass: string; textClass: string } => {
  if (password.length === 0) return { strength: 0, label: '', colorClass: '', textClass: '' }

  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  const labels = ['Muy debil', 'Debil', 'Regular', 'Fuerte', 'Muy fuerte']
  const colorClasses = ['bg-destructive', 'bg-destructive', 'bg-amber', 'bg-vital', 'bg-vital']
  const textClasses = ['text-destructive', 'text-destructive', 'text-amber', 'text-vital', 'text-vital']

  const idx = Math.min(strength, 4)

  return {
    strength: (strength / 5) * 100,
    label: labels[idx],
    colorClass: colorClasses[idx],
    textClass: textClasses[idx],
  }
}

// Zod validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', colorClass: '', textClass: '' })
  const router = useRouter()
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setIsValidSession(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }

    checkSession()
  }, [supabase])

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const handlePasswordChange = (value: string) => {
    form.setValue('password', value)
    setPasswordStrength(getPasswordStrength(value))
  }

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true)

    if (!supabase) {
      form.setError('root', { message: 'Autenticacion no disponible' })
      setIsLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        form.setError('root', { message: updateError.message })
      } else {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch {
      form.setError('root', { message: 'Ocurrio un error inesperado' })
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verificando sesion...</p>
        </div>
      </div>
    )
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-8">
            <div className="space-y-1 pb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center"
              >
                <AlertCircle className="w-8 h-8 text-destructive" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Enlace invalido o expirado</h2>
              <p className="text-sm text-muted-foreground">
                El enlace para restablecer tu contrasena ha expirado o no es valido.
              </p>
            </div>
            <div className="space-y-4">
              <Link href="/auth/forgot-password">
                <Button className="w-full">
                  Solicitar nuevo enlace
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Volver al inicio de sesion
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-8">
          <div className="space-y-1 pb-6">
            {isSuccess ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">
                  Contrasena actualizada
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  Tu contrasena ha sido actualizada exitosamente. Seras redirigido al inicio de sesion...
                </p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <Lock className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">
                  Nueva contrasena
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  Ingresa tu nueva contrasena. Asegurate de que sea segura.
                </p>
              </>
            )}
          </div>

          <div>
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
                <div className="rounded-lg border border-border bg-muted p-4 text-sm text-foreground text-center">
                  Siguiente paso: inicia sesión con tu nueva contraseña. Si no eres redirigido automáticamente, puedes continuar manualmente.
                </div>
                <Link href="/auth/login">
                  <Button className="w-full">
                    Ir a iniciar sesión
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {/* Password Field */}
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nueva contrasena</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Minimo 8 caracteres"
                                  autoComplete="new-password"
                                  className="pr-10"
                                  {...field}
                                  onChange={(e) => handlePasswordChange(e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>

                            {/* Password Strength Indicator */}
                            {passwordStrength.strength > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-1 pt-2"
                              >
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${passwordStrength.strength}%` }}
                                    transition={{ duration: 0.3 }}
                                    className={`h-full rounded-full transition-colors ${passwordStrength.colorClass}`}
                                  />
                                </div>
                                <p className={`text-xs ${passwordStrength.textClass}`}>
                                  Seguridad: {passwordStrength.label}
                                </p>
                              </motion.div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar contrasena</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Repite tu contrasena"
                                  autoComplete="new-password"
                                  className="pr-10"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Error Message */}
                    {form.formState.errors.root && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <p className="text-sm text-destructive font-medium">
                          {form.formState.errors.root.message}
                        </p>
                        <p className="mt-2 text-xs text-destructive/80">
                          Si el enlace expiró, solicita uno nuevo desde la pantalla de recuperación.
                        </p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          'Actualizar contrasena'
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
