'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Baby,
  Brain,
  Check,
  Eye,
  Heart,
  Smile,
  Sparkles,
  Stethoscope,
  Wind,
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

type ReasoningVisualizerSummary = {
  urgencyLevel: UrgencyLevel;
  suggestedSpecialty: string;
  confidence?: number;
  redFlags?: string[];
};

type ReasoningVisualizerProps = {
  isLoading: boolean;
  messageCount: number; // user messages only
  summary: ReasoningVisualizerSummary | null;
};

// ─── Specialty config ────────────────────────────────────────────────────────

type SpecialtyConfig = {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};

function getSpecialtyConfig(specialty: string): SpecialtyConfig {
  const lower = specialty.toLowerCase();
  if (lower.includes('cardio') || lower.includes('corazon') || lower.includes('corazón'))
    return { icon: Heart, color: '#ef4444', bg: 'bg-red-500/15' };
  if (lower.includes('neurol') || lower.includes('cerebro'))
    return { icon: Brain, color: '#a855f7', bg: 'bg-purple-500/15' };
  if (lower.includes('oftalm') || lower.includes('ojo') || lower.includes('vision') || lower.includes('visión'))
    return { icon: Eye, color: '#3b82f6', bg: 'bg-primary/15' };
  if (lower.includes('pediatr') || lower.includes('niño') || lower.includes('infant'))
    return { icon: Baby, color: '#ec4899', bg: 'bg-pink-500/15' };
  if (lower.includes('dermatol') || lower.includes('piel') || lower.includes('cutane'))
    return { icon: Smile, color: '#f97316', bg: 'bg-orange-500/15' };
  if (lower.includes('pulmon') || lower.includes('respir') || lower.includes('bronq'))
    return { icon: Wind, color: '#06b6d4', bg: 'bg-cyan-500/15' };
  if (lower.includes('gastro') || lower.includes('digest') || lower.includes('estomag'))
    return { icon: Activity, color: '#22c55e', bg: 'bg-green-500/15' };
  if (lower.includes('psiquiat') || lower.includes('psicol') || lower.includes('mental') || lower.includes('ansied'))
    return { icon: Sparkles, color: '#8b5cf6', bg: 'bg-violet-500/15' };
  return { icon: Stethoscope, color: 'hsl(197 56% 55%)', bg: 'bg-sky-500/15' };
}

// ─── Urgency label ────────────────────────────────────────────────────────────

const URGENCY_MAP: Record<UrgencyLevel, { label: string; className: string }> = {
  low: { label: 'Urgencia baja', className: 'text-[hsl(var(--trust))] border-[hsl(var(--trust)/0.30)] bg-[hsl(var(--trust)/0.10)]' },
  medium: { label: 'Urgencia media', className: 'text-[hsl(var(--danger))] border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/10' },
  high: { label: 'Urgencia alta', className: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  emergency: { label: 'Emergencia', className: 'text-red-400 border-red-500/30 bg-red-500/10' },
};

// ─── Stage definitions ────────────────────────────────────────────────────────

const STAGES = [
  { threshold: 1, label: 'Reconociendo síntomas', icon: '🔍' },
  { threshold: 2, label: 'Evaluando severidad', icon: '⚡' },
  { threshold: 3, label: 'Detectando especialidad', icon: '🎯' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ReasoningVisualizer({ isLoading, messageCount, summary }: ReasoningVisualizerProps) {
  const prefersReducedMotion = useReducedMotion();
  const specialtyConfig = summary ? getSpecialtyConfig(summary.suggestedSpecialty) : null;
  const SpecialtyIcon = specialtyConfig?.icon ?? Stethoscope;

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* ── Stage progress cards ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-4 font-mono">Análisis en progreso</p>
        {STAGES.map((stage) => {
          const unlocked = messageCount >= stage.threshold || summary !== null;
          const active = messageCount === stage.threshold && isLoading && !summary;
          return (
            <motion.div
              key={stage.threshold}
              variants={prefersReducedMotion ? undefined : {
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={unlocked ? (prefersReducedMotion ? undefined : 'visible') : undefined}
              transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors',
                unlocked
                  ? 'border-border bg-muted text-foreground'
                  : 'border-border/60 bg-card/60 text-muted-foreground',
              )}
            >
              {/* Check / dot */}
              <AnimatePresence mode="wait">
                {unlocked ? (
                  <motion.div
                    key="check"
                    initial={prefersReducedMotion ? undefined : { scale: 0 }}
                    animate={prefersReducedMotion ? undefined : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--trust)/0.20)]"
                  >
                    <Check className="h-3 w-3 text-[hsl(var(--trust))]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="dot"
                    className={cn(
                      'h-5 w-5 shrink-0 rounded-full border-2 border-border',
                      active ? 'border-primary' : '',
                    )}
                  />
                )}
              </AnimatePresence>

              <span className="flex-1">{stage.label}</span>

              {/* Breathing pulse when this stage is active */}
              {active && !prefersReducedMotion && (
                <motion.span
                  className="h-2 w-2 shrink-0 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Breathing pulse / loading indicator ──────────────────── */}
      <AnimatePresence>
        {isLoading && !summary && (
          <motion.div
            key="loading-state"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
          >
            <div className="flex items-center gap-3">
              {/* Breathing circle */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.15, 0.6] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <Stethoscope className="relative h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Analizando tu caso</p>
                <div className="mt-1.5 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      style={{
                        animation: prefersReducedMotion ? 'none' : `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Specialty reveal on completion ───────────────────────── */}
      <AnimatePresence>
        {summary && (
          <motion.div
            key="specialty-reveal"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
          >
            {/* Specialty icon + name */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={prefersReducedMotion ? undefined : { scale: 0.6, rotate: -10 }}
                animate={prefersReducedMotion ? undefined : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', specialtyConfig?.bg)}
              >
                <SpecialtyIcon
                  className="h-6 w-6"
                  style={{ color: specialtyConfig?.color }}
                />
              </motion.div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Especialidad detectada</p>
                <p className="mt-0.5 text-base font-semibold text-foreground">{summary.suggestedSpecialty}</p>
              </div>
            </div>

            {/* Urgency badge */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  URGENCY_MAP[summary.urgencyLevel].className,
                )}
              >
                {URGENCY_MAP[summary.urgencyLevel].label}
              </span>
            </div>

            {/* Confidence bar */}
            {typeof summary.confidence === 'number' && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Confianza del diagnóstico</span>
                  <span className="font-medium text-foreground">{Math.round(summary.confidence * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={prefersReducedMotion ? undefined : { width: 0 }}
                    animate={prefersReducedMotion ? undefined : { width: `${summary.confidence * 100}%` }}
                    transition={{ duration: 0.8, ease: [0, 0, 0.2, 1], delay: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Red flags */}
            {Array.isArray(summary.redFlags) && summary.redFlags.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-400 font-mono">
                  Alertas detectadas
                </p>
                <ul className="space-y-1">
                  {summary.redFlags.slice(0, 3).map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-300">
                      <span className="mt-0.5 shrink-0 text-red-400">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
