/**
 * AI Response Parser - Structures medical AI responses with severity, specialty, and recommendations
 * Supports both legacy text responses and new structured JSON format
 */

/**
 * Parse AI response and extract medical information
 * @param {string} content - AI response content
 * @returns {Object} Structured response object
 */
export const parseAIResponse = (content) => {
  const response = {
    content: content,
    severity: extractSeverity(content),
    recommended_specialty: extractSpecialty(content),
    prescription: extractPrescription(content),
    lab_orders: extractLabOrders(content),
    follow_up_questions: extractFollowUpQuestions(content),
    red_flags: extractRedFlags(content),
  };
  return response;
};

/**
 * Extract severity level from response
 * @param {string} content - Response content
 * @returns {string} 'green' | 'yellow' | 'orange' | 'red' | null
 */
export const extractSeverity = (content) => {
  if (!content) return null;
  
  const urgentPatterns = [
    /emergencia|911|urgente|llama|inmediata|grave|crítica/i,
    /requiere atención inmediata|necesita hospital|hemorragia/i,
  ];
  
  const soonPatterns = [
    /próximos? (día|horas|24 horas)/i,
    /dentro de 24.*horas|consulta.*pronto/i,
    /especialista.*recomendado|derivación.*especialista/i,
  ];
  
  const monitorPatterns = [
    /monitorear|observe|vigilar|evolución|si empeora/i,
    /puede mejorar en|días|desaparece|autocuidado/i,
  ];
  
  // Check for emergency/red flags first
  if (urgentPatterns.some(pattern => pattern.test(content))) {
    return 'red';
  }
  
  // Check for specialist recommendation
  if (soonPatterns.some(pattern => pattern.test(content))) {
    return 'orange';
  }
  
  // Check for monitoring
  if (monitorPatterns.some(pattern => pattern.test(content))) {
    return 'yellow';
  }
  
  // Default to safe
  return 'green';
};

/**
 * Extract medical specialty from response
 * @param {string} content - Response content
 * @returns {string|null} Specialty name or null
 */
export const extractSpecialty = (content) => {
  if (!content) return null;
  
  const specialties = [
    'Cardiología', 'Neurología', 'Gastroenterología', 'Pediatría',
    'Dermatología', 'Ginecología', 'Urología', 'Psicología',
    'Medicina General', 'Oftalmología', 'Neumología', 'Endocrinología',
    'Reumatología', 'Oncología', 'Traumatología', 'Cirugía General',
  ];
  
  const regex = new RegExp(`especialista en (${specialties.join('|')})|derivar a (${specialties.join('|')})|consultar con (${specialties.join('|')})`, 'i');
  const match = content.match(regex);
  
  if (match) {
    return match[1] || match[2] || match[3];
  }
  
  // Alternative pattern: "especialidad sugerida: Cardiología"
  const altMatch = content.match(/especialidad sugerida:?\s*([A-Za-z\s]+?)(?:\n|$|\.)/i);
  if (altMatch) {
    return altMatch[1].trim();
  }
  
  return null;
};

/**
 * Extract prescription recommendations
 * @param {string} content - Response content
 * @returns {Object} Prescription object with items and notes
 */
export const extractPrescription = (content) => {
  if (!content) return { available: false };
  
  const hasPrescription = /receta|medicamento|fármaco|prescripción|tomar|vía oral|inyección/i.test(content);
  
  if (!hasPrescription) {
    return { available: false };
  }
  
  // Extract medication items (simplified)
  const medicationPatterns = [
    /- ([A-Za-z\s0-9]+)\s*(?:\(|:|cada)/gi,
    /([A-Za-z\s0-9]+mg)\s(?:cada|diariamente|veces)/gi,
  ];
  
  const items = [];
  medicationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      items.push(match[1].trim());
    }
  });
  
  // Extract note/instructions
  const noteMatch = content.match(/(?:nota|importante|recuerda|mantén|evita):?\s*([^\n.]+)/i);
  
  return {
    available: true,
    items: items.length > 0 ? items : ['Medicamentos recomendados según diagnóstico'],
    note: noteMatch ? noteMatch[1].trim() : 'Seguir indicaciones del médico',
  };
};

/**
 * Extract lab order recommendations
 * @param {string} content - Response content
 * @returns {Object} Lab orders object with items and notes
 */
export const extractLabOrders = (content) => {
  if (!content) return { available: false };
  
  const hasLabOrder = /análisis|laboratorio|examen|prueba|test|sangre|radiografía|ultrasonido|resonancia/i.test(content);
  
  if (!hasLabOrder) {
    return { available: false };
  }
  
  const labTests = [
    'Hemograma completo',
    'Perfil de glucosa',
    'Panel lipídico',
    'Pruebas de función hepática',
    'Pruebas de función renal',
    'Análisis de orina',
    'Radiografía de tórax',
    'Ultrasonido abdominal',
  ];
  
  const items = [];
  labTests.forEach(test => {
    if (content.toLowerCase().includes(test.toLowerCase())) {
      items.push(test);
    }
  });
  
  return {
    available: true,
    items: items.length > 0 ? items : ['Análisis de laboratorio recomendados'],
    note: 'Realiza estos análisis en un laboratorio certificado',
  };
};

/**
 * Extract follow-up questions
 * @param {string} content - Response content
 * @returns {Array} Array of follow-up questions
 */
export const extractFollowUpQuestions = (content) => {
  if (!content) return [];
  
  // Look for explicit follow-up patterns
  const questions = [];
  
  const patterns = [
    /¿([^?]+\?)/g,  // Spanish questions
    /(¿[^?]*\?)/g,   // Alternative Spanish
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const question = match[1].trim();
      if (question.length > 10 && question.length < 100) {
        questions.push(question);
      }
    }
  });
  
  // If no explicit questions found, generate contextual ones
  if (questions.length === 0) {
    const contextualQuestions = [
      '¿Cuándo comenzaron los síntomas?',
      '¿Has tomado algún medicamento para esto?',
      '¿Has experimentado síntomas similares antes?',
    ];
    return contextualQuestions;
  }
  
  return questions.slice(0, 3); // Return max 3 questions
};

/**
 * Extract red flags/warning signs
 * @param {string} content - Response content
 * @returns {Array} Array of red flag descriptions
 */
export const extractRedFlags = (content) => {
  if (!content) return [];
  
  const redFlags = [];
  
  const flagPatterns = [
    { pattern: /pérdida de conocimiento|desmayo/i, flag: 'Pérdida de consciencia' },
    { pattern: /dificultad para respirar|disnea/i, flag: 'Dificultad respiratoria' },
    { pattern: /dolor de pecho|pecho oprimido/i, flag: 'Dolor torácico' },
    { pattern: /hemorragia|sangrado abundante/i, flag: 'Hemorragia severa' },
    { pattern: /fiebre (alta|39|40)/i, flag: 'Fiebre alta' },
    { pattern: /confusión|desorientación|confundido/i, flag: 'Confusión mental' },
    { pattern: /parálisis|debilidad severa/i, flag: 'Parálisis o debilidad severa' },
    { pattern: /vómito|vómitos persistentes/i, flag: 'Vómitos persistentes' },
  ];
  
  flagPatterns.forEach(({ pattern, flag }) => {
    if (pattern.test(content)) {
      redFlags.push(flag);
    }
  });
  
  return redFlags;
};

/**
 * Format response for chat UI display
 * @param {Object} parsedResponse - Parsed response object
 * @returns {Object} Formatted response with UI hints
 */
export const formatResponseForUI = (parsedResponse) => {
  return {
    ...parsedResponse,
    showSeverity: parsedResponse.severity !== 'green',
    showPrescription: parsedResponse.prescription.available,
    showLabOrders: parsedResponse.lab_orders.available,
    showReferral: !!parsedResponse.recommended_specialty,
    showWarnings: parsedResponse.red_flags.length > 0,
  };
};

/**
 * Extract user location if available from context
 * @returns {Object} Location object with city and region
 */
export const getUserLocation = () => {
  // Placeholder - can be enhanced with geolocation API
  return {
    city: 'Ciudad de México',
    region: 'CDMX',
    latitude: null,
    longitude: null,
  };
};

/**
 * Match AI response with available doctors by specialty
 * @param {string} specialty - Medical specialty
 * @param {Array} doctors - Array of doctor objects
 * @returns {Object} Matching doctors object
 */
export const matchDoctorsToSpecialty = (specialty, doctors = []) => {
  if (!specialty || !doctors.length) {
    return { count: 0, sample: [], specialty };
  }
  
  const matched = doctors.filter(doc => 
    doc.specialties?.some(s => s.toLowerCase() === specialty.toLowerCase())
  );
  
  return {
    specialty,
    count: matched.length,
    sample: matched.slice(0, 2),
  };
};
