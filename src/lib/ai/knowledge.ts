// Medical Knowledge Base (RAG)
// Input: Query text
// Process: Generate embedding → Semantic search → Retrieve context
// Output: Relevant medical guidelines with sources
//
// NOTE: Embeddings still use OpenAI (text-embedding-3-small)
// This is because embedding migration is a separate task.

import { createServiceClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { logger } from '@/lib/observability/logger'

// NOTE: Embeddings continue using OpenAI's text-embedding-3-small
// GLM is used for chat/reasoning, but embedding migration is separate

/**
 * Generate embedding for text using OpenAI
 * Input: text
 * Process: Call OpenAI embedding API
 * Output: Vector embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        })

        return response.data[0].embedding
    } catch (error) {
        logger.error('Error generating embedding:', { error })
        throw error
    }
}

/**
 * Retrieve medical context using semantic search
 * Input: query, limit, specialty
 * Process: Generate embedding → Vector similarity search
 * Output: Relevant medical documents
 */
export async function retrieveMedicalContext(
    query: string,
    limit: number = 5,
    specialty?: string
) {
    const supabase = createServiceClient()

    try {
        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query)

        // Perform vector similarity search
        let searchQuery = supabase.rpc('match_medical_knowledge', {
            query_embedding: queryEmbedding,
            match_count: limit,
        })

        if (specialty) {
            searchQuery = searchQuery.eq('specialty', specialty)
        }

        const { data: results, error } = await searchQuery

        if (error) {
            logger.error('Error retrieving medical context:', { error })
            return []
        }

        return results || []
    } catch (error) {
        logger.error('Error retrieving medical context:', { error })
        return []
    }
}

/**
 * Generate augmented prompt with medical context
 * Input: basePrompt, context
 * Process: Format context → Inject into prompt
 * Output: Enhanced prompt with citations
 */
export function generateAugmentedPrompt(
    basePrompt: string,
    context: Array<{
        title: string
        content: string
        source: string
        source_url?: string
    }>
): string {
    if (context.length === 0) {
        return basePrompt
    }

    const contextSection = context
        .map(
            (doc, index) =>
                `[${index + 1}] ${doc.title} (${doc.source}):\n${doc.content}`
        )
        .join('\n\n')

    const citations = context
        .map((doc, index) => {
            if (doc.source_url) {
                return `[${index + 1}] ${doc.source}: ${doc.source_url}`
            }
            return `[${index + 1}] ${doc.source}`
        })
        .join('\n')

    return `${basePrompt}

CONTEXTO MÉDICO RELEVANTE:
${contextSection}

FUENTES:
${citations}

Por favor, basa tu respuesta en el contexto médico proporcionado y cita las fuentes cuando sea relevante.`
}

/**
 * Search medical knowledge base
 * Input: query, filters
 * Process: Full-text and semantic search
 * Output: Matching documents
 */
export async function searchMedicalKnowledge(
    query: string,
    filters?: {
        source?: string
        specialty?: string
        keywords?: string[]
    }
) {
    const supabase = createServiceClient()

    try {
        let searchQuery = supabase
            .from('medical_knowledge')
            .select('*')

        // Apply filters
        if (filters?.source) {
            searchQuery = searchQuery.eq('source', filters.source)
        }

        if (filters?.specialty) {
            searchQuery = searchQuery.eq('specialty', filters.specialty)
        }

        // Full-text search on content and title
        if (query) {
            searchQuery = searchQuery.or(
                `title.ilike.%${query}%,content.ilike.%${query}%`
            )
        }

        const { data: results, error } = await searchQuery.limit(10)

        if (error) {
            logger.error('Error searching medical knowledge:', { error })
            return []
        }

        return results || []
    } catch (error) {
        logger.error('Error searching medical knowledge:', { error })
        return []
    }
}

/**
 * Add medical knowledge document
 * Input: document metadata and content
 * Process: Generate embedding → Store in DB
 * Output: Stored document
 */
export async function addMedicalKnowledge(
    title: string,
    content: string,
    source: string,
    sourceUrl?: string,
    specialty?: string,
    keywords?: string[]
) {
    const supabase = createServiceClient()

    try {
        // Generate embedding
        const embedding = await generateEmbedding(content)

        // Store document
        const { data: document, error } = await supabase
            .from('medical_knowledge')
            .insert({
                title,
                content,
                source,
                source_url: sourceUrl,
                specialty,
                keywords: keywords || [],
                embedding,
                published_date: new Date(),
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to add medical knowledge: ${error.message}`)
        }

        return {
            success: true,
            document,
        }
    } catch (error) {
        logger.error('Error adding medical knowledge:', { error })
        throw error
    }
}

/**
 * Get medical knowledge by source
 * Input: source
 * Process: Query documents by source
 * Output: List of documents
 */
export async function getMedicalKnowledgeBySource(source: string) {
    const supabase = createServiceClient()

    try {
        const { data: documents, error } = await supabase
            .from('medical_knowledge')
            .select('*')
            .eq('source', source)
            .order('published_date', { ascending: false })

        if (error) {
            return []
        }

        return documents || []
    } catch (error) {
        logger.error('Error getting medical knowledge by source:', { error })
        return []
    }
}

/**
 * Get medical knowledge by specialty
 * Input: specialty
 * Process: Query documents by specialty
 * Output: List of documents
 */
export async function getMedicalKnowledgeBySpecialty(specialty: string) {
    const supabase = createServiceClient()

    try {
        const { data: documents, error } = await supabase
            .from('medical_knowledge')
            .select('*')
            .eq('specialty', specialty)
            .order('published_date', { ascending: false })

        if (error) {
            return []
        }

        return documents || []
    } catch (error) {
        logger.error('Error getting medical knowledge by specialty:', { error })
        return []
    }
}

/**
 * Get all available sources
 * Input: None
 * Process: Query distinct sources
 * Output: List of sources
 */
export async function getAvailableSources() {
    const supabase = createServiceClient()

    try {
        const { data: sources, error } = await supabase
            .from('medical_knowledge')
            .select('source')

        if (error) {
            return []
        }

        // Get unique sources
        const uniqueSources = [...new Set(sources?.map((s: { source: string }) => s.source) || [])]
        return uniqueSources
    } catch (error) {
        logger.error('Error getting available sources:', { error })
        return []
    }
}

/**
 * Get all available specialties
 * Input: None
 * Process: Query distinct specialties
 * Output: List of specialties
 */
export async function getAvailableKnowledgeSpecialties() {
    const supabase = createServiceClient()

    try {
        const { data: specialties, error } = await supabase
            .from('medical_knowledge')
            .select('specialty')
            .not('specialty', 'is', null)

        if (error) {
            return []
        }

        // Get unique specialties
        const uniqueSpecialties = [...new Set(specialties?.map((s: { specialty: string }) => s.specialty).filter(Boolean) || [])]
        return uniqueSpecialties
    } catch (error) {
        logger.error('Error getting available specialties:', { error })
        return []
    }
}

/**
 * Update medical knowledge document
 * Input: documentId, updates
 * Process: Update document and regenerate embedding if content changed
 * Output: Updated document
 */
export async function updateMedicalKnowledge(
    documentId: string,
    updates: {
        title?: string
        content?: string
        specialty?: string
        keywords?: string[]
    }
) {
    const supabase = createServiceClient()

    try {
        const updateData: Record<string, unknown> = { ...updates }

        // Regenerate embedding if content changed
        if (updates.content) {
            updateData.embedding = await generateEmbedding(updates.content)
        }

        const { data: document, error } = await supabase
            .from('medical_knowledge')
            .update(updateData)
            .eq('id', documentId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to update medical knowledge: ${error.message}`)
        }

        return {
            success: true,
            document,
        }
    } catch (error) {
        logger.error('Error updating medical knowledge:', { error })
        throw error
    }
}

/**
 * Delete medical knowledge document
 * Input: documentId
 * Process: Delete from DB
 * Output: Success status
 */
export async function deleteMedicalKnowledge(documentId: string) {
    const supabase = createServiceClient()

    try {
        const { error } = await supabase
            .from('medical_knowledge')
            .delete()
            .eq('id', documentId)

        if (error) {
            throw new Error(`Failed to delete medical knowledge: ${error.message}`)
        }

        return { success: true }
    } catch (error) {
        logger.error('Error deleting medical knowledge:', { error })
        throw error
    }
}
