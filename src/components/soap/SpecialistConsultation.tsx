'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  Clock3,
  MessageSquareText,
  Stethoscope,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const statusLabels: Record<SpecialistAgent['status'], string> = {
  pending: 'En espera',
  thinking: 'Revisando',
  completed: 'Listo',
};

const statusTone: Record<SpecialistAgent['status'], string> = {
  pending: 'border-border bg-muted/60 text-muted-foreground',
  thinking: 'border-primary/15 bg-primary/5 text-primary',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
};

function getSpecialistInitials(name: string): string {
  return name
    .split(' ')
    .map((segment) => segment[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function truncateToWords(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(' ')}...`;
}

export function SpecialistConsultation({
  agents,
  className,
}: SpecialistConsultationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!agents.length) {
    return (
      <Card
        className={cn('rounded-xl border-border/70 shadow-sm', className)}
        role="region"
        aria-label="Consulta de especialistas"
      >
        <CardContent className="p-5">
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              El detalle clínico aparecerá aquí cuando haya revisiones disponibles.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              La vista se mantiene compacta por defecto para no competir con la conversación principal.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section
      className={cn('w-full', className)}
      role="region"
      aria-label="Consulta de especialistas"
    >
      <Card className="overflow-hidden rounded-xl border-border/70 shadow-sm">
        <CardHeader className="space-y-2 border-b border-border/60 px-4 py-4 md:px-5">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Resumen del equipo clínico
            </CardTitle>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            El razonamiento se mantiene detrás de cada revisión. Abre un especialista solo si necesitas más contexto.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {agents.map((agent, index) => {
              const needsTruncation = (agent.assessment || '').trim().split(/\s+/).filter(Boolean).length > 36;

              return (
                <motion.details
                  key={agent.id}
                  className="group"
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                    ease: 'easeOut',
                  }}
                >
                  <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-4 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 md:px-5">
                    <Avatar className="h-10 w-10 shrink-0 rounded-xl border border-border/70 bg-muted">
                      <AvatarImage
                        src={agent.avatar}
                        alt={agent.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-xl bg-muted text-sm font-medium text-foreground">
                        {getSpecialistInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="truncate text-sm font-medium text-foreground">
                              {agent.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {specialtyLabels[agent.specialty] || agent.specialty}
                            </span>
                          </div>

                          {agent.responseTime ? (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                              Respuesta en {agent.responseTime}s
                            </p>
                          ) : null}
                        </div>

                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-[11px] font-medium',
                            statusTone[agent.status]
                          )}
                        >
                          {statusLabels[agent.status]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {agent.status === 'completed'
                            ? 'Ver evaluación clínica'
                            : agent.status === 'thinking'
                              ? 'Análisis en curso'
                              : 'Detalle disponible cuando haya revisión'}
                        </span>
                      </div>
                    </div>

                    <ChevronDown
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>

                  <div className="px-4 pb-4 md:px-5">
                    <div className="ml-14 border-l border-border/60 pl-4">
                      {agent.assessment ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {truncateToWords(agent.assessment, 42)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          El especialista todavía no agregó una evaluación final.
                        </p>
                      )}

                      {needsTruncation ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          El resumen está recortado para mantener la vista ligera.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.details>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
