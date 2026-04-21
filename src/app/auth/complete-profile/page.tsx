'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  fullName: z.string().min(1, 'El nombre es obligatorio'),
  phone: z.string().optional(),
  role: z.enum(['patient', 'doctor']),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()
  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      role: 'patient',
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (!supabase) {
      setError('Authentication not available')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user record already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingUser) {
        // User exists, update the record
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
            phone: data.phone || null,
            role: data.role,
          })
          .eq('id', user.id)

        if (updateError) {
          throw new Error(updateError.message || 'Failed to update user profile')
        }
      } else {
        // User doesn't exist, create new record
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: data.fullName,
            phone: data.phone || null,
            role: data.role,
          })

        if (insertError) {
          throw new Error(insertError.message || 'Failed to create user profile')
        }
      }

      // If doctor, create doctor record (will be completed in onboarding)
      if (data.role === 'doctor') {
        try {
          // Check if doctor record already exists
          const { data: existingDoctor } = await supabase
            .from('doctors')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!existingDoctor) {
            // Doctor doesn't exist, create new record with defaults
            // The id references profiles.id directly
            const { error: doctorError } = await supabase
              .from('doctors')
              .insert({
                id: user.id,
                price_cents: 50000, // Default $500 MXN
                status: 'draft',
              })

            if (doctorError) {
              console.error('Doctor insert error:', doctorError)
            }
          }
        } catch (doctorError) {
          console.error('Doctor record error (non-blocking):', doctorError)
          // Don't throw - doctor record will be created in onboarding if needed
        }
      }

      // Redirect to appropriate dashboard
      const nextPath = data.role === 'doctor' ? '/doctor/onboarding' : '/app'
      setSuccessMessage(data.role === 'doctor'
        ? 'Perfil guardado. Ahora te llevaremos a completar tu perfil profesional.'
        : 'Perfil guardado. Ahora te llevaremos a tu panel para empezar a usar Doctor.mx.')
      addToast('Perfil guardado correctamente.', 'success')
      await router.push(nextPath)
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear perfil'
      console.error('Profile creation error:', errorMessage)
      setError('Error al crear perfil. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-foreground">Doctor.mx</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border shadow-dx-1 p-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
            Completa tu perfil
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Necesitamos algunos datos para continuar
          </p>

          <div className="mb-6 grid gap-3">
            <div className={cn(
              'rounded-xl border p-3 text-sm',
              form.watch('role') === 'patient'
                ? 'bg-muted border-border text-foreground'
                : 'bg-muted border-border text-foreground'
            )}>
              {form.watch('role') === 'patient'
                ? 'Completa tu perfil para guardar tus citas, consultas y seguimiento en un solo lugar.'
                : 'Completa tu perfil para continuar con onboarding, verificación y configuración de tu práctica.'}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm">
              {successMessage}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+52 55 1234 5678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Cómo usarás Doctor.mx?</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <Card
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary',
                          field.value === 'patient'
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        )}
                        onClick={() => field.onChange('patient')}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className="w-10 h-10 mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="font-medium text-foreground">Paciente</div>
                          <div className="text-xs text-muted-foreground">Buscar doctores</div>
                        </CardContent>
                      </Card>
                      <Card
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary',
                          field.value === 'doctor'
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        )}
                        onClick={() => field.onChange('doctor')}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className="w-10 h-10 mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="font-medium text-foreground">Doctor</div>
                          <div className="text-xs text-muted-foreground">Ofrecer consultas</div>
                        </CardContent>
                      </Card>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading || !form.watch('fullName')}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
