'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckCircle } from 'lucide-react'

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'pt', name: 'Portugués' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
]

type Props = {
  user: { email?: string }
  profile: { full_name: string | null; phone: string | null }
  doctor: Record<string, any>
  completedCount: number
  isPending: boolean
}

export default function ProfileForm({ user, profile, doctor, completedCount, isPending }: Props) {
  const router = useRouter()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [bio, setBio] = useState(doctor?.bio || '')
  const [price, setPrice] = useState(doctor?.price_cents ? (doctor.price_cents / 100).toString() : '')
  const [yearsExperience, setYearsExperience] = useState(doctor?.years_experience?.toString() || '')
  const [licenseNumber, setLicenseNumber] = useState(doctor?.license_number || '')
  const [officeAddress, setOfficeAddress] = useState(doctor?.office_address || '')
  const [languages, setLanguages] = useState<string[]>(doctor?.languages || ['es'])
  const [city, setCity] = useState(doctor?.city || '')
  const [stateField, setStateField] = useState(doctor?.state || '')

  const [success, setSuccess] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      const res = await fetch('/api/doctor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          bio,
          price_cents: price ? Math.round(parseFloat(price) * 100) : undefined,
          years_experience: yearsExperience ? parseInt(yearsExperience) : undefined,
          license_number: licenseNumber,
          office_address: officeAddress,
          languages,
          city,
          state: stateField,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        addToast('Perfil actualizado correctamente', 'success')
        router.refresh()
      } else {
        const data = await res.json()
        addToast(data.error || 'Error al guardar los cambios', 'error')
      }
    } catch {
      addToast('Error de conexión al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleLanguage = (code: string) => {
    setLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    )
  }

  return (
    <form onSubmit={handleSave}>
      <Card className="mb-4 gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:mb-6 lg:p-5">
        <CardHeader className="p-0 pb-0">
          <CardTitle className="text-lg lg:text-xl font-semibold">Información personal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Nombre completo
              </Label>
              <Input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Correo electrónico
              </Label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full bg-secondary/50 truncate"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Teléfono
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Ciudad
              </Label>
              <Input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Estado
              </Label>
              <Input
                type="text"
                value={stateField}
                onChange={e => setStateField(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:mb-6 lg:p-5">
        <CardHeader className="p-0 pb-0">
          <CardTitle className="text-lg lg:text-xl font-semibold">Información profesional</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Cédula profesional
              </Label>
              <Input
                type="text"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Años de experiencia
              </Label>
              <Input
                type="number"
                value={yearsExperience}
                onChange={e => setYearsExperience(e.target.value)}
                min="0"
                max="100"
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Dirección del consultorio
              </Label>
              <Input
                type="text"
                value={officeAddress}
                onChange={e => setOfficeAddress(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Biografía profesional
              </Label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-muted-foreground mb-2">
                Idiomas
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {LANGUAGES.map(lang => (
                  <div key={lang.code} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50">
                    <Checkbox
                      id={`lang-${lang.code}`}
                      checked={languages.includes(lang.code)}
                      onCheckedChange={() => toggleLanguage(lang.code)}
                    />
                    <Label htmlFor={`lang-${lang.code}`} className="text-sm text-foreground cursor-pointer">
                      {lang.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:mb-6 lg:p-5">
        <CardHeader className="p-0 pb-0">
          <CardTitle className="text-lg lg:text-xl font-semibold">Tarifas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">
              Precio por consulta
            </Label>
            <div className="flex items-center max-w-xs">
              <span className="text-muted-foreground mr-2">$</span>
              <Input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                min="0"
                step="50"
                className="w-full"
              />
              <span className="text-muted-foreground ml-2">MXN</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isPending && (
        <Card className="gap-4 rounded-[12px] border border-border p-4 shadow-[var(--card-shadow)] lg:p-5">
          <CardHeader className="p-0 pb-0">
            <CardTitle className="text-lg lg:text-xl font-semibold">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Calificación promedio</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">
                  {doctor?.rating_avg?.toFixed(1) || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de reseñas</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{doctor?.rating_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Consultas completadas</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 lg:mt-6 flex gap-4 items-center">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
        {success && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Cambios guardados
          </span>
        )}
      </div>

      {isPending && (
        <div className="mt-4 rounded-[10px] border border-border bg-secondary/50 p-4 lg:mt-6">
          <p className="text-sm text-foreground">
            Tu perfil está en revisión. Algunos campos no se pueden modificar hasta que sea aprobado.
          </p>
        </div>
      )}
    </form>
  )
}
