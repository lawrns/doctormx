/**
 * Medical Disclaimers and Legal Protection
 * These disclaimers are critical for liability protection
 */

export const MEDICAL_DISCLAIMERS = {
  GENERAL: {
    es: 'Esta consulta virtual no reemplaza la atención médica profesional. En caso de emergencia, llame al 911 o acuda al hospital más cercano.',
    en: 'This virtual consultation does not replace professional medical care. In case of emergency, call 911 or go to the nearest hospital.'
  },
  
  AI_LIMITATION: {
    es: 'Las recomendaciones son generadas por inteligencia artificial y deben ser verificadas por un profesional médico.',
    en: 'Recommendations are AI-generated and should be verified by a medical professional.'
  },
  
  EMERGENCY: {
    es: '⚠️ ADVERTENCIA: Si experimenta dolor en el pecho, dificultad para respirar, o síntomas graves, busque atención médica inmediata.',
    en: '⚠️ WARNING: If experiencing chest pain, difficulty breathing, or severe symptoms, seek immediate medical attention.'
  },
  
  PRESCRIPTION: {
    es: 'Las sugerencias de medicamentos requieren validación por un médico con licencia. No se automedique.',
    en: 'Medication suggestions require validation by a licensed physician. Do not self-medicate.'
  },
  
  PEDIATRIC: {
    es: 'Para pacientes menores de 18 años, siempre consulte con un pediatra certificado.',
    en: 'For patients under 18, always consult with a certified pediatrician.'
  },
  
  NO_DIAGNOSIS: {
    es: 'Este servicio proporciona información médica general, no diagnósticos definitivos.',
    en: 'This service provides general medical information, not definitive diagnoses.'
  },
  
  DATA_PRIVACY: {
    es: 'Su información médica está protegida según las leyes de privacidad de México (LFPDPPP).',
    en: 'Your medical information is protected under Mexican privacy laws (LFPDPPP).'
  }
};

export const EMERGENCY_THRESHOLDS = {
  CRITICAL: 0.85,  // Standardized threshold for critical emergencies
  HIGH: 0.70,      // High priority but not immediate emergency
  MEDIUM: 0.50,    // Moderate priority
  LOW: 0.30        // Low priority, routine care
};

export const EMERGENCY_SYMPTOMS = {
  IMMEDIATE: [
    'dolor en el pecho',
    'chest pain',
    'dificultad para respirar',
    'difficulty breathing',
    'pérdida de conciencia',
    'loss of consciousness',
    'sangrado severo',
    'severe bleeding',
    'convulsiones',
    'seizures',
    'dolor de cabeza súbito e intenso',
    'sudden severe headache'
  ],
  
  URGENT: [
    'fiebre alta persistente',
    'persistent high fever',
    'vómito con sangre',
    'vomiting blood',
    'dolor abdominal severo',
    'severe abdominal pain',
    'mareos severos',
    'severe dizziness',
    'cambios en la visión',
    'vision changes'
  ]
};

export const LEGAL_CONSENT = {
  TELEMEDICINE: {
    es: 'Al usar este servicio, acepto que es solo para orientación médica general y no sustituye la consulta presencial con un médico.',
    en: 'By using this service, I accept that it is only for general medical guidance and does not replace in-person consultation with a doctor.'
  },
  
  DATA_USE: {
    es: 'Autorizo el uso de mis datos médicos de forma anónima para mejorar el servicio, conforme a la LFPDPPP.',
    en: 'I authorize the use of my medical data anonymously to improve the service, in accordance with LFPDPPP.'
  },
  
  AGE_VERIFICATION: {
    es: 'Confirmo que soy mayor de 18 años o cuento con autorización de mis padres/tutores.',
    en: 'I confirm that I am over 18 years old or have authorization from my parents/guardians.'
  }
};