import axios from 'axios';
import * as cheerio from 'cheerio';
import { 
  PharmacyChain, 
  Product, 
  ProductSearchOptions, 
  ProductSearchResult,
  PriceComparisonResult,
  ProductCategory
} from '@/services/pharmacy-integration';

// ============================================================================
// WEB SCRAPER FOR MEXICAN PHARMACIES (Real Implementation)
// ============================================================================

export class PharmacyScraper {
  private timeout: number = 15000;
  private userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  // Farmacias Guadalajara scraper
  async scrapeGuadalajara(query: string): Promise<Partial<Product>[]> {
    try {
      const searchUrl = `https://www.farmaciasguadalajara.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });
      
      const $ = cheerio.load(response.data);
      const products: Partial<Product>[] = [];
      
      $('.product-item').each((_: number, el: any) => {
        const name = $(el).find('.product-name').text().trim();
        const priceText = $(el).find('.product-price').text().trim().replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        const link = $(el).find('a').attr('href');
        
        if (name && price) {
          products.push({
            pharmacyId: PharmacyChain.GUADALAJARA,
            name,
            price: {
              current: price,
              currency: 'MXN'
            },
            stock: {
              available: true,
              quantity: 10,
              lastUpdated: new Date()
            },
            affiliateLink: link ? `https://www.farmaciasguadalajara.com${link}` : undefined,
            requiresPrescription: this.requiresPrescription(name),
            category: this.categorizeProduct(name)
          });
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error scraping Guadalajara:', error);
      return [];
    }
  }

  // Farmacias del Ahorro scraper
  async scrapeAhorro(query: string): Promise<Partial<Product>[]> {
    try {
      const searchUrl = `https://www.farmaciasdelahorro.com/busqueda?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });
      
      const $ = cheerio.load(response.data);
      const products: Partial<Product>[] = [];
      
      $('.product-card').each((_: number, el: any) => {
        const name = $(el).find('.product-title').text().trim();
        const priceText = $(el).find('.price').text().trim().replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        
        if (name && price) {
          products.push({
            pharmacyId: PharmacyChain.AHORRO,
            name,
            price: {
              current: price,
              currency: 'MXN'
            },
            stock: { available: true, quantity: 10, lastUpdated: new Date() },
            requiresPrescription: this.requiresPrescription(name),
            category: this.categorizeProduct(name)
          });
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error scraping Ahorro:', error);
      return [];
    }
  }

  // Farmacias Similares scraper
  async scrapeSimilares(query: string): Promise<Partial<Product>[]> {
    try {
      const searchUrl = `https://www.farmaciasdesimilares.com.mx/buscar?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout
      });
      
      const $ = cheerio.load(response.data);
      const products: Partial<Product>[] = [];
      
      $('.producto-item').each((_: number, el: any) => {
        const name = $(el).find('.nombre-producto').text().trim();
        const priceText = $(el).find('.precio').text().trim().replace(/[^0-9.]/g, '');
        const price = parseFloat(priceText);
        
        if (name && price) {
          products.push({
            pharmacyId: PharmacyChain.SIMILARES,
            name,
            price: {
              current: price,
              currency: 'MXN'
            },
            stock: { available: true, quantity: 10, lastUpdated: new Date() },
            requiresPrescription: this.requiresPrescription(name),
            category: this.categorizeProduct(name)
          });
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error scraping Similares:', error);
      return [];
    }
  }

  // Helper methods
  private requiresPrescription(name: string): boolean {
    const prescriptionKeywords = [
      'antibiotico', 'antibiótico', 'amoxicilina', 'azitromicina', 'ciprofloxacino',
      'losartan', 'amlodipino', 'metformina', 'atorvastatina', 'omeprazol',
      'clonazepam', 'alprazolam', 'lorazepam', 'diazepam',
      'tramadol', 'codeina', 'morfina', 'oxycodona',
      'isotretinoina', 'roacutan', 'accutane'
    ];
    const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return prescriptionKeywords.some(kw => normalized.includes(kw));
  }

  private categorizeProduct(name: string): ProductCategory {
    const normalized = name.toLowerCase();
    if (this.requiresPrescription(name)) return ProductCategory.PRESCRIPTION;
    if (normalized.includes('vitamina') || normalized.includes('suplemento')) return ProductCategory.SUPPLEMENT;
    if (normalized.includes('shampoo') || normalized.includes('crema') || normalized.includes('jabon')) return ProductCategory.PERSONAL_CARE;
    return ProductCategory.OTC;
  }

  // Search all pharmacies
  async searchAll(query: string): Promise<Partial<Product>[]> {
    const results = await Promise.allSettled([
      this.scrapeGuadalajara(query),
      this.scrapeAhorro(query),
      this.scrapeSimilares(query)
    ]);
    
    return results
      .filter((r): r is PromiseFulfilledResult<Partial<Product>[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  // Compare prices across pharmacies
  async comparePrices(medicationName: string): Promise<PriceComparisonResult> {
    const allProducts = await this.searchAll(medicationName);
    
    const matches = allProducts.filter(p => {
      const normalized = medicationName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const productName = p.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
      return productName.includes(normalized) || normalized.includes(productName);
    });

    if (matches.length === 0) {
      throw new Error(`No products found for ${medicationName}`);
    }

    const results = matches.map(product => ({
      pharmacyId: product.pharmacyId!,
      pharmacyName: this.getPharmacyName(product.pharmacyId!),
      product: product as Product,
      totalPrice: (product.price?.current || 0) + 49, // + delivery
      deliveryTime: 45,
      availability: 'in_stock' as const,
      savings: 0,
      savingsPercent: 0
    }));

    const prices = results.map(r => r.totalPrice);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calculate savings
    const resultsWithSavings = results.map(result => ({
      ...result,
      savings: highestPrice - result.totalPrice,
      savingsPercent: ((highestPrice - result.totalPrice) / highestPrice) * 100
    }));

    // Best deal is lowest price
    const bestDeal = resultsWithSavings.reduce((min, current) => 
      current.totalPrice < min.totalPrice ? current : min
    );

    return {
      medicationName,
      results: resultsWithSavings,
      lowestPrice,
      highestPrice,
      averagePrice,
      bestDeal: {
        pharmacyId: bestDeal.pharmacyId,
        productId: bestDeal.product.id || '',
        reason: `Ahorra $${bestDeal.savings.toFixed(2)} (${bestDeal.savingsPercent.toFixed(1)}%)`
      }
    };
  }

  private getPharmacyName(chain: PharmacyChain): string {
    const names: Record<PharmacyChain, string> = {
      [PharmacyChain.GUADALAJARA]: 'Farmacias Guadalajara',
      [PharmacyChain.AHORRO]: 'Farmacias del Ahorro',
      [PharmacyChain.SIMILARES]: 'Farmacias Similares',
      [PharmacyChain.BENAVIDES]: 'Farmacias Benavides',
      [PharmacyChain.SAN_PABLO]: 'Farmacias San Pablo',
      [PharmacyChain.YZA]: 'Farmacias Yza'
    };
    return names[chain] || chain;
  }
}

// Export singleton
export const pharmacyScraper = new PharmacyScraper();
