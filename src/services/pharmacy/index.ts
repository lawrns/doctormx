/**
 * Pharmacy Service Module
 * 
 * @module services/pharmacy
 * @description Pharmacy integration service for Mexican pharmacy chains
 */

// Re-export everything from pharmacy-integration
export {
  // Enums
  PharmacyChain,
  OrderStatus,
  DeliveryType,
  PaymentMethod,
  ProductCategory,
  
  // Types
  type Coordinates,
  type Address,
  type PharmacyConfig,
  type Product,
  type ProductSearchOptions,
  type ProductSearchResult,
  type PriceComparisonResult,
  type OrderItem,
  type OrderRequest,
  type Order,
  type DeliveryEstimate,
  type PharmacyError,
  
  // Error classes
  PharmacyIntegrationError,
  ProductNotFoundError,
  OutOfStockError,
  PrescriptionRequiredError,
  DeliveryNotAvailableError,
  
  // Main class and singleton
  PharmacyAPIIntegration,
  pharmacyIntegration,
} from './pharmacy-integration';

// Default export
export { default } from './pharmacy-integration';
