// OTC Medication Recommendations
// Input: Symptoms, patient info
// Process: Generate safe OTC recommendations
// Output: Medications with dosage and warnings

import { openai } from '@/lib/openai'
import { createServiceClient } from '@/lib/supabase/server'

export type OTCCategory =
    | 'analgesic'
    | 'antipyretic'
    | 'antigripal'
    | 'gastrointestinal'
    | 'topical'
    | 'ophthalmic'
    | 'vitamin'
    | 'supplement'

export type OTCRecommendation = {
    medicationName: string
    category: OTCCategory
    dosage: string
    frequency: string
    durationDays: number
    warnings: string[]
    contraindications: string[]
    whenToStop: string
    purpose: string
}

// Prohibited medications - NEVER recommend
const PROHIBITED_MEDICATIONS = [
    'antibiotics',
    'antihypertensives',
    'hypoglycemics',
    'psychotropics',
    'opioids',
    'systemic steroids',
    'anticoagulants',
    'antidepressants',
    'anxiolytics',
    'anticonvulsants',
    'immunosuppressants',
    'antiretrovirals',
    'chemotherapy',
]

/**
 * Generate OTC recommendations
 * Input: symptoms, patientInfo
 * Process: Generate safe recommendations
 * Output: List of OTC medications
 */
export async function generateOTCRecommendations(
    symptoms: string[],
    patientInfo?: {
        age?: number
        gender?: string
        allergies?: string[]
        medications?: string[]
        conditions?: string[]
    }
): Promise<OTCRecommendation[]> {
    try {
        const symptomsText = symptoms.join(', ')
        const patientContext = patientInfo
            ? `Paciente: ${patientInfo.age} años, ${patientInfo.gender}. Alergias: ${patientInfo.allergies?.join(', ') || 'ninguna'}. Medicamentos actuales: ${patientInfo.medications?.join(', ') || 'ninguno'}. Condiciones: ${patientInfo.conditions?.join(', ') || 'ninguna'}`
            : ''

        const recommendationPrompt = `${patientContext}

Síntomas: ${symptomsText}

Genera recomendaciones de medicamentos OTC seguros para estos síntomas.

IMPORTANTE - NUNCA recomiendes:
${PROHIBITED_MEDICATIONS.map(m => `- ${m}`).join('\n')}

Responde en JSON con esta estructura:
{
  "recommendations": [
    {
      "medicationName": "nombre del medicamento",
      "category": "analgesic" | "antipyretic" | "antigripal" | "gastrointestinal" | "topical" | "ophthalmic" | "vitamin" | "supplement",
      "dosage": "dosis específica",
      "frequency": "cada X horas",
      "durationDays": número,
      "warnings": ["advertencia 1", "advertencia 2"],
      "contraindications": ["contraindicación 1"],
      "whenToStop": "cuándo dejar de tomar",
      "purpose": "para qué sirve"
    }
  ]
}

Reglas:
- Máximo 3 recomendaciones
- Solo medicamentos disponibles en farmacias mexicanas
- Incluye dosis específicas
- Incluye advertencias de seguridad
- Respeta alergias y medicamentos actuales
- Sé conservador con dosis`

        // Generate recommendations
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'user',
                    content: recommendationPrompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000,
        })

        let recommendationData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            recommendationData = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] }
        } catch {
            recommendationData = { recommendations: [] }
        }

        // Validate recommendations - ensure no prohibited medications
        const validated = (recommendationData.recommendations || []).filter((rec: { medicationName?: string }) => {
            const medName = rec.medicationName?.toLowerCase() || ''
            return !PROHIBITED_MEDICATIONS.some(prohibited =>
                medName.includes(prohibited.toLowerCase())
            )
        })

        return validated.map((rec: { medicationName?: string; category?: string; dosage?: string; frequency?: string; duration?: string; warnings?: string; contraindications?: string; purpose?: string; durationDays?: number; whenToStop?: string }) => ({
            medicationName: rec.medicationName || '',
            category: rec.category || 'supplement',
            dosage: rec.dosage || '',
            frequency: rec.frequency || '',
            durationDays: rec.durationDays || 3,
            warnings: rec.warnings || [],
            contraindications: rec.contraindications || [],
            whenToStop: rec.whenToStop || '',
            purpose: rec.purpose || '',
        }))
    } catch (error) {
        console.error('Error generating OTC recommendations:', error)
        return []
    }
}

/**
 * Save OTC recommendation
 * Input: patientId, recommendation
 * Process: Store in database
 * Output: Saved recommendation
 */
export async function saveOTCRecommendation(
    patientId: string,
    recommendation: OTCRecommendation,
    appointmentId?: string,
    doctorId?: string
) {
    const supabase = createServiceClient()

    try {
        const { data: record, error } = await supabase
            .from('otc_recommendations')
            .insert({
                patient_id: patientId,
                appointment_id: appointmentId,
                doctor_id: doctorId,
                medication_name: recommendation.medicationName,
                category: recommendation.category,
                dosage: recommendation.dosage,
                frequency: recommendation.frequency,
                duration_days: recommendation.durationDays,
                warnings: recommendation.warnings,
                contraindications: recommendation.contraindications,
                when_to_stop: recommendation.whenToStop,
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to save OTC recommendation: ${error.message}`)
        }

        return {
            success: true,
            record,
        }
    } catch (error) {
        console.error('Error saving OTC recommendation:', error)
        throw error
    }
}

/**
 * Get OTC recommendations for patient
 * Input: patientId
 * Process: Query from database
 * Output: List of recommendations
 */
export async function getOTCRecommendations(patientId: string) {
    const supabase = createServiceClient()

    try {
        const { data: recommendations, error } = await supabase
            .from('otc_recommendations')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (error) {
            return []
        }

        return recommendations || []
    } catch (error) {
        console.error('Error getting OTC recommendations:', error)
        return []
    }
}

/**
 * Get OTC recommendations for appointment
 * Input: appointmentId
 * Process: Query from database
 * Output: List of recommendations
 */
export async function getAppointmentOTCRecommendations(appointmentId: string) {
    const supabase = createServiceClient()

    try {
        const { data: recommendations, error } = await supabase
            .from('otc_recommendations')
            .select('*')
            .eq('appointment_id', appointmentId)
            .order('created_at', { ascending: false })

        if (error) {
            return []
        }

        return recommendations || []
    } catch (error) {
        console.error('Error getting appointment OTC recommendations:', error)
        return []
    }
}

/**
 * Get recommendations by category
 * Input: category
 * Process: Query from database
 * Output: List of recommendations
 */
export async function getRecommendationsByCategory(category: OTCCategory) {
    const supabase = createServiceClient()

    try {
        const { data: recommendations, error } = await supabase
            .from('otc_recommendations')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false })

        if (error) {
            return []
        }

        return recommendations || []
    } catch (error) {
        console.error('Error getting recommendations by category:', error)
        return []
    }
}

/**
 * Check for drug interactions
 * Input: medications
 * Process: Check for interactions
 * Output: List of interactions
 */
export async function checkDrugInteractions(
    medications: string[]
): Promise<Array<{ medication1: string; medication2: string; interaction: string; severity: string }>> {
    try {
        const medicationsText = medications.join(', ')

        const interactionPrompt = `Verifica si hay interacciones entre estos medicamentos:
${medicationsText}

Responde en JSON con esta estructura:
{
  "interactions": [
    {
      "medication1": "medicamento 1",
      "medication2": "medicamento 2",
      "interaction": "descripción de la interacción",
      "severity": "leve" | "moderada" | "severa"
    }
  ]
}`

        // Check interactions
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'user',
                    content: interactionPrompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        })

        let interactionData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            interactionData = jsonMatch ? JSON.parse(jsonMatch[0]) : { interactions: [] }
        } catch {
            interactionData = { interactions: [] }
        }

        return interactionData.interactions || []
    } catch (error) {
        console.error('Error checking drug interactions:', error)
        return []
    }
}

/**
 * Get safe alternatives for medication
 * Input: medication, reason
 * Process: Generate safe alternatives
 * Output: List of alternatives
 */
export async function getSafeAlternatives(
    medication: string,
    reason: string = 'allergy'
): Promise<string[]> {
    try {
        const alternativePrompt = `El paciente no puede tomar ${medication} por ${reason}.

Sugiere 2-3 alternativas OTC seguras en México.

Responde en JSON con esta estructura:
{
  "alternatives": ["alternativa 1", "alternativa 2"]
}`

        // Get alternatives
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'user',
                    content: alternativePrompt,
                },
            ],
            temperature: 0.5,
            max_tokens: 300,
        })

        let alternativeData
        try {
            const jsonMatch = response.choices[0].message.content?.match(/\{[\s\S]*\}/)
            alternativeData = jsonMatch ? JSON.parse(jsonMatch[0]) : { alternatives: [] }
        } catch {
            alternativeData = { alternatives: [] }
        }

        return alternativeData.alternatives || []
    } catch (error) {
        console.error('Error getting safe alternatives:', error)
        return []
    }
}
