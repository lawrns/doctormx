import { createClient, createServiceClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { logger } from '@/lib/observability/logger'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN')
}

async function sendPharmacyReferralWhatsApp(
  phone: string,
  body: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const getWhatsAppPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('52') && cleaned.length === 12) return `whatsapp:+${cleaned}`
    if (cleaned.length === 10) return `whatsapp:+52${cleaned}`
    return `whatsapp:+${cleaned}`
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: getWhatsAppPhone(phone),
        Body: body,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('Twilio API error:', { error })
      return { success: false, error }
    }

    const twilioMessage = await response.json()

    const supabase = createServiceClient()
    await supabase.from('notification_logs').insert({
      phone_number: phone,
      template: 'pharmacy_referral',
      status: 'sent',
      twilio_sid: twilioMessage.sid,
      message_body: body,
    })

    return { success: true, messageSid: twilioMessage.sid }
  } catch (error) {
    logger.error('Error sending WhatsApp message:', { error })
    return { success: false, error: 'Failed to send message' }
  }
}

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

export async function findSponsorPharmacies(
  patientLocation: PatientLocation | null,
  medications: string[]
): Promise<PharmacyRecommendation[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('pharmacy_sponsors')
    .select('*')
    .eq('status', 'approved')

  if (patientLocation?.city) {
    query = query.or(`city.ilike.%${patientLocation.city}%,state.ilike.%${patientLocation.state}%`)
  }

  const { data: pharmacies, error } = await query.order('name')

  if (error || !pharmacies) {
    console.error('Error fetching pharmacies:', error)
    return []
  }

  const recommendations: PharmacyRecommendation[] = pharmacies.map((pharmacy) => {
    const distance = calculateDistance(
      patientLocation?.latitude ?? null,
      patientLocation?.longitude ?? null,
      pharmacy.latitude,
      pharmacy.longitude
    )

    const basePrice = calculateBaseMedicationPrice(medications)
    const pharmacyMultiplier = getPharmacyPriceMultiplier(pharmacy.slug)
    const estimatedPrice = Math.round(basePrice * pharmacyMultiplier)
    const averagePrice = basePrice * 1.05
    const savings = Math.max(0, Math.round(averagePrice - estimatedPrice))

    return {
      pharmacy: pharmacy as PharmacySponsor,
      distanceKm: distance,
      estimatedPrice,
      savingsVsAverage: savings,
      hasMedications: true,
      matchScore: calculateMatchScore(distance, savings, pharmacy.status),
    }
  })

  return recommendations
    .filter((r) => r.hasMedications)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}

export async function getLowestPricePharmacy(
  medication: string,
  location: PatientLocation | null
): Promise<PharmacyRecommendation | null> {
  const recommendations = await findSponsorPharmacies(location, [medication])
  return recommendations.length > 0 ? recommendations[0] : null
}

export async function generateReferralCode(
  pharmacyId: string,
  appointmentId: string
): Promise<string> {
  const supabase = createServiceClient()

  const { data: existingCode } = await supabase
    .from('pharmacy_referrals')
    .select('referral_code')
    .eq('pharmacy_id', pharmacyId)
    .eq('appointment_id', appointmentId)
    .in('status', ['pending', 'sent'])
    .single()

  if (existingCode) {
    return existingCode.referral_code
  }

  const code = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  return code
}

export async function createReferral(
  pharmacyId: string,
  appointmentId: string,
  patientId: string,
  doctorId: string,
  medications: string[],
  prescriptionId?: string
): Promise<PharmacyReferral | null> {
  const supabase = createServiceClient()

  const referralCode = await generateReferralCode(pharmacyId, appointmentId)

  const { data: referral, error } = await supabase
    .from('pharmacy_referrals')
    .insert({
      pharmacy_id: pharmacyId,
      referral_code: referralCode,
      prescription_id: prescriptionId || null,
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_id: doctorId,
      medications: medications as unknown as Record<string, unknown>[],
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating referral:', { error })
    return null
  }

  return referral as PharmacyReferral
}

export async function trackReferral(
  pharmacyId: string,
  referralCode: string,
  patientId: string
): Promise<{ success: boolean; referral?: PharmacyReferral; error?: string }> {
  const supabase = createServiceClient()

  const { data: referral, error } = await supabase
    .from('pharmacy_referrals')
    .select('*')
    .eq('pharmacy_id', pharmacyId)
    .eq('referral_code', referralCode)
    .eq('patient_id', patientId)
    .in('status', ['pending', 'sent'])
    .single()

  if (error || !referral) {
    return { success: false, error: 'Referral not found or expired' }
  }

  if (referral.status === 'redeemed') {
    return { success: false, error: 'Referral already redeemed' }
  }

  return { success: true, referral: referral as PharmacyReferral }
}

export async function markReferralSent(
  referralId: string,
  phone: string
): Promise<boolean> {
  const supabase = createServiceClient()

  const { data: referral } = await supabase
    .from('pharmacy_referrals')
    .select('*, pharmacy:pharmacy_sponsors(*)')
    .eq('id', referralId)
    .single()

  if (!referral) {
    return false
  }

  const pharmacy = referral.pharmacy as PharmacySponsor | undefined

  const message = `🏥 *Referencia de Farmacia - Doctor.mx*

Hola,

Tu médico te ha referido a ${pharmacy?.name || 'una farmacia asociada'}.

📋 *Código de Referencia:* ${referral.referral_code}
💊 *Medicamentos:* ${(referral.medications || []).join(', ')}

📍 *Dirección:* ${pharmacy?.address || 'Consultar dirección en la aplicación'}

📅 *Válido hasta:* ${format(new Date(referral.expires_at), 'dd MMMM yyyy', { locale: es })}

Presenta este código en la farmacia para obtener tus medicamentos.

— *Doctor.mx: Tu salud, simplificada*`

  const result = await sendPharmacyReferralWhatsApp(phone, message)

  if (!result.success) {
    return false
  }

  const { error } = await supabase
    .from('pharmacy_referrals')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', referralId)

  return !error
}

export async function redeemReferral(
  referralCode: string,
  pharmacyId: string,
  confirmedBy: string,
  medicationTotalCents?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  const { data: referral, error: fetchError } = await supabase
    .from('pharmacy_referrals')
    .select('*, pharmacy:pharmacy_sponsors(*)')
    .eq('referral_code', referralCode)
    .eq('pharmacy_id', pharmacyId)
    .in('status', ['pending', 'sent'])
    .single()

  if (fetchError || !referral) {
    return { success: false, error: 'Referral not found or expired' }
  }

  if (new Date() > new Date(referral.expires_at)) {
    return { success: false, error: 'Referral has expired' }
  }

  const pharmacy = referral.pharmacy as PharmacySponsor
  const medicationTotal = medicationTotalCents || referral.estimated_total_cents || calculateBaseMedicationPrice((referral.medications || []) as string[])
  const commissionAmount = Math.round(medicationTotal * (pharmacy.commission_rate / 100))
  const totalPayout = commissionAmount + pharmacy.fixed_fee_cents

  const { error: updateError } = await supabase
    .from('pharmacy_referrals')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redemption_confirmed_by: confirmedBy,
    })
    .eq('id', referral.id)

  if (updateError) {
    return { success: false, error: 'Failed to update referral status' }
  }

  const { error: commissionError } = await supabase
    .from('pharmacy_commissions')
    .insert({
      referral_id: referral.id,
      pharmacy_id: pharmacyId,
      medication_total_cents: medicationTotal,
      commission_rate: pharmacy.commission_rate,
      commission_amount_cents: commissionAmount,
      fixed_fee_cents: pharmacy.fixed_fee_cents,
      total_payout_cents: totalPayout,
      status: 'pending',
    })

  if (commissionError) {
    console.error('Error creating commission:', commissionError)
  }

  return { success: true }
}

export async function processPharmacyPayout(
  pharmacyId: string,
  periodStart: string,
  periodEnd: string
): Promise<{ success: boolean; payoutId?: string; error?: string }> {
  const supabase = createServiceClient()

  const startDate = new Date(periodStart)
  const endDate = new Date(periodEnd)

  const { data: commissions, error: commissionsError } = await supabase
    .from('pharmacy_commissions')
    .select('*')
    .eq('pharmacy_id', pharmacyId)
    .eq('status', 'pending')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (commissionsError) {
    return { success: false, error: 'Failed to fetch commissions' }
  }

  if (!commissions || commissions.length === 0) {
    return { success: false, error: 'No pending commissions for this period' }
  }

  const totalReferrals = commissions.length
  const redeemedCount = totalReferrals
  const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount_cents, 0)
  const totalFixedFees = commissions.reduce((sum, c) => sum + c.fixed_fee_cents, 0)
  const totalPayout = totalCommission + totalFixedFees

  const { data: payout, error: payoutError } = await supabase
    .from('pharmacy_payouts')
    .insert({
      pharmacy_id: pharmacyId,
      period_start: periodStart,
      period_end: periodEnd,
      total_referrals: totalReferrals,
      redeemed_referrals: redeemedCount,
      total_commission_cents: totalCommission,
      total_fixed_fees_cents: totalFixedFees,
      total_payout_cents: totalPayout,
      status: 'processing',
    })
    .select()
    .single()

  if (payoutError) {
    return { success: false, error: 'Failed to create payout' }
  }

  const { error: updateCommissionsError } = await supabase
    .from('pharmacy_commissions')
    .update({ status: 'approved', payout_id: payout.id })
    .eq('pharmacy_id', pharmacyId)
    .eq('status', 'pending')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (updateCommissionsError) {
    console.error('Error updating commissions:', updateCommissionsError)
  }

  return { success: true, payoutId: payout.id }
}

export async function getPharmacyById(pharmacyId: string): Promise<PharmacySponsor | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pharmacy_sponsors')
    .select('*')
    .eq('id', pharmacyId)
    .single()

  if (error) return null
  return data as PharmacySponsor
}

export async function getPharmacySponsorById(id: string): Promise<PharmacySponsor | null> {
  return getPharmacyById(id)
}

export async function getPharmacySponsorBySlug(slug: string): Promise<PharmacySponsor | null> {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('pharmacy_sponsors')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data as PharmacySponsor
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

export async function matchPharmacy(
  prescriptionId: string,
  patientLocation?: PharmacyLocation
): Promise<PharmacyMatch[]> {
  const supabase = createServiceClient()

  const { data: prescription } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', prescriptionId)
    .single()
  
  if (!prescription) {
    throw new Error('Prescription not found')
  }
  
  const medications = JSON.parse(prescription.medications || '[]') as string[]
  const estimatedTotal = calculateBaseMedicationPrice(medications)
  
  let query = supabase
    .from('pharmacy_sponsors')
    .select('*')
    .eq('status', 'approved')
  
  if (patientLocation?.city) {
    query = query.ilike('city', `%${patientLocation.city}%`)
  }
  
  const { data: pharmacies, error } = await query.order('priority', { ascending: false }).order('name', { ascending: true })
  
  if (error || !pharmacies) {
    console.error('Error fetching pharmacies:', error)
    return []
  }
  
  const matches: PharmacyMatch[] = pharmacies.map((pharmacy) => {
    const distance = patientLocation?.latitude && patientLocation?.longitude && pharmacy.latitude && pharmacy.longitude
      ? calculateDistance(
          patientLocation.latitude,
          patientLocation.longitude,
          pharmacy.latitude,
          pharmacy.longitude
        )
      : null
    
    return {
      pharmacy: pharmacy as PharmacySponsor,
      estimatedTotal,
      distance,
      savings: null,
      hasDelivery: pharmacy.offers_delivery || false,
      deliveryTime: pharmacy.delivery_time_hours || null,
      discountCode: pharmacy.doctory_discount_code || null,
      availability: medications.length,
    }
  })
  
  matches.forEach((match, idx) => {
    if (idx > 0 && matches[0]) {
      match.savings = matches[0].estimatedTotal - match.estimatedTotal
    }
  })
  
  matches.sort((a, b) => {
    if (a.estimatedTotal !== b.estimatedTotal) {
      return a.estimatedTotal - b.estimatedTotal
    }
    if (a.distance !== null && b.distance !== null) {
      return a.distance - b.distance
    }
    return 0
  })
  
  return matches.slice(0, 5)
}

export async function getDoctorEarnings(doctorId: string) {
  const supabase = createServiceClient()
  
  const { data: commissions, error: commissionsError } = await supabase
    .from('pharmacy_commissions')
    .select('*')
    .eq('doctor_id', doctorId)
  
  if (commissionsError) throw commissionsError
  
  const { data: referrals, error: referralsError } = await supabase
    .from('pharmacy_referrals')
    .select('status')
    .eq('doctor_id', doctorId)
  
  if (referralsError) throw referralsError
  
  const totalReferrals = referrals?.length || 0
  const redeemedReferrals = referrals?.filter((r) => r.status === 'redeemed').length || 0
  const pendingReferrals = referrals?.filter((r) => r.status !== 'redeemed' && r.status !== 'cancelled' && r.status !== 'expired').length || 0
  
  const totalReferralFees = commissions?.reduce((sum, c) => sum + (c.referral_fee_cents || 0), 0) || 0
  const totalCommissions = commissions?.reduce((sum, c) => sum + (c.commission_amount_cents || 0), 0) || 0
  const platformFees = commissions?.reduce((sum, c) => sum + (c.platform_fee_cents || 0), 0) || 0
  const netEarnings = commissions?.reduce((sum, c) => sum + (c.net_doctor_earnings_cents || 0), 0) || 0
  
  return {
    totalReferrals,
    redeemedReferrals,
    pendingReferrals,
    totalReferralFees,
    totalCommissions,
    platformFees,
    netEarnings,
  }
}

export async function getDoctorReferrals(doctorId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('pharmacy_referrals')
    .select(`
      *,
      pharmacy:pharmacy_sponsors(name, slug, logo_url, phone, city, neighborhood)
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data || []
}

export async function getReferralByCode(referralCode: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('pharmacy_referrals')
    .select(`
      *,
      pharmacy:pharmacy_sponsors(*),
      prescription:prescriptions(*)
    `)
    .eq('referral_code', referralCode)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data
}

export async function updateReferralStatus(referralId: string, status: string) {
  const supabase = createServiceClient()
  
  const updates: Record<string, unknown> = { status }
  
  switch (status) {
    case 'viewed':
      updates.viewed_at = new Date().toISOString()
      break
    case 'contacted':
      updates.contacted_at = new Date().toISOString()
      break
    case 'scheduled':
      updates.scheduled_pickup_at = new Date().toISOString()
      break
    case 'redeemed':
      updates.redeemed_at = new Date().toISOString()
      break
  }
  
  const { error } = await supabase
    .from('pharmacy_referrals')
    .update(updates)
    .eq('id', referralId)
  
  if (error) throw error
}

export async function getPharmacyEarnings(pharmacyId: string) {
  const supabase = createServiceClient()
  
  const { data: commissions, error: commissionsError } = await supabase
    .from('pharmacy_commissions')
    .select('*')
    .eq('pharmacy_id', pharmacyId)
  
  if (commissionsError) throw commissionsError
  
  const { data: referrals, error: referralsError } = await supabase
    .from('pharmacy_referrals')
    .select('status')
    .eq('pharmacy_id', pharmacyId)
  
  if (referralsError) throw referralsError
  
  const totalPayouts = commissions?.reduce((sum, c) => sum + (c.total_payout_cents || 0), 0) || 0
  const pendingPayouts = commissions?.filter((c) => c.status === 'pending').reduce((sum, c) => sum + (c.total_payout_cents || 0), 0) || 0
  const paidPayouts = commissions?.filter((c) => c.status === 'paid').reduce((sum, c) => sum + (c.total_payout_cents || 0), 0) || 0
  
  return {
    totalReferrals: referrals?.length || 0,
    redeemedReferrals: referrals?.filter((r) => r.status === 'redeemed').length || 0,
    totalPayouts,
    pendingPayouts,
    paidPayouts,
  }
}

export async function getPharmacyByEmail(email: string): Promise<PharmacySponsor | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('pharmacy_sponsors')
    .select('*')
    .eq('contact_email', email)
    .single()

  if (error) return null
  return data as PharmacySponsor
}

export async function getPharmacyReferrals(pharmacyId: string, status?: string): Promise<PharmacyReferral[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('pharmacy_referrals')
    .select('*, pharmacy:pharmacy_sponsors(*)')
    .eq('pharmacy_id', pharmacyId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as PharmacyReferral[]
}

export async function getPharmacyStats(pharmacyId: string): Promise<{
  totalReferrals: number
  redeemedReferrals: number
  pendingReferrals: number
  totalRevenue: number
  thisMonthRevenue: number
}> {
  const supabase = createServiceClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: referrals } = await supabase
    .from('pharmacy_referrals')
    .select('status, created_at')
    .eq('pharmacy_id', pharmacyId)

  const { data: commissions } = await supabase
    .from('pharmacy_commissions')
    .select('total_payout_cents, created_at')
    .eq('pharmacy_id', pharmacyId)
    .eq('status', 'approved')

  const totalReferrals = referrals?.length || 0
  const redeemedReferrals = referrals?.filter((r) => r.status === 'redeemed').length || 0
  const pendingReferrals = referrals?.filter((r) => r.status === 'sent').length || 0

  const totalRevenue = commissions?.reduce((sum, c) => sum + c.total_payout_cents, 0) || 0
  const thisMonthRevenue = commissions
    ?.filter((c) => c.created_at >= startOfMonth)
    .reduce((sum, c) => sum + c.total_payout_cents, 0) || 0

  return {
    totalReferrals,
    redeemedReferrals,
    pendingReferrals,
    totalRevenue,
    thisMonthRevenue,
  }
}

export async function getAllPharmacies(status?: string): Promise<PharmacySponsor[]> {
  const supabase = createServiceClient()

  let query = supabase.from('pharmacy_sponsors').select('*')

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return []
  return data as PharmacySponsor[]
}

export async function approvePharmacy(
  pharmacyId: string,
  approvedBy: string
): Promise<boolean> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('pharmacy_sponsors')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    })
    .eq('id', pharmacyId)

  return !error
}

export async function rejectPharmacy(pharmacyId: string): Promise<boolean> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('pharmacy_sponsors')
    .update({ status: 'rejected' })
    .eq('id', pharmacyId)

  return !error
}

export async function applyToBePharmacy(
  name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string
): Promise<{ success: boolean; pharmacyId?: string; error?: string }> {
  const supabase = await createClient()

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const { data: existing } = await supabase
    .from('pharmacy_sponsors')
    .select('id')
    .eq('contact_email', email)
    .single()

  if (existing) {
    return { success: false, error: 'Email already registered as pharmacy partner' }
  }

  const { data: pharmacy, error } = await supabase
    .from('pharmacy_sponsors')
    .insert({
      name,
      slug,
      contact_email: email,
      contact_phone: phone,
      address,
      city,
      state,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, pharmacyId: pharmacy.id }
}

export async function getAppointmentSponsorship(appointmentId: string) {
  const supabase = createServiceClient()

  try {
    const { data: sponsorship, error } = await supabase
      .from('appointment_sponsorships')
      .select(`
        *,
        pharmacy_sponsors (
          id,
          name,
          phone,
          email,
          offers_delivery,
          delivery_time_hours
        )
      `)
      .eq('appointment_id', appointmentId)
      .single()

    if (error) {
      return null
    }

    return sponsorship
  } catch (error) {
    console.error('Error getting sponsorship:', error)
    return null
  }
}

export async function getPharmacyDetails(pharmacyId: string) {
  const supabase = createServiceClient()

  try {
    const { data: pharmacy, error } = await supabase
      .from('pharmacy_sponsors')
      .select('*')
      .eq('id', pharmacyId)
      .single()

    if (error) {
      return null
    }

    return pharmacy
  } catch (error) {
    console.error('Error getting pharmacy details:', error)
    return null
  }
}

export async function getActivePharmacies() {
  const supabase = createServiceClient()

  try {
    const { data: pharmacies, error } = await supabase
      .from('pharmacy_sponsors')
      .select('*')
      .eq('status', 'approved')
      .order('name', { ascending: true })

    if (error) {
      return []
    }

    return pharmacies || []
  } catch (error) {
    console.error('Error getting active pharmacies:', error)
    return []
  }
}

export async function isPharmacyAvailable(
  pharmacyId: string,
  city: string,
  state: string
): Promise<boolean> {
  const supabase = createServiceClient()

  try {
    const { data: pharmacy, error } = await supabase
      .from('pharmacy_sponsors')
      .select('cities, states, status')
      .eq('id', pharmacyId)
      .single()

    if (error || !pharmacy) {
      return false
    }

    if (pharmacy.status !== 'approved') {
      return false
    }

    const citiesCovered = pharmacy.cities?.includes(city) || false
    const statesCovered = pharmacy.states?.includes(state) || false

    return citiesCovered && statesCovered
  } catch (error) {
    console.error('Error checking pharmacy availability:', error)
    return false
  }
}

function getPharmacyPriceMultiplier(slug: string): number {
  const multipliers: Record<string, number> = {
    'farmacia-guadalajara': 0.95,
    'farmacia-ahorro': 0.92,
    'farmacia-yza': 0.94,
    'farmacia-similares': 0.90,
    'farmacia-san-josé': 0.93,
    'farmacia-abc': 0.96,
  }

  return multipliers[slug] || 1.0
}

function calculateMatchScore(
  distance: number | null,
  savings: number,
  status: string
): number {
  let score = 0

  if (status === 'approved') score += 30

  if (distance !== null) {
    if (distance < 2) score += 25
    else if (distance < 5) score += 20
    else if (distance < 10) score += 15
    else score += 10
  } else {
    score += 15
  }

  if (savings > 100) score += 25
  else if (savings > 50) score += 20
  else if (savings > 25) score += 15
  else score += 10

  return score
}

function calculateDistance(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null

  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

function calculateBaseMedicationPrice(medications: string[]): number {
  const basePrices: Record<string, number> = {
    amoxicilina: 350,
    ibuprofeno: 250,
    paracetamol: 200,
    omeprazol: 450,
    metformina: 300,
    losartan: 380,
    atorvastatina: 550,
    amlodipino: 420,
    prednisona: 280,
    ciprofloxacino: 400,
  }

  let total = 0
  for (const med of medications) {
    const normalizedMed = med.toLowerCase()
    for (const [key, price] of Object.entries(basePrices)) {
      if (normalizedMed.includes(key)) {
        total += price
        break
      }
    }
  }

  return total || 500
}
