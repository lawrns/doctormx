'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/observability/logger';
import type {
  SpecialistAgent,
  ConsensusResult,
  SOAPPhaseStatus,
  ConsultationProgress,
} from '@/types/soap';
import type { SubjectiveData, SOAPConsultation } from '@/lib/soap/types';
import type {
  IntakeStep,
  FormData,
  UseAiConsultaReturn,
} from '../types';
import { INTAKE_STEPS, INITIAL_FORM_DATA, SPECIALIST_AVATARS } from '../types';

/**
 * Hook principal para manejar el estado y lógica de la consulta AI
 * Gestiona el flujo de pasos, datos del formulario y envío de consulta
 */
export function useAiConsulta(userId: string): UseAiConsultaReturn {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [currentStep, setCurrentStep] = useState<IntakeStep>('welcome');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results state
  const [consultation, setConsultation] = useState<SOAPConsultation | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [phases, setPhases] = useState<SOAPPhaseStatus[]>([]);
  const [progress, setProgress] = useState<ConsultationProgress | null>(null);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================
  
  const updateFormData = useCallback((field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // ============================================================================
  // NAVIGATION
  // ============================================================================
  
  const nextStep = useCallback(() => {
    const currentIndex = INTAKE_STEPS.indexOf(currentStep);
    if (currentIndex < INTAKE_STEPS.length - 1) {
      setCurrentStep(INTAKE_STEPS[currentIndex + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const currentIndex = INTAKE_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(INTAKE_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: IntakeStep) => {
    setCurrentStep(step);
  }, []);

  // ============================================================================
  // CONSULTATION SUBMISSION
  // ============================================================================
  
  const buildSubjectiveData = useCallback((): SubjectiveData => ({
    chiefComplaint: formData.chiefComplaint,
    symptomsDescription: formData.symptomsDescription,
    symptomDuration: formData.symptomDuration,
    symptomSeverity: formData.symptomSeverity,
    onsetType: formData.onsetType || 'gradual',
    associatedSymptoms: formData.associatedSymptoms
      ? formData.associatedSymptoms.split(',').map((s) => s.trim())
      : [],
    aggravatingFactors: formData.aggravatingFactors
      ? formData.aggravatingFactors.split(',').map((s) => s.trim())
      : [],
    relievingFactors: formData.relievingFactors
      ? formData.relievingFactors.split(',').map((s) => s.trim())
      : [],
    previousTreatments: [],
    medicalHistory: formData.medicalHistory || undefined,
  }), [formData]);

  const initializeSpecialists = useCallback((): SpecialistAgent[] => [
    {
      id: 'gp',
      name: 'Dr. Garcia',
      specialty: 'general',
      avatar: SPECIALIST_AVATARS.gp,
      confidence: 0,
      assessment: '',
      status: 'thinking',
    },
    {
      id: 'derm',
      name: 'Dra. Rodriguez',
      specialty: 'dermatology',
      avatar: SPECIALIST_AVATARS.derm,
      confidence: 0,
      assessment: '',
      status: 'thinking',
    },
    {
      id: 'int',
      name: 'Dr. Martinez',
      specialty: 'neurology',
      avatar: SPECIALIST_AVATARS.int,
      confidence: 0,
      assessment: '',
      status: 'thinking',
    },
    {
      id: 'psych',
      name: 'Dra. Lopez',
      specialty: 'psychology',
      avatar: SPECIALIST_AVATARS.psych,
      confidence: 0,
      assessment: '',
      status: 'thinking',
    },
  ], []);

  const mapRoleToId = useCallback((role: string): string => {
    const mapping: Record<string, string> = {
      'general-practitioner': 'gp',
      'dermatologist': 'derm',
      'internist': 'int',
      'psychiatrist': 'psych',
    };
    return mapping[role] || role;
  }, []);

  const mapAgreementLevel = useCallback((level: string): ConsensusResult['level'] => {
    const mapping: Record<string, ConsensusResult['level']> = {
      'strong': 'high',
      'moderate': 'moderate',
      'weak': 'low',
      'disagreement': 'low',
    };
    return mapping[level] || 'moderate';
  }, []);

  const resetConsultation = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep('welcome');
    setConsultation(null);
    setSpecialists([]);
    setConsensus(null);
    setPhases([]);
    setProgress(null);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const submitConsultation = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    // Initialize phases
    setPhases([
      { phase: 'subjective', status: 'completed', timestamp: new Date() },
      { phase: 'objective', status: 'in-progress' },
      { phase: 'assessment', status: 'pending' },
      { phase: 'plan', status: 'pending' },
    ]);

    setCurrentStep('consulting');

    const subjectiveData = buildSubjectiveData();
    const initialSpecialists = initializeSpecialists();
    setSpecialists(initialSpecialists);
    
    setProgress({
      currentPhase: 'assessment',
      activeAgents: ['gp', 'derm', 'int', 'psych'],
      completedAgents: [],
      totalAgents: 4,
      estimatedTimeRemaining: 60,
    });

    try {
      const response = await fetch('/api/soap/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userId,
          subjective: subjectiveData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en la consulta');
      }

      await processStream(response, subjectiveData, mapRoleToId, mapAgreementLevel);
    } catch (err) {
      logger.error('Consultation error', { error: err });
      setError(err instanceof Error ? err.message : 'Error al procesar la consulta');
      setCurrentStep('history');
      setSpecialists([]);
      setProgress(null);
      setPhases([
        { phase: 'subjective', status: 'in-progress' },
        { phase: 'objective', status: 'pending' },
        { phase: 'assessment', status: 'pending' },
        { phase: 'plan', status: 'pending' },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, buildSubjectiveData, initializeSpecialists, mapRoleToId, mapAgreementLevel]);

  /**
   * Process SSE stream from the API
   */
  async function processStream(
    response: Response,
    subjectiveData: SubjectiveData,
    mapRoleFn: (role: string) => string,
    mapAgreementFn: (level: string) => ConsensusResult['level']
  ) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream available');

    const decoder = new TextDecoder();
    let buffer = '';
    let finalConsultation: SOAPConsultation | null = null;
    const completedSpecialistIds: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        const { eventName, eventData } = parseSSEEvent(eventBlock);
        if (!eventData) continue;

        try {
          processSSEEvent(
            eventName,
            eventData,
            completedSpecialistIds,
            mapRoleFn,
            mapAgreementFn
          );

          if (eventName === 'complete') {
            finalConsultation = buildFinalConsultation(eventData, subjectiveData, userId);
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('Error')) {
            throw err;
          }
          logger.warn('Failed to process SSE event', { eventName, eventData });
        }
      }
    }

    // Update final state
    setPhases([
      { phase: 'subjective', status: 'completed', timestamp: new Date() },
      { phase: 'objective', status: 'completed', timestamp: new Date() },
      { phase: 'assessment', status: 'completed', timestamp: new Date() },
      { phase: 'plan', status: 'completed', timestamp: new Date() },
    ]);

    if (finalConsultation) {
      setConsultation(finalConsultation);
    }

    setProgress(null);
    setCurrentStep('results');
  }

  function parseSSEEvent(eventBlock: string): { eventName: string; eventData: Record<string, unknown> | null } {
    const lines = eventBlock.split('\n');
    let eventName = '';
    let eventData: Record<string, unknown> | null = null;

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventName = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        try {
          eventData = JSON.parse(line.slice(6).trim());
        } catch {
          // Non-JSON data, skip
        }
      }
    }

    return { eventName, eventData };
  }

  function processSSEEvent(
    eventName: string,
    eventData: Record<string, unknown>,
    completedSpecialistIds: string[],
    mapRoleFn: (role: string) => string,
    mapAgreementFn: (level: string) => ConsensusResult['level']
  ) {
    switch (eventName) {
      case 'specialist_done': {
        const specialistId = mapRoleFn(eventData.specialist as string);
        completedSpecialistIds.push(specialistId);

        setSpecialists((prev) =>
          prev.map((s) =>
            s.id === specialistId
              ? {
                  ...s,
                  confidence: Math.round(((eventData.confidence as number) || 0.7) * 100),
                  assessment: (eventData.diagnosis as string) || 'Evaluación completada',
                  status: 'completed' as const,
                }
              : s
          )
        );

        setProgress((prev) =>
          prev
            ? {
                ...prev,
                completedAgents: [...completedSpecialistIds],
                activeAgents: prev.activeAgents.filter(
                  (id) => !completedSpecialistIds.includes(id)
                ),
              }
            : null
        );
        break;
      }

      case 'consensus_done': {
        setPhases((prev) =>
          prev.map((p) =>
            p.phase === 'assessment'
              ? { ...p, status: 'completed', timestamp: new Date() }
              : p
          )
        );

        setConsensus({
          score: Math.round(((eventData.confidence as number) || 0.7) * 100),
          level: mapAgreementFn((eventData.agreementLevel as string) || 'moderate'),
          primaryDiagnosis: (eventData.primaryDiagnosis as string) || '',
          differentialDiagnoses: [],
          clinicalReasoning: `Urgencia: ${(eventData.urgencyLevel as string) || 'moderate'}`,
          agreementPercentage: Math.round(((eventData.confidence as number) || 0.7) * 100),
        });
        break;
      }

      case 'plan_done': {
        setPhases((prev) =>
          prev.map((p) =>
            p.phase === 'plan'
              ? { ...p, status: 'completed', timestamp: new Date() }
              : p
          )
        );
        break;
      }

      case 'error': {
        throw new Error((eventData.error as string) || 'Error en consulta');
      }
    }
  }

  function buildFinalConsultation(
    eventData: Record<string, unknown>,
    subjectiveData: SubjectiveData,
    patientId: string
  ): SOAPConsultation {
    return {
      id: eventData.consultationId as string,
      patientId,
      createdAt: new Date(),
      completedAt: new Date(),
      status: 'complete',
      subjective: subjectiveData,
      objective: {},
      assessment: {
        specialists: (eventData.specialists as SpecialistAgent[]) || [],
        consensus: eventData.consensus || null,
      },
      plan: eventData.plan || null,
      metadata: {
        totalTokens: 0,
        totalCostUSD: 0,
        totalLatencyMs: 0,
        aiModel: 'glm-4-plus',
      },
    } as unknown as SOAPConsultation;
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    currentStep,
    formData,
    updateFormData,
    isSubmitting,
    error,
    setError,
    consultation,
    specialists,
    consensus,
    phases,
    progress,
    nextStep,
    prevStep,
    goToStep,
    submitConsultation,
    resetConsultation,
  };
}
