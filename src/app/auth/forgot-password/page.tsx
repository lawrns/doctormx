'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, Variants } from 'framer-motion'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <div className="space-y-1 pb-6">
            {isEmailSent ? (
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
                  Revisa tu correo
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  Hemos enviado instrucciones para restablecer tu contrasena a{' '}
                  <span className="font-medium text-foreground">{sentToEmail}</span>
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
                  <Mail className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">
                  Recuperar contrasena
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  Ingresa tu correo electronico y te enviaremos instrucciones para restablecer tu contrasena
                </p>
              </>
            )}
          </div>

          <div>
            {isEmailSent ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <motion.div variants={itemVariants}>
                  <p className="text-sm text-muted-foreground text-center">
                    Si no ves el correo en tu bandeja de entrada, revisa la carpeta de spam.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="rounded-lg border border-border bg-muted p-4 text-sm text-foreground">
                    El enlace de recuperación te llevará a una página segura para crear una nueva contraseña. Si tardas demasiado en usarlo, podrás solicitar uno nuevo.
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
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
                      className="w-full"
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
                        className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                      >
                        <p className="text-sm text-destructive font-medium">
                          {form.formState.errors.root.message}
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
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Volver al inicio de sesion
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  )
}
