'use client';

import { useState, useCallback } from 'react';
import { detectRedFlagsEnhanced, type RedFlagResult } from '@/lib/ai/red-flags-enhanced';
import type { FormData, UseRedFlagsReturn } from '../types';

/**
 * Hook for detecting emergency red flags in patient input
 * Analyzes symptom text for critical emergency indicators
 */
export function useRedFlags(): UseRedFlagsReturn {
  const [emergencyDetected, setEmergencyDetected] = useState<RedFlagResult | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  /**
   * Check for emergency symptoms in form data
   * Combines all symptom-related fields for comprehensive checking
   */
  const checkForEmergencies = useCallback((data: FormData) => {
    const combinedText = [
      data.chiefComplaint,
      data.symptomsDescription,
      data.associatedSymptoms,
    ].join(' ');

    // Too short to analyze meaningfully
    if (combinedText.trim().length < 5) return;

    const result = detectRedFlagsEnhanced(combinedText);

    if (result.detected) {
      setEmergencyDetected(result);

      // Show modal for critical emergencies that require immediate escalation
      if (result.requiresEmergencyEscalation) {
        setShowEmergencyModal(true);
      }
    } else {
      setEmergencyDetected(null);
    }
  }, []);

  /**
   * Clear emergency state
   */
  const clearEmergency = useCallback(() => {
    setEmergencyDetected(null);
    setShowEmergencyModal(false);
  }, []);

  /**
   * Whether submission should be blocked due to critical emergency
   */
  const shouldBlockSubmission = emergencyDetected?.requiresEmergencyEscalation ?? false;

  return {
    emergencyDetected,
    showEmergencyModal,
    setShowEmergencyModal,
    checkForEmergencies,
    clearEmergency,
    shouldBlockSubmission,
  };
}
