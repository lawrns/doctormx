/**
 * Enhanced Red Flag Detection System
 * Comprehensive emergency symptom detection for Mexican healthcare context
 */

export type RedFlagSeverity = 'critical' | 'high' | 'moderate';

export interface RedFlag {
  pattern: RegExp;
  message: string;
  severity: RedFlagSeverity;
  category: string;
  recommendation: string;
  requiresImmediate911: boolean;
}

export interface RedFlagResult {
  detected: boolean;
  flags: Array<{
    message: string;
    severity: RedFlagSeverity;
    category: string;
    recommendation: string;
    requiresImmediate911: boolean;
  }>;
  highestSeverity: RedFlagSeverity | null;
  requiresEmergencyEscalation: boolean;
}

/**
 * Comprehensive red flag database
 * Based on:
 * - FAST stroke protocol
 * - Cardiac emergency guidelines
 * - Mexican SSA emergency protocols
 * - IMSS urgency classification
 */
export const ENHANCED_RED_FLAGS: RedFlag[] = [
  // ============================================================================
  // CRITICAL - IMMEDIATE 911 REQUIRED
  // ============================================================================

  // Stroke (ACV) - FAST Protocol
  {
    pattern: /paralisis|debilidad.*extremo|cara.*colgada|cara.*caida|brazo.*no.*puede.*levantar|cara.*torcida|slurred.*speech|cant.*speak|speech.*difficulty|face.*drooping|arm.*weakness/i,
    message: 'Posible accidente cerebrovascular (ACV) - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Protocolo FAST: Facial, Arms, Speech, Time',
    requiresImmediate911: true,
  },
  {
    pattern: /dificultad.*hablar|no.*puede.*hablar|palabras.*enredadas|lengua.*trabada|slurred.*speech|cant.*speak|speech.*difficulty|words.*jumbled|trouble.*speaking/i,
    message: 'Trastorno del habla súbito - Posible ACV',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. Síntoma clave de evento cerebrovascular',
    requiresImmediate911: true,
  },

  // Cardiac Emergency
  {
    pattern: /dolor.*pecho.*opresivo|dolor.*pecho.*brazo|angina|siento.*que.*me.*muero|dolor.*pecho.*mandibula|chest.*pain|pressure.*chest|squeezing.*chest|crushing.*chest|heart.*attack|pain.*radiate.*arm/i,
    message: 'Dolor torácico con características cardíacas - EMERGENCIA',
    severity: 'critical',
    category: 'Cardiac',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Posible infarto al miocardio',
    requiresImmediate911: true,
  },
  {
    pattern: /dolor.*pecho|dolor.*toracico|chest.*pain|tightness.*chest|discomfort.*chest/i,
    message: 'Dolor torácico - Requiere evaluación urgente',
    severity: 'high',
    category: 'Cardiac',
    recommendation: 'Contacte servicios de emergencia o acuda a urgencias inmediatamente',
    requiresImmediate911: false,
  },

  // Severe Respiratory
  {
    pattern: /no.*puedo.*respirar|ahogo.*severo|labios.*azules|cara.*azul|cianosis|difficulty.*breathing|cant.*breathe|trouble.*breathing|shortness.*breath|not.*able.*breathe|wheezing.*severe|blue.*lips|cyanosis/i,
    message: 'Insuficiencia respiratoria severa - EMERGENCIA',
    severity: 'critical',
    category: 'Respiratory',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Posible falla respiratoria',
    requiresImmediate911: true,
  },

  // Neurological Critical
  {
    pattern: /convulsiones|ataques|espasmos.*incontrolables|temblores.*violentos/i,
    message: 'Actividad convulsiva - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. Proteja a la persona de lesiones durante la convulsión',
    requiresImmediate911: true,
  },
  {
    pattern: /dolor.*cabeza.*peor.*vida|cefalea.*thunderclap|dolor.*cabeza.*explosivo|dolor.*cabeza.*intenso.*subito|sudden.*severe.*headache|worst.*headache.*life|thunderclap.*headache|explosive.*headache|sudden.*intense.*headache/i,
    message: 'Cefalea thunderclap - Posible hemorragia subaracnoidea',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Requiere neuroimagen urgente',
    requiresImmediate911: true,
  },
  {
    pattern: /cuello.*rigido.*fiebre|rigidez.*nuca.*fiebre|meningitis/i,
    message: 'Rigidez de nuca con fiebre - Posible meningitis',
    severity: 'critical',
    category: 'Infectious',
    recommendation: 'Llame al 911. Posible meningitis bacteriana',
    requiresImmediate911: true,
  },

  // Psychiatric Emergency
  {
    pattern: /pensamientos.*suicidio|quiere.*morir|quitarme.*vida|plan.*suicida|autolesion.*grave/i,
    message: 'Ideación suicida activa - CRISIS PSIQUIÁTRICA',
    severity: 'critical',
    category: 'Psychiatric',
    recommendation: 'Llame al 911 o Línea de la Vida (800 911 2000). No deje sola a la persona',
    requiresImmediate911: true,
  },

  // Severe Bleeding
  {
    pattern: /hemorragia.*no.*para|sangrado.*mucho|sangrado.*profuso|desangrando|severe.*bleeding|heavy.*bleeding|bleeding.*stop|uncontrolled.*bleeding|losing.*blood|gushing.*blood/i,
    message: 'Hemorragia incontrolable - EMERGENCIA',
    severity: 'critical',
    category: 'Trauma',
    recommendation: 'Llame al 911. Aplique presión directa mientras llega ayuda',
    requiresImmediate911: true,
  },

  // Severe Allergic Reaction
  {
    pattern: /anafilaxia|alergia.*grave|garganta.*cerrada|hinchazón.*lengua|dificultad.*tragar.*alergia/i,
    message: 'Anafilaxia - Reacción alérgica severa',
    severity: 'critical',
    category: 'Allergic',
    recommendation: 'Llame al 911. Use epinefrina (EpiPen) si está disponible',
    requiresImmediate911: true,
  },

  // ============================================================================
  // HIGH SEVERITY - URGENT MEDICAL ATTENTION
  // ============================================================================

  // Respiratory High
  {
    pattern: /dificultad.*respirar|ahogo|falta.*aire|sibilancias.*severas/i,
    message: 'Dificultad respiratoria - Atención urgente',
    severity: 'high',
    category: 'Respiratory',
    recommendation: 'Acuda a urgencias en las próximas 2 horas o llame al 911 si empeora',
    requiresImmediate911: false,
  },

  // High Fever
  {
    pattern: /fiebre.*40|fiebre.*41|fiebre.*42|temperatura.*muy.*alta|fiebre.*no.*baja/i,
    message: 'Fiebre muy alta - Riesgo de sepsis',
    severity: 'high',
    category: 'Infectious',
    recommendation: 'Acuda a urgencias inmediatamente. Riesgo de infección grave',
    requiresImmediate911: false,
  },

  // Loss of Consciousness
  {
    pattern: /perdida.*conciencia|inconsciente|desmayo|desmayarse|faint|unconscious|passed.*out|knocked.*out|lose.*consciousness|blackout/i,
    message: 'Pérdida de conciencia - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Requiere evaluación médica urgente',
    requiresImmediate911: true,
  },

  // Altered Mental Status
  {
    pattern: /confusion|desorientado|no.*reconoce|alteracion.*conciencia/i,
    message: 'Alteración del estado mental',
    severity: 'high',
    category: 'Neurological',
    recommendation: 'Requiere evaluación médica urgente. Acuda a urgencias',
    requiresImmediate911: false,
  },

  // Severe Abdominal
  {
    pattern: /abdomen.*rigido|abdomen.*duro|defensa.*abdominal|dolor.*abdominal.*severo/i,
    message: 'Signos de abdomen agudo - Posible emergencia quirúrgica',
    severity: 'high',
    category: 'Gastrointestinal',
    recommendation: 'Acuda a urgencias. Puede requerir cirugía',
    requiresImmediate911: false,
  },

  // Severe Head Trauma
  {
    pattern: /golpe.*cabeza.*perdida.*conocimiento|trauma.*craneo|concusion|perdida.*memoria.*golpe/i,
    message: 'Traumatismo craneoencefálico',
    severity: 'high',
    category: 'Trauma',
    recommendation: 'Acuda a urgencias para descartar hemorragia intracraneal',
    requiresImmediate911: false,
  },

  // Pregnancy Complications
  {
    pattern: /embarazada.*sangrado|embarazada.*dolor.*intenso|embarazo.*emergencia|contracciones.*prematuras/i,
    message: 'Complicación del embarazo',
    severity: 'high',
    category: 'Obstetric',
    recommendation: 'Acuda a urgencias obstétricas inmediatamente',
    requiresImmediate911: false,
  },

  // Vision Loss
  {
    pattern: /perdida.*vision.*subita|ceguera.*repentina|no.*veo|vision.*negra/i,
    message: 'Pérdida súbita de visión',
    severity: 'high',
    category: 'Ophthalmologic',
    recommendation: 'Acuda a urgencias oftalmológicas en las próximas 2 horas',
    requiresImmediate911: false,
  },

  // Severe Pain
  {
    pattern: /dolor.*10\/10|peor.*dolor.*vida|dolor.*insoportable/i,
    message: 'Dolor severo (10/10)',
    severity: 'high',
    category: 'Pain',
    recommendation: 'Requiere evaluación médica urgente',
    requiresImmediate911: false,
  },

  // ============================================================================
  // MODERATE SEVERITY - MEDICAL ATTENTION WITHIN 24 HOURS
  // ============================================================================

  // Moderate Fever
  {
    pattern: /fiebre.*39|fiebre.*38.*niño/i,
    message: 'Fiebre moderada',
    severity: 'moderate',
    category: 'Infectious',
    recommendation: 'Consulte con médico en las próximas 24 horas',
    requiresImmediate911: false,
  },

  // Moderate Respiratory
  {
    pattern: /tos.*sangre|hemoptisis/i,
    message: 'Tos con sangre',
    severity: 'moderate',
    category: 'Respiratory',
    recommendation: 'Consulte con médico en las próximas 24 horas',
    requiresImmediate911: false,
  },

  // Urinary
  {
    pattern: /sangre.*orina|dolor.*orinar.*severo|no.*puedo.*orinar/i,
    message: 'Síntomas urinarios graves',
    severity: 'moderate',
    category: 'Urinary',
    recommendation: 'Consulte con médico en las próximas 24 horas',
    requiresImmediate911: false,
  },
];

/**
 * Detect red flags in patient symptoms and history
 */
export function detectRedFlagsEnhanced(text: string): RedFlagResult {
  const detectedFlags: Array<{
    message: string;
    severity: RedFlagSeverity;
    category: string;
    recommendation: string;
    requiresImmediate911: boolean;
  }> = [];

  const lowerText = text.toLowerCase();

  // Check each red flag pattern
  for (const flag of ENHANCED_RED_FLAGS) {
    if (flag.pattern.test(lowerText)) {
      detectedFlags.push({
        message: flag.message,
        severity: flag.severity,
        category: flag.category,
        recommendation: flag.recommendation,
        requiresImmediate911: flag.requiresImmediate911,
      });
    }
  }

  // Remove duplicates by message
  const uniqueFlags = Array.from(
    new Map(detectedFlags.map((flag) => [flag.message, flag])).values()
  );

  // Determine highest severity
  let highestSeverity: RedFlagSeverity | null = null;
  if (uniqueFlags.some((f) => f.severity === 'critical')) {
    highestSeverity = 'critical';
  } else if (uniqueFlags.some((f) => f.severity === 'high')) {
    highestSeverity = 'high';
  } else if (uniqueFlags.some((f) => f.severity === 'moderate')) {
    highestSeverity = 'moderate';
  }

  // Determine if emergency escalation required
  const requiresEmergencyEscalation = uniqueFlags.some((f) => f.requiresImmediate911);

  return {
    detected: uniqueFlags.length > 0,
    flags: uniqueFlags,
    highestSeverity,
    requiresEmergencyEscalation,
  };
}

/**
 * Integration with existing copilot system
 */
export function convertToLegacyFormat(
  result: RedFlagResult
): Array<{ message: string; severity: string }> {
  return result.flags.map((flag) => ({
    message: flag.message,
    severity: flag.severity,
  }));
}
