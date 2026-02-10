/**
 * Pharmacy Error Classes
 * Custom error types for pharmacy integration
 *
 * @module services/pharmacy/errors
 */

import type { PharmacyError, PharmacyChain } from './types';

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
