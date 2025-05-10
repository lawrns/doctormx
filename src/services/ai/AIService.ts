import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import medicationDatabase from '../../data/medications';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const DOCTOR_INSTRUCTIONS_KEY = 'doctor_instructions';
const DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY = 'doctor_image_analysis_enabled';

const DEFAULT_DOCTOR_INSTRUCTIONS = `Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.`;

const getOpenAIInstance = (): OpenAI | null => {
  try {
    const apiKey = localStorage.getItem(OPENAI_KEY_STORAGE_KEY);
    if (!apiKey) {
      console.warn('No OpenAI API key found in local storage');
      return null;
    }
    return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  } catch (error) {
    console.error('Error creating OpenAI instance:', error);
    return null;
  }
};

export interface AIResponse {
  text: string;
  severity?: number;
  isEmergency?: boolean;
  suggestedSpecialty?: string;
  suggestedConditions?: string[];
  suggestedMedications?: string[];
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
  customInstructions?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

class AIService {
  private supabase;
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
      if (!this.isImageAnalysisEnabled()) {
        return {
          text: 'El análisis de imágenes está desactivado. Por favor, actívalo en la configuración o describe tus síntomas en texto.',
        };
      }
      
      console.log('Analyzing image with GPT-4:', imageUrl);
      
      const response = await this.makeAPIRequest(this.imageAnalysisEndpoint, {
        imageUrl,
        symptoms,
        usePremiumModel: true, // Force premium model for image analysis
      });
      
      return {
        text: response.analysis || response.text,
        imageAnalysis: {
          findings: response.findings || 'Análisis detallado no disponible',
          confidence: response.confidence || 0.75,
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
      console.log(`Finding providers near: ${location.latitude}, ${location.longitude}`);
      
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
      const matchingCategories = medicationDatabase.filter(category => 
        category.conditions.some(cond => 
          cond.toLowerCase().includes(condition.toLowerCase()) || 
          condition.toLowerCase().includes(cond.toLowerCase())
        )
      );
      
      if (matchingCategories.length === 0) {
        console.log(`No medications found for condition: ${condition}`);
        return [];
      }
      
      const allMedications = matchingCategories.flatMap(category => 
        category.medications.map(med => ({
          ...med,
          category: category.category
        }))
      );
      
      return this.filterMedicationsForUser(allMedications, userProfile);
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
      
      const matchingMedications = medicationDatabase.flatMap(category => 
        category.medications.filter(med => 
          medications.some(requestedMed => 
            med.name_es.toLowerCase().includes(requestedMed.toLowerCase()) || 
            med.name_en.toLowerCase().includes(requestedMed.toLowerCase()) ||
            med.brand_examples.some(brand => brand.toLowerCase().includes(requestedMed.toLowerCase()))
          )
        )
      );
      
      const filterProductsByMedications = (products: any[], meds: string[]) => {
        return products.filter(p => 
          meds.some(m => 
            p.name.toLowerCase().includes(m.toLowerCase()) || 
            (p.medication && (
              p.medication.name_es.toLowerCase().includes(m.toLowerCase()) || 
              p.medication.name_en.toLowerCase().includes(m.toLowerCase())
            ))
          )
        );
      };
      
      const pharmacies = [
        {
          id: 'pharm-001',
          ...this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO,
          address: 'Av. Universidad 1000, Col. Santa Cruz Atoyac, 03310, CDMX',
          phone: '+52 55 1234 5678',
          distance: location ? 1200 : undefined, // meters
          available_medications: matchingMedications
            .filter(med => med.pharmacy_availability && med.pharmacy_availability.farmacia_del_ahorro)
            .map(med => med.name_es),
          products: filterProductsByMedications(
            this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO.products,
            medications
          ),
          hours: 'Abierto 24/7',
          rating: 4.7,
          description: 'Farmacia del Ahorro ofrece precios accesibles y una amplia variedad de medicamentos genéricos y de marca.'
        },
        {
          id: 'pharm-002',
          ...this.PHARMACY_BRANDS.FARMACIA_SIMILARES,
          address: 'Insurgentes Sur 1480, Col. Actipan, 03230, CDMX',
          phone: '+52 55 9876 5432',
          distance: location ? 1800 : undefined, // meters
          available_medications: matchingMedications
            .filter(med => med.pharmacy_availability && med.pharmacy_availability.farmacia_similares)
            .map(med => med.name_es),
          products: filterProductsByMedications(
            this.PHARMACY_BRANDS.FARMACIA_SIMILARES.products,
            medications
          ),
          hours: '8:00 AM - 10:00 PM',
          rating: 4.5,
          description: 'Farmacia Similares es conocida por sus medicamentos genéricos a precios bajos y su compromiso con la salud accesible.'
        },
        {
          id: 'pharm-003',
          ...this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO,
          address: 'Av. Revolución 1425, Col. Campestre, 01040, CDMX',
          phone: '+52 55 5543 2109',
          distance: location ? 2500 : undefined, // meters
          available_medications: matchingMedications
            .filter(med => med.pharmacy_availability && med.pharmacy_availability.farmacia_del_ahorro)
            .map(med => med.name_es),
          products: filterProductsByMedications(
            this.PHARMACY_BRANDS.FARMACIA_DEL_AHORRO.products,
            medications
          ),
          hours: '7:00 AM - 11:00 PM',
          rating: 4.6,
          description: 'Farmacia del Ahorro ofrece precios accesibles y una amplia variedad de medicamentos genéricos y de marca.'
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
          distance: location ? 950 : undefined, // meters
          available_medications: matchingMedications
            .filter((_, i) => i % 2 === 0)
            .map(med => med.name_es),
          products: this.generateLocalPharmacyProducts(matchingMedications.filter((_, i) => i % 2 === 0)),
          hours: '9:00 AM - 9:00 PM',
          rating: 4.3,
          description: 'Farmacia Local ofrece atención personalizada y productos de calidad para el cuidado de la salud.',
          ethicalDisclaimer: 'Las recomendaciones de medicamentos son solo para referencia. Siempre consulte a un profesional de la salud antes de tomar cualquier medicamento.'
        },
      ];
      
      if (location) {
        pharmacies.sort((a, b) => {
          if (a.isSponsored && !b.isSponsored) return -1;
          if (!a.isSponsored && b.isSponsored) return 1;
          
          return (a.distance || Infinity) - (b.distance || Infinity);
        });
      } else {
        pharmacies.sort((a, b) => {
          if (a.isSponsored && !b.isSponsored) return -1;
          if (!a.isSponsored && b.isSponsored) return 1;
          return 0;
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
      ethicalDisclaimer: 'Las recomendaciones de medicamentos son solo para referencia. Siempre consulte a un profesional de la salud antes de tomar cualquier medicamento.',
      products: this.generateProductsFromDatabase('Farmacia del Ahorro'),
    },
    FARMACIA_SIMILARES: {
      name: 'Farmacias Similares',
      logo: '/logos/farmacia-similares.png',
      primaryColor: '#004a87',
      secondaryColor: '#ffce00',
      isSponsored: true,
      sponsorshipLevel: 1,
      website: 'https://www.farmaciasdesimilares.com/',
      ethicalDisclaimer: 'Las recomendaciones de medicamentos son solo para referencia. Siempre consulte a un profesional de la salud antes de tomar cualquier medicamento.',
      products: this.generateProductsFromDatabase('Farmacia Similares'),
    },
  };

  private shouldUsePremiumModel(options: AIQueryOptions): boolean {
    if (options.usePremiumModel) return true;
    
    if (options.imageUrl) {
      const imageAnalysisEnabled = localStorage.getItem(DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY);
      if (imageAnalysisEnabled === null || imageAnalysisEnabled === 'true') {
        console.log('Using premium model for image analysis');
        return true;
      } else {
        console.log('Image analysis is disabled, not using premium model');
        return false;
      }
    }
    
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
    const openai = getOpenAIInstance();
    
    if (openai) {
      try {
        console.log('Using OpenAI API for request');
        
        const model = endpoint === this.premiumModelEndpoint || 
                     (endpoint === this.imageAnalysisEndpoint && this.isImageAnalysisEnabled())
          ? 'gpt-4' 
          : 'gpt-3.5-turbo';
        
        let systemMessage = data.customInstructions || this.getDoctorInstructions();
        
        if (endpoint === this.imageAnalysisEndpoint && this.isImageAnalysisEnabled()) {
          systemMessage = `${systemMessage}\n\nAhora estás analizando una imagen médica. Analiza la imagen proporcionada y describe lo que observas desde una perspectiva médica. Sé detallado y preciso en tu análisis.`;
        }
        
        const messages = [
          { role: "system", content: systemMessage },
          { role: "user", content: this.formatUserMessage(data) }
        ];
        
        console.log(`Using model: ${model} for request`);
        console.log(`Using custom instructions: ${data.customInstructions ? 'Yes' : 'No'}`);
        
        const response = await openai.chat.completions.create({
          model,
          messages: messages as any,
          temperature: 0.7,
        });
        
        const aiResponse = response.choices[0]?.message?.content || "Lo siento, no pude procesar tu consulta.";
        return this.parseAIResponse(aiResponse, data);
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        console.log('Falling back to mock response');
        return this.simulateAIResponse(endpoint, data);
      }
    } else {
      console.log('No OpenAI API key found, using mock response');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.simulateAIResponse(endpoint, data));
        }, 1000);
      });
    }
  }
  
  private getDoctorInstructions(): string {
    try {
      const instructions = localStorage.getItem(DOCTOR_INSTRUCTIONS_KEY);
      if (instructions) {
        return instructions;
      }
    } catch (error) {
      console.error('Error retrieving doctor instructions:', error);
    }
    return DEFAULT_DOCTOR_INSTRUCTIONS;
  }
  
  private isImageAnalysisEnabled(): boolean {
    try {
      const enabled = localStorage.getItem(DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY);
      return enabled === null || enabled === 'true';
    } catch (error) {
      console.error('Error checking if image analysis is enabled:', error);
      return true; // Default to enabled
    }
  }
  
  private formatUserMessage(data: any): string {
    if (data.message) {
      let message = `Consulta médica: ${data.message}`;
      
      if (data.history && data.history.length > 0) {
        message += `\n\nHistorial previo: ${data.history.join(' | ')}`;
      }
      
      if (data.userProfile) {
        message += `\n\nPerfil del usuario: ${JSON.stringify(data.userProfile)}`;
      }
      
      return message;
    } else if (data.imageUrl) {
      return `Analiza esta imagen médica: ${data.imageUrl}${data.symptoms ? `\nSíntomas reportados: ${data.symptoms}` : ''}`;
    }
    
    return JSON.stringify(data);
  }
  
  private async parseAIResponse(aiResponse: string, data: any): Promise<any> {
    const suggestedConditions = this.extractConditions(aiResponse);
    let suggestedMedications: string[] = [];
    
    // If we have conditions, try to get medication recommendations
    if (suggestedConditions && suggestedConditions.length > 0) {
      try {
        const medications = await this.getMedicationRecommendations(suggestedConditions[0], data.userProfile);
        suggestedMedications = medications.map(med => `${med.name_es} (${med.name_en})`);
      } catch (error) {
        console.error('Error getting medication recommendations:', error);
      }
    }
    
    return {
      text: aiResponse,
      severity: data.severity || this.estimateSeverity(aiResponse),
      suggestedSpecialty: this.extractSpecialty(aiResponse),
      suggestedConditions,
      suggestedMedications,
      followUpQuestions: this.generateFollowUpQuestions(aiResponse),
    };
  }
  
  private estimateSeverity(text: string): number {
    const emergencyTerms = ['emergencia', 'urgente', 'inmediatamente', 'grave', 'peligro'];
    const moderateTerms = ['consultar', 'médico', 'atención', 'tratamiento'];
    
    let severity = 10; // Default low severity
    
    if (emergencyTerms.some(term => text.toLowerCase().includes(term))) {
      severity = 80;
    } else if (moderateTerms.some(term => text.toLowerCase().includes(term))) {
      severity = 40;
    }
    
    return severity;
  }
  
  private extractSpecialty(text: string): string | undefined {
    const specialties = [
      'Cardiología', 'Dermatología', 'Gastroenterología', 'Neurología', 
      'Oftalmología', 'Ortopedia', 'Pediatría', 'Psiquiatría'
    ];
    
    for (const specialty of specialties) {
      if (text.includes(specialty)) {
        return specialty;
      }
    }
    
    return undefined;
  }
  
  private extractConditions(text: string): string[] {
    const conditionsByCategory = medicationDatabase.map(category => category.conditions).flat();
    
    return conditionsByCategory.filter(condition => 
      text.toLowerCase().includes(condition.toLowerCase())
    );
  }
  
  private generateFollowUpQuestions(_text: string): string[] {
    return [
      '¿Cuándo comenzaron los síntomas?',
      '¿Hay algo que empeore o mejore los síntomas?'
    ];
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
  
  private generateProductsFromDatabase(pharmacyName: string): any[] {
    return medicationDatabase.flatMap(category => 
      category.medications
        .filter(med => {
          if (pharmacyName === 'Farmacia del Ahorro') {
            return med.pharmacy_availability?.farmacia_del_ahorro;
          } else if (pharmacyName === 'Farmacia Similares') {
            return med.pharmacy_availability?.farmacia_similares;
          }
          return true;
        })
        .map((med, index) => ({
          id: `${pharmacyName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          name: med.name_es,
          brand: med.brand_examples[0],
          price: med.price_range ? 
            Math.floor(Math.random() * (med.price_range.max - med.price_range.min)) + med.price_range.min : 
            Math.floor(Math.random() * 100) + 50,
          dosage: med.typical_dosage.split(' ')[0],
          quantity: `${Math.floor(Math.random() * 20) + 10} ${med.dosage_forms[0]}`,
          prescription: false,
          medication: med // Store the full medication object for reference
        }))
    );
  }
  
  private generateLocalPharmacyProducts(medications: any[]): any[] {
    return medications.map((med, index) => ({
      id: `fl-${index.toString().padStart(3, '0')}`,
      name: med.name_es,
      brand: 'Genérico',
      price: med.price_range ? 
        Math.floor(med.price_range.min * 0.9) : // Local pharmacy has lower prices
        Math.floor(Math.random() * 80) + 30,
      dosage: med.typical_dosage.split(' ')[0],
      quantity: `${Math.floor(Math.random() * 20) + 10} ${med.dosage_forms[0]}`,
      prescription: false,
      medication: med
    }));
  }
  
  private filterMedicationsForUser(medications: any[], userProfile: any): any[] {
    if (!userProfile || !medications) return medications || [];
    
    const userAllergies = userProfile?.allergies || [];
    
    return medications.filter(med => {
      if (userAllergies.length > 0 && med.contraindications) {
        return !userAllergies.some((allergy: string) => 
          med.contraindications.some((contra: string) => 
            contra.toLowerCase().includes(allergy.toLowerCase())
          )
        );
      }
      return true;
    });
  }
}

export default new AIService();
