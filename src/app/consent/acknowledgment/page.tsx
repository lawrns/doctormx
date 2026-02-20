/**
 * Patient Medical Disclaimer Acknowledgment Page
 * 
 * This page requires patients to acknowledge the medical disclaimer
 * before they can proceed with AI consultation. The acknowledgment
 * is stored in the database with a timestamp for legal compliance.
 * 
 * Route: /consent/acknowledgment
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MedicalDisclaimer } from '@/components/legal/MedicalDisclaimer'
import { logger } from '@/lib/observability/logger'

/**
 * Check if user has already acknowledged the medical disclaimer
 */
async function hasAcknowledgedDisclaimer(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_consent_records')
    .select('id, status, granted_at')
    .eq('user_id', userId)
    .eq('consent_type', 'ai_analysis')
    .eq('status', 'granted')
    .maybeSingle()

  if (error) {
    logger.error('Error checking disclaimer acknowledgment', { error: error.message })
    return false
  }

  return !!data
}

/**
 * Get the latest AI analysis consent version
 */
async function getLatestAIConsentVersion(): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consent_versions')
    .select('id')
    .eq('consent_type', 'ai_analysis')
    .is('deprecated_date', null)
    .lte('effective_date', new Date().toISOString())
    .order('effective_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('Error fetching consent version', { error: error.message })
    return null
  }

  return data?.id || null
}

/**
 * Create default AI consent version if it doesn't exist
 */
async function createDefaultAIConsentVersion(adminId: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('consent_versions')
    .insert({
      consent_type: 'ai_analysis',
      version: '1.0.0',
      title: 'Consentimiento para Análisis con IA',
      description: 'Autorizo el uso de inteligencia artificial para recopilar y organizar mi información médica. Entiendo que la IA no proporciona diagnóstico médico.',
      legal_text: 'Por medio de la presente, autorizo a Doctor.mx a utilizar herramientas de inteligencia artificial para recopilar, organizar y estructurar mi información médica. Declaro que entiendo y acepto que: 1) La IA es solo una herramienta de recopilación de información, 2) La IA NO proporciona diagnóstico médico, 3) Debo consultar a un profesional de la salud para cualquier diagnóstico o tratamiento, 4) En caso de emergencia debo contactar al 911 o servicios de urgencia.',
      category: 'functional',
      effective_date: new Date().toISOString(),
      required_for_new_users: true,
      requires_re_consent: false,
      created_by: adminId,
    })
    .select('id')
    .single()

  if (error) {
    logger.error('Error creating consent version', { error: error.message })
    return null
  }

  return data.id
}

/**
 * Store acknowledgment in the database
 */
async function storeAcknowledgment(
  userId: string,
  timestamp: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  'use server'
  
  const supabase = await createClient()
  
  try {
    // Get or create AI consent version
    let consentVersionId = await getLatestAIConsentVersion()
    
    if (!consentVersionId) {
      // Get first admin user to create the version
      const { data: admin } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single()
      
      if (admin) {
        consentVersionId = await createDefaultAIConsentVersion(admin.id)
      }
    }

    if (!consentVersionId) {
      return { success: false, error: 'No se pudo obtener la versión de consentimiento' }
    }

    // Check if user already has an acknowledgment record
    const { data: existingRecord } = await supabase
      .from('user_consent_records')
      .select('id')
      .eq('user_id', userId)
      .eq('consent_type', 'ai_analysis')
      .maybeSingle()

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from('user_consent_records')
        .update({
          status: 'granted',
          granted_at: timestamp,
          consent_version_id: consentVersionId,
          granted_from: ipAddress ?? 'unknown',
          delivery_method: 'click_wrap',
          updated_at: new Date().toISOString(),
          metadata: {
            disclaimer_acknowledged: true,
            acknowledged_at: timestamp,
            acknowledgment_type: 'medical_disclaimer',
            ip_address: ipAddress,
          },
        })
        .eq('id', existingRecord.id)

      if (error) {
        logger.error('Error updating acknowledgment', { error: error.message })
        return { success: false, error: error.message }
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('user_consent_records')
        .insert({
          user_id: userId,
          consent_type: 'ai_analysis',
          consent_version_id: consentVersionId,
          status: 'granted',
          granted_at: timestamp,
          granted_from: ipAddress ?? 'unknown',
          delivery_method: 'click_wrap',
          metadata: {
            disclaimer_acknowledged: true,
            acknowledged_at: timestamp,
            acknowledgment_type: 'medical_disclaimer',
            ip_address: ipAddress,
          },
        })

      if (error) {
        logger.error('Error storing acknowledgment', { error: error.message })
        return { success: false, error: error.message }
      }
    }

    // Also store in the audit log
    const { error: auditError } = await supabase
      .from('consent_audit_logs')
      .insert({
        event_type: 'consent_granted',
        user_id: userId,
        consent_type: 'ai_analysis',
        consent_record_id: existingRecord?.id,
        action: 'medical_disclaimer_acknowledged',
        action_result: 'success',
        actor_user_id: userId,
        actor_role: 'user',
        actor_ip_address: ipAddress || null,
        before_state: null,
        after_state: {
          disclaimer_acknowledged: true,
          acknowledged_at: timestamp,
          consent_type: 'ai_analysis',
        },
        occurred_at: timestamp,
      })

    if (auditError) {
      logger.error('Error logging to audit', { error: auditError.message })
      // Don't fail the operation if audit logging fails
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    logger.error('Unexpected error storing acknowledgment', { error: errorMessage })
    return { 
      success: false, 
      error: errorMessage 
    }
  }
}

export default async function AcknowledgmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login?redirect=/consent/acknowledgment')
  }

  // Check if user has already acknowledged
  const alreadyAcknowledged = await hasAcknowledgedDisclaimer(user.id)
  
  // If already acknowledged, redirect to AI consultation
  if (alreadyAcknowledged) {
    redirect('/app/ai-consulta')
  }

  // Handle acknowledgment submission
  async function handleAcknowledge(timestamp: string) {
    'use server'
    
    const result = await storeAcknowledgment(user!.id, timestamp)
    
    if (result.success) {
      redirect('/app/ai-consulta')
    } else {
      // In a real implementation, you'd handle this error better
      // For now, we'll redirect with an error query param
      redirect(`/consent/acknowledgment?error=${encodeURIComponent(result.error ?? 'Error desconocido')}`)
    }
  }

  // Handle cancellation
  async function handleCancel() {
    'use server'
    redirect('/app')
  }

  return (
    <MedicalDisclaimer
      onAcknowledge={handleAcknowledge}
      onCancel={handleCancel}
      requireAcknowledgment={true}
      showEmergencyInfo={true}
    />
  )
}
