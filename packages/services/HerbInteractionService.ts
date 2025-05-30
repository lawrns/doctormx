/**
 * HerbInteractionService - Safety checker for herb-drug and herb-herb interactions
 * Critical safety feature for preventing dangerous combinations
 */

import { herbService } from './HerbService';
import { loggingService } from './LoggingService';
import type { Herb } from '@pkg/types';

interface DrugInteraction {
  drugName: string;
  interaction: 'major' | 'moderate' | 'minor';
  mechanism: string;
  effect: string;
  recommendation: string;
  evidence: 'clinical' | 'theoretical' | 'case_report';
}

interface HerbInteraction {
  herbId: string;
  herbName: string;
  interaction: 'major' | 'moderate' | 'minor';
  mechanism: string;
  effect: string;
  recommendation: string;
}

interface InteractionCheck {
  herbId: string;
  herbName: string;
  currentMedications: string[];
  otherHerbs: string[];
  patientConditions: string[];
  patientAge?: number;
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
}

interface InteractionResult {
  safe: boolean;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  drugInteractions: DrugInteraction[];
  herbInteractions: HerbInteraction[];
  contraindications: string[];
  warnings: string[];
  recommendations: string[];
  monitoring: string[];
}

export class HerbInteractionService {
  private static instance: HerbInteractionService;
  
  // Known drug interactions database
  private drugInteractions: Map<string, DrugInteraction[]> = new Map();
  
  // Herb-herb interaction database
  private herbInteractions: Map<string, HerbInteraction[]> = new Map();
  
  // Special population contraindications
  private specialPopulations: Map<string, string[]> = new Map();

  static getInstance(): HerbInteractionService {
    if (!HerbInteractionService.instance) {
      HerbInteractionService.instance = new HerbInteractionService();
      HerbInteractionService.instance.initializeInteractionDatabase();
    }
    return HerbInteractionService.instance;
  }

  /**
   * Check herb safety for a patient
   */
  async checkInteractions(check: InteractionCheck): Promise<InteractionResult> {
    const startTime = Date.now();
    
    try {
      loggingService.info('HerbInteractionService', 'Checking herb interactions', {
        herbName: check.herbName,
        medicationCount: check.currentMedications.length,
        herbCount: check.otherHerbs.length
      });

      // Get herb details
      const herb = await this.getHerbByName(check.herbName);
      if (!herb) {
        return this.createUnknownHerbResult(check.herbName);
      }

      // Check drug interactions
      const drugInteractions = this.checkDrugInteractions(herb, check.currentMedications);
      
      // Check herb-herb interactions
      const herbInteractions = this.checkHerbInteractions(herb, check.otherHerbs);
      
      // Check contraindications
      const contraindications = this.checkContraindications(herb, check);
      
      // Check special populations
      const specialWarnings = this.checkSpecialPopulations(herb, check);
      
      // Determine overall risk level
      const riskLevel = this.calculateRiskLevel(drugInteractions, herbInteractions, contraindications);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(
        herb, 
        drugInteractions, 
        herbInteractions, 
        contraindications,
        check
      );

      const result: InteractionResult = {
        safe: riskLevel !== 'critical' && riskLevel !== 'high',
        riskLevel,
        drugInteractions,
        herbInteractions,
        contraindications,
        warnings: [...specialWarnings, ...this.generateWarnings(herb, check)],
        recommendations,
        monitoring: this.generateMonitoring(herb, drugInteractions, check)
      };

      // Log safety event
      if (riskLevel === 'critical' || riskLevel === 'high') {
        loggingService.logMedicalEvent(
          'red_flag_detected',
          {
            herbName: check.herbName,
            riskLevel,
            interactionCount: drugInteractions.length + herbInteractions.length,
            contraindications: contraindications.length
          }
        );
      }

      const duration = Date.now() - startTime;
      loggingService.logPerformance('HerbInteractionService', 'checkInteractions', duration, {
        riskLevel,
        safe: result.safe
      });

      return result;

    } catch (error) {
      loggingService.error(
        'HerbInteractionService',
        'Error checking herb interactions',
        error instanceof Error ? error : new Error(String(error))
      );
      
      return this.createErrorResult(check.herbName);
    }
  }

  /**
   * Initialize interaction database with known interactions
   */
  private initializeInteractionDatabase(): void {
    // Curcuma (Turmeric) interactions
    this.drugInteractions.set('Curcuma longa', [
      {
        drugName: 'warfarina',
        interaction: 'major',
        mechanism: 'Increased bleeding risk due to antiplatelet effects',
        effect: 'Potentiation of anticoagulant effect',
        recommendation: 'Avoid combination or monitor INR closely',
        evidence: 'clinical'
      },
      {
        drugName: 'aspirina',
        interaction: 'moderate',
        mechanism: 'Additive antiplatelet effects',
        effect: 'Increased bleeding risk',
        recommendation: 'Use with caution, monitor for bleeding signs',
        evidence: 'theoretical'
      },
      {
        drugName: 'diabetes medications',
        interaction: 'moderate',
        mechanism: 'Additive glucose-lowering effects',
        effect: 'Risk of hypoglycemia',
        recommendation: 'Monitor blood glucose closely',
        evidence: 'clinical'
      }
    ]);

    // Ginger interactions
    this.drugInteractions.set('Zingiber officinale', [
      {
        drugName: 'anticoagulantes',
        interaction: 'moderate',
        mechanism: 'Inhibition of thromboxane synthesis',
        effect: 'Increased bleeding risk',
        recommendation: 'Monitor for bleeding, especially before surgery',
        evidence: 'clinical'
      },
      {
        drugName: 'antidiabéticos',
        interaction: 'minor',
        mechanism: 'Potential glucose-lowering effects',
        effect: 'Mild hypoglycemic risk',
        recommendation: 'Monitor blood glucose',
        evidence: 'theoretical'
      }
    ]);

    // Aloe vera interactions
    this.drugInteractions.set('Aloe vera', [
      {
        drugName: 'digoxina',
        interaction: 'major',
        mechanism: 'Potassium depletion increases digoxin toxicity',
        effect: 'Increased risk of cardiac arrhythmias',
        recommendation: 'Avoid combination',
        evidence: 'clinical'
      },
      {
        drugName: 'diuréticos',
        interaction: 'moderate',
        mechanism: 'Additive potassium loss',
        effect: 'Severe hypokalemia',
        recommendation: 'Monitor electrolytes closely',
        evidence: 'theoretical'
      }
    ]);

    // St. John's Wort (if included)
    this.drugInteractions.set('Hypericum perforatum', [
      {
        drugName: 'antidepresivos',
        interaction: 'major',
        mechanism: 'Serotonin syndrome risk',
        effect: 'Potentially life-threatening serotonin excess',
        recommendation: 'Avoid combination completely',
        evidence: 'clinical'
      },
      {
        drugName: 'anticonceptivos',
        interaction: 'major',
        mechanism: 'CYP3A4 induction reduces drug levels',
        effect: 'Contraceptive failure',
        recommendation: 'Use alternative contraception',
        evidence: 'clinical'
      }
    ]);

    // Herb-herb interactions
    this.herbInteractions.set('Curcuma longa', [
      {
        herbId: 'zingiber_officinale',
        herbName: 'jengibre',
        interaction: 'minor',
        mechanism: 'Additive anti-inflammatory effects',
        effect: 'Enhanced therapeutic effect, minor bleeding risk',
        recommendation: 'Generally safe combination, monitor for bleeding'
      }
    ]);

    // Special populations
    this.specialPopulations.set('pregnancy', [
      'Ruta chalepensis', // rue - abortifacient
      'Artemisia ludoviciana', // estafiate - uterine stimulant
      'Montanoa tomentosa', // zoapatle - labor inducing
      'Aloe vera' // internal use - uterine contractions
    ]);

    this.specialPopulations.set('breastfeeding', [
      'Ruta chalepensis',
      'Artemisia ludoviciana',
      'Casimiroa edulis' // zapote blanco - sedative
    ]);

    this.specialPopulations.set('children', [
      'Ruta chalepensis',
      'Artemisia ludoviciana',
      'Dysphania ambrosioides' // epazote - toxic in large doses
    ]);
  }

  /**
   * Get herb by name from service
   */
  private async getHerbByName(herbName: string): Promise<Herb | null> {
    try {
      const searchResult = await herbService.searchHerbs({ query: herbName });
      return searchResult.herbs.find(h => 
        h.commonNames.some(name => name.toLowerCase() === herbName.toLowerCase()) ||
        h.latinName.toLowerCase() === herbName.toLowerCase()
      ) || null;
    } catch (error) {
      loggingService.warn('HerbInteractionService', 'Could not fetch herb details', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Check drug interactions
   */
  private checkDrugInteractions(herb: Herb, medications: string[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    const herbInteractions = this.drugInteractions.get(herb.latinName) || [];
    
    for (const medication of medications) {
      const medLower = medication.toLowerCase();
      
      for (const interaction of herbInteractions) {
        if (medLower.includes(interaction.drugName.toLowerCase()) ||
            this.isInDrugClass(medLower, interaction.drugName)) {
          interactions.push(interaction);
        }
      }
    }

    return interactions;
  }

  /**
   * Check if medication belongs to a drug class
   */
  private isInDrugClass(medication: string, drugClass: string): boolean {
    const drugClasses = {
      'anticoagulantes': ['warfarina', 'heparina', 'rivaroxaban', 'apixaban'],
      'antidiabéticos': ['metformina', 'insulina', 'glibenclamida', 'sitagliptina'],
      'antidepresivos': ['sertralina', 'fluoxetina', 'paroxetina', 'escitalopram'],
      'anticonceptivos': ['etinilestradiol', 'levonorgestrel', 'noretisterona']
    };

    const classMembers = drugClasses[drugClass as keyof typeof drugClasses] || [];
    return classMembers.some(member => medication.includes(member));
  }

  /**
   * Check herb-herb interactions
   */
  private checkHerbInteractions(herb: Herb, otherHerbs: string[]): HerbInteraction[] {
    const interactions: HerbInteraction[] = [];
    const herbInteractions = this.herbInteractions.get(herb.latinName) || [];
    
    for (const otherHerb of otherHerbs) {
      for (const interaction of herbInteractions) {
        if (otherHerb.toLowerCase().includes(interaction.herbName.toLowerCase())) {
          interactions.push(interaction);
        }
      }
    }

    return interactions;
  }

  /**
   * Check contraindications from herb database
   */
  private checkContraindications(herb: Herb, check: InteractionCheck): string[] {
    const contraindications: string[] = [];
    
    // Check herb's built-in contraindications
    for (const contraindication of herb.contraindications) {
      const contrLower = contraindication.toLowerCase();
      
      // Check patient conditions
      for (const condition of check.patientConditions) {
        if (contrLower.includes(condition.toLowerCase())) {
          contraindications.push(`Contraindicado en ${condition}: ${contraindication}`);
        }
      }
      
      // Check medications
      for (const medication of check.currentMedications) {
        if (contrLower.includes(medication.toLowerCase())) {
          contraindications.push(`Contraindicado con ${medication}: ${contraindication}`);
        }
      }
    }

    return contraindications;
  }

  /**
   * Check special populations
   */
  private checkSpecialPopulations(herb: Herb, check: InteractionCheck): string[] {
    const warnings: string[] = [];
    
    if (check.isPregnant) {
      const pregnancyContraindicated = this.specialPopulations.get('pregnancy') || [];
      if (pregnancyContraindicated.includes(herb.latinName)) {
        warnings.push(`⚠️ CONTRAINDICADO en embarazo: ${herb.commonNames[0]} puede causar complicaciones durante el embarazo`);
      }
    }
    
    if (check.isBreastfeeding) {
      const breastfeedingContraindicated = this.specialPopulations.get('breastfeeding') || [];
      if (breastfeedingContraindicated.includes(herb.latinName)) {
        warnings.push(`⚠️ CONTRAINDICADO en lactancia: ${herb.commonNames[0]} puede afectar al bebé`);
      }
    }
    
    if (check.patientAge && check.patientAge < 18) {
      const childrenContraindicated = this.specialPopulations.get('children') || [];
      if (childrenContraindicated.includes(herb.latinName)) {
        warnings.push(`⚠️ CONTRAINDICADO en niños: ${herb.commonNames[0]} no es seguro para menores de edad`);
      }
    }

    return warnings;
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(
    drugInteractions: DrugInteraction[],
    herbInteractions: HerbInteraction[],
    contraindications: string[]
  ): 'low' | 'moderate' | 'high' | 'critical' {
    
    // Critical risk - major drug interactions or absolute contraindications
    if (drugInteractions.some(i => i.interaction === 'major') || 
        contraindications.some(c => c.includes('CONTRAINDICADO'))) {
      return 'critical';
    }
    
    // High risk - multiple moderate interactions
    if (drugInteractions.filter(i => i.interaction === 'moderate').length >= 2 ||
        herbInteractions.some(i => i.interaction === 'major')) {
      return 'high';
    }
    
    // Moderate risk - some interactions present
    if (drugInteractions.length > 0 || herbInteractions.length > 0 || contraindications.length > 0) {
      return 'moderate';
    }
    
    return 'low';
  }

  /**
   * Generate safety recommendations
   */
  private generateRecommendations(
    herb: Herb,
    drugInteractions: DrugInteraction[],
    herbInteractions: HerbInteraction[],
    contraindications: string[],
    check: InteractionCheck
  ): string[] {
    const recommendations: string[] = [];
    
    if (drugInteractions.some(i => i.interaction === 'major')) {
      recommendations.push('🚫 NO usar esta hierba con los medicamentos actuales');
      recommendations.push('💊 Consultar con médico antes de suspender medicamentos');
    } else if (drugInteractions.length > 0) {
      recommendations.push('⚠️ Usar con extrema precaución bajo supervisión médica');
      recommendations.push('📊 Monitorear signos vitales y síntomas regularmente');
    }

    if (contraindications.some(c => c.includes('CONTRAINDICADO'))) {
      recommendations.push('🚫 Contraindicación absoluta - buscar alternativas');
    }

    if (herbInteractions.length > 0) {
      recommendations.push('🌿 Revisar combinación de hierbas con profesional');
    }

    // General safety recommendations
    recommendations.push('📋 Informar a todos los profesionales de salud sobre uso de hierbas');
    recommendations.push('📱 Mantener lista actualizada de medicamentos y hierbas');
    
    if (check.patientAge && check.patientAge > 65) {
      recommendations.push('👴 Iniciar con dosis menores por mayor sensibilidad en adultos mayores');
    }

    return recommendations;
  }

  /**
   * Generate monitoring recommendations
   */
  private generateMonitoring(
    herb: Herb,
    drugInteractions: DrugInteraction[],
    check: InteractionCheck
  ): string[] {
    const monitoring: string[] = [];
    
    // Specific monitoring based on interactions
    if (drugInteractions.some(i => i.effect.includes('bleeding'))) {
      monitoring.push('🩸 Vigilar signos de sangrado (moretones, sangrado de encías)');
      monitoring.push('🏥 Suspender antes de cirugías o procedimientos');
    }
    
    if (drugInteractions.some(i => i.effect.includes('glucose') || i.effect.includes('hypoglycemia'))) {
      monitoring.push('📊 Monitorear niveles de glucosa en sangre más frecuentemente');
      monitoring.push('🍯 Tener disponible fuente de glucosa rápida');
    }
    
    if (drugInteractions.some(i => i.effect.includes('cardiac') || i.effect.includes('arrhythmia'))) {
      monitoring.push('💓 Vigilar ritmo cardíaco y signos de arritmias');
      monitoring.push('🏥 Buscar atención inmediata si hay palpitaciones');
    }

    // General monitoring
    monitoring.push('👀 Observar cualquier reacción adversa o síntoma nuevo');
    monitoring.push('📞 Contactar profesional de salud si aparecen efectos inesperados');

    return monitoring;
  }

  /**
   * Generate general warnings
   */
  private generateWarnings(herb: Herb, check: InteractionCheck): string[] {
    const warnings: string[] = [];
    
    if (herb.preparation.dosage && herb.preparation.dosage.length > 0) {
      warnings.push('📏 Respetar dosificaciones recomendadas - más no es mejor');
    }
    
    if (herb.contraindications.length > 0) {
      warnings.push('⚠️ Revisar contraindicaciones específicas de esta hierba');
    }
    
    warnings.push('🕒 Suspender al menos 2 semanas antes de cirugías programadas');
    warnings.push('🤱 Informar si está embarazada, amamantando o planea embarazarse');
    
    return warnings;
  }

  /**
   * Create result for unknown herb
   */
  private createUnknownHerbResult(herbName: string): InteractionResult {
    return {
      safe: false,
      riskLevel: 'moderate',
      drugInteractions: [],
      herbInteractions: [],
      contraindications: [`Hierba desconocida: ${herbName}`],
      warnings: [
        '❓ Información de seguridad no disponible para esta hierba',
        '🚫 No usar sin consultar con profesional de la salud',
        '📚 Buscar información confiable sobre esta hierba'
      ],
      recommendations: [
        'Consultar con herbolario certificado o médico integrativo',
        'Verificar identificación botánica correcta',
        'Buscar alternativas con mejor documentación de seguridad'
      ],
      monitoring: [
        'Vigilar cualquier reacción adversa',
        'Suspender inmediatamente si aparecen síntomas inusuales'
      ]
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(herbName: string): InteractionResult {
    return {
      safe: false,
      riskLevel: 'moderate',
      drugInteractions: [],
      herbInteractions: [],
      contraindications: [],
      warnings: [
        '⚠️ Error al verificar interacciones - proceder con precaución extrema',
        '🏥 Consultar con profesional de la salud antes de usar'
      ],
      recommendations: [
        'No usar hasta verificar seguridad',
        'Consultar con farmacéutico o médico',
        'Intentar verificación de interacciones nuevamente'
      ],
      monitoring: [
        'Vigilar cualquier síntoma o reacción',
        'Tener disponible número de emergencias médicas'
      ]
    };
  }

  /**
   * Batch check multiple herbs for interactions
   */
  async checkMultipleHerbs(
    herbNames: string[],
    medications: string[],
    conditions: string[],
    patientInfo?: {
      age?: number;
      isPregnant?: boolean;
      isBreastfeeding?: boolean;
    }
  ): Promise<{
    overall: 'safe' | 'caution' | 'dangerous';
    individual: Map<string, InteractionResult>;
    combinationWarnings: string[];
  }> {
    
    const results = new Map<string, InteractionResult>();
    const combinationWarnings: string[] = [];
    
    // Check each herb individually
    for (const herbName of herbNames) {
      const check: InteractionCheck = {
        herbId: '',
        herbName,
        currentMedications: medications,
        otherHerbs: herbNames.filter(h => h !== herbName),
        patientConditions: conditions,
        ...patientInfo
      };
      
      const result = await this.checkInteractions(check);
      results.set(herbName, result);
    }
    
    // Check for dangerous combinations
    if (herbNames.includes('Curcuma longa') && herbNames.includes('Zingiber officinale')) {
      if (medications.some(m => m.toLowerCase().includes('warfarina'))) {
        combinationWarnings.push('⚠️ PELIGRO: Combinación de cúrcuma + jengibre + anticoagulantes aumenta significativamente el riesgo de sangrado');
      }
    }
    
    // Determine overall safety
    const hasAnyDangerous = Array.from(results.values()).some(r => r.riskLevel === 'critical');
    const hasAnyHigh = Array.from(results.values()).some(r => r.riskLevel === 'high');
    
    const overall = hasAnyDangerous ? 'dangerous' : hasAnyHigh ? 'caution' : 'safe';
    
    return {
      overall,
      individual: results,
      combinationWarnings
    };
  }
}

export const herbInteractionService = HerbInteractionService.getInstance();