/**
 * DoctorMX Services - Complete medical AI platform services
 * 
 * This index exports all core services for the DoctorMX platform,
 * providing world-class medical image analysis, treatment recommendations,
 * and comprehensive healthcare management.
 */

// Core Medical Services
export * from './RealComprehensiveMedicalImageAnalyzer';
export * from './RealTimeImageProcessor';
export * from './IntelligentTreatmentEngine';
export * from './ImageAnalysisErrorHandler';
export * from './ImageOptimizationService';
export * from './RealDiagnosticAnalysisService';
export * from './OpenAIVisionService';
export * from './RealFacialAnalyzer';
export * from './RealSkinAnalyzer';
export * from './ComputerVisionAnalyzer';

// Specialized Analysis Services
export * from './ConstitutionalAnalysisService';
export * from './EnhancedImageAnalysisService';
export * from './ProgressTrackingService';
export * from './ProtocolTimelineService';

// Traditional Medicine Services
export { herbService, HerbService } from './HerbService';
export * from './HerbInteractionService';
export * from './MexicanCulturalContextService';

// Safety and Validation Services
export { redFlagDetectionService, RedFlagDetectionService } from './RedFlagDetectionService';
export * from './PractitionerValidationService';

// Infrastructure Services
export { featureFlagService, FeatureFlagService } from './FeatureFlagService';
export { loggingService, LoggingService } from './LoggingService';

// Enhanced Diagnostic Services
export { enhancedDiagnosticService, EnhancedDiagnosticService } from './EnhancedDiagnosticService';
export * from './ProtocolBuilderService';

// Service Registry for easy access
import { RealComprehensiveMedicalImageAnalyzer } from './RealComprehensiveMedicalImageAnalyzer';
import { RealTimeImageProcessor } from './RealTimeImageProcessor';
import { IntelligentTreatmentEngine } from './IntelligentTreatmentEngine';
import { ConstitutionalAnalysisService } from './ConstitutionalAnalysisService';
import { HerbService } from './HerbService';
import { HerbInteractionService } from './HerbInteractionService';
import { MexicanCulturalContextService } from './MexicanCulturalContextService';
import { ProgressTrackingService } from './ProgressTrackingService';
import { ProtocolTimelineService } from './ProtocolTimelineService';
import { RedFlagDetectionService } from './RedFlagDetectionService';
import { PractitionerValidationService } from './PractitionerValidationService';
import { FeatureFlagService } from './FeatureFlagService';
import { LoggingService } from './LoggingService';

/**
 * Service Registry - Centralized access to all DoctorMX services
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  
  // Core Medical Services
  public readonly imageAnalyzer: RealComprehensiveMedicalImageAnalyzer;
  public readonly realtimeProcessor: RealTimeImageProcessor;
  public readonly treatmentEngine: IntelligentTreatmentEngine;
  
  // Specialized Services
  public readonly constitutionalAnalysis: ConstitutionalAnalysisService;
  public readonly herbService: HerbService;
  public readonly herbInteractions: HerbInteractionService;
  public readonly culturalContext: MexicanCulturalContextService;
  public readonly progressTracking: ProgressTrackingService;
  public readonly protocolTimeline: ProtocolTimelineService;
  
  // Safety Services
  public readonly redFlagDetection: RedFlagDetectionService;
  public readonly practitionerValidation: PractitionerValidationService;
  
  // Infrastructure Services
  public readonly featureFlags: FeatureFlagService;
  public readonly logging: LoggingService;

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  private constructor() {
    // Initialize all services as singletons
    this.imageAnalyzer = RealComprehensiveMedicalImageAnalyzer.getInstance();
    this.realtimeProcessor = RealTimeImageProcessor.getInstance();
    this.treatmentEngine = IntelligentTreatmentEngine.getInstance();
    this.constitutionalAnalysis = ConstitutionalAnalysisService.getInstance();
    this.herbService = HerbService.getInstance();
    this.herbInteractions = HerbInteractionService.getInstance();
    this.culturalContext = MexicanCulturalContextService.getInstance();
    this.progressTracking = ProgressTrackingService.getInstance();
    this.protocolTimeline = ProtocolTimelineService.getInstance();
    this.redFlagDetection = RedFlagDetectionService.getInstance();
    this.practitionerValidation = PractitionerValidationService.getInstance();
    this.featureFlags = FeatureFlagService.getInstance();
    this.logging = LoggingService.getInstance();

    this.logging.info('ServiceRegistry', 'All DoctorMX services initialized successfully');
  }

  /**
   * Get service health status
   */
  getServiceHealth(): Record<string, boolean> {
    return {
      imageAnalyzer: !!this.imageAnalyzer,
      realtimeProcessor: !!this.realtimeProcessor,
      treatmentEngine: !!this.treatmentEngine,
      constitutionalAnalysis: !!this.constitutionalAnalysis,
      herbService: !!this.herbService,
      herbInteractions: !!this.herbInteractions,
      culturalContext: !!this.culturalContext,
      progressTracking: !!this.progressTracking,
      protocolTimeline: !!this.protocolTimeline,
      redFlagDetection: !!this.redFlagDetection,
      practitionerValidation: !!this.practitionerValidation,
      featureFlags: !!this.featureFlags,
      logging: !!this.logging
    };
  }

  /**
   * Get comprehensive platform capabilities
   */
  getPlatformCapabilities() {
    return {
      imageAnalysis: {
        types: this.imageAnalyzer.getSupportedAnalysisTypes(),
        realTime: true,
        qualityAssessment: true,
        culturalContext: true
      },
      treatment: {
        protocols: this.treatmentEngine.getAllProtocols().length,
        herbDatabase: true,
        safetyChecking: true,
        mexicanAdaptation: true
      },
      tracking: {
        constitutional: true,
        progress: true,
        protocols: true,
        milestones: true
      },
      safety: {
        emergencyDetection: true,
        interactionChecking: true,
        practitionerValidation: true,
        culturalSafety: true
      }
    };
  }
}

// Global service registry instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Re-export types for convenience
export type * from '@pkg/types';