'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import {
  SpecialistConsultation,
  ConsensusMatrix,
  SOAPTimeline,
  ConsultationProgress,
  ConversationalWelcome,
  EnhancedSeveritySlider,
  SymptomAutocomplete,
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
  ProgressStepper,
  useProgressSteps,
} from '@/components/soap';
import type {
  SpecialistAgent,
  ConsensusResult,
  SOAPPhaseStatus,
  ConsultationProgress as ConsultationProgressType,
} from '@/types/soap';
import type { SubjectiveData, SOAPConsultation } from '@/lib/soap/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

type IntakeStep =
  | 'welcome'
  | 'chief-complaint'
  | 'symptoms'
  | 'duration'
  | 'severity'
  | 'onset'
  | 'associated'
  | 'factors'
  | 'history'
  | 'consulting'
  | 'results';

interface FormData {
  chiefComplaint: string;
  symptomsDescription: string;
  symptomDuration: string;
  symptomSeverity: number;
  onsetType: 'sudden' | 'gradual' | null;
  associatedSymptoms: string;
  aggravatingFactors: string;
  relievingFactors: string;
  medicalHistory: string;
}

// ============================================================================
// PROPS
// ============================================================================

interface AIConsultaClientProps {
  userId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AIConsultaClient({ userId }: AIConsultaClientProps) {
  // Form state
  const [currentStep, setCurrentStep] = useState<IntakeStep>('welcome');
  const [formData, setFormData] = useState<FormData>({
    chiefComplaint: '',
    symptomsDescription: '',
    symptomDuration: '',
    symptomSeverity: 5,
    onsetType: null,
    associatedSymptoms: '',
    aggravatingFactors: '',
    relievingFactors: '',
    medicalHistory: '',
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [consultation, setConsultation] = useState<SOAPConsultation | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [phases, setPhases] = useState<SOAPPhaseStatus[]>([]);
  const [progress, setProgress] = useState<ConsultationProgressType | null>(null);

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const nextStep = () => {
    const steps: IntakeStep[] = [
      'welcome',
      'chief-complaint',
      'symptoms',
      'duration',
      'severity',
      'onset',
      'associated',
      'factors',
      'history',
      'consulting',
      'results',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: IntakeStep[] = [
      'welcome',
      'chief-complaint',
      'symptoms',
      'duration',
      'severity',
      'onset',
      'associated',
      'factors',
      'history',
      'consulting',
      'results',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const submitConsultation = async () => {
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

    // Build subjective data
    const subjectiveData: SubjectiveData = {
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
    };

    // Helper to create emoji avatar SVG data URL
    const createDoctorAvatar = (emoji: string, bgColor: string): string => {
      const svg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="50" fill="${bgColor}"/>
          <circle cx="50" cy="35" r="18" fill="#fff"/>
          <path d="M25 85 Q50 65 75 85" fill="#fff"/>
          <text x="50" y="52" font-family="Arial" font-size="28" text-anchor="middle" fill="#334155">${emoji}</text>
        </svg>
      `).replace(/%20/g, '').replace(/%2C/g, ',').replace(/%3A/g, ':').replace(/%3B/g, ';').replace(/%3D/g, '=').replace(/%3C/g, '<').replace(/%3E/g, '>').replace(/%22/g, '"').replace(/%2F/g, '/');
      return `data:image/svg+xml,${svg}`;
    };

    // Specialist avatars with emoji and color
    const specialistAvatars: Record<string, string> = {
      gp: createDoctorAvatar('🩺', '#3b82f6'),      // blue - general
      derm: createDoctorAvatar('🧴', '#a855f7'),    // purple - dermatology
      int: createDoctorAvatar('🧠', '#f59e0b'),     // amber - internal/neurology
      psych: createDoctorAvatar('💭', '#ec4899'),   // pink - psychology
    };

    // Initialize specialists in thinking state
    const initialSpecialists: SpecialistAgent[] = [
      {
        id: 'gp',
        name: 'Dr. Garcia',
        specialty: 'general',
        avatar: specialistAvatars.gp,
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
      {
        id: 'derm',
        name: 'Dra. Rodriguez',
        specialty: 'dermatology',
        avatar: specialistAvatars.derm,
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
      {
        id: 'int',
        name: 'Dr. Martinez',
        specialty: 'neurology',
        avatar: specialistAvatars.int,
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
      {
        id: 'psych',
        name: 'Dra. Lopez',
        specialty: 'psychology',
        avatar: specialistAvatars.psych,
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
    ];

    setSpecialists(initialSpecialists);
    setProgress({
      currentPhase: 'assessment',
      activeAgents: ['gp', 'derm', 'int', 'psych'],
      completedAgents: [],
      totalAgents: 4,
      estimatedTimeRemaining: 60,
    });

    try {
      // Use SSE streaming endpoint to avoid Vercel timeout
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

      // Process SSE stream with named events
      // SSE format: "event: eventName\ndata: {...}\n\n"
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let buffer = '';
      let finalConsultation: SOAPConsultation | null = null;

      // Track completed specialists for progress
      const completedSpecialistIds: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split by double newline (SSE event separator)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          // Parse SSE event format: "event: name\ndata: {...}"
          const lines = eventBlock.split('\n');
          let eventName = '';
          let eventData: any = null;

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

          if (!eventData) continue;

          try {
            switch (eventName) {
              case 'specialist_done':
                // Update specialist with real assessment
                const specialistId = mapRoleToId(eventData.specialist);
                completedSpecialistIds.push(specialistId);

                setSpecialists((prev) =>
                  prev.map((s) =>
                    s.id === specialistId
                      ? {
                          ...s,
                          confidence: Math.round((eventData.confidence || 0.7) * 100),
                          assessment: eventData.diagnosis || 'Evaluación completada',
                          status: 'completed' as const,
                        }
                      : s
                  )
                );

                // Update progress
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

              case 'consensus_done':
                setPhases((prev) =>
                  prev.map((p) =>
                    p.phase === 'assessment'
                      ? { ...p, status: 'completed', timestamp: new Date() }
                      : p
                  )
                );

                setConsensus({
                  score: Math.round((eventData.confidence || 0.7) * 100),
                  level: mapAgreementLevel(eventData.agreementLevel || 'moderate'),
                  primaryDiagnosis: eventData.primaryDiagnosis || '',
                  differentialDiagnoses: [],
                  clinicalReasoning: `Urgencia: ${eventData.urgencyLevel || 'moderate'}`,
                  agreementPercentage: Math.round((eventData.confidence || 0.7) * 100),
                });
                break;

              case 'plan_done':
                setPhases((prev) =>
                  prev.map((p) =>
                    p.phase === 'plan'
                      ? { ...p, status: 'completed', timestamp: new Date() }
                      : p
                  )
                );
                break;

              case 'complete':
                // Build consultation object from the complete event data
                finalConsultation = {
                  id: eventData.consultationId,
                  patientId: userId,
                  createdAt: new Date(),
                  completedAt: new Date(),
                  status: 'complete',
                  subjective: subjectiveData,
                  objective: {},
                  assessment: {
                    specialists: eventData.specialists || [],
                    consensus: eventData.consensus || null,
                  },
                  plan: eventData.plan || null,
                  metadata: {
                    totalTokens: 0,
                    totalCostUSD: 0,
                    totalLatencyMs: 0,
                    aiModel: 'glm-4-plus',
                  },
                } as SOAPConsultation;
                break;

              case 'error':
                throw new Error(eventData.error || 'Error en consulta');
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('Error')) {
              throw err;
            }
            console.warn('Failed to process SSE event:', eventName, eventData);
          }
        }
      }

      // Update phases
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
    } catch (err) {
      console.error('Consultation error:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la consulta');

      // Reset to form
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
  };

  const mapSpecialtyRoleToType = (role: string): SpecialistAgent['specialty'] => {
    const mapping: Record<string, SpecialistAgent['specialty']> = {
      'general-practitioner': 'general',
      'dermatologist': 'dermatology',
      'internist': 'neurology',
      'psychiatrist': 'psychology',
    };
    return mapping[role] || 'general';
  };

  const mapRoleToId = (role: string): string => {
    const mapping: Record<string, string> = {
      'general-practitioner': 'gp',
      'dermatologist': 'derm',
      'internist': 'int',
      'psychiatrist': 'psych',
    };
    return mapping[role] || role;
  };

  const mapAgreementLevel = (level: string): ConsensusResult['level'] => {
    const mapping: Record<string, ConsensusResult['level']> = {
      'strong': 'high',
      'moderate': 'moderate',
      'weak': 'low',
      'disagreement': 'low',
    };
    return mapping[level] || 'moderate';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Consulta Multi-Especialista</h1>
              <p className="text-xs text-gray-500">4 especialistas • Consenso médico IA</p>
            </div>
          </div>
          <Link
            href="/app"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <WelcomeStep key="welcome" onNext={nextStep} />
          )}

          {/* Chief Complaint */}
          {currentStep === 'chief-complaint' && (
            <ChiefComplaintStep
              key="chief-complaint"
              value={formData.chiefComplaint}
              onChange={(v) => updateFormData('chiefComplaint', v)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Symptoms Description */}
          {currentStep === 'symptoms' && (
            <SymptomsStep
              key="symptoms"
              value={formData.symptomsDescription}
              onChange={(v) => updateFormData('symptomsDescription', v)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Duration */}
          {currentStep === 'duration' && (
            <DurationStep
              key="duration"
              value={formData.symptomDuration}
              onChange={(v) => updateFormData('symptomDuration', v)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Severity */}
          {currentStep === 'severity' && (
            <SeverityStep
              key="severity"
              value={formData.symptomSeverity}
              onChange={(v) => updateFormData('symptomSeverity', v)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Onset Type */}
          {currentStep === 'onset' && (
            <OnsetStep
              key="onset"
              value={formData.onsetType}
              onChange={(v) => updateFormData('onsetType', v as 'sudden' | 'gradual')}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Associated Symptoms */}
          {currentStep === 'associated' && (
            <AssociatedSymptomsStep
              key="associated"
              value={formData.associatedSymptoms}
              onChange={(v) => updateFormData('associatedSymptoms', v)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Factors */}
          {currentStep === 'factors' && (
            <FactorsStep
              key="factors"
              aggravating={formData.aggravatingFactors}
              relieving={formData.relievingFactors}
              onAggravatingChange={(v) => updateFormData('aggravatingFactors', v)}
              onRelievingChange={(v) => updateFormData('relievingFactors', v)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}

          {/* Medical History */}
          {currentStep === 'history' && (
            <HistoryStep
              key="history"
              value={formData.medicalHistory}
              onChange={(v) => updateFormData('medicalHistory', v)}
              onNext={submitConsultation}
              onPrev={prevStep}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Consulting - Specialist Analysis */}
          {currentStep === 'consulting' && (
            <ConsultingStep
              key="consulting"
              specialists={specialists}
              progress={progress}
              phases={phases}
            />
          )}

          {/* Results */}
          {currentStep === 'results' && consultation && consensus && (
            <ResultsStep
              key="results"
              consultation={consultation}
              consensus={consensus}
              specialists={specialists}
              phases={phases}
            />
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96"
          >
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function WelcomeStep({
  onNext,
}: {
  onNext: () => void;
}) {
  return <ConversationalWelcome onStart={onNext} />;
}

function ChiefComplaintStep({
  value,
  onChange,
  onNext,
  onPrev,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const suggestions = [
    'Dolor de cabeza',
    'Dolor abdominal',
    'Dolor en el pecho',
    'Fiebre',
    'Náuseas',
    'Dolor de espalda',
    'Tos',
    'Fatiga',
  ];

  return (
    <QuestionCard step={1} totalSteps={9}>
      <QuestionTitle>¿Cuál es tu motivo principal?</QuestionTitle>
      <QuestionDescription>
        Describe brevemente qué te molesta
      </QuestionDescription>

      <div className="space-y-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Dolor de cabeza fuerte..."
          className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && onNext()}
        />

        <div>
          <p className="text-sm text-gray-500 mb-3 font-medium">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onChange(suggestion)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hover:shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value.trim().length > 0}
      />
    </QuestionCard>
  );
}

function SymptomsStep({
  value,
  onChange,
  onNext,
  onPrev,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <QuestionCard step={2} totalSteps={9}>
      <QuestionTitle>Cuéntame más sobre tus síntomas</QuestionTitle>
      <QuestionDescription>
        Describe con detalle lo que sientes
      </QuestionDescription>

      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe tus síntomas en detalle: ubicación, intensidad, tipo de dolor o molestia, qué sientes exactamente..."
          rows={6}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        />
        <p className="text-sm text-gray-500">
          {value.length} caracteres (mínimo 10)
        </p>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value.trim().length >= 10}
      />
    </QuestionCard>
  );
}

function DurationStep({
  value,
  onChange,
  onNext,
  onPrev,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const options = [
    'Menos de 1 hora',
    'Hoy',
    '1-2 días',
    '3-7 días',
    '1-2 semanas',
    'Más de 2 semanas',
    'Meses',
  ];

  return (
    <QuestionCard step={3} totalSteps={9}>
      <QuestionTitle>¿Cuánto tiempo tienes con estos síntomas?</QuestionTitle>
      <QuestionDescription>
        Selecciona la opción que mejor describa tu situación
      </QuestionDescription>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              value === option
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value.length > 0}
      />
    </QuestionCard>
  );
}

function SeverityStep({
  value,
  onChange,
  onNext,
  onPrev,
}: {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <QuestionCard step={5} totalSteps={9}>
      <QuestionTitle>¿Qué tan intenso es tu malestar?</QuestionTitle>
      <QuestionDescription>
        Del 1 (muy leve) al 10 (insoportable)
      </QuestionDescription>

      <EnhancedSeveritySlider
        value={value}
        onChange={onChange}
        min={1}
        max={10}
      />

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
      />
    </QuestionCard>
  );
}

function OnsetStep({
  value,
  onChange,
  onNext,
  onPrev,
}: {
  value: 'sudden' | 'gradual' | null;
  onChange: (v: 'sudden' | 'gradual') => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <QuestionCard step={6} totalSteps={9}>
      <QuestionTitle>¿Cómo empezaron tus síntomas?</QuestionTitle>
      <QuestionDescription>
        Esto ayuda a entender el posible origen
      </QuestionDescription>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all ${
            value === 'sudden'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => onChange('sudden')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">De golpe</h4>
            <p className="text-sm text-gray-600">Empezó repentinamente</p>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all ${
            value === 'gradual'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => onChange('gradual')}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Poco a poco</h4>
            <p className="text-sm text-gray-600">Empezó gradualmente</p>
          </div>
        </Card>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={value !== null}
      />
    </QuestionCard>
  );
}

function AssociatedSymptomsStep({
  value,
  onChange,
  onNext,
  onPrev,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <QuestionCard step={7} totalSteps={9}>
      <QuestionTitle>¿Tienes otros síntomas?</QuestionTitle>
      <QuestionDescription>
        Selecciona los que apliquen (opcional)
      </QuestionDescription>

      <SymptomAutocomplete
        value={value}
        onChange={onChange}
        placeholder="Escribe o selecciona síntomas adicionales..."
        suggestions={[
          'Fiebre',
          'Escalofríos',
          'Náuseas',
          'Vómitos',
          'Mareos',
          'Cansancio',
          'Pérdida de apetito',
          'Dolor muscular',
          'Dolor articular',
          'Erupción cutánea',
          'Tos seca',
          'Congestión nasal',
        ]}
      />

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
      />
    </QuestionCard>
  );
}

function FactorsStep({
  aggravating,
  relieving,
  onAggravatingChange,
  onRelievingChange,
  onNext,
  onPrev,
}: {
  aggravating: string;
  relieving: string;
  onAggravatingChange: (v: string) => void;
  onRelievingChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <QuestionCard step={8} totalSteps={9}>
      <QuestionTitle>¿Qué afecta tus síntomas?</QuestionTitle>
      <QuestionDescription>
        Esto ayuda a los especialistas a entenderte mejor
      </QuestionDescription>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué lo empeora? (opcional)
          </label>
          <input
            type="text"
            value={aggravating}
            onChange={(e) => onAggravatingChange(e.target.value)}
            placeholder="Ej: movimiento, comida, estrés..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué lo alivia? (opcional)
          </label>
          <input
            type="text"
            value={relieving}
            onChange={(e) => onRelievingChange(e.target.value)}
            placeholder="Ej: descanso, medicamentos, comida..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
      />
    </QuestionCard>
  );
}

function HistoryStep({
  value,
  onChange,
  onNext,
  onPrev,
  isSubmitting,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}) {
  return (
    <QuestionCard step={9} totalSteps={9}>
      <QuestionTitle>Antecedentes médicos (opcional)</QuestionTitle>
      <QuestionDescription>
        Información que pueda ayudar al diagnóstico
      </QuestionDescription>

      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Tengo hipertensión, tomo medicación para la tiroides, tuve apendicitis hace 5 años..."
          rows={5}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        />
      </div>

      <QuestionCardNavigation
        onPrev={onPrev}
        onNext={onNext}
        canNext={true}
        nextLabel="Iniciar Consulta"
        isSubmitting={isSubmitting}
      />

      <p className="text-center text-xs text-gray-500 mt-2">
        Los especialistas analizarán tu información en aproximadamente 60 segundos
      </p>
    </QuestionCard>
  );
}

function ConsultingStep({
  specialists,
  progress,
  phases,
}: {
  specialists: SpecialistAgent[];
  progress: ConsultationProgressType | null;
  phases: SOAPPhaseStatus[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-8 h-8 text-blue-600" />
          </motion.div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Consultando especialistas...
        </h3>
        <p className="text-gray-600">
          Los doctores están analizando tu caso
        </p>
      </div>

      {phases.length > 0 && <SOAPTimeline phases={phases} currentPhase="assessment" />}

      {progress && (
        <ConsultationProgress
          progress={progress}
          agentDetails={specialists.map((s) => ({
            id: s.id,
            name: s.name,
            avatar: s.avatar,
          }))}
        />
      )}

      <SpecialistConsultation agents={specialists} />

      <Card className="p-4 bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-800 text-center">
          Este proceso puede tardar hasta 60 segundos. Por favor espera...
        </p>
      </Card>
    </motion.div>
  );
}

function ResultsStep({
  consultation,
  consensus,
  specialists,
  phases,
}: {
  consultation: SOAPConsultation;
  consensus: ConsensusResult;
  specialists: SpecialistAgent[];
  phases: SOAPPhaseStatus[];
}) {
  const urgencyColors: Record<string, string> = {
    emergency: 'bg-red-500',
    urgent: 'bg-orange-500',
    moderate: 'bg-yellow-500',
    routine: 'bg-blue-500',
    'self-care': 'bg-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Consulta Completada</h2>
        <p className="text-green-50">
          {specialists.length} especialistas han analizado tu caso
        </p>
      </div>

      <SOAPTimeline phases={phases} currentPhase="plan" />

      {/* Urgency Badge */}
      <div className="flex justify-center">
        <Badge
          className={`px-6 py-2 text-white ${
            urgencyColors[consultation.assessment?.consensus.urgencyLevel || 'routine']
          }`}
        >
          Urgencia: {consultation.assessment?.consensus.urgencyLevel || 'routine'}
        </Badge>
      </div>

      <ConsensusMatrix consensus={consensus} />

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Evaluaciones de Especialistas
        </h3>
        <SpecialistConsultation agents={specialists} />
      </div>

      {/* Treatment Plan */}
      {consultation.plan && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Plan Recomendado</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Recomendaciones</h4>
              <ul className="space-y-2">
                {consultation.plan.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Autocuidado</h4>
              <ul className="space-y-2">
                {consultation.plan.selfCareInstructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Seguimiento:</strong> {consultation.plan.followUpTiming} (
                {consultation.plan.followUpType === 'in-person'
                  ? 'presencial'
                  : consultation.plan.followUpType === 'telemedicine'
                  ? 'telemedicina'
                  : 'a determinar'}
                )
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Book Appointment CTA */}
      {consultation.plan?.referralNeeded && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">¿Necesitas ver a un especialista?</h3>
          <p className="text-blue-50 mb-6">
            Agenda una cita con un especialista certificado
          </p>
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            <span>Buscar Especialista</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800 text-center">
          <strong>Aviso:</strong> Esta consulta es una orientación médica basada en IA.
          No sustituye la consulta presencial con un médico licenciado.
          En caso de emergencia, llama al 911.
        </p>
      </Card>

      <div className="flex gap-3">
        <Link href="/app" className="flex-1">
          <Button variant="outline" className="w-full">
            Volver al Inicio
          </Button>
        </Link>
        <Link href="/doctors" className="flex-1">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
            Buscar Doctor
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

