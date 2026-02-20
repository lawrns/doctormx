/**
 * Enhanced Red Flag Detection System with Patient Context
 * Comprehensive emergency symptom detection for Mexican healthcare context
 * Includes condition-based detection, medication interactions, and urgency scoring
 * 
 * @module lib/ai/red-flags-enhanced
 * @example
 * ```typescript
 * import { detectRedFlagsEnhanced, getUrgencyDescription } from '@/lib/ai/red-flags-enhanced';
 * 
 * const result = detectRedFlagsEnhanced('Tengo dolor de pecho severo', {
 *   age: 55,
 *   conditions: ['diabetes', 'hypertension'],
 *   medications: [{ name: 'metformina' }]
 * });
 * 
 * if (result.requiresEmergencyEscalation) {
 *   console.log('Emergency detected!', result.flags);
 * }
 * ```
 */

/** Severity levels for red flags */
export type RedFlagSeverity = 'critical' | 'high' | 'moderate';

/**
 * Patient context for enhanced red flag detection
 */
export interface PatientContext {
  /** Patient age in years */
  age?: number;
  /** Pregnancy status */
  pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'unknown';
  /** List of medical conditions */
  conditions?: string[];
  /** Current medications */
  medications?: Array<{ name: string; dosage?: string }>;
  /** Known allergies */
  allergies?: string[];
  /** Current vital signs */
  vitalSigns?: {
    bloodPressure?: string; // e.g., "140/90"
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
}

/**
 * Red flag definition with detection pattern and metadata
 */
export interface RedFlag {
  /** RegExp pattern to detect the flag in text */
  pattern: RegExp;
  /** Human-readable message describing the flag */
  message: string;
  /** Severity level */
  severity: RedFlagSeverity;
  /** Medical category (e.g., 'Cardiac', 'Neurological') */
  category: string;
  /** Recommendation for the patient */
  recommendation: string;
  /** Whether 911 should be called immediately */
  requiresImmediate911: boolean;
  /** Conditions that make this flag more severe */
  conditionSpecific?: string[];
  /** Medications that interact with this condition */
  medicationInteractions?: string[];
  /** Urgency score 1-10 */
  urgencyScore: number;
}

/**
 * Result of red flag detection
 */
export interface RedFlagResult {
  /** Whether any red flags were detected */
  detected: boolean;
  /** Array of detected flags with details */
  flags: Array<{
    message: string;
    severity: RedFlagSeverity;
    category: string;
    recommendation: string;
    requiresImmediate911: boolean;
    urgencyScore: number;
  }>;
  /** Highest severity detected or null */
  highestSeverity: RedFlagSeverity | null;
  /** Whether emergency escalation is required */
  requiresEmergencyEscalation: boolean;
  /** Overall urgency score 1-10 */
  urgencyScore: number;
  /** Medication interaction alerts */
  medicationAlerts: string[];
  /** Condition context information */
  conditionContext: string[];
}

/**
 * Medication interaction database
 * Maps medication names to interacting symptoms and alerts
 */
export const MEDICATION_INTERACTIONS = {
  // Warfarin/Coumadin interactions
  warfarina: {
    interactingSymptoms: ['sangrado', 'hemorragia', 'moretones', 'encías sangrantes', 'bleeding', 'hemorrhage', 'nosebleed'],
    alert: 'Paciente en anticoagulación: sangrado requiere evaluación inmediata',
    urgencyBonus: 2,
  },
  coumadin: {
    interactingSymptoms: ['sangrado', 'hemorragia', 'moretones', 'encías sangrantes', 'bleeding', 'hemorrhage', 'nosebleed'],
    alert: 'Paciente en anticoagulación (Coumadin): sangrado requiere evaluación inmediata',
    urgencyBonus: 2,
  },
  acenocumarol: {
    interactingSymptoms: ['sangrado', 'hemorragia', 'moretones', 'encías sangrantes', 'bleeding', 'hemorrhage', 'nosebleed'],
    alert: 'Paciente en anticoagulación: sangrado requiere evaluación inmediata',
    urgencyBonus: 2,
  },
  aspirin: {
    interactingSymptoms: ['sangrado', 'hemorragia', 'moretones', 'encías sangrantes', 'bleeding', 'hemorrhage', 'nosebleed'],
    alert: 'Paciente con aspirina: riesgo aumentado de sangrado',
    urgencyBonus: 1,
  },
  // Insulin
  insulina: {
    interactingSymptoms: ['confusión', 'sudoración', 'temblor', 'mareo', 'desmayo'],
    alert: 'Posible hipoglucemia en paciente diabético: revise glucosa',
    urgencyBonus: 1,
  },
  // Beta-blockers
  betabloqueantes: {
    interactingSymptoms: ['dificultad respirar', 'sibilancias', 'broncoespasmo'],
    alert: 'Paciente con betabloqueantes: puede empeorar asma/EPOC',
    urgencyBonus: 1,
  },
  // Diuretics
  diuréticos: {
    interactingSymptoms: ['mareo', 'desmayo', 'calambres', 'debilidad'],
    alert: 'Posible deshidratación o desbalance electrolítico en paciente con diuréticos',
    urgencyBonus: 1,
  },
  // ACE inhibitors
  ieca: {
    interactingSymptoms: ['hinchazón labios', 'hinchazón lengua', 'dificultad tragar', 'hinchados'],
    alert: 'Posible angioedema por IECA: suspensión inmediata requerida',
    urgencyBonus: 3,
  },
  enalapril: {
    interactingSymptoms: ['hinchazón labios', 'hinchazón lengua', 'hinchados'],
    alert: 'Posible angioedema por IECA: suspensión inmediata requerida',
    urgencyBonus: 3,
  },
};

/**
 * Condition-specific red flags
 * Additional flags to check when patient has specific conditions
 */
export const CONDITION_SPECIFIC_FLAGS = {
  diabetes: [
    {
      pattern: /confusión|confundido|desorientado|habla.*enredada|perdida.*conciencia|confused|disoriented|altered.*mental.*status|memory.*loss|sudden.*confusion|delirium|doesnt.*know.*where|cant.*think.*clearly|sweating|sudoracion|sudoroso|temblor|temblando|azucar|azúcar/i,
      message: 'Posible hiperglucemia o hipoglucemia - EMERGENCIA DIABÉTICA',
      severity: 'critical' as RedFlagSeverity,
      urgencyScore: 9,
      recommendation: 'Mida glucosa capilar inmediatamente. Si <70mg/dL administre carbohidratos.',
    },
    {
      pattern: /aliento.*frutal|respiración.*profunda|nauseas|vómito|dolor.*abdominal/i,
      message: 'Posible cetoacidosis diabética',
      severity: 'high' as RedFlagSeverity,
      urgencyScore: 8,
      recommendation: 'Acuda a urgencias. Requiere glucosa, cetonas y gasometría arterial.',
    },
    {
      pattern: /pie.*hinchado|pie.*rojo|úlceras.*pie|ampolla.*pie|herida.*no.*sana|pie.*diabetico|pie.*diabético/i,
      message: 'Posible pie diabético con infección',
      severity: 'high' as RedFlagSeverity,
      urgencyScore: 7,
      recommendation: 'Evaluación urgente para prevenir amputación. Cultivo de herida recomendado.',
    },
  ],
  hypertension: [
    {
      pattern: /dolor.*cabeza.*intenso|visión.*borrosa|zumbido.*oídos|dolor.*pecho/i,
      message: 'Posible crisis hipertensiva - EMERGENCIA',
      severity: 'critical' as RedFlagSeverity,
      urgencyScore: 9,
      recommendation: 'Mida presión arterial. Si >180/120 acuda a urgencias.',
    },
    {
      pattern: /hinchazón.*piernas|dificultad.*respirar.*acostado/i,
      message: 'Posible insuficiencia cardíaca por hipertensión',
      severity: 'high' as RedFlagSeverity,
      urgencyScore: 7,
      recommendation: 'Evaluación cardiológica urgente. Requiere ecocardiograma.',
    },
  ],
  pregnancy: [
    {
      pattern: /dolor.*cabeza.*intenso|visión.*borrosa|hinchazón.*cara|manos.*hinchados|severe.*headache|blurred.*vision|swollen.*face|swollen.*hands|preeclampsia|eclampsia/i,
      message: 'Posible preeclampsia - EMERGENCIA OBSTÉTRICA',
      severity: 'critical' as RedFlagSeverity,
      urgencyScore: 10,
      recommendation: 'Acuda a urgencias obstétricas INMEDIATAMENTE. Riesgo de eclampsia.',
    },
    {
      pattern: /sangrado.*vaginal|dolor.*abdominal|contracciones.*antes.*tiempo|perdida.*liquido/i,
      message: 'Complicación del embarazo - EMERGENCIA',
      severity: 'critical' as RedFlagSeverity,
      urgencyScore: 9,
      recommendation: 'Acuda a urgencias obstétricas. Posible aborto, parto pretérmino o desprendimiento.',
    },
    {
      pattern: /no.*siente.*movimientos.*bebe|menos.*movimientos.*bebe/i,
      message: 'Disminución de movimientos fetales',
      severity: 'high' as RedFlagSeverity,
      urgencyScore: 8,
      recommendation: 'Acuda a urgencias para monitorización fetal. Monitoreo NST requerido.',
    },
  ],
  copd: [
    {
      pattern: /dificultad.*respirar|labios.*azules|confusión|no.*puedo.*hablar/i,
      message: 'Exacerbación de EPOC - INSUFICIENCIA RESPIRATORIA',
      severity: 'critical' as RedFlagSeverity,
      urgencyScore: 9,
      recommendation: 'Mida SpO2. Si <92% acuda a urgencias. Requiere broncodilatadores y oxígeno.',
    },
  ],
  heart_failure: [
    {
      pattern: /dificultad.*respirar.*noche|despierto.*falta.*aire|hinchazón.*piernas|aumento.*peso.*rapido/i,
      message: 'Posible descompensación de insuficiencia cardíaca',
      severity: 'high' as RedFlagSeverity,
      urgencyScore: 8,
      recommendation: 'Acuda a urgencias. Requiere valoración de peso, diuréticos yBNP.',
    },
  ],
  chronic_kidney_disease: [
    {
      pattern: /orina.*poco|no.*orina|hinchazón.*todo|debilidad|nauseas|vómito/i,
      message: 'Posible falla renal aguda sobre ERC',
      severity: 'high' as RedFlagSeverity,
      urgencyScore: 8,
      recommendation: 'Acuda a urgencias. Requiere creatinina, BUN y electrolitos urgentes.',
    },
  ],
};

/**
 * Comprehensive red flag database
 * Each flag includes urgency score (1-10) and condition/medication context
 */
export const ENHANCED_RED_FLAGS: RedFlag[] = [
  // CRITICAL - IMMEDIATE 911 REQUIRED (Urgency 8-10)
  {
    pattern: /derrame.*cerebral|derrame|paralisis|parálisis|paralysis|debilidad.*extremo|cara.*colgada|cara.*caida|cara.*caída|cara.*caida|cara.*paralizada|paralisis.*cara|parálisis.*cara|cara.*cayó|cara.*cayo|se.*me.*cayó.*cara|se.*me.*cayo.*cara|brazo.*no.*puede.*levantar|no.*puede.*mover.*brazo|no.*puedo.*mover.*brazo|cara.*torcida|slurred.*speech|cant.*speak|speech.*difficulty|face.*drooping|arm.*weakness|facial.*paralysis|paralyzed.*face|face.*drooping|one.*side.*face.*numb|cant.*move.*one.*side.*face|facial.*droop|paralyzed.*face|crooked.*face|arm.*numbness|one.*arm.*drags|weakness.*extremity|cant.*raise.*arm|cant.*lift.*arm|left.*arm.*weak|right.*arm.*feels.*heavy|right.*arm.*heavy|left.*arm.*is.*weak|cant.*move.*arm|cant.*move.*my.*arm|slurred.*speech|cant.*speak.*properly|trouble.*speaking|speech.*difficulty|cant.*find.*words|words.*jumbled|speech.*garbled|hard.*talk|stroke|cva|cerebrovascular.*accident|cerebrovascular|brain.*attack|ischemic.*stroke|hemorrhagic.*stroke|mini.*stroke|tia|habla.*al.*reves|habla.*al.*revés|me.*habla.*al.*reves|me.*habla.*al.*revés|palabras.*al.*reves|palabras.*al.*revés/i,
    message: 'Posible accidente cerebrovascular (ACV) - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Protocolo FAST: Facial, Arms, Speech, Time',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension', 'diabetes', 'atrial_fibrillation'],
    medicationInteractions: ['warfarina', 'acenocumarol'],
    urgencyScore: 10,
  },
  
  // CRITICAL CARDIAC EMERGENCIES
  {
    pattern: /infarto|ataque.*corazón|ataque.*corazon|heart.*attack|myocardial.*infarction|miocardio|dolor.*pecho.*intenso|crushing.*chest.*pain|chest.*pain.*radiating|pain.*radiating.*left.*arm|dolor.*pecho.*brazo.*izquierdo|presión.*pecho|presion.*pecho|chest.*pressure|chest.*squeezing|tightness.*chest|angina|angina.*pecho|dolor.*torácico|dolor.*toracico|severe.*chest.*pain|heavy.*chest|chest.*heaviness|elephant.*sitting|chest.*discomfort|cardiac.*arrest|chest.*pain/i,
    message: 'Posible infarto de miocardio - EMERGENCIA CARDÍACA',
    severity: 'critical',
    category: 'Cardiac',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Mientras tanto, si está disponible, tome aspirina de 325mg (si no es alérgico)',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension', 'diabetes', 'high_cholesterol', 'smoking'],
    medicationInteractions: ['viagra', 'cialis', 'nitroglycerin'],
    urgencyScore: 10,
  },
  
  // CRITICAL RESPIRATORY EMERGENCIES
  {
    pattern: /no.*puedo.*respirar|dificultad.*respirar|dificultad.*para.*respirar|cannot.*breathe|cant.*breathe|difficulty.*breathing|shortness.*of.*breath|sob|falta.*aire|air.*hunger|asma.*grave|severe.*asthma|ataque.*asma|asthma.*attack|wheezing|sibilancias|asma.*bronquial|crisis.*asmática|crisis.*asmati|asma.*aguda|sibilancias.*pecho|sibilancias.*respirar|breathlessness|unable.*to.*breathe|gasping|jadeo|jadeando|ahogándose|ahogandose|drowning.*sensation|suffocating|sofocante|respiración.*agitada|breathing.*difficulty|lips.*blue|blue.*lips|labios.*azules|cyanosis|cyanotic|dyspnea|choking|gasping.*for.*air|cant.*catch.*breath|wheezing.*severely|face.*turning.*blue|lips.*are.*blue|air.*hunger|cant.*get.*air|chest.*tightness.*cant.*breathe|respiratory.*distress|struggling.*to.*breathe|severe.*asthma.*attack|bronchospasm/i,
    message: 'DIFICULTAD RESPIRATORIA SEVERA - Posible asfixia o emergencia respiratoria',
    severity: 'critical',
    category: 'Respiratory',
    recommendation: 'Llame al 911. Si tiene inhalador de rescate, úselo inmediatamente. Si tiene oxímetro, verifique SpO2',
    requiresImmediate911: true,
    conditionSpecific: ['asthma', 'copd', 'emphysema', 'heart_failure'],
    medicationInteractions: ['beta-blockers'],
    urgencyScore: 10,
  },
  
  // MENTAL HEALTH CRISES - SUICIDAL IDEATION
  {
    pattern: /quiero.*morir|quiero.*matarme|suicidarme|suicidio|me.*quiero.*matar|terminar.*todo|end.*it.*all|end.*my.*life|want.*to.*end.*my.*life|kill.*myself|want.*to.*kill.*myself|going.*to.*kill.*myself|want.*to.*die|suicidal|thoughts.*suicide|suicidal.*thoughts|suicide.*plan|planning.*suicide|want.*to.*commit.*suicide|commit.*suicide|no.*quiero.*vivir|dont.*want.*to.*live|i.*dont.*want.*to.*live|mejor.*sin.*mi|better.*off.*dead|better.*off.*without.*me|no.*hay.*salida|no.*way.*out|no.*point.*living|not.*worth.*living|want.*to.*disappear|puente.*demasiado.*lejos|bridge.*too.*far|pastillas.*morir|pills.*to.*die|cortarme.*muñecas|cut.*myself|cut.*my.*wrists|want.*to.*hurt.*myself|hurt.*myself|ahorcarme|hang.*myself|saltar.*puente|jump.*off.*bridge|overdose|sobredosis|autolesion|self.*harm/i,
    message: 'CRISIS DE SALUD MENTAL - Ideación suicida detectada',
    severity: 'critical',
    category: 'Psychiatric',
    recommendation: 'Llame al 911 o al 800-911-2000 (Línea de Crisis). NO deje a la persona sola.',
    requiresImmediate911: true,
    conditionSpecific: ['depression', 'bipolar', 'ptsd', 'anxiety'],
    medicationInteractions: ['antidepressants'],
    urgencyScore: 10,
  },
  
  // SEVERE BLEEDING/HEMORRHAGE
  {
    pattern: /sangrado.*severo|sangrado.*abundante|sangrando.*mucho|bleeding.*heavily|severe.*bleeding|hemorragia|hemorrhage|sangre.*no.*para|bleeding.*wont.*stop|sangrado.*arterial|arterial.*bleeding|sangre.*pulsa|blood.*pulsing|herida.*profunda|deep.*wound|cortada.*grande|large.*cut|amputación|amputation|perdí.*dedo|lost.*finger|extremidad.*cortada|severed.*limb|nosebleed|epistaxis|sangrado.*nariz|heavy.*bleeding|uncontrolled.*bleeding|gushing.*blood|losing.*blood.*fast|profuse.*bleeding|cant.*stop.*bleeding|blood.*everywhere|major.*blood.*loss|vomiting.*blood|coughing.*up.*blood|blood.*in.*urine|rectal.*bleeding|excessive.*bleeding|life.*threatening.*bleeding/i,
    message: 'HEMORRAGIA SEVERA - Riesgo de choque hipovolémico',
    severity: 'critical',
    category: 'Trauma',
    recommendation: 'Llame al 911. Aplique presión directa con gas limpio. Eleve la extremidad si es posible.',
    requiresImmediate911: true,
    conditionSpecific: ['bleeding_disorder', 'hemophilia'],
    medicationInteractions: ['warfarina', 'acenocumarol', 'aspirin', 'clopidogrel'],
    urgencyScore: 10,
  },
  
  // ANAPHYLAXIS / SEVERE ALLERGIC REACTION
  {
    pattern: /alergia.*grave|severe.*allergy|anafilaxia|anaphylaxis|anaphylactic|shock.*allergy|hinchazón.*garganta|swollen.*throat|throat.*closing|throat.*swelling|throat.*tightness|garganta.*cerrando|dificultad.*tragar|difficulty.*swallowing|cant.*swallow|swollen.*tongue|tongue.*swollen|tongue.*swelling|lengua.*hinchada|labios.*hinchados|swollen.*lips|lips.*swollen|mouth.*swelling|cara.*hinchada|swollen.*face|face.*swelling|ojos.*hinchados|swollen.*eyes|eyes.*swollen|ronchas.*generalizadas|generalized.*hives|hives.*with.*swelling|urticaria.*severa|severe.*urticaria|picazón.*generalizada|generalized.*itching|swelling.*all.*over|airway.*closing|epipen|epi.*pen|cant.*breathe.*allergy|shock.*alérgico|allergic.*shock|reacción.*alérgica.*grave|severe.*allergic.*reaction|allergic.*reaction.*severe/i,
    message: 'ANAFILAXIA - Reacción alérgica severa potencialmente mortal',
    severity: 'critical',
    category: 'Allergic',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Si tiene epinefrina (EpiPen), úsela ahora.',
    requiresImmediate911: true,
    conditionSpecific: ['allergies', 'asthma'],
    medicationInteractions: ['beta-blockers', 'ace-inhibitors'],
    urgencyScore: 10,
  },
  
  // PREGNANCY EMERGENCIES
  {
    pattern: /sangrado.*embarazo|bleeding.*pregnancy|pregnant.*bleeding|dolor.*embarazo.*severo|severe.*pregnancy.*pain|severe.*abdominal.*pain.*pregnant|contracciones.*tempranas|early.*contractions|contractions.*too.*early|bolsa.*agua.*rompió|water.*broke|ruptura.*membranas|membrane.*rupture|leaking.*fluid.*pregnant|fiebre.*embarazo|fever.*pregnancy|visión.*borrosa.*embarazo|blurred.*vision.*pregnancy|dolor.*cabeza.*embarazo|headache.*pregnant|severe.*headache.*pregnant|hinchazón.*embarazo|swelling.*pregnancy|swollen.*face.*hands.*pregnant|movimientos.*bebé.*disminuyeron|decreased.*fetal.*movement|baby.*not.*moving|no.*siento.*bebé|calambres.*embarazo|cramps.*pregnancy|preeclampsia|eclampsia|placental.*abruption|placenta.*previa|miscarriage.*bleeding|pregnancy.*complications|preterm.*labor/i,
    message: 'EMERGENCIA OBSTÉTRICA - Posible complicación del embarazo',
    severity: 'critical',
    category: 'Pregnancy',
    recommendation: 'Acuda a urgencias obstétricas INMEDIATAMENTE.',
    requiresImmediate911: true,
    conditionSpecific: ['pregnancy', 'preeclampsia', 'gestational_diabetes'],
    medicationInteractions: ['warfarina'],
    urgencyScore: 10,
  },
  
  // SEIZURES
  {
    pattern: /convulsión|convulsion|seizure|ataque|epileptic.*fit|epilepsia.*ataque|perdida.*consciencia|loss.*consciousness|desmayo.*convulsivo|convulsive.*fainting|espasmos|spasms|mordiendo.*lengua|biting.*tongue|espuma.*boca|foaming.*mouth|eyes.*rolling|ojos.*volteados|rigidez|rigidity|tonic.*clonic|convulsión.*tónico.*clónica|convulsion.*tonico.*clonica|grand.*mal|fits|convulsing|seizure.*now|uncontrolled.*shaking|uncontrollable.*shaking|body.*rigidity|convulsive.*movements|postictal|absence.*seizure|seizing|violent.*shaking|full.*body.*convulsion|body.*shaking|muscle.*spasms|fit.*seizure|epilepsy.*attack|status.*epilepticus/i,
    message: 'CONVULSIÓN - Emergencia neurológica',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. No ponga nada en la boca. Proteja la cabeza. Gírela de lado después.',
    requiresImmediate911: true,
    conditionSpecific: ['epilepsy', 'diabetes'],
    medicationInteractions: ['tramadol', 'theophylline'],
    urgencyScore: 9,
  },
  
  // THUNDERCLAP HEADACHE
  {
    pattern: /dolor.*cabeza.*explosivo|explosive.*headache|peor.*dolor.*cabeza|worst.*headache|worst.*headache.*life|worst.*head.*pain|dolor.*cabeza.*repentino|sudden.*headache|sudden.*severe.*headache|thunderclap.*headache|dolor.*cabeza.*trueno|headache.*sudden.*onset|headache.*like.*thunder|cefalea.*en.*trueno|ruptura.*aneurisma|aneurysm.*rupture|sangrado.*cerebral.*meníngeo|meningeal.*bleed|exploding.*head.*pain|sudden.*brain.*pain|intense.*sudden.*headache|headache.*came.*on.*suddenly|splitting.*headache|came.*out.*of.*nowhere.*headache|severe.*headache.*instant|thunder.*headache/i,
    message: 'CEFALEA EN TRUENO - Posible hemorragia subaracnoidea',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Requiere CT de cerebro urgente.',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension'],
    medicationInteractions: ['anticoagulants'],
    urgencyScore: 10,
  },
  
  // LOSS OF CONSCIOUSNESS / SYNCOPE
  {
    pattern: /\bblackout\b|\bpased out\b|\bpassed out\b|\bpase out\b|\bfainting\b|\bfainted\b|\bsyncope\b|\bsyncopy\b|\bcollapsed\b|\bdesmayo\b|\bdesmayó\b|\bdesmayado\b|\bknocked out\b|\bperdida.*consciencia\b|\bpérdida.*consciencia\b|\bloss.*consciousness\b|\blose consciousness\b|\blost consciousness\b|\bconsciousness.*lost\b|\bunconscious\b|\binconsciente\b/i,
    message: 'PÉRDIDA DE CONSCIENCIA - Posible síncope o emergencia neurológica',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. Evalúe pulso y respiración. Coloque en posición lateral de seguridad.',
    requiresImmediate911: true,
    conditionSpecific: ['heart_disease', 'arrhythmia', 'diabetes'],
    medicationInteractions: ['antihypertensives', 'nitrates'],
    urgencyScore: 9,
  },
  
  // ALTERED MENTAL STATUS
  {
    pattern: /\bconfused\b|\bdisoriented\b|\bdelirium\b|\bdelirio\b|\bcoma\b|\bcomatose\b|\bcomatoso\b|no.*sabe.*dónde.*está|doesnt.*know.*where.*is|doesnt.*know.*where.*he.*is|doesnt.*know.*name|no.*sabe.*nombre|confuso.*severo|severely.*confused|no.*reconoce|doesnt.*recognize|altered.*mental.*status|estado.*mental.*alterado|memory.*loss|pérdida.*memoria|sudden.*confusion|confusion.*sudden|confusión.*repentina|cant.*think.*clearly|no.*puede.*pensar|mental.*status.*change|cambio.*estado.*mental|wont.*wake.*up|no.*despierta|cant.*wake.*up|no.*puede.*despertar|not.*responding|no.*responde|agitación.*severa|severe.*agitation|alucinaciones|hallucinations/i,
    message: 'ESTADO MENTAL ALTERADO - Posible encefalopatía',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. Verifique glucemia si es posible.',
    requiresImmediate911: true,
    conditionSpecific: ['diabetes', 'liver_disease', 'kidney_disease'],
    medicationInteractions: ['opioids', 'benzodiazepines', 'anticholinergics'],
    urgencyScore: 9,
  },
  
  // ACUTE ABDOMEN
  {
    pattern: /abdomen.*duro|hard.*abdomen|rigid.*abdomen|abdomen.*rígido|abdomen.*rigido|board.*like.*abdomen|abdomen.*board|guarding.*abdomen|abdominal.*guarding|rebound.*tenderness|sever.*abdominal.*pain|severe.*abdominal.*pain|acute.*abdominal.*pain|stomach.*rigid|belly.*hard.*rock|hard.*stomach|severe.*belly.*pain|dolor.*abdominal.*severo|dolor.*abdominal.*agudo|abdomen.*agudo|peritonitis|appendicitis|apendicitis/i,
    message: 'ABDOMEN AGUDO - Posible peritonitis o emergencia quirúrgica',
    severity: 'critical',
    category: 'Abdominal',
    recommendation: 'Llame al 911. NO tome nada por boca. Inmovilice la zona.',
    requiresImmediate911: true,
    conditionSpecific: ['pregnancy', 'immunosuppression'],
    medicationInteractions: ['anticoagulants'],
    urgencyScore: 9,
  },
  
  // CRITICAL VITAL SIGNS
  {
    pattern: /presión.*alta.*180|pressure.*180.*over|blood.*pressure.*180|presión.*200|pressure.*200|frecuencia.*cardiaca.*150|heart.*rate.*150|pulso.*150|pulse.*150|taquicardia.*severa|severe.*tachycardia|frecuencia.*respiratoria.*30|respiratory.*rate.*30|temperatura.*40|temperature.*104|temp.*40|fiebre.*40|fever.*104|oxígeno.*bajo|low.*oxygen|spo2.*90|saturation.*90|oxígeno.*85|oxygen.*85/i,
    message: 'SIGNOS VITALES CRÍTICOS - Requiere evaluación inmediata',
    severity: 'critical',
    category: 'VitalSigns',
    recommendation: 'Llame al 911. Estos valores son potencialmente peligrosos.',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension', 'heart_disease', 'copd'],
    medicationInteractions: [],
    urgencyScore: 9,
  },
  
  // VISION EMERGENCIES
  {
    pattern: /pérdida.*repentina.*visión|sudden.*vision.*loss|sudden.*blindness|vision.*went.*black|vision.*gone|lost.*vision.*suddenly|cant.*see|can\'t.*see|no.*veo|no.*puedo.*ver|visión.*borrosa.*repentina|sudden.*blurred.*vision|sudden.*blurry.*vision|visión.*doble.*repentina|sudden.*double.*vision|diplopía|diplopia|amaurosis|curtain.*vision|telón.*ojo|flash.*lights|luces.*destellos|flotadores.*repentinos|sudden.*floaters|campo.*visual.*perdido|lost.*visual.*field|visión.*tunnel|tunnel.*vision|blindness.*onset|cant.*see.*out.*one.*eye|vision.*darkness/i,
    message: 'EMERGENCIA OCULAR - Posible desprendimiento de retina o ACV',
    severity: 'critical',
    category: 'Vision',
    recommendation: 'Acuda a urgencias oftalmológicas INMEDIATAMENTE.',
    requiresImmediate911: true,
    conditionSpecific: ['diabetes', 'hypertension'],
    medicationInteractions: [],
    urgencyScore: 9,
  },
  
  // DEEP VEIN THROMBOSIS / PULMONARY EMBOLISM
  {
    pattern: /dolor.*pierna.*hinchada|leg.*pain.*swollen|leg.*pain.*swelling|pierna.*hinchada|swollen.*leg|leg.*swollen|swollen.*calf|calf.*swollen|calf.*pain|pain.*calf|pantorrilla.*dolorosa|painful.*calf|trombosis|thrombosis|embolia|embolism|dolor.*pecho.*respirar|chest.*pain.*breathing|chest.*pain.*inhale|dolor.*torácico.*inspirar|dificultad.*respirar.*repentina|sudden.*difficulty.*breathing|sudden.*breathing.*difficulty|disnea.*repentina|sudden.*dyspnea|tos.*sangre|coughing.*blood|hemoptisis|hemoptysis|calor.*pierna|warm.*leg|enrojecimiento.*pierna|redness.*leg|red.*leg|leg.*red|one.*leg.*bigger|leg.*bigger.*other|bigger.*than.*other/i,
    message: 'Posible TROMBOEMBOLIA - Emergencia vascular',
    severity: 'critical',
    category: 'Vascular',
    recommendation: 'Llame al 911. NO masajee la pierna. Inmovilice la extremidad.',
    requiresImmediate911: true,
    conditionSpecific: ['pregnancy', 'cancer', 'recent_surgery'],
    medicationInteractions: ['oral_contraceptives', 'hormone_replacement'],
    urgencyScore: 10,
  },
];

/**
 * Check for medication-specific red flags based on patient medications
 * @param text - Text to analyze for symptoms
 * @param medications - Patient's current medications
 * @returns Object with alerts array and urgency bonus
 * @example
 * const { alerts, urgencyBonus } = checkMedicationInteractions(
 *   'Tengo sangrado de encías',
 *   [{ name: 'warfarina' }]
 * );
 * if (alerts.length > 0) {
 *   console.warn(alerts);
 * }
 */
function checkMedicationInteractions(
  text: string,
  medications: Array<{ name: string; dosage?: string }> | undefined
): { alerts: string[]; urgencyBonus: number } {
  const alerts: string[] = [];
  let urgencyBonus = 0;

  if (!medications) return { alerts, urgencyBonus };

  const normalizedMeds = medications.map(m => m.name.toLowerCase());

  for (const [med, interactionData] of Object.entries(MEDICATION_INTERACTIONS)) {
    // Check if patient is taking this medication
    if (normalizedMeds.some(medName => medName.includes(med) || med.includes(medName))) {
      // Check if patient has interacting symptoms
      const hasSymptom = interactionData.interactingSymptoms.some(symptom =>
        text.toLowerCase().includes(symptom)
      );

      if (hasSymptom) {
        alerts.push(interactionData.alert);
        urgencyBonus += interactionData.urgencyBonus;
      }
    }
  }

  return { alerts, urgencyBonus };
}

/**
 * Check condition-specific red flags
 * @param text - Text to analyze
 * @param conditions - Patient's medical conditions
 * @returns Object with detected flags and context
 * @example
 * const { flags, context } = checkConditionSpecificFlags(
 *   'Tengo dolor de cabeza intenso',
 *   ['hypertension', 'diabetes']
 * );
 */
function checkConditionSpecificFlags(
  text: string,
  conditions: string[] | undefined
): { flags: RedFlag[]; context: string[] } {
  const flags: RedFlag[] = [];
  const context: string[] = [];

  if (!conditions) return { flags, context };

  const normalizedConditions = conditions.map(c => c.toLowerCase().replace(/\s+/g, '_'));

  for (const [condition, conditionFlags] of Object.entries(CONDITION_SPECIFIC_FLAGS)) {
    if (normalizedConditions.includes(condition) || normalizedConditions.some(c => c.includes(condition))) {
      for (const flag of conditionFlags) {
        if (flag.pattern.test(text.toLowerCase())) {
          flags.push({
            pattern: flag.pattern,
            message: flag.message,
            severity: flag.severity,
            category: 'ConditionSpecific',
            recommendation: flag.recommendation,
            requiresImmediate911: flag.severity === 'critical',
            urgencyScore: flag.urgencyScore,
          } as RedFlag);
          context.push(`Condición específica: ${condition}`);
        }
      }
    }
  }

  return { flags, context };
}

/**
 * Check for critical vital signs from patient context
 * @param vitalSigns - Patient's vital signs
 * @returns Array of detected critical vital sign flags
 */
function checkCriticalVitalSigns(
  vitalSigns: PatientContext['vitalSigns']
): RedFlag[] {
  const flags: RedFlag[] = [];
  
  if (!vitalSigns) return flags;
  
  // Check blood pressure - critical if >180/120
  if (vitalSigns.bloodPressure) {
    const bpMatch = vitalSigns.bloodPressure.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1], 10);
      const diastolic = parseInt(bpMatch[2], 10);
      
      if (systolic >= 180 || diastolic >= 120) {
        flags.push({
          pattern: /critical.*bp|hipertensión.*severa/,
          message: 'SIGNOS VITALES CRÍTICOS - Presión arterial severamente elevada',
          severity: 'critical',
          category: 'VitalSigns',
          recommendation: 'Llame al 911. Crisis hipertensiva potencial.',
          requiresImmediate911: true,
          urgencyScore: 9,
        } as RedFlag);
      }
    }
  }
  
  // Check heart rate - critical if >130 or <40
  if (vitalSigns.heartRate !== undefined) {
    if (vitalSigns.heartRate >= 130) {
      flags.push({
        pattern: /tachycardia|taquicardia/,
        message: 'SIGNOS VITALES CRÍTICOS - Taquicardia severa (frecuencia cardiaca >150)',
        severity: 'critical',
        category: 'VitalSigns',
        recommendation: 'Llame al 911. Frecuencia cardiaca críticamente elevada.',
        requiresImmediate911: true,
        urgencyScore: 9,
      } as RedFlag);
    } else if (vitalSigns.heartRate <= 40) {
      flags.push({
        pattern: /bradycardia|bradicardia/,
        message: 'SIGNOS VITALES CRÍTICOS - Bradicardia severa (frecuencia cardiaca <40)',
        severity: 'critical',
        category: 'VitalSigns',
        recommendation: 'Llame al 911. Frecuencia cardiaca críticamente baja.',
        requiresImmediate911: true,
        urgencyScore: 9,
      } as RedFlag);
    }
  }
  
  // Check oxygen saturation - critical if <90
  if (vitalSigns.oxygenSaturation !== undefined) {
    if (vitalSigns.oxygenSaturation < 90) {
      flags.push({
        pattern: /hypoxemia|hypoxia|hipoxemia|hipoxia/,
        message: 'SIGNOS VITALES CRÍTICOS - Hipoxemia severa (SpO2 <90%)',
        severity: 'critical',
        category: 'VitalSigns',
        recommendation: 'Llame al 911. Saturación de oxígeno críticamente baja.',
        requiresImmediate911: true,
        urgencyScore: 10,
      } as RedFlag);
    }
  }
  
  // Check temperature - critical if >40°C (104°F)
  if (vitalSigns.temperature !== undefined) {
    if (vitalSigns.temperature >= 40) {
      flags.push({
        pattern: /hyperthermia|hipertermia|fever|fiebre/,
        message: 'SIGNOS VITALES CRÍTICOS - Hipertermia severa (temperatura >40°C)',
        severity: 'critical',
        category: 'VitalSigns',
        recommendation: 'Llame al 911. Temperatura corporal críticamente elevada.',
        requiresImmediate911: true,
        urgencyScore: 9,
      } as RedFlag);
    }
  }
  
  return flags;
}

// Words that indicate informational/past tense queries (not current emergencies)
const INFORMATIONAL_KEYWORDS = [
  'síntomas de', 'symptoms of', 'explícame qué es', 'explain what is', 
  'qué es un', 'what is a', 'qué es el', 'what is the', 'what are', 'qué son',
  'tuvo un', 'tuvo una', 'had a', 'had an',
  'el año pasado', 'last year', 'months ago', 'años atrás', 'years ago',
  'mi amigo', 'mi amiga', 'my friend', 'my grandmother', 'my grandfather',
  'mi abuela', 'mi abuelo', 'mi vecino', 'mi vecina', 'my neighbor',
  'mi primo', 'mi prima', 'my cousin', 'mi padre', 'mi madre', 'my father', 'my mother',
  'mi hermano', 'mi hermana', 'my brother', 'my sister',
  ' tuvo ', ' tenía ', ' había ', ' habido ',
  ' had ', ' have had ', ' has had ',
  'explain ', ' explícame ', ' explícame ',
];

/**
 * Check if text appears to be an informational query about someone else
 * @param text - Text to analyze
 * @returns Boolean indicating if query is informational
 * @example
 * if (isInformationalQuery('¿Cuáles son los síntomas de diabetes?')) {
 *   // Skip red flag detection
 * }
 */
function isInformationalQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INFORMATIONAL_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Main detection function with patient context awareness
 * Detects red flags in patient text with consideration of medical history
 * @param text - Patient's message or symptom description
 * @param patientContext - Patient's medical context (optional)
 * @returns Red flag detection result with urgency assessment
 * @example
 * const result = detectRedFlagsEnhanced('Tengo dolor de pecho intenso', {
 *   age: 55,
 *   conditions: ['hypertension'],
 *   medications: [{ name: 'enalapril' }]
 * });
 * 
 * if (result.requiresEmergencyEscalation) {
 *   console.log('Call 911!');
 * }
 */
export function detectRedFlagsEnhanced(
  text: string,
  patientContext?: PatientContext
): RedFlagResult {
  // Check if this is an informational query - return empty result if so
  if (isInformationalQuery(text)) {
    return {
      detected: false,
      flags: [],
      highestSeverity: null,
      requiresEmergencyEscalation: false,
      urgencyScore: 0,
      medicationAlerts: [],
      conditionContext: [],
    };
  }

  const detectedFlags: Array<{
    message: string;
    severity: RedFlagSeverity;
    category: string;
    recommendation: string;
    requiresImmediate911: boolean;
    urgencyScore: number;
  }> = [];
  const medicationAlerts: string[] = [];
  const conditionContext: string[] = [];
  let totalUrgency = 0;

  const lowerText = text.toLowerCase();

  // 1. Check standard red flags
  for (const flag of ENHANCED_RED_FLAGS) {
    if (flag.pattern.test(lowerText)) {
      let urgencyScore = flag.urgencyScore;

      // Increase urgency if patient has relevant conditions
      if (patientContext?.conditions && flag.conditionSpecific) {
        const hasCondition = flag.conditionSpecific.some(cond =>
          patientContext.conditions?.some(c =>
            c.toLowerCase().includes(cond) || cond.includes(c.toLowerCase())
          )
        );
        if (hasCondition) {
          urgencyScore = Math.min(10, urgencyScore + 2);
          conditionContext.push(`Preexistente: ${flag.conditionSpecific.join(', ')}`);
        }
      }

      // Check if patient is on interacting medications
      if (patientContext?.medications && flag.medicationInteractions) {
        const hasInteraction = flag.medicationInteractions.some(med =>
          patientContext.medications?.some(m =>
            m.name.toLowerCase().includes(med.toLowerCase()) ||
            med.toLowerCase().includes(m.name.toLowerCase())
          )
        );
        if (hasInteraction) {
          urgencyScore = Math.min(10, urgencyScore + 1);
          medicationAlerts.push(`Interacción con: ${flag.medicationInteractions.join(', ')}`);
        }
      }

      detectedFlags.push({
        message: flag.message,
        severity: flag.severity,
        category: flag.category,
        recommendation: flag.recommendation,
        requiresImmediate911: flag.requiresImmediate911,
        urgencyScore,
      });
      totalUrgency = Math.max(totalUrgency, urgencyScore);
    }
  }

  // 2. Check condition-specific flags
  const allConditions = [...(patientContext?.conditions || [])];
  if (patientContext?.pregnancyStatus === 'pregnant') {
    allConditions.push('pregnancy');
  }

  if (allConditions.length > 0) {
    const { flags: conditionFlags, context } = checkConditionSpecificFlags(lowerText, allConditions);
    for (const flag of conditionFlags) {
      detectedFlags.push({
        message: flag.message,
        severity: flag.severity,
        category: flag.category,
        recommendation: flag.recommendation,
        requiresImmediate911: flag.requiresImmediate911,
        urgencyScore: flag.urgencyScore,
      });
      totalUrgency = Math.max(totalUrgency, flag.urgencyScore);
    }
    conditionContext.push(...context);
  }

  // 3. Check critical vital signs
  if (patientContext?.vitalSigns) {
    const vitalSignFlags = checkCriticalVitalSigns(patientContext.vitalSigns);
    for (const flag of vitalSignFlags) {
      detectedFlags.push({
        message: flag.message,
        severity: flag.severity,
        category: flag.category,
        recommendation: flag.recommendation,
        requiresImmediate911: flag.requiresImmediate911,
        urgencyScore: flag.urgencyScore,
      });
      totalUrgency = Math.max(totalUrgency, flag.urgencyScore);
    }
  }

  // 4. Check medication interactions
  if (patientContext?.medications) {
    const { alerts, urgencyBonus } = checkMedicationInteractions(lowerText, patientContext.medications);
    medicationAlerts.push(...alerts);
    if (urgencyBonus > 0) {
      totalUrgency = Math.min(10, totalUrgency + urgencyBonus);
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
    urgencyScore: totalUrgency,
    medicationAlerts: Array.from(new Set(medicationAlerts)),
    conditionContext: Array.from(new Set(conditionContext)),
  };
}

/**
 * Integration with existing copilot system
 * Converts RedFlagResult to legacy format
 * @param result - Red flag detection result
 * @returns Array of simplified flag objects
 * @example
 * const legacy = convertToLegacyFormat(result);
 * // [{ message: '...', severity: 'critical' }]
 */
export function convertToLegacyFormat(
  result: RedFlagResult
): Array<{ message: string; severity: string }> {
  return result.flags.map((flag) => ({
    message: flag.message,
    severity: flag.severity,
  }));
}

/**
 * Get urgency level description based on score
 * @param score - Urgency score (1-10)
 * @returns Object with level description, action, and color
 * @example
 * const desc = getUrgencyDescription(9);
 * // { level: 'EMERGENCIA CRÍTICA', action: 'Llame al 911 INMEDIATAMENTE', color: 'red' }
 */
export function getUrgencyDescription(score: number): {
  level: string;
  action: string;
  color: string;
} {
  if (score >= 9) {
    return {
      level: 'EMERGENCIA CRÍTICA',
      action: 'Llame al 911 INMEDIATAMENTE',
      color: 'red',
    };
  }
  if (score >= 7) {
    return {
      level: 'EMERGENCIA',
      action: 'Acuda a urgencias inmediatamente',
      color: 'orange',
    };
  }
  if (score >= 5) {
    return {
      level: 'URGENTE',
      action: 'Acuda a urgencias o consulte hoy mismo',
      color: 'yellow',
    };
  }
  if (score >= 3) {
    return {
      level: 'CONSULTA PRONTO',
      action: 'Consulte con médico en 24 horas',
      color: 'blue',
    };
  }
  return {
    level: 'NO URGENTE',
    action: 'Consulta electiva recomendada',
    color: 'green',
  };
}
