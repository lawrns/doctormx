/**
 * Pharmacy Inventory Service
 * Stock availability and inventory management
 * 
 * @module services/pharmacy/inventory-service
 */

import type { 
  PharmacyChain, 
  Product,
  StockCheckItem, 
  StockCheckResult 
} from './types';
import { withRetry } from './utils';
import { findProductById, getAllProducts } from './search-service';
import { TIME } from '@/lib/constants';

/**
 * Check stock availability for products
 */
export async function checkStockAvailability(
  items: StockCheckItem[],
  useMockData: boolean = true
): Promise<StockCheckResult[]> {
  return withRetry(async () => {
    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    return items.map(item => {
      const product = findProductById(item.productId, item.pharmacyId);

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
          ? new Date(Date.now() + TIME.INVENTORY_RESTOCK_HOURS * TIME.HOUR_IN_MS) // Mock: restock tomorrow
          : undefined,
      };
    });
  });
}

/**
 * Check if a product is in stock
 */
export function isInStock(
  productId: string,
  pharmacyId: PharmacyChain,
  quantity: number = 1
): boolean {
  const product = findProductById(productId, pharmacyId);
  
  if (!product) {
    return false;
  }

  return product.stock.available && product.stock.quantity >= quantity;
}

/**
 * Get available quantity for a product
 */
export function getAvailableQuantity(
  productId: string,
  pharmacyId: PharmacyChain
): number {
  const product = findProductById(productId, pharmacyId);
  
  if (!product || !product.stock.available) {
    return 0;
  }

  return product.stock.quantity;
}

/**
 * Get all available products for a pharmacy
 */
export function getAvailableProducts(pharmacyId?: PharmacyChain): Product[] {
  const products = getAllProducts();
  
  if (pharmacyId) {
    return products.filter(p => p.pharmacyId === pharmacyId && p.stock.available);
  }
  
  return products.filter(p => p.stock.available);
}

/**
 * Get low stock products
 */
export function getLowStockProducts(
  threshold: number = 10,
  pharmacyId?: PharmacyChain
): Product[] {
  const products = getAllProducts();
  
  return products.filter(p => {
    if (pharmacyId && p.pharmacyId !== pharmacyId) return false;
    return p.stock.available && p.stock.quantity <= threshold;
  });
}

/**
 * Get out of stock products
 */
export function getOutOfStockProducts(pharmacyId?: PharmacyChain): Product[] {
  const products = getAllProducts();
  
  return products.filter(p => {
    if (pharmacyId && p.pharmacyId !== pharmacyId) return false;
    return !p.stock.available;
  });
}

/**
 * Get stock status summary for a pharmacy
 */
export function getStockSummary(pharmacyId?: PharmacyChain): {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
} {
  const products = pharmacyId 
    ? getAllProducts().filter(p => p.pharmacyId === pharmacyId)
    : getAllProducts();

  const inStock = products.filter(p => p.stock.available && p.stock.quantity > 10).length;
  const lowStock = products.filter(p => p.stock.available && p.stock.quantity <= 10).length;
  const outOfStock = products.filter(p => !p.stock.available).length;

  return {
    total: products.length,
    inStock,
    lowStock,
    outOfStock,
  };
}
