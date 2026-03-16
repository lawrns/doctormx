// Platform Fee System - Revenue from Consult Transactions
// Input: Consult amount, doctor tier
// Process: Calculate platform fee based on tier
// Output: Fee amount + Stripe transfer split

import { SubscriptionTier } from './subscription-types'

/**
 * Platform fee structure by tier
 * Lower fees for higher tiers to incentivize upgrades
 */
export const PLATFORM_FEES = {
  starter: 0.10,  // 10% for starter tier
  pro: 0.05,      // 5% for pro tier  
  elite: 0.00,    // 0% for elite tier (major selling point)
} as const

export type PlatformFeeTier = keyof typeof PLATFORM_FEES

/**
 * Calculate platform fee for a consultation
 * @param amount - Amount in cents
 * @param tier - Doctor's subscription tier
 * @returns Platform fee in cents
 */
export function calculatePlatformFee(
  amount: number,
  tier: SubscriptionTier | PlatformFeeTier
): number {
  const feeRate = PLATFORM_FEES[tier as PlatformFeeTier] ?? PLATFORM_FEES.starter
  return Math.round(amount * feeRate)
}

/**
 * Calculate net amount for doctor after platform fee
 * @param amount - Gross amount in cents
 * @param tier - Doctor's subscription tier
 * @returns Net amount for doctor in cents
 */
export function calculateDoctorNetAmount(
  amount: number,
  tier: SubscriptionTier | PlatformFeeTier
): number {
  const fee = calculatePlatformFee(amount, tier)
  return amount - fee
}

/**
 * Get platform fee percentage for display
 * @param tier - Doctor's subscription tier
 * @returns Percentage string (e.g., "10%")
 */
export function getPlatformFeeDisplay(tier: SubscriptionTier | PlatformFeeTier): string {
  const feeRate = PLATFORM_FEES[tier as PlatformFeeTier] ?? PLATFORM_FEES.starter
  return `${Math.round(feeRate * 100)}%`
}

/**
 * Platform fee breakdown for UI display
 */
export interface FeeBreakdown {
  grossAmount: number
  platformFee: number
  platformFeePercent: string
  doctorNet: number
  stripeFee: number // Stripe's fee (~2.9% + $0.30)
  doctorReceives: number
}

/**
 * Calculate complete fee breakdown
 * @param amount - Consult price in cents
 * @param tier - Doctor's subscription tier
 * @returns Complete fee breakdown
 */
export function calculateFeeBreakdown(
  amount: number,
  tier: SubscriptionTier | PlatformFeeTier
): FeeBreakdown {
  const platformFee = calculatePlatformFee(amount, tier)
  const doctorNet = amount - platformFee
  
  // Stripe fee: 2.9% + $0.30 (in cents)
  // Note: Stripe fees are paid by platform from our share
  const stripeFee = Math.round(amount * 0.029) + 30
  
  return {
    grossAmount: amount,
    platformFee,
    platformFeePercent: getPlatformFeeDisplay(tier),
    doctorNet,
    stripeFee,
    doctorReceives: doctorNet, // Doctor gets full net, we pay Stripe fees
  }
}

/**
 * Check if doctor has platform fee waived
 * Elite tier doctors pay 0%
 */
export function hasPlatformFeeWaived(tier: SubscriptionTier): boolean {
  return tier === 'elite'
}

/**
 * Annual revenue projection for a doctor
 * @param consultsPerMonth - Average monthly consults
 * @param avgConsultPrice - Average consult price in cents
 * @param tier - Doctor's subscription tier
 * @returns Projected annual platform revenue from this doctor
 */
export function projectAnnualPlatformRevenue(
  consultsPerMonth: number,
  avgConsultPrice: number,
  tier: SubscriptionTier
): number {
  const monthlyFee = consultsPerMonth * calculatePlatformFee(avgConsultPrice, tier)
  return monthlyFee * 12
}
