/**
 * Payment Configuration Constants - Doctor.mx
 *
 * Centralized configuration for payment processing, pricing limits,
 * and currency settings.
 *
 * @module constants/payments
 * @see {@link ../config/constants.ts} - Original source
 */

/**
 * Payment processing configuration
 * Defines currency, price limits, and default values
 */
export const PAYMENT_CONFIG = {
  /** Currency code for all transactions (Mexican Peso) */
  CURRENCY: 'MXN',

  /** Minimum price in cents ($100 MXN) */
  MIN_PRICE_CENTS: 10000,

  /** Maximum price in cents ($5,000 MXN) */
  MAX_PRICE_CENTS: 500000,

  /** Default consultation price in cents ($500 MXN) */
  DEFAULT_PRICE_CENTS: 50000,
} as const

/**
 * Currency code type derived from PAYMENT_CONFIG
 */
export type CurrencyCode = typeof PAYMENT_CONFIG.CURRENCY

/**
 * Converts price from cents to decimal format (MXN)
 * @param cents - Price in cents
 * @returns Price in decimal format (e.g., 50000 -> 500.00)
 */
export function centsToDecimal(cents: number): number {
  return cents / 100
}

/**
 * Converts price from decimal to cents format
 * @param decimal - Price in decimal format
 * @returns Price in cents (e.g., 500.00 -> 50000)
 */
export function decimalToCents(decimal: number): number {
  return Math.round(decimal * 100)
}

/**
 * Formats price as Mexican Peso string
 * @param cents - Price in cents
 * @returns Formatted price string (e.g., "$500.00 MXN")
 */
export function formatPrice(cents: number): string {
  const decimal = centsToDecimal(cents)
  return `$${decimal.toFixed(2)} ${PAYMENT_CONFIG.CURRENCY}`
}
