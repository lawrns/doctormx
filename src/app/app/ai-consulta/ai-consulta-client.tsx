'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Baby,
  Brain,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Loader2,
  Send,
  Smile,
  Sparkles,
  Stethoscope,
  Wind,
  Zap,
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
import { EmergencyAlert, EmergencyModal } from '@/components/EmergencyAlert';
import { detectRedFlagsEnhanced, type RedFlagResult } from '@/lib/ai/red-flags-enhanced';
import { RecommendedDoctors } from '@/components/soap/RecommendedDoctors';
import { TreatmentPlanDisplay } from '@/components/soap/TreatmentPlanDisplay';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

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

type ConsultStage = 'intake' | 'analyzing' | 'consensus' | 'generating' | 'complete' | 'error';

type ReasoningStepStatus = 'pending' | 'active' | 'done';

interface ReasoningStep {
  id: string;
  label: string;
  status: ReasoningStepStatus;
}

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

interface AIConsultaClientProps {
  userId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STEPS_ORDER: IntakeStep[] = [
  'welcome', 'chief-complaint', 'symptoms', 'duration', 'severity',
  'onset', 'associated', 'factors', 'history', 'consulting', 'results',
];

const STEP_META: Record<IntakeStep, { question: string; getAnswer: (f: FormData) => string }> = {
  'welcome':           { question: '', getAnswer: () => '' },
  'chief-complaint':   { question: '¿Cuál es tu motivo principal de consulta?', getAnswer: f => f.chiefComplaint },
  'symptoms':          { question: '¿Cómo describes tus síntomas?', getAnswer: f => f.symptomsDescription },
  'duration':          { question: '¿Cuánto tiempo llevas con estos síntomas?', getAnswer: f => f.symptomDuration },
  'severity':          { question: '¿Qué tan intenso es tu malestar?', getAnswer: f => `${f.symptomSeverity}/10` },
  'onset':             { question: '¿Cómo comenzaron tus síntomas?', getAnswer: f => f.onsetType === 'sudden' ? 'De repente' : f.onsetType === 'gradual' ? 'Gradualmente' : '' },
  'associated':        { question: '¿Tienes otros síntomas asociados?', getAnswer: f => f.associatedSymptoms || 'Ninguno adicional' },
  'factors':           { question: '¿Qué afecta tus síntomas?', getAnswer: f => [f.aggravatingFactors && `Empeora: ${f.aggravatingFactors}`, f.relievingFactors && `Alivia: ${f.relievingFactors}`].filter(Boolean).join(' · ') || 'Sin factores identificados' },
  'history':           { question: 'Antecedentes médicos relevantes', getAnswer: f => f.medicalHistory || 'Sin antecedentes' },
  'consulting':        { question: '', getAnswer: () => '' },
  'results':           { question: '', getAnswer: () => '' },
};

const INITIAL_REASONING_STEPS: ReasoningStep[] = [
  { id: 'symptoms',    label: 'Reconocimiento de síntomas',    status: 'pending' },
  { id: 'severity',    label: 'Evaluación de gravedad',        status: 'pending' },
  { id: 'specialty',   label: 'Detección de especialidad',     status: 'pending' },
  { id: 'redflags',    label: 'Verificación de señales alerta', status: 'pending' },
  { id: 'urgency',     label: 'Cálculo de urgencia',           status: 'pending' },
  { id: 'differential',label: 'Análisis diferencial',          status: 'pending' },
  { id: 'consensus',   label: 'Formación de consenso',         status: 'pending' },
  { id: 'response',    label: 'Generación de respuesta',       status: 'pending' },
];

// ============================================================================
// SPECIALTY HELPERS
// ============================================================================

type SpecialtyConfig = { icon: React.ComponentType<{ className?: string }>; color: string; bg: string };

function getSpecialtyConfig(specialty: string): SpecialtyConfig {
  const lower = specialty.toLowerCase();
  if (/cardio|coraz[oó]n|infarto/.test(lower))      return { icon: Heart,      color: '#ef4444', bg: 'bg-red-500/15' };
  if (/neurol|cerebro|cabeza|migra/.test(lower))    return { icon: Brain,      color: '#a855f7', bg: 'bg-purple-500/15' };
  if (/oftalm|ojo|visi[oó]n/.test(lower))           return { icon: Eye,        color: 'hsl(var(--primary))', bg: 'bg-primary/15' };
  if (/pediatr|ni[ñn]|infant|beb[eé]/.test(lower)) return { icon: Baby,       color: '#ec4899', bg: 'bg-pink-500/15' };
  if (/dermatol|piel|cutane|erupci/.test(lower))    return { icon: Smile,      color: '#f97316', bg: 'bg-orange-500/15' };
  if (/pulm[oó]n|respir|bronq|neum/.test(lower))   return { icon: Wind,       color: '#06b6d4', bg: 'bg-cyan-500/15' };
  if (/gastro|digest|est[oó]mag|colon/.test(lower)) return { icon: Activity,   color: '#22c55e', bg: 'bg-green-500/15' };
  if (/psiqui|psicol|mental|ansied/.test(lower))    return { icon: Sparkles,   color: '#8b5cf6', bg: 'bg-violet-500/15' };
  if (/ortop|trauma|hueso|articular/.test(lower))   return { icon: Zap,        color: '#f59e0b', bg: 'bg-amber-500/15' };
  return { icon: Stethoscope, color: 'hsl(var(--primary))', bg: 'bg-primary/15' };
}

function detectSpecialtyFromText(text: string): { specialty: string; confidence: number } | null {
  const lower = text.toLowerCase();
  if (/coraz[oó]n|pecho.*apret|taquicard|arritmia|infarto/.test(lower)) return { specialty: 'Cardiología', confidence: 0.55 };
  if (/cabeza|cefalea|migra[ñn]|v[eé]rtigo|convuls/.test(lower))         return { specialty: 'Neurología', confidence: 0.55 };
  if (/ojo|vista|borros|parpad/.test(lower))                              return { specialty: 'Oftalmología', confidence: 0.55 };
  if (/beb[eé]|ni[ñn]|infante|recién nacido/.test(lower))                return { specialty: 'Pediatría', confidence: 0.55 };
  if (/piel|grano|acn[eé]|erupci|mancha/.test(lower))                    return { specialty: 'Dermatología', confidence: 0.55 };
  if (/tos|respir|pulm[oó]n|bronq|asma/.test(lower))                     return { specialty: 'Neumología', confidence: 0.55 };
  if (/est[oó]mag|n[aá]usea|v[oó]mito|diarrea|colitis/.test(lower))     return { specialty: 'Gastroenterología', confidence: 0.55 };
  if (/ansied|depresi|estr[eé]s|p[aá]nico|insomnio/.test(lower))        return { specialty: 'Psiquiatría', confidence: 0.55 };
  if (/rodilla|espalda|hueso|articular|fractura/.test(lower))             return { specialty: 'Traumatología', confidence: 0.55 };
  if (lower.length > 10) return { specialty: 'Medicina General', confidence: 0.3 };
  return null;
}

// ============================================================================
// REASONING WORKSPACE COMPONENTS
// ============================================================================

const STAGE_LABELS: Record<ConsultStage, string> = {
  intake:     'Recopilando información',
  analyzing:  'Analizando tu caso',
  consensus:  'Formando consenso',
  generating: 'Generando respuesta',
  complete:   'Análisis completado',
  error:      'Error en análisis',
};

function AnalysisStatusHeader({ stage }: { stage: ConsultStage }) {
  const prefersReducedMotion = useReducedMotion();
  const isActive = stage === 'analyzing' || stage === 'consensus' || stage === 'generating';

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
        {isActive && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.15, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <Stethoscope className={cn('relative h-4 w-4', stage === 'complete' ? 'text-vital' : stage === 'error' ? 'text-red-400' : 'text-primary')} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Dr. Simeon</p>
        <p className="text-sm font-medium text-foreground">{STAGE_LABELS[stage]}</p>
      </div>
      {isActive && (
        <div className="ml-auto flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              style={{ animation: prefersReducedMotion ? 'none' : `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SpecialtyMorphCard({
  specialty,
  confidence,
  stage,
}: {
  specialty: string | null;
  confidence: number;
  stage: ConsultStage;
}) {
  const prefersReducedMotion = useReducedMotion();
  const config = specialty ? getSpecialtyConfig(specialty) : null;
  const Icon = config?.icon ?? Stethoscope;
  const isLocked = stage === 'complete' || stage === 'consensus';

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Especialidad detectada</p>
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={specialty ?? 'unknown'}
            initial={prefersReducedMotion ? undefined : { scale: 0.7, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', config?.bg ?? 'bg-muted')}
          >
            <Icon className="h-5 w-5" style={{ color: config?.color ?? '#64748b' }} />
          </motion.div>
        </AnimatePresence>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{specialty ?? 'Evaluando...'}</p>
          {confidence > 0 && (
            <div className="mt-1.5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn('h-full rounded-full', isLocked ? 'bg-vital' : 'bg-primary')}
                  initial={prefersReducedMotion ? undefined : { width: 0 }}
                  animate={prefersReducedMotion ? undefined : { width: `${Math.round(confidence * 100)}%` }}
                  transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{Math.round(confidence * 100)}% confianza</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RedFlagAlertCard({ flags, requiresEscalation }: { flags: RedFlagResult['flags']; requiresEscalation: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      className={cn(
        'rounded-[20px] border p-4',
        requiresEscalation ? 'border-rose-700/50 bg-rose-950/40' : 'border-orange-700/50 bg-orange-950/30',
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {!prefersReducedMotion ? (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <AlertTriangle className={cn('h-4 w-4 shrink-0', requiresEscalation ? 'text-red-400' : 'text-orange-400')} />
          </motion.div>
        ) : (
          <AlertTriangle className={cn('h-4 w-4 shrink-0', requiresEscalation ? 'text-red-400' : 'text-orange-400')} />
        )}
        <p className={cn('text-xs font-semibold uppercase tracking-[0.16em]', requiresEscalation ? 'text-red-300' : 'text-orange-300')}>
          {requiresEscalation ? 'Emergencia detectada' : 'Alertas médicas'}
        </p>
      </div>
      <ul className="space-y-1">
        {flags.slice(0, 2).map((f, i) => (
          <li key={i} className={cn('text-xs', requiresEscalation ? 'text-red-200' : 'text-orange-200')}>
            • {f.message}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ReasoningTimeline({ steps }: { steps: ReasoningStep[] }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Pasos de análisis</p>
      {steps.map((step) => (
        <motion.div
          key={step.id}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
            step.status === 'done'   ? 'text-vital' :
            step.status === 'active' ? 'text-primary' : 'text-muted-foreground',
          )}
          animate={step.status === 'active' && !prefersReducedMotion ? { x: [0, 2, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {step.status === 'done' ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-vital" />
          ) : step.status === 'active' ? (
            <motion.div
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
              animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <div className="h-2 w-2 shrink-0 rounded-full border border-border" />
          )}
          <span>{step.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function UrgencyGauge({ level }: { level: string }) {
  const config = {
    emergency: { label: 'Emergencia',     color: '#f43f5e', width: '100%' },
    high:      { label: 'Urgencia alta',  color: '#f97316', width: '80%' },
    urgent:    { label: 'Urgente',        color: '#f97316', width: '80%' },
    moderate:  { label: 'Urgencia media', color: '#f59e0b', width: '55%' },
    routine:   { label: 'Urgencia baja',  color: '#22c55e', width: '30%' },
    low:       { label: 'Urgencia baja',  color: '#22c55e', width: '30%' },
    'self-care': { label: 'Autocuidado',  color: '#10b981', width: '20%' },
  }[level.toLowerCase()] ?? { label: level, color: '#64748b', width: '40%' };

  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Nivel de urgencia</p>
        <span className="text-xs font-semibold" style={{ color: config.color }}>{config.label}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
          initial={prefersReducedMotion ? undefined : { width: 0 }}
          animate={prefersReducedMotion ? undefined : { width: config.width }}
          transition={{ duration: 0.8, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

function ResponseGenerationWave({ progress }: { progress: number }) {
  const prefersReducedMotion = useReducedMotion();
  const labels = ['Analizando', 'Correlacionando', 'Sintetizando', 'Generando resumen'];
  const labelIndex = Math.min(Math.floor(progress / 25), labels.length - 1);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-3 mb-3">
        {!prefersReducedMotion ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-4 w-4 text-primary" />
          </motion.div>
        ) : (
          <Loader2 className="h-4 w-4 text-primary" />
        )}
        <p className="text-sm text-primary/80">{labels[labelIndex]}...</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={prefersReducedMotion ? undefined : { width: '5%' }}
          animate={prefersReducedMotion ? undefined : { width: `${Math.max(progress, 5)}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ReasoningWorkspace({
  stage,
  primarySpecialty,
  specialtyConfidence,
  urgencyLevel,
  reasoningSteps,
  generationProgress,
  redFlags,
}: {
  stage: ConsultStage;
  primarySpecialty: string | null;
  specialtyConfidence: number;
  urgencyLevel: string | null;
  reasoningSteps: ReasoningStep[];
  generationProgress: number;
  redFlags: RedFlagResult | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AnalysisStatusHeader stage={stage} />
      <SpecialtyMorphCard specialty={primarySpecialty} confidence={specialtyConfidence} stage={stage} />
      <AnimatePresence>
        {redFlags?.detected && (
          <motion.div key="redflags" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <RedFlagAlertCard flags={redFlags.flags} requiresEscalation={redFlags.requiresEmergencyEscalation} />
          </motion.div>
        )}
      </AnimatePresence>
      <ReasoningTimeline steps={reasoningSteps} />
      <AnimatePresence>
        {urgencyLevel && stage !== 'intake' && (
          <motion.div key="urgency" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UrgencyGauge level={urgencyLevel} />
          </motion.div>
        )}
        {stage === 'generating' && (
          <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ResponseGenerationWave progress={generationProgress} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// CONVERSATION TRAIL
// ============================================================================

function ConversationTrail({ formData, currentStep }: { formData: FormData; currentStep: IntakeStep }) {
  const stepsBeforeCurrent = STEPS_ORDER.slice(1, STEPS_ORDER.indexOf(currentStep));
  const answeredSteps = stepsBeforeCurrent.filter((s) => {
    const answer = STEP_META[s].getAnswer(formData);
    return answer.trim().length > 0;
  });

  if (answeredSteps.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {answeredSteps.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-1.5"
        >
          <div className="flex items-start gap-2">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Stethoscope className="h-3 w-3" />
            </div>
            <p className="text-xs text-muted-foreground pt-1">{STEP_META[step].question}</p>
          </div>
          <div className="ml-8">
            <div className="inline-block rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground max-w-[85%]">
              {STEP_META[step].getAnswer(formData)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIConsultaClient({ userId }: AIConsultaClientProps) {
  // Existing form state
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [consultation, setConsultation] = useState<SOAPConsultation | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [phases, setPhases] = useState<SOAPPhaseStatus[]>([]);
  const [progress, setProgress] = useState<ConsultationProgressType | null>(null);

  // Emergency detection
  const [emergencyDetected, setEmergencyDetected] = useState<RedFlagResult | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // NEW: Presentation / reasoning state
  const [consultStage, setConsultStage] = useState<ConsultStage>('intake');
  const [primarySpecialty, setPrimarySpecialty] = useState<string | null>(null);
  const [specialtyConfidence, setSpecialtyConfidence] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState<string | null>(null);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>(INITIAL_REASONING_STEPS);
  const [generationProgress, setGenerationProgress] = useState(0);

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    if (field === 'chiefComplaint' || field === 'symptomsDescription' || field === 'associatedSymptoms') {
      checkForEmergencies();
    }
  };

  const checkForEmergencies = () => {
    const combinedText = [
      formData.chiefComplaint,
      formData.symptomsDescription,
      formData.associatedSymptoms,
    ].join(' ');
    if (combinedText.trim().length < 5) return;
    const result = detectRedFlagsEnhanced(combinedText);
    if (result.detected) {
      setEmergencyDetected(result);
      if (result.requiresEmergencyEscalation) setShowEmergencyModal(true);
    } else {
      setEmergencyDetected(null);
    }
  };

  // Real-time specialty detection from formData
  useEffect(() => {
    const combined = [formData.chiefComplaint, formData.symptomsDescription, formData.associatedSymptoms].join(' ');
    const detected = detectSpecialtyFromText(combined);
    if (detected) {
      setPrimarySpecialty(detected.specialty);
      setSpecialtyConfidence(detected.confidence);
    }
  }, [formData.chiefComplaint, formData.symptomsDescription, formData.associatedSymptoms]);

  useEffect(() => {
    checkForEmergencies();
  }, [formData.chiefComplaint, formData.symptomsDescription, formData.associatedSymptoms]);

  // Update reasoning steps based on form progress
  useEffect(() => {
    setReasoningSteps((prev) => prev.map((step) => {
      if (step.status === 'done') return step;
      if (step.id === 'symptoms' && formData.chiefComplaint.length > 0) return { ...step, status: 'done' };
      if (step.id === 'severity' && formData.symptomSeverity !== 5 && formData.symptomDuration) return { ...step, status: 'done' };
      if (step.id === 'specialty' && primarySpecialty) return { ...step, status: 'done' };
      if (step.id === 'redflags' && emergencyDetected !== null) return { ...step, status: 'done' };
      return step;
    }));
  }, [formData, primarySpecialty, emergencyDetected]);

  const nextStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex < STEPS_ORDER.length - 1) {
      setCurrentStep(STEPS_ORDER[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex > 0) setCurrentStep(STEPS_ORDER[currentIndex - 1]);
  };

  const advanceReasoningStep = (id: string) => {
    setReasoningSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      return prev.map((s, i) => {
        if (i < idx) return { ...s, status: 'done' };
        if (i === idx) return { ...s, status: 'active' };
        return s;
      });
    });
  };

  const completeReasoningStep = (id: string) => {
    setReasoningSteps((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: 'done' } : s)
    );
  };

  const submitConsultation = async () => {
    checkForEmergencies();
    if (emergencyDetected?.requiresEmergencyEscalation) { setShowEmergencyModal(true); return; }

    setIsSubmitting(true);
    setError(null);
    setConsultStage('analyzing');

    // Mark urgency/differential as active
    setReasoningSteps((prev) => prev.map((s) => {
      if (['symptoms', 'severity', 'specialty', 'redflags'].includes(s.id)) return { ...s, status: 'done' };
      if (s.id === 'urgency') return { ...s, status: 'active' };
      return s;
    }));

    setPhases([
      { phase: 'subjective', status: 'completed', timestamp: new Date() },
      { phase: 'objective', status: 'in-progress' },
      { phase: 'assessment', status: 'pending' },
      { phase: 'plan', status: 'pending' },
    ]);

    setCurrentStep('consulting');

    const subjectiveData: SubjectiveData = {
      chiefComplaint: formData.chiefComplaint,
      symptomsDescription: formData.symptomsDescription,
      symptomDuration: formData.symptomDuration,
      symptomSeverity: formData.symptomSeverity,
      onsetType: formData.onsetType || 'gradual',
      associatedSymptoms: formData.associatedSymptoms ? formData.associatedSymptoms.split(',').map((s) => s.trim()) : [],
      aggravatingFactors: formData.aggravatingFactors ? formData.aggravatingFactors.split(',').map((s) => s.trim()) : [],
      relievingFactors: formData.relievingFactors ? formData.relievingFactors.split(',').map((s) => s.trim()) : [],
      previousTreatments: [],
      medicalHistory: formData.medicalHistory || undefined,
    };

    const specialistAvatars: Record<string, string> = {
      gp:    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
      derm:  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
      int:   'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
      psych: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    };

    const initialSpecialists: SpecialistAgent[] = [
      { id: 'gp',    name: 'Dr. Garcia',      specialty: 'general',     avatar: specialistAvatars.gp,    confidence: 0, assessment: '', status: 'thinking' },
      { id: 'derm',  name: 'Dra. Rodriguez',  specialty: 'dermatology', avatar: specialistAvatars.derm,  confidence: 0, assessment: '', status: 'thinking' },
      { id: 'int',   name: 'Dr. Martinez',    specialty: 'neurology',   avatar: specialistAvatars.int,   confidence: 0, assessment: '', status: 'thinking' },
      { id: 'psych', name: 'Dra. Lopez',      specialty: 'psychology',  avatar: specialistAvatars.psych, confidence: 0, assessment: '', status: 'thinking' },
    ];

    setSpecialists(initialSpecialists);
    setProgress({ currentPhase: 'assessment', activeAgents: ['gp', 'derm', 'int', 'psych'], completedAgents: [], totalAgents: 4, estimatedTimeRemaining: 60 });
    setGenerationProgress(5);

    try {
      const response = await fetch('/api/soap/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: userId, subjective: subjectiveData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en la consulta');
      }

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
          const lines = eventBlock.split('\n');
          let eventName = '';
          let eventData: Record<string, unknown> | null = null;

          for (const line of lines) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            else if (line.startsWith('data: ')) {
              try { eventData = JSON.parse(line.slice(6).trim()); } catch { /* skip */ }
            }
          }
          if (!eventData) continue;
          const data = eventData;

          try {
            switch (eventName) {
              case 'specialist_done': {
                const specialistId = mapRoleToId(data.specialist as string);
                completedSpecialistIds.push(specialistId);
                setSpecialists((prev) => prev.map((s) =>
                  s.id === specialistId
                    ? { ...s, confidence: Math.round(((data.confidence as number) || 0.7) * 100), assessment: (data.diagnosis as string) || 'Evaluación completada', status: 'completed' as const }
                    : s
                ));
                setProgress((prev) => prev ? { ...prev, completedAgents: [...completedSpecialistIds], activeAgents: prev.activeAgents.filter((id) => !completedSpecialistIds.includes(id)) } : null);
                setGenerationProgress((p) => Math.min(p + 15, 60));
                advanceReasoningStep('differential');
                break;
              }
              case 'consensus_done': {
                setConsultStage('consensus');
                setPhases((prev) => prev.map((p) => p.phase === 'assessment' ? { ...p, status: 'completed', timestamp: new Date() } : p));
                const specialty = (data.specialty as string) || primarySpecialty;
                if (specialty) {
                  setPrimarySpecialty(specialty);
                  setSpecialtyConfidence(Math.min((data.confidence as number) || 0.85, 1));
                }
                const urgency = data.urgencyLevel as string;
                if (urgency) setUrgencyLevel(urgency);
                setConsensus({
                  score: Math.round(((data.confidence as number) || 0.7) * 100),
                  level: mapAgreementLevel((data.agreementLevel as string) || 'moderate'),
                  primaryDiagnosis: (data.primaryDiagnosis as string) || '',
                  differentialDiagnoses: [],
                  clinicalReasoning: `Urgencia: ${urgency || 'moderate'}`,
                  agreementPercentage: Math.round(((data.confidence as number) || 0.7) * 100),
                });
                completeReasoningStep('differential');
                completeReasoningStep('urgency');
                completeReasoningStep('consensus');
                advanceReasoningStep('response');
                setGenerationProgress(65);
                break;
              }
              case 'plan_done': {
                setConsultStage('generating');
                setPhases((prev) => prev.map((p) => p.phase === 'plan' ? { ...p, status: 'completed', timestamp: new Date() } : p));
                setGenerationProgress(85);
                break;
              }
              case 'complete': {
                finalConsultation = {
                  id: data.consultationId as string,
                  patientId: userId,
                  createdAt: new Date(),
                  completedAt: new Date(),
                  status: 'complete',
                  subjective: subjectiveData,
                  objective: {},
                  assessment: { specialists: (data.specialists as SpecialistAgent[]) || [], consensus: (data.consensus as ConsensusResult) || null },
                  plan: (data.plan as SOAPConsultation['plan']) || null,
                  metadata: { totalTokens: 0, totalCostUSD: 0, totalLatencyMs: 0, aiModel: 'glm-4-plus' },
                } as unknown as SOAPConsultation;
                break;
              }
              case 'error':
                throw new Error((data.error as string) || 'Error en consulta');
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('Error')) throw err;
            console.warn('Failed to process SSE event:', eventName, eventData);
          }
        }
      }

      setPhases([
        { phase: 'subjective', status: 'completed', timestamp: new Date() },
        { phase: 'objective',  status: 'completed', timestamp: new Date() },
        { phase: 'assessment', status: 'completed', timestamp: new Date() },
        { phase: 'plan',       status: 'completed', timestamp: new Date() },
      ]);
      setReasoningSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));
      setGenerationProgress(100);
      setConsultStage('complete');

      if (finalConsultation) setConsultation(finalConsultation);
      setProgress(null);
      setCurrentStep('results');
    } catch (err) {
      console.error('Consultation error:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la consulta');
      setConsultStage('error');
      setCurrentStep('history');
      setSpecialists([]);
      setProgress(null);
      setPhases([
        { phase: 'subjective', status: 'in-progress' },
        { phase: 'objective',  status: 'pending' },
        { phase: 'assessment', status: 'pending' },
        { phase: 'plan',       status: 'pending' },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapRoleToId = (role: string): string => {
    const mapping: Record<string, string> = {
      'general-practitioner': 'gp',
      'dermatologist':        'derm',
      'internist':            'int',
      'psychiatrist':         'psych',
    };
    return mapping[role] || role;
  };

  const mapAgreementLevel = (level: string): ConsensusResult['level'] => {
    const mapping: Record<string, ConsensusResult['level']> = {
      'strong': 'high', 'moderate': 'moderate', 'weak': 'low', 'disagreement': 'low',
    };
    return mapping[level] || 'moderate';
  };

  const isInIntake = !['consulting', 'results'].includes(currentStep);
  const headerBg = 'bg-background/90 backdrop-blur-md border-b border-border';

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className={cn('sticky top-0 z-50', headerBg)}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Consulta Multi-Especialista</p>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">4 especialistas · Consenso médico IA</p>
            </div>
          </div>
          <Link href="/app" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Volver
          </Link>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex-1 flex lg:grid lg:grid-cols-[1fr_340px]">
        {/* LEFT: Conversation / content area */}
        <main className="flex flex-col min-h-0 lg:border-r lg:border-border overflow-y-auto">
          {/* Emergency Alert */}
          <AnimatePresence>
            {emergencyDetected?.detected && !emergencyDetected.requiresEmergencyEscalation && (
              <motion.div
                key="emergency-alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pt-4"
              >
                <EmergencyAlert
                  message={emergencyDetected.flags[0].message}
                  symptoms={emergencyDetected.flags.map((f) => f.category)}
                  severity="high"
                  onDismiss={() => setEmergencyDetected(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversation trail — only during intake */}
          {isInIntake && currentStep !== 'welcome' && (
            <div className="px-4 pt-6">
              <ConversationTrail formData={formData} currentStep={currentStep} />
            </div>
          )}

          {/* Mobile reasoning panel — shown below header on mobile */}
          {!isInIntake && (
            <div className="lg:hidden p-4 border-b border-border">
              <ReasoningWorkspace
                stage={consultStage}
                primarySpecialty={primarySpecialty}
                specialtyConfidence={specialtyConfidence}
                urgencyLevel={urgencyLevel}
                reasoningSteps={reasoningSteps}
                generationProgress={generationProgress}
                redFlags={emergencyDetected}
              />
            </div>
          )}

          {/* Main step content */}
          <div className="flex-1 px-4 py-4">
            <AnimatePresence mode="wait">
              {currentStep === 'welcome' && <WelcomeStep key="welcome" onNext={nextStep} />}
              {currentStep === 'chief-complaint' && (
                <ChiefComplaintStep key="chief-complaint" value={formData.chiefComplaint} onChange={(v) => updateFormData('chiefComplaint', v)} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'symptoms' && (
                <SymptomsStep key="symptoms" value={formData.symptomsDescription} onChange={(v) => updateFormData('symptomsDescription', v)} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'duration' && (
                <DurationStep key="duration" value={formData.symptomDuration} onChange={(v) => updateFormData('symptomDuration', v)} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'severity' && (
                <SeverityStep key="severity" value={formData.symptomSeverity} onChange={(v) => updateFormData('symptomSeverity', v as number)} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'onset' && (
                <OnsetStep key="onset" value={formData.onsetType} onChange={(v) => updateFormData('onsetType', v as 'sudden' | 'gradual')} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'associated' && (
                <AssociatedSymptomsStep key="associated" value={formData.associatedSymptoms} onChange={(v) => updateFormData('associatedSymptoms', v)} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'factors' && (
                <FactorsStep key="factors" aggravating={formData.aggravatingFactors} relieving={formData.relievingFactors} onAggravatingChange={(v) => updateFormData('aggravatingFactors', v)} onRelievingChange={(v) => updateFormData('relievingFactors', v)} onNext={nextStep} onPrev={prevStep} />
              )}
              {currentStep === 'history' && (
                <HistoryStep key="history" value={formData.medicalHistory} onChange={(v) => updateFormData('medicalHistory', v)} onNext={submitConsultation} onPrev={prevStep} isSubmitting={isSubmitting} />
              )}
              {currentStep === 'consulting' && (
                <ConsultingStep key="consulting" specialists={specialists} progress={progress} phases={phases} stage={consultStage} />
              )}
              {currentStep === 'results' && consultation && consensus && (
                <ResultsStep key="results" consultation={consultation} consensus={consensus} specialists={specialists} phases={phases} />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* RIGHT: Reasoning workspace — desktop only, sticky */}
        <aside className="hidden lg:flex flex-col bg-muted/50">
          <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto p-5">
            <ReasoningWorkspace
              stage={consultStage}
              primarySpecialty={primarySpecialty}
              specialtyConfidence={specialtyConfidence}
              urgencyLevel={urgencyLevel}
              reasoningSteps={reasoningSteps}
              generationProgress={generationProgress}
              redFlags={emergencyDetected}
            />
          </div>
        </aside>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <Card className="p-4 border-red-800 bg-red-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-100 text-sm">Error en la consulta</p>
                  <p className="text-xs text-red-300 mt-0.5">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200 text-xs">✕</button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Modal */}
      {showEmergencyModal && emergencyDetected?.requiresEmergencyEscalation && (
        <EmergencyModal
          message={emergencyDetected.flags[0].message}
          symptoms={emergencyDetected.flags.map((f) => f.category)}
          severity="critical"
        />
      )}
    </div>
  );
}

// ============================================================================
// INTAKE STEP COMPONENTS
// ============================================================================

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return <ConversationalWelcome onStart={onNext} />;
}

function ChiefComplaintStep({ value, onChange, onNext, onPrev }: { value: string; onChange: (v: string) => void; onNext: () => void; onPrev: () => void }) {
  const chips = ['Dolor de cabeza', 'Dolor abdominal', 'Dolor en el pecho', 'Fiebre', 'Náuseas', 'Tos', 'Fatiga', 'Mareos'];
  return (
    <QuestionCard step={1} totalSteps={8}>
      <QuestionTitle>¿Cuál es tu motivo principal?</QuestionTitle>
      <QuestionDescription>Describe brevemente qué te molesta</QuestionDescription>
      <div className="space-y-4">
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Dolor de cabeza fuerte..."
          className="w-full px-4 py-4 text-lg border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card"
          autoFocus onKeyDown={(e) => e.key === 'Enter' && value.trim() && onNext()}
        />
        <div>
          <p className="text-sm text-muted-foreground mb-2 font-medium">Sugerencias rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c} onClick={() => onChange(c)} className={cn('px-3 py-1.5 text-sm rounded-full border transition-all', value === c ? 'bg-ink text-white border-ink' : 'bg-card border-border hover:border-primary hover:text-primary')}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={value.trim().length > 0} />
    </QuestionCard>
  );
}

function SymptomsStep({ value, onChange, onNext, onPrev }: { value: string; onChange: (v: string) => void; onNext: () => void; onPrev: () => void }) {
  return (
    <QuestionCard step={2} totalSteps={8}>
      <QuestionTitle>Cuéntame más sobre tus síntomas</QuestionTitle>
      <QuestionDescription>Describe con detalle lo que sientes: ubicación, tipo de molestia, intensidad</QuestionDescription>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Describe tus síntomas en detalle..." rows={5} className="w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all bg-card" />
      <p className="text-xs text-muted-foreground">{value.length} caracteres</p>
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={value.trim().length >= 10} />
    </QuestionCard>
  );
}

function DurationStep({ value, onChange, onNext, onPrev }: { value: string; onChange: (v: string) => void; onNext: () => void; onPrev: () => void }) {
  const opts = ['Menos de 1 hora', 'Hoy', '1-2 días', '3-7 días', '1-2 semanas', 'Más de 2 semanas', 'Meses'];
  return (
    <QuestionCard step={3} totalSteps={8}>
      <QuestionTitle>¿Cuánto tiempo con estos síntomas?</QuestionTitle>
      <QuestionDescription>Selecciona la opción más cercana a tu situación</QuestionDescription>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((opt) => (
          <button key={opt} onClick={() => onChange(opt)} className={cn('p-3 rounded-xl border-2 text-sm text-left transition-all', value === opt ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50')}>
            {opt}
          </button>
        ))}
      </div>
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={value.length > 0} />
    </QuestionCard>
  );
}

function SeverityStep({ value, onChange, onNext, onPrev }: { value: number; onChange: (v: number) => void; onNext: () => void; onPrev: () => void }) {
  return (
    <QuestionCard step={4} totalSteps={8}>
      <QuestionTitle>¿Qué tan intenso es tu malestar?</QuestionTitle>
      <QuestionDescription>Del 1 (muy leve) al 10 (insoportable)</QuestionDescription>
      <EnhancedSeveritySlider value={value} onChange={onChange} min={1} max={10} />
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={true} />
    </QuestionCard>
  );
}

function OnsetStep({ value, onChange, onNext, onPrev }: { value: 'sudden' | 'gradual' | null; onChange: (v: 'sudden' | 'gradual') => void; onNext: () => void; onPrev: () => void }) {
  return (
    <QuestionCard step={5} totalSteps={8}>
      <QuestionTitle>¿Cómo empezaron tus síntomas?</QuestionTitle>
      <QuestionDescription>El tipo de inicio ayuda a entender el origen</QuestionDescription>
      <div className="grid grid-cols-2 gap-4">
        {[{ key: 'sudden' as const, label: 'De repente', desc: 'Aparecieron rápidamente', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
          { key: 'gradual' as const, label: 'Poco a poco', desc: 'Aparecieron gradualmente', icon: <Clock className="w-5 h-5 text-green-500" /> }].map(({ key, label, desc, icon }) => (
          <Card key={key} className={cn('p-5 cursor-pointer transition-all', value === key ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'hover:border-border hover:shadow-sm')} onClick={() => onChange(key)}>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 bg-secondary">{icon}</div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={value !== null} />
    </QuestionCard>
  );
}

function AssociatedSymptomsStep({ value, onChange, onNext, onPrev }: { value: string; onChange: (v: string) => void; onNext: () => void; onPrev: () => void }) {
  return (
    <QuestionCard step={6} totalSteps={8}>
      <QuestionTitle>¿Tienes otros síntomas?</QuestionTitle>
      <QuestionDescription>Selecciona o escribe los que apliquen (opcional)</QuestionDescription>
      <SymptomAutocomplete value={value} onChange={onChange} placeholder="Escribe o selecciona síntomas..." suggestions={['Fiebre', 'Escalofríos', 'Náuseas', 'Vómitos', 'Mareos', 'Cansancio', 'Pérdida de apetito', 'Dolor muscular', 'Tos seca', 'Congestión nasal']} />
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={true} />
    </QuestionCard>
  );
}

function FactorsStep({ aggravating, relieving, onAggravatingChange, onRelievingChange, onNext, onPrev }: { aggravating: string; relieving: string; onAggravatingChange: (v: string) => void; onRelievingChange: (v: string) => void; onNext: () => void; onPrev: () => void }) {
  return (
    <QuestionCard step={7} totalSteps={8}>
      <QuestionTitle>¿Qué afecta tus síntomas?</QuestionTitle>
      <QuestionDescription>Ayuda a los especialistas a entenderte mejor (opcional)</QuestionDescription>
      <div className="space-y-4">
        {[{ label: '¿Qué lo empeora?', value: aggravating, onChange: onAggravatingChange, placeholder: 'Ej: movimiento, comida, estrés...' },
          { label: '¿Qué lo alivia?', value: relieving, onChange: onRelievingChange, placeholder: 'Ej: descanso, medicamentos...' }].map(({ label, value, onChange, placeholder }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-card" />
          </div>
        ))}
      </div>
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={true} />
    </QuestionCard>
  );
}

function HistoryStep({ value, onChange, onNext, onPrev, isSubmitting }: { value: string; onChange: (v: string) => void; onNext: () => void; onPrev: () => void; isSubmitting: boolean }) {
  return (
    <QuestionCard step={8} totalSteps={8}>
      <QuestionTitle>Antecedentes médicos (opcional)</QuestionTitle>
      <QuestionDescription>Cualquier información que ayude al diagnóstico</QuestionDescription>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ej: Tengo hipertensión, tomo medicación para la tiroides..." rows={5} className="w-full px-4 py-4 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all bg-card" />
      <QuestionCardNavigation onPrev={onPrev} onNext={onNext} canNext={true} nextLabel="Iniciar Consulta" isSubmitting={isSubmitting} />
      <p className="text-center text-xs text-muted-foreground mt-2">Los especialistas analizarán tu caso en ~60 segundos</p>
    </QuestionCard>
  );
}

function ConsultingStep({ specialists, progress, phases, stage }: { specialists: SpecialistAgent[]; progress: ConsultationProgressType | null; phases: SOAPPhaseStatus[]; stage: ConsultStage }) {
  const prefersReducedMotion = useReducedMotion();
  const STAGE_COPY: Record<ConsultStage, { title: string; sub: string }> = {
    analyzing:  { title: 'Analizando tu caso...', sub: 'Los especialistas están evaluando tus síntomas' },
    consensus:  { title: 'Formando consenso...', sub: 'Los especialistas están comparando sus evaluaciones' },
    generating: { title: 'Generando respuesta...', sub: 'Sintetizando el plan de atención para ti' },
    complete:   { title: 'Análisis completado', sub: '' },
    intake:     { title: 'Preparando análisis...', sub: '' },
    error:      { title: 'Error en el análisis', sub: '' },
  };
  const { title, sub } = STAGE_COPY[stage] || STAGE_COPY.analyzing;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-xl mx-auto">
      <div className="text-center py-4">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-primary/10" />
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-sky-500/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <div className="relative flex h-full items-center justify-center">
            {!prefersReducedMotion ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}>
                <Loader2 className="h-7 w-7 text-primary" />
              </motion.div>
            ) : (
              <Loader2 className="h-7 w-7 text-primary" />
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>

      {phases.length > 0 && <SOAPTimeline phases={phases} currentPhase="assessment" />}
      {progress && <ConsultationProgress progress={progress} agentDetails={specialists.map((s) => ({ id: s.id, name: s.name, avatar: s.avatar }))} />}
      <SpecialistConsultation agents={specialists} />
    </motion.div>
  );
}

function ResultsStep({ consultation, consensus, specialists, phases }: { consultation: SOAPConsultation; consensus: ConsensusResult; specialists: SpecialistAgent[]; phases: SOAPPhaseStatus[] }) {
  const urgencyColors: Record<string, string> = {
    emergency: 'bg-red-500', urgent: 'bg-orange-500', moderate: 'bg-yellow-500',
    routine: 'bg-primary', 'self-care': 'bg-vital',
  };
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-xl mx-auto">
      <motion.div
        initial={prefersReducedMotion ? undefined : { scale: 0.95, opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="bg-vital rounded-2xl p-6 text-white text-center"
      >
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-1">Consulta Completada</h2>
        <p className="text-vital text-sm">{specialists.length} especialistas analizaron tu caso</p>
      </motion.div>

      <SOAPTimeline phases={phases} currentPhase="plan" />

      <div className="flex justify-center">
        <Badge className={cn('px-5 py-1.5 text-white', urgencyColors[consultation.assessment?.consensus?.urgencyLevel || 'routine'])}>
          Urgencia: {consultation.assessment?.consensus?.urgencyLevel || 'routine'}
        </Badge>
      </div>

      {[
        <ConsensusMatrix key="consensus" consensus={consensus} />,
        <div key="specialists">
          <h3 className="text-lg font-bold text-foreground mb-3">Evaluaciones</h3>
          <SpecialistConsultation agents={specialists} />
        </div>,
        consultation.plan && <TreatmentPlanDisplay key="plan" plan={consultation.plan} />,
        consultation.plan?.referralNeeded && consultation.assessment?.consensus && (
          <RecommendedDoctors
            key="doctors"
            consultationId={consultation.id}
            consensus={consultation.assessment.consensus}
            patientHistory={{ chiefComplaint: consultation.subjective.chiefComplaint, symptomsDescription: consultation.subjective.symptomsDescription, medicalHistory: consultation.subjective.medicalHistory }}
            onSelectDoctor={(doctorId) => { window.location.href = `/book/${doctorId}?consultationId=${consultation.id}`; }}
          />
        ),
      ].filter(Boolean).map((child, i) => (
        <motion.div
          key={i}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
        >
          {child}
        </motion.div>
      ))}

      <Card className="p-4 bg-amber-950/40 border-amber-800/40">
        <p className="text-xs text-amber-300 text-center">
          <strong>Aviso:</strong> Esta consulta es una orientación médica basada en IA. No sustituye la consulta presencial con un médico licenciado. En caso de emergencia, llama al 911.
        </p>
      </Card>

      <div className="flex gap-3 pb-8">
        <Link href="/app" className="flex-1"><Button variant="outline" className="w-full">Volver al Inicio</Button></Link>
        <Link href="/doctors" className="flex-1"><Button className="w-full bg-ink hover:bg-cobalt-800">Buscar Doctor</Button></Link>
      </div>
    </motion.div>
  );
}
