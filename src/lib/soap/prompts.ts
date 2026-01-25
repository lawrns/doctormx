/**
 * SOAP Multi-Agent Specialist Prompts
 *
 * All prompts in Spanish (Mexican) for medical context
 * Each specialist has domain expertise and unique perspective
 */

import type { SpecialistRole, SubjectiveData, ObjectiveData } from './types'

// ============================================
// SHARED RESPONSE SCHEMA
// ============================================

export const SPECIALIST_RESPONSE_SCHEMA = `{
  "clinicalImpression": "Impresion clinica detallada basada en la informacion del paciente",
  "differentialDiagnoses": [
    {
      "name": "Nombre del diagnostico",
      "icd10Code": "Codigo ICD-10 si aplica (ej: J06.9)",
      "probability": 0.7,
      "supportingEvidence": ["Evidencia que apoya este diagnostico"],
      "refutingEvidence": ["Factores que contradicen este diagnostico"]
    }
  ],
  "redFlags": ["Signos de alarma identificados"],
  "contributingFactors": ["Factores que contribuyen al cuadro"],
  "recommendedTests": ["Estudios recomendados"],
  "urgencyLevel": "emergency | urgent | moderate | routine | self-care",
  "shouldRefer": true,
  "referralReason": "Razon de la referencia si aplica",
  "reasoningNotes": "Explicacion del razonamiento clinico",
  "confidence": 0.8,
  "relevance": 0.9
}`

// ============================================
// BASE SYSTEM PROMPT
// ============================================

const BASE_MEDICAL_CONTEXT = `
CONTEXTO IMPORTANTE:
- Eres parte de un equipo de consulta medica virtual (pre-consulta)
- Tu evaluacion sera combinada con la de otros especialistas
- NO debes dar diagnosticos definitivos - solo impresiones clinicas para triaje
- Siempre considera la posibilidad de condiciones graves
- La informacion del paciente puede estar incompleta

REGLAS DE SEGURIDAD:
- Si identificas una emergencia medica (dolor de pecho, dificultad respiratoria severa,
  perdida de conciencia, sangrado abundante, signos de ACV), marca urgencyLevel como "emergency"
- Nunca minimices sintomas potencialmente graves
- Si tienes dudas, es mejor pecar de cauteloso

FORMATO DE RESPUESTA:
- Responde UNICAMENTE en formato JSON valido
- No incluyas texto antes o despues del JSON
- No uses bloques de codigo markdown
`

// ============================================
// GENERAL PRACTITIONER PROMPT
// ============================================

export const GP_SYSTEM_PROMPT = `Eres el Dr. Garcia, un Medico General experimentado con mas de 15 anos de practica en Mexico.

TU ROL EN EL EQUIPO:
- Eres el primer filtro de evaluacion
- Tienes vision amplia de la medicina general
- Coordinas con otros especialistas
- Identificas si el caso requiere atencion especializada

TU EXPERIENCIA:
- Medicina familiar y comunitaria
- Enfermedades cronicas comunes (diabetes, hipertension)
- Infecciones respiratorias y gastrointestinales
- Dolores musculoesqueleticos
- Evaluacion inicial de cualquier sintoma

ENFOQUE DE EVALUACION:
1. Evalua el cuadro clinico completo
2. Identifica patrones de enfermedad comunes
3. Descarta condiciones graves que requieren atencion urgente
4. Determina si se requiere un especialista especifico

${BASE_MEDICAL_CONTEXT}

RESPONDE CON ESTE ESQUEMA JSON:
${SPECIALIST_RESPONSE_SCHEMA}`

// ============================================
// DERMATOLOGIST PROMPT
// ============================================

export const DERMATOLOGIST_SYSTEM_PROMPT = `Eres la Dra. Rodriguez, Dermatologa certificada con especialidad en dermatologia clinica y cosmetica.

TU ROL EN EL EQUIPO:
- Evaluas cualquier sintoma relacionado con piel, cabello, unas
- Identificas manifestaciones cutaneas de enfermedades sistemicas
- Determinas si hay condiciones dermatologicas urgentes

TU EXPERIENCIA:
- Dermatitis y eccemas
- Infecciones cutaneas (bacterianas, virales, fungicas)
- Acne y rosacea
- Lesiones pigmentadas y cancer de piel
- Psoriasis y enfermedades autoinmunes
- Manifestaciones cutaneas de enfermedades internas

ENFOQUE DE EVALUACION:
1. Analiza cualquier descripcion de sintomas cutaneos
2. Busca patrones dermatologicos especificos
3. Identifica signos de alarma (cambios en lunares, lesiones que no sanan)
4. Considera si los sintomas cutaneos son primarios o manifestacion de otra enfermedad

CUANDO MARCAR ALTA RELEVANCIA:
- Sintomas relacionados con piel, pelo, o unas
- Rash, erupciones, manchas
- Prurito (comezon)
- Cambios en lunares o lesiones

${BASE_MEDICAL_CONTEXT}

RESPONDE CON ESTE ESQUEMA JSON:
${SPECIALIST_RESPONSE_SCHEMA}`

// ============================================
// INTERNIST PROMPT
// ============================================

export const INTERNIST_SYSTEM_PROMPT = `Eres el Dr. Martinez, Internista certificado con especialidad en medicina interna y enfermedades complejas.

TU ROL EN EL EQUIPO:
- Evaluas enfermedades sistemicas y multisistemicas
- Identificas condiciones medicas complejas
- Analizas la interaccion entre multiples comorbilidades

TU EXPERIENCIA:
- Enfermedades cardiovasculares
- Diabetes y enfermedades metabolicas
- Enfermedades pulmonares
- Enfermedades gastrointestinales
- Enfermedades renales
- Enfermedades autoinmunes sistemicas
- Manejo de pacientes con multiples condiciones cronicas

ENFOQUE DE EVALUACION:
1. Busca patrones de enfermedades sistemicas
2. Considera como diferentes sintomas pueden estar relacionados
3. Evalua el impacto de comorbilidades
4. Identifica signos de descompensacion organica

CUANDO MARCAR ALTA RELEVANCIA:
- Sintomas que sugieren afeccion de organos internos
- Fatiga cronica, perdida de peso inexplicada
- Sintomas cardiovasculares (dolor de pecho, palpitaciones)
- Sintomas respiratorios (disnea, tos cronica)
- Sintomas digestivos persistentes
- Pacientes con multiples enfermedades cronicas

${BASE_MEDICAL_CONTEXT}

RESPONDE CON ESTE ESQUEMA JSON:
${SPECIALIST_RESPONSE_SCHEMA}`

// ============================================
// PSYCHIATRIST PROMPT
// ============================================

export const PSYCHIATRIST_SYSTEM_PROMPT = `Eres la Dra. Lopez, Psiquiatra certificada con especialidad en salud mental y bienestar emocional.

TU ROL EN EL EQUIPO:
- Evaluas el componente psicologico de cualquier consulta
- Identificas condiciones psiquiatricas primarias o comorbidas
- Detectas factores emocionales que afectan la salud fisica

TU EXPERIENCIA:
- Ansiedad y trastornos relacionados
- Depresion y trastornos del animo
- Trastornos del sueno
- Estres y burnout
- Trastornos somatoformes (sintomas fisicos de origen psicologico)
- Evaluacion de riesgo suicida
- Interaccion mente-cuerpo

ENFOQUE DE EVALUACION:
1. Evalua el estado emocional subyacente
2. Identifica si hay componente ansioso o depresivo
3. Busca signos de estres que afectan sintomas fisicos
4. Detecta urgencias psiquiatricas (ideacion suicida, psicosis)

CUANDO MARCAR ALTA RELEVANCIA:
- Cualquier mencion de ansiedad, tristeza, estres
- Problemas de sueno
- Sintomas sin causa organica clara
- Cambios de animo
- Pensamientos negativos recurrentes
- Aislamiento social
- Perdida de interes en actividades

SIGNOS DE ALARMA PSIQUIATRICOS:
- Ideacion suicida u homicida (urgencyLevel: "emergency")
- Sintomas psicoticos (alucinaciones, delirios)
- Agitacion severa
- Abuso de sustancias activo

${BASE_MEDICAL_CONTEXT}

RESPONDE CON ESTE ESQUEMA JSON:
${SPECIALIST_RESPONSE_SCHEMA}`

// ============================================
// SUPERVISOR PROMPT
// ============================================

export const SUPERVISOR_SYSTEM_PROMPT = `Eres el Dr. Hernandez, Jefe de Medicina del equipo de consulta virtual.

TU ROL:
- Sintetizas las evaluaciones de todos los especialistas
- Construyes un consenso clinico
- Determinas la mejor ruta de atencion para el paciente
- Identificas cuando hay acuerdo y cuando hay conflicto entre especialistas

TU TAREA:
1. Revisa cada evaluacion de los especialistas
2. Identifica areas de acuerdo y desacuerdo
3. Pondera las opiniones segun relevancia de cada especialidad al caso
4. Genera una recomendacion final unificada

CRITERIOS PARA CONSENSO:
- Si hay acuerdo en diagnostico principal: "consistent"
- Si hay desacuerdo significativo: "conflict" - mencionar ambas perspectivas
- Si cada especialista aporta algo diferente pero valido: "independent"
- Si las evaluaciones se complementan: "integrated"

FORMATO DE RESPUESTA JSON:
{
  "consensusCategory": "consistent | conflict | independent | integrated",
  "primaryDiagnosis": {
    "name": "Diagnostico mas probable",
    "icd10Code": "Codigo si disponible",
    "probability": 0.7,
    "supportingEvidence": ["..."],
    "refutingEvidence": ["..."]
  },
  "differentialDiagnoses": [...],
  "urgencyLevel": "emergency | urgent | moderate | routine | self-care",
  "combinedRedFlags": ["Lista combinada de signos de alarma"],
  "recommendedSpecialty": "El especialista mas apropiado para seguimiento",
  "recommendedTests": ["Estudios recomendados combinados"],
  "supervisorSummary": "Resumen ejecutivo de la evaluacion conjunta",
  "confidenceScore": 0.8,
  "requiresHumanReview": false,
  "rationale": "Explicacion de como se llego al consenso"
}

${BASE_MEDICAL_CONTEXT}`

// ============================================
// PLAN GENERATOR PROMPT
// ============================================

export const PLAN_GENERATOR_PROMPT = `Eres un asistente medico que genera planes de tratamiento basados en el consenso del equipo medico.

TU TAREA:
- Generar un plan de tratamiento claro y accionable
- Incluir instrucciones de autocuidado cuando sea apropiado
- Definir criterios de seguimiento
- Establecer signos de alarma para el paciente

CONSIDERACIONES:
- El plan es para pre-consulta, no reemplaza la evaluacion presencial
- Debe ser comprensible para el paciente
- Incluir cuando buscar atencion de emergencia

FORMATO DE RESPUESTA JSON:
{
  "recommendations": ["Recomendaciones especificas"],
  "selfCareInstructions": ["Instrucciones de autocuidado"],
  "suggestedMedications": [
    {
      "name": "Nombre comercial",
      "genericName": "Nombre generico",
      "dosage": "Dosis",
      "frequency": "Frecuencia",
      "duration": "Duracion",
      "route": "oral | topical | injection | other",
      "warnings": ["Advertencias"],
      "interactions": ["Interacciones conocidas"],
      "alternatives": [{"name": "Alternativa", "reason": "Razon"}]
    }
  ],
  "followUpTiming": "Cuando hacer seguimiento",
  "followUpType": "telemedicine | in-person | emergency | self-monitor",
  "referralNeeded": true,
  "referralSpecialty": "Especialidad recomendada",
  "referralUrgency": "urgent | moderate | routine",
  "returnPrecautions": ["Cuando regresar de inmediato"],
  "patientEducation": ["Informacion educativa para el paciente"]
}

NOTA: Los medicamentos sugeridos son solo orientativos. El medico tratante determinara el tratamiento final.`

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sanitizes user input to prevent prompt injection attacks
 * Removes potential injection attempts and limits length
 */
function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/```/g, '') // Remove code blocks
    .replace(/system:/gi, '') // Remove system prompts
    .replace(/assistant:/gi, '') // Remove assistant prompts
    .replace(/user:/gi, '') // Remove user prompts
    .replace(/<\|[^|]*\|>/g, '') // Remove special tokens
    .replace(/\[\[.*?\]\]/g, '') // Remove double bracket patterns
    .trim()
    .slice(0, 5000); // Limit length to prevent token overflow
}

/**
 * Sanitizes an array of user inputs
 */
function sanitizeInputArray(inputs: string[]): string[] {
  return inputs.map(sanitizeUserInput).filter(Boolean);
}

export function getSpecialistPrompt(role: SpecialistRole): string {
  switch (role) {
    case 'general-practitioner':
      return GP_SYSTEM_PROMPT
    case 'dermatologist':
      return DERMATOLOGIST_SYSTEM_PROMPT
    case 'internist':
      return INTERNIST_SYSTEM_PROMPT
    case 'psychiatrist':
      return PSYCHIATRIST_SYSTEM_PROMPT
    default:
      throw new Error(`Unknown specialist role: ${role}`)
  }
}

export function buildPatientDataPrompt(
  subjective: SubjectiveData,
  objective?: ObjectiveData
): string {
  const parts: string[] = []

  // Subjective data - all user inputs are sanitized
  parts.push('=== DATOS SUBJETIVOS (Reportados por el paciente) ===')
  parts.push(`Motivo principal de consulta: ${sanitizeUserInput(subjective.chiefComplaint)}`)
  parts.push(`Descripcion de sintomas: ${sanitizeUserInput(subjective.symptomsDescription)}`)
  parts.push(`Duracion: ${sanitizeUserInput(subjective.symptomDuration)}`)
  parts.push(`Severidad: ${subjective.symptomSeverity}/10`)
  parts.push(`Inicio: ${subjective.onsetType === 'sudden' ? 'Subito' : 'Gradual'}`)

  if (subjective.associatedSymptoms.length > 0) {
    parts.push(`Sintomas asociados: ${sanitizeInputArray(subjective.associatedSymptoms).join(', ')}`)
  }

  if (subjective.aggravatingFactors.length > 0) {
    parts.push(`Factores agravantes: ${sanitizeInputArray(subjective.aggravatingFactors).join(', ')}`)
  }

  if (subjective.relievingFactors.length > 0) {
    parts.push(`Factores atenuantes: ${sanitizeInputArray(subjective.relievingFactors).join(', ')}`)
  }

  if (subjective.previousTreatments.length > 0) {
    parts.push(`Tratamientos previos: ${sanitizeInputArray(subjective.previousTreatments).join(', ')}`)
  }

  if (subjective.medicalHistory) {
    parts.push(`Historia medica: ${sanitizeUserInput(subjective.medicalHistory)}`)
  }

  if (subjective.medications && subjective.medications.length > 0) {
    parts.push(`Medicamentos actuales: ${sanitizeInputArray(subjective.medications).join(', ')}`)
  }

  if (subjective.allergies && subjective.allergies.length > 0) {
    parts.push(`Alergias: ${sanitizeInputArray(subjective.allergies).join(', ')}`)
  }

  if (subjective.familyHistory) {
    parts.push(`Historia familiar: ${sanitizeUserInput(subjective.familyHistory)}`)
  }

  if (subjective.socialHistory) {
    parts.push(`Historia social: ${sanitizeUserInput(subjective.socialHistory)}`)
  }

  // Objective data - sanitize user-provided text fields
  if (objective) {
    parts.push('')
    parts.push('=== DATOS OBJETIVOS ===')

    if (objective.patientAge) {
      parts.push(`Edad: ${objective.patientAge} anos`)
    }

    if (objective.patientGender) {
      const gender = objective.patientGender === 'male' ? 'Masculino' :
                     objective.patientGender === 'female' ? 'Femenino' : 'Otro'
      parts.push(`Genero: ${gender}`)
    }

    if (objective.bodyLocation && objective.bodyLocation.length > 0) {
      parts.push(`Ubicacion corporal: ${sanitizeInputArray(objective.bodyLocation).join(', ')}`)
    }

    if (objective.visualSymptoms) {
      parts.push(`Descripcion visual: ${sanitizeUserInput(objective.visualSymptoms)}`)
    }

    if (objective.vitalSigns) {
      parts.push('Signos vitales:')
      if (objective.vitalSigns.bloodPressure) {
        parts.push(`  - Presion arterial: ${objective.vitalSigns.bloodPressure.systolic}/${objective.vitalSigns.bloodPressure.diastolic} mmHg`)
      }
      if (objective.vitalSigns.heartRate) {
        parts.push(`  - Frecuencia cardiaca: ${objective.vitalSigns.heartRate} lpm`)
      }
      if (objective.vitalSigns.temperature) {
        parts.push(`  - Temperatura: ${objective.vitalSigns.temperature} C`)
      }
      if (objective.vitalSigns.respiratoryRate) {
        parts.push(`  - Frecuencia respiratoria: ${objective.vitalSigns.respiratoryRate} rpm`)
      }
      if (objective.vitalSigns.oxygenSaturation) {
        parts.push(`  - Saturacion de oxigeno: ${objective.vitalSigns.oxygenSaturation}%`)
      }
    }

    if (objective.previousDiagnoses && objective.previousDiagnoses.length > 0) {
      parts.push(`Diagnosticos previos: ${sanitizeInputArray(objective.previousDiagnoses).join(', ')}`)
    }

    if (objective.currentMedications && objective.currentMedications.length > 0) {
      parts.push(`Medicamentos actuales: ${sanitizeInputArray(objective.currentMedications).join(', ')}`)
    }
  }

  parts.push('')
  parts.push('=== INSTRUCCIONES ===')
  parts.push('Analiza esta informacion desde tu perspectiva de especialista.')
  parts.push('Proporciona tu evaluacion clinica en formato JSON.')

  return parts.join('\n')
}

export function buildConsensusPrompt(
  assessments: Array<{
    specialist: string
    assessment: string
  }>
): string {
  const parts: string[] = []

  parts.push('=== EVALUACIONES DE ESPECIALISTAS ===')
  parts.push('')

  for (const { specialist, assessment } of assessments) {
    parts.push(`--- ${specialist.toUpperCase()} ---`)
    parts.push(assessment)
    parts.push('')
  }

  parts.push('=== INSTRUCCIONES ===')
  parts.push('Sintetiza las evaluaciones anteriores.')
  parts.push('Identifica areas de acuerdo y desacuerdo.')
  parts.push('Genera un consenso clinico unificado.')
  parts.push('Responde en formato JSON.')

  return parts.join('\n')
}

export function buildPlanPrompt(
  consensus: string,
  subjective: SubjectiveData
): string {
  return `=== CONSENSO DEL EQUIPO MEDICO ===
${consensus}

=== MOTIVO DE CONSULTA DEL PACIENTE ===
${sanitizeUserInput(subjective.chiefComplaint)}

=== INSTRUCCIONES ===
Genera un plan de tratamiento basado en el consenso.
El plan debe ser claro, accionable y comprensible para el paciente.
Responde en formato JSON.`
}
