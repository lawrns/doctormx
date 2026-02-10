/**
 * Pharmacy Integration Types
 * Shared type definitions for pharmacy services
 *
 * @module services/pharmacy/types
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum PharmacyChain {
  GUADALAJARA = 'guadalajara',
  AHORRO = 'ahorro',
  SIMILARES = 'similares',
  BENAVIDES = 'benavides',
  SAN_PABLO = 'san_pablo',
  YZA = 'yza',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum DeliveryType {
  HOME_DELIVERY = 'home_delivery',
  PICKUP = 'pickup',
  EXPRESS = 'express',
}

export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  TRANSFER = 'transfer',
  INSURANCE = 'insurance',
}

export enum ProductCategory {
  PRESCRIPTION = 'prescription',
  OTC = 'otc',
  SUPPLEMENT = 'supplement',
  PERSONAL_CARE = 'personal_care',
  MEDICAL_DEVICE = 'medical_device',
}

// ============================================================================
// TYPE INTERFACES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  number: string;
  apartment?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: Coordinates;
}

export interface PharmacyConfig {
  id: PharmacyChain;
  name: string;
  displayName: string;
  logoUrl: string;
  website: string;
  apiBaseUrl: string;
  apiVersion: string;
  affiliateProgram: {
    enabled: boolean;
    commissionRate: number;
    trackingParam: string;
    baseUrl: string;
  };
  features: {
    homeDelivery: boolean;
    expressDelivery: boolean;
    prescriptionUpload: boolean;
    onlinePayment: boolean;
    cashOnDelivery: boolean;
    insuranceSupport: boolean;
  };
  deliveryConfig: {
    baseDeliveryTime: number;
    expressDeliveryTime: number;
    baseCost: number;
    expressCost: number;
    freeDeliveryThreshold: number;
    coverageRadiusKm: number;
  };
  operatingHours: {
    open: string;
    close: string;
    open24Hours: boolean;
  };
}

export interface Product {
  id: string;
  pharmacyId: PharmacyChain;
  name: string;
  genericName?: string;
  brand: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  presentation: string;
  dosage?: string;
  quantity: string;
  laboratory?: string;
  images: string[];
  requiresPrescription: boolean;
  price: {
    current: number;
    original?: number;
    discount?: number;
    currency: string;
  };
  stock: {
    available: boolean;
    quantity: number;
    lastUpdated: Date;
  };
  rating?: {
    average: number;
    count: number;
  };
  delivery: {
    available: boolean;
    estimatedTime: number;
    cost: number;
  };
  affiliateLink?: string;
}

export interface ProductSearchOptions {
  pharmacies?: PharmacyChain[];
  category?: ProductCategory;
  requiresPrescription?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  deliveryType?: DeliveryType;
  sortBy?: 'price' | 'relevance' | 'delivery_time' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  location?: Coordinates;
  maxDeliveryTime?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: ProductSearchOptions;
  comparison?: PriceComparisonResult;
}

export interface PriceComparisonResult {
  medicationName: string;
  results: Array<{
    pharmacyId: PharmacyChain;
    pharmacyName: string;
    product: Product;
    totalPrice: number;
    savings?: number;
    savingsPercent?: number;
    deliveryTime: number;
    availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  }>;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  bestDeal?: {
    pharmacyId: PharmacyChain;
    productId: string;
    reason: string;
  };
}

export interface OrderItem {
  productId: string;
  pharmacyId: PharmacyChain;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  prescriptionUrl?: string;
  prescriptionId?: string;
}

export interface OrderRequest {
  userId: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: Address;
  pickupLocationId?: string;
  paymentMethod: PaymentMethod;
  patientInfo: {
    name: string;
    phone: string;
    email: string;
    rfc?: string;
  };
  prescriptionUrls?: string[];
  notes?: string;
  couponCode?: string;
  affiliateCode?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  pharmacyId: PharmacyChain;
  delivery: {
    type: DeliveryType;
    address?: Address;
    estimatedTime: number;
    actualTime?: number;
    trackingNumber?: string;
    courierName?: string;
    trackingUrl?: string;
  };
  payment: {
    method: PaymentMethod;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    subtotal: number;
    deliveryCost: number;
    discount: number;
    tax: number;
    total: number;
    transactionId?: string;
  };
  timeline: Array<{
    status: OrderStatus;
    timestamp: Date;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  affiliateCommission?: number;
}

export interface DeliveryEstimate {
  pharmacyId: PharmacyChain;
  deliveryType: DeliveryType;
  estimatedMinutes: number;
  cost: number;
  available: boolean;
  message?: string;
}

export interface PharmacyError extends Error {
  code: string;
  pharmacyId?: PharmacyChain;
  retryable: boolean;
  statusCode?: number;
}

export interface StockCheckResult {
  productId: string;
  pharmacyId: PharmacyChain;
  available: boolean;
  availableQuantity: number;
  estimatedRestock?: Date;
}
