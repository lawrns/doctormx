/**
 * ARCO Data Export - Text Format
 *
 * Handles formatted text export functionality for ACCESS requests
 */

import type { DataExportPackage, DataTableScope } from '@/types/arco'
import { getUserDataExport } from './core'

/**
 * Format date for display in text export
 */
function formatDate(dateStr: string | Date | null): string {
  if (!dateStr) return 'No disponible'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date and time for display
 */
function formatDateTime(dateStr: string | Date | null): string {
  if (!dateStr) return 'No disponible'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Create header section
 */
function createHeader(metadata: DataExportPackage['export_metadata']): string[] {
  const lines: string[] = []

  lines.push('='.repeat(80))
  lines.push('REPORTE DE DATOS PERSONALES - DERECHO DE ACCESO ARCO')
  lines.push('='.repeat(80))
  lines.push('')
  lines.push(`Fecha de exportación: ${metadata.exported_at}`)
  lines.push(`Formato: ${metadata.export_format}`)
  lines.push(`Total de registros: ${metadata.total_records}`)
  lines.push('')
  lines.push('-'.repeat(80))
  lines.push('')

  return lines
}

/**
 * Create user profile section
 */
function createProfileSection(profile: Record<string, unknown>): string[] {
  const lines: string[] = []

  lines.push('1. INFORMACIÓN PERSONAL')
  lines.push('-'.repeat(80))
  lines.push(`Nombre completo: ${(profile.full_name as string) ?? 'No disponible'}`)
  lines.push(`Rol: ${(profile.role as string) ?? 'No disponible'}`)
  lines.push(`Teléfono: ${(profile.phone as string) ?? 'No disponible'}`)
  lines.push(`Fecha de registro: ${formatDate(profile.created_at as string)}`)
  lines.push('')

  return lines
}

/**
 * Create privacy preferences section
 */
function createPrivacySection(prefs: Record<string, unknown> | null): string[] {
  const lines: string[] = []

  if (!prefs) return lines

  lines.push('2. PREFERENCIAS DE PRIVACIDAD')
  lines.push('-'.repeat(80))
  lines.push(`Consentimiento de analíticas: ${prefs.analytics_consent ? 'Sí' : 'No'}`)
  lines.push(`Consentimiento de personalización: ${prefs.personalization_consent ? 'Sí' : 'No'}`)
  lines.push(`Consentimiento de investigación: ${prefs.research_consent ? 'Sí' : 'No'}`)
  lines.push(`Consentimiento de entrenamiento de IA: ${prefs.ai_training_consent ? 'Sí' : 'No'}`)
  lines.push(`Última actualización: ${formatDate(prefs.last_consent_update as string)}`)
  lines.push('')

  return lines
}

/**
 * Create appointments section
 */
function createAppointmentsSection(appointments: Array<Record<string, unknown>>): string[] {
  const lines: string[] = []

  if (appointments.length === 0) return lines

  lines.push('3. HISTORIAL DE CITAS')
  lines.push('-'.repeat(80))
  lines.push(`Total de citas: ${appointments.length}`)
  lines.push('')

  appointments.slice(0, 10).forEach((apt, index) => {
    lines.push(`Cita ${index + 1}:`)
    lines.push(`  - ID: ${apt.id}`)
    lines.push(`  - Fecha: ${formatDateTime(apt.start_ts as string)}`)
    lines.push(`  - Estado: ${apt.status}`)
    lines.push(`  - Motivo: ${(apt.reason_for_visit as string) ?? 'No especificado'}`)
    lines.push('')
  })

  if (appointments.length > 10) {
    lines.push(`... y ${appointments.length - 10} citas más`)
    lines.push('')
  }

  return lines
}

/**
 * Create consultations section
 */
function createConsultationsSection(consultations: Array<Record<string, unknown>>): string[] {
  const lines: string[] = []

  if (consultations.length === 0) return lines

  lines.push('4. CONSULTAS MÉDICAS (SOAP)')
  lines.push('-'.repeat(80))
  lines.push(`Total de consultas: ${consultations.length}`)
  lines.push('')

  consultations.slice(0, 5).forEach((consultation, index) => {
    lines.push(`Consulta ${index + 1}:`)
    lines.push(`  - ID: ${consultation.id}`)
    lines.push(`  - Fecha: ${formatDateTime(consultation.created_at as string)}`)
    lines.push(`  - Motivo principal: ${(consultation.chief_complaint as string) ?? 'No especificado'}`)
    lines.push(`  - Diagnóstico: ${(consultation.diagnosis as string) ?? 'No especificado'}`)
    lines.push('')
  })

  if (consultations.length > 5) {
    lines.push(`... y ${consultations.length - 5} consultas más`)
    lines.push('')
  }

  return lines
}

/**
 * Create prescriptions section
 */
function createPrescriptionsSection(prescriptions: Array<Record<string, unknown>>): string[] {
  const lines: string[] = []

  if (prescriptions.length === 0) return lines

  lines.push('5. RECETAS MÉDICAS')
  lines.push('-'.repeat(80))
  lines.push(`Total de recetas: ${prescriptions.length}`)
  lines.push('')

  prescriptions.slice(0, 5).forEach((rx, index) => {
    lines.push(`Receta ${index + 1}:`)
    lines.push(`  - ID: ${rx.id}`)
    lines.push(`  - Fecha: ${formatDateTime(rx.created_at as string)}`)
    lines.push(`  - Notas: ${(rx.notes as string) ?? 'Sin notas'}`)
    lines.push('')
  })

  if (prescriptions.length > 5) {
    lines.push(`... y ${prescriptions.length - 5} recetas más`)
    lines.push('')
  }

  return lines
}

/**
 * Create payments section
 */
function createPaymentsSection(payments: Array<Record<string, unknown>>): string[] {
  const lines: string[] = []

  if (payments.length === 0) return lines

  lines.push('6. HISTORIAL DE PAGOS')
  lines.push('-'.repeat(80))
  lines.push(`Total de pagos: ${payments.length}`)
  lines.push('')

  payments.slice(0, 10).forEach((payment, index) => {
    const amount = ((payment.amount_cents as number) ?? 0) / 100

    lines.push(`Pago ${index + 1}:`)
    lines.push(`  - ID: ${payment.id}`)
    lines.push(`  - Fecha: ${formatDateTime(payment.created_at as string)}`)
    lines.push(`  - Monto: ${amount} ${payment.currency}`)
    lines.push(`  - Estado: ${payment.status}`)
    lines.push('')
  })

  if (payments.length > 10) {
    lines.push(`... y ${payments.length - 10} pagos más`)
    lines.push('')
  }

  return lines
}

/**
 * Create footer section
 */
function createFooter(): string[] {
  const lines: string[] = []

  lines.push('='.repeat(80))
  lines.push('FIN DEL REPORTE')
  lines.push('='.repeat(80))
  lines.push('')
  lines.push('Este reporte contiene sus datos personales de acuerdo con su derecho de')
  lines.push('acceso ARCO (LFPDPPP). Si tiene alguna pregunta, contacte a:')
  lines.push('privacidad@doctormx.com')

  return lines
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

  const lines: string[] = [
    ...createHeader(dataPackage.export_metadata),
    ...createProfileSection(dataPackage.user_profile),
    ...createPrivacySection(dataPackage.privacy_preferences as Record<string, unknown> | null),
    ...createAppointmentsSection(dataPackage.appointments),
    ...createConsultationsSection(dataPackage.consultations),
    ...createPrescriptionsSection(dataPackage.prescriptions),
    ...createPaymentsSection(dataPackage.payments),
    ...createFooter(),
  ]

  return lines.join('\n')
}
