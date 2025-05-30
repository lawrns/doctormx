export interface Protocol {
  id: string;
  diagnosisId: string;
  stages: ProtocolStage[];
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtocolStage {
  stage: number;
  title: string;
  duration: string; // "2 weeks", "1 month"
  herbs: HerbPrescription[];
  lifestyle: LifestylePrescription[];
  metrics: string[];
  objectives: string[];
}

export interface HerbPrescription {
  herbId: string;
  herbName: string;
  dosage: string;
  frequency: string;
  preparation: string; // "tea", "tincture", "capsule"
  duration: string;
  instructions: string;
  contraindications?: string[];
}

export interface LifestylePrescription {
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'environment';
  recommendation: string;
  frequency: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProtocolTemplate {
  id: string;
  condition: string;
  stageNumber: number;
  content: {
    herbs: Omit<HerbPrescription, 'herbId'>[];
    lifestyle: LifestylePrescription[];
    metrics: string[];
  };
  locale: string;
}