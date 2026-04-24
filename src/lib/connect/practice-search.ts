import { createServiceClient } from '@/lib/supabase/server'
import type { ConnectClaimStatus, ConnectPracticeSearchResult, ConnectSearchResponse } from './types'
import { searchExternalPlaces } from './places-provider'

type UnclaimedProfileRecord = {
  id?: string
  full_name?: string | null
  name?: string | null
  practice_name?: string | null
  specialty?: string | null
  city?: string | null
  state?: string | null
  address?: string | null
  practice_address?: string | null
  latitude?: number | null
  longitude?: number | null
  lat?: number | null
  lng?: number | null
  phone?: string | null
  website?: string | null
  claim_status?: string | null
}

function sanitizeQuery(query: string): string {
  return query.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeClaimStatus(status: string | null | undefined): ConnectClaimStatus {
  if (status === 'claim_pending' || status === 'verification_required') return 'claim_pending'
  if (status === 'claimed') return 'claimed'
  return 'unclaimed'
}

export function normalizeUnclaimedProfile(profile: UnclaimedProfileRecord): ConnectPracticeSearchResult {
  const id = profile.id || `directory:${profile.full_name || profile.name || 'unknown'}`
  const name = profile.practice_name || profile.full_name || profile.name || 'Perfil médico sin nombre'

  return {
    id: `directory:${id}`,
    source: 'directory',
    name,
    address: profile.practice_address || profile.address || null,
    city: profile.city || null,
    state: profile.state || null,
    lat: profile.latitude ?? profile.lat ?? null,
    lng: profile.longitude ?? profile.lng ?? null,
    rating: null,
    reviewCount: null,
    phone: profile.phone || null,
    website: profile.website || null,
    claimStatus: normalizeClaimStatus(profile.claim_status),
    directoryProfileId: id,
  }
}

export async function searchExistingUnclaimedProfiles(query: string, limit = 4): Promise<ConnectPracticeSearchResult[]> {
  const sanitized = sanitizeQuery(query)
  if (sanitized.length < 2) {
    return []
  }

  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('unclaimed_doctor_profiles')
      .select('*')
      .or(`full_name.ilike.%${sanitized}%,specialty.ilike.%${sanitized}%,city.ilike.%${sanitized}%`)
      .limit(limit)

    if (error || !data) {
      return []
    }

    return (data as UnclaimedProfileRecord[]).map(normalizeUnclaimedProfile)
  } catch {
    return []
  }
}

function resultKey(result: ConnectPracticeSearchResult): string {
  return `${result.name}-${result.address || result.city || ''}`.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function dedupePracticeResults(results: ConnectPracticeSearchResult[], limit = 8): ConnectPracticeSearchResult[] {
  const seen = new Set<string>()
  const unique: ConnectPracticeSearchResult[] = []

  for (const result of results) {
    const key = resultKey(result)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(result)
    if (unique.length >= limit) break
  }

  return unique
}

export async function searchConnectPractices(query: string, limit = 8): Promise<ConnectSearchResponse> {
  const sanitized = sanitizeQuery(query)
  if (sanitized.length < 2) {
    return {
      results: [],
      provider: process.env.GOOGLE_MAPS_API_KEY ? 'directory_google' : 'directory_mock',
    }
  }

  const [directory, external] = await Promise.all([
    searchExistingUnclaimedProfiles(sanitized, 4),
    searchExternalPlaces(sanitized, 6),
  ])

  return {
    results: dedupePracticeResults([...directory, ...external.results], limit),
    provider: external.provider === 'google' ? 'directory_google' : 'directory_mock',
  }
}
