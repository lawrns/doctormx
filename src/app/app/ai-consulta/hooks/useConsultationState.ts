'use client';

import { useState, useCallback } from 'react';
import type { IntakeStep, FormData, UseAiConsultaReturn } from '../types';
import { INTAKE_STEPS, INITIAL_FORM_DATA } from '../types';

/**
 * Hook for managing consultation form state and navigation
 * Handles step transitions, form data updates, and reset functionality
 */
export function useConsultationState() {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [currentStep, setCurrentStep] = useState<IntakeStep>('welcome');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  // RESET
  // ============================================================================
  
  const resetConsultation = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep('welcome');
    setError(null);
    setIsSubmitting(false);
  }, []);

  // ============================================================================
  // SUBMISSION STATE
  // ============================================================================
  
  const startSubmission = useCallback(() => {
    setIsSubmitting(true);
    setError(null);
  }, []);

  const finishSubmission = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  const setSubmissionError = useCallback((err: string | null) => {
    setError(err);
    if (err) setIsSubmitting(false);
  }, []);

  return {
    // State
    currentStep,
    formData,
    isSubmitting,
    error,
    
    // Actions
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    resetConsultation,
    startSubmission,
    finishSubmission,
    setSubmissionError,
    setCurrentStep,
    setError,
  };
}
