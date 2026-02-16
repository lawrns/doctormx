/**
 * Pharmacy Utilities
 * 
 * Helper functions for distance calculation, pricing, and scoring.
 */

import { PatientLocation, PharmacySponsor, PharmacyRecommendation } from './types'

/**
 * Get price multiplier based on pharmacy slug
 */
export function getPharmacyPriceMultiplier(slug: string): number {
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

/**
 * Calculate match score for pharmacy recommendations
 */
export function calculateMatchScore(
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

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null

  const R = 6371 // Earth's radius in km
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

/**
 * Calculate base medication price from medication list
 */
export function calculateBaseMedicationPrice(medications: string[]): number {
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

/**
 * Build pharmacy recommendations from pharmacy list and patient location
 */
export function buildRecommendations(
  pharmacies: PharmacySponsor[],
  patientLocation: PatientLocation | null,
  medications: string[]
): PharmacyRecommendation[] {
  const basePrice = calculateBaseMedicationPrice(medications)

  return pharmacies.map((pharmacy) => {
    const distance = calculateDistance(
      patientLocation?.latitude ?? null,
      patientLocation?.longitude ?? null,
      pharmacy.latitude,
      pharmacy.longitude
    )

    const pharmacyMultiplier = getPharmacyPriceMultiplier(pharmacy.slug)
    const estimatedPrice = Math.round(basePrice * pharmacyMultiplier)
    const averagePrice = basePrice * 1.05
    const savings = Math.max(0, Math.round(averagePrice - estimatedPrice))

    return {
      pharmacy,
      distanceKm: distance,
      estimatedPrice,
      savingsVsAverage: savings,
      hasMedications: true,
      matchScore: calculateMatchScore(distance, savings, pharmacy.status),
    }
  })
}
