'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Clock } from 'lucide-react'

interface UnclaimedProfile {
  id: string
  full_name: string
  specialty: string
  city: string
  state: string
  cedula_profesional?: string
  claim_status: string
}

interface ClaimData {
  id: string
  status: string
  cedula_profesional?: string
  id_document_path?: string
  cedula_document_path?: string
  selfie_path?: string
}

export default function ClaimProfilePage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string
  
  const [profile, setProfile] = useState<UnclaimedProfile | null>(null)
  const [claim, setClaim] = useState<ClaimData | null>(null)
  const [step, setStep] = useState<'loading' | 'info' | 'verify' | 'pending' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [cedula, setCedula] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [cedulaFile, setCedulaFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch unclaimed profile
        const response = await fetch(`/api/directory/profiles/${doctorId}`)
        if (!response.ok) {
          throw new Error('Perfil no encontrado')
        }
        const data = await response.json()
        setProfile(data.profile)
        
        if (data.profile.claim_status === 'unclaimed') {
          setStep('info')
        } else {
          // Check if user has a claim
          const claimsResponse = await fetch('/api/directory/claim')
          if (claimsResponse.ok) {
            const claimsData = await claimsResponse.json()
            const existingClaim = claimsData.claims?.find(
              (c: ClaimData & { doctor_profile_id: string }) => c.doctor_profile_id === doctorId
            )
            if (existingClaim) {
              setClaim(existingClaim)
              if (existingClaim.status === 'verification_required') {
                setStep('pending')
              } else if (existingClaim.status === 'claim_pending') {
                setStep('verify')
              } else {
                setStep('pending')
              }
            } else {
              setError('Este perfil ya está siendo reclamado')
              setStep('error')
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setStep('error')
      }
    }
    
    fetchProfile()
  }, [doctorId])

  const handleInitiateClaim = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/directory/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: doctorId,
          cedula_profesional: cedula || profile?.cedula_profesional,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al iniciar reclamo')
      }
      
      const data = await response.json()
      setClaim({ id: data.claim_id, status: data.status })
      setStep('verify')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVerification = async () => {
    if (!claim) return
    
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      if (cedula) formData.append('cedula_profesional', cedula)
      if (idFile) formData.append('id_document', idFile)
      if (cedulaFile) formData.append('cedula_document', cedulaFile)
      if (selfieFile) formData.append('selfie', selfieFile)
      
      const response = await fetch(`/api/directory/claim/${claim.id}/verify`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar verificación')
      }
      
      const data = await response.json()
      setClaim(data.claim)
      setStep('pending')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md p-6 text-center bg-card rounded-2xl border border-border shadow-dx-1">
          <p className="text-destructive">{error}</p>
          <Button className="mt-4" onClick={() => router.push('/doctors')}>
            Volver al directorio
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-xl px-4">
        {/* Profile Card */}
        {profile && (
          <Card className="mb-6 bg-card rounded-2xl border border-border shadow-dx-1 p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {profile.full_name.charAt(0)}
              </div>
              <h1 className="text-xl font-bold text-foreground">{profile.full_name}</h1>
              <p className="text-muted-foreground">{profile.specialty}</p>
              <p className="text-sm text-muted-foreground">{profile.city}, {profile.state}</p>
              {profile.cedula_profesional && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Cédula: {profile.cedula_profesional}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Step: Info - Initiate Claim */}
        {step === 'info' && (
          <Card className="bg-card rounded-2xl border border-border shadow-dx-1 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">¿Es este tu perfil?</h2>
            <p className="mb-6 text-muted-foreground">
              Si eres el Dr./Dra. {profile?.full_name}, puedes reclamar este perfil 
              para administrar tu información y recibir pacientes a través de la plataforma.
            </p>
            
            <div className="mb-6">
              <Label htmlFor="cedula" className="mb-1 block text-sm font-medium text-foreground">
                Cédula Profesional
              </Label>
              <Input
                id="cedula"
                placeholder="Ej: 12345678"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Ingresa tu cédula profesional para verificar tu identidad
              </p>
            </div>
            
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleInitiateClaim} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Procesando...' : 'Reclamar este perfil'}
            </Button>
          </Card>
        )}

        {/* Step: Verify - Upload Documents */}
        {step === 'verify' && (
          <Card className="bg-card rounded-2xl border border-border shadow-dx-1 p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Verificación de Identidad</h2>
            <p className="mb-6 text-muted-foreground">
              Para completar el reclamo, necesitamos verificar tu identidad. 
              Por favor sube los siguientes documentos:
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="id-document" className="mb-1 block text-sm font-medium text-foreground">
                  1. Identificación oficial (INE/Pasaporte) *
                </Label>
                <Input
                  id="id-document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div>
                <Label htmlFor="cedula-document" className="mb-1 block text-sm font-medium text-foreground">
                  2. Cédula Profesional (foto o PDF) *
                </Label>
                <Input
                  id="cedula-document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setCedulaFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div>
                <Label htmlFor="selfie" className="mb-1 block text-sm font-medium text-foreground">
                  3. Selfie sosteniendo tu identificación *
                </Label>
                <Input
                  id="selfie"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Una foto tuya sosteniendo tu INE junto a tu rostro
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <Button 
                variant="secondary"
                onClick={() => setStep('info')}
              >
                Atrás
              </Button>
              <Button 
                onClick={handleSubmitVerification} 
                disabled={loading || !idFile || !cedulaFile || !selfieFile}
                className="flex-1"
              >
                {loading ? 'Enviando...' : 'Enviar para verificación'}
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Pending - Waiting for Review */}
        {step === 'pending' && (
          <Card className="text-center bg-card rounded-2xl border border-border shadow-dx-1 p-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Verificación en Proceso</h2>
            <Badge variant="warning">Pendiente de revisión</Badge>
            <p className="mt-4 text-muted-foreground">
              Tu solicitud ha sido enviada y será revisada en las próximas 24-48 horas.
              Te notificaremos por correo electrónico cuando tu perfil sea verificado.
            </p>
            <Button 
              variant="secondary"
              className="mt-6"
              onClick={() => router.push('/doctors')}
            >
              Volver al directorio
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
