/**
 * Pharmacy Order Service
 * Order management, placement, and tracking
 * 
 * @module services/pharmacy/order-service
 */

import type { 
  Order, 
  OrderRequest
} from './types';
import { 
  PharmacyChain,
  OrderStatus, 
  DeliveryType 
} from './types';
import { 
  PrescriptionRequiredError, 
  ProductNotFoundError,
  OrderNotFoundError,
  OrderCancellationError,
  PharmacyIntegrationError
} from './errors';
import { withRetry, generateOrderId, generateTrackingNumber, calculateTax } from './utils';
import { PHARMACY_CONFIGS } from './config';
import { calculateAffiliateCommission } from './affiliate-service';
import { findProductById } from './search-service';
import { TIME, LIMITS } from '@/lib/constants';

// Mock orders storage (in-memory for development)
const mockOrders = new Map<string, Order>();
const mockTimeouts = new Set<NodeJS.Timeout>();

/**
 * Clean up any pending mock timeouts
 * Call this when the service is no longer needed
 */
export function cleanup(): void {
  mockTimeouts.forEach(timeoutId => {
    clearTimeout(timeoutId);
  });
  mockTimeouts.clear();
}

/**
 * Place an order with a pharmacy
 */
export async function placeOrder(
  orderRequest: OrderRequest,
  useMockData: boolean = true
): Promise<Order> {
  return withRetry(async () => {
    // Validate order
    validateOrderRequest(orderRequest);

    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    return mockPlaceOrder(orderRequest);
  });
}

/**
 * Validate order request
 */
function validateOrderRequest(request: OrderRequest): void {
  // Check for prescription requirements
  for (const item of request.items) {
    const product = findProductById(item.productId, item.pharmacyId);
    
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
function mockPlaceOrder(orderRequest: OrderRequest): Order {
  const orderId = generateOrderId();
  const now = new Date();

  // All items must be from the same pharmacy for simplicity
  const pharmacyId = orderRequest.items[0]?.pharmacyId;
  const config = pharmacyId ? PHARMACY_CONFIGS[pharmacyId] : null;

  if (!pharmacyId) {
    throw new PharmacyIntegrationError(
      'Pharmacy ID is required for all items',
      'PHARMACY_ID_REQUIRED',
      { retryable: false }
    );
  }

  // Calculate totals
  const subtotal = orderRequest.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryCost = config?.deliveryConfig.baseCost || LIMITS.DEFAULT_DELIVERY_COST_CENTS;
  const discount = orderRequest.couponCode ? subtotal * LIMITS.DEFAULT_COUPON_DISCOUNT_PERCENT : 0; // 10% mock discount
  const tax = calculateTax(subtotal, discount);
  const total = subtotal + deliveryCost - discount + tax;

  // Calculate affiliate commission
  const affiliateCommission = calculateAffiliateCommission(
    pharmacyId,
    total,
    orderRequest.affiliateCode
  );

  const order: Order = {
    id: orderId,
    userId: orderRequest.userId,
    status: OrderStatus.PENDING,
    items: orderRequest.items,
    pharmacyId,
    delivery: {
      type: orderRequest.deliveryType,
      address: orderRequest.deliveryAddress,
      estimatedTime: config?.deliveryConfig.baseDeliveryTime || 60,
      trackingNumber: orderRequest.deliveryType === DeliveryType.HOME_DELIVERY
        ? generateTrackingNumber()
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
  simulateOrderProgression(orderId);

  return order;
}

/**
 * Simulate order status changes for development
 */
function simulateOrderProgression(orderId: string): void {
  const stages: { status: OrderStatus; delay: number; description: string }[] = [
    { status: OrderStatus.CONFIRMED, delay: TIME.ORDER_STAGE_CONFIRMED_DELAY_MS, description: 'Orden confirmada' },
    { status: OrderStatus.PREPARING, delay: TIME.ORDER_STAGE_PREPARING_DELAY_MS, description: 'Preparando su pedido' },
    { status: OrderStatus.OUT_FOR_DELIVERY, delay: TIME.ORDER_STAGE_OUT_FOR_DELIVERY_DELAY_MS, description: 'En camino' },
    { status: OrderStatus.DELIVERED, delay: TIME.ORDER_STAGE_DELIVERED_DELAY_MS, description: 'Entregado' },
  ];

  let cumulativeDelay = 0;
  stages.forEach(stage => {
    cumulativeDelay += stage.delay;
    const timeoutId = setTimeout(() => {
      mockTimeouts.delete(timeoutId);
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
    mockTimeouts.add(timeoutId);
  });
}

/**
 * Get order status
 */
export async function getOrderStatus(
  orderId: string,
  useMockData: boolean = true
): Promise<Order> {
  return withRetry(async () => {
    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    const order = mockOrders.get(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }
    return order;
  });
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  orderId: string,
  reason?: string,
  useMockData: boolean = true
): Promise<Order> {
  return withRetry(async () => {
    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    const order = mockOrders.get(orderId);
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new OrderCancellationError(orderId, order.status);
    }

    order.status = OrderStatus.CANCELLED;
    order.timeline.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      description: reason ?? 'Orden cancelada por el usuario',
    });
    order.updatedAt = new Date();

    mockOrders.set(orderId, order);
    return order;
  });
}

/**
 * Get all orders for a user
 */
export function getUserOrders(userId: string): Order[] {
  return Array.from(mockOrders.values())
    .filter(order => order.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get orders by pharmacy
 */
export function getPharmacyOrders(pharmacyId: PharmacyChain): Order[] {
  return Array.from(mockOrders.values())
    .filter(order => order.pharmacyId === pharmacyId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Check if an order can be cancelled
 */
export function canCancelOrder(order: Order): boolean {
  return order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;
}
