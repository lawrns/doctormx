import { EmotionAnalyzer } from './EmotionAnalyzerService';
import { MexicanCulturalContextService } from './MexicanCulturalContextService';

export interface EmotionalState {
  primary: 'joy' | 'sadness' | 'fear' | 'anger' | 'surprise' | 'disgust' | 'anxiety' | 'pain';
  intensity: number; // 0-1
  confidence: number; // 0-1
  culturalFactors: string[];
  recommendedTone: 'empathetic' | 'reassuring' | 'professional' | 'urgent' | 'caring';
}

export interface ConversationContext {
  emotionalHistory: EmotionalState[];
  culturalBackground: 'urban' | 'rural' | 'indigenous' | 'mixed';
  preferredLanguage: 'formal' | 'informal' | 'technical' | 'simple';
  familyDynamics: 'individual' | 'family-oriented' | 'extended-family';
  religiousConsiderations: boolean;
  economicContext: 'low' | 'medium' | 'high';
  educationLevel: 'basic' | 'secondary' | 'higher';
}

export interface MexicanDoctorPersonality {
  warmth: number; // How warm and caring
  authority: number; // How authoritative vs gentle
  cultural_sensitivity: number; // Cultural awareness level
  family_focus: number; // How much they emphasize family
  religious_respect: number; // Religious sensitivity
  economic_awareness: number; // Understanding of economic constraints
  humor_level: number; // Appropriate use of Mexican humor
  formality: number; // Professional vs informal communication
}

export class MexicanDoctorPersonalityService {
  private emotionAnalyzer: EmotionAnalyzer;
  private culturalContext: MexicanCulturalContextService;
  private basePersonality: MexicanDoctorPersonality;

  constructor() {
    this.emotionAnalyzer = new EmotionAnalyzer();
    this.culturalContext = new MexicanCulturalContextService();
    
    // Default Dr. Simeon personality - warm, caring Mexican doctor
    this.basePersonality = {
      warmth: 0.9,
      authority: 0.7,
      cultural_sensitivity: 0.95,
      family_focus: 0.85,
      religious_respect: 0.8,
      economic_awareness: 0.9,
      humor_level: 0.4,
      formality: 0.6
    };
  }

  /**
   * Analyze emotional state from user input
   */
  async analyzeEmotionalState(userInput: string, conversationHistory: string[]): Promise<EmotionalState> {
    // Detect emotional markers in Spanish
    const emotionalMarkers = {
      pain: ['duele', 'dolor', 'molesta', 'lastima', 'punzada', 'ardor'],
      fear: ['miedo', 'asustado', 'nervioso', 'preocupado', 'ansiedad', 'pánico'],
      sadness: ['triste', 'deprimido', 'desanimado', 'melancolía', 'llorando'],
      anger: ['enojado', 'furioso', 'molesto', 'irritado', 'coraje'],
      anxiety: ['ansioso', 'nervioso', 'intranquilo', 'agitado', 'estresado'],
      joy: ['feliz', 'contento', 'alegre', 'emocionado', 'bien'],
      surprise: ['sorprendido', 'asombrado', 'impresionado']
    };

    let detectedEmotion: EmotionalState['primary'] = 'anxiety';
    let maxIntensity = 0;

    for (const [emotion, markers] of Object.entries(emotionalMarkers)) {
      const matches = markers.filter(marker => 
        userInput.toLowerCase().includes(marker)
      ).length;
      
      if (matches > maxIntensity) {
        maxIntensity = matches;
        detectedEmotion = emotion as EmotionalState['primary'];
      }
    }

    // Cultural context analysis
    const culturalFactors = this.culturalContext.analyzeCulturalFactors(userInput);
    
    return {
      primary: detectedEmotion,
      intensity: Math.min(maxIntensity / 3, 1), // Normalize
      confidence: maxIntensity > 0 ? 0.8 : 0.4,
      culturalFactors,
      recommendedTone: this.getRecommendedTone(detectedEmotion, maxIntensity)
    };
  }

  /**
   * Generate culturally appropriate response based on emotional state
   */
  generatePersonalizedResponse(
    baseResponse: string,
    emotionalState: EmotionalState,
    context: Partial<ConversationContext>
  ): string {
    let personalizedResponse = baseResponse;

    // Add emotional preambles based on detected state
    const emotionalPreambles = this.getEmotionalPreambles(emotionalState);
    
    // Add cultural sensitivity
    const culturalAdjustments = this.getCulturalAdjustments(context, emotionalState);
    
    // Combine with appropriate Mexican medical expressions
    const medicalExpressions = this.getMexicanMedicalExpressions(emotionalState);

    // Build the final response
    if (emotionalPreambles) {
      personalizedResponse = `${emotionalPreambles} ${personalizedResponse}`;
    }

    if (culturalAdjustments) {
      personalizedResponse += ` ${culturalAdjustments}`;
    }

    if (medicalExpressions) {
      personalizedResponse += ` ${medicalExpressions}`;
    }

    return this.ensureMexicanMedicalTone(personalizedResponse, emotionalState);
  }

  private getRecommendedTone(emotion: EmotionalState['primary'], intensity: number): EmotionalState['recommendedTone'] {
    switch (emotion) {
      case 'fear':
      case 'anxiety':
        return 'reassuring';
      case 'pain':
        return 'empathetic';
      case 'sadness':
        return 'caring';
      case 'anger':
        return 'professional';
      default:
        return intensity > 2 ? 'empathetic' : 'professional';
    }
  }

  private getEmotionalPreambles(state: EmotionalState): string {
    // Return empty string - we don't want generic emotional preambles
    // The AI should focus on medical content instead
    return "";
  }

  private getCulturalAdjustments(context: Partial<ConversationContext>, state: EmotionalState): string {
    const adjustments: string[] = [];

    // Only add specific, actionable cultural adjustments
    if (context.economicContext === 'low') {
      adjustments.push("Opciones económicas: Genéricos en Farmacias Similares, atención IMSS gratuita con cita.");
    }

    if (context.culturalBackground === 'rural') {
      adjustments.push("Si no hay especialista cerca, el centro de salud puede referirte al hospital regional.");
    }

    return adjustments.join(' ');
  }

  private getMexicanMedicalExpressions(state: EmotionalState): string {
    // Return empty - we want medical content, not generic expressions
    return "";
  }

  private ensureMexicanMedicalTone(response: string, state: EmotionalState): string {
    // Don't add generic greetings or closings
    // The response should focus on medical content
    return response;
  }

  /**
   * Generate conversation starters based on Mexican medical culture
   */
  generateMexicanMedicalGreeting(): string {
    const greetings = [
      "¡Buenos días! Soy el Dr. Simeon. ¿Cómo me puede servir el día de hoy?",
      "¡Que gusto saludarle! Dígame, ¿en qué le puedo ayudar?",
      "Bienvenido a Doctor.mx. Estoy aquí para apoyarle con sus consultas médicas.",
      "¡Hola! Es un placer atenderle. ¿Qué síntomas le están molestando?",
      "Buenos días, mi estimado paciente. ¿Cómo se siente el día de hoy?"
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Add natural thinking pauses and visual indicators
   */
  generateThinkingIndicators(complexity: 'simple' | 'medium' | 'complex'): {
    stages: string[];
    duration: number; // in milliseconds
  } {
    switch (complexity) {
      case 'simple':
        return {
          stages: ['Analizando...', 'Revisando síntomas...', 'Preparando respuesta...'],
          duration: 2000
        };
      case 'medium':
        return {
          stages: [
            'Analizando síntomas...', 
            'Consultando base médica...', 
            'Evaluando posibles causas...', 
            'Preparando recomendaciones...'
          ],
          duration: 4000
        };
      case 'complex':
        return {
          stages: [
            'Analizando cuadro clínico...', 
            'Consultando especialistas virtuales...', 
            'Revisando estudios recientes...', 
            'Evaluando diagnósticos diferenciales...', 
            'Formulando plan de atención...'
          ],
          duration: 6000
        };
    }
  }

  /**
   * Generate contextual follow-up questions
   */
  generateMexicanFollowUpQuestions(topic: string, emotionalState: EmotionalState): string[] {
    const baseQuestions: Record<string, string[]> = {
      'dolor': [
        '¿Desde cuándo comenzó el dolor?',
        '¿El dolor es constante o va y viene?',
        '¿Algo lo alivia o lo empeora?',
        '¿Has tomado algún medicamento?'
      ],
      'fiebre': [
        '¿Qué temperatura tienes?',
        '¿Tienes otros síntomas como dolor de cabeza?',
        '¿Has estado en contacto con alguien enfermo?',
        '¿Cómo te sientes en general?'
      ],
      'general': [
        '¿Hay algo más que te preocupe?',
        '¿Tienes antecedentes médicos importantes?',
        '¿Tomas algún medicamento regularmente?',
        '¿Cómo ha sido tu alimentación últimamente?'
      ]
    };

    // Add emotional sensitivity to questions
    if (emotionalState.primary === 'anxiety' || emotionalState.primary === 'fear') {
      return [
        'Entiendo tu preocupación. ¿Puedes contarme un poco más?',
        'No te preocupes, vamos a revisar esto juntos. ¿Qué más notas?',
        'Es normal sentirse inquieto. ¿Hay algo específico que te alarme?'
      ];
    }

    return baseQuestions[topic] || baseQuestions['general'];
  }
} 