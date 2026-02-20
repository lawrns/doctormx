/**
 * Pharmacy Inventory Service
 * Stock availability and inventory management
 *
 * @module services/pharmacy/inventory
 */

import type { Product, StockCheckResult } from './types';
import type { PharmacyChain } from './types';
import { OutOfStockError } from './errors';
import { CatalogService } from './catalog';
import { TIME } from '@/lib/constants';

// ============================================================================
// INVENTORY SERVICE CLASS
// ============================================================================

export class InventoryService {
  private catalogService: CatalogService;

  constructor(catalogService?: CatalogService) {
    this.catalogService = catalogService || new CatalogService();
  }

  /**
   * Check stock availability for products
   *
   * MOCK_IMPLEMENTATION: Returns stock availability from local mock product data.
   * To be replaced with real pharmacy API stock checking endpoints.
   */
  async checkStockAvailability(
    items: Array<{ productId: string; pharmacyId: PharmacyChain; quantity: number }>
  ): Promise<StockCheckResult[]> {
    const allProducts = this.catalogService.getAllMockProducts();

    return items.map(item => {
      const product = allProducts.find(
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
          ? new Date(Date.now() + TIME.INVENTORY_RESTOCK_HOURS * TIME.HOUR_IN_MS) // Mock: restock tomorrow
          : undefined,
      };
    });
  }

  /**
   * Check if a single product is in stock
   */
  async isProductAvailable(productId: string, pharmacyId: PharmacyChain, quantity: number = 1): Promise<boolean> {
    const results = await this.checkStockAvailability([{ productId, pharmacyId, quantity }]);
    return results[0]?.available ?? false;
  }

  /**
   * Get stock quantity for a product
   */
  async getStockQuantity(productId: string, pharmacyId: PharmacyChain): Promise<number> {
    const results = await this.checkStockAvailability([{ productId, pharmacyId, quantity: 0 }]);
    return results[0]?.availableQuantity ?? 0;
  }

  /**
   * Find products with low stock
   */
  async findLowStockProducts(threshold: number = 10): Promise<Product[]> {
    const allProducts = this.catalogService.getAllMockProducts();

    return allProducts.filter(
      p => p.stock.available && p.stock.quantity > 0 && p.stock.quantity < threshold
    );
  }

  /**
   * Find out of stock products
   */
  async findOutOfStockProducts(): Promise<Product[]> {
    const allProducts = this.catalogService.getAllMockProducts();

    return allProducts.filter(p => !p.stock.available || p.stock.quantity === 0);
  }

  /**
   * Reserve stock for an order (mock implementation)
   */
  async reserveStock(
    items: Array<{ productId: string; pharmacyId: PharmacyChain; quantity: number }>
  ): Promise<{
    success: boolean;
    reservationId: string;
    expiresAt: Date;
    failedItems?: Array<{ productId: string; reason: string }>;
  }> {
    const stockChecks = await this.checkStockAvailability(items);

    const failedItems = stockChecks
      .filter(check => !check.available)
      .map(check => ({
        productId: check.productId,
        reason: !check.available
          ? 'Insufficient stock'
          : 'Product not available',
      }));

    if (failedItems.length > 0) {
      return {
        success: false,
        reservationId: '',
        expiresAt: new Date(),
        failedItems,
      };
    }

    // Generate reservation ID
    const reservationId = `RSV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    return {
      success: true,
      reservationId,
      expiresAt,
    };
  }

  /**
   * Get inventory statistics for a pharmacy
   */
  async getInventoryStats(pharmacyId: PharmacyChain): Promise<{
    totalProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalItems: number;
  }> {
    const allProducts = this.catalogService.getAllMockProducts();
    const pharmacyProducts = allProducts.filter(p => p.pharmacyId === pharmacyId);

    const inStock = pharmacyProducts.filter(p => p.stock.available && p.stock.quantity >= 10).length;
    const lowStock = pharmacyProducts.filter(p => p.stock.available && p.stock.quantity > 0 && p.stock.quantity < 10).length;
    const outOfStock = pharmacyProducts.filter(p => !p.stock.available || p.stock.quantity === 0).length;
    const totalItems = pharmacyProducts.reduce((sum, p) => sum + (p.stock.quantity ?? 0), 0);

    return {
      totalProducts: pharmacyProducts.length,
      inStock,
      lowStock,
      outOfStock,
      totalItems,
    };
  }

  /**
   * Verify stock availability and throw error if not available
   */
  async verifyStockOrThrow(
    items: Array<{ productId: string; pharmacyId: PharmacyChain; quantity: number }>
  ): Promise<void> {
    const results = await this.checkStockAvailability(items);

    for (const result of results) {
      if (!result.available) {
        throw new OutOfStockError(result.productId, result.pharmacyId);
      }
    }
  }

  /**
   * Find alternative pharmacies for out of stock products
   */
  async findAlternativePharmacies(productId: string, quantity: number): Promise<PharmacyChain[]> {
    const allProducts = this.catalogService.getAllMockProducts();
    const productVariants = allProducts.filter(p => p.id.startsWith(productId.split('-')[0]));

    return productVariants
      .filter(p => p.stock.available && p.stock.quantity >= quantity)
      .map(p => p.pharmacyId);
  }

  /**
   * Get restock estimate for a product
   */
  async getRestockEstimate(productId: string, pharmacyId: PharmacyChain): Promise<{
    available: boolean;
    estimatedDate?: Date;
    notifyAvailable: boolean;
  }> {
    const results = await this.checkStockAvailability([{ productId, pharmacyId, quantity: 1 }]);
    const result = results[0];

    if (result.available) {
      return {
        available: true,
        notifyAvailable: false,
      };
    }

    return {
      available: false,
      estimatedDate: result.estimatedRestock,
      notifyAvailable: true,
    };
  }
}
