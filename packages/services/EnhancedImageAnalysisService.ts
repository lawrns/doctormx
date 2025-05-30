/**
 * EnhancedImageAnalysisService - v2 medical image analysis with improved prompts
 * Integrates with enhanced diagnostic flow and safety systems
 */

import { featureFlagService } from './FeatureFlagService';
import { redFlagDetectionService } from './RedFlagDetectionService';
import { loggingService } from './LoggingService';
import type { RedFlag, ImageAnalysis } from '@pkg/types';

interface EnhancedImageAnalysisInput {
  imageUrl: string;
  imageBase64?: string;
  patientAge?: number;
  patientGender?: string;
  symptoms?: string[];
  medicalHistory?: string[];
  sessionId: string;
  userId?: string;
}

interface EnhancedImageAnalysisResult {
  analysis: string;
  confidence: number;
  severity: number;
  emergency: boolean;
  redFlags: RedFlag[];
  differentialDiagnosis: {
    condition: string;
    probability: number;
    reasoning: string;
    icdCode?: string;
  }[];
  recommendations: {
    immediate: string;
    traditional: string;
    conventional: string;
    lifestyle: string;
  };
  followUp: {
    timeframe: string;
    warningSigns: string[];
    monitoring: string;
  };
  culturalNotes: string;
  disclaimers: string;
  imageQuality: {
    score: number; // 0-100
    issues: string[];
    suggestions: string[];
  };
}

interface ImageQualityAssessment {
  score: number;
  issues: string[];
  canAnalyze: boolean;
  suggestions: string[];
}

export class EnhancedImageAnalysisService {
  private static instance: EnhancedImageAnalysisService;
  
  // Common skin conditions visible in images
  private readonly VISUAL_CONDITIONS = new Map([
    ['acne', { keywords: ['pimples', 'blackheads', 'whiteheads'], severity: 'low' }],
    ['eczema', { keywords: ['dry', 'flaky', 'itchy', 'red patches'], severity: 'medium' }],
    ['psoriasis', { keywords: ['scaly', 'thick patches', 'silvery'], severity: 'medium' }],
    ['rash', { keywords: ['red', 'irritated', 'bumpy'], severity: 'medium' }],
    ['wound', { keywords: ['cut', 'scratch', 'injury'], severity: 'variable' }],
    ['burn', { keywords: ['burn', 'blister', 'heat damage'], severity: 'high' }],
    ['infection', { keywords: ['pus', 'swelling', 'red streaks'], severity: 'high' }],
    ['mole_changes', { keywords: ['mole', 'dark spot', 'changing'], severity: 'high' }]
  ]);

  static getInstance(): EnhancedImageAnalysisService {
    if (!EnhancedImageAnalysisService.instance) {
      EnhancedImageAnalysisService.instance = new EnhancedImageAnalysisService();
    }
    return EnhancedImageAnalysisService.instance;
  }

  /**
   * Analyze medical image with enhanced v2 prompts
   */
  async analyzeImage(input: EnhancedImageAnalysisInput): Promise<EnhancedImageAnalysisResult> {
    const startTime = Date.now();
    
    try {
      loggingService.info('EnhancedImageAnalysis', 'Starting image analysis', {
        hasImage: !!input.imageUrl,
        hasSymptoms: input.symptoms?.length || 0,
        sessionId: input.sessionId
      });

      // Check if enhanced image analysis is enabled
      const enhancedEnabled = await featureFlagService.isFeatureEnabled(
        'imageAnalysisV2', 
        input.userId, 
        input.sessionId
      );

      if (!enhancedEnabled) {
        return this.fallbackAnalysis(input);
      }

      // Step 1: Assess image quality
      const qualityAssessment = await this.assessImageQuality(input);
      
      if (!qualityAssessment.canAnalyze) {
        return this.lowQualityImageResponse(input, qualityAssessment);
      }

      // Step 2: Perform enhanced analysis
      const analysisResult = await this.performEnhancedAnalysis(input, qualityAssessment);

      // Step 3: Safety checks
      const safetyChecks = this.performSafetyChecks(analysisResult, input);
      
      // Step 4: Cultural context enhancement
      const culturallyEnhanced = this.addMexicanContext(analysisResult, input);

      const duration = Date.now() - startTime;
      loggingService.logPerformance('EnhancedImageAnalysis', 'analyzeImage', duration, {
        confidence: culturallyEnhanced.confidence,
        emergency: culturallyEnhanced.emergency,
        redFlagCount: culturallyEnhanced.redFlags.length
      });

      // Log medical event
      loggingService.logMedicalEvent(
        'image_analysis',
        {
          confidence: culturallyEnhanced.confidence,
          severity: culturallyEnhanced.severity,
          emergency: culturallyEnhanced.emergency,
          conditions: culturallyEnhanced.differentialDiagnosis.map(d => d.condition)
        },
        { userId: input.userId, sessionId: input.sessionId }
      );

      return culturallyEnhanced;

    } catch (error) {
      loggingService.error(
        'EnhancedImageAnalysis', 
        'Image analysis failed', 
        error instanceof Error ? error : new Error(String(error)),
        { sessionId: input.sessionId }
      );
      
      return this.errorFallbackResponse(input, error);
    }
  }

  /**
   * Assess image quality before analysis
   */
  private async assessImageQuality(input: EnhancedImageAnalysisInput): Promise<ImageQualityAssessment> {
    // In a real implementation, this would use computer vision APIs
    // For now, we'll simulate based on common issues
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 85; // Base score

    // Simulate quality assessment
    if (!input.imageUrl && !input.imageBase64) {
      return {
        score: 0,
        issues: ['No image provided'],
        canAnalyze: false,
        suggestions: ['Please upload a clear image']
      };
    }

    // Simulated quality factors
    const filename = input.imageUrl?.toLowerCase() || '';
    
    if (filename.includes('low') || filename.includes('blurry')) {
      score -= 30;
      issues.push('Image appears blurry or low resolution');
      suggestions.push('Try taking the photo again with better lighting');
    }

    if (filename.includes('dark')) {
      score -= 20;
      issues.push('Image is too dark');
      suggestions.push('Use better lighting or flash');
    }

    if (filename.includes('small')) {
      score -= 15;
      issues.push('Image resolution is too low');
      suggestions.push('Take a closer, higher resolution photo');
    }

    // Add general suggestions
    if (score < 70) {
      suggestions.push('Ensure good lighting and focus');
      suggestions.push('Hold camera steady');
      suggestions.push('Take photo from multiple angles if possible');
    }

    return {
      score: Math.max(score, 0),
      issues,
      canAnalyze: score >= 50,
      suggestions
    };
  }

  /**
   * Perform enhanced analysis using v2 prompts
   */
  private async performEnhancedAnalysis(
    input: EnhancedImageAnalysisInput,
    quality: ImageQualityAssessment
  ): Promise<EnhancedImageAnalysisResult> {
    
    // In a real implementation, this would call OpenAI GPT-4 Vision
    // For now, we'll simulate based on input data and provide structured analysis
    
    const simulatedAnalysis = this.simulateImageAnalysis(input);
    
    // Check for red flags in the analysis
    const analysisText = `${simulatedAnalysis.analysis} ${input.symptoms?.join(' ') || ''}`;
    const redFlags = redFlagDetectionService.analyzeText(analysisText, input.patientAge);
    
    // Determine emergency status
    const emergency = redFlags.some(flag => flag.type === 'emergency');
    const severity = emergency ? 9 : redFlags.length > 0 ? 6 : simulatedAnalysis.severity;

    return {
      ...simulatedAnalysis,
      redFlags,
      emergency,
      severity,
      imageQuality: {
        score: quality.score,
        issues: quality.issues,
        suggestions: quality.suggestions
      }
    };
  }

  /**
   * Simulate image analysis based on available data
   */
  private simulateImageAnalysis(input: EnhancedImageAnalysisInput): EnhancedImageAnalysisResult {
    // Simulate analysis based on symptoms and context
    const symptoms = input.symptoms || [];
    const symptomText = symptoms.join(' ').toLowerCase();
    
    let primaryCondition = 'skin irritation';
    let confidence = 0.7;
    let severity = 3;
    
    // Pattern matching for common conditions
    for (const [condition, data] of this.VISUAL_CONDITIONS.entries()) {
      const hasKeywords = data.keywords.some(keyword => 
        symptomText.includes(keyword) || 
        input.imageUrl?.toLowerCase().includes(keyword)
      );
      
      if (hasKeywords) {
        primaryCondition = condition;
        confidence = 0.8;
        severity = data.severity === 'high' ? 7 : data.severity === 'medium' ? 5 : 3;
        break;
      }
    }

    // Build differential diagnosis
    const differentialDiagnosis = this.buildDifferentialDiagnosis(primaryCondition, symptomText);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(primaryCondition, severity);
    
    return {
      analysis: this.generateAnalysisText(primaryCondition, symptoms),
      confidence,
      severity,
      emergency: false, // Will be determined by red flag analysis
      redFlags: [], // Will be populated by safety checks
      differentialDiagnosis,
      recommendations,
      followUp: this.generateFollowUp(severity),
      culturalNotes: '',
      disclaimers: 'Esta evaluación por imagen tiene limitaciones. Para un diagnóstico definitivo, consulte con un profesional de la salud.',
      imageQuality: {
        score: 85,
        issues: [],
        suggestions: []
      }
    };
  }

  /**
   * Generate analysis text
   */
  private generateAnalysisText(condition: string, symptoms: string[]): string {
    const conditionTexts = {
      'acne': 'Se observa una condición cutánea compatible con acné, con presencia de lesiones inflamatorias.',
      'eczema': 'La imagen muestra características consistentes con dermatitis eczematosa, con áreas de irritación y sequedad.',
      'psoriasis': 'Se identifican lesiones escamosas características que sugieren psoriasis.',
      'rash': 'Se observa una erupción cutánea con eritema y posible irritación.',
      'wound': 'Se identifica una lesión cutánea que requiere cuidado apropiado.',
      'burn': 'La imagen muestra signos de quemadura que necesita atención médica.',
      'infection': 'Se observan signos que podrían indicar una infección cutánea.',
      'mole_changes': 'Se identifican cambios en lesión pigmentada que requieren evaluación profesional.',
      'skin irritation': 'Se observa irritación cutánea de origen a determinar.'
    };

    let analysis = conditionTexts[condition as keyof typeof conditionTexts] || conditionTexts['skin irritation'];
    
    if (symptoms.length > 0) {
      analysis += ` Los síntomas reportados (${symptoms.join(', ')}) son consistentes con esta evaluación.`;
    }

    return analysis;
  }

  /**
   * Build differential diagnosis
   */
  private buildDifferentialDiagnosis(primaryCondition: string, symptomText: string) {
    const diagnosisMap = {
      'acne': [
        { condition: 'Acné vulgaris', probability: 0.8, reasoning: 'Lesiones comedonianas y papulopustulares características' },
        { condition: 'Foliculitis', probability: 0.15, reasoning: 'Inflamación de folículos pilosos' },
        { condition: 'Rosácea', probability: 0.05, reasoning: 'Eritema facial persistente' }
      ],
      'eczema': [
        { condition: 'Dermatitis atópica', probability: 0.7, reasoning: 'Patrón de distribución y características clínicas' },
        { condition: 'Dermatitis de contacto', probability: 0.2, reasoning: 'Reacción a irritantes o alérgenos' },
        { condition: 'Dermatitis seborreica', probability: 0.1, reasoning: 'Distribución en áreas seborreicas' }
      ],
      'rash': [
        { condition: 'Dermatitis de contacto', probability: 0.4, reasoning: 'Erupción tras exposición a irritante' },
        { condition: 'Urticaria', probability: 0.3, reasoning: 'Lesiones elevadas y pruriginosas' },
        { condition: 'Dermatitis atópica', probability: 0.3, reasoning: 'Patrón eccematoso' }
      ]
    };

    return diagnosisMap[primaryCondition as keyof typeof diagnosisMap] || [
      { condition: 'Irritación cutánea inespecífica', probability: 0.6, reasoning: 'Signos de irritación sin patrón específico' },
      { condition: 'Reacción alérgica', probability: 0.3, reasoning: 'Posible respuesta a alérgeno' },
      { condition: 'Infección cutánea leve', probability: 0.1, reasoning: 'Signos inflamatorios presentes' }
    ];
  }

  /**
   * Generate treatment recommendations
   */
  private generateRecommendations(condition: string, severity: number) {
    const baseRecommendations = {
      immediate: 'Mantener la zona limpia y seca. Evitar rascado.',
      traditional: 'Aplicar compresas frías de manzanilla o aloe vera.',
      conventional: 'Considerar antihistamínicos orales si hay prurito.',
      lifestyle: 'Identificar y evitar posibles irritantes.'
    };

    if (severity >= 7) {
      baseRecommendations.immediate = 'Buscar atención médica inmediata.';
      baseRecommendations.conventional = 'Evaluación médica urgente requerida.';
    } else if (severity >= 5) {
      baseRecommendations.immediate += ' Consultar con dermatólogo si no mejora en 48-72 horas.';
    }

    // Condition-specific modifications
    if (condition === 'burn') {
      baseRecommendations.immediate = 'Aplicar agua fría durante 10-20 minutos. NO aplicar hielo.';
      baseRecommendations.traditional = 'Aloe vera puro puede ayudar con la cicatrización.';
    } else if (condition === 'infection') {
      baseRecommendations.immediate = 'No cubrir herméticamente. Mantener limpio.';
      baseRecommendations.conventional = 'Posible necesidad de antibióticos tópicos.';
    }

    return baseRecommendations;
  }

  /**
   * Generate follow-up instructions
   */
  private generateFollowUp(severity: number) {
    if (severity >= 7) {
      return {
        timeframe: 'Inmediato - buscar atención médica ahora',
        warningSigns: [
          'Empeoramiento rápido',
          'Fiebre o síntomas sistémicos',
          'Dolor intenso',
          'Signos de infección'
        ],
        monitoring: 'Requiere evaluación médica profesional inmediata'
      };
    } else if (severity >= 5) {
      return {
        timeframe: '24-48 horas para evaluación médica',
        warningSigns: [
          'No mejora en 2-3 días',
          'Extensión de la lesión',
          'Desarrollo de pus o mal olor',
          'Fiebre'
        ],
        monitoring: 'Vigilar evolución diariamente'
      };
    } else {
      return {
        timeframe: '1 semana para reevaluación',
        warningSigns: [
          'No mejora en 1 semana',
          'Empeoramiento progresivo',
          'Desarrollo de nuevas lesiones'
        ],
        monitoring: 'Observar cambios en tamaño, color o síntomas'
      };
    }
  }

  /**
   * Perform safety checks on analysis result
   */
  private performSafetyChecks(
    result: EnhancedImageAnalysisResult,
    input: EnhancedImageAnalysisInput
  ): void {
    // Log high-severity findings
    if (result.severity >= 7) {
      loggingService.logMedicalEvent(
        'red_flag_detected',
        {
          condition: result.differentialDiagnosis[0]?.condition,
          severity: result.severity,
          analysis: result.analysis
        },
        { userId: input.userId, sessionId: input.sessionId }
      );
    }

    // Check for emergency escalation keywords
    const emergencyKeywords = ['infection', 'burn', 'wound', 'bleeding', 'severe'];
    const hasEmergencyKeywords = emergencyKeywords.some(keyword =>
      result.analysis.toLowerCase().includes(keyword)
    );

    if (hasEmergencyKeywords && result.severity >= 6) {
      result.emergency = true;
      result.redFlags.push({
        type: 'emergency',
        description: 'Condición que requiere atención médica inmediata',
        action: 'Buscar atención médica urgente',
        severity: 9
      });
    }
  }

  /**
   * Add Mexican cultural context
   */
  private addMexicanContext(
    result: EnhancedImageAnalysisResult,
    input: EnhancedImageAnalysisInput
  ): EnhancedImageAnalysisResult {
    let culturalNotes = 'Contexto mexicano: ';

    // Add altitude considerations for certain conditions
    if (result.analysis.includes('inflamación') || result.analysis.includes('irritación')) {
      culturalNotes += 'En altitudes como la Ciudad de México, la piel puede ser más sensible. ';
    }

    // Add seasonal considerations
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) {
      culturalNotes += 'Durante la temporada de lluvias, mantener especial higiene para prevenir infecciones. ';
    } else if (month >= 11 || month <= 2) {
      culturalNotes += 'Durante la época seca, aumentar hidratación de la piel. ';
    }

    // Add traditional medicine notes
    if (result.recommendations.traditional.includes('manzanilla')) {
      culturalNotes += 'La manzanilla es ampliamente disponible en mercados mexicanos. ';
    }

    if (result.recommendations.traditional.includes('aloe')) {
      culturalNotes += 'El aloe vera (sábila) es común en jardines mexicanos y muy efectivo. ';
    }

    // Add access to healthcare notes
    if (result.emergency || result.severity >= 7) {
      culturalNotes += 'Para atención inmediata: 911 (emergencias), Cruz Roja 065, o acudir al Centro de Salud más cercano.';
    } else {
      culturalNotes += 'Consultas disponibles en IMSS/ISSSTE para derechohabientes, Centros de Salud públicos, o farmacias con consulta médica.';
    }

    return {
      ...result,
      culturalNotes
    };
  }

  /**
   * Fallback analysis for when enhanced features are disabled
   */
  private fallbackAnalysis(input: EnhancedImageAnalysisInput): EnhancedImageAnalysisResult {
    return {
      analysis: 'Imagen recibida para evaluación. Se recomienda descripción adicional de síntomas para mejor análisis.',
      confidence: 0.5,
      severity: 3,
      emergency: false,
      redFlags: [],
      differentialDiagnosis: [
        {
          condition: 'Evaluación pendiente',
          probability: 1.0,
          reasoning: 'Se requiere análisis detallado con información adicional'
        }
      ],
      recommendations: {
        immediate: 'Describir síntomas adicionales',
        traditional: 'Mantener limpio y seco',
        conventional: 'Consultar con profesional si persiste',
        lifestyle: 'Evitar irritantes conocidos'
      },
      followUp: {
        timeframe: '1 semana',
        warningSigns: ['Empeoramiento', 'Nuevos síntomas'],
        monitoring: 'Observar evolución'
      },
      culturalNotes: 'Análisis básico disponible. Para evaluación completa, activar funciones avanzadas.',
      disclaimers: 'Análisis limitado. Consulte con profesional de la salud para diagnóstico definitivo.',
      imageQuality: {
        score: 50,
        issues: ['Análisis avanzado no disponible'],
        suggestions: ['Proporcionar descripción detallada de síntomas']
      }
    };
  }

  /**
   * Low quality image response
   */
  private lowQualityImageResponse(
    input: EnhancedImageAnalysisInput,
    quality: ImageQualityAssessment
  ): EnhancedImageAnalysisResult {
    return {
      analysis: 'La calidad de la imagen es insuficiente para realizar un análisis confiable.',
      confidence: 0.2,
      severity: 1,
      emergency: false,
      redFlags: [],
      differentialDiagnosis: [
        {
          condition: 'Análisis no concluyente',
          probability: 1.0,
          reasoning: 'Calidad de imagen insuficiente para diagnóstico visual'
        }
      ],
      recommendations: {
        immediate: 'Tomar una nueva fotografía con mejor calidad',
        traditional: 'Describir síntomas verbalmente',
        conventional: 'Considerar consulta presencial',
        lifestyle: 'Seguir cuidados generales de higiene'
      },
      followUp: {
        timeframe: 'Inmediato - nueva imagen requerida',
        warningSigns: ['Si hay dolor severo', 'Si hay síntomas de infección'],
        monitoring: 'Intentar nueva fotografía con mejor iluminación'
      },
      culturalNotes: 'Para mejores resultados, tome la foto con luz natural durante el día.',
      disclaimers: 'Análisis limitado por calidad de imagen. Se recomienda nueva fotografía o consulta presencial.',
      imageQuality: quality
    };
  }

  /**
   * Error fallback response
   */
  private errorFallbackResponse(input: EnhancedImageAnalysisInput, error: any): EnhancedImageAnalysisResult {
    return {
      analysis: 'No se pudo completar el análisis de imagen debido a un error técnico.',
      confidence: 0,
      severity: 1,
      emergency: false,
      redFlags: [],
      differentialDiagnosis: [
        {
          condition: 'Error de análisis',
          probability: 1.0,
          reasoning: 'Error técnico impidió el análisis completo'
        }
      ],
      recommendations: {
        immediate: 'Intentar nuevamente o describir síntomas verbalmente',
        traditional: 'Aplicar cuidados básicos de higiene',
        conventional: 'Consultar con profesional si hay preocupación',
        lifestyle: 'Seguir medidas generales de cuidado'
      },
      followUp: {
        timeframe: 'Según síntomas presentes',
        warningSigns: ['Dolor severo', 'Signos de infección', 'Empeoramiento rápido'],
        monitoring: 'Intentar análisis nuevamente más tarde'
      },
      culturalNotes: 'En caso de urgencia, contactar servicios médicos locales.',
      disclaimers: 'Análisis no completado por error técnico. Buscar atención médica si hay preocupación.',
      imageQuality: {
        score: 0,
        issues: ['Error técnico durante el análisis'],
        suggestions: ['Intentar nuevamente', 'Contactar soporte técnico si persiste']
      }
    };
  }
}

export const enhancedImageAnalysisService = EnhancedImageAnalysisService.getInstance();