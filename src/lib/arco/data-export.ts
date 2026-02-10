/**
 * ARCO Data Export
 *
 * Handles data export for ACCESS requests (Derecho de Acceso)
 * Provides user data in multiple formats: JSON, PDF
 */

import { createClient } from '@/lib/supabase/server'
import type {
  DataExportPackage,
  DataTableScope,
  ArcoRequestRow,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'

// ================================================
// DATA EXPORT FUNCTIONS
// ================================================

/**
 * Get complete user data export for ACCESS requests
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns Complete data package
 */
export async function getUserDataExport(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<DataExportPackage> {
  const supabase = await createClient()

  const includeAll = scope.includes('all')

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new ArcoError('User not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  // Get privacy preferences
  const { data: privacyPrefs } = await supabase
    .from('privacy_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // Initialize export package
  const exportPackage: DataExportPackage = {
    user_profile: sanitizeProfile(profile),
    appointments: [],
    consultations: [],
    prescriptions: [],
    payments: [],
    chat_history: [],
    privacy_preferences: privacyPrefs || null,
    export_metadata: {
      exported_at: new Date().toISOString(),
      export_format: 'json',
      total_records: 0,
      data_scope: scope,
    },
  }

  // Get appointments
  if (includeAll || scope.includes('appointments')) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors!appointments_doctor_id_fkey (
          id,
          status,
          bio,
          license_number
        )
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    exportPackage.appointments = (appointments || []).map(apt => ({
      ...apt,
      doctor: apt.doctor ? {
        id: apt.doctor.id,
        license_number: apt.doctor.license_number,
      } : undefined,
    }))
  }

  // Get SOAP consultations
  if (includeAll || scope.includes('soap_consultations')) {
    const { data: consultations } = await supabase
      .from('soap_consultations')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    exportPackage.consultations = consultations || []
  }

  // Get prescriptions
  if (includeAll || scope.includes('prescriptions')) {
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    exportPackage.prescriptions = prescriptions || []
  }

  // Get payments
  if (includeAll || scope.includes('payments')) {
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments!payments_appointment_id_fkey (
          id,
          start_ts
        )
      `)
      .eq('appointment.appointments.patient_id', userId)
      .order('created_at', { ascending: false })

    exportPackage.payments = payments || []
  }

  // Get chat history
  if (includeAll || scope.includes('chat_conversations') || scope.includes('chat_messages')) {
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        messages:chat_messages(*)
      `)
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    exportPackage.chat_history = conversations || []
  }

  // Calculate total records
  exportPackage.export_metadata.total_records =
    exportPackage.appointments.length +
    exportPackage.consultations.length +
    exportPackage.prescriptions.length +
    exportPackage.payments.length +
    exportPackage.chat_history.length +
    1 // Profile

  return exportPackage
}

/**
 * Export user data as JSON
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns JSON string of user data
 */
export async function exportUserDataToJson(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<string> {
  const dataPackage = await getUserDataExport(userId, scope)
  return JSON.stringify(dataPackage, null, 2)
}

/**
 * Export user data as formatted text (for PDF generation)
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns Formatted text content
 */
export async function exportUserDataToText(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<string> {
  const dataPackage = await getUserDataExport(userId, scope)

  const lines: string[] = []

  // Header
  lines.push('='.repeat(80))
  lines.push('REPORTE DE DATOS PERSONALES - DERECHO DE ACCESO ARCO')
  lines.push('='.repeat(80))
  lines.push('')
  lines.push(`Fecha de exportación: ${dataPackage.export_metadata.exported_at}`)
  lines.push(`Formato: ${dataPackage.export_metadata.export_format}`)
  lines.push(`Total de registros: ${dataPackage.export_metadata.total_records}`)
  lines.push('')
  lines.push('-'.repeat(80))
  lines.push('')

  // User Profile
  lines.push('1. INFORMACIÓN PERSONAL')
  lines.push('-'.repeat(80))
  lines.push(`Nombre completo: ${dataPackage.user_profile.full_name || 'No disponible'}`)
  lines.push(`Rol: ${dataPackage.user_profile.role || 'No disponible'}`)
  lines.push(`Teléfono: ${dataPackage.user_profile.phone || 'No disponible'}`)
  lines.push(`Fecha de registro: ${dataPackage.user_profile.created_at || 'No disponible'}`)
  lines.push('')

  // Privacy Preferences
  if (dataPackage.privacy_preferences) {
    lines.push('2. PREFERENCIAS DE PRIVACIDAD')
    lines.push('-'.repeat(80))
    lines.push(`Consentimiento de analíticas: ${dataPackage.privacy_preferences.analytics_consent ? 'Sí' : 'No'}`)
    lines.push(`Consentimiento de personalización: ${dataPackage.privacy_preferences.personalization_consent ? 'Sí' : 'No'}`)
    lines.push(`Consentimiento de investigación: ${dataPackage.privacy_preferences.research_consent ? 'Sí' : 'No'}`)
    lines.push(`Consentimiento de entrenamiento de IA: ${dataPackage.privacy_preferences.ai_training_consent ? 'Sí' : 'No'}`)
    lines.push(`Última actualización: ${dataPackage.privacy_preferences.last_consent_update}`)
    lines.push('')
  }

  // Appointments
  if (dataPackage.appointments.length > 0) {
    lines.push('3. HISTORIAL DE CITAS')
    lines.push('-'.repeat(80))
    lines.push(`Total de citas: ${dataPackage.appointments.length}`)
    lines.push('')

    dataPackage.appointments.slice(0, 10).forEach((apt, index) => {
      lines.push(`Cita ${index + 1}:`)
      lines.push(`  - ID: ${apt.id}`)
      lines.push(`  - Fecha: ${apt.start_ts}`)
      lines.push(`  - Estado: ${apt.status}`)
      lines.push(`  - Motivo: ${apt.reason_for_visit || 'No especificado'}`)
      lines.push('')
    })

    if (dataPackage.appointments.length > 10) {
      lines.push(`... y ${dataPackage.appointments.length - 10} citas más`)
      lines.push('')
    }
  }

  // Consultations
  if (dataPackage.consultations.length > 0) {
    lines.push('4. CONSULTAS MÉDICAS (SOAP)')
    lines.push('-'.repeat(80))
    lines.push(`Total de consultas: ${dataPackage.consultations.length}`)
    lines.push('')

    dataPackage.consultations.slice(0, 5).forEach((consultation, index) => {
      lines.push(`Consulta ${index + 1}:`)
      lines.push(`  - ID: ${consultation.id}`)
      lines.push(`  - Fecha: ${consultation.created_at}`)
      lines.push(`  - Motivo principal: ${consultation.chief_complaint || 'No especificado'}`)
      lines.push(`  - Diagnóstico: ${consultation.diagnosis || 'No especificado'}`)
      lines.push('')
    })

    if (dataPackage.consultations.length > 5) {
      lines.push(`... y ${dataPackage.consultations.length - 5} consultas más`)
      lines.push('')
    }
  }

  // Prescriptions
  if (dataPackage.prescriptions.length > 0) {
    lines.push('5. RECETAS MÉDICAS')
    lines.push('-'.repeat(80))
    lines.push(`Total de recetas: ${dataPackage.prescriptions.length}`)
    lines.push('')

    dataPackage.prescriptions.slice(0, 5).forEach((rx, index) => {
      lines.push(`Receta ${index + 1}:`)
      lines.push(`  - ID: ${rx.id}`)
      lines.push(`  - Fecha: ${rx.created_at}`)
      lines.push(`  - Notas: ${rx.notes || 'Sin notas'}`)
      lines.push('')
    })

    if (dataPackage.prescriptions.length > 5) {
      lines.push(`... y ${dataPackage.prescriptions.length - 5} recetas más`)
      lines.push('')
    }
  }

  // Payments
  if (dataPackage.payments.length > 0) {
    lines.push('6. HISTORIAL DE PAGOS')
    lines.push('-'.repeat(80))
    lines.push(`Total de pagos: ${dataPackage.payments.length}`)
    lines.push('')

    dataPackage.payments.slice(0, 10).forEach((payment, index) => {
      lines.push(`Pago ${index + 1}:`)
      lines.push(`  - ID: ${payment.id}`)
      lines.push(`  - Fecha: ${payment.created_at}`)
      lines.push(`  - Monto: ${payment.amount_cents / 100} ${payment.currency}`)
      lines.push(`  - Estado: ${payment.status}`)
      lines.push('')
    })

    if (dataPackage.payments.length > 10) {
      lines.push(`... y ${dataPackage.payments.length - 10} pagos más`)
      lines.push('')
    }
  }

  // Footer
  lines.push('='.repeat(80))
  lines.push('FIN DEL REPORTE')
  lines.push('='.repeat(80))
  lines.push('')
  lines.push('Este reporte contiene sus datos personales de acuerdo con su derecho de')
  lines.push('acceso ARCO (LFPDPPP). Si tiene alguna pregunta, contacte a:')
  lines.push('privacidad@doctormx.com')

  return lines.join('\n')
}

/**
 * Export user data as PDF (placeholder - would need PDF library)
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns PDF buffer (to be implemented with PDF library)
 */
export async function exportUserDataToPdf(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<Buffer> {
  // Get text content
  const textContent = await exportUserDataToText(userId, scope)

  // TODO: Implement actual PDF generation
  // Options:
  // 1. Use jsPDF library
  // 2. Use PDFKit
  // 3. Use server-side PDF generation service

  // For now, return placeholder
  throw new ArcoError(
    'PDF export not yet implemented. Please use JSON or text format.',
    ArcoErrorCode.INVALID_REQUEST_TYPE,
    501
  )
}

/**
 * Create a data export attachment for an ARCO request
 *
 * @param requestId - ARCO request ID
 * @param userId - User ID
 * @param format - Export format
 * @returns Created attachment record
 */
export async function createDataExportAttachment(
  requestId: string,
  userId: string,
  format: 'json' | 'text' | 'pdf' = 'json'
): Promise<{
  filename: string
  content: string | Buffer
  mime_type: string
}> {
  // Get request details
  const supabase = await createClient()
  const { data: request } = await supabase
    .from('arco_requests')
    .select('data_scope')
    .eq('id', requestId)
    .single()

  if (!request) {
    throw new ArcoError('Request not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  const scope = request.data_scope as DataTableScope[]
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `datos_arco_${userId}_${timestamp}`

  let content: string | Buffer
  let mime_type: string

  switch (format) {
    case 'json':
      content = await exportUserDataToJson(userId, scope)
      filename += '.json'
      mime_type = 'application/json'
      break

    case 'text':
      content = await exportUserDataToText(userId, scope)
      filename += '.txt'
      mime_type = 'text/plain'
      break

    case 'pdf':
      content = await exportUserDataToPdf(userId, scope)
      filename += '.pdf'
      mime_type = 'application/pdf'
      break

    default:
      throw new ArcoError(
        'Invalid export format',
        ArcoErrorCode.INVALID_REQUEST_TYPE,
        400
      )
  }

  return { filename, content, mime_type }
}

// ================================================
// DATA AMENDMENT (RECTIFY)
// ================================================

/**
 * Record a data amendment for RECTIFY requests
 *
 * @param requestId - ARCO request ID
 * @param tableName - Table name
 * @param recordId - Record ID
 * @param fieldName - Field being amended
 * @param oldValue - Current value
 * @param newValue - New value
 * @param reason - Amendment reason
 * @param requestedBy - User requesting amendment
 */
export async function recordDataAmendment(
  requestId: string,
  tableName: string,
  recordId: string,
  fieldName: string,
  oldValue: string | null,
  newValue: string | null,
  reason: string,
  requestedBy: string
): Promise<void> {
  const supabase = await createClient()

  // Record the amendment
  await supabase.from('data_amendments').insert({
    arco_request_id: requestId,
    table_name: tableName,
    record_id: recordId,
    field_name: fieldName,
    old_value: oldValue,
    new_value: newValue,
    amendment_reason: reason,
    requested_by: requestedBy,
  })
}

/**
 * Apply a data amendment (after approval)
 *
 * @param amendmentId - Amendment ID
 * @param approvedBy - Admin user ID approving the amendment
 */
export async function applyDataAmendment(
  amendmentId: string,
  approvedBy: string
): Promise<void> {
  const supabase = await createClient()

  // Get amendment details
  const { data: amendment } = await supabase
    .from('data_amendments')
    .select('*')
    .eq('id', amendmentId)
    .single()

  if (!amendment) {
    throw new ArcoError('Amendment not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  // Apply the change to the actual table
  const { error } = await supabase
    .from(amendment.table_name)
    .update({
      [amendment.field_name]: amendment.new_value,
      updated_at: new Date().toISOString(),
    })
    .eq('id', amendment.record_id)

  if (error) {
    throw new ArcoError(
      `Error applying amendment: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  // Update amendment record
  await supabase
    .from('data_amendments')
    .update({
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      applied_at: new Date().toISOString(),
    })
    .eq('id', amendmentId)
}

// ================================================
// DATA DELETION (CANCEL)
// ================================================

/**
 * Plan data deletion for CANCEL requests
 *
 * @param requestId - ARCO request ID
 * @param userId - User ID
 * @returns Deletion plan
 */
export async function planDataDeletion(
  requestId: string,
  userId: string
): Promise<{
  tables: Array<{
    table: string
    record_count: number
    can_delete: boolean
    retention_reason?: string
  }>
  immediate_deletions: string[]
  delayed_deletions: string[]
  requires_anonymization: string[]
}> {
  const supabase = await createClient()

  // Get request details
  const { data: request } = await supabase
    .from('arco_requests')
    .select('data_scope')
    .eq('id', requestId)
    .eq('user_id', userId)
    .single()

  if (!request) {
    throw new ArcoError('Request not found', ArcoErrorCode.REQUEST_NOT_FOUND, 404)
  }

  const scope = request.data_scope as DataTableScope[]
  const includeAll = scope.includes('all')

  const analysis: Array<{
    table: string
    record_count: number
    can_delete: boolean
    retention_reason?: string
  }> = []

  const immediateDeletions: string[] = []
  const delayedDeletions: string[] = []
  const requiresAnonymization: string[] = []

  // Check each table
  const tablesToCheck = includeAll
    ? ['profiles', 'appointments', 'prescriptions', 'soap_consultations', 'chat_conversations', 'chat_messages', 'payments']
    : scope

  for (const table of tablesToCheck) {
    let canDelete = false
    let retentionReason: string | undefined
    let recordCount = 0

    switch (table) {
      case 'profiles':
        // Cannot delete profile directly due to foreign keys
        canDelete = false
        retentionReason = 'Requerido para relaciones de base de datos. Se anonimizará.'
        requiresAnonymization.push('profiles')
        break

      case 'appointments':
        // Can delete after retention period (5 years per NOM-004)
        canDelete = false
        retentionReason = 'Retención legal de 5 años (NOM-004-SSA3-2012)'
        delayedDeletions.push('appointments')
        break

      case 'prescriptions':
        // Can delete after retention period (5 years)
        canDelete = false
        retentionReason = 'Retención legal de 5 años (NOM-004-SSA3-2012)'
        delayedDeletions.push('prescriptions')
        break

      case 'soap_consultations':
        // Can delete after retention period (5 years)
        canDelete = false
        retentionReason = 'Retención legal de 5 años (NOM-004-SSA3-2012)'
        delayedDeletions.push('soap_consultations')
        break

      case 'chat_conversations':
      case 'chat_messages':
        // Can delete sooner (2 years recommended)
        canDelete = false
        retentionReason = 'Retención recomendada de 2 años'
        delayedDeletions.push(table)
        break

      case 'payments':
        // Cannot delete (tax requirements SAT 5 years)
        canDelete = false
        retentionReason = 'Retención fiscal de 5 años (SAT)'
        delayedDeletions.push('payments')
        break

      default:
        canDelete = true
        immediateDeletions.push(table)
    }

    // Get record count
    if (table !== 'profiles') {
      const { count } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', userId)

      recordCount = count || 0
    }

    analysis.push({
      table,
      record_count: recordCount,
      can_delete: canDelete,
      retention_reason: retentionReason,
    })
  }

  return {
    tables: analysis,
    immediate_deletions: immediateDeletions,
    delayed_deletions: delayedDeletions,
    requires_anonymization: requiresAnonymization,
  }
}

/**
 * Execute data deletion (after approval and retention period)
 *
 * @param requestId - ARCO request ID
 * @param userId - User ID
 * @param executedBy - Admin user ID
 */
export async function executeDataDeletion(
  requestId: string,
  userId: string,
  executedBy: string
): Promise<void> {
  const supabase = await createClient()

  // Get deletion plan
  const plan = await planDataDeletion(requestId, userId)

  // Log each deletion
  for (const table of plan.immediate_deletions) {
    await supabase.from('data_deletions').insert({
      arco_request_id: requestId,
      table_name: table,
      deletion_type: 'hard_delete',
      reason: 'Solicitud de cancelación ARCO',
      requested_by: userId,
      executed_by: executedBy,
      executed_at: new Date().toISOString(),
    })
  }

  // Anonymize profile
  if (plan.requires_anonymization.includes('profiles')) {
    await supabase
      .from('profiles')
      .update({
        full_name: `Usuario ${userId.slice(0, 8)}`,
        email: `${userId}@anonymized.patient`,
        phone: null,
        photo_url: null,
      })
      .eq('id', userId)

    await supabase.from('data_deletions').insert({
      arco_request_id: requestId,
      table_name: 'profiles',
      deletion_type: 'anonymize',
      reason: 'Solicitud de cancelación ARCO - Anonimización de perfil',
      requested_by: userId,
      executed_by: executedBy,
      executed_at: new Date().toISOString(),
    })
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Sanitize profile data for export (remove sensitive internal fields)
 *
 * @param profile - Raw profile data
 * @returns Sanitized profile
 */
function sanitizeProfile(profile: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'reset_password_token', 'confirmation_token']
  const sanitized = { ...profile }

  for (const field of sensitiveFields) {
    delete sanitized[field]
  }

  return sanitized
}

/**
 * Calculate data export size estimate
 *
 * @param userId - User ID
 * @param scope - Data tables to include
 * @returns Estimated size in bytes
 */
export async function estimateExportSize(
  userId: string,
  scope: DataTableScope[] = ['all']
): Promise<number> {
  const dataPackage = await getUserDataExport(userId, scope)
  const jsonString = JSON.stringify(dataPackage)
  return Buffer.byteLength(jsonString, 'utf8')
}
