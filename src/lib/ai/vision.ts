/**
 * Medical Image Analysis System using AI Vision
 * Analyzes medical images (X-rays, skin conditions, lab results, etc.)
 * and provides structured findings with urgency assessment
 * 
 * @module lib/ai/vision
 * @example
 * ```typescript
 * import { analyzeMedicalImage, saveAnalysis, getAnalysis } from '@/lib/ai/vision';
 * 
 * // Analyze an image
 * const result = await analyzeMedicalImage({
 *   imageUrl: 'https://example.com/image.jpg',
 *   imageType: 'xray',
 *   patientContext: 'Patient has persistent cough'
 * });
 * 
 * // Save the analysis
 * const saved = await saveAnalysis(patientId, imageUrl, 'xray', input, result);
 * ```
 */

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { router } from './router'

/** Types of medical images that can be analyzed */
export type ImageType = 
  | 'skin' 
  | 'xray' 
  | 'lab_result' 
  | 'wound' 
  | 'eye' 
  | 'other'

/** Urgency levels for medical findings */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

/** Analysis status states */
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reviewed'

/**
 * Medical image analysis database record interface
 */
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

/**
 * Input parameters for image analysis
 */
export interface AnalysisInput {
  /** URL of the image to analyze */
  imageUrl: string
  /** Type of medical image */
  imageType: ImageType
  /** Additional patient context (optional) */
  patientContext?: string
  /** Patient's medical history (optional) */
  medicalHistory?: string
  /** Patient's notes about the image (optional) */
  patientNotes?: string
  /** Associated appointment ID (optional) */
  appointmentId?: string
}

/**
 * Result of image analysis
 */
export interface AnalysisResult {
  /** Detailed findings from the analysis */
  findings: string
  /** Possible conditions with probability estimates */
  possibleConditions: Array<{
    condition: string
    probability: string
  }>
  /** Assessed urgency level */
  urgencyLevel: UrgencyLevel
  /** Recommendations for next steps */
  recommendations: string[]
  /** Whether follow-up is needed */
  followUpNeeded: boolean
  /** Notes about follow-up (optional) */
  followUpNotes?: string
  /** Confidence percentage (0-100) */
  confidencePercent: number
}

/** Image type-specific prompts for analysis */
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

/** System prompt for the vision analysis AI */
const SYSTEM_PROMPT = `Eres un asistente de análisis de imágenes médicas basado en GPT-4 Vision.
Tu rol es proporcionar una SEGUNDA OPINIÓN objetiva, no un diagnóstico definitivo.

Reglas importantes:
- Sé específico en tus observaciones pero evita diagnósticos definitivos
- Incluye un nivel de confianza realista (50-95%)
- Clasifica la urgencia correctamente: low (bajo), medium (medio), high (alto), emergency (emergencia)
- Proporciona recomendaciones clínicas prácticas
- SIEMPRE incluye un disclaimer que esto no sustituye la opinión de un médico
- Responde en formato JSON válido siguiendo el esquema proporcionado`

/** JSON schema for the expected response */
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

/**
 * Analyzes a medical image using AI vision
 * Routes through the AI router for cost optimization
 * @param input - Analysis input parameters
 * @param input.imageUrl - URL of the image to analyze
 * @param input.imageType - Type of medical image
 * @param input.patientContext - Additional context (optional)
 * @param input.medicalHistory - Medical history (optional)
 * @param input.patientNotes - Patient's notes (optional)
 * @param input.appointmentId - Associated appointment ID (optional)
 * @returns Promise with analysis results
 * @throws {Error} If analysis fails
 * @example
 * const result = await analyzeMedicalImage({
 *   imageUrl: 'https://example.com/xray.jpg',
 *   imageType: 'xray',
 *   patientContext: 'Patient has persistent cough and fever'
 * });
 * console.log(result.findings, result.urgencyLevel);
 */
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
    } catch (parseError) {
      logger.warn('[VISION] Failed to parse AI response as JSON, using fallback', {
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        contentPreview: content.slice(0, 200)
      })
      analysisData = {
        findings: content.replace(/[\s\S]*?"findings":\s*"?([^\n"]+)"?[\s\S]*/i, '$1').trim() ?? 'No se pudieron extraer hallazgos',
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
      findings: (analysisData.findings as string) ?? 'No se pudieron extraer hallazgos',
      possibleConditions: (analysisData.possibleConditions as Array<{ condition: string; probability: string }>) || [],
      urgencyLevel: (analysisData.urgencyLevel as UrgencyLevel) ?? 'medium',
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

/**
 * Saves an image analysis to the database
 * @param patientId - Patient's unique identifier
 * @param imageUrl - URL of the analyzed image
 * @param imageType - Type of medical image
 * @param input - Original analysis input
 * @param analysis - Analysis result with optional cost and model info
 * @returns Promise with the saved database record
 * @throws {Error} If database insertion fails
 * @example
 * const record = await saveAnalysis(
 *   'pat-123',
 *   'https://example.com/image.jpg',
 *   'xray',
 *   input,
 *   { ...analysisResult, costUSD: 0.005, model: 'gpt-4o' }
 * );
 */
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
        model: analysis.model ?? 'ai-vision',
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

/**
 * Retrieves a saved analysis by ID
 * @param analysisId - Analysis record ID
 * @returns Promise with the analysis record or null if not found
 * @example
 * const analysis = await getAnalysis('analysis-123');
 * if (analysis) {
 *   console.log(analysis.findings);
 * }
 */
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

/**
 * Gets all image analyses for a patient
 * @param patientId - Patient's unique identifier
 * @returns Promise with array of analysis records (newest first)
 * @example
 * const analyses = await getPatientAnalyses('pat-123');
 * analyses.forEach(a => console.log(a.image_type, a.status));
 */
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

/**
 * Updates an analysis with doctor's review
 * @param analysisId - Analysis record ID
 * @param doctorId - Doctor's unique identifier
 * @param review - Review details including notes and action
 * @param review.doctorNotes - Doctor's notes (optional)
 * @param review.doctorAction - Action taken: 'approved', 'rejected', or 'modified'
 * @param review.modifiedFindings - Modified findings text (optional)
 * @returns Promise with updated record or null if update fails
 * @example
 * const updated = await updateAnalysisWithDoctorReview(
 *   'analysis-123',
 *   'doc-456',
 *   {
 *     doctorNotes: 'Findings confirmed, no abnormalities detected',
 *     doctorAction: 'approved'
 *   }
 * );
 */
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

/**
 * Gets analyses pending doctor review
 * @returns Promise with array of unreviewed analyses (max 50)
 * @example
 * const pending = await getPendingDoctorReviews();
 * console.log(`${pending.length} analyses pending review`);
 */
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

/**
 * Gets the CSS color class for an urgency level
 * @param urgency - Urgency level or null
 * @returns Tailwind CSS class string for the urgency color
 * @example
 * const colorClass = getUrgencyColor('high');
 * // 'bg-orange-100 text-orange-800'
 */
export function getUrgencyColor(urgency: UrgencyLevel | null): string {
  const colors: Record<UrgencyLevel, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800'
  }
  return urgency ? colors[urgency] : 'bg-gray-100 text-gray-800'
}

/**
 * Gets the display label for an urgency level
 * @param urgency - Urgency level or null
 * @returns Human-readable label in Spanish
 * @example
 * const label = getUrgencyLabel('high');
 * // 'Alta'
 */
export function getUrgencyLabel(urgency: UrgencyLevel | null): string {
  const labels: Record<UrgencyLevel, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    emergency: 'Emergencia'
  }
  return urgency ? labels[urgency] : 'Sin evaluar'
}

/**
 * Gets the CSS color class for an analysis status
 * @param status - Analysis status
 * @returns Tailwind CSS class string for the status color
 * @example
 * const colorClass = getStatusColor('completed');
 * // 'bg-green-100 text-green-800'
 */
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

/**
 * Gets the display label for an analysis status
 * @param status - Analysis status
 * @returns Human-readable label in Spanish
 * @example
 * const label = getStatusLabel('completed');
 * // 'Completado'
 */
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

/**
 * Gets the display label for an image type
 * @param type - Image type
 * @returns Human-readable label in Spanish
 * @example
 * const label = getImageTypeLabel('xray');
 * // 'Rayos X'
 */
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
