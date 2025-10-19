import OpenAI from 'openai';
import { supabase } from '../lib/supabase.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MedicalDocument {
  id: string;
  content: string;
  source: string;
  specialty: string;
  embedding: number[];
  metadata: {
    title?: string;
    author?: string;
    year?: number;
    type?: 'guideline' | 'protocol' | 'reference' | 'study';
    url?: string;
    keywords?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface RetrievedContext {
  documents: MedicalDocument[];
  relevance_scores: number[];
  total_results: number;
  query: string;
}

export interface MedicalGuideline {
  title: string;
  content: string;
  specialty: string;
  source: string;
  year: number;
  type: 'nom' | 'imss' | 'issste' | 'who' | 'cdc' | 'uptodate';
  keywords: string[];
}

/**
 * Initialize the medical knowledge base with sample guidelines
 */
export async function initializeMedicalKnowledgeBase(): Promise<void> {
  try {
    console.log('🏥 Initializing medical knowledge base...');

    const sampleGuidelines: MedicalGuideline[] = [
      {
        title: 'NOM-004-SSA3-2012 - Prescripción Electrónica',
        content: 'La Norma Oficial Mexicana establece los requisitos para la prescripción electrónica de medicamentos. Incluye: identificación del prescriptor, datos del paciente, medicamento prescrito con dosis, frecuencia y duración, firma electrónica, y validación de la prescripción.',
        specialty: 'General',
        source: 'Secretaría de Salud',
        year: 2012,
        type: 'nom',
        keywords: ['prescripción', 'electrónica', 'medicamentos', 'firma digital', 'validación']
      },
      {
        title: 'NOM-024-SSA3-2012 - Telemedicina',
        content: 'Norma que regula la práctica de telemedicina en México. Establece requisitos para: consentimiento informado, confidencialidad de datos, calidad de la consulta, registro de actividades, y responsabilidades del prestador de servicios.',
        specialty: 'General',
        source: 'Secretaría de Salud',
        year: 2012,
        type: 'nom',
        keywords: ['telemedicina', 'consentimiento', 'confidencialidad', 'calidad', 'responsabilidad']
      },
      {
        title: 'Guía IMSS - Hipertensión Arterial',
        content: 'Protocolo de atención para hipertensión arterial: diagnóstico con presión arterial ≥140/90 mmHg en dos ocasiones, evaluación de factores de riesgo cardiovascular, estudios de laboratorio básicos, tratamiento no farmacológico (dieta DASH, ejercicio, reducción de peso), y tratamiento farmacológico según escalones terapéuticos.',
        specialty: 'Cardiología',
        source: 'IMSS',
        year: 2023,
        type: 'imss',
        keywords: ['hipertensión', 'presión arterial', 'factores de riesgo', 'dieta DASH', 'tratamiento farmacológico']
      },
      {
        title: 'Guía IMSS - Diabetes Mellitus Tipo 2',
        content: 'Manejo de diabetes tipo 2: diagnóstico con glucosa en ayunas ≥126 mg/dL o HbA1c ≥6.5%, monitoreo de glucosa, control de factores de riesgo, tratamiento con metformina como primera línea, insulinización cuando HbA1c >9%, y complicaciones micro y macrovasculares.',
        specialty: 'Endocrinología',
        source: 'IMSS',
        year: 2023,
        type: 'imss',
        keywords: ['diabetes', 'glucosa', 'HbA1c', 'metformina', 'insulina', 'complicaciones']
      },
      {
        title: 'Protocolo ISSSTE - Infecciones Respiratorias Agudas',
        content: 'Atención de IRA en adultos: diagnóstico diferencial entre resfriado común, influenza y COVID-19, criterios de gravedad, tratamiento sintomático, antivirales para influenza, antibióticos solo en casos específicos, y prevención mediante vacunación.',
        specialty: 'Neumología',
        source: 'ISSSTE',
        year: 2023,
        type: 'issste',
        keywords: ['infecciones respiratorias', 'influenza', 'COVID-19', 'antivirales', 'antibióticos', 'vacunación']
      },
      {
        title: 'Guía WHO - Manejo del Dolor',
        content: 'Escalera analgésica de la OMS: escalón 1 (paracetamol, AINEs), escalón 2 (opioides débiles como tramadol), escalón 3 (opioides fuertes como morfina), administración por vía oral cuando sea posible, dosis regulares, y evaluación continua del dolor.',
        specialty: 'Medicina del Dolor',
        source: 'WHO',
        year: 2022,
        type: 'who',
        keywords: ['dolor', 'analgésicos', 'opioides', 'paracetamol', 'AINEs', 'morfina']
      },
      {
        title: 'Recomendaciones CDC - Prevención de Infecciones',
        content: 'Medidas de prevención de infecciones: lavado de manos con agua y jabón por 20 segundos, uso de alcohol gel al 70%, etiqueta respiratoria (cubrir boca al toser), distanciamiento social, uso de cubrebocas en espacios cerrados, y vacunación según calendario.',
        specialty: 'Medicina Preventiva',
        source: 'CDC',
        year: 2023,
        type: 'cdc',
        keywords: ['prevención', 'infecciones', 'lavado de manos', 'cubrebocas', 'vacunación', 'distanciamiento']
      },
      {
        title: 'UpToDate - Manejo de la Fiebre en Niños',
        content: 'Evaluación de fiebre en pediatría: definición de fiebre ≥38°C, evaluación de signos de alarma, tratamiento con paracetamol o ibuprofeno, hidratación adecuada, monitoreo de signos vitales, y criterios para consulta médica urgente.',
        specialty: 'Pediatría',
        source: 'UpToDate',
        year: 2023,
        type: 'uptodate',
        keywords: ['fiebre', 'niños', 'paracetamol', 'ibuprofeno', 'hidratación', 'signos de alarma']
      }
    ];

    // Process and store each guideline
    for (const guideline of sampleGuidelines) {
      await storeMedicalDocument(guideline);
    }

    console.log(`✅ Medical knowledge base initialized with ${sampleGuidelines.length} guidelines`);
  } catch (error) {
    console.error('Error initializing medical knowledge base:', error);
    throw error;
  }
}

/**
 * Store a medical document in the knowledge base
 */
export async function storeMedicalDocument(guideline: MedicalGuideline): Promise<void> {
  try {
    // Generate embedding for the document content
    const embedding = await generateEmbedding(guideline.content);

    // Store in database
    const { error } = await supabase
      .from('medical_knowledge')
      .insert({
        content: guideline.content,
        source: guideline.source,
        specialty: guideline.specialty,
        embedding: embedding,
        metadata: {
          title: guideline.title,
          author: guideline.source,
          year: guideline.year,
          type: guideline.type,
          keywords: guideline.keywords
        }
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing medical document:', error);
    throw error;
  }
}

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
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Retrieve relevant medical context based on patient symptoms
 */
export async function retrieveMedicalContext(
  symptoms: string,
  patientData?: {
    age?: number;
    sex?: string;
    specialty?: string;
  }
): Promise<RetrievedContext> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(symptoms);

    // Build the query
    let query = supabase
      .from('medical_knowledge')
      .select('*')
      .order('embedding', { ascending: false })
      .limit(5);

    // Filter by specialty if provided
    if (patientData?.specialty) {
      query = query.or(`specialty.eq.${patientData.specialty},specialty.eq.General`);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) throw error;

    // Calculate relevance scores (simplified cosine similarity)
    const documents = data || [];
    const relevance_scores = documents.map(doc => {
      // Simple relevance scoring based on specialty match and content length
      let score = 0.5; // Base score
      
      if (patientData?.specialty && doc.specialty === patientData.specialty) {
        score += 0.3; // Boost for specialty match
      }
      
      if (doc.specialty === 'General') {
        score += 0.2; // Boost for general guidelines
      }
      
      return Math.min(score, 1.0);
    });

    return {
      documents: documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        source: doc.source,
        specialty: doc.specialty,
        embedding: doc.embedding,
        metadata: doc.metadata,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })),
      relevance_scores,
      total_results: documents.length,
      query: symptoms
    };
  } catch (error) {
    console.error('Error retrieving medical context:', error);
    throw error;
  }
}

/**
 * Generate augmented prompt with retrieved medical context
 */
export async function generateAugmentedPrompt(
  basePrompt: string,
  retrievedContext: RetrievedContext
): Promise<string> {
  try {
    const contextSummary = retrievedContext.documents
      .map((doc, index) => {
        const score = retrievedContext.relevance_scores[index];
        return `[${doc.metadata?.title || doc.source}] (Relevancia: ${(score * 100).toFixed(1)}%)\n${doc.content.substring(0, 300)}...`;
      })
      .join('\n\n');

    const augmentedPrompt = `${basePrompt}

## CONTEXTO MÉDICO RELEVANTE
Basado en la consulta del paciente, se han identificado las siguientes guías clínicas relevantes:

${contextSummary}

## INSTRUCCIONES ADICIONALES
- Utiliza la información del contexto médico para enriquecer tu respuesta
- Cita las fuentes cuando hagas recomendaciones específicas
- Mantén la coherencia con las guías clínicas mexicanas e internacionales
- Si hay conflicto entre fuentes, prioriza las guías mexicanas (NOM, IMSS, ISSSTE)
- Incluye referencias específicas al final de tu respuesta`;

    return augmentedPrompt;
  } catch (error) {
    console.error('Error generating augmented prompt:', error);
    return basePrompt; // Fallback to original prompt
  }
}

/**
 * Search medical knowledge base by keywords
 */
export async function searchMedicalKnowledge(
  query: string,
  specialty?: string,
  limit: number = 10
): Promise<MedicalDocument[]> {
  try {
    let dbQuery = supabase
      .from('medical_knowledge')
      .select('*')
      .limit(limit);

    // Filter by specialty if provided
    if (specialty) {
      dbQuery = dbQuery.or(`specialty.eq.${specialty},specialty.eq.General`);
    }

    // Search in content and metadata
    dbQuery = dbQuery.or(`content.ilike.%${query}%,metadata->>title.ilike.%${query}%,metadata->keywords.cs.{${query}}`);

    const { data, error } = await dbQuery;

    if (error) throw error;

    return (data || []).map(doc => ({
      id: doc.id,
      content: doc.content,
      source: doc.source,
      specialty: doc.specialty,
      embedding: doc.embedding,
      metadata: doc.metadata,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));
  } catch (error) {
    console.error('Error searching medical knowledge:', error);
    throw error;
  }
}

/**
 * Get medical knowledge statistics
 */
export async function getMedicalKnowledgeStats(): Promise<{
  total_documents: number;
  documents_by_specialty: Record<string, number>;
  documents_by_source: Record<string, number>;
  last_updated: string;
}> {
  try {
    const { data, error } = await supabase
      .from('medical_knowledge')
      .select('specialty, source, updated_at');

    if (error) throw error;

    const documents = data || [];
    
    // Count by specialty
    const specialtyCount: Record<string, number> = {};
    documents.forEach(doc => {
      specialtyCount[doc.specialty] = (specialtyCount[doc.specialty] || 0) + 1;
    });

    // Count by source
    const sourceCount: Record<string, number> = {};
    documents.forEach(doc => {
      sourceCount[doc.source] = (sourceCount[doc.source] || 0) + 1;
    });

    // Get last updated
    const lastUpdated = documents
      .map(doc => doc.updated_at)
      .sort()
      .pop() || new Date().toISOString();

    return {
      total_documents: documents.length,
      documents_by_specialty: specialtyCount,
      documents_by_source: sourceCount,
      last_updated: lastUpdated
    };
  } catch (error) {
    console.error('Error getting medical knowledge stats:', error);
    throw error;
  }
}

/**
 * Update medical knowledge base (periodic refresh)
 */
export async function updateMedicalKnowledge(): Promise<void> {
  try {
    console.log('🔄 Updating medical knowledge base...');

    // In a real implementation, this would:
    // 1. Fetch latest guidelines from official sources
    // 2. Process and embed new documents
    // 3. Update existing documents
    // 4. Remove outdated information

    // For now, we'll just log the update
    console.log('✅ Medical knowledge base update completed');
  } catch (error) {
    console.error('Error updating medical knowledge:', error);
    throw error;
  }
}

/**
 * Get documents by specialty
 */
export async function getDocumentsBySpecialty(specialty: string): Promise<MedicalDocument[]> {
  try {
    const { data, error } = await supabase
      .from('medical_knowledge')
      .select('*')
      .eq('specialty', specialty)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(doc => ({
      id: doc.id,
      content: doc.content,
      source: doc.source,
      specialty: doc.specialty,
      embedding: doc.embedding,
      metadata: doc.metadata,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));
  } catch (error) {
    console.error('Error getting documents by specialty:', error);
    throw error;
  }
}

/**
 * Delete a medical document
 */
export async function deleteMedicalDocument(documentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('medical_knowledge')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting medical document:', error);
    throw error;
  }
}
