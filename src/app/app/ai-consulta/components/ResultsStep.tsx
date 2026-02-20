'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SpecialistConsultation,
  ConsensusMatrix,
  SOAPTimeline,
} from '@/components/soap';
import { RecommendedDoctors } from '@/components/soap/RecommendedDoctors';
import { TreatmentPlanDisplay } from '@/components/soap/TreatmentPlanDisplay';
import { AIDisclaimer } from '@/components/ai/AIDisclaimer';
import type { ResultsStepProps } from '../types';
import { URGENCY_COLORS } from '../types';

export function ResultsStep({
  consultation,
  consensus,
  specialists,
  phases,
}: ResultsStepProps) {
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
            URGENCY_COLORS[consultation.assessment?.consensus.urgencyLevel ?? 'routine']
          }`}
        >
          Urgencia: {consultation.assessment?.consensus.urgencyLevel ?? 'routine'}
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
        <TreatmentPlanDisplay plan={consultation.plan} />
      )}

      {/* Warm Introduction - Recommended Doctors */}
      {consultation.plan?.referralNeeded && consultation.assessment?.consensus && (
        <RecommendedDoctors
          consultationId={consultation.id}
          consensus={consultation.assessment.consensus}
          patientHistory={{
            chiefComplaint: consultation.subjective.chiefComplaint,
            symptomsDescription: consultation.subjective.symptomsDescription,
            medicalHistory: consultation.subjective.medicalHistory,
          }}
          onSelectDoctor={(doctorId) => {
            window.location.href = `/book/${doctorId}?consultationId=${consultation.id}`;
          }}
        />
      )}

      {/* Generic CTA if no referral needed */}
      {!consultation.plan?.referralNeeded && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Todo listo</h3>
          <p className="text-green-50 mb-6">
            Sigue las recomendaciones y cuídate bien
          </p>
        </div>
      )}

      {/* Disclaimer IA obligatorio - Norma Enero 2026 */}
      <AIDisclaimer variant="full" />

      <div className="flex gap-3">
        <Link href="/app" className="flex-1">
          <Button variant="outline" className="w-full">
            Volver al Inicio
          </Button>
        </Link>
        <Link href="/doctores" className="flex-1">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
            Buscar Doctor
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
