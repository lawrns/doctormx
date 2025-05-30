/**
 * PractitionerValidationService - Medical professional validation workflow
 * Manages practitioner credentials, verification, and approval process
 */

import { loggingService } from './LoggingService';

interface PractitionerCredential {
  type: 'medical_license' | 'specialty_certification' | 'university_degree' | 'professional_membership';
  issuer: string;
  number: string;
  issuedDate: Date;
  expiryDate?: Date;
  verified: boolean;
  verificationDate?: Date;
}

interface PractitionerProfile {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePhoto?: string;
  };
  professionalInfo: {
    specialty: string[];
    experience: number; // years
    education: string[];
    languages: string[];
    consultationTypes: ('in_person' | 'telehealth' | 'chat' | 'phone')[];
  };
  credentials: PractitionerCredential[];
  verification: {
    status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'suspended';
    submittedDate: Date;
    reviewedDate?: Date;
    reviewedBy?: string;
    verificationLevel: 'basic' | 'standard' | 'premium';
    notes?: string;
  };
  mexicanContext: {
    cedulaProfesional?: string;
    especialidadRegistrada?: string;
    institucionEducativa?: string;
    colegioMedico?: string;
  };
}

interface ValidationWorkflow {
  id: string;
  practitionerId: string;
  steps: ValidationStep[];
  currentStepIndex: number;
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  startDate: Date;
  completedDate?: Date;
}

interface ValidationStep {
  id: string;
  name: string;
  description: string;
  type: 'document_upload' | 'verification_call' | 'reference_check' | 'background_check' | 'approval';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  required: boolean;
  estimatedDuration: number; // days
  completedDate?: Date;
  notes?: string;
  documents?: string[];
}

export class PractitionerValidationService {
  private static instance: PractitionerValidationService;
  
  // Mock data storage
  private practitionerProfiles: Map<string, PractitionerProfile> = new Map();
  private validationWorkflows: Map<string, ValidationWorkflow> = new Map();

  static getInstance(): PractitionerValidationService {
    if (!PractitionerValidationService.instance) {
      PractitionerValidationService.instance = new PractitionerValidationService();
      PractitionerValidationService.instance.initializeMockData();
    }
    return PractitionerValidationService.instance;
  }

  /**
   * Submit practitioner application
   */
  async submitPractitionerApplication(
    userId: string,
    applicationData: Omit<PractitionerProfile, 'id' | 'userId' | 'verification'>
  ): Promise<string> {
    try {
      const profile: PractitionerProfile = {
        id: `practitioner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        ...applicationData,
        verification: {
          status: 'pending',
          submittedDate: new Date(),
          verificationLevel: 'basic'
        }
      };

      this.practitionerProfiles.set(profile.id, profile);

      // Create validation workflow
      const workflowId = await this.createValidationWorkflow(profile.id);

      loggingService.info('PractitionerValidationService', 'Application submitted', {
        practitionerId: profile.id,
        userId,
        workflowId
      });

      return profile.id;

    } catch (error) {
      loggingService.error(
        'PractitionerValidationService',
        'Failed to submit application',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to submit practitioner application');
    }
  }

  /**
   * Get practitioner profile
   */
  getPractitionerProfile(practitionerId: string): PractitionerProfile | null {
    return this.practitionerProfiles.get(practitionerId) || null;
  }

  /**
   * Get validation workflow
   */
  getValidationWorkflow(practitionerId: string): ValidationWorkflow | null {
    return Array.from(this.validationWorkflows.values())
      .find(w => w.practitionerId === practitionerId) || null;
  }

  /**
   * Get all pending verifications (for admin)
   */
  getPendingVerifications(): PractitionerProfile[] {
    return Array.from(this.practitionerProfiles.values())
      .filter(p => p.verification.status === 'pending' || p.verification.status === 'in_review');
  }

  /**
   * Update verification status
   */
  async updateVerificationStatus(
    practitionerId: string,
    status: PractitionerProfile['verification']['status'],
    reviewerId: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const profile = this.practitionerProfiles.get(practitionerId);
      if (!profile) {
        throw new Error('Practitioner not found');
      }

      profile.verification.status = status;
      profile.verification.reviewedDate = new Date();
      profile.verification.reviewedBy = reviewerId;
      if (notes) {
        profile.verification.notes = notes;
      }

      // Update workflow
      const workflow = this.getValidationWorkflow(practitionerId);
      if (workflow) {
        if (status === 'verified') {
          workflow.status = 'completed';
          workflow.completedDate = new Date();
        } else if (status === 'rejected') {
          workflow.status = 'failed';
        }
      }

      loggingService.info('PractitionerValidationService', 'Verification status updated', {
        practitionerId,
        status,
        reviewerId
      });

      return true;

    } catch (error) {
      loggingService.error(
        'PractitionerValidationService',
        'Failed to update verification status',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Create validation workflow
   */
  private async createValidationWorkflow(practitionerId: string): Promise<string> {
    const workflow: ValidationWorkflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      practitionerId,
      currentStepIndex: 0,
      status: 'in_progress',
      startDate: new Date(),
      steps: [
        {
          id: 'document_upload',
          name: 'Subida de Documentos',
          description: 'Subir cédula profesional, certificados y títulos',
          type: 'document_upload',
          status: 'pending',
          required: true,
          estimatedDuration: 1
        },
        {
          id: 'document_review',
          name: 'Revisión de Documentos',
          description: 'Verificación de autenticidad de documentos',
          type: 'verification_call',
          status: 'pending',
          required: true,
          estimatedDuration: 3
        },
        {
          id: 'reference_check',
          name: 'Verificación de Referencias',
          description: 'Contacto con instituciones educativas y colegios médicos',
          type: 'reference_check',
          status: 'pending',
          required: true,
          estimatedDuration: 5
        },
        {
          id: 'interview',
          name: 'Entrevista Profesional',
          description: 'Entrevista con equipo médico de DoctorMX',
          type: 'verification_call',
          status: 'pending',
          required: true,
          estimatedDuration: 2
        },
        {
          id: 'final_approval',
          name: 'Aprobación Final',
          description: 'Decisión final y activación de cuenta',
          type: 'approval',
          status: 'pending',
          required: true,
          estimatedDuration: 1
        }
      ]
    };

    this.validationWorkflows.set(workflow.id, workflow);
    return workflow.id;
  }

  /**
   * Get validation requirements for Mexico
   */
  getMexicanValidationRequirements(): {
    required: string[];
    recommended: string[];
    process: string[];
  } {
    return {
      required: [
        'Cédula Profesional emitida por la Secretaría de Educación Pública (SEP)',
        'Título universitario de medicina o especialidad',
        'Registro en colegio médico estatal o nacional',
        'Identificación oficial vigente',
        'Comprobante de domicilio'
      ],
      recommended: [
        'Certificaciones de especialidad',
        'Cursos de educación médica continua',
        'Membresías en asociaciones médicas',
        'Referencias profesionales',
        'Carta de no antecedentes penales'
      ],
      process: [
        'Registro inicial en plataforma',
        'Subida de documentos requeridos',
        'Verificación automática inicial',
        'Revisión manual por equipo médico',
        'Verificación con instituciones oficiales',
        'Entrevista profesional (opcional)',
        'Aprobación final y activación'
      ]
    };
  }

  /**
   * Initialize mock data
   */
  private initializeMockData(): void {
    // Mock practitioner profile
    const mockProfile: PractitionerProfile = {
      id: 'practitioner_demo_1',
      userId: 'user_doctor_1',
      personalInfo: {
        firstName: 'Dr. María',
        lastName: 'González López',
        email: 'maria.gonzalez@example.com',
        phone: '+52 55 1234 5678'
      },
      professionalInfo: {
        specialty: ['Medicina General', 'Medicina Familiar'],
        experience: 8,
        education: ['Universidad Nacional Autónoma de México (UNAM)', 'Residencia en Medicina Familiar - IMSS'],
        languages: ['Español', 'Inglés'],
        consultationTypes: ['in_person', 'telehealth', 'chat']
      },
      credentials: [
        {
          type: 'medical_license',
          issuer: 'Secretaría de Educación Pública',
          number: '12345678',
          issuedDate: new Date('2015-06-15'),
          verified: true,
          verificationDate: new Date('2024-01-15')
        },
        {
          type: 'specialty_certification',
          issuer: 'Consejo Mexicano de Medicina Familiar',
          number: 'CMMF-2018-001234',
          issuedDate: new Date('2018-03-20'),
          expiryDate: new Date('2028-03-20'),
          verified: true,
          verificationDate: new Date('2024-01-15')
        }
      ],
      verification: {
        status: 'verified',
        submittedDate: new Date('2024-01-10'),
        reviewedDate: new Date('2024-01-15'),
        reviewedBy: 'admin_reviewer_1',
        verificationLevel: 'standard',
        notes: 'Perfil completo y documentación verificada correctamente'
      },
      mexicanContext: {
        cedulaProfesional: '12345678',
        especialidadRegistrada: 'Medicina Familiar',
        institucionEducativa: 'Universidad Nacional Autónoma de México',
        colegioMedico: 'Colegio de Médicos del Distrito Federal'
      }
    };

    this.practitionerProfiles.set(mockProfile.id, mockProfile);

    // Mock validation workflow
    const mockWorkflow: ValidationWorkflow = {
      id: 'workflow_demo_1',
      practitionerId: 'practitioner_demo_1',
      currentStepIndex: 5,
      status: 'completed',
      startDate: new Date('2024-01-10'),
      completedDate: new Date('2024-01-15'),
      steps: [
        {
          id: 'document_upload',
          name: 'Subida de Documentos',
          description: 'Subir cédula profesional, certificados y títulos',
          type: 'document_upload',
          status: 'completed',
          required: true,
          estimatedDuration: 1,
          completedDate: new Date('2024-01-10'),
          documents: ['cedula_profesional.pdf', 'titulo_medicina.pdf', 'certificado_especialidad.pdf']
        },
        {
          id: 'document_review',
          name: 'Revisión de Documentos',
          description: 'Verificación de autenticidad de documentos',
          type: 'verification_call',
          status: 'completed',
          required: true,
          estimatedDuration: 3,
          completedDate: new Date('2024-01-12'),
          notes: 'Documentos verificados con SEP y UNAM'
        },
        {
          id: 'reference_check',
          name: 'Verificación de Referencias',
          description: 'Contacto con instituciones educativas y colegios médicos',
          type: 'reference_check',
          status: 'completed',
          required: true,
          estimatedDuration: 5,
          completedDate: new Date('2024-01-14'),
          notes: 'Referencias confirmadas con IMSS y Colegio de Médicos'
        },
        {
          id: 'interview',
          name: 'Entrevista Profesional',
          description: 'Entrevista con equipo médico de DoctorMX',
          type: 'verification_call',
          status: 'completed',
          required: true,
          estimatedDuration: 2,
          completedDate: new Date('2024-01-15'),
          notes: 'Entrevista satisfactoria, excelente comunicación y conocimientos'
        },
        {
          id: 'final_approval',
          name: 'Aprobación Final',
          description: 'Decisión final y activación de cuenta',
          type: 'approval',
          status: 'completed',
          required: true,
          estimatedDuration: 1,
          completedDate: new Date('2024-01-15'),
          notes: 'Aprobado para nivel estándar con todas las funcionalidades'
        }
      ]
    };

    this.validationWorkflows.set(mockWorkflow.id, mockWorkflow);
  }
}

export const practitionerValidationService = PractitionerValidationService.getInstance();