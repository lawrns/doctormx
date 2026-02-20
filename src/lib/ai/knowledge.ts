// Medical Knowledge Base for Dr. Simeon AI Assistant
// Provides medical context and prompt augmentation

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

/**
 * Retrieve medical context for a patient
 * Includes previous consultations, allergies, medications, and conditions
 */
export async function retrieveMedicalContext(patientId: string): Promise<string> {
  try {
    const supabase = createServiceClient()

    // Get patient profile with medical info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, date_of_birth, allergies, chronic_conditions')
      .eq('id', patientId)
      .single()

    // Get recent consultations
    const { data: consultations } = await supabase
      .from('consultations')
      .select('created_at, chief_complaint, diagnosis, treatment_plan')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(5)

    let context = `Paciente: ${profile?.full_name ?? 'Unknown'}\n`

    if (profile?.allergies) {
      context += `Alergias: ${profile.allergies}\n`
    }

    if (profile?.chronic_conditions) {
      context += `Condiciones crónicas: ${profile.chronic_conditions}\n`
    }

    if (consultations && consultations.length > 0) {
      context += '\nConsultas recientes:\n'
      consultations.forEach((c) => {
        context += `- ${new Date(c.created_at).toLocaleDateString('es-MX')}: ${c.chief_complaint}\n`
        if (c.diagnosis) {
          context += `  Diagnóstico: ${c.diagnosis}\n`
        }
      })
    }

    return context
  } catch (error) {
    logger.error('Error building medical context', { error: (error as Error).message }, error as Error)
    return 'Contexto médico no disponible'
  }
}

/**
 * Generate augmented prompt with medical context
 */
export async function generateAugmentedPrompt(
  userMessage: string,
  patientId?: string
): Promise<string> {
  let prompt = `Eres un asistente médico AI. Ayuda al paciente de manera clara y profesional.\n\n`

  if (patientId) {
    try {
      const medicalContext = await retrieveMedicalContext(patientId)
      prompt += `CONTEXTO MÉDICO DEL PACIENTE:\n${medicalContext}\n\n`
    } catch {
      // Continue without medical context
    }
  }

  prompt += `CONSULTA ACTUAL:\n${userMessage}\n\n`
  prompt += `Por favor proporciona:\n`
  prompt += `1. Análisis de los síntomas\n`
  prompt += `2. Posibles causas\n`
  prompt += `3. Recomendaciones\n`
  prompt += `4. Cuándo buscar atención médica\n\n`
  prompt += `IMPORTANTE: Siempre incluye un descargo de responsabilidad que esto no reemplaza el consejo médico profesional.`

  return prompt
}

