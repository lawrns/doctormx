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
import { EnhancedProtocolMatcher } from './EnhancedProtocolMatcher';

export interface ProtocolMatchingCriteria {
  primaryFindings: HealthIndicator[];
  secondaryFindings: HealthIndicator[];
  constitutionalAssessment: ConstitutionalMarkers;
  urgencyLevel: 'routine' | 'monitor' | 'consult' | 'urgent';
  patientContext?: PatientContext;
  preferences?: PatientPreferences;
}

export interface HealthIndicator {
  id?: string; // Add optional id property
  category: string;
  finding: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  organSystems: string[];
  recommendations?: string[];
  type?: string; // Add optional type property
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
      // Enhanced logging of input criteria
      loggingService.info('IntelligentProtocolMatcher', 'Protocol matching criteria details', {
        primaryFindingsCount: criteria.primaryFindings.length,
        primaryFindingsCategories: criteria.primaryFindings.map(f => f.category).join(','),
        constitutionTypes: criteria.constitutionalAssessment.ayurvedicType,
        urgencyLevel: criteria.urgencyLevel,
        hasPatientContext: !!criteria.patientContext
      });
      
      // Log detailed findings
      criteria.primaryFindings.forEach((finding, index) => {
        loggingService.info('IntelligentProtocolMatcher', `Input finding ${index + 1}`, {
          category: finding.category,
          finding: finding.finding,
          severity: finding.severity,
          confidence: finding.confidence,
          organSystems: finding.organSystems,
          organSystemsType: typeof finding.organSystems,
          organSystemsIsArray: Array.isArray(finding.organSystems),
          organSystemsValues: Array.isArray(finding.organSystems) ? 
            finding.organSystems.map(org => ({ value: org, type: typeof org })) : 
            'not an array'
        });
      });
      
      // Step 1: Score all protocols against criteria
      const scoredProtocols = await this.scoreAllProtocols(criteria);
      
      // Check if we have any protocols
      if (!scoredProtocols || scoredProtocols.length === 0) {
        loggingService.warn('IntelligentProtocolMatcher', 'No matching protocols found, creating fallback protocol');
        return this.createFallbackRecommendation(criteria);
      }
      
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
      // Enhanced error logging with more context
      const errorObj = error as Error;
      loggingService.error('IntelligentProtocolMatcher', 'Protocol matching failed', errorObj, {
        // Using type assertion for error details
        errorName: errorObj?.name || 'Unknown',
        errorMessage: errorObj?.message || 'No message',
        criteriaProvided: !!criteria,
        primaryFindingsCount: criteria?.primaryFindings?.length || 0,
        constitutionProvided: !!criteria?.constitutionalAssessment
      });
      
      // Return a fallback recommendation instead of throwing an error
      return this.createFallbackRecommendation(criteria);
    }
  }

  /**
   * Score all protocols against the matching criteria
   */
  private async scoreAllProtocols(criteria: ProtocolMatchingCriteria): Promise<MatchedProtocol[]> {
    try {
      // Log details about the protocols collection and criteria
      const allProtocols = this.protocolDatabase.getAllProtocols();
      const protocolCount = allProtocols ? allProtocols.size : 0;
      
      loggingService.info('IntelligentProtocolMatcher', 'Scoring protocols', {
        protocolCount,
        criteriaFindings: criteria.primaryFindings.length,
        constitution: criteria.constitutionalAssessment.ayurvedicType
      });
      
      // Validate that we have protocols to work with
      if (!allProtocols || protocolCount === 0) {
        loggingService.warn('IntelligentProtocolMatcher', 'No protocols available in database');
        return [];
      }
      
      const scoredProtocols: MatchedProtocol[] = [];
      const EARLY_BREAK_THRESHOLD = 75; // High confidence match
      const MIN_PROTOCOLS_TO_SCORE = 3; // Always score at least 3
      let highConfidenceFound = false;

      // Score each protocol
      for (const [protocolId, protocol] of allProtocols) {
        try {
          // Validate protocol structure before scoring
          if (!this.validateProtocolStructure(protocol)) {
            loggingService.warn('IntelligentProtocolMatcher', 'Skipping invalid protocol', { protocolId });
            continue;
          }
          
          const matchResult = this.scoreProtocolMatch(protocol, criteria);
          if (matchResult.matchScore > 0) {
            scoredProtocols.push(matchResult);
            
            // Early break if we found a high-confidence match after minimum protocols
            if (matchResult.matchScore >= EARLY_BREAK_THRESHOLD && scoredProtocols.length >= MIN_PROTOCOLS_TO_SCORE) {
              highConfidenceFound = true;
              loggingService.info('IntelligentProtocolMatcher', 'High confidence match found, stopping early', {
                protocolName: matchResult.protocol.name,
                score: matchResult.matchScore,
                protocolsScored: scoredProtocols.length
              });
              break;
            }
          }
        } catch (protocolError) {
          // Log error but continue with other protocols
          loggingService.error('IntelligentProtocolMatcher', `Error scoring protocol ${protocolId}`, protocolError as Error);
          continue;
        }
      }

      loggingService.info('IntelligentProtocolMatcher', 'Protocol scoring completed', {
        totalScored: scoredProtocols.length,
        matchingProtocols: scoredProtocols.filter(p => p.matchScore > 50).length,
        topProtocols: scoredProtocols
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5)
          .map(p => ({
            name: p.protocol.name,
            score: p.matchScore,
            reasons: p.matchReasons
          }))
      });
      
      // Sort by match score (highest first)
      return scoredProtocols.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      loggingService.error('IntelligentProtocolMatcher', 'Failed to score protocols', error as Error);
      throw error; // Re-throw to be caught by findOptimalProtocols
    }
  }
  
  /**
   * Validate that a protocol has the required structure to be scored
   */
  private validateProtocolStructure(protocol: TreatmentProtocol): boolean {
    if (!protocol) return false;
    if (!protocol.id || !protocol.name) return false;
    if (!Array.isArray(protocol.phases) || protocol.phases.length === 0) return false;
    if (!Array.isArray(protocol.constitution)) return false;
    
    // Check at least one phase has required properties
    const validPhase = protocol.phases.some(phase => 
      phase && 
      typeof phase.phase === 'number' && 
      Array.isArray(phase.herbs)
    );
    
    return validPhase;
  }

  /**
   * Score individual protocol match
   */
  private scoreProtocolMatch(protocol: TreatmentProtocol, criteria: ProtocolMatchingCriteria): MatchedProtocol {
    let score = 0;
    const matchingReasons: string[] = [];
    const adaptations: string[] = [];
    const concerns: string[] = [];

    // Log protocol being scored
    loggingService.info('IntelligentProtocolMatcher', 'Scoring protocol', {
      protocolId: protocol.id,
      protocolName: protocol.name,
      protocolCategory: protocol.category,
      protocolConditions: protocol.condition,
      protocolTargetOrgans: protocol.targetOrganSystems,
      findingsCount: criteria.primaryFindings.length
    });

    // Score based on primary findings (40% weight)
    const findingsScore = this.scoreFindingsMatch(protocol, criteria.primaryFindings);
    score += findingsScore.score * 0.4;
    matchingReasons.push(...findingsScore.reasons);
    
    loggingService.info('IntelligentProtocolMatcher', 'Findings score', {
      protocolName: protocol.name,
      findingsScore: findingsScore.score,
      weightedScore: findingsScore.score * 0.4,
      reasons: findingsScore.reasons
    });

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

    // Apply bonus for specific protocols
    if (!protocol.name.toLowerCase().includes('general') && 
        !protocol.name.toLowerCase().includes('bienestar') &&
        matchingReasons.some(reason => reason.includes('específica') || reason.includes('exacta'))) {
      score *= 1.5; // 50% bonus for specific protocols with good matches
      matchingReasons.push('Bonus por protocolo específico');
    }
    
    // Apply penalty for overly generic protocols
    if ((protocol.name.toLowerCase().includes('general') || 
         protocol.name.toLowerCase().includes('bienestar')) &&
        criteria.primaryFindings.some(f => 
          ['rosácea', 'acné', 'dermatitis', 'eczema'].some(condition => 
            f.finding.toLowerCase().includes(condition)
          )
        )) {
      score *= 0.4; // 60% penalty for generic protocols with specific conditions
      concerns.push('Protocolo demasiado genérico para las condiciones detectadas');
    }
    
    // Apply enhanced scoring for Vision API findings
    const hasVisionAPIFindings = criteria.primaryFindings.some(f => f.confidence === 0.85);
    if (hasVisionAPIFindings) {
      const enhanced = EnhancedProtocolMatcher.enhanceProtocolScoring(
        protocol,
        criteria.primaryFindings,
        score,
        matchingReasons
      );
      score = enhanced.enhancedScore;
      matchingReasons.push(...enhanced.enhancedReasons);
      
      loggingService.info('IntelligentProtocolMatcher', 'Applied Vision API enhancement', {
        protocolName: protocol.name,
        originalScore: score,
        enhancedScore: enhanced.enhancedScore,
        newReasons: enhanced.enhancedReasons
      });
    }
    
    // Reduce score for concerns
    if (concerns.length > 0) {
      score *= Math.max(0.5, 1 - (concerns.length * 0.1));
    }

    const finalScore = Math.max(0, Math.min(100, score));
    
    loggingService.info('IntelligentProtocolMatcher', 'Protocol final score', {
      protocolName: protocol.name,
      finalScore,
      hasReasons: matchingReasons.length > 0,
      reasonCount: matchingReasons.length,
      concernCount: concerns.length
    });

    return {
      protocol,
      matchScore: finalScore,
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

    loggingService.info('IntelligentProtocolMatcher', 'Starting findings match scoring', {
      protocolName: protocol.name,
      protocolConditions: protocol.condition,
      findingsCount: findings.length
    });

    findings.forEach((finding, index) => {
      loggingService.info('IntelligentProtocolMatcher', `Scoring finding ${index + 1}`, {
        findingCategory: finding.category,
        findingText: finding.finding,
        findingSeverity: finding.severity,
        findingOrgans: finding.organSystems,
        findingConfidence: finding.confidence
      });

      // Enhanced condition matching with specificity bonus
      let bestMatchScore = 0;
      let bestMatchReason = '';
      
      protocol.condition.forEach(condition => {
        const conditionLower = condition.toLowerCase();
        const findingLower = finding.finding.toLowerCase();
        const categoryLower = finding.category.toLowerCase();
        
        // Check for specific dermatological conditions
        const dermatologicalKeywords = ['rosácea', 'acné', 'dermatitis', 'eczema', 'psoriasis', 'melasma', 'pigmentación'];
        const isDermatological = dermatologicalKeywords.some(keyword => 
          findingLower.includes(keyword) || conditionLower.includes(keyword)
        );
        
        // Exact match gets highest score
        if (conditionLower === findingLower || 
            (isDermatological && finding.category === 'dermatological' && conditionLower.includes(findingLower.split(' ')[0]))) {
          const exactScore = finding.confidence * 50; // Higher score for exact matches
          if (exactScore > bestMatchScore) {
            bestMatchScore = exactScore;
            bestMatchReason = `Coincidencia exacta: ${condition} con ${finding.finding}`;
          }
        }
        // Partial but specific match
        else if (conditionLower.includes(findingLower) || findingLower.includes(conditionLower)) {
          const partialScore = finding.confidence * 35;
          if (partialScore > bestMatchScore) {
            bestMatchScore = partialScore;
            bestMatchReason = `Trata específicamente: ${finding.finding}`;
          }
        }
        // Category match but not generic
        else if (categoryLower === protocol.category && !protocol.name.toLowerCase().includes('general')) {
          const categoryScore = finding.confidence * 25;
          if (categoryScore > bestMatchScore) {
            bestMatchScore = categoryScore;
            bestMatchReason = `Categoría específica: ${finding.category}`;
          }
        }
      });
      
      // Apply penalty for generic protocols when specific conditions are found
      if (protocol.name.toLowerCase().includes('general') || protocol.name.toLowerCase().includes('bienestar')) {
        const specificConditions = ['rosácea', 'acné', 'dermatitis', 'eczema', 'psoriasis'];
        const hasSpecificCondition = specificConditions.some(condition => 
          finding.finding.toLowerCase().includes(condition)
        );
        
        if (hasSpecificCondition) {
          bestMatchScore *= 0.3; // Reduce score by 70% for generic protocols when specific conditions exist
          bestMatchReason = `Protocolo genérico (penalizado por condición específica)`;
        }
      }
      
      if (bestMatchScore > 0) {
        score += bestMatchScore;
        reasons.push(bestMatchReason);
        loggingService.info('IntelligentProtocolMatcher', 'Condition match scoring', {
          protocolName: protocol.name,
          finding: finding.finding,
          matchType: bestMatchReason,
          scoreAdded: bestMatchScore
        });
      }

      // Category match
      const categoryMatch = protocol.category === finding.category;
      if (categoryMatch) {
        const categoryScore = finding.confidence * 20; // Up to 20 points for category match
        score += categoryScore;
        reasons.push(`Protocol category matches finding category: ${finding.category}`);
        loggingService.info('IntelligentProtocolMatcher', 'Category match found', {
          protocolName: protocol.name,
          category: finding.category,
          scoreAdded: categoryScore
        });
      }

      // Organ system match
      const organMatch = finding.organSystems.some(organ => {
        // Ensure organ is a string before calling toLowerCase
        if (typeof organ !== 'string') {
          loggingService.warn('IntelligentProtocolMatcher', 'Invalid organ system type', {
            organType: typeof organ,
            organValue: JSON.stringify(organ),
            findingText: finding.finding,
            findingCategory: finding.category,
            allOrganSystems: JSON.stringify(finding.organSystems)
          });
          return false;
        }
        
        // Check if protocol targets this organ system
        const protocolTargetsOrgan = protocol.targetOrganSystems?.some(targetOrgan => {
          if (typeof targetOrgan !== 'string') {
            loggingService.warn('IntelligentProtocolMatcher', 'Invalid target organ type', {
              targetOrganType: typeof targetOrgan,
              targetOrganValue: JSON.stringify(targetOrgan),
              protocolId: protocol.id,
              protocolName: protocol.name
            });
            return false;
          }
          
          return targetOrgan.toLowerCase() === organ.toLowerCase() ||
                 targetOrgan.toLowerCase().includes(organ.toLowerCase()) ||
                 organ.toLowerCase().includes(targetOrgan.toLowerCase());
        });
        
        if (protocolTargetsOrgan) {
          loggingService.info('IntelligentProtocolMatcher', 'Target organ system match found', {
            protocolName: protocol.name,
            organ,
            protocolTargets: protocol.targetOrganSystems
          });
          return true;
        }
        
        // Also check conditions for organ mentions
        return protocol.condition.some(condition => {
          // Ensure condition is a string before calling toLowerCase
          if (typeof condition !== 'string') {
            loggingService.warn('IntelligentProtocolMatcher', 'Invalid condition type', {
              conditionType: typeof condition,
              conditionValue: JSON.stringify(condition),
              protocolId: protocol.id,
              protocolName: protocol.name
            });
            return false;
          }
          
          const isMatch = condition.toLowerCase().includes(organ.toLowerCase()) ||
                         organ.toLowerCase().includes(condition.toLowerCase());
          
          if (isMatch) {
            loggingService.info('IntelligentProtocolMatcher', 'Condition-organ match found', {
              organ,
              condition,
              protocol: protocol.name
            });
          }
          
          return isMatch;
        });
      });

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
      loggingService.error('IntelligentProtocolMatcher', 'No protocols found - will throw error');
      throw new Error('No suitable protocols found for the given criteria');
    }

    // Get the highest scoring protocol
    const primary = scoredProtocols[0];
    
    loggingService.info('IntelligentProtocolMatcher', 'Primary protocol selected', {
      protocolName: primary.protocol.name,
      protocolId: primary.protocol.id,
      matchScore: primary.matchScore,
      matchReasons: primary.matchReasons,
      isGeneralWellness: primary.protocol.id === 'general_wellness_001',
      totalProtocolsScored: scoredProtocols.length,
      top3Protocols: scoredProtocols.slice(0, 3).map(p => ({
        name: p.protocol.name,
        score: p.matchScore
      }))
    });
    
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
    // Base confidence from primary protocol match score
    let confidence = primary.matchScore / 100;
    
    // Adjust based on data quality
    const criteriaQuality = this.assessCriteriaQuality(criteria);
    confidence *= criteriaQuality;
    
    // Adjust based on concerns
    if (primary.concerns.length > 0) {
      confidence *= Math.max(0.7, 1 - (primary.concerns.length * 0.05));
    }
    
    // Minor adjustment for supportive protocols
    if (supportive.length > 0) {
      confidence += 0.05;
    }
    
    // Cap at 95% - we're never 100% confident
    return Math.min(0.95, confidence);
  }
  
  /**
   * Create a fallback recommendation when no protocols match or an error occurs
   */
  private createFallbackRecommendation(criteria: ProtocolMatchingCriteria): ProtocolRecommendation {
    loggingService.info('IntelligentProtocolMatcher', 'Creating fallback protocol recommendation');
    
    // Create a minimal fallback protocol
    const fallbackProtocol: TreatmentProtocol = {
      id: 'fallback-protocol',
      name: 'General Wellness Protocol',
      description: 'Basic wellness protocol for general health maintenance',
      category: 'constitutional',
      condition: ['general wellness'],
      constitution: ['vata', 'pitta', 'kapha'],
      duration: '4_weeks',
      phases: [{
        phase: 1,
        name: 'Wellness Foundation',
        duration: '4 weeks',
        goals: ['Improve general wellness', 'Establish healthy routines'],
        herbs: [{
          herbName: 'Chamomile',
          mexicanName: 'Manzanilla',
          dosage: '1 cup',
          preparation: 'Tea',
          timing: 'Evening',
          duration: '4 weeks',
          purpose: 'Calming, digestive support',
          interactions: [],
          contraindications: [],
          localAvailability: {
            mexicanMarkets: true,
            pharmacies: true,
            growsWild: false,
            seasonality: 'Year-round',
            alternatives: ['Linden flowers', 'Valerian']
          }
        }],
        lifestyle: [{
          category: 'diet',
          recommendation: 'Balanced nutrition with emphasis on fresh vegetables',
          mexicanAdaptation: 'Incorporate local fruits and vegetables',
          priority: 'essential',
          implementation: 'Start with adding one serving of vegetables to each meal'
        }],
        monitoring: [{
          parameter: 'Energy level',
          method: 'Daily journal',
          frequency: 'Daily',
          targetRange: 'Improvement',
          alertConditions: ['Persistent fatigue']
        }],
        milestones: [{
          milestone: 'Improved daily energy',
          expectedTimeframe: '2 weeks',
          successIndicators: ['Sustained energy throughout the day'],
          failureIndicators: ['Continued fatigue'],
          nextSteps: 'Consult healthcare provider'
        }]
      }],
      evidenceLevel: 'B',
      culturalAdaptations: [{
        aspect: 'Herbs',
        mexicanContext: 'Using locally available herbs',
        adaptationStrategy: 'Substitute with local equivalents',
        culturalConsiderations: ['Local traditional usage']
      }],
      estimatedCost: {
        totalCostMXN: 500,
        phaseBreakdown: [{
          phase: 1,
          costMXN: 500,
          items: [{ item: 'Herbs', cost: 200 }, { item: 'Supplements', cost: 300 }]
        }],
        alternatives: [{
          option: 'Budget option',
          costMXN: 300,
          description: 'Using only essential components'
        }]
      },
      contraindications: [],
      interactions: [],
      followUpSchedule: {
        initialFollowUp: '2 weeks',
        ongoingSchedule: 'Monthly',
        emergencyContacts: false,
        selfMonitoring: ['Energy levels', 'Sleep quality']
      }
    };

    // Create a matched protocol with minimal scoring
    const matchedProtocol: MatchedProtocol = {
      protocol: fallbackProtocol,
      matchScore: 50, // Medium confidence
      matchingReasons: ['Fallback general protocol'],
      adaptations: ['Adapted for general wellness'],
      concerns: []
    };

    // Create basic implementation plan
    const implementationPlan: ImplementationPlan = {
      startingProtocol: 'General Wellness Protocol',
      week1Actions: ['Begin herbal tea daily', 'Start nutrition improvements'],
      week2Actions: ['Continue herbal regimen', 'Add light exercise if appropriate'],
      monthlyReviews: ['Review progress after 4 weeks'],
      successMetrics: ['Improved energy', 'Better sleep quality'],
      adjustmentTriggers: ['No improvement after 2 weeks']
    };

    // Create monitoring plan
    const monitoringPlan: MonitoringPlan = {
      dailyTracking: ['Energy levels', 'Sleep quality'],
      weeklyAssessments: ['Overall wellbeing'],
      monthlyEvaluations: ['Progress review'],
      alertConditions: ['Worsening symptoms', 'New symptoms'],
      emergencyContacts: false
    };

    // Create cost optimization
    const costOptimization: CostOptimization = {
      totalEstimatedCost: 500,
      sharedResources: ['Herbs can be used for multiple purposes'],
      bulkPurchaseOptions: ['Buy herbs in bulk for cost savings'],
      alternatives: [{
        description: 'Budget option with fewer components',
        savings: 200,
        tradeoffs: ['Potentially slower results']
      }]
    };

    // Return the fallback recommendation
    return {
      primaryProtocol: matchedProtocol,
      supportiveProtocols: [],
      combinationStrategy: {
        approach: 'sequential',
        phaseIntegration: [{
          phase: 1,
          protocols: ['General Wellness Protocol'],
          duration: '4 weeks',
          focusAreas: ['General wellness'],
          monitoring: ['Weekly self-assessment']
        }],
        interactionWarnings: [],
        costOptimization
      },
      overallConfidence: 0.5, // Medium confidence
      implementationPlan,
      monitoring: monitoringPlan
    };
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
