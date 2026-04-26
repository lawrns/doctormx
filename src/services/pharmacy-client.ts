const MOCK_PHARMACY_DISPLAY_NAMES: Record<string, string> = {
  guadalajara: 'Farmacias Guadalajara',
  ahorro: 'Farmacias del Ahorro',
  similares: 'Farmacias Similares',
  benavides: 'Farmacias Benavides',
  san_pablo: 'Farmacias San Pablo',
  yza: 'Farmacias Yza',
}

const MOCK_DELIVERY_CONFIGS: Record<string, { baseDeliveryTime: number; baseCost: number; coverageRadiusKm: number; expressDelivery: boolean; expressDeliveryTime: number; expressCost: number }> = {
  guadalajara: { baseDeliveryTime: 45, baseCost: 49, coverageRadiusKm: 15, expressDelivery: true, expressDeliveryTime: 25, expressCost: 79 },
  ahorro: { baseDeliveryTime: 60, baseCost: 39, coverageRadiusKm: 20, expressDelivery: false, expressDeliveryTime: 0, expressCost: 0 },
  similares: { baseDeliveryTime: 90, baseCost: 29, coverageRadiusKm: 25, expressDelivery: false, expressDeliveryTime: 0, expressCost: 0 },
  benavides: { baseDeliveryTime: 50, baseCost: 45, coverageRadiusKm: 18, expressDelivery: true, expressDeliveryTime: 30, expressCost: 85 },
  san_pablo: { baseDeliveryTime: 40, baseCost: 55, coverageRadiusKm: 12, expressDelivery: true, expressDeliveryTime: 20, expressCost: 95 },
  yza: { baseDeliveryTime: 55, baseCost: 42, coverageRadiusKm: 16, expressDelivery: false, expressDeliveryTime: 0, expressCost: 0 },
}

const MOCK_AFFILIATE_CONFIG: Record<string, { enabled: boolean; baseUrl: string; trackingParam: string }> = {
  guadalajara: { enabled: true, baseUrl: 'https://www.farmaciasguadalajara.com/producto', trackingParam: 'affiliate_id' },
  ahorro: { enabled: true, baseUrl: 'https://www.farmaciasdelahorro.com/productos', trackingParam: 'ref' },
  similares: { enabled: true, baseUrl: 'https://www.farmaciasdesimilares.com/producto', trackingParam: 'afiliado' },
  benavides: { enabled: true, baseUrl: 'https://www.benavides.com.mx/producto', trackingParam: 'partner' },
  san_pablo: { enabled: true, baseUrl: 'https://www.farmaciasanpablo.com.mx/productos', trackingParam: 'aff' },
  yza: { enabled: false, baseUrl: '', trackingParam: '' },
}

const MOCK_PHARMACY_LOCATIONS: Record<string, { latitude: number; longitude: number }> = {
  guadalajara: { latitude: 20.6767, longitude: -103.3475 },
  ahorro: { latitude: 20.6597, longitude: -103.3496 },
  similares: { latitude: 20.6736, longitude: -103.4058 },
  benavides: { latitude: 20.6407, longitude: -103.3915 },
  san_pablo: { latitude: 20.6919, longitude: -103.3706 },
  yza: { latitude: 20.6211, longitude: -103.4186 },
}

const MOCK_PRODUCTS: any[] = [
  {
    id: 'GUA-PAR-001',
    pharmacyId: 'guadalajara',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    brand: 'Tylenol',
    description: 'Analgésico y antipirético para el alivio del dolor y fiebre',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '500mg',
    quantity: '20 tabletas',
    laboratory: 'Johnson & Johnson',
    images: ['https://example.com/paracetamol-500.jpg'],
    requiresPrescription: false,
    price: { current: 45.50, original: 52.00, discount: 12.5, currency: 'MXN' },
    stock: { available: true, quantity: 150, lastUpdated: new Date() },
    rating: { average: 4.7, count: 234 },
    delivery: { available: true, estimatedTime: 45, cost: 49 },
  },
  {
    id: 'AHO-PAR-001',
    pharmacyId: 'ahorro',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    brand: 'Tylenol',
    description: 'Analgésico y antipirético',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '500mg',
    quantity: '20 tabletas',
    laboratory: 'Johnson & Johnson',
    images: ['https://example.com/paracetamol-500.jpg'],
    requiresPrescription: false,
    price: { current: 43.90, currency: 'MXN' },
    stock: { available: true, quantity: 89, lastUpdated: new Date() },
    rating: { average: 4.6, count: 189 },
    delivery: { available: true, estimatedTime: 60, cost: 39 },
  },
  {
    id: 'SIM-PAR-001',
    pharmacyId: 'similares',
    name: 'Paracetamol 500mg Genérico',
    genericName: 'Paracetamol',
    brand: 'Similares',
    description: 'Analgésico y antipirético genérico',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '500mg',
    quantity: '20 tabletas',
    laboratory: 'Genéricos Similares',
    images: ['https://example.com/paracetamol-gen.jpg'],
    requiresPrescription: false,
    price: { current: 28.00, currency: 'MXN' },
    stock: { available: true, quantity: 200, lastUpdated: new Date() },
    rating: { average: 4.3, count: 456 },
    delivery: { available: true, estimatedTime: 90, cost: 29 },
  },
  {
    id: 'GUA-AMX-001',
    pharmacyId: 'guadalajara',
    name: 'Amoxicilina 500mg',
    genericName: 'Amoxicilina',
    brand: 'Amoxil',
    description: 'Antibiótico de amplio espectro',
    category: 'prescription',
    presentation: 'Cápsulas',
    dosage: '500mg',
    quantity: '12 cápsulas',
    laboratory: 'GlaxoSmithKline',
    images: ['https://example.com/amoxicilina.jpg'],
    requiresPrescription: true,
    price: { current: 125.00, currency: 'MXN' },
    stock: { available: true, quantity: 45, lastUpdated: new Date() },
    rating: { average: 4.8, count: 123 },
    delivery: { available: true, estimatedTime: 45, cost: 49 },
  },
  {
    id: 'AHO-AMX-001',
    pharmacyId: 'ahorro',
    name: 'Amoxicilina 500mg',
    genericName: 'Amoxicilina',
    brand: 'Genérico',
    description: 'Antibiótico',
    category: 'prescription',
    presentation: 'Cápsulas',
    dosage: '500mg',
    quantity: '12 cápsulas',
    laboratory: 'Genéricos',
    images: ['https://example.com/amoxicilina-gen.jpg'],
    requiresPrescription: true,
    price: { current: 89.50, currency: 'MXN' },
    stock: { available: true, quantity: 67, lastUpdated: new Date() },
    rating: { average: 4.5, count: 98 },
    delivery: { available: true, estimatedTime: 60, cost: 39 },
  },
  {
    id: 'GUA-IBU-001',
    pharmacyId: 'guadalajara',
    name: 'Ibuprofeno 400mg',
    genericName: 'Ibuprofeno',
    brand: 'Advil',
    description: 'Antiinflamatorio no esteroideo',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '400mg',
    quantity: '24 tabletas',
    laboratory: 'Pfizer',
    images: ['https://example.com/ibuprofeno.jpg'],
    requiresPrescription: false,
    price: { current: 65.00, original: 78.00, discount: 16.7, currency: 'MXN' },
    stock: { available: true, quantity: 120, lastUpdated: new Date() },
    rating: { average: 4.6, count: 312 },
    delivery: { available: true, estimatedTime: 45, cost: 49 },
  },
  {
    id: 'BEN-IBU-001',
    pharmacyId: 'benavides',
    name: 'Ibuprofeno 400mg',
    genericName: 'Ibuprofeno',
    brand: 'Advil',
    description: 'Antiinflamatorio',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '400mg',
    quantity: '24 tabletas',
    laboratory: 'Pfizer',
    images: ['https://example.com/ibuprofeno.jpg'],
    requiresPrescription: false,
    price: { current: 62.50, currency: 'MXN' },
    stock: { available: true, quantity: 78, lastUpdated: new Date() },
    rating: { average: 4.5, count: 156 },
    delivery: { available: true, estimatedTime: 50, cost: 45 },
  },
  {
    id: 'SP-LOS-001',
    pharmacyId: 'san_pablo',
    name: 'Losartán Potásico 50mg',
    genericName: 'Losartán',
    brand: 'Cozaar',
    description: 'Antihipertensivo',
    category: 'prescription',
    presentation: 'Tabletas',
    dosage: '50mg',
    quantity: '30 tabletas',
    laboratory: 'Merck',
    images: ['https://example.com/losartan.jpg'],
    requiresPrescription: true,
    price: { current: 245.00, currency: 'MXN' },
    stock: { available: true, quantity: 34, lastUpdated: new Date() },
    rating: { average: 4.9, count: 67 },
    delivery: { available: true, estimatedTime: 40, cost: 55 },
  },
  {
    id: 'GUA-LOS-001',
    pharmacyId: 'guadalajara',
    name: 'Losartán Potásico 50mg Genérico',
    genericName: 'Losartán',
    brand: 'Genérico',
    description: 'Antihipertensivo',
    category: 'prescription',
    presentation: 'Tabletas',
    dosage: '50mg',
    quantity: '30 tabletas',
    laboratory: 'Genérico',
    images: ['https://example.com/losartan-gen.jpg'],
    requiresPrescription: true,
    price: { current: 89.00, currency: 'MXN' },
    stock: { available: true, quantity: 89, lastUpdated: new Date() },
    rating: { average: 4.7, count: 234 },
    delivery: { available: true, estimatedTime: 45, cost: 49 },
  },
  {
    id: 'YZA-MET-001',
    pharmacyId: 'yza',
    name: 'Metformina 850mg',
    genericName: 'Metformina',
    brand: 'Glucophage',
    description: 'Antidiabético oral',
    category: 'prescription',
    presentation: 'Tabletas',
    dosage: '850mg',
    quantity: '30 tabletas',
    laboratory: 'Merck',
    images: ['https://example.com/metformina.jpg'],
    requiresPrescription: true,
    price: { current: 156.00, currency: 'MXN' },
    stock: { available: true, quantity: 56, lastUpdated: new Date() },
    rating: { average: 4.8, count: 145 },
    delivery: { available: true, estimatedTime: 55, cost: 42 },
  },
  {
    id: 'SIM-MET-001',
    pharmacyId: 'similares',
    name: 'Metformina 850mg Genérico',
    genericName: 'Metformina',
    brand: 'Similares',
    description: 'Antidiabético oral genérico',
    category: 'prescription',
    presentation: 'Tabletas',
    dosage: '850mg',
    quantity: '30 tabletas',
    laboratory: 'Genéricos Similares',
    images: ['https://example.com/metformina-gen.jpg'],
    requiresPrescription: true,
    price: { current: 65.00, currency: 'MXN' },
    stock: { available: true, quantity: 134, lastUpdated: new Date() },
    rating: { average: 4.5, count: 289 },
    delivery: { available: true, estimatedTime: 90, cost: 29 },
  },
  {
    id: 'AHO-OME-001',
    pharmacyId: 'ahorro',
    name: 'Omeprazol 20mg',
    genericName: 'Omeprazol',
    brand: 'Losec',
    description: 'Inhibidor de bomba de protones',
    category: 'prescription',
    presentation: 'Cápsulas',
    dosage: '20mg',
    quantity: '28 cápsulas',
    laboratory: 'AstraZeneca',
    images: ['https://example.com/omeprazol.jpg'],
    requiresPrescription: true,
    price: { current: 178.00, currency: 'MXN' },
    stock: { available: true, quantity: 45, lastUpdated: new Date() },
    rating: { average: 4.7, count: 178 },
    delivery: { available: true, estimatedTime: 60, cost: 39 },
  },
  {
    id: 'BEN-OME-001',
    pharmacyId: 'benavides',
    name: 'Omeprazol 20mg Genérico',
    genericName: 'Omeprazol',
    brand: 'Genérico',
    description: 'Inhibidor de bomba de protones',
    category: 'prescription',
    presentation: 'Cápsulas',
    dosage: '20mg',
    quantity: '28 cápsulas',
    laboratory: 'Genérico',
    images: ['https://example.com/omeprazol-gen.jpg'],
    requiresPrescription: true,
    price: { current: 75.00, currency: 'MXN' },
    stock: { available: true, quantity: 67, lastUpdated: new Date() },
    rating: { average: 4.4, count: 134 },
    delivery: { available: true, estimatedTime: 50, cost: 45 },
  },
  {
    id: 'GUA-LOR-001',
    pharmacyId: 'guadalajara',
    name: 'Loratadina 10mg',
    genericName: 'Loratadina',
    brand: 'Claritin',
    description: 'Antihistamínico',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '10mg',
    quantity: '10 tabletas',
    laboratory: 'Bayer',
    images: ['https://example.com/loratadina.jpg'],
    requiresPrescription: false,
    price: { current: 95.00, currency: 'MXN' },
    stock: { available: true, quantity: 87, lastUpdated: new Date() },
    rating: { average: 4.6, count: 198 },
    delivery: { available: true, estimatedTime: 45, cost: 49 },
  },
  {
    id: 'SP-LOR-001',
    pharmacyId: 'san_pablo',
    name: 'Loratadina 10mg Genérico',
    genericName: 'Loratadina',
    brand: 'Genérico',
    description: 'Antihistamínico',
    category: 'otc',
    presentation: 'Tabletas',
    dosage: '10mg',
    quantity: '10 tabletas',
    laboratory: 'Genérico',
    images: ['https://example.com/loratadina-gen.jpg'],
    requiresPrescription: false,
    price: { current: 35.00, currency: 'MXN' },
    stock: { available: true, quantity: 156, lastUpdated: new Date() },
    rating: { average: 4.3, count: 245 },
    delivery: { available: true, estimatedTime: 40, cost: 55 },
  },
  {
    id: 'GUA-ATO-001',
    pharmacyId: 'guadalajara',
    name: 'Atorvastatina 20mg',
    genericName: 'Atorvastatina',
    brand: 'Lipitor',
    description: 'Estatina reductora de colesterol',
    category: 'prescription',
    presentation: 'Tabletas',
    dosage: '20mg',
    quantity: '30 tabletas',
    laboratory: 'Pfizer',
    images: ['https://example.com/atorvastatina.jpg'],
    requiresPrescription: true,
    price: { current: 345.00, original: 420.00, discount: 17.9, currency: 'MXN' },
    stock: { available: true, quantity: 23, lastUpdated: new Date() },
    rating: { average: 4.8, count: 89 },
    delivery: { available: true, estimatedTime: 45, cost: 49 },
  },
  {
    id: 'AHO-ATO-001',
    pharmacyId: 'ahorro',
    name: 'Atorvastatina 20mg Genérico',
    genericName: 'Atorvastatina',
    brand: 'Genérico',
    description: 'Estatina reductora de colesterol',
    category: 'prescription',
    presentation: 'Tabletas',
    dosage: '20mg',
    quantity: '30 tabletas',
    laboratory: 'Genérico',
    images: ['https://example.com/atorvastatina-gen.jpg'],
    requiresPrescription: true,
    price: { current: 125.00, currency: 'MXN' },
    stock: { available: true, quantity: 67, lastUpdated: new Date() },
    rating: { average: 4.5, count: 156 },
    delivery: { available: true, estimatedTime: 60, cost: 39 },
  },
]

const mockOrders = new Map<string, any>()

function calculateDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const R = 6371
  const dLat = toRadians(coord2.latitude - coord1.latitude)
  const dLon = toRadians(coord2.longitude - coord1.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

function generateAffiliateLink(pharmacyId: string, productId: string, affiliateCodes: Map<string, string>): string {
  const config = MOCK_AFFILIATE_CONFIG[pharmacyId]
  if (!config || !config.enabled) return ''
  const affiliateCode = affiliateCodes.get(pharmacyId)
  if (!affiliateCode) return `${config.baseUrl}/${productId}`
  const separator = config.baseUrl.includes('?') ? '&' : '?'
  return `${config.baseUrl}/${productId}${separator}${config.trackingParam}=${affiliateCode}`
}

export class PharmacyAPIClient {
  private apiKey: string
  private baseUrl: string
  private useMock: boolean
  private affiliateCodes: Map<string, string>

  constructor(config: { apiKey: string; baseUrl: string; useMock: boolean }) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl
    this.useMock = config.useMock
    this.affiliateCodes = new Map()
  }

  setAffiliateCode(pharmacyId: string, code: string): void {
    this.affiliateCodes.set(pharmacyId, code)
  }

  async searchProducts(query: string, options?: any): Promise<any> {
    if (this.useMock) return this.mockSearchProducts(query, options)
    try {
      const params = new URLSearchParams({ q: query })
      const res = await fetch(`${this.baseUrl}/products/search?${params}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockSearchProducts(query, options)
    }
  }

  async comparePrices(medicationName: string): Promise<any> {
    if (this.useMock) return this.mockComparePrices(medicationName)
    try {
      const res = await fetch(`${this.baseUrl}/products/compare?name=${encodeURIComponent(medicationName)}`, {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockComparePrices(medicationName)
    }
  }

  async placeOrder(orderRequest: any): Promise<any> {
    if (this.useMock) return this.mockPlaceOrder(orderRequest)
    try {
      const res = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(orderRequest),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockPlaceOrder(orderRequest)
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    if (this.useMock) return this.mockGetOrderStatus(orderId)
    try {
      const res = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockGetOrderStatus(orderId)
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<any> {
    if (this.useMock) return this.mockCancelOrder(orderId, reason)
    try {
      const res = await fetch(`${this.baseUrl}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockCancelOrder(orderId, reason)
    }
  }

  async getDeliveryEstimates(coordinates: any, deliveryType?: string): Promise<any> {
    if (this.useMock) return this.mockDeliveryEstimates(coordinates, deliveryType || 'home_delivery')
    try {
      const params = new URLSearchParams({
        lat: coordinates.latitude.toString(),
        lng: coordinates.longitude.toString(),
        deliveryType: deliveryType || 'home_delivery',
      })
      const res = await fetch(`${this.baseUrl}/delivery/estimates?${params}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockDeliveryEstimates(coordinates, deliveryType || 'home_delivery')
    }
  }

  async checkStockAvailability(items: any[]): Promise<any> {
    if (this.useMock) return this.mockCheckStockAvailability(items)
    try {
      const res = await fetch(`${this.baseUrl}/stock/check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockCheckStockAvailability(items)
    }
  }

  async getPopularMedications(limit?: number): Promise<any> {
    if (this.useMock) return this.mockGetPopularMedications(limit || 10)
    try {
      const res = await fetch(`${this.baseUrl}/products/popular?limit=${limit || 10}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockGetPopularMedications(limit || 10)
    }
  }

  async getMedicationsByCategory(category: string, limit?: number): Promise<any> {
    if (this.useMock) return this.mockGetMedicationsByCategory(category, limit || 20)
    try {
      const res = await fetch(`${this.baseUrl}/products/category/${category}?limit=${limit || 20}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      console.warn('[PharmacyAPI] API call failed, falling back to mock:', err)
      return this.mockGetMedicationsByCategory(category, limit || 20)
    }
  }

  private mockSearchProducts(query: string, options?: any): any {
    const {
      pharmacies = ['guadalajara', 'ahorro', 'similares', 'benavides', 'san_pablo', 'yza'],
      category, requiresPrescription, minPrice, maxPrice,
      inStockOnly = true, sortBy = 'relevance', sortOrder = 'asc',
      limit = 20, offset = 0, maxDeliveryTime,
    } = options || {}

    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    let filtered = MOCK_PRODUCTS.filter((product: any) => {
      if (!pharmacies.includes(product.pharmacyId)) return false
      const searchable = [product.name, product.genericName, product.description, product.brand]
        .filter(Boolean).join(' ').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (!searchable.includes(normalizedQuery)) return false
      if (category && product.category !== category) return false
      if (requiresPrescription !== undefined && product.requiresPrescription !== requiresPrescription) return false
      if (minPrice !== undefined && product.price.current < minPrice) return false
      if (maxPrice !== undefined && product.price.current > maxPrice) return false
      if (inStockOnly && !product.stock.available) return false
      if (maxDeliveryTime !== undefined && product.delivery.estimatedTime > maxDeliveryTime) return false
      return true
    })

    filtered.sort((a: any, b: any) => {
      let comparison = 0
      switch (sortBy) {
        case 'price':
          comparison = a.price.current - b.price.current
          break
        case 'delivery_time':
          comparison = a.delivery.estimatedTime - b.delivery.estimatedTime
          break
        case 'rating':
          comparison = (b.rating?.average || 0) - (a.rating?.average || 0)
          break
        case 'relevance':
        default:
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          const aExact = aName.includes(normalizedQuery)
          const bExact = bName.includes(normalizedQuery)
          if (aExact && !bExact) comparison = -1
          else if (!aExact && bExact) comparison = 1
          else comparison = 0
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)

    const productsWithLinks = paginated.map((p: any) => ({
      ...p,
      affiliateLink: generateAffiliateLink(p.pharmacyId, p.id, this.affiliateCodes),
    }))

    return {
      products: productsWithLinks,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      filters: options || {},
    }
  }

  private mockComparePrices(medicationName: string): any {
    const normalizedName = medicationName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const matches = MOCK_PRODUCTS.filter((product: any) => {
      const searchable = [product.name, product.genericName, product.genericName ? `${product.genericName} ${product.dosage || ''}` : '']
        .filter(Boolean).join(' ').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return searchable.includes(normalizedName)
    })

    if (matches.length === 0) {
      throw new Error(`Product ${medicationName} not found`)
    }

    const results = matches.map((product: any) => {
      const pharmacyName = MOCK_PHARMACY_DISPLAY_NAMES[product.pharmacyId] || product.pharmacyId
      let availability: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
      if (!product.stock.available) availability = 'out_of_stock'
      else if (product.stock.quantity < 10) availability = 'low_stock'

      return {
        pharmacyId: product.pharmacyId,
        pharmacyName,
        product,
        totalPrice: product.price.current + product.delivery.cost,
        deliveryTime: product.delivery.estimatedTime,
        availability,
      }
    })

    const prices = results.map((r: any) => r.totalPrice)
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)
    const averagePrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length

    const resultsWithSavings = results.map((result: any) => ({
      ...result,
      savings: highestPrice - result.totalPrice,
      savingsPercent: ((highestPrice - result.totalPrice) / highestPrice) * 100,
    }))

    const inStockResults = resultsWithSavings.filter((r: any) => r.availability !== 'out_of_stock')
    let bestDeal: any

    if (inStockResults.length > 0) {
      const scored = inStockResults.map((result: any) => {
        const priceScore = (lowestPrice / result.totalPrice) * 0.7
        const fastestTime = Math.min(...inStockResults.map((r: any) => r.deliveryTime))
        const timeScore = (fastestTime / result.deliveryTime) * 0.3
        return { ...result, score: priceScore + timeScore }
      })

      const best = scored.reduce((max: any, current: any) =>
        current.score > max.score ? current : max
      )

      bestDeal = {
        pharmacyId: best.pharmacyId,
        productId: best.product.id,
        reason: best.savings && best.savings > 0
          ? `Ahorra $${best.savings.toFixed(2)} (${best.savingsPercent?.toFixed(1)}%) con entrega en ${best.deliveryTime} min`
          : `Entrega más rápida en ${best.deliveryTime} minutos`,
      }
    }

    return {
      medicationName,
      results: resultsWithSavings,
      lowestPrice,
      highestPrice,
      averagePrice,
      bestDeal,
    }
  }

  private mockPlaceOrder(orderRequest: any): any {
    for (const item of orderRequest.items || []) {
      const product = MOCK_PRODUCTS.find((p: any) => p.id === item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }
      if (product.requiresPrescription && !item.prescriptionUrl && !orderRequest.prescriptionUrls?.length) {
        throw new Error(`Prescription required for ${product.name}`)
      }
    }

    if (orderRequest.deliveryType === 'home_delivery' && !orderRequest.deliveryAddress) {
      throw new Error('Delivery address required for home delivery')
    }

    if (orderRequest.deliveryType === 'pickup' && !orderRequest.pickupLocationId) {
      throw new Error('Pickup location required for pickup orders')
    }

    const orderId = generateOrderId()
    const now = new Date()
    const pharmacyId = orderRequest.items?.[0]?.pharmacyId
    const config = pharmacyId ? MOCK_DELIVERY_CONFIGS[pharmacyId] : null

    const subtotal = (orderRequest.items || []).reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0)
    const deliveryCost = config?.baseCost || 49
    const discount = orderRequest.couponCode ? subtotal * 0.1 : 0
    const tax = (subtotal - discount) * 0.16
    const total = subtotal + deliveryCost - discount + tax

    const order = {
      id: orderId,
      userId: orderRequest.userId,
      status: 'pending',
      items: orderRequest.items || [],
      pharmacyId,
      delivery: {
        type: orderRequest.deliveryType,
        address: orderRequest.deliveryAddress,
        estimatedTime: config?.baseDeliveryTime || 60,
        trackingNumber: orderRequest.deliveryType === 'home_delivery'
          ? `TRK-${Math.random().toString(36).substr(2, 10).toUpperCase()}`
          : undefined,
      },
      payment: {
        method: orderRequest.paymentMethod,
        status: 'pending',
        subtotal,
        deliveryCost,
        discount,
        tax,
        total,
      },
      timeline: [{
        status: 'pending',
        timestamp: now,
        description: 'Orden recibida y en proceso de confirmación',
      }],
      createdAt: now,
      updatedAt: now,
    }

    mockOrders.set(orderId, order)

    this.simulateOrderProgression(orderId)

    return order
  }

  private simulateOrderProgression(orderId: string): void {
    const stages: { status: string; delay: number; description: string }[] = [
      { status: 'confirmed', delay: 5000, description: 'Orden confirmada' },
      { status: 'preparing', delay: 15000, description: 'Preparando su pedido' },
      { status: 'out_for_delivery', delay: 30000, description: 'En camino' },
      { status: 'delivered', delay: 60000, description: 'Entregado' },
    ]

    let cumulativeDelay = 0
    stages.forEach(stage => {
      cumulativeDelay += stage.delay
      setTimeout(() => {
        const order = mockOrders.get(orderId)
        if (order) {
          order.status = stage.status
          order.timeline.push({
            status: stage.status,
            timestamp: new Date(),
            description: stage.description,
          })
          order.updatedAt = new Date()
          mockOrders.set(orderId, order)
        }
      }, cumulativeDelay)
    })
  }

  private mockGetOrderStatus(orderId: string): any {
    const order = mockOrders.get(orderId)
    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }
    return order
  }

  private mockCancelOrder(orderId: string, reason?: string): any {
    const order = mockOrders.get(orderId)
    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }
    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new Error(`Cannot cancel order with status: ${order.status}`)
    }

    order.status = 'cancelled'
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      description: reason || 'Orden cancelada por el usuario',
    })
    order.updatedAt = new Date()
    mockOrders.set(orderId, order)
    return order
  }

  private mockDeliveryEstimates(coordinates: any, deliveryType: string): any[] {
    return Object.entries(MOCK_DELIVERY_CONFIGS).map(([pharmacyId, config]) => {
      const pharmacyLocation = MOCK_PHARMACY_LOCATIONS[pharmacyId]
      const distance = calculateDistance(coordinates, pharmacyLocation)
      const withinCoverage = distance <= config.coverageRadiusKm

      if (!withinCoverage) {
        return {
          pharmacyId,
          deliveryType,
          estimatedMinutes: 0,
          cost: 0,
          available: false,
          message: `Fuera de zona de cobertura (${distance.toFixed(1)} km)`,
        }
      }

      const baseTime = deliveryType === 'express' && config.expressDelivery
        ? config.expressDeliveryTime
        : config.baseDeliveryTime
      const distanceTime = Math.round(distance * 2)
      const estimatedMinutes = baseTime + distanceTime

      const baseCost = deliveryType === 'express' && config.expressDelivery
        ? config.expressCost
        : config.baseCost

      return {
        pharmacyId,
        deliveryType,
        estimatedMinutes,
        cost: baseCost,
        available: true,
        message: `Entrega estimada en ${estimatedMinutes} minutos`,
      }
    })
  }

  private mockCheckStockAvailability(items: any[]): any[] {
    return items.map((item: any) => {
      const product = MOCK_PRODUCTS.find(
        (p: any) => p.id === item.productId && p.pharmacyId === item.pharmacyId
      )

      if (!product) {
        return {
          productId: item.productId,
          pharmacyId: item.pharmacyId,
          available: false,
          availableQuantity: 0,
        }
      }

      const availableQuantity = product.stock.available ? product.stock.quantity : 0
      const available = product.stock.available && availableQuantity >= (item.quantity || 1)

      return {
        productId: item.productId,
        pharmacyId: item.pharmacyId,
        available,
        availableQuantity,
        estimatedRestock: !product.stock.available
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : undefined,
      }
    })
  }

  private mockGetPopularMedications(limit: number): any[] {
    return MOCK_PRODUCTS
      .filter((p: any) => p.rating && p.rating.count > 50)
      .sort((a: any, b: any) => (b.rating?.count || 0) - (a.rating?.count || 0))
      .slice(0, limit)
      .map((p: any) => ({
        ...p,
        affiliateLink: generateAffiliateLink(p.pharmacyId, p.id, this.affiliateCodes),
      }))
  }

  private mockGetMedicationsByCategory(category: string, limit: number): any[] {
    return MOCK_PRODUCTS
      .filter((p: any) => p.category === category)
      .slice(0, limit)
      .map((p: any) => ({
        ...p,
        affiliateLink: generateAffiliateLink(p.pharmacyId, p.id, this.affiliateCodes),
      }))
  }
}
