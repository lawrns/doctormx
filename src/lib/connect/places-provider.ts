import type { ConnectPracticeSearchResult } from './types'

type GooglePlaceResult = {
  place_id?: string
  name?: string
  formatted_address?: string
  geometry?: {
    location?: {
      lat?: number
      lng?: number
    }
  }
  rating?: number
  user_ratings_total?: number
}

type GoogleTextSearchResponse = {
  status: string
  error_message?: string
  results?: GooglePlaceResult[]
}

const MEXICO_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'CDMX',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'México',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
]

function hashString(input: string): number {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function titleCase(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function cleanQueryName(query: string): string {
  const cleaned = query
    .replace(/\b(doctor|doctora|dr|dra|medico|médico|consultorio|clinica|clínica)\b/gi, '')
    .replace(/[^\p{L}\p{N}\s.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned ? titleCase(cleaned) : 'Consultorio Médico'
}

export function parseMexicoAddress(address: string | null | undefined): { city: string | null; state: string | null } {
  if (!address) {
    return { city: null, state: null }
  }

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)
  const state = MEXICO_STATES.find((candidate) =>
    parts.some((part) => part.toLowerCase().includes(candidate.toLowerCase()))
  ) || null

  const cityCandidate = parts.find((part) => {
    const lower = part.toLowerCase()
    return lower !== 'méxico' && lower !== 'mexico' && !MEXICO_STATES.some((stateName) => lower.includes(stateName.toLowerCase()))
  })

  return {
    city: cityCandidate || state || null,
    state,
  }
}

export function normalizeGooglePlace(place: GooglePlaceResult): ConnectPracticeSearchResult {
  const address = place.formatted_address || null
  const parsed = parseMexicoAddress(address)
  const placeId = place.place_id || `google-${hashString(`${place.name || ''}-${address || ''}`)}`

  return {
    id: `google:${placeId}`,
    source: 'google_places',
    name: place.name || 'Consultorio médico',
    address,
    city: parsed.city,
    state: parsed.state,
    lat: place.geometry?.location?.lat ?? null,
    lng: place.geometry?.location?.lng ?? null,
    rating: typeof place.rating === 'number' ? place.rating : null,
    reviewCount: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : null,
    phone: null,
    website: null,
    claimStatus: 'new',
    placeId,
  }
}

export async function searchGooglePlaces(query: string, limit = 5): Promise<ConnectPracticeSearchResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey || query.trim().length < 2) {
    return []
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', `${query} médico consultorio México`)
  url.searchParams.set('language', 'es')
  url.searchParams.set('region', 'mx')
  url.searchParams.set('key', apiKey)

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as GoogleTextSearchResponse
    if (!['OK', 'ZERO_RESULTS'].includes(payload.status)) {
      return []
    }

    return (payload.results || []).slice(0, limit).map(normalizeGooglePlace)
  } catch {
    return []
  }
}

export function searchMockPlaces(query: string, limit = 5): ConnectPracticeSearchResult[] {
  const seed = hashString(query.toLowerCase())
  const name = cleanQueryName(query)
  const districts = [
    { city: 'CDMX', state: 'CDMX', address: 'Av. Homero 407, Polanco, CDMX', lat: 19.435, lng: -99.195 },
    { city: 'Guadalajara', state: 'Jalisco', address: 'Av. México 2798, Terranova, Guadalajara, Jal.', lat: 20.686, lng: -103.389 },
    { city: 'Monterrey', state: 'Nuevo León', address: 'Río Orinoco 210, Del Valle, San Pedro Garza García, N.L.', lat: 25.651, lng: -100.362 },
    { city: 'Mérida', state: 'Yucatán', address: 'Calle 20 101, Altabrisa, Mérida, Yuc.', lat: 21.02, lng: -89.586 },
    { city: 'Querétaro', state: 'Querétaro', address: 'Blvd. Bernardo Quintana 4060, Querétaro, Qro.', lat: 20.619, lng: -100.392 },
  ]

  return districts.slice(0, limit).map((district, index) => {
    const variant = (seed + index * 7) % 3
    const displayName = variant === 0
      ? `Consultorio ${name}`
      : variant === 1
        ? `Clínica ${name}`
        : `${name} Medicina Especializada`

    return {
      id: `mock:${hashString(`${query}-${district.city}-${index}`)}`,
      source: 'mock',
      name: displayName,
      address: district.address,
      city: district.city,
      state: district.state,
      lat: district.lat + ((seed % 20) - 10) / 1000,
      lng: district.lng + (((seed + index) % 20) - 10) / 1000,
      rating: Number((4.5 + ((seed + index) % 5) / 10).toFixed(1)),
      reviewCount: 24 + ((seed + index * 11) % 190),
      phone: null,
      website: null,
      claimStatus: 'new',
    }
  })
}

export async function searchExternalPlaces(query: string, limit = 5): Promise<{
  provider: 'google' | 'mock'
  results: ConnectPracticeSearchResult[]
}> {
  const googleResults = await searchGooglePlaces(query, limit)
  if (googleResults.length > 0) {
    return { provider: 'google', results: googleResults }
  }

  return { provider: 'mock', results: searchMockPlaces(query, limit) }
}
