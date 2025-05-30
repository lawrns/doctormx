/**
 * ProtocolBuilderService - Phase 2 prep: Basic holistic treatment protocol generation
 * Builds multi-stage treatment plans combining herbs, lifestyle, and monitoring
 */

import { herbService } from './HerbService';
import type { 
  Protocol, 
  ProtocolStage, 
  HerbPrescription, 
  LifestyleRecommendation,
  RootCause 
} from '@pkg/types';

interface ProtocolBuilderInput {
  rootCauses: RootCause[];
  symptoms: string[];
  patientAge?: number;
  patientGender?: string;
  chronicConditions?: string[];
  currentMedications?: string[];
  constitution?: {
    method: 'ayurveda' | 'metabolic' | 'tcm';
    profile: Record<string, number>;
  };
}

interface ProtocolTemplate {
  condition: string;
  stages: {
    number: 1 | 2 | 3;
    title: string;
    duration: string;
    herbs: string[]; // Latin names
    lifestyle: LifestyleRecommendation[];
    metrics: string[];
  }[];
}

export class ProtocolBuilderService {
  private static instance: ProtocolBuilderService;
  private protocolTemplates: Map<string, ProtocolTemplate> = new Map();

  static getInstance(): ProtocolBuilderService {
    if (!ProtocolBuilderService.instance) {
      ProtocolBuilderService.instance = new ProtocolBuilderService();
      ProtocolBuilderService.instance.initializeTemplates();
    }
    return ProtocolBuilderService.instance;
  }

  /**
   * Build a holistic treatment protocol
   */
  async buildProtocol(input: ProtocolBuilderInput): Promise<Protocol> {
    const { rootCauses, symptoms, constitution } = input;
    
    // Determine primary condition to treat
    const primaryCondition = this.determinePrimaryCondition(rootCauses, symptoms);
    
    // Get base protocol template
    const template = this.getProtocolTemplate(primaryCondition);
    
    // Customize protocol based on constitution and individual factors
    const customizedStages = await this.customizeProtocol(template, input);
    
    // Generate protocol ID
    const protocolId = this.generateProtocolId();
    
    return {
      id: protocolId,
      diagnosisId: '', // Will be set by calling service
      stages: customizedStages,
      status: 'draft',
      constitutionalProfile: constitution ? JSON.stringify(constitution) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Initialize built-in protocol templates
   */
  private initializeTemplates(): void {
    // Digestive Issues Protocol
    this.protocolTemplates.set('digestive', {
      condition: 'digestive',
      stages: [
        {
          number: 1,
          title: 'Detoxificación y Calma',
          duration: '1-2 semanas',
          herbs: ['Matricaria chamomilla', 'Mentha piperita', 'Aloe vera'],
          lifestyle: [
            {
              category: 'diet',
              title: 'Dieta Antiinflamatoria',
              description: 'Eliminar alimentos procesados, azúcar refinada y alcohol. Aumentar vegetales cocidos y caldos.',
              frequency: 'diario',
              priority: 'high'
            },
            {
              category: 'stress',
              title: 'Técnicas de Respiración',
              description: 'Practicar respiración profunda antes de las comidas para activar el sistema parasimpático.',
              frequency: '3 veces al día',
              priority: 'medium'
            }
          ],
          metrics: ['dolor abdominal', 'digestión', 'evacuaciones']
        },
        {
          number: 2,
          title: 'Reparación y Fortalecimiento',
          duration: '2-4 semanas',
          herbs: ['Curcuma longa', 'Zingiber officinale', 'Psidium guajava'],
          lifestyle: [
            {
              category: 'diet',
              title: 'Introducción de Probióticos',
              description: 'Incorporar kéfir, yogurt natural y alimentos fermentados gradualmente.',
              frequency: 'diario',
              priority: 'high'
            },
            {
              category: 'exercise',
              title: 'Caminata Suave',
              description: 'Caminar 20-30 minutos después de las comidas principales.',
              frequency: 'diario',
              priority: 'medium'
            }
          ],
          metrics: ['energía', 'apetito', 'inflamación']
        },
        {
          number: 3,
          title: 'Mantenimiento y Prevención',
          duration: 'continuo',
          herbs: ['Hibiscus sabdariffa', 'Lippia graveolens'],
          lifestyle: [
            {
              category: 'diet',
              title: 'Alimentación Consciente',
              description: 'Mantener horarios regulares de comida y masticar lentamente.',
              frequency: 'diario',
              priority: 'high'
            }
          ],
          metrics: ['bienestar general', 'digestión']
        }
      ]
    });

    // Anxiety/Stress Protocol
    this.protocolTemplates.set('anxiety', {
      condition: 'anxiety',
      stages: [
        {
          number: 1,
          title: 'Estabilización del Sistema Nervioso',
          duration: '2-3 semanas',
          herbs: ['Matricaria chamomilla', 'Tilia mexicana', 'Casimiroa edulis'],
          lifestyle: [
            {
              category: 'sleep',
              title: 'Higiene del Sueño',
              description: 'Establecer rutina nocturna relajante, dormir 7-8 horas.',
              frequency: 'diario',
              priority: 'high'
            },
            {
              category: 'stress',
              title: 'Meditación Básica',
              description: 'Iniciar con 5-10 minutos de meditación o mindfulness.',
              frequency: 'diario',
              priority: 'high'
            }
          ],
          metrics: ['ansiedad', 'calidad del sueño', 'estrés percibido']
        },
        {
          number: 2,
          title: 'Fortalecimiento Adaptógeno',
          duration: '3-4 semanas',
          herbs: ['Rosmarinus officinalis', 'Turnera diffusa', 'Ocimum basilicum'],
          lifestyle: [
            {
              category: 'exercise',
              title: 'Yoga o Tai Chi',
              description: 'Práctica suave de ejercicios mente-cuerpo.',
              frequency: '3-4 veces por semana',
              priority: 'medium'
            },
            {
              category: 'stress',
              title: 'Journaling',
              description: 'Escribir pensamientos y emociones antes de dormir.',
              frequency: 'diario',
              priority: 'low'
            }
          ],
          metrics: ['estado de ánimo', 'energía', 'resistencia al estrés']
        }
      ]
    });

    // Pain/Inflammation Protocol
    this.protocolTemplates.set('pain', {
      condition: 'pain',
      stages: [
        {
          number: 1,
          title: 'Control Agudo del Dolor',
          duration: '1-2 semanas',
          herbs: ['Curcuma longa', 'Zingiber officinale', 'Heterotheca inuloides'],
          lifestyle: [
            {
              category: 'environment',
              title: 'Aplicación de Calor/Frío',
              description: 'Alternar compresas calientes y frías según el tipo de dolor.',
              frequency: '2-3 veces al día',
              priority: 'high'
            }
          ],
          metrics: ['intensidad del dolor', 'movilidad', 'sueño']
        },
        {
          number: 2,
          title: 'Reducción de Inflamación',
          duration: '2-4 semanas',
          herbs: ['Capsicum annuum', 'Sambucus canadensis', 'Urtica dioica'],
          lifestyle: [
            {
              category: 'diet',
              title: 'Dieta Antiinflamatoria',
              description: 'Aumentar omega-3, vegetales verdes, reducir alimentos pro-inflamatorios.',
              frequency: 'diario',
              priority: 'high'
            },
            {
              category: 'exercise',
              title: 'Movimiento Suave',
              description: 'Ejercicios de estiramiento y movilidad articular.',
              frequency: 'diario',
              priority: 'medium'
            }
          ],
          metrics: ['inflamación', 'rigidez matutina', 'función física']
        }
      ]
    });
  }

  /**
   * Determine primary condition from root causes and symptoms
   */
  private determinePrimaryCondition(rootCauses: RootCause[], symptoms: string[]): string {
    // Prioritize by severity and treatability with herbs
    const conditionPriority = ['emergency', 'pain', 'digestive', 'anxiety', 'respiratory'];
    
    // Check root causes first
    for (const cause of rootCauses) {
      const category = cause.category.toLowerCase();
      if (category.includes('digestive') || category.includes('gastro')) return 'digestive';
      if (category.includes('inflammatory')) return 'pain';
      if (category.includes('psychological')) return 'anxiety';
    }

    // Check symptoms
    const symptomText = symptoms.join(' ').toLowerCase();
    if (symptomText.includes('dolor') || symptomText.includes('pain')) return 'pain';
    if (symptomText.includes('estómago') || symptomText.includes('digestiv')) return 'digestive';
    if (symptomText.includes('ansiedad') || symptomText.includes('estrés')) return 'anxiety';
    
    // Default to digestive (most common)
    return 'digestive';
  }

  /**
   * Get protocol template by condition
   */
  private getProtocolTemplate(condition: string): ProtocolTemplate {
    return this.protocolTemplates.get(condition) || this.protocolTemplates.get('digestive')!;
  }

  /**
   * Customize protocol based on individual factors
   */
  private async customizeProtocol(
    template: ProtocolTemplate, 
    input: ProtocolBuilderInput
  ): Promise<ProtocolStage[]> {
    const stages: ProtocolStage[] = [];

    for (const templateStage of template.stages) {
      // Get herb prescriptions
      const herbPrescriptions = await this.buildHerbPrescriptions(
        templateStage.herbs, 
        input
      );

      // Customize lifestyle recommendations
      const customizedLifestyle = this.customizeLifestyle(
        templateStage.lifestyle, 
        input
      );

      stages.push({
        stage: templateStage.number,
        title: templateStage.title,
        description: `Etapa ${templateStage.number}: ${templateStage.title}`,
        duration: templateStage.duration,
        herbs: herbPrescriptions,
        lifestyle: customizedLifestyle,
        metrics: templateStage.metrics,
        completionCriteria: this.generateCompletionCriteria(templateStage),
        isCompleted: false
      });
    }

    return stages;
  }

  /**
   * Build herb prescriptions from latin names
   */
  private async buildHerbPrescriptions(
    herbNames: string[], 
    input: ProtocolBuilderInput
  ): Promise<HerbPrescription[]> {
    const prescriptions: HerbPrescription[] = [];

    try {
      const herbs = await herbService.getHerbsByNames(herbNames);
      
      for (const herb of herbs) {
        // Check contraindications
        if (this.checkContraindications(herb, input)) {
          continue; // Skip this herb
        }

        // Get dosage from herb preparation data
        const dosageInfo = herb.preparation.dosage?.[0];
        if (!dosageInfo) continue;

        prescriptions.push({
          herbId: herb.id,
          herbName: herb.commonNames[0] || herb.latinName,
          form: dosageInfo.form as any,
          dosage: dosageInfo.amount,
          frequency: dosageInfo.frequency,
          duration: dosageInfo.duration || 'según etapa',
          instructions: this.generateInstructions(herb, input),
          contraindications: herb.contraindications,
          notes: dosageInfo.notes
        });
      }
    } catch (error) {
      console.error('Error building herb prescriptions:', error);
    }

    return prescriptions;
  }

  /**
   * Check if herb has contraindications for this patient
   */
  private checkContraindications(herb: any, input: ProtocolBuilderInput): boolean {
    const { patientAge, chronicConditions = [], currentMedications = [] } = input;

    // Age-based contraindications
    if (patientAge && patientAge < 18) {
      const childContraindications = ['pregnancy', 'children', 'pediatric'];
      if (herb.contraindications.some((c: string) => 
        childContraindications.some(cc => c.toLowerCase().includes(cc))
      )) {
        return true;
      }
    }

    // Condition-based contraindications
    for (const condition of chronicConditions) {
      if (herb.contraindications.some((c: string) => 
        c.toLowerCase().includes(condition.toLowerCase())
      )) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate usage instructions
   */
  private generateInstructions(herb: any, input: ProtocolBuilderInput): string {
    let instructions = 'Preparar según indicaciones tradicionales. ';
    
    // Add constitutional modifications
    if (input.constitution?.method === 'ayurveda') {
      const { profile } = input.constitution;
      if (profile.vata > 0.5) {
        instructions += 'Tomar con alimentos calientes. ';
      } else if (profile.pitta > 0.5) {
        instructions += 'Tomar con temperatura ambiente. ';
      }
    }

    instructions += 'Suspender si aparecen efectos adversos y consultar con profesional de la salud.';
    
    return instructions;
  }

  /**
   * Customize lifestyle recommendations
   */
  private customizeLifestyle(
    lifestyle: LifestyleRecommendation[], 
    input: ProtocolBuilderInput
  ): LifestyleRecommendation[] {
    // For Phase 1, return as-is
    // In Phase 2, this will include constitutional customization
    return lifestyle.map(rec => ({
      ...rec,
      description: this.localizeRecommendation(rec.description, input)
    }));
  }

  /**
   * Localize recommendations for Mexican context
   */
  private localizeRecommendation(description: string, input: ProtocolBuilderInput): string {
    // Add Mexican-specific context
    return description
      .replace('yogurt natural', 'yogurt búlgaro o kéfir de agua')
      .replace('alimentos fermentados', 'tepache, kombucha o vegetales fermentados mexicanos');
  }

  /**
   * Generate completion criteria for a stage
   */
  private generateCompletionCriteria(templateStage: any): string[] {
    const criteria: string[] = [];
    
    criteria.push(`Completar ${templateStage.duration} de tratamiento`);
    criteria.push('Mejoría en síntomas principales');
    criteria.push('Sin efectos adversos significativos');
    
    if (templateStage.number === 1) {
      criteria.push('Estabilización de síntomas agudos');
    } else if (templateStage.number === 2) {
      criteria.push('Mejora sostenida en métricas clave');
    }

    return criteria;
  }

  /**
   * Generate unique protocol ID
   */
  private generateProtocolId(): string {
    return `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get available protocol templates (for admin interface)
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.protocolTemplates.keys());
  }

  /**
   * Add custom protocol template (for Phase 2 expert interface)
   */
  addProtocolTemplate(condition: string, template: ProtocolTemplate): void {
    this.protocolTemplates.set(condition, template);
  }

  /**
   * Estimate protocol duration
   */
  estimateProtocolDuration(condition: string): string {
    const template = this.protocolTemplates.get(condition);
    if (!template) return '4-8 semanas';

    const totalWeeks = template.stages.reduce((total, stage) => {
      const duration = stage.duration;
      if (duration.includes('semana')) {
        const weeks = parseInt(duration.match(/\d+/)?.[0] || '2');
        return total + weeks;
      }
      return total + 2; // Default 2 weeks per stage
    }, 0);

    return `${totalWeeks}-${totalWeeks + 2} semanas`;
  }
}

export const protocolBuilderService = ProtocolBuilderService.getInstance();