// Health education data for the symptom checker
export interface EducationalResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'infographic';
  description: string;
  thumbnail?: string;
  url: string;
  source: string;
  duration?: string; // For videos
  readingTime?: string; // For articles
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface MedicalTerm {
  term: string;
  definition: string;
}

export interface ConditionInfo {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  preventionTips: string[];
  medicalTerms: MedicalTerm[];
  relatedConditions: string[];
  resources: EducationalResource[];
}

// Sample condition data
const conditionsData: Record<string, ConditionInfo> = {
  'migraine': {
    id: 'migraine',
    name: 'Migraña',
    description: 'La migraña es un tipo de dolor de cabeza intenso que puede causar dolor pulsátil, generalmente en un lado de la cabeza. A menudo viene acompañado de náuseas, vómitos y sensibilidad extrema a la luz y al sonido.',
    symptoms: [
      'Dolor pulsátil o punzante, a menudo en un lado de la cabeza',
      'Sensibilidad a la luz, sonidos y a veces olores',
      'Náuseas y vómitos',
      'Visión borrosa o alterada'
    ],
    causes: [
      'Factores genéticos que hacen que algunas personas sean más susceptibles',
      'Desequilibrios en sustancias químicas cerebrales, incluida la serotonina',
      'Cambios en los nervios y vasos sanguíneos del cerebro'
    ],
    treatments: [
      'Medicamentos para aliviar el dolor como analgésicos, triptanes y ergotamínicos',
      'Medicamentos preventivos para reducir la frecuencia y gravedad',
      'Técnicas de relajación y manejo del estrés'
    ],
    preventionTips: [
      'Identificar y evitar desencadenantes personales',
      'Mantener un horario regular de comidas y sueño',
      'Practicar técnicas de reducción del estrés'
    ],
    medicalTerms: [
      { term: 'Aura', definition: 'Síntomas neurológicos (como destellos de luz, líneas en zigzag o entumecimiento) que pueden preceder o acompañar a una migraña.' },
      { term: 'Cefalea', definition: 'Término médico para el dolor de cabeza.' }
    ],
    relatedConditions: [
      'Cefalea tensional',
      'Cefalea en racimos',
      'Neuralgia del trigémino'
    ],
    resources: [
      {
        id: 'migraine-article-1',
        title: 'Comprendiendo la migraña',
        type: 'article',
        description: 'Una guía sobre la migraña, explorando causas, síntomas y tratamientos.',
        url: 'https://www.example.com/migraines/guide',
        source: 'Mayo Clinic',
        readingTime: '8 min',
        difficulty: 'basic',
        tags: ['migraña', 'dolor de cabeza', 'neurología']
      }
    ]
  },
  
  'chest_pain': {
    id: 'chest_pain',
    name: 'Dolor de pecho',
    description: 'El dolor de pecho puede manifestarse como presión, opresión, dolor punzante o ardor en el pecho. Tiene múltiples causas posibles, desde problemas cardíacos hasta digestivos o musculoesqueléticos.',
    symptoms: [
      'Sensación de presión, opresión o dolor en el centro del pecho',
      'Dolor que se irradia al cuello, mandíbula, hombros o brazos',
      'Dificultad para respirar',
      'Náuseas o mareos'
    ],
    causes: [
      'Enfermedad cardíaca coronaria',
      'Reflujo gastroesofágico',
      'Problemas musculoesqueléticos',
      'Ansiedad y ataques de pánico'
    ],
    treatments: [
      'Tratamiento específico para la causa subyacente',
      'Medicamentos para aliviar el dolor o reducir el ácido estomacal',
      'Cambios en el estilo de vida'
    ],
    preventionTips: [
      'Mantener una dieta saludable para el corazón',
      'Realizar actividad física regular',
      'Evitar el tabaco y el alcohol excesivo',
      'Manejar el estrés adecuadamente'
    ],
    medicalTerms: [
      { term: 'Angina', definition: 'Dolor o molestia en el pecho causado por flujo sanguíneo reducido al músculo cardíaco.' },
      { term: 'ERGE', definition: 'Enfermedad por reflujo gastroesofágico, cuando el ácido estomacal fluye hacia el esófago.' }
    ],
    relatedConditions: [
      'Infarto de miocardio',
      'Reflujo gastroesofágico',
      'Costocondritis',
      'Ansiedad'
    ],
    resources: [
      {
        id: 'chest-pain-article',
        title: 'Cuándo el dolor de pecho es una emergencia',
        type: 'article',
        description: 'Aprenda a distinguir cuándo el dolor de pecho requiere atención médica inmediata.',
        url: 'https://www.example.com/chest-pain/emergency',
        source: 'American Heart Association',
        readingTime: '5 min',
        difficulty: 'basic',
        tags: ['dolor de pecho', 'emergencia', 'corazón']
      }
    ]
  }
};

// Map symptoms to conditions
const symptomToConditionMap: Record<string, string> = {
  'headache': 'migraine',
  'migraine': 'migraine',
  'chest_pain': 'chest_pain',
  'angina': 'chest_pain'
};

// General health tips for when no specific condition is found
export const generalHealthInfo = {
  title: 'Información de Salud General',
  description: 'Información general sobre salud y bienestar. Para obtener información más específica, consulte con un profesional de la salud.',
  sections: [
    {
      title: 'Recomendaciones generales',
      items: [
        'Mantenga una dieta equilibrada rica en frutas, verduras y granos enteros.',
        'Realice actividad física regular, al menos 150 minutos de ejercicio moderado por semana.',
        'Duerma entre 7-9 horas por noche para permitir que su cuerpo se recupere.',
        'Manténgase bien hidratado bebiendo suficiente agua a lo largo del día.',
        'Maneje el estrés mediante técnicas de relajación como la meditación.'
      ]
    }
  ],
  resources: [
    {
      id: 'general-health-1',
      title: 'Principios de una vida saludable',
      type: 'article',
      description: 'Guía sobre los principios fundamentales para mantener una buena salud.',
      url: 'https://www.example.com/health/principles',
      source: 'OMS',
      readingTime: '10 min',
      difficulty: 'basic',
      tags: ['salud general', 'bienestar', 'prevención']
    }
  ]
};

// Get condition info by condition ID or symptom ID
export function getConditionInfo(conditionId?: string, symptomId?: string): ConditionInfo | null {
  if (conditionId && conditionsData[conditionId]) {
    return conditionsData[conditionId];
  }
  
  if (symptomId && symptomToConditionMap[symptomId]) {
    return conditionsData[symptomToConditionMap[symptomId]];
  }
  
  return null;
}