/**
 * Treatment protocol and progress tracking type definitions for DoctorMX
 */

export interface Protocol {
  id: string;
  diagnosisId: string;
  userId?: string;
  stages: ProtocolStage[];
  status: 'draft' | 'active' | 'completed' | 'paused';
  constitutionalProfile?: string; // Profile ID for personalization
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtocolStage {
  stage: number;
  title: string;
  description: string;
  duration: string; // e.g., "2 weeks", "1 month"
  herbs: HerbPrescription[];
  lifestyle: LifestyleRecommendation[];
  metrics: string[]; // Metrics to track during this stage
  completionCriteria: string[];
  isCompleted: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface HerbPrescription {
  herbId: string;
  herbName: string;
  form: 'tea' | 'tincture' | 'capsule' | 'powder' | 'oil' | 'fresh';
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  contraindications?: string[];
  notes?: string;
}

export interface LifestyleRecommendation {
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'environment';
  title: string;
  description: string;
  frequency?: string;
  duration?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ProtocolTemplate {
  id: string;
  condition: string;
  stageNumber: number;
  content: {
    herbs: Omit<HerbPrescription, 'herbId'>[];
    lifestyle: LifestyleRecommendation[];
    metrics: string[];
  };
  locale: string;
  createdBy: string; // Practitioner ID
  approvedBy?: string; // Admin/Expert ID
  isPublic: boolean;
}

export interface ProgressLog {
  id: string;
  userId: string;
  protocolId: string;
  metric: string; // e.g., "fatigue", "pain", "sleep_quality"
  value: number; // Standardized 1-10 scale
  notes?: string;
  recordedAt: Date;
}

export interface ProgressSummary {
  protocolId: string;
  userId: string;
  currentStage: number;
  stagesCompleted: number;
  totalStages: number;
  startDate: Date;
  projectedEndDate: Date;
  adherenceRate: number; // 0-1
  metricsImprovement: Record<string, {
    baseline: number;
    current: number;
    improvement: number;
  }>;
  lastUpdated: Date;
}