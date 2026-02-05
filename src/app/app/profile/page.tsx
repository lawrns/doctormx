'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea } from '@/components/Input'
import { Select } from '@/components/Select'
import { LoadingButton } from '@/components/LoadingButton'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { useToast } from '@/components/Toast'
import { formatPhoneNumber } from '@/lib/utils'
import { AvatarUpload } from '@/components/AvatarUpload'
import { Switch } from '@/components/ui/switch'
import {
  User,
  HeartPulse,
  Shield,
  Phone,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Lock,
  Calendar,
  Scale,
  Ruler,
  Info,
  AlertCircle,
  Camera,
  X,
  Mail,
  MessageCircle,
  LogOut
} from 'lucide-react'

// ========================================
// SCHEMAS
// ========================================

const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  insurance_provider: z.string().optional().nullable(),
  insurance_policy_number: z.string().optional().nullable(),
  insurance_group_number: z.string().optional().nullable(),
  insurance_coverage_type: z.string().optional().nullable(),
  insurance_expires_at: z.string().optional().nullable(),
  emergency_contacts: z.array(z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
    secondary_phone: z.string().optional(),
  })).min(1, 'Al menos un contacto de emergencia es requerido').max(3, 'Máximo 3 contactos'),
  notifications_appointments: z.boolean(),
  notifications_results: z.boolean(),
  notifications_promotions: z.boolean(),
  notifications_email_enabled: z.boolean(),
  notifications_sms_enabled: z.boolean(),
  notifications_whatsapp_enabled: z.boolean(),
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

// ========================================
// TYPES
// ========================================

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
    insurance_expires_at: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    emergency_contact_relationship: string | null
    emergency_contact_secondary_phone: string | null
    notifications_email: boolean | null
    notifications_sms: boolean | null
    notifications_whatsapp: boolean | null
    notifications_appointments: boolean | null
    notifications_results: boolean | null
    notifications_promotions: boolean | null
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

// ========================================
// OPTIONS
// ========================================

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
  { value: 'kidney_disease', label: 'Enfermedad renal' },
  { value: 'other', label: 'Otro' },
]

// ========================================
// COMPONENTS
// ========================================

// Progress Bar Component
function ProfileProgressBar({ completion }: { completion: number }) {
  const getColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">Completitud del perfil</span>
        <span className="text-sm font-bold text-text-primary">{completion}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full ${getColor(completion)} transition-all duration-500 ease-out`}
          style={{ width: `${completion}%` }}
        />
      </div>
      <p className="text-xs text-text-muted mt-1">
        {completion < 50 && 'Completa tu perfil para una mejor experiencia'}
        {completion >= 50 && completion < 80 && '¡Buen progreso! Completa más secciones'}
        {completion >= 80 && '¡Excelente! Tu perfil está casi completo'}
      </p>
    </div>
  )
}

// Collapsible Card Component
function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = true,
  completed = false,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  completed?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left"
      >
        <CardHeader
          title={
            <div className="flex items-center gap-3">
              <span className="font-semibold">{title}</span>
              {completed && (
                <span className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-500" />
                </span>
              )}
            </div>
          }
          subtitle={subtitle}
          action={isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        />
      </button>
      {isOpen && <CardBody>{children}</CardBody>}
    </Card>
  )
}

// BMI Display Component
function BMIDisplay({
  heightCm,
  weightKg,
}: {
  heightCm: number | null | undefined
  weightKg: number | null | undefined
}) {
  const bmi = useMemo(() => {
    if (!heightCm || !weightKg) return null
    const heightM = heightCm / 100
    return weightKg / (heightM * heightM)
  }, [heightCm, weightKg])

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600', bg: 'bg-green-50' }
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { label: 'Obesidad', color: 'text-red-600', bg: 'bg-red-50' }
  }

  if (!bmi) return null

  const category = getBMICategory(bmi)

  return (
    <div className={`mt-4 p-4 rounded-xl ${category.bg} border border-border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Tu Índice de Masa Corporal (IMC)</p>
          <p className="text-2xl font-bold text-text-primary">{bmi.toFixed(1)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full ${category.bg} ${category.color} font-medium text-sm`}>
          {category.label}
        </div>
      </div>
    </div>
  )
}

// ========================================
// MAIN PAGE
// ========================================

export default function PatientProfilePage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingHistory, setSavingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'insurance' | 'emergency' | 'notifications'>('personal')
  const [profileData, setProfileData] = useState<PatientProfileData | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!profileData) return 0
    let completed = 0
    let total = 0

    // Profile fields
    const profileFields = [
      profileData.profile.full_name,
      profileData.profile.phone,
      profileData.profile.date_of_birth,
      profileData.profile.gender,
      profileData.profile.insurance_provider,
      profileData.profile.emergency_contact_name,
    ]
    total += profileFields.length
    completed += profileFields.filter(f => f && f !== '').length

    // Medical history
    if (profileData.medicalHistory) {
      const mh = profileData.medicalHistory
      total += 4
      completed += (mh.blood_type ? 1 : 0) + (mh.height_cm ? 1 : 0) + (mh.weight_kg ? 1 : 0) + (mh.allergies?.length > 0 || mh.chronic_conditions?.length > 0 ? 1 : 0)
    }

    return Math.round((completed / total) * 100)
  }, [profileData])

  // Tab completion status
  const tabCompletion = useMemo(() => ({
    personal: !!profileData?.profile.full_name && !!profileData?.profile.phone,
    medical: !!profileData?.medicalHistory?.blood_type,
    insurance: !!profileData?.profile.insurance_provider,
    emergency: !!profileData?.profile.emergency_contact_name,
    notifications: true,
  }), [profileData])

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
      insurance_expires_at: '',
      emergency_contacts: [{ name: '', phone: '', relationship: '', secondary_phone: '' }],
      notifications_appointments: true,
      notifications_results: true,
      notifications_promotions: false,
      notifications_email_enabled: true,
      notifications_sms_enabled: true,
      notifications_whatsapp_enabled: true,
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

  const { fields: emergencyFields, append: appendEmergency, remove: removeEmergency } = useFieldArray({
    control: profileForm.control,
    name: 'emergency_contacts',
  })

  // Store initial values for comparison
  const [initialProfileValues, setInitialProfileValues] = useState<ProfileFormData | null>(null)
  const [initialHistoryValues, setInitialHistoryValues] = useState<MedicalHistoryFormData | null>(null)

  // Watch for changes - only set true if values actually differ
  useEffect(() => {
    if (!initialProfileValues) return

    const subscription = profileForm.watch((value) => {
      const hasChanges = JSON.stringify(value) !== JSON.stringify(initialProfileValues)
      setHasUnsavedChanges(hasChanges)
    })
    return () => subscription.unsubscribe()
  }, [profileForm, initialProfileValues])

  useEffect(() => {
    if (!initialHistoryValues) return

    const subscription = historyForm.watch((value) => {
      const hasChanges = JSON.stringify(value) !== JSON.stringify(initialHistoryValues)
      setHasUnsavedChanges(prev => prev || hasChanges)
    })
    return () => subscription.unsubscribe()
  }, [historyForm, initialHistoryValues])

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

        // Map emergency contact to array
        const emergencyContacts = [
          {
            name: data.profile.emergency_contact_name || '',
            phone: data.profile.emergency_contact_phone || '',
            relationship: data.profile.emergency_contact_relationship || '',
            secondary_phone: data.profile.emergency_contact_secondary_phone || '',
          }
        ]

        const profileValues = {
          full_name: data.profile.full_name,
          phone: data.profile.phone || '',
          date_of_birth: data.profile.date_of_birth || '',
          gender: data.profile.gender,
          insurance_provider: data.profile.insurance_provider || '',
          insurance_policy_number: data.profile.insurance_policy_number || '',
          insurance_group_number: data.profile.insurance_group_number || '',
          insurance_coverage_type: data.profile.insurance_coverage_type || '',
          insurance_expires_at: data.profile.insurance_expires_at || '',
          emergency_contacts: emergencyContacts,
          notifications_appointments: data.profile.notifications_appointments ?? true,
          notifications_results: data.profile.notifications_results ?? true,
          notifications_promotions: data.profile.notifications_promotions ?? false,
          notifications_email_enabled: data.profile.notifications_email ?? true,
          notifications_sms_enabled: data.profile.notifications_sms ?? true,
          notifications_whatsapp_enabled: data.profile.notifications_whatsapp ?? true,
        }

        profileForm.reset(profileValues)
        setInitialProfileValues(profileValues)

        let historyValues = null
        if (data.medicalHistory) {
          historyValues = {
            allergies: data.medicalHistory.allergies || [],
            current_medications: data.medicalHistory.current_medications || [],
            chronic_conditions: data.medicalHistory.chronic_conditions || [],
            past_surgeries: data.medicalHistory.past_surgeries || [],
            family_history: data.medicalHistory.family_history || [],
            medical_notes: data.medicalHistory.medical_notes || '',
            blood_type: data.medicalHistory.blood_type || '',
            height_cm: data.medicalHistory.height_cm || undefined,
            weight_kg: data.medicalHistory.weight_kg || undefined,
          }
          historyForm.reset(historyValues)
          setInitialHistoryValues(historyValues)
        }

        setHasUnsavedChanges(false)
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
      // Map emergency contacts array back to single fields for API
      const primaryContact = data.emergency_contacts[0]
      const apiData = {
        // Only send valid database columns
        full_name: data.full_name,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        insurance_provider: data.insurance_provider || null,
        insurance_policy_number: data.insurance_policy_number || null,
        insurance_group_number: data.insurance_group_number || null,
        insurance_coverage_type: data.insurance_coverage_type || null,
        insurance_expires_at: data.insurance_expires_at || null,
        emergency_contact_name: primaryContact?.name || null,
        emergency_contact_phone: primaryContact?.phone || null,
        emergency_contact_relationship: primaryContact?.relationship || null,
        emergency_contact_secondary_phone: primaryContact?.secondary_phone || null,
        // Map notification preferences back (using correct DB column names)
        notifications_email: data.notifications_email_enabled,
        notifications_sms: data.notifications_sms_enabled,
        notifications_whatsapp: data.notifications_whatsapp_enabled,
        notifications_appointments: data.notifications_appointments,
        notifications_results: data.notifications_results,
        notifications_promotions: data.notifications_promotions,
      }

      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      if (response.ok) {
        addToast('Perfil actualizado exitosamente', 'success')
        setInitialProfileValues(data)
        setHasUnsavedChanges(false)
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
        setInitialHistoryValues(data)
        setHasUnsavedChanges(false)
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
    historyForm.setValue('allergies', currentAllergies.filter((_, i) => i !== index))
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
    historyForm.setValue('chronic_conditions', currentConditions.filter((_, i) => i !== index))
  }

  // Format phone for display with Mexico mask
  const formatPhoneForDisplay = useCallback((phone: string | null | undefined) => {
    if (!phone) return ''
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
      return `+52 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
  }, [])

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

  const tabs = [
    { id: 'personal' as const, label: 'Información Personal', icon: User },
    { id: 'medical' as const, label: 'Historial Médico', icon: HeartPulse },
    { id: 'insurance' as const, label: 'Seguro Médico', icon: Shield },
    { id: 'emergency' as const, label: 'Contacto de Emergencia', icon: Phone },
    { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gradient-hero">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Mi Perfil
          </h1>
          <p className="text-lg text-text-muted">
            Gestiona tu información personal y configuración médica
          </p>
        </div>

        {/* Progress Bar */}
        <ProfileProgressBar completion={profileCompletion} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="bg-background rounded-2xl shadow-sm border border-border p-3 lg:sticky lg:top-24" aria-label="Navegación del perfil">
              <ul className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isCompleted = tabCompletion[tab.id]
                  return (
                    <li key={tab.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasUnsavedChanges) {
                            if (confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
                              setHasUnsavedChanges(false)
                              setActiveTab(tab.id)
                            }
                          } else {
                            setActiveTab(tab.id)
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary font-medium shadow-sm'
                            : 'text-text-muted hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        {isCompleted && (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>

              {hasUnsavedChanges && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl" role="alert" aria-live="polite">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-warning-800">
                      Tienes cambios sin guardar
                    </p>
                  </div>
                </div>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* ========================================
                PERSONAL INFO TAB
            ======================================== */}
            {activeTab === 'personal' && (
              <Card className="animate-fade-in-up">
                <CardHeader title="Información Personal" subtitle="Actualiza tus datos personales" />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center pb-8 border-b border-border">
                      <AvatarUpload
                        userId={profileData?.profile.id || ''}
                        currentPhotoUrl={photoUrl}
                        name={profileData?.profile.full_name}
                        size="xl"
                        onUploadComplete={(url) => setPhotoUrl(url || null)}
                      />
                      <p className="text-sm text-text-muted mt-3 text-center max-w-xs">
                        Foto de perfil profesional para mejor identificación médica
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Nombre completo"
                        {...profileForm.register('full_name')}
                        error={profileForm.formState.errors.full_name?.message}
                        required
                      />

                      {/* Email - Disabled with lock icon */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="email">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-text-muted" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            value={profileData?.profile?.email || ''}
                            disabled
                            className="block w-full pl-10 pr-10 py-2.5 bg-muted border border-border rounded-lg text-text-muted cursor-not-allowed"
                            aria-describedby="email-hint"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-text-muted" />
                          </div>
                        </div>
                        <p id="email-hint" className="mt-1 text-xs text-text-muted">
                          No se puede modificar por seguridad
                        </p>
                      </div>

                      {/* Phone with Mexico format */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="phone">
                          Teléfono
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-text-muted" />
                          </div>
                          <input
                            id="phone"
                            {...profileForm.register('phone')}
                            type="tel"
                            placeholder="+52 (555) 123-4567"
                            className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                            onChange={(e) => {
                              const formatted = formatPhoneForDisplay(e.target.value)
                              if (formatted !== e.target.value) {
                                e.target.value = formatted
                              }
                            }}
                          />
                        </div>
                        {profileForm.formState.errors.phone && (
                          <p className="mt-1 text-sm text-error" role="alert">
                            {profileForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>

                      {/* Date of Birth with better UX */}
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="date_of_birth">
                          Fecha de nacimiento
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-text-muted" />
                          </div>
                          <input
                            id="date_of_birth"
                            {...profileForm.register('date_of_birth')}
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                          />
                        </div>
                        {profileForm.formState.errors.date_of_birth && (
                          <p className="mt-1 text-sm text-error" role="alert">
                            {profileForm.formState.errors.date_of_birth.message}
                          </p>
                        )}
                      </div>

                      <Select
                        label="Género"
                        {...profileForm.register('gender')}
                        options={genderOptions.slice(1)} // Skip the duplicate placeholder
                        placeholder="Seleccionar género"
                      />
                    </div>
                  </CardBody>
                  <CardFooter>
                    <LoadingButton
                      type="submit"
                      isLoading={savingProfile}
                      className="min-w-[160px]"
                    >
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </LoadingButton>
                  </CardFooter>
                </form>
              </Card>
            )}

            {/* ========================================
                MEDICAL HISTORY TAB
            ======================================== */}
            {activeTab === 'medical' && (
              <form onSubmit={historyForm.handleSubmit(onSubmitMedicalHistory)}>
                {/* Physical Data with BMI */}
                <Card className="mb-4">
                  <CardHeader title="Datos Físicos" subtitle="Información para cálculo de IMC" />
                  <CardBody>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-text-muted" />
                            Altura (cm)
                          </div>
                        </label>
                        <Input
                          type="number"
                          {...historyForm.register('height_cm', { valueAsNumber: true })}
                          error={historyForm.formState.errors.height_cm?.message}
                          placeholder="170"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-text-muted" />
                            Peso (kg)
                          </div>
                        </label>
                        <Input
                          type="number"
                          {...historyForm.register('weight_kg', { valueAsNumber: true })}
                          error={historyForm.formState.errors.weight_kg?.message}
                          placeholder="70"
                        />
                      </div>
                      <Select
                        label="Tipo de sangre"
                        {...historyForm.register('blood_type')}
                        options={bloodTypeOptions}
                        placeholder="Seleccionar"
                      />
                    </div>
                    <BMIDisplay
                      heightCm={historyForm.watch('height_cm')}
                      weightKg={historyForm.watch('weight_kg')}
                    />
                  </CardBody>
                </Card>

                {/* Allergies */}
                <CollapsibleCard
                  title="Alergias"
                  subtitle="Presiona Enter para agregar cada alergia"
                  completed={(historyForm.watch('allergies') || []).length > 0}
                >
                  <div className="space-y-3">
                    <Input
                      placeholder="Ej: Penicilina, Nueces, Polen..."
                      onKeyDown={handleAddAllergy}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(historyForm.watch('allergies') || []).map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-error/10 text-error rounded-full text-sm border border-error/20"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeAllergy(index)}
                            className="hover:text-error/80 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-full"
                            aria-label={`Eliminar ${allergy}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CollapsibleCard>

                {/* Current Medications */}
                <CollapsibleCard
                  title="Medicamentos Actuales"
                  subtitle="Medicamentos que tomas actualmente"
                  completed={(historyForm.watch('current_medications') || []).length > 0}
                >
                  <div className="space-y-4">
                    {medicationFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-start p-4 bg-muted rounded-xl">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <Input
                            placeholder="Nombre"
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
                          className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Eliminar medicamento"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendMedication({ name: '', dosage: '', frequency: '' })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar medicamento
                    </button>
                  </div>
                </CollapsibleCard>

                {/* Chronic Conditions with Multi-Select */}
                <CollapsibleCard
                  title="Condiciones Crónicas"
                  subtitle="Enfermedades crónicas diagnosticadas"
                  completed={(historyForm.watch('chronic_conditions') || []).length > 0}
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {conditionOptions.slice(1).map((option) => {
                        const isSelected = (historyForm.watch('chronic_conditions') || []).includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => !isSelected && handleAddCondition(option.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                            {isSelected && <Check className="w-3 h-3 inline ml-1" />}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl min-h-[60px]">
                      {(historyForm.watch('chronic_conditions') || []).length === 0 ? (
                        <p className="text-sm text-gray-400">No hay condiciones seleccionadas</p>
                      ) : (
                        (historyForm.watch('chronic_conditions') || []).map((condition, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm border border-yellow-300"
                          >
                            {conditionOptions.find(o => o.value === condition)?.label || condition}
                            <button
                              type="button"
                              onClick={() => removeCondition(index)}
                              className="hover:text-yellow-900 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </CollapsibleCard>

                {/* Past Surgeries */}
                <CollapsibleCard
                  title="Cirugías Anteriores"
                  subtitle="Historial de cirugías"
                  completed={(historyForm.watch('past_surgeries') || []).length > 0}
                >
                  <div className="space-y-4">
                    {surgeryFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-start p-4 bg-muted rounded-xl">
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
                            placeholder="Notas"
                            {...historyForm.register(`past_surgeries.${index}.notes`)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSurgery(index)}
                          className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Eliminar cirugía"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendSurgery({ procedure: '', year: null, notes: '' })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar cirugía
                    </button>
                  </div>
                </CollapsibleCard>

                {/* Family History */}
                <CollapsibleCard
                  title="Antecedentes Familiares"
                  subtitle="Enfermedades en la familia"
                  completed={(historyForm.watch('family_history') || []).length > 0}
                >
                  <div className="space-y-4">
                    {familyFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-start p-4 bg-muted rounded-xl">
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
                          className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Eliminar antecedente familiar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendFamily({ condition: '', relationship: '', notes: '' })}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar antecedente
                    </button>
                  </div>
                </CollapsibleCard>

                {/* Additional Notes */}
                <CollapsibleCard
                  title="Notas Adicionales"
                  subtitle="Información médica relevante"
                  completed={!!historyForm.watch('medical_notes')}
                >
                  <Textarea
                    {...historyForm.register('medical_notes')}
                    placeholder="Escribe aquí cualquier información adicional importante..."
                    rows={3}
                    className="resize-none"
                  />
                </CollapsibleCard>

                <div className="flex justify-end pt-4">
                  <LoadingButton type="submit" isLoading={savingHistory}>
                    Guardar historial médico
                  </LoadingButton>
                </div>
              </form>
            )}

            {/* ========================================
                INSURANCE TAB
            ======================================== */}
            {activeTab === 'insurance' && (
              <Card className="animate-fade-in-up">
                <CardHeader
                  title="Información del Seguro Médico"
                  subtitle="Datos de tu seguro de gastos médicos"
                />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    {/* Insurance Verification Status */}
                    <div className={`p-4 rounded-xl border ${
                      profileData?.profile.insurance_provider
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          profileData?.profile.insurance_provider
                            ? 'bg-green-100'
                            : 'bg-yellow-100'
                        }`}>
                          <Shield className={`w-5 h-5 ${
                            profileData?.profile.insurance_provider
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {profileData?.profile.insurance_provider
                              ? 'Seguro registrado'
                              : 'Seguro pendiente de verificación'
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {profileData?.profile.insurance_provider
                              ? 'Tu información de seguro está guardada'
                              : 'Agrega tu seguro para acceso rápido'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

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
                        placeholder="Ej: 123456789"
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vigencia del seguro
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...profileForm.register('insurance_expires_at')}
                            type="month"
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {profileForm.formState.errors.insurance_expires_at && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileForm.formState.errors.insurance_expires_at.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Insurance Card Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Foto de la tarjeta del seguro
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Sube una foto clara de tu tarjeta de seguro (Próximamente)
                      </p>
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed"
                      >
                        Próximamente
                      </button>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <LoadingButton type="submit" isLoading={savingProfile}>
                      Guardar seguro
                    </LoadingButton>
                  </CardFooter>
                </form>
              </Card>
            )}

            {/* ========================================
                EMERGENCY CONTACT TAB
            ======================================== */}
            {activeTab === 'emergency' && (
              <Card className="animate-fade-in-up">
                <CardHeader
                  title="Contactos de Emergencia"
                  subtitle="Personas a contactar en caso de emergencia (mínimo 1, máximo 3)"
                />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-6">
                    {emergencyFields.map((field, index) => (
                      <div key={field.id} className="p-6 bg-muted rounded-xl border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-text-primary">
                            Contacto {index + 1}
                          </h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeEmergency(index)}
                              className="text-sm text-error hover:text-error/80 flex items-center gap-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
                              aria-label={`Eliminar contacto ${index + 1}`}
                            >
                              <X className="w-4 h-4" />
                              Eliminar
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            label="Nombre completo"
                            {...profileForm.register(`emergency_contacts.${index}.name`)}
                            error={profileForm.formState.errors.emergency_contacts?.[index]?.name?.message}
                            placeholder="Ej: María García"
                          />
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-1" htmlFor={`emergency-phone-${index}`}>
                              Teléfono principal
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                id={`emergency-phone-${index}`}
                                {...profileForm.register(`emergency_contacts.${index}.phone`)}
                                type="tel"
                                placeholder="+52 (555) 123-4567"
                                className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                                onChange={(e) => {
                                  const formatted = formatPhoneForDisplay(e.target.value)
                                  if (formatted !== e.target.value) {
                                    e.target.value = formatted
                                  }
                                }}
                              />
                            </div>
                            {profileForm.formState.errors.emergency_contacts?.[index]?.phone && (
                              <p className="mt-1 text-sm text-error" role="alert">
                                {profileForm.formState.errors.emergency_contacts[index]?.phone?.message}
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Select
                              label="Parentesco"
                              {...profileForm.register(`emergency_contacts.${index}.relationship`)}
                              options={relationshipOptions}
                              placeholder="Seleccionar parentesco"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-primary mb-1" htmlFor={`emergency-phone2-${index}`}>
                              Teléfono secundario (opcional)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id={`emergency-phone2-${index}`}
                                {...profileForm.register(`emergency_contacts.${index}.secondary_phone`)}
                                type="tel"
                                placeholder="+52 (555) 987-6543"
                                className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                                onChange={(e) => {
                                  const formatted = formatPhoneForDisplay(e.target.value)
                                  if (formatted !== e.target.value) {
                                    e.target.value = formatted
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {emergencyFields.length < 3 && (
                      <button
                        type="button"
                        onClick={() => appendEmergency({ name: '', phone: '', relationship: '', secondary_phone: '' })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        Agregar otro contacto de emergencia
                      </button>
                    )}

                    <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Recomendamos tener al menos 2 contactos de emergencia. Se contactarán en orden si no pueden ubicar al primero.
                      </p>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <LoadingButton type="submit" isLoading={savingProfile}>
                      Guardar contactos
                    </LoadingButton>
                  </CardFooter>
                </form>
              </Card>
            )}

            {/* ========================================
                NOTIFICATIONS TAB
            ======================================== */}
            {activeTab === 'notifications' && (
              <Card className="animate-fade-in-up">
                <CardHeader
                  title="Preferencias de Notificaciones"
                  subtitle="Elige cómo y qué quieres recibir"
                />
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
                  <CardBody className="space-y-8">
                    {/* Channels */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Canales de comunicación</h3>
                      <div className="space-y-4">
                        <Switch
                          id="notif-email"
                          label="Notificaciones por Email"
                          description="Recibe confirmaciones y recordatorios por correo electrónico"
                          checked={profileForm.watch('notifications_email_enabled')}
                          {...profileForm.register('notifications_email_enabled')}
                          containerClassName="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        />
                        <Switch
                          id="notif-sms"
                          label="Notificaciones por SMS"
                          description="Recibe recordatorios importantes por mensaje de texto"
                          checked={profileForm.watch('notifications_sms_enabled')}
                          {...profileForm.register('notifications_sms_enabled')}
                          containerClassName="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        />
                        <Switch
                          id="notif-whatsapp"
                          label="Notificaciones por WhatsApp"
                          description="Recibe recordatorios y actualizaciones por WhatsApp"
                          checked={profileForm.watch('notifications_whatsapp_enabled')}
                          {...profileForm.register('notifications_whatsapp_enabled')}
                          containerClassName="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        />
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías de notificaciones</h3>
                      <div className="space-y-4">
                        <Switch
                          id="notif-appointments"
                          label="Citas y recordatorios"
                          description="Recordatorios de citas próximas, confirmaciones y recordatorios de pago"
                          checked={profileForm.watch('notifications_appointments')}
                          {...profileForm.register('notifications_appointments')}
                          containerClassName="p-4 border border-border rounded-xl hover:bg-muted transition-colors duration-200"
                        />
                        <Switch
                          id="notif-results"
                          label="Resultados médicos"
                          description="Notificaciones cuando tus resultados estén disponibles"
                          checked={profileForm.watch('notifications_results')}
                          {...profileForm.register('notifications_results')}
                          containerClassName="p-4 border border-border rounded-xl hover:bg-muted transition-colors duration-200"
                        />
                        <Switch
                          id="notif-promotions"
                          label="Promociones y novedades"
                          description="Recibe ofertas especiales y nuevas funcionalidades"
                          checked={profileForm.watch('notifications_promotions')}
                          {...profileForm.register('notifications_promotions')}
                          containerClassName="p-4 border border-border rounded-xl hover:bg-muted transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Frequency Info */}
                    <div className="flex items-start gap-2 p-4 bg-muted rounded-xl border border-border">
                      <Info className="w-5 h-5 text-text-muted mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-text-primary">
                        <p className="font-medium mb-1">Frecuencia de notificaciones</p>
                        <ul className="list-disc list-inside space-y-1 text-text-muted">
                          <li>Recordatorios de citas: 24 horas antes y 1 hora antes</li>
                          <li>Resultados médicos: Cuando estén disponibles</li>
                          <li>Promociones: Máximo 2 por semana</li>
                        </ul>
                      </div>
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
