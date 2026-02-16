'use client';

import { ConversationalWelcome } from '@/components/soap';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return <ConversationalWelcome onStart={onNext} />;
}
