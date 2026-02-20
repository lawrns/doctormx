/**
 * Pharmacy Affiliate Service
 * Affiliate link generation and commission tracking
 * 
 * @module services/pharmacy/affiliate-service
 */

import { PharmacyChain } from './types';
import { PHARMACY_CONFIGS } from './config';

// Store affiliate codes (in production, this would be in a database or config)
const affiliateCodes = new Map<PharmacyChain, string>();

/**
 * Set affiliate code for a pharmacy
 */
export function setAffiliateCode(pharmacyId: PharmacyChain, code: string): void {
  affiliateCodes.set(pharmacyId, code);
}

/**
 * Get affiliate code for a pharmacy
 */
export function getAffiliateCode(pharmacyId: PharmacyChain): string | undefined {
  return affiliateCodes.get(pharmacyId);
}

/**
 * Generate affiliate link for a product
 */
export function generateAffiliateLink(pharmacyId: PharmacyChain, productId: string): string {
  const config = PHARMACY_CONFIGS[pharmacyId];
  
  if (!config || !config.affiliateProgram.enabled) {
    return config ? `${config.website}/product/${productId}` : '';
  }

  const affiliateCode = affiliateCodes.get(pharmacyId);
  
  if (!affiliateCode) {
    // Return regular product URL if no affiliate code set
    return `${config.affiliateProgram.baseUrl}/${productId}`;
  }

  // Build affiliate URL
  const separator = config.affiliateProgram.baseUrl.includes('?') ? '&' : '?';
  return `${config.affiliateProgram.baseUrl}/${productId}${separator}${config.affiliateProgram.trackingParam}=${affiliateCode}`;
}

/**
 * Get affiliate commission information
 */
export function getAffiliateInfo(pharmacyId: PharmacyChain): {
  enabled: boolean;
  commissionRate: number;
  estimatedCommission: number; // per $1000
} {
  const config = PHARMACY_CONFIGS[pharmacyId];
  return {
    enabled: config.affiliateProgram.enabled,
    commissionRate: config.affiliateProgram.commissionRate,
    estimatedCommission: 1000 * config.affiliateProgram.commissionRate,
  };
}

/**
 * Calculate affiliate commission for an order
 */
export function calculateAffiliateCommission(
  pharmacyId: PharmacyChain,
  orderTotal: number,
  affiliateCode?: string
): number | undefined {
  const config = PHARMACY_CONFIGS[pharmacyId];
  
  if (!affiliateCode || !config?.affiliateProgram.enabled) {
    return undefined;
  }

  return orderTotal * config.affiliateProgram.commissionRate;
}

/**
 * Get all affiliate programs information
 */
export function getAllAffiliatePrograms(): Array<{
  pharmacyId: PharmacyChain;
  name: string;
  enabled: boolean;
  commissionRate: number;
}> {
  return Object.values(PHARMACY_CONFIGS).map(config => ({
    pharmacyId: config.id,
    name: config.displayName,
    enabled: config.affiliateProgram.enabled,
    commissionRate: config.affiliateProgram.commissionRate,
  }));
}
