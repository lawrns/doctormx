/**
 * Pharmacy Search Service
 * Multi-pharmacy product search and price comparison
 *
 * @module services/pharmacy/search
 */

import type {
  Product,
  ProductSearchOptions,
  ProductSearchResult,
  PriceComparisonResult,
  PharmacyChain,
} from './types';
import { ProductNotFoundError } from './errors';
import { CatalogService } from './catalog';
import { PHARMACY_CONFIGS } from './config';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize text for search (remove accents, lowercase)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ============================================================================
// SEARCH SERVICE CLASS
// ============================================================================

export class SearchService {
  private catalogService: CatalogService;

  constructor(catalogService?: CatalogService) {
    this.catalogService = catalogService || new CatalogService();
  }

  /**
   * Compare prices for a medication across all pharmacies
   */
  async comparePrices(medicationName: string): Promise<PriceComparisonResult> {
    const normalizedName = normalizeText(medicationName);
    const allProducts = this.catalogService.getAllMockProducts();

    // Find matching products
    const matches = allProducts.filter(product => {
      const searchable = [
        product.name,
        product.genericName,
        product.genericName ? `${product.genericName} ${product.dosage || ''}` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return normalizeText(searchable).includes(normalizedName);
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

  /**
   * Search for products across multiple pharmacies
   */
  async searchProducts(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<ProductSearchResult> {
    return this.catalogService.searchProducts(query, options);
  }

  /**
   * Search for products with automatic price comparison
   */
  async searchAndCompare(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<ProductSearchResult> {
    const searchResult = await this.searchProducts(query, options);

    // If we have results from multiple pharmacies, add comparison
    const uniqueMedications = this.groupByMedication(searchResult.products);

    if (uniqueMedications.size > 1) {
      // Get the first medication name for comparison
      const firstProduct = searchResult.products[0];
      const medicationName = firstProduct.genericName || firstProduct.name;

      try {
        const comparison = await this.comparePrices(medicationName);
        searchResult.comparison = comparison;
      } catch {
        // Comparison failed, continue without it
      }
    }

    return searchResult;
  }

  /**
   * Group products by medication (generic name)
   */
  private groupByMedication(products: Product[]): Map<string, Product[]> {
    const grouped = new Map<string, Product[]>();

    for (const product of products) {
      const key = product.genericName || product.name;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(product);
    }

    return grouped;
  }

  /**
   * Find cheapest option for a medication
   */
  async findCheapest(medicationName: string): Promise<Product | null> {
    const comparison = await this.comparePrices(medicationName);
    const inStockResults = comparison.results.filter(r => r.availability !== 'out_of_stock');

    if (inStockResults.length === 0) return null;

    const cheapest = inStockResults.reduce((min, current) =>
      current.totalPrice < min.totalPrice ? current : min
    );

    return cheapest.product;
  }

  /**
   * Find fastest delivery option for a medication
   */
  async findFastestDelivery(medicationName: string): Promise<Product | null> {
    const comparison = await this.comparePrices(medicationName);
    const inStockResults = comparison.results.filter(r => r.availability !== 'out_of_stock');

    if (inStockResults.length === 0) return null;

    const fastest = inStockResults.reduce((min, current) =>
      current.deliveryTime < min.deliveryTime ? current : min
    );

    return fastest.product;
  }

  /**
   * Get pharmacy name by ID
   */
  getPharmacyName(chain: PharmacyChain): string {
    return PHARMACY_CONFIGS[chain]?.displayName || chain;
  }

  /**
   * Get all available pharmacies
   */
  getAllPharmacies(): typeof PHARMACY_CONFIGS {
    return PHARMACY_CONFIGS;
  }
}
