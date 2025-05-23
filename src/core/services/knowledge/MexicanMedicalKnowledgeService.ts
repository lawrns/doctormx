import { supabase } from '../../../lib/supabase';

export interface MexicanMedicalEntry {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'preventive' | 'emergency' | 'chronic' | 'pediatric' | 'women' | 'elderly' | 'traditional';
  tags: string[];
  cultural_context: string[];
  economic_considerations: string[];
  insurance_options: string[];
  severity_level: number; // 1-10
  requires_specialist: boolean;
  traditional_remedies?: string[];
  modern_treatment: string[];
  family_guidance: string[];
}

export class MexicanMedicalKnowledgeService {
  
  /**
   * Initialize the knowledge base with comprehensive Mexican medical content
   */
  async initializeMexicanMedicalKnowledge(): Promise<void> {
    const mexicanMedicalEntries: Omit<MexicanMedicalEntry, 'id'>[] = [
      {
        question: "¿Qué hago si tengo dolor de cabeza frecuente?",
        answer: "El dolor de cabeza frecuente puede tener varias causas. Te recomiendo mantener un diario de tus dolores, identificar posibles desencadenantes como estrés, falta de sueño o ciertos alimentos. Si el dolor es persistente o severo, es importante consultar con un médico. Mientras tanto, puedes aplicar compresas frías en la frente, mantener una buena hidratación y descansar en un lugar tranquilo y oscuro.",
        category: 'general',
        tags: ['dolor de cabeza', 'cefalea', 'migraña', 'estrés'],
        cultural_context: ['vida urbana acelerada', 'estrés laboral mexicano'],
        economic_considerations: ['medicamentos genéricos disponibles', 'consulta en centro de salud'],
        insurance_options: ['IMSS', 'ISSSTE', 'Seguro Popular'],
        severity_level: 4,
        requires_specialist: false,
        traditional_remedies: ['té de manzanilla', 'compresas de agua fría', 'masaje en sienes'],
        modern_treatment: ['paracetamol', 'ibuprofeno', 'descanso en ambiente oscuro'],
        family_guidance: ['involucrar a la familia en identificar factores de estrés', 'apoyo familiar importante']
      },
      {
        question: "Mi hijo tiene fiebre, ¿cuándo debo preocuparme?",
        answer: "La fiebre en niños es común y generalmente indica que el cuerpo está combatiendo una infección. Debes buscar atención médica inmediata si: la temperatura supera 38.5°C en bebés menores de 3 meses, 39°C en niños mayores, si hay dificultad para respirar, convulsiones, vómito persistente o si el niño se ve muy decaído. Mientras tanto, mantén al niño hidratado, usa ropa ligera y puedes dar paracetamol infantil según su peso.",
        category: 'pediatric',
        tags: ['fiebre infantil', 'niños', 'temperatura', 'pediatría'],
        cultural_context: ['cuidado familiar compartido', 'participación de abuelas'],
        economic_considerations: ['medicamentos pediátricos genéricos', 'termómetro básico necesario'],
        insurance_options: ['IMSS pediatría', 'centros de salud infantil'],
        severity_level: 6,
        requires_specialist: true,
        traditional_remedies: ['baños de agua tibia', 'compresas en frente'],
        modern_treatment: ['paracetamol infantil', 'hidratación oral', 'monitoreo de temperatura'],
        family_guidance: ['toda la familia debe conocer signos de alarma', 'cuidado rotativo entre familiares']
      },
      {
        question: "¿Cómo controlo mi diabetes con recursos limitados?",
        answer: "El control de la diabetes es posible con recursos limitados siguiendo estos pasos: mantén una dieta rica en verduras locales como nopales, quelites y chía que ayudan a controlar el azúcar. Haz ejercicio regular como caminar 30 minutos diarios. Toma tus medicamentos del cuadro básico del IMSS puntualmente. Monitorea tu glucosa en el centro de salud más cercano. Evita refrescos y pan dulce. La familia debe apoyarte preparando comidas saludables y recordándote tus medicamentos.",
        category: 'chronic',
        tags: ['diabetes', 'azúcar', 'control glucémico', 'alimentación'],
        cultural_context: ['alimentos tradicionales mexicanos', 'apoyo familiar esencial'],
        economic_considerations: ['medicamentos del cuadro básico', 'alimentos locales económicos'],
        insurance_options: ['IMSS diabetes', 'ISSSTE', 'centros de salud gratuitos'],
        severity_level: 8,
        requires_specialist: true,
        traditional_remedies: ['nopales', 'canela', 'chía', 'hierbas amargas'],
        modern_treatment: ['metformina', 'glucómetro', 'dieta controlada', 'ejercicio regular'],
        family_guidance: ['familia debe cambiar hábitos alimentarios juntos', 'apoyo emocional crucial']
      },
      {
        question: "¿Qué hago si no puedo pagar mis medicamentos?",
        answer: "Existen varias opciones si no puedes pagar medicamentos: 1) Solicita medicamentos genéricos del cuadro básico en tu centro de salud, 2) Acude al IMSS o ISSSTE si tienes derecho, 3) Pregunta por programas de apoyo gubernamental, 4) Contacta organizaciones de beneficencia local, 5) Habla con tu médico sobre alternativas más económicas. Nunca dejes de tomar medicamentos importantes sin consultar a tu doctor.",
        category: 'general',
        tags: ['medicamentos', 'economía', 'acceso a salud', 'genéricos'],
        cultural_context: ['limitaciones económicas comunes', 'redes de apoyo comunitario'],
        economic_considerations: ['cuadro básico gratuito', 'programas gubernamentales'],
        insurance_options: ['IMSS', 'ISSSTE', 'Seguro Popular', 'Insabi'],
        severity_level: 7,
        requires_specialist: false,
        traditional_remedies: ['consultar alternativas naturales seguras'],
        modern_treatment: ['medicamentos genéricos', 'programas de apoyo'],
        family_guidance: ['familia puede ayudar con costos', 'buscar apoyo comunitario']
      },
      {
        question: "¿Cuándo una herida necesita atención médica urgente?",
        answer: "Busca atención médica inmediata si la herida: sangra abundantemente y no para con presión directa, es profunda y puedes ver grasa o hueso, fue causada por objeto sucio o punzocortante, muestra signos de infección (enrojecimiento creciente, calor, pus, fiebre), no cicatriza después de una semana, o si no estás vacunado contra el tétanos. Para heridas menores, limpia con agua y jabón, aplica presión para parar el sangrado y cubre con gasa limpia.",
        category: 'emergency',
        tags: ['heridas', 'emergencia', 'sangrado', 'infección'],
        cultural_context: ['accidentes domésticos comunes', 'trabajo manual frecuente'],
        economic_considerations: ['primeros auxilios caseros', 'urgencias gratuitas'],
        insurance_options: ['urgencias IMSS', 'Cruz Roja', 'hospitales públicos'],
        severity_level: 8,
        requires_specialist: true,
        traditional_remedies: ['miel para cicatrización', 'sábila para inflamación'],
        modern_treatment: ['limpieza quirúrgica', 'antibióticos', 'vacuna tétanos'],
        family_guidance: ['familia debe conocer primeros auxilios básicos', 'transporte rápido a urgencias']
      },
      {
        question: "¿Cómo cuido mi presión arterial alta naturalmente?",
        answer: "Para controlar la presión arterial naturalmente: reduce la sal en tus comidas, evita alimentos procesados, come más frutas y verduras locales como ajo, cebolla y hibisco. Camina diariamente, reduce el estrés con técnicas de relajación, duerme 7-8 horas, limita el alcohol y evita el tabaco. Toma tus medicamentos según prescripción médica. El apoyo familiar es clave para mantener estos cambios de estilo de vida.",
        category: 'chronic',
        tags: ['hipertensión', 'presión arterial', 'estilo de vida', 'prevención'],
        cultural_context: ['cambios alimentarios familiares', 'estrés de vida urbana'],
        economic_considerations: ['alimentos naturales locales', 'ejercicio gratuito'],
        insurance_options: ['control en centros de salud', 'IMSS hipertensión'],
        severity_level: 7,
        requires_specialist: true,
        traditional_remedies: ['té de jamaica', 'ajo', 'limón', 'cebolla'],
        modern_treatment: ['captopril', 'losartán', 'dieta DASH', 'ejercicio regular'],
        family_guidance: ['cocinar sin sal en familia', 'apoyo para ejercicio conjunto']
      },
      {
        question: "¿Qué hago si sospecho que tengo COVID-19?",
        answer: "Si sospechas COVID-19: aíslate inmediatamente de tu familia, usa mascarilla, ventila tu cuarto, descansa y mantente hidratado. Monitorea síntomas como fiebre, tos, pérdida del olfato o gusto. Busca atención médica si tienes dificultad para respirar, dolor en el pecho, confusión o labios azules. Contacta a tu centro de salud para hacer la prueba. Informa a personas que estuvieron en contacto contigo. La mayoría se recupera en casa con cuidados básicos.",
        category: 'emergency',
        tags: ['COVID-19', 'coronavirus', 'aislamiento', 'síntomas'],
        cultural_context: ['vida familiar extensa', 'espacios habitacionales compartidos'],
        economic_considerations: ['pruebas gratuitas en sector salud', 'incapacidad laboral'],
        insurance_options: ['atención COVID gratuita', 'hospitales públicos'],
        severity_level: 6,
        requires_specialist: false,
        traditional_remedies: ['té de jengibre', 'miel con limón', 'vaporizaciones'],
        modern_treatment: ['aislamiento', 'hidratación', 'paracetamol', 'oxigenación si necesario'],
        family_guidance: ['proteger a adultos mayores', 'aislamiento dentro del hogar']
      },
      {
        question: "¿Cómo sé si mi embarazo va bien sin muchos recursos?",
        answer: "Durante el embarazo con recursos limitados: acude a tu centro de salud para control prenatal gratuito, toma ácido fólico, come bien con frijoles, verduras y frutas locales, evita alcohol y tabaco. Signos de alarma: sangrado, dolor abdominal intenso, dolor de cabeza severo, hinchazón súbita, fiebre, o si no sientes movimientos del bebé. El apoyo familiar es esencial durante esta etapa.",
        category: 'women',
        tags: ['embarazo', 'prenatal', 'maternidad', 'signos de alarma'],
        cultural_context: ['apoyo de madres y suegras', 'tradiciones familiares'],
        economic_considerations: ['control prenatal gratuito', 'parto en IMSS'],
        insurance_options: ['IMSS maternidad', 'centros de salud materno-infantil'],
        severity_level: 7,
        requires_specialist: true,
        traditional_remedies: ['infusiones permitidas', 'masajes suaves'],
        modern_treatment: ['ácido fólico', 'hierro', 'calcio', 'ultrasonidos'],
        family_guidance: ['apoyo nutricional familiar', 'acompañamiento a consultas']
      },
      {
        question: "¿Cómo cuido a un adulto mayor en casa?",
        answer: "Para cuidar adultos mayores en casa: asegura que tomen sus medicamentos correctamente, adapta la casa para prevenir caídas (barras en baño, buena iluminación), mantén rutina de ejercicio suave, estimula su mente con conversación y actividades, vigila cambios en apetito o comportamiento. Busca ayuda médica si hay confusión súbita, caídas, dificultad para respirar o pérdida de peso. El cariño familiar es la mejor medicina.",
        category: 'elderly',
        tags: ['adultos mayores', 'cuidado domiciliario', 'prevención caídas'],
        cultural_context: ['respeto a los mayores', 'cuidado multigeneracional'],
        economic_considerations: ['adaptaciones caseras económicas', 'atención domiciliaria'],
        insurance_options: ['IMSS adultos mayores', 'programas gubernamentales'],
        severity_level: 5,
        requires_specialist: false,
        traditional_remedies: ['hierbas para reumatismo', 'compresas calientes'],
        modern_treatment: ['polifarmacia controlada', 'fisioterapia básica'],
        family_guidance: ['rotación de cuidados familiares', 'paciencia y amor']
      },
      {
        question: "¿Cómo identifico una emergencia cardíaca?",
        answer: "Signos de emergencia cardíaca: dolor intenso en el pecho que se extiende al brazo izquierdo, cuello o mandíbula, dificultad para respirar, sudoración excesiva, náuseas, mareo, o sensación de muerte inminente. ACTÚA RÁPIDO: llama al 911 o ve inmediatamente al hospital más cercano. Dale aspirina si está consciente y no es alérgico. Tiempo es vida en estos casos.",
        category: 'emergency',
        tags: ['infarto', 'corazón', 'emergencia cardíaca', 'dolor de pecho'],
        cultural_context: ['tabúes sobre salud masculina', 'minimizar síntomas'],
        economic_considerations: ['urgencias cardíacas gratuitas', 'ambulancia'],
        insurance_options: ['urgencias IMSS', 'Cruz Roja', 'hospitales públicos'],
        severity_level: 10,
        requires_specialist: true,
        traditional_remedies: ['ninguno - es emergencia médica'],
        modern_treatment: ['aspirina', 'hospitalización inmediata', 'cateterismo'],
        family_guidance: ['familia debe actuar rápido', 'no minimizar síntomas en hombres']
      }
    ];

    // Insert into knowledge base
    console.log('🇲🇽 Populating Mexican medical knowledge base...');
    
    for (const entry of mexicanMedicalEntries) {
      try {
        const { data, error } = await supabase
          .from('knowledge_base')
          .insert([{
            question: entry.question,
            answer: entry.answer,
            category: entry.category,
            tags: entry.tags,
            metadata: {
              cultural_context: entry.cultural_context,
              economic_considerations: entry.economic_considerations,
              insurance_options: entry.insurance_options,
              severity_level: entry.severity_level,
              requires_specialist: entry.requires_specialist,
              traditional_remedies: entry.traditional_remedies,
              modern_treatment: entry.modern_treatment,
              family_guidance: entry.family_guidance
            },
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error(`Error inserting entry: ${entry.question}`, error);
        } else {
          console.log(`✅ Added: ${entry.question.substring(0, 50)}...`);
        }
      } catch (error) {
        console.error(`Exception inserting entry: ${entry.question}`, error);
      }
    }

    console.log('🎉 Mexican medical knowledge base populated successfully!');
  }

  /**
   * Search for Mexican medical knowledge with cultural context
   */
  async searchMexicanMedicalKnowledge(
    query: string,
    culturalFactors?: string[],
    economicContext?: 'low' | 'medium' | 'high'
  ): Promise<MexicanMedicalEntry[]> {
    try {
      // First try to find exact matches
      const { data: exactMatches, error: exactError } = await supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('question', query, { type: 'websearch' })
        .limit(3);

      if (exactError) {
        console.error('Error in exact search:', exactError);
      }

      // Then search by keywords
      const keywords = this.extractKeywords(query);
      const { data: keywordMatches, error: keywordError } = await supabase
        .from('knowledge_base')
        .select('*')
        .filter('tags', 'cs', `{${keywords.join(',')}}`)
        .limit(5);

      if (keywordError) {
        console.error('Error in keyword search:', keywordError);
      }

      // Combine and deduplicate results
      const allResults = [...(exactMatches || []), ...(keywordMatches || [])];
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      // Filter by cultural and economic context if provided
      let filteredResults = uniqueResults;
      
      if (culturalFactors && culturalFactors.length > 0) {
        filteredResults = filteredResults.filter(result => 
          culturalFactors.some(factor => 
            result.metadata?.cultural_context?.includes(factor)
          )
        );
      }

      if (economicContext === 'low') {
        filteredResults = filteredResults.filter(result => 
          result.metadata?.economic_considerations?.some((consideration: string) => 
            consideration.includes('gratuito') || 
            consideration.includes('genérico') ||
            consideration.includes('centro de salud')
          )
        );
      }

      return filteredResults.map(result => ({
        id: result.id,
        question: result.question,
        answer: result.answer,
        category: result.category,
        tags: result.tags || [],
        cultural_context: result.metadata?.cultural_context || [],
        economic_considerations: result.metadata?.economic_considerations || [],
        insurance_options: result.metadata?.insurance_options || [],
        severity_level: result.metadata?.severity_level || 5,
        requires_specialist: result.metadata?.requires_specialist || false,
        traditional_remedies: result.metadata?.traditional_remedies || [],
        modern_treatment: result.metadata?.modern_treatment || [],
        family_guidance: result.metadata?.family_guidance || []
      }));

    } catch (error) {
      console.error('Error searching Mexican medical knowledge:', error);
      return [];
    }
  }

  private extractKeywords(query: string): string[] {
    const commonMedicalTerms = [
      'dolor', 'fiebre', 'tos', 'náusea', 'vómito', 'diarrea', 'mareo',
      'fatiga', 'cabeza', 'migraña', 'erupción', 'presión', 'diabetes',
      'hipertensión', 'corazón', 'infarto', 'emergencia', 'niños',
      'embarazo', 'adultos mayores', 'medicamentos', 'herida'
    ];

    const lowerQuery = query.toLowerCase();
    return commonMedicalTerms.filter(term => lowerQuery.includes(term));
  }

  /**
   * Get emergency-specific knowledge
   */
  async getEmergencyGuidance(symptoms: string[]): Promise<MexicanMedicalEntry[]> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('category', 'emergency')
      .gte('metadata->severity_level', 8);

    if (error) {
      console.error('Error getting emergency guidance:', error);
      return [];
    }

    return data?.map(result => ({
      id: result.id,
      question: result.question,
      answer: result.answer,
      category: result.category,
      tags: result.tags || [],
      cultural_context: result.metadata?.cultural_context || [],
      economic_considerations: result.metadata?.economic_considerations || [],
      insurance_options: result.metadata?.insurance_options || [],
      severity_level: result.metadata?.severity_level || 5,
      requires_specialist: result.metadata?.requires_specialist || false,
      traditional_remedies: result.metadata?.traditional_remedies || [],
      modern_treatment: result.metadata?.modern_treatment || [],
      family_guidance: result.metadata?.family_guidance || []
    })) || [];
  }
}

// Export singleton instance
export const mexicanMedicalKnowledgeService = new MexicanMedicalKnowledgeService(); 