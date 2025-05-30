/**
 * IntelligentProtocolMatcher - Smart protocol selection based on real analysis
 * 
 * Replaces the simple condition matching with sophisticated analysis of:
 * - Primary and secondary findings
 * - Constitutional assessment
 * - Severity levels
 * - Patient context
 * - Multiple protocol combinations
 */

import { loggingService } from './LoggingService';
import { ComprehensiveProtocolDatabase, TreatmentProtocol } from './ComprehensiveProtocolDatabase';

export interface ProtocolMatchingCriteria {
  primaryFindings: HealthIndicator[];
  secondaryFindings: HealthIndicator[];
  constitutionalAssessment: ConstitutionalMarkers;
  urgencyLevel: 'routine' | 'monitor' | 'consult' | 'urgent';
  patientContext?: PatientContext;
  preferences?: PatientPreferences;
}

export interface HealthIndicator {
  category: string;
  finding: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  organSystems: string[];
  recommendations?: string[];
}

export interface ConstitutionalMarkers {
  ayurvedicType: 'vata' | 'pitta' | 'kapha' | 'mixed';
  tcmConstitution: 'hot' | 'cold' | 'damp' | 'dry' | 'balanced';
  metabolicType: 'fast' | 'normal' | 'slow';
  indicators: string[];
}

export interface PatientContext {
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  lifestyle?: string[];
  budgetRange?: 'low' | 'medium' | 'high';
  timeAvailability?: 'limited' | 'moderate' | 'flexible';
}

export interface PatientPreferences {
  preferredApproach?: 'conservative' | 'moderate' | 'intensive';
  herbPreferences?: 'traditional' | 'modern' | 'mixed';
  treatmentDuration?: 'short' | 'medium' | 'long';
  culturalConsiderations?: string[];
}

export interface MatchedProtocol {
  protocol: TreatmentProtocol;
  matchScore: number;
  matchingReasons: string[];
  adaptations: string[];
  concerns: string[];
  alternativeOptions?: TreatmentProtocol[];
}

export interface ProtocolRecommendation {
  primaryProtocol: MatchedProtocol;
  supportiveProtocols: MatchedProtocol[];
  combinationStrategy: CombinationStrategy;
  overallConfidence: number;
  implementationPlan: ImplementationPlan;
  monitoring: MonitoringPlan;
}

export interface CombinationStrategy {
  approach: 'sequential' | 'concurrent' | 'integrated';
  phaseIntegration: PhaseIntegration[];
  interactionWarnings: string[];
  costOptimization: CostOptimization;
}

export interface PhaseIntegration {
  phase: number;
  protocols: string[];
  duration: string;
  focusAreas: string[];
  monitoring: string[];
}

export interface CostOptimization {
  totalEstimatedCost: number;
  sharedResources: string[];
  bulkPurchaseOptions: string[];
  alternatives: Array<{
    description: string;
    savings: number;
    tradeoffs: string[];
  }>;
}

export interface ImplementationPlan {
  startingProtocol: string;
  week1Actions: string[];
  week2Actions: string[];
  monthlyReviews: string[];
  successMetrics: string[];
  adjustmentTriggers: string[];
}

export interface MonitoringPlan {
  dailyTracking: string[];
  weeklyAssessments: string[];
  monthlyEvaluations: string[];
  alertConditions: string[];
  emergencyContacts: boolean;
}

/**
 * Intelligent Protocol Matching Engine
 */
export class IntelligentProtocolMatcher {
  private static instance: IntelligentProtocolMatcher;
  private protocolDatabase: ComprehensiveProtocolDatabase;

  static getInstance(): IntelligentProtocolMatcher {
    if (!IntelligentProtocolMatcher.instance) {
      IntelligentProtocolMatcher.instance = new IntelligentProtocolMatcher();
    }
    return IntelligentProtocolMatcher.instance;
  }

  constructor() {
    this.protocolDatabase = ComprehensiveProtocolDatabase.getInstance();
  }

  /**
   * Main protocol matching method - intelligent selection based on comprehensive analysis
   */
  async findOptimalProtocols(criteria: ProtocolMatchingCriteria): Promise<ProtocolRecommendation> {
    loggingService.info('IntelligentProtocolMatcher', 'Starting intelligent protocol matching', {
      primaryFindingsCount: criteria.primaryFindings.length,
      constitutionalType: criteria.constitutionalAssessment.ayurvedicType,
      urgencyLevel: criteria.urgencyLevel
    });

    try {
      // Step 1: Score all protocols against criteria
      const scoredProtocols = await this.scoreAllProtocols(criteria);
      
      // Step 2: Select primary protocol
      const primaryProtocol = this.selectPrimaryProtocol(scoredProtocols, criteria);
      
      // Step 3: Select supportive protocols
      const supportiveProtocols = this.selectSupportiveProtocols(scoredProtocols, primaryProtocol, criteria);
      
      // Step 4: Create combination strategy
      const combinationStrategy = this.createCombinationStrategy(primaryProtocol, supportiveProtocols, criteria);
      
      // Step 5: Generate implementation plan
      const implementationPlan = this.generateImplementationPlan(primaryProtocol, supportiveProtocols, criteria);
      
      // Step 6: Create monitoring plan
      const monitoring = this.createMonitoringPlan(primaryProtocol, supportiveProtocols, criteria);
      
      // Step 7: Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(primaryProtocol, supportiveProtocols, criteria);

      const recommendation: ProtocolRecommendation = {
        primaryProtocol,
        supportiveProtocols,
        combinationStrategy,
        overallConfidence,
        implementationPlan,
        monitoring
      };

      loggingService.info('IntelligentProtocolMatcher', 'Protocol matching completed', {
        primaryProtocol: primaryProtocol.protocol.id,
        supportiveCount: supportiveProtocols.length,
        overallConfidence,
        totalCost: combinationStrategy.costOptimization.totalEstimatedCost
      });

      return recommendation;

    } catch (error) {
      loggingService.error('IntelligentProtocolMatcher', 'Protocol matching failed', error as Error);
      throw new Error(`Protocol matching failed: ${(error as Error).message}`);
    }
  }

  /**
   * Score all protocols against the matching criteria
   */
  private async scoreAllProtocols(criteria: ProtocolMatchingCriteria): Promise<MatchedProtocol[]> {
    const allProtocols = this.protocolDatabase.getAllProtocols();
    const scoredProtocols: MatchedProtocol[] = [];

    for (const [_, protocol] of allProtocols) {
      const matchResult = this.scoreProtocolMatch(protocol, criteria);
      if (matchResult.matchScore > 0) {
        scoredProtocols.push(matchResult);
      }
    }

    // Sort by match score (highest first)
    return scoredProtocols.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Score individual protocol match
   */
  private scoreProtocolMatch(protocol: TreatmentProtocol, criteria: ProtocolMatchingCriteria): MatchedProtocol {
    let score = 0;
    const matchingReasons: string[] = [];
    const adaptations: string[] = [];
    const concerns: string[] = [];

    // Score based on primary findings (40% weight)
    const findingsScore = this.scoreFindingsMatch(protocol, criteria.primaryFindings);
    score += findingsScore.score * 0.4;
    matchingReasons.push(...findingsScore.reasons);

    // Score based on constitutional compatibility (25% weight)
    const constitutionalScore = this.scoreConstitutionalMatch(protocol, criteria.constitutionalAssessment);
    score += constitutionalScore.score * 0.25;
    matchingReasons.push(...constitutionalScore.reasons);

    // Score based on severity appropriateness (20% weight)
    const severityScore = this.scoreSeverityMatch(protocol, criteria.primaryFindings);
    score += severityScore.score * 0.2;
    matchingReasons.push(...severityScore.reasons);

    // Score based on patient context (10% weight)
    const contextScore = this.scoreContextMatch(protocol, criteria.patientContext);
    score += contextScore.score * 0.1;
    matchingReasons.push(...contextScore.reasons);
    adaptations.push(...contextScore.adaptations);

    // Score based on preferences (5% weight)
    const preferencesScore = this.scorePreferencesMatch(protocol, criteria.preferences);
    score += preferencesScore.score * 0.05;
    adaptations.push(...preferencesScore.adaptations);

    // Check for concerns and contraindications
    const protocolConcerns = this.identifyProtocolConcerns(protocol, criteria);
    concerns.push(...protocolConcerns);

    // Reduce score for concerns
    if (concerns.length > 0) {
      score *= Math.max(0.5, 1 - (concerns.length * 0.1));
    }

    return {
      protocol,
      matchScore: Math.max(0, Math.min(100, score)),
      matchingReasons,
      adaptations,
      concerns
    };
  }

  /**
   * Score findings match
   */
  private scoreFindingsMatch(protocol: TreatmentProtocol, findings: HealthIndicator[]): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    findings.forEach(finding => {
      // Direct condition match
      const directMatch = protocol.condition.some(condition =>
        condition.toLowerCase().includes(finding.category.toLowerCase()) ||
        finding.category.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(finding.finding.toLowerCase())
      );

      if (directMatch) {
        const findingScore = finding.confidence * 30; // Up to 30 points per finding
        score += findingScore;
        reasons.push(`Directly addresses ${finding.category} (${finding.finding})`);
      }

      // Category match
      const categoryMatch = protocol.category === finding.category;
      if (categoryMatch) {
        score += finding.confidence * 20; // Up to 20 points for category match
        reasons.push(`Protocol category matches finding category: ${finding.category}`);
      }

      // Organ system match
      const organMatch = finding.organSystems.some(organ =>
        protocol.condition.some(condition =>
          condition.toLowerCase().includes(organ.toLowerCase())
        )
      );

      if (organMatch) {
        score += finding.confidence * 10; // Up to 10 points for organ system match
        reasons.push(`Addresses organ system: ${finding.organSystems.join(', ')}`);
      }
    });

    return { score, reasons };
  }

  /**
   * Score constitutional match
   */
  private scoreConstitutionalMatch(protocol: TreatmentProtocol, constitutional: ConstitutionalMarkers): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    // Ayurvedic type match
    if (protocol.constitution.includes(constitutional.ayurvedicType)) {
      score += 40;
      reasons.push(`Matches Ayurvedic constitution: ${constitutional.ayurvedicType}`);
    } else if (protocol.constitution.includes('all')) {
      score += 20;
      reasons.push('Suitable for all constitutional types');
    }

    // TCM constitution match
    if (protocol.constitution.includes(constitutional.tcmConstitution)) {
      score += 30;
      reasons.push(`Matches TCM constitution: ${constitutional.tcmConstitution}`);
    }

    // Metabolic type considerations
    if (constitutional.metabolicType === 'fast' && protocol.constitution.includes('pitta')) {
      score += 10;
      reasons.push('Appropriate for fast metabolism (Pitta-like)');
    } else if (constitutional.metabolicType === 'slow' && protocol.constitution.includes('kapha')) {
      score += 10;
      reasons.push('Appropriate for slow metabolism (Kapha-like)');
    }

    return { score, reasons };
  }

  /**
   * Score severity appropriateness
   */
  private scoreSeverityMatch(protocol: TreatmentProtocol, findings: HealthIndicator[]): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    const maxSeverity = findings.reduce((max, finding) => {
      const severityScore = finding.severity === 'severe' ? 3 : 
                           finding.severity === 'moderate' ? 2 : 1;
      return Math.max(max, severityScore);
    }, 1);

    // Match protocol intensity to severity
    const protocolIntensity = this.assessProtocolIntensity(protocol);
    
    if (maxSeverity === 3 && protocolIntensity >= 7) {
      score += 30;
      reasons.push('High-intensity protocol appropriate for severe findings');
    } else if (maxSeverity === 2 && protocolIntensity >= 4 && protocolIntensity <= 7) {
      score += 30;
      reasons.push('Moderate-intensity protocol appropriate for moderate findings');
    } else if (maxSeverity === 1 && protocolIntensity <= 4) {
      score += 30;
      reasons.push('Gentle protocol appropriate for mild findings');
    } else {
      score += 10;
      reasons.push('Protocol intensity may need adjustment for severity level');
    }

    return { score, reasons };
  }

  /**
   * Score context match
   */
  private scoreContextMatch(protocol: TreatmentProtocol, context?: PatientContext): {
    score: number;
    reasons: string[];
    adaptations: string[];
  } {
    let score = 20; // Base score
    const reasons: string[] = [];
    const adaptations: string[] = [];

    if (!context) {
      return { score, reasons, adaptations };
    }

    // Budget considerations
    if (context.budgetRange) {
      const protocolCost = protocol.estimatedCost.totalCostMXN;
      if (context.budgetRange === 'low' && protocolCost <= 500) {
        score += 15;
        reasons.push('Cost-effective option within budget');
      } else if (context.budgetRange === 'medium' && protocolCost <= 1000) {
        score += 10;
        reasons.push('Reasonable cost for moderate budget');
      } else if (context.budgetRange === 'high') {
        score += 5;
        reasons.push('Premium protocol option');
      } else {
        score -= 10;
        adaptations.push('Consider alternative lower-cost options');
      }
    }

    // Time availability
    if (context.timeAvailability) {
      const protocolDuration = this.parseDurationToWeeks(protocol.duration);
      if (context.timeAvailability === 'limited' && protocolDuration <= 4) {
        score += 10;
        reasons.push('Short duration suitable for limited time');
      } else if (context.timeAvailability === 'flexible') {
        score += 5;
        reasons.push('Patient has flexibility for comprehensive treatment');
      }
    }

    // Medical history considerations
    if (context.medicalHistory && context.medicalHistory.length > 0) {
      const hasContraindications = context.medicalHistory.some(condition =>
        protocol.contraindications.some(contra =>
          contra.toLowerCase().includes(condition.toLowerCase())
        )
      );

      if (hasContraindications) {
        score -= 20;
        adaptations.push('Requires medical supervision due to medical history');
      } else {
        score += 5;
        reasons.push('No contraindications identified');
      }
    }

    // Medication interactions
    if (context.currentMedications && context.currentMedications.length > 0) {
      const hasInteractions = context.currentMedications.some(med =>
        protocol.interactions.some(interaction =>
          interaction.toLowerCase().includes(med.toLowerCase())
        )
      );

      if (hasInteractions) {
        score -= 15;
        adaptations.push('Monitor for drug interactions');
      }
    }

    return { score, reasons, adaptations };
  }

  /**
   * Score preferences match
   */
  private scorePreferencesMatch(protocol: TreatmentProtocol, preferences?: PatientPreferences): {
    score: number;
    adaptations: string[];
  } {
    let score = 20; // Base score
    const adaptations: string[] = [];

    if (!preferences) {
      return { score, adaptations };
    }

    // Treatment approach preference
    if (preferences.preferredApproach) {
      const protocolIntensity = this.assessProtocolIntensity(protocol);
      
      if (preferences.preferredApproach === 'conservative' && protocolIntensity <= 4) {
        score += 15;
      } else if (preferences.preferredApproach === 'moderate' && protocolIntensity >= 4 && protocolIntensity <= 7) {
        score += 15;
      } else if (preferences.preferredApproach === 'intensive' && protocolIntensity >= 7) {
        score += 15;
      } else {
        adaptations.push('Adjust protocol intensity to match preferences');
      }
    }

    // Herb preferences
    if (preferences.herbPreferences === 'traditional') {
      const hasTraditionalHerbs = protocol.phases.some(phase =>
        phase.herbs.some(herb => herb.localAvailability.mexicanMarkets)
      );
      if (hasTraditionalHerbs) {
        score += 10;
      }
    }

    // Duration preferences
    if (preferences.treatmentDuration) {
      const protocolWeeks = this.parseDurationToWeeks(protocol.duration);
      if (preferences.treatmentDuration === 'short' && protocolWeeks <= 4) {
        score += 10;
      } else if (preferences.treatmentDuration === 'medium' && protocolWeeks <= 8) {
        score += 10;
      } else if (preferences.treatmentDuration === 'long') {
        score += 5;
      }
    }

    return { score, adaptations };
  }

  /**
   * Identify protocol concerns
   */
  private identifyProtocolConcerns(protocol: TreatmentProtocol, criteria: ProtocolMatchingCriteria): string[] {
    const concerns: string[] = [];

    // Check urgency vs protocol speed
    if (criteria.urgencyLevel === 'urgent' && this.parseDurationToWeeks(protocol.duration) > 2) {
      concerns.push('Protocol may take too long for urgent condition');
    }

    // Check for high-risk combinations
    if (criteria.primaryFindings.length > 3 && protocol.category === 'constitutional') {
      concerns.push('Multiple acute findings may need specific treatment before constitutional balancing');
    }

    // Check evidence level for severe conditions
    const hasSevereFindings = criteria.primaryFindings.some(f => f.severity === 'severe');
    if (hasSevereFindings && protocol.evidenceLevel === 'Traditional') {
      concerns.push('Traditional protocol for severe condition - consider evidence-based alternatives');
    }

    return concerns;
  }

  /**
   * Select primary protocol
   */
  private selectPrimaryProtocol(scoredProtocols: MatchedProtocol[], criteria: ProtocolMatchingCriteria): MatchedProtocol {
    if (scoredProtocols.length === 0) {
      throw new Error('No suitable protocols found for the given criteria');
    }

    // Get the highest scoring protocol
    const primary = scoredProtocols[0];
    
    // Add alternative options
    primary.alternativeOptions = scoredProtocols.slice(1, 4); // Top 3 alternatives

    return primary;
  }

  /**
   * Select supportive protocols
   */
  private selectSupportiveProtocols(
    scoredProtocols: MatchedProtocol[], 
    primaryProtocol: MatchedProtocol, 
    criteria: ProtocolMatchingCriteria
  ): MatchedProtocol[] {
    const supportive: MatchedProtocol[] = [];

    // Look for protocols that address different categories
    const primaryCategory = primaryProtocol.protocol.category;
    
    for (const protocol of scoredProtocols) {
      if (protocol.protocol.id === primaryProtocol.protocol.id) continue;
      
      // Add if different category and good score
      if (protocol.protocol.category !== primaryCategory && protocol.matchScore > 30) {
        // Check for compatibility
        if (this.areProtocolsCompatible(primaryProtocol.protocol, protocol.protocol)) {
          supportive.push(protocol);
          
          // Limit to 2-3 supportive protocols
          if (supportive.length >= 3) break;
        }
      }
    }

    return supportive;
  }

  /**
   * Create combination strategy
   */
  private createCombinationStrategy(
    primary: MatchedProtocol, 
    supportive: MatchedProtocol[], 
    criteria: ProtocolMatchingCriteria
  ): CombinationStrategy {
    
    // Determine approach based on urgency and complexity
    let approach: CombinationStrategy['approach'] = 'sequential';
    
    if (criteria.urgencyLevel === 'urgent') {
      approach = 'concurrent';
    } else if (supportive.length <= 1) {
      approach = 'integrated';
    }

    // Create phase integration plan
    const phaseIntegration = this.createPhaseIntegration(primary, supportive, approach);
    
    // Identify interaction warnings
    const interactionWarnings = this.identifyInteractionWarnings(primary, supportive);
    
    // Calculate cost optimization
    const costOptimization = this.calculateCostOptimization(primary, supportive);

    return {
      approach,
      phaseIntegration,
      interactionWarnings,
      costOptimization
    };
  }

  /**
   * Generate implementation plan
   */
  private generateImplementationPlan(
    primary: MatchedProtocol, 
    supportive: MatchedProtocol[], 
    criteria: ProtocolMatchingCriteria
  ): ImplementationPlan {
    
    const startingProtocol = primary.protocol.id;
    
    const week1Actions = [
      `Begin ${primary.protocol.name}`,
      'Establish daily routine',
      'Monitor initial response',
      'Track symptoms daily'
    ];

    const week2Actions = [
      'Assess initial progress',
      'Adjust dosages if needed',
      'Continue primary protocol',
      'Consider adding supportive measures'
    ];

    const monthlyReviews = [
      'Comprehensive progress assessment',
      'Review treatment goals',
      'Adjust protocols as needed',
      'Evaluate cost-effectiveness'
    ];

    const successMetrics = [
      'Symptom improvement >50%',
      'Quality of life enhancement',
      'No adverse reactions',
      'Protocol adherence >80%'
    ];

    const adjustmentTriggers = [
      'No improvement after 2 weeks',
      'Adverse reactions',
      'Patient preference changes',
      'New symptoms emergence'
    ];

    return {
      startingProtocol,
      week1Actions,
      week2Actions,
      monthlyReviews,
      successMetrics,
      adjustmentTriggers
    };
  }

  /**
   * Create monitoring plan
   */
  private createMonitoringPlan(
    primary: MatchedProtocol, 
    supportive: MatchedProtocol[], 
    criteria: ProtocolMatchingCriteria
  ): MonitoringPlan {
    
    const dailyTracking = [
      'Symptom severity (1-10 scale)',
      'Energy levels',
      'Sleep quality',
      'Protocol adherence'
    ];

    const weeklyAssessments = [
      'Overall progress evaluation',
      'Side effect monitoring',
      'Goal achievement review',
      'Treatment satisfaction'
    ];

    const monthlyEvaluations = [
      'Comprehensive health assessment',
      'Constitutional balance review',
      'Treatment effectiveness analysis',
      'Cost-benefit evaluation'
    ];

    const alertConditions = [
      'Severe adverse reactions',
      'Rapid symptom worsening',
      'New concerning symptoms',
      'Emergency medical situations'
    ];

    const emergencyContacts = criteria.urgencyLevel === 'urgent' || 
                             criteria.primaryFindings.some(f => f.severity === 'severe');

    return {
      dailyTracking,
      weeklyAssessments,
      monthlyEvaluations,
      alertConditions,
      emergencyContacts
    };
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    primary: MatchedProtocol, 
    supportive: MatchedProtocol[], 
    criteria: ProtocolMatchingCriteria
  ): number {
    let confidence = primary.matchScore / 100 * 0.6; // Primary protocol weight
    
    // Add supportive protocol confidence
    const supportiveConfidence = supportive.reduce((sum, protocol) => 
      sum + (protocol.matchScore / 100), 0
    ) / Math.max(supportive.length, 1) * 0.3;
    
    confidence += supportiveConfidence;
    
    // Add criteria quality factor
    const criteriaQuality = this.assessCriteriaQuality(criteria) * 0.1;
    confidence += criteriaQuality;
    
    return Math.min(0.95, confidence);
  }

  // Helper methods

  private assessProtocolIntensity(protocol: TreatmentProtocol): number {
    // Simple intensity assessment based on duration, phase count, and herb count
    const durationWeeks = this.parseDurationToWeeks(protocol.duration);
    const phaseCount = protocol.phases.length;
    const herbCount = protocol.phases.reduce((sum, phase) => sum + phase.herbs.length, 0);
    
    let intensity = 1;
    if (durationWeeks > 8) intensity += 2;
    if (phaseCount > 3) intensity += 2;
    if (herbCount > 5) intensity += 2;
    if (protocol.evidenceLevel === 'A') intensity += 1;
    
    return Math.min(10, intensity);
  }

  private parseDurationToWeeks(duration: string): number {
    switch (duration) {
      case '1_week': return 1;
      case '2_weeks': return 2;
      case '4_weeks': return 4;
      case '6_weeks': return 6;
      case '8_weeks': return 8;
      case '12_weeks': return 12;
      case 'ongoing': return 52;
      default: return 4;
    }
  }

  private areProtocolsCompatible(protocol1: TreatmentProtocol, protocol2: TreatmentProtocol): boolean {
    // Check for herb interactions
    const herbs1 = protocol1.phases.flatMap(p => p.herbs.map(h => h.herbName));
    const herbs2 = protocol2.phases.flatMap(p => p.herbs.map(h => h.herbName));
    
    // Simple compatibility check - in reality would need comprehensive herb interaction database
    const contraindicated = ['st_john_wort_with_blood_thinners', 'ginkgo_with_blood_thinners'];
    
    return true; // Simplified - assume compatible unless specific contraindications
  }

  private createPhaseIntegration(
    primary: MatchedProtocol, 
    supportive: MatchedProtocol[], 
    approach: CombinationStrategy['approach']
  ): PhaseIntegration[] {
    const integration: PhaseIntegration[] = [];
    
    if (approach === 'sequential') {
      integration.push({
        phase: 1,
        protocols: [primary.protocol.id],
        duration: '4 weeks',
        focusAreas: ['Primary condition treatment'],
        monitoring: ['Primary symptoms', 'Initial response']
      });
      
      if (supportive.length > 0) {
        integration.push({
          phase: 2,
          protocols: [primary.protocol.id, supportive[0].protocol.id],
          duration: '4 weeks',
          focusAreas: ['Primary + supportive treatment'],
          monitoring: ['Combined response', 'Interaction monitoring']
        });
      }
    } else if (approach === 'concurrent') {
      integration.push({
        phase: 1,
        protocols: [primary.protocol.id, ...supportive.map(s => s.protocol.id)],
        duration: '6 weeks',
        focusAreas: ['Multi-system treatment'],
        monitoring: ['All systems', 'Interaction effects']
      });
    }
    
    return integration;
  }

  private identifyInteractionWarnings(primary: MatchedProtocol, supportive: MatchedProtocol[]): string[] {
    const warnings: string[] = [];
    
    // Check for herb interactions between protocols
    const allHerbs = [primary, ...supportive].flatMap(p => 
      p.protocol.phases.flatMap(phase => phase.herbs)
    );
    
    // Look for known interactions
    const herbNames = allHerbs.map(h => h.herbName);
    if (herbNames.includes('st_john_wort') && herbNames.includes('ginkgo')) {
      warnings.push('Monitor for increased bleeding risk with St. John\'s Wort and Ginkgo combination');
    }
    
    // Check for overlapping effects
    const stimulatingHerbs = allHerbs.filter(h => 
      h.herbName.includes('ginseng') || h.herbName.includes('rhodiola')
    );
    if (stimulatingHerbs.length > 1) {
      warnings.push('Multiple stimulating herbs - monitor for overstimulation');
    }
    
    return warnings;
  }

  private calculateCostOptimization(primary: MatchedProtocol, supportive: MatchedProtocol[]): CostOptimization {
    const totalCost = primary.protocol.estimatedCost.totalCostMXN + 
                     supportive.reduce((sum, s) => sum + s.protocol.estimatedCost.totalCostMXN, 0);
    
    const sharedResources = ['Basic supplements', 'Preparation tools'];
    const bulkPurchaseOptions = ['Herb combinations', 'Monthly packages'];
    
    const alternatives = [
      {
        description: 'Use only primary protocol initially',
        savings: supportive.reduce((sum, s) => sum + s.protocol.estimatedCost.totalCostMXN, 0),
        tradeoffs: ['Slower progress', 'Less comprehensive approach']
      }
    ];
    
    return {
      totalEstimatedCost: totalCost,
      sharedResources,
      bulkPurchaseOptions,
      alternatives
    };
  }

  private assessCriteriaQuality(criteria: ProtocolMatchingCriteria): number {
    let quality = 0.5; // Base quality
    
    // More findings = better assessment
    if (criteria.primaryFindings.length >= 3) quality += 0.2;
    if (criteria.secondaryFindings.length >= 2) quality += 0.1;
    
    // High confidence findings
    const avgConfidence = criteria.primaryFindings.reduce((sum, f) => sum + f.confidence, 0) / 
                         criteria.primaryFindings.length;
    quality += (avgConfidence - 0.5) * 0.3;
    
    // Patient context provided
    if (criteria.patientContext) quality += 0.1;
    if (criteria.preferences) quality += 0.1;
    
    return Math.min(1.0, quality);
  }
}