/**
 * Pharmacy Utility Functions
 * Shared utilities for pharmacy integration services
 * 
 * @module services/pharmacy/utils
 */

import type { Coordinates } from './types';
import { LIMITS } from '@/lib/constants';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers - This is a physical constant, keeping inline
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
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const { maxRetries = LIMITS.DEFAULT_MAX_RETRIES, delayMs = LIMITS.DEFAULT_RETRY_DELAY_MS, backoffMultiplier = LIMITS.RETRY_BACKOFF_MULTIPLIER } = options;
  
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
export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Generate tracking number for delivery
 */
export function generateTrackingNumber(): string {
  return `TRK-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
}

/**
 * Normalize text for search (remove accents, lowercase)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Build searchable text from product fields
 */
export function buildSearchableText(fields: (string | undefined)[]): string {
  return fields
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculate tax amount (16% IVA)
 */
export function calculateTax(subtotal: number, discount: number = 0): number {
  return (subtotal - discount) * 0.16;
}

/**
 * Calculate affiliate commission
 */
export function calculateCommission(
  total: number,
  commissionRate: number
): number {
  return total * commissionRate;
}
