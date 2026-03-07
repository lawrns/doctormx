/**
 * Red Flags Triage System for Doctor.mx
 * Evaluates patient symptoms against medical red flag rules
 * to determine appropriate care level
 */

import yaml from 'yaml';

export type CareLevel = 'ER' | 'URGENT' | 'PRIMARY' | 'SELFCARE';

export interface TriageIntake {
  isPregnant?: boolean;
  vitals?: { 
    spo2?: number;
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
  };
  symptoms?: string[];
  age?: number;
  sex?: string;
}

export interface TriageResult {
  triggered: boolean;
  action: CareLevel | undefined;
  ruleIds: string[];
  reasons: string[];
  severity: number; // 0-100
  recommendations: string[];
}

interface Rule {
  id: string;
  action: CareLevel;
  reason: string;
  when: RuleCondition;
}

type RuleCondition = {
  all?: RuleCondition[];
  any?: RuleCondition[];
  symptom_contains?: string;
  symptom_contains_any?: string[];
  text_contains_any?: string[];
  'vitals.spo2_lt'?: number;
  isPregnant?: boolean;
};

// Priority order for care levels (higher index = more urgent)
const CARE_LEVEL_PRIORITY: CareLevel[] = ['SELFCARE', 'PRIMARY', 'URGENT', 'ER'];

// Severity scores for each care level
const SEVERITY_SCORES: Record<CareLevel, number> = {
  'SELFCARE': 10,
  'PRIMARY': 30,
  'URGENT': 60,
  'ER': 100
};

/**
 * Check if array contains a substring (case-insensitive)
 */
function has(haystack: string[], needle: string): boolean {
  const lowerNeedle = needle.toLowerCase();
  return haystack.some(s => s.toLowerCase().includes(lowerNeedle));
}

/**
 * Check if array contains any of the substrings (case-insensitive)
 */
function any(haystack: string[], needles: string[]): boolean {
  return needles.some(needle => has(haystack, needle));
}

/**
 * Evaluate a rule condition node recursively
 */
function evalNode(
  node: RuleCondition | undefined, 
  ctx: { 
    symptomsLow: string[]; 
    textLow: string; 
    intake: TriageIntake 
  }
): boolean {
  if (!node) return true;
  
  // Handle ALL condition (all must be true)
  if (node.all) {
    return node.all.every(n => evalNode(n, ctx));
  }
  
  // Handle ANY condition (at least one must be true)
  if (node.any) {
    return node.any.some(n => evalNode(n, ctx));
  }
  
  // Handle symptom_contains
  if (typeof node.symptom_contains === 'string') {
    return has(ctx.symptomsLow, node.symptom_contains.toLowerCase());
  }
  
  // Handle symptom_contains_any
  if (Array.isArray(node.symptom_contains_any)) {
    return any(ctx.symptomsLow, node.symptom_contains_any);
  }
  
  // Handle text_contains_any
  if (Array.isArray(node.text_contains_any)) {
    return node.text_contains_any.some(n => 
      ctx.textLow.includes(n.toLowerCase())
    );
  }
  
  // Handle vitals.spo2_lt
  if (typeof node['vitals.spo2_lt'] === 'number') {
    const spo2 = ctx.intake.vitals?.spo2 ?? 100;
    return spo2 < node['vitals.spo2_lt'];
  }
  
  // Handle isPregnant
  if (typeof node.isPregnant === 'boolean') {
    return (ctx.intake.isPregnant ?? false) === node.isPregnant;
  }
  
  return false;
}

/**
 * Load rules - uses embedded critical rules
 * Note: YAML file loading removed to avoid Turbopack bundling issues
 * All rules are now embedded in the code for reliable build performance
 */
function loadRules(): Rule[] {
  return getEmbeddedCriticalRules();
}

/**
 * Get embedded critical rules as fallback
 */
function getEmbeddedCriticalRules(): Rule[] {
  return [
    {
      id: 'chest_pain_emergency',
      action: 'ER',
      reason: 'Dolor de pecho puede indicar infarto - buscar atención de emergencia inmediatamente',
      when: { text_contains_any: ['dolor de pecho', 'dolor en el pecho', 'infarto'] }
    },
    {
      id: 'breathing_emergency',
      action: 'ER',
      reason: 'Dificultad para respirar severa es una emergencia médica',
      when: { text_contains_any: ['no puedo respirar', 'me ahogo', 'asfixia'] }
    },
    {
      id: 'suicidal_ideation',
      action: 'ER',
      reason: 'Pensamientos suicidas requieren apoyo inmediato - Línea de la Vida: 800 911 2000',
      when: { text_contains_any: ['quiero morir', 'suicidarme', 'matarme'] }
    },
    {
      id: 'stroke_signs',
      action: 'ER',
      reason: 'Signos de derrame cerebral - cada minuto cuenta',
      when: { text_contains_any: ['derrame', 'embolia', 'cara caída', 'parálisis'] }
    },
    {
      id: 'low_oxygen',
      action: 'ER',
      reason: 'Saturación de oxígeno baja es una emergencia',
      when: { 'vitals.spo2_lt': 90 }
    },
    {
      id: 'pregnancy_bleeding_emergency',
      action: 'ER',
      reason: 'Sangrado abundante durante el embarazo requiere atención inmediata',
      when: {
        all: [
          { isPregnant: true },
          { text_contains_any: ['sangrado vaginal abundante', 'sangrado abundante', 'sangrado en embarazo'] }
        ]
      }
    },
    {
      id: 'high_fever_urgent',
      action: 'URGENT',
      reason: 'Fiebre alta persistente requiere valoración médica en menos de 24 horas',
      when: { text_contains_any: ['fiebre de 40', '40 grados', 'fiebre alta'] }
    },
    {
      id: 'severe_pain_urgent',
      action: 'URGENT',
      reason: 'Dolor intenso o insoportable requiere evaluación prioritaria',
      when: { text_contains_any: ['dolor insoportable', 'dolor muy fuerte', 'dolor severo'] }
    },
    {
      id: 'infection_urgent',
      action: 'URGENT',
      reason: 'Signos de infección activa pueden empeorar rápidamente y deben revisarse pronto',
      when: { text_contains_any: ['pus', 'muy roja y caliente', 'herida infectada'] }
    },
    {
      id: 'chronic_pain_primary',
      action: 'PRIMARY',
      reason: 'Síntomas persistentes por semanas ameritan consulta médica regular',
      when: { text_contains_any: ['desde hace semanas', 'desde hace meses', 'dolor de espalda'] }
    },
    {
      id: 'skin_issue_primary',
      action: 'PRIMARY',
      reason: 'Problemas de piel no urgentes suelen resolverse con consulta de atención primaria o dermatología',
      when: { text_contains_any: ['acné', 'manchas en la piel', 'erupción leve'] }
    },
    {
      id: 'cold_selfcare',
      action: 'SELFCARE',
      reason: 'Un resfriado leve normalmente puede manejarse en casa con medidas básicas',
      when: { text_contains_any: ['nariz tapada', 'estornudos', 'gripa leve'] }
    },
    {
      id: 'minor_injury_selfcare',
      action: 'SELFCARE',
      reason: 'Lesiones superficiales menores suelen manejarse con limpieza y vigilancia en casa',
      when: { text_contains_any: ['raspón pequeño', 'raspon pequeño', 'golpe leve'] }
    }
  ];
}

/**
 * Main triage evaluation function
 * Evaluates a message against red flag rules
 */
export function evaluateRedFlags(input: { 
  message: string; 
  intake?: TriageIntake 
}): TriageResult {
  const rules = loadRules();
  const intake = input.intake || {};
  
  // Prepare symptoms array
  const symptoms = intake.symptoms?.length 
    ? intake.symptoms 
    : [input.message].filter(Boolean);
  
  // Build evaluation context
  const ctx = {
    symptomsLow: symptoms.map(s => s.toLowerCase()),
    textLow: (input.message || '').toLowerCase(),
    intake
  };
  
  // Track results
  let worstAction: CareLevel | undefined;
  const triggeredIds: string[] = [];
  const reasons: string[] = [];
  
  // Evaluate each rule
  for (const rule of rules) {
    if (evalNode(rule.when, ctx)) {
      triggeredIds.push(rule.id);
      reasons.push(rule.reason);
      
      // Update worst action if this is more severe
      if (!worstAction || 
          CARE_LEVEL_PRIORITY.indexOf(rule.action) > CARE_LEVEL_PRIORITY.indexOf(worstAction)) {
        worstAction = rule.action;
      }
    }
  }
  
  // Calculate severity score
  const severity = worstAction ? SEVERITY_SCORES[worstAction] : 0;
  
  // Generate recommendations based on care level
  const recommendations = generateRecommendations(worstAction, triggeredIds);
  
  return {
    triggered: triggeredIds.length > 0,
    action: worstAction,
    ruleIds: triggeredIds,
    reasons,
    severity,
    recommendations
  };
}

/**
 * Generate actionable recommendations based on triage result
 */
function generateRecommendations(
  careLevel: CareLevel | undefined, 
  ruleIds: string[]
): string[] {
  if (!careLevel) {
    return ['Continúa describiendo tus síntomas para una mejor evaluación.'];
  }
  
  switch (careLevel) {
    case 'ER':
      return [
        '🚨 EMERGENCIA: Busca atención médica inmediata',
        'Llama al 911 o acude a urgencias',
        'No conduzcas tú mismo si es posible',
        'Si hay signos de infarto: mastica una aspirina mientras esperas ayuda',
        ruleIds.includes('suicidal_ideation') 
          ? 'Línea de la Vida 24/7: 800 911 2000' 
          : ''
      ].filter(Boolean);
      
    case 'URGENT':
      return [
        '⚠️ Consulta médica recomendada en las próximas 24 horas',
        'Monitorea tus síntomas de cerca',
        'Si los síntomas empeoran, acude a urgencias',
        'Puedes agendar una consulta con un especialista aquí'
      ];
      
    case 'PRIMARY':
      return [
        '📋 Agenda una consulta médica regular',
        'Tus síntomas no son urgentes pero deben evaluarse',
        'Mientras tanto, puedes tomar medidas de autocuidado',
        'Un médico general puede ayudarte a determinar si necesitas un especialista'
      ];
      
    case 'SELFCARE':
      return [
        '🏠 Puedes manejar esto en casa',
        'Descansa y mantente hidratado',
        'Si los síntomas persisten más de 3 días, consulta a un médico',
        'Puedes usar medicamentos de venta libre según sea apropiado'
      ];
      
    default:
      return [];
  }
}

/**
 * Get care level description for display
 */
export function getCareLevelInfo(level: CareLevel): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const info: Record<CareLevel, { label: string; color: string; icon: string; description: string }> = {
    'ER': {
      label: 'Emergencia',
      color: '#DC2626',
      icon: '🚨',
      description: 'Requiere atención médica inmediata'
    },
    'URGENT': {
      label: 'Urgente',
      color: '#F59E0B',
      icon: '⚠️',
      description: 'Consulta médica en 24 horas'
    },
    'PRIMARY': {
      label: 'Consulta Regular',
      color: '#3B82F6',
      icon: '📋',
      description: 'Agenda una cita médica'
    },
    'SELFCARE': {
      label: 'Autocuidado',
      color: '#10B981',
      icon: '🏠',
      description: 'Puede manejarse en casa'
    }
  };
  
  return info[level];
}

/**
 * Check if symptoms indicate a mental health crisis
 */
export function isMentalHealthCrisis(message: string): boolean {
  const mentalHealthKeywords = [
    'quiero morir', 'suicidarme', 'matarme', 'no quiero vivir',
    'acabar con mi vida', 'no vale la pena', 'mejor si no existiera',
    'autolesión', 'cortarme', 'hacerme daño'
  ];
  
  const lowerMessage = message.toLowerCase();
  return mentalHealthKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get mental health resources
 */
export function getMentalHealthResources(): string[] {
  return [
    '📞 Línea de la Vida: 800 911 2000 (24/7, gratuita)',
    '📞 SAPTEL: 55 5259 8121 (24/7)',
    '📞 Línea de Crisis: 800 290 0024',
    '💬 Chat de apoyo disponible en nuestra plataforma',
    'No estás solo/a. Hay ayuda disponible.'
  ];
}
