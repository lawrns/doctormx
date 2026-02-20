'use client';

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/observability/logger';
import type {
  SpecialistAgent,
  ConsensusResult,
  SOAPPhaseStatus,
  ConsultationProgress,
} from '@/types/soap';
import type { SubjectiveData, SOAPConsultation } from '@/lib/soap/types';
import type { IntakeStep } from '../types';
import { SPECIALIST_AVATARS } from '../types';

interface StreamState {
  specialists: SpecialistAgent[];
  consensus: ConsensusResult | null;
  phases: SOAPPhaseStatus[];
  progress: ConsultationProgress | null;
}

interface UseAIStreamReturn extends StreamState {
  consultation: SOAPConsultation | null;
  initializeStream: () => void;
  processStream: (
    response: Response,
    subjectiveData: SubjectiveData,
    userId: string,
    onComplete: () => void,
    onError: (error: string | null) => void
  ) => Promise<void>;
  resetStream: () => void;
}

/**
 * Hook for managing AI stream processing
 * Handles SSE events, specialist updates, and consensus building
 */
export function useAIStream(): UseAIStreamReturn {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [specialists, setSpecialists] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [phases, setPhases] = useState<SOAPPhaseStatus[]>([]);
  const [progress, setProgress] = useState<ConsultationProgress | null>(null);
  const [consultation, setConsultation] = useState<SOAPConsultation | null>(null);
  
  // Use ref to track completed specialists during streaming
  const completedSpecialistIds = useRef<string[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
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

  const initializeStream = useCallback(() => {
    completedSpecialistIds.current = [];
    const initialSpecialists = initializeSpecialists();
    setSpecialists(initialSpecialists);
    
    setPhases([
      { phase: 'subjective', status: 'completed', timestamp: new Date() },
      { phase: 'objective', status: 'in-progress' },
      { phase: 'assessment', status: 'pending' },
      { phase: 'plan', status: 'pending' },
    ]);
    
    setProgress({
      currentPhase: 'assessment',
      activeAgents: ['gp', 'derm', 'int', 'psych'],
      completedAgents: [],
      totalAgents: 4,
      estimatedTimeRemaining: 60,
    });
  }, [initializeSpecialists]);

  const resetStream = useCallback(() => {
    completedSpecialistIds.current = [];
    setSpecialists([]);
    setConsensus(null);
    setPhases([]);
    setProgress(null);
    setConsultation(null);
  }, []);

  // ============================================================================
  // MAPPING FUNCTIONS
  // ============================================================================
  
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
    return mapping[level] ?? 'moderate';
  }, []);

  // ============================================================================
  // SSE PARSING
  // ============================================================================
  
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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  function handleSpecialistDone(
    eventData: Record<string, unknown>,
    mapRoleFn: (role: string) => string
  ) {
    const specialistId = mapRoleFn(eventData.specialist as string);
    completedSpecialistIds.current.push(specialistId);

    setSpecialists((prev) =>
      prev.map((s) =>
        s.id === specialistId
          ? {
              ...s,
              confidence: Math.round(((eventData.confidence as number) ?? 0.7) * 100),
              assessment: (eventData.diagnosis as string) ?? 'Evaluación completada',
              status: 'completed' as const,
            }
          : s
      )
    );

    setProgress((prev) =>
      prev
        ? {
            ...prev,
            completedAgents: [...completedSpecialistIds.current],
            activeAgents: prev.activeAgents.filter(
              (id) => !completedSpecialistIds.current.includes(id)
            ),
          }
        : null
    );
  }

  function handleConsensusDone(
    eventData: Record<string, unknown>,
    mapAgreementFn: (level: string) => ConsensusResult['level']
  ) {
    setPhases((prev) =>
      prev.map((p) =>
        p.phase === 'assessment'
          ? { ...p, status: 'completed', timestamp: new Date() }
          : p
      )
    );

    setConsensus({
      score: Math.round(((eventData.confidence as number) ?? 0.7) * 100),
      level: mapAgreementFn((eventData.agreementLevel as string) ?? 'moderate'),
      primaryDiagnosis: (eventData.primaryDiagnosis as string) ?? '',
      differentialDiagnoses: [],
      clinicalReasoning: `Urgencia: ${(eventData.urgencyLevel as string) ?? 'moderate'}`,
      agreementPercentage: Math.round(((eventData.confidence as number) ?? 0.7) * 100),
    });
  }

  function handlePlanDone() {
    setPhases((prev) =>
      prev.map((p) =>
        p.phase === 'plan'
          ? { ...p, status: 'completed', timestamp: new Date() }
          : p
      )
    );
  }

  function handleError(eventData: Record<string, unknown>) {
    throw new Error((eventData.error as string) ?? 'Error en consulta');
  }

  // ============================================================================
  // STREAM PROCESSING
  // ============================================================================
  
  const processStream = useCallback(async (
    response: Response,
    subjectiveData: SubjectiveData,
    userId: string,
    onComplete: (consultation: SOAPConsultation) => void,
    onError: (error: string) => void
  ) => {
    const reader = response.body?.getReader();
    if (!reader) {
      onError('No stream available');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let finalConsultation: SOAPConsultation | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const { eventName, eventData } = parseSSEEvent(eventBlock);
          if (!eventData) continue;

          switch (eventName) {
            case 'specialist_done':
              handleSpecialistDone(eventData, mapRoleToId);
              break;
            case 'consensus_done':
              handleConsensusDone(eventData, mapAgreementLevel);
              break;
            case 'plan_done':
              handlePlanDone();
              break;
            case 'complete':
              finalConsultation = buildFinalConsultation(eventData, subjectiveData, userId);
              break;
            case 'error':
              handleError(eventData);
              break;
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
        onComplete(finalConsultation);
      }

      setProgress(null);
    } catch (err) {
      logger.error('Stream processing error', { error: err });
      onError(err instanceof Error ? err.message : 'Error al procesar la consulta');
    } finally {
      reader.releaseLock();
    }
  }, [mapRoleToId, mapAgreementLevel]);

  // ============================================================================
  // BUILDERS
  // ============================================================================
  
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

  return {
    specialists,
    consensus,
    phases,
    progress,
    consultation,
    initializeStream,
    processStream,
    resetStream,
  };
}
