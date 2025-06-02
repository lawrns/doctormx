/**
 * OpenAIVisionService - Integrates OpenAI Vision API for medical image analysis
 */

import { loggingService } from './LoggingService';
import { AnalysisType, ComprehensiveAnalysisResult, HealthIndicator, ConstitutionalMarkers, TreatmentRecommendation } from './RealComprehensiveMedicalImageAnalyzer';

export interface VisionAnalysisInput {
  imageDataUrl: string;
  analysisType: AnalysisType;
  culturalContext: 'mexican' | 'tcm' | 'ayurveda' | 'global';
  symptoms?: string;
}

export interface VisionAPIResponse {
  // Legacy fields
  analysis: string;
  findings: string;
  confidence: number;
  severity: number;
  suggestedSpecialty: string;
  success: boolean;
  
  // New structured fields
  emergency?: boolean;
  redFlags?: string[];
  differentialDiagnosis?: Array<{
    condition: string;
    probability: number;
    reasoning: string;
  }>;
  recommendations?: {
    immediate: string;
    traditional: string;
    conventional: string;
    lifestyle: string;
  };
  followUp?: {
    timeframe: string;
    warningSigns: string[];
    monitoring: string;
  };
  culturalNotes?: string;
  disclaimers?: string;
}

export class OpenAIVisionService {
  private static instance: OpenAIVisionService;
  private readonly apiEndpoint: string;

  private constructor() {
    // Use the Netlify function endpoint
    this.apiEndpoint = '/.netlify/functions/image-analysis';
  }

  static getInstance(): OpenAIVisionService {
    if (!OpenAIVisionService.instance) {
      OpenAIVisionService.instance = new OpenAIVisionService();
    }
    return OpenAIVisionService.instance;
  }

  /**
   * Analyze image using OpenAI Vision API
   */
  async analyzeWithVisionAPI(input: VisionAnalysisInput): Promise<VisionAPIResponse> {
    loggingService.info('OpenAIVisionService', 'Starting Vision API analysis', {
      analysisType: input.analysisType,
      hasSymptoms: !!input.symptoms
    });

    try {
      // Prepare the request
      const requestBody = {
        imageUrl: input.imageDataUrl,
        symptoms: input.symptoms || '',
        analysisType: input.analysisType,
        culturalContext: input.culturalContext
      };

      loggingService.info('OpenAIVisionService', 'Sending request to Vision API', {
        endpoint: this.apiEndpoint,
        bodySize: JSON.stringify(requestBody).length
      });

      // Call the Netlify function
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Vision API failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json() as VisionAPIResponse;

      loggingService.info('OpenAIVisionService', 'Vision API analysis completed', {
        success: result.success,
        hasAnalysis: !!result.analysis,
        analysisLength: result.analysis?.length || 0
      });

      return result;

    } catch (error) {
      loggingService.error('OpenAIVisionService', 'Vision API analysis failed', error as Error);
      throw error;
    }
  }

  /**
   * Convert Vision API response to ComprehensiveAnalysisResult format
   */
  convertToComprehensiveResult(
    visionResponse: VisionAPIResponse,
    localAnalysis: Partial<ComprehensiveAnalysisResult>
  ): ComprehensiveAnalysisResult {
    // Extract health indicators from both structured data and text analysis
    const structuredIndicators = this.extractStructuredIndicators(visionResponse);
    const textIndicators = this.extractHealthIndicators(visionResponse.analysis);
    
    // Merge indicators, prioritizing structured over text-based
    const allIndicators = [...structuredIndicators, ...textIndicators];
    const uniqueIndicators = this.deduplicateIndicators(allIndicators);
    
    // Update urgency based on emergency flag
    const urgencyLevel = visionResponse.emergency ? 'emergency' : 
                        visionResponse.severity >= 70 ? 'urgent' :
                        visionResponse.severity >= 50 ? 'soon' : 'routine';
    
    // Build treatment recommendations from structured data
    const treatmentRecommendations: TreatmentRecommendation[] = [];
    if (visionResponse.recommendations) {
      treatmentRecommendations.push({
        category: 'medical_referral',
        recommendations: [visionResponse.recommendations.immediate],
        urgency: urgencyLevel === 'emergency' ? 'emergency' : 'moderate',
        followUp: visionResponse.followUp?.timeframe || '48 horas'
      });
      
      if (visionResponse.recommendations.traditional) {
        treatmentRecommendations.push({
          category: 'herbal',
          recommendations: [visionResponse.recommendations.traditional],
          mexicanHerbs: this.extractMexicanHerbs(visionResponse.recommendations.traditional),
          urgency: 'routine',
          followUp: 'Según evolución'
        });
      }
    }
    
    // Merge with local analysis results
    return {
      ...localAnalysis as ComprehensiveAnalysisResult,
      primaryFindings: uniqueIndicators,
      urgencyLevel,
      urgentReferrals: visionResponse.emergency ? 
        ['Atención médica inmediata requerida', ...(visionResponse.redFlags || [])] : [],
      treatmentRecommendations: [
        ...treatmentRecommendations,
        ...(localAnalysis.treatmentRecommendations || [])
      ],
      confidenceScore: {
        overall: visionResponse.confidence,
        byCategory: {
          imaging: localAnalysis.confidenceScore?.byCategory?.imaging || 0.7,
          constitutional: localAnalysis.confidenceScore?.byCategory?.constitutional || 0.6,
          cultural: localAnalysis.confidenceScore?.byCategory?.cultural || 0.8,
          aiAnalysis: visionResponse.confidence
        }
      },
      aiInsights: {
        analysis: visionResponse.analysis,
        findings: visionResponse.findings,
        suggestedSpecialty: visionResponse.suggestedSpecialty
      },
      mexicanCulturalContext: visionResponse.culturalNotes ? 
        [visionResponse.culturalNotes] : 
        (localAnalysis.mexicanCulturalContext || [])
    };
  }

  /**
   * Extract health indicators from Vision API text analysis
   */
  private extractHealthIndicators(analysis: string): HealthIndicator[] {
    const indicators: HealthIndicator[] = [];
    const analysisLower = analysis.toLowerCase();
    
    // Enhanced health patterns with more specific conditions
    const healthPatterns = [
      {
        category: 'dermatological',
        patterns: [
          { regex: /rosacea|rosácea/i, finding: 'Signos de rosácea detectados', severity: 'moderate' },
          { regex: /acné|acne|comedones/i, finding: 'Presencia de acné o comedones', severity: 'moderate' },
          { regex: /manchas|pigmentación|hiperpigmentación/i, finding: 'Alteraciones en la pigmentación cutánea', severity: 'low' },
          { regex: /rojez|enrojecimiento|eritema/i, finding: 'Enrojecimiento cutáneo detectado', severity: 'moderate' },
          { regex: /seca|deshidratación|sequedad/i, finding: 'Piel seca o deshidratada', severity: 'low' },
          { regex: /grasa|oleosa|sebácea/i, finding: 'Piel grasa o hipersecreción sebácea', severity: 'low' },
          { regex: /textura irregular|poros dilatados/i, finding: 'Textura cutánea irregular o poros dilatados', severity: 'low' },
          { regex: /dermatitis|eczema/i, finding: 'Posible dermatitis o eczema', severity: 'moderate' },
          { regex: /inflamación cutánea|piel inflamada/i, finding: 'Inflamación cutánea presente', severity: 'moderate' }
        ],
        organSystems: ['integumentario', 'inmunológico']
      },
      {
        category: 'circulatory',
        patterns: [
          { regex: /circulación|vascular/i, finding: 'Alteraciones circulatorias observadas', severity: 'moderate' },
          { regex: /palidez|pálido/i, finding: 'Palidez cutánea - posible anemia', severity: 'moderate' },
          { regex: /cianosis|azulado/i, finding: 'Cianosis detectada - revisar oxigenación', severity: 'high' },
          { regex: /edema|hinchazón/i, finding: 'Edema o retención de líquidos', severity: 'moderate' },
          { regex: /capilares rotos|telangiectasias/i, finding: 'Capilares visibles o telangiectasias', severity: 'low' }
        ],
        organSystems: ['cardiovascular', 'hematológico']
      },
      {
        category: 'respiratory',
        patterns: [
          { regex: /congestión|congestionado/i, finding: 'Congestión respiratoria detectada', severity: 'moderate' },
          { regex: /mucosidad|moco/i, finding: 'Presencia de mucosidad', severity: 'low' },
          { regex: /respiración|respiratorio/i, finding: 'Alteraciones respiratorias observadas', severity: 'moderate' },
          { regex: /tos|carraspera/i, finding: 'Síntomas de irritación respiratoria', severity: 'low' }
        ],
        organSystems: ['respiratorio', 'inmunológico']
      },
      {
        category: 'digestive',
        patterns: [
          { regex: /digestión|digestivo/i, finding: 'Posibles alteraciones digestivas', severity: 'moderate' },
          { regex: /inflamación abdominal|hinchazón/i, finding: 'Inflamación abdominal detectada', severity: 'moderate' },
          { regex: /lengua saburral|saburra/i, finding: 'Lengua saburral - revisar sistema digestivo', severity: 'low' },
          { regex: /náuseas|malestar estomacal/i, finding: 'Síntomas gástricos presentes', severity: 'moderate' }
        ],
        organSystems: ['digestivo', 'hepático']
      },
      {
        category: 'nervous',
        patterns: [
          { regex: /estrés|ansiedad|tensión/i, finding: 'Signos de estrés o ansiedad', severity: 'moderate' },
          { regex: /fatiga|cansancio|ojeras/i, finding: 'Fatiga o agotamiento visible', severity: 'low' },
          { regex: /insomnio|sueño/i, finding: 'Posibles alteraciones del sueño', severity: 'moderate' },
          { regex: /nervioso|nerviosa/i, finding: 'Alteraciones del sistema nervioso', severity: 'moderate' }
        ],
        organSystems: ['nervioso', 'endocrino']
      },
      {
        category: 'constitutional',
        patterns: [
          { regex: /vata|pitta|kapha/i, finding: 'Desequilibrio constitucional detectado', severity: 'moderate' },
          { regex: /frío|calor interno/i, finding: 'Desequilibrio térmico constitucional', severity: 'low' },
          { regex: /constitución|dosha/i, finding: 'Características constitucionales observadas', severity: 'low' }
        ],
        organSystems: ['constitucional', 'metabólico']
      }
    ];

    // Extract findings based on patterns
    healthPatterns.forEach(pattern => {
      pattern.patterns.forEach(p => {
        if (p.regex.test(analysis)) {
          // Extract the actual matched text for more context
          const match = analysis.match(p.regex);
          const contextStart = Math.max(0, (match?.index || 0) - 50);
          const contextEnd = Math.min(analysis.length, (match?.index || 0) + 100);
          const context = analysis.substring(contextStart, contextEnd).trim();
          
          indicators.push({
            category: pattern.category as any,
            finding: p.finding,
            severity: p.severity as 'low' | 'moderate' | 'high',
            confidence: p.severity === 'high' ? 0.85 : p.severity === 'moderate' ? 0.75 : 0.65,
            organSystems: pattern.organSystems,
            recommendations: this.generateRecommendations(pattern.category, p.severity)
          });
        }
      });
    });

    // If no specific patterns found, extract general observations
    if (indicators.length === 0 && analysis.length > 50) {
      indicators.push({
        category: 'general' as any,
        finding: 'Evaluación general del estado de salud',
        severity: 'low',
        confidence: 0.6,
        organSystems: ['general'],
        recommendations: ['Mantener hábitos saludables', 'Seguimiento periódico recomendado']
      });
    }

    return indicators;
  }

  /**
   * Generate recommendations based on category and severity
   */
  private generateRecommendations(category: string, severity: string): string[] {
    const recommendations: { [key: string]: { [key: string]: string[] } } = {
      dermatological: {
        high: [
          'Consultar dermatólogo en las próximas 48 horas',
          'Evitar exposición solar directa',
          'Mantener la piel limpia e hidratada',
          'Documentar cambios diarios con fotos'
        ],
        moderate: [
          'Programar consulta dermatológica',
          'Usar protector solar SPF 50+',
          'Aplicar cremas hidratantes sin fragancia',
          'Evitar productos irritantes'
        ],
        low: [
          'Mantener rutina de cuidado facial',
          'Hidratación adecuada (2L agua/día)',
          'Dieta rica en antioxidantes',
          'Proteción solar diaria'
        ]
      },
      circulatory: {
        high: [
          'Evaluación médica urgente',
          'Monitorear presión arterial',
          'Evitar esfuerzos físicos intensos',
          'Mantener extremidades elevadas si hay edema'
        ],
        moderate: [
          'Exámenes de sangre completos',
          'Ejercicio cardiovascular moderado',
          'Dieta baja en sodio',
          'Compresión elástica si es necesario'
        ],
        low: [
          'Actividad física regular',
          'Masajes circulatorios',
          'Baños alternos frío-calor',
          'Elevar piernas 15 min/día'
        ]
      },
      respiratory: {
        high: [
          'Consulta médica inmediata',
          'Oximetría de pulso',
          'Evitar irritantes ambientales',
          'Considerar nebulizaciones'
        ],
        moderate: [
          'Vaporizaciones con eucalipto',
          'Té de gordolobo o bugambilia',
          'Ejercicios de respiración profunda',
          'Ambiente húmedo'
        ],
        low: [
          'Infusiones de tomillo y miel',
          'Evitar cambios bruscos de temperatura',
          'Purificar aire del hogar',
          'Ejercicios respiratorios matutinos'
        ]
      },
      default: {
        high: ['Consulta médica prioritaria', 'Documentar síntomas'],
        moderate: ['Seguimiento médico recomendado', 'Mantener hábitos saludables'],
        low: ['Observación continua', 'Estilo de vida saludable']
      }
    };

    return recommendations[category]?.[severity] || recommendations.default[severity] || recommendations.default.low;
  }

  /**
   * Determine urgency level from severity score
   */
  private determineUrgency(severity: number): 'routine' | 'soon' | 'urgent' | 'emergency' {
    if (severity >= 80) return 'emergency';
    if (severity >= 60) return 'urgent';
    if (severity >= 40) return 'soon';
    return 'routine';
  }

  /**
   * Extract structured health indicators from differential diagnosis
   */
  private extractStructuredIndicators(visionResponse: VisionAPIResponse): HealthIndicator[] {
    const indicators: HealthIndicator[] = [];
    
    if (visionResponse.differentialDiagnosis && visionResponse.differentialDiagnosis.length > 0) {
      visionResponse.differentialDiagnosis.forEach(diagnosis => {
        // Map condition to category
        const category = this.mapConditionToCategory(diagnosis.condition);
        const severity = diagnosis.probability >= 0.7 ? 'high' : 
                        diagnosis.probability >= 0.4 ? 'moderate' : 'low';
        
        indicators.push({
          category,
          finding: `${diagnosis.condition} - ${diagnosis.reasoning}`,
          severity,
          confidence: diagnosis.probability,
          organSystems: this.mapCategoryToOrganSystems(category),
          recommendations: this.extractRecommendationsForCondition(diagnosis.condition, visionResponse)
        });
      });
    }
    
    // Add red flags as high-priority indicators
    if (visionResponse.redFlags && visionResponse.redFlags.length > 0) {
      visionResponse.redFlags.forEach(flag => {
        indicators.push({
          category: 'emergency' as any,
          finding: flag,
          severity: 'high',
          confidence: 0.9,
          organSystems: ['general'],
          recommendations: ['Buscar atención médica inmediata', 'Llamar al 911 si es necesario']
        });
      });
    }
    
    return indicators;
  }
  
  /**
   * Map condition name to health indicator category
   */
  private mapConditionToCategory(condition: string): HealthIndicator['category'] {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('dermat') || conditionLower.includes('piel') || 
        conditionLower.includes('acné') || conditionLower.includes('rosácea')) {
      return 'dermatological';
    }
    if (conditionLower.includes('circula') || conditionLower.includes('anemia') || 
        conditionLower.includes('vascular')) {
      return 'circulatory';
    }
    if (conditionLower.includes('respira') || conditionLower.includes('congest') || 
        conditionLower.includes('pulmon')) {
      return 'respiratory';
    }
    if (conditionLower.includes('digest') || conditionLower.includes('gástric') || 
        conditionLower.includes('estómago')) {
      return 'digestive';
    }
    if (conditionLower.includes('nerv') || conditionLower.includes('estrés') || 
        conditionLower.includes('ansiedad')) {
      return 'nervous';
    }
    
    return 'constitutional';
  }
  
  /**
   * Map category to organ systems
   */
  private mapCategoryToOrganSystems(category: string): string[] {
    const mapping: Record<string, string[]> = {
      dermatological: ['integumentario', 'inmunológico'],
      circulatory: ['cardiovascular', 'hematológico'],
      respiratory: ['respiratorio', 'inmunológico'],
      digestive: ['digestivo', 'hepático'],
      nervous: ['nervioso', 'endocrino'],
      constitutional: ['constitucional', 'metabólico'],
      emergency: ['general', 'sistémico']
    };
    
    return mapping[category] || ['general'];
  }
  
  /**
   * Extract recommendations for specific condition
   */
  private extractRecommendationsForCondition(
    condition: string, 
    visionResponse: VisionAPIResponse
  ): string[] {
    const recommendations: string[] = [];
    
    // Add immediate recommendations if relevant
    if (visionResponse.recommendations?.immediate) {
      recommendations.push(visionResponse.recommendations.immediate);
    }
    
    // Add condition-specific recommendations
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('infección')) {
      recommendations.push('Mantener área limpia y seca', 'Evitar rascar o tocar');
    }
    if (conditionLower.includes('alergia')) {
      recommendations.push('Identificar y evitar alérgenos', 'Considerar antihistamínicos');
    }
    
    // Add follow-up recommendations
    if (visionResponse.followUp?.monitoring) {
      recommendations.push(visionResponse.followUp.monitoring);
    }
    
    return recommendations.length > 0 ? recommendations : ['Seguimiento médico recomendado'];
  }
  
  /**
   * Extract Mexican herbs from traditional recommendations
   */
  private extractMexicanHerbs(traditionalRecommendation: string): string[] {
    const herbs: string[] = [];
    const herbPatterns = [
      'manzanilla', 'gordolobo', 'eucalipto', 'bugambilia', 'sábila',
      'caléndula', 'árnica', 'hierba buena', 'tomillo', 'jamaica',
      'nopal', 'ajo', 'jengibre', 'cúrcuma', 'valeriana', 'pasiflora'
    ];
    
    const textLower = traditionalRecommendation.toLowerCase();
    herbPatterns.forEach(herb => {
      if (textLower.includes(herb)) {
        herbs.push(herb);
      }
    });
    
    return herbs;
  }
  
  /**
   * Deduplicate health indicators based on similarity
   */
  private deduplicateIndicators(indicators: HealthIndicator[]): HealthIndicator[] {
    const unique: HealthIndicator[] = [];
    const seen = new Set<string>();
    
    indicators.forEach(indicator => {
      // Create a key based on category and finding similarity
      const key = `${indicator.category}-${indicator.finding.substring(0, 30).toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(indicator);
      } else {
        // If duplicate, merge with higher confidence
        const existing = unique.find(u => 
          u.category === indicator.category && 
          u.finding.substring(0, 30).toLowerCase() === indicator.finding.substring(0, 30).toLowerCase()
        );
        if (existing && indicator.confidence > existing.confidence) {
          existing.confidence = indicator.confidence;
          existing.severity = indicator.severity;
        }
      }
    });
    
    return unique;
  }
}

export const openAIVisionService = OpenAIVisionService.getInstance();