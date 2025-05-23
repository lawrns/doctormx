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
        
        try {
          // Call the API once to get the complete response
          const response = await this.makeAPIRequest(endpoint, requestData);
          console.log('Full API response structure:', response);
          
          // Extract the text properly - handle both direct text and nested text property
          const fullText = response.text || response.message || response.content || 'No se pudo obtener una respuesta. Por favor, intenta nuevamente.';
          console.log('Extracted text for streaming:', fullText.substring(0, 100) + '...');
          
          // Then simulate streaming by breaking it into chunks
          // For a real implementation, we would use a proper streaming API
          const chunks = this.breakTextIntoChunks(fullText);
          console.log(`Breaking response into ${chunks.length} chunks for streaming simulation`);
          
          // Initial streaming response
          let fullResponse = '';
          let responseObject: StreamingAIResponse = {
            text: '',
            isStreaming: true,
            isComplete: false
          };
          
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
              responseObject.severity = response.severity || options.severity || Math.floor(Math.random() * 100);
              responseObject.isEmergency = (responseObject.severity || 0) > 80;
              
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
            
            try {
              if (options.onStreamingResponse) {
                options.onStreamingResponse(responseObject);
              }
            } catch (handlerError) {
              console.error('Error in streaming response handler:', handlerError);
            }
          };
          
          // Simulate streaming with chunks
          for (let i = 0; i < chunks.length; i++) {
            const isLast = i === chunks.length - 1;
            setTimeout(() => {
              processPart(chunks[i], isLast);
            }, i * 200); // 200ms delay between chunks
          }
          
        } catch (apiError) {
          console.error('Error in streaming API request:', apiError);
          
          // Send clean error response through streaming handler without personality mixing
          const errorResponse: StreamingAIResponse = {
            text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, verifica tu conexión e intenta nuevamente.',
            isStreaming: false,
            isComplete: true,
            severity: 10,
            isEmergency: false
          };
          
          try {
            if (options.onStreamingResponse) {
              options.onStreamingResponse(errorResponse);
            }
          } catch (handlerError) {
            console.error('Error in error response handler:', handlerError);
          }
        }
        
        return {
          text: '',
          isStreaming: true,
          isComplete: false
        };
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
      let results: any[] = [];
      
      for (const term of medicalTerms) {
        const { data, error } = await this.supabase
          .from('medical_knowledge')
          .select('*')
          .ilike('terms', `%${term}%`);
          
        if (error) {
          console.error(`Error retrieving medical knowledge for term '${term}':`, error);
          // Only skip on the first error if we're in development and table doesn't exist
          if (import.meta.env.DEV && error.message?.includes('does not exist')) {
            console.log('Development mode - medical_knowledge table not found, skipping database queries');
            return {};
          }
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

      // Check if we're in development mode and provide mock responses
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      
      if (isDevelopment && endpoint.includes('/.netlify/functions/')) {
        console.log('Development mode detected - using mock AI response');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Generate mock response based on user message
        const userMessage = data.message?.toLowerCase() || '';
        let mockResponse = '';
        
        if (userMessage.includes('dolor') || userMessage.includes('duele')) {
          mockResponse = `Entiendo que estás experimentando dolor. Es importante evaluar varios factores: ¿Desde cuándo tienes este dolor? ¿Es constante o intermitente? ¿Hay algo que lo empeore o lo mejore? 
          
El dolor puede tener muchas causas diferentes, desde tensión muscular hasta inflamación. Te recomiendo que mantengas un registro de cuándo aparece el dolor y qué actividades realizas.

Si el dolor es muy intenso o persiste por más de unos días, sería recomendable que consultes con un médico presencialmente para una evaluación más detallada.`;
        } else if (userMessage.includes('fiebre')) {
          mockResponse = `La fiebre es un síntoma importante que indica que tu cuerpo está luchando contra algo. ¿Qué temperatura tienes? ¿Desde cuándo tienes fiebre?

Algunas recomendaciones generales:
- Mantente hidratado bebiendo mucha agua
- Descansa lo suficiente
- Si la fiebre es alta (más de 38.5°C) o persiste más de 3 días, busca atención médica

¿Tienes otros síntomas acompañando la fiebre como dolor de garganta, tos o malestar general?`;
        } else if (userMessage.includes('ojos') || userMessage.includes('verde')) {
          mockResponse = `Los ojos verdes son un rasgo genético hermoso. El color de ojos está determinado por la cantidad y distribución de melanina en el iris.

¿Hay algo específico sobre tus ojos que te preocupe? Por ejemplo:
- Cambios en la visión
- Irritación o enrojecimiento
- Dolor ocular
- Secreción

Si tienes algún síntoma visual, es importante que consultes con un oftalmólogo para una evaluación adecuada.`;
        } else {
          mockResponse = `Gracias por tu consulta. Como médico virtual, estoy aquí para ayudarte con información general sobre salud.

Para brindarte la mejor asistencia, me gustaría conocer más detalles sobre tu consulta:
- ¿Qué síntomas específicos estás experimentando?
- ¿Desde cuándo los tienes?
- ¿Hay algo que los mejore o los empeore?

Recuerda que esta consulta virtual no reemplaza una evaluación médica presencial, especialmente para síntomas serios o urgentes.`;
        }

        const mockApiResponse = {
          text: mockResponse,
          severity: userMessage.includes('dolor fuerte') || userMessage.includes('muy malo') ? 70 : 30,
          isEmergency: false,
          suggestedSpecialty: userMessage.includes('ojos') ? 'Oftalmología' : 'Medicina General',
          suggestedConditions: userMessage.includes('dolor') ? ['Cefalea tensional', 'Migraña'] : [],
          followUpQuestions: [
            '¿Puedes describir mejor cómo te sientes?',
            '¿Has notado algún cambio en los últimos días?',
            '¿Tienes algún antecedente médico relevante?'
          ]
        };

        console.log('Mock AI response generated:', mockApiResponse);
        return mockApiResponse;
      }

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
      console.log(`API response received successfully from ${endpoint}:`, responseData);
      
      // Make sure we return the actual response data without modification
      return responseData;
    } catch (error) {
      console.error(`Error in makeAPIRequest to ${endpoint}:`, error);
      
      // Only throw the error - don't create fallback responses here
      // Let the calling function handle the error appropriately
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
