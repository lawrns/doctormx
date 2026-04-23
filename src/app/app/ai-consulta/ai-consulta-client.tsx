'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Send,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyAlert, EmergencyModal } from '@/components/EmergencyAlert';
import { detectRedFlagsEnhanced, type RedFlagResult } from '@/lib/ai/red-flags-enhanced';
import type { SubjectiveData, SOAPConsultation } from '@/lib/soap/types';
import type { SpecialistAgent, ConsensusResult, SOAPPhaseStatus } from '@/types/soap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type FlowStep =
  | 'welcome'
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

type ChatRole = 'assistant' | 'user' | 'system';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  subtle?: boolean;
}

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

const FLOW_STEPS: FlowStep[] = [
  'welcome',
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

const INITIAL_REASONING_STEPS: ReasoningStep[] = [
  { id: 'symptoms', label: 'Lectura del motivo principal', status: 'pending' },
  { id: 'duration', label: 'Contexto temporal', status: 'pending' },
  { id: 'severity', label: 'Intensidad clínica', status: 'pending' },
  { id: 'specialty', label: 'Especialidad probable', status: 'pending' },
  { id: 'redflags', label: 'Señales de alarma', status: 'pending' },
  { id: 'urgency', label: 'Nivel de urgencia', status: 'pending' },
  { id: 'summary', label: 'Síntesis final', status: 'pending' },
];

const QUICK_STARTS = [
  { label: 'Dolor de pecho', seed: 'Dolor de pecho y presión al respirar' },
  { label: 'Fiebre', seed: 'Fiebre con escalofríos desde ayer' },
  { label: 'Dolor abdominal', seed: 'Dolor abdominal que no cede' },
  { label: 'Tos', seed: 'Tos persistente con cansancio' },
  { label: 'Piel', seed: 'Ronchas o erupción en la piel' },
  { label: 'No sé si es urgente', seed: 'No sé si esto requiere atención urgente' },
] as const;

const STEP_COPY: Record<
  Exclude<FlowStep, 'consulting' | 'results'>,
  {
    title: string;
    helper: string;
    placeholder?: string;
    kind: 'text' | 'textarea' | 'choice' | 'scale' | 'pair';
  }
> = {
  welcome: {
    title: 'Dime qué te trae hoy',
    helper: 'Voy a hacerte una sola pregunta a la vez y voy a mantener el caso ordenado.',
    placeholder: 'Escribe tu motivo principal de consulta',
    kind: 'text',
  },
  symptoms: {
    title: 'Cuéntame cómo se siente',
    helper: 'Ubicación, tipo de molestia, intensidad y cualquier detalle útil.',
    placeholder: 'Describe los síntomas con tus palabras',
    kind: 'textarea',
  },
  duration: {
    title: '¿Desde cuándo pasa?',
    helper: 'Elige la opción más cercana.',
    kind: 'choice',
  },
  severity: {
    title: '¿Qué tan intenso es?',
    helper: 'Usa una escala sobria del 1 al 10.',
    kind: 'scale',
  },
  onset: {
    title: '¿Cómo empezó?',
    helper: 'Esto ayuda a separar cambios bruscos de procesos graduales.',
    kind: 'choice',
  },
  associated: {
    title: '¿Hay otros síntomas?',
    helper: 'Opcional. Agrega lo que notes, aunque no estés seguro.',
    placeholder: 'Ej: náuseas, mareo, tos, falta de aire',
    kind: 'text',
  },
  factors: {
    title: '¿Qué lo empeora o lo calma?',
    helper: 'Opcional. Sirve para ver el contexto funcional del caso.',
    kind: 'pair',
  },
  history: {
    title: 'Antecedentes relevantes',
    helper: 'Opcional. Medicación, alergias o condiciones previas.',
    placeholder: 'Ej: hipertensión, asma, medicamentos actuales, alergias',
    kind: 'textarea',
  },
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'intro',
    role: 'assistant',
    content:
      'Hola, soy Dr. Simeon. Voy a ayudarte a ordenar el caso, revisar señales de alarma y orientar el siguiente paso sin saturarte con mecánica interna.',
  },
];

function getStepIndex(step: FlowStep) {
  return FLOW_STEPS.indexOf(step);
}

function getNextStep(step: FlowStep): FlowStep {
  const nextIndex = Math.min(getStepIndex(step) + 1, FLOW_STEPS.length - 1);
  return FLOW_STEPS[nextIndex];
}

function getStepQuestion(step: FlowStep) {
  return STEP_COPY[step as Exclude<FlowStep, 'consulting' | 'results'>]?.title ?? '';
}

function getStepHelper(step: FlowStep) {
  return STEP_COPY[step as Exclude<FlowStep, 'consulting' | 'results'>]?.helper ?? '';
}

function getStepPlaceholder(step: FlowStep) {
  return STEP_COPY[step as Exclude<FlowStep, 'consulting' | 'results'>]?.placeholder ?? 'Escribe tu respuesta';
}

function stepAllowsEmpty(step: FlowStep) {
  return step === 'associated' || step === 'factors' || step === 'history';
}

function formatStepAnswer(step: FlowStep, formData: FormData) {
  switch (step) {
    case 'welcome':
      return formData.chiefComplaint;
    case 'symptoms':
      return formData.symptomsDescription;
    case 'duration':
      return formData.symptomDuration;
    case 'severity':
      return `${formData.symptomSeverity}/10`;
    case 'onset':
      return formData.onsetType === 'sudden' ? 'De repente' : formData.onsetType === 'gradual' ? 'Gradualmente' : '';
    case 'associated':
      return formData.associatedSymptoms || 'Sin síntomas asociados';
    case 'factors':
      return [formData.aggravatingFactors && `Empeora: ${formData.aggravatingFactors}`, formData.relievingFactors && `Alivia: ${formData.relievingFactors}`].filter(Boolean).join(' · ') || 'Sin factores identificados';
    case 'history':
      return formData.medicalHistory || 'Sin antecedentes relevantes';
    default:
      return '';
  }
}

function getDiagnosisLabel(value: string | { name: string } | null | undefined) {
  if (!value) return 'Sin consenso todavía';
  if (typeof value === 'string') return value;
  return value.name;
}

function getFollowUp(step: FlowStep, answer: string) {
  switch (step) {
    case 'welcome':
      return `Lo que entendí: ${answer}. Ahora voy a precisar los síntomas.`;
    case 'symptoms':
      return 'Entendido. Ahora dime desde cuándo te pasa.';
    case 'duration':
      return 'Gracias. Voy a revisar qué tan intenso se siente.';
    case 'severity':
      return 'Perfecto. Ahora necesito saber cómo empezó.';
    case 'onset':
      return 'Eso ayuda. Quiero verificar si hay otros síntomas asociados.';
    case 'associated':
      return 'Entendido. Ahora cierro el contexto con dos detalles más.';
    case 'factors':
      return 'Gracias. Solo me queda registrar antecedentes relevantes.';
    case 'history':
      return 'Voy a ordenar lo que me contaste y revisar señales de alarma.';
    default:
      return '';
  }
}

function getSeverityLabel(value: number) {
  if (value <= 2) return 'Muy leve';
  if (value <= 4) return 'Leve';
  if (value <= 6) return 'Moderada';
  if (value <= 8) return 'Alta';
  return 'Muy alta';
}

function detectSpecialtyFromText(text: string): { specialty: string; confidence: number } | null {
  const lower = text.toLowerCase();
  if (/coraz[oó]n|pecho.*apret|taquicard|arritmia|infarto/.test(lower)) return { specialty: 'Cardiología', confidence: 0.55 };
  if (/cabeza|cefalea|migra[ñn]|v[eé]rtigo|convuls/.test(lower)) return { specialty: 'Neurología', confidence: 0.55 };
  if (/ojo|vista|borros|parpad/.test(lower)) return { specialty: 'Oftalmología', confidence: 0.55 };
  if (/beb[eé]|ni[ñn]|infante|recién nacido/.test(lower)) return { specialty: 'Pediatría', confidence: 0.55 };
  if (/piel|grano|acn[eé]|erupci|mancha/.test(lower)) return { specialty: 'Dermatología', confidence: 0.55 };
  if (/tos|respir|pulm[oó]n|bronq|asma/.test(lower)) return { specialty: 'Neumología', confidence: 0.55 };
  if (/est[oó]mag|n[aá]usea|v[oó]mito|diarrea|colitis/.test(lower)) return { specialty: 'Gastroenterología', confidence: 0.55 };
  if (/ansied|depresi|estr[eé]s|p[aá]nico|insomnio/.test(lower)) return { specialty: 'Psiquiatría', confidence: 0.55 };
  if (/rodilla|espalda|hueso|articular|fractura/.test(lower)) return { specialty: 'Traumatología', confidence: 0.55 };
  if (lower.length > 10) return { specialty: 'Medicina General', confidence: 0.3 };
  return null;
}

function mapRoleToId(role: string): string {
  const mapping: Record<string, string> = {
    'general-practitioner': 'gp',
    dermatologist: 'derm',
    internist: 'int',
    psychiatrist: 'psych',
  };
  return mapping[role] || role;
}

function mapAgreementLevel(level: string): ConsensusResult['level'] {
  const mapping: Record<string, ConsensusResult['level']> = {
    strong: 'high',
    moderate: 'moderate',
    weak: 'low',
    disagreement: 'low',
  };
  return mapping[level] || 'moderate';
}

function setStepProgress(step: FlowStep, list: ReasoningStep[]) {
  const doneMap: Record<string, boolean> = {
    symptoms: step !== 'welcome',
    duration: getStepIndex(step) >= getStepIndex('duration'),
    severity: getStepIndex(step) >= getStepIndex('severity'),
    specialty: false,
    redflags: false,
    urgency: false,
    summary: false,
  };

  return list.map((item) => {
    if (item.status === 'done') return item;
    if (doneMap[item.id]) return { ...item, status: 'done' as const };
    return item;
  });
}

function ChatBubble({
  role,
  children,
  subtle = false,
}: {
  role: ChatRole;
  children: ReactNode;
  subtle?: boolean;
}) {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
          <Stethoscope className={cn('h-4 w-4', isSystem ? 'text-muted-foreground' : 'text-ink')} />
        </div>
      )}
      <div
        className={cn(
          'max-w-[min(36rem,calc(100vw-6rem))] rounded-xl border px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,37,95,0.04)]',
          isUser
            ? 'border-primary/20 bg-primary text-primary-foreground'
            : isSystem
              ? 'border-border bg-muted text-foreground'
              : subtle
                ? 'border-border bg-secondary/70 text-foreground'
                : 'border-border bg-card text-foreground',
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'vital' | 'warning' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
        tone === 'vital'
          ? 'border-vital/20 bg-vital/10 text-vital'
          : tone === 'warning'
            ? 'border-destructive/20 bg-destructive/10 text-destructive'
            : 'border-border bg-card text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
}

function QuickStartRail({
  formData,
  onQuickStart,
  emergencyDetected,
}: {
  formData: FormData;
  onQuickStart: (seed: string) => void;
  emergencyDetected: RedFlagResult | null;
}) {
  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
          <Stethoscope className="h-4.5 w-4.5 text-ink" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Dr. Simeon</p>
          <p className="text-xs text-muted-foreground">Orientación clínica inicial</p>
        </div>
      </div>

      <section className="space-y-3 border-t border-border pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Atajos</p>
          <p className="mt-1 text-sm text-foreground">Empieza con lo que mejor describa el caso.</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_STARTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickStart(item.seed)}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-secondary/60"
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted-foreground">Usar</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 border-t border-border pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contexto</p>
          <p className="mt-1 text-sm text-foreground">Lo que ya registró el caso.</p>
        </div>
        <div className="space-y-2 text-sm">
          <ContextLine label="Motivo" value={formData.chiefComplaint || 'Pendiente'} />
          <ContextLine label="Síntomas" value={formData.symptomsDescription || 'Pendiente'} />
          <ContextLine label="Duración" value={formData.symptomDuration || 'Pendiente'} />
          <ContextLine label="Intensidad" value={`${formData.symptomSeverity}/10`} />
          <ContextLine label="Inicio" value={formData.onsetType ? (formData.onsetType === 'sudden' ? 'De repente' : 'Gradual') : 'Pendiente'} />
        </div>
      </section>

      <section className="space-y-3 border-t border-border pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Seguridad</p>
          <p className="mt-1 text-sm text-foreground">La orientación no sustituye la valoración médica.</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Dr. Simeon ordena el caso, detecta señales de alarma y sugiere el siguiente paso. Si ya apareció una alerta, se muestra aquí sin ruido.
        </p>
        <AnimatePresence>
          {emergencyDetected?.detected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={cn(
                'rounded-xl border px-3 py-2 text-sm',
                emergencyDetected.requiresEmergencyEscalation
                  ? 'border-destructive/20 bg-destructive/10 text-destructive'
                  : 'border-amber-300/30 bg-amber-50 text-amber-900',
              )}
            >
              {emergencyDetected.flags[0]?.message}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="mt-auto border-t border-border pt-4">
        <Link href="/app" className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ContextLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className="max-w-[12rem] text-right text-sm text-foreground">{value}</span>
    </div>
  );
}

function formatConsensusDiagnosis(value: string | { name?: string } | null | undefined): string {
  if (!value) return 'Sin consenso todavía';
  return typeof value === 'string' ? value : value.name || 'Sin consenso todavía';
}

function ClinicalReviewRail({
  stage,
  primarySpecialty,
  urgencyLevel,
  reasoningSteps,
  phases,
  specialists,
  consensus,
  consultation,
  generationProgress,
}: {
  stage: FlowStep;
  primarySpecialty: string | null;
  urgencyLevel: string | null;
  reasoningSteps: ReasoningStep[];
  phases: SOAPPhaseStatus[];
  specialists: SpecialistAgent[];
  consensus: ConsensusResult | null;
  consultation: SOAPConsultation | null;
  generationProgress: number;
}) {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Revisión clínica</p>
            <p className="mt-1 text-sm text-foreground">Oculta por defecto, accesible cuando quieras revisar el porqué.</p>
          </div>
          <StatusPill label={stage === 'results' ? 'Lista' : stage === 'consulting' ? 'En curso' : 'Activa'} tone={stage === 'results' ? 'vital' : 'neutral'} />
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <ContextLine label="Especialidad" value={primarySpecialty ?? 'Evaluando'} />
          <ContextLine label="Urgencia" value={urgencyLevel ?? 'Evaluando'} />
          <ContextLine label="Siguiente paso" value={stage === 'results' ? 'Orientación lista' : stage === 'consulting' ? 'Síntesis en proceso' : 'Recopilando contexto'} />
        </div>
      </div>

      <details className="group rounded-xl border border-border bg-card p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ver cómo se revisó</p>
            <p className="mt-1 text-sm text-foreground">Pasos internos y síntesis clínica</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            {reasoningSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2 text-sm">
                {step.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-vital" />
                ) : step.status === 'active' ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-ink" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border border-border" />
                )}
                <span className={cn(step.status === 'done' ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <ContextLine label="Fases" value={phases.map((phase) => phase.phase).join(' · ') || 'Pendiente'} />
            <ContextLine label="Especialistas" value={specialists.length > 0 ? `${specialists.length} revisión/es` : 'Sin detalle visible'} />
            <ContextLine label="Consenso" value={consensus?.primaryDiagnosis || getDiagnosisLabel(consultation?.assessment?.consensus?.primaryDiagnosis) || 'Sin consenso todavía'} />
            <ContextLine label="Progreso interno" value={`${generationProgress}%`} />
          </div>

          {specialists.length > 0 && (
            <details className="group rounded-lg border border-border bg-muted/40 px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-foreground">
                <span>Detalle técnico</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
                {specialists.map((specialist) => (
                  <div key={specialist.id} className="flex items-center justify-between gap-3">
                    <span>{specialist.name}</span>
                    <span className="text-right">{specialist.specialty}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </details>
    </div>
  );
}

function CurrentPrompt({
  step,
  formData,
  stage,
}: {
  step: FlowStep;
  formData: FormData;
  stage: FlowStep;
}) {
  if (step === 'consulting' || step === 'results') return null;

  const question = getStepQuestion(step);
  const helper = getStepHelper(step);
  const answerPreview = formatStepAnswer(step, formData);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,37,95,0.04)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
          <Stethoscope className="h-4 w-4 text-ink" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Dr. Simeon</p>
            <Badge variant="outline" className="rounded-lg border-border bg-muted/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {stage === 'welcome' ? 'Inicio' : 'Siguiente paso'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-foreground">{question}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
          {answerPreview && step !== 'welcome' && (
            <div className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Lo que entendí: <span className="text-foreground">{answerPreview}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntakeComposer({
  step,
  draft,
  setDraft,
  formData,
  setFormData,
  onSubmitStep,
  onSeveritySelect,
  severityValue,
  onOnsetSelect,
  selectedDuration,
  onDurationSelect,
  isSubmitting,
}: {
  step: FlowStep;
  draft: string;
  setDraft: (value: string) => void;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  onSubmitStep: () => void;
  onSeveritySelect: (value: number) => void;
  severityValue: number;
  onOnsetSelect: (value: 'sudden' | 'gradual') => void;
  selectedDuration: string;
  onDurationSelect: (value: string) => void;
  isSubmitting: boolean;
}) {
  if (step === 'consulting') {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-ink" />
          <div>
            <p className="text-sm font-medium text-foreground">Revisando tu caso</p>
            <p className="text-xs text-muted-foreground">Ordenando síntomas, señales de alarma y siguiente paso.</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') return null;

  const config = STEP_COPY[step];
  const canSubmit =
    step === 'welcome'
      ? draft.trim().length > 0
      : step === 'symptoms'
        ? draft.trim().length >= 10
        : step === 'associated' || step === 'factors' || step === 'history'
          ? true
          : false;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,37,95,0.04)]">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Responde aquí</p>
        <p className="text-sm text-foreground">{config.title}</p>
        <p className="text-xs leading-5 text-muted-foreground">{config.helper}</p>
      </div>

      <div className="mt-4 space-y-3">
        {step === 'welcome' && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Motivo principal</label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={config.placeholder}
              className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (canSubmit) onSubmitStep();
                }
              }}
            />
          </div>
        )}

        {step === 'symptoms' && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Síntomas</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={config.placeholder}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-xs text-muted-foreground">{draft.length} caracteres</p>
          </div>
        )}

        {step === 'duration' && (
          <div className="grid grid-cols-2 gap-2">
            {['Menos de 1 hora', 'Hoy', '1-2 días', '3-7 días', '1-2 semanas', 'Más de 2 semanas', 'Meses'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onDurationSelect(option)}
                className={cn(
                  'rounded-lg border px-3 py-3 text-left text-sm transition-colors',
                  selectedDuration === option
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-secondary/60',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {step === 'severity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Intensidad actual</span>
              <span className="text-sm font-medium text-foreground">{severityValue}/10 · {getSeverityLabel(severityValue)}</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSeveritySelect(value)}
                  className={cn(
                    'rounded-lg border px-0 py-2 text-sm font-medium transition-colors',
                    severityValue === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-secondary/60',
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'onset' && (
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'sudden' as const, label: 'De repente', helper: 'Apareció de forma brusca' },
              { value: 'gradual' as const, label: 'Poco a poco', helper: 'Fue apareciendo gradualmente' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onOnsetSelect(option.value)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left transition-colors',
                  formData.onsetType === option.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/30 hover:bg-secondary/60',
                )}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className={cn('mt-1 text-xs', formData.onsetType === option.value ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {option.helper}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 'associated' && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Síntomas asociados</label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={config.placeholder}
              className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmitStep();
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {['Fiebre', 'Mareo', 'Náusea', 'Tos', 'Falta de aire'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setDraft(draft ? `${draft}, ${suggestion}` : suggestion)}
                  className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/30 hover:bg-secondary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'factors' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">¿Qué lo empeora?</label>
              <input
                value={formData.aggravatingFactors}
                onChange={(e) => setFormData((prev) => ({ ...prev, aggravatingFactors: e.target.value }))}
                placeholder="Ej: movimiento, comida, estrés"
                className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">¿Qué lo alivia?</label>
              <input
                value={formData.relievingFactors}
                onChange={(e) => setFormData((prev) => ({ ...prev, relievingFactors: e.target.value }))}
                placeholder="Ej: reposo, agua, medicamento"
                className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        )}

        {step === 'history' && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Antecedentes</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={config.placeholder}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Badge variant="outline" className="rounded-lg border-border bg-muted/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Paso {getStepIndex(step) + 1} de 8
        </Badge>
        {step !== 'duration' && step !== 'severity' && step !== 'onset' ? (
          <Button
            type="button"
            onClick={onSubmitStep}
            disabled={!canSubmit || isSubmitting}
            className="rounded-lg bg-ink px-4 text-primary-foreground hover:bg-ink/90"
          >
            {step === 'history' ? 'Iniciar revisión' : 'Continuar'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ConsultingStatus({
  consultationStage,
  reasoningSteps,
  phases,
}: {
  consultationStage: ConsultStage;
  reasoningSteps: ReasoningStep[];
  phases: SOAPPhaseStatus[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-ink" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {consultationStage === 'analyzing'
              ? 'Revisando tu caso'
              : consultationStage === 'consensus'
                ? 'Sintetizando orientación'
                : consultationStage === 'generating'
                  ? 'Generando resumen'
                  : consultationStage === 'complete'
                    ? 'Orientación lista'
                    : 'Preparando revisión'}
          </p>
          <p className="text-xs text-muted-foreground">Ordenando síntomas, urgencia y el siguiente paso.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {phases.map((phase) => (
          <StatusPill
            key={phase.phase}
            label={phase.phase}
            tone={phase.status === 'completed' ? 'vital' : phase.status === 'in-progress' ? 'warning' : 'neutral'}
          />
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {reasoningSteps.map((step) => (
          <div key={step.id} className="flex items-center gap-2 text-sm">
            {step.status === 'done' ? (
              <CheckCircle2 className="h-4 w-4 text-vital" />
            ) : step.status === 'active' ? (
              <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full border border-border" />
            )}
            <span className={cn(step.status === 'done' ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIConsultaClient({ userId }: AIConsultaClientProps) {
  const prefersReducedMotion = useReducedMotion();
  const transcriptRef = useRef<HTMLDivElement>(null);

  const [flowStep, setFlowStep] = useState<FlowStep>('welcome');
  const [draft, setDraft] = useState('');
  const [severityValue, setSeverityValue] = useState(5);
  const [selectedDuration, setSelectedDuration] = useState('');

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

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<SOAPConsultation | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistAgent[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [phases, setPhases] = useState<SOAPPhaseStatus[]>([]);
  const [emergencyDetected, setEmergencyDetected] = useState<RedFlagResult | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [consultationStage, setConsultationStage] = useState<ConsultStage>('intake');
  const [primarySpecialty, setPrimarySpecialty] = useState<string | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<string | null>(null);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>(INITIAL_REASONING_STEPS);
  const [generationProgress, setGenerationProgress] = useState(0);

  const currentPromptStep = useMemo(() => {
    if (flowStep === 'consulting' || flowStep === 'results') return flowStep;
    return flowStep;
  }, [flowStep]);

  const combinedText = useMemo(
    () => [formData.chiefComplaint, formData.symptomsDescription, formData.associatedSymptoms].join(' '),
    [formData.chiefComplaint, formData.symptomsDescription, formData.associatedSymptoms],
  );

  const updateFormData = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value as never }));
    setError(null);
  };

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, flowStep, consultationStage]);

  useEffect(() => {
    if (combinedText.trim().length < 5) {
      setEmergencyDetected(null);
      return;
    }

    const result = detectRedFlagsEnhanced(combinedText);
    setEmergencyDetected(result.detected ? result : null);
    if (result.detected && result.requiresEmergencyEscalation) {
      setShowEmergencyModal(true);
    }
  }, [combinedText]);

  useEffect(() => {
    const detected = detectSpecialtyFromText(combinedText);
    if (detected) {
      setPrimarySpecialty(detected.specialty);
    }
  }, [combinedText]);

  useEffect(() => {
    setReasoningSteps((prev) => {
      const next = prev.map((step) => {
        if (step.status === 'done') return step;
        if (step.id === 'symptoms' && formData.chiefComplaint.trim().length > 0) return { ...step, status: 'done' as const };
        if (step.id === 'duration' && formData.symptomDuration.trim().length > 0) return { ...step, status: 'done' as const };
        if (step.id === 'severity' && formData.symptomSeverity > 0) return { ...step, status: 'done' as const };
        if (step.id === 'specialty' && primarySpecialty) return { ...step, status: 'done' as const };
        if (step.id === 'redflags' && emergencyDetected !== null) return { ...step, status: 'done' as const };
        return step;
      });

      if (flowStep === 'consulting' || flowStep === 'results') {
        return next.map((step) => ({ ...step, status: 'done' as const }));
      }

      return next;
    });
  }, [emergencyDetected, flowStep, formData.chiefComplaint, formData.symptomDuration, formData.symptomSeverity, primarySpecialty]);

  useEffect(() => {
    const activeIndex = getStepIndex(flowStep);
    if (activeIndex >= getStepIndex('welcome') && activeIndex < getStepIndex('consulting')) {
      setReasoningSteps((prev) => setStepProgress(flowStep, prev));
      setConsultationStage('intake');
    }
  }, [flowStep]);

  useEffect(() => {
    if (flowStep === 'consulting') {
      setGenerationProgress(20);
    }
  }, [flowStep]);

  const pushTranscript = (userContent: string, assistantContent: string, subtle = false) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: 'user', content: userContent },
      { id: `${Date.now()}-assistant`, role: 'assistant', content: assistantContent, subtle },
    ]);
  };

  const commitCurrentStep = async () => {
    if (isSubmitting || flowStep === 'consulting' || flowStep === 'results') return;

    if (emergencyDetected?.requiresEmergencyEscalation) {
      setShowEmergencyModal(true);
      return;
    }

    const value = draft.trim();
    const nextStep = getNextStep(flowStep);

    if (!stepAllowsEmpty(flowStep) && !value) return;
    if (flowStep === 'welcome' && !value) return;
    if (flowStep === 'symptoms' && value.length < 10) return;

    if (flowStep === 'welcome') {
      updateFormData('chiefComplaint', value);
      pushTranscript(value, getFollowUp(flowStep, value));
      setDraft('');
      setFlowStep('symptoms');
      return;
    }

    if (flowStep === 'symptoms') {
      updateFormData('symptomsDescription', value);
      pushTranscript(value, getFollowUp(flowStep, value));
      setDraft('');
      setFlowStep(nextStep);
      return;
    }

    if (flowStep === 'associated') {
      updateFormData('associatedSymptoms', value);
      pushTranscript(value || 'Sin síntomas asociados adicionales', getFollowUp(flowStep, value));
      setDraft('');
      setFlowStep(nextStep);
      return;
    }

    if (flowStep === 'factors') {
      const summary = [formData.aggravatingFactors && `Empeora: ${formData.aggravatingFactors}`, formData.relievingFactors && `Alivia: ${formData.relievingFactors}`]
        .filter(Boolean)
        .join(' · ') || 'Sin factores añadidos';
      pushTranscript(summary, getFollowUp(flowStep, summary));
      setFlowStep(nextStep);
      return;
    }

    if (flowStep === 'history') {
      updateFormData('medicalHistory', value);
      pushTranscript(value || 'Sin antecedentes relevantes', getFollowUp(flowStep, value));
      setDraft('');
      await submitConsultation();
    }
  };

  const onQuickStart = (seed: string) => {
    if (isSubmitting) return;

    updateFormData('chiefComplaint', seed);
    setDraft('');
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-quick-user`, role: 'user', content: seed },
      {
        id: `${Date.now()}-quick-assistant`,
        role: 'assistant',
        content: 'Lo entendí. Ahora voy a precisar los síntomas y revisar si hay señales de alarma.',
      },
    ]);
    setFlowStep('symptoms');
  };

  const onDurationSelect = (value: string) => {
    updateFormData('symptomDuration', value);
    setSelectedDuration(value);
    pushTranscript(value, getFollowUp('duration', value));
    setFlowStep('severity');
  };

  const onSeveritySelect = (value: number) => {
    updateFormData('symptomSeverity', value);
    setSeverityValue(value);
    pushTranscript(`${value}/10`, getFollowUp('severity', `${value}/10`));
    setFlowStep('onset');
  };

  const onOnsetSelect = (value: 'sudden' | 'gradual') => {
    updateFormData('onsetType', value);
    pushTranscript(value === 'sudden' ? 'De repente' : 'Poco a poco', getFollowUp('onset', value));
    setFlowStep('associated');
  };

  const submitConsultation = async () => {
    if (emergencyDetected?.requiresEmergencyEscalation) {
      setShowEmergencyModal(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFlowStep('consulting');
    setConsultationStage('analyzing');
    setGenerationProgress(10);
    setReasoningSteps((prev) =>
      prev.map((step) => {
        if (['symptoms', 'duration', 'severity', 'specialty', 'redflags'].includes(step.id)) {
          return { ...step, status: 'done' as const };
        }
        if (step.id === 'urgency') return { ...step, status: 'active' as const };
        return step;
      }),
    );

    setPhases([
      { phase: 'subjective', status: 'completed', timestamp: new Date() },
      { phase: 'objective', status: 'in-progress' },
      { phase: 'assessment', status: 'pending' },
      { phase: 'plan', status: 'pending' },
    ]);

    const subjectiveData: SubjectiveData = {
      chiefComplaint: formData.chiefComplaint,
      symptomsDescription: formData.symptomsDescription,
      symptomDuration: formData.symptomDuration,
      symptomSeverity: formData.symptomSeverity,
      onsetType: formData.onsetType || 'gradual',
      associatedSymptoms: formData.associatedSymptoms ? formData.associatedSymptoms.split(',').map((item) => item.trim()) : [],
      aggravatingFactors: formData.aggravatingFactors ? formData.aggravatingFactors.split(',').map((item) => item.trim()) : [],
      relievingFactors: formData.relievingFactors ? formData.relievingFactors.split(',').map((item) => item.trim()) : [],
      previousTreatments: [],
      medicalHistory: formData.medicalHistory || undefined,
    };

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
      if (!reader) {
        throw new Error('No stream available');
      }

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
              try {
                eventData = JSON.parse(line.slice(6).trim());
              } catch {
                eventData = null;
              }
            }
          }

          if (!eventData) continue;

          try {
            switch (eventName) {
              case 'specialist_done': {
                const specialistId = mapRoleToId(eventData.specialist as string);
                completedSpecialistIds.push(specialistId);
                setSpecialists((prev) =>
                  prev.map((specialist) =>
                    specialist.id === specialistId
                      ? {
                          ...specialist,
                          confidence: Math.round(((eventData.confidence as number) || 0.7) * 100),
                          assessment: (eventData.diagnosis as string) || 'Evaluación completada',
                          status: 'completed' as const,
                        }
                      : specialist,
                  ),
                );
                setGenerationProgress((progress) => Math.min(progress + 12, 60));
                break;
              }
              case 'consensus_done': {
                setConsultationStage('consensus');
                const specialty = (eventData.specialty as string) || primarySpecialty;
                if (specialty) setPrimarySpecialty(specialty);
                const urgency = eventData.urgencyLevel as string;
                if (urgency) setUrgencyLevel(urgency);
                setConsensus({
                  score: Math.round(((eventData.confidence as number) || 0.7) * 100),
                  level: mapAgreementLevel((eventData.agreementLevel as string) || 'moderate'),
                  primaryDiagnosis: (eventData.primaryDiagnosis as string) || '',
                  differentialDiagnoses: [],
                  clinicalReasoning: `Urgencia: ${urgency || 'moderate'}`,
                  agreementPercentage: Math.round(((eventData.confidence as number) || 0.7) * 100),
                });
                setReasoningSteps((prev) =>
                  prev.map((step) =>
                    step.id === 'specialty' || step.id === 'urgency' ? { ...step, status: 'done' as const } : step,
                  ),
                );
                setGenerationProgress(70);
                break;
              }
              case 'plan_done': {
                setConsultationStage('generating');
                setPhases((prev) =>
                  prev.map((phase) =>
                    phase.phase === 'plan' ? { ...phase, status: 'completed', timestamp: new Date() } : phase,
                  ),
                );
                setGenerationProgress(88);
                break;
              }
              case 'complete': {
                finalConsultation = {
                  id: eventData.consultationId as string,
                  patientId: userId,
                  createdAt: new Date(),
                  completedAt: new Date(),
                  status: 'complete',
                  subjective: subjectiveData,
                  objective: {},
                  assessment: {
                    specialists: (eventData.specialists as SpecialistAgent[]) || [],
                    consensus: (eventData.consensus as ConsensusResult) || null,
                  },
                  plan: (eventData.plan as SOAPConsultation['plan']) || null,
                  metadata: { totalTokens: 0, totalCostUSD: 0, totalLatencyMs: 0, aiModel: 'glm-4-plus' },
                } as unknown as SOAPConsultation;
                break;
              }
              case 'error':
                throw new Error((eventData.error as string) || 'Error en consulta');
              default:
                break;
            }
          } catch (processingError) {
            if (processingError instanceof Error && processingError.message.includes('Error')) {
              throw processingError;
            }
            console.warn('Failed to process SSE event:', eventName, eventData);
          }
        }
      }

      setPhases([
        { phase: 'subjective', status: 'completed', timestamp: new Date() },
        { phase: 'objective', status: 'completed', timestamp: new Date() },
        { phase: 'assessment', status: 'completed', timestamp: new Date() },
        { phase: 'plan', status: 'completed', timestamp: new Date() },
      ]);
      setReasoningSteps((prev) => prev.map((step) => ({ ...step, status: 'done' as const })));
      setGenerationProgress(100);
      setConsultationStage('complete');
      setFlowStep('results');
      if (finalConsultation) setConsultation(finalConsultation);
      setPhases((prev) => prev.map((phase) => ({ ...phase, status: 'completed', timestamp: new Date() })));
      setUrgencyLevel(finalConsultation?.assessment?.consensus?.urgencyLevel || urgencyLevel);
    } catch (submitError) {
      console.error('Consultation error:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Error al procesar la consulta');
      setFlowStep('consulting');
      setConsultationStage('error');
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

  const startOver = () => {
    setFlowStep('welcome');
    setDraft('');
    setSeverityValue(5);
    setSelectedDuration('');
    setFormData({
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
    setMessages(INITIAL_MESSAGES);
    setConsultation(null);
    setSpecialists([]);
    setConsensus(null);
    setPhases([]);
    setEmergencyDetected(null);
    setShowEmergencyModal(false);
    setConsultationStage('intake');
    setPrimarySpecialty(null);
    setUrgencyLevel(null);
    setReasoningSteps(INITIAL_REASONING_STEPS);
    setGenerationProgress(0);
    setError(null);
  };

  const isReviewMode = flowStep === 'consulting' || flowStep === 'results';
  const currentPromptStepLabel = getStepQuestion(currentPromptStep);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
              <Stethoscope className="h-4 w-4 text-ink" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Preconsulta clínica</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dr. Simeon · Orientación inicial</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <StatusPill label={flowStep === 'results' ? 'Listo' : flowStep === 'consulting' ? 'Revisando' : 'Activo'} tone={flowStep === 'results' ? 'vital' : 'neutral'} />
            <Link href="/app" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Salir
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="hidden min-h-0 border-r border-border bg-muted/20 lg:block">
          <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <QuickStartRail formData={formData} onQuickStart={onQuickStart} emergencyDetected={emergencyDetected} />
          </div>
        </aside>

        <main className="min-h-0 min-w-0">
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-border bg-card/40 px-4 py-3 lg:hidden">
              <details className="group rounded-xl border border-border bg-card px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Atajos y contexto</p>
                    <p className="mt-1 text-sm text-foreground">Empieza rápido o revisa lo ya registrado</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 border-t border-border pt-4">
                  <QuickStartRail formData={formData} onQuickStart={onQuickStart} emergencyDetected={emergencyDetected} />
                </div>
              </details>
            </div>

            <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-32">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Conversación</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Dr. Simeon te guía una pregunta a la vez
                    </h1>
                  </div>
                  <StatusPill label={flowStep === 'consulting' ? 'En revisión' : flowStep === 'results' ? 'Lista' : 'Entrada'} tone={flowStep === 'results' ? 'vital' : 'neutral'} />
                </div>

                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Primero hablamos contigo. La revisión técnica queda en segundo plano y solo se abre si quieres ver cómo se llegó al siguiente paso.
                </p>

                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <ChatBubble key={message.id} role={message.role} subtle={message.subtle}>
                      <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                    </ChatBubble>
                  ))}
                </AnimatePresence>

                {!isReviewMode && currentPromptStepLabel && (
                  <CurrentPrompt step={currentPromptStep} stage={flowStep} formData={formData} />
                )}

                {flowStep === 'consulting' && <ConsultingStatus consultationStage={consultationStage} reasoningSteps={reasoningSteps} phases={phases} />}

                {flowStep === 'results' && consultation && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Orientación lista</p>
                        <p className="mt-1 text-sm text-foreground">Resumen clínico sin ruido adicional.</p>
                      </div>
                      <StatusPill label={urgencyLevel ?? 'Revisado'} tone={urgencyLevel === 'urgent' || urgencyLevel === 'emergency' ? 'warning' : 'vital'} />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <ContextLine
                        label="Especialidad"
                        value={formatConsensusDiagnosis(primarySpecialty ?? consultation.assessment?.consensus?.primaryDiagnosis)}
                      />
                      <ContextLine
                        label="Urgencia"
                        value={urgencyLevel ?? consultation.assessment?.consensus?.urgencyLevel ?? 'Evaluando'}
                      />
                    </div>
                    {consultation.plan?.recommendations?.length > 0 && (
                      <div className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-foreground">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recomendación principal</p>
                        <p className="mt-2 leading-6">{consultation.plan.recommendations[0]}</p>
                        {consultation.plan.followUpTiming && (
                          <p className="mt-2 text-xs text-muted-foreground">Seguimiento: {consultation.plan.followUpTiming}</p>
                        )}
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" onClick={startOver} variant="outline" className="rounded-lg border-border bg-background text-foreground">
                        Nueva consulta
                      </Button>
                      <Link href="/doctors">
                        <Button type="button" className="rounded-lg bg-ink text-primary-foreground hover:bg-ink/90">
                          Buscar doctor
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                      className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto w-full max-w-3xl">
                <IntakeComposer
                  step={flowStep}
                  draft={draft}
                  setDraft={setDraft}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmitStep={commitCurrentStep}
                  onSeveritySelect={onSeveritySelect}
                  severityValue={severityValue}
                  onOnsetSelect={onOnsetSelect}
                  selectedDuration={selectedDuration}
                  onDurationSelect={onDurationSelect}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden min-h-0 border-l border-border bg-muted/20 xl:block">
          <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
            <ClinicalReviewRail
              stage={flowStep}
              primarySpecialty={primarySpecialty}
              urgencyLevel={urgencyLevel}
              reasoningSteps={reasoningSteps}
            phases={phases}
            specialists={specialists}
            consensus={consensus}
            consultation={consultation}
            generationProgress={generationProgress}
          />
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {emergencyDetected?.detected && !emergencyDetected.requiresEmergencyEscalation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-[28rem]"
          >
            <EmergencyAlert
              message={emergencyDetected.flags[0].message}
              symptoms={emergencyDetected.flags.map((flag) => flag.category)}
              severity="high"
              onDismiss={() => setEmergencyDetected(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showEmergencyModal && emergencyDetected?.requiresEmergencyEscalation && (
        <EmergencyModal
          message={emergencyDetected.flags[0].message}
          symptoms={emergencyDetected.flags.map((flag) => flag.category)}
          severity="critical"
        />
      )}
    </div>
  );
}
