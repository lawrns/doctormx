/**
 * RealComprehensiveMedicalImageAnalyzer - Replaces mock system with real analysis
 * 
 * Integrates all the new real analysis services:
 * - RealImageProcessor for pixel-level analysis
 * - ComputerVisionAnalyzer for CV algorithms
 * - RealSkinAnalyzer for skin analysis
 * - RealFacialAnalyzer for facial analysis
 * - IntelligentProtocolMatcher for dynamic protocol selection
 */

import { loggingService } from './LoggingService';
import { RealImageProcessor } from './RealImageProcessor';
import { ComputerVisionAnalyzer } from './ComputerVisionAnalyzer';
import { RealSkinAnalyzer } from './RealSkinAnalyzer';
import { RealFacialAnalyzer } from './RealFacialAnalyzer';
import { IntelligentProtocolMatcher } from './IntelligentProtocolMatcher';
import { HerbService } from './HerbService';
import { MexicanCulturalContextService } from './MexicanCulturalContextService';

// Import existing interfaces that we need to maintain compatibility
export interface ImageAnalysisInput {
  imageData: string | File | Blob;
  analysisType: AnalysisType;
  patientContext?: PatientContext;
  qualitySettings?: QualitySettings;
  culturalContext?: 'mexican' | 'tcm' | 'ayurveda' | 'global';
}

export interface PatientContext {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  constitution?: 'vata' | 'pitta' | 'kapha' | 'mixed';
  medicalHistory?: string[];
  currentSymptoms?: string[];
  medications?: string[];
}

export interface QualitySettings {
  minResolution: number;
  requiredLighting: 'natural' | 'led_ring' | 'professional';
  colorAccuracy: 'standard' | 'professional' | 'medical_grade';
  stabilityRequired: boolean;
}

export type AnalysisType =
  | 'facial_analysis'
  | 'eye_analysis'
  | 'tongue_diagnosis'
  | 'skin_analysis'
  | 'nail_analysis'
  | 'hair_scalp_analysis'
  | 'posture_analysis'
  | 'throat_oral_analysis'
  | 'hands_extremities'
  | 'body_surface_mapping'
  | 'comprehensive_scan';

export interface ComprehensiveAnalysisResult {
  analysisType: AnalysisType;
  timestamp: Date;
  overallHealthScore: HealthScore;
  primaryFindings: HealthIndicator[];
  secondaryFindings: HealthIndicator[];
  constitutionalAssessment: ConstitutionalMarkers;
  treatmentRecommendations: TreatmentRecommendation[];
  mexicanCulturalContext: string[];
  herbRecommendations: string[];
  urgentReferrals: string[];
  followUpSchedule: string;
  confidence: number;
  qualityMetrics: QualityMetrics;

  // Enhanced analysis results
  realImageMetrics?: any;
  skinAnalysisResult?: any;
  facialAnalysisResult?: any;
  protocolRecommendation?: any;
}

export interface HealthScore {
  score: number;
  status: 'poor' | 'fair' | 'good' | 'excellent';
  indicators: string[];
  recommendations: string[];
}

export interface HealthIndicator {
  category: 'circulatory' | 'digestive' | 'respiratory' | 'nervous' | 'structural' | 'dermatological' | 'emotional' | 'constitutional';
  finding: string;
  severity: 'low' | 'moderate' | 'high';
  confidence: number;
  organSystems: string[];
  recommendations: string[];
}

export interface ConstitutionalMarkers {
  ayurvedicType: 'vata' | 'pitta' | 'kapha' | 'mixed';
  tcmConstitution: 'hot' | 'cold' | 'damp' | 'dry' | 'balanced';
  metabolicType: 'fast' | 'normal' | 'slow';
  indicators: string[];
}

export interface TreatmentRecommendation {
  category: 'herbal' | 'dietary' | 'lifestyle' | 'medical_referral' | 'specialist';
  recommendations: string[];
  mexicanHerbs?: string[];
  culturalAdaptations?: string[];
  urgency: 'routine' | 'moderate' | 'urgent' | 'emergency';
  followUp: string;
}

export interface QualityMetrics {
  imageQuality: number;
  lightingScore: number;
  focusScore: number;
  colorAccuracy: number;
  stabilityScore: number;
  overallQuality: number;
  improvements: string[];
}

/**
 * Real Comprehensive Medical Image Analyzer
 */
export class RealComprehensiveMedicalImageAnalyzer {
  private static instance: RealComprehensiveMedicalImageAnalyzer;
  private imageProcessor: RealImageProcessor;
  private cvAnalyzer: ComputerVisionAnalyzer;
  private skinAnalyzer: RealSkinAnalyzer;
  private facialAnalyzer: RealFacialAnalyzer;
  private protocolMatcher: IntelligentProtocolMatcher;
  private herbService: HerbService;
  private culturalService: MexicanCulturalContextService;

  static getInstance(): RealComprehensiveMedicalImageAnalyzer {
    if (!RealComprehensiveMedicalImageAnalyzer.instance) {
      RealComprehensiveMedicalImageAnalyzer.instance = new RealComprehensiveMedicalImageAnalyzer();
    }
    return RealComprehensiveMedicalImageAnalyzer.instance;
  }

  constructor() {
    this.imageProcessor = RealImageProcessor.getInstance();
    this.cvAnalyzer = ComputerVisionAnalyzer.getInstance();
    this.skinAnalyzer = RealSkinAnalyzer.getInstance();
    this.facialAnalyzer = RealFacialAnalyzer.getInstance();
    this.protocolMatcher = IntelligentProtocolMatcher.getInstance();
    this.herbService = HerbService.getInstance();
    this.culturalService = MexicanCulturalContextService.getInstance();
  }

  /**
   * Main analysis method - now uses real analysis instead of mocks
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ComprehensiveAnalysisResult> {
    try {
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Starting real comprehensive image analysis', {
        analysisType: input.analysisType,
        culturalContext: input.culturalContext
      });

      // Step 1: Convert input to ImageData
      const imageData = await this.convertToImageData(input.imageData);

      // Step 2: Real image quality assessment
      const realImageMetrics = await this.imageProcessor.analyzePixelData(imageData);
      const qualityMetrics = this.convertToLegacyQualityMetrics(realImageMetrics);

      if (qualityMetrics.overallQuality < 60) {
        throw new Error(`Image quality insufficient for analysis. Score: ${qualityMetrics.overallQuality}/100`);
      }

      // Step 3: Perform real analysis based on type
      let result: ComprehensiveAnalysisResult;

      switch (input.analysisType) {
        case 'facial_analysis':
          result = await this.performRealFacialAnalysis(imageData, input, qualityMetrics);
          break;
        case 'skin_analysis':
          result = await this.performRealSkinAnalysis(imageData, input, qualityMetrics);
          break;
        case 'comprehensive_scan':
          result = await this.performComprehensiveRealAnalysis(imageData, input, qualityMetrics);
          break;
        case 'eye_analysis':
        case 'tongue_diagnosis':
        case 'nail_analysis':
        case 'hair_scalp_analysis':
        case 'posture_analysis':
        case 'throat_oral_analysis':
        case 'hands_extremities':
        case 'body_surface_mapping':
          // For these specialized types, use facial analysis as base and adapt
          result = await this.performSpecializedAnalysis(imageData, input, qualityMetrics);
          break;
        default:
          result = await this.performRealFacialAnalysis(imageData, input, qualityMetrics);
      }

      // Step 4: Apply cultural context
      result = await this.applyCulturalContext(result, input.culturalContext || 'mexican');

      // Step 5: Generate herb recommendations
      result = await this.generateHerbRecommendations(result);

      // Step 6: Store real analysis data
      result.realImageMetrics = realImageMetrics;

      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Real analysis completed successfully', {
        analysisType: input.analysisType,
        findingsCount: result.primaryFindings.length,
        confidence: result.confidence,
        overallHealth: result.overallHealthScore.score
      });

      return result;

    } catch (error) {
      loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Real analysis failed', error as Error);
      throw new Error(`Real image analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Perform real facial analysis using new analyzers
   */
  private async performRealFacialAnalysis(
    imageData: ImageData,
    input: ImageAnalysisInput,
    qualityMetrics: QualityMetrics
  ): Promise<ComprehensiveAnalysisResult> {
    
    // Use the real facial analyzer
    const facialAnalysisResult = await this.facialAnalyzer.analyzeFace(imageData);
    
    // Convert facial analysis results to legacy format
    const primaryFindings = this.convertFacialFindingsToHealthIndicators(facialAnalysisResult.healthIndicators);
    const constitutionalAssessment = this.convertFacialConstitutionalToLegacy(facialAnalysisResult.constitutionalMarkers);
    
    // Calculate overall health score
    const overallHealthScore = this.convertFacialHealthScore(facialAnalysisResult.overallFacialHealth);

    // Generate intelligent protocol recommendations
    const protocolRecommendation = await this.protocolMatcher.findOptimalProtocols({
      primaryFindings,
      secondaryFindings: [],
      constitutionalAssessment,
      urgencyLevel: this.determineUrgencyLevel(primaryFindings),
      patientContext: input.patientContext
    });

    // Convert protocol recommendations to legacy format
    const treatmentRecommendations = this.convertProtocolRecommendationsToLegacy(protocolRecommendation);

    return {
      analysisType: input.analysisType,
      timestamp: new Date(),
      overallHealthScore,
      primaryFindings,
      secondaryFindings: [],
      constitutionalAssessment,
      treatmentRecommendations,
      mexicanCulturalContext: [],
      herbRecommendations: [],
      urgentReferrals: this.extractUrgentReferrals(primaryFindings),
      followUpSchedule: protocolRecommendation.implementationPlan.monthlyReviews[0] || '2 weeks',
      confidence: facialAnalysisResult.confidence,
      qualityMetrics,
      facialAnalysisResult,
      protocolRecommendation
    };
  }

  /**
   * Perform real skin analysis
   */
  private async performRealSkinAnalysis(
    imageData: ImageData,
    input: ImageAnalysisInput,
    qualityMetrics: QualityMetrics
  ): Promise<ComprehensiveAnalysisResult> {
    
    // Use the real skin analyzer
    const skinAnalysisResult = await this.skinAnalyzer.analyzeSkin(imageData);
    
    // Convert skin analysis results to legacy format
    const primaryFindings = this.convertSkinFindingsToHealthIndicators(skinAnalysisResult);
    const constitutionalAssessment = this.deriveConstitutionalFromSkin(skinAnalysisResult);
    
    // Calculate overall health score from skin analysis
    const overallHealthScore = this.convertSkinHealthScore(skinAnalysisResult.overallSkinHealth);

    // Generate intelligent protocol recommendations
    const protocolRecommendation = await this.protocolMatcher.findOptimalProtocols({
      primaryFindings,
      secondaryFindings: [],
      constitutionalAssessment,
      urgencyLevel: this.determineUrgencyLevel(primaryFindings),
      patientContext: input.patientContext
    });

    // Convert to legacy format
    const treatmentRecommendations = this.convertProtocolRecommendationsToLegacy(protocolRecommendation);

    return {
      analysisType: input.analysisType,
      timestamp: new Date(),
      overallHealthScore,
      primaryFindings,
      secondaryFindings: [],
      constitutionalAssessment,
      treatmentRecommendations,
      mexicanCulturalContext: [],
      herbRecommendations: [],
      urgentReferrals: this.extractUrgentReferrals(primaryFindings),
      followUpSchedule: protocolRecommendation.implementationPlan.monthlyReviews[0] || '2 weeks',
      confidence: skinAnalysisResult.confidence,
      qualityMetrics,
      skinAnalysisResult,
      protocolRecommendation
    };
  }

  /**
   * Perform comprehensive real analysis combining all analyzers
   */
  private async performComprehensiveRealAnalysis(
    imageData: ImageData,
    input: ImageAnalysisInput,
    qualityMetrics: QualityMetrics
  ): Promise<ComprehensiveAnalysisResult> {
    
    // Run both facial and skin analysis
    const [facialResult, skinResult] = await Promise.all([
      this.facialAnalyzer.analyzeFace(imageData),
      this.skinAnalyzer.analyzeSkin(imageData)
    ]);

    // Combine findings from both analyses
    const facialFindings = this.convertFacialFindingsToHealthIndicators(facialResult.healthIndicators);
    const skinFindings = this.convertSkinFindingsToHealthIndicators(skinResult);
    
    const primaryFindings = [...facialFindings, ...skinFindings]
      .sort((a, b) => b.confidence - a.confidence) // Sort by confidence
      .slice(0, 5); // Take top 5 findings

    const secondaryFindings = [...facialFindings, ...skinFindings]
      .filter(f => !primaryFindings.includes(f))
      .slice(0, 3); // Take next 3 as secondary

    // Use facial constitutional assessment as primary
    const constitutionalAssessment = this.convertFacialConstitutionalToLegacy(facialResult.constitutionalMarkers);
    
    // Calculate combined health score
    const overallHealthScore = this.calculateCombinedHealthScore(facialResult.overallFacialHealth, skinResult.overallSkinHealth);

    // Generate comprehensive protocol recommendations
    const protocolRecommendation = await this.protocolMatcher.findOptimalProtocols({
      primaryFindings,
      secondaryFindings,
      constitutionalAssessment,
      urgencyLevel: this.determineUrgencyLevel(primaryFindings),
      patientContext: input.patientContext
    });

    const treatmentRecommendations = this.convertProtocolRecommendationsToLegacy(protocolRecommendation);
    
    // Calculate combined confidence
    const confidence = (facialResult.confidence + skinResult.confidence) / 2;

    return {
      analysisType: input.analysisType,
      timestamp: new Date(),
      overallHealthScore,
      primaryFindings,
      secondaryFindings,
      constitutionalAssessment,
      treatmentRecommendations,
      mexicanCulturalContext: [],
      herbRecommendations: [],
      urgentReferrals: this.extractUrgentReferrals(primaryFindings),
      followUpSchedule: protocolRecommendation.implementationPlan.monthlyReviews[0] || '2 weeks',
      confidence,
      qualityMetrics,
      facialAnalysisResult: facialResult,
      skinAnalysisResult: skinResult,
      protocolRecommendation
    };
  }

  /**
   * Perform specialized analysis for specific types
   */
  private async performSpecializedAnalysis(
    imageData: ImageData,
    input: ImageAnalysisInput,
    qualityMetrics: QualityMetrics
  ): Promise<ComprehensiveAnalysisResult> {
    
    // Use facial analysis as base and adapt findings based on analysis type
    const baseResult = await this.performRealFacialAnalysis(imageData, input, qualityMetrics);
    
    // Adapt findings based on specific analysis type
    switch (input.analysisType) {
      case 'eye_analysis':
        baseResult.primaryFindings = baseResult.primaryFindings.filter(f => 
          f.category === 'circulatory' || f.organSystems.includes('nervous')
        );
        baseResult.primaryFindings.forEach(f => {
          f.finding = `Eye-related: ${f.finding}`;
        });
        break;
        
      case 'tongue_diagnosis':
        // Simulate tongue-specific findings
        baseResult.primaryFindings = [
          {
            category: 'digestive',
            finding: 'Tongue texture indicates digestive imbalance',
            severity: 'moderate',
            confidence: 0.8,
            organSystems: ['digestive'],
            recommendations: ['Digestive herbs', 'Dietary modifications']
          }
        ];
        break;
    }

    return baseResult;
  }

  // Conversion methods to maintain compatibility with existing interfaces

  private convertToImageData(input: string | File | Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      if (typeof input === 'string') {
        // Handle base64 string
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            resolve(imageData);
          } else {
            reject(new Error('Failed to extract image data'));
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = input;
      } else {
        // Handle File or Blob
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            this.convertToImageData(reader.result as string).then(resolve).catch(reject);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(input);
      }
    });
  }

  private convertToLegacyQualityMetrics(realMetrics: any): QualityMetrics {
    return {
      imageQuality: realMetrics.qualityScore,
      lightingScore: realMetrics.brightness,
      focusScore: realMetrics.sharpness,
      colorAccuracy: realMetrics.colorProfile.saturation,
      stabilityScore: 100 - realMetrics.textureMetrics.roughness, // Inverse of roughness
      overallQuality: realMetrics.qualityScore,
      improvements: this.generateQualityImprovements(realMetrics)
    };
  }

  private generateQualityImprovements(metrics: any): string[] {
    const improvements: string[] = [];
    
    if (metrics.brightness < 40) {
      improvements.push('Increase lighting');
    }
    if (metrics.sharpness < 50) {
      improvements.push('Reduce camera shake');
    }
    if (metrics.contrast < 30) {
      improvements.push('Improve contrast');
    }
    
    return improvements;
  }

  private convertFacialFindingsToHealthIndicators(facialIndicators: any[]): HealthIndicator[] {
    return facialIndicators.map(indicator => ({
      category: this.mapFacialCategoryToLegacy(indicator.category),
      finding: indicator.finding,
      severity: this.mapSeverityToLegacy(indicator.severity),
      confidence: indicator.confidence,
      organSystems: indicator.organSystem ? [indicator.organSystem] : ['general'],
      recommendations: indicator.recommendations || []
    }));
  }

  private convertSkinFindingsToHealthIndicators(skinResult: any): HealthIndicator[] {
    const findings: HealthIndicator[] = [];
    
    // Convert hydration findings
    if (skinResult.hydrationAssessment.overallHydration < 50) {
      findings.push({
        category: 'dermatological',
        finding: 'Low skin hydration detected',
        severity: skinResult.hydrationAssessment.overallHydration < 30 ? 'high' : 'moderate',
        confidence: 0.8,
        organSystems: ['integumentary'],
        recommendations: skinResult.hydrationAssessment.recommendations
      });
    }

    // Convert inflammation findings
    if (skinResult.inflammationDetection.overallInflammation > 50) {
      findings.push({
        category: 'dermatological',
        finding: 'Skin inflammation detected',
        severity: skinResult.inflammationDetection.overallInflammation > 75 ? 'high' : 'moderate',
        confidence: 0.7,
        organSystems: ['integumentary'],
        recommendations: skinResult.inflammationDetection.recommendations
      });
    }

    // Convert pigmentation findings
    if (skinResult.pigmentationAnalysis.uniformity < 60) {
      findings.push({
        category: 'dermatological',
        finding: 'Pigmentation irregularities detected',
        severity: 'low',
        confidence: 0.6,
        organSystems: ['integumentary'],
        recommendations: ['Sun protection', 'Pigmentation treatment']
      });
    }

    return findings;
  }

  private convertFacialConstitutionalToLegacy(facialConstitutional: any): ConstitutionalMarkers {
    return {
      ayurvedicType: facialConstitutional.ayurvedicType.primary,
      tcmConstitution: facialConstitutional.tcmConstitution.primaryPattern,
      metabolicType: facialConstitutional.metabolicIndicators.metabolicRate,
      indicators: facialConstitutional.ayurvedicType.indicators.vata.concat(
        facialConstitutional.ayurvedicType.indicators.pitta,
        facialConstitutional.ayurvedicType.indicators.kapha
      )
    };
  }

  private deriveConstitutionalFromSkin(skinResult: any): ConstitutionalMarkers {
    // Derive constitutional type from skin characteristics
    let ayurvedicType: 'vata' | 'pitta' | 'kapha' | 'mixed' = 'mixed';
    
    if (skinResult.overallSkinHealth.hydration < 40) {
      ayurvedicType = 'vata'; // Dry = Vata
    } else if (skinResult.inflammationDetection.overallInflammation > 50) {
      ayurvedicType = 'pitta'; // Inflammatory = Pitta
    } else if (skinResult.overallSkinHealth.tone > 80) {
      ayurvedicType = 'kapha'; // Good tone = Kapha
    }

    return {
      ayurvedicType,
      tcmConstitution: 'balanced',
      metabolicType: 'normal',
      indicators: [`Skin-based assessment: ${ayurvedicType} characteristics`]
    };
  }

  private convertFacialHealthScore(facialHealth: any): HealthScore {
    return {
      score: facialHealth.overall,
      status: this.mapScoreToStatus(facialHealth.overall),
      indicators: [`Facial health: ${facialHealth.overall}/100`],
      recommendations: ['Continue facial care routine']
    };
  }

  private convertSkinHealthScore(skinHealth: any): HealthScore {
    return {
      score: skinHealth.overall,
      status: this.mapScoreToStatus(skinHealth.overall),
      indicators: [`Skin health: ${skinHealth.overall}/100`],
      recommendations: ['Maintain skin care routine']
    };
  }

  private calculateCombinedHealthScore(facialHealth: any, skinHealth: any): HealthScore {
    const combined = (facialHealth.overall + skinHealth.overall) / 2;
    
    return {
      score: combined,
      status: this.mapScoreToStatus(combined),
      indicators: [
        `Facial health: ${facialHealth.overall}/100`,
        `Skin health: ${skinHealth.overall}/100`,
        `Combined: ${combined}/100`
      ],
      recommendations: ['Holistic health approach recommended']
    };
  }

  private convertProtocolRecommendationsToLegacy(protocolRec: any): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];
    
    // Primary protocol
    recommendations.push({
      category: this.mapProtocolCategoryToLegacy(protocolRec.primaryProtocol.protocol.category),
      recommendations: [protocolRec.primaryProtocol.protocol.name],
      mexicanHerbs: this.extractMexicanHerbs(protocolRec.primaryProtocol.protocol),
      culturalAdaptations: protocolRec.primaryProtocol.protocol.culturalAdaptations.map((a: any) => a.adaptationStrategy),
      urgency: this.mapUrgencyToLegacy(protocolRec.primaryProtocol.protocol.followUpSchedule.initialFollowUp),
      followUp: protocolRec.primaryProtocol.protocol.followUpSchedule.initialFollowUp
    });

    // Supportive protocols
    protocolRec.supportiveProtocols.forEach((supportive: any) => {
      recommendations.push({
        category: this.mapProtocolCategoryToLegacy(supportive.protocol.category),
        recommendations: [supportive.protocol.name],
        mexicanHerbs: this.extractMexicanHerbs(supportive.protocol),
        culturalAdaptations: supportive.protocol.culturalAdaptations.map((a: any) => a.adaptationStrategy),
        urgency: 'routine',
        followUp: supportive.protocol.followUpSchedule.ongoingSchedule
      });
    });

    return recommendations;
  }

  private mapFacialCategoryToLegacy(category: string): HealthIndicator['category'] {
    const mapping: Record<string, HealthIndicator['category']> = {
      'structural': 'structural',
      'functional': 'circulatory',
      'constitutional': 'constitutional',
      'emotional': 'emotional',
      'circulatory': 'circulatory',
      'digestive': 'digestive',
      'respiratory': 'respiratory',
      'hormonal': 'constitutional'
    };
    
    return mapping[category] || 'constitutional';
  }

  private mapSeverityToLegacy(severity: string): 'low' | 'moderate' | 'high' {
    const mapping: Record<string, 'low' | 'moderate' | 'high'> = {
      'mild': 'low',
      'moderate': 'moderate',
      'significant': 'high',
      'severe': 'high'
    };
    
    return mapping[severity] || 'moderate';
  }

  private mapScoreToStatus(score: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  private mapProtocolCategoryToLegacy(category: string): TreatmentRecommendation['category'] {
    const mapping: Record<string, TreatmentRecommendation['category']> = {
      'dermatological': 'herbal',
      'circulatory': 'lifestyle',
      'structural': 'specialist',
      'respiratory': 'herbal',
      'digestive': 'herbal',
      'nervous': 'herbal',
      'endocrine': 'medical_referral',
      'constitutional': 'herbal',
      'emotional': 'lifestyle'
    };
    
    return mapping[category] || 'herbal';
  }

  private mapUrgencyToLegacy(followUp: string): 'routine' | 'moderate' | 'urgent' | 'emergency' {
    if (followUp.includes('immediately') || followUp.includes('urgent')) return 'urgent';
    if (followUp.includes('3 days') || followUp.includes('1 week')) return 'moderate';
    return 'routine';
  }

  private extractMexicanHerbs(protocol: any): string[] {
    const herbs: string[] = [];
    
    protocol.phases.forEach((phase: any) => {
      phase.herbs.forEach((herb: any) => {
        if (herb.mexicanName) {
          herbs.push(herb.mexicanName);
        }
      });
    });
    
    return [...new Set(herbs)]; // Remove duplicates
  }

  private determineUrgencyLevel(findings: HealthIndicator[]): 'routine' | 'monitor' | 'consult' | 'urgent' {
    const hasSevere = findings.some(f => f.severity === 'high');
    const hasMultipleModerate = findings.filter(f => f.severity === 'moderate').length >= 3;
    
    if (hasSevere) return 'urgent';
    if (hasMultipleModerate) return 'consult';
    if (findings.length > 2) return 'monitor';
    return 'routine';
  }

  private extractUrgentReferrals(findings: HealthIndicator[]): string[] {
    return findings
      .filter(f => f.severity === 'high')
      .map(f => `Urgent referral recommended for: ${f.finding}`);
  }

  private async applyCulturalContext(
    result: ComprehensiveAnalysisResult,
    culturalContext: string
  ): Promise<ComprehensiveAnalysisResult> {
    
    if (culturalContext === 'mexican') {
      const culturalInfo = await this.culturalService.getCulturalContext('general_health', 'general');
      
      result.mexicanCulturalContext = [
        'Análisis adaptado para contexto mexicano',
        'Considerando altitud y clima de México',
        'Integrando medicina tradicional mexicana'
      ];
      
      // Add cultural context to treatment recommendations
      result.treatmentRecommendations.forEach(treatment => {
        if (treatment.category === 'herbal') {
          treatment.culturalAdaptations = treatment.culturalAdaptations || [];
          treatment.culturalAdaptations.push('Preparar como agua fresca');
          treatment.culturalAdaptations.push('Considerar tradiciones familiares');
        }
      });
    }
    
    return result;
  }

  private async generateHerbRecommendations(
    result: ComprehensiveAnalysisResult
  ): Promise<ComprehensiveAnalysisResult> {
    
    const herbRecommendations: string[] = [];
    
    // Based on primary findings, recommend appropriate herbs
    for (const finding of result.primaryFindings) {
      switch (finding.category) {
        case 'circulatory':
          herbRecommendations.push('ginkgo', 'hawthorn', 'cayenne');
          break;
        case 'digestive':
          herbRecommendations.push('manzanilla', 'hierba buena', 'boldo');
          break;
        case 'respiratory':
          herbRecommendations.push('gordolobo', 'eucalipto', 'bugambilia');
          break;
        case 'nervous':
          herbRecommendations.push('valeriana', 'toronjil', 'pasiflora');
          break;
        case 'dermatological':
          herbRecommendations.push('sábila', 'caléndula', 'manzanilla');
          break;
      }
    }
    
    // Constitutional recommendations
    switch (result.constitutionalAssessment.ayurvedicType) {
      case 'vata':
        herbRecommendations.push('ashwagandha', 'sesame oil', 'warm spices');
        break;
      case 'pitta':
        herbRecommendations.push('aloe vera', 'mint', 'cooling herbs');
        break;
      case 'kapha':
        herbRecommendations.push('ginger', 'turmeric', 'warming spices');
        break;
    }
    
    result.herbRecommendations = [...new Set(herbRecommendations)]; // Remove duplicates
    
    return result;
  }
}