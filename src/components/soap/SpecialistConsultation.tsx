'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { SpecialistAgent } from '@/types/soap';

interface SpecialistConsultationProps {
  agents: SpecialistAgent[];
  className?: string;
}

const specialtyLabels: Record<string, string> = {
  general: 'Médico General',
  cardiology: 'Cardiología',
  dermatology: 'Dermatología',
  neurology: 'Neurología',
  orthopedics: 'Ortopedia',
  oncology: 'Oncología',
  radiology: 'Radiología',
  psychology: 'Psicología',
};

const specialtyColors: Record<string, string> = {
  general: 'bg-blue-500',
  cardiology: 'bg-red-500',
  dermatology: 'bg-purple-500',
  neurology: 'bg-indigo-500',
  orthopedics: 'bg-green-500',
  oncology: 'bg-orange-500',
  radiology: 'bg-cyan-500',
  psychology: 'bg-pink-500',
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'bg-green-500';
  if (confidence >= 60) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function getSpecialistInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function SpecialistConsultation({
  agents,
  className,
}: SpecialistConsultationProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className={cn('w-full', className)}
      role="region"
      aria-label="Consulta de especialistas"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: shouldReduceMotion ? 0 : index * 0.1,
              ease: 'easeOut',
            }}
          >
            <SpecialistCard agent={agent} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

interface SpecialistCardProps {
  agent: SpecialistAgent;
}

function SpecialistCard({ agent }: SpecialistCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [displayedConfidence, setDisplayedConfidence] = React.useState(0);

  // Animate confidence from 0 to actual value with proper cleanup
  React.useEffect(() => {
    if (agent.status !== 'completed') return;

    const duration = shouldReduceMotion ? 0 : 1000;
    const startTime = Date.now();
    let frameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedConfidence(Math.round(eased * agent.confidence));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    // Cleanup: cancel animation frame on unmount or dependency change
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [agent.confidence, agent.status, shouldReduceMotion]);

  return (
    <Card
      className={cn(
        'h-full transition-shadow hover:shadow-md',
        agent.status === 'completed' && 'border-green-200 dark:border-green-800'
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar
            className={cn(
              'h-14 w-14 ring-2 ring-offset-2 shadow-sm',
              specialtyColors[agent.specialty]?.replace('bg-', 'ring-') || 'ring-gray-500'
            )}
            aria-label={`Avatar de ${agent.name}`}
          >
            <AvatarImage
              src={agent.avatar}
              alt={agent.name}
              className="object-cover"
            />
            <AvatarFallback
              className={cn(
                'text-white text-base font-semibold',
                specialtyColors[agent.specialty] || 'bg-gray-500'
              )}
            >
              {getSpecialistInitials(agent.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{agent.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {specialtyLabels[agent.specialty] || agent.specialty}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confianza</span>
            <motion.span
              className="font-semibold tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              aria-live="polite"
              aria-atomic="true"
            >
              {displayedConfidence}%
            </motion.span>
          </div>

          <div className="relative">
            <Progress
              value={displayedConfidence}
              className="h-2"
              aria-label={`Nivel de confianza: ${displayedConfidence}%`}
            />
            <motion.div
              className={cn(
                'absolute top-0 left-0 h-full rounded-full',
                getConfidenceColor(agent.confidence)
              )}
              initial={{ width: 0 }}
              animate={{
                width: shouldReduceMotion
                  ? `${displayedConfidence}%`
                  : `${displayedConfidence}%`,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1,
                ease: 'easeOut',
              }}
            />
          </div>
        </div>

        {/* Assessment */}
        {agent.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium">Evaluación</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {agent.assessment}
            </p>
          </motion.div>
        )}

        {/* Thinking State */}
        {agent.status === 'thinking' && (
          <motion.div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-blue-500"
              animate={{
                scale: shouldReduceMotion ? 1 : [1, 1.2, 1],
                opacity: shouldReduceMotion ? 0.7 : [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              aria-hidden="true"
            />
            <span>Analizando...</span>
          </motion.div>
        )}

        {/* Pending State */}
        {agent.status === 'pending' && (
          <div className="text-sm text-muted-foreground">
            Esperando turno...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
