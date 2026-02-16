'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormInput, FormTextarea } from '@/components/ui/form-input'
import { Select } from '@/components/Select'
import { LoadingButton } from '@/components/LoadingButton'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/Toast'
import { formatPhoneNumber } from '@/lib/utils'
import { AvatarUpload } from '@/components/AvatarUpload'
import { logger } from '@/lib/observability/logger'
import AppNavigation from '@/components/app/AppNavigation'
import Link from 'next/link'

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

export default function PatientProfilePage() {
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
      logger.error('Error fetching profile', { error: (error as Error).message })
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
      logger.error('Error updating profile', { error: (error as Error).message })
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
      logger.error('Error updating medical history', { error: (error as Error).message })
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

  const handleAddCondition = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value) {
      const currentConditions = historyForm.getValues('chronic_conditions') || []
      if (!currentConditions.includes(value)) {
        historyForm.setValue('chronic_conditions', [...currentConditions, value])
      }
      e.target.value = ''
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
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppNavigation currentPage="/app/profile" />

      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Mi Perfil
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona tu información personal y historial médico
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="bg-white rounded-2xl shadow-card border border-border p-4 sticky top-24">
                <ul className="space-y-2">
                  {[
                    { id: 'personal', label: 'Información Personal', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 01-7-7z' },
                    { id: 'medical', label: 'Historial Médico', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                    { id: 'insurance', label: 'Seguro Médico', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a12.02 12.02 0 003 9c0 5.176-1.332 9-04A12.02 12.02 0 003 6V5a2 2 0 01-2 2H6a3 3 0 01-3 3V9c0 5.591 3.582 9-11.622 5.176-1.332 9-04A12.02 12.02 0 003 6z' },
                    { id: 'emergency', label: 'Contacto de Emergencia', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 01-1.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5a2 2 0 00-2-2H5a2 2 0 01-2 2z' },
                    { id: 'notifications', label: 'Notificaciones', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-4-5.659V5a2 2 0 01-4-4M5 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9m6 0V5a2 2 0 012 2H9m6 0V5a2 2 0 012 2H9m6 0V5a2 2 0 00-2 2H6a3 3 0 01-3 3V9a2 2 0 013 3z' },
                  ].map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
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
                <Card className="animate-fade-in-up">
                  <CardHeader><CardTitle>Información Personal</CardTitle><CardDescription>Actualiza tus datos personales</CardDescription></CardHeader>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                    <CardContent className="space-y-6">
                      {/* Avatar Upload Section */}
                      <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                        <AvatarUpload
                          userId={profileData?.profile.id || ''}
                          currentPhotoUrl={photoUrl}
                          name={profileData?.profile.full_name}
                          size="lg"
                          onUploadComplete={(url) => setPhotoUrl(url || null)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                          label="Nombre completo"
                          {...profileForm.register('full_name')}
                          error={profileForm.formState.errors.full_name?.message}
                          required
                        />
                        <FormInput
                          label="Correo electrónico"
                          type="email"
                          value={profileData?.profile?.email || ''}
                          disabled
                          className="bg-gray-50"
                          title="El correo no se puede modificar"
                        />
                        <FormInput
                          label="Teléfono"
                          type="tel"
                          {...profileForm.register('phone')}
                          error={profileForm.formState.errors.phone?.message}
                          placeholder="+52 55 1234 5678"
                        />
                        <FormInput
                          label="Fecha de nacimiento"
                          type="date"
                          {...profileForm.register('date_of_birth')}
                          error={profileForm.formState.errors.date_of_birth?.message}
                        />
                        <Select
                          label="Género"
                          {...profileForm.register('gender')}
                          options={genderOptions}
                          placeholder="Seleccionar género"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <LoadingButton type="submit" isLoading={savingProfile}>
                        Guardar cambios
                      </LoadingButton>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {activeTab === 'medical' && (
                <form onSubmit={historyForm.handleSubmit(onSubmitMedicalHistory)}>
                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Datos Físicos</CardTitle><CardDescription>Información básica para cálculo de IMC</CardDescription></CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <FormInput
                          label="Altura (cm)"
                          type="number"
                          {...historyForm.register('height_cm', { valueAsNumber: true })}
                          error={historyForm.formState.errors.height_cm?.message}
                          placeholder="170"
                        />
                        <FormInput
                          label="Peso (kg)"
                          type="number"
                          {...historyForm.register('weight_kg', { valueAsNumber: true })}
                          error={historyForm.formState.errors.weight_kg?.message}
                          placeholder="70"
                        />
                        <Select
                          label="Tipo de sangre"
                          {...historyForm.register('blood_type')}
                          options={bloodTypeOptions}
                          placeholder="Seleccionar"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Alergias</CardTitle><CardDescription>Lista de alergias conocidas (presiona Enter para agregar)</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <FormInput
                          placeholder="Ej: Penicilina, Nueces, Polen..."
                          onKeyDown={handleAddAllergy}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(historyForm.watch('allergies') || []).map((allergy, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                            >
                              {allergy}
                              <button
                                type="button"
                                onClick={() => removeAllergy(index)}
                                className="hover:text-red-900"
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

                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Medicamentos Actuales</CardTitle><CardDescription>Medicamentos que tomas actualmente</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {medicationFields.map((field, index) => (
                          <div key={field.id} className="flex gap-4 items-start">
                            <div className="grid grid-cols-3 gap-4 flex-1">
                              <FormInput
                                placeholder="Ej: Paracetamol, Metformina..."
                                {...historyForm.register(`current_medications.${index}.name`)}
                              />
                              <FormInput
                                placeholder="Ej: 500mg, 10ml..."
                                {...historyForm.register(`current_medications.${index}.dosage`)}
                              />
                              <FormInput
                                placeholder="Ej: Cada 8 horas, 2 veces al día..."
                                {...historyForm.register(`current_medications.${index}.frequency`)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMedication(index)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6a2 2 0 002-2H5a2 2 0 00-1-1h-4M4 7h16m4h16M4 7m16 0 012-2H6a3 3 0 01-3 3V9a2 2 0 00-3 3H6a3 3 0 013 3z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => appendMedication({ name: '', dosage: '', frequency: '' })}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          + Agregar medicamento
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Condiciones Crónicas</CardTitle><CardDescription>Enfermedades crónicas diagnosticadas (EPOC = Enfermedad Pulmonar Obstructiva Crónica)</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Select
                          label=""
                          options={conditionOptions}
                          placeholder="Seleccionar condición"
                          onChange={(e) => handleAddCondition(e)}
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(historyForm.watch('chronic_conditions') || []).map((condition, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
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

                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Cirugías Anteriores</CardTitle><CardDescription>Historial de cirugías</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {surgeryFields.map((field, index) => (
                          <div key={field.id} className="flex gap-4 items-start">
                            <div className="grid grid-cols-3 gap-4 flex-1">
                              <FormInput
                                placeholder="Ej: Apendicectomía, Cirugía de rodilla..."
                                {...historyForm.register(`past_surgeries.${index}.procedure`)}
                              />
                              <FormInput
                                type="number"
                                placeholder="Ej: 2020"
                                {...historyForm.register(`past_surgeries.${index}.year`, { valueAsNumber: true })}
                              />
                              <FormInput
                                placeholder="Ej: Sin complicaciones..."
                                {...historyForm.register(`past_surgeries.${index}.notes`)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSurgery(index)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6a2 2 0 002-2H5a2 2 0 00-1-1h-4M4 7h16m4h16M4 7m16 0 012-2H6a3 3 0 01-3 3V9a2 2 0 00-3 3H6a3 3 0 013 3z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => appendSurgery({ procedure: '', year: null, notes: '' })}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          + Agregar cirugía
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Antecedentes Familiares</CardTitle><CardDescription>Enfermedades en la familia</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {familyFields.map((field, index) => (
                          <div key={field.id} className="flex gap-4 items-start">
                            <div className="grid grid-cols-3 gap-4 flex-1">
                              <FormInput
                                placeholder="Ej: Diabetes, Cáncer, Hipertensión..."
                                {...historyForm.register(`family_history.${index}.condition`)}
                              />
                              <Select
                                {...historyForm.register(`family_history.${index}.relationship`)}
                                options={relationshipOptions}
                                placeholder="Parentesco"
                              />
                              <FormInput
                                placeholder="Ej: Tipo 2, diagnosticado en 2018..."
                                {...historyForm.register(`family_history.${index}.notes`)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFamily(index)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6a2 2 0 002-2H5a2 2 0 00-1-1h-4M4 7h16m4h16M4 7m16 0 012-2H6a3 3 0 01-3 3V9a2 2 0 00-3 3H6a3 3 0 013 3z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => appendFamily({ condition: '', relationship: '', notes: '' })}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          + Agregar antecedente
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="animate-fade-in-up mb-6">
                    <CardHeader><CardTitle>Notas Adicionales</CardTitle><CardDescription>Cualquier información médica adicional relevante</CardDescription></CardHeader>
                    <CardContent>
                      <FormTextarea
                        {...historyForm.register('medical_notes')}
                        placeholder="Escribe aquí cualquier información adicional que consideres importante..."
                        rows={4}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <LoadingButton type="submit" isLoading={savingHistory}>
                      Guardar historial médico
                    </LoadingButton>
                  </div>
                </form>
              )}

              {activeTab === 'insurance' && (
                <Card className="animate-fade-in-up">
                  <CardHeader><CardTitle>Información del Seguro Médico</CardTitle><CardDescription>Datos de tu seguro de gastos médicos</CardDescription></CardHeader>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                          label="Proveedor de seguro"
                          {...profileForm.register('insurance_provider')}
                          error={profileForm.formState.errors.insurance_provider?.message}
                          placeholder="Ej: GNP, Allianz, BBVA..."
                        />
                        <FormInput
                          label="Número de póliza"
                          {...profileForm.register('insurance_policy_number')}
                          error={profileForm.formState.errors.insurance_policy_number?.message}
                          placeholder="Ej: 123456789"
                        />
                        <FormInput
                          label="Número de grupo"
                          {...profileForm.register('insurance_group_number')}
                          error={profileForm.formState.errors.insurance_group_number?.message}
                          placeholder="Número de grupo (opcional)"
                        />
                        <FormInput
                          label="Tipo de cobertura"
                          {...profileForm.register('insurance_coverage_type')}
                          error={profileForm.formState.errors.insurance_coverage_type?.message}
                          placeholder="Ej: Básica, Premium..."
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <LoadingButton type="submit" isLoading={savingProfile}>
                        Guardar cambios
                      </LoadingButton>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {activeTab === 'emergency' && (
                <Card className="animate-fade-in-up">
                  <CardHeader><CardTitle>Contacto de Emergencia</CardTitle><CardDescription>Persona a contactar en caso de emergencia</CardDescription></CardHeader>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                          label="Nombre completo"
                          {...profileForm.register('emergency_contact_name')}
                          error={profileForm.formState.errors.emergency_contact_name?.message}
                          placeholder="Ej: María García"
                        />
                        <FormInput
                          label="Teléfono"
                          type="tel"
                          {...profileForm.register('emergency_contact_phone')}
                          error={profileForm.formState.errors.emergency_contact_phone?.message}
                          placeholder="+52 55 1234 5678"
                        />
                        <Select
                          label="Parentesco"
                          {...profileForm.register('emergency_contact_relationship')}
                          options={relationshipOptions}
                          placeholder="Seleccionar parentesco"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <LoadingButton type="submit" isLoading={savingProfile}>
                        Guardar cambios
                      </LoadingButton>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card className="animate-fade-in-up">
                  <CardHeader><CardTitle>Preferencias de Notificaciones</CardTitle><CardDescription>Elige cómo quieres recibir notificaciones</CardDescription></CardHeader>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            {...profileForm.register('notifications_email')}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Notificaciones por Email</p>
                            <p className="text-sm text-gray-500">Recibe confirmaciones y recordatorios por correo electrónico</p>
                          </div>
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002 2v12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 012 2H7a2 2 0 002 2z" />
                          </svg>
                        </label>

                        <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            {...profileForm.register('notifications_sms')}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Notificaciones por SMS</p>
                            <p className="text-sm text-gray-500">Recibe recordatorios por mensaje de texto</p>
                          </div>
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </label>

                        <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            {...profileForm.register('notifications_whatsapp')}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Notificaciones por WhatsApp</p>
                            <p className="text-sm text-gray-500">Recibe recordatorios y actualizaciones por WhatsApp</p>
                          </div>
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 8v4l3 3m-6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </label>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <LoadingButton type="submit" isLoading={savingProfile}>
                        Guardar preferencias
                      </LoadingButton>
                    </CardFooter>
                  </form>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
