/**
 * Pharmacy Catalog Service
 * Medication catalog management and product search
 *
 * @module services/pharmacy/catalog
 */

import type {
  Product,
  ProductSearchOptions,
  ProductSearchResult,
  ProductCategory,
  PharmacyChain,
} from './types';
import { PHARMACY_CONFIGS } from './config';
import { MOCK_PRODUCTS } from './data/mock-products';

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
// CATALOG SERVICE CLASS
// ============================================================================

export class CatalogService {
  private affiliateCodes: Map<PharmacyChain, string>;

  constructor(affiliateCodes?: Partial<Record<PharmacyChain, string>>) {
    this.affiliateCodes = new Map(
      Object.entries(affiliateCodes || {}) as [PharmacyChain, string][]
    );
  }

  /**
   * Search for products in the catalog
   */
  async searchProducts(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<ProductSearchResult> {
    const {
      pharmacies,
      category,
      requiresPrescription,
      minPrice,
      maxPrice,
      inStockOnly = true,
      sortBy = 'relevance',
      sortOrder = 'asc',
      limit = 20,
      offset = 0,
      maxDeliveryTime,
    } = options;

    const normalizedQuery = normalizeText(query);

    let filtered = MOCK_PRODUCTS.filter(product => {
      // Filter by pharmacy
      if (pharmacies && !pharmacies.includes(product.pharmacyId)) {
        return false;
      }

      // Search in name, generic name, and description
      const searchable = [
        product.name,
        product.genericName,
        product.description,
        product.brand,
      ]
        .filter(Boolean)
        .join(' ');

      const normalizedSearchable = normalizeText(searchable);

      if (!normalizedSearchable.includes(normalizedQuery)) {
        return false;
      }

      // Apply filters
      if (category && product.category !== category) return false;
      if (requiresPrescription !== undefined && product.requiresPrescription !== requiresPrescription) return false;
      if (minPrice !== undefined && product.price.current < minPrice) return false;
      if (maxPrice !== undefined && product.price.current > maxPrice) return false;
      if (inStockOnly && !product.stock.available) return false;
      if (maxDeliveryTime !== undefined && product.delivery.estimatedTime > maxDeliveryTime) return false;

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.price.current - b.price.current;
          break;
        case 'delivery_time':
          comparison = a.delivery.estimatedTime - b.delivery.estimatedTime;
          break;
        case 'rating':
          comparison = (b.rating?.average || 0) - (a.rating?.average || 0);
          break;
        case 'relevance':
        default:
          const aName = normalizeText(a.name);
          const bName = normalizeText(b.name);
          const aExact = aName.includes(normalizedQuery);
          const bExact = bName.includes(normalizedQuery);
          if (aExact && !bExact) comparison = -1;
          else if (!aExact && bExact) comparison = 1;
          else comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    // Add affiliate links
    const productsWithLinks = paginated.map(product => ({
      ...product,
      affiliateLink: this.generateAffiliateLink(product.pharmacyId, product.id),
    }));

    return {
      products: productsWithLinks,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      filters: options,
    };
  }

  /**
   * Get popular medications
   */
  async getPopularMedications(limit: number = 10): Promise<Product[]> {
    return MOCK_PRODUCTS
      .filter(p => p.rating && p.rating.count > 50)
      .sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0))
      .slice(0, limit)
      .map(p => ({
        ...p,
        affiliateLink: this.generateAffiliateLink(p.pharmacyId, p.id),
      }));
  }

  /**
   * Get medications by category
   */
  async getMedicationsByCategory(
    category: ProductCategory,
    limit: number = 20
  ): Promise<Product[]> {
    return MOCK_PRODUCTS
      .filter(p => p.category === category)
      .slice(0, limit)
      .map(p => ({
        ...p,
        affiliateLink: this.generateAffiliateLink(p.pharmacyId, p.id),
      }));
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string, pharmacyId: PharmacyChain): Promise<Product | null> {
    const product = MOCK_PRODUCTS.find(
      p => p.id === productId && p.pharmacyId === pharmacyId
    );

    if (!product) return null;

    return {
      ...product,
      affiliateLink: this.generateAffiliateLink(pharmacyId, productId),
    };
  }

  /**
   * Generate affiliate link for a product
   */
  generateAffiliateLink(pharmacyId: PharmacyChain, productId: string): string {
    const config = PHARMACY_CONFIGS[pharmacyId];

    if (!config || !config.affiliateProgram.enabled) {
      return config ? `${config.website}/product/${productId}` : '';
    }

    const affiliateCode = this.affiliateCodes.get(pharmacyId);

    if (!affiliateCode) {
      return `${config.affiliateProgram.baseUrl}/${productId}`;
    }

    const separator = config.affiliateProgram.baseUrl.includes('?') ? '&' : '?';
    return `${config.affiliateProgram.baseUrl}/${productId}${separator}${config.affiliateProgram.trackingParam}=${affiliateCode}`;
  }

  /**
   * Get affiliate commission information
   */
  getAffiliateInfo(pharmacyId: PharmacyChain): {
    enabled: boolean;
    commissionRate: number;
    estimatedCommission: number;
  } {
    const config = PHARMACY_CONFIGS[pharmacyId];
    return {
      enabled: config.affiliateProgram.enabled,
      commissionRate: config.affiliateProgram.commissionRate,
      estimatedCommission: 1000 * config.affiliateProgram.commissionRate,
    };
  }

  /**
   * Set affiliate code for a pharmacy
   */
  setAffiliateCode(pharmacyId: PharmacyChain, code: string): void {
    this.affiliateCodes.set(pharmacyId, code);
  }

  /**
   * Get all mock products (for testing/internal use)
   */
  getAllMockProducts(): Product[] {
    return MOCK_PRODUCTS;
  }
}
