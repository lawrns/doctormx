/**
 * Pricing constants for Doctor.mx
 * Centralized pricing configuration for subscriptions, consultations, and platform fees
 */

export const PRICING = {
  // Subscription tiers (in MXN)
  STARTER_PRICE_MXN: 499,
  PRO_PRICE_MXN: 999,
  ELITE_PRICE_MXN: 1999,

  // Subscription tiers (in cents)
  STARTER_PRICE_CENTS: 49900,
  PRO_PRICE_CENTS: 99900,
  ELITE_PRICE_CENTS: 199900,

  // Individual premium features (MXN)
  IMAGE_ANALYSIS_SINGLE_MXN: 50,
  CLINICAL_COPILOT_SINGLE_MXN: 30,
  EXTENDED_TRANSCRIPTION_SINGLE_MXN: 20,

  // Individual premium features (cents)
  IMAGE_ANALYSIS_SINGLE_CENTS: 5000,
  CLINICAL_COPILOT_SINGLE_CENTS: 3000,
  EXTENDED_TRANSCRIPTION_SINGLE_CENTS: 2000,

  // Monthly bundles (MXN)
  IMAGE_ANALYSIS_MONTHLY_MXN: 400,
  CLINICAL_COPILOT_MONTHLY_MXN: 1200,
  EXTENDED_TRANSCRIPTION_MONTHLY_MXN: 400,

  // Monthly bundles (cents)
  IMAGE_ANALYSIS_MONTHLY_CENTS: 40000,
  CLINICAL_COPILOT_MONTHLY_CENTS: 120000,
  EXTENDED_TRANSCRIPTION_MONTHLY_CENTS: 40000,

  // Bundle savings percentage
  BUNDLE_SAVINGS_PERCENT: 20,

  // Monthly bundle quantities
  IMAGE_ANALYSIS_BUNDLE_QUANTITY: 10,
  CLINICAL_COPILOT_BUNDLE_QUANTITY: 50,
  EXTENDED_TRANSCRIPTION_BUNDLE_QUANTITY: 10,

  // Platform fee percentage (40%)
  PLATFORM_FEE_PERCENT: 0.40,
} as const

export type PricingKey = keyof typeof PRICING

