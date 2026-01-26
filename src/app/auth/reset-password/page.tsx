'use client'

import { Suspense, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, Variants } from 'framer-motion'
import { Loader2, Heart, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Animated gradient blobs background component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-primary-200/30 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-accent-500/20 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ bottom: '10%', right: '10%' }}
      />
    </div>
  )
}

// Password strength validator
const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  if (password.length === 0) return { strength: 0, label: '', color: '' }

  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  const labels = ['Muy debil', 'Debil', 'Regular', 'Fuerte', 'Muy fuerte']
  const colors = ['#ff4444', '#ff9900', '#ffc107', '#00eca1', '#00B4A3']

  return {
    strength: (strength / 5) * 100,
    label: labels[Math.min(strength, 4)],
    color: colors[Math.min(strength, 4)]
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
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' })
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Verificando sesion...</p>
        </div>
      </div>
    )
  }

  // Invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <header className="glass border-b border-neutral-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold text-neutral-900">Doctor.mx</span>
              </Link>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card className="shadow-xl border-neutral-200/50 backdrop-blur-sm bg-white/90 max-w-md w-full">
              <CardHeader className="space-y-1 pb-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-4 w-16 h-16 bg-error-500/10 rounded-full flex items-center justify-center"
                >
                  <AlertCircle className="w-8 h-8 text-error-500" />
                </motion.div>
                <CardTitle className="text-2xl font-bold">Enlace invalido o expirado</CardTitle>
                <CardDescription>
                  El enlace para restablecer tu contrasena ha expirado o no es valido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/auth/forgot-password">
                  <Button className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-semibold">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full h-11">
                    Volver al inicio de sesion
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      <AnimatedBackground />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-neutral-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">Doctor.mx</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <Card className="shadow-xl border-neutral-200/50 backdrop-blur-sm bg-white/90">
              <CardHeader className="space-y-1 pb-6">
                {isSuccess ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="mx-auto mb-4 w-16 h-16 bg-success-500/10 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-success-500" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-center">
                      Contrasena actualizada
                    </CardTitle>
                    <CardDescription className="text-center">
                      Tu contrasena ha sido actualizada exitosamente. Seras redirigido al inicio de sesion...
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="mx-auto mb-4 w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center"
                    >
                      <Lock className="w-8 h-8 text-primary-500" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-center">
                      Nueva contrasena
                    </CardTitle>
                    <CardDescription className="text-center">
                      Ingresa tu nueva contrasena. Asegurate de que sea segura.
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
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
                                      className="h-11 pr-10"
                                      {...field}
                                      onChange={(e) => handlePasswordChange(e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
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
                                    <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${passwordStrength.strength}%` }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full rounded-full transition-colors"
                                        style={{ backgroundColor: passwordStrength.color }}
                                      />
                                    </div>
                                    <p className="text-xs" style={{ color: passwordStrength.color }}>
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
                                      className="h-11 pr-10"
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
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
                            className="p-3 bg-error-500/10 border border-error-500/20 rounded-lg"
                          >
                            <p className="text-sm text-error-500 font-medium">
                              {form.formState.errors.root.message}
                            </p>
                          </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.div variants={itemVariants}>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
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
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm text-neutral-500">Cargando...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
