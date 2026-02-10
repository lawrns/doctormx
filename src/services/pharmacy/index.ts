/**
 * Pharmacy Integration Service
 * Main export file for pharmacy services
 *
 * @module services/pharmacy
 * @description Integrates with major Mexican pharmacy chains for telemedicine platform
 * @deprecated Import from individual service modules instead:
 *   - @/services/pharmacy/catalog - Product catalog and search
 *   - @/services/pharmacy/search - Price comparison and multi-pharmacy search
 *   - @/services/pharmacy/prescription - Order processing and management
 *   - @/services/pharmacy/inventory - Stock availability checks
 *   - @/services/pharmacy/delivery - Delivery estimation and logistics
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types';

// ============================================================================
// ERROR CLASSES
// ============================================================================

export * from './errors';

// ============================================================================
// SERVICE CLASSES
// ============================================================================

export { CatalogService } from './catalog';
export { SearchService } from './search';
export { PrescriptionService } from './prescription';
export { InventoryService } from './inventory';
export { DeliveryService } from './delivery';

// ============================================================================
// CONFIGURATION
// ============================================================================

export { PHARMACY_CONFIGS, MOCK_PHARMACY_LOCATIONS } from './config';

// ============================================================================
// MAIN API INTEGRATION CLASS (LEGACY COMPATIBILITY)
// ============================================================================

import type {
  Product,
  ProductSearchOptions,
  ProductSearchResult,
  PriceComparisonResult,
  ProductCategory,
  Order,
  OrderRequest,
  OrderStatus,
  DeliveryEstimate,
  Coordinates,
  Address,
  DeliveryType,
  PharmacyChain,
  StockCheckResult,
} from './types';

import {
  PharmacyIntegrationError,
  ProductNotFoundError,
  OutOfStockError,
  PrescriptionRequiredError,
  DeliveryNotAvailableError,
} from './errors';

import { PHARMACY_CONFIGS } from './config';
import { CatalogService } from './catalog';
import { SearchService } from './search';
import { PrescriptionService } from './prescription';
import { InventoryService } from './inventory';
import { DeliveryService } from './delivery';

/**
 * Main Pharmacy API Integration Class
 * Provides a unified interface for all pharmacy services
 *
 * @deprecated Use individual service classes instead for better separation of concerns
 */
export class PharmacyAPIIntegration {
  private catalog: CatalogService;
  private search: SearchService;
  private prescription: PrescriptionService;
  private inventory: InventoryService;
  private delivery: DeliveryService;
  private apiKeys: Map<PharmacyChain, string>;
  private affiliateCodes: Map<PharmacyChain, string>;

  constructor(options: {
    useMockData?: boolean;
    apiKeys?: Partial<Record<PharmacyChain, string>>;
    affiliateCodes?: Partial<Record<PharmacyChain, string>>;
  } = {}) {
    // Initialize services
    this.catalog = new CatalogService(options.affiliateCodes);
    this.search = new SearchService(this.catalog);
    this.prescription = new PrescriptionService(this.catalog);
    this.inventory = new InventoryService(this.catalog);
    this.delivery = new DeliveryService();

    // Store API keys and affiliate codes
    this.apiKeys = new Map(
      Object.entries(options.apiKeys || {}) as [PharmacyChain, string][]
    );
    this.affiliateCodes = new Map(
      Object.entries(options.affiliateCodes || {}) as [PharmacyChain, string][]
    );
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  /**
   * Get configuration for a specific pharmacy
   */
  getPharmacyConfig(pharmacyId: PharmacyChain) {
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
  getAllPharmacies() {
    return Object.values(PHARMACY_CONFIGS);
  }

  /**
   * Set API key for a pharmacy
   */
  setApiKey(pharmacyId: PharmacyChain, apiKey: string): void {
    this.apiKeys.set(pharmacyId, apiKey);
  }

  /**
   * Set affiliate code for a pharmacy
   */
  setAffiliateCode(pharmacyId: PharmacyChain, code: string): void {
    this.affiliateCodes.set(pharmacyId, code);
    this.catalog.setAffiliateCode(pharmacyId, code);
  }

  // ============================================================================
  // CATALOG METHODS (Delegated to CatalogService)
  // ============================================================================

  /**
   * Search for products across pharmacies
   */
  async searchProducts(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<ProductSearchResult> {
    return this.catalog.searchProducts(query, options);
  }

  /**
   * Get popular medications
   */
  async getPopularMedications(limit: number = 10): Promise<Product[]> {
    return this.catalog.getPopularMedications(limit);
  }

  /**
   * Get medications by category
   */
  async getMedicationsByCategory(
    category: ProductCategory,
    limit: number = 20
  ): Promise<Product[]> {
    return this.catalog.getMedicationsByCategory(category, limit);
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string, pharmacyId: PharmacyChain): Promise<Product | null> {
    return this.catalog.getProductById(productId, pharmacyId);
  }

  // ============================================================================
  // SEARCH & PRICE COMPARISON METHODS (Delegated to SearchService)
  // ============================================================================

  /**
   * Compare prices for a medication across all pharmacies
   */
  async comparePrices(medicationName: string): Promise<PriceComparisonResult> {
    return this.search.comparePrices(medicationName);
  }

  /**
   * Search for products with automatic price comparison
   */
  async searchAndCompare(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<ProductSearchResult> {
    return this.search.searchAndCompare(query, options);
  }

  /**
   * Find cheapest option for a medication
   */
  async findCheapest(medicationName: string): Promise<Product | null> {
    return this.search.findCheapest(medicationName);
  }

  /**
   * Find fastest delivery option for a medication
   */
  async findFastestDelivery(medicationName: string): Promise<Product | null> {
    return this.search.findFastestDelivery(medicationName);
  }

  // ============================================================================
  // ORDER MANAGEMENT METHODS (Delegated to PrescriptionService)
  // ============================================================================

  /**
   * Place an order with a pharmacy
   */
  async placeOrder(orderRequest: OrderRequest): Promise<Order> {
    return this.prescription.placeOrder(orderRequest);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<Order> {
    return this.prescription.getOrderStatus(orderId);
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.prescription.getUserOrders(userId);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return this.prescription.cancelOrder(orderId, reason);
  }

  /**
   * Get order statistics for a user
   */
  async getUserOrderStats(userId: string) {
    return this.prescription.getUserOrderStats(userId);
  }

  // ============================================================================
  // INVENTORY METHODS (Delegated to InventoryService)
  // ============================================================================

  /**
   * Check stock availability for products
   */
  async checkStockAvailability(
    items: Array<{ productId: string; pharmacyId: PharmacyChain; quantity: number }>
  ): Promise<StockCheckResult[]> {
    return this.inventory.checkStockAvailability(items);
  }

  /**
   * Check if a single product is in stock
   */
  async isProductAvailable(productId: string, pharmacyId: PharmacyChain, quantity: number = 1): Promise<boolean> {
    return this.inventory.isProductAvailable(productId, pharmacyId, quantity);
  }

  /**
   * Find products with low stock
   */
  async findLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.inventory.findLowStockProducts(threshold);
  }

  // ============================================================================
  // DELIVERY METHODS (Delegated to DeliveryService)
  // ============================================================================

  /**
   * Get delivery estimates for a location
   */
  async getDeliveryEstimates(
    coordinates: Coordinates,
    deliveryType: DeliveryType = 'home_delivery'
  ): Promise<DeliveryEstimate[]> {
    return this.delivery.getDeliveryEstimates(coordinates, deliveryType);
  }

  /**
   * Verify if delivery is available to an address
   */
  async verifyDeliveryAvailability(
    address: Address,
    pharmacyId?: PharmacyChain
  ) {
    return this.delivery.verifyDeliveryAvailability(address, pharmacyId);
  }

  /**
   * Get delivery cost for a pharmacy and order total
   */
  getDeliveryCost(pharmacyId: PharmacyChain, orderTotal: number, deliveryType: DeliveryType = 'home_delivery'): number {
    return this.delivery.getDeliveryCost(pharmacyId, orderTotal, deliveryType);
  }

  /**
   * Get estimated delivery time for a pharmacy
   */
  getEstimatedDeliveryTime(
    pharmacyId: PharmacyChain,
    deliveryType: DeliveryType = 'home_delivery',
    distanceKm?: number
  ): number {
    return this.delivery.getEstimatedDeliveryTime(pharmacyId, deliveryType, distanceKm);
  }

  /**
   * Check if express delivery is available for a pharmacy
   */
  isExpressDeliveryAvailable(pharmacyId: PharmacyChain): boolean {
    return this.delivery.isExpressDeliveryAvailable(pharmacyId);
  }

  /**
   * Get best delivery option for a location
   */
  async getBestDeliveryOption(
    address: Address,
    deliveryType: DeliveryType = 'home_delivery'
  ): Promise<DeliveryEstimate | null> {
    return this.delivery.getBestDeliveryOption(address, deliveryType);
  }

  /**
   * Get delivery options available for an order
   */
  getDeliveryOptionsForOrder(pharmacyId: PharmacyChain, orderTotal: number) {
    return this.delivery.getDeliveryOptionsForOrder(pharmacyId, orderTotal);
  }

  // ============================================================================
  // AFFILIATE METHODS (Delegated to CatalogService)
  // ============================================================================

  /**
   * Generate affiliate link for a product
   */
  generateAffiliateLink(pharmacyId: PharmacyChain, productId: string): string {
    return this.catalog.generateAffiliateLink(pharmacyId, productId);
  }

  /**
   * Get affiliate commission information
   */
  getAffiliateInfo(pharmacyId: PharmacyChain) {
    return this.catalog.getAffiliateInfo(pharmacyId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default pharmacy integration instance
 * @deprecated Use individual service classes instead
 */
export const pharmacyIntegration = new PharmacyAPIIntegration({
  useMockData: true,
});

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default PharmacyAPIIntegration;
