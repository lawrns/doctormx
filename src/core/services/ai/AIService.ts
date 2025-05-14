import { supabase } from '../../../lib/supabaseClient';

export interface AIResponse {
  text: string;
  severity?: number;
  isEmergency?: boolean;
  suggestedSpecialty?: string;
  suggestedConditions?: string[];
  followUpQuestions?: string[];
  imageAnalysis?: {
    findings: string;
    confidence: number;
  };
}

export interface AIQueryOptions {
  userMessage: string;
  userHistory?: string[];
  userProfile?: any;
  imageUrl?: string;
  severity?: number;
  usePremiumModel?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

class AIService {
  private supabase;
  // This endpoint is currently unused but may be needed in the future
  // private apiEndpoint = import.meta.env.VITE_REACT_APP_AI_API_ENDPOINT || '';
  private standardModelEndpoint = '/api/v1/standard-model';
  private premiumModelEndpoint = '/api/v1/premium-model';
  private imageAnalysisEndpoint = '/api/v1/image-analysis';

  constructor() {
    // Use the centralized Supabase client instead of creating a new one
    this.supabase = supabase;
  }

  /**
   * Process a user query with the appropriate AI model based on complexity
   * Uses a tiered approach: GPT-3.5-Turbo for triage, GPT-4 for complex cases
   */
  async processQuery(options: AIQueryOptions): Promise<AIResponse> {
    const needsPremiumModel = this.shouldUsePremiumModel(options);
    
    try {
      const medicalContext = await this.getMedicalKnowledge(options.userMessage);
      
      const requestData = {
        message: options.userMessage,
        history: options.userHistory || [],
        medicalContext,
        userProfile: options.userProfile,
        severity: options.severity,
      };
      
      const endpoint = needsPremiumModel ? this.premiumModelEndpoint : this.standardModelEndpoint;
      const response = await this.makeAPIRequest(endpoint, requestData);
      
      return this.enhanceResponse(response, options);
    } catch (error) {
      console.error('Error processing AI query:', error);
      return {
        text: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente en unos momentos.',
        severity: options.severity,
      };
    }
  }
  
  /**
   * Analyze a medical image and provide insights
   */
  async analyzeImage(imageUrl: string, symptoms?: string): Promise<AIResponse> {
    try {
      console.log('Analyzing image with symptoms:', symptoms);
      
      // For demo purposes, we'll use a simulated API response
      // In production, this would call an actual AI image analysis API
      const response = await this.makeAPIRequest(this.imageAnalysisEndpoint, {
        imageUrl,
        symptoms,
      });
      
      console.log('Image analysis response:', response);
      
      return {
        text: response.analysis,
        imageAnalysis: {
          findings: response.findings || 'No se encontraron hallazgos específicos',
          confidence: response.confidence || 0.5,
        },
        severity: response.severity || 30,
        suggestedSpecialty: response.suggestedSpecialty || 'Medicina General',
        suggestedConditions: response.suggestedConditions || [],
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        text: 'No se pudo analizar la imagen. Por favor, intenta con otra imagen o describe tus síntomas.',
        imageAnalysis: {
          findings: 'Error en el análisis',
          confidence: 0,
        },
        severity: 0,
      };
    }
  }
  
  /**
   * Find nearby healthcare providers based on AI diagnosis
   */
  async findNearbyProviders(specialty: string, location: { latitude: number; longitude: number }): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('doctors')
        .select('*')
        .eq('specialty', specialty)
        .order('distance', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error finding nearby providers:', error);
      return [];
    }
  }
  
  /**
   * Get medication recommendations based on diagnosis
   */
  async getMedicationRecommendations(condition: string, userProfile: any): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('medications')
        .select('*')
        .eq('condition', condition);
        
      if (error) throw error;
      
      return this.filterMedicationsForUser(data, userProfile);
    } catch (error) {
      console.error('Error getting medication recommendations:', error);
      return [];
    }
  }
  
  /**
   * Schedule appointment with healthcare provider
   */
  async scheduleAppointment(doctorId: string, date: string, time: string, type: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .insert([{
          doctor_id: doctorId,
          appointment_date: date,
          appointment_time: time,
          appointment_type: type,
          created_at: new Date().toISOString(),
        }]);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  }
  
  /**
   * Generate digital prescription
   */
  async generatePrescription(doctorId: string, patientId: string, medications: any[]): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('prescriptions')
        .insert([{
          doctor_id: doctorId,
          patient_id: patientId,
          medications,
          created_at: new Date().toISOString(),
        }]);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error generating prescription:', error);
      throw error;
    }
  }
  
  
  private shouldUsePremiumModel(options: AIQueryOptions): boolean {
    if (options.usePremiumModel) return true;
    
    if (options.imageUrl) return true;
    
    if (options.severity && options.severity > 50) return true;
    
    const complexTerminology = [
      'radiología', 'cardiograma', 'insuficiencia', 'crónico', 'diagnóstico',
      'oncológico', 'hematológico', 'neurológico', 'autoinmune'
    ];
    
    return complexTerminology.some(term => 
      options.userMessage.toLowerCase().includes(term)
    );
  }
  
  private async getMedicalKnowledge(query: string): Promise<any> {
    try {
      const medicalTerms = this.extractMedicalTerms(query);
      
      if (medicalTerms.length === 0) return {};
      
      const { data, error } = await this.supabase
        .from('medical_knowledge')
        .select('*')
        .in('term', medicalTerms);
        
      if (error) throw error;
      
      return data || {};
    } catch (error) {
      console.error('Error retrieving medical knowledge:', error);
      return {};
    }
  }
  
  private extractMedicalTerms(text: string): string[] {
    const commonTerms = [
      'dolor', 'fiebre', 'tos', 'náusea', 'vómito', 'diarrea', 'mareo',
      'fatiga', 'dolor de cabeza', 'migraña', 'erupción', 'presión arterial'
    ];
    
    return commonTerms.filter(term => text.toLowerCase().includes(term));
  }
  
  private async makeAPIRequest(endpoint: string, data: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.simulateAIResponse(endpoint, data));
      }, 1000);
    });
  }
  
  private simulateAIResponse(endpoint: string, data: any): any {
    if (endpoint === this.imageAnalysisEndpoint) {
      const imageData = data.imageUrl || '';
      const symptoms = data.symptoms || '';
      
      const imageHash = this.hashString(imageData);
      
      const analysisOptions = [
        {
          analysis: 'La imagen muestra posibles signos de una erupción cutánea. Recomiendo consultar con un dermatólogo.',
          findings: 'Erupción cutánea con patrones irregulares',
          confidence: 0.78,
          severity: 40,
          suggestedSpecialty: 'Dermatología'
        },
        {
          analysis: 'La imagen sugiere una posible inflamación articular. Podría ser indicativo de artritis u otra condición reumatológica.',
          findings: 'Inflamación articular con posible enrojecimiento',
          confidence: 0.82,
          severity: 35,
          suggestedSpecialty: 'Reumatología'
        },
        {
          analysis: 'La imagen muestra lo que parece ser una lesión ocular. Recomiendo una evaluación oftalmológica urgente.',
          findings: 'Posible lesión corneal o conjuntivitis',
          confidence: 0.91,
          severity: 65,
          suggestedSpecialty: 'Oftalmología'
        },
        {
          analysis: 'La imagen muestra una posible infección de la piel. Podría ser una celulitis o foliculitis.',
          findings: 'Área inflamada con posibles signos de infección',
          confidence: 0.75,
          severity: 50,
          suggestedSpecialty: 'Infectología'
        },
        {
          analysis: 'La imagen sugiere una posible reacción alérgica. Observe si hay otros síntomas como dificultad para respirar.',
          findings: 'Erupción con patrón consistente con reacción alérgica',
          confidence: 0.88,
          severity: 45,
          suggestedSpecialty: 'Alergología'
        }
      ];
      
      if (symptoms) {
        if (symptoms.toLowerCase().includes('picazón') || symptoms.toLowerCase().includes('comezón')) {
          return {
            analysis: 'Basado en la imagen y los síntomas de picazón, es probable que esté experimentando una reacción alérgica o dermatitis.',
            findings: 'Erupción cutánea con signos de rascado, consistente con prurito',
            confidence: 0.85,
            severity: 30,
            suggestedSpecialty: 'Dermatología'
          };
        }
        
        if (symptoms.toLowerCase().includes('dolor') || symptoms.toLowerCase().includes('ardor')) {
          return {
            analysis: 'La combinación de la imagen y los síntomas de dolor sugieren una posible infección o inflamación aguda.',
            findings: 'Área inflamada con signos de dolor, posible infección',
            confidence: 0.79,
            severity: 55,
            suggestedSpecialty: 'Medicina Interna'
          };
        }
        
        if (symptoms.toLowerCase().includes('fiebre')) {
          return {
            analysis: 'La imagen junto con el síntoma de fiebre sugiere un proceso infeccioso que requiere atención médica pronto.',
            findings: 'Signos de infección con compromiso sistémico',
            confidence: 0.87,
            severity: 60,
            suggestedSpecialty: 'Infectología'
          };
        }
      }
      
      const responseIndex = imageHash % analysisOptions.length;
      return analysisOptions[responseIndex];
    }
    
    if (data.message && data.message.includes('dolor de cabeza')) {
      return {
        text: 'Basado en tus síntomas, podrías estar experimentando una migraña o cefalea tensional. ¿Con qué frecuencia ocurre este dolor de cabeza?',
        severity: 30,
        suggestedSpecialty: 'Neurología',
        suggestedConditions: ['Migraña', 'Cefalea tensional'],
        followUpQuestions: [
          '¿El dolor es pulsátil o constante?',
          '¿Tienes sensibilidad a la luz o sonido?',
          '¿Has experimentado náuseas?'
        ]
      };
    }
    
    return {
      text: 'Gracias por compartir esta información. Para entender mejor tu situación, ¿podrías proporcionarme más detalles sobre tus síntomas?',
      severity: 10,
      followUpQuestions: [
        '¿Cuándo comenzaron los síntomas?',
        '¿Hay algo que empeore o mejore los síntomas?'
      ]
    };
  }
  
  private enhanceResponse(response: any, options: AIQueryOptions): AIResponse {
    if (options.location && response.suggestedSpecialty) {
    }
    
    return response;
  }
  
  private filterMedicationsForUser(medications: any[], userProfile: any): any[] {
    if (!userProfile || !medications) return medications || [];
    
    const userAllergies = userProfile.allergies || [];
    
    return medications.filter(med => 
      !userAllergies.some((allergy: string) => 
        med.ingredients.includes(allergy)
      )
    );
  }
  
  /**
   * Simple string hashing function to generate deterministic but different responses
   * @param str String to hash
   * @returns A numeric hash value
   */
  private hashString(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }
}

export default new AIService();
