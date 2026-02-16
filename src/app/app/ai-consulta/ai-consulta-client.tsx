'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/observability/logger';
import { AnimatePresence } from 'framer-motion';
import { EmergencyModal } from '@/components/EmergencyAlert';
import type { AIConsultaClientProps } from './types';
import { useAiConsulta, useRedFlags } from './hooks';
import {
  WelcomeStep,
  ChiefComplaintStep,
  SymptomsStep,
  DurationStep,
  SeverityStep,
  OnsetStep,
  AssociatedSymptomsStep,
  FactorsStep,
  HistoryStep,
  ConsultingStep,
  ResultsStep,
  ErrorDisplay,
  ConsultaHeader,
  EmergencyBanner,
} from './components';

export function AIConsultaClient({ userId }: AIConsultaClientProps) {
  const {
    currentStep, formData, updateFormData, isSubmitting, error,
    consultation, specialists, consensus, phases, progress,
    nextStep, prevStep, submitConsultation,
  } = useAiConsulta(userId);

  const {
    emergencyDetected, showEmergencyModal, setShowEmergencyModal,
    checkForEmergencies, clearEmergency, shouldBlockSubmission,
  } = useRedFlags();

  useEffect(() => {
    checkForEmergencies(formData);
  }, [formData.chiefComplaint, formData.symptomsDescription, formData.associatedSymptoms]);

  const handleUpdate = (field: keyof typeof formData, value: string | number) => updateFormData(field, value);

  const handleSubmit = async () => {
    checkForEmergencies(formData);
    if (shouldBlockSubmission) { setShowEmergencyModal(true); return; }
    if (emergencyDetected?.detected) {
      logger.warn('[RED FLAG] Consultation submitted with detected red flags', {
        flags: emergencyDetected.flags, severity: emergencyDetected.highestSeverity,
        text: [formData.chiefComplaint, formData.symptomsDescription].join(' '),
      });
    }
    await submitConsultation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <ConsultaHeader />
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <EmergencyBanner emergency={emergencyDetected} onDismiss={clearEmergency} />
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && <WelcomeStep key="welcome" onNext={nextStep} />}
          {currentStep === 'chief-complaint' && (
            <ChiefComplaintStep key="chief-complaint" value={formData.chiefComplaint}
              onChange={(v) => handleUpdate('chiefComplaint', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'symptoms' && (
            <SymptomsStep key="symptoms" value={formData.symptomsDescription}
              onChange={(v) => handleUpdate('symptomsDescription', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'duration' && (
            <DurationStep key="duration" value={formData.symptomDuration}
              onChange={(v) => handleUpdate('symptomDuration', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'severity' && (
            <SeverityStep key="severity" value={formData.symptomSeverity}
              onChange={(v) => handleUpdate('symptomSeverity', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'onset' && (
            <OnsetStep key="onset" value={formData.onsetType}
              onChange={(v) => handleUpdate('onsetType', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'associated' && (
            <AssociatedSymptomsStep key="associated" value={formData.associatedSymptoms}
              onChange={(v) => handleUpdate('associatedSymptoms', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'factors' && (
            <FactorsStep key="factors" aggravating={formData.aggravatingFactors} relieving={formData.relievingFactors}
              onAggravatingChange={(v) => handleUpdate('aggravatingFactors', v)}
              onRelievingChange={(v) => handleUpdate('relievingFactors', v)} onNext={nextStep} onPrev={prevStep} />
          )}
          {currentStep === 'history' && (
            <HistoryStep key="history" value={formData.medicalHistory}
              onChange={(v) => handleUpdate('medicalHistory', v)} onNext={handleSubmit} onPrev={prevStep} isSubmitting={isSubmitting} />
          )}
          {currentStep === 'consulting' && (
            <ConsultingStep key="consulting" specialists={specialists} progress={progress} phases={phases} />
          )}
          {currentStep === 'results' && consultation && consensus && (
            <ResultsStep key="results" consultation={consultation} consensus={consensus} specialists={specialists} phases={phases} />
          )}
        </AnimatePresence>
        {error && <ErrorDisplay message={error} />}
      </main>
      {showEmergencyModal && emergencyDetected?.requiresEmergencyEscalation && (
        <EmergencyModal message={emergencyDetected.flags[0].message}
          symptoms={emergencyDetected.flags.map((f) => f.category)} severity="critical" />
      )}
    </div>
  );
}
