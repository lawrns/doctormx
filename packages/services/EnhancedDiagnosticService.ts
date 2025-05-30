/**
 * EnhancedDiagnosticService - Phase 1 integration service for DoctorMX
 * Combines herb recommendations, red flag detection, and enhanced prompts
 */

import { herbService } from './HerbService';
import { redFlagDetectionService } from './RedFlagDetectionService';
import { featureFlagService } from './FeatureFlagService';
import type { 
  Herb, 
  SymptomData, 
  Diagnosis, 
  RedFlag, 
  DiagnosticRecommendation 
} from '@pkg/types';

interface EnhancedDiagnosticInput {
  userMessage: string;
  symptoms?: SymptomData[];
  imageUrl?: string;
  patientAge?: number;
  patientGender?: string;
  sessionId: string;
  userId?: string;
}

interface EnhancedDiagnosticOutput {
  text: string;
  redFlags: RedFlag[];
  recommendations: DiagnosticRecommendation[];
  herbRecommendations: {
    primary: Herb[];
    secondary: Herb[];
    cautions: string[];
  };
  severity: number;
  isEmergency: boolean;
  confidence: number;
  suggestedSpecialty?: string;
  followUpInstructions: string[];
  mexicanContext: string;
}

export class EnhancedDiagnosticService {
  private static instance: EnhancedDiagnosticService;

  static getInstance(): EnhancedDiagnosticService {
    if (!EnhancedDiagnosticService.instance) {
      EnhancedDiagnosticService.instance = new EnhancedDiagnosticService();
    }
    return EnhancedDiagnosticService.instance;
  }

  /**
   * Main diagnostic flow integrating all Phase 1 enhancements
   */
  async processDiagnosticRequest(input: EnhancedDiagnosticInput): Promise<EnhancedDiagnosticOutput> {
    console.log('🔬 EnhancedDiagnosticService processing:', input.userMessage.substring(0, 100));

    // Check feature flags
    const flags = await featureFlagService.getFeatureFlags(input.userId, input.sessionId);
    
    try {
      // Step 1: Red flag detection (always enabled for safety)
      const redFlags = this.detectRedFlags(input);
      console.log('🚩 Red flags detected:', redFlags.length);

      // Step 2: Analyze symptoms and extract conditions
      const symptomAnalysis = this.analyzeSymptoms(input.userMessage, input.symptoms);
      console.log('🔍 Symptom analysis:', symptomAnalysis);

      // Step 3: Get herb recommendations if feature enabled
      let herbRecommendations = { primary: [], secondary: [], cautions: [] };
      if (flags.herbDatabase) {
        herbRecommendations = await this.getHerbRecommendations(symptomAnalysis.conditions);
        console.log('🌿 Herb recommendations:', herbRecommendations);
      }

      // Step 4: Generate enhanced response
      const response = await this.generateEnhancedResponse(
        input,
        redFlags,
        symptomAnalysis,
        herbRecommendations,
        flags
      );

      return response;

    } catch (error) {
      console.error('❌ Enhanced diagnostic error:', error);
      
      // Fallback response
      return {
        text: 'Lo siento, hubo un problema al procesar tu consulta. Por favor, intenta nuevamente o busca atención médica si es urgente.',
        redFlags: [],
        recommendations: [],
        herbRecommendations: { primary: [], secondary: [], cautions: [] },
        severity: 5,
        isEmergency: false,
        confidence: 0,
        followUpInstructions: ['Intentar nuevamente', 'Buscar atención médica si persisten los síntomas'],
        mexicanContext: 'En caso de emergencia, llamar al 911 o Cruz Roja 065'
      };
    }
  }

  /**
   * Detect red flags in the input
   */
  private detectRedFlags(input: EnhancedDiagnosticInput): RedFlag[] {
    const textFlags = redFlagDetectionService.analyzeText(input.userMessage, input.patientAge);
    
    if (input.symptoms && input.symptoms.length > 0) {
      const symptomFlags = redFlagDetectionService.analyzeSymptoms(input.symptoms, input.patientAge);
      return [...textFlags, ...symptomFlags];
    }

    return textFlags;
  }

  /**
   * Analyze symptoms to extract conditions and severity
   */
  private analyzeSymptoms(userMessage: string, symptoms?: SymptomData[]): {
    conditions: string[];
    severity: number;
    urgency: number;
  } {
    const conditions: string[] = [];
    let maxSeverity = 1;
    let urgency = 1;

    // Extract conditions from text (simple keyword matching for Phase 1)
    const conditionKeywords = {
      'dolor de cabeza': ['headache', 'migraine', 'cefalea'],
      'fiebre': ['fever', 'temperature'],
      'náuseas': ['nausea', 'vomiting'],
      'tos': ['cough', 'respiratory'],
      'dolor abdominal': ['stomach', 'abdominal', 'digestive'],
      'fatiga': ['fatigue', 'tiredness'],
      'mareos': ['dizziness', 'vertigo'],
      'dolor muscular': ['muscle pain', 'myalgia'],
      'inflamación': ['inflammation', 'swelling'],
      'ansiedad': ['anxiety', 'stress'],
      'insomnio': ['insomnia', 'sleep'],
      'digestivo': ['digestive', 'gastric']
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [condition, keywords] of Object.entries(conditionKeywords)) {
      const found = keywords.some(keyword => 
        lowerMessage.includes(keyword) || lowerMessage.includes(condition)
      );
      if (found) {
        conditions.push(condition);
      }
    }

    // Analyze structured symptoms if provided
    if (symptoms && symptoms.length > 0) {
      symptoms.forEach(symptom => {
        conditions.push(symptom.name);
        maxSeverity = Math.max(maxSeverity, symptom.severity);
        
        // Determine urgency based on duration and severity
        if (symptom.severity >= 8) urgency = Math.max(urgency, 8);
        if (symptom.duration.includes('súbito') || symptom.duration.includes('repentino')) {
          urgency = Math.max(urgency, 7);
        }
      });
    }

    // Analyze urgency keywords in text
    const urgencyKeywords = ['intenso', 'severo', 'insoportable', 'emergencia', 'urgente'];
    urgencyKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        urgency = Math.max(urgency, 6);
      }
    });

    return {
      conditions: [...new Set(conditions)], // Remove duplicates
      severity: maxSeverity,
      urgency
    };
  }

  /**
   * Get herb recommendations for detected conditions
   */
  private async getHerbRecommendations(conditions: string[]): Promise<{
    primary: Herb[];
    secondary: Herb[];
    cautions: string[];
  }> {
    if (conditions.length === 0) {
      return { primary: [], secondary: [], cautions: [] };
    }

    try {
      return await herbService.getRecommendationsForSymptoms(conditions);
    } catch (error) {
      console.error('Error getting herb recommendations:', error);
      return { primary: [], secondary: [], cautions: [] };
    }
  }

  /**
   * Generate enhanced response incorporating all analysis
   */
  private async generateEnhancedResponse(
    input: EnhancedDiagnosticInput,
    redFlags: RedFlag[],
    symptomAnalysis: any,
    herbRecommendations: any,
    flags: any
  ): Promise<EnhancedDiagnosticOutput> {
    
    const isEmergency = redFlags.some(flag => flag.type === 'emergency');
    const hasUrgentFlags = redFlags.some(flag => flag.type === 'urgent');
    
    // Calculate overall severity
    let severity = Math.max(
      symptomAnalysis.severity,
      symptomAnalysis.urgency,
      redFlags.length > 0 ? Math.max(...redFlags.map(f => f.severity)) : 1
    );

    // Build response text
    let responseText = this.buildResponseText(
      input,
      redFlags,
      symptomAnalysis,
      herbRecommendations,
      isEmergency,
      flags
    );

    // Build recommendations
    const recommendations = this.buildRecommendations(
      redFlags,
      symptomAnalysis,
      herbRecommendations,
      flags
    );

    // Determine specialty
    const suggestedSpecialty = this.determineSuggestedSpecialty(
      symptomAnalysis.conditions,
      redFlags
    );

    // Build follow-up instructions
    const followUpInstructions = this.buildFollowUpInstructions(
      redFlags,
      severity,
      symptomAnalysis.conditions
    );

    return {
      text: responseText,
      redFlags,
      recommendations,
      herbRecommendations,
      severity,
      isEmergency,
      confidence: this.calculateConfidence(symptomAnalysis, redFlags),
      suggestedSpecialty,
      followUpInstructions,
      mexicanContext: this.getMexicanContext(redFlags, symptomAnalysis.conditions)
    };
  }

  /**
   * Build the main response text
   */
  private buildResponseText(
    input: EnhancedDiagnosticInput,
    redFlags: RedFlag[],
    symptomAnalysis: any,
    herbRecommendations: any,
    isEmergency: boolean,
    flags: any
  ): string {
    let response = '';

    // Emergency handling
    if (isEmergency) {
      response += '🚨 **ATENCIÓN URGENTE**: He detectado síntomas que requieren atención médica inmediata.\n\n';
      response += '**Acción inmediata**: Llamar al 911 o acudir al hospital más cercano.\n\n';
      return response + 'No demores en buscar atención profesional. Tu seguridad es lo más importante.';
    }

    // Standard response
    response += 'Hola, soy Dr. Simeon. He analizado tu consulta y aquí está mi evaluación:\n\n';

    // Symptom summary
    if (symptomAnalysis.conditions.length > 0) {
      response += `**Síntomas principales identificados**: ${symptomAnalysis.conditions.join(', ')}\n\n`;
    }

    // Red flags (non-emergency)
    if (redFlags.length > 0) {
      const urgentFlags = redFlags.filter(f => f.type === 'urgent');
      const warningFlags = redFlags.filter(f => f.type === 'warning');
      
      if (urgentFlags.length > 0) {
        response += '⚠️ **Señales de alerta detectadas**:\n';
        urgentFlags.forEach(flag => {
          response += `- ${flag.description}\n`;
        });
        response += '\n**Recomendación**: Buscar atención médica en las próximas 24 horas.\n\n';
      }

      if (warningFlags.length > 0) {
        response += '💡 **Aspectos a monitorear**:\n';
        warningFlags.forEach(flag => {
          response += `- ${flag.description}\n`;
        });
        response += '\n';
      }
    }

    // Herb recommendations if enabled
    if (flags.herbDatabase && herbRecommendations.primary.length > 0) {
      response += '🌿 **Opciones de medicina tradicional mexicana**:\n\n';
      
      if (herbRecommendations.primary.length > 0) {
        response += '**Remedios principales** (con evidencia científica):\n';
        herbRecommendations.primary.forEach((herb: Herb) => {
          response += `- **${herb.commonNames[0] || herb.latinName}**: ${herb.traditionalUses.slice(0, 2).join(', ')}\n`;
        });
        response += '\n';
      }

      if (herbRecommendations.secondary.length > 0) {
        response += '**Remedios complementarios**:\n';
        herbRecommendations.secondary.forEach((herb: Herb) => {
          response += `- **${herb.commonNames[0] || herb.latinName}**: ${herb.traditionalUses.slice(0, 1).join(', ')}\n`;
        });
        response += '\n';
      }

      if (herbRecommendations.cautions.length > 0) {
        response += '⚠️ **Precauciones importantes**:\n';
        herbRecommendations.cautions.forEach((caution: string) => {
          response += `- ${caution}\n`;
        });
        response += '\n';
      }
    }

    // General advice
    response += '**Recomendaciones generales**:\n';
    response += '- Mantente hidratado con agua y tés naturales\n';
    response += '- Descansa lo suficiente\n';
    response += '- Lleva una alimentación balanceada\n';
    response += '- Evita el estrés excesivo\n\n';

    response += '*Recuerda: Esta evaluación es orientativa. Siempre consulta con un profesional de la salud para un diagnóstico definitivo.*';

    return response;
  }

  /**
   * Build diagnostic recommendations
   */
  private buildRecommendations(
    redFlags: RedFlag[],
    symptomAnalysis: any,
    herbRecommendations: any,
    flags: any
  ): DiagnosticRecommendation[] {
    const recommendations: DiagnosticRecommendation[] = [];

    // Medical recommendations based on red flags
    if (redFlags.some(f => f.type === 'urgent')) {
      recommendations.push({
        type: 'referral',
        title: 'Evaluación médica urgente',
        description: 'Síntomas que requieren atención médica profesional',
        priority: 'high',
        specialtyReferral: 'medicina general'
      });
    }

    // Herb recommendations if enabled
    if (flags.herbDatabase && herbRecommendations.primary.length > 0) {
      recommendations.push({
        type: 'herb',
        title: 'Medicina tradicional mexicana',
        description: 'Remedios herbales con respaldo científico',
        priority: 'medium',
        herbIds: herbRecommendations.primary.map((h: Herb) => h.id)
      });
    }

    // Lifestyle recommendations
    if (symptomAnalysis.conditions.includes('estrés') || symptomAnalysis.conditions.includes('ansiedad')) {
      recommendations.push({
        type: 'lifestyle',
        title: 'Manejo del estrés',
        description: 'Técnicas de relajación y mindfulness',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Determine suggested medical specialty
   */
  private determineSuggestedSpecialty(
    conditions: string[],
    redFlags: RedFlag[]
  ): string | undefined {
    // Emergency cases
    if (redFlags.some(f => f.type === 'emergency')) {
      return 'medicina de urgencias';
    }

    // Specialty mapping based on conditions
    const specialtyMap: Record<string, string> = {
      'dolor de cabeza': 'neurología',
      'dolor abdominal': 'gastroenterología',
      'tos': 'neumología',
      'dolor muscular': 'reumatología',
      'ansiedad': 'psiquiatría',
      'insomnio': 'medicina del sueño',
      'mareos': 'otorrinolaringología'
    };

    for (const condition of conditions) {
      if (specialtyMap[condition]) {
        return specialtyMap[condition];
      }
    }

    // Default for urgent cases
    if (redFlags.some(f => f.type === 'urgent')) {
      return 'medicina general';
    }

    return undefined;
  }

  /**
   * Build follow-up instructions
   */
  private buildFollowUpInstructions(
    redFlags: RedFlag[],
    severity: number,
    conditions: string[]
  ): string[] {
    const instructions: string[] = [];

    if (redFlags.some(f => f.type === 'emergency')) {
      instructions.push('Llamar al 911 inmediatamente');
      instructions.push('No esperar - acudir al hospital más cercano');
      return instructions;
    }

    if (redFlags.some(f => f.type === 'urgent')) {
      instructions.push('Programar cita médica en las próximas 24-48 horas');
      instructions.push('Monitorear síntomas de cerca');
    } else if (severity >= 6) {
      instructions.push('Considerar consulta médica en 1-2 semanas');
      instructions.push('Vigilar evolución de síntomas');
    } else {
      instructions.push('Monitorear síntomas por 1 semana');
      instructions.push('Buscar atención si empeoran');
    }

    // Condition-specific follow-up
    if (conditions.includes('fiebre')) {
      instructions.push('Tomar temperatura cada 4-6 horas');
    }

    if (conditions.includes('dolor')) {
      instructions.push('Registrar intensidad del dolor (escala 1-10)');
    }

    instructions.push('Mantener registro de síntomas');
    instructions.push('Contactar al médico si aparecen síntomas nuevos');

    return instructions;
  }

  /**
   * Get Mexican-specific context
   */
  private getMexicanContext(redFlags: RedFlag[], conditions: string[]): string {
    let context = 'Información específica para México:\n';
    
    if (redFlags.some(f => f.type === 'emergency')) {
      context += '• Emergencias: 911\n';
      context += '• Cruz Roja: 065\n';
      context += '• Locatel CDMX: 5658 1111\n';
    } else {
      context += '• Consulta IMSS/ISSSTE para afiliados\n';
      context += '• Centros de Salud públicos disponibles\n';
      context += '• Farmacias con consulta médica\n';
    }

    // Seasonal considerations
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12

    if (month >= 6 && month <= 10) { // Rainy season
      if (conditions.includes('fiebre')) {
        context += '• Temporada de lluvias: considerar dengue/chikungunya\n';
      }
    }

    if (month >= 11 || month <= 2) { // Cold season
      if (conditions.includes('tos') || conditions.includes('fiebre')) {
        context += '• Temporada de frío: influenza y COVID-19 más comunes\n';
      }
    }

    return context;
  }

  /**
   * Calculate diagnostic confidence
   */
  private calculateConfidence(symptomAnalysis: any, redFlags: RedFlag[]): number {
    let confidence = 0.5; // Base confidence

    // More symptoms = higher confidence
    if (symptomAnalysis.conditions.length >= 3) confidence += 0.2;
    if (symptomAnalysis.conditions.length >= 5) confidence += 0.1;

    // Clear red flags = higher confidence
    if (redFlags.length > 0) confidence += 0.2;

    // High severity = higher confidence in urgency
    if (symptomAnalysis.severity >= 7) confidence += 0.15;

    return Math.min(confidence, 0.95); // Cap at 95%
  }
}

export const enhancedDiagnosticService = EnhancedDiagnosticService.getInstance();