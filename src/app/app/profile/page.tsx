'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { useToast } from '@/hooks/use-toast' - TODO: Implement toast hook
import { Loader2, User, Phone, Calendar, Shield, Bell } from 'lucide-react'
import AppNavigation from '@/components/app/AppNavigation'

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // const { toast } = useToast()
  const toast = ({ title, description, variant }: { title: string, description?: string, variant?: string }) => {
    console.log(`[Toast ${variant || 'info'}]: ${title} - ${description}`)
    alert(`${title}\n${description}`)
  }
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/patient/profile')
        if (response.ok) {
          const data = await response.json()
          reset(data.profile)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        toast({
          title: 'Perfil actualizado',
          description: 'Tus datos han sido guardados correctamente.'
        })
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar tu perfil. Intenta de nuevo.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation currentPage="/app/profile" />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/profile" />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu información personal y configuración
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="medical">
              <Shield className="w-4 h-4 mr-2" />
              Médico
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl bg-teal-100 text-teal-700">
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" type="button">
                      Cambiar foto
                    </Button>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="full_name">Nombre completo</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      className="mt-1"
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        {...register('phone')}
                        className="pl-10"
                        placeholder="+52 55 1234 5678"
                      />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...register('date_of_birth')}
                        className="pl-10"
                      />
                    </div>
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
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                        <Input
                          id="emergency_contact_phone"
                          {...register('emergency_contact_phone')}
                          className="mt-1"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving} className="ml-auto">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
