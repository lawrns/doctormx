/**
 * @deprecated Use `services/pharmacy` (index.ts) instead
 * This file is kept for backward compatibility
 * 
 * All functionality has been refactored into focused modules:
 * - types.ts: Core type definitions and enums
 * - errors.ts: Error classes
 * - utils.ts: Utility functions
 * - config.ts: Pharmacy configurations
 * - search-service.ts: Product search and comparison
 * - order-service.ts: Order management
 * - delivery-service.ts: Delivery estimates
 * - affiliate-service.ts: Affiliate links and commissions
 * - inventory-service.ts: Stock availability
 */

// Re-export everything from the new modular structure
export * from './types';
export * from './errors';
export * from './config';
export * from './search-service';
export * from './order-service';
export * from './delivery-service';
export * from './affiliate-service';
export * from './inventory-service';
export * from './utils';

// For backward compatibility with the old class-based API
// Import and compose the services to mimic the old PharmacyAPIIntegration class
import { searchProducts, comparePrices, getPopularMedications, getMedicationsByCategory } from './search-service';
import { placeOrder, getOrderStatus, cancelOrder } from './order-service';
import { getDeliveryEstimates, verifyDeliveryAvailability } from './delivery-service';
import { checkStockAvailability } from './inventory-service';
import { generateAffiliateLink, getAffiliateInfo, setAffiliateCode } from './affiliate-service';
import { getPharmacyConfig, getAllPharmacies } from './config';
import { PharmacyChain } from './types';

/**
 * @deprecated Use individual service functions instead
 * Backward compatibility class that delegates to the new service modules
 */
export class PharmacyAPIIntegration {
  private apiKeys: Map<PharmacyChain, string>;
  private useMockData: boolean;

  constructor(options: {
    useMockData?: boolean;
    apiKeys?: Partial<Record<PharmacyChain, string>>;
    affiliateCodes?: Partial<Record<PharmacyChain, string>>;
  } = {}) {
    this.useMockData = options.useMockData ?? true;
    this.apiKeys = new Map(
      Object.entries(options.apiKeys || {}) as [PharmacyChain, string][]
    );
    
    // Set affiliate codes if provided
    if (options.affiliateCodes) {
      Object.entries(options.affiliateCodes).forEach(([pharmacyId, code]) => {
        setAffiliateCode(pharmacyId as PharmacyChain, code);
      });
    }
  }

  /**
   * @deprecated Use search-service.searchProducts() instead
   */
  async searchProducts(query: string, options?: Parameters<typeof searchProducts>[1]) {
    return searchProducts(query, options, this.useMockData);
  }

  /**
   * @deprecated Use search-service.comparePrices() instead
   */
  async comparePrices(medicationName: string) {
    return comparePrices(medicationName, this.useMockData);
  }

  /**
   * @deprecated Use order-service.placeOrder() instead
   */
  async placeOrder(orderRequest: Parameters<typeof placeOrder>[0]) {
    return placeOrder(orderRequest, this.useMockData);
  }

  /**
   * @deprecated Use order-service.getOrderStatus() instead
   */
  async getOrderStatus(orderId: string) {
    return getOrderStatus(orderId, this.useMockData);
  }

  /**
   * @deprecated Use order-service.cancelOrder() instead
   */
  async cancelOrder(orderId: string, reason?: string) {
    return cancelOrder(orderId, reason, this.useMockData);
  }

  /**
   * @deprecated Use delivery-service.getDeliveryEstimates() instead
   */
  async getDeliveryEstimates(
    coordinates: Parameters<typeof getDeliveryEstimates>[0],
    deliveryType?: Parameters<typeof getDeliveryEstimates>[1]
  ) {
    return getDeliveryEstimates(coordinates, deliveryType, this.useMockData);
  }

  /**
   * @deprecated Use inventory-service.checkStockAvailability() instead
   */
  async checkStockAvailability(items: Parameters<typeof checkStockAvailability>[0]) {
    return checkStockAvailability(items, this.useMockData);
  }

  /**
   * @deprecated Use affiliate-service.generateAffiliateLink() instead
   */
  generateAffiliateLink(pharmacyId: PharmacyChain, productId: string) {
    return generateAffiliateLink(pharmacyId, productId);
  }

  /**
   * @deprecated Use affiliate-service.getAffiliateInfo() instead
   */
  getAffiliateInfo(pharmacyId: PharmacyChain) {
    return getAffiliateInfo(pharmacyId);
  }

  /**
   * @deprecated Use config.getPharmacyConfig() instead
   */
  getPharmacyConfig(pharmacyId: PharmacyChain) {
    return getPharmacyConfig(pharmacyId);
  }

  /**
   * @deprecated Use config.getAllPharmacies() instead
   */
  getAllPharmacies() {
    return getAllPharmacies();
  }

  /**
   * @deprecated Use affiliate-service.setAffiliateCode() instead
   */
  setAffiliateCode(pharmacyId: PharmacyChain, code: string) {
    setAffiliateCode(pharmacyId, code);
  }

  /**
   * @deprecated Use config.setApiKey() - Note: API keys are not used in mock mode
   */
  setApiKey(pharmacyId: PharmacyChain, apiKey: string) {
    this.apiKeys.set(pharmacyId, apiKey);
  }

  /**
   * @deprecated Use search-service.getPopularMedications() instead
   */
  async getPopularMedications(limit?: number) {
    return getPopularMedications(limit, this.useMockData);
  }

  /**
   * @deprecated Use search-service.getMedicationsByCategory() instead
   */
  async getMedicationsByCategory(category: Parameters<typeof getMedicationsByCategory>[0], limit?: number) {
    return getMedicationsByCategory(category, limit);
  }

  /**
   * @deprecated Use delivery-service.verifyDeliveryAvailability() instead
   */
  async verifyDeliveryAvailability(
    address: Parameters<typeof verifyDeliveryAvailability>[0],
    pharmacyId?: PharmacyChain
  ) {
    return verifyDeliveryAvailability(address, pharmacyId, this.useMockData);
  }

  /**
   * No-op for backward compatibility
   * @deprecated Resources are now managed automatically
   */
  destroy(): void {
    // Cleanup is now handled automatically
  }
}

// Default export for backward compatibility
export default PharmacyAPIIntegration;

// Singleton instance for backward compatibility
export const pharmacyIntegration = new PharmacyAPIIntegration({
  useMockData: true,
});
