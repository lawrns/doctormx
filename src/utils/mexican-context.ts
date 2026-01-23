/**
 * Mexican Healthcare Cultural Context Utilities
 * Specific to Mexican medical system, culture, and regulations
 */

// Mexican medical institutions and their coverage
export const mexicanMedicalInstitutions = {
  imss: {
    name: 'Instituto Mexicano del Seguro Social',
    type: 'public',
    coverage: 'Trabajadores del sector privado',
    benefits: ['Consultas médicas', 'Hospitalización', 'Medicamentos', 'Incapacidades'],
    website: 'https://www.imss.gob.mx'
  },
  issste: {
    name: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
    type: 'public',
    coverage: 'Trabajadores del gobierno',
    benefits: ['Atención médica', 'Pensiones', 'Vivienda', 'Préstamos'],
    website: 'https://www.gob.mx/issste'
  },
  sedena: {
    name: 'Secretaría de la Defensa Nacional',
    type: 'military',
    coverage: 'Personal militar y familiares',
    benefits: ['Hospital militar', 'Atención especializada', 'Medicamentos'],
    website: 'https://www.gob.mx/sedena'
  },
  semar: {
    name: 'Secretaría de Marina',
    type: 'military', 
    coverage: 'Personal naval y familiares',
    benefits: ['Hospital naval', 'Atención médica', 'Urgencias'],
    website: 'https://www.gob.mx/semar'
  },
  pemex: {
    name: 'Petróleos Mexicanos',
    type: 'corporate',
    coverage: 'Trabajadores de PEMEX',
    benefits: ['Clínica PEMEX', 'Especialistas', 'Cirugías'],
    website: 'https://www.pemex.com'
  },
  seguroPopular: {
    name: 'Seguro Popular / INSABI',
    type: 'public',
    coverage: 'Población sin seguridad social',
    benefits: ['Consultas gratuitas', 'Medicamentos básicos', 'Hospitalización'],
    website: 'https://www.gob.mx/insabi'
  }
};

// Mexican medical specialties in Spanish
export const mexicanSpecialties = {
  'medicina-general': 'Medicina General',
  'medicina-familiar': 'Medicina Familiar',
  'medicina-interna': 'Medicina Interna',
  'pediatria': 'Pediatría',
  'ginecologia': 'Ginecología y Obstetricia',
  'cardiologia': 'Cardiología',
  'dermatologia': 'Dermatología',
  'neurologia': 'Neurología',
  'psiquiatria': 'Psiquiatría',
  'ortopedia': 'Ortopedia y Traumatología',
  'oftalmologia': 'Oftalmología',
  'otorrinolaringologia': 'Otorrinolaringología',
  'urologia': 'Urología',
  'gastroenterologia': 'Gastroenterología',
  'endocrinologia': 'Endocrinología',
  'neumologia': 'Neumología',
  'reumatologia': 'Reumatología',
  'infectologia': 'Infectología',
  'geriatria': 'Geriatría',
  'medicina-del-trabajo': 'Medicina del Trabajo'
};

// Mexican medical terminology
export const mexicanMedicalTerms = {
  // Common symptoms in Mexican Spanish
  symptoms: {
    'dolor-de-cabeza': 'dolor de cabeza',
    'calentura': 'fiebre/calentura',
    'gripa': 'gripe/gripa',
    'agruras': 'acidez estomacal/agruras',
    'anginas': 'dolor de garganta/anginas',
    'colicos': 'cólicos',
    'empacho': 'empacho/indigestión',
    'mollera-sumida': 'mollera sumida (deshidratación)',
    'mal-de-ojo': 'mal de ojo',
    'susto': 'susto (estrés postraumático)',
    'bilis': 'bilis (ira/coraje)'
  },
  
  // Traditional remedies
  remedies: {
    'te-de-manzanilla': 'té de manzanilla',
    'agua-de-jamaica': 'agua de jamaica',
    'vaporub': 'Vicks VapoRub',
    'sobadero': 'sobador/huesero',
    'limpias': 'limpias espirituales',
    'yerbas': 'hierbas medicinales'
  },
  
  // Medical documents
  documents: {
    'cedula-profesional': 'Cédula Profesional',
    'cartilla-vacunacion': 'Cartilla de Vacunación',
    'certificado-medico': 'Certificado Médico',
    'incapacidad': 'Incapacidad Laboral',
    'receta-medica': 'Receta Médica',
    'historia-clinica': 'Historia Clínica'
  }
};

// Mexican cultural health beliefs
export const mexicanHealthBeliefs = {
  hot_cold: {
    description: 'Teoría de lo caliente y lo frío',
    examples: {
      hot: ['fiebre', 'infección', 'dolor', 'coraje'],
      cold: ['gripe', 'resfriado', 'artritis', 'susto']
    },
    treatments: {
      hot_illness: 'Alimentos y medicinas frías',
      cold_illness: 'Alimentos y medicinas calientes'
    }
  },
  
  family_involvement: {
    description: 'Importancia de la familia en decisiones médicas',
    considerations: [
      'Consultar con la familia antes de tomar decisiones',
      'Presencia de familiares durante consultas',
      'Respeto por la autoridad de los mayores',
      'Consideración de remedios tradicionales'
    ]
  },
  
  religious_beliefs: {
    description: 'Influencia religiosa en la salud',
    practices: [
      'Oración por la salud',
      'Promesas a santos',
      'Uso de amuletos protectores',
      'Peregrinaciones por salud'
    ]
  }
};

// Common Mexican greetings and polite phrases for medical contexts
export const mexicanMedicalEtiquette = {
  greetings: {
    formal: {
      morning: 'Buenos días, ¿cómo está usted?',
      afternoon: 'Buenas tardes, ¿en qué le puedo ayudar?',
      evening: 'Buenas noches, espero que esté bien'
    },
    informal: {
      morning: 'Buenos días, ¿cómo amaneciste?',
      afternoon: 'Buenas tardes, ¿cómo te sientes?',
      evening: 'Buenas noches, ¿cómo estás?'
    }
  },
  
  polite_phrases: [
    'Con mucho gusto',
    'Para servirle',
    'No se preocupe',
    'Todo va a estar bien',
    'Dios mediante',
    'Si Dios quiere',
    'Que se mejore pronto',
    'Que Dios lo bendiga'
  ],
  
  medical_questions: {
    opening: [
      '¿Qué molestias presenta?',
      '¿Cómo se ha sentido?',
      '¿Qué síntomas tiene?',
      '¿En qué le puedo ayudar?'
    ],
    follow_up: [
      '¿Desde cuándo tiene estas molestias?',
      '¿Ha tomado algún medicamento?',
      '¿Tiene alguna alergia?',
      '¿Alguien más en su familia ha tenido esto?'
    ]
  }
};

// Mexican healthcare system navigation
export const mexicanHealthcareNavigation = {
  emergency_numbers: {
    general: '911',
    red_cross: '065',
    fire: '911',
    police: '911'
  },
  
  common_hospitals: {
    'hospital-general': 'Hospital General',
    'hospital-militar': 'Hospital Militar',
    'hospital-naval': 'Hospital Naval',
    'centro-medico': 'Centro Médico Nacional',
    'clinica-imss': 'Clínica IMSS',
    'clinica-issste': 'Clínica ISSSTE'
  },
  
  pharmacy_chains: [
    'Farmacias Similares',
    'Farmacias del Ahorro',
    'Farmacias Guadalajara',
    'Farmacias Benavides',
    'Farmacias San Pablo'
  ],
  
  typical_costs: {
    'consulta-general': '$200-500 MXN',
    'consulta-especialista': '$500-1200 MXN',
    'consulta-particular': '$800-2000 MXN',
    'medicamentos-genericos': '$50-200 MXN',
    'medicamentos-patente': '$200-800 MXN'
  }
};

// Utility functions for Mexican context
export const mexicanContextUtils = {
  // Format Mexican phone numbers
  formatMexicanPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },
  
  // Format Mexican currency
  formatMexicanCurrency: (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  },
  
  // Get appropriate greeting based on time
  getTimeBasedGreeting: (formal: boolean = true): string => {
    const hour = new Date().getHours();
    const greetings = formal ? mexicanMedicalEtiquette.greetings.formal : mexicanMedicalEtiquette.greetings.informal;
    
    if (hour < 12) return greetings.morning;
    if (hour < 18) return greetings.afternoon;
    return greetings.evening;
  },
  
  // Validate Mexican professional license (Cédula Profesional)
  validateCedulaProfesional: (cedula: string): boolean => {
    const cleaned = cedula.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 8;
  },
  
  // Get institution info by type
  getInstitutionsByType: (type: 'public' | 'private' | 'military' | 'corporate') => {
    return Object.entries(mexicanMedicalInstitutions)
      .filter(([_, institution]) => institution.type === type)
      .map(([key, institution]) => ({ key, ...institution }));
  },
  
  // Check if location is in Mexico
  isMexicanLocation: (location: string): boolean => {
    const mexicanStates = [
      'aguascalientes', 'baja california', 'baja california sur', 'campeche', 'chiapas',
      'chihuahua', 'coahuila', 'colima', 'durango', 'guanajuato', 'guerrero',
      'hidalgo', 'jalisco', 'mexico', 'michoacan', 'morelos', 'nayarit',
      'nuevo leon', 'oaxaca', 'puebla', 'queretaro', 'quintana roo',
      'san luis potosi', 'sinaloa', 'sonora', 'tabasco', 'tamaulipas',
      'tlaxcala', 'veracruz', 'yucatan', 'zacatecas', 'cdmx', 'ciudad de mexico'
    ];
    
    return mexicanStates.some(state => 
      location.toLowerCase().includes(state) || 
      location.toLowerCase().includes('mexico')
    );
  }
};

export default {
  mexicanMedicalInstitutions,
  mexicanSpecialties,
  mexicanMedicalTerms,
  mexicanHealthBeliefs,
  mexicanMedicalEtiquette,
  mexicanHealthcareNavigation,
  mexicanContextUtils
};