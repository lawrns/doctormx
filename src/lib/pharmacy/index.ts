/**
 * Pharmacy Module
 * 
 * Organized exports for pharmacy functionality.
 */

// Types
export type {
  PharmacySponsor,
  PharmacyReferral,
  PharmacyCommission,
  PharmacyRecommendation,
  PatientLocation,
  PharmacyMatch,
  PharmacyLocation,
  PharmacyStats,
  DoctorEarnings,
  PharmacyEarnings,
  TwilioConfig,
  WhatsAppResult,
  PayoutResult,
  ApplicationResult,
  TrackingResult,
  RedemptionResult,
} from './types'

// Core Pharmacy Operations
export {
  getPharmacyById,
  getPharmacySponsorById,
  getPharmacySponsorBySlug,
  getPharmacyByEmail,
  getAllPharmacies,
  getActivePharmacies,
  isPharmacyAvailable,
  approvePharmacy,
  rejectPharmacy,
  applyToBePharmacy,
  getPharmacyDetails,
  getAppointmentSponsorship,
} from './pharmacy'

// Search & Matching
export {
  findSponsorPharmacies,
  getLowestPricePharmacy,
  matchPharmacy,
} from './search'

// Referrals
export {
  generateReferralCode,
  createReferral,
  trackReferral,
  markReferralSent,
  redeemReferral,
  getDoctorReferrals,
  getReferralByCode,
  updateReferralStatus,
  getPharmacyReferrals,
} from './referrals'

// Earnings & Payouts
export {
  calculateAndCreateCommission,
  processPharmacyPayout,
  getDoctorEarnings,
  getPharmacyEarnings,
  getPharmacyStats,
} from './earnings'

// WhatsApp
export {
  sendPharmacyReferralWhatsApp,
} from './whatsapp'

// API (Twilio)
export {
  getTwilioConfig,
  sendTwilioWhatsApp,
} from './api'

// Utilities
export {
  getPharmacyPriceMultiplier,
  calculateMatchScore,
  calculateDistance,
  calculateBaseMedicationPrice,
  buildRecommendations,
} from './utils'
