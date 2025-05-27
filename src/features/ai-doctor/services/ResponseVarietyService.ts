/**
 * Service to ensure response variety and natural conversation flow
 * Prevents robotic, repetitive responses
 */

export interface VariedResponse {
  text: string;
  style: 'professional' | 'friendly' | 'empathetic' | 'direct' | 'educational';
  variationApplied: string[];
  naturalness: number; // 0-10
}

export class ResponseVarietyService {
  // Response templates with variations
  private static readonly GREETING_VARIATIONS = [
    {
      time: 'morning',
      options: [
        '¡Buenos días! ¿Cómo amaneciste hoy?',
        'Hola, buenos días. ¿En qué puedo ayudarte?',
        '¡Qué gusto saludarte esta mañana! ¿Cómo te sientes?',
        'Buenos días. Cuéntame, ¿qué te trae por aquí?'
      ]
    },
    {
      time: 'afternoon',
      options: [
        'Buenas tardes. ¿Cómo puedo asistirte hoy?',
        '¡Hola! ¿Qué tal tu día? ¿En qué te ayudo?',
        'Buenas tardes. Estoy aquí para lo que necesites.',
        'Hola, buenas tardes. ¿Qué síntomas tienes?'
      ]
    },
    {
      time: 'evening',
      options: [
        'Buenas noches. ¿Qué te preocupa a esta hora?',
        'Hola, sé que es tarde. ¿Cómo puedo ayudarte?',
        'Buenas noches. Cuéntame qué sucede.',
        'Es tarde, debe ser importante. ¿Qué pasa?'
      ]
    }
  ];

  // Transition phrases for natural flow
  private static readonly TRANSITION_PHRASES = {
    addition: [
      'Además, ',
      'También es importante mencionar que ',
      'Por otro lado, ',
      'Adicionalmente, ',
      'Otro punto a considerar es que '
    ],
    contrast: [
      'Sin embargo, ',
      'Aunque, ',
      'Por otra parte, ',
      'No obstante, ',
      'Dicho esto, '
    ],
    conclusion: [
      'En resumen, ',
      'Por lo tanto, ',
      'En conclusión, ',
      'Así que, ',
      'En definitiva, '
    ],
    example: [
      'Por ejemplo, ',
      'Como muestra, ',
      'Un caso sería ',
      'Para ilustrar, ',
      'Específicamente, '
    ]
  };

  // Acknowledgment variations
  private static readonly ACKNOWLEDGMENTS = {
    understanding: [
      'Comprendo.',
      'Entiendo.',
      'Ya veo.',
      'Claro.',
      'Me queda claro.'
    ],
    symptom: [
      'Gracias por describir tus síntomas.',
      'Es útil que me compartas estos detalles.',
      'Esta información me ayuda mucho.',
      'Gracias por ser específico/a.',
      'Qué bueno que me das estos datos.'
    ],
    concern: [
      'Veo que esto te preocupa.',
      'Noto tu preocupación.',
      'Es natural que te inquiete.',
      'Comprendo tu inquietud.',
      'Tu preocupación es válida.'
    ]
  };

  // Style modifiers
  private static readonly STYLE_MODIFIERS = {
    professional: {
      prefix: '',
      suffix: '',
      formalityLevel: 8
    },
    friendly: {
      prefix: '¡',
      suffix: '!',
      formalityLevel: 4
    },
    empathetic: {
      prefix: '',
      suffix: '',
      formalityLevel: 6
    },
    direct: {
      prefix: '',
      suffix: '.',
      formalityLevel: 7
    },
    educational: {
      prefix: 'Es importante saber que ',
      suffix: '',
      formalityLevel: 7
    }
  };

  /**
   * Add variety to a response
   */
  static addVariety(
    baseResponse: string,
    context: {
      messageCount: number;
      lastStyle?: string;
      userMood?: string;
      timeOfDay?: string;
      previousResponses?: string[];
    }
  ): VariedResponse {
    let variedText = baseResponse;
    const variationsApplied: string[] = [];
    
    // Step 1: Choose appropriate style
    const style = this.selectStyle(context);
    variationsApplied.push(`Style: ${style}`);
    
    // Step 2: Add acknowledgment if appropriate
    if (context.messageCount > 1 && Math.random() > 0.6) {
      const ack = this.selectAcknowledgment(context.userMood);
      variedText = `${ack} ${variedText}`;
      variationsApplied.push('Added acknowledgment');
    }
    
    // Step 3: Add transitions for multi-part responses
    variedText = this.addTransitions(variedText);
    if (variedText !== baseResponse) {
      variationsApplied.push('Added transitions');
    }
    
    // Step 4: Vary sentence structure
    variedText = this.varySentenceStructure(variedText, context.messageCount);
    
    // Step 5: Apply style modifiers
    variedText = this.applyStyleModifiers(variedText, style);
    
    // Step 6: Ensure it's different from recent responses
    if (context.previousResponses && context.previousResponses.length > 0) {
      variedText = this.ensureUniqueness(variedText, context.previousResponses);
    }
    
    // Calculate naturalness score
    const naturalness = this.calculateNaturalness(variedText, variationsApplied);
    
    return {
      text: variedText,
      style,
      variationApplied: variationsApplied,
      naturalness
    };
  }

  /**
   * Select appropriate style based on context
   */
  private static selectStyle(context: any): VariedResponse['style'] {
    // Don't repeat the same style consecutively
    const styles: VariedResponse['style'][] = ['professional', 'friendly', 'empathetic', 'direct', 'educational'];
    let availableStyles = styles.filter(s => s !== context.lastStyle);
    
    // Choose based on user mood
    if (context.userMood === 'anxious' || context.userMood === 'sad') {
      return 'empathetic';
    }
    
    if (context.userMood === 'confused') {
      return 'educational';
    }
    
    if (context.messageCount === 1) {
      return 'friendly';
    }
    
    if (context.messageCount > 5) {
      return 'direct'; // Be more concise in longer conversations
    }
    
    // Random selection from available styles
    return availableStyles[Math.floor(Math.random() * availableStyles.length)];
  }

  /**
   * Select appropriate acknowledgment
   */
  private static selectAcknowledgment(userMood?: string): string {
    let options: string[];
    
    if (userMood === 'anxious' || userMood === 'worried') {
      options = this.ACKNOWLEDGMENTS.concern;
    } else if (userMood === 'descriptive') {
      options = this.ACKNOWLEDGMENTS.symptom;
    } else {
      options = this.ACKNOWLEDGMENTS.understanding;
    }
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Add natural transitions to multi-part responses
   */
  private static addTransitions(text: string): string {
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 2) return text;
    
    const enhanced: string[] = [sentences[0]];
    
    for (let i = 1; i < sentences.length; i++) {
      // Add transition 40% of the time
      if (Math.random() < 0.4) {
        const transitionType = this.selectTransitionType(sentences[i-1], sentences[i]);
        const transitions = this.TRANSITION_PHRASES[transitionType];
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        enhanced.push(transition + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1));
      } else {
        enhanced.push(sentences[i]);
      }
    }
    
    return enhanced.join(' ');
  }

  /**
   * Select appropriate transition type
   */
  private static selectTransitionType(
    prevSentence: string,
    nextSentence: string
  ): keyof typeof ResponseVarietyService.TRANSITION_PHRASES {
    // Simple heuristics for transition selection
    if (nextSentence.includes('pero') || nextSentence.includes('aunque')) {
      return 'contrast';
    }
    
    if (nextSentence.includes('ejemplo') || nextSentence.includes('como')) {
      return 'example';
    }
    
    if (prevSentence.includes('?') || nextSentence.includes('por lo tanto')) {
      return 'conclusion';
    }
    
    return 'addition';
  }

  /**
   * Vary sentence structure for naturalness
   */
  private static varySentenceStructure(text: string, messageCount: number): string {
    // Don't vary too much in early messages
    if (messageCount < 3) return text;
    
    const sentences = text.split(/(?<=[.!?])\s+/);
    const varied: string[] = [];
    
    sentences.forEach((sentence, index) => {
      // Occasionally (20%) rephrase questions
      if (sentence.includes('?') && Math.random() < 0.2) {
        sentence = this.rephraseQuestion(sentence);
      }
      
      // Occasionally (15%) change sentence order if safe
      if (index > 0 && Math.random() < 0.15 && this.isSafeToReorder(sentence)) {
        varied.unshift(sentence); // Move to beginning
      } else {
        varied.push(sentence);
      }
    });
    
    return varied.join(' ');
  }

  /**
   * Rephrase a question for variety
   */
  private static rephraseQuestion(question: string): string {
    const rephrases: Record<string, string[]> = {
      '¿Cómo te sientes?': ['¿Cómo estás?', '¿Qué tal te encuentras?', '¿Cómo vas?'],
      '¿Desde cuándo?': ['¿Hace cuánto tiempo?', '¿Cuándo comenzó?', '¿Desde qué momento?'],
      '¿Tienes otros síntomas?': ['¿Hay algo más?', '¿Notas otros síntomas?', '¿Qué más sientes?']
    };
    
    for (const [original, alternatives] of Object.entries(rephrases)) {
      if (question.includes(original)) {
        const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
        return question.replace(original, alternative);
      }
    }
    
    return question;
  }

  /**
   * Check if sentence can be safely reordered
   */
  private static isSafeToReorder(sentence: string): boolean {
    // Don't reorder sentences with sequential markers
    const sequentialMarkers = ['primero', 'segundo', 'luego', 'después', 'finalmente'];
    return !sequentialMarkers.some(marker => sentence.toLowerCase().includes(marker));
  }

  /**
   * Apply style modifiers
   */
  private static applyStyleModifiers(
    text: string,
    style: VariedResponse['style']
  ): string {
    const modifier = this.STYLE_MODIFIERS[style];
    
    // Apply prefix to first sentence
    if (modifier.prefix && !text.startsWith('¡')) {
      text = modifier.prefix + text;
    }
    
    // Apply suffix if needed
    if (modifier.suffix && !text.endsWith(modifier.suffix)) {
      text = text.replace(/[.!?]$/, modifier.suffix);
    }
    
    return text;
  }

  /**
   * Ensure response is different from recent ones
   */
  private static ensureUniqueness(text: string, previousResponses: string[]): string {
    // Check similarity with recent responses
    const recentResponses = previousResponses.slice(-3);
    
    for (const recent of recentResponses) {
      const similarity = this.calculateSimilarity(text, recent);
      if (similarity > 0.7) {
        // Too similar, add variation
        return this.makeMoreUnique(text);
      }
    }
    
    return text;
  }

  /**
   * Make response more unique
   */
  private static makeMoreUnique(text: string): string {
    // Add time-based uniqueness
    const timeMarkers = [
      'En este momento, ',
      'Ahora, ',
      'Actualmente, ',
      'Por ahora, '
    ];
    
    const marker = timeMarkers[Math.floor(Math.random() * timeMarkers.length)];
    return marker + text.charAt(0).toLowerCase() + text.slice(1);
  }

  /**
   * Calculate text similarity
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate naturalness score
   */
  private static calculateNaturalness(text: string, variations: string[]): number {
    let score = 5; // Base score
    
    // Positive factors
    if (variations.includes('Added transitions')) score += 1;
    if (variations.includes('Added acknowledgment')) score += 1;
    if (text.includes('?')) score += 0.5; // Questions are engaging
    
    // Natural length (not too short or long)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 20 && wordCount <= 100) score += 1;
    
    // Variety of punctuation
    if (text.includes('.') && text.includes(',')) score += 0.5;
    
    // Negative factors
    if (text.length > 500) score -= 1; // Too long
    if (text.split('.').length > 10) score -= 1; // Too many sentences
    
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Generate varied greeting based on time
   */
  static generateVariedGreeting(): string {
    const hour = new Date().getHours();
    let timeKey: string;
    
    if (hour < 12) timeKey = 'morning';
    else if (hour < 19) timeKey = 'afternoon';
    else timeKey = 'evening';
    
    const greetingSet = this.GREETING_VARIATIONS.find(g => g.time === timeKey);
    const options = greetingSet?.options || this.GREETING_VARIATIONS[0].options;
    
    return options[Math.floor(Math.random() * options.length)];
  }
}