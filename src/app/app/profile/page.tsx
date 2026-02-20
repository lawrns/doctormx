'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Phone, Calendar, Shield, Bell, Check } from 'lucide-react'
import AppNavigation from '@/components/app/AppNavigation'
import { logger } from '@/lib/observability/logger'
import { apiRequest, APIError } from '@/lib/api'
import { FormValidationAnnouncer, FormErrorSummary, FieldErrorMessage } from '@/components/ui/FormValidationAnnouncer'

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().refine((val) => !val || /^\+?[0-9\s-]{10,}$/.test(val), {
    message: 'Número de teléfono inválido',
  }).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  emergency_contact_name: z.string().optional().or(z.literal('')),
  emergency_contact_phone: z.string().refine((val) => !val || /^\+?[0-9\s-]{10,}$/.test(val), {
    message: 'Número de teléfono inválido',
  }).optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [validatedFields, setValidatedFields] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
    watch,
    trigger
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
  })

  const formValues = watch()

  // Announce validation errors to screen readers
  const announceValidation = (fieldName: string, message: string, isValid: boolean) => {
    if (isValid) {
      setAnnouncement(`${fieldName} es válido`)
    } else {
      setAnnouncement(`Error en ${fieldName}: ${message}`)
    }
  }

  // Handle field validation with visual feedback
  const handleFieldValidation = async (fieldName: keyof ProfileFormData) => {
    const isValid = await trigger(fieldName)
    setValidatedFields(prev => ({ ...prev, [fieldName]: isValid }))
    
    if (isValid) {
      announceValidation(fieldName as string, '', true)
    } else if (errors[fieldName]) {
      announceValidation(fieldName as string, errors[fieldName]?.message || '', false)
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiRequest<{ profile: ProfileFormData }>('/api/patient/profile', {
          method: 'GET',
        })
        reset(response.data.profile)
        setAnnouncement('Perfil cargado correctamente')
      } catch (error) {
        const apiError = error as APIError
        
        if (apiError.code === 'TIMEOUT') {
          setAnnouncement('Error: Tiempo de espera excedido')
          logger.warn('Timeout loading profile')
        } else if (apiError.code === 'NETWORK_ERROR') {
          setAnnouncement('Error: Verifica tu conexión a internet')
          logger.warn('Network error loading profile')
        }
        
        logger.error('Error loading profile', { 
          error: apiError.message,
          code: apiError.code,
          status: apiError.status 
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    setAnnouncement('Guardando cambios...')
    
    try {
      await apiRequest('/api/patient/profile', {
        method: 'PUT',
        body: data,
      })
      
      setAnnouncement('Perfil actualizado exitosamente')
    } catch (error) {
      const apiError = error as APIError
      
      if (apiError.code === 'TIMEOUT') {
        setAnnouncement('Error: Tiempo de espera excedido al guardar')
      } else if (apiError.code === 'NETWORK_ERROR') {
        setAnnouncement('Error de conexión al guardar')
      } else {
        setAnnouncement(`Error al guardar: ${apiError.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  const onError = () => {
    // Announce errors
    const errorMessages = Object.entries(errors).map(([field, err]) => {
      return `${field}: ${err?.message || 'Error de validación'}`
    }).join('. ')
    setAnnouncement(`Errores en el formulario: ${errorMessages}`)
  }

  // Get visible errors for summary
  const visibleErrors = Object.entries(errors).reduce((acc, [key, err]) => {
    if (err?.message && touchedFields[key as keyof ProfileFormData]) {
      acc[key] = err.message
    }
    return acc
  }, {} as Record<string, string>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation currentPage="/app/profile" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
            <span className="sr-only">Cargando perfil...</span>
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" aria-hidden="true" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FormValidationAnnouncer message={announcement} politeness="polite" />
      
      <AppNavigation currentPage="/app/profile" />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y configuración
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto" aria-label="Secciones del perfil">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" aria-hidden="true" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="medical">
              <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
              Médico
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" aria-hidden="true" />
              Notificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tus datos personales y de contacto
                </CardDescription>
              </CardHeader>
              
              {/* Error Summary */}
              {Object.keys(visibleErrors).length > 0 && (
                <CardContent>
                  <FormErrorSummary errors={visibleErrors} />
                </CardContent>
              )}

              <form ref={formRef} onSubmit={handleSubmit(onSubmit, onError)}>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="" alt="Foto de perfil" />
                      <AvatarFallback className="text-2xl bg-teal-100 text-teal-700">
                        <User className="w-8 h-8" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" type="button">
                      Cambiar foto
                    </Button>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="full_name">
                      Nombre completo
                      <span className="text-destructive ml-1" aria-hidden="true">*</span>
                      <span className="sr-only">(requerido)</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="full_name"
                        {...register('full_name', {
                          onBlur: () => handleFieldValidation('full_name')
                        })}
                        aria-invalid={!!errors.full_name}
                        aria-describedby={errors.full_name ? "full_name-error" : undefined}
                        aria-required="true"
                        className={validatedFields.full_name && !errors.full_name ? "border-green-500 pr-10" : ""}
                      />
                      {validatedFields.full_name && !errors.full_name && formValues.full_name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <FieldErrorMessage
                      errorId="full_name-error"
                      error={errors.full_name?.message || null}
                      touched={touchedFields.full_name || false}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <Input
                        id="phone"
                        {...register('phone', {
                          onBlur: () => handleFieldValidation('phone')
                        })}
                        className={`pl-10 ${validatedFields.phone && !errors.phone && formValues.phone ? "border-green-500" : ""}`}
                        placeholder="+52 55 1234 5678"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                      />
                      {validatedFields.phone && !errors.phone && formValues.phone && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
                      Opcional, formato: +52 55 1234 5678
                    </p>
                    <FieldErrorMessage
                      errorId="phone-error"
                      error={errors.phone?.message || null}
                      touched={touchedFields.phone || false}
                    />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...register('date_of_birth')}
                        className="pl-10"
                        aria-describedby="dob-hint"
                      />
                    </div>
                    <p id="dob-hint" className="text-xs text-muted-foreground mt-1">
                      Opcional, para recomendaciones personalizadas
                    </p>
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Contacto de Emergencia
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="emergency_contact_name">Nombre</Label>
                        <Input
                          id="emergency_contact_name"
                          {...register('emergency_contact_name')}
                          className="mt-1"
                          aria-describedby="emergency-name-hint"
                        />
                        <p id="emergency-name-hint" className="text-xs text-muted-foreground mt-1">
                          Opcional
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                        <div className="relative mt-1">
                          <Input
                            id="emergency_contact_phone"
                            {...register('emergency_contact_phone', {
                              onBlur: () => handleFieldValidation('emergency_contact_phone')
                            })}
                            placeholder="+52 55 1234 5678"
                            className={validatedFields.emergency_contact_phone && !errors.emergency_contact_phone && formValues.emergency_contact_phone ? "border-green-500" : ""}
                            aria-invalid={!!errors.emergency_contact_phone}
                            aria-describedby={errors.emergency_contact_phone ? "emergency-phone-error" : "emergency-phone-hint"}
                          />
                          {validatedFields.emergency_contact_phone && !errors.emergency_contact_phone && formValues.emergency_contact_phone && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" aria-hidden="true">
                              <Check className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <p id="emergency-phone-hint" className="text-xs text-muted-foreground mt-1">
                          Opcional
                        </p>
                        <FieldErrorMessage
                          errorId="emergency-phone-error"
                          error={errors.emergency_contact_phone?.message || null}
                          touched={touchedFields.emergency_contact_phone || false}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving} className="ml-auto">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Información Médica</CardTitle>
                <CardDescription>
                  Tu historial médico y alergias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <p>Próximamente: Gestión de historial médico</p>
                  <p className="text-sm mt-2">
                    Podrás agregar alergias, medicamentos y condiciones crónicas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificación</CardTitle>
                <CardDescription>
                  Configura cómo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <p>Próximamente: Configuración de notificaciones</p>
                  <p className="text-sm mt-2">
                    Podrás elegir entre email, SMS y WhatsApp
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
