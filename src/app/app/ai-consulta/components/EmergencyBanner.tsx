'use client';

import { EmergencyAlert } from '@/components/EmergencyAlert';
import type { RedFlagResult } from '@/lib/ai/red-flags-enhanced';

interface EmergencyBannerProps {
  emergency: RedFlagResult | null;
  onDismiss: () => void;
}

export function EmergencyBanner({ emergency, onDismiss }: EmergencyBannerProps) {
  if (!emergency?.detected || emergency.requiresEmergencyEscalation) return null;

  return (
    <div className="mb-6">
      <EmergencyAlert
        message={emergency.flags[0].message}
        symptoms={emergency.flags.map((f) => f.category)}
        severity="high"
        onDismiss={onDismiss}
      />
    </div>
  );
}
