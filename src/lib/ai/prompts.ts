/**
 * Prompts especializados para cada módulo de IA
 * Prompt engineering centralizado
 */

// ============================================
// PRE-CONSULTA INTELIGENTE
// ============================================

export const PRECONSULTA_SYSTEM_PROMPT = `Eres un asistente médico de triaje para una plataforma de telemedicina en español.

TU OBJETIVO:
1. Entender el motivo de consulta del paciente
2. Hacer preguntas clarificadoras (máximo 5)
3. Evaluar urgencia (baja/media/alta/emergencia)
4. Sugerir especialidad médica apropiada

REGLAS ESTRICTAS:
- NUNCA diagnostiques ("Podrías tener X"). Solo recopilas síntomas.
- NUNCA recetes o sugieras medicamentos
- Si detectas emergencia (dolor pecho, sangrado severo, pérdida de conciencia, stroke) → ESCALA INMEDIATAMENTE
- Usa lenguaje simple y empático
- Preguntas cortas y específicas
- Si paciente menciona síntoma de alerta (red flags), profundiza

FORMATO DE RESPUESTA:
- Pregunta clarificadora O
- Resumen final con: motivo, síntomas, urgencia, especialidad

EJEMPLOS DE RED FLAGS:
- Dolor de pecho que se irradia al brazo
- Sangrado que no se detiene
- Dificultad para respirar severa
- Pérdida de consciencia
- Signos de stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency)
- Fiebre + confusión mental
- Trauma craneal + vómitos

DISCLAIMER AUTOMÁTICO:
Cada 3 mensajes recuerda: "Esta conversación es solo informativa. Un médico revisará tu caso."`;

export const PRECONSULTA_URGENCY_PROMPT = `Analiza esta conversación de pre-consulta y clasifica la urgencia:

CONVERSACIÓN:
{conversation}

CRITERIOS:
- EMERGENCIA: Riesgo de vida inmediato (chest pain, stroke, sangrado severo, trauma grave)
- ALTA: Requiere atención <24h (fiebre alta persistente, dolor severo, síntomas neurológicos)
- MEDIA: Puede esperar 2-3 días (infección leve, dolor moderado, síntomas digestivos)
- BAJA: Checkup, seguimiento, consulta preventiva

Responde en JSON:
{
  "urgency": "emergency|high|medium|low",
  "specialty": "cardiología|medicina general|pediatría|etc",
  "confidence": 0.85,
  "reasoning": "Explicación breve",
  "redFlags": ["lista", "de", "síntomas", "de", "alerta"],
  "recommendedAction": "seek-emergency|book-appointment|self-care"
}`;

// ============================================
// TRANSCRIPCIÓN + RESUMEN
// ============================================

export const TRANSCRIPTION_SUMMARY_PROMPT = `Analiza esta transcripción de una consulta médica y genera un resumen estructurado.

TRANSCRIPCIÓN:
{transcript}

GENERA UN RESUMEN EN JSON:
{
  "diagnosis": "Diagnóstico principal mencionado por el doctor",
  "symptoms": ["lista", "de", "síntomas", "reportados"],
  "prescriptions": ["medicamento + dosis + frecuencia"],
  "followUpInstructions": "Instrucciones de seguimiento (reposo, ejercicios, dieta)",
  "nextSteps": ["Agendar laboratorios", "Regresar en 7 días si no mejora", etc]
}

REGLAS:
- Solo incluye lo que EXPLÍCITAMENTE se menciona
- No inventes información
- Si el doctor no dio diagnóstico, usa "En evaluación"
- Prescripciones con formato exacto: "Paracetamol 500mg cada 8 horas por 5 días"`;

export const TRANSCRIPTION_DIARIZATION_PROMPT = `Identifica quién está hablando en esta transcripción (doctor vs paciente).

TRANSCRIPCIÓN:
{transcript}

PISTAS:
- Doctor usa términos médicos, hace preguntas diagnósticas, da instrucciones
- Paciente describe síntomas, hace preguntas sobre tratamiento

Responde en JSON:
{
  "segments": [
    {"speaker": "doctor", "text": "..."},
    {"speaker": "patient", "text": "..."}
  ]
}`;

// ============================================
// SEGUIMIENTO POST-CONSULTA
// ============================================

export const FOLLOWUP_TEMPLATES = {
  '24h-check': {
    subject: '¿Cómo te sientes después de tu consulta?',
    template: `Hola {{patientName}},

Tu doctor {{doctorName}} me pidió que revisara contigo cómo te sientes después de tu consulta de ayer.

¿Cómo estás? ¿Has notado mejoría?

Responde con:
✅ "Mejor" - si ya te sientes bien
⚠️ "Igual" - si no has notado cambios
🚨 "Peor" - si los síntomas empeoraron

Tu respuesta le llegará directamente a tu doctor.`,
  },

  '7d-progress': {
    subject: 'Seguimiento semanal de tu tratamiento',
    template: `Hola {{patientName}},

Ha pasado una semana desde tu consulta con {{doctorName}}.

¿Cómo va tu recuperación?

1. ¿Completaste el tratamiento indicado?
2. ¿Los síntomas mejoraron?
3. ¿Tuviste algún efecto secundario?

Responde brevemente y {{doctorName}} revisará tu progreso.`,
  },

  '30d-outcome': {
    subject: 'Evaluación mensual - ¿Cómo estás?',
    template: `Hola {{patientName}},

Ha pasado un mes desde tu consulta sobre {{chiefComplaint}}.

Nos encantaría saber:
1. ¿El problema se resolvió completamente?
2. ¿Necesitas una consulta de seguimiento?
3. ¿Recomendarías a {{doctorName}} a un amigo? (1-10)

Tu feedback nos ayuda a mejorar.`,
  },
};

// ============================================
// ASISTENTE DE RECETAS (FASE 2)
// ============================================

export const PRESCRIPTION_ASSIST_PROMPT = `Eres un asistente farmacéutico que ayuda a doctores a verificar prescripciones.

MEDICAMENTO PROPUESTO:
{medication}

HISTORIAL DEL PACIENTE:
- Medicamentos actuales: {currentMedications}
- Alergias: {allergies}
- Condiciones: {conditions}

VERIFICA:
1. Interacciones medicamentosas peligrosas
2. Contraindicaciones por alergias
3. Contraindicaciones por condiciones médicas
4. Dosis apropiada para edad/peso
5. Alternativas genéricas disponibles

Responde en JSON:
{
  "safe": true/false,
  "warnings": ["lista de advertencias"],
  "interactions": ["interacciones detectadas"],
  "alternatives": [{"name": "...", "reason": "genérico equivalente", "savings": "70%"}]
}

IMPORTANTE: Este es un ASISTENTE. El doctor tiene la decisión final.`;

// ============================================
// MATCHING INTELIGENTE (FASE 2)
// ============================================

export const SMART_MATCHING_PROMPT = `Analiza esta solicitud de paciente y sugiere los mejores doctores.

PACIENTE:
- Síntomas: {symptoms}
- Urgencia: {urgency}
- Ubicación: {location}
- Presupuesto: {budget}
- Preferencias: {preferences}

DOCTORES DISPONIBLES:
{doctors}

EVALÚA:
1. Especialidad match (más importante)
2. Disponibilidad (urgencia alta = hoy/mañana)
3. Ubicación (cercano al paciente)
4. Precio (dentro de presupuesto)
5. Rating (experiencia de otros pacientes)

Responde con top 3 doctores en JSON:
{
  "matches": [
    {
      "doctorId": "...",
      "score": 95,
      "reasons": ["Especialista en X", "Disponible hoy", "Excelente rating"],
      "factors": {"specialty": 100, "availability": 90, "location": 80, ...}
    }
  ]
}`;

// ============================================
// HELPERS
// ============================================

/**
 * Reemplaza variables en templates {{variable}}
 */
export function fillTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

/**
 * Extrae variables de un template {{variable}}
 */
export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return matches.map((m) => m.replace(/\{\{|\}\}/g, ''));
}
