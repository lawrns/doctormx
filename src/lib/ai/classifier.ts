/**
 * Front-door intent classifier for Doctor.mx
 *
 * Classifies incoming messages into tiers:
 *   Tier 0 — social/admin: deterministic fast-path, no AI needed
 *   Tier 1 — simple_medical: lightweight AI orientation
 *   Tier 2 — clinical_intake / high_risk: full clinical reasoning
 *
 * Rules are intentionally conservative: when in doubt, escalate to Tier 2.
 * high_risk always escalates immediately regardless of other signals.
 */

export type IntentBucket =
  | 'social'
  | 'admin'
  | 'simple_medical'
  | 'clinical_intake'
  | 'high_risk';

export type IntentTier = 0 | 1 | 2;

export interface ClassificationResult {
  bucket: IntentBucket;
  tier: IntentTier;
  requiresAI: boolean;
  responseMode: 'fast-path' | 'lightweight' | 'reasoning';
}

// ─── Pattern libraries ────────────────────────────────────────────────────────

const HIGH_RISK_PATTERNS = [
  /\b(dolor\s+de\s+pecho|chest\s+pain)\b/i,
  /\b(dificultad\s+(para\s+)?respirar|shortness\s+of\s+breath|no\s+puedo\s+respirar)\b/i,
  /\b(infarto|ataque\s+(al\s+)?corazón|heart\s+attack|derrame|stroke)\b/i,
  /\b(convulsión|convulsion|seizure|epilepsia)\b/i,
  /\b(hemorragia|hemorrhage|sangrado\s+abundante)\b/i,
  /\b(suicid|me\s+quiero\s+(matar|morir)|quitarme\s+la\s+vida|autolesión)\b/i,
  /\b(embarazo.{0,30}sangrado|sangrado.{0,30}embarazo|pregnancy.{0,30}bleed)\b/i,
  /\b(parálisis|paresia|entumecimiento\s+facial|facial\s+numbness)\b/i,
  /\b(dificultad\s+para\s+hablar|slurred\s+speech|no\s+puedo\s+hablar)\b/i,
  /\b(pérdida\s+de\s+conciencia|inconsciente|desmayo|fainted|unconscious)\b/i,
  /\b(emergencia\s+médica|emergency|llama\s+al\s+911|llamen\s+ambulancia)\b/i,
  /\b(reacción\s+alérgica\s+severa|anafilax|anaphylax)\b/i,
  /\b(sobredosis|overdose)\b/i,
];

const SOCIAL_PATTERNS = [
  /^\s*(hola|hello|hi|hey|buenas?|buenos?\s+(días?|tardes?|noches?))\s*[!.¡¿]?\s*$/i,
  /^\s*(gracias|thanks|thank\s+you|muchas\s+gracias|muy\s+amable|te\s+lo\s+agradezco)\s*[!.]?\s*$/i,
  /^\s*(adiós|hasta\s+luego|bye|chao|nos\s+vemos|hasta\s+pronto|hasta\s+mañana)\s*[!.]?\s*$/i,
  /\b(quién\s+eres|qué\s+eres|eres\s+un\s+(bot|robot|ai|ia|asistente)|cómo\s+te\s+llamas|tu\s+nombre)\b/i,
  /^\s*(ok|okay|entendido|claro|de\s+acuerdo|perfecto|listo)\s*[!.]?\s*$/i,
  /^\s*(sí|si|no)\s*[.!]?\s*$/i,
];

const ADMIN_PATTERNS = [
  /\b(agendar|reservar\s+cita|quiero\s+cita|pedir\s+cita|appointment|booking|horario|disponibilidad)\b/i,
  /\b(cuánto\s+(cuesta|cobran|vale)|precio|tarifa|costo\s+de|pago|how\s+much|fee)\b/i,
  /\b(qué\s+especialidades|qué\s+servicios|qué\s+hace[ns]?|cómo\s+funciona|información\s+sobre\s+doctor)/i,
  /\b(login|iniciar\s+sesión|crear\s+cuenta|registrar|contraseña|password|account|forgot\s+password)\b/i,
  /\b(ayuda|support|soporte|contacto|contact\s+us)\b/i,
  /\b(cancelar\s+cita|reprogramar|reschedule)\b/i,
  /\b(dónde\s+(están|queda)|dirección|ubicación|address|location)\b/i,
];

const SIMPLE_MEDICAL_PATTERNS = [
  /\b(qué\s+(doctor|médico|especialista|especialidad)\s+(ve|atiende|trata|para)|cuál\s+especialista)\b/i,
  /\b(qué\s+es\s+(la\s+|el\s+)?\w+itis|\w+osis|\w+emia)\b/i,
  /\b(para\s+qué\s+sirve|qué\s+trata|información\s+sobre)\b.{0,40}\b(medicamento|medicina|pastilla|vitamina)\b/i,
  /\b(es\s+normal\s+tener|es\s+común)\b.{0,60}\b(gripe|resfriado|tos|fiebre\s+leve|dolor\s+de\s+cabeza)\b/i,
  /\b(debería\s+ver\s+a\s+un|necesito\s+un)\s+(médico|doctor|especialista)\b/i,
];

// ─── Classifier ───────────────────────────────────────────────────────────────

/**
 * Classify a single message text into an intent bucket + tier.
 */
export function classifyMessage(text: string): ClassificationResult {
  const trimmed = text.trim();

  // High-risk always escalates first — no exceptions
  if (HIGH_RISK_PATTERNS.some((p) => p.test(trimmed))) {
    return { bucket: 'high_risk', tier: 2, requiresAI: true, responseMode: 'reasoning' };
  }

  // Social — Tier 0 deterministic
  if (SOCIAL_PATTERNS.some((p) => p.test(trimmed))) {
    return { bucket: 'social', tier: 0, requiresAI: false, responseMode: 'fast-path' };
  }

  // Admin — Tier 0 deterministic
  if (ADMIN_PATTERNS.some((p) => p.test(trimmed))) {
    return { bucket: 'admin', tier: 0, requiresAI: false, responseMode: 'fast-path' };
  }

  // Simple medical — Tier 1
  if (SIMPLE_MEDICAL_PATTERNS.some((p) => p.test(trimmed))) {
    return { bucket: 'simple_medical', tier: 1, requiresAI: true, responseMode: 'lightweight' };
  }

  // Default: treat as clinical intake — Tier 2
  return { bucket: 'clinical_intake', tier: 2, requiresAI: true, responseMode: 'reasoning' };
}

// ─── Tier 0 fast-path response library ───────────────────────────────────────

const SOCIAL_RESPONSES = [
  '¡Hola! Soy el asistente virtual de Doctor.mx. ¿En qué puedo orientarte hoy?',
  'Hola, bienvenido/a a Doctor.mx. Cuéntame cómo puedo ayudarte.',
  '¡Buenas! Estoy aquí para orientarte. ¿Tienes alguna pregunta sobre tu salud o quieres agendar una consulta?',
];

const THANKS_RESPONSES = [
  'Con gusto. Si tienes más preguntas o necesitas orientación médica, aquí estaré.',
  'Para servirte. ¿Hay algo más en lo que pueda ayudarte?',
  'De nada. Estoy aquí cuando lo necesites.',
];

const GOODBYE_RESPONSES = [
  'Hasta luego. Cuídate mucho y no dudes en regresar si necesitas orientación.',
  '¡Nos vemos! Que tengas un excelente día.',
];

const IDENTITY_RESPONSES = [
  'Soy el asistente virtual de Doctor.mx. Puedo orientarte sobre síntomas, ayudarte a encontrar el especialista adecuado y agendar tu consulta. No soy un médico y no reemplazaré una consulta presencial.',
];

const ADMIN_RESPONSES: Record<string, string> = {
  booking: 'Para agendar una cita puedes hacerlo directamente desde la plataforma. ¿Quieres que te ayude a encontrar el especialista correcto primero?',
  pricing: 'Los precios varían según el especialista y el tipo de consulta. En la plataforma encontrarás el detalle de tarifas de cada médico disponible.',
  services: 'En Doctor.mx ofrecemos consultas con médicos generales y especialistas: cardiología, dermatología, ginecología, pediatría, psicología, y más. ¿Necesitas alguna especialidad en particular?',
  login: 'Para acceder a tu cuenta puedes iniciar sesión en la parte superior de la página. Si olvidaste tu contraseña, hay una opción para restablecerla.',
  support: 'Nuestro equipo de soporte puede ayudarte. ¿Cuál es tu duda específica?',
  default: '¿En qué puedo ayudarte hoy? Puedo orientarte sobre síntomas, especialistas, o cómo funciona la plataforma.',
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a deterministic Tier 0 response for social/admin messages.
 * Returns null if this is not a Tier 0 message.
 */
export function getTier0Response(text: string, bucket: IntentBucket): string | null {
  if (bucket === 'social') {
    const t = text.toLowerCase();
    if (/gracias|thanks|thank\s+you/i.test(t)) return pickRandom(THANKS_RESPONSES);
    if (/adiós|hasta\s+luego|bye|chao|nos\s+vemos/i.test(t)) return pickRandom(GOODBYE_RESPONSES);
    if (/quién\s+eres|qué\s+eres|eres\s+un|cómo\s+te\s+llamas|tu\s+nombre/i.test(t)) return pickRandom(IDENTITY_RESPONSES);
    return pickRandom(SOCIAL_RESPONSES);
  }

  if (bucket === 'admin') {
    const t = text.toLowerCase();
    if (/agendar|reservar|cita|appointment|booking|horario/i.test(t)) return ADMIN_RESPONSES.booking;
    if (/cuesta|precio|tarifa|costo|pago|how\s+much|fee/i.test(t)) return ADMIN_RESPONSES.pricing;
    if (/especialidades|servicios|qué\s+hace|cómo\s+funciona/i.test(t)) return ADMIN_RESPONSES.services;
    if (/login|sesión|cuenta|registr|contraseña|password/i.test(t)) return ADMIN_RESPONSES.login;
    if (/ayuda|support|soporte|contacto/i.test(t)) return ADMIN_RESPONSES.support;
    return ADMIN_RESPONSES.default;
  }

  return null;
}
