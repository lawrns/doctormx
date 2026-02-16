/**
 * Type definitions for mock data JSON files
 * These types represent the raw JSON structure before conversion to runtime types
 */

// Pharmacy types
export interface AffiliateProgramJson {
  enabled: boolean;
  commissionRate: number;
  trackingParam: string;
  baseUrl: string;
}

export interface FeaturesJson {
  homeDelivery: boolean;
  expressDelivery: boolean;
  prescriptionUpload: boolean;
  onlinePayment: boolean;
  cashOnDelivery: boolean;
  insuranceSupport: boolean;
}

export interface DeliveryConfigJson {
  baseDeliveryTime: number;
  expressDeliveryTime: number;
  baseCost: number;
  expressCost: number;
  freeDeliveryThreshold: number;
  coverageRadiusKm: number;
}

export interface OperatingHoursJson {
  open: string;
  close: string;
  open24Hours: boolean;
}

export interface PharmacyConfigJson {
  id: string;
  name: string;
  displayName: string;
  logoUrl: string;
  website: string;
  apiBaseUrl: string;
  apiVersion: string;
  affiliateProgram: AffiliateProgramJson;
  features: FeaturesJson;
  deliveryConfig: DeliveryConfigJson;
  operatingHours: OperatingHoursJson;
}

// Product types
export interface PriceJson {
  current: number;
  original?: number;
  discount?: number;
  currency: string;
}

export interface StockJson {
  available: boolean;
  quantity: number;
  lastUpdated: string; // ISO date string in JSON
}

export interface RatingJson {
  average: number;
  count: number;
}

export interface DeliveryJson {
  available: boolean;
  estimatedTime: number;
  cost: number;
}

export interface Product {
  id: string;
  pharmacyId: string;
  name: string;
  genericName?: string;
  brand: string;
  description: string;
  category: string;
  presentation: string;
  dosage?: string;
  quantity: string;
  laboratory?: string;
  images: string[];
  requiresPrescription: boolean;
  price: PriceJson;
  stock: StockJson;
  rating?: RatingJson;
  delivery: DeliveryJson;
}

// Order types (for future use if static orders are needed)
export interface OrderItemJson {
  productId: string;
  pharmacyId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  prescriptionUrl?: string;
  prescriptionId?: string;
}

export interface AddressJson {
  street: string;
  number: string;
  apartment?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DeliveryJson {
  type: string;
  address?: AddressJson;
  estimatedTime: number;
  actualTime?: number;
  trackingNumber?: string;
  courierName?: string;
  trackingUrl?: string;
}

export interface PaymentJson {
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  subtotal: number;
  deliveryCost: number;
  discount: number;
  tax: number;
  total: number;
  transactionId?: string;
}

export interface TimelineEventJson {
  status: string;
  timestamp: string; // ISO date string
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  items: OrderItemJson[];
  pharmacyId: string;
  delivery: DeliveryJson;
  payment: PaymentJson;
  timeline: TimelineEventJson[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  affiliateCommission?: number;
}

// Inventory types (for future use)
export interface InventoryItem {
  productId: string;
  pharmacyId: string;
  quantity: number;
  reserved: number;
  available: number;
  lastUpdated: string;
  restockDate?: string;
}
