/**
 * MexicanCulturalContextService - Cultural adaptation for Mexican healthcare context
 * Provides culturally sensitive medical advice and traditional medicine integration
 */

import { loggingService } from './LoggingService';

interface CulturalContext {
  region: 'cdmx' | 'norte' | 'sur' | 'golfo' | 'pacifico' | 'centro' | 'general';
  socialFactors: string[];
  economicFactors: string[];
  traditionalPractices: string[];
  seasonalConsiderations: string[];
  accessibilityNotes: string[];
}

interface MexicanMedicalPractice {
  name: string;
  description: string;
  region: string[];
  category: 'herbal' | 'ritual' | 'dietary' | 'physical' | 'spiritual';
  modernValidation: 'validated' | 'partially_validated' | 'traditional_only';
  safetyNotes: string[];
  integration: string;
}

interface HealthcareAccess {
  publicOptions: string[];
  privateOptions: string[];
  emergencyNumbers: string[];
  regionalSpecialties: string[];
  costs: {
    consultation: string;
    medications: string;
    procedures: string;
  };
}

interface SeasonalHealthFactor {
  season: 'dry' | 'rainy' | 'cold' | 'hot';
  commonConditions: string[];
  preventiveMeasures: string[];
  traditionalRemedies: string[];
  modernPrecautions: string[];
}

export class MexicanCulturalContextService {
  private static instance: MexicanCulturalContextService;
  
  // Traditional Mexican medical practices database
  private traditionalPractices: Map<string, MexicanMedicalPractice> = new Map();
  
  // Regional healthcare access information
  private healthcareAccess: Map<string, HealthcareAccess> = new Map();
  
  // Seasonal health factors
  private seasonalFactors: Map<string, SeasonalHealthFactor> = new Map();
  
  // Common Mexican food medicine
  private foodMedicine: Map<string, string[]> = new Map();

  static getInstance(): MexicanCulturalContextService {
    if (!MexicanCulturalContextService.instance) {
      MexicanCulturalContextService.instance = new MexicanCulturalContextService();
      MexicanCulturalContextService.instance.initializeCulturalDatabase();
    }
    return MexicanCulturalContextService.instance;
  }

  /**
   * Get cultural context for medical recommendations
   */
  getCulturalContext(
    condition: string,
    region: string = 'general',
    patientAge?: number,
    socialFactors?: string[]
  ): CulturalContext {
    
    loggingService.info('MexicanCulturalContext', 'Getting cultural context', {
      condition,
      region,
      patientAge
    });

    const regionKey = this.normalizeRegion(region);
    const currentSeason = this.getCurrentSeason();
    
    return {
      region: regionKey,
      socialFactors: this.getSocialFactors(condition, patientAge, socialFactors),
      economicFactors: this.getEconomicFactors(condition, regionKey),
      traditionalPractices: this.getTraditionalPractices(condition, regionKey),
      seasonalConsiderations: this.getSeasonalConsiderations(condition, currentSeason),
      accessibilityNotes: this.getAccessibilityNotes(condition, regionKey)
    };
  }

  /**
   * Get traditional Mexican remedies for a condition
   */
  getTraditionalRemedies(condition: string): {
    herbal: string[];
    dietary: string[];
    lifestyle: string[];
    ritual: string[];
    safetyWarnings: string[];
  } {
    
    const conditionLower = condition.toLowerCase();
    const remedies = {
      herbal: [] as string[],
      dietary: [] as string[],
      lifestyle: [] as string[],
      ritual: [] as string[],
      safetyWarnings: [] as string[]
    };

    // Common Mexican traditional remedies by condition
    if (conditionLower.includes('dolor de cabeza') || conditionLower.includes('headache')) {
      remedies.herbal.push('Té de manzanilla con miel');
      remedies.herbal.push('Compresas de ruda en las sienes (con precaución)');
      remedies.dietary.push('Evitar alimentos muy salados o procesados');
      remedies.lifestyle.push('Masaje en sienes con aceite de romero');
      remedies.safetyWarnings.push('La ruda puede ser tóxica en exceso - usar solo externamente');
    }

    if (conditionLower.includes('digestivo') || conditionLower.includes('stomach')) {
      remedies.herbal.push('Té de hierbabuena después de las comidas');
      remedies.herbal.push('Agua de horchata para refrescar el estómago');
      remedies.dietary.push('Caldo de pollo con verduras');
      remedies.dietary.push('Agua de jamaica sin azúcar');
      remedies.lifestyle.push('Comer en horarios regulares');
      remedies.lifestyle.push('Masaje abdominal en sentido horario');
    }

    if (conditionLower.includes('tos') || conditionLower.includes('cough')) {
      remedies.herbal.push('Jarabe de bugambilia con miel');
      remedies.herbal.push('Té de gordolobo con limón');
      remedies.dietary.push('Agua tibia con miel y limón');
      remedies.dietary.push('Evitar alimentos fríos');
      remedies.lifestyle.push('Inhalar vapores de eucalipto');
    }

    if (conditionLower.includes('ansiedad') || conditionLower.includes('anxiety')) {
      remedies.herbal.push('Té de tila antes de dormir');
      remedies.herbal.push('Flores de Bach (rescue remedy)');
      remedies.lifestyle.push('Respiración profunda con incienso de copal');
      remedies.ritual.push('Limpias energéticas con hierbas dulces');
      remedies.dietary.push('Evitar exceso de café y azúcar');
    }

    if (conditionLower.includes('fiebre') || conditionLower.includes('fever')) {
      remedies.herbal.push('Compresas de agua tibia en frente y muñecas');
      remedies.herbal.push('Té de sauco para bajar la fiebre');
      remedies.dietary.push('Suero casero (agua, sal, azúcar)');
      remedies.dietary.push('Agua de coco natural');
      remedies.lifestyle.push('Baños de agua tibia (no fría)');
      remedies.safetyWarnings.push('Buscar atención médica si la fiebre supera 39°C o dura más de 3 días');
    }

    return remedies;
  }

  /**
   * Get culturally appropriate health advice
   */
  getCulturalHealthAdvice(condition: string, patientProfile: {
    age?: number;
    gender?: string;
    familyStructure?: string;
    economicStatus?: string;
    region?: string;
  }): {
    familyInvolvement: string[];
    economicConsiderations: string[];
    culturalSensitivities: string[];
    communityResources: string[];
  } {

    const advice = {
      familyInvolvement: [] as string[],
      economicConsiderations: [] as string[],
      culturalSensitivities: [] as string[],
      communityResources: [] as string[]
    };

    // Family involvement recommendations
    if (patientProfile.age && patientProfile.age < 18) {
      advice.familyInvolvement.push('Involucrar a los padres o tutores en todas las decisiones de tratamiento');
      advice.familyInvolvement.push('Considerar el rol de los abuelos en el cuidado y tradiciones familiares');
    } else if (patientProfile.age && patientProfile.age > 65) {
      advice.familyInvolvement.push('La familia extendida puede tener rol importante en el cuidado');
      advice.familyInvolvement.push('Respetar la sabiduría de los remedios familiares tradicionales');
    }

    if (patientProfile.gender === 'female') {
      advice.culturalSensitivities.push('Considerar factores culturales sobre salud reproductiva');
      advice.culturalSensitivities.push('Respetar la modestia y preferencias de atención médica');
    }

    // Economic considerations
    advice.economicConsiderations.push('Opciones de atención gratuita: Centros de Salud y IMSS/ISSSTE');
    advice.economicConsiderations.push('Farmacias genéricas para medicamentos más económicos');
    advice.economicConsiderations.push('Remedios caseros como alternativa económica válida');

    if (condition.toLowerCase().includes('chronic') || condition.toLowerCase().includes('crónic')) {
      advice.economicConsiderations.push('Programas de apoyo para enfermedades crónicas en IMSS');
      advice.economicConsiderations.push('Considerar medicina tradicional como complemento económico');
    }

    // Cultural sensitivities
    advice.culturalSensitivities.push('Integrar medicina tradicional con medicina moderna de forma respetuosa');
    advice.culturalSensitivities.push('Considerar creencias sobre causas de enfermedad (aire, susto, mal de ojo)');
    advice.culturalSensitivities.push('Respetar el uso de amuletos y rituales de protección');

    // Community resources
    advice.communityResources.push('Curanderos y sobadores locales certificados');
    advice.communityResources.push('Mercados de hierbas medicinales (con precaución sobre calidad)');
    advice.communityResources.push('Grupos de apoyo comunitario y religiosos');
    advice.communityResources.push('Farmacias con consulta médica accesible');

    return advice;
  }

  /**
   * Get seasonal health recommendations
   */
  getSeasonalRecommendations(): {
    current: SeasonalHealthFactor;
    upcoming: SeasonalHealthFactor;
    yearRound: string[];
  } {
    
    const currentSeason = this.getCurrentSeason();
    const upcomingSeason = this.getUpcomingSeason();
    
    return {
      current: this.seasonalFactors.get(currentSeason) || this.getDefaultSeasonalFactor(),
      upcoming: this.seasonalFactors.get(upcomingSeason) || this.getDefaultSeasonalFactor(),
      yearRound: [
        'Mantener higiene personal constante',
        'Hidratación adecuada durante todo el año',
        'Alimentación balanceada con productos locales',
        'Ejercicio regular adaptado al clima'
      ]
    };
  }

  /**
   * Get food as medicine recommendations
   */
  getFoodMedicine(condition: string): string[] {
    const conditionLower = condition.toLowerCase();
    const recommendations: string[] = [];

    // Common Mexican foods with medicinal properties
    if (conditionLower.includes('digestivo') || conditionLower.includes('stomach')) {
      recommendations.push('🥄 Papaya: enzimas digestivas naturales');
      recommendations.push('🌶️ Chile en pequeñas cantidades: estimula digestión');
      recommendations.push('🥒 Pepino: refrescante y antiinflamatorio');
      recommendations.push('🌽 Agua de maíz morado: antiinflamatorio natural');
    }

    if (conditionLower.includes('respiratory') || conditionLower.includes('tos')) {
      recommendations.push('🍯 Miel de abeja pura: antibacteriana y suavizante');
      recommendations.push('🧄 Ajo: propiedades antibióticas naturales');
      recommendations.push('🫚 Jengibre: expectorante y antiinflamatorio');
      recommendations.push('🍋 Limón: vitamina C y propiedades antisépticas');
    }

    if (conditionLower.includes('inflammation') || conditionLower.includes('dolor')) {
      recommendations.push('🌶️ Chiles: capsaicina para dolor tópico');
      recommendations.push('🥑 Aguacate: grasas antiinflamatorias');
      recommendations.push('🫘 Frijoles: proteína y fibra para recuperación');
      recommendations.push('🐟 Pescado (cuando disponible): omega-3');
    }

    if (conditionLower.includes('anemia') || conditionLower.includes('fatigue')) {
      recommendations.push('🌱 Quelites: hierro y vitaminas naturales');
      recommendations.push('🫘 Frijoles negros: hierro y proteína');
      recommendations.push('🌿 Espinacas: folato y hierro');
      recommendations.push('🥩 Hígado (con moderación): hierro biodisponible');
    }

    return recommendations;
  }

  /**
   * Get emergency and healthcare access information
   */
  getEmergencyInfo(region: string = 'general'): {
    emergency: string[];
    hospitals: string[];
    pharmacies: string[];
    insurance: string[];
    costs: string[];
  } {
    
    const regionKey = this.normalizeRegion(region);
    const access = this.healthcareAccess.get(regionKey) || this.healthcareAccess.get('general')!;
    
    return {
      emergency: [
        '🚨 Emergencias: 911',
        '🏥 Cruz Roja: 065',
        '👮 Policía: 911',
        '🚒 Bomberos: 911',
        '☎️ Locatel CDMX: 5658-1111'
      ],
      hospitals: access.publicOptions,
      pharmacies: [
        'Farmacias del Ahorro',
        'Farmacias Similares',
        'Farmacias Guadalajara',
        'OXXO (medicamentos básicos)',
        'Walmart/Bodega Aurrera'
      ],
      insurance: [
        'IMSS (trabajadores formales)',
        'ISSSTE (empleados gobierno)',
        'Seguro Popular/INSABI',
        'Seguros privados',
        'Pago directo'
      ],
      costs: access.costs ? [
        `Consulta: ${access.costs.consultation}`,
        `Medicamentos: ${access.costs.medications}`,
        `Procedimientos: ${access.costs.procedures}`
      ] : [
        'Consulta pública: Gratuita con seguro',
        'Consulta privada: $300-800 MXN',
        'Medicamentos genéricos: $30-200 MXN',
        'Emergencias: Gratuitas en hospitales públicos'
      ]
    };
  }

  /**
   * Initialize cultural database
   */
  private initializeCulturalDatabase(): void {
    // Traditional practices
    this.traditionalPractices.set('sobaduria', {
      name: 'Sobaduria',
      description: 'Técnica tradicional de masaje terapéutico para dolores musculares',
      region: ['general'],
      category: 'physical',
      modernValidation: 'partially_validated',
      safetyNotes: ['Buscar sobadores certificados', 'No aplicar en fracturas'],
      integration: 'Complementa fisioterapia moderna'
    });

    this.traditionalPractices.set('limpias', {
      name: 'Limpias energéticas',
      description: 'Ritual de purificación con hierbas para bienestar emocional',
      region: ['general'],
      category: 'spiritual',
      modernValidation: 'traditional_only',
      safetyNotes: ['Buscar curanderos respetables', 'No sustituye tratamiento médico'],
      integration: 'Puede complementar terapia psicológica'
    });

    // Healthcare access
    this.healthcareAccess.set('cdmx', {
      publicOptions: [
        'Hospital General de México',
        'Hospital de La Raza (IMSS)',
        'Hospital 20 de Noviembre (ISSSTE)',
        'Centros de Salud delegacionales'
      ],
      privateOptions: [
        'Hospital ABC',
        'Hospital Ángeles',
        'Médica Sur',
        'Hospital Español'
      ],
      emergencyNumbers: ['911', '065'],
      regionalSpecialties: ['Cardiología', 'Neumología (por altitud)', 'Gastroenterología'],
      costs: {
        consultation: '$400-1000 MXN privada, gratuita pública',
        medications: '$50-500 MXN genéricos',
        procedures: 'Variables, gratuitos con seguro'
      }
    });

    this.healthcareAccess.set('general', {
      publicOptions: [
        'Centros de Salud locales',
        'Hospitales IMSS/ISSSTE',
        'INSABI (ex Seguro Popular)'
      ],
      privateOptions: [
        'Consultorios en farmacias',
        'Clínicas privadas locales'
      ],
      emergencyNumbers: ['911', '065'],
      regionalSpecialties: ['Medicina general', 'Urgencias'],
      costs: {
        consultation: '$200-600 MXN privada',
        medications: '$30-300 MXN',
        procedures: 'Variables según región'
      }
    });

    // Seasonal factors
    this.seasonalFactors.set('rainy', {
      season: 'rainy',
      commonConditions: ['Dengue', 'Chikungunya', 'Infecciones gastrointestinales', 'Hongos'],
      preventiveMeasures: [
        'Eliminar agua estancada',
        'Usar repelente de mosquitos',
        'Hervir agua para beber',
        'Mantener pies secos'
      ],
      traditionalRemedies: [
        'Té de hojas de guayaba para diarrea',
        'Aceite de nim para repeler mosquitos',
        'Baños de sal para hongos en pies'
      ],
      modernPrecautions: [
        'Vacunación contra dengue si aplica',
        'Suero oral para deshidratación',
        'Antifúngicos tópicos'
      ]
    });

    this.seasonalFactors.set('dry', {
      season: 'dry',
      commonConditions: ['Alergias respiratorias', 'Piel seca', 'Deshidratación', 'Conjuntivitis'],
      preventiveMeasures: [
        'Hidratación constante',
        'Humidificadores en casa',
        'Protección solar',
        'Limpieza nasal con suero'
      ],
      traditionalRemedies: [
        'Aloe vera para piel seca',
        'Miel para garganta irritada',
        'Agua de jamaica para hidratación'
      ],
      modernPrecautions: [
        'Antihistamínicos para alergias',
        'Protector solar SPF 30+',
        'Lágrimas artificiales'
      ]
    });

    // Food medicine
    this.foodMedicine.set('digestive', [
      'Papaya para enzimas digestivas',
      'Agua de jamaica para antioxidantes',
      'Té de hierbabuena para calmar estómago',
      'Calabaza para fibra suave'
    ]);
  }

  /**
   * Helper methods
   */
  private normalizeRegion(region: string): 'cdmx' | 'norte' | 'sur' | 'golfo' | 'pacifico' | 'centro' | 'general' {
    const regionLower = region.toLowerCase();
    if (regionLower.includes('cdmx') || regionLower.includes('ciudad de mexico')) return 'cdmx';
    if (regionLower.includes('norte') || regionLower.includes('monterrey')) return 'norte';
    if (regionLower.includes('sur') || regionLower.includes('chiapas')) return 'sur';
    if (regionLower.includes('golfo') || regionLower.includes('veracruz')) return 'golfo';
    if (regionLower.includes('pacifico') || regionLower.includes('guadalajara')) return 'pacifico';
    if (regionLower.includes('centro')) return 'centro';
    return 'general';
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'rainy';
    if (month >= 11 || month <= 2) return 'dry';
    if (month >= 3 && month <= 5) return 'hot';
    return 'dry';
  }

  private getUpcomingSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 5 && month <= 9) return 'rainy';
    if (month >= 10 || month <= 1) return 'dry';
    if (month >= 2 && month <= 4) return 'hot';
    return 'rainy';
  }

  private getSocialFactors(condition: string, patientAge?: number, socialFactors?: string[]): string[] {
    const factors: string[] = [];
    
    if (patientAge && patientAge < 18) {
      factors.push('Involucrar a la familia en decisiones de tratamiento');
      factors.push('Considerar horarios escolares para citas médicas');
    }
    
    if (patientAge && patientAge > 65) {
      factors.push('Apoyo familiar importante para adherencia al tratamiento');
      factors.push('Considerar limitaciones de movilidad');
    }
    
    factors.push('Integrar medicina tradicional familiar con tratamiento moderno');
    factors.push('Respetar creencias culturales sobre causas de enfermedad');
    
    return factors;
  }

  private getEconomicFactors(condition: string, region: string): string[] {
    return [
      'Opciones de atención gratuita disponibles en sistema público',
      'Medicamentos genéricos como alternativa económica',
      'Remedios tradicionales pueden ser opción complementaria económica',
      'Consultas en farmacias para condiciones menores'
    ];
  }

  private getTraditionalPractices(condition: string, region: string): string[] {
    const practices: string[] = [];
    
    practices.push('Uso de plantas medicinales locales bajo supervisión');
    practices.push('Técnicas de relajación tradicionales');
    
    if (condition.toLowerCase().includes('dolor')) {
      practices.push('Sobaduria para dolores musculares');
      practices.push('Compresas de hierbas calientes');
    }
    
    if (condition.toLowerCase().includes('digestivo')) {
      practices.push('Tés digestivos después de comidas');
      practices.push('Masajes abdominales tradicionales');
    }
    
    return practices;
  }

  private getSeasonalConsiderations(condition: string, season: string): string[] {
    const considerations: string[] = [];
    const seasonalFactor = this.seasonalFactors.get(season);
    
    if (seasonalFactor) {
      considerations.push(`Temporada ${season}: Mayor riesgo de ${seasonalFactor.commonConditions[0]}`);
      considerations.push(...seasonalFactor.preventiveMeasures.slice(0, 2));
    }
    
    return considerations;
  }

  private getAccessibilityNotes(condition: string, region: string): string[] {
    const access = this.healthcareAccess.get(region);
    const notes: string[] = [];
    
    if (access) {
      notes.push(`Opciones públicas: ${access.publicOptions[0]}`);
      notes.push(`Emergencias: ${access.emergencyNumbers.join(', ')}`);
    }
    
    notes.push('Transporte público disponible a centros de salud');
    notes.push('Interpretes disponibles para lenguas indígenas en hospitales públicos');
    
    return notes;
  }

  private getDefaultSeasonalFactor(): SeasonalHealthFactor {
    return {
      season: 'dry',
      commonConditions: ['Condiciones respiratorias leves'],
      preventiveMeasures: ['Hidratación adecuada', 'Higiene personal'],
      traditionalRemedies: ['Tés de hierbas locales'],
      modernPrecautions: ['Seguir indicaciones médicas']
    };
  }
}

export const mexicanCulturalContextService = MexicanCulturalContextService.getInstance();