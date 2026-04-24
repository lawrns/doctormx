import { describe, expect, it } from 'vitest'
import { buildFallbackProfileDraft } from '../enrichment'
import { normalizeUnclaimedProfile, dedupePracticeResults } from '../practice-search'
import { searchMockPlaces } from '../places-provider'

describe('connect practice search normalization', () => {
  it('normalizes an unclaimed Doctor.mx profile into the connect result shape', () => {
    const result = normalizeUnclaimedProfile({
      id: 'profile-1',
      full_name: 'Dra. Ana López',
      specialty: 'Dermatología',
      city: 'CDMX',
      state: 'CDMX',
      address: 'Av. Homero 407, Polanco',
      claim_status: 'unclaimed',
    })

    expect(result).toMatchObject({
      id: 'directory:profile-1',
      source: 'directory',
      name: 'Dra. Ana López',
      address: 'Av. Homero 407, Polanco',
      city: 'CDMX',
      state: 'CDMX',
      claimStatus: 'unclaimed',
      directoryProfileId: 'profile-1',
    })
  })

  it('normalizes deterministic fallback practices without claiming live data', () => {
    const [result] = searchMockPlaces('Dermatología Polanco')

    expect(result).toMatchObject({
      source: 'mock',
      claimStatus: 'new',
    })
    expect(result.name).toContain('Dermatología Polanco')
    expect(result.lat).toEqual(expect.any(Number))
    expect(result.lng).toEqual(expect.any(Number))
  })

  it('deduplicates by name and address while preserving source priority', () => {
    const first = searchMockPlaces('Dra. Ana López')[0]
    const duplicate = { ...first, id: 'mock:duplicate' }

    expect(dedupePracticeResults([first, duplicate])).toHaveLength(1)
  })
})

describe('connect enrichment rules', () => {
  it('keeps credentials unverified and marks missing required fields', () => {
    const [practice] = searchMockPlaces('Dermatología Polanco')
    const draft = buildFallbackProfileDraft(practice)
    const cedula = draft.fields.find((field) => field.key === 'cedula')

    expect(draft.requiresDoctorConfirmation).toBe(true)
    expect(cedula).toMatchObject({
      status: 'missing',
      value: null,
      source: 'SEP / médico',
    })
    expect(draft.missingFields).toContain('Cédula profesional')
    expect(draft.fields.some((field) => field.status === 'verified')).toBe(false)
  })
})
