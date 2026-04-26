import { PharmacyAPIClient } from './pharmacy-client'
import { PharmacyCache } from './pharmacy-cache'

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

export class PharmacyIntegrationError extends Error implements PharmacyError {
  code: string;
  pharmacyId?: PharmacyChain;
  retryable: boolean;
  statusCode?: number;

  constructor(
    message: string,
    code: string,
    options?: { pharmacyId?: PharmacyChain; retryable?: boolean; statusCode?: number }
  ) {
    super(message);
    this.name = 'PharmacyIntegrationError';
    this.code = code;
    this.pharmacyId = options?.pharmacyId;
    this.retryable = options?.retryable ?? false;
    this.statusCode = options?.statusCode;
  }
}

export class ProductNotFoundError extends PharmacyIntegrationError {
  constructor(productId: string, pharmacyId?: PharmacyChain) {
    super(
      `Product ${productId} not found`,
      'PRODUCT_NOT_FOUND',
      { pharmacyId, retryable: false }
    );
    this.name = 'ProductNotFoundError';
  }
}

export class OutOfStockError extends PharmacyIntegrationError {
  constructor(productId: string, pharmacyId: PharmacyChain) {
    super(
      `Product ${productId} is out of stock at ${pharmacyId}`,
      'OUT_OF_STOCK',
      { pharmacyId, retryable: true }
    );
    this.name = 'OutOfStockError';
  }
}

export class PrescriptionRequiredError extends PharmacyIntegrationError {
  constructor(productName: string) {
    super(
      `Prescription required for ${productName}`,
      'PRESCRIPTION_REQUIRED',
      { retryable: false }
    );
    this.name = 'PrescriptionRequiredError';
  }
}

export class DeliveryNotAvailableError extends PharmacyIntegrationError {
  constructor(pharmacyId: PharmacyChain, address: string) {
    super(
      `Delivery not available from ${pharmacyId} to ${address}`,
      'DELIVERY_NOT_AVAILABLE',
      { pharmacyId, retryable: false }
    );
    this.name = 'DeliveryNotAvailableError';
  }
}

const PHARMACY_CONFIGS: Record<PharmacyChain, PharmacyConfig> = {
  [PharmacyChain.GUADALAJARA]: {
    id: PharmacyChain.GUADALAJARA,
    name: 'farmacias-guadalajara',
    displayName: 'Farmacias Guadalajara',
    logoUrl: 'https://www.farmaciasguadalajara.com/logo.png',
    website: 'https://www.farmaciasguadalajara.com',
    apiBaseUrl: 'https://api.farmaciasguadalajara.com/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.05,
      trackingParam: 'affiliate_id',
      baseUrl: 'https://www.farmaciasguadalajara.com/producto',
    },
    features: {
      homeDelivery: true,
      expressDelivery: true,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 45,
      expressDeliveryTime: 25,
      baseCost: 49,
      expressCost: 79,
      freeDeliveryThreshold: 499,
      coverageRadiusKm: 15,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.AHORRO]: {
    id: PharmacyChain.AHORRO,
    name: 'farmacias-del-ahorro',
    displayName: 'Farmacias del Ahorro',
    logoUrl: 'https://www.farmaciasdelahorro.com/logo.png',
    website: 'https://www.farmaciasdelahorro.com',
    apiBaseUrl: 'https://api.farmaciasdelahorro.com/api',
    apiVersion: 'v2',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.045,
      trackingParam: 'ref',
      baseUrl: 'https://www.farmaciasdelahorro.com/productos',
    },
    features: {
      homeDelivery: true,
      expressDelivery: false,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 60,
      expressDeliveryTime: 0,
      baseCost: 39,
      expressCost: 0,
      freeDeliveryThreshold: 399,
      coverageRadiusKm: 20,
    },
    operatingHours: {
      open: '07:00',
      close: '23:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.SIMILARES]: {
    id: PharmacyChain.SIMILARES,
    name: 'farmacias-similares',
    displayName: 'Farmacias Similares',
    logoUrl: 'https://www.farmaciasdesimilares.com/logo.png',
    website: 'https://www.farmaciasdesimilares.com',
    apiBaseUrl: 'https://api.farmaciasdesimilares.com/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.03,
      trackingParam: 'afiliado',
      baseUrl: 'https://www.farmaciasdesimilares.com/producto',
    },
    features: {
      homeDelivery: true,
      expressDelivery: false,
      prescriptionUpload: false,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: false,
    },
    deliveryConfig: {
      baseDeliveryTime: 90,
      expressDeliveryTime: 0,
      baseCost: 29,
      expressCost: 0,
      freeDeliveryThreshold: 299,
      coverageRadiusKm: 25,
    },
    operatingHours: {
      open: '00:00',
      close: '23:59',
      open24Hours: true,
    },
  },
  [PharmacyChain.BENAVIDES]: {
    id: PharmacyChain.BENAVIDES,
    name: 'farmacias-benavides',
    displayName: 'Farmacias Benavides',
    logoUrl: 'https://www.benavides.com.mx/logo.png',
    website: 'https://www.benavides.com.mx',
    apiBaseUrl: 'https://api.benavides.com.mx/api/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.05,
      trackingParam: 'partner',
      baseUrl: 'https://www.benavides.com.mx/producto',
    },
    features: {
      homeDelivery: true,
      expressDelivery: true,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 50,
      expressDeliveryTime: 30,
      baseCost: 45,
      expressCost: 85,
      freeDeliveryThreshold: 449,
      coverageRadiusKm: 18,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.SAN_PABLO]: {
    id: PharmacyChain.SAN_PABLO,
    name: 'farmacias-san-pablo',
    displayName: 'Farmacias San Pablo',
    logoUrl: 'https://www.farmaciasanpablo.com.mx/logo.png',
    website: 'https://www.farmaciasanpablo.com.mx',
    apiBaseUrl: 'https://api.farmaciasanpablo.com.mx/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.04,
      trackingParam: 'aff',
      baseUrl: 'https://www.farmaciasanpablo.com.mx/productos',
    },
    features: {
      homeDelivery: true,
      expressDelivery: true,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 40,
      expressDeliveryTime: 20,
      baseCost: 55,
      expressCost: 95,
      freeDeliveryThreshold: 599,
      coverageRadiusKm: 12,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.YZA]: {
    id: PharmacyChain.YZA,
    name: 'farmacias-yza',
    displayName: 'Farmacias Yza',
    logoUrl: 'https://www.yza.mx/logo.png',
    website: 'https://www.yza.mx',
    apiBaseUrl: 'https://api.yza.mx/v2',
    apiVersion: 'v2',
    affiliateProgram: {
      enabled: false,
      commissionRate: 0,
      trackingParam: '',
      baseUrl: '',
    },
    features: {
      homeDelivery: true,
      expressDelivery: false,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: false,
    },
    deliveryConfig: {
      baseDeliveryTime: 55,
      expressDeliveryTime: 0,
      baseCost: 42,
      expressCost: 0,
      freeDeliveryThreshold: 499,
      coverageRadiusKm: 16,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
};

function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371;
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
      if (attempt === maxRetries) break;
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

const useMockData = !process.env.PHARMACY_API_KEY

const apiClient = new PharmacyAPIClient({
  apiKey: process.env.PHARMACY_API_KEY || '',
  baseUrl: process.env.PHARMACY_API_URL || 'https://api.pharmacy-directory.mx/v1',
  useMock: useMockData,
})

const cache = new PharmacyCache(5 * 60 * 1000)

export function setAffiliateCode(pharmacyId: PharmacyChain, code: string): void {
  apiClient.setAffiliateCode(pharmacyId, code)
}

export function getPharmacyConfig(pharmacyId: PharmacyChain): PharmacyConfig {
  const config = PHARMACY_CONFIGS[pharmacyId]
  if (!config) {
    throw new PharmacyIntegrationError(
      `Configuration not found for pharmacy: ${pharmacyId}`,
      'CONFIG_NOT_FOUND',
      { pharmacyId, retryable: false }
    )
  }
  return config
}

export function getAllPharmacies(): PharmacyConfig[] {
  return Object.values(PHARMACY_CONFIGS)
}

export function getAffiliateInfo(pharmacyId: PharmacyChain): {
  enabled: boolean;
  commissionRate: number;
  estimatedCommission: number;
} {
  const config = PHARMACY_CONFIGS[pharmacyId]
  return {
    enabled: config.affiliateProgram.enabled,
    commissionRate: config.affiliateProgram.commissionRate,
    estimatedCommission: 1000 * config.affiliateProgram.commissionRate,
  }
}

export function generateAffiliateLink(pharmacyId: PharmacyChain, productId: string): string {
  const config = PHARMACY_CONFIGS[pharmacyId]
  if (!config || !config.affiliateProgram.enabled) {
    return config ? `${config.website}/product/${productId}` : ''
  }
  return `${config.affiliateProgram.baseUrl}/${productId}`
}

export async function searchProducts(query: string, options?: ProductSearchOptions): Promise<ProductSearchResult> {
  const cacheKey = `search:${query}:${JSON.stringify(options || {})}`
  const cached = cache.get<ProductSearchResult>(cacheKey)
  if (cached) return cached

  const result = await withRetry(() => apiClient.searchProducts(query, options))
  cache.set(cacheKey, result)
  return result as ProductSearchResult
}

export async function comparePrices(medicationName: string): Promise<PriceComparisonResult> {
  const cacheKey = `compare:${medicationName}`
  const cached = cache.get<PriceComparisonResult>(cacheKey)
  if (cached) return cached

  const result = await withRetry(() => apiClient.comparePrices(medicationName))
  cache.set(cacheKey, result)
  return result as PriceComparisonResult
}

export async function placeOrder(orderRequest: OrderRequest): Promise<Order> {
  return apiClient.placeOrder(orderRequest) as Promise<Order>
}

export async function getOrderStatus(orderId: string): Promise<Order> {
  return apiClient.getOrderStatus(orderId) as Promise<Order>
}

export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  return apiClient.cancelOrder(orderId, reason) as Promise<Order>
}

export async function getDeliveryEstimates(
  coordinates: Coordinates,
  deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY
): Promise<DeliveryEstimate[]> {
  const cacheKey = `delivery:${coordinates.latitude}:${coordinates.longitude}:${deliveryType}`
  const cached = cache.get<DeliveryEstimate[]>(cacheKey)
  if (cached) return cached

  const result = await withRetry(() => apiClient.getDeliveryEstimates(coordinates, deliveryType))
  cache.set(cacheKey, result)
  return result as DeliveryEstimate[]
}

export async function checkStockAvailability(
  items: Array<{ productId: string; pharmacyId: PharmacyChain; quantity: number }>
): Promise<Array<{
  productId: string;
  pharmacyId: PharmacyChain;
  available: boolean;
  availableQuantity: number;
  estimatedRestock?: Date;
}>> {
  return apiClient.checkStockAvailability(items) as Promise<any>
}

export async function getPopularMedications(limit: number = 10): Promise<Product[]> {
  const cacheKey = `popular:${limit}`
  const cached = cache.get<Product[]>(cacheKey)
  if (cached) return cached

  const result = await apiClient.getPopularMedications(limit)
  cache.set(cacheKey, result)
  return result as Product[]
}

export async function getMedicationsByCategory(
  category: ProductCategory,
  limit: number = 20
): Promise<Product[]> {
  const cacheKey = `category:${category}:${limit}`
  const cached = cache.get<Product[]>(cacheKey)
  if (cached) return cached

  const result = await apiClient.getMedicationsByCategory(category, limit)
  cache.set(cacheKey, result)
  return result as Product[]
}

export async function verifyDeliveryAvailability(
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
    return {
      available: false,
      message: 'Coordenadas no disponibles para la dirección proporcionada',
    }
  }

  const estimates = await getDeliveryEstimates(
    address.coordinates,
    DeliveryType.HOME_DELIVERY
  )

  const availablePharmacies = estimates
    .filter(e => e.available)
    .map(e => ({
      pharmacyId: e.pharmacyId,
      available: true,
      estimatedMinutes: e.estimatedMinutes,
      cost: e.cost,
    }))

  if (pharmacyId) {
    const specific = estimates.find(e => e.pharmacyId === pharmacyId)
    return {
      available: specific?.available ?? false,
      message: specific?.message || 'Farmacia no disponible',
    }
  }

  return {
    available: availablePharmacies.length > 0,
    pharmacies: availablePharmacies,
    message: availablePharmacies.length > 0
      ? `${availablePharmacies.length} farmacias disponibles`
      : 'No hay farmacias disponibles para esta ubicación',
  }
}
