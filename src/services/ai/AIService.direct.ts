import { supabase } from '../../lib/supabase';
import OpenAI from 'openai';
import medicationDatabase from '../../data/medications';
import { KnowledgeBaseService } from '../knowledge/KnowledgeBaseService';

// Initialize KnowledgeBaseService with Supabase credentials if available
const knowledgeBaseService = new KnowledgeBaseService(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// LocalStorage key for user-provided OpenAI API key
const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';
const DOCTOR_INSTRUCTIONS_KEY = 'doctor_instructions';
const DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY = 'doctor_image_analysis_enabled';

const DEFAULT_DOCTOR_INSTRUCTIONS = `Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.`;

/**
 * Retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 500, // ms
  maxDelay: 10000, // ms
  backoffFactor: 2, // exponential backoff
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableNetworkErrors: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN'],
  shouldRetry: (error: any) => {
    // Retry on network errors
    if (error.message && DEFAULT_RETRY_CONFIG.retryableNetworkErrors.some(netErr => error.message.includes(netErr))) {
      return true;
    }
    
    // Retry on specific HTTP status codes
    if (error.status && DEFAULT_RETRY_CONFIG.retryableStatusCodes.includes(error.status)) {
      return true;
    }
    
    // Retry on rate limiting from OpenAI (specific error types)
    if (error.type === 'rate_limit_exceeded' || error.type === 'server_error' || error.type === 'timeout') {
      return true;
    }
    
    return false;
  }
};

/**
 * A utility function for retrying operations with exponential backoff
 * @param operation The async function to retry
 * @param config Optional retry configuration
 * @returns Promise with the operation result
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let retries = 0;
  let lastError: any;

  while (retries <= config.maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (!config.shouldRetry(error) || retries >= config.maxRetries) {
        console.error(`Error not retryable or max retries reached: ${error.message}`);
        break;
      }

      const delay = Math.min(
        config.maxDelay,
        config.initialDelay * Math.pow(config.backoffFactor, retries) * (0.8 + 0.4 * Math.random())
      );

      console.warn(`Retry attempt ${retries + 1}/${config.maxRetries} for operation after ${delay}ms: ${error.message}`);

      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }

  throw lastError;
}

// Create an OpenAI instance that uses the environment variable
const getOpenAIInstance = (): OpenAI | null => {
  // Always use the environment-provided OpenAI key
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not found. Set VITE_OPENAI_API_KEY.');
    return null;
  }
  
  // Do not log API keys for security reasons
  
  // In production, prevent direct OpenAI API calls to avoid CORS and security issues
  // The deployment environment should use Netlify functions instead
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn('Production environment detected - direct OpenAI API calls disabled for security. Using Netlify functions.');
    return null;
  }
  
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
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

export interface StreamingAIResponse extends AIResponse {
  isStreaming: boolean;
  isComplete: boolean;
}

export type StreamingResponseHandler = (response: StreamingAIResponse) => void;

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
  stream?: boolean;
  onStreamingResponse?: StreamingResponseHandler;
}

class AIService {
  private supabase;
  private knowledgeBaseService = knowledgeBaseService;
  private standardModelEndpoint = '/.netlify/functions/standard-model';
  private premiumModelEndpoint = '/.netlify/functions/premium-model';
  private imageAnalysisEndpoint = '/.netlify/functions/image-analysis';

  constructor() {
    // Use the centralized Supabase client instead of creating a new one
    this.supabase = supabase;
  }

  /**
   * Process a user query with the appropriate AI model based on complexity
   * First checks knowledge base, then falls back to OpenAI if needed
   */
  public async processQuery(options: AIQueryOptions): Promise<AIResponse> {
    // First try to get an answer from the knowledge base if it's initialized
    if (knowledgeBaseService.isInitialized) {
      try {
        const kbResponse = await knowledgeBaseService.getAnswer(options.userMessage);
        if (kbResponse?.source === 'knowledge_base') {
          // Return the knowledge base response if we found a good match
          return {
            text: kbResponse.answer,
            severity: 0,
            isEmergency: false,
            suggestedSpecialty: 'General Medicine',
            suggestedConditions: [],
            suggestedMedications: [],
            followUpQuestions: []
          };
        }
      } catch (error) {
        console.warn('Error querying knowledge base, falling back to OpenAI:', error);
      }
    }
    // If streaming is requested, use the streaming version
    if (options.stream && options.onStreamingResponse) {
      return this.processQueryWithStreaming(options);
    }
    
    const needsPremiumModel = this.shouldUsePremiumModel(options);
    
    try {
      // Use retry mechanism for the entire operation
      return await withRetry(async () => {
        const medicalContext = await this.getMedicalKnowledge(options.userMessage);
        
        // Use direct OpenAI API call
        const openai = getOpenAIInstance();
        if (!openai) {
          console.log('OpenAI instance not available (likely production environment). Using Netlify functions.');
          
          // Fallback to Netlify functions for production deployment
          const endpoint = needsPremiumModel ? this.premiumModelEndpoint : this.standardModelEndpoint;
          const requestData = {
            message: options.userMessage,
            history: options.userHistory || [],
            medicalContext,
            userProfile: options.userProfile,
            severity: options.severity,
            location: options.location,
            customInstructions: options.customInstructions || this.getDoctorInstructions()
          };
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data;
        }
        
        const model = needsPremiumModel ? 'gpt-4' : 'gpt-3.5-turbo';
        let systemMessage = options.customInstructions || this.getDoctorInstructions();
        
        const formattedData = {
          message: options.userMessage,
          history: options.userHistory || [],
          medicalContext,
          userProfile: options.userProfile,
          severity: options.severity,
          location: options.location // Pass location for provider recommendations
        };
        
        const messages = [
          { role: "system", content: systemMessage },
          { role: "user", content: this.formatUserMessage(formattedData) }
        ];
        
        console.log(`Using model: ${model} for direct OpenAI request`);
        
        const completion = await openai.chat.completions.create({
          model,
          messages: messages as any,
          temperature: 0.7,
        });
        
        const aiResponse = completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu consulta.";
        
        const enhancedResponse = await this.enhanceResponse({
          text: aiResponse,
          severity: options.severity
        }, options);
        
        return enhancedResponse;
      });
    } catch (error) {
      console.error('Error processing AI query after all retries:', error);
      return {
        text: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente en unos momentos.',
        severity: options.severity,
      };
    }
  }
  
  /**
   * Process a user query with streaming response
   * This provides a real-time typing effect as the AI generates the response
   */
  public async processQueryWithStreaming(options: AIQueryOptions): Promise<AIResponse> {
    // First try to get an answer from the knowledge base for non-streaming responses
    if (!options.stream && knowledgeBaseService.isInitialized) {
      try {
        const kbResponse = await knowledgeBaseService.getAnswer(options.userMessage);
        if (kbResponse?.source === 'knowledge_base') {
          // Return the knowledge base response if we found a good match
          return {
            text: kbResponse.answer,
            severity: 0,
            isEmergency: false,
            suggestedSpecialty: 'General Medicine',
            suggestedConditions: [],
            suggestedMedications: [],
            followUpQuestions: []
          };
        }
      } catch (error) {
        console.warn('Error querying knowledge base, falling back to OpenAI:', error);
      }
    }
    
    // If we need streaming or didn't find a good match in the knowledge base, use OpenAI
    if (!options.onStreamingResponse) {
      throw new Error('Stream handler is required for streaming responses');
    }
    
    const needsPremiumModel = this.shouldUsePremiumModel(options);
    
    try {
      // Get medical context outside the retry loop to avoid duplicate calls
      const medicalContext = await this.getMedicalKnowledge(options.userMessage);
      
      // Initial response with empty text
      const initialResponse: StreamingAIResponse = {
        text: '',
        severity: options.severity || 10,
        isStreaming: true,
        isComplete: false
      };
      options.onStreamingResponse(initialResponse);
      
      // Use direct OpenAI API streaming
      const openai = getOpenAIInstance();
      if (!openai) {
        console.log('OpenAI instance not available (likely production environment). Falling back to Netlify functions.');
        
        // Fallback to Netlify functions for production deployment
        return await this.fallbackToNetlifyFunctions(options, medicalContext);
      }
      
      // Use retry mechanism for the streaming operation
      return await withRetry(async () => {
        const model = needsPremiumModel ? 'gpt-4' : 'gpt-3.5-turbo';
        let systemMessage = options.customInstructions || this.getDoctorInstructions();
        
        const formattedData = {
          message: options.userMessage,
          history: options.userHistory || [],
          medicalContext,
          userProfile: options.userProfile,
          severity: options.severity,
          location: options.location
        };
        
        const messages = [
          { role: "system", content: systemMessage },
          { role: "user", content: this.formatUserMessage(formattedData) }
        ];
        
        console.log(`Using model: ${model} for streaming request`);
        
        let fullResponse = '';
        
        // Create a thinking indicator that updates every second
        let dots = 1;
        const thinkingInterval = setInterval(() => {
          // Create a thinking message that visually updates
          const thinkingText = "Analizando" + ".".repeat(dots);
          dots = (dots % 4) + 1; // Cycle from 1-4 dots
          
          // Update handler with thinking message
          options.onStreamingResponse({
            text: fullResponse || thinkingText,
            severity: options.severity || 10,
            isStreaming: true,
            isComplete: false
          });
        }, 1000);
        
        try {
          // Call OpenAI with streaming enabled
          const stream = await openai.chat.completions.create({
            model,
            messages: messages as any,
            temperature: 0.7,
            stream: true,
          });
          
          // Process each chunk of the stream
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              
              // Update with current response text
              const updatedResponse: StreamingAIResponse = {
                text: fullResponse,
                severity: options.severity || this.estimateSeverity(fullResponse),
                isStreaming: true,
                isComplete: false
              };
              options.onStreamingResponse(updatedResponse);
            }
          }
          
          // Clear the thinking indicator
          clearInterval(thinkingInterval);
          
          // Create enhanced response once streaming is complete
          const response = {
            text: fullResponse,
            severity: options.severity,
          };
          
          const enhancedResponse = await this.enhanceResponse(response, options);
          
          // Send final response with isComplete flag
          const finalResponse: StreamingAIResponse = {
            ...enhancedResponse,
            isStreaming: false,
            isComplete: true
          };
          options.onStreamingResponse(finalResponse);
          
          return enhancedResponse;
        } catch (error) {
          // Make sure to clear the interval if there's an error
          clearInterval(thinkingInterval);
          throw error;
        }
      });
    } catch (error) {
      console.error('Error processing AI query after all retries:', error);
      
      // Final fallback with streaming error handling
      const errorResponse: StreamingAIResponse = {
        text: 'Lo siento, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente en unos momentos.',
        severity: options.severity,
        isStreaming: false,
        isComplete: true
      };
      options.onStreamingResponse(errorResponse);
      
      return {
        text: errorResponse.text,
        severity: options.severity,
      };
    }
  }
  
  /**
   * Fallback method to use Netlify functions when direct OpenAI API is not available (production)
   */
  private async fallbackToNetlifyFunctions(options: AIQueryOptions, medicalContext: any): Promise<AIResponse> {
    const needsPremiumModel = this.shouldUsePremiumModel(options);
    const endpoint = needsPremiumModel ? this.premiumModelEndpoint : this.standardModelEndpoint;
    
    console.log(`Attempting Netlify function call to: ${endpoint}`);
    
    const requestData = {
      message: options.userMessage,
      history: options.userHistory || [],
      medicalContext,
      userProfile: options.userProfile,
      severity: options.severity,
      location: options.location,
      customInstructions: options.customInstructions || this.getDoctorInstructions()
    };
    
    console.log('Request data:', { 
      message: requestData.message?.substring(0, 100) + '...', 
      historyLength: requestData.history.length,
      hasProfile: !!requestData.userProfile,
      severity: requestData.severity
    });
    
    // Simulate streaming with Netlify function response
    try {
      console.log('Making fetch request to Netlify function...');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Received response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Netlify function error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Netlify function response received:', {
        hasText: !!data.text,
        textLength: data.text?.length || 0,
        severity: data.severity
      });
      
      // Simulate streaming by breaking the response into chunks
      if (options.onStreamingResponse && data.text) {
        console.log('Starting simulated streaming...');
        const words = data.text.split(' ');
        const chunkSize = Math.max(1, Math.floor(words.length / 10)); // Break into ~10 chunks
        
        let currentText = '';
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ');
          currentText += (i > 0 ? ' ' : '') + chunk;
          
          const isLast = i + chunkSize >= words.length;
          
          const streamResponse: StreamingAIResponse = {
            ...data,
            text: currentText,
            isStreaming: !isLast,
            isComplete: isLast
          };
          
          options.onStreamingResponse(streamResponse);
          
          // Add a small delay to simulate real streaming
          if (!isLast) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        console.log('Simulated streaming completed');
      }
      
      return data;
      
    } catch (error) {
      console.error('Netlify function fallback failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // If the Netlify function fails, provide a helpful error message through streaming
      if (options.onStreamingResponse) {
        const errorResponse: StreamingAIResponse = {
          text: `Lo siento, estoy experimentando dificultades técnicas en este momento. Error: ${error.message}. Por favor, intenta nuevamente en unos momentos.`,
          severity: options.severity || 10,
          isStreaming: false,
          isComplete: true
        };
        options.onStreamingResponse(errorResponse);
      }
      
      throw error;
    }
  }
  
  /**
   * Analyze a medical image and provide insights
   */
  public async analyzeImage(imageUrl: string, symptoms?: string): Promise<AIResponse> {
    // First try to find a similar case in the knowledge base if symptoms are provided
    if (symptoms && knowledgeBaseService.isInitialized) {
      try {
        const kbResponse = await knowledgeBaseService.getAnswer(`Image analysis for symptoms: ${symptoms}`);
        if (kbResponse?.source === 'knowledge_base') {
          return {
            text: kbResponse.answer,
            severity: 0,
            isEmergency: false,
            suggestedSpecialty: 'Dermatology', // Default specialty for image analysis
            suggestedConditions: [],
            suggestedMedications: [],
            followUpQuestions: [],
            imageAnalysis: {
              findings: 'Analysis based on similar cases in our knowledge base',
              confidence: 0.8
            }
          };
        }
      } catch (error) {
        console.warn('Error querying knowledge base for image analysis, falling back to OpenAI:', error);
      }
    }
    try {
      // Check if image analysis is enabled in user settings
      if (!this.isImageAnalysisEnabled()) {
        return {
          text: 'El análisis de imágenes está desactivado. Por favor, actívalo en la configuración o describe tus síntomas en texto.',
        };
      }
      
      console.log('Analyzing image:', imageUrl.substring(0, 30) + '...');
      
      // Use OpenAI directly for image analysis
      const openai = getOpenAIInstance();
      if (!openai) {
        throw new Error('OpenAI instance not available');
      }
      
      // Use retry mechanism
      return await withRetry(async () => {
        const model = 'gpt-4-vision-preview';
        let systemMessage = this.getDoctorInstructions();
        systemMessage += '\n\nAhora estás analizando una imagen médica. Analiza la imagen proporcionada y describe lo que observas desde una perspectiva médica. Sé detallado y preciso en tu análisis.';
        
        const userContent = symptoms 
          ? `Analiza esta imagen médica. Síntomas reportados: ${symptoms}`
          : `Analiza esta imagen médica y proporciona un diagnóstico preliminar.`;
        
        const messages = [
          { role: "system", content: systemMessage },
          { 
            role: "user", 
            content: [
              { type: "text", text: userContent },
              { 
                type: "image_url", 
                image_url: { url: imageUrl } 
              }
            ]
          }
        ];
        
        console.log('Using vision model for image analysis');
        
        const completion = await openai.chat.completions.create({
          model,
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 800,
        });
        
        const aiResponse = completion.choices[0]?.message?.content || "No se pudo analizar la imagen.";
        
        // Parse the findings to extract key details
        const findingsRegex = /hallazgos|findings|observaciones|diagnóstico|diagnosis/i;
        const findings = aiResponse.match(findingsRegex) 
          ? aiResponse.split(findingsRegex)[1] || aiResponse 
          : aiResponse;
        
        // Estimate confidence level from the response text
        const confidenceRegex = /confianza|confidence|certeza|seguridad/i;
        let confidenceText = aiResponse.match(confidenceRegex) 
          ? aiResponse.split(confidenceRegex)[1] || "" 
          : "";
        
        let confidence = 0.75; // Default moderate confidence
        
        if (confidenceText.includes("alta") || confidenceText.includes("high")) {
          confidence = 0.9;
        } else if (confidenceText.includes("baja") || confidenceText.includes("low")) {
          confidence = 0.5;
        }
        
        return {
          text: aiResponse,
          imageAnalysis: {
            findings: findings.trim(),
            confidence,
          },
          severity: this.estimateSeverity(aiResponse),
          suggestedSpecialty: this.extractSpecialty(aiResponse),
        };
      });
    } catch (error) {
      console.error('Error analyzing image after all retries:', error);
      return {
        text: 'No se pudo analizar la imagen. Por favor, intenta con otra imagen o describe tus síntomas.',
      };
    }
  }

  /**
   * Generate smart replies based on conversation context
   * @param conversationContext The context of the conversation
   * @returns Array of suggested replies
   */
  public async generateSmartReplies(conversationContext: string): Promise<string[]> {
    try {
      const openai = getOpenAIInstance();
      if (!openai) {
        console.warn('OpenAI instance not available for smart replies');
        return ['Tell me more', 'Thank you', 'Next question'];
      }

      // Use retry mechanism
      return await withRetry(async () => {
        const completion = await openai.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'Generate 3 brief, helpful response options that a user might select as a quick reply. Make them concise (2-5 words each) and varied in tone and content. Return them as a JSON array of strings.' 
            },
            { role: 'user', content: conversationContext }
          ],
          model: 'gpt-3.5-turbo-json-mode',
          response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message?.content || '{"replies": []}';
        const parsedResponse = JSON.parse(response);
        return parsedResponse.replies || [];
      });
    } catch (error) {
      console.error('Error generating smart replies after all retries:', error);
      return ['Tell me more', 'Thank you', 'Next question'];
    }
  }

  /**
   * Analyze symptoms using OpenAI for triage
   * @param symptoms Description of symptoms
   * @returns Analysis results with potential conditions and recommendations
   */
  public async analyzeSymptoms(symptoms: string): Promise<any> {
    try {
      const openai = getOpenAIInstance();
      if (!openai) {
        console.warn('OpenAI instance not available for symptom analysis');
        return this.simulateSymptomAnalysis(symptoms);
      }

      // Use retry mechanism
      return await withRetry(async () => {
        const prompt = `
          You are a medical assistant. Analyze the following symptoms and provide: 
          1. Potential conditions (with confidence levels)
          2. Recommended specialists
          3. Urgency level (low, medium, high, emergency)
          4. Next steps for the patient
          
          Symptoms: ${symptoms}
          
          Format your response as a valid JSON object with the following structure:
          {
            "potentialConditions": [{"condition": string, "confidence": number}],
            "recommendedSpecialists": string[],
            "urgency": string,
            "nextSteps": string[]
          }
        `;

        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo-json-mode',
          response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(response);
      });
    } catch (error) {
      console.error('Error analyzing symptoms after all retries:', error);
      return this.simulateSymptomAnalysis(symptoms);
    }
  }
  
  /**
   * Find nearby healthcare providers based on AI diagnosis
   */
  async findNearbyProviders(specialty: string, location: { latitude: number; longitude: number }): Promise<any[]> {
    try {
      console.log(`Finding providers near: ${location.latitude}, ${location.longitude}`);
      
      // Use retry mechanism
      return await withRetry(async () => {
        const { data, error } = await this.supabase
          .from('doctors')
          .select('*')
          .eq('specialty', specialty)
          .order('distance', { ascending: true });
          
        if (error) throw error;
        
        return data || [];
      });
    } catch (error) {
      console.error('Error finding nearby providers after all retries:', error);
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
  
  private getDoctorInstructions(): string {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined' && window.localStorage;
    
    if (isBrowser) {
      try {
        const instructions = localStorage.getItem(DOCTOR_INSTRUCTIONS_KEY);
        if (instructions) {
          return instructions;
        }
      } catch (error) {
        console.error('Error retrieving doctor instructions from localStorage:', error);
      }
    }
    
    return DEFAULT_DOCTOR_INSTRUCTIONS;
  }
  
  private isImageAnalysisEnabled(): boolean {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined' && window.localStorage;
    
    if (isBrowser) {
      try {
        const enabled = localStorage.getItem(DOCTOR_IMAGE_ANALYSIS_ENABLED_KEY);
        return enabled === null || enabled === 'true';
      } catch (error) {
        console.error('Error checking if image analysis is enabled in localStorage:', error);
      }
    }
    
    return true; // Default to enabled
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
  
  private async enhanceResponse(response: any, options: AIQueryOptions): Promise<AIResponse> {
    if (options.location && response.suggestedSpecialty) {
      try {
        // Enhance with nearby providers if location available
        const nearbyProviders = await this.findNearbyProviders(
          response.suggestedSpecialty, 
          options.location
        );
        
        if (nearbyProviders && nearbyProviders.length > 0) {
          response.nearbyProviders = nearbyProviders.slice(0, 3); // Limit to top 3
        }
      } catch (error) {
        console.error('Error finding nearby providers:', error);
        // Continue without providers
      }
    }
    
    // If suggestions aren't included but we have text that might contain condition info
    if (!response.suggestedConditions && response.text) {
      // Try to extract conditions from the text
      response.suggestedConditions = this.extractConditions(response.text);
    }
    
    // Ensure our response has all expected fields
    return {
      text: response.text || "",
      severity: response.severity || options.severity || 10,
      isEmergency: response.isEmergency || false,
      suggestedSpecialty: response.suggestedSpecialty,
      suggestedConditions: response.suggestedConditions || [],
      suggestedMedications: response.suggestedMedications || [],
      followUpQuestions: response.followUpQuestions || this.generateFollowUpQuestions(response.text || ""),
      nearbyProviders: response.nearbyProviders || [],
      ...response // Include any other properties from the original response
    };
  }
  
  private generateProductsFromDatabase(pharmacyName: string): any[] {
    const products = medicationDatabase.flatMap(category => 
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
    return products || [];
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
  
  private simulateSymptomAnalysis(symptoms: string): any {
    // Simple mock analysis for common symptoms
    if (symptoms.toLowerCase().includes('dolor de cabeza')) {
      return {
        potentialConditions: [
          { condition: "Migraña", confidence: 0.75 },
          { condition: "Cefalea tensional", confidence: 0.65 },
          { condition: "Sinusitis", confidence: 0.40 }
        ],
        recommendedSpecialists: ["Neurólogo", "Médico general"],
        urgency: "medium",
        nextSteps: [
          "Tomar analgésicos de venta libre como paracetamol",
          "Descansar en un lugar oscuro y tranquilo",
          "Mantener un registro de frecuencia e intensidad",
          "Consultar a un médico si es recurrente"
        ]
      };
    } else if (symptoms.toLowerCase().includes('dolor de estómago') || symptoms.toLowerCase().includes('náusea')) {
      return {
        potentialConditions: [
          { condition: "Gastritis", confidence: 0.70 },
          { condition: "Indigestión", confidence: 0.65 },
          { condition: "Síndrome de intestino irritable", confidence: 0.45 }
        ],
        recommendedSpecialists: ["Gastroenterólogo", "Médico general"],
        urgency: "low",
        nextSteps: [
          "Evitar alimentos irritantes y picantes",
          "Mantenerse hidratado",
          "Considerar antiácidos de venta libre",
          "Consultar a un médico si persiste más de 48 horas"
        ]
      };
    } else if (symptoms.toLowerCase().includes('fiebre')) {
      return {
        potentialConditions: [
          { condition: "Infección viral", confidence: 0.80 },
          { condition: "Infección bacteriana", confidence: 0.60 },
          { condition: "Gripe", confidence: 0.70 }
        ],
        recommendedSpecialists: ["Médico general", "Infectólogo"],
        urgency: "medium",
        nextSteps: [
          "Descansar y mantenerse hidratado",
          "Tomar paracetamol para bajar la fiebre",
          "Monitorear la temperatura regularmente",
          "Buscar atención médica si supera los 39°C o persiste más de 3 días"
        ]
      };
    }
    
    // Default response for other symptoms
    return {
      potentialConditions: [
        { condition: "Condición no identificada", confidence: 0.40 }
      ],
      recommendedSpecialists: ["Médico general"],
      urgency: "low",
      nextSteps: [
        "Monitorear los síntomas",
        "Descansar adecuadamente",
        "Mantener una buena hidratación",
        "Consultar a un médico para una evaluación presencial"
      ]
    };
  }
}

export default new AIService();