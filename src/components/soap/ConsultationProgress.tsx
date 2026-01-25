'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ConsultationProgress as ConsultationProgressType } from '@/types/soap';
import { Clock, Users } from 'lucide-react';

interface ConsultationProgressProps {
  progress: ConsultationProgressType;
  agentDetails?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  className?: string;
}

function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}

function getSpecialistInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ConsultationProgress({
  progress,
  agentDetails = [],
  className,
}: ConsultationProgressProps) {
  const shouldReduceMotion = useReducedMotion();

  const completionPercentage =
    (progress.completedAgents.length / progress.totalAgents) * 100;

  const activeAgentDetails = agentDetails.filter((agent) =>
    progress.activeAgents.includes(agent.id)
  );

  return (
    <Card
      className={cn('w-full', className)}
      role="status"
      aria-live="polite"
      aria-label="Progreso de consulta"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Consulta en Progreso
            </CardTitle>
          </div>

          {progress.estimatedTimeRemaining !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 dark:bg-blue-950/50"
            >
              <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                {formatTimeRemaining(progress.estimatedTimeRemaining)}
              </span>
              <span className="sr-only">
                Tiempo estimado restante: {formatTimeRemaining(progress.estimatedTimeRemaining)}
              </span>
            </motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso general</span>
            <span className="font-semibold tabular-nums">
              {progress.completedAgents.length} / {progress.totalAgents}
            </span>
          </div>
          <Progress
            value={completionPercentage}
            className="h-2"
            aria-label={`Progreso: ${progress.completedAgents.length} de ${progress.totalAgents} especialistas completados`}
          />
        </div>

        {/* Active Agents */}
        {activeAgentDetails.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Especialistas analizando
            </h3>
            <div className="grid gap-3">
              {activeAgentDetails.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                  }}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                >
                  {/* Pulsing Avatar */}
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={agent.avatar} alt={agent.name} />
                      <AvatarFallback className="text-xs">
                        {getSpecialistInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Pulse Ring */}
                    {!shouldReduceMotion && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-500"
                        animate={{
                          scale: [1, 1.3],
                          opacity: [0.6, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: index * 0.2,
                        }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Thinking Indicator */}
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-blue-500"
                      animate={{
                        scale: shouldReduceMotion ? 1 : [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      aria-label="Pensando"
                    >
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-white"
                        animate={{
                          opacity: shouldReduceMotion ? 1 : [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        aria-hidden="true"
                      />
                    </motion.div>
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <motion.div
                        className="flex gap-0.5"
                        aria-label="Analizando"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="h-1 w-1 rounded-full bg-blue-500"
                            animate={{
                              y: shouldReduceMotion ? 0 : [-2, 0, -2],
                              opacity: shouldReduceMotion ? 0.7 : [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: i * 0.1,
                            }}
                            aria-hidden="true"
                          />
                        ))}
                      </motion.div>
                      <span className="text-xs text-muted-foreground">
                        Analizando
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Current Phase Indicator */}
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 px-4 py-3 dark:bg-blue-950/30">
          <p className="text-sm">
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Fase actual:
            </span>{' '}
            <span className="text-blue-700 dark:text-blue-300">
              {progress.currentPhase === 'subjective' && 'Recopilación de síntomas'}
              {progress.currentPhase === 'objective' && 'Análisis de datos clínicos'}
              {progress.currentPhase === 'assessment' && 'Evaluación diagnóstica'}
              {progress.currentPhase === 'plan' && 'Generación de plan de tratamiento'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
