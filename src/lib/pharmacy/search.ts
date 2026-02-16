/**
 * Pharmacy Search
 * 
 * Search and matching functionality for pharmacies.
 */

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { 
  PharmacySponsor, 
  PharmacyRecommendation, 
  PatientLocation,
  PharmacyMatch,
  PharmacyLocation
} from './types'
import { buildRecommendations, calculateDistance as calcDist } from './utils'

/**
 * Find sponsor pharmacies based on patient location and medications
 */
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
    logger.error('Error searching pharmacies', { error: (error as Error).message }, error as Error)
    return []
  }

  const recommendations = buildRecommendations(
    pharmacies as PharmacySponsor[], 
    patientLocation, 
    medications
  )

  return recommendations
    .filter((r) => r.hasMedications)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}

/**
 * Get lowest price pharmacy for a medication
 */
export async function getLowestPricePharmacy(
  medication: string,
  location: PatientLocation | null
): Promise<PharmacyRecommendation | null> {
  const recommendations = await findSponsorPharmacies(location, [medication])
  return recommendations.length > 0 ? recommendations[0] : null
}

/**
 * Match pharmacies for a prescription
 */
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

  let query = supabase
    .from('pharmacy_sponsors')
    .select('*')
    .eq('status', 'approved')

  if (patientLocation?.city) {
    query = query.ilike('city', `%${patientLocation.city}%`)
  }

  const { data: pharmacies, error } = await query
    .order('priority', { ascending: false })
    .order('name', { ascending: true })

  if (error || !pharmacies) {
    logger.error('Error matching pharmacies', { error: (error as Error).message }, error as Error)
    return []
  }

  const matches: PharmacyMatch[] = pharmacies.map((pharmacy) => {
    const distance = patientLocation?.latitude && patientLocation?.longitude && 
                     pharmacy.latitude && pharmacy.longitude
      ? calcDist(
          patientLocation.latitude,
          patientLocation.longitude,
          pharmacy.latitude,
          pharmacy.longitude
        )
      : null

    return {
      pharmacy: pharmacy as PharmacySponsor,
      estimatedTotal: medications.length * 100, // Placeholder
      distance,
      savings: null,
      hasDelivery: pharmacy.offers_delivery || false,
      deliveryTime: pharmacy.delivery_time_hours || null,
      discountCode: pharmacy.doctory_discount_code || null,
      availability: medications.length,
    }
  })

  // Calculate savings relative to first match
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
