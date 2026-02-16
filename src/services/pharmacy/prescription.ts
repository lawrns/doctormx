/**
 * Pharmacy Prescription Service
 * Prescription processing and order management
 *
 * @module services/pharmacy/prescription
 */

import type {
  Order,
  OrderItem,
  OrderRequest,
  PharmacyChain,
} from './types';
import { OrderStatus, DeliveryType } from './types';
import { PharmacyIntegrationError, ProductNotFoundError, PrescriptionRequiredError } from './errors';
import { PHARMACY_CONFIGS } from './config';
import { CatalogService } from './catalog';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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
// PRESCRIPTION SERVICE CLASS
// ============================================================================

export class PrescriptionService {
  private catalogService: CatalogService;
  private orders: Map<string, Order>;
  private mockTimeouts: Set<NodeJS.Timeout> = new Set();

  constructor(catalogService?: CatalogService) {
    this.catalogService = catalogService || new CatalogService();
    this.orders = new Map();
  }

  /**
   * Clean up any pending mock timeouts
   * Call this when the instance is no longer needed
   */
  destroy(): void {
    this.mockTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.mockTimeouts.clear();
  }

  /**
   * Place an order with a pharmacy
   *
   * MOCK_IMPLEMENTATION: This is a mock implementation that simulates order placement.
   * To be replaced with actual pharmacy API integrations:
   *
   * Farmacias Guadalajara:
   * POST https://api.farmaciasguadalajara.com/v1/orders
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
      await this.validateOrderRequest(orderRequest);

      return this.createOrder(orderRequest);
    });
  }

  /**
   * Validate order request
   */
  private async validateOrderRequest(request: OrderRequest): Promise<void> {
    const allProducts = this.catalogService.getAllMockProducts();

    // Check for prescription requirements
    for (const item of request.items) {
      const product = allProducts.find(p => p.id === item.productId);

      if (!product) {
        throw new ProductNotFoundError(item.productId, item.pharmacyId);
      }

      if (product.requiresPrescription && !item.prescriptionUrl && !request.prescriptionUrls?.length) {
        throw new PrescriptionRequiredError(product.name);
      }
    }

    // Validate delivery
    if (request.deliveryType === 'home_delivery' && !request.deliveryAddress) {
      throw new PharmacyIntegrationError(
        'Delivery address required for home delivery',
        'ADDRESS_REQUIRED',
        { retryable: false }
      );
    }

    if (request.deliveryType === 'pickup' && !request.pickupLocationId) {
      throw new PharmacyIntegrationError(
        'Pickup location required for pickup orders',
        'PICKUP_LOCATION_REQUIRED',
        { retryable: false }
      );
    }
  }

  /**
   * Create order (mock implementation)
   */
  private createOrder(orderRequest: OrderRequest): Order {
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
      pharmacyId,
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

    this.orders.set(orderId, order);

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
      const timeoutId = setTimeout(() => {
        this.mockTimeouts.delete(timeoutId);
        const order = this.orders.get(orderId);
        if (order) {
          order.status = stage.status;
          order.timeline.push({
            status: stage.status,
            timestamp: new Date(),
            description: stage.description,
          });
          order.updatedAt = new Date();
          this.orders.set(orderId, order);
        }
      }, cumulativeDelay);
      this.mockTimeouts.add(timeoutId);
    });
  }

  /**
   * Get order status
   *
   * MOCK_IMPLEMENTATION: Returns order status from in-memory storage.
   * To be replaced with real pharmacy API status endpoint calls.
   */
  async getOrderStatus(orderId: string): Promise<Order> {
    return withRetry(async () => {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new PharmacyIntegrationError(
          `Order ${orderId} not found`,
          'ORDER_NOT_FOUND',
          { retryable: false }
        );
      }
      return order;
    });
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  /**
   * Cancel an order
   *
   * MOCK_IMPLEMENTATION: Cancels orders in in-memory storage.
   * To be replaced with real pharmacy API cancellation calls.
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    return withRetry(async () => {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new PharmacyIntegrationError(
          `Order ${orderId} not found`,
          'ORDER_NOT_FOUND',
          { retryable: false }
        );
      }

      if (order.status === 'delivered' || order.status === 'cancelled') {
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

      this.orders.set(orderId, order);
      return order;
    });
  }

  /**
   * Update order status (for external updates)
   */
  updateOrderStatus(orderId: string, status: OrderStatus, description?: string): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      description: description || `Estado actualizado a ${status}`,
    });
    order.updatedAt = new Date();

    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Calculate order total
   */
  async calculateOrderTotal(items: OrderItem[], pharmacyId: PharmacyChain): Promise<{
    subtotal: number;
    deliveryCost: number;
    tax: number;
    discount: number;
    total: number;
  }> {
    const config = PHARMACY_CONFIGS[pharmacyId];
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryCost = config?.deliveryConfig.baseCost || 49;
    const discount = 0;
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + deliveryCost + tax;

    return {
      subtotal,
      deliveryCost,
      tax,
      discount,
      total,
    };
  }

  /**
   * Validate prescription URLs
   */
  validatePrescriptionUrls(urls: string[]): boolean {
    if (!urls || urls.length === 0) return false;

    return urls.every(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Get order statistics for a user
   */
  async getUserOrderStats(userId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
  }> {
    const userOrders = await this.getUserOrders(userId);

    const totalOrders = userOrders.length;
    const pendingOrders = userOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
    const completedOrders = userOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = userOrders.filter(o => o.status === 'cancelled').length;
    const totalSpent = userOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.payment.total, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalSpent,
    };
  }
}
