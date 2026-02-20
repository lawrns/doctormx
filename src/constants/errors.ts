/**
 * Error Constants - Doctor.mx
 *
 * Standardized error codes and messages for consistent error handling
 * across the platform. Supports both patient-friendly (Spanish) and
 * developer-friendly (English) messages.
 *
 * @module constants/errors
 * @see {@link ../lib/errors/messages.ts} - Original source
 */

/**
 * Error code constants organized by category
 * Format: CATEGORY_001 (e.g., MED_001, AUTH_001)
 */
export const ERROR_CODES = {
  // Medical errors (MED_xxx)
  MEDICAL_RECORD_ERROR: 'MED_001',
  MEDICAL_DATA_INVALID: 'MED_002',
  SYMPTOM_ANALYSIS_FAILED: 'MED_003',
  RED_FLAG_DETECTED: 'MED_004',

  // Emergency errors (EMG_xxx)
  EMERGENCY_DETECTED: 'EMG_001',
  CRITICAL_SYMPTOMS: 'EMG_002',
  URGENT_CARE_NEEDED: 'EMG_003',
  EMERGENCY_REDIRECT: 'EMG_004',

  // Prescription errors (RX_xxx)
  PRESCRIPTION_GENERATION_FAILED: 'RX_001',
  DRUG_INTERACTION: 'RX_002',
  DOSAGE_ERROR: 'RX_003',
  ALLERGY_ALERT: 'RX_004',
  CONTRAINDICATION: 'RX_005',
  PRESCRIPTION_EXPIRED: 'RX_006',

  // Diagnosis errors (DX_xxx)
  DIAGNOSIS_LOW_CONFIDENCE: 'DX_001',
  INSUFFICIENT_DATA: 'DX_002',
  DIAGNOSIS_CONFLICT: 'DX_003',
  SYMPTOM_MISMATCH: 'DX_004',

  // Appointment errors (APT_xxx)
  APPOINTMENT_CONFLICT: 'APT_001',
  DOCTOR_UNAVAILABLE: 'APT_002',
  INVALID_TIME_SLOT: 'APT_003',
  APPOINTMENT_CANCELLED: 'APT_004',
  APPOINTMENT_EXPIRED: 'APT_005',

  // Authentication errors (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_SESSION_EXPIRED: 'AUTH_002',
  AUTH_TOKEN_INVALID: 'AUTH_003',
  AUTH_UNAUTHORIZED: 'AUTH_004',

  // Authorization errors (ACC_xxx)
  ACCESS_DENIED: 'ACC_001',
  INSUFFICIENT_PERMISSIONS: 'ACC_002',
  ROLE_REQUIRED: 'ACC_003',

  // Validation errors (VAL_xxx)
  VALIDATION_FAILED: 'VAL_001',
  INVALID_INPUT: 'VAL_002',
  MISSING_REQUIRED_FIELD: 'VAL_003',
  INVALID_FORMAT: 'VAL_004',

  // Not found errors (NF_xxx)
  RESOURCE_NOT_FOUND: 'NF_001',
  USER_NOT_FOUND: 'NF_002',
  DOCTOR_NOT_FOUND: 'NF_003',
  APPOINTMENT_NOT_FOUND: 'NF_004',

  // Rate limiting errors (RATE_xxx)
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  TOO_MANY_REQUESTS: 'RATE_002',
  QUOTA_EXCEEDED: 'RATE_003',

  // External service errors (EXT_xxx)
  EXTERNAL_SERVICE_DOWN: 'EXT_001',
  AI_SERVICE_ERROR: 'EXT_002',
  PAYMENT_SERVICE_ERROR: 'EXT_003',
  SMS_SERVICE_ERROR: 'EXT_004',

  // Consent errors (CON_xxx)
  CONSENT_REQUIRED: 'CON_001',
  CONSENT_OUTDATED: 'CON_002',
  CONSENT_WITHDRAWN: 'CON_003',
  PRIVACY_POLICY_UPDATED: 'CON_004',

  // Payment errors (PAY_xxx)
  PAYMENT_FAILED: 'PAY_001',
  PAYMENT_DECLINED: 'PAY_002',
  PAYMENT_CANCELLED: 'PAY_003',
  REFUND_FAILED: 'PAY_004',

  // Video consultation errors (VID_xxx)
  VIDEO_SETUP_FAILED: 'VID_001',
  VIDEO_CONNECTION_ERROR: 'VID_002',
  VIDEO_PERMISSION_DENIED: 'VID_003',
  RECORDING_FAILED: 'VID_004',
} as const

/**
 * Type for all error code values
 */
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/**
 * Error categories for grouping
 */
export const ERROR_CATEGORIES = {
  MEDICAL: ['MED_001', 'MED_002', 'MED_003', 'MED_004'],
  EMERGENCY: ['EMG_001', 'EMG_002', 'EMG_003', 'EMG_004'],
  PRESCRIPTION: ['RX_001', 'RX_002', 'RX_003', 'RX_004', 'RX_005', 'RX_006'],
  DIAGNOSIS: ['DX_001', 'DX_002', 'DX_003', 'DX_004'],
  APPOINTMENT: ['APT_001', 'APT_002', 'APT_003', 'APT_004', 'APT_005'],
  AUTHENTICATION: ['AUTH_001', 'AUTH_002', 'AUTH_003', 'AUTH_004'],
  AUTHORIZATION: ['ACC_001', 'ACC_002', 'ACC_003'],
  VALIDATION: ['VAL_001', 'VAL_002', 'VAL_003', 'VAL_004'],
  NOT_FOUND: ['NF_001', 'NF_002', 'NF_003', 'NF_004'],
  RATE_LIMIT: ['RATE_001', 'RATE_002', 'RATE_003'],
  EXTERNAL: ['EXT_001', 'EXT_002', 'EXT_003', 'EXT_004'],
  CONSENT: ['CON_001', 'CON_002', 'CON_003', 'CON_004'],
  PAYMENT: ['PAY_001', 'PAY_002', 'PAY_003', 'PAY_004'],
  VIDEO: ['VID_001', 'VID_002', 'VID_003', 'VID_004'],
} as const

/**
 * User-friendly Spanish error messages for patients
 * These messages are displayed to end users
 */
export const PATIENT_ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Medical errors
  [ERROR_CODES.MEDICAL_RECORD_ERROR]: 'Hubo un problema al acceder a su expediente médico. Por favor, intente nuevamente.',
  [ERROR_CODES.MEDICAL_DATA_INVALID]: 'Los datos médicos proporcionados no son válidos. Por favor, verifique la información.',
  [ERROR_CODES.SYMPTOM_ANALYSIS_FAILED]: 'No pudimos analizar sus síntomas correctamente. Por favor, intente nuevamente.',
  [ERROR_CODES.RED_FLAG_DETECTED]: 'Detectamos información importante que requiere atención médica.',

  // Emergency errors
  [ERROR_CODES.EMERGENCY_DETECTED]: 'Según los síntomas que describe, podría requerir atención médica urgente.',
  [ERROR_CODES.CRITICAL_SYMPTOMS]: 'Ha descrito síntomas que requieren atención médica inmediata.',
  [ERROR_CODES.URGENT_CARE_NEEDED]: 'Sus síntomas sugieren que debe buscar atención médica pronto.',
  [ERROR_CODES.EMERGENCY_REDIRECT]: 'Por su seguridad, le recomendamos contactar servicios de emergencia.',

  // Prescription errors
  [ERROR_CODES.PRESCRIPTION_GENERATION_FAILED]: 'No pudimos generar su receta. Por favor, contacte a su médico.',
  [ERROR_CODES.DRUG_INTERACTION]: 'Existe una posible interacción entre medicamentos. Su médico será notificado.',
  [ERROR_CODES.DOSAGE_ERROR]: 'La dosis del medicamento necesita revisión. Su médico será notificado.',
  [ERROR_CODES.ALLERGY_ALERT]: 'Detectamos una posible alergia al medicamento. Su médico será notificado.',
  [ERROR_CODES.CONTRAINDICATION]: 'Este medicamento puede no ser adecuado para usted. Su médico será notificado.',
  [ERROR_CODES.PRESCRIPTION_EXPIRED]: 'Esta receta ha expirado. Por favor, solicite una nueva a su médico.',

  // Diagnosis errors
  [ERROR_CODES.DIAGNOSIS_LOW_CONFIDENCE]: 'Necesitamos más información para darle un diagnóstico preciso.',
  [ERROR_CODES.INSUFFICIENT_DATA]: 'Por favor, proporcione más detalles sobre sus síntomas.',
  [ERROR_CODES.DIAGNOSIS_CONFLICT]: 'Hay información contradictoria. Por favor, revise sus respuestas.',
  [ERROR_CODES.SYMPTOM_MISMATCH]: 'Los síntomas descritos no coinciden. Por favor, verifique.',

  // Appointment errors
  [ERROR_CODES.APPOINTMENT_CONFLICT]: 'Este horario ya no está disponible. Por favor, seleccione otro.',
  [ERROR_CODES.DOCTOR_UNAVAILABLE]: 'El médico no está disponible en este horario.',
  [ERROR_CODES.INVALID_TIME_SLOT]: 'El horario seleccionado no es válido.',
  [ERROR_CODES.APPOINTMENT_CANCELLED]: 'Esta cita ha sido cancelada.',
  [ERROR_CODES.APPOINTMENT_EXPIRED]: 'Esta cita ha expirado. Por favor, agende una nueva.',

  // Authentication errors
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'El correo o contraseña son incorrectos.',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Su sesión no es válida. Por favor, inicie sesión nuevamente.',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'No tiene autorización para acceder a esta sección.',

  // Authorization errors
  [ERROR_CODES.ACCESS_DENIED]: 'No tiene permiso para realizar esta acción.',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Su cuenta no tiene los permisos necesarios.',
  [ERROR_CODES.ROLE_REQUIRED]: 'Esta función está disponible solo para personal médico.',

  // Validation errors
  [ERROR_CODES.VALIDATION_FAILED]: 'Por favor, verifique que todos los datos sean correctos.',
  [ERROR_CODES.INVALID_INPUT]: 'La información ingresada no es válida.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Falta completar información requerida.',
  [ERROR_CODES.INVALID_FORMAT]: 'El formato de la información no es correcto.',

  // Not found errors
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'No encontramos la información solicitada.',
  [ERROR_CODES.USER_NOT_FOUND]: 'No encontramos el usuario en nuestro sistema.',
  [ERROR_CODES.DOCTOR_NOT_FOUND]: 'No encontramos el médico en nuestro sistema.',
  [ERROR_CODES.APPOINTMENT_NOT_FOUND]: 'No encontramos la cita especificada.',

  // Rate limiting errors
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Ha excedido el límite de solicitudes. Por favor, espere unos minutos.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes. Por favor, intente más tarde.',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Ha alcanzado el límite de uso de su cuenta.',

  // External service errors
  [ERROR_CODES.EXTERNAL_SERVICE_DOWN]: 'El servicio no está disponible. Por favor, intente más tarde.',
  [ERROR_CODES.AI_SERVICE_ERROR]: 'El servicio de IA no está disponible. Por favor, intente más tarde.',
  [ERROR_CODES.PAYMENT_SERVICE_ERROR]: 'Hubo un problema con el procesamiento del pago.',
  [ERROR_CODES.SMS_SERVICE_ERROR]: 'No pudimos enviar el mensaje de texto. Por favor, intente nuevamente.',

  // Consent errors
  [ERROR_CODES.CONSENT_REQUIRED]: 'Debe aceptar los términos para continuar.',
  [ERROR_CODES.CONSENT_OUTDATED]: 'Hemos actualizado nuestros términos. Por favor, revíselos.',
  [ERROR_CODES.CONSENT_WITHDRAWN]: 'Ha retirado su consentimiento. Ya no podemos continuar.',
  [ERROR_CODES.PRIVACY_POLICY_UPDATED]: 'Hemos actualizado nuestra política de privacidad.',

  // Payment errors
  [ERROR_CODES.PAYMENT_FAILED]: 'El pago no pudo ser procesado. Por favor, intente con otro método.',
  [ERROR_CODES.PAYMENT_DECLINED]: 'El pago fue rechazado. Por favor, verifique sus datos.',
  [ERROR_CODES.PAYMENT_CANCELLED]: 'El pago fue cancelado.',
  [ERROR_CODES.REFUND_FAILED]: 'No pudimos procesar el reembolso. Por favor, contacte a soporte.',

  // Video consultation errors
  [ERROR_CODES.VIDEO_SETUP_FAILED]: 'No pudimos configurar la videollamada. Por favor, intente nuevamente.',
  [ERROR_CODES.VIDEO_CONNECTION_ERROR]: 'Hubo un problema con la conexión de video.',
  [ERROR_CODES.VIDEO_PERMISSION_DENIED]: 'Necesita permisos de cámara y micrófono para la videollamada.',
  [ERROR_CODES.RECORDING_FAILED]: 'No pudimos grabar la consulta.',
}

/**
 * Developer-friendly error messages in English
 * Used for logging and debugging
 */
export const DEVELOPER_ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Medical errors
  [ERROR_CODES.MEDICAL_RECORD_ERROR]: 'Failed to access or update medical record',
  [ERROR_CODES.MEDICAL_DATA_INVALID]: 'Invalid medical data provided',
  [ERROR_CODES.SYMPTOM_ANALYSIS_FAILED]: 'AI symptom analysis failed',
  [ERROR_CODES.RED_FLAG_DETECTED]: 'Red flags detected in symptom analysis',

  // Emergency errors
  [ERROR_CODES.EMERGENCY_DETECTED]: 'Emergency symptoms detected by AI',
  [ERROR_CODES.CRITICAL_SYMPTOMS]: 'Critical symptoms requiring immediate attention',
  [ERROR_CODES.URGENT_CARE_NEEDED]: 'Symptoms indicating need for urgent care',
  [ERROR_CODES.EMERGENCY_REDIRECT]: 'Patient should be redirected to emergency services',

  // Prescription errors
  [ERROR_CODES.PRESCRIPTION_GENERATION_FAILED]: 'Failed to generate prescription',
  [ERROR_CODES.DRUG_INTERACTION]: 'Potential drug-drug interaction detected',
  [ERROR_CODES.DOSAGE_ERROR]: 'Dosage outside safe range',
  [ERROR_CODES.ALLERGY_ALERT]: 'Patient allergy detected for prescribed medication',
  [ERROR_CODES.CONTRAINDICATION]: 'Contraindication detected',
  [ERROR_CODES.PRESCRIPTION_EXPIRED]: 'Prescription has expired',

  // Diagnosis errors
  [ERROR_CODES.DIAGNOSIS_LOW_CONFIDENCE]: 'AI diagnosis confidence below threshold',
  [ERROR_CODES.INSUFFICIENT_DATA]: 'Insufficient data for accurate diagnosis',
  [ERROR_CODES.DIAGNOSIS_CONFLICT]: 'Conflicting diagnosis information',
  [ERROR_CODES.SYMPTOM_MISMATCH]: 'Symptoms do not match expected patterns',

  // Appointment errors
  [ERROR_CODES.APPOINTMENT_CONFLICT]: 'Time slot conflict detected',
  [ERROR_CODES.DOCTOR_UNAVAILABLE]: 'Doctor not available at requested time',
  [ERROR_CODES.INVALID_TIME_SLOT]: 'Invalid time slot selected',
  [ERROR_CODES.APPOINTMENT_CANCELLED]: 'Appointment has been cancelled',
  [ERROR_CODES.APPOINTMENT_EXPIRED]: 'Appointment has expired',

  // Authentication errors
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid authentication credentials',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'User session has expired',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.AUTH_UNAUTHORIZED]: 'User not authenticated',

  // Authorization errors
  [ERROR_CODES.ACCESS_DENIED]: 'Access denied to resource',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'User lacks required permissions',
  [ERROR_CODES.ROLE_REQUIRED]: 'Specific role required for this action',

  // Validation errors
  [ERROR_CODES.VALIDATION_FAILED]: 'Input validation failed',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.INVALID_FORMAT]: 'Input format is invalid',

  // Not found errors
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Requested resource not found',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found in system',
  [ERROR_CODES.DOCTOR_NOT_FOUND]: 'Doctor not found in system',
  [ERROR_CODES.APPOINTMENT_NOT_FOUND]: 'Appointment not found',

  // Rate limiting errors
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests in short time',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'User quota exceeded',

  // External service errors
  [ERROR_CODES.EXTERNAL_SERVICE_DOWN]: 'External service unavailable',
  [ERROR_CODES.AI_SERVICE_ERROR]: 'AI service error occurred',
  [ERROR_CODES.PAYMENT_SERVICE_ERROR]: 'Payment service error',
  [ERROR_CODES.SMS_SERVICE_ERROR]: 'SMS service error',

  // Consent errors
  [ERROR_CODES.CONSENT_REQUIRED]: 'User consent required',
  [ERROR_CODES.CONSENT_OUTDATED]: 'User consent version outdated',
  [ERROR_CODES.CONSENT_WITHDRAWN]: 'User has withdrawn consent',
  [ERROR_CODES.PRIVACY_POLICY_UPDATED]: 'Privacy policy has been updated',

  // Payment errors
  [ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed',
  [ERROR_CODES.PAYMENT_DECLINED]: 'Payment declined by processor',
  [ERROR_CODES.PAYMENT_CANCELLED]: 'Payment cancelled by user',
  [ERROR_CODES.REFUND_FAILED]: 'Refund processing failed',

  // Video consultation errors
  [ERROR_CODES.VIDEO_SETUP_FAILED]: 'Failed to setup video consultation',
  [ERROR_CODES.VIDEO_CONNECTION_ERROR]: 'Video connection error',
  [ERROR_CODES.VIDEO_PERMISSION_DENIED]: 'Camera/microphone permission denied',
  [ERROR_CODES.RECORDING_FAILED]: 'Failed to record consultation',
}

/**
 * Emergency-related error codes
 * Used for special handling of critical situations
 */
export const EMERGENCY_ERROR_CODES: ErrorCode[] = [
  ERROR_CODES.EMERGENCY_DETECTED,
  ERROR_CODES.CRITICAL_SYMPTOMS,
  ERROR_CODES.URGENT_CARE_NEEDED,
  ERROR_CODES.EMERGENCY_REDIRECT,
]

/**
 * Check if an error code is emergency-related
 * @param code - Error code to check
 * @returns True if the error is emergency-related
 */
export function isEmergencyErrorCode(code: ErrorCode): boolean {
  return EMERGENCY_ERROR_CODES.includes(code)
}

/**
 * Get the error category from an error code
 * @param code - Error code
 * @returns The category name or 'UNKNOWN'
 */
export function getErrorCategory(code: ErrorCode): string {
  const prefix = code.split('_')[0]
  const categoryMap: Record<string, string> = {
    MED: 'MEDICAL',
    EMG: 'EMERGENCY',
    RX: 'PRESCRIPTION',
    DX: 'DIAGNOSIS',
    APT: 'APPOINTMENT',
    AUTH: 'AUTHENTICATION',
    ACC: 'AUTHORIZATION',
    VAL: 'VALIDATION',
    NF: 'NOT_FOUND',
    RATE: 'RATE_LIMIT',
    EXT: 'EXTERNAL',
    CON: 'CONSENT',
    PAY: 'PAYMENT',
    VID: 'VIDEO',
  }
  return categoryMap[prefix] ?? 'UNKNOWN'
}
