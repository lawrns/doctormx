'use client';

import * as React from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConsensusResult } from '@/types/soap';
import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface ConsensusMatrixProps {
  consensus: ConsensusResult;
  className?: string;
}

function getConsensusIcon(level: ConsensusResult['level']) {
  switch (level) {
    case 'high':
      return CheckCircle2;
    case 'moderate':
      return TrendingUp;
    case 'low':
      return AlertCircle;
  }
}

function getConsensusBadgeVariant(
  level: ConsensusResult['level']
): 'default' | 'secondary' | 'outline' {
  switch (level) {
    case 'high':
      return 'default';
    case 'moderate':
      return 'secondary';
    case 'low':
      return 'outline';
  }
}

function getConsensusColor(level: ConsensusResult['level']): string {
  switch (level) {
    case 'high':
      return 'text-green-600 dark:text-green-400';
    case 'moderate':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'text-orange-600 dark:text-orange-400';
  }
}

export function ConsensusMatrix({ consensus, className }: ConsensusMatrixProps) {
  const shouldReduceMotion = useReducedMotion();

  // Animated consensus score with spring physics
  const scoreSpring = useSpring(0, {
    stiffness: shouldReduceMotion ? 500 : 100,
    damping: shouldReduceMotion ? 100 : 20,
  });

  const displayScore = useTransform(scoreSpring, (value) =>
    Math.round(value)
  );

  React.useEffect(() => {
    scoreSpring.set(consensus.score);
  }, [consensus.score, scoreSpring]);

  const Icon = getConsensusIcon(consensus.level);

  return (
    <Card className={cn('w-full', className)} role="region" aria-label="Matriz de consenso">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <CardTitle>Consenso Diagnóstico</CardTitle>
            <CardDescription>
              Evaluación multi-especialista con análisis de concordancia
            </CardDescription>
          </div>

          <Badge
            variant={getConsensusBadgeVariant(consensus.level)}
            className="shrink-0"
          >
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {consensus.level === 'high' && 'Alto consenso'}
            {consensus.level === 'moderate' && 'Consenso moderado'}
            {consensus.level === 'low' && 'Consenso bajo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Consensus Score */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <div className="relative">
            {/* Background circle */}
            <svg
              className="h-32 w-32 -rotate-90"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted opacity-20"
              />
              {/* Animated progress circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={getConsensusColor(consensus.level)}
                initial={{ strokeDasharray: `0 ${2 * Math.PI * 54}` }}
                animate={{
                  strokeDasharray: `${
                    (consensus.agreementPercentage / 100) * 2 * Math.PI * 54
                  } ${2 * Math.PI * 54}`,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 1.5,
                  ease: 'easeOut',
                }}
              />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold tabular-nums"
                aria-live="polite"
                aria-atomic="true"
              >
                {shouldReduceMotion ? (
                  consensus.score
                ) : (
                  <motion.span>{displayScore}</motion.span>
                )}
              </motion.span>
              <span className="text-xs text-muted-foreground mt-1">
                Kendall's W
              </span>
            </div>
          </div>
        </motion.div>

        {/* Primary Diagnosis */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            Diagnóstico Principal
          </h3>
          <p className="text-lg font-semibold leading-tight">
            {consensus.primaryDiagnosis}
          </p>
        </motion.div>

        {/* Clinical Reasoning */}
        {consensus.clinicalReasoning && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium text-muted-foreground">
              Razonamiento Clínico
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {consensus.clinicalReasoning}
            </p>
          </motion.div>
        )}

        {/* Differential Diagnoses */}
        {consensus.differentialDiagnoses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground">
              Diagnósticos Diferenciales
            </h3>
            <ul className="space-y-2" role="list">
              {consensus.differentialDiagnoses.map((diagnosis, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.5 + index * 0.05,
                    duration: 0.2,
                  }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{diagnosis}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Agreement Percentage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex items-center justify-between rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm"
        >
          <span className="text-muted-foreground">Acuerdo entre especialistas</span>
          <span className="font-semibold tabular-nums">
            {consensus.agreementPercentage}%
          </span>
        </motion.div>
      </CardContent>
    </Card>
  );
}
