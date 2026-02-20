/**
 * Pharmacy Configuration Service
 * Manages pharmacy configurations and settings
 * 
 * @module services/pharmacy/config
 */

import type { PharmacyConfig } from './types';
import { PharmacyChain } from './types';
import { PharmacyIntegrationError } from './errors';

// Import pharmacy configurations from JSON
import pharmacyConfigsJson from './mock-data/pharmacies.json';

// Type assertion for the imported JSON
const PHARMACY_CONFIGS: Record<PharmacyChain, PharmacyConfig> = 
  pharmacyConfigsJson as Record<PharmacyChain, PharmacyConfig>;

/**
 * Get configuration for a specific pharmacy
 */
export function getPharmacyConfig(pharmacyId: PharmacyChain): PharmacyConfig {
  const config = PHARMACY_CONFIGS[pharmacyId];
  if (!config) {
    throw new PharmacyIntegrationError(
      `Configuration not found for pharmacy: ${pharmacyId}`,
      'CONFIG_NOT_FOUND',
      { pharmacyId, retryable: false }
    );
  }
  return config;
}

/**
 * Get all supported pharmacy chains
 */
export function getAllPharmacies(): PharmacyConfig[] {
  return Object.values(PHARMACY_CONFIGS);
}

/**
 * Get pharmacies that support a specific feature
 */
export function getPharmaciesByFeature(
  feature: keyof PharmacyConfig['features']
): PharmacyConfig[] {
  return Object.values(PHARMACY_CONFIGS).filter(
    config => config.features[feature]
  );
}

/**
 * Get pharmacies with home delivery
 */
export function getPharmaciesWithHomeDelivery(): PharmacyConfig[] {
  return getPharmaciesByFeature('homeDelivery');
}

/**
 * Get pharmacies with express delivery
 */
export function getPharmaciesWithExpressDelivery(): PharmacyConfig[] {
  return getPharmaciesByFeature('expressDelivery');
}

/**
 * Get pharmacies that accept prescriptions
 */
export function getPharmaciesWithPrescriptionSupport(): PharmacyConfig[] {
  return getPharmaciesByFeature('prescriptionUpload');
}

/**
 * Check if a pharmacy has an active affiliate program
 */
export function hasAffiliateProgram(pharmacyId: PharmacyChain): boolean {
  const config = PHARMACY_CONFIGS[pharmacyId];
  return config?.affiliateProgram.enabled ?? false;
}

/**
 * Get affiliate commission rate for a pharmacy
 */
export function getAffiliateCommissionRate(pharmacyId: PharmacyChain): number {
  const config = PHARMACY_CONFIGS[pharmacyId];
  return config?.affiliateProgram.commissionRate ?? 0;
}

/**
 * Get delivery configuration for a pharmacy
 */
export function getDeliveryConfig(pharmacyId: PharmacyChain) {
  const config = PHARMACY_CONFIGS[pharmacyId];
  return config?.deliveryConfig;
}

/**
 * Export configurations map for internal use
 */
export { PHARMACY_CONFIGS };

// ============================================================================
// MOCK PHARMACY LOCATIONS (for development/testing)
// ============================================================================

import type { Coordinates } from './types';

export const MOCK_PHARMACY_LOCATIONS: Record<PharmacyChain, Coordinates> = {
  [PharmacyChain.GUADALAJARA]: { latitude: 20.6767, longitude: -103.3475 },
  [PharmacyChain.AHORRO]: { latitude: 20.6597, longitude: -103.3496 },
  [PharmacyChain.SIMILARES]: { latitude: 20.6736, longitude: -103.4058 },
  [PharmacyChain.BENAVIDES]: { latitude: 20.6407, longitude: -103.3915 },
  [PharmacyChain.SAN_PABLO]: { latitude: 20.6919, longitude: -103.3706 },
  [PharmacyChain.YZA]: { latitude: 20.6211, longitude: -103.4186 },
};
