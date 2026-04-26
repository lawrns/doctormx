'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/Toast'
import { formatPhoneNumber, cn } from '@/lib/utils'
import { AvatarUpload } from '@/components/AvatarUpload'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  insurance_provider: z.string().optional().nullable(),
  insurance_policy_number: z.string().optional().nullable(),
  insurance_group_number: z.string().optional().nullable(),
  insurance_coverage_type: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
  notifications_email: z.boolean(),
  notifications_sms: z.boolean(),
  notifications_whatsapp: z.boolean(),
})

const medicalHistorySchema = z.object({
  allergies: z.array(z.string()),
  current_medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })),
  chronic_conditions: z.array(z.string()),
  past_surgeries: z.array(z.object({
    procedure: z.string(),
    year: z.number().nullable(),
    notes: z.string(),
  })),
  family_history: z.array(z.object({
    condition: z.string(),
    relationship: z.string(),
    notes: z.string(),
  })),
  medical_notes: z.string().optional().nullable(),
  blood_type: z.string().optional().nullable(),
  height_cm: z.number().optional().nullable(),
  weight_kg: z.number().optional().nullable(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>

interface PatientProfileData {
  profile: {
    id: string
    full_name: string
    email?: string
    photo_url: string | null
    phone: string | null
    date_of_birth: string | null
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
    insurance_provider: string | null
    insurance_policy_number: string | null
    insurance_group_number: string | null
    insurance_coverage_type: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    emergency_contact_relationship: string | null
    notifications_email: boolean | null
    notifications_sms: boolean | null
    notifications_whatsapp: boolean | null
  }
  medicalHistory: {
    allergies: string[]
    current_medications: Array<{ name: string; dosage: string; frequency: string }>
    chronic_conditions: string[]
    past_surgeries: Array<{ procedure: string; year: number | null; notes: string }>
    family_history: Array<{ condition: string; relationship: string; notes: string }>
    medical_notes: string | null
    blood_type: string | null
    height_cm: number | null
    weight_kg: number | null
  } | null
}

const genderOptions = [
  { value: '', label: 'Seleccionar género' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' },
]

const bloodTypeOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

const relationshipOptions = [
  { value: 'spouse', label: 'Cónyuge' },
  { value: 'parent', label: 'Padre/Madre' },
  { value: 'sibling', label: 'Hermano/Hermana' },
  { value: 'child', label: 'Hijo/Hija' },
  { value: 'friend', label: 'Amigo/Amiga' },
  { value: 'other', label: 'Otro' },
]

const conditionOptions = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hipertensión' },
  { value: 'heart_disease', label: 'Enfermedad cardíaca' },
  { value: 'asthma', label: 'Asma' },
  { value: 'copd', label: 'EPOC' },
  { value: 'cancer', label: 'Cáncer' },
  { value: 'arthritis', label: 'Artritis' },
  { value: 'depression', label: 'Depresión' },
  { value: 'anxiety', label: 'Ansiedad' },
  { value: 'other', label: 'Otro' },
]

export default function PatientProfileClient() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingHistory, setSavingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'insurance' | 'emergency' | 'notifications'>('personal')
  const [profileData, setProfileData] = useState<PatientProfileData | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      date_of_birth: '',
      gender: null,
      insurance_provider: '',
      insurance_policy_number: '',
      insurance_group_number: '',
      insurance_coverage_type: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      notifications_email: true,
      notifications_sms: true,
      notifications_whatsapp: true,
    },
  })

  const historyForm = useForm<MedicalHistoryFormData>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      allergies: [],
      current_medications: [],
      chronic_conditions: [],
      past_surgeries: [],
      family_history: [],
      medical_notes: '',
      blood_type: '',
      height_cm: undefined,
      weight_kg: undefined,
    },
  })

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control: historyForm.control,
    name: 'current_medications',
  })

  const { fields: surgeryFields, append: appendSurgery, remove: removeSurgery } = useFieldArray({
    control: historyForm.control,
    name: 'past_surgeries',
  })

  const { fields: familyFields, append: appendFamily, remove: removeFamily } = useFieldArray({
    control: historyForm.control,
    name: 'family_history',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/patient/profile')
      if (response.ok) {
        const data: PatientProfileData = await response.json()
        setProfileData(data)
        setPhotoUrl(data.profile.photo_url)
        profileForm.reset({
          full_name: data.profile.full_name,
          phone: data.profile.phone || '',
          date_of_birth: data.profile.date_of_birth || '',
          gender: data.profile.gender,
          insurance_provider: data.profile.insurance_provider || '',
          insurance_policy_number: data.profile.insurance_policy_number || '',
          insurance_group_number: data.profile.insurance_group_number || '',
          insurance_coverage_type: data.profile.insurance_coverage_type || '',
          emergency_contact_name: data.profile.emergency_contact_name || '',
          emergency_contact_phone: data.profile.emergency_contact_phone || '',
          emergency_contact_relationship: data.profile.emergency_contact_relationship || '',
          notifications_email: data.profile.notifications_email ?? true,
          notifications_sms: data.profile.notifications_sms ?? true,
          notifications_whatsapp: data.profile.notifications_whatsapp ?? true,
        })

        if (data.medicalHistory) {
          historyForm.reset({
            allergies: data.medicalHistory.allergies || [],
            current_medications: data.medicalHistory.current_medications || [],
            chronic_conditions: data.medicalHistory.chronic_conditions || [],
            past_surgeries: data.medicalHistory.past_surgeries || [],
            family_history: data.medicalHistory.family_history || [],
            medical_notes: data.medicalHistory.medical_notes || '',
            blood_type: data.medicalHistory.blood_type || '',
            height_cm: data.medicalHistory.height_cm || undefined,
            weight_kg: data.medicalHistory.weight_kg || undefined,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      addToast('Error al cargar el perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitProfile: SubmitHandler<ProfileFormData> = async (data) => {
    setSavingProfile(true)
    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        addToast('Perfil actualizado exitosamente', 'success')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      addToast('Error al actualizar el perfil', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const onSubmitMedicalHistory: SubmitHandler<MedicalHistoryFormData> = async (data) => {
    setSavingHistory(true)
    try {
      const response = await fetch('/api/patient/medical-history', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        addToast('Historial médico actualizado exitosamente', 'success')
      } else {
        throw new Error('Failed to update medical history')
      }
    } catch (error) {
      console.error('Error updating medical history:', error)
      addToast('Error al actualizar el historial médico', 'error')
    } finally {
      setSavingHistory(false)
    }
  }

  const handleAddAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault()
      const currentAllergies = historyForm.getValues('allergies') || []
      if (!currentAllergies.includes(e.currentTarget.value.trim())) {
        historyForm.setValue('allergies', [...currentAllergies, e.currentTarget.value.trim()])
      }
      e.currentTarget.value = ''
    }
  }

  const removeAllergy = (index: number) => {
    const currentAllergies = historyForm.getValues('allergies') || []
    historyForm.setValue(
      'allergies',
      currentAllergies.filter((_, i) => i !== index)
    )
  }

  const handleAddCondition = (value: string) => {
    if (value) {
      const currentConditions = historyForm.getValues('chronic_conditions') || []
      if (!currentConditions.includes(value)) {
        historyForm.setValue('chronic_conditions', [...currentConditions, value])
      }
    }
  }

  const removeCondition = (index: number) => {
    const currentConditions = historyForm.getValues('chronic_conditions') || []
    historyForm.setValue(
      'chronic_conditions',
      currentConditions.filter((_, i) => i !== index)
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  const tabItems = [
    { id: 'personal', label: 'Información Personal', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'medical', label: 'Historial Médico', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { id: 'insurance', label: 'Seguro Médico', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'emergency', label: 'Contacto de Emergencia', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
    { id: 'notifications', label: 'Notificaciones', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">
            Mi Perfil
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tu información personal y historial médico
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-card rounded-2xl border border-border shadow-sm p-4 sticky top-24">
              <ul className="space-y-1">
                {tabItems.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex-1">
            {activeTab === 'personal' && (
              <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display text-lg font-semibold">Información Personal</CardTitle>
                  <p className="text-sm text-muted-foreground">Actualiza tus datos personales</p>
                </CardHeader>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardContent className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center pb-6 border-b border-border">
                      <AvatarUpload
                        userId={profileData?.profile.id || ''}
                        currentPhotoUrl={photoUrl}
                        name={profileData?.profile.full_name}
                        size="lg"
                        onUploadComplete={(url) => setPhotoUrl(url || null)}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre completo <span className="text-destructive">*</span></Label>
                        <Input
                          id="full_name"
                          {...profileForm.register('full_name')}
                          aria-invalid={!!profileForm.formState.errors.full_name}
                        />
                        {profileForm.formState.errors.full_name && (
                          <p className="text-sm text-destructive">{profileForm.formState.errors.full_name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData?.profile?.email || ''}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">El correo no se puede modificar</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...profileForm.register('phone')}
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          {...profileForm.register('date_of_birth')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Género</Label>
                        <Controller
                          control={profileForm.control}
                          name="gender"
                          render={({ field }) => (
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar género" />
                              </SelectTrigger>
                              <SelectContent>
                                {genderOptions.filter(o => o.value).map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-6 flex justify-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {activeTab === 'medical' && (
              <form onSubmit={historyForm.handleSubmit(onSubmitMedicalHistory)} className="space-y-6">
                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Datos Físicos</CardTitle>
                    <p className="text-sm text-muted-foreground">Información básica para cálculo de IMC</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="height_cm">Altura (cm)</Label>
                        <Input
                          id="height_cm"
                          type="number"
                          {...historyForm.register('height_cm', { valueAsNumber: true })}
                          placeholder="170"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight_kg">Peso (kg)</Label>
                        <Input
                          id="weight_kg"
                          type="number"
                          {...historyForm.register('weight_kg', { valueAsNumber: true })}
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de sangre</Label>
                        <Controller
                          control={historyForm.control}
                          name="blood_type"
                          render={({ field }) => (
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                              <SelectContent>
                                {bloodTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Alergias</CardTitle>
                    <p className="text-sm text-muted-foreground">Lista de alergias conocidas (presiona Enter para agregar)</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Input
                        placeholder="Ej: Penicilina, Nueces, Polen..."
                        onKeyDown={handleAddAllergy}
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(historyForm.watch('allergies') || []).map((allergy, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                          >
                            {allergy}
                            <button
                              type="button"
                              onClick={() => removeAllergy(index)}
                              className="hover:text-destructive/80"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Medicamentos Actuales</CardTitle>
                    <p className="text-sm text-muted-foreground">Medicamentos que tomas actualmente</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medicationFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              placeholder="Ej: Paracetamol, Metformina..."
                              {...historyForm.register(`current_medications.${index}.name`)}
                            />
                            <Input
                              placeholder="Ej: 500mg, 10ml..."
                              {...historyForm.register(`current_medications.${index}.dosage`)}
                            />
                            <Input
                              placeholder="Ej: Cada 8 horas, 2 veces al día..."
                              {...historyForm.register(`current_medications.${index}.frequency`)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMedication(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendMedication({ name: '', dosage: '', frequency: '' })}
                      >
                        + Agregar medicamento
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Condiciones Crónicas</CardTitle>
                    <p className="text-sm text-muted-foreground">Enfermedades crónicas diagnosticadas (EPOC = Enfermedad Pulmonar Obstructiva Crónica)</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Select onValueChange={handleAddCondition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar condición" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(historyForm.watch('chronic_conditions') || []).map((condition, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                          >
                            {conditionOptions.find(o => o.value === condition)?.label || condition}
                            <button
                              type="button"
                              onClick={() => removeCondition(index)}
                              className="hover:text-yellow-900"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Cirugías Anteriores</CardTitle>
                    <p className="text-sm text-muted-foreground">Historial de cirugías</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {surgeryFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              placeholder="Ej: Apendicectomía, Cirugía de rodilla..."
                              {...historyForm.register(`past_surgeries.${index}.procedure`)}
                            />
                            <Input
                              type="number"
                              placeholder="Ej: 2020"
                              {...historyForm.register(`past_surgeries.${index}.year`, { valueAsNumber: true })}
                            />
                            <Input
                              placeholder="Ej: Sin complicaciones..."
                              {...historyForm.register(`past_surgeries.${index}.notes`)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSurgery(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendSurgery({ procedure: '', year: null, notes: '' })}
                      >
                        + Agregar cirugía
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Antecedentes Familiares</CardTitle>
                    <p className="text-sm text-muted-foreground">Enfermedades en la familia</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {familyFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              placeholder="Ej: Diabetes, Cáncer, Hipertensión..."
                              {...historyForm.register(`family_history.${index}.condition`)}
                            />
                            <Controller
                              control={historyForm.control}
                              name={`family_history.${index}.relationship`}
                              render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Parentesco" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {relationshipOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Input
                              placeholder="Ej: Tipo 2, diagnosticado en 2018..."
                              {...historyForm.register(`family_history.${index}.notes`)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFamily(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendFamily({ condition: '', relationship: '', notes: '' })}
                      >
                        + Agregar antecedente
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display text-lg font-semibold">Notas Adicionales</CardTitle>
                    <p className="text-sm text-muted-foreground">Cualquier información médica adicional relevante</p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      {...historyForm.register('medical_notes')}
                      placeholder="Escribe aquí cualquier información adicional que consideres importante..."
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingHistory}>
                    {savingHistory ? 'Guardando...' : 'Guardar historial médico'}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'insurance' && (
              <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display text-lg font-semibold">Información del Seguro Médico</CardTitle>
                  <p className="text-sm text-muted-foreground">Datos de tu seguro de gastos médicos</p>
                </CardHeader>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="insurance_provider">Proveedor de seguro</Label>
                        <Input
                          id="insurance_provider"
                          {...profileForm.register('insurance_provider')}
                          placeholder="Ej: GNP, Allianz, BBVA..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insurance_policy_number">Número de póliza</Label>
                        <Input
                          id="insurance_policy_number"
                          {...profileForm.register('insurance_policy_number')}
                          placeholder="Ej: 123456789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insurance_group_number">Número de grupo</Label>
                        <Input
                          id="insurance_group_number"
                          {...profileForm.register('insurance_group_number')}
                          placeholder="Número de grupo (opcional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insurance_coverage_type">Tipo de cobertura</Label>
                        <Input
                          id="insurance_coverage_type"
                          {...profileForm.register('insurance_coverage_type')}
                          placeholder="Ej: Básica, Premium..."
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-6 flex justify-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {activeTab === 'emergency' && (
              <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display text-lg font-semibold">Contacto de Emergencia</CardTitle>
                  <p className="text-sm text-muted-foreground">Persona a contactar en caso de emergencia</p>
                </CardHeader>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name">Nombre completo</Label>
                        <Input
                          id="emergency_contact_name"
                          {...profileForm.register('emergency_contact_name')}
                          placeholder="Ej: María García"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                        <Input
                          id="emergency_contact_phone"
                          type="tel"
                          {...profileForm.register('emergency_contact_phone')}
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parentesco</Label>
                        <Controller
                          control={profileForm.control}
                          name="emergency_contact_relationship"
                          render={({ field }) => (
                            <Select value={field.value || ''} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar parentesco" />
                              </SelectTrigger>
                              <SelectContent>
                                {relationshipOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-6 flex justify-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="rounded-2xl border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display text-lg font-semibold">Preferencias de Notificaciones</CardTitle>
                  <p className="text-sm text-muted-foreground">Elige cómo quieres recibir notificaciones</p>
                </CardHeader>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="checkbox"
                          {...profileForm.register('notifications_email')}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Notificaciones por Email</p>
                          <p className="text-sm text-muted-foreground">Recibe confirmaciones y recordatorios por correo electrónico</p>
                        </div>
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </label>

                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="checkbox"
                          {...profileForm.register('notifications_sms')}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Notificaciones por SMS</p>
                          <p className="text-sm text-muted-foreground">Recibe recordatorios por mensaje de texto</p>
                        </div>
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </label>

                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                        <input
                          type="checkbox"
                          {...profileForm.register('notifications_whatsapp')}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">Notificaciones por WhatsApp</p>
                          <p className="text-sm text-muted-foreground">Recibe recordatorios y actualizaciones por WhatsApp</p>
                        </div>
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-6 flex justify-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? 'Guardando...' : 'Guardar preferencias'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
