/**
 * Service to ensure high-quality, specific medical responses
 * Prevents generic, low-value responses from being sent to users
 */

export interface ResponseQualityScore {
  medicalSpecificity: number; // 0-10
  actionability: number; // 0-10
  uniqueness: number; // 0-10
  totalScore: number; // 0-10
  issues: string[];
  suggestions: string[];
}

export interface MedicalResponseRequirements {
  mustInclude: string[];
  mustAvoid: string[];
  minimumSpecificityScore: number;
  requiresActionableSteps: boolean;
}

export class ResponseQualityService {
  // Banned generic phrases that add no value
  private static readonly BANNED_PHRASES = [
    'entiendo que estás sintiendo molestias',
    'es importante que también involucres a tu familia',
    'tu bienestar es nuestra prioridad principal',
    'estoy aquí para apoyarte en lo que necesites',
    'comprendo tu frustración',
    'es completamente normal sentirse preocupado',
    'noto que esto te está afectando',
    'te agradezco que confíes en mí',
    'mantén la fe y la esperanza',
    'no estás solo en este proceso',
    'estamos aquí para cuidarte como familia',
    'confía en que encontraremos la mejor solución',
    'quedo a tus órdenes',
    'tu salud es muy importante para nosotros',
    'mantente en contacto y cuídate mucho',
    'estimado paciente',
    'querido paciente'
  ];

  // Required elements for quality responses
  private static readonly QUALITY_INDICATORS = {
    specificSymptoms: ['dolor', 'fiebre', 'tos', 'náusea', 'mareo', 'fatiga', 'inflamación'],
    medicalTerms: ['mg', 'ml', 'dosis', 'síntoma', 'diagnóstico', 'tratamiento', 'medicamento'],
    timeframes: ['horas', 'días', 'semanas', 'minutos', '24h', '48h', '72h'],
    actionVerbs: ['toma', 'aplica', 'evita', 'consulta', 'mide', 'observa', 'registra'],
    measurements: ['temperatura', 'presión', 'pulso', 'frecuencia', 'nivel'],
    medications: ['paracetamol', 'ibuprofeno', 'omeprazol', 'antibiótico', 'antihistamínico']
  };

  /**
   * Evaluate response quality
   */
  static evaluateResponse(response: string): ResponseQualityScore {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check for banned phrases
    const bannedCount = this.BANNED_PHRASES.filter(phrase => 
      response.toLowerCase().includes(phrase)
    ).length;
    
    if (bannedCount > 0) {
      issues.push(`Contains ${bannedCount} generic/banned phrases`);
      suggestions.push('Remove empathy-only statements and focus on medical content');
    }

    // Calculate medical specificity
    const medicalSpecificity = this.calculateMedicalSpecificity(response);
    if (medicalSpecificity < 5) {
      issues.push('Low medical specificity');
      suggestions.push('Include specific symptoms, medications, or measurements');
    }

    // Calculate actionability
    const actionability = this.calculateActionability(response);
    if (actionability < 5) {
      issues.push('Low actionability');
      suggestions.push('Add specific steps the patient can take');
    }

    // Calculate uniqueness
    const uniqueness = 10 - (bannedCount * 2);
    
    // Total score
    const totalScore = (medicalSpecificity + actionability + uniqueness) / 3;

    return {
      medicalSpecificity,
      actionability,
      uniqueness: Math.max(0, uniqueness),
      totalScore,
      issues,
      suggestions
    };
  }

  /**
   * Calculate how medically specific the response is
   */
  private static calculateMedicalSpecificity(response: string): number {
    let score = 0;
    const lower = response.toLowerCase();

    // Check for specific symptoms mentioned
    const symptomCount = this.QUALITY_INDICATORS.specificSymptoms.filter(s => 
      lower.includes(s)
    ).length;
    score += Math.min(symptomCount * 1.5, 3);

    // Check for medical terms
    const medicalTermCount = this.QUALITY_INDICATORS.medicalTerms.filter(t => 
      lower.includes(t)
    ).length;
    score += Math.min(medicalTermCount * 1.5, 3);

    // Check for medications
    const medicationCount = this.QUALITY_INDICATORS.medications.filter(m => 
      lower.includes(m)
    ).length;
    score += Math.min(medicationCount * 2, 2);

    // Check for measurements or numbers
    const hasNumbers = /\d+/.test(response);
    if (hasNumbers) score += 2;

    return Math.min(score, 10);
  }

  /**
   * Calculate how actionable the response is
   */
  private static calculateActionability(response: string): number {
    let score = 0;
    const lower = response.toLowerCase();

    // Check for action verbs
    const actionCount = this.QUALITY_INDICATORS.actionVerbs.filter(v => 
      lower.includes(v)
    ).length;
    score += Math.min(actionCount * 2, 4);

    // Check for timeframes
    const timeframeCount = this.QUALITY_INDICATORS.timeframes.filter(t => 
      lower.includes(t)
    ).length;
    score += Math.min(timeframeCount * 2, 3);

    // Check for numbered lists or steps
    const hasNumberedSteps = /[1-9][\)\.]\s/.test(response);
    if (hasNumberedSteps) score += 3;

    return Math.min(score, 10);
  }

  /**
   * Enhance a low-quality response
   */
  static enhanceResponse(
    originalResponse: string,
    symptom: string,
    severity: number = 5
  ): string {
    const score = this.evaluateResponse(originalResponse);
    
    if (score.totalScore >= 7) {
      return originalResponse; // Already good
    }

    // Remove banned phrases
    let enhanced = originalResponse;
    this.BANNED_PHRASES.forEach(phrase => {
      enhanced = enhanced.replace(new RegExp(phrase, 'gi'), '');
    });

    // Add medical specificity based on symptom
    const medicalEnhancements = this.getMedicalEnhancement(symptom, severity);
    
    // Combine the enhanced response
    enhanced = enhanced.trim();
    if (enhanced && !enhanced.endsWith('.')) {
      enhanced += '.';
    }
    
    return `${enhanced} ${medicalEnhancements}`.trim();
  }

  /**
   * Get medical enhancement based on symptom
   */
  private static getMedicalEnhancement(symptom: string, severity: number): string {
    const enhancements: Record<string, string> = {
      'dolor de cabeza': `Para el dolor de cabeza: 1) Toma paracetamol 500-1000mg cada 6-8 horas (máximo 4g/día), 2) Aplica compresas frías en frente y sienes, 3) Descansa en lugar oscuro y silencioso. Si persiste >72h o empeora súbitamente, acude a urgencias.`,
      
      'fiebre': `Para la fiebre: 1) Mide temperatura cada 4h y anota, 2) Toma paracetamol 500mg cada 6h si T>38°C, 3) Hidratación constante (2-3L agua/día), 4) Baños tibios si T>39°C. Urgencias si: T>40°C, convulsiones, o dura >3 días.`,
      
      'dolor estómago': `Para dolor abdominal: 1) Dieta blanda (arroz, manzana, pan tostado), 2) Omeprazol 20mg antes del desayuno si hay acidez, 3) Evita lácteos, picante y grasa por 48h, 4) Té de manzanilla tibio. Urgencias si: dolor súbito intenso, vómito con sangre, o fiebre alta.`,
      
      'tos': `Para la tos: 1) Hidratación tibia constante, 2) Miel con limón 3-4 veces/día, 3) Vaporizaciones con eucalipto 10min c/8h, 4) Evita irritantes (humo, polvo). Si hay flemas verdes/sangre o dura >2 semanas, consulta médico.`,
      
      'general': `Recomendaciones específicas: 1) Registra síntomas y evolución, 2) Mantén hidratación (8 vasos agua/día), 3) Reposo relativo según tolerancia, 4) Alimentación balanceada. Monitorea signos de alarma y consulta si empeora.`
    };

    // Find best match
    const symptomLower = symptom.toLowerCase();
    for (const [key, enhancement] of Object.entries(enhancements)) {
      if (symptomLower.includes(key) || key.includes(symptomLower)) {
        return enhancement;
      }
    }

    return enhancements.general;
  }

  /**
   * Generate quality requirements based on conversation stage
   */
  static getQualityRequirements(
    stage: 'discovery' | 'diagnosis' | 'treatment'
  ): MedicalResponseRequirements {
    switch (stage) {
      case 'discovery':
        return {
          mustInclude: ['pregunta específica', 'síntoma'],
          mustAvoid: this.BANNED_PHRASES,
          minimumSpecificityScore: 5,
          requiresActionableSteps: false
        };
      
      case 'diagnosis':
        return {
          mustInclude: ['posible causa', 'síntomas relacionados', 'tiempo'],
          mustAvoid: this.BANNED_PHRASES,
          minimumSpecificityScore: 7,
          requiresActionableSteps: true
        };
      
      case 'treatment':
        return {
          mustInclude: ['medicamento', 'dosis', 'frecuencia', 'duración'],
          mustAvoid: this.BANNED_PHRASES,
          minimumSpecificityScore: 8,
          requiresActionableSteps: true
        };
    }
  }

  /**
   * Check if response meets quality standards
   */
  static meetsQualityStandards(
    response: string,
    requirements: MedicalResponseRequirements
  ): { passes: boolean; reasons: string[] } {
    const score = this.evaluateResponse(response);
    const reasons: string[] = [];

    if (score.medicalSpecificity < requirements.minimumSpecificityScore) {
      reasons.push(`Medical specificity (${score.medicalSpecificity}) below required (${requirements.minimumSpecificityScore})`);
    }

    if (requirements.requiresActionableSteps && score.actionability < 5) {
      reasons.push('Response lacks actionable steps');
    }

    // Check for banned phrases
    const hasBannedPhrases = requirements.mustAvoid.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
    if (hasBannedPhrases) {
      reasons.push('Contains banned generic phrases');
    }

    return {
      passes: reasons.length === 0,
      reasons
    };
  }
}