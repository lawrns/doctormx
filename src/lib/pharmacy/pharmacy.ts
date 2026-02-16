/**
 * Pharmacy Core
 * 
 * Core pharmacy operations: CRUD and management.
 */

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { PharmacySponsor, ApplicationResult } from './types'

/**
 * Get pharmacy by ID
 */
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

/**
 * Get pharmacy sponsor by ID (alias for getPharmacyById)
 */
export async function getPharmacySponsorById(id: string): Promise<PharmacySponsor | null> {
  return getPharmacyById(id)
}

/**
 * Get pharmacy sponsor by slug
 */
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

/**
 * Get pharmacy by email
 */
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

/**
 * Get all pharmacies with optional status filter
 */
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

/**
 * Get active (approved) pharmacies
 */
export async function getActivePharmacies(): Promise<PharmacySponsor[]> {
  const supabase = createServiceClient()

  try {
    const { data: pharmacies, error } = await supabase
      .from('pharmacy_sponsors')
      .select('*')
      .eq('status', 'approved')
      .order('name', { ascending: true })

    if (error) return []
    return pharmacies || []
  } catch (error) {
    logger.error('Error getting active pharmacies', { error: (error as Error).message }, error as Error)
    return []
  }
}

/**
 * Check if pharmacy is available for a location
 */
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

    if (error || !pharmacy || pharmacy.status !== 'approved') {
      return false
    }

    const citiesCovered = pharmacy.cities?.includes(city) || false
    const statesCovered = pharmacy.states?.includes(state) || false

    return citiesCovered && statesCovered
  } catch (error) {
    logger.error('Error checking pharmacy availability', { error: (error as Error).message }, error as Error)
    return false
  }
}

/**
 * Approve pharmacy application
 */
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

/**
 * Reject pharmacy application
 */
export async function rejectPharmacy(pharmacyId: string): Promise<boolean> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('pharmacy_sponsors')
    .update({ status: 'rejected' })
    .eq('id', pharmacyId)

  return !error
}

/**
 * Submit pharmacy application
 */
export async function applyToBePharmacy(
  name: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string
): Promise<ApplicationResult> {
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

/**
 * Get pharmacy details by ID
 */
export async function getPharmacyDetails(pharmacyId: string) {
  const supabase = createServiceClient()

  try {
    const { data: pharmacy, error } = await supabase
      .from('pharmacy_sponsors')
      .select('*')
      .eq('id', pharmacyId)
      .single()

    if (error) return null
    return pharmacy
  } catch (error) {
    logger.error('Error getting pharmacy details', { error: (error as Error).message }, error as Error)
    return null
  }
}

/**
 * Get appointment sponsorship
 */
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

    if (error) return null
    return sponsorship
  } catch (error) {
    logger.error('Error getting appointment sponsorship', { error: (error as Error).message }, error as Error)
    return null
  }
}
