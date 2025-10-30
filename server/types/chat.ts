// Chat Schema v2 - Structured Response Format
export type ConversationStage = 
  | 'intake'           // Initial symptom description
  | 'clarify'          // Gathering more details
  | 'assess_severity'  // Evaluating urgency
  | 'recommendations'  // Providing medical guidance
  | 'actions'          // Suggesting next steps
  | 'wrap_up';         // Conversation summary

export interface Chip {
  id: string;
  label: string;
  action: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface FormField {
  id: string;
  type: 'severity' | 'duration' | 'date' | 'location' | 'specialty' | 'text';
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface Recommendation {
  prescription?: {
    available: boolean;
    items?: string[];
    note?: string;
  };
  lab_orders?: {
    available: boolean;
    tests?: string[];
    note?: string;
  };
}

export interface ChatResponseV2 {
  // Core response
  reply: string;
  next_state: ConversationStage;
  
  // Severity & medical assessment
  severity?: 'green' | 'yellow' | 'orange' | 'red';
  urgency_score?: number; // 0-100
  
  // Follow-up guidance
  followups?: string[];
  required_fields?: string[];
  
  // Recommendations
  recommendations?: Recommendation;
  
  // Referral info
  recommended_specialty?: string;
  nearby_doctors?: {
    specialty: string;
    count: number;
    sample?: Array<{
      id: string;
      name: string;
      rating: number;
      distance: string;
    }>;
  };
  
  // Interactive UI
  chips?: Chip[];
  forms?: FormField[];
  actions?: Array<{
    id: string;
    label: string;
    action: string;
    icon?: string;
  }>;
  
  // Metadata
  freeQuestionUsed?: boolean;
  freeQuestionMessage?: string;
  conversationStage?: string;
}

// Memory structure for conversation state
export interface ConversationMemory {
  stage: ConversationStage;
  collected_fields: Record<string, any>;
  symptoms: string[];
  severity_detected?: 'green' | 'yellow' | 'orange' | 'red';
  recommended_specialty?: string;
  conversation_id?: string;
}




