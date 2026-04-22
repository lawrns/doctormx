type SafetyMatch = {
  category: string
  pattern: RegExp
}

export type HardSafetyResult = {
  triggered: boolean
  category?: string
  urgency: 'emergency' | 'standard'
  response?: string
}

const EMERGENCY_RESPONSE =
  'Por seguridad, esto puede requerir atención médica inmediata. No esperes una respuesta por chat: llama al 911 o acude a urgencias ahora. Doctor.mx no reemplaza servicios de emergencia.'

const HARD_SAFETY_PATTERNS: SafetyMatch[] = [
  { category: 'chest_pain', pattern: /\b(dolor|presi[oó]n|opresi[oó]n)\s+(fuerte|intenso|severo|en\s+el|del)?\s*(pecho|t[oó]rax)\b/i },
  { category: 'breathing', pattern: /\b(no puedo respirar|dificultad para respirar|me falta el aire|falta de aire severa|labios azules)\b/i },
  { category: 'suicidal_ideation', pattern: /\b(suicid|me quiero morir|quiero morir|hacerme da[nñ]o|quitarme la vida|kill myself|suicide)\b/i },
  { category: 'stroke_neuro', pattern: /\b(par[aá]lisis|cara caída|debilidad en (un )?brazo|no puedo hablar|p[eé]rdida del habla|confusi[oó]n repentina|derrame cerebral|stroke)\b/i },
  { category: 'seizure', pattern: /\b(convulsi[oó]n|convulsiones|ataque epil[eé]ptico|seizure)\b/i },
  { category: 'bleeding', pattern: /\b(sangrado abundante|sangra mucho|hemorragia|no deja de sangrar)\b/i },
  { category: 'loss_of_consciousness', pattern: /\b(p[eé]rdida de conciencia|se desmay[oó]|inconsciente|no despierta|fainted)\b/i },
  { category: 'pregnancy_emergency', pattern: /\b(embarazad[ao]).*\b(dolor severo|sangrado|convulsi[oó]n|no siento al beb[eé])\b/i },
]

function normalizeInput(input: string | Array<{ content?: string }>) {
  if (typeof input === 'string') return input
  return input.map((message) => message.content || '').join('\n')
}

export function evaluateHardSafety(input: string | Array<{ content?: string }>): HardSafetyResult {
  const text = normalizeInput(input)
  const match = HARD_SAFETY_PATTERNS.find((entry) => entry.pattern.test(text))

  if (!match) {
    return { triggered: false, urgency: 'standard' }
  }

  return {
    triggered: true,
    category: match.category,
    urgency: 'emergency',
    response: EMERGENCY_RESPONSE,
  }
}

export function buildEmergencyTriageSummary(category?: string) {
  return {
    urgency: 'emergency',
    specialty: 'urgencias',
    confidence: 1,
    redFlags: [category || 'hard_safety_trigger'],
    recommendedAction: 'seek-emergency',
    reasoning: 'Regla determinística de seguridad activada antes del modelo.',
  }
}
