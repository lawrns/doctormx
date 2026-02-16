/**
 * Pharmacy Types
 * 
 * All interfaces and types related to pharmacy functionality.
 */

export interface PharmacySponsor {
  id: string
  name: string
  slug: string
  contact_email: string
  contact_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  neighborhood: string | null
  zip_code: string | null
  latitude: number | null
  longitude: number | null
  logo_url: string | null
  cover_image_url: string | null
  description: string | null
  phone: string | null
  website_url: string | null
  whatsapp_number: string | null
  offers_delivery: boolean | null
  offers_pickup: boolean | null
  delivery_radius_km: number | null
  delivery_time_hours: number | null
  minimum_order_cents: number | null
  discount_percentage: number | null
  doctory_discount_code: string | null
  commission_rate: number
  fixed_fee_cents: number
  referral_fee_cents: number
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  priority: number | null
  applied_at: string
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string | null
}

export interface PharmacyReferral {
  id: string
  pharmacy_id: string
  referral_code: string
  prescription_id: string | null
  appointment_id: string
  patient_id: string
  doctor_id: string
  medications: string[] | null
  estimated_total_cents: number | null
  status: 'pending' | 'sent' | 'redeemed' | 'expired' | 'cancelled'
  sent_at: string | null
  redeemed_at: string | null
  redemption_confirmed_by: string | null
  created_at: string
  expires_at: string
  pharmacy?: PharmacySponsor
}

export interface PharmacyCommission {
  id: string
  referral_id: string
  pharmacy_id: string
  medication_total_cents: number | null
  commission_rate: number
  commission_amount_cents: number
  fixed_fee_cents: number
  total_payout_cents: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
  paid_at: string | null
  period_start: string | null
  period_end: string | null
}

export interface PharmacyRecommendation {
  pharmacy: PharmacySponsor
  distanceKm: number | null
  estimatedPrice: number
  savingsVsAverage: number
  hasMedications: boolean
  matchScore: number
}

export interface PatientLocation {
  latitude: number
  longitude: number
  city?: string
  state?: string
}

export interface PharmacyMatch {
  pharmacy: PharmacySponsor
  estimatedTotal: number
  distance: number | null
  savings: number | null
  hasDelivery: boolean
  deliveryTime: number | null
  discountCode: string | null
  availability: number
}

export interface PharmacyLocation {
  city?: string
  neighborhood?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
}

export interface PharmacyStats {
  totalReferrals: number
  redeemedReferrals: number
  pendingReferrals: number
  totalRevenue: number
  thisMonthRevenue: number
}

export interface DoctorEarnings {
  totalReferrals: number
  redeemedReferrals: number
  pendingReferrals: number
  totalReferralFees: number
  totalCommissions: number
  platformFees: number
  netEarnings: number
}

export interface PharmacyEarnings {
  totalReferrals: number
  redeemedReferrals: number
  totalPayouts: number
  pendingPayouts: number
  paidPayouts: number
}

export interface TwilioConfig {
  TWILIO_ACCOUNT_SID: string
  TWILIO_AUTH_TOKEN: string
  TWILIO_WHATSAPP_NUMBER: string
}

export interface WhatsAppResult {
  success: boolean
  messageSid?: string
  error?: string
}

export interface PayoutResult {
  success: boolean
  payoutId?: string
  error?: string
}

export interface ApplicationResult {
  success: boolean
  pharmacyId?: string
  error?: string
}

export interface TrackingResult {
  success: boolean
  referral?: PharmacyReferral
  error?: string
}

export interface RedemptionResult {
  success: boolean
  error?: string
}
