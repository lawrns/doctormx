import { createClient } from '@supabase/supabase-js';

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
  private apiEndpoint = process.env.REACT_APP_AI_API_ENDPOINT || '';
  private standardModelEndpoint = '/api/v1/standard-model';
  private premiumModelEndpoint = '/api/v1/premium-model';
  private imageAnalysisEndpoint = '/api/v1/image-analysis';

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl) {
      console.error('VITE_SUPABASE_URL is not set. Please check your environment variables.');
    }
    
    if (!supabaseAnonKey) {
      console.error('VITE_SUPABASE_ANON_KEY is not set. Please check your environment variables.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
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
        location: options.location // Pass location for provider recommendations
      };
      
      const endpoint = needsPremiumModel ? this.premiumModelEndpoint : this.standardModelEndpoint;
      const response = await this.makeAPIRequest(endpoint, requestData);
      
      const enhancedResponse = await this.enhanceResponse(response, options);
      
      return enhancedResponse;
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
      const response = await this.makeAPIRequest(this.imageAnalysisEndpoint, {
        imageUrl,
        symptoms,
      });
      
      return {
        text: response.analysis,
        imageAnalysis: {
          findings: response.findings,
          confidence: response.confidence,
        },
        severity: response.severity,
        suggestedSpecialty: response.suggestedSpecialty,
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        text: 'No se pudo analizar la imagen. Por favor, intenta con otra imagen o describe tus síntomas.',
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
  
  /**
   * Get pharmacy recommendations with sponsored options
   */
  async getPharmacyRecommendations(
    medications: string[], 
    location?: { latitude: number; longitude: number }
  ): Promise<any[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const pharmacies = [
        {
          id: 'pharm-001',
          ...this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO,
          address: 'Av. Universidad 1000, Col. Santa Cruz Atoyac, 03310, CDMX',
          phone: '+52 55 1234 5678',
          distance: 1200, // meters
          available_medications: this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO.products
            .filter(p => medications.some(m => p.name.toLowerCase().includes(m.toLowerCase())))
            .map(p => p.name),
          products: this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO.products
            .filter(p => medications.some(m => p.name.toLowerCase().includes(m.toLowerCase()))),
        },
        {
          id: 'pharm-002',
          ...this.PHARMACY_BRANDS.FARMACIA_SIMILARES,
          address: 'Insurgentes Sur 1480, Col. Actipan, 03230, CDMX',
          phone: '+52 55 9876 5432',
          distance: 1800, // meters
          available_medications: this.PHARMACY_BRANDS.FARMACIA_SIMILARES.products
            .filter(p => medications.some(m => p.name.toLowerCase().includes(m.toLowerCase())))
            .map(p => p.name),
          products: this.PHARMACY_BRANDS.FARMACIA_SIMILARES.products
            .filter(p => medications.some(m => p.name.toLowerCase().includes(m.toLowerCase()))),
        },
        {
          id: 'pharm-003',
          name: 'Farmacia del Ahorro',
          logo: '/logos/farmacia-del-ahorro.png',
          primaryColor: '#00529b',
          secondaryColor: '#e30613',
          isSponsored: true,
          sponsorshipLevel: 2,
          address: 'Av. Revolución 1425, Col. Campestre, 01040, CDMX',
          phone: '+52 55 5543 2109',
          distance: 2500, // meters
          available_medications: this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO.products
            .filter(p => medications.some(m => p.name.toLowerCase().includes(m.toLowerCase())))
            .map(p => p.name),
          products: this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO.products
            .filter(p => medications.some(m => p.name.toLowerCase().includes(m.toLowerCase()))),
          website: 'https://www.farmaciasdeahorro.com.mx/',
        },
        {
          id: 'pharm-004',
          name: 'Farmacia Local',
          logo: '/logos/farmacia-local.png',
          primaryColor: '#2c7d32',
          secondaryColor: '#ffffff',
          isSponsored: false,
          address: 'Calle Durango 208, Col. Roma Norte, 06700, CDMX',
          phone: '+52 55 1234 9876',
          distance: 950, // meters
          available_medications: ['Paracetamol', 'Ibuprofeno'],
          products: [
            { id: 'fl-001', name: 'Paracetamol', brand: 'Genérico', price: 30.00, dosage: '500mg', quantity: 20, prescription: false },
            { id: 'fl-002', name: 'Ibuprofeno', brand: 'Genérico', price: 40.00, dosage: '400mg', quantity: 30, prescription: false },
          ],
        },
      ];
      
      if (location) {
        pharmacies.sort((a, b) => {
          if (a.isSponsored && !b.isSponsored) return -1;
          if (!a.isSponsored && b.isSponsored) return 1;
          return a.distance - b.distance;
        });
      }
      
      return pharmacies;
    } catch (error) {
      console.error('Error getting pharmacy recommendations:', error);
      return [];
    }
  }
  
  private PHARMACY_BRANDS = {
    FARMACIA_DEL_AHORRO: {
      name: 'Farmacia del Ahorro',
      logo: '/logos/farmacia-del-ahorro.png',
      primaryColor: '#00529b',
      secondaryColor: '#e30613',
      isSponsored: true,
      sponsorshipLevel: 2,
      website: 'https://www.farmaciasdeahorro.com.mx/',
      products: [
        { id: 'fda-001', name: 'Paracetamol', brand: 'Similares', price: 35.50, dosage: '500mg', quantity: 20, prescription: false },
        { id: 'fda-002', name: 'Ibuprofeno', brand: 'Genérico GI', price: 42.80, dosage: '400mg', quantity: 30, prescription: false },
        { id: 'fda-003', name: 'Amoxicilina', brand: 'Amsa', price: 120.50, dosage: '500mg', quantity: 15, prescription: true },
        { id: 'fda-004', name: 'Loratadina', brand: 'Schering-Plough', price: 85.00, dosage: '10mg', quantity: 10, prescription: false },
        { id: 'fda-005', name: 'Omeprazol', brand: 'Genérico GI', price: 65.30, dosage: '20mg', quantity: 14, prescription: false },
      ],
    },
    FARMACIA_SIMILARES: {
      name: 'Farmacias Similares',
      logo: '/logos/farmacia-similares.png',
      primaryColor: '#004a87',
      secondaryColor: '#ffce00',
      isSponsored: true,
      sponsorshipLevel: 1,
      website: 'https://www.farmaciasdesimilares.com/',
      products: [
        { id: 'fs-001', name: 'Paracetamol', brand: 'Similares', price: 32.00, dosage: '500mg', quantity: 20, prescription: false },
        { id: 'fs-002', name: 'Ibuprofeno', brand: 'Similares', price: 38.50, dosage: '400mg', quantity: 30, prescription: false },
        { id: 'fs-003', name: 'Loratadina', brand: 'Similares', price: 65.90, dosage: '10mg', quantity: 10, prescription: false },
      ],
    },
  };

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
      return {
        analysis: 'La imagen muestra posibles signos de una erupción cutánea. Recomiendo consultar con un dermatólogo.',
        findings: 'Erupción cutánea con patrones irregulares',
        confidence: 0.78,
        severity: 40,
        suggestedSpecialty: 'Dermatología'
      };
    }
    
    if (data.message.includes('dolor de cabeza')) {
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
  
  private async enhanceResponse(response: any, options: AIQueryOptions): Promise<AIResponse> {
    if (options.location && response.suggestedSpecialty) {
      try {
        const nearbyProviders = await this.findNearbyProviders(
          response.suggestedSpecialty, 
          options.location
        );
        
        if (nearbyProviders && nearbyProviders.length > 0) {
          response.nearbyProviders = nearbyProviders.slice(0, 3); // Limit to top 3
        }
      } catch (error) {
        console.error('Error finding nearby providers:', error);
      }
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
}

export default new AIService();
