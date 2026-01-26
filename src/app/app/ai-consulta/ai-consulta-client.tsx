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

    // Initialize specialists in thinking state
    const initialSpecialists: SpecialistAgent[] = [
      {
        id: 'gp',
        name: 'Dr. Garcia',
        specialty: 'general',
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
      {
        id: 'derm',
        name: 'Dra. Rodriguez',
        specialty: 'dermatology',
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
      {
        id: 'int',
        name: 'Dr. Martinez',
        specialty: 'neurology',
        confidence: 0,
        assessment: '',
        status: 'thinking',
      },
      {
        id: 'psych',
        name: 'Dra. Lopez',
        specialty: 'psychology',
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
      const response = await fetch('/api/soap/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userId,
          subjective: subjectiveData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la consulta');
      }

      const data = await response.json();

      // Update phases
      setPhases([
        { phase: 'subjective', status: 'completed', timestamp: new Date() },
        { phase: 'objective', status: 'completed', timestamp: new Date() },
        { phase: 'assessment', status: 'completed', timestamp: new Date() },
        { phase: 'plan', status: 'completed', timestamp: new Date() },
      ]);

      // Process specialists from API
      const apiSpecialists: SpecialistAgent[] =
        data.consultation.assessment?.specialists.map((spec: any) => ({
          id: spec.specialistId,
          name: spec.specialist.name,
          specialty: mapSpecialtyRoleToType(spec.specialistId),
          confidence: Math.round(spec.confidence * 100),
          assessment: spec.clinicalImpression,
          status: 'completed' as const,
        })) || [];

      setSpecialists(apiSpecialists);

      // Process consensus
      const apiConsensus = data.consultation.assessment?.consensus;
      if (apiConsensus) {
        const consensusResult: ConsensusResult = {
          score: Math.round(apiConsensus.kendallW * 100),
          level: mapAgreementLevel(apiConsensus.agreementLevel),
          primaryDiagnosis: apiConsensus.primaryDiagnosis?.name || '',
          differentialDiagnoses:
            apiConsensus.differentialDiagnoses?.map((d: any) => d.name) || [],
          clinicalReasoning: apiConsensus.supervisorSummary || '',
          agreementPercentage: Math.round(apiConsensus.kendallW * 100),
        };
        setConsensus(consensusResult);
      }

      setConsultation(data.consultation);
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
        <Users className="w-10 h-10 text-white" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Consulta Multi-Especialista
        </h2>
        <p className="text-gray-600">
          4 especialistas médicos analizarán tu caso con IA
        </p>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-100">
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Análisis simultáneo</p>
              <p className="text-sm text-gray-600">
                Varios especialistas evalúan tu caso al mismo tiempo
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Consenso médico</p>
              <p className="text-sm text-gray-600">
                Los especialistas reachan un diagnóstico conjunto
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Recomendaciones claras</p>
              <p className="text-sm text-gray-600">
                Plan de acción con próximos pasos específicos
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
        <p className="text-sm text-amber-800">
          <strong>Importante:</strong> Esta es una herramienta de orientación.
          En caso de emergencia, llama al 911.
        </p>
      </div>

      <Button
        onClick={onNext}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
      >
        Comenzar Consulta
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Cuál es tu motivo principal?
        </h3>
        <p className="text-gray-600">Describe brevemente qué te molesta</p>
      </div>

      <Card className="p-6">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Dolor de cabeza fuerte..."
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && onNext()}
        />

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onChange(suggestion)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={value.trim().length > 0} />
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Cuéntame más sobre tus síntomas
        </h3>
        <p className="text-gray-600">Describe con detalle lo que sientes</p>
      </div>

      <Card className="p-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe tus síntomas en detalle: ubicación, intensidad, tipo de dolor o molestia, qué sientes exactamente..."
          rows={6}
          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          {value.length} caracteres (mínimo 10)
        </p>
      </Card>

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={value.trim().length >= 10} />
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Cuánto tiempo tienes con estos síntomas?
        </h3>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`p-4 rounded-xl border-2 transition-all ${
                value === option
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </Card>

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={value.length > 0} />
    </motion.div>
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
  const labels = ['Muy leve', 'Leve', 'Moderado', 'Intenso', 'Muy intenso', 'Insoportable'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Qué tan intenso es tu malestar?
        </h3>
        <p className="text-gray-600">Del 1 (muy leve) al 10 (insoportable)</p>
      </div>

      <Card className="p-8">
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
          <div className="text-center">
            <span className="text-5xl font-bold text-blue-600">{value}</span>
            <span className="text-xl text-gray-500">/10</span>
          </div>
          <p className="text-center text-lg text-gray-700">{labels[value - 1] || ''}</p>
        </div>
      </Card>

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={true} />
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Cómo empezaron tus síntomas?
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all ${
            value === 'sudden'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
              : 'border-gray-200 hover:border-gray-300'
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
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
              : 'border-gray-200 hover:border-gray-300'
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

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={value !== null} />
    </motion.div>
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
  const suggestions = [
    'Fiebre',
    'Escalofríos',
    'Náuseas',
    'Vómitos',
    'Mareos',
    'Cansancio',
    'Pérdida de apetito',
    'Dolor muscular',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Tienes otros síntomas?
        </h3>
        <p className="text-gray-600">Selecciona los que apliquen (opcional)</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                const current = value ? value.split(',').map((s) => s.trim()) : [];
                if (current.includes(suggestion)) {
                  onChange(current.filter((s) => s !== suggestion).join(', '));
                } else {
                  onChange([...current, suggestion].join(', '));
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                value.includes(suggestion)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O escribe otros síntomas separados por coma..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={true} />
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Qué afecta tus síntomas?
        </h3>
        <p className="text-gray-600">Esto ayuda a los especialistas a entenderte mejor</p>
      </div>

      <Card className="p-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      <StepNavigation onPrev={onPrev} onNext={onNext} canNext={true} />
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Antecedentes médicos (opcional)
        </h3>
        <p className="text-gray-600">
          Información que pueda ayudar al diagnóstico
        </p>
      </div>

      <Card className="p-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Tengo hipertensión, tomo medicación para la tiroides, tuve apendicitis hace 5 años..."
          rows={5}
          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          Atrás
        </Button>
        <Button
          onClick={onNext}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Iniciar Consulta
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-gray-500">
        Los especialistas analizarán tu información en aproximadamente 60 segundos
      </p>
    </motion.div>
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

function StepNavigation({
  onPrev,
  onNext,
  canNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onPrev} className="flex-1">
        Atrás
      </Button>
      <Button
        onClick={onNext}
        disabled={!canNext}
        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
      >
        Continuar
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
