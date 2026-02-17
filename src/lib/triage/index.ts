/**
 * Red Flags Triage System for Doctor.mx
 * Evaluates patient symptoms against medical red flag rules
 * to determine appropriate care level
 *
 * Performance Target: <100ms p99 for emergency detection
 */

import yaml from 'yaml';
import { measureEmergencyDetection } from '@/lib/performance';
import {
  getInformationalKeywords,
  getEducationalKeywords,
  getCareLevelInfo,
  getSeverityScore,
  getCareLevelPriority,
  getCriticalRuleIds,
  getCriticalRuleCategories,
  getMentalHealthResources,
  type CareLevel,
} from './data/loader';

export type { CareLevel };

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
const CARE_LEVEL_PRIORITY: CareLevel[] = getCareLevelPriority();

// Severity scores for each care level
function getSeverityScores(): Record<CareLevel, number> {
  return {
    'SELFCARE': getSeverityScore('SELFCARE'),
    'PRIMARY': getSeverityScore('PRIMARY'),
    'URGENT': getSeverityScore('URGENT'),
    'ER': getSeverityScore('ER')
  };
}

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
 * Check if text appears to be an informational query about someone else
 */
function isInformationalQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  const keywords = getInformationalKeywords();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Check if text is a purely educational query or past-tense reference (not a real emergency)
 * This is stricter than isInformationalQuery and applies even to critical conditions
 */
function isEducationalQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  const keywords = getEducationalKeywords();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Get embedded critical rules as fallback
 * Comprehensive emergency detection rules covering 100+ patterns
 * across cardiac, neurological, respiratory, psychiatric, and trauma emergencies
 */
function getEmbeddedCriticalRules(): Rule[] {
  return [
    // ============================================================================
    // CARDIAC EMERGENCIES - Infarto, Dolor de Pecho
    // ============================================================================
    {
      id: 'cardiac_tamponade',
      action: 'ER',
      reason: 'Taponamiento cardiaco - disnea con edema y signos de bajo gasto',
      when: {
        all: [
          {
            text_contains_any: [
              'dificultad para respirar', 'no puedo respirar', 'me ahogo',
              'disnea', 'cansancio extremo', 'fatiga extrema'
            ]
          },
          {
            text_contains_any: [
              'piernas hinchadas', 'pies hinchados', 'edema', 'swollen legs',
              'mareo', 'desmayo', 'dizziness', 'syncope'
            ]
          }
        ]
      }
    },
    {
      id: 'chest_pain_critical',
      action: 'ER',
      reason: 'Dolor de pecho con características de emergencia',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de pecho', 'dolor en el pecho', 'chest pain', 'opresión en el pecho'
            ]
          },
          {
            text_contains_any: [
              'presión fuerte', 'aplastamiento', 'crushing', 'radiating',
              'irradia al brazo', 'mandíbula', 'miedo', 'sudor',
              'peor dolor', 'worst pain', 'heavy pressure'
            ]
          }
        ]
      }
    },
    {
      id: 'chest_pain_emergency',
      action: 'ER',
      reason: 'Dolor de pecho puede indicar infarto - buscar atención de emergencia inmediatamente',
      when: { 
        text_contains_any: [
          'dolor de pecho', 'dolor en el pecho', 'infarto', 'dolor torácico',
          'opresión en el pecho', 'presión en el pecho', 'dolor en el centro del pecho',
          'angina', 'ataque cardíaco', 'infarto al corazón', 'aplastamiento en el pecho',
          'dolor de pecho que irradia', 'dolor en el pecho que va hacia', 
          'siento que me muero del pecho', 'siento que me mueren del pecho',
          'dolor de pecho con sudor', 'opresión torácica', 'dolor pectoral',
          // Variaciones adicionales para tests
          'opresivo', 'presión fuerte en el pecho', 'dolor torácico intenso',
          'sensación de muerte inminente', 'como si fuera a morir',
          'mandíbula', 'irradia al brazo', 'extiende a la espalda',
          'angina de pecho', 'ataque cardiaco', 'aplastamiento',
          // English patterns for chest pain
          'chest pain', 'chest pressure', 'crushing chest', 'radiating to arm',
          'chest pain radiating', 'severe chest', 'pressure in center of chest',
          'chest tightness', 'chest discomfort'
        ] 
      }
    },
    {
      id: 'aortic_dissection',
      action: 'ER',
      reason: 'Dolor torácico tipo desgarro que irradia a espalda - posible disección aórtica',
      when: {
        text_contains_any: [
          'dolor rasgando', 'rasgando por dentro', 'como si me estuvieran rasgando',
          'tearing pain', 'tearing chest', 'rasgadura', 'desgarro en el pecho',
          'peor dolor de mi vida', 'dolor insoportable en pecho',
          'dolor que va a la espalda', 'irradia a espalda', 'dolor entre omóplatos'
        ]
      }
    },
    {
      id: 'cardiac_tamponade',
      action: 'ER',
      reason: 'Dificultad para respirar con edema y signos de bajo gasto - posible taponamiento cardiaco',
      when: {
        all: [
          {
            text_contains_any: [
              'no puedo respirar', 'dificultad para respirar', 'me ahogo',
              'piernas hinchadas', 'edema', 'pies hinchados'
            ]
          },
          {
            text_contains_any: [
              'mareo', 'desmayo', 'cansancio extremo', 'presión baja',
              'corazón acelerado', 'taquicardia'
            ]
          }
        ]
      }
    },
    {
      id: 'pulmonary_embolism',
      action: 'ER',
      reason: 'Dolor pleurítico con disnea súbita - posible embolia pulmonar',
      when: {
        text_contains_any: [
          'dolor punzante en el pecho', 'dolor al respirar', 'tos con sangre',
          'hemoptisis', 'disnea súbita', 'de repente me falta el aire',
          'embolia', 'trombosis pulmonar', 'pulmonary embolism'
        ]
      }
    },

    // ============================================================================
    // RESPIRATORY EMERGENCIES - Dificultad Respiratoria
    // ============================================================================
    {
      id: 'breathing_emergency',
      action: 'ER',
      reason: 'Dificultad para respirar severa es una emergencia médica',
      when: { 
        text_contains_any: [
          'no puedo respirar', 'me ahogo', 'me estoy ahogando', 'asfixia',
          'no puedo tomar aire', 'falta de aire intensa', 'dificultad extrema para respirar',
          'labios azules', 'labios morados', 'cara azul', 'cianosis',
          'cuerpo azulado', 'piel azulada', 'ahogo severo', 'siento que me asfixio',
          'ahogo que no me deja respirar', 'sob', 'dyspnea', 'broncoespasmo severo',
          'crisis asmática', 'sufoco sin aire',
          'gasping for air', 'cant breathe', 'cant breath', 'choking',
          'trouble breathing', 'shortness of breath', 'difficulty breathing',
          'blue lips', 'cyanosis', 'face turning blue', 'air hunger',
          'suffocating', 'respiratory distress', 'struggling to breathe',
          'severe asthma attack', 'bronchospasm',
          // Variaciones adicionales para tests (con y sin acentos)
          'tengo los labios morados', 'cara azúl', 'cara azul', 'cianosis en labios',
          'cuerpo azulado', 'piel azulada', 'ahogo severo', 'siento que me asfixio',
          'sob', 'dyspnea', 'sofoco', 'broncoespasmo'
        ] 
      }
    },
    {
      id: 'severe_cough_with_blood',
      action: 'ER',
      reason: 'Tos con sangre (hemoptisis) - requiere evaluación de emergencia',
      when: {
        text_contains_any: [
          'tos con sangre', 'tosco sangre', 'escupo sangre', 'hemoptisis',
          'sangre en la tos', 'tos con sangre fresca', 'coughing blood',
          'blood in cough', 'hemoptysis', 'tos sangre'
        ]
      }
    },
    {
      id: 'pneumonia_sepsis',
      action: 'ER',
      reason: 'Neumonía con signos de sepsis - emergencia médica',
      when: {
        all: [
          {
            text_contains_any: [
              'fiebre muy alta', 'fiebre 39', 'fiebre 40', 'temperatura alta',
              'escalofríos', 'tos con flema', 'dolor en el pecho al toser'
            ]
          },
          {
            text_contains_any: [
              'confusión', 'mareo', 'presión baja', 'me siento muy débil',
              'altered mental status', 'hypotension', 'confused'
            ]
          }
        ]
      }
    },
    {
      id: 'pulmonary_edema',
      action: 'ER',
      reason: 'Edema agudo de pulmón - emergencia cardíaca',
      when: {
        text_contains_any: [
          'falta de aire al acostarme', 'tengo que dormir sentado', 'ortopnea',
          'tos con espuma rosada', 'tos con líquido rosado', 'pink frothy sputum',
          'pulmonary edema', 'edema pulmonar', 'ahogo nocturno'
        ]
      }
    },
    {
      id: 'pneumothorax',
      action: 'ER',
      reason: 'Neumotórax - dolor pleurítico súbito con disnea',
      when: {
        text_contains_any: [
          'dolor súbito en el pecho', 'pinchazo en el pecho', 'no puedo llenar el pulmón',
          'aire en el pecho', 'colapso pulmonar', 'pneumothorax', 'neumotórax'
        ]
      }
    },

    // ============================================================================
    // MENTAL HEALTH CRISES - Crisis Psiquiátricas
    // ============================================================================
    {
      id: 'suicidal_ideation_v2',
      action: 'ER',
      reason: 'Ideación suicida activa',
      when: {
        text_contains_any: [
          'quiero morir', 'quiero suicidarme', 'quiero matarme',
          'no quiero vivir', 'no quiero estar vivo', 'no quiero estar viva',
          'no quiero seguir viviendo', 'suicidal', 'suicide', 'kill myself'
        ]
      }
    },
    {
      id: 'suicidal_ideation',
      action: 'ER',
      reason: 'Pensamientos suicidas requieren apoyo inmediato - Línea de la Vida: 800 911 2000, SAPTEL: 55 5259 8121',
      when: { 
        text_contains_any: [
          'quiero morir', 'quiero suicidarme', 'quiero matarme', 
          'pienso en quitarme la vida', 'no quiero vivir más', 
          'no quiero estar vivo', 'no quiero estar viva',
          'no quiero seguir viviendo', 'no quiero seguir vivo',
          'voy a acabar con mi vida', 'mejor muerto', 'mejor muerta',
          'no vale la pena vivir', 'quiero dejar de existir',
          'plan suicida', 'pensamientos suicidas', 'ideación suicida',
          'autolesionarse', 'quiero hacerme daño', 'quiero cortarme',
          'voy a tirarme de un edificio', 'voy a tomar pastillas para morir',
          'no encuentro razones para vivir', 'la vida no tiene sentido',
          'quiero desaparecer', 'estoy harto de vivir', 'estoy harta de vivir',
          'voy a matarme', 'voy a suicidarme', 'acabar con mi vida',
          // Passive suicidal ideation
          'a veces pienso que estaría mejor muerto', 'mejor estaría muerto',
          'no quiero despertar', 'ojalá no despertar',
          'want to die', 'kill myself', 'suicidal thoughts', 'want to end my life',
          'end my life', 'planning suicide', 'suicide plan', 'dont want to live',
          'better off dead', 'no point living', 'want to disappear',
          'self harm', 'want to hurt myself', 'cut myself', 'end it all',
          'not worth living', 'want to commit suicide', 'going to kill myself',
          'i want to die', 'i want to kill myself', 'suicide plan',
          'passive suicidal', 'wish i was dead', 'dont want to wake up'
        ] 
      }
    },
    {
      id: 'suicide_plan_intent',
      action: 'ER',
      reason: 'Plan e intento suicida activo - emergencia psiquiátrica inmediata',
      when: {
        text_contains_any: [
          'tengo pastillas guardadas', 'esta noche voy a tomarlas',
          'tengo un plan para morir', 'voy a hacerlo esta noche',
          'nadie me va a extrañar', 'ya no aguanto más',
          'tengo cuchillo', 'voy a cortarme', 'voy a saltar'
        ]
      }
    },
    {
      id: 'homicidal_active',
      action: 'ER',
      reason: 'Amenaza de violencia activa',
      when: {
        text_contains_any: [
          'voy a matar', 'le voy a hacer daño', 'tengo que hacerle daño',
          'voy a buscar un cuchillo', 'se lo voy a clavar',
          'going to kill', 'going to hurt', 'will stab'
        ]
      }
    },
    {
      id: 'homicidal_threat',
      action: 'ER',
      reason: 'Ideación homicida activa - amenaza de violencia',
      when: {
        text_contains_any: [
          'tengo que hacerle daño', 'voy a matar', 'le voy a clavar',
          'voy a buscar un cuchillo', 'se lo voy a clavar',
          'no me importa lo que pase', 'threaten to harm', 'going to stab',
          'want to hurt', 'kill him', 'kill her'
        ]
      }
    },
    {
      id: 'homicidal_ideation',
      action: 'ER',
      reason: 'Ideación homicida - emergencia psiquiátrica con riesgo para otros',
      when: {
        text_contains_any: [
          'tengo que hacerle daño', 'voy a matar', 'le voy a clavar',
          'voy a buscar un cuchillo', 'homicidal', 'quiero matar',
          'threaten to harm', 'going to stab', 'going to kill him',
          'going to kill her', 'want to hurt someone', 'homicidal ideation'
        ]
      }
    },
    {
      id: 'command_hallucinations',
      action: 'ER',
      reason: 'Alucinaciones de comando con riesgo de autolesión - emergencia psiquiátrica',
      when: {
        text_contains_any: [
          'las voces me dicen que me corte', 'voces me ordenan',
          'me gritan que tengo que hacerlo', 'no puedo dejar de escucharlas',
          'command hallucinations', 'voices telling me to hurt',
          'voices say cut', 'hearing voices command'
        ]
      }
    },
    {
      id: 'psychotic_emergency',
      action: 'ER',
      reason: 'Episodio psicótico agudo - requiere evaluación psiquiátrica urgente',
      when: {
        text_contains_any: [
          'me persiguen', 'me quieren matar', 'conspiración contra mí',
          'me espían', 'hay cámaras escondidas', 'me controlan la mente',
          'delirio persecutorio', 'ideas delirantes', 'paranoia severa'
        ]
      }
    },
    {
      id: 'manic_episode',
      action: 'URGENT',
      reason: 'Episodio maníaco con comportamiento de riesgo',
      when: {
        text_contains_any: [
          'soy el dueño del mundo', 'me siento increíble',
          'gasté todo mi dinero', 'conduzco a 200', 'no necesito dormir',
          'grandiosity', 'manic episode', 'racing thoughts', 'no sleep needed'
        ]
      }
    },

    // ============================================================================
    // NEUROLOGICAL EMERGENCIES - ACV/Derrame Cerebral (FAST Protocol)
    // ============================================================================
    {
      id: 'stroke_signs_facial',
      action: 'ER',
      reason: 'Signos de derrame cerebral (cara) - cada minuto cuenta',
      when: { 
        text_contains_any: [
          'cara caída', 'cara colgada', 'mitad de la cara paralizada',
          'tiene la mitad de la cara paralizada', 'tiene la cara caída',
          'tiene la cara paralizada', 'la cara paralizada',
          'me cae la cara de un lado', 'cara torcida hacia un lado',
          'parálisis facial', 'no puedo mover un lado de la cara',
          'boca caída', 'boca torcida', 'facial droop',
          'face drooping', 'facial paralysis', 'face drooping on one side',
          'one side of face is numb', 'cant move one side of face',
          'facial droop', 'paralyzed face', 'crooked face'
        ] 
      }
    },
    {
      id: 'stroke_signs_arm',
      action: 'ER',
      reason: 'Signos de derrame cerebral (brazo) - cada minuto cuenta',
      when: { 
        text_contains_any: [
          'no puedo levantar el brazo', 'me débilitó el brazo',
          'brazo débil de un lado', 'no siento el brazo',
          'incapacidad para levantar el brazo', 'brazo flojo sin fuerza',
          'no puedo mover el brazo', 'brazo izquierdo débil', 'brazo derecho débil',
          'no puedo mover el lado derecho', 'no puedo mover el lado izquierdo',
          'weakness on one side', 'arm weakness', 'cant raise my arm', 'left arm is weak',
          'right arm feels heavy', 'cant lift arm', 'arm numbness',
          'one arm drags', 'weakness in extremity', 'cant move my arm',
          'side of body weak', 'hemiparesis', 'parálisis de un lado'
        ] 
      }
    },
    {
      id: 'stroke_signs_speech',
      action: 'ER',
      reason: 'Signos de derrame cerebral (habla) - cada minuto cuenta',
      when: { 
        text_contains_any: [
          'hablo enredado', 'no puedo hablar', 'no puedo hablar bien', 'mis palabras salen mal',
          'dificultad para hablar', 'lengua trabada', 'no articulo bien las palabras',
          'habla confusa', 'no me salen las palabras',
          'palabras sin sentido', 'no se le entiende', 'afasia',
          'slurred speech', 'cant speak properly', 'trouble speaking',
          'speech difficulty', 'cant find words', 'words are jumbled',
          'speech is garbled', 'hard to talk', 'aphasia', 'garbled speech'
        ] 
      }
    },
    {
      id: 'stroke_direct_terms',
      action: 'ER',
      reason: 'Posible accidente cerebrovascular - cada minuto cuenta',
      when: { 
        text_contains_any: [
          'derrame cerebral', 'embolia', 'accidente cerebrovascular',
          'acv', 'infarto cerebral', 'isquemia cerebral', 'derrame en el cerebro',
          'derrame', 'stroke', 'cva', 'cerebrovascular accident', 'brain attack',
          'ischemic stroke', 'hemorrhagic stroke', 'mini stroke', 'tia'
        ]
      }
    },
    {
      id: 'tia_transient',
      action: 'URGENT',
      reason: 'Ataque isquémico transitorio - síntomas que duraron poco',
      when: {
        text_contains_any: [
          'duró unos minutos', 'duró 20 minutos', 'se me pasó en 20 minutos',
          'se me pasó completamente', 'pasó como si nada', 'sintomas que duraron poco',
          'resolved symptoms', 'lasted 20 minutes', 'went away completely'
        ]
      }
    },
    {
      id: 'tia_stroke',
      action: 'URGENT',
      reason: 'Ataque isquémico transitorio - alto riesgo de derrame',
      when: {
        text_contains_any: [
          'se me pasó en 20 minutos', 'duró unos minutos y se quitó',
          'transient ischemic attack', 'tia', 'mini stroke symptoms resolved',
          'síntomas que duraron poco', 'debilidad que se resolvió'
        ]
      }
    },

    // ============================================================================
    // SEIZURES - Convulsiones
    // ============================================================================
    {
      id: 'seizure_emergency',
      action: 'ER',
      reason: 'Actividad convulsiva - emergencia neurológica',
      when: { 
        text_contains_any: [
          'convulsiones', 'ataque epiléptico', 'espasmos incontrolables',
          'temblores violentos', 'crisis convulsiva', 'epiléptico convulsionando',
          'sacudidas en el cuerpo', 'espasmos musculares',
          'pérdida de conciencia con movimientos', 'convulsionando',
          'ataque de epilepsia', 'crisis epiléptica', 'espasmo convulsivo',
          'temblores convulsivos', 'status epilepticus',
          'seizure', 'convulsion', 'having a seizure', 'epileptic seizure',
          'uncontrollable shaking', 'violent shaking', 'full body convulsion',
          'tonic clonic seizure', 'grand mal seizure', 'body shaking uncontrollably',
          'muscle spasms', 'convulsing', 'seizing', 'epilepsy attack',
          'status epilepticus', 'fit'
        ] 
      }
    },
    {
      id: 'prolonged_seizure',
      action: 'ER',
      reason: 'Estado epileptico - convulsión prolongada >5 minutos',
      when: {
        text_contains_any: [
          'convulsionando desde hace', 'lleva convulsionando',
          'no para de convulsionar', 'más de 5 minutos convulsionando',
          'prolonged seizure', 'seizure wont stop', 'status epilepticus'
        ]
      }
    },

    // ============================================================================
    // LOSS OF CONSCIOUSNESS - Pérdida de Conciencia
    // ============================================================================
    {
      id: 'loss_consciousness',
      action: 'ER',
      reason: 'Pérdida de conciencia - requiere evaluación médica urgente',
      when: { 
        text_contains_any: [
          'me desmayé', 'perdí el conocimiento', 'me desvanecí', 'quedé inconsciente',
          'me dio un desmayo', 'desmayo repentino', 'pérdida de conciencia',
          'sincope', 'me caí desmayado', 'me falté', 'me di un golpe y me desmayé',
          'desmayé y no recuerdo', 'perdí el conocimiento de golpe',
          'inconsciente', 'unconscious',
          'passed out', 'fainted', 'lost consciousness', 'unconscious',
          'blackout', 'fainting', 'collapsed', 'passed out and fell',
          'syncopy', 'fell down unconscious', 'knocked out', 'lose consciousness',
          'fainting spell', 'dropped unconscious', 'passed out suddenly',
          'went unconscious'
        ] 
      }
    },
    {
      id: 'syncope_vasovagal_clear',
      action: 'PRIMARY',
      reason: 'Síncope vasovagal con desencadenante claro',
      when: {
        all: [
          {
            text_contains_any: [
              'me desmayé', 'desmayo', 'sincope', 'fainted', 'syncope'
            ]
          },
          {
            text_contains_any: [
              'sacar sangre', 'agujas', 'phlebotomy', 'blood draw',
              'recuperé rápido', 'recovered quickly', 'segundos'
            ]
          }
        ]
      }
    },
    {
      id: 'syncope_vasovagal',
      action: 'PRIMARY',
      reason: 'Síncope vasovagal con desencadenante claro y recuperación rápida',
      when: {
        all: [
          {
            text_contains_any: [
              'me desmayé', 'desmayo', 'sincope', 'syncope', 'fainted'
            ]
          },
          {
            text_contains_any: [
              'cuando me sacaron sangre', 'ver sangre', 'agujas', 'phobia',
              'recuperé en segundos', 'recuperé rápido', 'duró poco',
              'clear trigger', 'recovered quickly'
            ]
          }
        ]
      }
    },

    // ============================================================================
    // SEVERE BLEEDING - Hemorragias
    // ============================================================================
    {
      id: 'severe_bleeding',
      action: 'ER',
      reason: 'Hemorragia severa - aplique presión y busque atención médica inmediata',
      when: { 
        text_contains_any: [
          'sangrado que no para', 'hemorragia que no para', 'sangrado mucho',
          'sangrado profuso', 'me estoy desangrando', 'sangre sale sin parar',
          'hemorragia severa', 'hemorragia abundante', 'sangrado incontrolable', 
          'pierdo mucha sangre', 'estoy sangrando mucho',
          'sangrado abundante', 'hemorragia activa', 'sangra la herida sin cesar',
          'sangre a chorros', 'sangrado intenso', 'hemorragia interna',
          'vomito sangre', 'sangre en orina', 'sangrado rectal',
          'hemorragia nasal continua',
          'hemorragia', 'hemorrhage',
          'severe bleeding', 'heavy bleeding', 'bleeding wont stop',
          'uncontrolled bleeding', 'gushing blood', 'losing blood fast',
          'hemorrhage', 'profuse bleeding', 'bleeding heavily',
          'cant stop bleeding', 'blood everywhere', 'major blood loss',
          'arterial bleeding', 'vomiting blood', 'coughing up blood',
          'blood in urine', 'rectal bleeding', 'nosebleed wont stop',
          'excessive bleeding', 'life threatening bleeding'
        ] 
      }
    },

    // ============================================================================
    // ANAPHYLAXIS - Anafilaxia
    // ============================================================================
    {
      id: 'anaphylaxis',
      action: 'ER',
      reason: 'Anafilaxia - reacción alérgica severa que puede ser mortal',
      when: { 
        text_contains_any: [
          'anafilaxia', 'reacción alérgica grave', 'garganta cerrada',
          'me cierro la garganta', 'hinchazón de la lengua', 'labios hinchados',
          'labios hinchadas', 'cara hinchada', 'cara hinchados', 'dificultad para tragar por alergia',
          'hinchazón en ojos', 'edema de glotis', 'no puedo tragar',
          'garganta apretada', 'hinchazón repentina en cara',
          'shock anafiláctico', 'alergia severa', 'no puedo respirar por alergia',
          'anaphylaxis', 'anaphylactic shock', 'throat closing',
          'throat swelling shut', 'tongue swollen', 'swollen lips',
          'face swelling', 'cant swallow from allergy', 'swollen eyes',
          'allergic reaction severe', 'airway closing', 'difficulty swallowing',
          'lips swollen', 'sudden face swelling', 'severe allergy',
          'cant breathe due to allergy', 'epipen needed', 'hives with swelling',
          'swelling all over'
        ] 
      }
    },
    {
      id: 'anaphylaxis_emergency',
      action: 'ER',
      reason: 'Anafilaxia - reacción alérgica severa que compromete vía aérea',
      when: {
        text_contains_any: [
          'garganta cerrándose', 'garganta se cierra', 'cierro la garganta',
          'hinchazón lengua', 'lengua hinchada', 'lengua se hincha',
          'dificultad para tragar', 'no puedo tragar',
          'ronchas por todo el cuerpo', 'urticaria generalizada',
          'sensación de muerte inminente alérgica', 'shock alérgico',
          'throat closing', 'throat is closing', 'closing throat',
          'tongue swelling', 'swollen tongue', 'tongue is swollen',
          'difficulty swallowing', 'cant swallow',
          'hives all over', 'generalized hives', 'urticaria all over',
          'anaphylaxis', 'anaphylactic shock', 'severe allergic reaction'
        ]
      }
    },

    // ============================================================================
    // THUNDERCLAP HEADACHE - Cefalea Thunderclap
    // ============================================================================
    {
      id: 'thunderclap_headache',
      action: 'ER',
      reason: 'Cefalea thunderclap - posible hemorragia subaracnoidea',
      when: { 
        text_contains_any: [
          'peor dolor de cabeza de mi vida', 'dolor de cabeza explosivo',
          'cefalea de inicio súbito', 'dolor de cabeza que llegó de golpe',
          'cefalea thunderclap', 'dolor de cabeza repentino e intenso',
          'dolor de cabeza excesivo', 'dolor de cabeza que me dobla',
          'migraña severa de repente', 'dolor de cabeza como un martillazo',
          'worst headache of my life', 'thunderclap headache',
          'sudden severe headache', 'explosive headache', 'headache came on suddenly',
          'splitting headache', 'came out of nowhere headache',
          'severe headache instant', 'worst head pain ever', 'thunder headache'
        ] 
      }
    },

    // ============================================================================
    // MENINGITIS - Meningitis
    // ============================================================================
    {
      id: 'meningitis_signs',
      action: 'ER',
      reason: 'Rigidez de nuca con fiebre - posible meningitis',
      when: { 
        text_contains_any: [
          'cuello rígido con fiebre', 'rigidez de nuca con fiebre', 'meningitis',
          'cuello rígido fiebre alta', 'rigidez nuca fiebre',
          'no puedo mover el cuello', 'cuello muy rígido', 'nuca rígida',
          'fotofobia', 'luz me molesta mucho', 'manchas rojas en la piel',
          'petechial rash', 'neck stiffness', 'meningeal signs',
          'kernig sign', 'brudzinski', 'photophobia'
        ] 
      }
    },

    // ============================================================================
    // ENCEPHALITIS - Encefalitis
    // ============================================================================
    {
      id: 'encephalitis_er',
      action: 'ER',
      reason: 'Encefalitis - confusión con fiebre',
      when: {
        all: [
          {
            text_contains_any: [
              'confundido', 'confused', 'no reconoce', 'delirio', 'delirium'
            ]
          },
          {
            text_contains_any: [
              'fiebre', 'fever', 'convulsiones', 'seizures', 'temperatura alta'
            ]
          }
        ]
      }
    },
    {
      id: 'encephalitis_emergency',
      action: 'ER',
      reason: 'Encefalitis - confusión aguda con fiebre y convulsiones',
      when: {
        all: [
          {
            text_contains_any: [
              'confundido', 'confusión', 'no reconoce', 'habla sin sentido',
              'delirio', 'altered mental status', 'confused'
            ]
          },
          {
            text_contains_any: [
              'fiebre', 'temperatura alta', 'convulsiones', 'fever', 'seizure'
            ]
          }
        ]
      }
    },
    {
      id: 'encephalitis',
      action: 'ER',
      reason: 'Confusión aguda con fiebre y convulsiones - posible encefalitis',
      when: {
        all: [
          {
            text_contains_any: [
              'confusión', 'no reconoce', 'habla cosas sin sentido',
              'desorientado', 'altered mental status', 'confused'
            ]
          },
          {
            text_contains_any: [
              'fiebre', 'temperatura alta', 'convulsiones', 'fever', 'seizure'
            ]
          }
        ]
      }
    },

    // ============================================================================
    // GUILLAIN-BARRE - Síndrome de Guillain-Barré
    // ============================================================================
    {
      id: 'guillain_barre',
      action: 'ER',
      reason: 'Parálisis ascendente - posible síndrome de Guillain-Barré',
      when: {
        text_contains_any: [
          'debilidad subió', 'parálisis subiendo', 'empezó en los pies y subió',
          'ascending paralysis', 'guillain barre', 'debilidad ascendente'
        ]
      }
    },

    // ============================================================================
    // PREGNANCY EMERGENCIES - Complicaciones Obstétricas
    // ============================================================================
    {
      id: 'pregnancy_emergency_context',
      action: 'ER',
      reason: 'Complicación del embarazo - acuda a urgencias obstétricas inmediatamente',
      when: { 
        all: [
          { isPregnant: true },
          {
            text_contains_any: [
              'sangrado', 'sangrando', 'dolor abdominal', 'dolor intenso',
              'liquido', 'líquido', 'contracciones', 'no siento movimientos',
              'dolor de cabeza', 'vision borrosa', 'hinchazon', 'hinchazón',
              'preeclampsia', 'preeclampsia', 'sangrado uterino', 'dolor pelvico',
              'parto pretermino', 'desprendimiento de placenta', 'vaginal bleeding',
              'abdominal pain', 'leaking fluid', 'contractions', 'decreased fetal movement',
              'baby not moving', 'severe headache', 'blurred vision', 'swollen face',
              'swollen hands', 'eclampsia', 'placental abruption', 'miscarriage'
            ]
          }
        ]
      }
    },
    {
      id: 'placental_abruption',
      action: 'ER',
      reason: 'Desprendimiento de placenta - emergencia obstétrica',
      when: {
        all: [
          {
            text_contains_any: [
              'embarazada', 'embarazo', 'embarazada de', 'pregnant'
            ]
          },
          {
            text_contains_any: [
              'sangrado mucho', 'sangrado vaginal intenso', 'bebe no se mueve',
              'dolor muy fuerte en el vientre', 'heavy bleeding', 'baby not moving'
            ]
          }
        ]
      }
    },
    {
      id: 'pregnancy_emergency_text',
      action: 'ER',
      reason: 'Complicación del embarazo - acuda a urgencias obstétricas inmediatamente',
      when: { 
        text_contains_any: [
          'embarazada y tengo sangrado', 'sangrado vaginal durante embarazo',
          'sangrado durante el embarazo', 'embarazada y sangrado', 
          'embarazada sangrado', 'embarazo sangrado', 'estando embarazada',
          'embarazada dolor intenso', 'dolor abdominal intenso embarazada',
          'embarazada dolor abdominal', 'dolor abdominal intenso estando embarazada',
          'pierdo liquido embarazada', 'pierdo líquido embarazada', 
          'embarazada pierdo liquido', 'pierdo líquido', 'pierdo liquido',
          'pierdo líquido vaginal', 'pierdo liquido vaginal', 'perdida de liquido',
          'pérdida de líquido', 'pérdida de líquido amniótico', 'perdida de liquido amniotico',
          'contracciones', 'contracciones prematuras', 'contracciones antes de tiempo',
          'contracciones antes de tiempo', 'parto prematuro', 'parto pretermino',
          'no siento movimientos del bebe', 'no siento movimientos del bebé',
          'no siento al bebe', 'no siento al bebé', 'falta de movimientos',
          'no siento movimientos', 'no siento movimientos bebé',
          'embarazada dolor cabeza intenso', 'dolor de cabeza severo en el embarazo',
          'dolor de cabeza severo embarazo', 'dolor cabeza severo embarazada',
          'embarazada vision borrosa', 'embarazo vision borrosa', 
          'vision borrosa estando embarazada', 'visión borrosa estando embarazada',
          'vision borrosa en embarazo', 'visión borrosa en embarazo',
          'embarazada hinchazon', 'embarazada hinchazón',
          'hinchazón en cara y manos', 'hinchazon en cara y manos',
          'hinchazón cara manos embarazada', 'hinchazón en cara y manos embarazada',
          'preeclampsia', 'posible preeclampsia', 'preclampsia', 'eclampsia',
          'sangrado uterino', 'dolor pélvico severo', 'dolor pelvico severo',
          'parto pretérmino', 'parto pretermino', 'desprendimiento de placenta',
          'fiebre alta durante el embarazo', 'fiebre embarazo', 'fiebre durante embarazo',
          'golpe durante el embarazo', 'caida durante el embarazo',
          'caída durante el embarazo', 'golpe embarazo', 'caida embarazo', 'caída embarazo',
          'golpe durante', 'caida durante', 'caída durante',
          'pregnant and bleeding', 'vaginal bleeding during pregnancy',
          'pregnant bleeding', 'bleeding while pregnant', 'severe abdominal pain pregnant',
          'severe headache pregnant', 'water broke', 'leaking fluid pregnant',
          'pregnant and leaking', 'preterm labor', 'placental abruption',
          'pregnancy complications', 'miscarriage bleeding'
        ]
      }
    },
    {
      id: 'ectopic_pregnancy',
      action: 'ER',
      reason: 'Embarazo ectópico - emergencia obstétrica potencialmente mortal',
      when: {
        all: [
          {
            text_contains_any: [
              'embarazada', 'embarazo', 'pregnant', 'pregnancy'
            ]
          },
          {
            text_contains_any: [
              'dolor abdominal bajo', 'dolor en el lado', 'dolor intenso',
              'sangrado', 'sangrando', 'bleeding', 'spotting',
              'mareo severo', 'voy a desmayarme', 'dizzy'
            ]
          }
        ]
      }
    },

    // ============================================================================
    // ALTERED MENTAL STATUS - Alteración del Estado Mental
    // ============================================================================
    {
      id: 'altered_mental_status',
      action: 'ER',
      reason: 'Alteración del estado mental - requiere evaluación médica urgente',
      when: { 
        text_contains_any: [
          'confusión', 'desorientado', 'no reconoce', 'alteración de conciencia',
          'desorientación', 'memoria perdida', 'confused', 'disoriented',
          'doesnt recognize anyone', 'altered mental status', 'memory loss',
          'sudden confusion', 'delirium', 'doesnt know where', 'cant think clearly',
          'mental status change', 'confusion sudden onset', 'doesnt know name'
        ] 
      }
    },

    // ============================================================================
    // ACUTE ABDOMEN - Abdomen Agudo
    // ============================================================================
    {
      id: 'acute_abdomen',
      action: 'URGENT',
      reason: 'Signos de abdomen agudo - posible emergencia quirúrgica',
      when: { 
        text_contains_any: [
          'abdomen rígido', 'abdomen duro', 'defensa abdominal',
          'dolor abdominal severo', 'rigid abdomen', 'hard stomach',
          'board like abdomen', 'guarding abdomen', 'severe abdominal pain',
          'acute abdominal pain', 'stomach rigid', 'belly hard as rock',
          'rebound tenderness', 'abdominal guarding', 'severe belly pain'
        ] 
      }
    },
    {
      id: 'appendicitis_er',
      action: 'ER',
      reason: 'Apendicitis - abdomen agudo',
      when: {
        text_contains_any: [
          'apendicitis', 'apéndice', 'appendicitis', 'appendix',
          'fosa iliaca derecha', 'right lower quadrant',
          'dolor en el costado derecho', 'migró desde el ombligo'
        ]
      }
    },
    {
      id: 'appendicitis_rlq',
      action: 'ER',
      reason: 'Apendicitis - dolor en fosa iliaca derecha con migra',
      when: {
        text_contains_any: [
          'apendicitis', 'apéndice', 'dolor en el lado derecho bajo',
          'fosa iliaca derecha', 'migró hacia fosa iliaca', 'right lower quadrant',
          'dolor en el costado derecho', 'punto doloroso McBurney'
        ]
      }
    },
    {
      id: 'appendicitis',
      action: 'ER',
      reason: 'Apendicitis - dolor en fosa iliaca derecha con fiebre',
      when: {
        text_contains_any: [
          'apendicitis', 'apéndice', 'dolor en el lado derecho bajo',
          'fosa iliaca derecha', 'dolor migra hacia fosa iliaca',
          'appendicitis', 'appendix', 'right lower quadrant pain'
        ]
      }
    },
    {
      id: 'peritonitis_emergency',
      action: 'ER',
      reason: 'Peritonitis - abdomen rígido con fiebre y vómitos',
      when: {
        all: [
          {
            text_contains_any: [
              'abdomen rígido', 'abdomen duro', 'peritoneal', 'defensa',
              'rigid abdomen', 'hard stomach', 'rebound'
            ]
          },
          {
            text_contains_any: [
              'fiebre', 'vómitos', 'temperatura alta', 'fever', 'vomiting'
            ]
          }
        ]
      }
    },
    {
      id: 'peritonitis',
      action: 'ER',
      reason: 'Peritonitis - abdomen rígido con fiebre y vómitos',
      when: {
        all: [
          {
            text_contains_any: [
              'abdomen rígido', 'abdomen duro', 'peritoneal', 'peritonitis'
            ]
          },
          {
            text_contains_any: [
              'fiebre', 'vómitos', 'vomiting', 'fever', 'nausea'
            ]
          }
        ]
      }
    },
    {
      id: 'pancreatitis',
      action: 'URGENT',
      reason: 'Pancreatitis aguda - dolor epigástrico severo',
      when: {
        text_contains_any: [
          'pancreatitis', 'dolor epigástrico', 'epigastric pain',
          'dolor en la boca del estómago', 'dolor alto del abdomen',
          'dolor que irradia a la espalda', 'pain radiating to back'
        ]
      }
    },

    // ============================================================================
    // VISION EMERGENCIES - Emergencias Oftalmológicas
    // ============================================================================
    {
      id: 'vision_emergency',
      action: 'URGENT',
      reason: 'Pérdida súbita de visión - acuda a urgencias oftalmológicas',
      when: { 
        text_contains_any: [
          'perdida de vision subita', 'ceguera repentina', 'no veo',
          'vision negra', 'sudden vision loss', 'sudden blindness',
          'cant see', 'vision went black', 'lost vision suddenly',
          'sudden blurry vision', 'vision gone', 'blindness onset',
          'cant see out of one eye', 'sudden vision darkness'
        ] 
      }
    },
    {
      id: 'acute_glaucoma_er',
      action: 'ER',
      reason: 'Glaucoma agudo - emergencia oftalmológica',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de ojo severo', 'severe eye pain', 'dolor intenso en el ojo',
              'ojo muy rojo', 'eye very red'
            ]
          },
          {
            text_contains_any: [
              'halos', 'halos around lights', 'náuseas', 'nausea',
              'dolor de cabeza', 'headache', 'ver halos'
            ]
          }
        ]
      }
    },
    {
      id: 'acute_angle_closure_glaucoma',
      action: 'ER',
      reason: 'Glaucoma agudo - dolor ocular severo con halos y náuseas',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de ojo', 'ojo muy rojo', 'eye pain', 'red eye', 'severe eye pain'
            ]
          },
          {
            text_contains_any: [
              'halos alrededor de luces', 'veo halos', 'halo vision', 'halos',
              'náuseas', 'dolor de cabeza', 'nausea', 'headache'
            ]
          }
        ]
      }
    },
    {
      id: 'acute_glaucoma',
      action: 'ER',
      reason: 'Glaucoma agudo de ángulo cerrado - emergencia oftalmológica',
      when: {
        text_contains_any: [
          'dolor de ojo severo', 'dolor intenso en el ojo', 'ojo muy rojo',
          'halos alrededor de luces', 'halo vision', 'náuseas con dolor de ojo',
          'acute glaucoma', 'angle closure', 'severe eye pain', 'halos around lights'
        ]
      }
    },

    // ============================================================================
    // DVT - Trombosis Venosa Profunda
    // ============================================================================
    {
      id: 'dvt_emergency',
      action: 'URGENT',
      reason: 'Posible trombosis venosa profunda - riesgo de embolia pulmonar',
      when: { 
        text_contains_any: [
          'pierna hinchada', 'dolor en la pantorrilla', 'pierna roja y caliente',
          'pierna hinchada y roja', 'leg swollen', 'swollen calf',
          'pain in calf', 'red hot leg', 'one leg bigger than other',
          'calf pain and swelling', 'leg pain and redness', 'swollen leg',
          'calf tenderness', 'deep vein thrombosis'
        ] 
      }
    },

    // ============================================================================
    // VITAL SIGNS - Signos Vitales Críticos
    // ============================================================================
    {
      id: 'low_oxygen',
      action: 'ER',
      reason: 'Saturación de oxígeno baja es una emergencia',
      when: { 'vitals.spo2_lt': 92 }
    },
    {
      id: 'critical_fever',
      action: 'URGENT',
      reason: 'Fiebre muy alta - riesgo de sepsis',
      when: { 
        text_contains_any: [
          'fiebre 40', 'fiebre 41', 'fiebre 42', 'temperatura muy alta',
          'fiebre que no baja', 'temperature 104', 'high fever',
          'fiebre de 40', 'fiebre de 41', 'fiebre de 42',
          'fiebre alta', 'fiebre muy alta', 'también fiebre', 'y tambien fiebre'
        ] 
      }
    },
    {
      id: 'hyperthermia',
      action: 'ER',
      reason: 'Hipertermia severa - temperatura >40°C',
      when: {
        text_contains_any: [
          'fiebre 40.5', 'fiebre 41', 'temperatura 40', 'hipertermia',
          'temperature 105', '106 fever', 'hyperthermia'
        ]
      }
    },

    // ============================================================================
    // SEVERE PAIN - Dolor Severo
    // ============================================================================
    {
      id: 'severe_pain',
      action: 'URGENT',
      reason: 'Dolor severo - requiere evaluación médica urgente',
      when: {
        text_contains_any: [
          'dolor insoportable', 'dolor intenso', 'dolor severo', 'dolor extremo',
          'dolor agonizante', 'dolor que no aguanto', 'dolor incontrolable',
          'dolor insoportable en el abdomen', 'dolor severo en el abdomen',
          'dolor intenso abdominal', 'dolor insoportable abdominal',
          'severe pain', 'intense pain', 'unbearable pain', 'extreme pain',
          'agonizing pain', 'pain is unbearable', 'severe abdominal pain'
        ]
      }
    },

    // ============================================================================
    // INFECTION SIGNS - Signos de Infección
    // ============================================================================
    {
      id: 'infection_signs',
      action: 'URGENT',
      reason: 'Signos de infección - requiere atención médica urgente',
      when: {
        text_contains_any: [
          'pus', 'herida tiene pus', 'supuración', 'secreción amarilla',
          'roja y caliente', 'hinchazón roja', 'inflamación con pus',
          'infección en la herida', 'herida infectada', 'zona roja y caliente',
          'absceso', 'colección de pus', 'secreción de la herida',
          'puss', 'wound has pus', 'oozing', 'discharge yellow',
          'red and hot', 'swollen and red', 'infected wound',
          'signs of infection'
        ]
      }
    },
    {
      id: 'endocarditis_fever',
      action: 'URGENT',
      reason: 'Endocarditis - fiebre con soplo cardiaco',
      when: {
        all: [
          {
            text_contains_any: [
              'fiebre', 'fiebre alta', 'temperatura alta', 'fever'
            ]
          },
          {
            text_contains_any: [
              'soplo en el corazón', 'soplo cardiaco', 'escucha un raro',
              'heart murmur', 'murmur'
            ]
          }
        ]
      }
    },
    {
      id: 'endocarditis',
      action: 'URGENT',
      reason: 'Endocarditis - fiebre con soplo cardiaco',
      when: {
        all: [
          {
            text_contains_any: [
              'fiebre', 'fiebre prolongada', 'temperatura alta', 'fever'
            ]
          },
          {
            text_contains_any: [
              'soplo en el corazón', 'soplo cardiaco', 'heart murmur',
              'escucha un raro en el corazón', 'valvular'
            ]
          }
        ]
      }
    },

    // ============================================================================
    // DIABETIC EMERGENCIES - Emergencias Diabéticas
    // ============================================================================
    {
      id: 'diabetic_ketoacidosis',
      action: 'ER',
      reason: 'Cetoacidosis diabética - emergencia metabólica',
      when: {
        all: [
          {
            text_contains_any: [
              'diabetes tipo 1', 'insulina', 'diabético', 'type 1 diabetes'
            ]
          },
          {
            text_contains_any: [
              'sed excesiva', 'mucho sed', 'orino mucho', 'poliuria',
              'aliento huele raro', 'fruity breath', 'náuseas', 'vómitos',
              'respiración rápida', 'kusmaul', 'confusión', 'desorientación'
            ]
          }
        ]
      }
    },
    {
      id: 'severe_hypoglycemia',
      action: 'ER',
      reason: 'Hipoglucemia severa con riesgo de pérdida de consciencia',
      when: {
        all: [
          {
            text_contains_any: [
              'azúcar baja', 'glucosa baja', 'sugar low', 'low sugar',
              'hypoglycemia', 'hipoglucemia', 'glucose low', 'low glucose'
            ]
          },
          {
            text_contains_any: [
              'me desmayo', 'voy a desmayarme', 'perdiendo consciencia',
              'confusión extrema', 'no puedo pensar', 'sudoración extrema',
              'temblor severo', 'shaking badly', 'passing out',
              'losing consciousness', 'severe confusion'
            ]
          }
        ]
      }
    },
    {
      id: 'thyroid_storm',
      action: 'ER',
      reason: 'Tormenta tiroidea - emergencia endocrinológica',
      when: {
        text_contains_any: [
          'fiebre muy alta', 'corazón a mil', 'taquicardia extrema',
          'hipertiroidismo', 'graves disease', 'thyroid storm',
          'temblor severo', 'diarrea', 'agitación extrema'
        ]
      }
    },

    // ============================================================================
    // CARDIAC ARRHYTHMIAS - Arritmias Cardíacas
    // ============================================================================
    {
      id: 'bradycardia_symptomatic',
      action: 'URGENT',
      reason: 'Bradicardia sintomática - corazón lento con mareo o desmayo',
      when: {
        all: [
          {
            text_contains_any: [
              'corazón lento', 'latido lento', 'pulso bajo', 'heart rate low',
              'bradicardia', 'latía muy lento', 'beat very slow'
            ]
          },
          {
            text_contains_any: [
              'mareo', 'desmayo', 'me voy a desmayar', 'débil', 'weak',
              'fatiga', 'cansancio extremo', 'dizziness', 'syncope'
            ]
          }
        ]
      }
    },
    {
      id: 'heart_failure_decomp',
      action: 'URGENT',
      reason: 'Descompensación de insuficiencia cardiaca',
      when: {
        all: [
          {
            text_contains_any: [
              'insuficiencia cardiaca', 'heart failure', 'falla cardiaca'
            ]
          },
          {
            text_contains_any: [
              'dificultad para respirar', 'me cuesta respirar', 'disnea',
              'ortopnea', 'tengo que dormir con almohadas', 'piernas hinchadas',
              'edema', 'shortness of breath', 'swollen legs'
            ]
          }
        ]
      }
    },
    {
      id: 'heart_failure_exacerbation',
      action: 'ER',
      reason: 'Descompensación de insuficiencia cardiaca',
      when: {
        all: [
          {
            text_contains_any: [
              'insuficiencia cardiaca', 'heart failure', 'cardiaco crónico'
            ]
          },
          {
            text_contains_any: [
              'dificultad para respirar', 'ortopnea', 'me ahogo al acostarme',
              'edema', 'piernas hinchadas', 'no puedo dormir',
              'tengo que dormir sentado', 'shortness of breath'
            ]
          }
        ]
      }
    },

    // ============================================================================
    // UROLOGICAL EMERGENCIES - Emergencias Urológicas
    // ============================================================================
    {
      id: 'testicular_torsion_er',
      action: 'ER',
      reason: 'Torsión testicular - emergencia quirúrgica',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor testicular', 'dolor en el testículo', 'testicular pain',
              'escroto', 'scrotal', 'testicle pain'
            ]
          },
          {
            text_contains_any: [
              'empezó de repente', 'súbito', 'sudden onset', 'horrible pain',
              'muy hinchado', 'very swollen', 'testículo alto', 'high riding'
            ]
          }
        ]
      }
    },
    {
      id: 'testicular_torsion_acute',
      action: 'ER',
      reason: 'Torsión testicular - dolor testicular súbito con náuseas',
      when: {
        text_contains_any: [
          'dolor testicular', 'dolor en el testículo', 'testículo hinchado',
          'testículo muy alto', 'escroto', 'dolor escrotal', 'testicular pain',
          'swollen testicle', 'testicular torsion', 'scrotal pain'
        ]
      }
    },
    {
      id: 'testicular_torsion',
      action: 'ER',
      reason: 'Torsión testicular - emergencia quirúrgica (tiempo crítico)',
      when: {
        text_contains_any: [
          'dolor testicular súbito', 'testículo hinchado', 'dolor en los testículos',
          'testículo muy alto', 'dolor escrotal', 'testicular torsion',
          'twisted testicle', 'severe testicular pain', 'scrotal pain'
        ]
      }
    },
    {
      id: 'kidney_stone_severe',
      action: 'URGENT',
      reason: 'Cálculo renal con dolor severo',
      when: {
        text_contains_any: [
          'cálculo renal', 'piedra en el riñón', 'dolor renal severo',
          'colico nefritico', 'kidney stone', 'renal colic'
        ]
      }
    },

    // ============================================================================
    // HEADACHE DISORDERS - Cefaleas
    // ============================================================================
    {
      id: 'tension_headache_primary',
      action: 'PRIMARY',
      reason: 'Cefalea tensional bilateral leve',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de cabeza bilateral', 'como una presión', 'band around head',
              'cefalea tensional', 'tension headache'
            ]
          },
          {
            text_contains_any: [
              'dolor leve', 'mild pain', '3 días', 'several days',
              'no es severo', 'not severe'
            ]
          }
        ]
      }
    },
    {
      id: 'tension_headache_bilateral',
      action: 'PRIMARY',
      reason: 'Cefalea tensional bilateral sin signos de alarma',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de cabeza bilateral', 'como una presión', 'cinturón en la cabeza',
              'bilateral headache', 'pressure headache', 'band around head'
            ]
          },
          {
            text_contains_any: [
              'dolor leve', 'dolor moderado', 'no es severo', 'sin náuseas',
              'mild headache', 'not severe', 'stress related'
            ]
          }
        ]
      }
    },
    {
      id: 'migraine_aura_primary',
      action: 'PRIMARY',
      reason: 'Migraña con aura - manejo ambulatorio',
      when: {
        all: [
          {
            text_contains_any: [
              'migraña', 'migraine', 'dolor de cabeza de un lado'
            ]
          },
          {
            text_contains_any: [
              'veo luces', 'manchas en la visión', 'aura visual', 'visual aura',
              'luces destellando', 'flashing lights', 'spots in vision'
            ]
          }
        ]
      }
    },
    {
      id: 'migraine_primary',
      action: 'PRIMARY',
      reason: 'Migraña con aura - manejo ambulatorio',
      when: {
        all: [
          {
            text_contains_any: [
              'migraña', 'dolor de cabeza de un lado', 'migraine',
              'unilateral headache', 'dolor de cabeza unilateral'
            ]
          },
          {
            text_contains_any: [
              'veo luces', 'manchas en la visión', 'aura visual', 'fotofobia',
              'visual aura', 'light sensitivity', 'seeing spots'
            ]
          }
        ]
      }
    },
    {
      id: 'migraine',
      action: 'PRIMARY',
      reason: 'Migraña - dolor de cabeza unilateral con fotofobia',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de cabeza unilateral', 'dolor de cabeza de un lado',
              'migraña', 'migraine', 'unilateral headache'
            ]
          },
          {
            text_contains_any: [
              'luz me molesta', 'fotofobia', 'fotofobia', 'nausea',
              'light sensitivity', 'photophobia', 'aura', 'visual disturbance'
            ]
          }
        ]
      }
    },
    {
      id: 'tension_headache',
      action: 'PRIMARY',
      reason: 'Cefalea tensional - dolor bilateral tipo presión',
      when: {
        text_contains_any: [
          'dolor de cabeza bilateral', 'como una presión', 'cinturón en la cabeza',
          'dolor de cabeza leve', 'dolor de cabeza de 3 días',
          'tension headache', 'bilateral headache', 'pressure headache',
          'band around head', 'stress headache'
        ]
      }
    },

    // ============================================================================
    // FACIAL PARALYSIS - Parálisis Facial
    // ============================================================================
    {
      id: 'bells_palsy_primary',
      action: 'PRIMARY',
      reason: 'Parálisis de Bell - no dolorosa',
      when: {
        all: [
          {
            text_contains_any: [
              'no puedo mover la cara', 'facial paralysis', 'cara caída',
              'boca caída', 'boca torcida'
            ]
          },
          {
            text_contains_any: [
              'sin dolor', 'no me duele', 'painless', 'no pain'
            ]
          }
        ]
      }
    },
    {
      id: 'bells_palsy_facial',
      action: 'PRIMARY',
      reason: 'Parálisis de Bell - parálisis facial unilateral sin dolor',
      when: {
        all: [
          {
            text_contains_any: [
              'no puedo mover la cara', 'mitad de la cara paralizada',
              'cara paralizada de un lado', 'facial paralysis'
            ]
          },
          {
            text_contains_any: [
              'sin dolor', 'no me duele', 'painless', 'no pain'
            ]
          }
        ]
      }
    },
    {
      id: 'bells_palsy',
      action: 'PRIMARY',
      reason: 'Parálisis de Bell - parálisis facial unilateral sin otros síntomas',
      when: {
        text_contains_any: [
          'no puedo mover la mitad de la cara', 'parálisis facial de un lado',
          'cara paralizada de un lado sin dolor', 'bells palsy',
          'facial paralysis painless', 'unilateral facial weakness'
        ]
      }
    },

    // ============================================================================
    // RESPIRATORY NON-URGENT - Respiratorio No Urgente
    // ============================================================================
    {
      id: 'panic_anxiety_disorder',
      action: 'PRIMARY',
      reason: 'Ataque de pánico en paciente con trastorno de ansiedad conocido',
      when: {
        all: [
          {
            text_contains_any: [
              'ataque de pánico', 'crisis de ansiedad', 'me tiemblan las manos',
              'corazón me late muy fuerte', 'siento que me voy a morir'
            ]
          },
          {
            text_contains_any: [
              'trastorno de ansiedad', 'ansiedad conocida', 'panic disorder',
              'anxiety disorder', 'tengo ansiedad diagnosticada'
            ]
          }
        ]
      }
    },
    {
      id: 'common_cold',
      action: 'SELFCARE',
      reason: 'Resfriado común - puede manejarse con autocuidado en casa',
      when: {
        all: [
          {
            text_contains_any: [
              'resfriado', 'gripa leve', 'gripe leve', 'nariz tapada',
              'congestión nasal leve', 'estornudos', 'estornudo', 'mocos',
              'secreción nasal', 'catarro', 'dolor de garganta leve', 'tos leve',
              'malestar general leve', 'gripe común', 'resfrío', 'constipado',
              'moqueo', 'está congestionado', 'me congestioné', 'me dio gripe',
              'me dio resfriado', 'síntomas de gripe leves', 'síntomas de resfriado',
              'tengo un catarro', 'cold symptoms', 'common cold', 'stuffy nose'
            ]
          },
          {
            text_contains_any: [
              'no fiebre', 'sin fiebre', 'afebril', 'no tengo fiebre',
              'puedo hacer actividades', 'sintomas leves', 'mild symptoms'
            ]
          }
        ]
      }
    },
    {
      id: 'allergic_rhinitis_primary',
      action: 'PRIMARY',
      reason: 'Rinitis alérgica estacional',
      when: {
        text_contains_any: [
          'estornudo mucho', 'picazón en la nariz', 'estornudos constantes',
          'moqueo claro', 'rinitis alérgica', 'alergia estacional',
          'sneezing a lot', 'itchy nose', 'clear runny nose', 'seasonal allergies'
        ]
      }
    },
    {
      id: 'allergic_rhinitis',
      action: 'PRIMARY',
      reason: 'Rinitis alérgica - manejo con antihistamínicos',
      when: {
        text_contains_any: [
          'estornudo mucho', 'picazón en la nariz', 'picazón en los ojos',
          'moqueo claro', 'rinitis alérgica', 'alergia estacional',
          'estornudos constantes', 'alergia en esta época',
          'sneezing a lot', 'itchy nose', 'itchy eyes', 'clear runny nose',
          'seasonal allergies', 'allergic rhinitis'
        ]
      }
    },
    {
      id: 'acute_bronchitis_primary',
      action: 'PRIMARY',
      reason: 'Bronquitis aguda sin fiebre',
      when: {
        all: [
          {
            text_contains_any: [
              'tos', 'cough', 'bronquitis', 'bronchitis'
            ]
          },
          {
            text_contains_any: [
              'flema', 'phlegm', 'mucus', 'sin fiebre', 'no fever',
              'una semana', 'one week'
            ]
          }
        ]
      }
    },
    {
      id: 'acute_bronchitis',
      action: 'PRIMARY',
      reason: 'Bronquitis aguda - manejo sintomático',
      when: {
        all: [
          {
            text_contains_any: [
              'tos', 'cough', 'bronquitis', 'bronchitis'
            ]
          },
          {
            text_contains_any: [
              'flema', 'mucus', 'phlegm', 'sin fiebre', 'no fiebre',
              'tos desde hace una semana', 'cough for a week'
            ]
          }
        ]
      }
    },
    {
      id: 'common_cold_primary',
      action: 'PRIMARY',
      reason: 'Resfriado común - no fiebre',
      when: {
        all: [
          {
            text_contains_any: [
              'moqueo', 'congestión nasal', 'estornudos', 'runny nose',
              'congestion', 'sneezing', 'tos leve', 'mild cough'
            ]
          },
          {
            text_contains_any: [
              'no fiebre', 'sin fiebre', 'no tengo fiebre', 'no fever',
              'puedo hacer actividades', 'activities normal'
            ]
          }
        ]
      }
    },
    {
      id: 'upper_respiratory_infection',
      action: 'PRIMARY',
      reason: 'Infección respiratoria superior - manejo ambulatorio',
      when: {
        all: [
          {
            text_contains_any: [
              'moqueo', 'estornudos', 'dolor de garganta', 'congestión nasal',
              'runny nose', 'sneezing', 'sore throat', 'nasal congestion'
            ]
          },
          {
            text_contains_any: [
              'no fiebre', 'sin fiebre', 'puedo hacer mis actividades',
              'sintomas leves', 'no fever', 'mild symptoms'
            ]
          }
        ]
      }
    },
    {
      id: 'hemoptysis_smoker',
      action: 'URGENT',
      reason: 'Hemoptisis en fumador - evaluación urgente para cáncer',
      when: {
        all: [
          {
            text_contains_any: [
              'tos con sangre', 'escupo sangre', 'sangre en la tos',
              'hemoptisis', 'coughing blood', 'blood in sputum'
            ]
          },
          {
            text_contains_any: [
              'perdida de peso', 'pérdida de peso', 'weight loss',
              'fumador', 'smoker', 'años fumando', 'pack years'
            ]
          }
        ]
      }
    },
    {
      id: 'lung_cancer_concern',
      action: 'URGENT',
      reason: 'Tos con sangre y pérdida de peso - requiere evaluación urgente',
      when: {
        text_contains_any: [
          'tos con sangre', 'tos sangre', 'hemoptisis', 'coughing blood',
          'perdida de peso', 'pérdida de peso', 'weight loss',
          'fumador de muchos años', 'heavy smoker', 'smoking history'
        ]
      }
    },

    // ============================================================================
    // MENTAL HEALTH NON-URGENT - Salud Mental No Urgente
    // ============================================================================
    {
      id: 'panic_attack_primary',
      action: 'PRIMARY',
      reason: 'Ataque de pánico - manejo ambulatorio sin riesgo vital',
      when: {
        all: [
          {
            text_contains_any: [
              'ataque de pánico', 'crisis de ansiedad', 'me siento ansioso',
              'me tiemblan las manos', 'palpitaciones', 'panic attack'
            ]
          },
          {
            text_contains_any: [
              'no me voy a morir', 'no es emergencia', 'ansiedad conocida',
              'trastorno de ansiedad', 'anxiety disorder', 'creo que'
            ]
          }
        ]
      }
    },
    {
      id: 'panic_attack_anxiety',
      action: 'PRIMARY',
      reason: 'Ataque de pánico en paciente con historial',
      when: {
        all: [
          {
            text_contains_any: [
              'me tiemblan las manos', 'palpitaciones', 'me falta el aire',
              'siento que me voy a morir', 'shaking hands', 'heart racing'
            ]
          },
          {
            text_contains_any: [
              'ansiedad', 'anxiety', 'pánico', 'panic', 'ataque de pánico'
            ]
          }
        ]
      }
    },
    {
      id: 'panic_attack',
      action: 'PRIMARY',
      reason: 'Ataque de pánico - manejo ambulatorio',
      when: {
        all: [
          {
            text_contains_any: [
              'ataque de pánico', 'panic attack', 'ansiedad severa', 'severe anxiety'
            ]
          },
          {
            text_contains_any: [
              'me tiemblan las manos', 'me falta el aire', 'palpitaciones',
              'creo que me voy a morir', 'siento que me voy a volver loco',
              'hands shaking', 'heart racing', 'feel like dying'
            ]
          }
        ]
      }
    },
    {
      id: 'adjustment_situational_primary',
      action: 'PRIMARY',
      reason: 'Trastorno adaptativo situacional',
      when: {
        all: [
          {
            text_contains_any: [
              'perdí mi trabajo', 'lost my job', 'divorcio', 'divorce',
              'problema familiar', 'family problem'
            ]
          },
          {
            text_contains_any: [
              'no pienso hacerme daño', 'no suicidal', 'situational',
              'pasando por un momento', 'going through', 'difficult time'
            ]
          }
        ]
      }
    },
    {
      id: 'adjustment_disorder_situational',
      action: 'PRIMARY',
      reason: 'Trastorno de adaptación por situación estresante',
      when: {
        all: [
          {
            text_contains_any: [
              'perdí mi trabajo', 'divorcio', 'separación', 'problema familiar',
              'lost my job', 'divorce', 'separation', 'family issues'
            ]
          },
          {
            text_contains_any: [
              'no pienso en hacerme daño', 'no quiero morir', 'solo estoy triste',
              'pasando por un momento', 'no suicidal', 'just sad', 'going through'
            ]
          }
        ]
      }
    },
    {
      id: 'adjustment_disorder',
      action: 'PRIMARY',
      reason: 'Trastorno de adaptación - manejo ambulatorio con psicoterapia',
      when: {
        all: [
          {
            text_contains_any: [
              'perdí mi trabajo', 'problemas familiares', 'divorcio', 'separación',
              'lost my job', 'family issues', 'divorce', 'separation',
              'mudanza', 'cambio de ciudad', 'enfermedad de un familiar'
            ]
          },
          {
            text_contains_any: [
              'no puedo dormir bien', 'dificultad para conciliar el sueño',
              'insomnio por el estrés', 'no pienso en hacerme daño', 
              'no quiero morir', 'no es para tanto',
              'cant sleep well', 'insomnia from stress', 'no suicidal'
            ]
          }
        ]
      }
    },

    // ============================================================================
    // CHEST WALL PAIN - Dolor Torácico No Cardíaco
    // ============================================================================
    {
      id: 'costochondritis_primary',
      action: 'PRIMARY',
      reason: 'Costocondritis - dolor reproducible al tacto',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor en el pecho', 'chest pain', 'dolor torácico'
            ]
          },
          {
            text_contains_any: [
              'al tocar', 'tender to touch', 'reproducible', 'pressing',
              'toca la zona', 'tender chest', 'pain when pressed'
            ]
          }
        ]
      }
    },
    {
      id: 'costochondritis_palpation',
      action: 'PRIMARY',
      reason: 'Costocondritis - dolor reproducible al tacto',
      when: {
        text_contains_any: [
          'dolor en el pecho al tocar', 'dolor aumenta al tocar',
          'dolor torácico reproducible', 'chest pain reproducible',
          'reproducible tenderness', 'tender to touch', 'pain when pressing'
        ]
      }
    },
    {
      id: 'costochondritis',
      action: 'PRIMARY',
      reason: 'Costocondritis - dolor torácico musculoesquelético',
      when: {
        text_contains_any: [
          'dolor en el pecho que aumenta al tocar', 'dolor torácico al presionar',
          'dolor en las costillas', 'costochondritis', 'chest wall pain',
          'reproducible chest pain', 'tender chest wall'
        ]
      }
    },
    {
      id: 'pericarditis_primary',
      action: 'PRIMARY',
      reason: 'Pericarditis posicional',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor en el pecho', 'chest pain', 'dolor torácico'
            ]
          },
          {
            text_contains_any: [
              'mejor inclinándome', 'peor al acostarme', 'mejora inclinado',
              'better leaning', 'worse lying down', 'positional'
            ]
          }
        ]
      }
    },
    {
      id: 'pericarditis_positional',
      action: 'PRIMARY',
      reason: 'Pericarditis - dolor peor al acostarse, mejor inclinado',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor en el pecho', 'dolor torácico', 'chest pain'
            ]
          },
          {
            text_contains_any: [
              'mejor inclinándome', 'mejor sentado', 'peor al acostarme',
              'empeora al acostarse', 'mejora inclinado', 'better leaning forward',
              'worse lying down', 'positional pain'
            ]
          }
        ]
      }
    },
    {
      id: 'pericarditis',
      action: 'PRIMARY',
      reason: 'Pericarditis - dolor pleurítico posicional',
      when: {
        text_contains_any: [
          'dolor en el pecho punzante', 'dolor peor al acostarme',
          'mejor inclinándome hacia adelante', 'dolor pleurítico',
          'pericarditis', 'sharp chest pain', 'worse lying down',
          'better leaning forward', 'pleuritic pain'
        ]
      }
    },

    // ============================================================================
    // TRAUMA EMERGENCIES - Trauma
    // ============================================================================
    {
      id: 'multiple_trauma',
      action: 'ER',
      reason: 'Trauma múltiple - evaluación de emergencia',
      when: {
        text_contains_any: [
          'accidente de coche', 'choque', 'accidente automovilístico',
          'caída de altura', 'golpe en la cabeza', 'pérdida de consciencia',
          'car accident', 'motor vehicle accident', 'mva', 'crash',
          'multiple trauma', 'fall from height', 'head injury'
        ]
      }
    },
    {
      id: 'head_injury',
      action: 'ER',
      reason: 'Trauma craneoencefálico - evaluación urgente',
      when: {
        text_contains_any: [
          'golpe en la cabeza', 'trauma craneal', 'perdí el conocimiento',
          'desmayo tras golpe', 'head injury', 'head trauma',
          'concussion', 'conmoción cerebral', 'golpe fuerte en la cabeza'
        ]
      }
    },

    // ============================================================================
    // PEDIATRIC EMERGENCIES - Emergencias Pediátricas
    // ============================================================================
    {
      id: 'pediatric_respiratory_distress',
      action: 'ER',
      reason: 'Dificultad respiratoria pediátrica - emergencia',
      when: {
        text_contains_any: [
          'bebe no respira bien', 'mi bebé tiene dificultad para respirar',
          'hunden las costillas', 'tiraje', 'ruido al respirar',
          'estridor', 'bebe cianotico', 'baby not breathing',
          'retractions', 'grunting', 'stridor'
        ]
      }
    },
    {
      id: 'bronchiolitis_infant',
      action: 'URGENT',
      reason: 'Bronquiolitis en lactante - evaluación pediátrica urgente',
      when: {
        text_contains_any: [
          'bebe', 'bebé', 'lactante', 'infant', '6 meses', '6 meses',
          'bronquiolitis', 'bronchiolitis', 'dificultad para respirar bebe',
          'tiraje', 'hunden las costillas', 'ruido al respirar'
        ]
      }
    },
    {
      id: 'bronchiolitis',
      action: 'URGENT',
      reason: 'Bronquiolitis - evaluación pediátrica urgente',
      when: {
        text_contains_any: [
          'bebe con tos', 'bebe congestionado', 'bronquiolitis',
          'dificultad para respirar en bebe', 'prematuro con gripe',
          'bronchiolitis', 'baby wheezing', 'infant respiratory'
        ]
      }
    },

    // ============================================================================
    // PRIMARY CARE - Síntomas Crónicos (Consulta Regular)
    // ============================================================================
    {
      id: 'chronic_symptoms',
      action: 'PRIMARY',
      reason: 'Síntomas crónicos o de larga duración - consulta médica regular recomendada',
      when: {
        text_contains_any: [
          'dolor de espalda desde hace', 'dolor crónico', 'diabetes',
          'hipotiroidismo', 'hipertiroidismo', 'hipertensión', 'presión alta',
          'tiroides', 'checkup', 'chequeo médico', 'revisión médica',
          'control médico', 'screening', 'prevención', 'examenes de rutina',
          'análisis de sangre de control', 'colesterol alto', 'triglicéridos altos',
          'dolor persistente', 'malestar constante', 'semanas con dolor',
          'meses con dolor', 'años con dolor', 'dolor recurrente',
          'problema de largo plazo', 'condición crónica', 'enfermedad crónica',
          'seguimiento médico'
        ]
      }
    },
    {
      id: 'angina_exertion_primary',
      action: 'PRIMARY',
      reason: 'Angina estable con esfuerzo',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de pecho', 'chest pain', 'opresión', 'pressure'
            ]
          },
          {
            text_contains_any: [
              'cuando camino', 'subo escaleras', 'walking', 'stairs',
              'esfuerzo', 'exertion', 'desaparece al descansar', 'rest relieves'
            ]
          }
        ]
      }
    },
    {
      id: 'stable_angina_exertion',
      action: 'PRIMARY',
      reason: 'Angina estable - dolor con esfuerzo que cesa con reposo',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de pecho', 'chest pain', 'opresión en el pecho'
            ]
          },
          {
            text_contains_any: [
              'cuando camino', 'al subir escaleras', 'con el esfuerzo',
              'desaparece al descansar', 'se quita con el reposo',
              'when walking', 'going upstairs', 'with exertion', 'rest relieves'
            ]
          }
        ]
      }
    },
    {
      id: 'stable_angina',
      action: 'PRIMARY',
      reason: 'Angina estable - dolor de pecho con esfuerzo que cesa con reposo',
      when: {
        all: [
          {
            text_contains_any: [
              'dolor de pecho al caminar', 'dolor de pecho al subir escaleras',
              'opresión con el esfuerzo', 'chest pain with exertion'
            ]
          },
          {
            text_contains_any: [
              'se quita con descanso', 'desaparece al descansar',
              'lleva varias semanas', 'crónico', 'chronic'
            ]
          }
        ]
      }
    },
    {
      id: 'skin_issues',
      action: 'PRIMARY',
      reason: 'Problemas dermatológicos no urgentes - consulta con médico general o dermatólogo',
      when: {
        text_contains_any: [
          'acné', 'manchas en la piel', 'erupción cutánea', 'sarpullido',
          'eczema', 'dermatitis', 'psoriasis', 'lunares', 'verrugas',
          'hongos en la piel', 'pie de atleta', 'caspa', 'seborrea',
          'piel seca', 'piel grasa', 'alergia en la piel leve', 'picazón leve',
          'comezón leve', 'problema de piel', 'consulta dermatológica',
          'revisión de piel', 'acne', 'granos', 'espinillas', 'barros',
          'skin rash', 'pimples'
        ]
      }
    },

    // ============================================================================
    // SELF CARE - Condiciones Leves (Autocuidado)
    // ============================================================================
    {
      id: 'common_cold_simple',
      action: 'SELFCARE',
      reason: 'Resfriado común - puede manejarse con autocuidado en casa',
      when: {
        text_contains_any: [
          'resfriado', 'gripa leve', 'gripe leve', 'nariz tapada',
          'congestión nasal leve', 'estornudos', 'estornudo', 'mocos',
          'secreción nasal', 'catarro', 'dolor de garganta leve', 'tos leve',
          'malestar general leve', 'gripe común', 'resfrío', 'constipado',
          'moqueo', 'está congestionado', 'me congestioné', 'me dio gripe',
          'me dio resfriado', 'síntomas de gripe leves', 'síntomas de resfriado',
          'tengo un catarro', 'cold symptoms', 'common cold', 'stuffy nose'
        ]
      }
    },
    {
      id: 'minor_injuries',
      action: 'SELFCARE',
      reason: 'Lesiones menores - pueden tratarse con primeros auxilios básicos en casa',
      when: {
        text_contains_any: [
          'raspeón', 'raspón', 'raspón pequeño', 'raspeón pequeño',
          'corte pequeño', 'cortadura pequeña', 'herida superficial',
          'rasguño', 'arañazo', 'piquete de insecto', 'picadura de mosquito',
          'picadura de abeja', 'moretón leve', 'moretón pequeño',
          'golpe leve', 'torcedura leve', 'esguince leve', 'quemadura leve',
          'quemadura superficial', 'ampolla pequeña', 'callo',
          'dureza en el pie', 'uña encarnada leve', 'corte leve',
          'me corté el dedo', 'me corté levemente', 'pequeña herida',
          'lesión menor', 'small cut', 'minor injury', 'small scrape', 'minor cut'
        ]
      }
    }
  ];
}

/**
 * Main triage evaluation function
 * Evaluates a message against red flag rules
 *
 * Performance: Automatically tracks emergency detection time
 * Target: <100ms p99
 */
export function evaluateRedFlags(input: {
  message: string;
  intake?: TriageIntake
}): TriageResult {
  return measureEmergencyDetection(
    () => {
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

      // Check if this is an informational query (asking about someone else or past events)
      const isInfoQuery = isInformationalQuery(input.message);

      // Check if this is a purely educational query (not a real emergency)
      const isEducational = isEducationalQuery(input.message);

      // Get critical rule IDs and categories from data
      const criticalRuleIds = getCriticalRuleIds();
      const criticalCategories = getCriticalRuleCategories();

      // Evaluate each rule
      for (const rule of rules) {
        // Skip emergency rules for informational queries (except critical conditions - always check)
        // Critical conditions: mental health, pregnancy, stroke, cardiac, severe bleeding, anaphylaxis
        const isCriticalRule = rule.id && criticalCategories.some(id => rule.id.includes(id));
        
        // Skip non-critical ER rules for informational queries
        if (isInfoQuery && rule.action === 'ER' && !isCriticalRule) {
          continue;
        }
        
        // Skip ALL rules for purely educational queries
        // Educational queries like "Explain stroke to me" or "What are your hours?" 
        // are not real medical concerns
        if (isEducational) {
          continue;
        }
        
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
      const severityScores = getSeverityScores();
      const severity = worstAction ? severityScores[worstAction] : 0;

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
    },
    {
      operation: 'red_flags_evaluation',
      message_length: String(input.message?.length || 0),
      has_intake: String(Boolean(input.intake)),
    }
  ).result;
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
      const isMentalHealthEmergency = ruleIds.includes('suicidal_ideation') || 
                                       ruleIds.includes('suicide_plan_intent') ||
                                       ruleIds.includes('command_hallucinations');
      return [
        '🚨 EMERGENCIA: Busca atención médica inmediata',
        'Llama al 911 o acude a urgencias',
        'No conduzcas tú mismo si es posible',
        'Si hay signos de infarto: mastica una aspirina mientras esperas ayuda',
        isMentalHealthEmergency ? '📞 Línea de la Vida 24/7: 800 911 2000' : '',
        isMentalHealthEmergency ? '📞 SAPTEL 24/7: 55 5259 8121' : '',
        isMentalHealthEmergency ? '💚 No estás solo/a. La ayuda está disponible.' : ''
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
export function getCareLevelInfoExport(level: CareLevel): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const info = getCareLevelInfo(level);
  return {
    label: info.label,
    color: info.color,
    icon: info.icon,
    description: info.description
  };
}

// Re-export with the original name for backward compatibility
export { getCareLevelInfoExport as getCareLevelInfo };

/**
 * Check if symptoms indicate a mental health crisis
 * Comprehensive detection of suicidal ideation and self-harm patterns
 */
export function isMentalHealthCrisis(message: string): boolean {
  const mentalHealthKeywords = [
    // Spanish patterns
    'quiero morir', 'quiero suicidarme', 'quiero matarme', 
    'pienso en quitarme la vida', 'no quiero vivir más', 
    'no quiero estar vivo', 'no quiero estar viva',
    'no quiero seguir viviendo', 'no quiero seguir vivo',
    'voy a acabar con mi vida', 'mejor muerto', 'mejor muerta',
    'no vale la pena vivir', 'quiero dejar de existir',
    'plan suicida', 'pensamientos suicidas', 'ideación suicida',
    'autolesionarse', 'me quiero autolesionar', 'quiero autolesionarme', 'autolesionarme',
    'quiero hacerme daño', 'quiero cortarme',
    'voy a tirarme de un edificio', 'voy a tomar pastillas para morir',
    'no encuentro razones para vivir', 'la vida no tiene sentido',
    'quiero desaparecer', 'estoy harto de vivir', 'estoy harta de vivir',
    'no quiero vivir', 'acabar con mi vida', 'no vale la pena',
    'mejor si no existiera', 'autolesión', 'cortarme', 'hacerme daño',
    'suicidarme', 'suicidio', 'quitarme la vida',
    'me voy a matar', 'me voy a suicidar', 'me quiero matar',
    'tengo ganas de morir', 'tengo ganas de morirme',
    
    // English patterns
    'want to die', 'kill myself', 'suicidal thoughts', 'want to end my life',
    'end my life', 'planning suicide', 'suicide plan', 'dont want to live',
    'better off dead', 'no point living', 'want to disappear',
    'self harm', 'want to hurt myself', 'cut myself', 'end it all',
    'not worth living', 'want to commit suicide', 'going to kill myself',
    'suicide', 'hopeless', 'no reason to live'
  ];
  
  const lowerMessage = message.toLowerCase();
  return mentalHealthKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Get mental health resources
 * Returns comprehensive list of crisis support resources in Mexico
 */
export function getMentalHealthResourcesExport(): string[] {
  const resources = getMentalHealthResources();
  return [
    `📞 ${resources[0].name}: ${resources[0].phone} (${resources[0].availability}, ${resources[0].cost})`,
    `📞 ${resources[1].name}: ${resources[1].phone} (${resources[1].availability})`,
    `📞 ${resources[2].name}: ${resources[2].phone} (${resources[2].availability})`,
    '💬 Chat de apoyo disponible en nuestra plataforma',
    'No estás solo/a. Hay ayuda disponible.'
  ];
}

// Re-export with the original name for backward compatibility
export { getMentalHealthResourcesExport as getMentalHealthResources };
