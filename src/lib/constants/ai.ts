/**
 * AI-related constants for Doctor.mx
 * Settings, emergency symptoms, and thresholds
 */

export const AI = {
  // Temperature settings
  TEMPERATURE_DEFAULT: 0.3,
  TEMPERATURE_DETERMINISTIC: 0.2, // For structured analysis

  // Max tokens
  MAX_TOKENS_DEFAULT: 500,

  // Feature flags
  PRECONSULTA_ENABLED: true,
  TRANSCRIPTION_ENABLED: true,
  FOLLOWUP_ENABLED: true,
  PRESCRIPTION_ASSIST_ENABLED: false,
  SMART_MATCHING_ENABLED: false,
  USE_GLM_PRIMARY: true,

  // Provider priority
  PRIMARY_PROVIDER: 'glm' as const,
  FALLBACK_PROVIDER: 'openai' as const,

  // Cost tracking (per 1M tokens)
  COSTS: {
    // GLM pricing
    GLM_INPUT_PER_1M: 0.60,
    GLM_OUTPUT_PER_1M: 2.20,
    GLM_CACHED_PER_1M: 0.11,
    // OpenAI pricing (fallback)
    GPT4O_MINI_INPUT_PER_1M: 0.15,
    GPT4O_MINI_OUTPUT_PER_1M: 0.60,
    // Whisper
    WHISPER_PER_MINUTE: 0.006,
  },

  // Model names
  MODELS: {
    GLM: {
      REASONING: 'glm-4.7',
      CHAT: 'glm-4.5-air',
      VISION: 'glm-4.6v',
      DEFAULT: 'glm-4.5-air',
    },
    OPENAI: {
      CHAT: 'gpt-4o-mini',
      WHISPER: 'whisper-1',
    },
  },

  // Emergency symptoms requiring immediate 911
  EMERGENCY_SYMPTOMS: {
    STROKE_PATTERNS: [
      /paralisis|debilidad.*extremo|cara.*colgada|cara.*caida|brazo.*no.*puede.*levantar|cara.*torcida|slurred.*speech|cant.*speak|speech.*difficulty|face.*drooping|arm.*weakness/i,
      /dificultad.*hablar|no.*puede.*hablar|palabras.*enredadas|lengua.*trabada|slurred.*speech|cant.*speak|speech.*difficulty|words.*jumbled|trouble.*speaking/i,
    ],
    CARDIAC_PATTERNS: [
      /dolor.*pecho.*opresivo|dolor.*pecho.*brazo|angina|siento.*que.*me.*muero|dolor.*pecho.*mandibula|chest.*pain|pressure.*chest|squeezing.*chest|crushing.*chest|heart.*attack|pain.*radiate.*arm/i,
      /dolor.*pecho|dolor.*toracico|chest.*pain|tightness.*chest|discomfort.*chest/i,
    ],
    RESPIRATORY_SEVERE_PATTERNS: [
      /no.*puedo.*respirar|ahogo.*severo|labios.*azules|cara.*azul|cianosis|difficulty.*breathing|cant.*breathe|trouble.*breathing|shortness.*breath|not.*able.*breathe|wheezing.*severe|blue.*lips|cyanosis/i,
    ],
    NEUROLOGICAL_CRITICAL_PATTERNS: [
      /convulsiones|ataques|espasmos.*incontrolables|temblores.*violentos/i,
      /dolor.*cabeza.*peor.*vida|cefalea.*thunderclap|dolor.*cabeza.*explosivo|dolor.*cabeza.*intenso.*subito|sudden.*severe.*headache|worst.*headache.*life|thunderclap.*headache|explosive.*headache|sudden.*intense.*headache/i,
      /cuello.*rigido.*fiebre|rigidez.*nuca.*fiebre|meningitis/i,
      /perdida.*conciencia|inconsciente|desmayo|desmayarse|faint|unconscious|passed.*out|knocked.*out|lose.*consciousness|blackout/i,
    ],
    PSYCHIATRIC_PATTERNS: [
      /pensamientos.*suicidio|quiere.*morir|quitarme.*vida|plan.*suicida|autolesion.*grave/i,
    ],
    BLEEDING_PATTERNS: [
      /hemorragia.*no.*para|sangrado.*mucho|sangrado.*profuso|desangrando|severe.*bleeding|heavy.*bleeding|bleeding.*stop|uncontrolled.*bleeding|losing.*blood|gushing.*blood/i,
    ],
    ALLERGIC_PATTERNS: [
      /anafilaxia|alergia.*grave|garganta.*cerrada|hinchazón.*lengua|dificultad.*tragar.*alergia/i,
    ],
  },

  // Fever temperature thresholds
  FEVER_THRESHOLDS: {
    MODERATE: 39, // 39°C
    HIGH: 40, // 40°C
    CRITICAL: 41, // 41°C
  },

  // Pain scale thresholds
  PAIN_THRESHOLDS: {
    SEVERE: 10, // 10/10 scale
  },

  // Emergency phone numbers
  EMERGENCY_NUMBERS: {
    MEXICO_911: '911',
    VIDA_LINE: '800 911 2000',
  },
} as const

export type AIKey = keyof typeof AI