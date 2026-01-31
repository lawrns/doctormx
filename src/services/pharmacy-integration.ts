/**
 * Pharmacy API Integration Service
 * Supports major Mexican pharmacy chains for telemedicine platform
 * 
 * @module services/pharmacy-integration
 * @description Integrates with Farmacias Guadalajara, Farmacias del Ahorro,
 * Farmacias Similares, Farmacias Benavides, Farmacias San Pablo, and Farmacias Yza
 */

// ============================================================================
// ENUMS AND CONSTANTS
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

// ============================================================================
// ERROR CLASSES
// ============================================================================

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

// ============================================================================
// PHARMACY CONFIGURATIONS
// ============================================================================

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

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const MOCK_PRODUCTS: Product[] = [
  // Paracetamol variants
  {
    id: 'GUA-PAR-001',
    pharmacyId: PharmacyChain.GUADALAJARA,
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    brand: 'Tylenol',
    description: 'Analgésico y antipirético para el alivio del dolor y fiebre',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '500mg',
    quantity: '20 tabletas',
    laboratory: 'Johnson & Johnson',
    images: ['https://example.com/paracetamol-500.jpg'],
    requiresPrescription: false,
    price: {
      current: 45.50,
      original: 52.00,
      discount: 12.5,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 150,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.7,
      count: 234,
    },
    delivery: {
      available: true,
      estimatedTime: 45,
      cost: 49,
    },
  },
  {
    id: 'AHO-PAR-001',
    pharmacyId: PharmacyChain.AHORRO,
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    brand: 'Tylenol',
    description: 'Analgésico y antipirético',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '500mg',
    quantity: '20 tabletas',
    laboratory: 'Johnson & Johnson',
    images: ['https://example.com/paracetamol-500.jpg'],
    requiresPrescription: false,
    price: {
      current: 43.90,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 89,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.6,
      count: 189,
    },
    delivery: {
      available: true,
      estimatedTime: 60,
      cost: 39,
    },
  },
  {
    id: 'SIM-PAR-001',
    pharmacyId: PharmacyChain.SIMILARES,
    name: 'Paracetamol 500mg Genérico',
    genericName: 'Paracetamol',
    brand: 'Similares',
    description: 'Analgésico y antipirético genérico',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '500mg',
    quantity: '20 tabletas',
    laboratory: 'Genéricos Similares',
    images: ['https://example.com/paracetamol-gen.jpg'],
    requiresPrescription: false,
    price: {
      current: 28.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 200,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.3,
      count: 456,
    },
    delivery: {
      available: true,
      estimatedTime: 90,
      cost: 29,
    },
  },
  // Amoxicilina (prescription)
  {
    id: 'GUA-AMX-001',
    pharmacyId: PharmacyChain.GUADALAJARA,
    name: 'Amoxicilina 500mg',
    genericName: 'Amoxicilina',
    brand: 'Amoxil',
    description: 'Antibiótico de amplio espectro',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Cápsulas',
    dosage: '500mg',
    quantity: '12 cápsulas',
    laboratory: 'GlaxoSmithKline',
    images: ['https://example.com/amoxicilina.jpg'],
    requiresPrescription: true,
    price: {
      current: 125.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 45,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.8,
      count: 123,
    },
    delivery: {
      available: true,
      estimatedTime: 45,
      cost: 49,
    },
  },
  {
    id: 'AHO-AMX-001',
    pharmacyId: PharmacyChain.AHORRO,
    name: 'Amoxicilina 500mg',
    genericName: 'Amoxicilina',
    brand: 'Genérico',
    description: 'Antibiótico',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Cápsulas',
    dosage: '500mg',
    quantity: '12 cápsulas',
    laboratory: 'Genéricos',
    images: ['https://example.com/amoxicilina-gen.jpg'],
    requiresPrescription: true,
    price: {
      current: 89.50,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 67,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.5,
      count: 98,
    },
    delivery: {
      available: true,
      estimatedTime: 60,
      cost: 39,
    },
  },
  // Ibuprofeno
  {
    id: 'GUA-IBU-001',
    pharmacyId: PharmacyChain.GUADALAJARA,
    name: 'Ibuprofeno 400mg',
    genericName: 'Ibuprofeno',
    brand: 'Advil',
    description: 'Antiinflamatorio no esteroideo',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '400mg',
    quantity: '24 tabletas',
    laboratory: 'Pfizer',
    images: ['https://example.com/ibuprofeno.jpg'],
    requiresPrescription: false,
    price: {
      current: 65.00,
      original: 78.00,
      discount: 16.7,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 120,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.6,
      count: 312,
    },
    delivery: {
      available: true,
      estimatedTime: 45,
      cost: 49,
    },
  },
  {
    id: 'BEN-IBU-001',
    pharmacyId: PharmacyChain.BENAVIDES,
    name: 'Ibuprofeno 400mg',
    genericName: 'Ibuprofeno',
    brand: 'Advil',
    description: 'Antiinflamatorio',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '400mg',
    quantity: '24 tabletas',
    laboratory: 'Pfizer',
    images: ['https://example.com/ibuprofeno.jpg'],
    requiresPrescription: false,
    price: {
      current: 62.50,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 78,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.5,
      count: 156,
    },
    delivery: {
      available: true,
      estimatedTime: 50,
      cost: 45,
    },
  },
  // Losartán (prescription)
  {
    id: 'SP-LOS-001',
    pharmacyId: PharmacyChain.SAN_PABLO,
    name: 'Losartán Potásico 50mg',
    genericName: 'Losartán',
    brand: 'Cozaar',
    description: 'Antihipertensivo',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Tabletas',
    dosage: '50mg',
    quantity: '30 tabletas',
    laboratory: 'Merck',
    images: ['https://example.com/losartan.jpg'],
    requiresPrescription: true,
    price: {
      current: 245.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 34,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.9,
      count: 67,
    },
    delivery: {
      available: true,
      estimatedTime: 40,
      cost: 55,
    },
  },
  {
    id: 'GUA-LOS-001',
    pharmacyId: PharmacyChain.GUADALAJARA,
    name: 'Losartán Potásico 50mg Genérico',
    genericName: 'Losartán',
    brand: 'Genérico',
    description: 'Antihipertensivo',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Tabletas',
    dosage: '50mg',
    quantity: '30 tabletas',
    laboratory: 'Genérico',
    images: ['https://example.com/losartan-gen.jpg'],
    requiresPrescription: true,
    price: {
      current: 89.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 89,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.7,
      count: 234,
    },
    delivery: {
      available: true,
      estimatedTime: 45,
      cost: 49,
    },
  },
  // Metformina (prescription)
  {
    id: 'YZA-MET-001',
    pharmacyId: PharmacyChain.YZA,
    name: 'Metformina 850mg',
    genericName: 'Metformina',
    brand: 'Glucophage',
    description: 'Antidiabético oral',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Tabletas',
    dosage: '850mg',
    quantity: '30 tabletas',
    laboratory: 'Merck',
    images: ['https://example.com/metformina.jpg'],
    requiresPrescription: true,
    price: {
      current: 156.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 56,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.8,
      count: 145,
    },
    delivery: {
      available: true,
      estimatedTime: 55,
      cost: 42,
    },
  },
  {
    id: 'SIM-MET-001',
    pharmacyId: PharmacyChain.SIMILARES,
    name: 'Metformina 850mg Genérico',
    genericName: 'Metformina',
    brand: 'Similares',
    description: 'Antidiabético oral genérico',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Tabletas',
    dosage: '850mg',
    quantity: '30 tabletas',
    laboratory: 'Genéricos Similares',
    images: ['https://example.com/metformina-gen.jpg'],
    requiresPrescription: true,
    price: {
      current: 65.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 134,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.5,
      count: 289,
    },
    delivery: {
      available: true,
      estimatedTime: 90,
      cost: 29,
    },
  },
  // Omeprazol
  {
    id: 'AHO-OME-001',
    pharmacyId: PharmacyChain.AHORRO,
    name: 'Omeprazol 20mg',
    genericName: 'Omeprazol',
    brand: 'Losec',
    description: 'Inhibidor de bomba de protones',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Cápsulas',
    dosage: '20mg',
    quantity: '28 cápsulas',
    laboratory: 'AstraZeneca',
    images: ['https://example.com/omeprazol.jpg'],
    requiresPrescription: true,
    price: {
      current: 178.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 45,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.7,
      count: 178,
    },
    delivery: {
      available: true,
      estimatedTime: 60,
      cost: 39,
    },
  },
  {
    id: 'BEN-OME-001',
    pharmacyId: PharmacyChain.BENAVIDES,
    name: 'Omeprazol 20mg Genérico',
    genericName: 'Omeprazol',
    brand: 'Genérico',
    description: 'Inhibidor de bomba de protones',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Cápsulas',
    dosage: '20mg',
    quantity: '28 cápsulas',
    laboratory: 'Genérico',
    images: ['https://example.com/omeprazol-gen.jpg'],
    requiresPrescription: true,
    price: {
      current: 75.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 67,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.4,
      count: 134,
    },
    delivery: {
      available: true,
      estimatedTime: 50,
      cost: 45,
    },
  },
  // Loratadina
  {
    id: 'GUA-LOR-001',
    pharmacyId: PharmacyChain.GUADALAJARA,
    name: 'Loratadina 10mg',
    genericName: 'Loratadina',
    brand: 'Claritin',
    description: 'Antihistamínico',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '10mg',
    quantity: '10 tabletas',
    laboratory: 'Bayer',
    images: ['https://example.com/loratadina.jpg'],
    requiresPrescription: false,
    price: {
      current: 95.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 87,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.6,
      count: 198,
    },
    delivery: {
      available: true,
      estimatedTime: 45,
      cost: 49,
    },
  },
  {
    id: 'SP-LOR-001',
    pharmacyId: PharmacyChain.SAN_PABLO,
    name: 'Loratadina 10mg Genérico',
    genericName: 'Loratadina',
    brand: 'Genérico',
    description: 'Antihistamínico',
    category: ProductCategory.OTC,
    presentation: 'Tabletas',
    dosage: '10mg',
    quantity: '10 tabletas',
    laboratory: 'Genérico',
    images: ['https://example.com/loratadina-gen.jpg'],
    requiresPrescription: false,
    price: {
      current: 35.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 156,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.3,
      count: 245,
    },
    delivery: {
      available: true,
      estimatedTime: 40,
      cost: 55,
    },
  },
  // Atorvastatina
  {
    id: 'GUA-ATO-001',
    pharmacyId: PharmacyChain.GUADALAJARA,
    name: 'Atorvastatina 20mg',
    genericName: 'Atorvastatina',
    brand: 'Lipitor',
    description: 'Estatina reductora de colesterol',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Tabletas',
    dosage: '20mg',
    quantity: '30 tabletas',
    laboratory: 'Pfizer',
    images: ['https://example.com/atorvastatina.jpg'],
    requiresPrescription: true,
    price: {
      current: 345.00,
      original: 420.00,
      discount: 17.9,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 23,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.8,
      count: 89,
    },
    delivery: {
      available: true,
      estimatedTime: 45,
      cost: 49,
    },
  },
  {
    id: 'AHO-ATO-001',
    pharmacyId: PharmacyChain.AHORRO,
    name: 'Atorvastatina 20mg Genérico',
    genericName: 'Atorvastatina',
    brand: 'Genérico',
    description: 'Estatina reductora de colesterol',
    category: ProductCategory.PRESCRIPTION,
    presentation: 'Tabletas',
    dosage: '20mg',
    quantity: '30 tabletas',
    laboratory: 'Genérico',
    images: ['https://example.com/atorvastatina-gen.jpg'],
    requiresPrescription: true,
    price: {
      current: 125.00,
      currency: 'MXN',
    },
    stock: {
      available: true,
      quantity: 67,
      lastUpdated: new Date(),
    },
    rating: {
      average: 4.5,
      count: 156,
    },
    delivery: {
      available: true,
      estimatedTime: 60,
      cost: 39,
    },
  },
];

// Mock orders storage (in-memory for development)
const mockOrders: Map<string, Order> = new Map();

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

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// ============================================================================
// MAIN PHARMACY API INTEGRATION CLASS
// ============================================================================

export class PharmacyAPIIntegration {
  private apiKeys: Map<PharmacyChain, string>;
  private affiliateCodes: Map<PharmacyChain, string>;
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
  getPharmacyConfig(pharmacyId: PharmacyChain): PharmacyConfig {
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
  getAllPharmacies(): PharmacyConfig[] {
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
  }

  // ============================================================================
  // PRODUCT SEARCH METHODS
  // ============================================================================

  /**
   * Search for products across pharmacies
   * 
   * TODO: Replace mock implementation with actual API calls:
   * 
   * Farmacias Guadalajara:
   * GET https://api.farmaciasguadalajara.com/v1/products/search?q={query}
   * Headers: Authorization: Bearer {apiKey}
   * 
   * Farmacias del Ahorro:
   * POST https://api.farmaciasdelahorro.com/api/v2/search
   * Body: { "term": query, "filters": {...} }
   * 
   * Farmacias Similares:
   * GET https://api.farmaciasdesimilares.com/v1/buscar?producto={query}
   * 
   * Farmacias Benavides:
   * GET https://api.benavides.com.mx/api/v1/products?search={query}
   * 
   * Farmacias San Pablo:
   * GET https://api.farmaciasanpablo.com.mx/v1/products/search?q={query}
   * 
   * Farmacias Yza:
   * GET https://api.yza.mx/v2/products/search?query={query}
   */
  async searchProducts(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<ProductSearchResult> {
    const {
      pharmacies = Object.values(PharmacyChain),
      category,
      requiresPrescription,
      minPrice,
      maxPrice,
      inStockOnly = true,
      sortBy = 'relevance',
      sortOrder = 'asc',
      limit = 20,
      offset = 0,
    } = options;

    return withRetry(async () => {
      if (this.useMockData) {
        return this.mockSearchProducts(query, options);
      }

      // TODO: Implement real API integration
      // const results = await Promise.allSettled(
      //   pharmacies.map(async (pharmacyId) => {
      //     const config = this.getPharmacyConfig(pharmacyId);
      //     const apiKey = this.apiKeys.get(pharmacyId);
      //     
      //     if (!apiKey) {
      //       throw new PharmacyIntegrationError(
      //         `API key not configured for ${pharmacyId}`,
      //         'API_KEY_MISSING',
      //         { pharmacyId, retryable: false }
      //       );
      //     }
      //     
      //     const response = await fetch(
      //       `${config.apiBaseUrl}/products/search?q=${encodeURIComponent(query)}`,
      //       {
      //         headers: {
      //           'Authorization': `Bearer ${apiKey}`,
      //           'Content-Type': 'application/json',
      //         },
      //       }
      //     );
      //     
      //     if (!response.ok) {
      //       throw new PharmacyIntegrationError(
      //         `API error from ${pharmacyId}: ${response.statusText}`,
      //         'API_ERROR',
      //         { pharmacyId, statusCode: response.status, retryable: response.status >= 500 }
      //       );
      //     }
      //     
      //     return response.json();
      //   })
      // );

      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  /**
   * Mock search implementation for development
   */
  private mockSearchProducts(
    query: string,
    options: ProductSearchOptions
  ): ProductSearchResult {
    const {
      pharmacies = Object.values(PharmacyChain),
      category,
      requiresPrescription,
      minPrice,
      maxPrice,
      inStockOnly = true,
      sortBy = 'relevance',
      sortOrder = 'asc',
      limit = 20,
      offset = 0,
      maxDeliveryTime,
    } = options;

    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let filtered = MOCK_PRODUCTS.filter(product => {
      // Filter by pharmacy
      if (!pharmacies.includes(product.pharmacyId)) {
        return false;
      }

      // Search in name, generic name, and description
      const searchable = [
        product.name,
        product.genericName,
        product.description,
        product.brand,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (!searchable.includes(normalizedQuery)) {
        return false;
      }

      // Apply filters
      if (category && product.category !== category) return false;
      if (requiresPrescription !== undefined && product.requiresPrescription !== requiresPrescription) return false;
      if (minPrice !== undefined && product.price.current < minPrice) return false;
      if (maxPrice !== undefined && product.price.current > maxPrice) return false;
      if (inStockOnly && !product.stock.available) return false;
      if (maxDeliveryTime !== undefined && product.delivery.estimatedTime > maxDeliveryTime) return false;

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price.current - b.price.current;
          break;
        case 'delivery_time':
          comparison = a.delivery.estimatedTime - b.delivery.estimatedTime;
          break;
        case 'rating':
          comparison = (b.rating?.average || 0) - (a.rating?.average || 0);
          break;
        case 'relevance':
        default:
          // Simple relevance: exact match > partial match
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aExact = aName.includes(normalizedQuery);
          const bExact = bName.includes(normalizedQuery);
          if (aExact && !bExact) comparison = -1;
          else if (!aExact && bExact) comparison = 1;
          else comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    // Add affiliate links
    const productsWithLinks = paginated.map(product => ({
      ...product,
      affiliateLink: this.generateAffiliateLink(product.pharmacyId, product.id),
    }));

    return {
      products: productsWithLinks,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      filters: options,
    };
  }

  // ============================================================================
  // PRICE COMPARISON METHODS
  // ============================================================================

  /**
   * Compare prices for a medication across all pharmacies
   * 
   * TODO: Replace with actual API calls when integrating real pharmacies
   */
  async comparePrices(medicationName: string): Promise<PriceComparisonResult> {
    return withRetry(async () => {
      if (this.useMockData) {
        return this.mockComparePrices(medicationName);
      }

      // TODO: Implement real API integration
      // Search all pharmacies for the medication and aggregate results
      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  /**
   * Mock price comparison for development
   */
  private mockComparePrices(medicationName: string): PriceComparisonResult {
    const normalizedName = medicationName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Find matching products
    const matches = MOCK_PRODUCTS.filter(product => {
      const searchable = [
        product.name,
        product.genericName,
        product.genericName ? `${product.genericName} ${product.dosage || ''}` : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return searchable.includes(normalizedName);
    });

    if (matches.length === 0) {
      throw new ProductNotFoundError(medicationName);
    }

    // Build comparison results
    const results = matches.map(product => {
      const config = PHARMACY_CONFIGS[product.pharmacyId];
      
      let availability: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (!product.stock.available) availability = 'out_of_stock';
      else if (product.stock.quantity < 10) availability = 'low_stock';

      return {
        pharmacyId: product.pharmacyId,
        pharmacyName: config.displayName,
        product,
        totalPrice: product.price.current + product.delivery.cost,
        deliveryTime: product.delivery.estimatedTime,
        availability,
      };
    });

    // Calculate price statistics
    const prices = results.map(r => r.totalPrice);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calculate savings
    const resultsWithSavings = results.map(result => ({
      ...result,
      savings: highestPrice - result.totalPrice,
      savingsPercent: ((highestPrice - result.totalPrice) / highestPrice) * 100,
    }));

    // Determine best deal
    const inStockResults = resultsWithSavings.filter(r => r.availability !== 'out_of_stock');
    let bestDeal: PriceComparisonResult['bestDeal'] | undefined;

    if (inStockResults.length > 0) {
      // Score based on price (70%) and delivery time (30%)
      const scored = inStockResults.map(result => {
        const priceScore = (lowestPrice / result.totalPrice) * 0.7;
        const fastestTime = Math.min(...inStockResults.map(r => r.deliveryTime));
        const timeScore = (fastestTime / result.deliveryTime) * 0.3;
        return { ...result, score: priceScore + timeScore };
      });

      const best = scored.reduce((max, current) => 
        current.score > max.score ? current : max
      );

      bestDeal = {
        pharmacyId: best.pharmacyId,
        productId: best.product.id,
        reason: best.savings && best.savings > 0
          ? `Ahorra $${best.savings.toFixed(2)} (${best.savingsPercent?.toFixed(1)}%) con entrega en ${best.deliveryTime} min`
          : `Entrega más rápida en ${best.deliveryTime} minutos`,
      };
    }

    return {
      medicationName,
      results: resultsWithSavings,
      lowestPrice,
      highestPrice,
      averagePrice,
      bestDeal,
    };
  }

  // ============================================================================
  // ORDER MANAGEMENT METHODS
  // ============================================================================

  /**
   * Place an order with a pharmacy
   * 
   * TODO: Replace with actual API integration:
   * 
   * Farmacias Guadalajara:
   * POST https://api.farmaciasguadalajara.com/v1/orders
   * Body: OrderRequest
   * 
   * Farmacias del Ahorro:
   * POST https://api.farmaciasdelahorro.com/api/v2/orders/create
   * 
   * Farmacias Similares:
   * POST https://api.farmaciasdesimilares.com/v1/pedidos
   * 
   * Farmacias Benavides:
   * POST https://api.benavides.com.mx/api/v1/orders
   * 
   * Farmacias San Pablo:
   * POST https://api.farmaciasanpablo.com.mx/v1/orders
   * 
   * Farmacias Yza:
   * POST https://api.yza.mx/v2/orders
   */
  async placeOrder(orderRequest: OrderRequest): Promise<Order> {
    return withRetry(async () => {
      // Validate order
      this.validateOrderRequest(orderRequest);

      if (this.useMockData) {
        return this.mockPlaceOrder(orderRequest);
      }

      // TODO: Implement real API integration
      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  /**
   * Validate order request
   */
  private validateOrderRequest(request: OrderRequest): void {
    // Check for prescription requirements
    for (const item of request.items) {
      const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
      
      if (!product) {
        throw new ProductNotFoundError(item.productId, item.pharmacyId);
      }

      if (product.requiresPrescription && !item.prescriptionUrl && !request.prescriptionUrls?.length) {
        throw new PrescriptionRequiredError(product.name);
      }
    }

    // Validate delivery
    if (request.deliveryType === DeliveryType.HOME_DELIVERY && !request.deliveryAddress) {
      throw new PharmacyIntegrationError(
        'Delivery address required for home delivery',
        'ADDRESS_REQUIRED',
        { retryable: false }
      );
    }

    if (request.deliveryType === DeliveryType.PICKUP && !request.pickupLocationId) {
      throw new PharmacyIntegrationError(
        'Pickup location required for pickup orders',
        'PICKUP_LOCATION_REQUIRED',
        { retryable: false }
      );
    }
  }

  /**
   * Mock order placement for development
   */
  private mockPlaceOrder(orderRequest: OrderRequest): Order {
    const orderId = generateOrderId();
    const now = new Date();

    // All items must be from the same pharmacy for simplicity
    const pharmacyId = orderRequest.items[0]?.pharmacyId;
    const config = pharmacyId ? PHARMACY_CONFIGS[pharmacyId] : null;

    // Calculate totals
    const subtotal = orderRequest.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryCost = config?.deliveryConfig.baseCost || 49;
    const discount = orderRequest.couponCode ? subtotal * 0.1 : 0; // 10% mock discount
    const tax = (subtotal - discount) * 0.16; // 16% IVA
    const total = subtotal + deliveryCost - discount + tax;

    // Calculate affiliate commission
    const affiliateCommission = orderRequest.affiliateCode && config?.affiliateProgram.enabled
      ? total * config.affiliateProgram.commissionRate
      : undefined;

    const order: Order = {
      id: orderId,
      userId: orderRequest.userId,
      status: OrderStatus.PENDING,
      items: orderRequest.items,
      pharmacyId: pharmacyId!,
      delivery: {
        type: orderRequest.deliveryType,
        address: orderRequest.deliveryAddress,
        estimatedTime: config?.deliveryConfig.baseDeliveryTime || 60,
        trackingNumber: orderRequest.deliveryType === DeliveryType.HOME_DELIVERY
          ? `TRK-${Math.random().toString(36).substr(2, 10).toUpperCase()}`
          : undefined,
      },
      payment: {
        method: orderRequest.paymentMethod,
        status: 'pending',
        subtotal,
        deliveryCost,
        discount,
        tax,
        total,
      },
      timeline: [
        {
          status: OrderStatus.PENDING,
          timestamp: now,
          description: 'Orden recibida y en proceso de confirmación',
        },
      ],
      createdAt: now,
      updatedAt: now,
      affiliateCommission,
    };

    mockOrders.set(orderId, order);

    // Simulate order progression
    this.simulateOrderProgression(orderId);

    return order;
  }

  /**
   * Simulate order status changes for development
   */
  private simulateOrderProgression(orderId: string): void {
    const stages: { status: OrderStatus; delay: number; description: string }[] = [
      { status: OrderStatus.CONFIRMED, delay: 5000, description: 'Orden confirmada' },
      { status: OrderStatus.PREPARING, delay: 15000, description: 'Preparando su pedido' },
      { status: OrderStatus.OUT_FOR_DELIVERY, delay: 30000, description: 'En camino' },
      { status: OrderStatus.DELIVERED, delay: 60000, description: 'Entregado' },
    ];

    let cumulativeDelay = 0;
    stages.forEach(stage => {
      cumulativeDelay += stage.delay;
      setTimeout(() => {
        const order = mockOrders.get(orderId);
        if (order) {
          order.status = stage.status;
          order.timeline.push({
            status: stage.status,
            timestamp: new Date(),
            description: stage.description,
          });
          order.updatedAt = new Date();
          mockOrders.set(orderId, order);
        }
      }, cumulativeDelay);
    });
  }

  /**
   * Get order status
   * 
   * TODO: Replace with actual API calls
   */
  async getOrderStatus(orderId: string): Promise<Order> {
    return withRetry(async () => {
      if (this.useMockData) {
        const order = mockOrders.get(orderId);
        if (!order) {
          throw new PharmacyIntegrationError(
            `Order ${orderId} not found`,
            'ORDER_NOT_FOUND',
            { retryable: false }
          );
        }
        return order;
      }

      // TODO: Implement real API integration
      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  /**
   * Cancel an order
   * 
   * TODO: Replace with actual API integration
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return withRetry(async () => {
      if (this.useMockData) {
        const order = mockOrders.get(orderId);
        if (!order) {
          throw new PharmacyIntegrationError(
            `Order ${orderId} not found`,
            'ORDER_NOT_FOUND',
            { retryable: false }
          );
        }

        if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
          throw new PharmacyIntegrationError(
            `Cannot cancel order with status: ${order.status}`,
            'CANCEL_NOT_ALLOWED',
            { pharmacyId: order.pharmacyId, retryable: false }
          );
        }

        order.status = OrderStatus.CANCELLED;
        order.timeline.push({
          status: OrderStatus.CANCELLED,
          timestamp: new Date(),
          description: reason || 'Orden cancelada por el usuario',
        });
        order.updatedAt = new Date();

        mockOrders.set(orderId, order);
        return order;
      }

      // TODO: Implement real API integration
      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  // ============================================================================
  // DELIVERY ESTIMATION METHODS
  // ============================================================================

  /**
   * Get delivery estimates for a location
   * 
   * TODO: Replace with actual API calls using real distance calculations
   */
  async getDeliveryEstimates(
    coordinates: Coordinates,
    deliveryType: DeliveryType = DeliveryType.HOME_DELIVERY
  ): Promise<DeliveryEstimate[]> {
    return withRetry(async () => {
      if (this.useMockData) {
        return this.mockDeliveryEstimates(coordinates, deliveryType);
      }

      // TODO: Implement real API integration
      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  /**
   * Mock delivery estimates for development
   */
  private mockDeliveryEstimates(
    coordinates: Coordinates,
    deliveryType: DeliveryType
  ): DeliveryEstimate[] {
    // Mock pharmacy locations (simplified)
    const pharmacyLocations: Record<PharmacyChain, Coordinates> = {
      [PharmacyChain.GUADALAJARA]: { latitude: 20.6767, longitude: -103.3475 },
      [PharmacyChain.AHORRO]: { latitude: 20.6597, longitude: -103.3496 },
      [PharmacyChain.SIMILARES]: { latitude: 20.6736, longitude: -103.4058 },
      [PharmacyChain.BENAVIDES]: { latitude: 20.6407, longitude: -103.3915 },
      [PharmacyChain.SAN_PABLO]: { latitude: 20.6919, longitude: -103.3706 },
      [PharmacyChain.YZA]: { latitude: 20.6211, longitude: -103.4186 },
    };

    return Object.values(PHARMACY_CONFIGS).map(config => {
      const pharmacyLocation = pharmacyLocations[config.id];
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

  // ============================================================================
  // STOCK AVAILABILITY METHODS
  // ============================================================================

  /**
   * Check stock availability for products
   * 
   * TODO: Replace with actual API calls
   */
  async checkStockAvailability(
    items: Array<{ productId: string; pharmacyId: PharmacyChain; quantity: number }>
  ): Promise<Array<{
    productId: string;
    pharmacyId: PharmacyChain;
    available: boolean;
    availableQuantity: number;
    estimatedRestock?: Date;
  }>> {
    return withRetry(async () => {
      if (this.useMockData) {
        return items.map(item => {
          const product = MOCK_PRODUCTS.find(
            p => p.id === item.productId && p.pharmacyId === item.pharmacyId
          );

          if (!product) {
            return {
              productId: item.productId,
              pharmacyId: item.pharmacyId,
              available: false,
              availableQuantity: 0,
            };
          }

          const availableQuantity = product.stock.available ? product.stock.quantity : 0;
          const available = product.stock.available && availableQuantity >= item.quantity;

          return {
            productId: item.productId,
            pharmacyId: item.pharmacyId,
            available,
            availableQuantity,
            estimatedRestock: !product.stock.available
              ? new Date(Date.now() + 24 * 60 * 60 * 1000) // Mock: restock tomorrow
              : undefined,
          };
        });
      }

      // TODO: Implement real API integration
      throw new PharmacyIntegrationError(
        'Real API integration not implemented. Set useMockData to true.',
        'NOT_IMPLEMENTED',
        { retryable: false }
      );
    });
  }

  // ============================================================================
  // AFFILIATE LINK GENERATION
  // ============================================================================

  /**
   * Generate affiliate link for a product
   * 
   * TODO: Replace with actual tracking link generation when available
   */
  generateAffiliateLink(pharmacyId: PharmacyChain, productId: string): string {
    const config = PHARMACY_CONFIGS[pharmacyId];
    
    if (!config || !config.affiliateProgram.enabled) {
      return config ? `${config.website}/product/${productId}` : '';
    }

    const affiliateCode = this.affiliateCodes.get(pharmacyId);
    
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
  getAffiliateInfo(pharmacyId: PharmacyChain): {
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

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get popular medications
   */
  async getPopularMedications(limit: number = 10): Promise<Product[]> {
    // Return most "rated" mock products as "popular"
    return MOCK_PRODUCTS
      .filter(p => p.rating && p.rating.count > 50)
      .sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0))
      .slice(0, limit)
      .map(p => ({
        ...p,
        affiliateLink: this.generateAffiliateLink(p.pharmacyId, p.id),
      }));
  }

  /**
   * Get medications by category
   */
  async getMedicationsByCategory(
    category: ProductCategory,
    limit: number = 20
  ): Promise<Product[]> {
    return MOCK_PRODUCTS
      .filter(p => p.category === category)
      .slice(0, limit)
      .map(p => ({
        ...p,
        affiliateLink: this.generateAffiliateLink(p.pharmacyId, p.id),
      }));
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
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const pharmacyIntegration = new PharmacyAPIIntegration({
  useMockData: true,
});

// ============================================================================
// EXPORTS
// ============================================================================

export default PharmacyAPIIntegration;
