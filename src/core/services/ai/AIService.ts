import { supabase } from '../../../lib/supabase';

export interface AIAnswerOption {
  id: string;
  text: string;
  value: string;
  category?: string;
}

export interface AIResponse {
  text: string;
  severity?: number;
  isEmergency?: boolean;
  suggestedSpecialty?: string;
  suggestedConditions?: string[];
  followUpQuestions?: string[]; // Keep for backward compatibility
  answerOptions?: AIAnswerOption[]; // New clickable options
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
              
              // Generate contextual answer options instead of follow-up questions
              responseObject.answerOptions = this.generateAnswerOptions(options.userMessage, fullResponse);
              
              if (options.userMessage.toLowerCase().includes('dolor')) {
                responseObject.suggestedSpecialty = 'Medicina General';
                responseObject.suggestedConditions = ['Cefalea', 'Migraña', 'Tensión muscular'];
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
        } as StreamingAIResponse;
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
      const forceRealAPI = import.meta.env.VITE_FORCE_REAL_AI === 'true';
      const forceThroughLocalStorage = localStorage.getItem('force_real_ai') === 'true';
      
      // Debug logging for environment variables
      console.log('AI Service - Environment variables:');
      console.log('- isDevelopment:', isDevelopment);
      console.log('- VITE_FORCE_REAL_AI:', import.meta.env.VITE_FORCE_REAL_AI);
      console.log('- forceRealAPI value:', forceRealAPI);
      console.log('- forceThroughLocalStorage:', forceThroughLocalStorage);
      
      // Modified condition to prioritize real API calls
      if (isDevelopment && !forceRealAPI && !forceThroughLocalStorage && endpoint.includes('/.netlify/functions/')) {
        console.log('Development mode detected with mock mode enabled - using mock AI response');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Generate contextually aware mock response based on user message
        return this.generateContextualMockResponse(data);
      }
      
      if (forceRealAPI || forceThroughLocalStorage) {
        console.log('🔥 USING REAL AI API CALLS - Mock responses disabled');
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
    
    // Add answer options to the response
    const enhancedResponse: AIResponse = {
      ...response,
      answerOptions: this.generateAnswerOptions(options.userMessage, response.text || response.message || '')
    };
    
    return enhancedResponse;
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
  
  /**
   * Generate contextually aware mock responses based on user input
   * @param data The request data containing user message and history
   * @returns A mock AI response that's contextually relevant
   */
  private generateContextualMockResponse(data: any): AIResponse {
    const userMessage = data.message?.toLowerCase() || '';
    const userHistory = data.userHistory || [];
    const conversationContext = userHistory.join(' ').toLowerCase();
    
    let mockResponse = '';
    let severity = 30;
    let suggestedSpecialty = 'Medicina General';
    let suggestedConditions: string[] = [];
    let isEmergency = false;
    
    // Enhanced keyword analysis for better context recognition
    const medicalKeywords = {
      anal: ['anal', 'recto', 'rectal', 'ano', 'hemorroides', 'fisura'],
      genital: ['genital', 'vaginal', 'pene', 'testicular', 'vulva'],
      digestive: ['estómago', 'intestino', 'digestión', 'náusea', 'vómito', 'diarrea'],
      respiratory: ['tos', 'respiración', 'pecho', 'pulmón', 'asma'],
      cardiovascular: ['corazón', 'presión', 'palpitaciones', 'circulación'],
      neurological: ['cabeza', 'mareo', 'migraña', 'cefalea', 'vértigo'],
      musculoskeletal: ['músculo', 'articulación', 'espalda', 'hueso'],
      dermatological: ['piel', 'erupción', 'sarpullido', 'picazón'],
      pain: ['dolor', 'duele', 'molestia', 'ardor', 'punzada']
    };
    
    // Detect main category and specific terms
    let detectedCategory = '';
    let specificTerms: string[] = [];
    
    for (const [category, keywords] of Object.entries(medicalKeywords)) {
      for (const keyword of keywords) {
        if (userMessage.includes(keyword)) {
          detectedCategory = category;
          specificTerms.push(keyword);
        }
      }
    }
    
    // Generate response based on detected category and context
    if (detectedCategory === 'anal' || specificTerms.some(term => ['anal', 'recto', 'ano'].includes(term))) {
      mockResponse = `Entiendo que tienes molestias en la zona anal/rectal. Este tipo de síntomas pueden tener varias causas:

**Posibles causas comunes:**
- Hemorroides (internas o externas)
- Fisura anal
- Irritación por higiene inadecuada
- Estreñimiento crónico
- Inflamación local

**Preguntas importantes:**
- ¿El dolor es durante o después de defecar?
- ¿Has notado sangrado?
- ¿Hay hinchazón o protuberancias?
- ¿Tienes estreñimiento frecuente?

**Recomendaciones iniciales:**
- Mantén una higiene suave con agua tibia
- Aumenta el consumo de fibra y agua
- Evita esfuerzos excesivos al defecar
- Aplica compresas frías para reducir inflamación

Si los síntomas persisten más de una semana o hay sangrado significativo, es importante consultar con un proctólogo.`;
      
      suggestedSpecialty = 'Proctología';
      suggestedConditions = ['Hemorroides', 'Fisura anal', 'Proctitis'];
      severity = 40;
      
    } else if (detectedCategory === 'pain' && !specificTerms.some(term => ['cabeza', 'migraña'].includes(term))) {
      // Generic pain but not headache
      const painLocation = this.extractPainLocation(userMessage);
      mockResponse = `Comprendo que tienes dolor${painLocation ? ` en ${painLocation}` : ''}. Para evaluar mejor tu situación:

**Información importante:**
- ¿Desde cuándo tienes este dolor?
- ¿Es constante o aparece en momentos específicos?
- ¿Qué tan intenso es del 1 al 10?
- ¿Hay algo que lo alivie o lo empeore?

**Características del dolor:**
- ¿Es punzante, sordo, ardoroso o pulsátil?
- ¿Se irradia hacia otras zonas?
- ¿Está asociado con alguna actividad?

Mientras tanto, puedes probar medidas generales como reposo, aplicación de frío o calor según el tipo de dolor, y analgésicos de venta libre si no tienes contraindicaciones.

Si el dolor es muy intenso, repentino, o se acompaña de otros síntomas preocupantes, busca atención médica inmediata.`;
      
      severity = userMessage.includes('fuerte') || userMessage.includes('intenso') ? 60 : 35;
      
    } else if (conversationContext && userHistory.length > 0) {
      // Follow-up question with context
      mockResponse = `Gracias por la información adicional. Basándome en lo que me has contado anteriormente, es importante considerar:

**Evolución de tus síntomas:**
Para continuar evaluando tu caso, me gustaría saber:
- ¿Cómo han evolucionado los síntomas desde nuestra última conversación?
- ¿Has probado alguna de las recomendaciones que discutimos?
- ¿Han aparecido síntomas nuevos?

**Próximos pasos:**
Basándome en tu historial de síntomas, sería recomendable que consideres:
- Mantener un diario de síntomas
- Seguir las medidas preventivas que hemos discutido
- Programar una consulta presencial si los síntomas persisten

¿Hay algo específico que te preocupe en este momento o algún cambio que hayas notado?`;
      
    } else {
      // Default response for unclear queries
      mockResponse = `Hola, soy tu doctor virtual. Estoy aquí para ayudarte con tus consultas de salud.

Para brindarte la mejor asistencia, necesito que me proporciones información específica:

**Describe tu consulta:**
- ¿Qué síntomas específicos tienes?
- ¿Cuándo comenzaron?
- ¿Qué los provoca o alivia?
- ¿Hay otros síntomas asociados?

**Información adicional útil:**
- Tu edad aproximada
- Si tomas algún medicamento
- Si tienes alergias conocidas
- Antecedentes médicos relevantes

Recuerda que esta consulta virtual complementa pero no reemplaza una evaluación médica presencial, especialmente para síntomas graves o urgentes.`;
    }
    
    const followUpQuestions = this.generateContextualFollowUp(detectedCategory, specificTerms);
    
    const mockApiResponse: AIResponse = {
      text: mockResponse,
      severity,
      isEmergency,
      suggestedSpecialty,
      suggestedConditions,
      followUpQuestions
    };

    console.log('Contextual mock AI response generated:', mockApiResponse);
    return mockApiResponse;
  }
  
  /**
   * Extract pain location from user message
   */
  private extractPainLocation(message: string): string {
    const locations = {
      'cabeza': 'la cabeza',
      'espalda': 'la espalda', 
      'pecho': 'el pecho',
      'abdomen': 'el abdomen',
      'estómago': 'el estómago',
      'pierna': 'la pierna',
      'brazo': 'el brazo',
      'cuello': 'el cuello',
      'anal': 'la zona anal',
      'rectal': 'la zona rectal'
    };
    
    for (const [keyword, location] of Object.entries(locations)) {
      if (message.includes(keyword)) {
        return location;
      }
    }
    return '';
  }
  
  /**
   * Generate contextual follow-up questions
   */
  private generateContextualFollowUp(category: string, terms: string[]): string[] {
    const baseQuestions = [
      '¿Cuándo comenzaron estos síntomas?',
      '¿Has notado algún patrón en cuanto a cuándo aparecen?'
    ];
    
    switch (category) {
      case 'anal':
        return [
          ...baseQuestions,
          '¿El dolor ocurre durante o después de defecar?',
          '¿Has notado sangrado o secreción?',
          '¿Tienes problemas de estreñimiento?'
        ];
      case 'pain':
        return [
          ...baseQuestions,
          '¿Cómo describirías el tipo de dolor (punzante, sordo, ardoroso)?',
          '¿Hay algo que lo alivie o lo empeore?',
          '¿Del 1 al 10, qué tan intenso es el dolor?'
        ];
      default:
        return [
          ...baseQuestions,
          '¿Tienes otros síntomas asociados?',
          '¿Has probado algún tratamiento hasta ahora?'
        ];
    }
  }

  /**
   * Generate contextual answer options instead of follow-up questions
   */
  private generateAnswerOptions(userMessage: string, aiResponse: string): AIAnswerOption[] {
    const lowerMessage = userMessage.toLowerCase();
    const options: AIAnswerOption[] = [];
    
    // Always include a "free text" option
    options.push({
      id: 'free_text',
      text: 'Prefiero explicar con mis propias palabras',
      value: 'OPEN_TEXT_INPUT',
      category: 'general'
    });
    
    // Detect pain-related queries
    if (lowerMessage.includes('dolor')) {
      // Pain intensity options
      if (lowerMessage.includes('cabeza') || lowerMessage.includes('cefalea')) {
        options.push(
          {
            id: 'pain_type_1',
            text: 'Es un dolor pulsátil, como latidos',
            value: 'Tengo un dolor de cabeza pulsátil, como si fuera el latido del corazón',
            category: 'pain_type'
          },
          {
            id: 'pain_type_2', 
            text: 'Es un dolor constante y sordo',
            value: 'Tengo un dolor de cabeza constante y sordo que no se quita',
            category: 'pain_type'
          },
          {
            id: 'pain_type_3',
            text: 'Es un dolor punzante y agudo',
            value: 'Tengo un dolor de cabeza punzante y muy agudo',
            category: 'pain_type'
          }
        );
      } else if (lowerMessage.includes('corazón') || lowerMessage.includes('pecho')) {
        options.push(
          {
            id: 'chest_pain_1',
            text: 'Es como una presión en el pecho',
            value: 'Siento como una presión fuerte en el pecho, como si algo me apretara',
            category: 'chest_pain'
          },
          {
            id: 'chest_pain_2',
            text: 'Es un dolor punzante al respirar',
            value: 'Tengo un dolor punzante en el pecho que empeora cuando respiro profundo',
            category: 'chest_pain'  
          },
          {
            id: 'chest_pain_3',
            text: 'Es un dolor que se extiende al brazo',
            value: 'El dolor en el pecho se extiende hacia mi brazo izquierdo',
            category: 'chest_pain'
          }
        );
      } else {
        // Generic pain options
        options.push(
          {
            id: 'pain_intensity_1',
            text: 'El dolor es leve (1-3/10)',
            value: 'El dolor es leve, alrededor de 2 de 10 en intensidad',
            category: 'intensity'
          },
          {
            id: 'pain_intensity_2',
            text: 'El dolor es moderado (4-6/10)',
            value: 'El dolor es moderado, alrededor de 5 de 10 en intensidad',
            category: 'intensity'
          },
          {
            id: 'pain_intensity_3',
            text: 'El dolor es severo (7-10/10)',
            value: 'El dolor es severo, alrededor de 8 de 10 en intensidad',
            category: 'intensity'
          }
        );
      }
    }
    
    // Detect timing-related context
    if (!lowerMessage.includes('cuando') && !lowerMessage.includes('cuándo')) {
      options.push(
        {
          id: 'timing_1',
          text: 'Comenzó hoy',
          value: 'Los síntomas comenzaron hoy en la mañana',
          category: 'timing'
        },
        {
          id: 'timing_2',
          text: 'Llevo varios días así',
          value: 'Llevo aproximadamente 3-4 días con estos síntomas',
          category: 'timing'
        },
        {
          id: 'timing_3',
          text: 'Es un problema recurrente',
          value: 'Es un problema que me ha pasado varias veces antes',
          category: 'timing'
        }
      );
    }
    
    // Add medication-related options if not mentioned
    if (!lowerMessage.includes('medicamento') && !lowerMessage.includes('medicina')) {
      options.push(
        {
          id: 'medication_1',
          text: 'No he tomado nada todavía',
          value: 'No he tomado ningún medicamento para esto todavía',
          category: 'medication'
        },
        {
          id: 'medication_2',
          text: 'Tomé algo de venta libre',
          value: 'Tomé un analgésico de venta libre pero no me ha ayudado mucho',
          category: 'medication'
        }
      );
    }
    
    // Limit to max 5 options for better UX
    return options.slice(0, 5);
  }
}

export default new AIService();
