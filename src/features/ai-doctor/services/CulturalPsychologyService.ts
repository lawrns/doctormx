/**
 * Mexican cultural psychology service
 * Provides culturally sensitive mental health support
 */

export interface CulturalContext {
  familyRole: 'individual' | 'parent' | 'child' | 'elder' | 'caregiver';
  socioeconomicFactors: string[];
  religiousInfluence: 'none' | 'moderate' | 'strong';
  migrationStatus?: 'local' | 'internal' | 'returned' | 'diaspora';
  communitySupport: 'isolated' | 'limited' | 'strong';
  culturalStressors: string[];
}

export interface CulturallyAdaptedSupport {
  approach: string;
  considerations: string[];
  resources: CulturalResource[];
  familyInvolvement: string;
  stigmaAddressing: string[];
}

export interface CulturalResource {
  name: string;
  type: 'professional' | 'community' | 'religious' | 'traditional';
  description: string;
  accessibility: 'free' | 'low-cost' | 'varies';
  culturalAcceptance: 'high' | 'moderate' | 'growing';
}

export class CulturalPsychologyService {
  // Mexican-specific mental health stigma patterns
  private static readonly STIGMA_PATTERNS = {
    'está loco': {
      reality: 'Buscar ayuda psicológica es señal de fortaleza, no locura',
      reframe: 'Cuidar tu mente es tan importante como cuidar tu cuerpo'
    },
    'es débil': {
      reality: 'Reconocer que necesitas apoyo requiere valentía',
      reframe: 'Los más fuertes son quienes piden ayuda cuando la necesitan'
    },
    'qué dirán': {
      reality: 'Tu salud mental es más importante que las opiniones ajenas',
      reframe: 'Tu familia se beneficia cuando tú estás bien'
    },
    'no es para nosotros': {
      reality: 'La terapia es para todos, sin importar clase social',
      reframe: 'Mereces sentirte bien, es tu derecho'
    }
  };

  // Family dynamics in Mexican culture
  private static readonly FAMILY_DYNAMICS = {
    'machismo': {
      impact: 'Presión para no mostrar vulnerabilidad emocional',
      intervention: 'Redefinir fortaleza como capacidad de buscar ayuda'
    },
    'marianismo': {
      impact: 'Expectativa de sacrificio personal por la familia',
      intervention: 'Validar el autocuidado como forma de cuidar a otros'
    },
    'respeto': {
      impact: 'Dificultad para expresar desacuerdo con mayores',
      intervention: 'Encontrar formas respetuosas de establecer límites'
    },
    'familismo': {
      impact: 'Culpa por priorizar necesidades individuales',
      intervention: 'Balance entre bienestar personal y familiar'
    }
  };

  // Culturally specific coping strategies
  private static readonly CULTURAL_COPING = {
    'compadrazgo': 'Activar red de compadres/comadres para apoyo',
    'convivencia': 'Participar en reuniones familiares/comunitarias',
    'fe y espiritualidad': 'Integrar prácticas espirituales si son significativas',
    'tradiciones': 'Mantener rituales y tradiciones que dan sentido',
    'música y baile': 'Usar expresión artística cultural para liberar emociones',
    'comida compartida': 'Reunirse alrededor de la comida para conexión'
  };

  /**
   * Assess cultural context from conversation
   */
  static assessCulturalContext(
    userHistory: string[],
    demographics?: Partial<CulturalContext>
  ): CulturalContext {
    const fullHistory = userHistory.join(' ').toLowerCase();
    
    return {
      familyRole: this.inferFamilyRole(fullHistory),
      socioeconomicFactors: this.identifySocioeconomicFactors(fullHistory),
      religiousInfluence: this.assessReligiousInfluence(fullHistory),
      migrationStatus: this.inferMigrationStatus(fullHistory),
      communitySupport: this.assessCommunitySupport(fullHistory),
      culturalStressors: this.identifyCulturalStressors(fullHistory),
      ...demographics
    };
  }

  /**
   * Infer family role from conversation
   */
  private static inferFamilyRole(text: string): CulturalContext['familyRole'] {
    if (text.includes('mis hijos') || text.includes('mi esposo') || 
        text.includes('mi esposa')) return 'parent';
    if (text.includes('mis padres') || text.includes('mi mamá') || 
        text.includes('mi papá')) return 'child';
    if (text.includes('cuido a') || text.includes('me encargo de')) return 'caregiver';
    if (text.includes('mis nietos')) return 'elder';
    return 'individual';
  }

  /**
   * Identify socioeconomic factors
   */
  private static identifySocioeconomicFactors(text: string): string[] {
    const factors: string[] = [];
    
    if (text.includes('no tengo dinero') || text.includes('no alcanza')) {
      factors.push('economic_stress');
    }
    if (text.includes('trabajo') && (text.includes('mucho') || text.includes('turnos'))) {
      factors.push('work_overload');
    }
    if (text.includes('desempleado') || text.includes('sin trabajo')) {
      factors.push('unemployment');
    }
    if (text.includes('deudas') || text.includes('préstamo')) {
      factors.push('debt_stress');
    }
    
    return factors;
  }

  /**
   * Assess religious influence
   */
  private static assessReligiousInfluence(text: string): CulturalContext['religiousInfluence'] {
    const religiousKeywords = ['dios', 'virgen', 'rezar', 'iglesia', 'fe', 'bendición'];
    const matches = religiousKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (matches >= 3) return 'strong';
    if (matches >= 1) return 'moderate';
    return 'none';
  }

  /**
   * Infer migration status
   */
  private static inferMigrationStatus(text: string): CulturalContext['migrationStatus'] {
    if (text.includes('estados unidos') || text.includes('el otro lado')) {
      return 'diaspora';
    }
    if (text.includes('regresé') || text.includes('deportado')) {
      return 'returned';
    }
    if (text.includes('del pueblo') || text.includes('a la ciudad')) {
      return 'internal';
    }
    return 'local';
  }

  /**
   * Assess community support
   */
  private static assessCommunitySupport(text: string): CulturalContext['communitySupport'] {
    if (text.includes('solo') || text.includes('nadie me entiende')) return 'isolated';
    if (text.includes('vecinos') || text.includes('compadres') || 
        text.includes('comunidad')) return 'strong';
    return 'limited';
  }

  /**
   * Identify cultural stressors
   */
  private static identifyCulturalStressors(text: string): string[] {
    const stressors: string[] = [];
    
    if (text.includes('qué dirán') || text.includes('vergüenza')) {
      stressors.push('social_shame');
    }
    if (text.includes('no soy buen') || text.includes('fracasé')) {
      stressors.push('role_failure');
    }
    if (text.includes('mantener a') || text.includes('proveer')) {
      stressors.push('provider_pressure');
    }
    if (text.includes('tradición') || text.includes('costumbre')) {
      stressors.push('tradition_conflict');
    }
    
    return stressors;
  }

  /**
   * Generate culturally adapted support
   */
  static generateCulturallyAdaptedSupport(
    context: CulturalContext,
    mentalHealthNeed: string
  ): CulturallyAdaptedSupport {
    const approach = this.selectCulturalApproach(context, mentalHealthNeed);
    const considerations = this.generateConsiderations(context);
    const resources = this.recommendResources(context, mentalHealthNeed);
    const familyInvolvement = this.determineFamilyInvolvement(context);
    const stigmaAddressing = this.addressStigma(context);
    
    return {
      approach,
      considerations,
      resources,
      familyInvolvement,
      stigmaAddressing
    };
  }

  /**
   * Select culturally appropriate approach
   */
  private static selectCulturalApproach(
    context: CulturalContext,
    need: string
  ): string {
    if (context.familyRole === 'parent' && need === 'anxiety') {
      return 'Enfoque en cómo tu bienestar beneficia a toda tu familia';
    }
    
    if (context.religiousInfluence === 'strong') {
      return 'Integrar fe y ciencia: "Dios también trabaja a través de psicólogos"';
    }
    
    if (context.socioeconomicFactors.includes('economic_stress')) {
      return 'Comenzar con recursos gratuitos y técnicas de autocuidado';
    }
    
    return 'Enfoque holístico respetando valores culturales mexicanos';
  }

  /**
   * Generate cultural considerations
   */
  private static generateConsiderations(context: CulturalContext): string[] {
    const considerations: string[] = [];
    
    // Family role considerations
    if (context.familyRole === 'caregiver') {
      considerations.push('Como cuidador/a, tu salud mental impacta a quienes cuidas');
      considerations.push('Necesitas cuidarte para poder cuidar a otros');
    }
    
    // Socioeconomic considerations
    if (context.socioeconomicFactors.includes('economic_stress')) {
      considerations.push('Hay opciones gratuitas o de bajo costo disponibles');
      considerations.push('Tu salud mental puede mejorar tu situación económica');
    }
    
    // Religious considerations
    if (context.religiousInfluence !== 'none') {
      considerations.push('La ayuda profesional complementa, no reemplaza, tu fe');
    }
    
    // Migration considerations
    if (context.migrationStatus === 'diaspora') {
      considerations.push('El duelo migratorio es real y válido');
      considerations.push('Mantener conexión con raíces mientras te adaptas');
    }
    
    return considerations;
  }

  /**
   * Recommend culturally appropriate resources
   */
  private static recommendResources(
    context: CulturalContext,
    need: string
  ): CulturalResource[] {
    const resources: CulturalResource[] = [];
    
    // Professional resources
    resources.push({
      name: 'Psicólogos en IMSS/ISSSTE',
      type: 'professional',
      description: 'Atención psicológica gratuita con seguro social',
      accessibility: 'free',
      culturalAcceptance: 'growing'
    });
    
    if (context.socioeconomicFactors.length === 0) {
      resources.push({
        name: 'Terapia en línea (Terapify, Selia)',
        type: 'professional',
        description: 'Psicólogos mexicanos en línea, más privacidad',
        accessibility: 'low-cost',
        culturalAcceptance: 'moderate'
      });
    }
    
    // Community resources
    if (context.communitySupport !== 'isolated') {
      resources.push({
        name: 'Grupos de apoyo comunitarios',
        type: 'community',
        description: 'Grupos en centros comunitarios o DIF',
        accessibility: 'free',
        culturalAcceptance: 'high'
      });
    }
    
    // Religious resources if applicable
    if (context.religiousInfluence !== 'none') {
      resources.push({
        name: 'Consejería pastoral',
        type: 'religious',
        description: 'Apoyo espiritual con perspectiva de salud mental',
        accessibility: 'free',
        culturalAcceptance: 'high'
      });
    }
    
    // Traditional resources
    resources.push({
      name: 'Prácticas tradicionales adaptadas',
      type: 'traditional',
      description: 'Temazcal, herbolaria con supervisión médica',
      accessibility: 'varies',
      culturalAcceptance: 'high'
    });
    
    return resources;
  }

  /**
   * Determine family involvement approach
   */
  private static determineFamilyInvolvement(context: CulturalContext): string {
    if (context.familyRole === 'child' && context.culturalStressors.includes('tradition_conflict')) {
      return 'Terapia individual primero, involucrar familia gradualmente si es seguro';
    }
    
    if (context.familyRole === 'parent') {
      return 'Considerar terapia familiar para fortalecer dinámicas saludables';
    }
    
    if (context.communitySupport === 'strong') {
      return 'Aprovechar red de apoyo familiar manteniendo límites sanos';
    }
    
    return 'Balance entre apoyo familiar y espacio personal para sanar';
  }

  /**
   * Address cultural stigma
   */
  private static addressStigma(context: CulturalContext): string[] {
    const stigmaResponses: string[] = [];
    
    // General stigma addressing
    stigmaResponses.push(
      'Ir a terapia es como ir al doctor: previenes problemas mayores'
    );
    
    // Role-specific stigma
    if (context.familyRole === 'parent') {
      stigmaResponses.push(
        'Modelar el cuidado de salud mental enseña a tus hijos que está bien pedir ayuda'
      );
    }
    
    // Gender-specific (inferred from context)
    if (context.culturalStressors.includes('provider_pressure')) {
      stigmaResponses.push(
        'Los hombres fuertes también cuidan su salud mental'
      );
    }
    
    // Economic stigma
    if (context.socioeconomicFactors.includes('economic_stress')) {
      stigmaResponses.push(
        'La salud mental no es lujo, es necesidad básica como la salud física'
      );
    }
    
    return stigmaResponses;
  }

  /**
   * Generate culturally sensitive mental health response
   */
  static generateCulturalResponse(
    support: CulturallyAdaptedSupport,
    originalMessage: string
  ): string {
    const parts: string[] = [];
    
    // Start with cultural approach
    parts.push(support.approach);
    parts.push('');
    
    // Add original message content
    parts.push(originalMessage);
    parts.push('');
    
    // Add cultural considerations
    if (support.considerations.length > 0) {
      parts.push('**Considerando tu contexto:**');
      support.considerations.forEach(consideration => {
        parts.push(`• ${consideration}`);
      });
      parts.push('');
    }
    
    // Add resources
    parts.push('**Recursos disponibles para ti:**');
    support.resources.forEach(resource => {
      parts.push(`• **${resource.name}** - ${resource.description}`);
      if (resource.accessibility === 'free') {
        parts.push('  ✓ Gratuito');
      }
    });
    parts.push('');
    
    // Address stigma
    if (support.stigmaAddressing.length > 0) {
      parts.push('**Recuerda:**');
      support.stigmaAddressing.forEach(message => {
        parts.push(`• ${message}`);
      });
    }
    
    // Family involvement note
    parts.push('');
    parts.push(`**Sobre tu familia:** ${support.familyInvolvement}`);
    
    return parts.join('\n');
  }
}