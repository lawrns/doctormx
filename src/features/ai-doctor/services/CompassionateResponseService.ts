/**
 * Service to generate compassionate, empathetic responses
 * Balances medical accuracy with emotional support
 */

import { PsychologicalResponseTemplates } from './PsychologicalResponseTemplates';

export interface CompassionateResponse {
  text: string;
  emotionalTone: 'supportive' | 'encouraging' | 'calming' | 'validating' | 'hopeful';
  includesHope: boolean;
  includesValidation: boolean;
  personalizedElements: string[];
}

export class CompassionateResponseService {
  // Validation phrases that actually add value
  private static readonly MEANINGFUL_VALIDATIONS = [
    'Lo que sientes es completamente válido',
    'Es natural sentirse así en tu situación',
    'Tu dolor importa y merece atención',
    'Has sido muy valiente al buscar ayuda',
    'Reconozco lo difícil que debe ser esto para ti'
  ];

  // Hope-inspiring phrases that aren't cliché
  private static readonly HOPE_PHRASES = [
    'Muchas personas han superado esto, y tú también puedes',
    'Cada pequeño paso cuenta en tu recuperación',
    'Mañana puede ser diferente a hoy',
    'Tu cuerpo tiene una increíble capacidad de sanar',
    'Hay tratamientos efectivos que pueden ayudarte'
  ];

  // Encouragement that's actionable
  private static readonly ENCOURAGEMENT_PHRASES = [
    'El primer paso es el más difícil, y ya lo diste',
    'Cada día que cuidas de ti es una victoria',
    'Tu esfuerzo por mejorar ya está dando frutos',
    'Mereces sentirte bien y vamos a lograrlo juntos',
    'Tu salud es una inversión que vale la pena'
  ];

  /**
   * Transform a clinical response into a compassionate one
   */
  static makeCompassionate(
    clinicalResponse: string,
    userContext: {
      emotionalState?: string;
      previousMessages?: string[];
      severity?: number;
      isPsychological?: boolean;
    }
  ): CompassionateResponse {
    let enhancedResponse = clinicalResponse;
    const personalizedElements: string[] = [];
    let emotionalTone: CompassionateResponse['emotionalTone'] = 'supportive';
    
    // Step 1: Detect emotional need level
    const needsHighEmpathy = this.detectHighEmpathyNeed(userContext);
    
    // Step 2: Add appropriate validation (but not generic)
    if (needsHighEmpathy) {
      const validation = this.selectAppropriateValidation(userContext);
      if (validation) {
        enhancedResponse = `${validation}\n\n${enhancedResponse}`;
        personalizedElements.push('Added personalized validation');
        emotionalTone = 'validating';
      }
    }
    
    // Step 3: Soften medical language
    enhancedResponse = this.softenMedicalLanguage(enhancedResponse);
    
    // Step 4: Add hope where appropriate
    const includesHope = this.shouldIncludeHope(userContext);
    if (includesHope) {
      const hopePhrase = this.selectHopePhrase(userContext);
      enhancedResponse += `\n\n${hopePhrase}`;
      personalizedElements.push('Added contextual hope');
      emotionalTone = 'hopeful';
    }
    
    // Step 5: Personalize based on conversation history
    if (userContext.previousMessages && userContext.previousMessages.length > 0) {
      enhancedResponse = this.personalizeBasedOnHistory(
        enhancedResponse,
        userContext.previousMessages
      );
      personalizedElements.push('Personalized based on history');
    }
    
    // Step 6: Ensure warmth without being patronizing
    enhancedResponse = this.addWarmth(enhancedResponse, userContext.isPsychological);
    
    return {
      text: enhancedResponse,
      emotionalTone,
      includesHope,
      includesValidation: needsHighEmpathy,
      personalizedElements
    };
  }

  /**
   * Detect if user needs high empathy based on context
   */
  private static detectHighEmpathyNeed(context: any): boolean {
    // High empathy needed for:
    // - Psychological issues
    // - High severity (> 7)
    // - Emotional keywords in messages
    // - First time sharing difficult symptoms
    
    if (context.isPsychological) return true;
    if (context.severity && context.severity > 7) return true;
    
    if (context.emotionalState) {
      const highEmpathyStates = ['fear', 'anxiety', 'sadness', 'pain'];
      if (highEmpathyStates.includes(context.emotionalState)) return true;
    }
    
    return false;
  }

  /**
   * Select appropriate validation based on context
   */
  private static selectAppropriateValidation(context: any): string {
    if (context.isPsychological) {
      return 'Tu salud mental es tan importante como la física. Me alegra que confíes en mí.';
    }
    
    if (context.severity && context.severity > 8) {
      return 'Veo que estás pasando por algo muy difícil. Vamos a encontrar la mejor forma de ayudarte.';
    }
    
    // Select based on emotional state
    const validationMap: Record<string, string> = {
      'anxiety': 'La ansiedad que sientes es real, no la estás imaginando.',
      'fear': 'Es completamente normal sentir miedo ante lo desconocido en la salud.',
      'sadness': 'Tu tristeza es válida y es importante que la expreses.',
      'pain': 'El dolor que describes debe ser muy difícil de sobrellevar.'
    };
    
    return validationMap[context.emotionalState || ''] || 
           this.MEANINGFUL_VALIDATIONS[Math.floor(Math.random() * this.MEANINGFUL_VALIDATIONS.length)];
  }

  /**
   * Soften medical language to be more accessible
   */
  private static softenMedicalLanguage(text: string): string {
    const replacements: Record<string, string> = {
      'debe acudir': 'sería bueno que visites',
      'es imperativo': 'es importante',
      'requiere': 'necesita',
      'obligatorio': 'muy recomendable',
      'inmediatamente': 'lo antes posible',
      'crítico': 'muy importante',
      'severo': 'significativo',
      'grave': 'que requiere atención'
    };
    
    let softened = text;
    for (const [harsh, soft] of Object.entries(replacements)) {
      softened = softened.replace(new RegExp(harsh, 'gi'), soft);
    }
    
    return softened;
  }

  /**
   * Determine if hope should be included
   */
  private static shouldIncludeHope(context: any): boolean {
    // Include hope for:
    // - Psychological issues
    // - Chronic conditions
    // - High severity
    // - When user expresses hopelessness
    
    return context.isPsychological || 
           (context.severity && context.severity > 6) ||
           context.emotionalState === 'sadness';
  }

  /**
   * Select appropriate hope phrase
   */
  private static selectHopePhrase(context: any): string {
    if (context.isPsychological) {
      return 'Recuerda: buscar ayuda es el primer paso hacia sentirte mejor. No estás solo/a en esto.';
    }
    
    if (context.severity && context.severity > 8) {
      return 'Sé que ahora parece difícil, pero con el tratamiento adecuado, muchos pacientes mejoran significativamente.';
    }
    
    return this.HOPE_PHRASES[Math.floor(Math.random() * this.HOPE_PHRASES.length)];
  }

  /**
   * Personalize based on conversation history
   */
  private static personalizeBasedOnHistory(
    response: string,
    previousMessages: string[]
  ): string {
    // Check if user has mentioned specific concerns
    const concerns = this.extractConcerns(previousMessages);
    
    if (concerns.length > 0) {
      // Reference back to their concerns
      const reference = `\n\nCon respecto a lo que mencionaste sobre ${concerns[0]}, `;
      response = response.replace('\n\n', reference);
    }
    
    // If this is a follow-up conversation
    if (previousMessages.length > 3) {
      response = response.replace(
        'Hola',
        'Me da gusto seguir ayudándote'
      );
    }
    
    return response;
  }

  /**
   * Extract main concerns from previous messages
   */
  private static extractConcerns(messages: string[]): string[] {
    const concerns: string[] = [];
    const keywords = [
      'dolor', 'miedo', 'preocupa', 'ansiedad', 'tristeza',
      'no puedo', 'difícil', 'problema', 'síntoma'
    ];
    
    for (const message of messages) {
      for (const keyword of keywords) {
        if (message.toLowerCase().includes(keyword)) {
          // Extract the phrase around the keyword
          const words = message.split(' ');
          const index = words.findIndex(w => w.toLowerCase().includes(keyword));
          if (index !== -1) {
            const concern = words.slice(Math.max(0, index - 2), index + 3).join(' ');
            concerns.push(concern);
            break;
          }
        }
      }
    }
    
    return [...new Set(concerns)]; // Remove duplicates
  }

  /**
   * Add warmth without being patronizing
   */
  private static addWarmth(text: string, isPsychological?: boolean): string {
    // Add warm closing if not already present
    const hasClosing = text.includes('¿') && text.lastIndexOf('?') > text.length - 50;
    
    if (!hasClosing) {
      const warmClosings = [
        '¿Hay algo más en lo que pueda ayudarte?',
        '¿Tienes alguna otra pregunta o preocupación?',
        '¿Cómo te sientes con esta información?',
        '¿Necesitas que te aclare algo más?'
      ];
      
      if (isPsychological) {
        warmClosings.push('¿Cómo te sientes en este momento?');
        warmClosings.push('¿Qué más te gustaría compartir?');
      }
      
      const closing = warmClosings[Math.floor(Math.random() * warmClosings.length)];
      text += `\n\n${closing}`;
    }
    
    return text;
  }

  /**
   * Generate a compassionate greeting
   */
  static generateCompassionateGreeting(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
    const greetings = {
      morning: [
        '¡Buenos días! Espero que hayas descansado bien. ¿Cómo puedo ayudarte hoy?',
        '¡Hola! Qué gusto saludarte esta mañana. ¿Qué te trae por aquí?',
        'Buenos días. Estoy aquí para escucharte y ayudarte. ¿Cómo te sientes?'
      ],
      afternoon: [
        '¡Buenas tardes! ¿Cómo ha estado tu día? ¿En qué puedo apoyarte?',
        'Hola, buenas tardes. Me da gusto que busques cuidar tu salud. ¿Qué necesitas?',
        '¡Hola! Espero que tu día vaya bien. ¿Cómo puedo ayudarte?'
      ],
      evening: [
        'Buenas tardes. Sé que el final del día puede ser cansado. ¿Cómo te sientes?',
        '¡Hola! Me alegra poder ayudarte esta tarde. ¿Qué te preocupa?',
        'Buenas tardes. Estoy aquí para ti. ¿Qué síntomas has notado?'
      ],
      night: [
        'Buenas noches. Si estás aquí a esta hora, debe ser importante. ¿Qué sucede?',
        'Hola, sé que es tarde. Estoy aquí para ayudarte. ¿Qué te preocupa?',
        'Buenas noches. No estás solo/a. ¿En qué puedo apoyarte?'
      ]
    };
    
    const options = greetings[timeOfDay] || greetings.morning;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get current time of day
   */
  static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 19) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }
}