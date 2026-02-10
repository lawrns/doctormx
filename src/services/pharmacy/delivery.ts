/**
 * Pharmacy Delivery Service
 * Delivery estimation and logistics
 *
 * @module services/pharmacy/delivery
 */

import type {
  Address,
  Coordinates,
  DeliveryEstimate,
  PharmacyChain,
} from './types';
import { DeliveryType } from './types';
import { DeliveryNotAvailableError } from './errors';
import { PHARMACY_CONFIGS, MOCK_PHARMACY_LOCATIONS } from './config';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Retry wrapper for async operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// DELIVERY SERVICE CLASS
// ============================================================================

export class DeliveryService {
  /**
   * Get delivery estimates for a location
   *
   * TODO: Replace with actual API calls using real distance calculations and routing services
   */
  async getDeliveryEstimates(
    coordinates: Coordinates,
    deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY
  ): Promise<DeliveryEstimate[]> {
    return withRetry(async () => {
      return this.calculateDeliveryEstimates(coordinates, deliveryType);
    });
  }

  /**
   * Calculate delivery estimates for all pharmacies
   */
  private calculateDeliveryEstimates(
    coordinates: Coordinates,
    deliveryType: DeliveryType
  ): DeliveryEstimate[] {
    return Object.values(PHARMACY_CONFIGS).map(config => {
      const pharmacyLocation = MOCK_PHARMACY_LOCATIONS[config.id];
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
  async verifyDeliveryAvailability(
    address: Address,
    pharmacyId?: PharmacyChain
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
      // TODO: Implement geocoding service
      return {
        available: false,
        message: 'Coordenadas no disponibles para la dirección proporcionada',
      };
    }

    const estimates = await this.getDeliveryEstimates(
      address.coordinates,
      DeliveryType.HOME_DELIVERY
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
        message: specific?.message || 'Farmacia no disponible',
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
   * Get delivery cost for a pharmacy and order total
   */
  getDeliveryCost(pharmacyId: PharmacyChain, orderTotal: number, deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY): number {
    const config = PHARMACY_CONFIGS[pharmacyId];

    if (!config) return 0;

    // Check if order qualifies for free delivery
    if (orderTotal >= config.deliveryConfig.freeDeliveryThreshold) {
      return 0;
    }

    return deliveryType === DeliveryType.EXPRESS && config.features.expressDelivery
      ? config.deliveryConfig.expressCost
      : config.deliveryConfig.baseCost;
  }

  /**
   * Get estimated delivery time for a pharmacy
   */
  getEstimatedDeliveryTime(
    pharmacyId: PharmacyChain,
    deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY,
    distanceKm?: number
  ): number {
    const config = PHARMACY_CONFIGS[pharmacyId];

    if (!config) return 60;

    const baseTime = deliveryType === DeliveryType.EXPRESS && config.features.expressDelivery
      ? config.deliveryConfig.expressDeliveryTime
      : config.deliveryConfig.baseDeliveryTime;

    // Add distance time if provided
    if (distanceKm) {
      const distanceTime = Math.round(distanceKm * 2);
      return baseTime + distanceTime;
    }

    return baseTime;
  }

  /**
   * Check if express delivery is available for a pharmacy
   */
  isExpressDeliveryAvailable(pharmacyId: PharmacyChain): boolean {
    const config = PHARMACY_CONFIGS[pharmacyId];
    return config?.features.expressDelivery ?? false;
  }

  /**
   * Get delivery coverage radius for a pharmacy
   */
  getCoverageRadius(pharmacyId: PharmacyChain): number {
    const config = PHARMACY_CONFIGS[pharmacyId];
    return config?.deliveryConfig.coverageRadiusKm ?? 0;
  }

  /**
   * Calculate distance from pharmacy to address
   */
  async calculateDistanceFromPharmacy(
    pharmacyId: PharmacyChain,
    address: Address
  ): Promise<number> {
    if (!address.coordinates) {
      throw new DeliveryNotAvailableError(pharmacyId, 'Dirección sin coordenadas');
    }

    const pharmacyLocation = MOCK_PHARMACY_LOCATIONS[pharmacyId];
    return calculateDistance(address.coordinates, pharmacyLocation);
  }

  /**
   * Get best delivery option for a location
   */
  async getBestDeliveryOption(
    address: Address,
    deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY
  ): Promise<DeliveryEstimate | null> {
    if (!address.coordinates) {
      return null;
    }

    const estimates = await this.getDeliveryEstimates(address.coordinates, deliveryType);
    const available = estimates.filter(e => e.available);

    if (available.length === 0) return null;

    // Find best option based on time and cost
    return available.reduce((best, current) => {
      const currentScore = (1 / current.estimatedMinutes) * 0.6 + (1 / current.cost) * 0.4;
      const bestScore = (1 / best.estimatedMinutes) * 0.6 + (1 / best.cost) * 0.4;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Get delivery tracking URL (mock implementation)
   */
  getTrackingUrl(trackingNumber: string, pharmacyId: PharmacyChain): string {
    const config = PHARMACY_CONFIGS[pharmacyId];

    if (!config) return '';

    // TODO: Replace with actual tracking URLs when available
    return `${config.website}/rastreo/${trackingNumber}`;
  }

  /**
   * Get operating hours for a pharmacy
   */
  getOperatingHours(pharmacyId: PharmacyChain): {
    open: string;
    close: string;
    open24Hours: boolean;
  } {
    const config = PHARMACY_CONFIGS[pharmacyId];

    if (!config) {
      return {
        open: '00:00',
        close: '23:59',
        open24Hours: false,
      };
    }

    return config.operatingHours;
  }

  /**
   * Check if pharmacy is currently open
   */
  isPharmacyOpen(pharmacyId: PharmacyChain): boolean {
    const hours = this.getOperatingHours(pharmacyId);

    if (hours.open24Hours) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = hours.open.split(':').map(Number);
    const [closeHour, closeMin] = hours.close.split(':').map(Number);

    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  }

  /**
   * Get delivery options available for an order
   */
  getDeliveryOptionsForOrder(pharmacyId: PharmacyChain, orderTotal: number): Array<{
    type: DeliveryType;
    available: boolean;
    estimatedTime: number;
    cost: number;
    description: string;
  }> {
    const config = PHARMACY_CONFIGS[pharmacyId];
    if (!config) return [];

    const options: Array<{
      type: DeliveryType;
      available: boolean;
      estimatedTime: number;
      cost: number;
      description: string;
    }> = [];

    // Standard home delivery
    if (config.features.homeDelivery) {
      const cost = this.getDeliveryCost(pharmacyId, orderTotal, DeliveryType.HOME_DELIVERY);
      const time = config.deliveryConfig.baseDeliveryTime;

      options.push({
        type: DeliveryType.HOME_DELIVERY,
        available: true,
        estimatedTime: time,
        cost,
        description: cost === 0
          ? `Entrega estándar en ${time} minutos (gratis)`
          : `Entrega estándar en ${time} minutos`,
      });
    }

    // Express delivery
    if (config.features.expressDelivery) {
      const cost = this.getDeliveryCost(pharmacyId, orderTotal, DeliveryType.EXPRESS);
      const time = config.deliveryConfig.expressDeliveryTime;

      options.push({
        type: DeliveryType.EXPRESS,
        available: true,
        estimatedTime: time,
        cost,
        description: `Entrega exprés en ${time} minutos`,
      });
    }

    // Pickup
    options.push({
      type: DeliveryType.PICKUP,
      available: true,
      estimatedTime: 30,
      cost: 0,
      description: 'Recoger en tienda',
    });

    return options;
  }
}
