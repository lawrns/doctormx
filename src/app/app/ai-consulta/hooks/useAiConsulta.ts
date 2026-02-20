'use client';

import { useCallback } from 'react';
import { logger } from '@/lib/observability/logger';
import type { SubjectiveData } from '@/lib/soap/types';
import type { UseAiConsultaReturn } from '../types';
import { useConsultationState } from './useConsultationState';
import { useAIStream } from './useAIStream';

/**
 * Main hook for AI Consultation
 * Composes smaller hooks for state management and stream processing
 * Acts as an orchestrator coordinating form state, navigation, and AI integration
 */
export function useAiConsulta(userId: string): UseAiConsultaReturn {
  // ============================================================================
  // SUB-HOOKS
  // ============================================================================
  
  const {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    resetConsultation: resetState,
    startSubmission,
    finishSubmission,
    setSubmissionError,
    setCurrentStep,
  } = useConsultationState();

  const {
    specialists,
    consensus,
    phases,
    progress,
    consultation,
    initializeStream,
    processStream,
    resetStream,
  } = useAIStream();

  // ============================================================================
  // DATA BUILDERS
  // ============================================================================
  
  const buildSubjectiveData = useCallback((): SubjectiveData => ({
    chiefComplaint: formData.chiefComplaint,
    symptomsDescription: formData.symptomsDescription,
    symptomDuration: formData.symptomDuration,
    symptomSeverity: formData.symptomSeverity,
    onsetType: formData.onsetType ?? 'gradual',
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

  // ============================================================================
  // RESET
  // ============================================================================
  
  const resetConsultation = useCallback(() => {
    resetState();
    resetStream();
  }, [resetState, resetStream]);

  // ============================================================================
  // SUBMISSION
  // ============================================================================
  
  const submitConsultation = useCallback(async () => {
    startSubmission();
    initializeStream();
    setCurrentStep('consulting');

    const subjectiveData = buildSubjectiveData();

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
        throw new Error(errorText ?? 'Error en la consulta');
      }

      await processStream(
        response,
        subjectiveData,
        userId,
        () => {
          // On complete - consultation is already set in useAIStream
          setCurrentStep('results');
        },
        (err) => {
          // On error
          logger.error('Consultation error', { error: err });
          setSubmissionError(err);
          setCurrentStep('history');
          resetStream();
        }
      );
    } catch (err) {
      logger.error('Consultation submission error', { error: err });
      setSubmissionError(err instanceof Error ? err.message : 'Error al procesar la consulta');
      setCurrentStep('history');
      resetStream();
    } finally {
      finishSubmission();
    }
  }, [
    userId,
    buildSubjectiveData,
    startSubmission,
    finishSubmission,
    setSubmissionError,
    setCurrentStep,
    initializeStream,
    processStream,
    resetStream,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Form state
    currentStep,
    formData,
    updateFormData,
    
    // Loading state
    isSubmitting,
    error,
    setError: setSubmissionError,
    
    // Results state
    consultation,
    specialists,
    consensus,
    phases,
    progress,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    
    // Submission
    submitConsultation,
    resetConsultation,
  };
}
