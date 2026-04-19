export type UserRole = 'patient' | 'doctor' | 'admin'

export type AppointmentStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'refunded'

export type AppointmentType = 'in_person' | 'video'

export type VideoStatus = 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'

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
  appointment_type?: AppointmentType
  video_status?: VideoStatus
  video_room_url?: string | null
  video_room_id?: string | null
  video_started_at?: string | null
  video_ended_at?: string | null
  consultation_notes?: string | null
  cancellation_reason: string | null
  cancelled_by: string | null
  created_at: string
  doctor?: Doctor
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

export type ChatMessageType = 'text' | 'image' | 'file'

export interface ChatConversation {
  id: string
  patient_id: string
  doctor_id: string
  appointment_id: string | null
  last_message_preview: string | null
  last_message_at: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'patient' | 'doctor'
  content: string
  message_type: ChatMessageType
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: string | null
  read_at: string | null
  created_at: string
}

export interface ChatUserPresence {
  id: string
  user_id: string
  conversation_id: string | null
  status: 'online' | 'away' | 'offline'
  last_seen_at: string
  created_at: string
  updated_at: string
}

// Insurance system
export interface Insurance {
  id: string
  name: string
  slug: string
  logo_url: string | null
  type: 'public' | 'private' | 'social_security'
  website: string | null
  phone: string | null
  is_active: boolean
}

export interface DoctorInsurance {
  id: string
  doctor_id: string
  insurance_id: string
  plan_name: string | null
  notes: string | null
  insurance: Insurance
}

// Location system
export interface City {
  id: string
  name: string
  slug: string
  state: string
  state_code: string | null
  country: string
  latitude: number | null
  longitude: number | null
  population: number | null
  is_major: boolean
}

export interface District {
  id: string
  name: string
  slug: string
  city_id: string
  latitude: number | null
  longitude: number | null
  postal_code: string | null
  city?: City
}

// Disease system
export interface Disease {
  id: string
  name: string
  slug: string
  description: string | null
  symptoms: string[] | null
  causes: string | null
  treatments: string | null
  prevention: string | null
  popular: boolean
  search_count: number
}

// Treatment system
export interface Treatment {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  popular: boolean
  search_count: number
  specialties?: Specialty[]
}

// Clinic system
export interface Clinic {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city_id: string | null
  district_id: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  logo_url: string | null
  rating_avg: number
  rating_count: number
  verified: boolean
  city?: City
  specialties?: Specialty[]
}

// Expert Q&A system
export interface ExpertQuestion {
  id: string
  patient_id: string | null
  specialty_id: string | null
  question: string
  email: string
  display_name: string | null
  status: 'pending' | 'approved' | 'rejected' | 'answered' | 'closed'
  is_anonymous: boolean
  view_count: number
  created_at: string
  specialty?: Specialty
  answers?: ExpertAnswer[]
}

export interface ExpertAnswer {
  id: string
  question_id: string
  doctor_id: string
  answer: string
  is_featured: boolean
  helpful_count: number
  created_at: string
}

// Blog system
export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category_id: string | null
  featured_image: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  meta_description: string | null
  view_count: number
  created_at: string
  updated_at: string
  category?: BlogCategory
}
