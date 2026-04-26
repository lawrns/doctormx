import { createServiceClient, createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { searchProducts as integrationSearch } from '@/services/pharmacy-integration'

export interface PharmacyProduct {
  id: string
  name: string
  brand: string
  price_cents: number
  pharmacy: string
  pharmacy_logo: string
  in_stock: boolean
  requires_prescription: boolean
  affiliate_url: string
}

export interface PharmacySearchResult {
  products: PharmacyProduct[]
  pharmacies: { name: string; logo: string; delivery_available: boolean }[]
  total_results: number
}

const PHARMACY_KEY_MAP: Record<string, string> = {
  guadalajara: 'farmacias-guadalajara',
  ahorro: 'farmacias-del-ahorro',
  similares: 'farmacias-similares',
  benavides: 'farmacias-benavides',
  san_pablo: 'farmacias-san-pablo',
  yza: 'farmacias-yza',
}

const PHARMACY_LOGOS: Record<string, string> = {
  'farmacias-guadalajara': 'https://www.farmaciasguadalajara.com/logo.png',
  'farmacias-del-ahorro': 'https://www.farmaciasdelahorro.com/logo.png',
  'farmacias-similares': 'https://www.farmaciasdesimilares.com/logo.png',
  'farmacias-benavides': 'https://www.benavides.com.mx/logo.png',
  'farmacias-san-pablo': 'https://www.farmaciasanpablo.com.mx/logo.png',
  'farmacias-yza': 'https://www.yza.mx/logo.png',
}

const PHARMACY_DISPLAY_NAMES: Record<string, string> = {
  'farmacias-guadalajara': 'Farmacias Guadalajara',
  'farmacias-del-ahorro': 'Farmacias del Ahorro',
  'farmacias-similares': 'Farmacias Similares',
  'farmacias-benavides': 'Farmacias Benavides',
  'farmacias-san-pablo': 'Farmacias San Pablo',
  'farmacias-yza': 'Farmacias Yza',
}

const AFFILIATE_BASE_URLS: Record<string, string> = {
  'farmacias-guadalajara': 'https://www.farmaciasguadalajara.com/producto',
  'farmacias-del-ahorro': 'https://www.farmaciasdelahorro.com/productos',
  'farmacias-similares': 'https://www.farmaciasdesimilares.com/producto',
  'farmacias-benavides': 'https://www.benavides.com.mx/producto',
  'farmacias-san-pablo': 'https://www.farmaciasanpablo.com.mx/productos',
  'farmacias-yza': 'https://www.yza.mx/producto',
}

const AFFILIATE_TRACKING_PARAMS: Record<string, string> = {
  'farmacias-guadalajara': 'affiliate_id',
  'farmacias-del-ahorro': 'ref',
  'farmacias-similares': 'afiliado',
  'farmacias-benavides': 'partner',
  'farmacias-san-pablo': 'aff',
  'farmacias-yza': 'ref',
}

const DOCTORY_AFFILIATE_ID = 'doctory-mx'

function generateAffiliateUrl(productId: string, pharmacyKey: string): string {
  const baseUrl = AFFILIATE_BASE_URLS[pharmacyKey]
  const trackingParam = AFFILIATE_TRACKING_PARAMS[pharmacyKey]
  if (!baseUrl || !trackingParam) return '#'
  return `${baseUrl}/${productId}?${trackingParam}=${DOCTORY_AFFILIATE_ID}&utm_source=doctory&utm_medium=telemedicine&utm_campaign=pharmacy_referral`
}

const MOCK_PRODUCTS: Omit<PharmacyProduct, 'affiliate_url'>[] = [
  { id: 'GUA-PAR-001', name: 'Paracetamol 500mg', brand: 'Tylenol', price_cents: 4550, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: false },
  { id: 'AHO-PAR-001', name: 'Paracetamol 500mg', brand: 'Tylenol', price_cents: 4390, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: false },
  { id: 'SIM-PAR-001', name: 'Paracetamol 500mg Genérico', brand: 'Similares', price_cents: 2800, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: false },
  { id: 'GUA-AMX-001', name: 'Amoxicilina 500mg', brand: 'Amoxil', price_cents: 12500, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: true },
  { id: 'AHO-AMX-001', name: 'Amoxicilina 500mg', brand: 'Genérico', price_cents: 8950, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: true },
  { id: 'SIM-AMX-001', name: 'Amoxicilina 500mg', brand: 'Genérico', price_cents: 4900, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: true },
  { id: 'GUA-IBU-001', name: 'Ibuprofeno 400mg', brand: 'Advil', price_cents: 6500, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: false },
  { id: 'AHO-IBU-001', name: 'Ibuprofeno 400mg', brand: 'Advil', price_cents: 5900, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: false },
  { id: 'SIM-IBU-001', name: 'Ibuprofeno 400mg', brand: 'Genérico', price_cents: 3900, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: false },
  { id: 'GUA-LOS-001', name: 'Losartán Potásico 50mg', brand: 'Cozaar', price_cents: 24500, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: true },
  { id: 'AHO-LOS-001', name: 'Losartán Potásico 50mg', brand: 'Genérico', price_cents: 16900, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: true },
  { id: 'SIM-LOS-001', name: 'Losartán Potásico 50mg', brand: 'Genérico', price_cents: 10900, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: true },
  { id: 'GUA-MET-001', name: 'Metformina 850mg', brand: 'Glucophage', price_cents: 15600, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: true },
  { id: 'AHO-MET-001', name: 'Metformina 850mg', brand: 'Genérico', price_cents: 12900, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: true },
  { id: 'SIM-MET-001', name: 'Metformina 850mg', brand: 'Similares', price_cents: 7900, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: true },
  { id: 'GUA-OME-001', name: 'Omeprazol 20mg', brand: 'Losec', price_cents: 17800, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: true },
  { id: 'AHO-OME-001', name: 'Omeprazol 20mg', brand: 'Genérico', price_cents: 11500, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: true },
  { id: 'SIM-OME-001', name: 'Omeprazol 20mg', brand: 'Genérico', price_cents: 7500, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: true },
  { id: 'GUA-LOR-001', name: 'Loratadina 10mg', brand: 'Claritin', price_cents: 9500, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: false },
  { id: 'AHO-LOR-001', name: 'Loratadina 10mg', brand: 'Genérico', price_cents: 6500, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: false },
  { id: 'SIM-LOR-001', name: 'Loratadina 10mg', brand: 'Genérico', price_cents: 3500, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: false },
  { id: 'GUA-ATO-001', name: 'Atorvastatina 20mg', brand: 'Lipitor', price_cents: 34500, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: true },
  { id: 'AHO-ATO-001', name: 'Atorvastatina 20mg', brand: 'Genérico', price_cents: 26500, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: true },
  { id: 'SIM-ATO-001', name: 'Atorvastatina 20mg', brand: 'Genérico', price_cents: 17900, pharmacy: 'farmacias-similares', pharmacy_logo: PHARMACY_LOGOS['farmacias-similares'], in_stock: true, requires_prescription: true },
  { id: 'GUA-DIC-001', name: 'Diclofenaco 50mg', brand: 'Voltaren', price_cents: 9500, pharmacy: 'farmacias-guadalajara', pharmacy_logo: PHARMACY_LOGOS['farmacias-guadalajara'], in_stock: true, requires_prescription: false },
  { id: 'AHO-DIC-001', name: 'Diclofenaco 50mg', brand: 'Genérico', price_cents: 5900, pharmacy: 'farmacias-del-ahorro', pharmacy_logo: PHARMACY_LOGOS['farmacias-del-ahorro'], in_stock: true, requires_prescription: false },
  { id: 'BEN-PAR-001', name: 'Paracetamol 500mg', brand: 'Tylenol', price_cents: 4700, pharmacy: 'farmacias-benavides', pharmacy_logo: PHARMACY_LOGOS['farmacias-benavides'], in_stock: true, requires_prescription: false },
  { id: 'SP-PAR-001', name: 'Paracetamol 500mg', brand: 'Genérico', price_cents: 4200, pharmacy: 'farmacias-san-pablo', pharmacy_logo: PHARMACY_LOGOS['farmacias-san-pablo'], in_stock: true, requires_prescription: false },
  { id: 'YZA-PAR-001', name: 'Paracetamol 500mg', brand: 'Genérico', price_cents: 4100, pharmacy: 'farmacias-yza', pharmacy_logo: PHARMACY_LOGOS['farmacias-yza'], in_stock: true, requires_prescription: false },
]

export async function searchPharmacyProducts(
  query: string,
  options?: { location?: string; max_price?: number }
): Promise<PharmacySearchResult> {
  try {
    const integrationResult = await integrationSearch(query, {
      maxPrice: options?.max_price,
    })

    const products: PharmacyProduct[] = integrationResult.products.map(p => {
      const pharmacyKey = PHARMACY_KEY_MAP[p.pharmacyId] || p.pharmacyId
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price_cents: Math.round(p.price.current * 100),
        pharmacy: pharmacyKey,
        pharmacy_logo: PHARMACY_LOGOS[pharmacyKey] || '',
        in_stock: p.stock.available,
        requires_prescription: p.requiresPrescription,
        affiliate_url: p.affiliateLink || generateAffiliateUrl(p.id, pharmacyKey),
      }
    })

    const uniquePharmacies = new Map<string, { name: string; logo: string; delivery_available: boolean }>()
    for (const p of integrationResult.products) {
      const key = PHARMACY_KEY_MAP[p.pharmacyId] || p.pharmacyId
      if (!uniquePharmacies.has(key)) {
        uniquePharmacies.set(key, {
          name: PHARMACY_DISPLAY_NAMES[key] || key,
          logo: PHARMACY_LOGOS[key] || '',
          delivery_available: p.delivery.available,
        })
      }
    }

    return {
      products,
      pharmacies: Array.from(uniquePharmacies.values()),
      total_results: integrationResult.total,
    }
  } catch {
    const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    let filtered = MOCK_PRODUCTS.filter((p) => {
      const searchable = [p.name, p.brand]
        .filter(Boolean).join(' ').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (!searchable.includes(normalized)) return false
      if (options?.max_price !== undefined && p.price_cents > options.max_price) return false
      return true
    })

    const products = filtered.map((p) => ({
      ...p,
      affiliate_url: generateAffiliateUrl(p.id, p.pharmacy),
    }))

    const uniquePharmacies = new Map<string, { name: string; logo: string; delivery_available: boolean }>()
    for (const p of products) {
      if (!uniquePharmacies.has(p.pharmacy)) {
        uniquePharmacies.set(p.pharmacy, {
          name: PHARMACY_DISPLAY_NAMES[p.pharmacy] || p.pharmacy,
          logo: p.pharmacy_logo,
          delivery_available: true,
        })
      }
    }

    return {
      products,
      pharmacies: Array.from(uniquePharmacies.values()),
      total_results: products.length,
    }
  }
}

export async function getProductById(productId: string): Promise<PharmacyProduct | null> {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId)
  if (!product) return null
  return { ...product, affiliate_url: generateAffiliateUrl(product.id, product.pharmacy) }
}

export async function trackPharmacyClick(
  productId: string,
  pharmacy: string,
  patientId?: string,
  prescriptionId?: string
): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('pharmacy_clicks').insert({
      product_id: productId,
      pharmacy,
      patient_id: patientId || null,
      prescription_id: prescriptionId || null,
    })
  } catch (error) {
    logger.warn('Failed to track pharmacy click', { error })
  }
}
