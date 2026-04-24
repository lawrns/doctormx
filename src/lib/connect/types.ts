export type ConnectPracticeSource = 'directory' | 'google_places' | 'mock'

export type ConnectClaimStatus = 'unclaimed' | 'claim_pending' | 'claimed' | 'new'

export type ConnectSuggestedFieldStatus = 'suggested' | 'confirmed' | 'missing' | 'verified'

export type ConnectSuggestedFieldKey =
  | 'practiceName'
  | 'doctorName'
  | 'specialty'
  | 'address'
  | 'city'
  | 'state'
  | 'phone'
  | 'website'
  | 'hours'
  | 'services'
  | 'bio'
  | 'cedula'
  | 'photo'

export type ConnectPracticeSearchResult = {
  id: string
  source: ConnectPracticeSource
  name: string
  address: string | null
  city: string | null
  state: string | null
  lat: number | null
  lng: number | null
  rating: number | null
  reviewCount: number | null
  phone: string | null
  website: string | null
  claimStatus: ConnectClaimStatus
  directoryProfileId?: string | null
  placeId?: string | null
}

export type ConnectSuggestedField = {
  key: ConnectSuggestedFieldKey
  label: string
  value: string | null
  source: string
  confidence: number
  status: ConnectSuggestedFieldStatus
}

export type ConnectProfileDraft = {
  id: string
  practice: ConnectPracticeSearchResult
  fields: ConnectSuggestedField[]
  missingFields: string[]
  sourceLabels: string[]
  confidence: number
  requiresDoctorConfirmation: boolean
  generatedAt: string
  summary: string
}

export type ConnectSearchResponse = {
  results: ConnectPracticeSearchResult[]
  provider: 'directory_google' | 'directory_mock'
}
