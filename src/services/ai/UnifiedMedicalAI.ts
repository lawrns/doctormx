/**
 * Unified Medical AI Service
 * Multi-model AI architecture for comprehensive medical assistance
 */

import { AIService } from './AIService';

export interface MedicalAnalysisResult {
  primaryDiagnosis: string;
  confidence: number;
  differentialDiagnoses: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  culturalConsiderations: string[];
  recommendedActions: string[];
  followUpRequired: boolean;
  referralNeeded: boolean;
  mexicanHealthcareContext: {
    imssRecommendations?: string[];
    isssteRecommendations?: string[];
    privateOptions?: string[];
    traditionalMedicineCompatibility?: string;
  };
}

export interface PersonalizedHealthPrediction {
  riskFactors: {
    condition: string;
    risk: number;
    timeframe: string;
    preventionStrategies: string[];
  }[];
  healthScore: number;
  recommendations: {
    lifestyle: string[];
    medical: string[];
    cultural: string[];
  };
  nextCheckups: {
    type: string;
    urgency: string;
    provider: string;
  }[];
}

export interface CulturalHealthContext {
  traditionalMedicineIntegration: boolean;
  familyHealthDynamics: string[];
  socioeconomicFactors: string[];
  regionalHealthBeliefsCompatibility: string[];
  languagePreferences: string[];
}

export interface MultiModalInput {
  text?: string;
  voice?: {
    audioData: ArrayBuffer;
    language: string;
    dialect: string;
  };
  image?: {
    imageData: string;
    type: 'symptom' | 'medication' | 'test_result' | 'general';
  };
  vitals?: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  location?: {
    coordinates: { lat: number; lng: number };
    address: string;
    healthcareAvailability: string[];
  };
}

class UnifiedMedicalAI {
  private primaryAI: AIService;
  private secondaryAI: AIService;
  private culturalContextAI: AIService;
  private emergencyDetectionAI: AIService;

  constructor() {
    this.primaryAI = new AIService('gpt-4-medical');
    this.secondaryAI = new AIService('claude-medical'); 
    this.culturalContextAI = new AIService('gemini-cultural');
    this.emergencyDetectionAI = new AIService('specialized-emergency');
  }

  async analyzeMedicalQuery(
    input: MultiModalInput,
    patientContext: any,
    culturalContext: CulturalHealthContext
  ): Promise<MedicalAnalysisResult> {
    try {
      // Step 1: Emergency Detection
      const emergencyStatus = await this.detectEmergency(input);
      
      if (emergencyStatus.isEmergency) {
        return this.handleEmergencyResponse(input, emergencyStatus);
      }

      // Step 2: Multi-modal Analysis
      const processedInput = await this.processMultiModalInput(input);
      
      // Step 3: Multi-AI Analysis
      const [primaryAnalysis, secondaryAnalysis, culturalAnalysis] = await Promise.all([
        this.primaryAI.analyzeSymptoms(processedInput, patientContext),
        this.secondaryAI.analyzeSymptoms(processedInput, patientContext),
        this.culturalContextAI.analyzeCulturalContext(processedInput, culturalContext)
      ]);

      // Step 4: Consensus Building
      const consensusAnalysis = await this.buildConsensus(
        primaryAnalysis,
        secondaryAnalysis,
        culturalAnalysis
      );

      // Step 5: Mexican Healthcare Integration
      const mexicanHealthcareContext = await this.integrateWithMexicanHealthcare(
        consensusAnalysis,
        input.location
      );

      return {
        ...consensusAnalysis,
        mexicanHealthcareContext,
        culturalConsiderations: culturalAnalysis.considerations,
        urgencyLevel: emergencyStatus.urgencyLevel
      };

    } catch (error) {
      console.error('Error in unified medical analysis:', error);
      throw new Error('No se pudo completar el análisis médico. Por favor, intenta nuevamente.');
    }
  }

  async generatePersonalizedHealthPrediction(
    patientData: any,
    familyHistory: any,
    lifestyle: any,
    environmentalFactors: any
  ): Promise<PersonalizedHealthPrediction> {
    const prompt = `
    Analiza el perfil de salud completo para un paciente mexicano y genera predicciones personalizadas:

    Datos del Paciente: ${JSON.stringify(patientData)}
    Historia Familiar: ${JSON.stringify(familyHistory)}
    Estilo de Vida: ${JSON.stringify(lifestyle)}
    Factores Ambientales: ${JSON.stringify(environmentalFactors)}

    Considera:
    1. Factores genéticos comunes en la población mexicana
    2. Enfermedades prevalentes en México (diabetes, hipertensión, obesidad)
    3. Factores socioeconómicos y culturales
    4. Acceso a atención médica en el sistema mexicano
    5. Medicina tradicional y remedios culturales

    Genera predicciones de riesgo y recomendaciones preventivas culturalmente apropiadas.
    `;

    const analysis = await this.primaryAI.generateContent(prompt);
    return this.parseHealthPrediction(analysis);
  }

  private async detectEmergency(input: MultiModalInput): Promise<{
    isEmergency: boolean;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    immediateActions: string[];
  }> {
    const emergencyKeywords = [
      'dolor de pecho', 'dificultad para respirar', 'sangrado severo',
      'pérdida de conciencia', 'convulsiones', 'dolor intenso',
      'emergencia', 'urgente', 'grave'
    ];

    const inputText = input.text?.toLowerCase() || '';
    const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
      inputText.includes(keyword)
    );

    if (hasEmergencyKeywords || input.vitals?.heartRate && input.vitals.heartRate > 120) {
      return {
        isEmergency: true,
        urgencyLevel: 'emergency',
        immediateActions: [
          'Busca atención médica inmediata',
          'Llama al 911 o acude al servicio de urgencias más cercano',
          'No esperes, tu salud es prioritaria'
        ]
      };
    }

    return {
      isEmergency: false,
      urgencyLevel: 'low',
      immediateActions: []
    };
  }

  private async processMultiModalInput(input: MultiModalInput): Promise<string> {
    let processedContent = '';

    if (input.text) {
      processedContent += `Síntomas descritos: ${input.text}\n`;
    }

    if (input.voice) {
      // Voice processing would be implemented here
      processedContent += `Análisis de voz: [Procesamiento de audio en español mexicano]\n`;
    }

    if (input.image) {
      // Image analysis would be implemented here
      processedContent += `Análisis de imagen médica: ${input.image.type}\n`;
    }

    if (input.vitals) {
      processedContent += `Signos vitales: ${JSON.stringify(input.vitals)}\n`;
    }

    if (input.location) {
      processedContent += `Ubicación: ${input.location.address}\n`;
      processedContent += `Servicios disponibles: ${input.location.healthcareAvailability.join(', ')}\n`;
    }

    return processedContent;
  }

  private async buildConsensus(
    primary: any,
    secondary: any,
    cultural: any
  ): Promise<MedicalAnalysisResult> {
    const consensusPrompt = `
    Analiza las siguientes evaluaciones médicas y genera un consenso:

    Análisis Primario: ${JSON.stringify(primary)}
    Análisis Secundario: ${JSON.stringify(secondary)}
    Contexto Cultural: ${JSON.stringify(cultural)}

    Genera un consenso médico que:
    1. Combine los mejores elementos de cada análisis
    2. Resuelva cualquier discrepancia
    3. Priorice la seguridad del paciente
    4. Considere el contexto cultural mexicano
    5. Proporcione recomendaciones claras y accionables
    `;

    const consensus = await this.primaryAI.generateContent(consensusPrompt);
    return this.parseConsensusResult(consensus);
  }

  private async integrateWithMexicanHealthcare(
    analysis: any,
    location?: any
  ): Promise<any> {
    const integrationPrompt = `
    Integra este análisis médico con el sistema de salud mexicano:

    Análisis: ${JSON.stringify(analysis)}
    Ubicación: ${JSON.stringify(location)}

    Proporciona:
    1. Opciones de atención en IMSS/ISSSTE
    2. Alternativas de sector privado
    3. Centros de salud cercanos
    4. Costos aproximados de tratamiento
    5. Cobertura de seguros disponible
    6. Tiempos de espera estimados
    `;

    const integration = await this.culturalContextAI.generateContent(integrationPrompt);
    return this.parseMexicanHealthcareIntegration(integration);
  }

  private parseHealthPrediction(analysis: string): PersonalizedHealthPrediction {
    // Implementation would parse AI response into structured format
    return {
      riskFactors: [],
      healthScore: 85,
      recommendations: {
        lifestyle: [],
        medical: [],
        cultural: []
      },
      nextCheckups: []
    };
  }

  private parseConsensusResult(consensus: string): MedicalAnalysisResult {
    // Implementation would parse consensus into structured format
    return {
      primaryDiagnosis: '',
      confidence: 0,
      differentialDiagnoses: [],
      urgencyLevel: 'low',
      culturalConsiderations: [],
      recommendedActions: [],
      followUpRequired: false,
      referralNeeded: false,
      mexicanHealthcareContext: {}
    };
  }

  private parseMexicanHealthcareIntegration(integration: string): any {
    // Implementation would parse integration response
    return {
      imssRecommendations: [],
      isssteRecommendations: [],
      privateOptions: [],
      traditionalMedicineCompatibility: ''
    };
  }

  private async handleEmergencyResponse(
    input: MultiModalInput,
    emergencyStatus: any
  ): Promise<MedicalAnalysisResult> {
    return {
      primaryDiagnosis: 'Situación de emergencia detectada',
      confidence: 95,
      differentialDiagnoses: [],
      urgencyLevel: 'emergency',
      culturalConsiderations: [
        'Busca atención médica inmediata',
        'La familia debe estar informada',
        'Considera tradiciones culturales durante la emergencia'
      ],
      recommendedActions: emergencyStatus.immediateActions,
      followUpRequired: true,
      referralNeeded: true,
      mexicanHealthcareContext: {
        imssRecommendations: ['Acude al servicio de urgencias IMSS más cercano'],
        isssteRecommendations: ['Utiliza el servicio de urgencias ISSSTE'],
        privateOptions: ['Cruz Roja', 'Hospital privado con urgencias 24/7']
      }
    };
  }
}

export default UnifiedMedicalAI;