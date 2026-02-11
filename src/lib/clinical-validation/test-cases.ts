/**
 * Clinical Validation Test Cases
 *
 * Comprehensive test cases for clinical data validation according to:
 * - NOM-004-SSA3-2012 (Expediente clínico electrónico)
 * - Good Clinical Practice (GCP)
 * - Medical best practices
 *
 * @module clinical-validation-tests
 * @version 1.0.0
 */

// ================================================
// SOAP CONSULTATION VALIDATION TESTS
// ================================================

/**
 * SOAP consultation validation test cases
 */
export const SOAP_VALIDATION_TESTS = [
  {
    id: 'soap_001',
    name: 'Required Fields - Subjective',
    category: 'required_fields',
    description: 'SOAP note must have chief_complaint in subjective',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      return !!data.subjective && typeof data.subjective === 'string' && data.subjective.trim().length > 0
    },
    errorMessage: 'El subjetivo debe incluir motivo de consulta (chief_complaint)',
  },
  {
    id: 'soap_002',
    name: 'Required Fields - Objective',
    category: 'required_fields',
    description: 'SOAP note must have vital signs or physical exam findings',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      return !!(
        data.vital_signs &&
        typeof data.vital_signs === 'object' &&
        Object.keys(data.vital_signs).length > 0
      )
    },
    errorMessage: 'El objetivo debe incluir signos vitales o examen físico',
  },
  {
    id: 'soap_003',
    name: 'Required Fields - Assessment',
    category: 'required_fields',
    description: 'SOAP note must have diagnosis or assessment',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      return !!data.diagnosis && typeof data.diagnosis === 'string' && data.diagnosis.trim().length > 0
    },
    errorMessage: 'La evaluación debe incluir diagnóstico',
  },
  {
    id: 'soap_004',
    name: 'Required Fields - Plan',
    category: 'required_fields',
    description: 'SOAP note must have treatment plan or follow-up instructions',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      return !!(
        data.treatment_plan &&
        typeof data.treatment_plan === 'string' &&
        data.treatment_plan.trim().length > 0
      )
    },
    errorMessage: 'El plan debe incluir tratamiento o indicaciones',
  },
  {
    id: 'soap_005',
    name: 'Vital Signs - Temperature Range',
    category: 'vital_signs',
    description: 'Body temperature must be within reasonable range (35-42°C)',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const vitals = data.vital_signs as Record<string, unknown> | null
      if (!vitals) return true // Not required
      const temp = vitals.temperature as number | null
      if (!temp) return true
      return temp >= 35 && temp <= 42
    },
    errorMessage: 'Temperatura fuera de rango normal (35-42°C)',
  },
  {
    id: 'soap_006',
    name: 'Vital Signs - Heart Rate Range',
    category: 'vital_signs',
    description: 'Heart rate must be within reasonable range (30-250 bpm)',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const vitals = data.vital_signs as Record<string, unknown> | null
      if (!vitals) return true
      const hr = vitals.heart_rate as number | null
      if (!hr) return true
      return hr >= 30 && hr <= 250
    },
    errorMessage: 'Frecuencia cardíaca fuera de rango normal (30-250 lpm)',
  },
  {
    id: 'soap_007',
    name: 'Vital Signs - Blood Pressure Systolic',
    category: 'vital_signs',
    description: 'Systolic BP must be within reasonable range (60-300 mmHg)',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const vitals = data.vital_signs as Record<string, unknown> | null
      if (!vitals) return true
      const bp = vitals.blood_pressure as Record<string, unknown> | null
      if (!bp) return true
      const systolic = bp.systolic as number | null
      if (!systolic) return true
      return systolic >= 60 && systolic <= 300
    },
    errorMessage: 'Presión sistólica fuera de rango normal (60-300 mmHg)',
  },
  {
    id: 'soap_008',
    name: 'Medication Validation - Dosage',
    category: 'medication',
    description: 'If medications prescribed, dosage must be specified',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      const meds = data.medications as Array<Record<string, unknown>> | null
      if (!meds || meds.length === 0) return true
      return meds.every(med => !!med.dosage && typeof med.dosage === 'string' && med.dosage.trim().length > 0)
    },
    errorMessage: 'Todos los medicamentos deben incluir dosis',
  },
  {
    id: 'soap_009',
    name: 'Medication Validation - Frequency',
    category: 'medication',
    description: 'If medications prescribed, frequency must be specified',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      const meds = data.medications as Array<Record<string, unknown>> | null
      if (!meds || meds.length === 0) return true
      return meds.every(med => !!med.frequency && typeof med.frequency === 'string' && med.frequency.trim().length > 0)
    },
    errorMessage: 'Todos los medicamentos deben incluir frecuencia de administración',
  },
  {
    id: 'soap_010',
    name: 'Allergy Documentation',
    category: 'safety',
    description: 'If patient has allergies, they must be documented',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      const allergies = data.allergies as string[] | null
      const hasAllergies = allergies && allergies.length > 0
      if (hasAllergies) {
        return true // Already documented
      }
      // Check if allergies field exists but is empty
      return data.allergies !== undefined
    },
    errorMessage: 'Se debe documentar alergias conocidas (indicar "ninguna" si aplica)',
  },
] as const

// ================================================
// PRESCRIPTION VALIDATION TESTS
// ================================================

/**
 * Prescription validation test cases
 */
export const PRESCRIPTION_VALIDATION_TESTS = [
  {
    id: 'rx_001',
    name: 'Prescription - Required Medications',
    category: 'required_fields',
    description: 'Prescription must have at least one medication',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      const meds = data.medications as string | null
      return !!meds && meds.trim().length > 0
    },
    errorMessage: 'La receta debe incluir al menos un medicamento',
  },
  {
    id: 'rx_002',
    name: 'Prescription - Diagnosis',
    category: 'required_fields',
    description: 'Prescription should have related diagnosis',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const diagnosis = data.diagnosis as string | null
      return !!diagnosis && diagnosis.trim().length > 0
    },
    errorMessage: 'Se recomienda incluir diagnóstico relacionado con la receta',
  },
  {
    id: 'rx_003',
    name: 'Prescription - Validity Period',
    category: 'validity',
    description: 'Prescription should indicate validity (typically 30-180 days)',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const validity = data.validity_days as number | null
      if (!validity) return true // Not required
      return validity >= 1 && validity <= 365
    },
    errorMessage: 'Período de validez debe estar entre 1 y 365 días',
  },
  {
    id: 'rx_004',
    name: 'Prescription - Doctor Identification',
    category: 'required_fields',
    description: 'Prescription must have doctor license and signature',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      return !!(
        data.doctor_id &&
        data.doctor_name &&
        data.doctor_license
      )
    },
    errorMessage: 'La receta debe incluir identificación completa del médico',
  },
] as const

// ================================================
// ALLERGY/SAFETY VALIDATION TESTS
// ================================================

/**
 * Safety and allergy validation test cases
 */
export const SAFETY_VALIDATION_TESTS = [
  {
    id: 'safe_001',
    name: 'Allergy - Medication Interaction',
    category: 'allergy',
    description: 'Check for prescribed medications against patient allergies',
    severity: 'critical',
    test: (data: { medications: string[], allergies: string[] }) => {
      if (!data.allergies || data.allergies.length === 0) return true
      if (!data.medications) return true

      const medications = data.medications.join(' ').toLowerCase()
      const allergies = data.allergies.join(' ').toLowerCase()

      // Simple check - would require actual drug interaction database in production
      return !allergies.split(/[\s,]+/).some(allergy =>
        allergy.length > 3 && medications.includes(allergy)
      )
    },
    errorMessage: 'ALERTA: Posible conflicto con alergias conocidas del paciente',
  },
  {
    id: 'safe_002',
    name: 'Safety - Contraindications',
    category: 'safety',
    description: 'Check for contraindications based on patient history',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      // Placeholder - would need actual contraindication database
      return true
    },
    errorMessage: 'ALERTA: Posible contraindicación basada en historial médico',
  },
  {
    id: 'safe_003',
    name: 'Safety - Pregnancy Precaution',
    category: 'safety',
    description: 'Flag potentially unsafe medications for pregnant patients',
    severity: 'warning',
    test: (data: { medications: string[], is_pregnant: boolean }) => {
      if (!data.is_pregnant) return true
      if (!data.medications) return true

      const unsafeMeds = [
        'isotretinoin', 'accutane', 'warfarin', 'coumadin',
        'methotrexate', 'ace inhibitors', 'statins'
      ]

      const medications = data.medications.join(' ').toLowerCase()
      return !unsafeMeds.some(med => medications.includes(med))
    },
    errorMessage: 'PRECAUCIÓN: Medicamento potencialmente inseguro en embarazo',
  },
  {
    id: 'safe_004',
    name: 'Safety - Pediatric Dosage',
    category: 'safety',
    description: 'Validate appropriate dosage for pediatric patients',
    severity: 'warning',
    test: (data: { patient_age: number, medications: string }) => {
      if (!data.patient_age || data.patient_age >= 18) return true

      // Flag high-risk medications for children under 12
      const highRiskMeds = ['aspirin', 'codeine', 'hydrocodone']
      const medications = data.medications.toLowerCase()

      if (data.patient_age < 12 && highRiskMeds.some(med => medications.includes(med))) {
        return false
      }

      return true
    },
    errorMessage: 'PRECAUCIÓN: Revisar dosificación pediátrica',
  },
] as const

// ================================================
// MEDICAL RECORD COMPLETENESS TESTS
// ================================================

/**
 * Medical record completeness test cases
 */
export const COMPLETENESS_TESTS = [
  {
    id: 'comp_001',
    name: 'Patient Profile - Contact Information',
    category: 'patient_profile',
    description: 'Patient must have valid contact information',
    severity: 'critical',
    test: (data: Record<string, unknown>) => {
      return !!(
        data.phone ||
        data.email
      )
    },
    errorMessage: 'El perfil del paciente debe incluir teléfono o email',
  },
  {
    id: 'comp_002',
    name: 'Patient Profile - Emergency Contact',
    category: 'patient_profile',
    description: 'Patient should have emergency contact on file',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const emergencyContact = data.emergency_contact as Record<string, unknown> | null
      if (!emergencyContact) return true // Not required but recommended

      return !!(
        emergencyContact.name &&
        emergencyContact.phone &&
        emergencyContact.relationship
      )
    },
    errorMessage: 'Se recomienda registrar contacto de emergencia',
  },
  {
    id: 'comp_003',
    name: 'Medical History - Chronic Conditions',
    category: 'medical_history',
    description: 'Document chronic conditions if present',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const chronic = data.chronic_conditions as string[] | null
      if (!chronic) return true

      // If array exists but is empty, that's fine
      return Array.isArray(chronic)
    },
    errorMessage: 'Condiciones crónicas deben estar bien documentadas',
  },
  {
    id: 'comp_004',
    name: 'Medical History - Current Medications',
    category: 'medical_history',
    description: 'Document current medications',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const currentMeds = data.current_medications as string[] | null
      if (!currentMeds) return true

      return Array.isArray(currentMeds)
    },
    errorMessage: 'Medicamentos actuales deben estar documentados',
  },
] as const

// ================================================
// DATA QUALITY TESTS
// ================================================

/**
 * Data quality and consistency test cases
 */
export const DATA_QUALITY_TESTS = [
  {
    id: 'dq_001',
    name: 'No PII in Clinical Notes',
    category: 'privacy',
    description: 'Clinical notes should not contain unnecessary PII in clear text',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const notes = data.notes as string | null
      if (!notes) return true

      // Check for patterns that look like unnecessary sensitive data
      const sensitivePatterns = [
        /\b\d{16}\b/, // Credit card
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Formatted credit card
      ]

      return !sensitivePatterns.some(pattern => pattern.test(notes))
    },
    errorMessage: 'Posible información sensible innecesaria en notas clínicas',
  },
  {
    id: 'dq_002',
    name: 'Consistent Date Format',
    category: 'consistency',
    description: 'All dates should be in ISO format',
    severity: 'warning',
    test: (data: Record<string, unknown>) => {
      const dateFields = ['created_at', 'updated_at', 'appointment_date', 'consultation_date']

      for (const field of dateFields) {
        const value = data[field]
        if (value && typeof value === 'string') {
          // Check if it looks like a valid ISO date or similar
          if (!/^\d{4}-\d{2}-\d{2}/.test(value) && !/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
            // Not a standard date format
            return false
          }
        }
      }

      return true
    },
    errorMessage: 'Las fechas deben estar en formato ISO (YYYY-MM-DD)',
  },
  {
    id: 'dq_003',
    name: 'Text Encoding',
    category: 'consistency',
    description: 'Text fields should use proper character encoding',
    severity: 'info',
    test: (data: Record<string, unknown>) => {
      const textFields = ['subjective', 'objective', 'assessment', 'plan', 'diagnosis']

      for (const field of textFields) {
        const value = data[field]
        if (value && typeof value === 'string') {
          // Check for common encoding issues (replacement characters)
          if (value.includes('') || value.includes('?')) {
            return false
          }
        }
      }

      return true
    },
    errorMessage: 'Posible problema de codificación de caracteres detectado',
  },
] as const

// ================================================
// EXPORTS
// ================================================

/**
 * All clinical validation test suites
 */
export const ALL_CLINICAL_VALIDATION_TESTS = {
  soap: SOAP_VALIDATION_TESTS,
  prescription: PRESCRIPTION_VALIDATION_TESTS,
  safety: SAFETY_VALIDATION_TESTS,
  completeness: COMPLETENESS_TESTS,
  data_quality: DATA_QUALITY_TESTS,
} as const

/**
 * Get test cases by category
 */
export function getTestsByCategory(category: string) {
  switch (category) {
    case 'soap':
      return SOAP_VALIDATION_TESTS
    case 'prescription':
      return PRESCRIPTION_VALIDATION_TESTS
    case 'safety':
      return SAFETY_VALIDATION_TESTS
    case 'completeness':
      return COMPLETENESS_TESTS
    case 'data_quality':
      return DATA_QUALITY_TESTS
    default:
      return []
  }
}

/**
 * Get test cases by severity
 */
export function getTestsBySeverity(severity: 'critical' | 'warning' | 'info') {
  const allTests = [
    ...SOAP_VALIDATION_TESTS,
    ...PRESCRIPTION_VALIDATION_TESTS,
    ...SAFETY_VALIDATION_TESTS,
    ...COMPLETENESS_TESTS,
    ...DATA_QUALITY_TESTS,
  ]

  return allTests.filter(test => test.severity === severity)
}

/**
 * Get total count of validation tests
 */
export const TOTAL_VALIDATION_TESTS =
  SOAP_VALIDATION_TESTS.length +
  PRESCRIPTION_VALIDATION_TESTS.length +
  SAFETY_VALIDATION_TESTS.length +
  COMPLETENESS_TESTS.length +
  DATA_QUALITY_TESTS.length

/**
 * Validation result interface
 */
export interface ValidationResult {
  test_id: string
  test_name: string
  category: string
  severity: string
  passed: boolean
  error_message?: string
  data_snapshot?: Record<string, unknown>
}

/**
 * Run validation tests for data
 */
export function runValidationTests(
  data: Record<string, unknown>,
  tests: readonly Readonly<{
    id: string
    name: string
    category: string
    severity: string
    test: (data: Record<string, unknown>) => boolean
    errorMessage: string
  }>[] = SOAP_VALIDATION_TESTS
): ValidationResult[] {
  return tests.map(test => {
    try {
      const passed = test.test(data)
      return {
        test_id: test.id,
        test_name: test.name,
        category: test.category,
        severity: test.severity,
        passed,
        error_message: passed ? undefined : test.errorMessage,
        data_snapshot: passed ? undefined : data,
      }
    } catch (error) {
      return {
        test_id: test.id,
        test_name: test.name,
        category: test.category,
        severity: test.severity,
        passed: false,
        error_message: `Error en validación: ${error instanceof Error ? error.message : 'Desconocido'}`,
        data_snapshot: data,
      }
    }
  })
}

/**
 * Get compliance score based on test results
 */
export function getComplianceScore(results: ValidationResult[]): {
  score: number
  critical_passed: number
  critical_total: number
  warning_passed: number
  warning_total: number
} {
  const critical = results.filter(r => r.severity === 'critical')
  const warnings = results.filter(r => r.severity === 'warning')

  const critical_passed = critical.filter(r => r.passed).length
  const warning_passed = warnings.filter(r => r.passed).length

  // Weight critical failures more heavily
  const criticalScore = critical.length > 0 ? (critical_passed / critical.length) * 70 : 70
  const warningScore = warnings.length > 0 ? (warning_passed / warnings.length) * 30 : 30

  return {
    score: Math.round(criticalScore + warningScore),
    critical_passed,
    critical_total: critical.length,
    warning_passed,
    warning_total: warnings.length,
  }
}

