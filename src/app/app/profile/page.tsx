'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea } from '@/components/Input'
import { Select } from '@/components/Select'
import { LoadingButton } from '@/components/LoadingButton'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { useToast } from '@/components/Toast'

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
          <p className="text-ink-secondary">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-ink-primary">Doctor.mx</span>
          </div>
          <a href="/app" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            ← Volver al inicio
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-ink-primary mb-2">
            Mi Perfil
          </h1>
          <p className="text-lg text-ink-secondary">
            Gestiona tu información personal y historial médico
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-card border border-border p-4 sticky top-24">
              <ul className="space-y-2">
                {[
                  { id: 'personal', label: 'Información Personal', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'medical', label: 'Historial Médico', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                  { id: 'insurance', label: 'Seguro Médico', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { id: 'emergency', label: 'Contacto de Emergencia', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                  { id: 'notifications', label: 'Notificaciones', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                ].map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-ink-secondary hover:bg-secondary-50'
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
                <CardHeader title="Información Personal" subtitle="Actualiza tus datos personales" />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Nombre completo"
                        {...profileForm.register('full_name')}
                        error={profileForm.formState.errors.full_name?.message}
                        required
                      />
                      <Input
                        label="Teléfono"
                        type="tel"
                        {...profileForm.register('phone')}
                        error={profileForm.formState.errors.phone?.message}
                        placeholder="+52 55 1234 5678"
                      />
                      <Input
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
                  </CardBody>
                  <CardFooter>
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
                  <CardHeader title="Datos Físicos" subtitle="Información básica para cálculo de IMC" />
                  <CardBody>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Input
                        label="Altura (cm)"
                        type="number"
                        {...historyForm.register('height_cm', { valueAsNumber: true })}
                        error={historyForm.formState.errors.height_cm?.message}
                        placeholder="170"
                      />
                      <Input
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
                  </CardBody>
                </Card>

                <Card className="animate-fade-in-up mb-6">
                  <CardHeader title="Alergias" subtitle="Lista de alergias conocidas (presiona Enter para agregar)" />
                  <CardBody>
                    <div className="space-y-2">
                      <Input
                        placeholder="Ej: Penicilina, Nueces, Polen..."
                        onKeyDown={handleAddAllergy}
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(historyForm.watch('allergies') || []).map((allergy, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-error-100 text-error-700 rounded-full text-sm"
                          >
                            {allergy}
                            <button
                              type="button"
                              onClick={() => removeAllergy(index)}
                              className="hover:text-error-900"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="animate-fade-in-up mb-6">
                  <CardHeader title="Medicamentos Actuales" subtitle="Medicamentos que tomas actualmente" />
                  <CardBody>
                    <div className="space-y-4">
                      {medicationFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              placeholder="Nombre del medicamento"
                              {...historyForm.register(`current_medications.${index}.name`)}
                            />
                            <Input
                              placeholder="Dosis"
                              {...historyForm.register(`current_medications.${index}.dosage`)}
                            />
                            <Input
                              placeholder="Frecuencia"
                              {...historyForm.register(`current_medications.${index}.frequency`)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="p-2 text-error-600 hover:text-error-700"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  </CardBody>
                </Card>

                <Card className="animate-fade-in-up mb-6">
                  <CardHeader title="Condiciones Crónicas" subtitle="Enfermedades crónicas diagnosticadas" />
                  <CardBody>
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
                            className="inline-flex items-center gap-1 px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm"
                          >
                            {conditionOptions.find(o => o.value === condition)?.label || condition}
                            <button
                              type="button"
                              onClick={() => removeCondition(index)}
                              className="hover:text-warning-900"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="animate-fade-in-up mb-6">
                  <CardHeader title="Cirugías Anteriores" subtitle="Historial de cirugías" />
                  <CardBody>
                    <div className="space-y-4">
                      {surgeryFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              placeholder="Procedimiento"
                              {...historyForm.register(`past_surgeries.${index}.procedure`)}
                            />
                            <Input
                              type="number"
                              placeholder="Año"
                              {...historyForm.register(`past_surgeries.${index}.year`, { valueAsNumber: true })}
                            />
                            <Input
                              placeholder="Notas adicionales"
                              {...historyForm.register(`past_surgeries.${index}.notes`)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSurgery(index)}
                            className="p-2 text-error-600 hover:text-error-700"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  </CardBody>
                </Card>

                <Card className="animate-fade-in-up mb-6">
                  <CardHeader title="Antecedentes Familiares" subtitle="Enfermedades en la familia" />
                  <CardBody>
                    <div className="space-y-4">
                      {familyFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                          <div className="grid grid-cols-3 gap-4 flex-1">
                            <Input
                              placeholder="Condición"
                              {...historyForm.register(`family_history.${index}.condition`)}
                            />
                            <Select
                              {...historyForm.register(`family_history.${index}.relationship`)}
                              options={relationshipOptions}
                              placeholder="Parentesco"
                            />
                            <Input
                              placeholder="Notas"
                              {...historyForm.register(`family_history.${index}.notes`)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFamily(index)}
                            className="p-2 text-error-600 hover:text-error-700"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  </CardBody>
                </Card>

                <Card className="animate-fade-in-up mb-6">
                  <CardHeader title="Notas Adicionales" subtitle="Cualquier información médica adicional relevante" />
                  <CardBody>
                    <Textarea
                      {...historyForm.register('medical_notes')}
                      placeholder="Escribe aquí cualquier información adicional que consideres importante..."
                      rows={4}
                    />
                  </CardBody>
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
                <CardHeader title="Información del Seguro Médico" subtitle="Datos de tu seguro de gastos médicos" />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Proveedor de seguro"
                        {...profileForm.register('insurance_provider')}
                        error={profileForm.formState.errors.insurance_provider?.message}
                        placeholder="Ej: GNP, Allianz, BBVA..."
                      />
                      <Input
                        label="Número de póliza"
                        {...profileForm.register('insurance_policy_number')}
                        error={profileForm.formState.errors.insurance_policy_number?.message}
                        placeholder="Número de póliza"
                      />
                      <Input
                        label="Número de grupo"
                        {...profileForm.register('insurance_group_number')}
                        error={profileForm.formState.errors.insurance_group_number?.message}
                        placeholder="Número de grupo (opcional)"
                      />
                      <Input
                        label="Tipo de cobertura"
                        {...profileForm.register('insurance_coverage_type')}
                        error={profileForm.formState.errors.insurance_coverage_type?.message}
                        placeholder="Ej: Básica, Premium..."
                      />
                    </div>
                  </CardBody>
                  <CardFooter>
                    <LoadingButton type="submit" isLoading={savingProfile}>
                      Guardar cambios
                    </LoadingButton>
                  </CardFooter>
                </form>
              </Card>
            )}

            {activeTab === 'emergency' && (
              <Card className="animate-fade-in-up">
                <CardHeader title="Contacto de Emergencia" subtitle="Persona a contactar en caso de emergencia" />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Nombre completo"
                        {...profileForm.register('emergency_contact_name')}
                        error={profileForm.formState.errors.emergency_contact_name?.message}
                        placeholder="Nombre del contacto"
                      />
                      <Input
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
                  </CardBody>
                  <CardFooter>
                    <LoadingButton type="submit" isLoading={savingProfile}>
                      Guardar cambios
                    </LoadingButton>
                  </CardFooter>
                </form>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="animate-fade-in-up">
                <CardHeader title="Preferencias de Notificaciones" subtitle="Elige cómo quieres recibir notificaciones" />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary-50 transition-colors">
                        <input
                          type="checkbox"
                          {...profileForm.register('notifications_email')}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-ink-primary">Notificaciones por Email</p>
                          <p className="text-sm text-ink-secondary">Recibe confirmaciones y recordatorios por correo electrónico</p>
                        </div>
                        <svg className="w-6 h-6 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </label>

                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary-50 transition-colors">
                        <input
                          type="checkbox"
                          {...profileForm.register('notifications_sms')}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-ink-primary">Notificaciones por SMS</p>
                          <p className="text-sm text-ink-secondary">Recibe recordatorios por mensaje de texto</p>
                        </div>
                        <svg className="w-6 h-6 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </label>

                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-secondary-50 transition-colors">
                        <input
                          type="checkbox"
                          {...profileForm.register('notifications_whatsapp')}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-ink-primary">Notificaciones por WhatsApp</p>
                          <p className="text-sm text-ink-secondary">Recibe recordatorios y actualizaciones por WhatsApp</p>
                        </div>
                        <svg className="w-6 h-6 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </label>
                    </div>
                  </CardBody>
                  <CardFooter>
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
  )
}
