'use client'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, Variants } from 'framer-motion'
import { Eye, EyeOff, Loader2, Heart, Stethoscope, UserCircle2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-primary-300/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ top: '50%', left: '50%' }}
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

  const labels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
  const colors = ['#ff4444', '#ff9900', '#ffc107', '#00eca1', '#00B4A3']

  return {
    strength: (strength / 5) * 100,
    label: labels[Math.min(strength, 4)],
    color: colors[Math.min(strength, 4)]
  }
}

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().catch(false),
  userType: z.enum(['patient', 'doctor']).catch('patient'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', color: '' })
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      userType: 'patient',
    },
  })

  const handlePasswordChange = (value: string) => {
    form.setValue('password', value)
    setPasswordStrength(getPasswordStrength(value))
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        form.setError('root', { message: authError.message })
      } else {
        // Redirect based on user type
        const redirectUrl = searchParams.get('redirect') ||
          (data.userType === 'doctor' ? '/doctor' : '/app')
        router.push(redirectUrl)
        router.refresh()
      }
    } catch {
      form.setError('root', { message: 'Ocurrió un error inesperado' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true)
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (oauthError) {
        form.setError('root', { message: oauthError.message })
        setIsLoading(false)
      }
    } catch {
      form.setError('root', { message: 'Error al iniciar sesión con ' + provider })
      setIsLoading(false)
    }
  }

  // Stagger animation variants
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
              <span className="text-xl font-bold text-neutral-900">Doctory</span>
            </Link>
          </div>
        </header>

        {/* Main Content - Two Column Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Animated Demo/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-50 rounded-3xl blur-2xl opacity-50" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-neutral-200/50">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="flex flex-col items-center text-center space-y-8"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-200 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <div className="relative w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-lg">
                        <Stethoscope className="w-16 h-16 text-white" strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold text-neutral-900 display-text">
                        Salud digital<br />inteligente
                      </h2>
                      <p className="text-lg text-neutral-600 max-w-md">
                        Conecta con profesionales de la salud de forma rápida, segura y desde cualquier lugar
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 w-full pt-8">
                      {[
                        { icon: '👨‍⚕️', label: 'Doctores verificados' },
                        { icon: '🔒', label: 'Datos seguros' },
                        { icon: '⚡', label: 'Atención inmediata' },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="text-center"
                        >
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <p className="text-xs text-neutral-600 font-medium">{item.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-md mx-auto"
            >
              <Card className="shadow-xl border-neutral-200/50 backdrop-blur-sm bg-white/90">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-bold text-center">Iniciar sesión</CardTitle>
                  <CardDescription className="text-center">
                    Ingresa tus credenciales para acceder a tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                      >
                        {/* User Type Selection */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="userType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de usuario</FormLabel>
                                <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { value: 'patient', label: 'Paciente', icon: UserCircle2 },
                                    { value: 'doctor', label: 'Doctor', icon: Stethoscope },
                                  ].map((type) => (
                                    <button
                                      key={type.value}
                                      type="button"
                                      onClick={() => field.onChange(type.value)}
                                      className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                        field.value === type.value
                                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                                      }`}
                                    >
                                      <type.icon className="w-4 h-4" />
                                      <span className="font-medium text-sm">{type.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Email Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo electrónico</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="tu@email.com"
                                    type="email"
                                    autoComplete="email"
                                    className="h-11"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center justify-between">
                                  <FormLabel>Contraseña</FormLabel>
                                  <Link
                                    href="/auth/forgot-password"
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                                  >
                                    ¿Olvidaste tu contraseña?
                                  </Link>
                                </div>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? 'text' : 'password'}
                                      placeholder="••••••••"
                                      autoComplete="current-password"
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

                        {/* Remember Me */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  Recordarme en este dispositivo
                                </FormLabel>
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
                                Iniciando sesión...
                              </>
                            ) : (
                              'Iniciar sesión'
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>

                      {/* Divider */}
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-neutral-500">O continúa con</span>
                        </div>
                      </div>

                      {/* Social Login Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('google')}
                          disabled={isLoading}
                          className="h-11 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('apple')}
                          disabled={isLoading}
                          className="h-11 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                          </svg>
                          Apple
                        </Button>
                      </div>

                      {/* Sign Up Link */}
                      <p className="text-center text-sm text-neutral-600 pt-4">
                        ¿No tienes cuenta?{' '}
                        <Link
                          href="/auth/register"
                          className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
                        >
                          Regístrate gratis
                        </Link>
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Back to Home */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6"
              >
                <Link
                  href="/"
                  className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Volver al inicio
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  )
}
