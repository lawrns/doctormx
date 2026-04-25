// Sponsored Visibility System - Doctors pay for featured placement in search results
// Input: specialty, city
// Process: Query active sponsorships → Return ordered sponsored doctors
// Output: SponsoredSlot[] with doctor info

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

export interface SponsoredSlot {
  position: number
  doctor_id: string
  specialty: string
  city: string
  price_cents_per_day: number
  starts_at: string
  ends_at: string | null
  status: 'active' | 'paused' | 'ended'
}

export interface SponsoredDoctorResult {
  slot: SponsoredSlot
  doctor: {
    id: string
    full_name: string
    photo_url: string | null
    rating_avg: number
    price_cents: number
    city: string | null
    state: string | null
  } | null
}

/**
 * Get sponsored doctors for a given market (specialty + city)
 */
export async function getSponsoredDoctors(
  specialty: string,
  city: string
): Promise<SponsoredDoctorResult[]> {
  const supabase = createServiceClient()

  try {
    const { data: slots, error } = await supabase
      .from('sponsored_slots')
      .select(`
        position,
        doctor_id,
        specialty,
        city_slug,
        price_cents_per_day,
        starts_at,
        ends_at,
        status
      `)
      .eq('specialty', specialty)
      .eq('city_slug', city)
      .eq('status', 'active')
      .lte('starts_at', new Date().toISOString())
      .order('position', { ascending: true })
      .limit(3)

    if (error || !slots || slots.length === 0) {
      return []
    }

    const results: SponsoredDoctorResult[] = []

    for (const slot of slots) {
      const { data: doctor } = await supabase
        .from('doctors')
        .select(`
          id,
          price_cents,
          rating_avg,
          city,
          state,
          profiles!doctors_id_fkey (
            id,
            full_name,
            photo_url
          )
        `)
        .eq('id', slot.doctor_id)
        .single()

      const profile = doctor?.profiles
        ? (Array.isArray(doctor.profiles) ? doctor.profiles[0] : doctor.profiles)
        : null

      results.push({
        slot: {
          position: slot.position,
          doctor_id: slot.doctor_id,
          specialty: slot.specialty,
          city: slot.city_slug,
          price_cents_per_day: slot.price_cents_per_day,
          starts_at: slot.starts_at,
          ends_at: slot.ends_at,
          status: slot.status,
        },
        doctor: doctor ? {
          id: doctor.id,
          full_name: profile?.full_name ?? 'Dr.',
          photo_url: profile?.photo_url ?? null,
          rating_avg: doctor.rating_avg || 0,
          price_cents: doctor.price_cents,
          city: doctor.city,
          state: doctor.state,
        } : null,
      })
    }

    return results
  } catch (error) {
    logger.warn('Sponsored lookup failed', { error: error instanceof Error ? error.message : 'unknown', specialty, city })
    return []
  }
}

/**
 * Purchase a sponsorship slot
 */
export async function purchaseSponsorship(
  doctorId: string,
  specialty: string,
  city: string,
  position: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  try {
    const { error } = await supabase
      .from('sponsored_slots')
      .insert({
        doctor_id: doctorId,
        specialty,
        city_slug: city,
        position,
        price_cents_per_day: 5000,
        status: 'active',
      })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Esta posición ya está ocupada en este mercado' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    logger.error('Sponsorship purchase failed', { error })
    return { success: false, error: 'Error al comprar el patrocinio' }
  }
}

/**
 * Get total sponsorship spending for a doctor
 */
export async function getSponsorshipSpending(doctorId: string): Promise<number> {
  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .from('sponsored_slots')
      .select('price_cents_per_day, starts_at, ends_at, status')
      .eq('doctor_id', doctorId)
      .eq('status', 'active')

    if (error || !data) return 0

    let total = 0
    const now = new Date()

    for (const slot of data) {
      const start = new Date(slot.starts_at)
      const end = slot.ends_at ? new Date(slot.ends_at) : now
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
      total += slot.price_cents_per_day * days
    }

    return total
  } catch (error) {
    logger.warn('Sponsorship spending lookup failed', { error })
    return 0
  }
}
