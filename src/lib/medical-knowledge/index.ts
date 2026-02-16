/**
 * Medical Knowledge Base (RAG) for Doctor.mx
 * Provides context-augmented responses using Mexican medical guidelines
 * 
 * NOTE: Embeddings still use OpenAI (text-embedding-3-small)
 * This is because embedding migration is a separate task requiring
 * re-indexing of all documents.
 */

import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import { logger } from '@/lib/observability/logger';
import type { 
  MedicalDocument, 
  RetrievedContext, 
  MedicalGuideline,
  MedicalDocumentWithSimilarity,
  MedicalSpecialty,
  SearchOptions,
  KnowledgeBaseStats,
  MedicalGuidelineType
} from './types';

// Re-export types
export type {
  MedicalDocument,
  RetrievedContext,
  MedicalGuideline,
  MedicalDocumentWithSimilarity,
  MedicalSpecialty,
  SearchOptions,
  KnowledgeBaseStats,
  MedicalGuidelineType
} from './types';

// Re-export data (no re-export getSpecialty/getSpecialtiesByKeyword to avoid conflict with loaders)
export {
  MEDICAL_SPECIALTIES,
  SPECIALTY_MAP,
  ALL_GUIDELINES,
  GUIDELINES_BY_SPECIALTY,
  GENERAL_GUIDELINES,
  CARDIOLOGY_GUIDELINES,
  ENDOCRINOLOGY_GUIDELINES,
  PULMONOLOGY_GUIDELINES,
  GASTROENTEROLOGY_GUIDELINES,
  NEUROLOGY_GUIDELINES,
  DERMATOLOGY_GUIDELINES,
  INFECTOLOGY_GUIDELINES,
  PSYCHIATRY_GUIDELINES,
  RHEUMATOLOGY_GUIDELINES,
  NEPHROLOGY_GUIDELINES,
  UROLOGY_GUIDELINES,
  OPHTHALMOLOGY_GUIDELINES,
  ENT_GUIDELINES,
  GERIATRICS_GUIDELINES,
  GYNECOLOGY_GUIDELINES,
  PEDIATRICS_GUIDELINES,
  EMERGENCY_GUIDELINES,
  PREVENTIVE_GUIDELINES,
  PAIN_GUIDELINES,
  TRAUMATOLOGY_GUIDELINES
} from './data';

// Re-export loaders (these are the main functions to use)
export {
  // Guideline Loaders
  getAllGuidelines,
  getGuidelinesBySpecialty,
  searchGuidelines,
  getGuidelinesBySource,
  getGuidelinesByType,
  getGuidelinesByYear,
  getRecentGuidelines,
  getGuidelinesStats,
  clearGuidelineCache,
  // Specialty Loaders (main entry points)
  getAllSpecialties,
  getSpecialty,
  getSpecialtiesByKeyword,
  getSpecialtyOptions,
  getSpecialtyNames,
  specialtyExists,
  searchSpecialties,
  getRelatedSpecialties,
  getSpecialtyStats,
  clearSpecialtyCache
} from './loaders';

// Re-export guideline data for backward compatibility
export { ALL_GUIDELINES as SAMPLE_GUIDELINES } from './data/guidelines';

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    logger.error('Error generating embedding', { error: (error as Error).message }, error as Error);
    throw error;
  }
}

/**
 * Initialize the medical knowledge base with sample guidelines
 */
export async function initializeMedicalKnowledgeBase(): Promise<void> {
  const supabase = await createClient();
  const { ALL_GUIDELINES } = await import('./data/guidelines');

  logger.info('Initializing medical knowledge base', { context: 'medical-knowledge' });

  for (const guideline of ALL_GUIDELINES) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('medical_knowledge')
        .select('id')
        .eq('metadata->>title', guideline.title)
        .single();

      if (existing) continue;

      // Generate embedding
      const embedding = await generateEmbedding(guideline.content);

      // Store in database
      await supabase.from('medical_knowledge').insert({
        content: guideline.content,
        source: guideline.source,
        specialty: guideline.specialty,
        embedding: embedding,
        metadata: {
          title: guideline.title,
          author: guideline.source,
          year: guideline.year,
          type: guideline.type,
          keywords: guideline.keywords,
        }
      });

      logger.info(`Added medical guideline: ${guideline.title}`, { context: 'medical-knowledge' });
    } catch (error) {
      logger.error(`Error adding ${guideline.title}`, { context: 'medical-knowledge', error });
    }
  }

  logger.info('Medical knowledge base initialized', { context: 'medical-knowledge' });
}

/**
 * Retrieve relevant medical context based on symptoms/query
 */
export async function retrieveMedicalContext(
  query: string,
  options?: {
    specialty?: string;
    limit?: number;
  }
): Promise<RetrievedContext> {
  const supabase = await createClient();
  const limit = options?.limit || 5;
  
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Use Supabase's vector similarity search
    const { data, error } = await supabase.rpc('match_medical_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      filter_specialty: options?.specialty || null,
    });
    
    if (error) {
      // Fallback to keyword search if vector search fails
      logger.warn('Vector search failed, falling back to keyword search', { error: (error as Error).message });
      return keywordSearch(supabase, query, options);
    }
    
    if (!data || data.length === 0) {
      return keywordSearch(supabase, query, options);
    }
    
    return {
      documents: (data as MedicalDocumentWithSimilarity[]).map((doc) => ({
        id: doc.id,
        content: doc.content,
        source: doc.source,
        specialty: doc.specialty,
        metadata: doc.metadata,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      })),
      relevance_scores: (data as MedicalDocumentWithSimilarity[]).map((doc) => doc.similarity || 0.7),
      total_results: data.length,
      query,
    };
  } catch (error) {
    logger.error('Error retrieving medical context', { error: (error as Error).message }, error as Error);
    return keywordSearch(supabase, query, options);
  }
}

/**
 * Fallback keyword search
 */
async function keywordSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  options?: { specialty?: string; limit?: number }
): Promise<RetrievedContext> {
  const limit = options?.limit || 5;
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  let dbQuery = supabase
    .from('medical_knowledge')
    .select('*')
    .limit(limit);
  
  if (options?.specialty) {
    dbQuery = dbQuery.or(`specialty.eq.${options.specialty},specialty.eq.General`);
  }
  
  // Search in content
  if (keywords.length > 0) {
    const searchPattern = keywords.join('%');
    dbQuery = dbQuery.ilike('content', `%${searchPattern}%`);
  }
  
  const { data, error } = await dbQuery;
  
  if (error || !data) {
    return {
      documents: [],
      relevance_scores: [],
      total_results: 0,
      query,
    };
  }
  
  return {
    documents: data,
    relevance_scores: data.map(() => 0.5),
    total_results: data.length,
    query,
  };
}

/**
 * Generate augmented prompt with retrieved medical context
 */
export function generateAugmentedPrompt(
  basePrompt: string,
  retrievedContext: RetrievedContext
): string {
  if (retrievedContext.documents.length === 0) {
    return basePrompt;
  }
  
  const contextSummary = retrievedContext.documents
    .map((doc, index) => {
      const score = retrievedContext.relevance_scores[index];
      const title = doc.metadata?.title || doc.source;
      const relevanceLabel = score >= 0.8 ? '⭐' : score >= 0.6 ? '✓' : '';
      return `📋 **${title}** ${relevanceLabel} (${doc.source}, ${doc.metadata?.year || 'N/A'})\n${doc.content.substring(0, 400)}...`;
    })
    .join('\n\n');
  
  return `${basePrompt}

## CONTEXTO MÉDICO RELEVANTE (Guías Clínicas Mexicanas)
${contextSummary}

## INSTRUCCIONES DE CITACIÓN
- Utiliza la información de las guías clínicas para fundamentar tu respuesta
- Cita las fuentes específicas (NOM, IMSS, ISSSTE, etc.) cuando hagas recomendaciones
- Prioriza las guías mexicanas (NOM, IMSS, ISSSTE) sobre internacionales
- Si hay información conflictiva, menciona las diferentes perspectivas
- Incluye referencias al final de tu respuesta cuando cites guías específicas`;
}

/**
 * Get medical knowledge statistics
 */
export async function getMedicalKnowledgeStats(): Promise<KnowledgeBaseStats> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('medical_knowledge')
    .select('specialty, source, updated_at');
  
  if (error || !data) {
    return {
      total_documents: 0,
      documents_by_specialty: {},
      documents_by_source: {},
      last_updated: new Date().toISOString(),
    };
  }
  
  const specialtyCount: Record<string, number> = {};
  const sourceCount: Record<string, number> = {};
  
  data.forEach(doc => {
    specialtyCount[doc.specialty] = (specialtyCount[doc.specialty] || 0) + 1;
    sourceCount[doc.source] = (sourceCount[doc.source] || 0) + 1;
  });
  
  const lastUpdated = data
    .map(doc => doc.updated_at)
    .sort()
    .pop() || new Date().toISOString();
  
  return {
    total_documents: data.length,
    documents_by_specialty: specialtyCount,
    documents_by_source: sourceCount,
    last_updated: lastUpdated,
  };
}
