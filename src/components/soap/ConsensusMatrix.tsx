'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ConsensusResult as PublicConsensusResult } from '@/types/soap';
import type {
  ConsensusResult as SoapConsensusResult,
  DiagnosisCandidate,
} from '@/lib/soap/types';

type ConsensusLike = PublicConsensusResult | SoapConsensusResult;

interface ConsensusMatrixProps {
  consensus: ConsensusLike;
  className?: string;
}

function isPublicConsensus(
  consensus: ConsensusLike
): consensus is PublicConsensusResult {
  return 'score' in consensus;
}

function getPrimaryDiagnosisLabel(consensus: ConsensusLike): string {
  if (isPublicConsensus(consensus)) {
    return consensus.primaryDiagnosis || 'Orientación clínica';
  }

  if (!consensus.primaryDiagnosis) {
    return 'Orientación clínica';
  }

  return consensus.primaryDiagnosis.name;
}

function getAgreementLabel(consensus: ConsensusLike): string {
  if (isPublicConsensus(consensus)) {
    return `${consensus.agreementPercentage}%`;
  }

  return `${Math.round(consensus.kendallW * 100)}%`;
}

function getConsensusLabel(consensus: ConsensusLike): string {
  if (isPublicConsensus(consensus)) {
    switch (consensus.level) {
      case 'high':
        return 'Alto';
      case 'moderate':
        return 'Moderado';
      case 'low':
        return 'Bajo';
    }
  }

  switch (consensus.agreementLevel) {
    case 'strong':
      return 'Alto';
    case 'moderate':
      return 'Moderado';
    case 'weak':
      return 'Bajo';
    case 'disagreement':
      return 'Bajo';
  }

  return 'Moderado';
}

function getConsensusTone(consensus: ConsensusLike): string {
  if (isPublicConsensus(consensus)) {
    switch (consensus.level) {
      case 'high':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700';
      case 'moderate':
        return 'border-border bg-muted/60 text-foreground';
      case 'low':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-700';
    }
  }

  switch (consensus.agreementLevel) {
    case 'strong':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700';
    case 'moderate':
      return 'border-border bg-muted/60 text-foreground';
    case 'weak':
    case 'disagreement':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-700';
  }

  return 'border-border bg-muted/60 text-foreground';
}

function getReasoningText(consensus: ConsensusLike): string {
  if (isPublicConsensus(consensus)) {
    return consensus.clinicalReasoning;
  }

  return consensus.supervisorSummary;
}

function getDifferentialLabels(consensus: ConsensusLike): string[] {
  if (isPublicConsensus(consensus)) {
    return consensus.differentialDiagnoses;
  }

  return consensus.differentialDiagnoses.map((candidate: DiagnosisCandidate) => candidate.name);
}

function getSecondaryLabel(consensus: ConsensusLike): string {
  if (isPublicConsensus(consensus)) {
    return `Kendall's W ${Math.round(consensus.score)}`;
  }

  return consensus.consensusCategory;
}

export function ConsensusMatrix({ consensus, className }: ConsensusMatrixProps) {
  const shouldReduceMotion = useReducedMotion();
  const primaryDiagnosis = getPrimaryDiagnosisLabel(consensus);
  const agreementLabel = getAgreementLabel(consensus);
  const consensusLabel = getConsensusLabel(consensus);
  const reasoningText = getReasoningText(consensus);
  const differentialLabels = getDifferentialLabels(consensus);

  return (
    <Card
      className={cn('rounded-xl border-border/70 shadow-sm', className)}
      role="region"
      aria-label="Resumen de consenso clínico"
    >
      <CardHeader className="space-y-2 border-b border-border/60 px-4 py-4 md:px-5">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold text-foreground">
            Resumen de consenso clínico
          </CardTitle>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          La lectura principal queda visible y el razonamiento completo se mantiene detrás de una vista desplegable.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatBlock label="Consenso" value={consensusLabel} tone={getConsensusTone(consensus)} />
          <StatBlock label="Concordancia" value={agreementLabel} tone="border-border bg-muted/60 text-foreground" />
          <StatBlock label="Diagnóstico" value={primaryDiagnosis} tone="border-border bg-muted/30 text-foreground" />
        </div>

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Orientación principal</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {primaryDiagnosis}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {getSecondaryLabel(consensus)}
          </p>
        </div>

        <details className="group rounded-xl border border-border/70 bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/30 focus-visible:bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Ver cómo se revisó</span>
            </div>
            <ChevronDown
              className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>

          <div className="space-y-4 border-t border-border/60 px-4 py-4">
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="max-w-3xl text-sm leading-relaxed text-muted-foreground"
            >
              {reasoningText}
            </motion.p>

            {differentialLabels.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Diferenciales
                </p>
                <ul className="space-y-2" role="list">
                  {differentialLabels.map((diagnosis, index) => (
                    <motion.li
                      key={`${diagnosis}-${index}`}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: shouldReduceMotion ? 0 : index * 0.04,
                      }}
                      className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm text-foreground"
                    >
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="leading-relaxed">{diagnosis}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </details>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>Detalle clínico compacto</span>
          <Badge variant="outline" className="rounded-lg border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium">
            Vista secundaria
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={cn('rounded-xl border px-3 py-3', tone)}>
      <p className="text-[11px] uppercase tracking-wide text-current/70">{label}</p>
      <p className="mt-1 text-sm font-medium leading-tight text-current">{value}</p>
    </div>
  );
}
