'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, Variants } from 'framer-motion'
import { Loader2, Heart, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

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

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electronico invalido'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)

    if (!supabase) {
      form.setError('root', { message: 'Autenticacion no disponible' })
      setIsLoading(false)
      return
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        form.setError('root', { message: resetError.message })
      } else {
        setSentToEmail(data.email)
        setIsEmailSent(true)
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
                {isEmailSent ? (
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
                      Revisa tu correo
                    </CardTitle>
                    <CardDescription className="text-center">
                      Hemos enviado instrucciones para restablecer tu contrasena a{' '}
                      <span className="font-medium text-neutral-900">{sentToEmail}</span>
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
                      <Mail className="w-8 h-8 text-primary-500" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-center">
                      Recuperar contrasena
                    </CardTitle>
                    <CardDescription className="text-center">
                      Ingresa tu correo electronico y te enviaremos instrucciones para restablecer tu contrasena
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent>
                {isEmailSent ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <motion.div variants={itemVariants}>
                      <p className="text-sm text-neutral-600 text-center">
                        Si no ves el correo en tu bandeja de entrada, revisa la carpeta de spam.
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => {
                          setIsEmailSent(false)
                          form.reset()
                        }}
                      >
                        Enviar de nuevo
                      </Button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Link href="/auth/login">
                        <Button
                          type="button"
                          className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Volver al inicio de sesion
                        </Button>
                      </Link>
                    </motion.div>
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
                        {/* Email Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo electronico</FormLabel>
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
                                Enviando...
                              </>
                            ) : (
                              'Enviar instrucciones'
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </form>
                  </Form>
                )}

                {/* Back to Login Link */}
                {!isEmailSent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-6"
                  >
                    <Link
                      href="/auth/login"
                      className="text-neutral-500 hover:text-neutral-900 text-sm transition-colors inline-flex items-center gap-2 group"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      Volver al inicio de sesion
                    </Link>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  )
}
