/**
 * Medical Terminology Constants - Doctor.mx
 *
 * Spanish medical terms following NOM-004-SSA3-2012 standards.
 * Includes patient-friendly explanations and proper Mexican Spanish usage.
 *
 * @version 1.0.0
 */

// ==========================================
// MEDICAL TERMS (English → Spanish)
// ==========================================

export const MEDICAL_TERMS: Record<string, { term: string; explanation?: string }> = {
  // Cardiovascular
  'heart attack': {
    term: 'infarto al miocardio',
    explanation: 'cuando el flujo sanguíneo al corazón se bloquea',
  },
  'high blood pressure': {
    term: 'hipertensión arterial',
    explanation: 'presión arterial elevada de forma crónica',
  },
  'low blood pressure': {
    term: 'hipotensión arterial',
    explanation: 'presión arterial más baja de lo normal',
  },
  'heart disease': {
    term: 'enfermedad cardiovascular',
    explanation: 'problemas del corazón y vasos sanguíneos',
  },
  'chest pain': {
    term: 'dolor torácico',
    explanation: 'dolor en el pecho',
  },
  'palpitations': {
    term: 'palpitaciones',
    explanation: 'latidos cardíacos rápidos o irregulares',
  },

  // Respiratory
  'difficulty breathing': {
    term: 'disnea',
    explanation: 'dificultad para respirar',
  },
  'shortness of breath': {
    term: 'falta de aire',
    explanation: 'sensación de no poder respirar bien',
  },
  'cough': {
    term: 'tos',
    explanation: 'reflejo para despejar las vías respiratorias',
  },
  'pneumonia': {
    term: 'neumonía',
    explanation: 'infección de los pulmones',
  },
  'bronchitis': {
    term: 'bronquitis',
    explanation: 'inflamación de los bronquios',
  },
  'asthma': {
    term: 'asma',
    explanation: 'enfermedad que causa inflamación de las vías respiratorias',
  },

  // Neurological
  'stroke': {
    term: 'accidente cerebrovascular',
    explanation: 'interrupción del flujo sanguíneo al cerebro',
  },
  'headache': {
    term: 'cefalea',
    explanation: 'dolor de cabeza',
  },
  'migraine': {
    term: 'migraña',
    explanation: 'dolor de cabeza intenso con otros síntomas',
  },
  'seizure': {
    term: 'convulsión',
    explanation: 'actividad eléctrica anormal en el cerebro',
  },
  'dizziness': {
    term: 'mareo',
    explanation: 'sensación de inestabilidad',
  },
  'numbness': {
    term: 'entumecimiento',
    explanation: 'pérdida de sensibilidad',
  },
  'tingling': {
    term: 'hormigueo',
    explanation: 'sensación de pinchazos',
  },

  // Gastrointestinal
  'nausea': {
    term: 'náusea',
    explanation: 'sensación de querer vomitar',
  },
  'vomiting': {
    term: 'vómito',
    explanation: 'expulsión violenta del contenido del estómago',
  },
  'diarrhea': {
    term: 'diarrea',
    explanation: 'heces líquidas o muy frecuentes',
  },
  'constipation': {
    term: 'estreñimiento',
    explanation: 'dificultad para evacuar',
  },
  'abdominal pain': {
    term: 'dolor abdominal',
    explanation: 'dolor en el vientre',
  },
  'heartburn': {
    term: 'acidez estomacal',
    explanation: 'sensación de quemazón en el pecho',
  },
  'gastroenteritis': {
    term: 'gastroenteritis',
    explanation: 'inflamación del estómago e intestinos',
  },

  // Musculoskeletal
  'fracture': {
    term: 'fractura',
    explanation: 'ruptura de un hueso',
  },
  'sprain': {
    term: 'esguince',
    explanation: 'lesión de un ligamento',
  },
  'strain': {
    term: 'distensión muscular',
    explanation: 'estiramiento excesivo de un músculo',
  },
  'arthritis': {
    term: 'artritis',
    explanation: 'inflamación de las articulaciones',
  },
  'back pain': {
    term: 'dolor lumbar',
    explanation: 'dolor en la parte baja de la espalda',
  },
  'muscle pain': {
    term: 'mialgia',
    explanation: 'dolor muscular',
  },
  'joint pain': {
    term: 'artralgia',
    explanation: 'dolor en las articulaciones',
  },

  // Skin
  'rash': {
    term: 'erupción cutánea',
    explanation: 'cambio en el color o textura de la piel',
  },
  'itching': {
    term: 'prurito',
    explanation: 'sensación de picazón',
  },
  'burn': {
    term: 'quemadura',
    explanation: 'lesión de la piel por calor, químicos o electricidad',
  },
  'wound': {
    term: 'herida',
    explanation: 'lesión en la piel o tejidos',
  },
  'infection': {
    term: 'infección',
    explanation: 'invasión de microorganismos que causan enfermedad',
  },
  'inflammation': {
    term: 'inflamación',
    explanation: 'respuesta del cuerpo a lesión o infección',
  },

  // General
  'fever': {
    term: 'fiebre',
    explanation: 'temperatura corporal elevada',
  },
  'fatigue': {
    term: 'fatiga',
    explanation: 'cansancio extremo',
  },
  'weakness': {
    term: 'debilidad',
    explanation: 'falta de fuerza',
  },
  'swelling': {
    term: 'edema',
    explanation: 'acumulación de líquido en los tejidos',
  },
  'bleeding': {
    term: 'sangrado',
    explanation: 'pérdida de sangre',
  },
  'allergy': {
    term: 'alergia',
    explanation: 'reacción del sistema inmunológico a una sustancia',
  },
  'chronic': {
    term: 'crónico',
    explanation: 'que dura mucho tiempo',
  },
  'acute': {
    term: 'agudo',
    explanation: 'que aparece repentinamente',
  },
}

// ==========================================
// SPANISH UI TERMS
// ==========================================

export const SPANISH_UI = {
  // Actions
  actions: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    retry: 'Reintentar',
    refresh: 'Actualizar',
    close: 'Cerrar',
    continue: 'Continuar',
    back: 'Regresar',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    skip: 'Omitir',
    finish: 'Finalizar',
    download: 'Descargar',
    upload: 'Subir',
  },

  // Authentication
  auth: {
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    signup: 'Registrarse',
    forgotPassword: 'Olvidé mi contraseña',
    resetPassword: 'Restablecer contraseña',
    email: 'Correo electrónico',
    password: 'Contraseña',
    rememberMe: 'Recordarme',
  },

  // Medical
  medical: {
    doctor: 'Médico',
    patient: 'Paciente',
    appointment: 'Cita',
    consultation: 'Consulta médica',
    prescription: 'Receta médica',
    diagnosis: 'Diagnóstico',
    symptoms: 'Síntomas',
    treatment: 'Tratamiento',
    medicalHistory: 'Expediente clínico',
    vitalSigns: 'Signos vitales',
    followUp: 'Seguimiento',
    referral: 'Referencia',
  },

  // Status
  status: {
    loading: 'Cargando...',
    success: '¡Completado!',
    error: 'Algo salió mal',
    pending: 'Pendiente',
    inProgress: 'En progreso',
    cancelled: 'Cancelado',
    completed: 'Completado',
  },

  // Error messages
  errors: {
    network: 'No pudimos conectar. Por favor verifica tu internet e intenta de nuevo.',
    generic: 'Algo salió mal. Si continúa, contacta a soporte.',
    medical: 'Lo sentimos, hubo un error. Por favor intenta nuevamente.',
    validation: 'Por favor revisa los campos marcados.',
    notFound: 'No encontramos lo que buscas.',
    unauthorized: 'No tienes permiso para realizar esta acción.',
    timeout: 'Tardó mucho tiempo. Por favor intenta de nuevo.',
    maintenance: 'Estamos mejorando el servicio. Vuelve en unos minutos.',
  },

  // Medical error messages (empathetic)
  medicalErrors: {
    consultationFailed: {
      title: 'Lo sentimos, no pudimos procesar tu consulta',
      message: 'Por favor intenta nuevamente. Si el problema persiste, nuestro equipo médico te ayudará.',
      action: 'Intentar nuevamente',
    },
    appointmentUnavailable: {
      title: 'Horario no disponible',
      message: 'Este horario ya fue reservado. Por favor selecciona otro.',
      action: 'Ver otros horarios',
    },
    prescriptionError: {
      title: 'Error al generar receta',
      message: 'No pudimos crear tu receta. Por favor intenta de nuevo o contacta a tu médico.',
      action: 'Reintentar',
    },
  },
} as const

// ==========================================
// SYMPTOM CATEGORIES (Spanish)
// ==========================================

export const SYMPTOM_CATEGORIES = {
  cardiovascular: {
    label: 'Cardiovascular',
    symptoms: ['dolor torácico', 'palpitaciones', 'dificultad breathing', 'hinchazón'],
  },
  respiratory: {
    label: 'Respiratorio',
    symptoms: ['tos', 'falta de aire', 'sibilancias', 'dolor garganta'],
  },
  gastrointestinal: {
    label: 'Gastrointestinal',
    symptoms: ['náusea', 'vómito', 'dolor abdominal', 'diarrea', 'estreñimiento'],
  },
  neurological: {
    label: 'Neurológico',
    symptoms: ['cefalea', 'mareo', 'entumecimiento', 'hormigueo', 'confusión'],
  },
  musculoskeletal: {
    label: 'Musculoesquelético',
    symptoms: ['dolor muscular', 'dolor articular', 'rigidez', 'debilidad'],
  },
  skin: {
    label: 'Piel',
    symptoms: ['erupción', 'picazón', 'enrojecimiento', 'hinchazón', 'quemadura'],
  },
  general: {
    label: 'General',
    symptoms: ['fiebre', 'fatiga', 'dolor corporal', 'escalofríos', 'sudoración'],
  },
}

// ==========================================
// PRESCRIPTION INSTRUCTIONS (Spanish)
// ==========================================

export const PRESCRIPTION_INSTRUCTIONS = {
  frequency: {
    once: 'una vez',
    twice: 'dos veces',
    threeTimes: 'tres veces',
    fourTimes: 'cuatro veces',
    asNeeded: 'según sea necesario',
  },

  timing: {
    morning: 'por la mañana',
    afternoon: 'por la tarde',
    evening: 'por la noche',
    beforeMeals: 'antes de los alimentos',
    afterMeals: 'después de los alimentos',
    withFood: 'con alimentos',
    onEmptyStomach: 'en estómago vacío',
    atBedtime: 'al dormir',
  },

  warnings: {
    doNotShare: 'No comparta este medicamento con nadie.',
    finishCourse: 'Termine el tratamiento completo incluso si se siente mejor.',
    alcohol: 'Evite el consumo de alcohol mientras toma este medicamento.',
    driving: 'Tenga cuidado al conducir u operar maquinaria.',
    sunExposure: 'Evite la exposición prolongada al sol.',
  },
}

// ==========================================
// TRIAGE LEVELS (Spanish)
// ==========================================

export const TRIAGE_LEVELS = {
  emergency: {
    label: 'Emergencia',
    description: 'Requiere atención médica inmediata',
    color: 'red',
    examples: ['dolor torácico', 'dificultad respirar severa', 'pérdida de conciencia'],
  },
  urgent: {
    label: 'Urgente',
    description: 'Atención médica el mismo día',
    color: 'orange',
    examples: ['fiebre alta', 'dolor intenso', 'sangrado'],
  },
  routine: {
    label: 'Rutina',
    description: 'Atención médica en los próximos días',
    color: 'yellow',
    examples: ['dolor leve', 'tos leve', 'síntomas gripales'],
  },
  selfCare: {
    label: 'Autocuidado',
    description: 'Se puede manejar en casa',
    color: 'green',
    examples: ['resfriado común', 'pequeñas heridas', 'dolor muscular leve'],
  },
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get Spanish medical term with explanation
 */
export function getMedicalTerm(englishTerm: string): { term: string; explanation?: string } | undefined {
  return MEDICAL_TERMS[englishTerm.toLowerCase()]
}

/**
 * Get patient-friendly explanation for a medical term
 */
export function getPatientExplanation(englishTerm: string): string | undefined {
  return MEDICAL_TERMS[englishTerm.toLowerCase()]?.explanation
}

/**
 * Translate common English phrase to Mexican Spanish
 */
export function toSpanish(phrase: keyof typeof SPANISH_UI[keyof typeof SPANISH_UI]): string {
  // Simple lookup - in production would use i18n library
  return phrase as string
}
