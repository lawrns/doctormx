/**
 * Consent Constants Module
 *
 * Centralized constants for consent management system
 * Constantes centralizadas para el sistema de gestión de consentimientos
 *
 * @module consent/constants
 */

import type { ConsentType, ConsentCategory } from './types'

/**
 * Legal age of majority in Mexico
 */
export const LEGAL_AGE_MEXICO = 18

/**
 * Default consent expiration (null = no expiration)
 */
export const DEFAULT_CONSENT_EXPIRATION: string | null = null

/**
 * Essential consents that cannot be withdrawn
 */
export const ESSENTIAL_CONSENTS: ConsentType[] = [
  'medical_treatment',
  'emergency_contact',
]

/**
 * Consent categories
 */
export const CONSENT_CATEGORIES: Record<ConsentCategory, string> = {
  essential: 'Esencial',
  functional: 'Funcional',
  analytical: 'Analítico',
  marketing: 'Marketing',
  legal: 'Legal',
}

/**
 * Consent type display names (Spanish)
 */
export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  medical_treatment: 'Tratamiento Médico',
  data_processing: 'Procesamiento de Datos',
  telemedicine: 'Telemedicina',
  recording: 'Grabación de Consultas',
  ai_analysis: 'Análisis con IA',
  data_sharing: 'Compartir Datos',
  research: 'Investigación',
  marketing: 'Marketing',
  emergency_contact: 'Contacto de Emergencia',
  prescription_forwarding: 'Reenvío de Recetas',
}

/**
 * Consent category assignments
 */
export const CONSENT_TYPE_CATEGORIES: Record<ConsentType, ConsentCategory> = {
  medical_treatment: 'essential',
  data_processing: 'legal',
  telemedicine: 'functional',
  recording: 'functional',
  ai_analysis: 'analytical',
  data_sharing: 'functional',
  research: 'analytical',
  marketing: 'marketing',
  emergency_contact: 'essential',
  prescription_forwarding: 'functional',
}
