'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  SpecialistConsultation,
  SOAPTimeline,
  ConsultationProgress,
} from '@/components/soap';
import type { ConsultingStepProps } from '../types';

export function ConsultingStep({
  specialists,
  progress,
  phases,
}: ConsultingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-8 h-8 text-blue-600" />
          </motion.div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Consultando especialistas...
        </h3>
        <p className="text-gray-600">
          Los doctores están analizando tu caso
        </p>
      </div>

      {phases.length > 0 && <SOAPTimeline phases={phases} currentPhase="assessment" />}

      {progress && (
        <ConsultationProgress
          progress={progress}
          agentDetails={specialists.map((s) => ({
            id: s.id,
            name: s.name,
            avatar: s.avatar,
          }))}
        />
      )}

      <SpecialistConsultation agents={specialists} />

      <Card className="p-4 bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-800 text-center">
          Este proceso puede tardar hasta 60 segundos. Por favor espera...
        </p>
      </Card>
    </motion.div>
  );
}
