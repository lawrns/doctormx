import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { router } from './router'

export type ImageType = 
  | 'skin' 
  | 'xray' 
  | 'lab_result' 
  | 'wound' 
  | 'eye' 
  | 'other'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reviewed'

export interface MedicalImageAnalysis {
  id: string
  patient_id: string
  appointment_id: string | null
  image_url: string
  image_type: ImageType
  patient_notes: string | null
  findings: string | null
  possible_conditions: Array<{
    condition: string
    probability: string
  }> | null
  urgency_level: UrgencyLevel | null
  recommendations: string[] | null
  follow_up_needed: boolean | null
  follow_up_notes: string | null
  doctor_notes: string | null
  doctor_id: string | null
  doctor_action: 'approved' | 'rejected' | 'modified' | null
  status: AnalysisStatus
  confidence_percent: number | null
  cost_cents: number | null
  model: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  reviewed_at: string | null
}

export interface AnalysisInput {
  imageUrl: string
  imageType: ImageType
  patientContext?: string
  medicalHistory?: string
  patientNotes?: string
  appointmentId?: string
}

export interface AnalysisResult {
  findings: string
  possibleConditions: Array<{
    condition: string
    probability: string
  }>
  urgencyLevel: UrgencyLevel
  recommendations: string[]
  followUpNeeded: boolean
  followUpNotes?: string
  confidencePercent: number
}

const IMAGE_TYPE_PROMPTS: Record<ImageType, string> = {
  skin: `Eres un dermatólogo AI experto. Analiza esta imagen de piel cuidadosamente.
Identifica: erupciones, eczemas, psoriasis, acne, lesiones suspechas de melanoma.
Evalúa: coloración, textura, bordes, tamaño, simetría.
Urgencia: clasifica según el ABCDE del melanoma (Asimetría, Bordes, Color, Diámetro, Evolución).`,
  
  xray: `Eres un radiólogo AI experto. Analiza esta radiografía cuidadosamente.
Identifica: fracturas, neumonía, derrames, masas, cardiomegalia.
Evalúa: campos pulmonares, silueta cardíaca, huesos, tejidos blandos.
Busca signos de emergencia: neumotórax, derrame pleural masivo.`,
  
  lab_result: `Eres un médico AI analizando resultados de laboratorio.
Analiza: hemograma, química sanguínea, orina, cultivos.
Identifica: valores fuera de rango, anemia, infección, inflamación.
Marca valores críticos que requieren atención inmediata.`,
  
  wound: `Eres un médico AI evaluando heridas.
Evalúa: signos de infección (enrojecimiento, calor, supuración),
proceso de cicatrización, profundidad, tejido necrótico.
Recomendaciones: cambios de vendes, antibióticos, atención de urgencia.`,
  
  eye: `Eres un oftalmólogo AI experto. Analiza esta imagen ocular.
Identifica: enrojecimiento, secreción, lesiones, opacidades.
Evalúa: conjuntiva, córnea, párpados.
Busca signos de emergencia: úlcera corneal, glaucoma agudo.`,
  
  other: `Eres un médico AI analizando esta imagen médica.
Describe los hallazgos principales de forma detallada.
Identifica cualquier anomalía visible.
Proporciona una evaluación de urgencia apropiada.`
}

const SYSTEM_PROMPT = `Eres un asistente de análisis de imágenes médicas basado en GPT-4 Vision.
Tu rol es proporcionar una SEGUNDA OPINIÓN objetiva, no un diagnóstico definitivo.

Reglas importantes:
- Sé específico en tus observaciones pero evita diagnósticos definitivos
- Incluye un nivel de confianza realista (50-95%)
- Clasifica la urgencia correctamente: low (bajo), medium (medio), high (alto), emergency (emergencia)
- Proporciona recomendaciones clínicas prácticas
- SIEMPRE incluye un disclaimer que esto no sustituye la opinión de un médico
- Responde en formato JSON válido siguiendo el esquema proporcionado`

const RESPONSE_SCHEMA = `{
  "findings": "Descripción detallada de los hallazgos observados en la imagen",
  "possibleConditions": [
    { "condition": "Nombre de condición posible", "probability": "alto/medio/bajo" }
  ],
  "urgencyLevel": "low | medium | high | emergency",
  "recommendations": ["Recomendación 1", "Recomendación 2"],
  "followUpNeeded": true,
  "followUpNotes": "Notas sobre seguimiento si aplica",
  "confidencePercent": 85
}`

export async function analyzeMedicalImage(input: AnalysisInput): Promise<AnalysisResult> {
  const { imageUrl, imageType, patientContext, medicalHistory } = input
  
  const typePrompt = IMAGE_TYPE_PROMPTS[imageType]
  
  const userPrompt = `${typePrompt}

${patientContext ? `Contexto del paciente: ${patientContext}` : ''}
${medicalHistory ? `Historial médico relevante: ${medicalHistory}` : ''}

Responde en JSON con este esquema:
${RESPONSE_SCHEMA}

Recuerda:
- Sé específico en los hallazgos
- La urgencia "emergency" solo para casos que requieren atención inmediata
- Incluye al menos 2-3 recomendaciones prácticas
- La confianza debe reflejar la calidad de la imagen y claridad de hallazgos`

  try {
    // Use new AI router for 90% cost savings with OpenRouter
    const response = await router.routeVision(
      imageUrl,
      userPrompt,
      SYSTEM_PROMPT,
      'vision-analysis',
      { costOptimization: true }
    )

    const content = response.content
    
    let analysisData: Record<string, unknown>
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch {
      analysisData = {
        findings: content.replace(/[\s\S]*?"findings":\s*"?([^\n"]+)"?[\s\S]*/i, '$1').trim() || 'No se pudieron extraer hallazgos',
        possibleConditions: [],
        urgencyLevel: 'medium',
        recommendations: ['Consultar con un médico especialista'],
        followUpNeeded: true,
        confidencePercent: 50
      }
    }

    // Convert USD to MXN (approximate rate: 1 USD = 20 MXN)
    const costMXN = response.costUSD * 20

    logger.info('[VISION] Image analysis completed', {
      type: imageType,
      urgency: analysisData.urgencyLevel as string,
      confidence: analysisData.confidencePercent as number,
      latencyMs: response.latencyMs,
      costMXN,
      costUSD: response.costUSD,
      provider: response.provider,
      model: response.model
    })

    return {
      findings: (analysisData.findings as string) || 'No se pudieron extraer hallazgos',
      possibleConditions: (analysisData.possibleConditions as Array<{ condition: string; probability: string }>) || [],
      urgencyLevel: (analysisData.urgencyLevel as UrgencyLevel) || 'medium',
      recommendations: (analysisData.recommendations as string[]) || [],
      followUpNeeded: Boolean(analysisData.followUpNeeded),
      followUpNotes: analysisData.followUpNotes as string | undefined,
      confidencePercent: (analysisData.confidencePercent as number) || 70
    }
  } catch (error) {
    logger.error('[VISION] Error analyzing image:', { error })
    throw error
  }
}

export async function saveAnalysis(
  patientId: string,
  imageUrl: string,
  imageType: ImageType,
  input: AnalysisInput,
  analysis: AnalysisResult & { costUSD?: number; model?: string }
) {
  const supabase = createServiceClient()

  try {
    const { data: record, error } = await supabase
      .from('medical_image_analyses')
      .insert({
        patient_id: patientId,
        appointment_id: input.appointmentId || null,
        image_url: imageUrl,
        image_type: imageType,
        patient_notes: input.patientNotes || null,
        findings: analysis.findings,
        possible_conditions: analysis.possibleConditions,
        urgency_level: analysis.urgencyLevel,
        recommendations: analysis.recommendations,
        follow_up_needed: analysis.followUpNeeded,
        follow_up_notes: analysis.followUpNotes,
        confidence_percent: analysis.confidencePercent,
        cost_cents: analysis.costUSD ? Math.round(analysis.costUSD * 100) : 50,
        model: analysis.model || 'ai-vision',
        status: 'completed',
        metadata: {
          patient_context: input.patientContext,
          medical_history: input.medicalHistory,
          analysis_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error guardando análisis: ${error.message}`)
    }

    return record as MedicalImageAnalysis
  } catch (error) {
    logger.error('[VISION] Error saving analysis:', { error })
    throw error
  }
}

export async function getAnalysis(analysisId: string): Promise<MedicalImageAnalysis | null> {
  const supabase = createServiceClient()

  try {
    const { data: record, error } = await supabase
      .from('medical_image_analyses')
      .select('*')
      .eq('id', analysisId)
      .single()

    if (error) {
      logger.error('[VISION] Error fetching analysis:', { error })
      return null
    }

    return record as MedicalImageAnalysis
  } catch (error) {
    logger.error('[VISION] Error fetching analysis:', { error })
    return null
  }
}

export async function getPatientAnalyses(patientId: string): Promise<MedicalImageAnalysis[]> {
  const supabase = createServiceClient()

  try {
    const { data: records, error } = await supabase
      .from('medical_image_analyses')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('[VISION] Error fetching patient analyses:', { error })
      return []
    }

    return (records as MedicalImageAnalysis[]) || []
  } catch (error) {
    logger.error('[VISION] Error fetching patient analyses:', { error })
    return []
  }
}

export async function updateAnalysisWithDoctorReview(
  analysisId: string,
  doctorId: string,
  review: {
    doctorNotes?: string
    doctorAction: 'approved' | 'rejected' | 'modified'
    modifiedFindings?: string
  }
): Promise<MedicalImageAnalysis | null> {
  const supabase = createServiceClient()

  try {
    const { data: record, error } = await supabase
      .from('medical_image_analyses')
      .update({
        doctor_id: doctorId,
        doctor_notes: review.doctorNotes,
        doctor_action: review.doctorAction,
        findings: review.modifiedFindings || undefined,
        status: 'reviewed',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', analysisId)
      .select()
      .single()

    if (error) {
      logger.error('[VISION] Error updating analysis with review:', { error })
      return null
    }

    return record as MedicalImageAnalysis
  } catch (error) {
    logger.error('[VISION] Error updating analysis with review:', { error })
    return null
  }
}

export async function getPendingDoctorReviews(): Promise<MedicalImageAnalysis[]> {
  const supabase = createServiceClient()

  try {
    const { data: records, error } = await supabase
      .from('medical_image_analyses')
      .select('*')
      .eq('status', 'completed')
      .is('doctor_id', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      logger.error('[VISION] Error fetching pending reviews:', { error })
      return []
    }

    return (records as MedicalImageAnalysis[]) || []
  } catch (error) {
    logger.error('[VISION] Error fetching pending reviews:', { error })
    return []
  }
}

export function getUrgencyColor(urgency: UrgencyLevel | null): string {
  const colors: Record<UrgencyLevel, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800'
  }
  return urgency ? colors[urgency] : 'bg-gray-100 text-gray-800'
}

export function getUrgencyLabel(urgency: UrgencyLevel | null): string {
  const labels: Record<UrgencyLevel, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    emergency: 'Emergencia'
  }
  return urgency ? labels[urgency] : 'Sin evaluar'
}

export function getStatusColor(status: AnalysisStatus): string {
  const colors: Record<AnalysisStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    reviewed: 'bg-purple-100 text-purple-800'
  }
  return colors[status]
}

export function getStatusLabel(status: AnalysisStatus): string {
  const labels: Record<AnalysisStatus, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Error',
    reviewed: 'Revisado'
  }
  return labels[status]
}

export function getImageTypeLabel(type: ImageType): string {
  const labels: Record<ImageType, string> = {
    skin: 'Piel',
    xray: 'Rayos X',
    lab_result: 'Resultado de laboratorio',
    wound: 'Herida',
    eye: 'Ojo',
    other: 'Otro'
  }
  return labels[type]
}

