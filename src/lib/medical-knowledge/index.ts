/**
 * Medical Knowledge Base (RAG) for Doctor.mx
 * Provides context-augmented responses using Mexican medical guidelines
 *
 * NOTE: Embeddings still use OpenAI (text-embedding-3-small)
 * This is because embedding migration is a separate task requiring
 * re-indexing of all documents.
 */

import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'

// Embeddings use OpenAI (embedding migration is a separate task)

export interface MedicalDocument {
  id: string;
  content: string;
  source: string;
  specialty: string;
  metadata: {
    title?: string;
    author?: string;
    year?: number;
    type?: 'nom' | 'imss' | 'issste' | 'who' | 'cdc' | 'uptodate' | 'guideline';
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
  type: 'nom' | 'imss' | 'issste' | 'who' | 'cdc' | 'uptodate' | 'guideline';
  keywords: string[];
}

// Type for RPC results with similarity score
interface MedicalDocumentWithSimilarity extends MedicalDocument {
  similarity?: number;
}

// Sample Mexican medical guidelines
const SAMPLE_GUIDELINES: MedicalGuideline[] = [
  {
    title: 'NOM-004-SSA3-2012 - Prescripción Electrónica',
    content: 'La Norma Oficial Mexicana establece los requisitos para la prescripción electrónica de medicamentos. Incluye: identificación del prescriptor con cédula profesional, datos completos del paciente, medicamento prescrito con dosis, frecuencia y duración del tratamiento, firma electrónica avanzada, y validación en tiempo real de la prescripción.',
    specialty: 'General',
    source: 'Secretaría de Salud',
    year: 2012,
    type: 'nom',
    keywords: ['prescripción', 'electrónica', 'medicamentos', 'firma digital', 'validación', 'cédula']
  },
  {
    title: 'NOM-024-SSA3-2012 - Telemedicina',
    content: 'Norma que regula la práctica de telemedicina en México. Establece requisitos para: obtención de consentimiento informado electrónico, protección de confidencialidad de datos médicos (LFPDPPP), estándares de calidad para consulta remota, registro detallado de actividades, responsabilidades legales del prestador, y requisitos técnicos mínimos para plataformas de telesalud.',
    specialty: 'General',
    source: 'Secretaría de Salud',
    year: 2012,
    type: 'nom',
    keywords: ['telemedicina', 'consentimiento', 'confidencialidad', 'calidad', 'responsabilidad', 'remoto']
  },
  {
    title: 'Guía IMSS - Hipertensión Arterial Sistémica',
    content: 'Protocolo de atención para hipertensión arterial: diagnóstico con presión arterial ≥140/90 mmHg confirmada en dos o más ocasiones, evaluación integral de factores de riesgo cardiovascular (diabetes, dislipidemia, tabaquismo, obesidad), estudios de laboratorio básicos (BH, QS, EGO, perfil lipídico, ECG), tratamiento no farmacológico inicial (dieta DASH con restricción de sodio <2g/día, ejercicio aeróbico 150 min/semana, reducción de peso si IMC>25), y escalones de tratamiento farmacológico comenzando con IECA o ARA-II.',
    specialty: 'Cardiología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['hipertensión', 'presión arterial', 'cardiovascular', 'dieta DASH', 'IECA', 'ARA-II']
  },
  {
    title: 'Guía IMSS - Diabetes Mellitus Tipo 2',
    content: 'Manejo integral de diabetes tipo 2: criterios diagnósticos (glucosa en ayunas ≥126 mg/dL, HbA1c ≥6.5%, glucosa 2h post-carga ≥200 mg/dL), metas de control (HbA1c <7% en general, <8% en adultos mayores), automonitoreo de glucosa capilar, tratamiento con metformina como primera línea (iniciar 500mg/día, incrementar hasta 2g/día), insulinización temprana cuando HbA1c >9% o síntomas de hiperglucemia, y vigilancia de complicaciones micro/macrovasculares cada 3-6 meses.',
    specialty: 'Endocrinología',
    source: 'IMSS',
    year: 2023,
    type: 'imss',
    keywords: ['diabetes', 'glucosa', 'HbA1c', 'metformina', 'insulina', 'complicaciones']
  },
  {
    title: 'Protocolo ISSSTE - Infecciones Respiratorias Agudas',
    content: 'Atención de IRA en adultos: diagnóstico diferencial entre resfriado común (rinorrea, estornudos), influenza (fiebre súbita >38°C, mialgias, cefalea) y COVID-19 (anosmia, ageusia), criterios de gravedad (SpO2<92%, FR>24, datos de dificultad respiratoria), tratamiento sintomático (paracetamol 500mg c/6h, hidratación), oseltamivir para influenza dentro de 48h del inicio de síntomas, antibióticos solo con evidencia de sobreinfección bacteriana, y esquemas de vacunación actualizados.',
    specialty: 'Neumología',
    source: 'ISSSTE',
    year: 2023,
    type: 'issste',
    keywords: ['respiratorias', 'influenza', 'COVID', 'antivirales', 'vacunación', 'neumonía']
  },
  {
    title: 'Guía OMS - Escalera Analgésica del Dolor',
    content: 'Manejo del dolor según OMS: Escalón 1 para dolor leve (paracetamol 500-1000mg c/6-8h, AINEs como ibuprofeno 400mg c/8h o naproxeno 250mg c/12h), Escalón 2 para dolor moderado (opioides débiles como tramadol 50-100mg c/6h, codeína 30-60mg c/4-6h), Escalón 3 para dolor severo (opioides fuertes como morfina oral 5-10mg c/4h, oxicodona, fentanilo transdérmico). Principios: vía oral preferente, horario fijo, dosis individualizadas, y manejo proactivo de efectos secundarios.',
    specialty: 'Medicina del Dolor',
    source: 'OMS',
    year: 2022,
    type: 'who',
    keywords: ['dolor', 'analgésicos', 'opioides', 'paracetamol', 'AINEs', 'morfina', 'escalera']
  },
  {
    title: 'Guía CDC - Prevención de Infecciones',
    content: 'Medidas de prevención: lavado de manos con agua y jabón por mínimo 20 segundos especialmente antes de comer y después del baño, uso de gel antibacterial con alcohol al 70% cuando no hay agua disponible, etiqueta respiratoria (cubrir boca y nariz al toser/estornudar con codo flexionado), distanciamiento de 1.5m en espacios cerrados durante brotes, uso de cubrebocas N95 o KN95 en situaciones de alto riesgo, y cumplimiento de esquemas de vacunación según calendario nacional.',
    specialty: 'Medicina Preventiva',
    source: 'CDC',
    year: 2023,
    type: 'cdc',
    keywords: ['prevención', 'infecciones', 'lavado de manos', 'cubrebocas', 'vacunación', 'higiene']
  },
  {
    title: 'UpToDate - Manejo de Fiebre en Pediatría',
    content: 'Evaluación de fiebre en niños: definición de fiebre como temperatura ≥38°C rectal o ≥37.5°C axilar, signos de alarma (letargia, irritabilidad extrema, rechazo al alimento, petequias, fontanela abombada en lactantes), tratamiento antipirético con paracetamol 10-15mg/kg/dosis c/4-6h o ibuprofeno 5-10mg/kg/dosis c/6-8h (no usar ibuprofeno en <6 meses), mantener hidratación adecuada, no usar medios físicos solos para bajar fiebre. Consulta urgente: lactantes <3 meses con fiebre, fiebre >5 días, o signos de alarma.',
    specialty: 'Pediatría',
    source: 'UpToDate',
    year: 2023,
    type: 'uptodate',
    keywords: ['fiebre', 'niños', 'paracetamol', 'ibuprofeno', 'signos de alarma', 'hidratación']
  },
  {
    title: 'NOM-046-SSA2-2005 - Violencia Familiar y Sexual',
    content: 'Atención médica de violencia: obligación de detección activa mediante tamizaje en consulta, manejo integral que incluye atención de lesiones, anticoncepción de emergencia (levonorgestrel 1.5mg dosis única hasta 72h post-exposición), profilaxis VIH (TDF/FTC + RAL por 28 días iniciando antes de 72h), profilaxis ITS, apoyo psicológico inmediato, referencia a trabajo social y ministerio público, y seguimiento a las 2 semanas. Confidencialidad absoluta excepto en menores de edad.',
    specialty: 'General',
    source: 'Secretaría de Salud',
    year: 2005,
    type: 'nom',
    keywords: ['violencia', 'emergencia', 'anticoncepción', 'profilaxis', 'VIH', 'confidencialidad']
  },
  {
    title: 'Guía CENETEC - Lumbalgia Inespecífica',
    content: 'Manejo de lumbalgia: clasificación (aguda <6 semanas, subaguda 6-12 semanas, crónica >12 semanas), banderas rojas que requieren imagen (trauma, edad >50 con primer episodio, pérdida de peso inexplicable, fiebre, déficit neurológico progresivo, síndrome de cauda equina), tratamiento conservador inicial (actividad física temprana, evitar reposo prolongado, analgésicos según escalera OMS), no realizar estudios de imagen en lumbalgia aguda sin banderas rojas, y referencia a rehabilitación si persiste >4 semanas.',
    specialty: 'Traumatología',
    source: 'CENETEC',
    year: 2022,
    type: 'guideline',
    keywords: ['lumbalgia', 'espalda', 'banderas rojas', 'rehabilitación', 'imagen', 'analgésicos']
  }
];

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
 * Initialize the medical knowledge base with sample guidelines
 */
export async function initializeMedicalKnowledgeBase(): Promise<void> {
  const supabase = await createClient();
  
  console.log('🏥 Initializing medical knowledge base...');
  
  for (const guideline of SAMPLE_GUIDELINES) {
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
      
      console.log(`✅ Added: ${guideline.title}`);
    } catch (error) {
      console.error(`Error adding ${guideline.title}:`, error);
    }
  }
  
  console.log('✅ Medical knowledge base initialized');
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
      console.warn('Vector search failed, falling back to keyword search:', error);
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
    console.error('Error retrieving medical context:', error);
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
export async function getMedicalKnowledgeStats(): Promise<{
  total_documents: number;
  documents_by_specialty: Record<string, number>;
  documents_by_source: Record<string, number>;
  last_updated: string;
}> {
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
  
  data.forEach((doc: { specialty: string; source: string; updated_at: string }) => {
    specialtyCount[doc.specialty] = (specialtyCount[doc.specialty] || 0) + 1;
    sourceCount[doc.source] = (sourceCount[doc.source] || 0) + 1;
  });
  
  const lastUpdated = data
    .map((doc: { updated_at: string }) => doc.updated_at)
    .sort()
    .pop() || new Date().toISOString();
  
  return {
    total_documents: data.length,
    documents_by_specialty: specialtyCount,
    documents_by_source: sourceCount,
    last_updated: lastUpdated,
  };
}
