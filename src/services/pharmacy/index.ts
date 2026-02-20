/**
 * Pharmacy Services Module
 * 
 * Provides comprehensive pharmacy integration functionality including:
 * - Product search and comparison
 * - Order management
 * - Delivery estimation
 * - Affiliate tracking
 * - Inventory management
 * 
 * @module services/pharmacy
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  Coordinates,
  Address,
  PharmacyConfig,
  Product,
  ProductSearchOptions,
  ProductSearchResult,
  PriceComparisonResult,
  OrderItem,
  OrderRequest,
  Order,
  DeliveryEstimate,
  PharmacyError,
  StockCheckItem,
  StockCheckResult,
} from './types';

export {
  PharmacyChain,
  OrderStatus,
  DeliveryType,
  PaymentMethod,
  ProductCategory,
} from './types';

// ============================================================================
// ERROR EXPORTS
// ============================================================================

export {
  PharmacyIntegrationError,
  ProductNotFoundError,
  OutOfStockError,
  PrescriptionRequiredError,
  DeliveryNotAvailableError,
  OrderNotFoundError,
  OrderCancellationError,
} from './errors';

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

export {
  getPharmacyConfig,
  getAllPharmacies,
  getPharmaciesByFeature,
  getPharmaciesWithHomeDelivery,
  getPharmaciesWithExpressDelivery,
  getPharmaciesWithPrescriptionSupport,
  hasAffiliateProgram,
  getAffiliateCommissionRate,
  getDeliveryConfig,
} from './config';

// ============================================================================
// SEARCH SERVICE EXPORTS
// ============================================================================

export {
  searchProducts,
  comparePrices,
  getPopularMedications,
  getMedicationsByCategory,
  findProductById,
} from './search-service';

// ============================================================================
// ORDER SERVICE EXPORTS
// ============================================================================

export {
  placeOrder,
  getOrderStatus,
  cancelOrder,
  getUserOrders,
  getPharmacyOrders,
  canCancelOrder,
  cleanup as cleanupOrders,
} from './order-service';

// ============================================================================
// DELIVERY SERVICE EXPORTS
// ============================================================================

export {
  getDeliveryEstimates,
  verifyDeliveryAvailability,
  getNearestPharmacy,
  isWithinDeliveryRange,
  calculateDeliveryCost,
  estimateDeliveryTime,
} from './delivery-service';

// ============================================================================
// AFFILIATE SERVICE EXPORTS
// ============================================================================

export {
  setAffiliateCode,
  getAffiliateCode,
  generateAffiliateLink,
  getAffiliateInfo,
  calculateAffiliateCommission,
  getAllAffiliatePrograms,
} from './affiliate-service';

// ============================================================================
// INVENTORY SERVICE EXPORTS
// ============================================================================

export {
  checkStockAvailability,
  isInStock,
  getAvailableQuantity,
  getAvailableProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  getStockSummary,
} from './inventory-service';

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  calculateDistance,
  withRetry,
  normalizeText,
  calculateTax,
} from './utils';
