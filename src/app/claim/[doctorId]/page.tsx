'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import AppNavigation from '@/components/app/AppNavigation'

interface UnclaimedProfile {
  id: string
  full_name: string
  specialty: string
  city: string
  state: string
  cedula_profesional?: string
  claim_status: string
}

export default function ClaimProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string
  
  const [profile, setProfile] = useState<UnclaimedProfile | null>(null)
  const [step, setStep] = useState<'loading' | 'info' | 'verify' | 'pending' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [cedula, setCedula] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [cedulaFile, setCedulaFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/directory/profiles/${doctorId}`)
        
        if (!response.ok) {
          throw new Error('Perfil no encontrado')
        }
        
        const data = await response.json()
        setProfile(data.profile)
        
        if (data.profile.claim_status === 'claimed') {
          setStep('error')
          setError('Este perfil ya ha sido reclamado')
        } else if (data.profile.claim_status === 'pending') {
          setStep('pending')
        } else {
          setStep('info')
        }
      } catch (err) {
        setStep('error')
        setError('No se pudo cargar el perfil')
      }
    }
    
    fetchProfile()
  }, [doctorId])

  const handleSubmitInfo = async () => {
    if (!cedula.trim()) {
      setError('Por favor ingresa tu cédula profesional')
      return
    }
    
    setError(null)
    setStep('verify')
  }

  const handleSubmitVerification = async () => {
    if (!idFile || !cedulaFile) {
      setError('Por favor sube todos los documentos requeridos')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('cedula', cedula)
      formData.append('idFile', idFile)
      formData.append('cedulaFile', cedulaFile)
      
      const response = await fetch(`/api/directory/claim/${doctorId}`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        setStep('pending')
      } else {
        throw new Error('Error al enviar la solicitud')
      }
    } catch (err) {
      setError('Error al enviar la verificación. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        </main>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600">{error || 'No se pudo procesar tu solicitud'}</p>
              <Button onClick={() => router.push('/doctores')} className="mt-4">
                Volver al directorio
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reclamar Perfil</h1>
          <p className="text-gray-600 mt-2">
            Verifica que eres el propietario de este perfil médico
          </p>
        </div>

        {/* Step 1: Info */}
        {step === 'info' && profile && (
          <Card>
            <CardHeader>
              <CardTitle>{profile.full_name}</CardTitle>
              <CardDescription>{profile.specialty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-medium">{profile.city}, {profile.state}</p>
              </div>
              
              <div>
                <Label htmlFor="cedula">Cédula Profesional</Label>
                <Input
                  id="cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tu cédula profesional para verificar tu identidad
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmitInfo} className="w-full">
                Continuar
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Verify */}
        {step === 'verify' && (
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Identidad</CardTitle>
              <CardDescription>
                Sube los documentos requeridos para verificar que eres el médico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Identificación Oficial (INE/Pasaporte)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="idFile"
                  />
                  <label htmlFor="idFile" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {idFile ? idFile.name : 'Haz clic para subir tu INE'}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <Label>Cédula Profesional (Foto/Scan)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setCedulaFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="cedulaFile"
                  />
                  <label htmlFor="cedulaFile" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {cedulaFile ? cedulaFile.name : 'Haz clic para subir tu cédula'}
                    </p>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                Atrás
              </Button>
              <Button 
                onClick={handleSubmitVerification} 
                disabled={loading || !idFile || !cedulaFile}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar para verificación'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Pending */}
        {step === 'pending' && (
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verificación en Proceso
              </h2>
              <Badge variant="secondary" className="mb-4">Pendiente de revisión</Badge>
              <p className="text-gray-600 max-w-md mx-auto">
                Tu solicitud ha sido enviada y será revisada en las próximas 24-48 horas.
                Te notificaremos por correo electrónico cuando tu perfil sea verificado.
              </p>
              <Button onClick={() => router.push('/doctores')} className="mt-6">
                Volver al directorio
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
