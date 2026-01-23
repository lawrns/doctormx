/**
 * Medical Validation Service
 * Ensures AI responses meet medical safety standards
 */

import { EMERGENCY_SYMPTOMS, EMERGENCY_THRESHOLDS, MEDICAL_DISCLAIMERS } from '../../constants/medical-disclaimers';
import { EmergencyDetection } from '../../../brain/emergency-protocols';

export interface MedicalValidationResult {
  isValid: boolean;
  isSafe: boolean;
  requiresDisclaimer: boolean;
  disclaimers: string[];
  emergencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  validationErrors: string[];
  recommendations: string[];
}

export interface MedicalContext {
  symptoms: string[];
  patientAge?: number;
  patientConditions?: string[];
  aiResponse: string;
  suggestedMedications?: string[];
  confidence: number;
}

export class MedicalValidationService {
  private static instance: MedicalValidationService;

  private constructor() {}

  public static getInstance(): MedicalValidationService {
    if (!MedicalValidationService.instance) {
      MedicalValidationService.instance = new MedicalValidationService();
    }
    return MedicalValidationService.instance;
  }

  /**
   * Validate AI medical response
   */
  public validateResponse(context: MedicalContext): MedicalValidationResult {
    const result: MedicalValidationResult = {
      isValid: true,
      isSafe: true,
      requiresDisclaimer: true,
      disclaimers: [MEDICAL_DISCLAIMERS.GENERAL.es],
      emergencyLevel: 'none',
      validationErrors: [],
      recommendations: []
    };

    // Check emergency symptoms
    const emergencyCheck = this.checkEmergencySymptoms(context.symptoms);
    result.emergencyLevel = emergencyCheck.level;
    
    if (emergencyCheck.isEmergency) {
      result.disclaimers.push(MEDICAL_DISCLAIMERS.EMERGENCY.es);
      result.recommendations.push('Buscar atención médica inmediata');
    }

    // Validate confidence threshold
    if (context.confidence < 0.5) {
      result.validationErrors.push('Confianza del diagnóstico muy baja');
      result.isSafe = false;
      result.recommendations.push('Se requiere evaluación médica profesional');
    }

    // Check for dangerous recommendations
    const dangerousPatterns = this.checkDangerousPatterns(context.aiResponse);
    if (dangerousPatterns.length > 0) {
      result.validationErrors.push(...dangerousPatterns);
      result.isSafe = false;
    }

    // Validate medication suggestions
    if (context.suggestedMedications && context.suggestedMedications.length > 0) {
      const medValidation = this.validateMedications(
        context.suggestedMedications,
        context.patientAge,
        context.patientConditions
      );
      
      if (!medValidation.isSafe) {
        result.validationErrors.push(...medValidation.errors);
        result.isSafe = false;
      }
      
      result.disclaimers.push(MEDICAL_DISCLAIMERS.PRESCRIPTION.es);
    }

    // Age-specific validations
    if (context.patientAge !== undefined) {
      const ageValidation = this.validateAgeSpecific(context.patientAge, context);
      if (ageValidation.requiresSpecialCare) {
        result.disclaimers.push(...ageValidation.disclaimers);
        result.recommendations.push(...ageValidation.recommendations);
      }
    }

    // Add liability protection
    result.disclaimers.push(MEDICAL_DISCLAIMERS.AI_LIMITATION.es);
    result.disclaimers.push(MEDICAL_DISCLAIMERS.NO_DIAGNOSIS.es);

    return result;
  }

  /**
   * Check for emergency symptoms
   */
  private checkEmergencySymptoms(symptoms: string[]): {
    isEmergency: boolean;
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  } {
    const symptomsText = symptoms.join(' ').toLowerCase();
    
    // Check immediate emergency symptoms
    for (const emergencySymptom of EMERGENCY_SYMPTOMS.IMMEDIATE) {
      if (symptomsText.includes(emergencySymptom.toLowerCase())) {
        return { isEmergency: true, level: 'critical' };
      }
    }

    // Check urgent symptoms
    for (const urgentSymptom of EMERGENCY_SYMPTOMS.URGENT) {
      if (symptomsText.includes(urgentSymptom.toLowerCase())) {
        return { isEmergency: true, level: 'high' };
      }
    }

    // Count concerning symptoms
    const concerningSymptoms = [
      'dolor severo', 'dolor intenso', 'sangrado', 'fiebre alta',
      'confusion', 'debilidad', 'entumecimiento'
    ];
    
    const concernCount = concerningSymptoms.filter(s => 
      symptomsText.includes(s)
    ).length;

    if (concernCount >= 3) {
      return { isEmergency: false, level: 'medium' };
    } else if (concernCount >= 1) {
      return { isEmergency: false, level: 'low' };
    }

    return { isEmergency: false, level: 'none' };
  }

  /**
   * Check for dangerous patterns in AI response
   */
  private checkDangerousPatterns(response: string): string[] {
    const errors: string[] = [];
    const dangerousPatterns = [
      {
        pattern: /no es necesario.*médico|no necesita.*doctor|no requiere.*atención/i,
        error: 'La respuesta desalienta la búsqueda de atención médica'
      },
      {
        pattern: /definitivamente tiene|seguramente es|sin duda es/i,
        error: 'La respuesta proporciona diagnósticos definitivos sin evaluación médica'
      },
      {
        pattern: /tome.*mg|administre.*dosis|inyecte/i,
        error: 'La respuesta proporciona dosis específicas sin supervisión médica'
      },
      {
        pattern: /ignore.*síntomas|no se preocupe por/i,
        error: 'La respuesta minimiza síntomas potencialmente graves'
      },
      {
        pattern: /suspenda.*medicamento|deje de tomar/i,
        error: 'La respuesta sugiere suspender medicamentos sin consulta médica'
      }
    ];

    dangerousPatterns.forEach(({ pattern, error }) => {
      if (pattern.test(response)) {
        errors.push(error);
      }
    });

    return errors;
  }

  /**
   * Validate medication suggestions
   */
  private validateMedications(
    medications: string[],
    patientAge?: number,
    conditions?: string[]
  ): { isSafe: boolean; errors: string[] } {
    const errors: string[] = [];
    let isSafe = true;

    // Check for controlled substances
    const controlledSubstances = [
      'morfina', 'oxicodona', 'fentanilo', 'tramadol', 'codeina',
      'diazepam', 'alprazolam', 'clonazepam', 'lorazepam'
    ];

    medications.forEach(med => {
      const medLower = med.toLowerCase();
      
      if (controlledSubstances.some(cs => medLower.includes(cs))) {
        errors.push(`${med} es una sustancia controlada que requiere receta médica especial`);
        isSafe = false;
      }
    });

    // Pediatric considerations
    if (patientAge !== undefined && patientAge < 18) {
      const notForChildren = ['aspirina', 'ibuprofeno'];
      medications.forEach(med => {
        if (notForChildren.some(nfc => med.toLowerCase().includes(nfc))) {
          errors.push(`${med} requiere precaución especial en pacientes pediátricos`);
        }
      });
    }

    // Check for condition-specific contraindications
    if (conditions && conditions.length > 0) {
      const contraindicationMap: Record<string, string[]> = {
        'diabetes': ['corticosteroides', 'prednisona'],
        'hipertension': ['pseudoefedrina', 'fenilefrina'],
        'asma': ['betabloqueadores', 'propranolol']
      };

      conditions.forEach(condition => {
        const contraindicated = contraindicationMap[condition.toLowerCase()] || [];
        medications.forEach(med => {
          if (contraindicated.some(ci => med.toLowerCase().includes(ci))) {
            errors.push(`${med} puede estar contraindicado en pacientes con ${condition}`);
            isSafe = false;
          }
        });
      });
    }

    return { isSafe, errors };
  }

  /**
   * Age-specific validations
   */
  private validateAgeSpecific(age: number, context: MedicalContext): {
    requiresSpecialCare: boolean;
    disclaimers: string[];
    recommendations: string[];
  } {
    const result = {
      requiresSpecialCare: false,
      disclaimers: [] as string[],
      recommendations: [] as string[]
    };

    // Pediatric patients
    if (age < 18) {
      result.requiresSpecialCare = true;
      result.disclaimers.push(MEDICAL_DISCLAIMERS.PEDIATRIC.es);
      
      if (age < 2) {
        result.recommendations.push('Los bebés requieren evaluación pediátrica inmediata');
      } else if (age < 5) {
        result.recommendations.push('Los niños pequeños requieren evaluación pediátrica especializada');
      }
    }

    // Geriatric patients
    if (age > 65) {
      result.requiresSpecialCare = true;
      result.recommendations.push('Los adultos mayores pueden requerir ajuste de dosis');
      result.recommendations.push('Considerar interacciones con medicamentos existentes');
    }

    // Neonates
    if (age < 0.25) { // Less than 3 months
      result.requiresSpecialCare = true;
      result.recommendations.push('URGENTE: Los neonatos requieren atención pediátrica inmediata');
      
      // Check for fever in neonate
      const symptoms = context.symptoms.join(' ').toLowerCase();
      if (symptoms.includes('fiebre')) {
        result.recommendations.push('⚠️ EMERGENCIA: Fiebre en neonato requiere evaluación inmediata');
      }
    }

    return result;
  }

  /**
   * Format validation report
   */
  public formatValidationReport(validation: MedicalValidationResult): string {
    let report = '';

    if (validation.emergencyLevel === 'critical') {
      report += '🚨 EMERGENCIA MÉDICA DETECTADA 🚨\n';
      report += 'Llame al 911 o acuda al hospital más cercano INMEDIATAMENTE\n\n';
    }

    if (!validation.isSafe) {
      report += '⚠️ ADVERTENCIA DE SEGURIDAD:\n';
      validation.validationErrors.forEach(error => {
        report += `• ${error}\n`;
      });
      report += '\n';
    }

    if (validation.recommendations.length > 0) {
      report += '📋 RECOMENDACIONES:\n';
      validation.recommendations.forEach(rec => {
        report += `• ${rec}\n`;
      });
      report += '\n';
    }

    if (validation.disclaimers.length > 0) {
      report += '📄 AVISOS IMPORTANTES:\n';
      // Remove duplicates
      const uniqueDisclaimers = [...new Set(validation.disclaimers)];
      uniqueDisclaimers.forEach(disclaimer => {
        report += `• ${disclaimer}\n`;
      });
    }

    return report;
  }
}

// Export singleton instance
export const medicalValidationService = MedicalValidationService.getInstance();