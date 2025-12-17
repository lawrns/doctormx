export type UserRole = 'patient' | 'doctor' | 'admin'

export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'refunded'

export type DoctorStatus =
  | 'pending'    // No verificado - puede configurar todo
  | 'approved'   // Verificado - visible en catálogo
  | 'suspended'  // Suspendido por admin
export type PaymentStatus =
  | 'requires_action'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  email?: string
  phone: string | null
  photo_url: string | null
  created_at: string
}

export interface Doctor {
  id: string
  status: DoctorStatus
  specialty?: string
  bio: string | null
  languages: string[]
  license_number: string | null
  years_experience: number | null
  city: string | null
  state: string | null
  country: string
  price_cents: number
  currency: string
  rating?: number
  total_reviews?: number
  profile: Profile
}

export interface Specialty {
  id: string
  name: string
  slug: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  service_id: string | null
  start_ts: string
  end_ts: string
  status: AppointmentStatus
  cancellation_reason: string | null
  cancelled_by: string | null
  created_at: string
}

export interface Payment {
  id: string
  appointment_id: string
  provider: 'stripe' | 'openpay' | 'mercadopago'
  provider_ref: string
  amount_cents: number
  currency: string
  status: PaymentStatus
  fee_cents: number
  net_cents: number
}
