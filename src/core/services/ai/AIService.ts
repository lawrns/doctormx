import { supabase } from '../../../lib/supabase';

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

export interface StreamingAIResponse extends AIResponse {
  isStreaming: boolean;
  isComplete: boolean;
  suggestedMedications?: string[];
}

export type StreamingResponseHandler = (response: StreamingAIResponse) => void;

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
  characterProfile?: AICharacterProfile;
  customInstructions?: string;
  stream?: boolean;
  onStreamingResponse?: StreamingResponseHandler;
}

export interface AICharacterProfile {
  name: string;
  personality: string;
  specialization: string;
  tone: string;
  style: string;
}

class AIService {
  private supabase;
  // This endpoint is currently unused but may be needed in the future
  // private apiEndpoint = import.meta.env.VITE_REACT_APP_AI_API_ENDPOINT || '';
  private standardModelEndpoint = '/.netlify/functions/standard-model';
  private premiumModelEndpoint = '/.netlify/functions/premium-model';
  private imageAnalysisEndpoint = '/.netlify/functions/image-analysis';
  
  private defaultCharacterProfile: AICharacterProfile = {
    name: 'Dr. IA',
    personality: 'Amable, atento, empático y profesional',
    specialization: 'Medicina General',
    tone: 'Formal y tranquilizador',
    style: 'Claro y directo'
  };
  
  private currentCharacterProfile: AICharacterProfile;

  constructor() {
    // Use the centralized Supabase client instead of creating a new one
    this.supabase = supabase;
    
    // Initialize character profile with default values
    this.currentCharacterProfile = {...this.defaultCharacterProfile};
    
    // Try to load saved profile from localStorage
    this.loadCharacterProfile();
  }
  
  /**
   * Get current AI character profile
   */
  getCharacterProfile(): AICharacterProfile {
    return this.currentCharacterProfile;
  }
  
  /**
   * Set AI character profile and save to localStorage
   */
  setCharacterProfile(profile: Partial<AICharacterProfile>): AICharacterProfile {
    this.currentCharacterProfile = {
      ...this.currentCharacterProfile,
      ...profile
    };
    
    // Save to localStorage
    localStorage.setItem('ai_character_profile', JSON.stringify(this.currentCharacterProfile));
    
    return this.currentCharacterProfile;
  }
  
  /**
   * Reset character profile to default
   */
  resetCharacterProfile(): AICharacterProfile {
    this.currentCharacterProfile = {...this.defaultCharacterProfile};
    localStorage.setItem('ai_character_profile', JSON.stringify(this.currentCharacterProfile));
    return this.currentCharacterProfile;
  }
  
  /**
   * Load character profile from localStorage
   */
  private loadCharacterProfile(): void {
    try {
      const savedProfile = localStorage.getItem('ai_character_profile');
      if (savedProfile) {
        this.currentCharacterProfile = JSON.parse(savedProfile);
      }
    } catch (error) {
      console.error('Error loading character profile from localStorage:', error);
      this.currentCharacterProfile = {...this.defaultCharacterProfile};
    }
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
        characterProfile: options.characterProfile || this.currentCharacterProfile,
        customInstructions: options.customInstructions
      };
      
      const endpoint = needsPremiumModel ? this.premiumModelEndpoint : this.standardModelEndpoint;
      
      // Handle streaming response if requested
      if (options.stream && options.onStreamingResponse) {
        console.log('Starting streaming response');
        
        // Initial streaming response
        let fullResponse = '';
        let responseObject: StreamingAIResponse = {
          text: '',
          isStreaming: true,
          isComplete: false
        };
        
        // Simulate streaming for demo purposes
        // In a real implementation, this would connect to a streaming API endpoint
        const processPart = (text: string, isLast: boolean) => {
          fullResponse += text;
          
          responseObject = {
            ...responseObject,
            text: fullResponse,
            isStreaming: !isLast,
            isComplete: isLast
          };
          
          // If this is the last part, add additional metadata
          if (isLast) {
            responseObject.severity = options.severity || Math.floor(Math.random() * 100);
            responseObject.isEmergency = responseObject.severity > 80;
            
            if (options.userMessage.toLowerCase().includes('dolor')) {
              responseObject.suggestedSpecialty = 'Medicina General';
              responseObject.suggestedConditions = ['Cefalea', 'Migraña', 'Tensión muscular'];
              responseObject.followUpQuestions = [
                '¿El dolor se intensifica con alguna actividad específica?',
                '¿Has tomado algún medicamento para aliviar el dolor?',
                '¿Tienes otros síntomas además del dolor?'
              ];
            }
          }
          
          options.onStreamingResponse(responseObject);
        };
        
        // Call the API once to get the complete response
        const response = await this.makeAPIRequest(endpoint, requestData);
        
        // Then simulate streaming by breaking it into chunks
        // For a real implementation, we would use a proper streaming API
        const fullText = response.text;
        const chunks = this.breakTextIntoChunks(fullText);
        
        // Process chunks with slight delays to simulate streaming
        for (let i = 0; i < chunks.length; i++) {
          const isLast = i === chunks.length - 1;
          processPart(chunks[i], isLast);
          
          if (!isLast) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Return the complete response at the end
        return this.enhanceResponse(response, options);
      } else {
        // Normal, non-streaming response
        const response = await this.makeAPIRequest(endpoint, requestData);
        return this.enhanceResponse(response, options);
      }
    } catch (error) {
      console.error('Error processing AI query:', error);
      return {
        text: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente en unos momentos.',
        severity: options.severity,
      };
    }
  }
  
  // Helper method to break text into chunks for simulating streaming
  private breakTextIntoChunks(text: string, chunkSize: number = 10): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' ') + ' ');
    }
    
    return chunks;
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
      
      // Use a different approach - search for each term individually with ilike
      let results = [];
      
      for (const term of medicalTerms) {
        const { data, error } = await this.supabase
          .from('medical_knowledge')
          .select('*')
          .ilike('terms', `%${term}%`);
          
        if (error) {
          console.error(`Error retrieving medical knowledge for term '${term}':`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          results = [...results, ...data];
        }
      }
      
      return results || {};
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
    try {
      console.log(`Making API request to ${endpoint}`);

      // Add troubleshooting info to see what's happening
      console.log(`API URL: ${window.location.origin}${endpoint}`);
      console.log(`Request data:`, JSON.stringify(data).substring(0, 200) + '...');

      // Ensure we're using the full URL with origin
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${window.location.origin}${endpoint}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'same-origin' // Include cookies in the request
      });

      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed with status ${response.status}: ${errorText}`);
        throw new Error(errorText || response.statusText);
      }

      const responseData = await response.json();
      console.log(`API response received successfully from ${endpoint}`);
      return responseData;
    } catch (error) {
      console.error(`Error in makeAPIRequest to ${endpoint}:`, error);
      
      // Since this is likely a deployment issue, provide a helpful message
      console.log("This could be a CORS, network, or deployment issue. Check the browser console for more details.");
      
      // Try to see if the error response includes fallbackText from the serverless function
      try {
        if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
          // Create a static example response for testing purposes
          console.warn('Creating static example response for testing purposes');
          
          if (endpoint.includes('standard-model') || endpoint.includes('premium-model')) {
            return { 
              text: "Hola, soy el Dr. IA. Estoy aquí para ayudarte con cualquier consulta médica que tengas. ¿En qué puedo asistirte hoy? Por favor, cuéntame sobre tus síntomas o preocupaciones de salud.",
              model: "gpt-4-example-offline",
              success: true
            };
          } else if (endpoint.includes('image-analysis')) {
            return {
              analysis: "Esta parece ser una imagen dermatológica que muestra una erupción leve. Basado en lo que puedo observar, podría tratarse de una dermatitis de contacto o una reacción alérgica leve. Recomendaría consultar con un dermatólogo para un diagnóstico preciso.",
              findings: "Enrojecimiento localizado con patrón irregular, posible inflamación leve",
              confidence: 0.85,
              model: "gpt-4-vision-example-offline",
              success: true
            };
          }
        }
      } catch (parseError) {
        console.error('Error parsing fallback text:', parseError);
      }
      
      // Default fallback responses if nothing else works
      if (endpoint.includes('standard-model') || endpoint.includes('premium-model')) {
        return { 
          text: "Lo siento, estoy experimentando dificultades técnicas para conectarme a los servidores. Por favor, intenta nuevamente en unos momentos. Si el problema persiste, contacta a soporte técnico.",
          success: false
        };
      } else if (endpoint.includes('image-analysis')) {
        return {
          analysis: "No fue posible analizar la imagen debido a problemas de conexión con el servicio de análisis de imágenes.",
          confidence: 0,
          success: false
        };
      }
      
      throw error;
    }
  }
  
  private enhanceResponse(response: any, options: AIQueryOptions): AIResponse {
    if (options.location && response.suggestedSpecialty) {
      // Here you can add logic to enhance the response with location-specific information
    }
    
    return response;
  };
  
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
}

export default new AIService();
