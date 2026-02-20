/**
 * Pharmacy Search Service
 * Product search, filtering, and price comparison functionality
 * 
 * @module services/pharmacy/search-service
 */

import type { 
  Product, 
  ProductSearchOptions, 
  ProductSearchResult, 
  PriceComparisonResult
} from './types';
import { 
  PharmacyChain,
  ProductCategory 
} from './types';
import { ProductNotFoundError } from './errors';
import { withRetry, normalizeText, buildSearchableText } from './utils';
import { PHARMACY_CONFIGS } from './config';
import { generateAffiliateLink } from './affiliate-service';

// Import mock data
import type { Product as ProductFromJson } from './mock-data/types';
import productsJson from './mock-data/products.json';

// Convert JSON products to Product interface with proper Date objects
const MOCK_PRODUCTS: Product[] = (productsJson as ProductFromJson[]).map(product => ({
  ...product,
  pharmacyId: product.pharmacyId as PharmacyChain,
  category: product.category as ProductCategory,
  stock: {
    ...product.stock,
    lastUpdated: new Date(product.stock.lastUpdated),
  },
}));

/**
 * Search for products across pharmacies
 * 
 * MOCK_IMPLEMENTATION: This is a mock implementation that searches through local mock data.
 * To be replaced with actual API calls:
 * 
 * Farmacias Guadalajara:
 * GET https://api.farmaciasguadalajara.com/v1/products/search?q={query}
 * Headers: Authorization: Bearer {apiKey}
 *
 * Farmacias del Ahorro:
 * POST https://api.farmaciasdelahorro.com/api/v2/search
 * Body: { "term": query, "filters": {...} }
 *
 * Farmacias Similares:
 * GET https://api.farmaciasdesimilares.com/v1/buscar?producto={query}
 *
 * Farmacias Benavides:
 * GET https://api.benavides.com.mx/api/v1/products?search={query}
 *
 * Farmacias San Pablo:
 * GET https://api.farmaciasanpablo.com.mx/v1/products/search?q={query}
 *
 * Farmacias Yza:
 * GET https://api.yza.mx/v2/products/search?query={query}
 */
export async function searchProducts(
  query: string,
  options: ProductSearchOptions = {},
  useMockData: boolean = true
): Promise<ProductSearchResult> {
  const {
    pharmacies = Object.values(PharmacyChain),
    category,
    requiresPrescription,
    minPrice,
    maxPrice,
    inStockOnly = true,
    sortBy = 'relevance',
    sortOrder = 'asc',
    limit = 20,
    offset = 0,
  } = options;

  return withRetry(async () => {
    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    return mockSearchProducts(query, options);
  });
}

/**
 * Mock search implementation for development
 */
function mockSearchProducts(
  query: string,
  options: ProductSearchOptions
): ProductSearchResult {
  const {
    pharmacies = Object.values(PharmacyChain),
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
    if (!pharmacies.includes(product.pharmacyId)) {
      return false;
    }

    // Search in name, generic name, and description
    const searchable = buildSearchableText([
      product.name,
      product.genericName,
      product.description,
      product.brand,
    ]);

    if (!searchable.includes(normalizedQuery)) {
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
        comparison = (b.rating?.average ?? 0) - (a.rating?.average ?? 0);
        break;
      case 'relevance':
      default:
        // Simple relevance: exact match > partial match
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
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
    affiliateLink: generateAffiliateLink(product.pharmacyId, product.id),
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
 * Compare prices for a medication across all pharmacies
 * 
 * MOCK_IMPLEMENTATION: This is a mock implementation that compares prices from local mock data.
 * To be replaced with real pharmacy API price comparison calls.
 */
export async function comparePrices(
  medicationName: string,
  useMockData: boolean = true
): Promise<PriceComparisonResult> {
  return withRetry(async () => {
    if (!useMockData) {
      throw new Error('Real API integration not implemented. Set useMockData to true.');
    }

    return mockComparePrices(medicationName);
  });
}

/**
 * Mock price comparison for development
 */
function mockComparePrices(medicationName: string): PriceComparisonResult {
  const normalizedName = normalizeText(medicationName);

  // Find matching products
  const matches = MOCK_PRODUCTS.filter(product => {
    const searchable = buildSearchableText([
      product.name,
      product.genericName,
      product.genericName ? `${product.genericName} ${product.dosage ?? ''}` : '',
    ]);

    return searchable.includes(normalizedName);
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
 * Get popular medications
 */
export async function getPopularMedications(
  limit: number = 10,
  useMockData: boolean = true
): Promise<Product[]> {
  // Return most "rated" mock products as "popular"
  return MOCK_PRODUCTS
    .filter(p => p.rating && p.rating.count > 50)
    .sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0))
    .slice(0, limit)
    .map(p => ({
      ...p,
      affiliateLink: generateAffiliateLink(p.pharmacyId, p.id),
    }));
}

/**
 * Get medications by category
 */
export async function getMedicationsByCategory(
  category: ProductCategory,
  limit: number = 20
): Promise<Product[]> {
  return MOCK_PRODUCTS
    .filter(p => p.category === category)
    .slice(0, limit)
    .map(p => ({
      ...p,
      affiliateLink: generateAffiliateLink(p.pharmacyId, p.id),
    }));
}

/**
 * Get all products (for internal use)
 */
export function getAllProducts(): Product[] {
  return MOCK_PRODUCTS;
}

/**
 * Find a product by ID
 */
export function findProductById(
  productId: string,
  pharmacyId?: PharmacyChain
): Product | undefined {
  return MOCK_PRODUCTS.find(
    p => p.id === productId && (!pharmacyId || p.pharmacyId === pharmacyId)
  );
}
