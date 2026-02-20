/**
 * Pharmacy Delivery Service
 * Delivery estimates, availability checks, and logistics
 * 
 * @module services/pharmacy/delivery-service
 */

import type { 
  Coordinates, 
  DeliveryEstimate, 
  Address 
} from './types';
import { PharmacyChain, DeliveryType } from './types';
import { withRetry, calculateDistance } from './utils';
import { PHARMACY_CONFIGS } from './config';

// Mock pharmacy locations (simplified)
const PHARMACY_LOCATIONS: Record<PharmacyChain, Coordinates> = {
  [PharmacyChain.GUADALAJARA]: { latitude: 20.6767, longitude: -103.3475 },
  [PharmacyChain.AHORRO]: { latitude: 20.6597, longitude: -103.3496 },
  [PharmacyChain.SIMILARES]: { latitude: 20.6736, longitude: -103.4058 },
  [PharmacyChain.BENAVIDES]: { latitude: 20.6407, longitude: -103.3915 },
  [PharmacyChain.SAN_PABLO]: { latitude: 20.6919, longitude: -103.3706 },
  [PharmacyChain.YZA]: { latitude: 20.6211, longitude: -103.4186 },
};

/**
 * Get delivery estimates for a location
 */
export async function getDeliveryEstimates(
  coordinates: Coordinates,
  deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY,
  useMockData: boolean = true
): Promise<DeliveryEstimate[]> {
  return withRetry(async () => {
    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    return mockDeliveryEstimates(coordinates, deliveryType);
  });
}

/**
 * Mock delivery estimates for development
 */
function mockDeliveryEstimates(
  coordinates: Coordinates,
  deliveryType: DeliveryType
): DeliveryEstimate[] {
  return Object.values(PHARMACY_CONFIGS).map(config => {
    const pharmacyLocation = PHARMACY_LOCATIONS[config.id];
    const distance = calculateDistance(coordinates, pharmacyLocation);
    
    // Check if within coverage radius
    const withinCoverage = distance <= config.deliveryConfig.coverageRadiusKm;

    if (!withinCoverage) {
      return {
        pharmacyId: config.id,
        deliveryType,
        estimatedMinutes: 0,
        cost: 0,
        available: false,
        message: `Fuera de zona de cobertura (${distance.toFixed(1)} km)`,
      };
    }

    // Calculate estimated time based on distance
    const baseTime = deliveryType === DeliveryType.EXPRESS && config.features.expressDelivery
      ? config.deliveryConfig.expressDeliveryTime
      : config.deliveryConfig.baseDeliveryTime;

    // Add time per km (roughly 2 min per km in urban area)
    const distanceTime = Math.round(distance * 2);
    const estimatedMinutes = baseTime + distanceTime;

    // Calculate cost
    const baseCost = deliveryType === DeliveryType.EXPRESS && config.features.expressDelivery
      ? config.deliveryConfig.expressCost
      : config.deliveryConfig.baseCost;

    return {
      pharmacyId: config.id,
      deliveryType,
      estimatedMinutes,
      cost: baseCost,
      available: true,
      message: `Entrega estimada en ${estimatedMinutes} minutos`,
    };
  });
}

/**
 * Verify if delivery is available to an address
 */
export async function verifyDeliveryAvailability(
  address: Address,
  pharmacyId?: PharmacyChain,
  useMockData: boolean = true
): Promise<{
  available: boolean;
  pharmacies?: Array<{
    pharmacyId: PharmacyChain;
    available: boolean;
    estimatedMinutes?: number;
    cost?: number;
  }>;
  message: string;
}> {
  if (!address.coordinates) {
    return {
      available: false,
      message: 'Coordenadas no disponibles para la dirección proporcionada',
    };
  }

  const estimates = await getDeliveryEstimates(
    address.coordinates,
    DeliveryType.HOME_DELIVERY,
    useMockData
  );

  const availablePharmacies = estimates
    .filter(e => e.available)
    .map(e => ({
      pharmacyId: e.pharmacyId,
      available: true,
      estimatedMinutes: e.estimatedMinutes,
      cost: e.cost,
    }));

  if (pharmacyId) {
    const specific = estimates.find(e => e.pharmacyId === pharmacyId);
    return {
      available: specific?.available ?? false,
      message: specific?.message ?? 'Farmacia no disponible',
    };
  }

  return {
    available: availablePharmacies.length > 0,
    pharmacies: availablePharmacies,
    message: availablePharmacies.length > 0
      ? `${availablePharmacies.length} farmacias disponibles`
      : 'No hay farmacias disponibles para esta ubicación',
  };
}

/**
 * Get the nearest pharmacy to a location
 */
export function getNearestPharmacy(
  coordinates: Coordinates
): { pharmacyId: PharmacyChain; distance: number } | null {
  let nearest: { pharmacyId: PharmacyChain; distance: number } | null = null;

  for (const [pharmacyId, location] of Object.entries(PHARMACY_LOCATIONS)) {
    const distance = calculateDistance(coordinates, location);
    if (!nearest || distance < nearest.distance) {
      nearest = { pharmacyId: pharmacyId as PharmacyChain, distance };
    }
  }

  return nearest;
}

/**
 * Check if coordinates are within delivery range of a pharmacy
 */
export function isWithinDeliveryRange(
  coordinates: Coordinates,
  pharmacyId: PharmacyChain
): boolean {
  const config = PHARMACY_CONFIGS[pharmacyId];
  const pharmacyLocation = PHARMACY_LOCATIONS[pharmacyId];
  
  if (!config || !pharmacyLocation) {
    return false;
  }

  const distance = calculateDistance(coordinates, pharmacyLocation);
  return distance <= config.deliveryConfig.coverageRadiusKm;
}

/**
 * Calculate delivery cost based on distance and delivery type
 */
export function calculateDeliveryCost(
  pharmacyId: PharmacyChain,
  deliveryType: DeliveryType,
  distance?: number
): number {
  const config = PHARMACY_CONFIGS[pharmacyId];
  
  if (!config) {
    return 0;
  }

  if (deliveryType === DeliveryType.EXPRESS && config.features.expressDelivery) {
    return config.deliveryConfig.expressCost;
  }

  return config.deliveryConfig.baseCost;
}

/**
 * Get delivery time estimate based on distance
 */
export function estimateDeliveryTime(
  pharmacyId: PharmacyChain,
  deliveryType: DeliveryType,
  coordinates: Coordinates
): number {
  const config = PHARMACY_CONFIGS[pharmacyId];
  const pharmacyLocation = PHARMACY_LOCATIONS[pharmacyId];
  
  if (!config || !pharmacyLocation) {
    return 0;
  }

  const distance = calculateDistance(coordinates, pharmacyLocation);
  const baseTime = deliveryType === DeliveryType.EXPRESS && config.features.expressDelivery
    ? config.deliveryConfig.expressDeliveryTime
    : config.deliveryConfig.baseDeliveryTime;

  // Add time per km (roughly 2 min per km in urban area)
  const distanceTime = Math.round(distance * 2);
  return baseTime + distanceTime;
}
