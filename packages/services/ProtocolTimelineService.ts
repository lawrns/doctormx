/**
 * ProtocolTimelineService - Treatment protocol timeline management
 * Creates and manages structured treatment timelines with herbs, lifestyle, and milestones
 */

import { loggingService } from './LoggingService';
import { herbService } from './HerbService';
import { mexicanCulturalContextService } from './MexicanCulturalContextService';

interface ProtocolPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  startDay: number;
  endDay: number;
  objectives: string[];
  expectedOutcomes: string[];
}

interface ProtocolAction {
  id: string;
  type: 'herb' | 'lifestyle' | 'diet' | 'exercise' | 'monitoring' | 'milestone';
  title: string;
  description: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed' | 'once';
  dosage?: string;
  instructions: string;
  startDay: number;
  endDay?: number; // undefined for ongoing actions
  phaseId: string;
  priority: 'high' | 'medium' | 'low';
  mexicanContext?: string;
  safetyNotes?: string[];
}

interface ProtocolMilestone {
  id: string;
  title: string;
  description: string;
  targetDay: number;
  type: 'assessment' | 'goal' | 'adjustment' | 'completion';
  criteria: string[];
  achieved: boolean;
  achievedDate?: Date;
  notes?: string;
}

interface ProtocolTimeline {
  id: string;
  userId: string;
  name: string;
  description: string;
  condition: string;
  constitution?: 'vata' | 'pitta' | 'kapha';
  totalDuration: number; // days
  phases: ProtocolPhase[];
  actions: ProtocolAction[];
  milestones: ProtocolMilestone[];
  createdDate: Date;
  startDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
  culturalAdaptations: string[];
}

interface TimelineDay {
  day: number;
  date: Date;
  phase: ProtocolPhase;
  actions: ProtocolAction[];
  milestones: ProtocolMilestone[];
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export class ProtocolTimelineService {
  private static instance: ProtocolTimelineService;
  
  // Mock data storage (in production, this would connect to database)
  private protocolTimelines: Map<string, ProtocolTimeline[]> = new Map();
  
  // Protocol templates
  private protocolTemplates: Map<string, Omit<ProtocolTimeline, 'id' | 'userId' | 'createdDate' | 'startDate' | 'status'>> = new Map();

  static getInstance(): ProtocolTimelineService {
    if (!ProtocolTimelineService.instance) {
      ProtocolTimelineService.instance = new ProtocolTimelineService();
      ProtocolTimelineService.instance.initializeTemplates();
      ProtocolTimelineService.instance.initializeMockData();
    }
    return ProtocolTimelineService.instance;
  }

  /**
   * Create a new protocol timeline
   */
  async createProtocolTimeline(
    userId: string,
    templateId: string,
    customizations?: {
      constitution?: 'vata' | 'pitta' | 'kapha';
      condition?: string;
      preferences?: string[];
    }
  ): Promise<string> {
    try {
      const template = this.protocolTemplates.get(templateId);
      if (!template) {
        throw new Error('Protocol template not found');
      }

      const timeline: ProtocolTimeline = {
        ...template,
        id: `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        condition: customizations?.condition || template.condition,
        constitution: customizations?.constitution,
        createdDate: new Date(),
        status: 'draft'
      };

      // Apply constitutional customizations
      if (customizations?.constitution) {
        timeline.actions = await this.customizeActionsForConstitution(timeline.actions, customizations.constitution);
        timeline.culturalAdaptations = this.addConstitutionalAdaptations(timeline.culturalAdaptations, customizations.constitution);
      }

      const userTimelines = this.protocolTimelines.get(userId) || [];
      userTimelines.push(timeline);
      this.protocolTimelines.set(userId, userTimelines);

      loggingService.info('ProtocolTimelineService', 'Protocol timeline created', {
        userId,
        templateId,
        timelineId: timeline.id,
        constitution: customizations?.constitution
      });

      return timeline.id;

    } catch (error) {
      loggingService.error(
        'ProtocolTimelineService',
        'Failed to create protocol timeline',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to create protocol timeline');
    }
  }

  /**
   * Get user's protocol timelines
   */
  getUserTimelines(userId: string): ProtocolTimeline[] {
    return this.protocolTimelines.get(userId) || [];
  }

  /**
   * Get specific timeline
   */
  getTimeline(userId: string, timelineId: string): ProtocolTimeline | null {
    const userTimelines = this.protocolTimelines.get(userId) || [];
    return userTimelines.find(t => t.id === timelineId) || null;
  }

  /**
   * Start a protocol timeline
   */
  async startTimeline(userId: string, timelineId: string): Promise<boolean> {
    try {
      const timeline = this.getTimeline(userId, timelineId);
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      timeline.startDate = new Date();
      timeline.status = 'active';

      loggingService.info('ProtocolTimelineService', 'Protocol timeline started', {
        userId,
        timelineId,
        startDate: timeline.startDate
      });

      // Log medical event
      loggingService.logMedicalEvent(
        'protocol_started',
        {
          timelineId,
          condition: timeline.condition,
          constitution: timeline.constitution,
          totalDuration: timeline.totalDuration
        },
        { userId }
      );

      return true;

    } catch (error) {
      loggingService.error(
        'ProtocolTimelineService',
        'Failed to start timeline',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Get timeline view for specific day
   */
  getTimelineDay(userId: string, timelineId: string, dayNumber: number): TimelineDay | null {
    const timeline = this.getTimeline(userId, timelineId);
    if (!timeline || !timeline.startDate) {
      return null;
    }

    const dayDate = new Date(timeline.startDate.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000);
    const today = new Date();
    const todayDay = Math.floor((today.getTime() - timeline.startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    // Find current phase
    const phase = timeline.phases.find(p => dayNumber >= p.startDay && dayNumber <= p.endDay);
    if (!phase) {
      return null;
    }

    // Get actions for this day
    const dayActions = timeline.actions.filter(action => {
      const actionStart = action.startDay;
      const actionEnd = action.endDay || timeline.totalDuration;
      return dayNumber >= actionStart && dayNumber <= actionEnd;
    });

    // Get milestones for this day
    const dayMilestones = timeline.milestones.filter(m => m.targetDay === dayNumber);

    return {
      day: dayNumber,
      date: dayDate,
      phase,
      actions: dayActions,
      milestones: dayMilestones,
      isToday: dayNumber === todayDay,
      isPast: dayNumber < todayDay,
      isFuture: dayNumber > todayDay
    };
  }

  /**
   * Get timeline overview for visualization
   */
  getTimelineOverview(userId: string, timelineId: string): {
    timeline: ProtocolTimeline;
    currentDay?: number;
    currentPhase?: ProtocolPhase;
    completedMilestones: number;
    totalMilestones: number;
    daysRemaining?: number;
    progressPercentage: number;
  } | null {
    const timeline = this.getTimeline(userId, timelineId);
    if (!timeline) {
      return null;
    }

    let currentDay: number | undefined;
    let currentPhase: ProtocolPhase | undefined;
    let daysRemaining: number | undefined;

    if (timeline.startDate && timeline.status === 'active') {
      const today = new Date();
      currentDay = Math.floor((today.getTime() - timeline.startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      currentPhase = timeline.phases.find(p => currentDay && currentDay >= p.startDay && currentDay <= p.endDay);
      daysRemaining = Math.max(0, timeline.totalDuration - (currentDay - 1));
    }

    const completedMilestones = timeline.milestones.filter(m => m.achieved).length;
    const totalMilestones = timeline.milestones.length;
    
    const progressPercentage = currentDay ? 
      Math.min(100, (currentDay / timeline.totalDuration) * 100) : 0;

    return {
      timeline,
      currentDay,
      currentPhase,
      completedMilestones,
      totalMilestones,
      daysRemaining,
      progressPercentage
    };
  }

  /**
   * Mark milestone as achieved
   */
  async achieveMilestone(userId: string, timelineId: string, milestoneId: string, notes?: string): Promise<boolean> {
    try {
      const timeline = this.getTimeline(userId, timelineId);
      if (!timeline) {
        throw new Error('Timeline not found');
      }

      const milestone = timeline.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      milestone.achieved = true;
      milestone.achievedDate = new Date();
      milestone.notes = notes;

      loggingService.info('ProtocolTimelineService', 'Milestone achieved', {
        userId,
        timelineId,
        milestoneId,
        milestoneTitle: milestone.title
      });

      return true;

    } catch (error) {
      loggingService.error(
        'ProtocolTimelineService',
        'Failed to achieve milestone',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Get available protocol templates
   */
  getProtocolTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    condition: string;
    duration: number;
    phases: number;
  }> {
    return Array.from(this.protocolTemplates.entries()).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      condition: template.condition,
      duration: template.totalDuration,
      phases: template.phases.length
    }));
  }

  /**
   * Initialize protocol templates
   */
  private initializeTemplates(): void {
    // Digestive Health Protocol
    this.protocolTemplates.set('digestive_health', {
      name: 'Protocolo de Salud Digestiva',
      description: 'Plan integral de 6 semanas para mejorar la digestión con hierbas mexicanas y cambios de estilo de vida',
      condition: 'Problemas digestivos',
      totalDuration: 42, // 6 weeks
      phases: [
        {
          id: 'detox',
          name: 'Desintoxicación Suave',
          description: 'Preparación del sistema digestivo',
          duration: 7,
          startDay: 1,
          endDay: 7,
          objectives: ['Limpiar el sistema digestivo', 'Reducir inflamación'],
          expectedOutcomes: ['Menos hinchazón', 'Mejor evacuaciones']
        },
        {
          id: 'healing',
          name: 'Sanación Activa',
          description: 'Reparación de la mucosa intestinal',
          duration: 21,
          startDay: 8,
          endDay: 28,
          objectives: ['Sanar mucosa intestinal', 'Fortalecer digestión'],
          expectedOutcomes: ['Digestión más eficiente', 'Menos molestias']
        },
        {
          id: 'maintenance',
          name: 'Mantenimiento',
          description: 'Consolidación de hábitos saludables',
          duration: 14,
          startDay: 29,
          endDay: 42,
          objectives: ['Mantener mejoras', 'Establecer rutina'],
          expectedOutcomes: ['Digestión estable', 'Hábitos consolidados']
        }
      ],
      actions: [
        {
          id: 'manzanilla_tea',
          type: 'herb',
          title: 'Té de Manzanilla',
          description: 'Infusión calmante para el sistema digestivo',
          frequency: 'twice_daily',
          dosage: '1 taza (250ml)',
          instructions: 'Tomar después del desayuno y la cena',
          startDay: 1,
          endDay: 42,
          phaseId: 'detox',
          priority: 'high',
          mexicanContext: 'La manzanilla es ampliamente disponible en mercados mexicanos',
          safetyNotes: ['Evitar si hay alergia a las asteráceas']
        },
        {
          id: 'diet_elimination',
          type: 'diet',
          title: 'Eliminación de Irritantes',
          description: 'Evitar alimentos que irritan el sistema digestivo',
          frequency: 'daily',
          instructions: 'Eliminar: picantes excesivos, alcohol, comida procesada',
          startDay: 1,
          endDay: 14,
          phaseId: 'detox',
          priority: 'high',
          mexicanContext: 'Moderar chiles y especias durante la fase inicial'
        },
        {
          id: 'probiotics',
          type: 'lifestyle',
          title: 'Alimentos Fermentados',
          description: 'Incorporar probióticos naturales',
          frequency: 'daily',
          instructions: 'Incluir: kéfir, yogur natural, tepache (moderado)',
          startDay: 8,
          endDay: 42,
          phaseId: 'healing',
          priority: 'medium',
          mexicanContext: 'El tepache tradicional es una excelente fuente de probióticos'
        },
        {
          id: 'milestone_week1',
          type: 'milestone',
          title: 'Evaluación Semana 1',
          description: 'Revisar síntomas y adaptaciones necesarias',
          frequency: 'once',
          instructions: 'Evaluar hinchazón, evacuaciones, y tolerancia general',
          startDay: 7,
          phaseId: 'detox',
          priority: 'high'
        }
      ],
      milestones: [
        {
          id: 'week1_assessment',
          title: 'Evaluación Primera Semana',
          description: 'Revisión de progreso inicial',
          targetDay: 7,
          type: 'assessment',
          criteria: ['Reducción de hinchazón', 'Mejor evacuaciones', 'Tolerancia a hierbas'],
          achieved: false
        },
        {
          id: 'week3_improvement',
          title: 'Mejora Significativa',
          description: 'Objetivos de mejora a 3 semanas',
          targetDay: 21,
          type: 'goal',
          criteria: ['50% menos síntomas', 'Digestión regular', 'Energía mejorada'],
          achieved: false
        },
        {
          id: 'completion',
          title: 'Protocolo Completado',
          description: 'Finalización exitosa del protocolo',
          targetDay: 42,
          type: 'completion',
          criteria: ['Sistema digestivo estable', 'Hábitos establecidos', 'Conocimiento adquirido'],
          achieved: false
        }
      ],
      culturalAdaptations: [
        'Adaptado a ingredientes disponibles en México',
        'Considera horarios de comida mexicanos',
        'Integra medicina tradicional con enfoques modernos',
        'Respeta preferencias alimentarias culturales'
      ]
    });

    // Anxiety Management Protocol
    this.protocolTemplates.set('anxiety_management', {
      name: 'Protocolo de Manejo de Ansiedad',
      description: 'Plan de 4 semanas para reducir ansiedad con hierbas calmantes y técnicas de relajación',
      condition: 'Ansiedad',
      totalDuration: 28, // 4 weeks
      phases: [
        {
          id: 'stabilization',
          name: 'Estabilización',
          description: 'Calmar el sistema nervioso',
          duration: 7,
          startDay: 1,
          endDay: 7,
          objectives: ['Reducir síntomas agudos', 'Establecer rutina calmante'],
          expectedOutcomes: ['Menos episodios de ansiedad', 'Mejor sueño']
        },
        {
          id: 'strengthening',
          name: 'Fortalecimiento',
          description: 'Fortalecer resiliencia mental',
          duration: 14,
          startDay: 8,
          endDay: 21,
          objectives: ['Mejorar tolerancia al estrés', 'Desarrollar herramientas'],
          expectedOutcomes: ['Mayor tranquilidad', 'Mejor manejo emocional']
        },
        {
          id: 'integration',
          name: 'Integración',
          description: 'Integrar herramientas en vida diaria',
          duration: 7,
          startDay: 22,
          endDay: 28,
          objectives: ['Automatizar técnicas', 'Mantener equilibrio'],
          expectedOutcomes: ['Estabilidad emocional', 'Confianza personal']
        }
      ],
      actions: [
        {
          id: 'tila_tea',
          type: 'herb',
          title: 'Té de Tila',
          description: 'Infusión calmante para reducir ansiedad',
          frequency: 'three_times_daily',
          dosage: '1 taza',
          instructions: 'Tomar por la mañana, tarde y antes de dormir',
          startDay: 1,
          endDay: 28,
          phaseId: 'stabilization',
          priority: 'high',
          mexicanContext: 'La tila es tradicional en México para calmar los nervios'
        },
        {
          id: 'breathing_exercise',
          type: 'lifestyle',
          title: 'Ejercicios de Respiración',
          description: 'Técnica 4-7-8 para calmar ansiedad',
          frequency: 'twice_daily',
          instructions: 'Inhalar 4 segundos, retener 7, exhalar 8. Repetir 4 veces',
          startDay: 1,
          endDay: 28,
          phaseId: 'stabilization',
          priority: 'high'
        }
      ],
      milestones: [
        {
          id: 'week1_calm',
          title: 'Primera Semana de Calma',
          description: 'Reducción inicial de síntomas',
          targetDay: 7,
          type: 'assessment',
          criteria: ['Menos episodios de ansiedad', 'Mejor calidad de sueño'],
          achieved: false
        },
        {
          id: 'completion_anxiety',
          title: 'Manejo Efectivo',
          description: 'Control efectivo de la ansiedad',
          targetDay: 28,
          type: 'completion',
          criteria: ['Ansiedad controlada', 'Herramientas interiorizadas'],
          achieved: false
        }
      ],
      culturalAdaptations: [
        'Integra plantas medicinales tradicionales mexicanas',
        'Considera factores de estrés culturales específicos',
        'Adapta horarios a rutinas familiares mexicanas'
      ]
    });
  }

  /**
   * Initialize mock data
   */
  private initializeMockData(): void {
    const demoUserId = 'demo_user_123';
    
    // Create a sample active timeline
    const activeTimeline: ProtocolTimeline = {
      id: 'timeline_demo_1',
      userId: demoUserId,
      name: 'Mi Protocolo Digestivo',
      description: 'Protocolo personalizado para mejorar digestión',
      condition: 'Problemas digestivos',
      constitution: 'pitta',
      totalDuration: 42,
      phases: this.protocolTemplates.get('digestive_health')!.phases,
      actions: this.protocolTemplates.get('digestive_health')!.actions,
      milestones: this.protocolTemplates.get('digestive_health')!.milestones,
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // started 5 days ago
      status: 'active',
      culturalAdaptations: this.protocolTemplates.get('digestive_health')!.culturalAdaptations
    };

    // Mark first milestone as achieved
    activeTimeline.milestones[0].achieved = true;
    activeTimeline.milestones[0].achievedDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    this.protocolTimelines.set(demoUserId, [activeTimeline]);
  }

  /**
   * Customize actions for constitution
   */
  private async customizeActionsForConstitution(
    actions: ProtocolAction[],
    constitution: 'vata' | 'pitta' | 'kapha'
  ): Promise<ProtocolAction[]> {
    const customizedActions = [...actions];

    // Add constitution-specific herbs
    const constitutionalHerbs = {
      vata: { herb: 'Ashwagandha', instructions: 'Para calmar el sistema nervioso Vata' },
      pitta: { herb: 'Sábila', instructions: 'Para enfriar el exceso de calor Pitta' },
      kapha: { herb: 'Jengibre', instructions: 'Para estimular la digestión Kapha' }
    };

    const constitutionalAction: ProtocolAction = {
      id: `constitutional_${constitution}`,
      type: 'herb',
      title: `Hierba Constitucional: ${constitutionalHerbs[constitution].herb}`,
      description: `Hierba específica para equilibrar ${constitution}`,
      frequency: 'daily',
      instructions: constitutionalHerbs[constitution].instructions,
      startDay: 1,
      endDay: 42,
      phaseId: 'healing',
      priority: 'medium',
      mexicanContext: `Recomendación específica para constitución ${constitution}`
    };

    customizedActions.push(constitutionalAction);
    return customizedActions;
  }

  /**
   * Add constitutional adaptations
   */
  private addConstitutionalAdaptations(adaptations: string[], constitution: 'vata' | 'pitta' | 'kapha'): string[] {
    const constitutionalAdaptations = {
      vata: 'Protocolo adaptado para constitución Vata: enfoque en rutina y calor',
      pitta: 'Protocolo adaptado para constitución Pitta: enfoque en frescura y moderación',
      kapha: 'Protocolo adaptado para constitución Kapha: enfoque en estimulación y movimiento'
    };

    return [...adaptations, constitutionalAdaptations[constitution]];
  }
}

export const protocolTimelineService = ProtocolTimelineService.getInstance();