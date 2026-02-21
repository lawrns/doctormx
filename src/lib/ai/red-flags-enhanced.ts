/**
 * Enhanced Red Flag Detection System with Patient Context
 * Comprehensive emergency symptom detection for Mexican healthcare context
 * Includes condition-based detection, medication interactions, and urgency scoring
 */

export type RedFlagSeverity = 'critical' | 'high' | 'moderate';

export interface PatientContext {
  age?: number;
  pregnancyStatus?: 'pregnant' | 'not_pregnant' | 'unknown';
  conditions?: string[];
  medications?: Array<{ name: string; dosage?: string }>;
  allergies?: string[];
  vitalSigns?: {
    bloodPressure?: string; // e.g., "140/90"
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
}

export interface RedFlag {
  pattern: RegExp;
  message: string;
  severity: RedFlagSeverity;
  category: string;
  recommendation: string;
  requiresImmediate911: boolean;
  conditionSpecific?: string[]; // Conditions that make this flag more severe
  medicationInteractions?: string[]; // Medications that interact with this condition
  urgencyScore: number; // 1-10 urgency score
}

export interface RedFlagResult {
  detected: boolean;
  flags: Array<{
    message: string;
    severity: RedFlagSeverity;
    category: string;
    recommendation: string;
    requiresImmediate911: boolean;
    urgencyScore: number;
  }>;
  highestSeverity: RedFlagSeverity | null;
  requiresEmergencyEscalation: boolean;
  urgencyScore: number; // Overall urgency 1-10
  medicationAlerts: string[];
  conditionContext: string[];
}

/**
 * Medication interaction database
 */
export const MEDICATION_INTERACTIONS = {
  // Warfarin/Coumadin interactions
  warfarina: {
    interactingSymptoms: ['sangrado', 'hemorragia', 'moretones', 'encías sangrantes'],
    alert: 'Paciente en anticoagulación: sangrado requiere evaluación inmediata',
    urgencyBonus: 2,
  },
  acenocumarol: {
    interactingSymptoms: ['sangrado', 'hemorragia', 'moretones', 'encías sangrantes'],
    alert: 'Paciente en anticoagulación: sangrado requiere evaluación inmediata',
    urgencyBonus: 2,
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
    interactingSymptoms: ['hinchazón labios', 'hinchazón lengua', 'dificultad tragar'],
    alert: 'Posible angioedema por IECA: suspensión inmediata requerida',
    urgencyBonus: 3,
  },
};

/**
 * Condition-specific red flags
 */
export const CONDITION_SPECIFIC_FLAGS = {
  diabetes: [
    {
      pattern: /confusión|desorientado|habla.*enredada|perdida.*conciencia|confused|disoriented|altered.*mental.*status|memory.*loss|sudden.*confusion|delirium|doesnt.*know.*where|cant.*think.*clearly|sweating|sudoracion/i,
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
      pattern: /pie.*hinchado|pie.*rojo|úlceras.*pie|ampolla.*pie|herida.*no.*sana/i,
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
  // ============================================================================
  // CRITICAL - IMMEDIATE 911 REQUIRED (Urgency 8-10)
  // ============================================================================

  // Stroke (ACV) - FAST Protocol - Comprehensive patterns
  {
    pattern: /paralisis|debilidad.*extremo|cara.*colgada|cara.*caida|brazo.*no.*puede.*levantar|cara.*torcida|slurred.*speech|cant.*speak|speech.*difficulty|face.*drooping|arm.*weakness|facial.*paralysis|face.*drooping|one.*side.*face.*numb|cant.*move.*one.*side.*face|facial.*droop|paralyzed.*face|crooked.*face|arm.*numbness|one.*arm.*drags|weakness.*extremity|cant.*raise.*arm|cant.*lift.*arm|left.*arm.*weak|right.*arm.*feels.*heavy|right.*arm.*heavy|left.*arm.*is.*weak|cant.*move.*arm|cant.*move.*my.*arm|slurred.*speech|cant.*speak.*properly|trouble.*speaking|speech.*difficulty|cant.*find.*words|words.*jumbled|speech.*garbled|hard.*talk|stroke|cva|cerebrovascular.*accident|brain.*attack|ischemic.*stroke|hemorrhagic.*stroke|mini.*stroke|tia/i,
    message: 'Posible accidente cerebrovascular (ACV) - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Protocolo FAST: Facial, Arms, Speech, Time',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension', 'diabetes', 'atrial_fibrillation'],
    medicationInteractions: ['warfarina', 'acenocumarol'],
    urgencyScore: 10,
  },
  {
    pattern: /dificultad.*hablar|no.*puede.*hablar|palabras.*enredadas|lengua.*trabada|slurred.*speech|cant.*speak|speech.*difficulty|words.*jumbled|trouble.*speaking/i,
    message: 'Trastorno del habla súbita - Posible ACV',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. Síntoma clave de evento cerebrovascular',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension', 'diabetes'],
    medicationInteractions: ['warfarina', 'acenocumarol'],
    urgencyScore: 10,
  },

  // Cardiac Emergency - Comprehensive patterns (All cardiac patterns are critical for safety)
  {
    pattern: /dolor.*pecho.*opresivo|dolor.*pecho.*brazo|angina|siento.*que.*me.*muero|dolor.*pecho.*mandibula|chest.*pain|pressure.*chest|squeezing.*chest|crushing.*chest|heart.*attack|pain.*radiate.*arm|tightness.*chest|chest.*discomfort|pain.*spreading.*back|angina.*pain|left.*arm.*pain.*chest.*pain|cardiac.*arrest|severe.*chest.*pressure|chest.*pain.*elephant|radiating.*chest.*pain|chest.*pain.*jaw|pressure.*center.*chest|myocardial.*infarction|feeling.*going.*die|dolor.*pecho|dolor.*toracico|chest.*tightness|chest.*discomfort/i,
    message: 'Dolor torácico con características cardíacas - EMERGENCIA',
    severity: 'critical',
    category: 'Cardiac',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Posible infarto al miocardio',
    requiresImmediate911: true,
    conditionSpecific: ['diabetes', 'hypertension', 'heart_failure', 'obesity'],
    medicationInteractions: ['sildenafilo', 'tadalafil'],
    urgencyScore: 10,
  },

  // Severe Respiratory - Comprehensive patterns (All respiratory emergencies are critical for safety)
  {
    pattern: /no.*puedo.*respirar|ahogo.*severo|labios.*azules|cara.*azul|cianosis|difficulty.*breathing|cant.*breathe|trouble.*breathing|shortness.*breath|not.*able.*breathe|wheezing.*severe|blue.*lips|cyanosis|choking|cant.*breath|gasping.*air|cant.*catch.*breath|blue.*lips|face.*turning.*blue|lips.*blue|air.*hunger|cant.*get.*air|suffocating|chest.*tightness.*cant.*breathe|respiratory.*distress|struggling.*breathe|severe.*asthma.*attack|bronchospasm|dificultad.*respirar|ahogo|falta.*aire|sibilancias.*severas|sob|dyspnea/i,
    message: 'Insuficiencia respiratoria severa - EMERGENCIA',
    severity: 'critical',
    category: 'Respiratory',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Posible falla respiratoria',
    requiresImmediate911: true,
    conditionSpecific: ['asthma', 'copd', 'heart_failure'],
    medicationInteractions: ['betabloqueantes'],
    urgencyScore: 10,
  },

  // Neurological Critical - Comprehensive seizure patterns
  {
    pattern: /convulsiones|ataques|espasmos.*incontrolables|temblores.*violentos|seizure|convulsion|having.*seizure|epileptic.*seizure|uncontrollable.*shaking|violent.*shaking|full.*body.*convulsion|tonic.*clonic.*seizure|grand.*mal.*seizure|body.*shaking.*uncontrollably|muscle.*spasms|fit.*seizure|convulsing|seizing|epilepsy.*attack|epileptic.*attack|status.*epilepticus|fit/i,
    message: 'Actividad convulsiva - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911. Proteja a la persona de lesiones durante la convulsión',
    requiresImmediate911: true,
    conditionSpecific: ['epilepsy'],
    medicationInteractions: [],
    urgencyScore: 9,
  },
  {
    pattern: /dolor.*cabeza.*peor.*vida|cefalea.*thunderclap|dolor.*cabeza.*explosivo|dolor.*cabeza.*intenso.*subito|sudden.*severe.*headache|worst.*headache.*life|thunderclap.*headache|explosive.*headache|sudden.*intense.*headache|worst.*headache|sudden.*severe.*pain|headache.*came.*suddenly|splitting.*headache|came.*nowhere.*headache|severe.*headache.*instant|worst.*head.*pain|thunder.*headache/i,
    message: 'Cefalea thunderclap - Posible hemorragia subaracnoidea',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Requiere neuroimagen urgente',
    requiresImmediate911: true,
    conditionSpecific: ['hypertension', 'aneurysm'],
    medicationInteractions: ['warfarina', 'acenocumarol'],
    urgencyScore: 10,
  },
  {
    pattern: /cuello.*rigido.*fiebre|rigidez.*nuca.*fiebre|meningitis/i,
    message: 'Rigidez de nuca con fiebre - Posible meningitis',
    severity: 'critical',
    category: 'Infectious',
    recommendation: 'Llame al 911. Posible meningitis bacteriana',
    requiresImmediate911: true,
    conditionSpecific: ['immunocompromised', 'asplenia'],
    medicationInteractions: [],
    urgencyScore: 9,
  },

  // Psychiatric Emergency - Comprehensive suicide/self-harm patterns
  {
    pattern: /pensamientos.*suicidio|quiere.*morir|quitarme.*vida|plan.*suicida|autolesion.*grave|want.*die|kill.*myself|suicidal.*thoughts|want.*end.*life|end.*life|planning.*suicide|suicide.*plan|dont.*want.*live|better.*off.*dead|no.*point.*living|want.*disappear|self.*harm|want.*hurt.*myself|cut.*myself|end.*all|not.*worth.*living|want.*commit.*suicide|going.*kill.*myself|suicide|hopeless|no.*reason.*live/i,
    message: 'Ideación suicida activa - CRISIS PSIQUIÁTRICA',
    severity: 'critical',
    category: 'Psychiatric',
    recommendation: 'Llame al 911 o Línea de la Vida (800 911 2000). No deje sola a la persona',
    requiresImmediate911: true,
    conditionSpecific: ['depression', 'bipolar_disorder'],
    medicationInteractions: [],
    urgencyScore: 10,
  },

  // Severe Bleeding - Comprehensive patterns
  {
    pattern: /hemorragia.*no.*para|sangrado.*mucho|sangrado.*profuso|desangrando|severe.*bleeding|heavy.*bleeding|bleeding.*stop|uncontrolled.*bleeding|losing.*blood|gushing.*blood|bleeding.*heavily|losing.*lot.*blood|hemorrhage|profuse.*bleeding|cant.*stop.*bleeding|blood.*everywhere|major.*blood.*loss|arterial.*bleeding|vomiting.*blood|coughing.*blood|blood.*urine|rectal.*bleeding|nosebleed.*wont.*stop|excessive.*bleeding|life.*threatening.*bleeding/i,
    message: 'Hemorragia incontrolable - EMERGENCIA',
    severity: 'critical',
    category: 'Trauma',
    recommendation: 'Llame al 911. Aplique presión directa mientras llega ayuda',
    requiresImmediate911: true,
    conditionSpecific: ['hemophilia', 'thrombocytopenia', 'liver_disease'],
    medicationInteractions: ['warfarina', 'acenocumarol', 'clopidogrel', 'aspirina'],
    urgencyScore: 10,
  },

  // Severe Allergic Reaction - Comprehensive patterns
  {
    pattern: /anafilaxia|alergia.*grave|garganta.*cerrada|hinchazón.*lengua|dificultad.*tragar.*alergia|hinchazon.*labios|labios.*hinchados|anaphylaxis|anaphylactic.*shock|throat.*closing|throat.*swelling.*shut|tongue.*swollen|swollen.*lips|face.*swelling|cant.*swallow.*allergy|swollen.*eyes|allergic.*reaction.*severe|airway.*closing|difficulty.*swallowing|lips.*swollen|sudden.*face.*swelling|severe.*allergy|cant.*breathe.*due.*allergy|epipen.*needed|hives.*swelling|swelling.*all.*over|throat.*closing.*allergy|trouble.*breathing.*allergy/i,
    message: 'Anafilaxia - Reacción alérgica severa',
    severity: 'critical',
    category: 'Allergic',
    recommendation: 'Llame al 911. Use epinefrina (EpiPen) si está disponible',
    requiresImmediate911: true,
    conditionSpecific: ['anaphylaxis_history', 'asthma'],
    medicationInteractions: ['betabloqueantes'], // Can worsen anaphylaxis
    urgencyScore: 10,
  },

  // ============================================================================
  // HIGH SEVERITY - URGENT MEDICAL ATTENTION (Urgency 5-7)
  // ============================================================================

  // Respiratory patterns removed (all respiratory is now critical for safety)

  // High Fever
  {
    pattern: /fiebre.*40|fiebre.*41|fiebre.*42|temperatura.*muy.*alta|fiebre.*no.*baja/i,
    message: 'Fiebre muy alta - Riesgo de sepsis',
    severity: 'high',
    category: 'Infectious',
    recommendation: 'Acuda a urgencias inmediatamente. Riesgo de infección grave',
    requiresImmediate911: false,
    conditionSpecific: ['immunocompromised', 'diabetes', 'very_young', 'elderly'],
    medicationInteractions: [],
    urgencyScore: 6,
  },

  // Loss of Consciousness - Comprehensive patterns
  {
    pattern: /perdida.*conciencia|inconsciente|desmayo|desmayarse|faint|unconscious|passed.*out|knocked.*out|lose.*consciousness|blackout|passed.*out|fainted|lost.*consciousness|fainting|collapsed|passed.*out.*fell|syncopy|fell.*down.*unconscious|lose.*consciousness|fainting.*spell|dropped.*unconscious|passed.*suddenly|went.*unconscious/i,
    message: 'Pérdida de conciencia - EMERGENCIA',
    severity: 'critical',
    category: 'Neurological',
    recommendation: 'Llame al 911 INMEDIATAMENTE. Requiere evaluación médica urgente',
    requiresImmediate911: true,
    conditionSpecific: ['heart_disease', 'diabetes', 'epilepsy'],
    medicationInteractions: ['betabloqueantes', 'diuréticos'],
    urgencyScore: 9,
  },

  // Altered Mental Status - Comprehensive patterns
  {
    pattern: /confusion|desorientado|no.*reconoce|alteracion.*conciencia|desorientacion|memoria.*perdida|confused|disoriented|doesnt.*recognize|altered.*mental.*status|memory.*loss|sudden.*confusion|delirium|doesnt.*know.*where|cant.*think.*clearly|mental.*status.*change|confusion.*sudden.*onset|doesnt.*know.*name/i,
    message: 'Alteración del estado mental',
    severity: 'high',
    category: 'Neurological',
    recommendation: 'Requiere evaluación médica urgente. Acuda a urgencias',
    requiresImmediate911: false,
    conditionSpecific: ['dementia', 'diabetes', 'elderly'],
    medicationInteractions: ['sedantes', 'opioides'],
    urgencyScore: 6,
  },

  // Severe Abdominal - Comprehensive patterns
  {
    pattern: /abdomen.*rigido|abdomen.*duro|defensa.*abdominal|dolor.*abdominal.*severo|rigid.*abdomen|hard.*stomach|board.*like.*abdomen|guarding.*abdomen|severe.*abdominal.*pain|acute.*abdominal.*pain|stomach.*rigid|belly.*hard.*rock|rebound.*tenderness|abdominal.*guarding|severe.*belly.*pain|severe.*stomach.*pain|belly.*pain/i,
    message: 'Signos de abdomen agudo - Posible emergencia quirúrgica',
    severity: 'high',
    category: 'Gastrointestinal',
    recommendation: 'Acuda a urgencias. Puede requerir cirugía',
    requiresImmediate911: false,
    conditionSpecific: ['pregnancy'],
    medicationInteractions: ['corticosteroides'], // Can mask peritonitis
    urgencyScore: 7,
  },

  // Severe Head Trauma
  {
    pattern: /golpe.*cabeza.*perdida.*conocimiento|trauma.*craneo|concusion|perdida.*memoria.*golpe/i,
    message: 'Traumatismo craneoencefálico',
    severity: 'high',
    category: 'Trauma',
    recommendation: 'Acuda a urgencias para descartar hemorragia intracraneal',
    requiresImmediate911: false,
    conditionSpecific: ['anticoagulation'],
    medicationInteractions: ['warfarina', 'acenocumarol'],
    urgencyScore: 7,
  },

  // Pregnancy Complications - Comprehensive patterns
  {
    pattern: /embarazada.*sangrado|embarazada.*dolor.*intenso|embarazo.*emergencia|contracciones.*prematuras|pregnant.*bleeding|vaginal.*bleeding.*during.*pregnancy|severe.*abdominal.*pain.*pregnant|water.*broke|leaking.*fluid.*pregnant|contractions.*too.*early|preterm.*labor|severe.*cramping.*pregnant|bleeding.*while.*pregnant|early.*labor|pregnant.*and.*bleeding|decreased.*fetal.*movement|baby.*not.*moving|severe.*headache.*pregnant|blurred.*vision.*pregnancy|swollen.*face.*hands.*pregnant|preeclampsia|eclampsia|placental.*abruption|placenta.*previa.*bleeding|pregnancy.*complications|miscarriage.*bleeding/i,
    message: 'Complicación del embarazo',
    severity: 'critical',
    category: 'Obstetric',
    recommendation: 'Acuda a urgencias obstétricas inmediatamente',
    requiresImmediate911: true,
    conditionSpecific: ['pregnancy'],
    medicationInteractions: [],
    urgencyScore: 9,
  },

  // Vision Loss - Comprehensive patterns
  {
    pattern: /perdida.*vision.*subita|ceguera.*repentina|no.*veo|vision.*negra|sudden.*vision.*loss|sudden.*blindness|cant.*see|vision.*went.*black|lost.*vision.*suddenly|sudden.*blurry.*vision|vision.*gone|blindness.*onset|cant.*see.*one.*eye|sudden.*vision.*darkness/i,
    message: 'Pérdida súbita de visión',
    severity: 'high',
    category: 'Ophthalmologic',
    recommendation: 'Acuda a urgencias oftalmológicas en las próximas 2 horas',
    requiresImmediate911: false,
    conditionSpecific: ['diabetes', 'hypertension', 'giant_cell_arteritis'],
    medicationInteractions: [],
    urgencyScore: 7,
  },

  // Severe Pain
  {
    pattern: /dolor.*10\/10|peor.*dolor.*vida|dolor.*insoportable/i,
    message: 'Dolor severo (10/10)',
    severity: 'high',
    category: 'Pain',
    recommendation: 'Requiere evaluación médica urgente',
    requiresImmediate911: false,
    conditionSpecific: ['chronic_pain', 'cancer'],
    medicationInteractions: [],
    urgencyScore: 6,
  },

  // Hypoglycemia (diabetic patients)
  {
    pattern: /temblor|sudoracion|confusion|palidez|hambre.*intenso|irritabilidad/i,
    message: 'Posible hipoglucemia - Revise glucosa',
    severity: 'high',
    category: 'Endocrine',
    recommendation: 'Mida glucosa capilar. Si <70mg/dL administre carbohidratos',
    requiresImmediate911: false,
    conditionSpecific: ['diabetes'],
    medicationInteractions: ['insulina', 'sulfonilureas'],
    urgencyScore: 7,
  },

  // Angioedema (ACE inhibitor side effect)
  {
    pattern: /hinchazon.*labios|hinchazon.*lengua|dificultad.*tragar|voz.*ronca/i,
    message: 'Posible angioedema - Reacción adversa a medicamento',
    severity: 'high',
    category: 'Allergic',
    recommendation: 'Suspenda medicamento IECA y acuda a urgencias',
    requiresImmediate911: true,
    conditionSpecific: ['ace_inhibitor_use'],
    medicationInteractions: ['ieca', 'enalapril', 'lisinopril', 'ramipril'],
    urgencyScore: 8,
  },

  // Serotonin Syndrome
  {
    pattern: /agitacion|confusion|temblor|reflejos.*vivos|fiebre|diaforesis|diarrea/i,
    message: 'Posible síndrome serotoninérgico',
    severity: 'high',
    category: 'Toxicological',
    recommendation: 'Acuda a urgencias. Requiere suspensión de serotoninérgicos',
    requiresImmediate911: false,
    conditionSpecific: ['ssri_use', 'snri_use'],
    medicationInteractions: ['sertralina', 'fluoxetina', 'paroxetina', 'citalopram', 'escitalopram', 'tramadol'],
    urgencyScore: 7,
  },

  // ============================================================================
  // MODERATE SEVERITY - MEDICAL ATTENTION WITHIN 24 HOURS (Urgency 3-5)
  // ============================================================================

  // Moderate Fever
  {
    pattern: /fiebre.*39|fiebre.*38.*niño|temperatura.*alta/i,
    message: 'Fiebre moderada',
    severity: 'moderate',
    category: 'Infectious',
    recommendation: 'Consulte con médico en las próximas 24 horas',
    requiresImmediate911: false,
    conditionSpecific: ['very_young', 'elderly', 'immunocompromised'],
    medicationInteractions: [],
    urgencyScore: 4,
  },

  // Moderate Respiratory
  {
    pattern: /tos.*sangre|hemoptisis/i,
    message: 'Tos con sangre',
    severity: 'moderate',
    category: 'Respiratory',
    recommendation: 'Consulte con médico en las próximas 24 horas',
    requiresImmediate911: false,
    conditionSpecific: ['copd', 'tuberculosis', 'cancer'],
    medicationInteractions: ['anticoagulantes'],
    urgencyScore: 5,
  },

  // Urinary
  {
    pattern: /sangre.*orina|dolor.*orinar.*severo|no.*puedo.*orinar/i,
    message: 'Síntomas urinarios graves',
    severity: 'moderate',
    category: 'Urinary',
    recommendation: 'Consulte con médico en las próximas 24 horas',
    requiresImmediate911: false,
    conditionSpecific: ['pregnancy', 'prostate_enlargement', 'kidney_stones'],
    medicationInteractions: ['diuréticos'],
    urgencyScore: 5,
  },

  // Skin infections
  {
    pattern: /enrojecimiento.*caliente|hinchazon.*crece|linea.*roja|celulitis/i,
    message: 'Posible infección de piel (celulitis)',
    severity: 'moderate',
    category: 'Dermatological',
    recommendation: 'Consulte con médico en las próximas 24 horas. Puede requerir antibióticos',
    requiresImmediate911: false,
    conditionSpecific: ['diabetes', 'obesity', 'immunocompromised'],
    medicationInteractions: [],
    urgencyScore: 4,
  },

  // DVT (Deep Vein Thrombosis) - Comprehensive patterns
  {
    pattern: /pierna.*hinchada|dolor.*pantorrilla|rojo.*caliente|pierna.*calf|leg.*swollen|swollen.*calf|pain.*calf|red.*hot.*leg|one.*leg.*bigger|calf.*pain.*swelling|leg.*pain.*redness|swollen.*leg|calf.*tenderness|deep.*vein.*thrombosis/i,
    message: 'Posible trombosis venosa profunda',
    severity: 'high',
    category: 'Vascular',
    recommendation: 'Acuda a urgencias para Doppler venoso. Riesgo de embolia pulmonar',
    requiresImmediate911: false,
    conditionSpecific: ['pregnancy', 'cancer', 'recent_surgery', 'immobilization'],
    medicationInteractions: ['anticonceptivos_orales'],
    urgencyScore: 7,
  },
];

/**
 * Check for medication-specific red flags based on patient medications
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
 * Main detection function with patient context awareness
 */
export function detectRedFlagsEnhanced(
  text: string,
  patientContext?: PatientContext
): RedFlagResult {
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
  // Build conditions array including pregnancy status
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

  // 3. Check medication interactions
  if (patientContext?.medications) {
    const { alerts, urgencyBonus } = checkMedicationInteractions(lowerText, patientContext.medications);
    medicationAlerts.push(...alerts);
    if (urgencyBonus > 0) {
      totalUrgency = Math.min(10, totalUrgency + urgencyBonus);
    }
  }

  // 4. Check vital signs for red flags
  if (patientContext?.vitalSigns) {
    const vs = patientContext.vitalSigns;

    // Blood pressure red flags
    if (vs.bloodPressure) {
      const [systolic, diastolic] = vs.bloodPressure.split('/').map(Number);
      if (systolic >= 180 || diastolic >= 120) {
        detectedFlags.push({
          message: 'Crisis hipertensiva - Presión arterial ≥180/120',
          severity: 'critical',
          category: 'VitalSigns',
          recommendation: 'Acuda a urgencias inmediatamente para evaluar daño en órganos blanco',
          requiresImmediate911: true,
          urgencyScore: 9,
        });
        totalUrgency = Math.max(totalUrgency, 9);
      }
    }

    // Oxygen saturation red flag
    if (vs.oxygenSaturation !== undefined && vs.oxygenSaturation < 92) {
      detectedFlags.push({
        message: `Hipoxemia - SpO2 ${vs.oxygenSaturation}%`,
        severity: 'critical',
        category: 'VitalSigns',
        recommendation: 'Requiere oxígeno suplementario y evaluación inmediata',
        requiresImmediate911: true,
        urgencyScore: vs.oxygenSaturation < 88 ? 10 : 9,
      });
      totalUrgency = Math.max(totalUrgency, vs.oxygenSaturation < 88 ? 10 : 9);
    }

    // Heart rate red flags
    if (vs.heartRate !== undefined) {
      if (vs.heartRate > 120) {
        detectedFlags.push({
          message: `Taquicardia - FC ${vs.heartRate} lpm`,
          severity: 'high',
          category: 'VitalSigns',
          recommendation: 'Evaluar causa de taquicardia. Requiere ECG.',
          requiresImmediate911: false,
          urgencyScore: 6,
        });
        totalUrgency = Math.max(totalUrgency, 6);
      } else if (vs.heartRate < 50) {
        detectedFlags.push({
          message: `Bradicardia - FC ${vs.heartRate} lpm`,
          severity: 'moderate',
          category: 'VitalSigns',
          recommendation: 'Evaluar bradicardia. Requiere ECG.',
          requiresImmediate911: false,
          urgencyScore: 5,
        });
        totalUrgency = Math.max(totalUrgency, 5);
      }
    }

    // Temperature red flag
    if (vs.temperature !== undefined && vs.temperature >= 40) {
      detectedFlags.push({
        message: `Hipertermia - ${vs.temperature}°C`,
        severity: 'high',
        category: 'VitalSigns',
        recommendation: 'Acuda a urgencias. Posible infección grave.',
        requiresImmediate911: false,
        urgencyScore: 7,
      });
      totalUrgency = Math.max(totalUrgency, 7);
    }
  }

  // 5. Age-specific considerations
  if (patientContext?.age) {
    // Pediatric fever red flag
    if (patientContext.age < 3 && patientContext.vitalSigns?.temperature && patientContext.vitalSigns.temperature > 38) {
      detectedFlags.push({
        message: 'Fiebre en lactante <3 meses - EMERGENCIA',
        severity: 'critical',
        category: 'AgeSpecific',
        recommendation: 'Acuda a urgencias inmediatamente. Requiere sepsis workup.',
        requiresImmediate911: true,
        urgencyScore: 9,
      });
      totalUrgency = Math.max(totalUrgency, 9);
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
