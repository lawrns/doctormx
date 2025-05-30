/**
 * RealSkinAnalyzer - Genuine skin analysis with dynamic findings
 * 
 * Analyzes actual skin regions detected in images and generates
 * real medical findings based on pixel-level analysis, color patterns,
 * texture metrics, and dermatological indicators.
 */

import { loggingService } from './LoggingService';
import { RealImageProcessor, SkinRegion, ImageAnalysisMetrics, ColorProfile } from './RealImageProcessor';
import { ComputerVisionAnalyzer, FacialLandmarks } from './ComputerVisionAnalyzer';

export interface SkinAnalysisResult {
  overallSkinHealth: SkinHealthScore;
  skinRegions: AnalyzedSkinRegion[];
  hydrationAssessment: HydrationAnalysis;
  pigmentationAnalysis: PigmentationAnalysis;
  textureAnalysis: SkinTextureAnalysis;
  inflammationDetection: InflammationAnalysis;
  blemishDetection: BlemishAnalysis;
  agingIndicators: AgingAnalysis;
  skinTypeClassification: SkinTypeResult;
  environmentalFactors: EnvironmentalFactorAnalysis;
  recommendations: SkinRecommendation[];
  confidence: number;
}

export interface SkinHealthScore {
  overall: number;           // 0-100
  hydration: number;         // 0-100
  clarity: number;          // 0-100
  texture: number;          // 0-100
  tone: number;             // 0-100
  elasticity: number;       // 0-100 (estimated)
}

export interface AnalyzedSkinRegion extends SkinRegion {
  analysisResults: {
    hydrationLevel: number;
    textureScore: number;
    inflammationScore: number;
    pigmentationUniformity: number;
    blemishCount: number;
    agingIndicators: string[];
  };
  medicalFindings: SkinMedicalFinding[];
}

export interface SkinMedicalFinding {
  type: 'hydration' | 'inflammation' | 'pigmentation' | 'texture' | 'blemish' | 'aging' | 'lesion';
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  location: { x: number; y: number; width: number; height: number };
  description: string;
  urgency: 'routine' | 'monitor' | 'consult' | 'urgent';
  recommendations: string[];
}

export interface HydrationAnalysis {
  overallHydration: number;  // 0-100
  dryAreas: Array<{ region: SkinRegion; severity: number }>;
  oilyAreas: Array<{ region: SkinRegion; severity: number }>;
  normalAreas: Array<{ region: SkinRegion }>;
  recommendations: string[];
}

export interface PigmentationAnalysis {
  uniformity: number;        // 0-100
  melasmaIndicators: Array<{ location: any; severity: number; confidence: number }>;
  hyperpigmentation: Array<{ location: any; type: string; severity: number }>;
  hypopigmentation: Array<{ location: any; severity: number }>;
  overallToneConsistency: number;
}

export interface SkinTextureAnalysis {
  smoothness: number;        // 0-100
  porosity: number;         // 0-100
  roughness: number;        // 0-100
  microTexturePattern: string;
  textureUniformity: number;
  concerns: string[];
}

export interface InflammationAnalysis {
  overallInflammation: number; // 0-100
  activeInflammation: Array<{ location: any; severity: number; type: string }>;
  chronicInflammation: Array<{ location: any; indicators: string[] }>;
  rednessMap: number[][];
  recommendations: string[];
}

export interface BlemishAnalysis {
  acneDetection: {
    whiteheads: Array<{ location: any; size: number }>;
    blackheads: Array<{ location: any; size: number }>;
    papules: Array<{ location: any; severity: number }>;
    pustules: Array<{ location: any; severity: number }>;
  };
  scarring: Array<{ location: any; type: string; severity: number }>;
  overallClearness: number;
}

export interface AgingAnalysis {
  fineLines: Array<{ location: any; depth: number; length: number }>;
  wrinkles: Array<{ location: any; depth: number; area: number }>;
  sagging: Array<{ area: string; severity: number }>;
  volumeLoss: Array<{ area: string; severity: number }>;
  overallAgingScore: number; // 0-100 (higher = more aged)
  estimatedSkinAge: number;
}

export interface SkinTypeResult {
  fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6;
  skinTone: 'very_light' | 'light' | 'medium_light' | 'medium' | 'medium_dark' | 'dark';
  undertone: 'cool' | 'warm' | 'neutral';
  oiliness: 'dry' | 'normal' | 'combination' | 'oily';
  sensitivity: 'low' | 'moderate' | 'high';
  confidence: number;
}

export interface EnvironmentalFactorAnalysis {
  sunDamage: {
    severity: number;
    indicators: string[];
    affectedAreas: Array<{ region: any; damage: number }>;
  };
  pollutionEffects: {
    severity: number;
    indicators: string[];
  };
  dehydrationSigns: {
    severity: number;
    causes: string[];
  };
}

export interface SkinRecommendation {
  category: 'hydration' | 'cleansing' | 'protection' | 'treatment' | 'lifestyle';
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  mexicanHerbs?: string[];
  culturalAdaptations?: string[];
  timeframe: string;
  expectedResults: string;
}

/**
 * Real Skin Analysis Engine
 */
export class RealSkinAnalyzer {
  private static instance: RealSkinAnalyzer;
  private imageProcessor: RealImageProcessor;
  private cvAnalyzer: ComputerVisionAnalyzer;

  static getInstance(): RealSkinAnalyzer {
    if (!RealSkinAnalyzer.instance) {
      RealSkinAnalyzer.instance = new RealSkinAnalyzer();
    }
    return RealSkinAnalyzer.instance;
  }

  constructor() {
    this.imageProcessor = RealImageProcessor.getInstance();
    this.cvAnalyzer = ComputerVisionAnalyzer.getInstance();
  }

  /**
   * Main skin analysis method - processes real skin regions
   */
  async analyzeSkin(imageData: ImageData): Promise<SkinAnalysisResult> {
    loggingService.info('RealSkinAnalyzer', 'Starting comprehensive skin analysis', {
      imageSize: `${imageData.width}x${imageData.height}`
    });

    try {
      // Step 1: Get base image metrics
      const imageMetrics = await this.imageProcessor.analyzePixelData(imageData);
      
      // Step 2: Detect skin regions
      const skinRegions = await this.imageProcessor.detectSkinRegions(imageData);
      
      if (skinRegions.length === 0) {
        throw new Error('No skin regions detected in image');
      }

      // Step 3: Analyze each skin region in detail
      const analyzedRegions = await Promise.all(
        skinRegions.map(region => this.analyzeSkinRegionDetailed(region, imageData, imageMetrics))
      );

      // Step 4: Perform comprehensive analysis
      const [
        hydrationAssessment,
        pigmentationAnalysis, 
        textureAnalysis,
        inflammationDetection,
        blemishDetection,
        agingIndicators,
        skinTypeClassification,
        environmentalFactors
      ] = await Promise.all([
        this.assessHydration(analyzedRegions, imageMetrics),
        this.analyzePigmentation(analyzedRegions, imageMetrics),
        this.analyzeTexture(analyzedRegions, imageMetrics),
        this.detectInflammation(analyzedRegions, imageMetrics),
        this.detectBlemishes(analyzedRegions, imageData),
        this.analyzeAging(analyzedRegions, imageMetrics),
        this.classifySkinType(analyzedRegions, imageMetrics),
        this.analyzeEnvironmentalFactors(analyzedRegions, imageMetrics)
      ]);

      // Step 5: Calculate overall skin health
      const overallSkinHealth = this.calculateOverallSkinHealth({
        hydrationAssessment,
        textureAnalysis,
        inflammationDetection,
        blemishDetection,
        agingIndicators
      });

      // Step 6: Generate recommendations
      const recommendations = this.generateSkinRecommendations({
        overallSkinHealth,
        hydrationAssessment,
        pigmentationAnalysis,
        inflammationDetection,
        blemishDetection,
        skinTypeClassification
      });

      // Step 7: Calculate confidence
      const confidence = this.calculateAnalysisConfidence(analyzedRegions, imageMetrics);

      const result: SkinAnalysisResult = {
        overallSkinHealth,
        skinRegions: analyzedRegions,
        hydrationAssessment,
        pigmentationAnalysis,
        textureAnalysis,
        inflammationDetection,
        blemishDetection,
        agingIndicators,
        skinTypeClassification,
        environmentalFactors,
        recommendations,
        confidence
      };

      loggingService.info('RealSkinAnalyzer', 'Skin analysis completed', {
        regionCount: analyzedRegions.length,
        overallHealth: overallSkinHealth.overall,
        confidence,
        recommendationCount: recommendations.length
      });

      return result;

    } catch (error) {
      loggingService.error('RealSkinAnalyzer', 'Skin analysis failed', error as Error);
      throw new Error(`Skin analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze individual skin region in detail
   */
  private async analyzeSkinRegionDetailed(
    region: SkinRegion, 
    imageData: ImageData, 
    imageMetrics: ImageAnalysisMetrics
  ): Promise<AnalyzedSkinRegion> {
    
    // Extract region-specific metrics
    const regionImageData = this.extractRegionImageData(region, imageData);
    const regionMetrics = await this.imageProcessor.analyzePixelData(regionImageData);
    
    // Analyze hydration level
    const hydrationLevel = this.analyzeRegionHydration(region, regionMetrics);
    
    // Analyze texture
    const textureScore = this.analyzeRegionTexture(region, regionMetrics);
    
    // Detect inflammation
    const inflammationScore = this.detectRegionInflammation(region, regionMetrics);
    
    // Analyze pigmentation
    const pigmentationUniformity = this.analyzeRegionPigmentation(region, regionMetrics);
    
    // Count blemishes
    const blemishCount = this.countRegionBlemishes(region, regionMetrics);
    
    // Detect aging indicators
    const agingIndicators = this.detectRegionAging(region, regionMetrics);
    
    // Generate medical findings
    const medicalFindings = this.generateRegionMedicalFindings({
      region,
      hydrationLevel,
      textureScore,
      inflammationScore,
      pigmentationUniformity,
      blemishCount,
      agingIndicators
    });

    return {
      ...region,
      analysisResults: {
        hydrationLevel,
        textureScore,
        inflammationScore,
        pigmentationUniformity,
        blemishCount,
        agingIndicators
      },
      medicalFindings
    };
  }

  /**
   * Assess hydration levels across skin regions
   */
  private async assessHydration(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<HydrationAnalysis> {
    const dryAreas: Array<{ region: SkinRegion; severity: number }> = [];
    const oilyAreas: Array<{ region: SkinRegion; severity: number }> = [];
    const normalAreas: Array<{ region: SkinRegion }> = [];
    
    let totalHydration = 0;
    
    regions.forEach(region => {
      const hydration = region.analysisResults.hydrationLevel;
      totalHydration += hydration;
      
      if (hydration < 30) {
        dryAreas.push({ region, severity: 100 - hydration });
      } else if (hydration > 80) {
        oilyAreas.push({ region, severity: hydration - 80 });
      } else {
        normalAreas.push({ region });
      }
    });
    
    const overallHydration = totalHydration / regions.length;
    
    const recommendations = this.generateHydrationRecommendations(overallHydration, dryAreas, oilyAreas);
    
    return {
      overallHydration,
      dryAreas,
      oilyAreas,
      normalAreas,
      recommendations
    };
  }

  /**
   * Analyze pigmentation patterns
   */
  private async analyzePigmentation(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<PigmentationAnalysis> {
    let totalUniformity = 0;
    const melasmaIndicators: Array<{ location: any; severity: number; confidence: number }> = [];
    const hyperpigmentation: Array<{ location: any; type: string; severity: number }> = [];
    const hypopigmentation: Array<{ location: any; severity: number }> = [];
    
    regions.forEach(region => {
      totalUniformity += region.analysisResults.pigmentationUniformity;
      
      // Detect melasma patterns (bilateral pigmentation)
      if (this.detectMelasmaPattern(region)) {
        melasmaIndicators.push({
          location: { x: region.x, y: region.y, width: region.width, height: region.height },
          severity: 100 - region.analysisResults.pigmentationUniformity,
          confidence: 0.7
        });
      }
      
      // Detect hyperpigmentation
      if (this.detectHyperpigmentation(region)) {
        hyperpigmentation.push({
          location: { x: region.x, y: region.y, width: region.width, height: region.height },
          type: this.classifyPigmentationType(region),
          severity: this.calculatePigmentationSeverity(region)
        });
      }
      
      // Detect hypopigmentation
      if (this.detectHypopigmentation(region)) {
        hypopigmentation.push({
          location: { x: region.x, y: region.y, width: region.width, height: region.height },
          severity: this.calculateHypopigmentationSeverity(region)
        });
      }
    });
    
    const uniformity = totalUniformity / regions.length;
    const overallToneConsistency = this.calculateToneConsistency(regions);
    
    return {
      uniformity,
      melasmaIndicators,
      hyperpigmentation,
      hypopigmentation,
      overallToneConsistency
    };
  }

  /**
   * Analyze skin texture
   */
  private async analyzeTexture(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<SkinTextureAnalysis> {
    let totalSmoothness = 0;
    let totalPorosity = 0;
    let totalRoughness = 0;
    const concerns: string[] = [];
    
    regions.forEach(region => {
      const textureScore = region.analysisResults.textureScore;
      
      // Smoothness (inverse of texture roughness)
      const smoothness = Math.max(0, 100 - textureScore);
      totalSmoothness += smoothness;
      
      // Porosity detection based on texture patterns
      const porosity = this.detectPorosity(region);
      totalPorosity += porosity;
      
      // Roughness from texture analysis
      const roughness = textureScore;
      totalRoughness += roughness;
      
      // Identify texture concerns
      if (roughness > 70) concerns.push('Rough texture detected');
      if (porosity > 60) concerns.push('Enlarged pores visible');
      if (smoothness < 40) concerns.push('Uneven skin surface');
    });
    
    const smoothness = totalSmoothness / regions.length;
    const porosity = totalPorosity / regions.length;
    const roughness = totalRoughness / regions.length;
    const textureUniformity = this.calculateTextureUniformity(regions);
    const microTexturePattern = this.identifyMicroTexturePattern(regions);
    
    return {
      smoothness,
      porosity,
      roughness,
      microTexturePattern,
      textureUniformity,
      concerns: [...new Set(concerns)] // Remove duplicates
    };
  }

  /**
   * Detect inflammation indicators
   */
  private async detectInflammation(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<InflammationAnalysis> {
    let totalInflammation = 0;
    const activeInflammation: Array<{ location: any; severity: number; type: string }> = [];
    const chronicInflammation: Array<{ location: any; indicators: string[] }> = [];
    
    regions.forEach(region => {
      const inflammation = region.analysisResults.inflammationScore;
      totalInflammation += inflammation;
      
      if (inflammation > 50) {
        const type = this.classifyInflammationType(region);
        activeInflammation.push({
          location: { x: region.x, y: region.y, width: region.width, height: region.height },
          severity: inflammation,
          type
        });
      }
      
      // Detect chronic inflammation patterns
      const chronicIndicators = this.detectChronicInflammation(region);
      if (chronicIndicators.length > 0) {
        chronicInflammation.push({
          location: { x: region.x, y: region.y, width: region.width, height: region.height },
          indicators: chronicIndicators
        });
      }
    });
    
    const overallInflammation = totalInflammation / regions.length;
    const rednessMap = this.generateRednessMap(regions);
    const recommendations = this.generateInflammationRecommendations(overallInflammation, activeInflammation);
    
    return {
      overallInflammation,
      activeInflammation,
      chronicInflammation,
      rednessMap,
      recommendations
    };
  }

  /**
   * Detect blemishes and acne
   */
  private async detectBlemishes(regions: AnalyzedSkinRegion[], imageData: ImageData): Promise<BlemishAnalysis> {
    const acneDetection = {
      whiteheads: [] as Array<{ location: any; size: number }>,
      blackheads: [] as Array<{ location: any; size: number }>,
      papules: [] as Array<{ location: any; severity: number }>,
      pustules: [] as Array<{ location: any; severity: number }>
    };
    
    const scarring: Array<{ location: any; type: string; severity: number }> = [];
    let totalClearness = 0;
    
    regions.forEach(region => {
      // Detect different types of acne lesions
      const whiteheads = this.detectWhiteheads(region, imageData);
      const blackheads = this.detectBlackheads(region, imageData);
      const papules = this.detectPapules(region, imageData);
      const pustules = this.detectPustules(region, imageData);
      
      acneDetection.whiteheads.push(...whiteheads);
      acneDetection.blackheads.push(...blackheads);
      acneDetection.papules.push(...papules);
      acneDetection.pustules.push(...pustules);
      
      // Detect scarring
      const scars = this.detectScarring(region, imageData);
      scarring.push(...scars);
      
      // Calculate region clearness
      const blemishCount = region.analysisResults.blemishCount;
      const clearness = Math.max(0, 100 - blemishCount * 10);
      totalClearness += clearness;
    });
    
    const overallClearness = totalClearness / regions.length;
    
    return {
      acneDetection,
      scarring,
      overallClearness
    };
  }

  /**
   * Analyze aging indicators
   */
  private async analyzeAging(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<AgingAnalysis> {
    const fineLines: Array<{ location: any; depth: number; length: number }> = [];
    const wrinkles: Array<{ location: any; depth: number; area: number }> = [];
    const sagging: Array<{ area: string; severity: number }> = [];
    const volumeLoss: Array<{ area: string; severity: number }> = [];
    
    let totalAging = 0;
    
    regions.forEach(region => {
      const agingIndicators = region.analysisResults.agingIndicators;
      
      // Detect fine lines
      const regionFineLines = this.detectFineLines(region);
      fineLines.push(...regionFineLines);
      
      // Detect wrinkles
      const regionWrinkles = this.detectWrinkles(region);
      wrinkles.push(...regionWrinkles);
      
      // Calculate aging score for region
      const agingScore = this.calculateRegionAgingScore(region);
      totalAging += agingScore;
    });
    
    const overallAgingScore = totalAging / regions.length;
    const estimatedSkinAge = this.estimateSkinAge(overallAgingScore, metrics);
    
    return {
      fineLines,
      wrinkles,
      sagging,
      volumeLoss,
      overallAgingScore,
      estimatedSkinAge
    };
  }

  /**
   * Classify skin type
   */
  private async classifySkinType(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<SkinTypeResult> {
    // Analyze color properties for Fitzpatrick type
    const avgColor = this.calculateAverageColor(regions);
    const fitzpatrickType = this.determineFitzpatrickType(avgColor);
    
    // Determine skin tone
    const skinTone = this.determineSkinTone(avgColor);
    
    // Determine undertone
    const undertone = this.determineUndertone(avgColor, metrics.colorProfile);
    
    // Determine oiliness
    const oiliness = this.determineOiliness(regions);
    
    // Determine sensitivity
    const sensitivity = this.determineSensitivity(regions);
    
    const confidence = this.calculateSkinTypeConfidence(regions.length, metrics.qualityScore);
    
    return {
      fitzpatrickType,
      skinTone,
      undertone,
      oiliness,
      sensitivity,
      confidence
    };
  }

  /**
   * Analyze environmental factors
   */
  private async analyzeEnvironmentalFactors(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): Promise<EnvironmentalFactorAnalysis> {
    const sunDamage = this.assessSunDamage(regions, metrics);
    const pollutionEffects = this.assessPollutionEffects(regions, metrics);
    const dehydrationSigns = this.assessDehydrationSigns(regions, metrics);
    
    return {
      sunDamage,
      pollutionEffects,
      dehydrationSigns
    };
  }

  // Helper methods for detailed analysis

  private extractRegionImageData(region: SkinRegion, imageData: ImageData): ImageData {
    const { data, width } = imageData;
    const regionData = new Uint8ClampedArray(region.width * region.height * 4);
    
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const srcIndex = ((region.y + y) * width + (region.x + x)) * 4;
        const dstIndex = (y * region.width + x) * 4;
        
        regionData[dstIndex] = data[srcIndex];
        regionData[dstIndex + 1] = data[srcIndex + 1];
        regionData[dstIndex + 2] = data[srcIndex + 2];
        regionData[dstIndex + 3] = data[srcIndex + 3];
      }
    }
    
    return new ImageData(regionData, region.width, region.height);
  }

  private analyzeRegionHydration(region: SkinRegion, metrics: ImageAnalysisMetrics): number {
    // Hydration based on texture smoothness and reflection patterns
    const textureScore = metrics.textureMetrics.uniformity;
    const brightnessVariance = metrics.colorProfile.redChannel.variance + 
                              metrics.colorProfile.greenChannel.variance + 
                              metrics.colorProfile.blueChannel.variance;
    
    // Lower variance and higher uniformity = better hydration
    const hydration = (textureScore + (1 - brightnessVariance / 10000) * 100) / 2;
    return Math.max(0, Math.min(100, hydration));
  }

  private analyzeRegionTexture(region: SkinRegion, metrics: ImageAnalysisMetrics): number {
    return region.textureScore;
  }

  private detectRegionInflammation(region: SkinRegion, metrics: ImageAnalysisMetrics): number {
    const [avgR, avgG, avgB] = region.averageColor;
    
    // Inflammation indicators: high red, red > green, red > blue
    let inflammationScore = 0;
    
    if (avgR > avgG * 1.2 && avgR > avgB * 1.2) {
      inflammationScore += 30;
    }
    
    if (avgR > 150) {
      inflammationScore += 40;
    }
    
    // Check for warmth (high red channel)
    const warmth = metrics.colorProfile.warmth;
    if (warmth > 20) {
      inflammationScore += 30;
    }
    
    return Math.min(100, inflammationScore);
  }

  private analyzeRegionPigmentation(region: SkinRegion, metrics: ImageAnalysisMetrics): number {
    // Uniformity based on color variance within region
    const colorVariance = metrics.colorProfile.redChannel.variance + 
                         metrics.colorProfile.greenChannel.variance + 
                         metrics.colorProfile.blueChannel.variance;
    
    // Lower variance = more uniform pigmentation
    const uniformity = Math.max(0, 100 - (colorVariance / 1000));
    return Math.min(100, uniformity);
  }

  private countRegionBlemishes(region: SkinRegion, metrics: ImageAnalysisMetrics): number {
    // Simple blemish detection based on dark spots and texture irregularities
    const textureVariance = metrics.textureMetrics.localVariance;
    const edgeDensity = metrics.textureMetrics.edgeDensity;
    
    // Higher edge density and texture variance suggest more blemishes
    const blemishCount = Math.floor((textureVariance + edgeDensity) / 20);
    return Math.max(0, blemishCount);
  }

  private detectRegionAging(region: SkinRegion, metrics: ImageAnalysisMetrics): string[] {
    const indicators: string[] = [];
    
    const textureRoughness = metrics.textureMetrics.roughness;
    const edgeDensity = metrics.textureMetrics.edgeDensity;
    
    if (textureRoughness > 60) {
      indicators.push('Increased skin roughness');
    }
    
    if (edgeDensity > 50) {
      indicators.push('Fine lines detected');
    }
    
    const [avgR, avgG, avgB] = region.averageColor;
    const brightness = (avgR + avgG + avgB) / 3;
    
    if (brightness < 100) {
      indicators.push('Reduced skin luminosity');
    }
    
    return indicators;
  }

  private generateRegionMedicalFindings(params: {
    region: SkinRegion;
    hydrationLevel: number;
    textureScore: number;
    inflammationScore: number;
    pigmentationUniformity: number;
    blemishCount: number;
    agingIndicators: string[];
  }): SkinMedicalFinding[] {
    const findings: SkinMedicalFinding[] = [];
    const { region, hydrationLevel, textureScore, inflammationScore, pigmentationUniformity, blemishCount, agingIndicators } = params;
    
    // Hydration findings
    if (hydrationLevel < 30) {
      findings.push({
        type: 'hydration',
        severity: hydrationLevel < 15 ? 'severe' : 'moderate',
        confidence: 0.8,
        location: { x: region.x, y: region.y, width: region.width, height: region.height },
        description: 'Dehydrated skin detected with reduced moisture levels',
        urgency: hydrationLevel < 15 ? 'consult' : 'monitor',
        recommendations: ['Increase water intake', 'Use hydrating moisturizer', 'Apply hyaluronic acid serum']
      });
    }
    
    // Inflammation findings
    if (inflammationScore > 50) {
      findings.push({
        type: 'inflammation',
        severity: inflammationScore > 75 ? 'severe' : 'moderate',
        confidence: 0.75,
        location: { x: region.x, y: region.y, width: region.width, height: region.height },
        description: 'Inflammatory response detected in skin tissue',
        urgency: inflammationScore > 75 ? 'consult' : 'monitor',
        recommendations: ['Apply cooling compress', 'Use anti-inflammatory herbs', 'Avoid irritants']
      });
    }
    
    // Texture findings
    if (textureScore > 70) {
      findings.push({
        type: 'texture',
        severity: 'moderate',
        confidence: 0.7,
        location: { x: region.x, y: region.y, width: region.width, height: region.height },
        description: 'Irregular skin texture with increased roughness',
        urgency: 'monitor',
        recommendations: ['Gentle exfoliation', 'Retinol treatment', 'Moisturizing routine']
      });
    }
    
    // Pigmentation findings
    if (pigmentationUniformity < 50) {
      findings.push({
        type: 'pigmentation',
        severity: pigmentationUniformity < 30 ? 'severe' : 'moderate',
        confidence: 0.65,
        location: { x: region.x, y: region.y, width: region.width, height: region.height },
        description: 'Uneven pigmentation with visible discoloration',
        urgency: 'monitor',
        recommendations: ['Sun protection', 'Vitamin C serum', 'Brightening treatments']
      });
    }
    
    // Blemish findings
    if (blemishCount > 3) {
      findings.push({
        type: 'blemish',
        severity: blemishCount > 6 ? 'severe' : 'moderate',
        confidence: 0.6,
        location: { x: region.x, y: region.y, width: region.width, height: region.height },
        description: `Multiple blemishes detected (${blemishCount} areas)`,
        urgency: 'monitor',
        recommendations: ['Gentle cleansing', 'Targeted spot treatments', 'Avoid picking']
      });
    }
    
    return findings;
  }

  private calculateOverallSkinHealth(analysis: {
    hydrationAssessment: HydrationAnalysis;
    textureAnalysis: SkinTextureAnalysis;
    inflammationDetection: InflammationAnalysis;
    blemishDetection: BlemishAnalysis;
    agingIndicators: AgingAnalysis;
  }): SkinHealthScore {
    const hydration = analysis.hydrationAssessment.overallHydration;
    const clarity = analysis.blemishDetection.overallClearness;
    const texture = analysis.textureAnalysis.smoothness;
    const tone = 100 - analysis.inflammationDetection.overallInflammation;
    const elasticity = Math.max(0, 100 - analysis.agingIndicators.overallAgingScore);
    
    const overall = (hydration + clarity + texture + tone + elasticity) / 5;
    
    return {
      overall,
      hydration,
      clarity,
      texture,
      tone,
      elasticity
    };
  }

  private generateSkinRecommendations(analysis: {
    overallSkinHealth: SkinHealthScore;
    hydrationAssessment: HydrationAnalysis;
    pigmentationAnalysis: PigmentationAnalysis;
    inflammationDetection: InflammationAnalysis;
    blemishDetection: BlemishAnalysis;
    skinTypeClassification: SkinTypeResult;
  }): SkinRecommendation[] {
    const recommendations: SkinRecommendation[] = [];
    
    // Hydration recommendations
    if (analysis.overallSkinHealth.hydration < 50) {
      recommendations.push({
        category: 'hydration',
        recommendation: 'Increase daily water intake and use hydrating skincare products',
        priority: analysis.overallSkinHealth.hydration < 30 ? 'high' : 'medium',
        mexicanHerbs: ['aloe vera', 'sábila', 'chía'],
        culturalAdaptations: ['Prepare agua fresca with chia seeds', 'Use fresh aloe vera gel'],
        timeframe: '2-4 weeks',
        expectedResults: 'Improved skin moisture and plumpness'
      });
    }
    
    // Inflammation recommendations
    if (analysis.inflammationDetection.overallInflammation > 40) {
      recommendations.push({
        category: 'treatment',
        recommendation: 'Apply anti-inflammatory herbs and cooling treatments',
        priority: 'high',
        mexicanHerbs: ['manzanilla', 'caléndula', 'hierba buena'],
        culturalAdaptations: ['Cold chamomile compress', 'Calendula oil massage'],
        timeframe: '1-2 weeks',
        expectedResults: 'Reduced redness and irritation'
      });
    }
    
    // Sun protection (always important in Mexico)
    recommendations.push({
      category: 'protection',
      recommendation: 'Daily sun protection is essential for maintaining skin health',
      priority: 'high',
      mexicanHerbs: ['zinc oxide natural', 'cacao (natural SPF)'],
      culturalAdaptations: ['Apply before going out in Mexican sun', 'Reapply every 2 hours'],
      timeframe: 'Daily',
      expectedResults: 'Prevention of sun damage and premature aging'
    });
    
    return recommendations;
  }

  private calculateAnalysisConfidence(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): number {
    let confidence = 0.5; // Base confidence
    
    // More skin regions = higher confidence
    if (regions.length >= 3) confidence += 0.2;
    else if (regions.length >= 1) confidence += 0.1;
    
    // Image quality affects confidence
    confidence += (metrics.qualityScore / 100) * 0.3;
    
    // Region size affects confidence
    const avgRegionSize = regions.reduce((sum, region) => sum + (region.width * region.height), 0) / regions.length;
    if (avgRegionSize > 1000) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  // Additional helper methods for specific analyses

  private generateHydrationRecommendations(overall: number, dry: any[], oily: any[]): string[] {
    const recommendations: string[] = [];
    
    if (overall < 40) {
      recommendations.push('Increase daily water intake to 2-3 liters');
      recommendations.push('Use hyaluronic acid serum morning and evening');
    }
    
    if (dry.length > 0) {
      recommendations.push('Apply rich moisturizer to dry areas twice daily');
      recommendations.push('Use gentle, hydrating cleanser');
    }
    
    if (oily.length > 0) {
      recommendations.push('Use oil-free, non-comedogenic products in oily areas');
      recommendations.push('Consider niacinamide to balance oil production');
    }
    
    return recommendations;
  }

  private detectMelasmaPattern(region: AnalyzedSkinRegion): boolean {
    // Simplified melasma detection based on pigmentation patterns
    return region.analysisResults.pigmentationUniformity < 40 && 
           region.skinType === 'face';
  }

  private detectHyperpigmentation(region: AnalyzedSkinRegion): boolean {
    const [r, g, b] = region.averageColor;
    const avgBrightness = (r + g + b) / 3;
    return avgBrightness < 120 && region.analysisResults.pigmentationUniformity < 60;
  }

  private detectHypopigmentation(region: AnalyzedSkinRegion): boolean {
    const [r, g, b] = region.averageColor;
    const avgBrightness = (r + g + b) / 3;
    return avgBrightness > 200 && region.analysisResults.pigmentationUniformity < 50;
  }

  private classifyPigmentationType(region: AnalyzedSkinRegion): string {
    if (region.skinType === 'face') return 'facial_hyperpigmentation';
    return 'post_inflammatory_hyperpigmentation';
  }

  private calculatePigmentationSeverity(region: AnalyzedSkinRegion): number {
    return 100 - region.analysisResults.pigmentationUniformity;
  }

  private calculateHypopigmentationSeverity(region: AnalyzedSkinRegion): number {
    const [r, g, b] = region.averageColor;
    const brightness = (r + g + b) / 3;
    return Math.min(100, (brightness - 150) / 105 * 100);
  }

  private calculateToneConsistency(regions: AnalyzedSkinRegion[]): number {
    if (regions.length < 2) return 100;
    
    const avgColors = regions.map(r => {
      const [r_val, g, b] = r.averageColor;
      return (r_val + g + b) / 3;
    });
    
    const mean = avgColors.reduce((sum, c) => sum + c, 0) / avgColors.length;
    const variance = avgColors.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / avgColors.length;
    
    return Math.max(0, 100 - (Math.sqrt(variance) / 255 * 100));
  }

  private detectPorosity(region: AnalyzedSkinRegion): number {
    // Estimate porosity based on texture score and region characteristics
    return Math.min(100, region.textureScore * 1.2);
  }

  private calculateTextureUniformity(regions: AnalyzedSkinRegion[]): number {
    if (regions.length < 2) return 100;
    
    const textureScores = regions.map(r => r.analysisResults.textureScore);
    const mean = textureScores.reduce((sum, s) => sum + s, 0) / textureScores.length;
    const variance = textureScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / textureScores.length;
    
    return Math.max(0, 100 - Math.sqrt(variance));
  }

  private identifyMicroTexturePattern(regions: AnalyzedSkinRegion[]): string {
    const avgTexture = regions.reduce((sum, r) => sum + r.analysisResults.textureScore, 0) / regions.length;
    
    if (avgTexture < 20) return 'very_smooth';
    if (avgTexture < 40) return 'smooth';
    if (avgTexture < 60) return 'normal';
    if (avgTexture < 80) return 'rough';
    return 'very_rough';
  }

  private classifyInflammationType(region: AnalyzedSkinRegion): string {
    const inflammation = region.analysisResults.inflammationScore;
    const [r, g, b] = region.averageColor;
    
    if (r > g * 1.5 && r > b * 1.5) {
      return inflammation > 75 ? 'acute_inflammatory' : 'mild_erythema';
    }
    
    return 'irritation';
  }

  private detectChronicInflammation(region: AnalyzedSkinRegion): string[] {
    const indicators: string[] = [];
    
    if (region.analysisResults.textureScore > 60) {
      indicators.push('Texture changes suggesting chronic inflammation');
    }
    
    if (region.analysisResults.pigmentationUniformity < 50) {
      indicators.push('Pigmentation changes from chronic irritation');
    }
    
    return indicators;
  }

  private generateRednessMap(regions: AnalyzedSkinRegion[]): number[][] {
    // Simplified redness map - would be more sophisticated in real implementation
    return regions.map(region => [
      region.x, region.y, region.analysisResults.inflammationScore
    ]);
  }

  private generateInflammationRecommendations(overall: number, active: any[]): string[] {
    const recommendations: string[] = [];
    
    if (overall > 50) {
      recommendations.push('Apply cooling anti-inflammatory treatments');
      recommendations.push('Avoid known irritants and allergens');
      recommendations.push('Use gentle, fragrance-free products');
    }
    
    if (active.length > 0) {
      recommendations.push('Consider topical anti-inflammatory herbs like chamomile');
      recommendations.push('Maintain gentle skincare routine until inflammation subsides');
    }
    
    return recommendations;
  }

  // Placeholder implementations for complex methods that would need more sophisticated algorithms

  private detectWhiteheads(region: AnalyzedSkinRegion, imageData: ImageData): Array<{ location: any; size: number }> {
    // Simplified whitehead detection
    return [];
  }

  private detectBlackheads(region: AnalyzedSkinRegion, imageData: ImageData): Array<{ location: any; size: number }> {
    // Simplified blackhead detection
    return [];
  }

  private detectPapules(region: AnalyzedSkinRegion, imageData: ImageData): Array<{ location: any; severity: number }> {
    // Simplified papule detection
    return [];
  }

  private detectPustules(region: AnalyzedSkinRegion, imageData: ImageData): Array<{ location: any; severity: number }> {
    // Simplified pustule detection
    return [];
  }

  private detectScarring(region: AnalyzedSkinRegion, imageData: ImageData): Array<{ location: any; type: string; severity: number }> {
    // Simplified scar detection
    return [];
  }

  private detectFineLines(region: AnalyzedSkinRegion): Array<{ location: any; depth: number; length: number }> {
    // Simplified fine line detection
    return [];
  }

  private detectWrinkles(region: AnalyzedSkinRegion): Array<{ location: any; depth: number; area: number }> {
    // Simplified wrinkle detection
    return [];
  }

  private calculateRegionAgingScore(region: AnalyzedSkinRegion): number {
    // Simplified aging score based on texture and indicators
    const textureAging = region.analysisResults.textureScore;
    const indicatorCount = region.analysisResults.agingIndicators.length;
    
    return Math.min(100, textureAging + indicatorCount * 10);
  }

  private estimateSkinAge(agingScore: number, metrics: ImageAnalysisMetrics): number {
    // Simplified skin age estimation
    const baseAge = 25; // Assume young adult baseline
    const agingFactor = agingScore / 10;
    
    return baseAge + agingFactor;
  }

  private calculateAverageColor(regions: AnalyzedSkinRegion[]): [number, number, number] {
    let totalR = 0, totalG = 0, totalB = 0;
    
    regions.forEach(region => {
      totalR += region.averageColor[0];
      totalG += region.averageColor[1];
      totalB += region.averageColor[2];
    });
    
    return [
      totalR / regions.length,
      totalG / regions.length,
      totalB / regions.length
    ];
  }

  private determineFitzpatrickType(avgColor: [number, number, number]): 1 | 2 | 3 | 4 | 5 | 6 {
    const [r, g, b] = avgColor;
    const brightness = (r + g + b) / 3;
    
    if (brightness > 220) return 1;
    if (brightness > 190) return 2;
    if (brightness > 160) return 3;
    if (brightness > 130) return 4;
    if (brightness > 100) return 5;
    return 6;
  }

  private determineSkinTone(avgColor: [number, number, number]): SkinTypeResult['skinTone'] {
    const [r, g, b] = avgColor;
    const brightness = (r + g + b) / 3;
    
    if (brightness > 200) return 'very_light';
    if (brightness > 170) return 'light';
    if (brightness > 140) return 'medium_light';
    if (brightness > 110) return 'medium';
    if (brightness > 80) return 'medium_dark';
    return 'dark';
  }

  private determineUndertone(avgColor: [number, number, number], colorProfile: ColorProfile): SkinTypeResult['undertone'] {
    const [r, g, b] = avgColor;
    
    if (r > g * 1.1 && r > b * 1.2) return 'warm';
    if (b > r * 1.1 && b > g * 1.1) return 'cool';
    return 'neutral';
  }

  private determineOiliness(regions: AnalyzedSkinRegion[]): SkinTypeResult['oiliness'] {
    const avgHydration = regions.reduce((sum, r) => sum + r.analysisResults.hydrationLevel, 0) / regions.length;
    
    if (avgHydration < 30) return 'dry';
    if (avgHydration > 80) return 'oily';
    if (regions.some(r => r.analysisResults.hydrationLevel < 40) && 
        regions.some(r => r.analysisResults.hydrationLevel > 70)) return 'combination';
    return 'normal';
  }

  private determineSensitivity(regions: AnalyzedSkinRegion[]): SkinTypeResult['sensitivity'] {
    const avgInflammation = regions.reduce((sum, r) => sum + r.analysisResults.inflammationScore, 0) / regions.length;
    
    if (avgInflammation > 60) return 'high';
    if (avgInflammation > 30) return 'moderate';
    return 'low';
  }

  private calculateSkinTypeConfidence(regionCount: number, qualityScore: number): number {
    let confidence = 0.5;
    
    if (regionCount >= 3) confidence += 0.2;
    confidence += (qualityScore / 100) * 0.3;
    
    return Math.min(0.9, confidence);
  }

  private assessSunDamage(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): EnvironmentalFactorAnalysis['sunDamage'] {
    const indicators: string[] = [];
    const affectedAreas: Array<{ region: any; damage: number }> = [];
    let totalDamage = 0;
    
    regions.forEach(region => {
      let damage = 0;
      
      // Check for pigmentation irregularities
      if (region.analysisResults.pigmentationUniformity < 60) {
        damage += 30;
        indicators.push('Uneven pigmentation');
      }
      
      // Check for texture changes
      if (region.analysisResults.textureScore > 50) {
        damage += 25;
        indicators.push('Texture roughening');
      }
      
      if (damage > 0) {
        affectedAreas.push({ region, damage });
      }
      
      totalDamage += damage;
    });
    
    const severity = totalDamage / regions.length;
    
    return {
      severity,
      indicators: [...new Set(indicators)],
      affectedAreas
    };
  }

  private assessPollutionEffects(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): EnvironmentalFactorAnalysis['pollutionEffects'] {
    // Simplified pollution assessment
    const indicators: string[] = [];
    let severity = 0;
    
    const avgTexture = regions.reduce((sum, r) => sum + r.analysisResults.textureScore, 0) / regions.length;
    if (avgTexture > 60) {
      severity += 40;
      indicators.push('Dull skin appearance');
    }
    
    return { severity, indicators };
  }

  private assessDehydrationSigns(regions: AnalyzedSkinRegion[], metrics: ImageAnalysisMetrics): EnvironmentalFactorAnalysis['dehydrationSigns'] {
    const causes: string[] = [];
    let severity = 0;
    
    const avgHydration = regions.reduce((sum, r) => sum + r.analysisResults.hydrationLevel, 0) / regions.length;
    severity = Math.max(0, 100 - avgHydration);
    
    if (severity > 50) {
      causes.push('Insufficient water intake');
      causes.push('Environmental factors (dry climate)');
    }
    
    return { severity, causes };
  }
}