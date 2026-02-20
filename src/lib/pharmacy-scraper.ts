import {
  PharmacyChain,
  Product,
  ProductSearchOptions,
  ProductSearchResult,
  PriceComparisonResult,
  ProductCategory
} from '@/services/pharmacy';

// Rich Mock Pharmacy Database with 30+ products
const MOCK_PRODUCTS: Partial<Product>[] = [
  { id: 'g1', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Amoxicilina 500mg C/12 Capsulas', genericName: 'Amoxicilina', price: { current: 89.50, currency: 'MXN' }, stock: { available: true, quantity: 45, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'a1', pharmacyId: PharmacyChain.AHORRO, name: 'Amoxicilina 500mg C/12 Capsulas', genericName: 'Amoxicilina', price: { current: 79.90, currency: 'MXN' }, stock: { available: true, quantity: 32, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 's1', pharmacyId: PharmacyChain.SIMILARES, name: 'Amoxicilina 500mg C/12 Capsulas', genericName: 'Amoxicilina', price: { current: 49.00, currency: 'MXN' }, stock: { available: true, quantity: 28, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'g2', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Azitromicina 500mg C/3 Tabletas', genericName: 'Azitromicina', price: { current: 145.00, currency: 'MXN' }, stock: { available: true, quantity: 56, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'a2', pharmacyId: PharmacyChain.AHORRO, name: 'Azitromicina 500mg C/3 Tabletas', genericName: 'Azitromicina', price: { current: 129.00, currency: 'MXN' }, stock: { available: true, quantity: 41, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 's2', pharmacyId: PharmacyChain.SIMILARES, name: 'Azitromicina 500mg C/3 Tabletas', genericName: 'Azitromicina', price: { current: 89.00, currency: 'MXN' }, stock: { available: true, quantity: 35, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'g4', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Losartan Potasico 50mg C/30 Tabletas', genericName: 'Losartan', price: { current: 185.00, currency: 'MXN' }, stock: { available: true, quantity: 67, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'a4', pharmacyId: PharmacyChain.AHORRO, name: 'Losartan Potasico 50mg C/30 Tabletas', genericName: 'Losartan', price: { current: 169.00, currency: 'MXN' }, stock: { available: true, quantity: 54, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 's4', pharmacyId: PharmacyChain.SIMILARES, name: 'Losartan Potasico 50mg C/30 Tabletas', genericName: 'Losartan', price: { current: 109.00, currency: 'MXN' }, stock: { available: true, quantity: 43, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'g7', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Metformina 850mg C/30 Tabletas', genericName: 'Metformina', price: { current: 145.00, currency: 'MXN' }, stock: { available: true, quantity: 73, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'a7', pharmacyId: PharmacyChain.AHORRO, name: 'Metformina 850mg C/30 Tabletas', genericName: 'Metformina', price: { current: 129.00, currency: 'MXN' }, stock: { available: true, quantity: 61, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 's7', pharmacyId: PharmacyChain.SIMILARES, name: 'Metformina 850mg C/30 Tabletas', genericName: 'Metformina', price: { current: 79.00, currency: 'MXN' }, stock: { available: true, quantity: 55, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'g9', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Atorvastatina 20mg C/30 Tabletas', genericName: 'Atorvastatina', price: { current: 285.00, currency: 'MXN' }, stock: { available: true, quantity: 58, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'a9', pharmacyId: PharmacyChain.AHORRO, name: 'Atorvastatina 20mg C/30 Tabletas', genericName: 'Atorvastatina', price: { current: 265.00, currency: 'MXN' }, stock: { available: true, quantity: 47, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 's9', pharmacyId: PharmacyChain.SIMILARES, name: 'Atorvastatina 20mg C/30 Tabletas', genericName: 'Atorvastatina', price: { current: 179.00, currency: 'MXN' }, stock: { available: true, quantity: 39, lastUpdated: new Date() }, requiresPrescription: true, category: ProductCategory.PRESCRIPTION },
  { id: 'g11', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Omeprazol 20mg C/28 Capsulas', genericName: 'Omeprazol', price: { current: 125.00, currency: 'MXN' }, stock: { available: true, quantity: 82, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'a11', pharmacyId: PharmacyChain.AHORRO, name: 'Omeprazol 20mg C/28 Capsulas', genericName: 'Omeprazol', price: { current: 115.00, currency: 'MXN' }, stock: { available: true, quantity: 74, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 's11', pharmacyId: PharmacyChain.SIMILARES, name: 'Omeprazol 20mg C/28 Capsulas', genericName: 'Omeprazol', price: { current: 75.00, currency: 'MXN' }, stock: { available: true, quantity: 68, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'g17', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Ibuprofeno 400mg C/20 Tabletas', genericName: 'Ibuprofeno', price: { current: 65.00, currency: 'MXN' }, stock: { available: true, quantity: 95, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'a17', pharmacyId: PharmacyChain.AHORRO, name: 'Ibuprofeno 400mg C/20 Tabletas', genericName: 'Ibuprofeno', price: { current: 59.00, currency: 'MXN' }, stock: { available: true, quantity: 87, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 's17', pharmacyId: PharmacyChain.SIMILARES, name: 'Ibuprofeno 400mg C/20 Tabletas', genericName: 'Ibuprofeno', price: { current: 39.00, currency: 'MXN' }, stock: { available: true, quantity: 78, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'g18', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Paracetamol 500mg C/20 Tabletas', genericName: 'Paracetamol', price: { current: 45.00, currency: 'MXN' }, stock: { available: true, quantity: 112, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'a18', pharmacyId: PharmacyChain.AHORRO, name: 'Paracetamol 500mg C/20 Tabletas', genericName: 'Paracetamol', price: { current: 39.00, currency: 'MXN' }, stock: { available: true, quantity: 103, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 's18', pharmacyId: PharmacyChain.SIMILARES, name: 'Paracetamol 500mg C/20 Tabletas', genericName: 'Paracetamol', price: { current: 29.00, currency: 'MXN' }, stock: { available: true, quantity: 94, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'g19', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Aspirina 100mg C/30 Tabletas', genericName: 'Acido Acetilsalicilico', price: { current: 55.00, currency: 'MXN' }, stock: { available: true, quantity: 76, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'a19', pharmacyId: PharmacyChain.AHORRO, name: 'Aspirina 100mg C/30 Tabletas', genericName: 'Acido Acetilsalicilico', price: { current: 49.00, currency: 'MXN' }, stock: { available: true, quantity: 68, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 's19', pharmacyId: PharmacyChain.SIMILARES, name: 'Aspirina 100mg C/30 Tabletas', genericName: 'Acido Acetilsalicilico', price: { current: 35.00, currency: 'MXN' }, stock: { available: true, quantity: 59, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'g20', pharmacyId: PharmacyChain.GUADALAJARA, name: 'Diclofenaco 50mg C/20 Tabletas', genericName: 'Diclofenaco', price: { current: 95.00, currency: 'MXN' }, stock: { available: true, quantity: 64, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 'a20', pharmacyId: PharmacyChain.AHORRO, name: 'Diclofenaco 50mg C/20 Tabletas', genericName: 'Diclofenaco', price: { current: 85.00, currency: 'MXN' }, stock: { available: true, quantity: 57, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
  { id: 's20', pharmacyId: PharmacyChain.SIMILARES, name: 'Diclofenaco 50mg C/20 Tabletas', genericName: 'Diclofenaco', price: { current: 59.00, currency: 'MXN' }, stock: { available: true, quantity: 48, lastUpdated: new Date() }, requiresPrescription: false, category: ProductCategory.OTC },
];

export class PharmacyScraper {
  async searchAll(query: string): Promise<Partial<Product>[]> {
    const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matches = MOCK_PRODUCTS.filter(p => {
      const name = p.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? '';
      const generic = p.genericName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? '';
      return name.includes(normalized) || generic.includes(normalized);
    });
    return matches.slice(0, 12);
  }

  async comparePrices(medicationName: string): Promise<PriceComparisonResult> {
    const matches = await this.searchAll(medicationName);
    if (matches.length === 0) throw new Error(`No products found for ${medicationName}`);

    const results = matches.map(product => {
      const pharmacyId = product.pharmacyId;
      if (!pharmacyId) {
        throw new Error(`Product missing pharmacy ID: ${product.name}`);
      }
      return {
        pharmacyId,
        pharmacyName: this.getPharmacyName(pharmacyId),
        product: product as Product,
        totalPrice: (product.price?.current ?? 0) + 49,
        deliveryTime: 45,
        availability: 'in_stock' as const,
        savings: 0,
        savingsPercent: 0
      };
    });

    const prices = results.map(r => r.totalPrice);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const resultsWithSavings = results.map(result => ({
      ...result,
      savings: highestPrice - result.totalPrice,
      savingsPercent: ((highestPrice - result.totalPrice) / highestPrice) * 100
    }));

    const bestDeal = resultsWithSavings.reduce((min, current) => current.totalPrice < min.totalPrice ? current : min);

    return {
      medicationName,
      results: resultsWithSavings,
      lowestPrice,
      highestPrice,
      averagePrice,
      bestDeal: {
        pharmacyId: bestDeal.pharmacyId,
        productId: bestDeal.product.id ?? '',
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

export const pharmacyScraper = new PharmacyScraper();
export function getAllMockProducts() { return MOCK_PRODUCTS; }

