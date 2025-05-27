/**
 * Holistic health service integrating physical and mental health
 * Recognizes mind-body connections in Mexican healthcare context
 */

export interface HolisticAssessment {
  physicalSymptoms: PhysicalSymptom[];
  psychologicalFactors: PsychologicalFactor[];
  lifestyle: LifestyleFactors;
  connections: MindBodyConnection[];
  recommendations: HolisticRecommendation[];
  culturalConsiderations: string[];
}

export interface PhysicalSymptom {
  name: string;
  severity: number;
  duration: string;
  psychosomaticProbability: number;
}

export interface PsychologicalFactor {
  type: 'stress' | 'anxiety' | 'depression' | 'trauma' | 'grief';
  level: 'mild' | 'moderate' | 'severe';
  physicalManifestations: string[];
}

export interface LifestyleFactors {
  sleep: 'poor' | 'fair' | 'good';
  exercise: 'none' | 'occasional' | 'regular';
  diet: 'poor' | 'fair' | 'balanced';
  socialSupport: 'isolated' | 'limited' | 'strong';
  workStress: 'low' | 'moderate' | 'high';
}

export interface MindBodyConnection {
  physicalSymptom: string;
  psychologicalCause: string;
  explanation: string;
  confidence: number;
}

export interface HolisticRecommendation {
  category: 'medical' | 'psychological' | 'lifestyle' | 'social' | 'spiritual';
  action: string;
  rationale: string;
  priority: 'immediate' | 'soon' | 'ongoing';
  culturallyApproved: boolean;
}

export class HolisticHealthService {
  // Common psychosomatic connections in Mexican population
  private static readonly PSYCHOSOMATIC_PATTERNS = [
    {
      symptoms: ['dolor de cabeza', 'migraña'],
      psychFactors: ['estrés', 'ansiedad', 'tensión'],
      probability: 0.7,
      explanation: 'El estrés y la tensión emocional frecuentemente causan dolores de cabeza tensionales'
    },
    {
      symptoms: ['dolor de estómago', 'gastritis', 'colitis'],
      psychFactors: ['ansiedad', 'nervios', 'preocupación'],
      probability: 0.8,
      explanation: 'Los "nervios" afectan directamente el sistema digestivo, común en cultura mexicana'
    },
    {
      symptoms: ['insomnio', 'fatiga', 'cansancio'],
      psychFactors: ['depresión', 'ansiedad', 'preocupación'],
      probability: 0.85,
      explanation: 'Los problemas emocionales alteran el sueño y causan fatiga crónica'
    },
    {
      symptoms: ['dolor de espalda', 'tensión muscular'],
      psychFactors: ['estrés', 'carga emocional', 'responsabilidades'],
      probability: 0.6,
      explanation: 'Cargamos el estrés en la espalda, literalmente'
    },
    {
      symptoms: ['palpitaciones', 'opresión en pecho'],
      psychFactors: ['ansiedad', 'pánico', 'miedo'],
      probability: 0.75,
      explanation: 'La ansiedad puede simular problemas cardíacos'
    }
  ];

  // Mexican cultural expressions of distress
  private static readonly CULTURAL_IDIOMS = {
    'susto': {
      symptoms: ['insomnio', 'pérdida de apetito', 'debilidad'],
      treatment: 'Combinar medicina moderna con apoyo emocional/espiritual'
    },
    'empacho': {
      symptoms: ['dolor abdominal', 'náusea', 'malestar'],
      treatment: 'Evaluar dieta y estrés emocional'
    },
    'nervios': {
      symptoms: ['ansiedad', 'síntomas físicos diversos'],
      treatment: 'Terapia integral considerando contexto familiar'
    },
    'coraje': {
      symptoms: ['dolor de cabeza', 'problemas digestivos'],
      treatment: 'Manejo de emociones y técnicas de relajación'
    }
  };

  /**
   * Perform holistic assessment
   */
  static assessHolistically(
    symptoms: string[],
    userHistory: string[],
    emotionalState?: string
  ): HolisticAssessment {
    // Analyze physical symptoms
    const physicalSymptoms = this.analyzePhysicalSymptoms(symptoms);
    
    // Detect psychological factors
    const psychologicalFactors = this.detectPsychologicalFactors(
      userHistory,
      emotionalState
    );
    
    // Assess lifestyle from conversation
    const lifestyle = this.assessLifestyle(userHistory);
    
    // Find mind-body connections
    const connections = this.findMindBodyConnections(
      physicalSymptoms,
      psychologicalFactors
    );
    
    // Generate holistic recommendations
    const recommendations = this.generateHolisticRecommendations(
      physicalSymptoms,
      psychologicalFactors,
      lifestyle,
      connections
    );
    
    // Add cultural considerations
    const culturalConsiderations = this.getCulturalConsiderations(symptoms);
    
    return {
      physicalSymptoms,
      psychologicalFactors,
      lifestyle,
      connections,
      recommendations,
      culturalConsiderations
    };
  }

  /**
   * Analyze physical symptoms for psychosomatic probability
   */
  private static analyzePhysicalSymptoms(symptoms: string[]): PhysicalSymptom[] {
    return symptoms.map(symptom => {
      const psychosomaticPattern = this.PSYCHOSOMATIC_PATTERNS.find(pattern =>
        pattern.symptoms.some(s => symptom.toLowerCase().includes(s))
      );
      
      return {
        name: symptom,
        severity: 5, // Default, should be extracted from conversation
        duration: 'unknown',
        psychosomaticProbability: psychosomaticPattern?.probability || 0.3
      };
    });
  }

  /**
   * Detect psychological factors from conversation
   */
  private static detectPsychologicalFactors(
    history: string[],
    emotionalState?: string
  ): PsychologicalFactor[] {
    const factors: PsychologicalFactor[] = [];
    const fullHistory = history.join(' ').toLowerCase();
    
    // Stress detection
    if (fullHistory.includes('trabajo') || fullHistory.includes('presión') ||
        fullHistory.includes('responsabilidad')) {
      factors.push({
        type: 'stress',
        level: this.assessSeverity(fullHistory, 'stress'),
        physicalManifestations: ['dolor de cabeza', 'tensión muscular', 'fatiga']
      });
    }
    
    // Anxiety detection
    if (fullHistory.includes('nervios') || fullHistory.includes('preocup') ||
        emotionalState === 'anxious') {
      factors.push({
        type: 'anxiety',
        level: this.assessSeverity(fullHistory, 'anxiety'),
        physicalManifestations: ['palpitaciones', 'sudoración', 'dolor de estómago']
      });
    }
    
    // Depression detection
    if (fullHistory.includes('triste') || fullHistory.includes('sin ánimo') ||
        fullHistory.includes('cansado todo el tiempo')) {
      factors.push({
        type: 'depression',
        level: this.assessSeverity(fullHistory, 'depression'),
        physicalManifestations: ['fatiga', 'dolor generalizado', 'cambios de apetito']
      });
    }
    
    return factors;
  }

  /**
   * Assess severity of psychological factor
   */
  private static assessSeverity(
    text: string,
    factor: string
  ): 'mild' | 'moderate' | 'severe' {
    const severeMarkers = ['no puedo más', 'insoportable', 'todo el tiempo', 'siempre'];
    const moderateMarkers = ['frecuente', 'varios días', 'a veces', 'últimamente'];
    
    if (severeMarkers.some(marker => text.includes(marker))) return 'severe';
    if (moderateMarkers.some(marker => text.includes(marker))) return 'moderate';
    return 'mild';
  }

  /**
   * Assess lifestyle factors from conversation
   */
  private static assessLifestyle(history: string[]): LifestyleFactors {
    const fullHistory = history.join(' ').toLowerCase();
    
    return {
      sleep: this.assessSleep(fullHistory),
      exercise: this.assessExercise(fullHistory),
      diet: this.assessDiet(fullHistory),
      socialSupport: this.assessSocialSupport(fullHistory),
      workStress: this.assessWorkStress(fullHistory)
    };
  }

  private static assessSleep(text: string): 'poor' | 'fair' | 'good' {
    if (text.includes('no duermo') || text.includes('insomnio')) return 'poor';
    if (text.includes('duermo poco') || text.includes('despierto')) return 'fair';
    return 'good';
  }

  private static assessExercise(text: string): 'none' | 'occasional' | 'regular' {
    if (text.includes('no hago ejercicio') || text.includes('sedentario')) return 'none';
    if (text.includes('camino') || text.includes('a veces')) return 'occasional';
    return 'occasional'; // Default
  }

  private static assessDiet(text: string): 'poor' | 'fair' | 'balanced' {
    if (text.includes('como mal') || text.includes('comida rápida')) return 'poor';
    if (text.includes('trato de comer bien')) return 'fair';
    return 'fair'; // Default
  }

  private static assessSocialSupport(text: string): 'isolated' | 'limited' | 'strong' {
    if (text.includes('solo') || text.includes('nadie')) return 'isolated';
    if (text.includes('familia') && !text.includes('problema')) return 'strong';
    return 'limited'; // Default
  }

  private static assessWorkStress(text: string): 'low' | 'moderate' | 'high' {
    if (text.includes('mucho trabajo') || text.includes('presión laboral')) return 'high';
    if (text.includes('trabajo')) return 'moderate';
    return 'moderate'; // Default
  }

  /**
   * Find mind-body connections
   */
  private static findMindBodyConnections(
    physical: PhysicalSymptom[],
    psychological: PsychologicalFactor[]
  ): MindBodyConnection[] {
    const connections: MindBodyConnection[] = [];
    
    physical.forEach(symptom => {
      if (symptom.psychosomaticProbability > 0.5) {
        const pattern = this.PSYCHOSOMATIC_PATTERNS.find(p =>
          p.symptoms.some(s => symptom.name.toLowerCase().includes(s))
        );
        
        if (pattern) {
          const relatedPsych = psychological.find(p =>
            pattern.psychFactors.includes(p.type)
          );
          
          if (relatedPsych) {
            connections.push({
              physicalSymptom: symptom.name,
              psychologicalCause: relatedPsych.type,
              explanation: pattern.explanation,
              confidence: pattern.probability
            });
          }
        }
      }
    });
    
    return connections;
  }

  /**
   * Generate holistic recommendations
   */
  private static generateHolisticRecommendations(
    physical: PhysicalSymptom[],
    psychological: PsychologicalFactor[],
    lifestyle: LifestyleFactors,
    connections: MindBodyConnection[]
  ): HolisticRecommendation[] {
    const recommendations: HolisticRecommendation[] = [];
    
    // Medical recommendations for physical symptoms
    physical.forEach(symptom => {
      if (symptom.psychosomaticProbability < 0.5) {
        recommendations.push({
          category: 'medical',
          action: `Consulta médica para evaluar ${symptom.name}`,
          rationale: 'Descartar causas físicas antes de considerar factores emocionales',
          priority: symptom.severity > 7 ? 'immediate' : 'soon',
          culturallyApproved: true
        });
      }
    });
    
    // Psychological recommendations
    if (psychological.length > 0) {
      const severity = psychological.some(p => p.level === 'severe');
      recommendations.push({
        category: 'psychological',
        action: severity ? 
          'Buscar apoyo psicológico profesional urgentemente' :
          'Considerar terapia psicológica para manejo emocional',
        rationale: 'Tu bienestar emocional afecta directamente tu salud física',
        priority: severity ? 'immediate' : 'soon',
        culturallyApproved: true
      });
    }
    
    // Lifestyle recommendations
    if (lifestyle.sleep === 'poor') {
      recommendations.push({
        category: 'lifestyle',
        action: 'Establecer rutina de sueño: mismo horario, sin pantallas 1h antes',
        rationale: 'El sueño es fundamental para la salud física y mental',
        priority: 'soon',
        culturallyApproved: true
      });
    }
    
    if (lifestyle.exercise === 'none') {
      recommendations.push({
        category: 'lifestyle',
        action: 'Caminar 20 minutos diarios, preferiblemente en la mañana',
        rationale: 'El ejercicio mejora el ánimo y reduce síntomas físicos',
        priority: 'ongoing',
        culturallyApproved: true
      });
    }
    
    // Social recommendations
    if (lifestyle.socialSupport === 'isolated') {
      recommendations.push({
        category: 'social',
        action: 'Reconectar con familia o amigos, unirse a grupo comunitario',
        rationale: 'El apoyo social es medicina preventiva en nuestra cultura',
        priority: 'soon',
        culturallyApproved: true
      });
    }
    
    // Spiritual recommendations (culturally sensitive)
    if (connections.length > 0) {
      recommendations.push({
        category: 'spiritual',
        action: 'Prácticas de relajación: meditación, oración, o lo que te dé paz',
        rationale: 'La paz espiritual contribuye a la sanación integral',
        priority: 'ongoing',
        culturallyApproved: true
      });
    }
    
    return recommendations;
  }

  /**
   * Get cultural considerations
   */
  private static getCulturalConsiderations(symptoms: string[]): string[] {
    const considerations: string[] = [];
    const symptomText = symptoms.join(' ').toLowerCase();
    
    // Check for cultural idioms
    Object.entries(this.CULTURAL_IDIOMS).forEach(([idiom, info]) => {
      if (symptomText.includes(idiom) || 
          info.symptoms.some(s => symptomText.includes(s))) {
        considerations.push(
          `En nuestra cultura, estos síntomas pueden relacionarse con "${idiom}". ${info.treatment}`
        );
      }
    });
    
    // General cultural considerations
    if (symptoms.some(s => s.includes('nervios'))) {
      considerations.push(
        'Los "nervios" son una forma culturalmente válida de expresar malestar emocional'
      );
    }
    
    if (symptoms.length > 3) {
      considerations.push(
        'Múltiples síntomas pueden indicar "desgaste" por responsabilidades familiares/laborales'
      );
    }
    
    return considerations;
  }

  /**
   * Generate holistic response
   */
  static generateHolisticResponse(assessment: HolisticAssessment): string {
    const parts: string[] = [];
    
    // Acknowledge mind-body connection if present
    if (assessment.connections.length > 0) {
      parts.push('Veo una conexión importante entre tu estado emocional y tus síntomas físicos.\n');
      
      assessment.connections.forEach(conn => {
        parts.push(`• ${conn.explanation}`);
      });
      parts.push('');
    }
    
    // Present recommendations by priority
    const immediateRecs = assessment.recommendations.filter(r => r.priority === 'immediate');
    const soonRecs = assessment.recommendations.filter(r => r.priority === 'soon');
    const ongoingRecs = assessment.recommendations.filter(r => r.priority === 'ongoing');
    
    if (immediateRecs.length > 0) {
      parts.push('**Acciones inmediatas:**');
      immediateRecs.forEach(rec => {
        parts.push(`• ${rec.action}`);
        parts.push(`  (${rec.rationale})`);
      });
      parts.push('');
    }
    
    if (soonRecs.length > 0) {
      parts.push('**Próximos pasos:**');
      soonRecs.forEach(rec => {
        parts.push(`• ${rec.action}`);
      });
      parts.push('');
    }
    
    if (ongoingRecs.length > 0) {
      parts.push('**Para tu bienestar continuo:**');
      ongoingRecs.forEach(rec => {
        parts.push(`• ${rec.action}`);
      });
      parts.push('');
    }
    
    // Add cultural considerations if any
    if (assessment.culturalConsiderations.length > 0) {
      parts.push('**Consideraciones culturales:**');
      assessment.culturalConsiderations.forEach(consideration => {
        parts.push(`• ${consideration}`);
      });
    }
    
    return parts.join('\n');
  }
}