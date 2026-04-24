import type {
  ConnectPracticeSearchResult,
  ConnectProfileDraft,
  ConnectSuggestedField,
  ConnectSuggestedFieldKey,
} from './types'

type BraveSearchResult = {
  title?: string
  description?: string
  url?: string
}

type BraveSearchResponse = {
  web?: {
    results?: BraveSearchResult[]
  }
}

type AiDraftResponse = {
  summary?: string
  specialty?: string
  services?: string
  bio?: string
}

const SPECIALTY_HINTS = [
  { match: ['derma', 'piel', 'acne', 'acné'], value: 'Dermatología' },
  { match: ['gine', 'obstetric'], value: 'Ginecología' },
  { match: ['cardio', 'corazón', 'corazon'], value: 'Cardiología' },
  { match: ['pedi', 'niño', 'niña'], value: 'Pediatría' },
  { match: ['psico', 'mental'], value: 'Psicología' },
  { match: ['nutri'], value: 'Nutrición' },
  { match: ['trauma', 'ortop'], value: 'Ortopedia' },
  { match: ['general', 'medicina'], value: 'Medicina General' },
]

function hashString(input: string): number {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function inferSpecialty(text: string): string | null {
  const lower = text.toLowerCase()
  return SPECIALTY_HINTS.find((hint) => hint.match.some((part) => lower.includes(part)))?.value || null
}

function suggestedField(
  key: ConnectSuggestedFieldKey,
  label: string,
  value: string | null,
  source: string,
  confidence: number
): ConnectSuggestedField {
  return {
    key,
    label,
    value,
    source,
    confidence,
    status: value ? 'suggested' : 'missing',
  }
}

function sourceLabelsFor(practice: ConnectPracticeSearchResult, braveSnippets: string[]): string[] {
  const labels = new Set<string>()
  if (practice.source === 'directory') labels.add('Doctor.mx directory')
  if (practice.source === 'google_places') labels.add('Google Places')
  if (practice.source === 'mock') labels.add('Demo fallback')
  if (braveSnippets.length > 0) labels.add('Brave Search')
  labels.add('Doctor confirmation required')
  return Array.from(labels)
}

export async function fetchBraveSearchSnippets(practice: ConnectPracticeSearchResult): Promise<string[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) {
    return []
  }

  const query = [practice.name, practice.city, practice.state, 'médico México'].filter(Boolean).join(' ')
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', query)
  url.searchParams.set('country', 'MX')
  url.searchParams.set('search_lang', 'es')
  url.searchParams.set('count', '4')

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
      next: { revalidate: 60 * 60 * 12 },
    })

    if (!response.ok) {
      return []
    }

    const payload = (await response.json()) as BraveSearchResponse
    return (payload.web?.results || [])
      .slice(0, 4)
      .map((result) => [result.title, result.description, result.url].filter(Boolean).join(' - '))
      .filter(Boolean)
  } catch {
    return []
  }
}

export function buildFallbackProfileDraft(
  practice: ConnectPracticeSearchResult,
  braveSnippets: string[] = []
): ConnectProfileDraft {
  const evidenceText = [practice.name, practice.address, practice.website, ...braveSnippets].filter(Boolean).join(' ')
  const specialty = inferSpecialty(evidenceText)
  const doctorName = /^dr\.?|^dra\.?/i.test(practice.name.trim()) ? practice.name : null
  const services = specialty
    ? `Consulta de ${specialty.toLowerCase()}, valoración inicial y seguimiento clínico según confirmación del médico.`
    : null
  const bio = specialty
    ? `${practice.name} atiende pacientes de ${specialty.toLowerCase()} en ${practice.city || 'México'}. Este texto es una sugerencia inicial y debe ser revisado por el médico antes de publicarse.`
    : null

  const fields: ConnectSuggestedField[] = [
    suggestedField('practiceName', 'Nombre de práctica', practice.name, practice.source === 'directory' ? 'Doctor.mx directory' : 'Resultado de búsqueda', 0.84),
    suggestedField('doctorName', 'Nombre del médico', doctorName, 'Inferencia de nombre visible', doctorName ? 0.62 : 0),
    suggestedField('specialty', 'Especialidad', specialty, braveSnippets.length > 0 ? 'Brave Search + heurística' : 'Heurística local', specialty ? 0.58 : 0),
    suggestedField('address', 'Dirección', practice.address, practice.source === 'google_places' ? 'Google Places' : 'Resultado de búsqueda', practice.address ? 0.76 : 0),
    suggestedField('city', 'Ciudad', practice.city, 'Resultado de búsqueda', practice.city ? 0.72 : 0),
    suggestedField('state', 'Estado', practice.state, 'Resultado de búsqueda', practice.state ? 0.72 : 0),
    suggestedField('phone', 'Teléfono', practice.phone, 'Resultado de búsqueda', practice.phone ? 0.64 : 0),
    suggestedField('website', 'Sitio web', practice.website, 'Resultado de búsqueda', practice.website ? 0.64 : 0),
    suggestedField('hours', 'Horarios', null, 'Debe confirmarlo el médico', 0),
    suggestedField('services', 'Servicios sugeridos', services, 'IA asistiva', services ? 0.52 : 0),
    suggestedField('bio', 'Biografía sugerida', bio, 'IA asistiva', bio ? 0.52 : 0),
    suggestedField('cedula', 'Cédula profesional', null, 'SEP / médico', 0),
    suggestedField('photo', 'Foto profesional', null, 'Debe subirla el médico', 0),
  ]

  const missingFields = fields
    .filter((field) => field.status === 'missing')
    .map((field) => field.label)

  return {
    id: `draft:${hashString(`${practice.id}-${practice.name}-${Date.now()}`)}`,
    practice,
    fields,
    missingFields,
    sourceLabels: sourceLabelsFor(practice, braveSnippets),
    confidence: fields.reduce((total, field) => total + field.confidence, 0) / fields.length,
    requiresDoctorConfirmation: true,
    generatedAt: new Date().toISOString(),
    summary: `Borrador preparado con ${braveSnippets.length > 0 ? 'búsqueda pública y reglas clínicas de perfil' : 'datos disponibles del resultado seleccionado'}. Nada se publica como verificado sin confirmación del médico.`,
  }
}

function mergeAiDraft(base: ConnectProfileDraft, aiDraft: AiDraftResponse): ConnectProfileDraft {
  const fields = base.fields.map((field) => {
    if (field.key === 'specialty' && aiDraft.specialty) {
      return { ...field, value: aiDraft.specialty, confidence: Math.max(field.confidence, 0.68), status: 'suggested' as const, source: 'IA + fuentes públicas' }
    }
    if (field.key === 'services' && aiDraft.services) {
      return { ...field, value: aiDraft.services, confidence: Math.max(field.confidence, 0.62), status: 'suggested' as const, source: 'IA + fuentes públicas' }
    }
    if (field.key === 'bio' && aiDraft.bio) {
      return { ...field, value: aiDraft.bio, confidence: Math.max(field.confidence, 0.62), status: 'suggested' as const, source: 'IA + fuentes públicas' }
    }
    if (field.key === 'cedula') {
      return { ...field, status: 'missing' as const, value: null, confidence: 0, source: 'SEP / médico' }
    }
    return field
  })

  return {
    ...base,
    fields,
    missingFields: fields.filter((field) => field.status === 'missing').map((field) => field.label),
    sourceLabels: Array.from(new Set([...base.sourceLabels, 'IA Doctor.mx'])),
    confidence: Math.min(0.74, fields.reduce((total, field) => total + field.confidence, 0) / fields.length),
    summary: aiDraft.summary || base.summary,
    requiresDoctorConfirmation: true,
  }
}

function hasConfiguredAiProvider(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.OLLAMA_PROXY_URL)
}

export async function enrichPracticeProfile(practice: ConnectPracticeSearchResult): Promise<ConnectProfileDraft> {
  const braveSnippets = await fetchBraveSearchSnippets(practice)
  const fallback = buildFallbackProfileDraft(practice, braveSnippets)

  if (!hasConfiguredAiProvider()) {
    return fallback
  }

  try {
    const { aiChatCompletion } = await import('@/lib/ai/openai')
    const response = await aiChatCompletion({
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 700,
      system: [
        'Eres un asistente de perfil médico para Doctor.mx.',
        'Devuelve JSON estricto con summary, specialty, services y bio.',
        'No marques cédula, certificaciones, especialidad oficial ni credenciales como verificadas.',
        'Todo texto debe quedar como sugerencia pendiente de confirmación médica.',
      ].join(' '),
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            practice,
            publicSnippets: braveSnippets,
            requiredPolicy: 'suggestions_only_no_verified_credentials',
          }),
        },
      ],
    })

    const parsed = JSON.parse(response.content || '{}') as AiDraftResponse
    return mergeAiDraft(fallback, parsed)
  } catch {
    return fallback
  }
}
