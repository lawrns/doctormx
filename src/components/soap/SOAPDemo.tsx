'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  SpecialistConsultation,
  ConsensusMatrix,
  SOAPTimeline,
  ConsultationProgress,
} from './index';
import type {
  SpecialistAgent,
  ConsensusResult,
  SOAPPhaseStatus,
  ConsultationProgress as ConsultationProgressType,
} from '@/types/soap';

/**
 * Demo Component - Shows all SOAP UI components in action
 *
 * This component demonstrates the beautiful animated SOAP workflow
 * components with realistic medical consultation data.
 */
export function SOAPDemo() {
  // Fix hydration mismatch: use stable timestamp from useState initializer
  // This ensures server and client render the same value
  const [demoTimestamp] = useState(() => Date.now());

  // Real doctor photos from Unsplash
  const specialtyAvatars: Record<string, string> = {
    cardiology: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    general: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    neurology: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    psychology: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    dermatology: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
  };

  // Example data for specialists
  const specialists: SpecialistAgent[] = [
    {
      id: '1',
      name: 'Dr. María González',
      specialty: 'cardiology',
      avatar: specialtyAvatars.cardiology,
      confidence: 87,
      assessment:
        'Los síntomas sugieren posible taquicardia paroxística. Se recomienda realizar ECG y monitoreo Holter de 24 horas para confirmar el diagnóstico.',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'general',
      avatar: specialtyAvatars.general,
      confidence: 92,
      assessment:
        'Presentación clásica de arritmia benigna. Antecedentes del paciente y examen físico son consistentes con episodios de palpitaciones no graves.',
      status: 'completed',
    },
    {
      id: '3',
      name: 'Dra. Ana Martínez',
      specialty: 'neurology',
      avatar: specialtyAvatars.neurology,
      confidence: 78,
      assessment:
        'Importante descartar causas neurológicas. Los episodios de mareo asociados requieren evaluación complementaria para excluir componente vestibular.',
      status: 'thinking',
    },
    {
      id: '4',
      name: 'Dr. Roberto Silva',
      specialty: 'psychology',
      avatar: specialtyAvatars.psychology,
      confidence: 0,
      assessment: '',
      status: 'pending',
    },
  ];

  // Example consensus data
  const consensus: ConsensusResult = {
    score: 82.3,
    level: 'high',
    primaryDiagnosis: 'Taquicardia Paroxística Supraventricular (TPSV)',
    differentialDiagnoses: [
      'Taquicardia sinusal inapropiada',
      'Síndrome de taquicardia postural ortostática (POTS)',
      'Ansiedad con somatización cardiovascular',
    ],
    clinicalReasoning:
      'Basado en el consenso de múltiples especialistas, los síntomas de palpitaciones súbitas con duración limitada, acompañadas de mareo ocasional y sin pérdida de conciencia, son altamente sugestivos de TPSV. La edad del paciente y la ausencia de antecedentes cardíacos significativos apoyan este diagnóstico. Se recomienda confirmación mediante estudios electrofisiológicos.',
    agreementPercentage: 85,
  };

  // Example SOAP timeline phases
  // Using demoTimestamp to avoid hydration mismatch (server/client Date.now() differs)
  const phases: SOAPPhaseStatus[] = [
    {
      phase: 'subjective',
      status: 'completed',
      timestamp: new Date(demoTimestamp - 600000), // 10 minutes ago
    },
    {
      phase: 'objective',
      status: 'completed',
      timestamp: new Date(demoTimestamp - 300000), // 5 minutes ago
    },
    {
      phase: 'assessment',
      status: 'in-progress',
    },
    {
      phase: 'plan',
      status: 'pending',
    },
  ];

  // Example consultation progress
  const progress: ConsultationProgressType = {
    currentPhase: 'assessment',
    activeAgents: ['3'], // Dr. Ana Martínez is thinking
    completedAgents: ['1', '2'],
    totalAgents: 4,
    estimatedTimeRemaining: 45,
  };

  const agentDetails = specialists.map((s) => ({
    id: s.id,
    name: s.name,
    avatar: s.avatar,
  }));

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Demo: Sistema SOAP Multi-Especialista</h1>
        <p className="text-muted-foreground">
          Componentes animados con Framer Motion, accesibles (WCAG 2.1 AA), y
          totalmente responsive.
        </p>
      </div>

      {/* SOAP Timeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Línea de Tiempo SOAP</h2>
        <SOAPTimeline phases={phases} currentPhase="assessment" />
      </section>

      {/* Consultation Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Progreso de Consulta</h2>
        <ConsultationProgress progress={progress} agentDetails={agentDetails} />
      </section>

      {/* Specialist Consultation Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Consulta de Especialistas</h2>
        <SpecialistConsultation agents={specialists} />
      </section>

      {/* Consensus Matrix */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Matriz de Consenso</h2>
        <ConsensusMatrix consensus={consensus} />
      </section>

      {/* Accessibility Note */}
      <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950/30">
        <h3 className="font-semibold text-green-900 dark:text-green-100">
          Características de Accesibilidad
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
          <li>• Detecta preferencia de movimiento reducido (prefers-reduced-motion)</li>
          <li>• Mínimo 44x44px en objetivos táctiles (touch targets)</li>
          <li>• Contraste 4.5:1 en todos los textos</li>
          <li>• Compatible con lectores de pantalla (ARIA labels)</li>
          <li>• Navegación completa por teclado</li>
          <li>• Responsive: 375px+ (mobile-first)</li>
        </ul>
      </div>
    </div>
  );
}
