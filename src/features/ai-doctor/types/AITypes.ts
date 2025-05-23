export interface AIAnswerOption {
  id: string;
  text: string;
  value: string;
  category?: string;
}

export interface AIResponse {
  text: string;
  answerOptions?: AIAnswerOption[];
  followUpQuestions?: string[];
  suggestedConditions?: string[];
  suggestedMedications?: string[];
  suggestedSpecialty?: string;
  isEmergency?: boolean;
  severity?: number;
  confidence?: number;
}

export interface MedicalContext {
  symptoms: string[];
  painLevel?: number;
  duration?: string;
  medications?: string[];
  allergies?: string[];
  previousConditions?: string[];
}

export interface ConversationContext {
  history: string[];
  currentTopic?: string;
  userPreferences?: {
    language: string;
    preferredTreatment?: string;
    cultural?: string;
  };
} 