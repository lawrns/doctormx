/**
 * ConstitutionalAnalysisService - Ayurvedic/metabolic constitutional typing
 * Personalizes herb and lifestyle recommendations based on individual constitution
 * Phase 2 preview implementation for holistic health assessment
 */

import { loggingService } from './LoggingService';
import { herbService } from './HerbService';
import { mexicanCulturalContextService } from './MexicanCulturalContextService';
import type { Herb } from '@pkg/types';

interface ConstitutionalQuestion {
  id: string;
  category: 'physical' | 'mental' | 'digestive' | 'sleep' | 'energy' | 'stress';
  question: string;
  answers: {
    option: string;
    constitution: 'vata' | 'pitta' | 'kapha';
    weight: number;
  }[];
}

interface ConstitutionalResponse {
  questionId: string;
  selectedAnswer: number;
}

interface ConstitutionalResult {
  primaryConstitution: 'vata' | 'pitta' | 'kapha';
  secondaryConstitution?: 'vata' | 'pitta' | 'kapha';
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  personalizedRecommendations: {
    herbs: string[];
    lifestyle: string[];
    diet: string[];
    exercise: string[];
    dailyRoutine: string[];
  };
  seasonalAdjustments: {
    current: string[];
    upcoming: string[];
  };
  mexicanContextAdaptations: string[];
  confidence: number;
}

interface ConstitutionalProfile {
  constitution: 'vata' | 'pitta' | 'kapha';
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  recommendations: {
    herbs: string[];
    lifestyle: string[];
    diet: string[];
    exercise: string[];
  };
}

export class ConstitutionalAnalysisService {
  private static instance: ConstitutionalAnalysisService;
  
  // Constitutional questionnaire
  private questionnaire: ConstitutionalQuestion[] = [];
  
  // Constitutional profiles database
  private constitutionalProfiles: Map<string, ConstitutionalProfile> = new Map();
  
  // Herb recommendations by constitution
  private constitutionalHerbs: Map<string, string[]> = new Map();

  static getInstance(): ConstitutionalAnalysisService {
    if (!ConstitutionalAnalysisService.instance) {
      ConstitutionalAnalysisService.instance = new ConstitutionalAnalysisService();
      ConstitutionalAnalysisService.instance.initializeQuestionnaire();
      ConstitutionalAnalysisService.instance.initializeProfiles();
    }
    return ConstitutionalAnalysisService.instance;
  }

  /**
   * Get the constitutional analysis questionnaire
   */
  getQuestionnaire(): ConstitutionalQuestion[] {
    loggingService.info('ConstitutionalAnalysis', 'Questionnaire requested', {
      questionCount: this.questionnaire.length
    });
    
    return this.questionnaire;
  }

  /**
   * Analyze constitutional type based on questionnaire responses
   */
  async analyzeConstitution(
    responses: ConstitutionalResponse[],
    patientInfo?: {
      age?: number;
      gender?: string;
      location?: string;
      currentConditions?: string[];
    }
  ): Promise<ConstitutionalResult> {
    const startTime = Date.now();
    
    try {
      loggingService.info('ConstitutionalAnalysis', 'Starting constitutional analysis', {
        responseCount: responses.length,
        patientAge: patientInfo?.age
      });

      // Calculate constitutional scores
      const scores = this.calculateScores(responses);
      
      // Determine primary and secondary constitutions
      const { primary, secondary } = this.determineConstitutions(scores);
      
      // Calculate percentages
      const total = scores.vata + scores.pitta + scores.kapha;
      const percentages = {
        vata: Math.round((scores.vata / total) * 100),
        pitta: Math.round((scores.pitta / total) * 100),
        kapha: Math.round((scores.kapha / total) * 100)
      };

      // Generate personalized recommendations
      const personalizedRecommendations = await this.generatePersonalizedRecommendations(
        primary,
        secondary,
        patientInfo
      );

      // Get seasonal adjustments
      const seasonalAdjustments = this.getSeasonalAdjustments(primary);

      // Get Mexican context adaptations
      const mexicanContextAdaptations = this.getMexicanContextAdaptations(
        primary,
        patientInfo?.location
      );

      // Calculate confidence based on clarity of results
      const confidence = this.calculateConfidence(percentages);

      const result: ConstitutionalResult = {
        primaryConstitution: primary,
        secondaryConstitution: secondary,
        scores,
        percentages,
        personalizedRecommendations,
        seasonalAdjustments,
        mexicanContextAdaptations,
        confidence
      };

      const duration = Date.now() - startTime;
      loggingService.logPerformance('ConstitutionalAnalysis', 'analyzeConstitution', duration, {
        primaryConstitution: primary,
        confidence
      });

      // Log medical event
      loggingService.logMedicalEvent(
        'constitutional_analysis',
        {
          primaryConstitution: primary,
          secondaryConstitution: secondary,
          confidence,
          responseCount: responses.length
        },
        patientInfo
      );

      return result;

    } catch (error) {
      loggingService.error(
        'ConstitutionalAnalysis',
        'Constitutional analysis failed',
        error instanceof Error ? error : new Error(String(error))
      );
      
      throw new Error('Failed to analyze constitutional type');
    }
  }

  /**
   * Get constitutional profile information
   */
  getConstitutionalProfile(constitution: 'vata' | 'pitta' | 'kapha'): ConstitutionalProfile | null {
    return this.constitutionalProfiles.get(constitution) || null;
  }

  /**
   * Get herbs recommended for specific constitution
   */
  async getConstitutionalHerbs(constitution: 'vata' | 'pitta' | 'kapha'): Promise<Herb[]> {
    try {
      const herbNames = this.constitutionalHerbs.get(constitution) || [];
      const herbs: Herb[] = [];

      for (const herbName of herbNames) {
        const searchResult = await herbService.searchHerbs({ query: herbName });
        const matchingHerb = searchResult.herbs.find(h => 
          h.commonNames.some(name => name.toLowerCase().includes(herbName.toLowerCase()))
        );
        if (matchingHerb) {
          herbs.push(matchingHerb);
        }
      }

      return herbs;
    } catch (error) {
      loggingService.warn('ConstitutionalAnalysis', 'Failed to fetch constitutional herbs', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Initialize the constitutional questionnaire
   */
  private initializeQuestionnaire(): void {
    this.questionnaire = [
      // Physical Characteristics
      {
        id: 'body_frame',
        category: 'physical',
        question: '¿Cómo describirías tu constitución corporal?',
        answers: [
          { option: 'Delgado/a, huesos prominentes, encuentro difícil ganar peso', constitution: 'vata', weight: 3 },
          { option: 'Constitución media, músculos definidos, peso estable', constitution: 'pitta', weight: 3 },
          { option: 'Constitución robusta, huesos grandes, gano peso fácilmente', constitution: 'kapha', weight: 3 }
        ]
      },
      {
        id: 'skin_type',
        category: 'physical',
        question: '¿Cómo es tu piel generalmente?',
        answers: [
          { option: 'Seca, áspera, se agrieta fácilmente', constitution: 'vata', weight: 2 },
          { option: 'Grasa, caliente, propensa a irritaciones y granitos', constitution: 'pitta', weight: 2 },
          { option: 'Grasa, suave, poros grandes, cicatriza bien', constitution: 'kapha', weight: 2 }
        ]
      },
      {
        id: 'hair_type',
        category: 'physical',
        question: '¿Cómo describirías tu cabello?',
        answers: [
          { option: 'Seco, quebradizo, rizado o ondulado', constitution: 'vata', weight: 2 },
          { option: 'Fino, graso, propenso a calvicie prematura o canas', constitution: 'pitta', weight: 2 },
          { option: 'Graso, grueso, abundante, brillante', constitution: 'kapha', weight: 2 }
        ]
      },

      // Digestive Patterns
      {
        id: 'appetite',
        category: 'digestive',
        question: '¿Cómo es tu apetito normalmente?',
        answers: [
          { option: 'Variable, a veces muy hambriento, a veces sin apetito', constitution: 'vata', weight: 3 },
          { option: 'Fuerte y regular, me molesto si no como a tiempo', constitution: 'pitta', weight: 3 },
          { option: 'Moderado pero consistente, puedo saltarme comidas sin problema', constitution: 'kapha', weight: 3 }
        ]
      },
      {
        id: 'digestion',
        category: 'digestive',
        question: '¿Cómo es tu digestión?',
        answers: [
          { option: 'Irregular, gases, estreñimiento, digestión lenta', constitution: 'vata', weight: 3 },
          { option: 'Fuerte, rápida, a veces acidez o diarrea', constitution: 'pitta', weight: 3 },
          { option: 'Lenta pero estable, pesadez después de comer', constitution: 'kapha', weight: 3 }
        ]
      },
      {
        id: 'food_preferences',
        category: 'digestive',
        question: '¿Qué tipos de alimentos prefieres?',
        answers: [
          { option: 'Comidas calientes, cremosas, dulces, me gustan las sopas', constitution: 'vata', weight: 2 },
          { option: 'Comidas frescas, ensaladas, bebidas frías, sabores intensos', constitution: 'pitta', weight: 2 },
          { option: 'Comidas picantes, amargas, me gustan las especias fuertes', constitution: 'kapha', weight: 2 }
        ]
      },

      // Energy and Sleep
      {
        id: 'energy_levels',
        category: 'energy',
        question: '¿Cómo son tus niveles de energía?',
        answers: [
          { option: 'Fluctuantes, ráfagas de energía seguidas de fatiga', constitution: 'vata', weight: 3 },
          { option: 'Moderada a alta, consistente durante el día', constitution: 'pitta', weight: 3 },
          { option: 'Estable pero lenta para arrancar en las mañanas', constitution: 'kapha', weight: 3 }
        ]
      },
      {
        id: 'sleep_pattern',
        category: 'sleep',
        question: '¿Cómo duermes normalmente?',
        answers: [
          { option: 'Ligero, me despierto fácilmente, mente activa en la noche', constitution: 'vata', weight: 3 },
          { option: 'Profundo pero corto, me despierto temprano y alerta', constitution: 'pitta', weight: 3 },
          { option: 'Profundo y largo, necesito muchas horas, difícil despertar', constitution: 'kapha', weight: 3 }
        ]
      },

      // Mental and Emotional
      {
        id: 'mental_activity',
        category: 'mental',
        question: '¿Cómo describirías tu actividad mental?',
        answers: [
          { option: 'Rápida, creativa, muchas ideas, mente inquieta', constitution: 'vata', weight: 3 },
          { option: 'Enfocada, analítica, buena para resolver problemas', constitution: 'pitta', weight: 3 },
          { option: 'Lenta pero estable, buena memoria a largo plazo', constitution: 'kapha', weight: 3 }
        ]
      },
      {
        id: 'stress_response',
        category: 'stress',
        question: '¿Cómo reaccionas al estrés?',
        answers: [
          { option: 'Ansiedad, preocupación, pensamientos acelerados', constitution: 'vata', weight: 3 },
          { option: 'Irritabilidad, impaciencia, enojo', constitution: 'pitta', weight: 3 },
          { option: 'Retraimiento, letargo, evito conflictos', constitution: 'kapha', weight: 3 }
        ]
      },
      {
        id: 'decision_making',
        category: 'mental',
        question: '¿Cómo tomas decisiones?',
        answers: [
          { option: 'Rápidamente pero cambio de opinión frecuentemente', constitution: 'vata', weight: 2 },
          { option: 'Después de analizar, pero una vez decidido soy firme', constitution: 'pitta', weight: 2 },
          { option: 'Lentamente, necesito tiempo para considerar todas las opciones', constitution: 'kapha', weight: 2 }
        ]
      },

      // Activity and Movement
      {
        id: 'activity_preference',
        category: 'physical',
        question: '¿Qué tipo de actividad física prefieres?',
        answers: [
          { option: 'Actividades variadas, yoga suave, caminatas', constitution: 'vata', weight: 2 },
          { option: 'Deportes competitivos, ejercicios intensos, natación', constitution: 'pitta', weight: 2 },
          { option: 'Actividades lentas y constantes, tai chi, ejercicios de resistencia', constitution: 'kapha', weight: 2 }
        ]
      },

      // Climate and Weather
      {
        id: 'weather_preference',
        category: 'physical',
        question: '¿Qué clima prefieres?',
        answers: [
          { option: 'Clima cálido y húmedo, no me gusta el frío ni el viento', constitution: 'vata', weight: 2 },
          { option: 'Clima fresco y seco, no me gusta el calor excesivo', constitution: 'pitta', weight: 2 },
          { option: 'Clima cálido y seco, no me gusta la humedad ni el frío', constitution: 'kapha', weight: 2 }
        ]
      }
    ];
  }

  /**
   * Initialize constitutional profiles
   */
  private initializeProfiles(): void {
    // Vata Constitution
    this.constitutionalProfiles.set('vata', {
      constitution: 'vata',
      characteristics: [
        'Cuerpo delgado y ligero',
        'Piel seca y fría',
        'Apetito variable',
        'Digestión irregular',
        'Sueño ligero',
        'Mente rápida y creativa',
        'Energía en ráfagas'
      ],
      strengths: [
        'Creatividad y adaptabilidad',
        'Aprendizaje rápido',
        'Entusiasmo natural',
        'Flexibilidad mental',
        'Comunicación expresiva'
      ],
      challenges: [
        'Tendencia a la ansiedad',
        'Digestión irregular',
        'Dificultad para ganar peso',
        'Sueño inquieto',
        'Fatiga por sobreestimulación'
      ],
      recommendations: {
        herbs: ['manzanilla', 'tila', 'valeriana', 'pasiflora'],
        lifestyle: [
          'Rutina regular y constante',
          'Ambientes cálidos y tranquilos',
          'Actividades relajantes',
          'Meditación y respiración profunda'
        ],
        diet: [
          'Comidas calientes y nutritivas',
          'Alimentos dulces y salados',
          'Grasas saludables',
          'Evitar comidas secas y frías'
        ],
        exercise: [
          'Yoga suave',
          'Caminatas tranquilas',
          'Tai chi',
          'Ejercicios de respiración'
        ]
      }
    });

    // Pitta Constitution
    this.constitutionalProfiles.set('pitta', {
      constitution: 'pitta',
      characteristics: [
        'Constitución media y atlética',
        'Piel caliente y grasa',
        'Apetito fuerte y regular',
        'Digestión eficiente',
        'Sueño profundo pero corto',
        'Mente analítica y enfocada',
        'Energía constante'
      ],
      strengths: [
        'Liderazgo natural',
        'Capacidad de concentración',
        'Metabolismo eficiente',
        'Determinación y coraje',
        'Inteligencia práctica'
      ],
      challenges: [
        'Tendencia a la irritabilidad',
        'Sobrecalentamiento',
        'Acidez estomacal',
        'Impaciencia',
        'Perfeccionismo excesivo'
      ],
      recommendations: {
        herbs: ['sábila', 'menta', 'rosas', 'cilantro'],
        lifestyle: [
          'Ambientes frescos',
          'Actividades moderadas',
          'Tiempo para relajación',
          'Evitar sobrecalentamiento'
        ],
        diet: [
          'Comidas frescas y jugosas',
          'Sabores dulces y amargos',
          'Evitar picantes y ácidos',
          'Hidratación abundante'
        ],
        exercise: [
          'Natación',
          'Yoga moderado',
          'Deportes no competitivos',
          'Ejercicio en ambientes frescos'
        ]
      }
    });

    // Kapha Constitution
    this.constitutionalProfiles.set('kapha', {
      constitution: 'kapha',
      characteristics: [
        'Constitución robusta y estable',
        'Piel suave y grasa',
        'Apetito moderado pero constante',
        'Digestión lenta',
        'Sueño profundo y prolongado',
        'Mente estable y paciente',
        'Energía constante pero lenta'
      ],
      strengths: [
        'Estabilidad emocional',
        'Resistencia física',
        'Memoria a largo plazo',
        'Naturaleza compasiva',
        'Sistema inmune fuerte'
      ],
      challenges: [
        'Tendencia al sobrepeso',
        'Letargo y pereza',
        'Apego excesivo',
        'Congestión respiratoria',
        'Resistencia al cambio'
      ],
      recommendations: {
        herbs: ['jengibre', 'canela', 'eucalipto', 'romero'],
        lifestyle: [
          'Actividad regular y estimulante',
          'Ambientes secos y cálidos',
          'Variedad en rutinas',
          'Estimulación mental'
        ],
        diet: [
          'Comidas picantes y amargas',
          'Alimentos ligeros y calientes',
          'Especias estimulantes',
          'Limitar dulces y lácteos'
        ],
        exercise: [
          'Ejercicio vigoroso',
          'Deportes competitivos',
          'Cardio intenso',
          'Actividades que generen calor'
        ]
      }
    });

    // Constitutional herb recommendations
    this.constitutionalHerbs.set('vata', [
      'manzanilla', 'tila', 'valeriana', 'pasiflora', 'toronjil', 'hierba del sapo'
    ]);

    this.constitutionalHerbs.set('pitta', [
      'sábila', 'rosas', 'menta', 'cilantro', 'jamaica', 'chía'
    ]);

    this.constitutionalHerbs.set('kapha', [
      'jengibre', 'canela', 'eucalipto', 'romero', 'cúrcuma', 'pimienta'
    ]);
  }

  /**
   * Calculate constitutional scores from responses
   */
  private calculateScores(responses: ConstitutionalResponse[]): { vata: number; pitta: number; kapha: number } {
    const scores = { vata: 0, pitta: 0, kapha: 0 };

    for (const response of responses) {
      const question = this.questionnaire.find(q => q.id === response.questionId);
      if (question && question.answers[response.selectedAnswer]) {
        const answer = question.answers[response.selectedAnswer];
        scores[answer.constitution] += answer.weight;
      }
    }

    return scores;
  }

  /**
   * Determine primary and secondary constitutions
   */
  private determineConstitutions(scores: { vata: number; pitta: number; kapha: number }): {
    primary: 'vata' | 'pitta' | 'kapha';
    secondary?: 'vata' | 'pitta' | 'kapha';
  } {
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([constitution]) => constitution) as ('vata' | 'pitta' | 'kapha')[];

    const primary = sortedScores[0];
    const secondary = scores[sortedScores[1]] > scores[primary] * 0.7 ? sortedScores[1] : undefined;

    return { primary, secondary };
  }

  /**
   * Generate personalized recommendations
   */
  private async generatePersonalizedRecommendations(
    primary: 'vata' | 'pitta' | 'kapha',
    secondary?: 'vata' | 'pitta' | 'kapha',
    patientInfo?: any
  ): Promise<ConstitutionalResult['personalizedRecommendations']> {
    const primaryProfile = this.constitutionalProfiles.get(primary)!;
    const secondaryProfile = secondary ? this.constitutionalProfiles.get(secondary) : null;

    // Combine recommendations, prioritizing primary constitution
    const recommendations = {
      herbs: [...primaryProfile.recommendations.herbs],
      lifestyle: [...primaryProfile.recommendations.lifestyle],
      diet: [...primaryProfile.recommendations.diet],
      exercise: [...primaryProfile.recommendations.exercise],
      dailyRoutine: this.generateDailyRoutine(primary)
    };

    // Add secondary constitution recommendations if applicable
    if (secondaryProfile) {
      recommendations.herbs.push(...secondaryProfile.recommendations.herbs.slice(0, 2));
      recommendations.lifestyle.push(...secondaryProfile.recommendations.lifestyle.slice(0, 2));
    }

    // Age-specific adjustments
    if (patientInfo?.age) {
      if (patientInfo.age > 60) {
        recommendations.lifestyle.push('Ejercicio suave y regular para mantener movilidad');
        recommendations.diet.push('Alimentos fáciles de digerir');
      } else if (patientInfo.age < 25) {
        recommendations.lifestyle.push('Establecer rutinas saludables desde joven');
      }
    }

    return recommendations;
  }

  /**
   * Generate daily routine recommendations
   */
  private generateDailyRoutine(constitution: 'vata' | 'pitta' | 'kapha'): string[] {
    const routines = {
      vata: [
        'Despertar a la misma hora todos los días (6:00-7:00 AM)',
        'Comenzar con bebida caliente (té de jengibre o agua tibia)',
        'Automasaje con aceite antes del baño',
        'Comidas regulares a la misma hora',
        'Actividad física suave en la mañana',
        'Meditación o respiración profunda (10-20 min)',
        'Dormir antes de las 10:30 PM'
      ],
      pitta: [
        'Despertar temprano (5:30-6:30 AM) para aprovechar la frescura',
        'Comenzar con agua fresca o jugo de aloe',
        'Ejercicio moderado antes del calor del día',
        'Comida principal al mediodía cuando la digestión es más fuerte',
        'Evitar actividades intensas en horas de calor',
        'Tiempo de relajación en la tarde',
        'Dormir entre 10:00-10:30 PM'
      ],
      kapha: [
        'Despertar temprano (5:30-6:00 AM) para contrarrestar la pereza',
        'Comenzar con bebida caliente con especias (té de jengibre)',
        'Ejercicio vigoroso en la mañana',
        'Desayuno ligero, comida principal más temprano',
        'Mantenerse activo durante el día',
        'Evitar siestas largas',
        'Dormir entre 10:00-11:00 PM'
      ]
    };

    return routines[constitution];
  }

  /**
   * Get seasonal adjustments
   */
  private getSeasonalAdjustments(constitution: 'vata' | 'pitta' | 'kapha'): {
    current: string[];
    upcoming: string[];
  } {
    const month = new Date().getMonth() + 1;
    const currentSeason = this.getCurrentSeason(month);
    const upcomingSeason = this.getUpcomingSeason(month);

    const seasonalRecommendations = {
      vata: {
        dry: ['Aumentar hidratación', 'Usar aceites corporales', 'Comidas más calientes'],
        rainy: ['Mantenerse seco y cálido', 'Evitar exposición al viento frío', 'Incrementar especias digestivas'],
        hot: ['Protegerse del calor excesivo', 'Mantener rutinas estables', 'Hidratación constante']
      },
      pitta: {
        dry: ['Hidratación extra', 'Evitar sobrecalentamiento', 'Comidas refrescantes'],
        rainy: ['Mantener frescura', 'Evitar humedad excesiva', 'Comidas ligeras'],
        hot: ['Buscar sombra y frescura', 'Aumentar líquidos fríos', 'Evitar actividades intensas']
      },
      kapha: {
        dry: ['Mantenerse activo', 'Aprovechar el clima seco', 'Ejercicio regular'],
        rainy: ['Evitar humedad excesiva', 'Incrementar ejercicio en interiores', 'Comidas calientes y especiadas'],
        hot: ['Ejercicio temprano en la mañana', 'Mantener actividad', 'Hidratación moderada']
      }
    };

    return {
      current: seasonalRecommendations[constitution][currentSeason] || [],
      upcoming: seasonalRecommendations[constitution][upcomingSeason] || []
    };
  }

  /**
   * Get Mexican context adaptations
   */
  private getMexicanContextAdaptations(
    constitution: 'vata' | 'pitta' | 'kapha',
    location?: string
  ): string[] {
    const adaptations: string[] = [];

    // Altitude considerations for Mexico City
    if (location?.toLowerCase().includes('cdmx') || location?.toLowerCase().includes('ciudad de mexico')) {
      if (constitution === 'vata') {
        adaptations.push('La altitud puede aumentar sequedad - incrementar hidratación');
        adaptations.push('Protegerse del viento frío de montaña');
      } else if (constitution === 'pitta') {
        adaptations.push('La altitud y radiación solar intensa requieren mayor protección');
      } else if (constitution === 'kapha') {
        adaptations.push('La altitud puede ayudar con la congestión - aprovechar para ejercicio');
      }
    }

    // Mexican culinary traditions
    const culinaryAdaptations = {
      vata: [
        'Los caldos y sopas mexicanas (pozole, caldo de pollo) son excelentes',
        'Usar tortillas de maíz calientes para nutrición y calor',
        'Aprovechar frutas tropicales como papaya y mango para enzimas'
      ],
      pitta: [
        'Limitar chiles y especias picantes',
        'Aprovechar frutas frescas como jícama, pepino y melón',
        'El agua de jamaica sin azúcar es refrescante y benéfica'
      ],
      kapha: [
        'Aprovechar las especias mexicanas: comino, orégano, chile en polvo',
        'Los quelites (verduras locales) son excelentes para estimular digestión',
        'Limitar tortillas de harina y exceso de queso'
      ]
    };

    adaptations.push(...culinaryAdaptations[constitution]);

    // Traditional Mexican medicine integration
    adaptations.push('Integrar conocimiento de curanderos locales respetando la tradición');
    adaptations.push('Usar hierbas disponibles en mercados mexicanos locales');

    return adaptations;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(percentages: { vata: number; pitta: number; kapha: number }): number {
    const values = Object.values(percentages);
    const max = Math.max(...values);
    const secondMax = values.sort((a, b) => b - a)[1];
    
    // Higher confidence when there's a clear leader
    const difference = max - secondMax;
    return Math.min(0.95, 0.5 + (difference / 100));
  }

  /**
   * Helper methods for seasons
   */
  private getCurrentSeason(month: number): 'dry' | 'rainy' | 'hot' {
    if (month >= 6 && month <= 10) return 'rainy';
    if (month >= 11 || month <= 2) return 'dry';
    return 'hot';
  }

  private getUpcomingSeason(month: number): 'dry' | 'rainy' | 'hot' {
    if (month >= 5 && month <= 9) return 'rainy';
    if (month >= 10 || month <= 1) return 'dry';
    return 'hot';
  }

  /**
   * Get constitution summary for display
   */
  getConstitutionSummary(constitution: 'vata' | 'pitta' | 'kapha'): {
    name: string;
    description: string;
    element: string;
    qualities: string[];
  } {
    const summaries = {
      vata: {
        name: 'Vata (Aire)',
        description: 'Constitución ligera, móvil y creativa',
        element: 'Aire y Espacio',
        qualities: ['Seco', 'Ligero', 'Frío', 'Móvil', 'Irregular']
      },
      pitta: {
        name: 'Pitta (Fuego)',
        description: 'Constitución caliente, intensa y enfocada',
        element: 'Fuego y Agua',
        qualities: ['Caliente', 'Agudo', 'Penetrante', 'Ligero', 'Aceitoso']
      },
      kapha: {
        name: 'Kapha (Tierra)',
        description: 'Constitución estable, fuerte y tranquila',
        element: 'Tierra y Agua',
        qualities: ['Pesado', 'Lento', 'Frío', 'Aceitoso', 'Estable']
      }
    };

    return summaries[constitution];
  }
}

export const constitutionalAnalysisService = ConstitutionalAnalysisService.getInstance();