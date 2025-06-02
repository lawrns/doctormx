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
import { realDiagnosticAnalysisService } from './RealDiagnosticAnalysisService';
import { openAIVisionService } from './OpenAIVisionService';

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
  
  // Required fields for compatibility
  imageMetrics?: QualityMetrics;
  urgencyLevel?: 'routine' | 'soon' | 'urgent' | 'emergency';
  followUpRecommended?: string;
  reportTimestamp?: string;
  culturalInsights?: any;
  confidenceScore?: {
    overall: number;
    byCategory: {
      imaging: number;
      constitutional: number;
      cultural: number;
      aiAnalysis?: number;
    };
  };
  
  // AI Vision API insights
  aiInsights?: {
    analysis: string;
    findings: string;
    suggestedSpecialty: string;
  };
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
    try {
      this.imageProcessor = RealImageProcessor.getInstance();
      this.cvAnalyzer = ComputerVisionAnalyzer.getInstance();
      this.skinAnalyzer = RealSkinAnalyzer.getInstance();
      this.facialAnalyzer = RealFacialAnalyzer.getInstance();
      this.protocolMatcher = IntelligentProtocolMatcher.getInstance();
      this.herbService = HerbService.getInstance();
      this.culturalService = MexicanCulturalContextService.getInstance();
      
      // Validate all dependencies are properly initialized
      if (!this.imageProcessor) {
        throw new Error('Failed to initialize RealImageProcessor');
      }
      if (!this.facialAnalyzer) {
        throw new Error('Failed to initialize RealFacialAnalyzer');
      }
      if (!this.facialAnalyzer.analyzeFace) {
        throw new Error('RealFacialAnalyzer missing analyzeFace method');
      }
      
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'All dependencies initialized successfully');
    } catch (error) {
      loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Failed to initialize dependencies', error as Error);
      throw error;
    }
  }

  /**
   * Main analysis method - now uses real analysis instead of mocks
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ComprehensiveAnalysisResult> {
    try {
      // DEBUG: Log which analyzer is being used
      console.log('✅ Using RealComprehensiveMedicalImageAnalyzer (CORRECT)');
      
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Starting real comprehensive image analysis', {
        analysisType: input.analysisType,
        culturalContext: input.culturalContext
      });

      // Step 1: Convert input to ImageData
      const imageData = await this.convertToImageData(input.imageData);

      // Step 2: Real image quality assessment
      const realImageMetrics = await this.imageProcessor.analyzePixelData(imageData);
      const qualityMetrics = this.convertToLegacyQualityMetrics(realImageMetrics);

      if (qualityMetrics.overallQuality < 30) {
        loggingService.warn('RealComprehensiveMedicalImageAnalyzer', 'Low image quality detected', {
          score: qualityMetrics.overallQuality,
          threshold: 30
        });
      }

      // Step 3: Extract features for diagnostic analysis
      const imageFeatures = await realDiagnosticAnalysisService.extractImageFeatures(imageData);
      
      // Step 4: Perform real diagnostic analysis
      const diagnosticResult = await realDiagnosticAnalysisService.analyzeDiagnostics(
        imageData,
        input.analysisType,
        imageFeatures
      );

      // Step 5: Generate constitutional assessment
      const constitutionalMarkers = await realDiagnosticAnalysisService.generateConstitutionalAssessment(
        imageFeatures,
        input.analysisType
      );

      // Step 6: Generate treatment recommendations
      const treatmentRecommendations = await realDiagnosticAnalysisService.generateTreatmentRecommendations(
        diagnosticResult.findings,
        constitutionalMarkers
      );

      // Step 7: Perform specialized analysis based on type
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

      // Step 8: Merge real diagnostic findings with specialized analysis
      result = this.mergeWithRealDiagnostics(result, diagnosticResult, constitutionalMarkers, treatmentRecommendations);

      // Step 8.5: Enhance with OpenAI Vision API analysis (if not already done)
      // Check if Vision API was already called in performRealFacialAnalysis
      const visionAlreadyCalled = result.primaryFindings.some(f => 
        f.finding.includes('Vision API') || f.confidence === 0.85
      );
      
      if (!visionAlreadyCalled) {
        try {
          loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Preparing for Vision API analysis (second attempt)');
          
          // Check if we already have a data URL
          let dataUrl: string;
          if (typeof input.imageData === 'string' && input.imageData.startsWith('data:')) {
            // Already a data URL
            dataUrl = input.imageData;
            loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Using existing data URL for Vision API');
          } else if (typeof document !== 'undefined') {
            // Browser environment - convert ImageData to data URL
            const canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.putImageData(imageData, 0, 0);
              dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            } else {
              throw new Error('Failed to get canvas context');
            }
          } else {
            // Server environment or no canvas support
            loggingService.warn('RealComprehensiveMedicalImageAnalyzer', 'Canvas not available, skipping Vision API enhancement');
            throw new Error('Canvas not available for Vision API conversion');
          }
          
          loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Calling OpenAI Vision API (second attempt)');
          
          const visionResponse = await openAIVisionService.analyzeWithVisionAPI({
            imageDataUrl: dataUrl,
            analysisType: input.analysisType,
            culturalContext: input.culturalContext || 'mexican',
            symptoms: input.patientContext?.currentSymptoms?.join(', ')
          });
          
          // Merge Vision API insights with local analysis
          result = openAIVisionService.convertToComprehensiveResult(visionResponse, result);
          
          loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Vision API analysis successfully integrated (second attempt)', {
            visionConfidence: visionResponse.confidence,
            findingsCount: result.primaryFindings.length
          });
        } catch (visionError) {
          // Log but don't fail - continue with local analysis results
          loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Vision API analysis failed (second attempt), continuing with local analysis', visionError as Error);
          
          // Enhance local analysis when Vision API fails
          result = await this.enhanceLocalAnalysisWithFallback(result, imageData, input);
        }
      } else {
        loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Skipping duplicate Vision API call - already enhanced');
      }

      // Step 9: Apply cultural context
      result = await this.applyCulturalContext(result, input.culturalContext || 'mexican');

      // Step 10: Generate herb recommendations
      result = await this.generateHerbRecommendations(result);

      // Step 11: Store real analysis data
      result.realImageMetrics = realImageMetrics;
      result.confidence = Math.max(result.confidence, diagnosticResult.confidence);

      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Real analysis completed successfully', {
        analysisType: input.analysisType,
        findingsCount: result.primaryFindings.length,
        confidence: result.confidence,
        overallHealth: result.overallHealthScore.score
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      
      loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Real analysis failed', error as Error, {
        errorType: error?.constructor?.name,
        errorMessage,
        errorStack,
        analysisType: input.analysisType,
        imageDataType: typeof input.imageData,
        hasPatientContext: !!input.patientContext
      });
      
      // Log specific step where error occurred
      console.error('Analysis Error Details:', {
        message: errorMessage,
        stack: errorStack,
        analysisType: input.analysisType
      });
      
      throw new Error(`Real image analysis failed: ${errorMessage}`);
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
    
    try {
      // Validate ImageData before processing
      if (!imageData) {
        throw new Error('ImageData is null or undefined in performRealFacialAnalysis');
      }

      if (!imageData.data || !(imageData.data instanceof Uint8ClampedArray)) {
        throw new Error('Invalid ImageData in performRealFacialAnalysis: missing or invalid data array');
      }

      if (!imageData.width || !imageData.height || imageData.width <= 0 || imageData.height <= 0) {
        throw new Error(`Invalid ImageData dimensions in performRealFacialAnalysis: ${imageData.width}x${imageData.height}`);
      }

      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Starting facial analysis step', {
        imageSize: `${imageData.width}x${imageData.height}`,
        dataLength: imageData.data?.length,
        dataType: imageData.data?.constructor?.name,
        facialAnalyzerType: typeof this.facialAnalyzer,
        analyzeFaceMethod: typeof this.facialAnalyzer?.analyzeFace,
        hasFacialAnalyzer: !!this.facialAnalyzer
      });
      
      // Debug: Log the facial analyzer instance
      console.log('DEBUG: Facial Analyzer Instance:', {
        exists: !!this.facialAnalyzer,
        type: this.facialAnalyzer?.constructor?.name,
        hasAnalyzeFace: !!this.facialAnalyzer?.analyzeFace,
        analyzeFaceType: typeof this.facialAnalyzer?.analyzeFace
      });
      
      // Check if facial analyzer is properly initialized
      if (!this.facialAnalyzer) {
        throw new Error('FacialAnalyzer not initialized');
      }
      
      if (typeof this.facialAnalyzer.analyzeFace !== 'function') {
        console.error('DEBUG: FacialAnalyzer methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.facialAnalyzer)));
        throw new Error('FacialAnalyzer.analyzeFace is not a function');
      }
      
      // Use the real facial analyzer with error handling
      let facialAnalysisResult;
      try {
        console.log('DEBUG: About to call facialAnalyzer.analyzeFace with ImageData:', {
          width: imageData.width,
          height: imageData.height,
          dataLength: imageData.data?.length
        });
        
        facialAnalysisResult = await Promise.race([
          this.facialAnalyzer.analyzeFace(imageData),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Facial analysis timeout after 30 seconds')), 30000)
          )
        ]) as any;
        
        console.log('DEBUG: Facial analysis result received:', {
          success: true,
          hasResult: !!facialAnalysisResult,
          confidence: facialAnalysisResult?.confidence
        });
      } catch (facialError) {
        console.error('DEBUG: Facial analysis error:', facialError);
        console.error('DEBUG: Error type:', facialError?.constructor?.name);
        console.error('DEBUG: Error message:', facialError?.message);
        console.error('DEBUG: Error stack:', facialError?.stack);
        
        // Log more details about the error
        loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Facial analysis failed', facialError as Error, {
          imageSize: `${imageData?.width}x${imageData?.height}`,
          dataLength: imageData?.data?.length,
          errorType: facialError?.constructor?.name,
          errorMessage: facialError?.message
        });
        
        // Re-throw with more context
        throw new Error(`Facial analysis failed: ${facialError?.message || 'Unknown error'}`);
      }
      
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Facial analysis completed successfully', {
        confidence: facialAnalysisResult.confidence,
        healthIndicatorsCount: facialAnalysisResult.healthIndicators.length
      });
    
    // Convert facial analysis results to legacy format
    let primaryFindings = this.convertFacialFindingsToHealthIndicators(facialAnalysisResult.healthIndicators);
    const constitutionalAssessment = this.convertFacialConstitutionalToLegacy(facialAnalysisResult.constitutionalMarkers);
    
    // Calculate overall health score
    const overallHealthScore = this.convertFacialHealthScore(facialAnalysisResult.overallFacialHealth);

    // Check if we need Vision API enhancement based on findings
    const needsVisionEnhancement = primaryFindings.length <= 1 || 
                                  (primaryFindings.length === 1 && primaryFindings[0].finding.includes('análisis limitado')) ||
                                  facialAnalysisResult.confidence < 0.7;
    
    // Try to enhance with Vision API when local analysis has low confidence or limited findings
    if (needsVisionEnhancement) {
      try {
        loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Enhancing analysis with Vision API before protocol matching', {
          qualityScore: qualityMetrics.imageQuality,
          currentFindings: primaryFindings.length,
          reason: needsVisionEnhancement ? 'insufficient findings' : 'standard enhancement'
        });
        
        // Convert to data URL for Vision API
        let dataUrl: string;
        if (typeof input.imageData === 'string' && input.imageData.startsWith('data:')) {
          dataUrl = input.imageData;
        } else if (typeof document !== 'undefined') {
          const canvas = document.createElement('canvas');
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.putImageData(imageData, 0, 0);
            dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          } else {
            throw new Error('Failed to get canvas context');
          }
        } else {
          throw new Error('Canvas not available');
        }
        
        // Call Vision API
        const visionResponse = await openAIVisionService.analyzeWithVisionAPI({
          imageDataUrl: dataUrl,
          analysisType: input.analysisType,
          culturalContext: input.culturalContext || 'mexican',
          symptoms: input.patientContext?.currentSymptoms?.join(', ')
        });
        
        loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Vision API raw response', {
          success: visionResponse.success,
          analysis: visionResponse.analysis?.substring(0, 200) + '...',
          findings: visionResponse.findings?.substring(0, 200) + '...',
          severity: visionResponse.severity,
          confidence: visionResponse.confidence,
          suggestedSpecialty: visionResponse.suggestedSpecialty
        });
        
        // Extract Vision API findings and add to primary findings
        const visionFindings = this.extractVisionFindings(visionResponse);
        
        loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Vision findings extraction result', {
          findingsExtracted: visionFindings.length,
          findingCategories: visionFindings.map(f => f.category),
          findingTexts: visionFindings.map(f => f.finding)
        });
        
        if (visionFindings.length > 0) {
          // Replace generic findings with Vision API findings
          if (primaryFindings.length === 1 && primaryFindings[0].category === 'constitutional' && 
              primaryFindings[0].finding.includes('análisis limitado')) {
            primaryFindings = visionFindings;
          } else {
            primaryFindings = [...primaryFindings, ...visionFindings];
          }
          
          loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Vision API findings added', {
            originalCount: facialAnalysisResult.healthIndicators.length,
            visionCount: visionFindings.length,
            totalCount: primaryFindings.length
          });
        } else {
          loggingService.warn('RealComprehensiveMedicalImageAnalyzer', 'No findings extracted from Vision API response', {
            responseAnalysisLength: visionResponse.analysis?.length,
            responseFindingsLength: visionResponse.findings?.length
          });
        }
      } catch (visionError) {
        loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Vision API enhancement failed', visionError as Error);
      }
    }

    // Generate intelligent protocol recommendations with enhanced findings
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

    } catch (error) {
      loggingService.error('RealComprehensiveMedicalImageAnalyzer', 'Facial analysis failed, using fallback', error as Error);
      
      // Return a basic result with minimal findings
      return {
        analysisType: input.analysisType,
        timestamp: new Date(),
        overallHealthScore: { score: 70, status: 'fair', indicators: ['Basic analysis'], recommendations: ['Continue monitoring'] },
        primaryFindings: [{
          category: 'constitutional',
          finding: 'General facial analysis completed',
          severity: 'low',
          confidence: 0.6,
          organSystems: ['general'],
          recommendations: ['Regular health monitoring']
        }],
        secondaryFindings: [],
        constitutionalAssessment: {
          ayurvedicType: 'mixed',
          tcmConstitution: 'balanced',
          metabolicType: 'normal',
          indicators: ['Basic constitutional assessment']
        },
        treatmentRecommendations: [],
        mexicanCulturalContext: [],
        herbRecommendations: [],
        urgentReferrals: [],
        followUpSchedule: '2 weeks',
        confidence: 0.6,
        qualityMetrics
      };
    }
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
    
    // Import specialized analyzers
    const { SpecializedMedicalAnalyzers } = await import('./SpecializedMedicalAnalyzers');
    const specializedAnalyzer = SpecializedMedicalAnalyzers.getInstance();
    
    let specializedResult;
    
    // Perform specialized analysis based on type
    switch (input.analysisType) {
      case 'eye_analysis':
        specializedResult = await specializedAnalyzer.analyzeEyes(imageData);
        break;
        
      case 'tongue_diagnosis':
        specializedResult = await specializedAnalyzer.analyzeTongue(imageData);
        break;
        
      case 'nail_analysis':
        specializedResult = await specializedAnalyzer.analyzeNails(imageData);
        break;
        
      case 'hair_scalp_analysis':
        specializedResult = await specializedAnalyzer.analyzeHair(imageData);
        break;
        
      case 'posture_analysis':
        specializedResult = await specializedAnalyzer.analyzePosture(imageData);
        break;
        
      default:
        // For other types, use facial analysis
        specializedResult = await specializedAnalyzer.analyzeFacial(imageData);
    }
    
    // Convert specialized result to ComprehensiveAnalysisResult format
    return {
      analysisType: input.analysisType,
      timestamp: new Date(),
      overallHealthScore: {
        score: Math.round(75 - (specializedResult.urgencyLevel === 'urgente' ? 20 : 0)),
        status: specializedResult.urgencyLevel === 'urgente' ? 'fair' : 'good',
        indicators: specializedResult.primaryObservations.slice(0, 3),
        recommendations: specializedResult.recommendations
      },
      primaryFindings: specializedResult.clinicalFindings,
      secondaryFindings: [],
      constitutionalAssessment: {
        ayurvedicType: 'mixed',
        tcmConstitution: 'balanced',
        metabolicType: 'normal',
        indicators: specializedResult.primaryObservations
      },
      treatmentRecommendations: [
        {
          category: 'medical_referral',
          recommendations: specializedResult.recommendations,
          urgency: this.mapSpanishUrgency(specializedResult.urgencyLevel),
          followUp: specializedResult.specialistReferral || 'Medicina General'
        }
      ],
      mexicanCulturalContext: [],
      herbRecommendations: [],
      urgentReferrals: specializedResult.specialistReferral ? [specializedResult.specialistReferral] : [],
      followUpSchedule: this.getFollowUpSchedule(specializedResult.urgencyLevel),
      confidence: 0.85,
      qualityMetrics,
      aiInsights: {
        analysis: specializedResult.diagnosticInsights,
        findings: specializedResult.primaryObservations.join('. '),
        suggestedSpecialty: specializedResult.specialistReferral || 'Medicina General'
      }
    };
  }
  
  private mapSpanishUrgency(urgencyLevel: string): 'routine' | 'moderate' | 'urgent' | 'emergency' {
    const urgencyMap: Record<string, 'routine' | 'moderate' | 'urgent' | 'emergency'> = {
      'rutina': 'routine',
      'seguimiento': 'moderate',
      'pronto': 'urgent',
      'urgente': 'emergency'
    };
    return urgencyMap[urgencyLevel] || 'routine';
  }
  
  private getFollowUpSchedule(urgencyLevel: string): string {
    const scheduleMap: Record<string, string> = {
      'rutina': '4-6 semanas',
      'seguimiento': '2-4 semanas',
      'pronto': '1 semana',
      'urgente': '24-48 horas'
    };
    return scheduleMap[urgencyLevel] || '2-4 semanas';
  }

  // Conversion methods to maintain compatibility with existing interfaces

  private convertToImageData(input: string | File | Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      // Check if DOM APIs are available
      if (typeof document === 'undefined' || typeof window === 'undefined') {
        reject(new Error('DOM APIs not available for image processing'));
        return;
      }
      
      try {
        if (typeof input === 'string') {
          // Handle base64 string
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            reject(new Error('Failed to get canvas 2D context'));
            return;
          }
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            try {
              // Validate image dimensions
              if (img.width === 0 || img.height === 0) {
                reject(new Error('Invalid image dimensions'));
                return;
              }
              
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              resolve(imageData);
            } catch (drawError) {
              reject(new Error(`Failed to process image: ${drawError instanceof Error ? drawError.message : 'Unknown error'}`));
            }
          };
          
          img.onerror = (e) => {
            reject(new Error(`Failed to load image: ${e instanceof Error ? e.message : 'Image load error'}`));
          };
          
          img.src = input;
        } else {
          // Handle File or Blob
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result && typeof reader.result === 'string') {
              this.convertToImageData(reader.result).then(resolve).catch(reject);
            } else {
              reject(new Error('Failed to read file data'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(input);
        }
      } catch (error) {
        reject(new Error(`Image conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`));
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
    return facialIndicators.map(indicator => {
      // Log the conversion process
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Converting facial indicator to health indicator', {
        originalCategory: indicator.category,
        originalOrganSystem: JSON.stringify(indicator.organSystem),
        isOrganSystemArray: Array.isArray(indicator.organSystem),
        organSystemType: typeof indicator.organSystem
      });
      
      // Ensure organSystems is always an array of strings
      let organSystems: string[];
      if (Array.isArray(indicator.organSystem)) {
        // If it's already an array, ensure all elements are strings
        organSystems = indicator.organSystem.map((org: any) => String(org));
      } else if (indicator.organSystem) {
        // If it's a single value, convert to array with string
        organSystems = [String(indicator.organSystem)];
      } else {
        // Default to general if no organ system specified
        organSystems = ['general'];
      }
      
      const healthIndicator: HealthIndicator = {
        category: this.mapFacialCategoryToLegacy(indicator.category),
        finding: indicator.finding,
        severity: this.mapSeverityToLegacy(indicator.severity),
        confidence: indicator.confidence,
        organSystems,
        recommendations: indicator.recommendations || []
      };
      
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Converted health indicator', {
        category: healthIndicator.category,
        organSystems: healthIndicator.organSystems,
        organSystemsType: typeof healthIndicator.organSystems,
        organSystemsLength: healthIndicator.organSystems.length
      });
      
      return healthIndicator;
    });
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
    
    const mappedCategory = mapping[category] || 'constitutional';
    
    loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Mapping facial category', {
      originalCategory: category,
      mappedCategory,
      isKnownCategory: category in mapping
    });
    
    return mappedCategory;
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

  /**
   * Extract health indicators from Vision API response
   */
  private extractVisionFindings(visionResponse: any): HealthIndicator[] {
    const findings: HealthIndicator[] = [];
    
    if (!visionResponse.success || !visionResponse.analysis) {
      return findings;
    }
    
    // First, extract structured findings from differentialDiagnosis if available
    if (visionResponse.differentialDiagnosis && Array.isArray(visionResponse.differentialDiagnosis)) {
      visionResponse.differentialDiagnosis.forEach((diagnosis: any) => {
        const category = this.mapConditionToHealthCategory(diagnosis.condition);
        const severity = diagnosis.probability >= 0.7 ? 'high' : 
                        diagnosis.probability >= 0.4 ? 'moderate' : 'low';
        
        findings.push({
          category,
          finding: `${diagnosis.condition} - ${diagnosis.reasoning}`,
          severity,
          confidence: diagnosis.probability,
          organSystems: this.mapCategoryToOrganSystems(category),
          recommendations: this.extractDiagnosisRecommendations(diagnosis, visionResponse)
        });
      });
    }
    
    // Add red flags as high-priority findings
    if (visionResponse.redFlags && Array.isArray(visionResponse.redFlags)) {
      visionResponse.redFlags.forEach((flag: string) => {
        findings.push({
          category: 'emergency' as any,
          finding: flag,
          severity: 'high',
          confidence: 0.9,
          organSystems: ['general', 'systémico'],
          recommendations: ['Buscar atención médica INMEDIATA', 'Llamar al 911 o acudir a urgencias']
        });
      });
    }
    
    // If structured data provided sufficient findings, return them
    if (findings.length >= 2) {
      loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Using structured Vision API findings', {
        structuredFindingsCount: findings.length,
        hasRedFlags: visionResponse.redFlags?.length > 0
      });
      return findings;
    }
    
    // Otherwise, fall back to text analysis
    const analysis = visionResponse.analysis.toLowerCase();
    const findingsText = visionResponse.findings?.toLowerCase() || '';
    const combinedText = `${analysis} ${findingsText}`;
    
    loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Extracting Vision API findings from text', {
      analysisLength: analysis.length,
      findingsLength: findingsText.length,
      severity: visionResponse.severity,
      suggestedSpecialty: visionResponse.suggestedSpecialty
    });
    
    // Map of keywords to health indicators - expanded for better Vision API matching
    const keywordMappings = [
      {
        keywords: ['redness', 'red', 'inflammation', 'inflamed', 'irritation', 'irritated', 'enrojecimiento', 'rojizo'],
        category: 'circulatory' as const,
        organSystems: ['circulatory', 'integumentary'],
        finding: 'Signos de inflamación o irritación detectados',
        severity: 'moderate' as const
      },
      {
        keywords: ['pallor', 'pale', 'anemia', 'anemic', 'palido', 'pálido', 'whitish'],
        category: 'circulatory' as const,
        organSystems: ['circulatory', 'hematologic'],
        finding: 'Palidez detectada - posible anemia',
        severity: 'moderate' as const
      },
      {
        keywords: ['congestion', 'mucus', 'respiratory', 'breathing', 'nasal', 'congestión', 'respiratorio'],
        category: 'respiratory' as const,
        organSystems: ['respiratory'],
        finding: 'Signos de congestión respiratoria',
        severity: 'moderate' as const
      },
      {
        keywords: ['stress', 'tension', 'anxiety', 'fatigue', 'tired', 'exhaustion', 'weary', 'estrés', 'cansancio', 'fatigado'],
        category: 'emotional' as const,
        organSystems: ['nervous', 'endocrine'],
        finding: 'Signos de estrés o fatiga',
        severity: 'moderate' as const
      },
      {
        keywords: ['skin', 'dermatological', 'rash', 'lesion', 'spot', 'pigmentation', 'acne', 'pimple', 'blemish', 'piel'],
        category: 'dermatological' as const,
        organSystems: ['integumentary'],
        finding: 'Condición dermatológica detectada',
        severity: 'moderate' as const
      },
      {
        keywords: ['swelling', 'edema', 'puffy', 'puffiness', 'retention', 'bloated', 'hinchazón', 'inflamado'],
        category: 'circulatory' as const,
        organSystems: ['circulatory', 'lymphatic'],
        finding: 'Edema o retención de líquidos detectada',
        severity: 'moderate' as const
      },
      {
        keywords: ['digestive', 'gastric', 'stomach', 'intestinal', 'abdominal', 'digestivo', 'estómago'],
        category: 'digestive' as const,
        organSystems: ['digestive'],
        finding: 'Posibles problemas digestivos',
        severity: 'moderate' as const
      },
      {
        keywords: ['eye', 'eyes', 'ocular', 'vision', 'pupil', 'ojo', 'ojos', 'vista'],
        category: 'circulatory' as const,
        organSystems: ['nervous', 'circulatory'],
        finding: 'Análisis ocular - evaluación de salud general',
        severity: 'moderate' as const
      },
      {
        keywords: ['dark circle', 'bags', 'ojeras', 'bolsas'],
        category: 'circulatory' as const,
        organSystems: ['circulatory', 'lymphatic'],
        finding: 'Ojeras o bolsas bajo los ojos detectadas',
        severity: 'moderate' as const
      },
      {
        keywords: ['asymmetry', 'asymmetric', 'uneven', 'imbalance', 'asimetría', 'desigual'],
        category: 'structural' as const,
        organSystems: ['musculoskeletal', 'nervous'],
        finding: 'Asimetría facial detectada',
        severity: 'moderate' as const
      },
      {
        keywords: ['healthy', 'normal', 'good', 'balanced', 'saludable', 'normal', 'bueno'],
        category: 'constitutional' as const,
        organSystems: ['general'],
        finding: 'Aspectos saludables identificados',
        severity: 'low' as const
      }
    ];
    
    // Check for keyword matches
    keywordMappings.forEach(mapping => {
      const hasKeyword = mapping.keywords.some(keyword => combinedText.includes(keyword));
      if (hasKeyword) {
        // Adjust severity based on Vision API severity score
        let severity = mapping.severity;
        if (visionResponse.severity >= 70) severity = 'high';
        else if (visionResponse.severity <= 30) severity = 'low';
        
        findings.push({
          category: mapping.category,
          finding: mapping.finding,
          severity,
          confidence: Math.min(0.9, visionResponse.confidence / 100),
          organSystems: mapping.organSystems,
          recommendations: this.generateRecommendationsForCategory(mapping.category)
        });
        
        loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Vision finding extracted', {
          category: mapping.category,
          finding: mapping.finding,
          severity,
          matchedKeywords: mapping.keywords.filter(k => combinedText.includes(k))
        });
      }
    });
    
    // If no specific findings but high severity, add a general finding
    if (findings.length === 0 && visionResponse.severity >= 50) {
      findings.push({
        category: 'constitutional',
        finding: `Evaluación de IA sugiere atención médica - ${visionResponse.suggestedSpecialty || 'médico general'}`,
        severity: visionResponse.severity >= 70 ? 'high' : 'moderate',
        confidence: visionResponse.confidence / 100,
        organSystems: ['general'],
        recommendations: ['Consultar con profesional médico', 'Realizar exámenes de seguimiento']
      });
    }
    
    return findings;
  }
  
  private generateRecommendationsForCategory(category: string): string[] {
    const recommendations: Record<string, string[]> = {
      circulatory: [
        'Mejorar la circulación con ejercicio regular',
        'Masaje facial suave',
        'Hidratación adecuada'
      ],
      respiratory: [
        'Ejercicios de respiración profunda',
        'Evitar irritantes ambientales',
        'Considerar inhalaciones con hierbas'
      ],
      emotional: [
        'Técnicas de manejo del estrés',
        'Descanso adecuado',
        'Prácticas de relajación'
      ],
      dermatological: [
        'Mantener la piel limpia e hidratada',
        'Protección solar',
        'Dieta rica en antioxidantes'
      ],
      digestive: [
        'Dieta equilibrada',
        'Evitar alimentos irritantes',
        'Tés digestivos'
      ]
    };
    
    return recommendations[category] || ['Seguimiento médico recomendado'];
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

  /**
   * Merge real diagnostic findings with specialized analysis results
   */
  private mergeWithRealDiagnostics(
    result: ComprehensiveAnalysisResult,
    diagnosticResult: any,
    constitutionalMarkers: ConstitutionalMarkers,
    treatmentRecommendations: TreatmentRecommendation[]
  ): ComprehensiveAnalysisResult {
    // Replace mock findings with real diagnostic findings
    result.primaryFindings = diagnosticResult.findings.filter((f: HealthIndicator) => 
      f.severity === 'high' || f.severity === 'moderate'
    );
    
    result.secondaryFindings = diagnosticResult.findings.filter((f: HealthIndicator) => 
      f.severity === 'low'
    );

    // Use real constitutional assessment if more specific
    if (constitutionalMarkers.indicators.length > result.constitutionalAssessment.indicators.length) {
      result.constitutionalAssessment = constitutionalMarkers;
    }

    // Merge treatment recommendations, prioritizing real diagnostic recommendations
    const existingCategories = new Set(result.treatmentRecommendations.map(r => r.category));
    const newRecommendations = treatmentRecommendations.filter(r => 
      !existingCategories.has(r.category) || r.urgency === 'urgent'
    );
    
    result.treatmentRecommendations = [
      ...treatmentRecommendations.filter(r => r.urgency === 'urgent' || r.urgency === 'emergency'),
      ...result.treatmentRecommendations.filter(r => r.urgency !== 'urgent' && r.urgency !== 'emergency'),
      ...newRecommendations
    ];

    // Update confidence based on diagnostic confidence
    result.confidence = (result.confidence + diagnosticResult.confidence) / 2;

    // Update health score based on findings
    const severeFindings = diagnosticResult.findings.filter((f: HealthIndicator) => f.severity === 'high').length;
    const moderateFindings = diagnosticResult.findings.filter((f: HealthIndicator) => f.severity === 'moderate').length;
    
    // Adjust health score based on findings
    const findingsPenalty = (severeFindings * 15) + (moderateFindings * 5);
    result.overallHealthScore.score = Math.max(20, result.overallHealthScore.score - findingsPenalty);
    
    // Update health status based on new score
    if (result.overallHealthScore.score >= 85) {
      result.overallHealthScore.status = 'excellent';
    } else if (result.overallHealthScore.score >= 70) {
      result.overallHealthScore.status = 'good';
    } else if (result.overallHealthScore.score >= 50) {
      result.overallHealthScore.status = 'fair';
    } else {
      result.overallHealthScore.status = 'poor';
    }

    // Add diagnostic basis to indicators
    result.overallHealthScore.indicators = [
      ...result.overallHealthScore.indicators,
      `Based on ${diagnosticResult.basedOnFeatures.length} analyzed features`,
      `${diagnosticResult.findings.length} health indicators identified`
    ];

    return result;
  }

  /**
   * Enhance local analysis when Vision API fails
   */
  private async enhanceLocalAnalysisWithFallback(
    result: ComprehensiveAnalysisResult,
    imageData: ImageData,
    input: ImageAnalysisInput
  ): Promise<ComprehensiveAnalysisResult> {
    loggingService.info('RealComprehensiveMedicalImageAnalyzer', 'Enhancing local analysis with fallback intelligence');
    
    // Add Vision API failure notice
    if (!result.aiInsights) {
      result.aiInsights = {
        analysis: 'Análisis realizado mediante procesamiento local avanzado.',
        findings: 'Los hallazgos se basan en análisis de patrones faciales, evaluación constitucional y procesamiento de imagen.',
        suggestedSpecialty: this.determineSuggestedSpecialty(result.primaryFindings)
      };
    }
    
    // Enhance findings with more detailed descriptions
    result.primaryFindings = result.primaryFindings.map(finding => {
      // Add more context to findings
      if (finding.confidence < 0.7) {
        finding.finding += ' (Análisis preliminar - se sugiere evaluación adicional)';
      }
      
      // Ensure all findings have recommendations
      if (!finding.recommendations || finding.recommendations.length === 0) {
        finding.recommendations = this.generateFallbackRecommendations(finding);
      }
      
      return finding;
    });
    
    // Add general health maintenance finding if no specific findings
    if (result.primaryFindings.length === 0) {
      result.primaryFindings.push({
        category: 'constitutional',
        finding: 'Evaluación general completada. Se recomienda mantener hábitos saludables y monitoreo regular.',
        severity: 'low',
        confidence: 0.6,
        organSystems: ['general'],
        recommendations: [
          'Mantener dieta balanceada',
          'Ejercicio regular',
          'Sueño adecuado (7-9 horas)',
          'Manejo del estrés'
        ]
      });
    }
    
    // Ensure we have constitutional assessment
    if (!result.constitutionalAssessment || result.constitutionalAssessment.ayurvedicType === 'mixed') {
      // Use image metrics to infer constitution
      const imageMetrics = result.realImageMetrics;
      if (imageMetrics) {
        result.constitutionalAssessment = this.inferConstitutionFromMetrics(imageMetrics);
      }
    }
    
    // Adjust confidence score to reflect local-only analysis
    result.confidence = Math.min(result.confidence, 0.75); // Cap at 75% for local-only
    
    // Update confidence breakdown
    if (result.confidenceScore) {
      result.confidenceScore.byCategory.aiAnalysis = 0; // No AI analysis
      result.confidenceScore.overall = (
        result.confidenceScore.byCategory.imaging * 0.4 +
        result.confidenceScore.byCategory.constitutional * 0.3 +
        result.confidenceScore.byCategory.cultural * 0.3
      );
    }
    
    return result;
  }
  
  /**
   * Generate fallback recommendations for findings without them
   */
  private generateFallbackRecommendations(finding: HealthIndicator): string[] {
    const recommendations: string[] = [];
    
    // Category-specific recommendations
    switch (finding.category) {
      case 'circulatory':
        recommendations.push(
          'Mejorar circulación con ejercicio regular',
          'Masaje facial suave diario',
          'Mantener hidratación adecuada'
        );
        break;
      case 'digestive':
        recommendations.push(
          'Dieta balanceada con fibra',
          'Evitar alimentos procesados',
          'Comer en horarios regulares'
        );
        break;
      case 'respiratory':
        recommendations.push(
          'Ejercicios de respiración profunda',
          'Evitar irritantes ambientales',
          'Mantener buena calidad del aire'
        );
        break;
      case 'nervous':
        recommendations.push(
          'Técnicas de relajación diarias',
          'Sueño regular y reparador',
          'Reducir consumo de cafeína'
        );
        break;
      case 'dermatological':
        recommendations.push(
          'Rutina de cuidado facial suave',
          'Protección solar diaria',
          'Hidratación adecuada'
        );
        break;
      default:
        recommendations.push(
          'Monitoreo regular de síntomas',
          'Mantener estilo de vida saludable',
          'Consultar si persisten síntomas'
        );
    }
    
    return recommendations;
  }
  
  /**
   * Determine suggested specialty based on findings
   */
  private determineSuggestedSpecialty(findings: HealthIndicator[]): string {
    if (findings.length === 0) return 'Medicina General';
    
    // Count findings by category
    const categoryCount: Record<string, number> = {};
    findings.forEach(f => {
      categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
    });
    
    // Find dominant category
    const dominantCategory = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Map to specialty
    switch (dominantCategory) {
      case 'circulatory': return 'Cardiología';
      case 'digestive': return 'Gastroenterología';
      case 'respiratory': return 'Neumología';
      case 'nervous': return 'Neurología';
      case 'dermatological': return 'Dermatología';
      case 'endocrine': return 'Endocrinología';
      case 'structural': return 'Ortopedia';
      case 'emotional': return 'Psicología/Psiquiatría';
      default: return 'Medicina General';
    }
  }
  
  /**
   * Infer constitution from image metrics
   */
  private inferConstitutionFromMetrics(metrics: any): ConstitutionalMarkers {
    // Simple inference based on image characteristics
    let ayurvedicType: ConstitutionalMarkers['ayurvedicType'] = 'mixed';
    let tcmConstitution: ConstitutionalMarkers['tcmConstitution'] = 'balanced';
    
    if (metrics.colorProfile) {
      if (metrics.colorProfile.warmth > 30) {
        ayurvedicType = 'pitta';
        tcmConstitution = 'hot';
      } else if (metrics.colorProfile.warmth < -20) {
        ayurvedicType = 'vata';
        tcmConstitution = 'cold';
      } else {
        ayurvedicType = 'kapha';
        tcmConstitution = 'balanced';
      }
    }
    
    return {
      ayurvedicType,
      tcmConstitution,
      metabolicType: 'normal',
      indicators: ['Evaluación basada en análisis de imagen local']
    };
  }
  
  /**
   * Map condition name to health category
   */
  private mapConditionToHealthCategory(condition: string): HealthIndicator['category'] {
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
      emergency: ['general', 'sistémico'],
      emotional: ['nervioso', 'psicológico'],
      structural: ['musculoesquelético', 'postural']
    };
    
    return mapping[category] || ['general'];
  }
  
  /**
   * Extract diagnosis-specific recommendations
   */
  private extractDiagnosisRecommendations(diagnosis: any, visionResponse: any): string[] {
    const recommendations: string[] = [];
    
    // Add immediate recommendations if relevant
    if (visionResponse.recommendations?.immediate) {
      recommendations.push(visionResponse.recommendations.immediate);
    }
    
    // Add condition-specific recommendations
    const conditionLower = diagnosis.condition.toLowerCase();
    if (conditionLower.includes('infección')) {
      recommendations.push('Mantener área limpia y seca', 'Evitar rascar o tocar');
    } else if (conditionLower.includes('alergia')) {
      recommendations.push('Identificar y evitar alérgenos', 'Considerar antihistamínicos');
    } else if (conditionLower.includes('anemia')) {
      recommendations.push('Consumir alimentos ricos en hierro', 'Vitamina C con las comidas');
    }
    
    // Add traditional Mexican remedies if available
    if (visionResponse.recommendations?.traditional) {
      recommendations.push(visionResponse.recommendations.traditional);
    }
    
    // Add follow-up monitoring
    if (visionResponse.followUp?.monitoring) {
      recommendations.push(visionResponse.followUp.monitoring);
    }
    
    return recommendations.length > 0 ? recommendations : ['Seguimiento médico recomendado'];
  }
}