/**
 * Pharmacy Error Classes
 * Custom error types for pharmacy integration
 * 
 * @module services/pharmacy/errors
 */

import type { PharmacyError } from './types';
import type { PharmacyChain } from './types';

/**
 * Base error class for pharmacy integration errors
 */
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

/**
 * Error thrown when a product is not found
 */
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

/**
 * Error thrown when a product is out of stock
 */
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

/**
 * Error thrown when a prescription is required but not provided
 */
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

/**
 * Error thrown when delivery is not available to a location
 */
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

/**
 * Error thrown when an order is not found
 */
export class OrderNotFoundError extends PharmacyIntegrationError {
  constructor(orderId: string) {
    super(
      `Order ${orderId} not found`,
      'ORDER_NOT_FOUND',
      { retryable: false }
    );
    this.name = 'OrderNotFoundError';
  }
}

/**
 * Error thrown when an order cannot be cancelled
 */
export class OrderCancellationError extends PharmacyIntegrationError {
  constructor(orderId: string, status: string) {
    super(
      `Cannot cancel order ${orderId} with status: ${status}`,
      'CANCEL_NOT_ALLOWED',
      { retryable: false }
    );
    this.name = 'OrderCancellationError';
  }
}
