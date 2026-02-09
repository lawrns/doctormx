// Clinical Copilot - AI-Assisted Clinical Decision Support

import { getAIClient, glm } from '@/lib/openai'
import { router } from './router'
import { createServiceClient } from '@/lib/supabase/server'
import { retrieveMedicalContext, generateAugmentedPrompt } from '@/lib/medical-knowledge'
import { logger } from '@/lib/observability/logger'
import { GLM_CONFIG, isGLMConfigured } from './glm'

export type SOAPNote = {
    subjective: string
    objective: string
    assessment: string
    plan: string
}

export type DifferentialDiagnosis = {
    diagnosis: string
    probability: number
    reasoning: string
}

export type CopilotSuggestions = {
    soapNote: SOAPNote
    differentialDiagnoses: DifferentialDiagnosis[]
    quickReplies: string[]
    nextSteps: string[]
}

export type DrugInteraction = {
    drug1: string
    drug2: string
    severity: 'low' | 'medium' | 'high' | 'contraindicated'
    description: string
    recommendation: string
}

export type ICPCode = {
    code: string
    description: string
    category: string
}

export type ConsultationSummary = {
    chiefComplaint: string
    symptoms: string[]
    diagnosis: string
    treatment: string
    followUp: string
    notes: string
}

export type PrescriptionTemplate = {
    medications: Array<{
        name: string
        dosage: string
        frequency: string
        duration: string
        instructions: string
    }>
    recommendations: string[]
    warnings: string[]
}

const MEXICAN_ICD10_CODES: Record<string, ICPCode> = {
    'J06.9': { code: 'J06.9', description: 'Infeccion respiratoria aguda superior', category: 'Enfermedades respiratorias' },
    'J01.9': { code: 'J01.9', description: 'Sinusitis aguda', category: 'Enfermedades respiratorias' },
    'M54.5': { code: 'M54.5', description: 'Dolor lumbar', category: 'Enfermedades musculoesqueleticas' },
    'K30': { code: 'K30', description: 'Dispepsia funcional', category: 'Enfermedades gastrointestinales' },
    'F32.9': { code: 'F32.9', description: 'Episodio depresivo mayor', category: 'Trastornos mentales' },
    'I10': { code: 'I10', description: 'Hipertension esencial', category: 'Enfermedades cardiovasculares' },
    'E11.9': { code: 'E11.9', description: 'Diabetes mellitus tipo 2', category: 'Enfermedades endocrinas' },
    'J45.9': { code: 'J45.9', description: 'Asma no especificada', category: 'Enfermedades respiratorias' },
    'F41.1': { code: 'F41.1', description: 'Trastorno de ansiedad generalizada', category: 'Trastornos mentales' },
    'B34.9': { code: 'B34.9', description: 'Infeccion viral', category: 'Enfermedades infecciosas' },
    'R51': { code: 'R51', description: 'Cefalea', category: 'Sintomas y signos' },
    'R05': { code: 'R05', description: 'Tos', category: 'Sintomas y signos' },
    'R50.9': { code: 'R50.9', description: 'Fiebre no especificada', category: 'Sintomas y signos' },
    'N39.0': { code: 'N39.0', description: 'Infeccion urinaria', category: 'Enfermedades urinarias' },
    'L30.9': { code: 'L30.9', description: 'Dermatitis no especificada', category: 'Enfermedades dermatologicas' },
}

const CLINICAL_QUESTIONS: Record<string, string[]> = {
    general: [
        'Desde cuanto tiempo presenta estos sintomas?',
        'Ha tenido episodios similares anteriormente?',
        'Que factores empeoran o mejoran los sintomas?',
        'Esta tomando algum medicamento actual?',
        'Tiene alguma alergia conocida?',
    ],
    respiratory: [
        'Tiene dificultad para respirar?',
        'Presenta secrecion nasal?',
        'Tiene fiebre o escalofrios?',
        'Ha perdido el sentido del gusto u olfato?',
        'Tiene dolor de garganta?',
    ],
    gastrointestinal: [
        'Cuantas veces al dia evacua?',
        'Las heces tienen sangre o moco?',
        'Siente nauseas o vomitos?',
        'Tiene dolor abdominal? Describalo.',
        'Ha perdido peso sin razon aparente?',
    ],
    cardiovascular: [
        'Siente palpitaciones?',
        'Tiene dolor en el pecho?',
        'Se fatiga facilmente?',
        'Tiene hinchazon en piernas o pies?',
        'Antecedentes de presion alta?',
    ],
    musculoskeletal: [
        'Donde exactamente siente el dolor?',
        'El dolor se irradia a otras areas?',
        'Que movimientos lo empeoran?',
        'Ha tenido alguma lesion reciente?',
        'Siente rigidez matutina?',
    ],
    neurological: [
        'Ha tenido dolor de cabeza intenso?',
        'Siente mareos o vertigo?',
        'Ha tenido vision borrosa?',
        'Siente debilidad em alguma extremidad?',
        'Ha tenido confusion o desorientacion?',
    ],
    psychiatric: [
        'Como describiría su estado de animo?',
        'Tiene dificultades para dormir?',
        'Ha perdido interes em actividades?',
        'Siente ansiedad o preocupacion excesiva?',
        'Ha tenido pensamientos negativos?',
    ],
}

const RED_FLAGS = [
    { pattern: /dolor.*pecho|angina|infarto/i, message: 'Dolor toracico - Evaluar emergencia cardiaca', severity: 'high' },
    { pattern: /dificultad.*para.*respirar|ahogo|sibilancias/i, message: 'Sintomas respiratorios graves - Evaluar emergencia', severity: 'high' },
    { pattern: /paralisis|debilidad.*extremo|cara.*colgada/i, message: 'Posible evento neurologico - Evaluar ACV', severity: 'critical' },
    { pattern: /hemorragia|sangrado.*fuerte/i, message: 'Sangrado significativo - Evaluar urgencia', severity: 'high' },
    { pattern: /convulsiones|ataques|espasmos/i, message: 'Convulsiones - Requiere evaluacion urgente', severity: 'critical' },
    { pattern: /fiebre.*alta|41|42|40.*grados/i, message: 'Fiebre muy alta - Riesgo de sepsis', severity: 'high' },
    { pattern: /confusion|desorientado|no.*reconoce/i, message: 'Alteracion del estado mental - Evaluar', severity: 'high' },
    { pattern: /pensamientos.*suicidio|quiere.*morir|autolesion/i, message: 'Ideacion suicida - Intervencion inmediata', severity: 'critical' },
    { pattern: /dolor.*cabeza.*peor.*vida/i, message: 'Cefalea thunderclap - Descartar hemorragia subaracnoidea', severity: 'critical' },
    { pattern: /abdomen.*rigido|rebound|defensa/i, message: 'Signos de peritonitis - Evaluar emergencia quirurgica', severity: 'high' },
]

export async function generateSuggestions(
    symptoms: string[],
    history?: string[]
): Promise<{ questions: string[]; redFlags: Array<{ message: string; severity: string }> }> {
    try {
        const detectedCategories = detectSymptomCategories(symptoms)
        let suggestedQuestions = [...CLINICAL_QUESTIONS.general]

        for (const category of detectedCategories) {
            if (CLINICAL_QUESTIONS[category]) {
                suggestedQuestions = [...suggestedQuestions, ...CLINICAL_QUESTIONS[category]]
            }
        }

        suggestedQuestions = [...new Set(suggestedQuestions)].slice(0, 8)

        const redFlags = detectRedFlags(symptoms.join(' ') + ' ' + (history?.join(' ') || ''))

        return {
            questions: suggestedQuestions,
            redFlags,
        }
    } catch (error) {
        logger.error('Error generating suggestions:', { error })
        return { questions: CLINICAL_QUESTIONS.general, redFlags: [] }
    }
}

function detectSymptomCategories(symptoms: string[]): string[] {
    const categories: string[] = []
    const symptomText = symptoms.join(' ').toLowerCase()

    if (/resfriado|gripe|tos|fiebre|dolor.*garganta|congestion|rinitis/i.test(symptomText)) {
        categories.push('respiratory')
    }
    if (/dolor.*estomago|nausea|vomito|diarrea|estreñimiento|dispepsia/i.test(symptomText)) {
        categories.push('gastrointestinal')
    }
    if (/corazon|palpitaciones|presion|pecho|hipertension/i.test(symptomText)) {
        categories.push('cardiovascular')
    }
    if (/dolor.*espalda|dolor.*articulacion|dolor.*muscular|rigidez|cuello/i.test(symptomText)) {
        categories.push('musculoskeletal')
    }
    if (/cabeza|mareo|vertigo|confusion|dolor.*cabeza|migrana/i.test(symptomText)) {
        categories.push('neurological')
    }
    if (/ansiedad|depresion|humor|estres|insomnio|tristeza/i.test(symptomText)) {
        categories.push('psychiatric')
    }

    return categories
}

function detectRedFlags(text: string): Array<{ message: string; severity: string }> {
    const detected: Array<{ message: string; severity: string }> = []

    for (const redFlag of RED_FLAGS) {
        if (redFlag.pattern.test(text)) {
            detected.push({
                message: redFlag.message,
                severity: redFlag.severity,
            })
        }
    }

    return detected
}

export async function checkDrugInteractions(
    medications: Array<{ name: string; dosage: string; frequency: string }>
): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = []
    const medicationNames = medications.map(m => m.name.toLowerCase())

    const knownInteractions = [
        {
            drugs: ['ibuprofeno', 'naproxeno', 'diclofenaco'],
            aspirin: { severity: 'high', description: 'Aumento del riesgo de sangrado gastrointestinal', recommendation: 'Considerar protector gastrico o alternativa' },
        },
        {
            drugs: ['metformina'],
            contrast: { severity: 'high', description: 'Riesgo de nefropatia por contraste', recommendation: 'Suspender metformina 48h antes y despues de examen con contraste' },
        },
        {
            drugs: ['warfarina', 'acenocumarol'],
            aspirin: { severity: 'high', description: 'Potenciacion del efecto anticoagulante', recommendation: 'Monitorizar INR y ajustar dosis' },
            ibuprofen: { severity: 'high', description: 'Aumento del riesgo de sangrado', recommendation: 'EvitarAINEs, usar paracetamol si necesita analgesico' },
        },
        {
            drugs: ['omeprazol', 'pantoprazol', 'esomeprazol'],
            clopidogrel: { severity: 'medium', description: 'Reduccion de la eficacia del clopidogrel', recommendation: 'Considerar pantoprazol como alternativa' },
        },
        {
            drugs: ['levotiroxina', 'tiroxina'],
            calcio: { severity: 'medium', description: 'Calcio reduce la absorcion de levotiroxina', recommendation: 'Separar la toma al menos 4 horas' },
            hierro: { severity: 'medium', description: 'Hierro reduce la absorcion de levotiroxina', recommendation: 'Separar la toma al menos 4 horas' },
        },
        {
            drugs: ['sertralina', 'fluoxetina', 'paroxetina', 'citalopram', 'escitalopram'],
            tramadol: { severity: 'high', description: 'Riesgo de sindrome serotoninergico', recommendation: 'Evitar combinacion o usar con extrema precaution' },
        },
    ]

    for (const interactionGroup of knownInteractions) {
        const matchingDrugs = medicationNames.filter(name =>
            interactionGroup.drugs.some(d => name.includes(d))
        )

        for (const drug of matchingDrugs) {
            for (const [key, value] of Object.entries(interactionGroup)) {
                if (key !== 'drugs' && typeof value === 'object') {
                    const otherDrugs = medicationNames.filter(name =>
                        name.includes(key) || (key === 'aspirin' && name.includes('aspirina'))
                    )

                    for (const other of otherDrugs) {
                        if (other !== drug) {
                            interactions.push({
                                drug1: drug,
                                drug2: other,
                                severity: value.severity,
                                description: value.description,
                                recommendation: value.recommendation,
                            })
                        }
                    }
                }
            }
        }
    }

    return interactions
}

export async function suggestDifferentialDiagnosis(
    symptoms: string[],
    patientInfo?: { age?: number; gender?: string; medicalHistory?: string[] }
): Promise<DifferentialDiagnosis[]> {
    try {
        const symptomsText = symptoms.join('\n- ')
        const contextText = patientInfo
            ? `Edad: ${patientInfo.age || 'No especificada'}\nGenero: ${patientInfo.gender || 'No especificado'}\nAntecedentes: ${patientInfo.medicalHistory?.join(', ') || 'Sin antecedentes relevantes'}`
            : ''

        // Use DeepSeek R1 for superior medical reasoning (98% cost savings)
        const response = await router.routeReasoning(
            [
                {
                    role: 'system',
                    content: `Eres un medico internista experimentado. Basandote en los sintomas proporcionados, genera diagnosticos diferenciales probabilisticos.
Responde en JSON valido con esta estructura:
{
  "diagnoses": [
    {
      "diagnosis": "nombre del diagnostico",
      "probability": numero entre 0 y 100,
      "reasoning": "explicacion breve del razonamiento clinico"
    }
  ]
}`,
                },
                {
                    role: 'user',
                    content: `Sintomas del paciente:\n- ${symptomsText}\n\n${contextText}\n\nGenera los 3-5 diagnosticos diferenciales mas probables. Considera prevalencia, epidemiologia y factores de riesgo.`,
                },
            ],
            'differential-diagnosis'
        )

        let diagnosisData
        try {
            const jsonMatch = response.content.match(/\{[\s\S]*\}/)
            diagnosisData = jsonMatch ? JSON.parse(jsonMatch[0]) : { diagnoses: [] }
        } catch {
            diagnosisData = { diagnoses: [] }
        }

        logger.info('[COPILOT] Differential diagnosis completed', {
            provider: response.provider,
            model: response.model,
            costUSD: response.costUSD,
            latencyMs: response.latencyMs,
            hasReasoning: !!response.reasoning,
        })

        return (diagnosisData.diagnoses || []).map((d: { diagnosis?: string; probability?: number; reasoning?: string }) => ({
            diagnosis: d.diagnosis || '',
            probability: d.probability || 0,
            reasoning: d.reasoning || '',
        }))
    } catch (error) {
        logger.error('Error suggesting differential diagnosis:', { error })
        return []
    }
}

export async function generateConsultationSummary(
    transcription: string
): Promise<ConsultationSummary> {
    try {
        // Use GLM as primary provider for consultation summaries
        const client = isGLMConfigured() ? glm : getAIClient()
        const model = isGLMConfigured() ? GLM_CONFIG.models.reasoning : 'gpt-4-turbo'

        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: `Eres un medico generando notas clinicas. Genera un resumen estructurado de la consulta medica.
Responde en JSON valido con esta estructura:
{
  "chiefComplaint": "motivo principal de consulta",
  "symptoms": ["lista de sintomas mencionados"],
  "diagnosis": "diagnostico probable o impresion diagnostica",
  "treatment": "tratamiento recomendado",
  "followUp": "instrucciones de seguimiento",
  "notes": "notas adicionales importantes"
}`,
                },
                {
                    role: 'user',
                    content: `Transcripcion de la consulta:\n${transcription}\n\nGenera un resumen estructurado de esta consulta medica.`,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000,
        })

        let summaryData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            summaryData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
        } catch {
            summaryData = {}
        }

        logger.info('[COPILOT] Consultation summary generated', {
            provider: isGLMConfigured() ? 'glm' : 'openai',
            model,
        })

        return {
            chiefComplaint: summaryData.chiefComplaint || '',
            symptoms: summaryData.symptoms || [],
            diagnosis: summaryData.diagnosis || '',
            treatment: summaryData.treatment || '',
            followUp: summaryData.followUp || '',
            notes: summaryData.notes || '',
        }
    } catch (error) {
        logger.error('Error generating consultation summary:', { error })
        throw error
    }
}

export async function suggestICDCodes(
    symptoms: string[],
    diagnosis?: string
): Promise<ICPCode[]> {
    try {
        const suggestedCodes: ICPCode[] = []

        for (const codeInfo of Object.values(MEXICAN_ICD10_CODES)) {
            const symptomMatch = symptoms.some(s =>
                codeInfo.description.toLowerCase().includes(s.toLowerCase()) ||
                s.toLowerCase().includes(codeInfo.description.toLowerCase().split(' ')[0])
            )

            if (symptomMatch || (diagnosis && diagnosis.toLowerCase().includes(codeInfo.description.toLowerCase().split(' ')[0]))) {
                suggestedCodes.push(codeInfo)
            }
        }

        if (suggestedCodes.length === 0) {
            // Use GLM as primary provider for ICD code suggestions
            const client = isGLMConfigured() ? glm : getAIClient()
            const model = isGLMConfigured() ? GLM_CONFIG.models.costEffective : 'gpt-4-turbo'

            const response = await client.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: 'Eres un coder medico especializado en ICD-10. Sugiere los codigos mas apropiados.' },
                    { role: 'user', content: `Sintomas: ${symptoms.join(', ')}\nDiagnostico: ${diagnosis || 'No especificado'}\nSugiere hasta 3 codigos ICD-10 relevantes. Responde en JSON: { "codes": [{ "code": "X00.0", "description": "descripcion", "category": "categoria" }] }` },
                ],
                temperature: 0.2,
                max_tokens: 500,
            })

            try {
                const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
                const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { codes: [] }
                return data.codes || []
            } catch {
                return suggestedCodes
            }
        }

        return suggestedCodes.slice(0, 5)
    } catch (error) {
        logger.error('Error suggesting ICD codes:', { error })
        return []
    }
}

export async function prefillPrescription(
    consultationData: {
        diagnosis: string
        symptoms: string[]
        patientHistory?: {
            allergies?: string[]
            currentMedications?: Array<{ name: string; dosage: string }>
        }
    }
): Promise<PrescriptionTemplate> {
    try {
        // Use GLM as primary provider for prescriptions
        const client = isGLMConfigured() ? glm : getAIClient()
        const model = isGLMConfigured() ? GLM_CONFIG.models.reasoning : 'gpt-4-turbo'

        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: `Eres un medico generando una receta medica. Genera una plantilla de prescripcion apropiada.
Responde en JSON valido con esta estructura:
{
  "medications": [
    {
      "name": "nombre del medicamento",
      "dosage": "dosis (ej: 500mg)",
      "frequency": "frecuencia (ej: cada 8 horas)",
      "duration": "duracion (ej: 7 dias)",
      "instructions": "instrucciones adicionales"
    }
  ],
  "recommendations": ["recomendaciones generales"],
  "warnings": ["precauciones o advertencias"]
}`,
                },
                {
                    role: 'user',
                    content: `Diagnostico: ${consultationData.diagnosis}
Sintomas: ${consultationData.symptoms.join(', ')}
Alergias conocidas: ${consultationData.patientHistory?.allergies?.join(', ') || 'Ninguna'}
Medicamentos actuales: ${consultationData.patientHistory?.currentMedications?.map(m => m.name).join(', ') || 'Ninguno'}

Genera una plantilla de prescripcion apropiada para este caso.`,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000,
        })

        let prescriptionData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            prescriptionData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
        } catch {
            prescriptionData = {}
        }

        logger.info('[COPILOT] Prescription prefilled', {
            provider: isGLMConfigured() ? 'glm' : 'openai',
            model,
        })

        return {
            medications: prescriptionData.medications || [],
            recommendations: prescriptionData.recommendations || [],
            warnings: prescriptionData.warnings || [],
        }
    } catch (error) {
        logger.error('Error pre-filling prescription:', { error })
        throw error
    }
}

export async function generateSOAPNote(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<SOAPNote> {
    try {
        const userMessages = conversationHistory
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join(' ')

        const medicalContext = await retrieveMedicalContext(userMessages, 3)

        const soapPrompt = generateAugmentedPrompt(
            `Analiza la siguiente consulta medica y extrae los elementos SOAP:

S (Subjective): Lo que el paciente reporta
O (Objective): Hallazgos clinicos objetivos
A (Assessment): Evaluacion e impresion diagnostica
P (Plan): Plan de tratamiento y seguimiento

Responde en JSON con esta estructura:
{
  "subjective": "descripcion",
  "objective": "descripcion",
  "assessment": "descripcion",
  "plan": "descripcion"
}`,
            medicalContext
        )

        // Use GLM as primary provider for SOAP notes
        const client = isGLMConfigured() ? glm : getAIClient()
        const model = isGLMConfigured() ? GLM_CONFIG.models.reasoning : 'gpt-4-turbo'

        const response = await client.chat.completions.create({
            model,
            messages: [
                ...conversationHistory,
                { role: 'user', content: soapPrompt },
            ],
            temperature: 0.3,
            max_tokens: 800,
        })

        let soapData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            soapData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
        } catch {
            soapData = {}
        }

        logger.info('[COPILOT] SOAP note generated', {
            provider: isGLMConfigured() ? 'glm' : 'openai',
            model,
        })

        return {
            subjective: soapData.subjective || '',
            objective: soapData.objective || '',
            assessment: soapData.assessment || '',
            plan: soapData.plan || '',
        }
    } catch (error) {
        logger.error('Error generating SOAP note:', { error })
        throw error
    }
}

export async function generateDifferentialDiagnoses(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    patientInfo?: {
        age?: number
        gender?: string
        medicalHistory?: string[]
    }
): Promise<DifferentialDiagnosis[]> {
    try {
        const userMessages = conversationHistory
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join(' ')

        const medicalContext = await retrieveMedicalContext(userMessages, 5)

        const patientContext = patientInfo
            ? `Informacion del paciente: Edad ${patientInfo.age}, ${patientInfo.gender}, Antecedentes: ${patientInfo.medicalHistory?.join(', ')}`
            : ''

        const diagnosisPrompt = generateAugmentedPrompt(
            `${patientContext}

Basandote en la consulta medica, genera los 3 diagnosticos diferenciales mas probables.

Responde en JSON con esta estructura:
{
  "diagnoses": [
    {
      "diagnosis": "nombre del diagnostico",
      "probability": numero entre 0 y 100,
      "reasoning": "explicacion breve"
    }
  ]
}

Importante:
- Las probabilidades deben sumar aproximadamente 100
- Incluye solo diagnosticos clinicamente relevantes
- Proporciona razonamiento basado en los sintomas`,
            medicalContext
        )

        // Use GLM as primary provider for differential diagnoses
        const client = isGLMConfigured() ? glm : getAIClient()
        const model = isGLMConfigured() ? GLM_CONFIG.models.reasoning : 'gpt-4-turbo'

        const response = await client.chat.completions.create({
            model,
            messages: [
                ...conversationHistory,
                { role: 'user', content: diagnosisPrompt },
            ],
            temperature: 0.5,
            max_tokens: 600,
        })

        let diagnosisData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            diagnosisData = jsonMatch ? JSON.parse(jsonMatch[0]) : { diagnoses: [] }
        } catch {
            diagnosisData = { diagnoses: [] }
        }

        logger.info('[COPILOT] Differential diagnoses generated', {
            provider: isGLMConfigured() ? 'glm' : 'openai',
            model,
        })

        return (diagnosisData.diagnoses || []).map((d: { diagnosis?: string; probability?: number; reasoning?: string }) => ({
            diagnosis: d.diagnosis || '',
            probability: d.probability || 0,
            reasoning: d.reasoning || '',
        }))
    } catch (error) {
        logger.error('Error generating differential diagnoses:', { error })
        return []
    }
}

export async function generateQuickReplies(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string[]> {
    try {
        const quickReplyPrompt = `Basandote en la consulta medica, genera 3-4 respuestas rapidas que el doctor podria usar.

Las respuestas deben ser:
- Profesionales pero empaticas
- Breves (maximo 1-2 lineas)
- En español
- Contextualmente relevantes

Responde en JSON con esta estructura:
{
  "replies": ["respuesta 1", "respuesta 2", "respuesta 3"]
}`

        // Use GLM as primary provider for quick replies (cost effective)
        const client = isGLMConfigured() ? glm : getAIClient()
        const model = isGLMConfigured() ? GLM_CONFIG.models.costEffective : 'gpt-4-turbo'

        const response = await client.chat.completions.create({
            model,
            messages: [
                ...conversationHistory,
                { role: 'user', content: quickReplyPrompt },
            ],
            temperature: 0.7,
            max_tokens: 300,
        })

        let repliesData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            repliesData = jsonMatch ? JSON.parse(jsonMatch[0]) : { replies: [] }
        } catch {
            repliesData = { replies: [] }
        }

        return repliesData.replies || []
    } catch (error) {
        logger.error('Error generating quick replies:', { error })
        return []
    }
}

export async function generateNextSteps(
    soapNote: SOAPNote,
    diagnoses: DifferentialDiagnosis[]
): Promise<string[]> {
    try {
        const diagnosisText = diagnoses
            .map(d => `${d.diagnosis} (${d.probability}%)`)
            .join(', ')

        const nextStepsPrompt = `Basandote en el diagnostico y plan de tratamiento, genera 3-5 pasos siguientes para el doctor.

Diagnosticos: ${diagnosisText}
Plan: ${soapNote.plan}

Los pasos deben ser:
- Especificos y accionables
- Ordenados por prioridad
- Clinicamente relevantes
- En español

Responde en JSON con esta estructura:
{
  "steps": ["paso 1", "paso 2", "paso 3"]
}`

        // Use GLM as primary provider for next steps (cost effective)
        const client = isGLMConfigured() ? glm : getAIClient()
        const model = isGLMConfigured() ? GLM_CONFIG.models.costEffective : 'gpt-4-turbo'

        const response = await client.chat.completions.create({
            model,
            messages: [
                { role: 'user', content: nextStepsPrompt },
            ],
            temperature: 0.5,
            max_tokens: 400,
        })

        let stepsData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            stepsData = jsonMatch ? JSON.parse(jsonMatch[0]) : { steps: [] }
        } catch {
            stepsData = { steps: [] }
        }

        return stepsData.steps || []
    } catch (error) {
        logger.error('Error generating next steps:', { error })
        return []
    }
}

export async function generateCopilotSuggestions(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    patientInfo?: {
        age?: number
        gender?: string
        medicalHistory?: string[]
    }
): Promise<CopilotSuggestions> {
    try {
        const soapNote = await generateSOAPNote(conversationHistory)
        const diagnoses = await generateDifferentialDiagnoses(conversationHistory, patientInfo)
        const quickReplies = await generateQuickReplies(conversationHistory)
        const nextSteps = await generateNextSteps(soapNote, diagnoses)

        return {
            soapNote,
            differentialDiagnoses: diagnoses,
            quickReplies,
            nextSteps,
        }
    } catch (error) {
        logger.error('Error generating copilot suggestions:', { error })
        throw error
    }
}

export async function saveCopilotSession(
    appointmentId: string,
    doctorId: string,
    suggestions: CopilotSuggestions,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
) {
    const supabase = createServiceClient()

    try {
        const { data: session, error } = await supabase
            .from('clinical_copilot_sessions')
            .insert({
                appointment_id: appointmentId,
                doctor_id: doctorId,
                messages,
                suggestions,
                soap_note: suggestions.soapNote,
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to save copilot session: ${error.message}`)
        }

        return { success: true, session }
    } catch (error) {
        logger.error('Error saving copilot session:', { error })
        throw error
    }
}

export async function getCopilotSession(appointmentId: string) {
    const supabase = createServiceClient()

    try {
        const { data: session, error } = await supabase
            .from('clinical_copilot_sessions')
            .select('*')
            .eq('appointment_id', appointmentId)
            .single()

        if (error) {
            return null
        }

        return session
    } catch (error) {
        logger.error('Error getting copilot session:', { error })
        return null
    }
}
