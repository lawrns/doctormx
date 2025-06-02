/**
 * IntelligentTreatmentEngine - Advanced treatment recommendation system
 *
 * This service combines image analysis results with comprehensive health databases
 * to generate personalized treatment protocols integrating modern and traditional medicine.
 */

import { loggingService } from './LoggingService';
import { HerbService } from './HerbService';
import { MexicanCulturalContextService } from './MexicanCulturalContextService';
import { ConstitutionalAnalysisService } from './ConstitutionalAnalysisService';
import { HerbInteractionService } from './HerbInteractionService';
import { ComprehensiveProtocolDatabase } from './ComprehensiveProtocolDatabase';
import {
  ComprehensiveAnalysisResult,
  HealthIndicator,
  TreatmentRecommendation
} from './ComprehensiveMedicalImageAnalyzer';

// Treatment Protocol Interfaces
export interface TreatmentProtocol {
  id: string;
  name: string;
  description: string;
  category: TreatmentCategory;
  condition: string[];
  constitution: ('vata' | 'pitta' | 'kapha' | 'all')[];
  duration: ProtocolDuration;
  phases: TreatmentPhase[];
  mexicanAdaptations: MexicanAdaptation[];
  safetyNotes: string[];
  contraindications: string[];
  successMetrics: SuccessMetric[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  culturalRelevance: number; // 0-100
}

export interface TreatmentPhase {
  phase: number;
  name: string;
  duration: string;
  goals: string[];
  herbs: HerbPrescription[];
  lifestyle: LifestyleRecommendation[];
  diet: DietaryRecommendation[];
  monitoring: MonitoringPoint[];
  milestones: string[];
}

export interface HerbPrescription {
  herbName: string;
  mexicanName: string;
  dosage: string;
  preparation: string;
  timing: string;
  duration: string;
  purpose: string;
  interactions: string[];
  contraindications: string[];
  localAvailability: LocalAvailability;
}

export interface LocalAvailability {
  markets: string[];
  pharmacies: string[];
  onlineStores: string[];
  substitutes: string[];
  avgCost: number;
  seasonal: boolean;
}

export interface LifestyleRecommendation {
  category: 'exercise' | 'sleep' | 'stress' | 'environment' | 'habits';
  recommendation: string;
  mexicanContext: string;
  frequency: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface DietaryRecommendation {
  category: 'foods_to_include' | 'foods_to_avoid' | 'meal_timing' | 'preparation';
  recommendation: string;
  mexicanFoods: string[];
  seasonalConsiderations: string;
  constitutionalNotes: string;
}

export interface MonitoringPoint {
  metric: string;
  frequency: string;
  method: string;
  targetRange: string;
  concernThresholds: string;
}

export interface SuccessMetric {
  metric: string;
  baseline: string;
  target: string;
  timeframe: string;
  measurement: string;
}

export interface MexicanAdaptation {
  aspect: string;
  adaptation: string;
  culturalContext: string;
  practicalTips: string[];
}

export interface PersonalizedTreatmentPlan {
  patientId: string;
  analysisId: string;
  createdAt: Date;
  protocol: TreatmentProtocol;
  personalizations: TreatmentPersonalization[];
  schedule: TreatmentSchedule;
  safetyAssessment: SafetyAssessment;
  culturalAdaptations: string[];
  estimatedCost: CostEstimate;
  followUpPlan: FollowUpPlan;
  emergencyGuidance: EmergencyGuidance;
}

export interface TreatmentPersonalization {
  aspect: string;
  standardRecommendation: string;
  personalizedRecommendation: string;
  reason: string;
  confidence: number;
}

export interface TreatmentSchedule {
  daily: DailySchedule[];
  weekly: WeeklySchedule[];
  monthly: MonthlySchedule[];
  milestones: ScheduledMilestone[];
}

export interface DailySchedule {
  time: string;
  activity: string;
  type: 'herb' | 'diet' | 'exercise' | 'monitoring';
  details: string;
  notes: string;
}

export interface WeeklySchedule {
  day: string;
  activities: string[];
  focus: string;
}

export interface MonthlySchedule {
  week: number;
  phase: string;
  goals: string[];
  assessments: string[];
}

export interface ScheduledMilestone {
  date: Date;
  milestone: string;
  assessmentType: string;
  expectedOutcome: string;
}

export interface SafetyAssessment {
  riskLevel: 'low' | 'moderate' | 'high';
  interactions: InteractionWarning[];
  contraindications: string[];
  monitoringRequired: string[];
  emergencySignals: string[];
}

export interface InteractionWarning {
  type: 'herb_drug' | 'herb_herb' | 'food_herb';
  severity: 'minor' | 'moderate' | 'major';
  interaction: string;
  recommendation: string;
}

export interface CostEstimate {
  total: number;
  breakdown: CostBreakdown[];
  alternatives: CostAlternative[];
  insuranceCoverage: string;
}

export interface CostBreakdown {
  category: string;
  item: string;
  cost: number;
  frequency: string;
  total: number;
}

export interface CostAlternative {
  original: string;
  alternative: string;
  costSaving: number;
  effectivenessRatio: number;
}

export interface FollowUpPlan {
  schedule: FollowUpAppointment[];
  selfMonitoring: SelfMonitoringPlan;
  progressTracking: ProgressTrackingPlan;
  adjustmentProtocol: AdjustmentProtocol;
}

export interface FollowUpAppointment {
  timeframe: string;
  type: 'virtual' | 'in_person' | 'self_assessment';
  purpose: string;
  assessments: string[];
  duration: string;
}

export interface SelfMonitoringPlan {
  dailyChecks: string[];
  weeklyAssessments: string[];
  monthlyMeasurements: string[];
  warningSignals: string[];
  emergencyProtocol: string;
}

export interface ProgressTrackingPlan {
  metrics: TrackingMetric[];
  tools: string[];
  frequency: string;
  reportingSchedule: string;
}

export interface TrackingMetric {
  name: string;
  method: string;
  frequency: string;
  target: string;
  improvementCriteria: string;
}

export interface AdjustmentProtocol {
  triggers: AdjustmentTrigger[];
  modifications: PossibleModification[];
  escalationCriteria: string[];
  alternativeProtocols: string[];
}

export interface AdjustmentTrigger {
  condition: string;
  threshold: string;
  action: string;
  timeframe: string;
}

export interface PossibleModification {
  scenario: string;
  modification: string;
  rationale: string;
  safetyNotes: string;
}

export interface EmergencyGuidance {
  redFlags: string[];
  immediateActions: string[];
  emergencyContacts: EmergencyContact[];
  hospitalGuidance: string;
  medicationInteractions: string[];
}

export interface EmergencyContact {
  type: 'primary_care' | 'specialist' | 'emergency' | 'poison_control';
  name: string;
  phone: string;
  availability: string;
  notes: string;
}

export type TreatmentCategory =
  | 'circulatory'
  | 'digestive'
  | 'respiratory'
  | 'nervous'
  | 'endocrine'
  | 'immune'
  | 'musculoskeletal'
  | 'integumentary'
  | 'urinary'
  | 'reproductive'
  | 'constitutional'
  | 'emotional_mental';

export type ProtocolDuration = '1_week' | '2_weeks' | '1_month' | '6_weeks' | '3_months' | '6_months' | 'ongoing';

/**
 * Intelligent Treatment Engine Service
 */
export class IntelligentTreatmentEngine {
  private static instance: IntelligentTreatmentEngine;
  private herbService: HerbService;
  private culturalService: MexicanCulturalContextService;
  private constitutionalService: ConstitutionalAnalysisService;
  private interactionService: HerbInteractionService;
  private treatmentProtocols: Map<string, TreatmentProtocol> = new Map();

  static getInstance(): IntelligentTreatmentEngine {
    if (!IntelligentTreatmentEngine.instance) {
      IntelligentTreatmentEngine.instance = new IntelligentTreatmentEngine();
      IntelligentTreatmentEngine.instance.initializeTreatmentDatabase();
    }
    return IntelligentTreatmentEngine.instance;
  }

  constructor() {
    this.herbService = HerbService.getInstance();
    this.culturalService = MexicanCulturalContextService.getInstance();
    this.constitutionalService = ConstitutionalAnalysisService.getInstance();
    this.interactionService = HerbInteractionService.getInstance();
  }

  /**
   * Generate comprehensive treatment plan from image analysis
   */
  async generateTreatmentPlan(
    analysis: ComprehensiveAnalysisResult,
    patientContext?: {
      age?: number;
      gender?: string;
      medicalHistory?: string[];
      currentMedications?: string[];
      allergies?: string[];
      preferences?: string[];
    }
  ): Promise<PersonalizedTreatmentPlan> {
    try {
      loggingService.info('IntelligentTreatmentEngine', 'Generating treatment plan', {
        analysisType: analysis.analysisType,
        primaryFindings: analysis.primaryFindings.length
      });

      // Validate input analysis
      if (!analysis || !analysis.primaryFindings || !analysis.constitutionalAssessment) {
        throw new Error('Invalid analysis data provided to treatment engine');
      }

      // Step 1: Identify appropriate treatment protocols
      const matchingProtocols = await this.findMatchingProtocols(analysis);

      // Step 2: Select best protocol based on analysis and context
      const selectedProtocol = await this.selectBestProtocol(matchingProtocols, analysis, patientContext);

      // Step 3: Personalize the protocol
      const personalizations = await this.personalizeProtocol(selectedProtocol, analysis, patientContext);

      // Step 4: Generate schedule
      const schedule = await this.generateTreatmentSchedule(selectedProtocol, personalizations);

      // Step 5: Safety assessment
      const safetyAssessment = await this.performSafetyAssessment(selectedProtocol, patientContext);

      // Step 6: Cultural adaptations (with error handling)
      let culturalAdaptations: string[] = [];
      try {
        culturalAdaptations = await this.applyCulturalAdaptations(selectedProtocol, analysis);
      } catch (culturalError) {
        loggingService.error('IntelligentTreatmentEngine', 'Cultural adaptations failed', culturalError as Error);
        culturalAdaptations = ['Standard protocol without cultural adaptations'];
      }

      // Step 7: Cost estimation
      const estimatedCost = await this.estimateTreatmentCost(selectedProtocol, personalizations);

      // Step 8: Follow-up plan
      const followUpPlan = await this.createFollowUpPlan(selectedProtocol, analysis);

      // Step 9: Emergency guidance
      const emergencyGuidance = await this.createEmergencyGuidance(selectedProtocol, safetyAssessment);

      const treatmentPlan: PersonalizedTreatmentPlan = {
        patientId: 'demo_patient_123',
        analysisId: analysis.analysisType + '_' + Date.now(),
        createdAt: new Date(),
        protocol: selectedProtocol,
        personalizations,
        schedule,
        safetyAssessment,
        culturalAdaptations,
        estimatedCost,
        followUpPlan,
        emergencyGuidance
      };

      loggingService.info('IntelligentTreatmentEngine', 'Treatment plan generated successfully', {
        protocolId: selectedProtocol.id,
        phases: selectedProtocol.phases.length,
        personalizations: personalizations.length
      });

      return treatmentPlan;

    } catch (error) {
      loggingService.error(
        'IntelligentTreatmentEngine',
        'Failed to generate treatment plan',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to generate treatment plan');
    }
  }

  /**
   * Find protocols matching the analysis findings
   */
  private async findMatchingProtocols(analysis: ComprehensiveAnalysisResult): Promise<TreatmentProtocol[]> {
    const matchingProtocols: TreatmentProtocol[] = [];

    loggingService.info('IntelligentTreatmentEngine', 'Finding matching protocols', {
      primaryFindings: analysis.primaryFindings.map(f => ({
        category: f.category,
        finding: f.finding,
        severity: f.severity
      })),
      constitution: analysis.constitutionalAssessment.ayurvedicType
    });

    for (const [_, protocol] of this.treatmentProtocols) {
      // Check if protocol addresses the primary findings
      const addressesFindings = analysis.primaryFindings.some(finding => {
        // Enhanced matching logic that checks both category and actual finding text
        const findingCategory = finding.category || '';
        const findingText = finding.finding || '';
        
        return protocol.condition.some(condition => {
          const conditionLower = condition.toLowerCase();
          const categoryLower = findingCategory.toLowerCase();
          const textLower = findingText.toLowerCase();

          // Check category match
          const categoryMatch = conditionLower.includes(categoryLower) ||
                               categoryLower.includes(conditionLower);
          
          // Check if finding text contains key condition terms
          const textMatch = this.findingContainsCondition(textLower, conditionLower);
          
          // Check for specific condition keywords in finding
          const conditionKeywords = this.extractConditionKeywords(textLower);
          const keywordMatch = conditionKeywords.some(keyword => 
            conditionLower.includes(keyword) || keyword.includes(conditionLower)
          );

          const matched = categoryMatch || textMatch || keywordMatch;
          
          if (matched) {
            loggingService.info('IntelligentTreatmentEngine', 'Protocol match found', {
              protocol: protocol.name,
              condition,
              finding: finding.finding,
              matchType: categoryMatch ? 'category' : textMatch ? 'text' : 'keyword'
            });
          }

          return matched;
        });
      });

      // Check constitutional compatibility
      const constitutionalMatch = protocol.constitution.includes('all') ||
        protocol.constitution.includes(analysis.constitutionalAssessment.ayurvedicType);

      if (addressesFindings && constitutionalMatch) {
        matchingProtocols.push(protocol);
      }
    }

    // If no specific matches found, include general protocols based on severity
    if (matchingProtocols.length === 0) {
      loggingService.warn('IntelligentTreatmentEngine', 'No specific protocol matches found, using severity-based selection');
      
      // Find protocols that match general categories or severity
      for (const [_, protocol] of this.treatmentProtocols) {
        if (protocol.category === 'constitutional' || 
            protocol.condition.includes('general_wellness') ||
            protocol.condition.includes('prevention')) {
          
          const severityMatch = this.protocolMatchesSeverity(protocol, analysis);
          const constitutionalMatch = protocol.constitution.includes('all') ||
            protocol.constitution.includes(analysis.constitutionalAssessment.ayurvedicType);
          
          if (severityMatch && constitutionalMatch) {
            matchingProtocols.push(protocol);
          }
        }
      }
    }

    // Sort by evidence level and cultural relevance
    return matchingProtocols.sort((a, b) => {
      const evidenceScore = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
      const aScore = evidenceScore[a.evidenceLevel] + (a.culturalRelevance / 100);
      const bScore = evidenceScore[b.evidenceLevel] + (b.culturalRelevance / 100);
      return bScore - aScore;
    });
  }

  /**
   * Check if finding text contains condition-related terms
   */
  private findingContainsCondition(findingText: string, condition: string): boolean {
    // Direct substring match
    if (findingText.includes(condition)) return true;
    
    // Check for related terms
    const conditionSynonyms: Record<string, string[]> = {
      'rosácea': ['rosacea', 'enrojecimiento facial', 'rojez facial'],
      'acné': ['acne', 'comedones', 'espinillas', 'puntos negros'],
      'dermatitis': ['inflamación cutánea', 'eccema', 'eczema'],
      'psoriasis': ['placas escamosas', 'descamación'],
      'melasma': ['manchas', 'hiperpigmentación', 'pigmentación'],
      'anemia': ['palidez', 'pálido', 'deficiencia hierro'],
      'estrés': ['stress', 'tensión', 'ansiedad', 'fatiga'],
      'circulación': ['circulatory', 'vascular', 'edema', 'hinchazón'],
      'digestivo': ['digestive', 'estómago', 'intestinal', 'gástrico'],
      'respiratorio': ['respiratory', 'congestión', 'mucosidad', 'respiración']
    };
    
    // Check if any synonym matches
    for (const [key, synonyms] of Object.entries(conditionSynonyms)) {
      if (condition.includes(key)) {
        return synonyms.some(synonym => findingText.includes(synonym));
      }
    }
    
    return false;
  }

  /**
   * Extract condition keywords from finding text
   */
  private extractConditionKeywords(findingText: string): string[] {
    const keywords: string[] = [];
    
    // Common medical conditions in Spanish
    const conditionPatterns = [
      'rosácea', 'acné', 'dermatitis', 'psoriasis', 'melasma',
      'anemia', 'deficiencia', 'infección', 'inflamación',
      'alergia', 'eccema', 'urticaria', 'vitiligo',
      'circulación', 'vascular', 'edema', 'várices',
      'digestivo', 'gástrico', 'intestinal', 'hepático',
      'respiratorio', 'congestión', 'asma', 'bronquitis',
      'estrés', 'ansiedad', 'fatiga', 'insomnio',
      'hormonal', 'tiroides', 'metabólico', 'diabetes'
    ];
    
    // Extract matching patterns
    conditionPatterns.forEach(pattern => {
      if (findingText.includes(pattern)) {
        keywords.push(pattern);
      }
    });
    
    // Extract from differential diagnosis format "condition - reasoning"
    const diagnosisMatch = findingText.match(/^([^-]+)\s*-/);
    if (diagnosisMatch) {
      keywords.push(diagnosisMatch[1].trim().toLowerCase());
    }
    
    return keywords;
  }

  /**
   * Check if protocol matches analysis severity
   */
  private protocolMatchesSeverity(protocol: TreatmentProtocol, analysis: ComprehensiveAnalysisResult): boolean {
    const severityLevel = this.calculateSeverityLevel(analysis);
    
    // Match protocol intensity to severity
    if (severityLevel === 'high' && protocol.condition.some(c => 
      c.includes('severe') || c.includes('urgent') || c.includes('intensive')
    )) {
      return true;
    }
    
    if (severityLevel === 'moderate' && protocol.condition.some(c => 
      c.includes('moderate') || c.includes('maintenance') || c.includes('support')
    )) {
      return true;
    }
    
    if (severityLevel === 'low' && protocol.condition.some(c => 
      c.includes('prevention') || c.includes('wellness') || c.includes('mild')
    )) {
      return true;
    }
    
    return false;
  }

  /**
   * Select the best protocol from matching options
   */
  private async selectBestProtocol(
    protocols: TreatmentProtocol[],
    analysis: ComprehensiveAnalysisResult,
    patientContext?: any
  ): Promise<TreatmentProtocol> {
    if (protocols.length === 0) {
      // Return default general wellness protocol
      return this.getDefaultProtocol(analysis);
    }

    // For now, return the first (highest scored) protocol
    // In a full implementation, this would use more sophisticated matching
    return protocols[0];
  }

  /**
   * Personalize protocol based on analysis and patient context
   */
  private async personalizeProtocol(
    protocol: TreatmentProtocol,
    analysis: ComprehensiveAnalysisResult,
    patientContext?: any
  ): Promise<TreatmentPersonalization[]> {
    const personalizations: TreatmentPersonalization[] = [];

    // Constitutional personalizations
    const constitution = analysis.constitutionalAssessment.ayurvedicType;

    if (constitution === 'vata') {
      personalizations.push({
        aspect: 'herb_preparation',
        standardRecommendation: 'Standard tea preparation',
        personalizedRecommendation: 'Prepare with warm milk or ghee for better absorption',
        reason: 'Vata constitution benefits from oily, warming preparations',
        confidence: 0.85
      });
    }

    // Age-based personalizations
    if (patientContext?.age) {
      if (patientContext.age > 65) {
        personalizations.push({
          aspect: 'dosage_adjustment',
          standardRecommendation: 'Standard adult dosage',
          personalizedRecommendation: 'Reduce initial dosage by 25% and monitor response',
          reason: 'Elderly patients may have increased sensitivity',
          confidence: 0.80
        });
      }
    }

    // Severity-based adjustments
    const severityLevel = this.calculateSeverityLevel(analysis);
    if (severityLevel === 'high') {
      personalizations.push({
        aspect: 'treatment_intensity',
        standardRecommendation: 'Standard protocol intensity',
        personalizedRecommendation: 'Increase treatment frequency and monitoring',
        reason: 'Higher severity findings require more intensive intervention',
        confidence: 0.90
      });
    }

    return personalizations;
  }

  /**
   * Generate detailed treatment schedule
   */
  private async generateTreatmentSchedule(
    protocol: TreatmentProtocol,
    personalizations: TreatmentPersonalization[]
  ): Promise<TreatmentSchedule> {
    const schedule: TreatmentSchedule = {
      daily: [],
      weekly: [],
      monthly: [],
      milestones: []
    };

    // Generate daily schedule from protocol phases
    for (const phase of protocol.phases) {
      for (const herb of phase.herbs) {
        schedule.daily.push({
          time: herb.timing,
          activity: `Take ${herb.mexicanName} (${herb.herbName})`,
          type: 'herb',
          details: `${herb.dosage} - ${herb.preparation}`,
          notes: herb.purpose
        });
      }

      for (const lifestyle of phase.lifestyle) {
        if (lifestyle.frequency.includes('daily')) {
          schedule.daily.push({
            time: 'flexible',
            activity: lifestyle.recommendation,
            type: 'exercise',
            details: lifestyle.mexicanContext,
            notes: `Importance: ${lifestyle.importance}`
          });
        }
      }
    }

    // Generate milestones
    const phaseLength = 14; // 2 weeks per phase
    protocol.phases.forEach((phase, index) => {
      const milestoneDate = new Date();
      milestoneDate.setDate(milestoneDate.getDate() + (index + 1) * phaseLength);

      schedule.milestones.push({
        date: milestoneDate,
        milestone: `Complete Phase ${phase.phase}: ${phase.name}`,
        assessmentType: 'self_assessment',
        expectedOutcome: phase.goals.join(', ')
      });
    });

    return schedule;
  }

  /**
   * Perform comprehensive safety assessment
   */
  private async performSafetyAssessment(
    protocol: TreatmentProtocol,
    patientContext?: any
  ): Promise<SafetyAssessment> {
    const interactions: InteractionWarning[] = [];
    const contraindications: string[] = [...protocol.contraindications];
    const monitoringRequired: string[] = [];
    const emergencySignals: string[] = [];

    // Check for herb interactions
    if (patientContext?.currentMedications) {
      for (const phase of protocol.phases) {
        for (const herb of phase.herbs) {
          for (const medication of patientContext.currentMedications) {
            try {
              const interactionCheck = await this.interactionService.checkInteractions({
                herbs: [herb.herbName],
                medications: [medication],
                conditions: [],
                age: patientContext.age,
                specialPopulations: []
              });

              for (const interaction of interactionCheck.interactions) {
                interactions.push({
                  type: 'herb_drug',
                  severity: interaction.severity as 'minor' | 'moderate' | 'major',
                  interaction: interaction.description,
                  recommendation: interaction.recommendation
                });
              }
            } catch (error) {
              // Log error but continue
              loggingService.error('IntelligentTreatmentEngine', 'Interaction check failed', error as Error);
            }
          }
        }
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (interactions.some(i => i.severity === 'major')) {
      riskLevel = 'high';
    } else if (interactions.some(i => i.severity === 'moderate') || contraindications.length > 0) {
      riskLevel = 'moderate';
    }

    // Add monitoring requirements based on herbs
    for (const phase of protocol.phases) {
      for (const herb of phase.herbs) {
        if (herb.herbName.includes('liver')) {
          monitoringRequired.push('Monthly liver function tests');
        }
        if (herb.herbName.includes('blood pressure')) {
          monitoringRequired.push('Weekly blood pressure monitoring');
        }
      }
    }

    // Standard emergency signals
    emergencySignals.push(
      'Severe allergic reactions (rash, difficulty breathing)',
      'Persistent nausea or vomiting',
      'Severe dizziness or fainting',
      'Unexpected severe symptoms',
      'Interaction with emergency medications'
    );

    return {
      riskLevel,
      interactions,
      contraindications,
      monitoringRequired,
      emergencySignals
    };
  }

  /**
   * Apply Mexican cultural adaptations
   */
  private async applyCulturalAdaptations(
    protocol: TreatmentProtocol,
    analysis: ComprehensiveAnalysisResult
  ): Promise<string[]> {
    const adaptations: string[] = [];

    // Get cultural context
    const culturalInfo = await this.culturalService.getCulturalContext('treatment_planning', 'general');

    adaptations.push(
      'Integrar con tradiciones familiares mexicanas de salud',
      'Considerar altitud y clima de México en dosificaciones',
      'Usar nombres mexicanos de plantas medicinales',
      'Adaptar horarios a rutinas mexicanas (desayuno, comida, cena)',
      'Incluir alimentos tradicionales mexicanos en recomendaciones dietéticas'
    );

    // Seasonal adaptations
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 9) { // Rainy season
      adaptations.push('Ajustar por temporada de lluvias - aumentar hierbas warming');
    } else {
      adaptations.push('Ajustar por temporada seca - incluir hierbas hidratantes');
    }

    return adaptations;
  }

  /**
   * Estimate treatment cost
   */
  private async estimateTreatmentCost(
    protocol: TreatmentProtocol,
    personalizations: TreatmentPersonalization[]
  ): Promise<CostEstimate> {
    const breakdown: CostBreakdown[] = [];
    let total = 0;

    // Calculate herb costs
    for (const phase of protocol.phases) {
      for (const herb of phase.herbs) {
        const monthlyCost = herb.localAvailability.avgCost || 150; // Default 150 MXN per month
        const phaseDurationMonths = this.calculatePhaseDurationMonths(phase.duration);
        const herbTotal = monthlyCost * phaseDurationMonths;

        breakdown.push({
          category: 'herbs',
          item: herb.mexicanName,
          cost: monthlyCost,
          frequency: 'monthly',
          total: herbTotal
        });

        total += herbTotal;
      }
    }

    // Add consultation costs
    breakdown.push({
      category: 'consultations',
      item: 'Follow-up consultations',
      cost: 500,
      frequency: 'per consultation',
      total: 1500 // 3 consultations estimated
    });
    total += 1500;

    // Add monitoring costs if required
    if (protocol.phases.some(p => p.monitoring.length > 0)) {
      breakdown.push({
        category: 'monitoring',
        item: 'Health monitoring and tests',
        cost: 800,
        frequency: 'as needed',
        total: 800
      });
      total += 800;
    }

    const alternatives: CostAlternative[] = [
      {
        original: 'Premium herbs',
        alternative: 'Generic/local market herbs',
        costSaving: total * 0.3,
        effectivenessRatio: 0.85
      },
      {
        original: 'Individual consultations',
        alternative: 'Group education sessions',
        costSaving: 1000,
        effectivenessRatio: 0.75
      }
    ];

    return {
      total,
      breakdown,
      alternatives,
      insuranceCoverage: 'Some herbs may be covered by Mexican social insurance plans'
    };
  }

  /**
   * Create follow-up plan
   */
  private async createFollowUpPlan(
    protocol: TreatmentProtocol,
    analysis: ComprehensiveAnalysisResult
  ): Promise<FollowUpPlan> {
    const schedule: FollowUpAppointment[] = [
      {
        timeframe: '1 week',
        type: 'virtual',
        purpose: 'Initial response assessment and side effect monitoring',
        assessments: ['symptom review', 'side effects', 'compliance'],
        duration: '15 minutes'
      },
      {
        timeframe: '1 month',
        type: 'virtual',
        purpose: 'Phase 1 completion and progress evaluation',
        assessments: ['objective measurements', 'subjective improvements', 'protocol adjustments'],
        duration: '30 minutes'
      },
      {
        timeframe: '3 months',
        type: 'in_person',
        purpose: 'Comprehensive reassessment and long-term planning',
        assessments: ['full constitutional analysis', 'treatment effectiveness', 'maintenance protocol'],
        duration: '60 minutes'
      }
    ];

    const selfMonitoring: SelfMonitoringPlan = {
      dailyChecks: [
        'Energy levels (1-10 scale)',
        'Sleep quality (1-10 scale)',
        'Digestive comfort',
        'Overall symptom severity'
      ],
      weeklyAssessments: [
        'Weight measurement',
        'Blood pressure (if indicated)',
        'Symptom photo documentation',
        'Treatment compliance review'
      ],
      monthlyMeasurements: [
        'Constitutional questionnaire',
        'Progress photos',
        'Comprehensive symptom review',
        'Quality of life assessment'
      ],
      warningSignals: [
        'Worsening of original symptoms',
        'New concerning symptoms',
        'Severe side effects',
        'Signs of allergic reactions'
      ],
      emergencyProtocol: 'Contact healthcare provider immediately for any severe reactions. Call 911 for medical emergencies.'
    };

    const progressTracking: ProgressTrackingPlan = {
      metrics: [
        {
          name: 'Primary symptom severity',
          method: 'Daily 1-10 scale rating',
          frequency: 'daily',
          target: '50% reduction by month 1',
          improvementCriteria: 'Consistent downward trend'
        },
        {
          name: 'Constitutional balance',
          method: 'Weekly questionnaire',
          frequency: 'weekly',
          target: 'Improved balance scores',
          improvementCriteria: 'Movement toward constitutional harmony'
        }
      ],
      tools: ['Mobile app tracking', 'Photo documentation', 'Symptom diary'],
      frequency: 'daily_weekly_monthly',
      reportingSchedule: 'Weekly summaries to practitioner'
    };

    const adjustmentProtocol: AdjustmentProtocol = {
      triggers: [
        {
          condition: 'No improvement after 2 weeks',
          threshold: 'Less than 20% symptom reduction',
          action: 'Increase dosage or modify protocol',
          timeframe: '2 weeks'
        },
        {
          condition: 'Side effects',
          threshold: 'Moderate to severe side effects',
          action: 'Reduce dosage or substitute herbs',
          timeframe: 'immediate'
        }
      ],
      modifications: [
        {
          scenario: 'Slow response',
          modification: 'Add synergistic herbs or increase frequency',
          rationale: 'Some individuals require higher doses or additional support',
          safetyNotes: 'Monitor for increased side effects'
        }
      ],
      escalationCriteria: [
        'No improvement after 1 month',
        'Worsening symptoms',
        'Severe side effects',
        'New concerning symptoms'
      ],
      alternativeProtocols: [
        'Western medical referral',
        'Alternative herbal protocol',
        'Combination therapy approach'
      ]
    };

    return {
      schedule,
      selfMonitoring,
      progressTracking,
      adjustmentProtocol
    };
  }

  /**
   * Create emergency guidance
   */
  private async createEmergencyGuidance(
    protocol: TreatmentProtocol,
    safetyAssessment: SafetyAssessment
  ): Promise<EmergencyGuidance> {
    const redFlags = [
      'Severe allergic reactions (hives, swelling, difficulty breathing)',
      'Persistent vomiting or inability to keep fluids down',
      'Severe abdominal pain',
      'Signs of liver problems (yellowing skin, dark urine)',
      'Irregular heartbeat or chest pain',
      'Severe dizziness or fainting',
      'Mental confusion or altered consciousness'
    ];

    const immediateActions = [
      'Stop all herbal treatments immediately',
      'Call emergency services (911) for severe reactions',
      'Document symptoms and timing',
      'Bring herb containers/list to emergency room',
      'Contact prescribing practitioner as soon as possible'
    ];

    const emergencyContacts: EmergencyContact[] = [
      {
        type: 'emergency',
        name: 'Emergency Services',
        phone: '911',
        availability: '24/7',
        notes: 'For life-threatening emergencies'
      },
      {
        type: 'poison_control',
        name: 'Centro de Información Toxicológica',
        phone: '800-522-3000',
        availability: '24/7',
        notes: 'For poisoning concerns'
      },
      {
        type: 'primary_care',
        name: 'Dr. Simeon AI Support',
        phone: '+52-55-DOCTORMX',
        availability: '24/7',
        notes: 'AI-powered medical guidance'
      }
    ];

    return {
      redFlags,
      immediateActions,
      emergencyContacts,
      hospitalGuidance: 'Bring complete list of herbs and medications to hospital. Inform medical staff of all treatments being used.',
      medicationInteractions: safetyAssessment.interactions.map(i => i.interaction)
    };
  }

  /**
   * Calculate severity level from analysis
   */
  private calculateSeverityLevel(analysis: ComprehensiveAnalysisResult): 'low' | 'moderate' | 'high' {
    const highSeverityFindings = analysis.primaryFindings.filter(f => f.severity === 'high' || f.severity === 'critical');
    const moderateSeverityFindings = analysis.primaryFindings.filter(f => f.severity === 'moderate');

    if (highSeverityFindings.length > 0) return 'high';
    if (moderateSeverityFindings.length > 1) return 'moderate';
    return 'low';
  }

  /**
   * Calculate phase duration in months
   */
  private calculatePhaseDurationMonths(duration: string): number {
    if (duration.includes('week')) {
      const weeks = parseInt(duration.replace(/\D/g, ''));
      return weeks / 4;
    }
    if (duration.includes('month')) {
      return parseInt(duration.replace(/\D/g, ''));
    }
    return 1; // Default to 1 month
  }

  /**
   * Get default protocol for unmatched conditions
   */
  private getDefaultProtocol(analysis: ComprehensiveAnalysisResult): TreatmentProtocol {
    return {
      id: 'general_wellness_001',
      name: 'Protocolo General de Bienestar',
      description: 'Protocolo básico de medicina tradicional mexicana para bienestar general',
      category: 'constitutional',
      condition: ['general_wellness', 'prevention', 'constitutional_support'],
      constitution: ['all'],
      duration: '1_month',
      phases: [
        {
          phase: 1,
          name: 'Estabilización Constitucional',
          duration: '2 weeks',
          goals: ['Establish constitutional balance', 'Improve general vitality'],
          herbs: [
            {
              herbName: 'chamomile',
              mexicanName: 'manzanilla',
              dosage: '1 cup tea',
              preparation: 'Hot tea infusion',
              timing: 'Before bedtime',
              duration: '2 weeks',
              purpose: 'Relaxation and digestive support',
              interactions: [],
              contraindications: [],
              localAvailability: {
                markets: ['Any Mexican market'],
                pharmacies: ['Farmacias Guadalajara', 'Farmacias del Ahorro'],
                onlineStores: ['MercadoLibre', 'Amazon Mexico'],
                substitutes: ['té de tila', 'hierba buena'],
                avgCost: 50,
                seasonal: false
              }
            }
          ],
          lifestyle: [
            {
              category: 'sleep',
              recommendation: 'Maintain regular sleep schedule 10pm-6am',
              mexicanContext: 'Adaptar horarios mexicanos - siesta opcional 2-3pm',
              frequency: 'daily',
              importance: 'high'
            }
          ],
          diet: [
            {
              category: 'foods_to_include',
              recommendation: 'Include warming spices and fresh vegetables',
              mexicanFoods: ['chiles suaves', 'cilantro', 'lime', 'beans'],
              seasonalConsiderations: 'Adjust for local growing seasons',
              constitutionalNotes: 'General constitutional support'
            }
          ],
          monitoring: [
            {
              metric: 'Energy level',
              frequency: 'daily',
              method: '1-10 scale rating',
              targetRange: '6-8',
              concernThresholds: 'Below 4 or above 9'
            }
          ],
          milestones: ['Improved sleep quality', 'Stable energy levels']
        }
      ],
      mexicanAdaptations: [
        {
          aspect: 'Timing',
          adaptation: 'Adapt to Mexican meal times',
          culturalContext: 'Mexican family meal traditions',
          practicalTips: ['Take herbs with comida principal', 'Consider family preparation']
        }
      ],
      safetyNotes: ['Generally safe for most populations'],
      contraindications: ['Known allergies to listed herbs'],
      successMetrics: [
        {
          metric: 'Overall wellness score',
          baseline: 'Initial assessment',
          target: '20% improvement',
          timeframe: '1 month',
          measurement: 'Standardized wellness questionnaire'
        }
      ],
      evidenceLevel: 'B',
      culturalRelevance: 95
    };
  }

  /**
   * Initialize treatment protocol database - now uses ComprehensiveProtocolDatabase
   */
  private initializeTreatmentDatabase(): void {
    // Get the comprehensive protocol database instance
    const protocolDB = ComprehensiveProtocolDatabase.getInstance();
    
    // Convert comprehensive protocols to treatment engine format
    const comprehensiveProtocols = protocolDB.getAllProtocols();
    const protocols: TreatmentProtocol[] = [];

    // Convert each comprehensive protocol to treatment engine format
    for (const [id, comprehensiveProtocol] of comprehensiveProtocols) {
      const convertedProtocol: TreatmentProtocol = {
        id: comprehensiveProtocol.id,
        name: comprehensiveProtocol.name,
        description: comprehensiveProtocol.description,
        category: this.mapComprehensiveCategoryToEngine(comprehensiveProtocol.category),
        condition: comprehensiveProtocol.condition,
        constitution: this.mapComprehensiveConstitutionToEngine(comprehensiveProtocol.constitution),
        duration: this.mapComprehensiveDurationToEngine(comprehensiveProtocol.duration),
        phases: this.convertComprehensivePhasesToEngine(comprehensiveProtocol.phases),
        mexicanAdaptations: this.convertCulturalAdaptationsToEngine(comprehensiveProtocol.culturalAdaptations),
        safetyNotes: this.extractSafetyNotesFromProtocol(comprehensiveProtocol),
        contraindications: comprehensiveProtocol.contraindications,
        successMetrics: this.generateSuccessMetricsFromProtocol(comprehensiveProtocol),
        evidenceLevel: this.mapComprehensiveEvidenceToEngine(comprehensiveProtocol.evidenceLevel),
        culturalRelevance: 90 // High relevance for Mexican protocols
      };
      
      protocols.push(convertedProtocol);
    }

    // Store protocols in map
    protocols.forEach(protocol => {
      this.treatmentProtocols.set(protocol.id, protocol);
    });

    loggingService.info('IntelligentTreatmentEngine', 'Treatment database initialized with comprehensive protocols', {
      protocolCount: protocols.length,
      categories: protocols.map(p => p.category),
      protocolIds: protocols.map(p => p.id)
    });
  }

  /**
   * Get all available treatment protocols
   */
  getAllProtocols(): TreatmentProtocol[] {
    return Array.from(this.treatmentProtocols.values());
  }

  /**
   * Get protocol by ID
   */
  getProtocolById(id: string): TreatmentProtocol | undefined {
    return this.treatmentProtocols.get(id);
  }

  /**
   * Search protocols by condition
   */
  searchProtocolsByCondition(condition: string): TreatmentProtocol[] {
    return Array.from(this.treatmentProtocols.values()).filter(protocol =>
      protocol.condition.some(c =>
        c.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(c.toLowerCase())
      )
    );
  }

  /**
   * Conversion helper methods for protocol format compatibility
   */
  private mapComprehensiveCategoryToEngine(category: string): TreatmentCategory {
    const categoryMap: Record<string, TreatmentCategory> = {
      'dermatological': 'integumentary',
      'circulatory': 'circulatory',
      'structural': 'musculoskeletal',
      'respiratory': 'respiratory',
      'digestive': 'digestive',
      'nervous': 'nervous',
      'endocrine': 'endocrine',
      'immune': 'immune',
      'constitutional': 'constitutional',
      'emotional': 'emotional_mental',
      'metabolic': 'endocrine',
      'detoxification': 'digestive'
    };
    
    return categoryMap[category] || 'constitutional';
  }

  private mapComprehensiveConstitutionToEngine(constitution: string[]): ('vata' | 'pitta' | 'kapha' | 'all')[] {
    const constitutionMap: Record<string, 'vata' | 'pitta' | 'kapha' | 'all'> = {
      'vata': 'vata',
      'pitta': 'pitta',
      'kapha': 'kapha',
      'hot': 'pitta',
      'cold': 'vata',
      'damp': 'kapha',
      'dry': 'vata',
      'balanced': 'all',
      'all': 'all'
    };
    
    return constitution.map(c => constitutionMap[c] || 'all');
  }

  private mapComprehensiveDurationToEngine(duration: string): ProtocolDuration {
    return duration as ProtocolDuration;
  }

  private convertComprehensivePhasesToEngine(phases: any[]): TreatmentPhase[] {
    return phases.map(phase => ({
      phase: phase.phase,
      name: phase.name,
      duration: phase.duration,
      goals: phase.goals,
      herbs: phase.herbs.map((herb: any) => ({
        herbName: herb.herbName,
        mexicanName: herb.mexicanName,
        dosage: herb.dosage,
        preparation: herb.preparation,
        timing: herb.timing,
        duration: herb.duration,
        purpose: herb.purpose,
        interactions: herb.interactions,
        contraindications: herb.contraindications,
        localAvailability: {
          markets: herb.localAvailability.mexicanMarkets ? ['Mexican markets'] : [],
          pharmacies: herb.localAvailability.pharmacies ? ['Mexican pharmacies'] : [],
          onlineStores: ['MercadoLibre', 'Amazon Mexico'],
          substitutes: herb.localAvailability.alternatives || [],
          avgCost: 150, // Default cost
          seasonal: herb.localAvailability.seasonality !== 'Year-round'
        }
      })),
      lifestyle: phase.lifestyle.map((lifestyle: any) => ({
        category: lifestyle.category,
        recommendation: lifestyle.recommendation,
        mexicanContext: lifestyle.mexicanAdaptation,
        frequency: 'daily',
        importance: lifestyle.priority as 'low' | 'medium' | 'high' | 'critical'
      })),
      diet: phase.monitoring.map((monitor: any) => ({
        category: 'foods_to_include' as const,
        recommendation: monitor.parameter,
        mexicanFoods: ['Traditional Mexican foods'],
        seasonalConsiderations: 'Year-round',
        constitutionalNotes: 'General constitutional support'
      })),
      monitoring: phase.monitoring.map((monitor: any) => ({
        metric: monitor.parameter,
        frequency: monitor.frequency,
        method: monitor.method,
        targetRange: monitor.targetRange,
        concernThresholds: monitor.alertConditions.join(', ')
      })),
      milestones: phase.milestones?.map((milestone: any) => milestone.milestone) || []
    }));
  }

  private convertCulturalAdaptationsToEngine(adaptations: any[]): MexicanAdaptation[] {
    return adaptations.map(adaptation => ({
      aspect: adaptation.aspect,
      adaptation: adaptation.adaptationStrategy,
      culturalContext: adaptation.mexicanContext,
      practicalTips: adaptation.culturalConsiderations
    }));
  }

  private extractSafetyNotesFromProtocol(protocol: any): string[] {
    return [
      'Monitor for individual sensitivities',
      'Start with lower doses and increase gradually',
      'Consult healthcare provider if symptoms worsen'
    ];
  }

  private generateSuccessMetricsFromProtocol(protocol: any): SuccessMetric[] {
    return [
      {
        metric: 'Overall improvement score',
        baseline: 'Initial assessment',
        target: '50% improvement',
        timeframe: protocol.duration.replace('_', ' '),
        measurement: 'Patient-reported outcome measures'
      }
    ];
  }

  private mapComprehensiveEvidenceToEngine(evidence: string): 'A' | 'B' | 'C' | 'D' {
    const evidenceMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {
      'A': 'A',
      'B': 'B',
      'C': 'C',
      'Traditional': 'D'
    };
    
    return evidenceMap[evidence] || 'C';
  }
}

export const intelligentTreatmentEngine = IntelligentTreatmentEngine.getInstance();