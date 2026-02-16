/**
 * Real-world usage examples for the Error Handler System
 * These examples demonstrate how to integrate the error handling
 * system throughout the Doctor.mx application.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  EmergencyDetectedError,
  PrescriptionError,
  DiagnosisError,
  AppointmentError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  ExternalServiceError,
  handleError,
  createRouteHandler,
  ERROR_CODES,
  logError,
  type ErrorContext
} from './index';

// ============================================
// API ROUTE EXAMPLES
// ============================================

/**
 * Example: AI Consultation API Route
 * Handles symptom analysis and emergency detection
 */
export async function aiConsultationRoute(request: NextRequest) {
  const context: ErrorContext = {
    route: '/api/ai/consult',
    method: 'POST'
  };

  try {
    const body = await request.json();
    const { symptoms, userId } = body;

    // Check for emergency symptoms
    const emergencySymptoms = await checkForEmergencySymptoms(symptoms);
    if (emergencySymptoms.detected) {
      throw new EmergencyDetectedError(
        ERROR_CODES.EMERGENCY_DETECTED,
        'Critical symptoms detected that require immediate attention',
        emergencySymptoms.severity,
        emergencySymptoms.symptoms
      );
    }

    // Process consultation
    const diagnosis = await processDiagnosis(symptoms);

    if (diagnosis.confidence < 0.6) {
      throw new DiagnosisError(
        ERROR_CODES.DIAGNOSIS_LOW_CONFIDENCE,
        'Insufficient symptom data for confident diagnosis',
        diagnosis.confidence,
        diagnosis.alternatives
      );
    }

    return NextResponse.json({
      success: true,
      data: diagnosis
    });

  } catch (error) {
    return handleError(error, context);
  }
}

/**
 * Example: Prescription Generation API Route
 * Validates drugs for interactions and allergies
 */
export async function prescriptionRoute(request: NextRequest) {
  try {
    const body = await request.json();
    const { prescription, patientId } = body;

    // Validate prescription
    const validation = await validatePrescription(prescription);

    if (!validation.isValid) {
      if (validation.type === 'interaction') {
        throw new PrescriptionError(
          ERROR_CODES.DRUG_INTERACTION,
          `Drug interaction detected between ${validation.drug1} and ${validation.drug2}`,
          validation.drug1,
          'drug-drug'
        );
      }

      if (validation.type === 'allergy') {
        throw new PrescriptionError(
          ERROR_CODES.ALLERGY_ALERT,
          `Patient has documented allergy to ${validation.drug}`,
          validation.drug,
          'drug-allergy'
        );
      }

      if (validation.type === 'contraindication') {
        throw new PrescriptionError(
          ERROR_CODES.CONTRAINDICATION,
          `${validation.drug} is contraindicated for patient's condition`,
          validation.drug,
          'drug-condition'
        );
      }
    }

    // Generate prescription
    const result = await generatePrescription(prescription);

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    return handleError(error, {
      route: '/api/prescription/generate',
      method: 'POST'
    });
  }
}

/**
 * Example: Appointment Booking API Route
 * Handles availability and conflict detection
 */
export async function appointmentBookingRoute(request: NextRequest) {
  const handler = createRouteHandler('/api/appointments/book', 'POST');

  // Get body first in outer scope
  const body = await request.json();
  const { doctorId, timeSlot, patientId } = body;

  return handler(async () => {
    // Check availability
    const availability = await checkDoctorAvailability(doctorId, timeSlot);

    if (!availability.isAvailable) {
      throw new AppointmentError(
        ERROR_CODES.APPOINTMENT_CONFLICT,
        'Selected time slot is no longer available',
        doctorId,
        timeSlot,
        'conflict'
      );
    }

    if (availability.reason === 'unavailable') {
      throw new AppointmentError(
        ERROR_CODES.DOCTOR_UNAVAILABLE,
        'Doctor is not available at the selected time',
        doctorId,
        timeSlot,
        'unavailable'
      );
    }

    // Book appointment
    const appointment = await bookAppointment({
      doctorId,
      patientId,
      timeSlot
    });

    return NextResponse.json({ success: true, data: appointment });

  }, { userId: patientId });
}

// ============================================
// CLIENT-SIDE EXAMPLES
// ============================================

/**
 * Example: React Component Error Handling
 * Note: This example has been commented out as it requires JSX (.tsx file).
 * To use, move this code to a .tsx file.
 */
// 'use client';
//
// import { useState } from 'react';
// import { handleClientError, createToastError } from '@/lib/errors';
// import { toast } from 'sonner';
//
// export function ConsultationForm() {
//   const [symptoms, setSymptoms] = useState('');
//
//   const handleSubmit = async () => {
//     try {
//       const response = await fetch('/api/ai/consult', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ symptoms })
//       });
//
//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error?.message || 'Consultation failed');
//       }
//
//       const result = await response.json();
//       toast.success('Consulta completada');
//
//     } catch (error) {
//       const toastError = createToastError(error);
//
//       if (toastError.variant === 'destructive') {
//         toast.error(toastError.title, {
//           description: toastError.description,
//           action: {
//             label: 'Llamar 911',
//             onClick: () => window.location.href = 'tel:911'
//           }
//         });
//       } else {
//         toast.warning(toastError.title, {
//           description: toastError.description
//         });
//       }
//     }
//   };
//
//   return (
//     <form onSubmit={handleSubmit}>
//       {/* Form fields */}
//     </form>
//   );
// }

// ============================================
// MIDDLEWARE EXAMPLES
// ============================================

/**
 * Example: Rate Limiting Middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  identifier: string
) {
  const limit = 10; // 10 requests per minute
  const window = 60; // 60 seconds

  const usage = await checkRateLimit(identifier, window);

  if (usage.count > limit) {
    throw new RateLimitError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      Math.ceil(usage.resetTime / 1000),
      limit
    );
  }

  await incrementRateLimit(identifier);
}

// ============================================
// HELPER FUNCTIONS (Stubs for examples)
// ============================================

interface EmergencyCheck {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
}

interface Diagnosis {
  confidence: number;
  alternatives: string[];
}

interface PrescriptionValidation {
  isValid: boolean;
  type?: 'interaction' | 'allergy' | 'contraindication';
  drug1?: string;
  drug2?: string;
  drug?: string;
}

interface DoctorAvailability {
  isAvailable: boolean;
  reason?: 'unavailable' | 'conflict' | 'past' | 'invalid';
}

async function checkForEmergencySymptoms(symptoms: string[]): Promise<EmergencyCheck> {
  // Implementation would check for chest pain, severe bleeding, etc.
  return {
    detected: false,
    severity: 'low',
    symptoms: []
  };
}

async function processDiagnosis(symptoms: string[]): Promise<Diagnosis> {
  // AI diagnosis logic
  return {
    confidence: 0.8,
    alternatives: []
  };
}

async function validatePrescription(prescription: unknown): Promise<PrescriptionValidation> {
  // Drug interaction checking
  return {
    isValid: true
  };
}

async function generatePrescription(prescription: unknown): Promise<Record<string, unknown>> {
  // Prescription generation
  return {};
}

async function checkDoctorAvailability(
  doctorId: string,
  timeSlot: string
): Promise<DoctorAvailability> {
  // Availability checking
  return {
    isAvailable: true
  };
}

async function bookAppointment(details: unknown): Promise<Record<string, unknown>> {
  // Booking logic
  return {};
}

async function checkRateLimit(identifier: string, window: number): Promise<{ count: number; resetTime: number }> {
  // Rate limit checking
  return { count: 0, resetTime: Date.now() + window * 1000 };
}

async function incrementRateLimit(identifier: string): Promise<void> {
  // Increment rate limit counter
}

// ============================================
// ERROR BOUNDARY EXAMPLE
// ============================================

/**
 * Example: Error Boundary Component
 * Note: This example has been commented out as it requires JSX (.tsx file).
 * To use, move this code to a .tsx file.
 */
// 'use client';
//
// import { Component, ReactNode } from 'react';
// import { getErrorInfo } from '@/lib/errors';
//
// interface Props {
//   children: ReactNode;
//   fallback?: ReactNode;
// }
//
// interface State {
//   hasError: boolean;
//   error?: Error;
// }
//
// export class MedicalErrorBoundary extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = { hasError: false };
//   }
//
//   static getDerivedStateFromError(error: Error): State {
//     return { hasError: true, error };
//   }
//
//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
//     const info = getErrorInfo(error);
//
//     // Log the error
//     logError(error, {
//       componentStack: errorInfo.componentStack,
//       timestamp: new Date().toISOString()
//     });
//
//     // If it's an emergency, show special UI
//     if (info.title.includes('Emergency')) {
//       // Navigate to emergency page
//       window.location.href = '/emergencia';
//     }
//   }
//
//   render() {
//     if (this.state.hasError) {
//       const info = getErrorInfo(this.state.error!);
//
//       return this.props.fallback || (
//         <div className="error-container">
//           <h2>{info.title}</h2>
//           <p>{info.message}</p>
//           {info.showRetry && (
//             <button onClick={() => window.location.reload()}>
//               Intentar nuevamente
//             </button>
//           )}
//           {info.showHome && (
//             <button onClick={() => window.location.href = '/'}>
//               Ir al inicio
//             </button>
//           )}
//         </div>
//       );
//     }
//
//     return this.props.children;
//   }
// }

// ============================================
// SERVICE LAYER EXAMPLES
// ============================================

/**
 * Example: AI Service with Error Handling
 */
export class AIService {
  async analyzeSymptoms(symptoms: string[], userId: string) {
    try {
      const analysis = await this.callAIAPI(symptoms);

      // Check for red flags
      const redFlags = analysis.redFlags as string[] | undefined
      if (Array.isArray(redFlags) && redFlags.length > 0) {
        throw new EmergencyDetectedError(
          ERROR_CODES.RED_FLAG_DETECTED,
          'Potential emergency symptoms detected',
          'high',
          redFlags
        );
      }

      return analysis;

    } catch (error) {
      if (error instanceof EmergencyDetectedError) {
        throw error; // Re-throw emergencies
      }

      throw new ExternalServiceError(
        ERROR_CODES.AI_SERVICE_ERROR,
        'AI service temporarily unavailable',
        'AI Service',
        error as Error
      );
    }
  }

  private async callAIAPI(symptoms: string[]): Promise<Record<string, unknown>> {
    // AI API call implementation
    return {};
  }
}

/**
 * Example: Prescription Service
 */
export class PrescriptionService {
  async validatePrescription(
    prescription: { medications: Array<{ name: string }> },
    patientAllergies: string[],
    patientConditions: string[]
  ) {
    // Check for allergies
    for (const drug of prescription.medications) {
      if (patientAllergies.includes(drug.name)) {
        throw new PrescriptionError(
          ERROR_CODES.ALLERGY_ALERT,
          `Patient has documented allergy to ${drug.name}`,
          drug.name,
          'drug-allergy'
        );
      }

      // Check for contraindications
      const contraindications = await this.checkContraindications(
        drug.name,
        patientConditions
      );

      if (contraindications.length > 0) {
        throw new PrescriptionError(
          ERROR_CODES.CONTRAINDICATION,
          `${drug.name} is contraindicated for patient's conditions`,
          drug.name,
          'drug-condition'
        );
      }
    }

    // Check for drug-drug interactions
    const interactions = await this.checkDrugInteractions(
      prescription.medications.map((m) => m.name)
    );

    if (interactions.length > 0) {
      throw new PrescriptionError(
        ERROR_CODES.DRUG_INTERACTION,
        `Drug interactions detected: ${interactions.join(', ')}`,
        interactions[0],
        'drug-drug'
      );
    }

    return { valid: true };
  }

  private async checkContraindications(drug: string, conditions: string[]): Promise<string[]> {
    // Contraindication checking logic
    return [];
  }

  private async checkDrugInteractions(drugs: string[]): Promise<string[]> {
    // Drug interaction checking logic
    return [];
  }
}

