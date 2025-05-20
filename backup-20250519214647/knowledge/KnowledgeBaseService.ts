import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Local type definitions for Supabase database
interface Database {
  public: {
    Tables: {
      knowledge_base: {
        Row: {
          id: string;
          question: string;
          answer: string;
          embedding: number[] | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          embedding?: number[] | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          embedding?: number[] | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      match_knowledge: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: Array<{
          id: string;
          question: string;
          answer: string;
          similarity: number;
        }>;
      };
    };
  };
}

// Create a type-safe Supabase client
type SupabaseClientType = SupabaseClient<Database>;

// This should match your database schema
type KnowledgeEntry = Database['public']['Tables']['knowledge_base']['Insert'] & {
  id?: string;
  question: string;
  answer: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export class KnowledgeBaseService {
  private supabase: SupabaseClientType | null = null;
  private openai: OpenAI | null = null;
  private embeddingModel = 'text-embedding-3-small';
  private similarityThreshold = 0.8; // Adjust based on testing
  private maxResults = 3;
  /**
   * Whether the service is properly initialized with Supabase credentials
   */
  public readonly isInitialized = false;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Only initialize if both URL and key are provided
    const hasCredentials = !!(supabaseUrl && supabaseKey);
    
    if (hasCredentials) {
      try {
        this.supabase = createClient<Database>(supabaseUrl!, supabaseKey!);
        Object.defineProperty(this, 'isInitialized', { value: true });
        console.log('KnowledgeBaseService initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
      }
    } else {
      console.warn('Supabase URL or key not provided. Knowledge base features will be disabled.');
    }
    
      // Get API key from environment variables
    // Try Node.js process.env
    let apiKey = process.env.VITE_OPENAI_API_KEY;
    
    // Try to get from global.import.meta if available (our polyfill)
    if (!apiKey && typeof global !== 'undefined' && global.import?.meta?.env) {
      try {
        apiKey = global.import.meta.env.VITE_OPENAI_API_KEY;
      } catch (e) {
        console.warn('Error accessing global.import.meta.env:', e);
      }
    }
    
    if (apiKey) {
      console.log('Initializing OpenAI client with API key...');
      try {
        // Create OpenAI instance with v4 API format
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true 
        });
        
        // Debug the OpenAI structure
        console.log('OpenAI client structure:');
        if (this.openai) {
          console.log('- Has embeddings property:', !!this.openai.embeddings);
          console.log('- Has chat property:', !!this.openai.chat);
          if (this.openai.embeddings) {
            console.log('- embeddings has create method:', !!this.openai.embeddings.create);
          }
          console.log('- Properties:', Object.keys(this.openai));
        }
        
        console.log('OpenAI client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize OpenAI client:', error);
        this.openai = null;
      }
    } else {
      console.warn('OpenAI API key not found. Knowledge base features will be limited.');
    }
  }

  // Generate embeddings for text using OpenAI
  private async getEmbedding(text: string): Promise<number[] | null> {
    if (!this.openai) {
      console.warn('OpenAI client not initialized. Cannot generate embeddings.');
      return null;
    }
    
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      if (!response.data || !response.data[0] || !response.data[0].embedding) {
        console.error('Invalid embedding response format:', response);
        return null;
      }
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null;
    }
  }

  // Store a new question-answer pair in the knowledge base
  public async addKnowledge(question: string, answer: string, metadata: Record<string, any> = {}): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Knowledge base not initialized. Cannot add knowledge.');
      return false;
    }
    
    const embedding = await this.getEmbedding(question);
    if (!embedding) return false;

    const entry: KnowledgeEntry = {
      question,
      answer,
      embedding,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await this.supabase!
        .from('knowledge_base')
        .insert(entry as any); // Type assertion needed due to type complexity

      if (error) {
        console.error('Error adding to knowledge base:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Exception while adding to knowledge base:', error);
      return false;
    }
  }

  // Find similar questions in the knowledge base
  public async findSimilar(question: string): Promise<KnowledgeEntry | null> {
    if (!this.isInitialized) {
      console.warn('Knowledge base not initialized. Cannot find similar questions.');
      return null;
    }
    
    const embedding = await this.getEmbedding(question);
    if (!embedding) return null;

    try {
      // Use Supabase's vector similarity search
      const { data, error } = await this.supabase!.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: this.similarityThreshold,
        match_count: this.maxResults
      }) as { data: KnowledgeEntry[] | null, error: any };

      if (error || !data?.length) {
        console.error('Error querying knowledge base:', error);
        return null;
      }

      // Return the most similar result
      return data[0];
    } catch (error) {
      console.error('Exception while querying knowledge base:', error);
      return null;
    }
  }

  // Get an answer from the knowledge base or fall back to OpenAI
  public async getAnswer(question: string): Promise<{ answer: string; source: 'knowledge_base' | 'openai' }> {
    // First try to find a similar question in the knowledge base
    const similar = await this.findSimilar(question);
    if (similar) {
      return { answer: similar.answer, source: 'knowledge_base' };
    }

    // If no good match found, use OpenAI if available
    if (!this.openai) {
      return { 
        answer: 'I don\'t have an answer for that question at the moment.',
        source: 'knowledge_base' 
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful medical assistant.' },
          { role: 'user', content: question }
        ],
        model: 'gpt-3.5-turbo',
      });

      const answer = completion.choices[0]?.message?.content || 'I am not sure how to respond to that.';
      
      // Add this new knowledge to the database for future use
      if (this.isInitialized) {
        await this.addKnowledge(question, answer, { source: 'openai' });
      }
      
      return { answer, source: 'openai' };
    } catch (error) {
      console.error('Error generating OpenAI completion:', error);
      return { 
        answer: 'I encountered an error while trying to answer your question.',
        source: 'error' 
      };
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
