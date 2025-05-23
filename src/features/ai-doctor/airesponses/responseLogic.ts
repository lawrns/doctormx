import { AIAnswerOption } from '../types/AITypes';

export interface ResponseContext {
  userMessage: string;
  conversationHistory: string[];
  medicalKeywords?: string[];
  severity?: number;
  emergencyKeywords?: string[];
}

export interface GeneratedResponse {
  text: string;
  answerOptions?: AIAnswerOption[];
  needsFollowUp: boolean;
  emergencyLevel: number;
  confidence: number;
}

// Mexican medical context keywords
export const MEXICAN_MEDICAL_CONTEXT = {
  painTerms: ['dolor', 'duele', 'molesta', 'adolorido', 'lastimado'],
  intensityTerms: ['intenso', 'fuerte', 'leve', 'moderado', 'severo', 'insoportable'],
  timeTerms: ['hoy', 'ayer', 'anoche', 'mañana', 'tarde', 'desde hace', 'hace rato'],
  bodyParts: ['cabeza', 'estómago', 'pecho', 'corazón', 'brazo', 'pierna', 'espalda', 'garganta'],
  symptoms: ['fiebre', 'tos', 'náusea', 'mareo', 'vómito', 'diarrea', 'estreñimiento'],
  medications: ['paracetamol', 'ibuprofeno', 'aspirina', 'omeprazol', 'ranitidina']
};

export const generateContextualAnswerOptions = (context: ResponseContext): AIAnswerOption[] => {
  const { userMessage, conversationHistory } = context;
  const lowerMessage = userMessage.toLowerCase();
  
  // Pain-related responses
  if (MEXICAN_MEDICAL_CONTEXT.painTerms.some(term => lowerMessage.includes(term))) {
    return generatePainOptions(lowerMessage);
  }
  
  // Symptom duration questions
  if (lowerMessage.includes('cuando') || lowerMessage.includes('cuanto tiempo') || lowerMessage.includes('desde')) {
    return generateTimeOptions();
  }
  
  // Medication questions
  if (MEXICAN_MEDICAL_CONTEXT.medications.some(med => lowerMessage.includes(med))) {
    return generateMedicationOptions();
  }
  
  // Severity questions
  if (lowerMessage.includes('grave') || lowerMessage.includes('serio') || lowerMessage.includes('preocup')) {
    return generateSeverityOptions();
  }
  
  // General symptom questions
  if (MEXICAN_MEDICAL_CONTEXT.symptoms.some(symptom => lowerMessage.includes(symptom))) {
    return generateSymptomOptions();
  }
  
  // Default options for general conversation
  return generateGeneralOptions();
};

const generatePainOptions = (message: string): AIAnswerOption[] => {
  const options: AIAnswerOption[] = [
    {
      id: 'pain_mild',
      text: 'Es un dolor leve, molesto pero tolerable',
      value: 'dolor leve',
      category: 'intensity'
    },
    {
      id: 'pain_moderate',
      text: 'Es un dolor moderado, me dificulta actividades',
      value: 'dolor moderado',
      category: 'intensity'
    },
    {
      id: 'pain_severe',
      text: 'Es un dolor fuerte, casi insoportable',
      value: 'dolor severo',
      category: 'intensity'
    }
  ];

  // Add time-based options for pain
  if (message.includes('cabeza') || message.includes('dolor de cabeza')) {
    options.push(
      {
        id: 'headache_today',
        text: 'Comenzó hoy en la mañana',
        value: 'dolor de cabeza desde hoy',
        category: 'timing'
      },
      {
        id: 'headache_yesterday',
        text: 'Empezó ayer por la tarde',
        value: 'dolor de cabeza desde ayer',
        category: 'timing'
      }
    );
  }

  options.push({
    id: 'free_text',
    text: 'Prefiero escribir mi respuesta',
    value: 'free_text',
    category: 'free_text'
  });

  return options;
};

const generateTimeOptions = (): AIAnswerOption[] => {
  return [
    {
      id: 'time_today',
      text: 'Comenzó hoy en la mañana',
      value: 'hoy mañana',
      category: 'timing'
    },
    {
      id: 'time_yesterday',
      text: 'Empezó ayer',
      value: 'ayer',
      category: 'timing'
    },
    {
      id: 'time_few_days',
      text: 'Hace algunos días',
      value: 'hace días',
      category: 'timing'
    },
    {
      id: 'time_week',
      text: 'Hace más de una semana',
      value: 'hace semana',
      category: 'timing'
    },
    {
      id: 'free_text',
      text: 'Prefiero escribir mi respuesta',
      value: 'free_text',
      category: 'free_text'
    }
  ];
};

const generateMedicationOptions = (): AIAnswerOption[] => {
  return [
    {
      id: 'no_allergies',
      text: 'No tengo alergias conocidas',
      value: 'sin alergias',
      category: 'medication'
    },
    {
      id: 'some_allergies',
      text: 'Tengo algunas alergias medicamentosas',
      value: 'con alergias',
      category: 'medication'
    },
    {
      id: 'prefer_natural',
      text: 'Prefiero remedios naturales',
      value: 'remedios naturales',
      category: 'medication'
    },
    {
      id: 'taking_medication',
      text: 'Ya estoy tomando otros medicamentos',
      value: 'otros medicamentos',
      category: 'medication'
    },
    {
      id: 'free_text',
      text: 'Prefiero escribir mi respuesta',
      value: 'free_text',
      category: 'free_text'
    }
  ];
};

const generateSeverityOptions = (): AIAnswerOption[] => {
  return [
    {
      id: 'not_urgent',
      text: 'No es urgente, puedo esperar',
      value: 'no urgente',
      category: 'severity'
    },
    {
      id: 'somewhat_urgent',
      text: 'Me preocupa un poco',
      value: 'algo urgente',
      category: 'severity'
    },
    {
      id: 'urgent',
      text: 'Es bastante urgente',
      value: 'urgente',
      category: 'severity'
    },
    {
      id: 'emergency',
      text: 'Es una emergencia',
      value: 'emergencia',
      category: 'severity'
    },
    {
      id: 'free_text',
      text: 'Prefiero escribir mi respuesta',
      value: 'free_text',
      category: 'free_text'
    }
  ];
};

const generateSymptomOptions = (): AIAnswerOption[] => {
  return [
    {
      id: 'symptom_mild',
      text: 'Son síntomas leves',
      value: 'síntomas leves',
      category: 'general'
    },
    {
      id: 'symptom_worsening',
      text: 'Los síntomas están empeorando',
      value: 'empeorando',
      category: 'general'
    },
    {
      id: 'symptom_improving',
      text: 'Los síntomas están mejorando',
      value: 'mejorando',
      category: 'general'
    },
    {
      id: 'first_time',
      text: 'Es la primera vez que me pasa',
      value: 'primera vez',
      category: 'general'
    },
    {
      id: 'free_text',
      text: 'Prefiero escribir mi respuesta',
      value: 'free_text',
      category: 'free_text'
    }
  ];
};

const generateGeneralOptions = (): AIAnswerOption[] => {
  return [
    {
      id: 'tell_more',
      text: 'Quiero contarte más detalles',
      value: 'más detalles',
      category: 'general'
    },
    {
      id: 'need_help',
      text: 'Necesito ayuda médica',
      value: 'ayuda médica',
      category: 'general'
    },
    {
      id: 'just_question',
      text: 'Solo tengo una pregunta',
      value: 'pregunta',
      category: 'general'
    },
    {
      id: 'free_text',
      text: 'Prefiero escribir mi respuesta',
      value: 'free_text',
      category: 'free_text'
    }
  ];
};

export const shouldGenerateAnswerOptions = (context: ResponseContext): boolean => {
  const { userMessage, conversationHistory } = context;
  
  // Don't generate options if user just selected an option
  const lastBotMessage = conversationHistory[conversationHistory.length - 1];
  if (lastBotMessage && lastBotMessage.includes('Selecciona una opción')) {
    return false;
  }
  
  // Generate options for symptom descriptions
  if (userMessage.length > 10 && 
      (MEXICAN_MEDICAL_CONTEXT.painTerms.some(term => userMessage.toLowerCase().includes(term)) ||
       MEXICAN_MEDICAL_CONTEXT.symptoms.some(symptom => userMessage.toLowerCase().includes(symptom)))) {
    return true;
  }
  
  return false;
}; 