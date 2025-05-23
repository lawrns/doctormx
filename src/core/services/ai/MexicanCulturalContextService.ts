export interface CulturalFactor {
  type: 'family' | 'religion' | 'economic' | 'regional' | 'language' | 'traditional_medicine';
  confidence: number;
  indicator: string;
}

export class MexicanCulturalContextService {
  private culturalMarkers = {
    family: [
      'familia', 'papá', 'mamá', 'hermano', 'hermana', 'hijo', 'hija',
      'esposo', 'esposa', 'abuela', 'abuelo', 'tío', 'tía', 'primo',
      'nos preocupa', 'mi familia', 'todos en casa'
    ],
    religion: [
      'dios', 'virgen', 'santo', 'santa', 'iglesia', 'misa', 'rezar',
      'bendición', 'milagro', 'fe', 'dios mío', 'gracias a dios',
      'si dios quiere', 'está en las manos de dios'
    ],
    economic: [
      'no tengo dinero', 'no puedo pagar', 'caro', 'barato', 'económico',
      'seguro social', 'imss', 'issste', 'no alcanza', 'está muy caro',
      'algo más barato', 'sin dinero'
    ],
    regional: [
      'pueblo', 'rancho', 'ejido', 'comunidad', 'monte', 'sierra',
      'costa', 'norte', 'sur', 'frontera', 'campo', 'ciudad',
      'aquí en mi pueblo', 'en mi tierra'
    ],
    language: [
      'no entiendo', 'hábleme más fácil', 'no sé leer', 'en español simple',
      'más despacio', 'no comprendo', 'palabras más sencillas'
    ],
    traditional_medicine: [
      'hierbas', 'remedios caseros', 'curandero', 'sobador', 'partera',
      'yerbas', 'té de', 'mi abuela dice', 'remedios de antes',
      'medicina tradicional', 'plantas medicinales'
    ]
  };

  analyzeCulturalFactors(text: string): string[] {
    const lowerText = text.toLowerCase();
    const detectedFactors: string[] = [];

    for (const [category, markers] of Object.entries(this.culturalMarkers)) {
      const matches = markers.filter(marker => lowerText.includes(marker));
      if (matches.length > 0) {
        detectedFactors.push(category);
      }
    }

    return detectedFactors;
  }

  getCulturalContext(factors: string[]): {
    familyOriented: boolean;
    religiousConsiderations: boolean;
    economicConstraints: boolean;
    ruralBackground: boolean;
    languageSimplification: boolean;
    traditionalMedicineInterest: boolean;
  } {
    return {
      familyOriented: factors.includes('family'),
      religiousConsiderations: factors.includes('religion'),
      economicConstraints: factors.includes('economic'),
      ruralBackground: factors.includes('regional'),
      languageSimplification: factors.includes('language'),
      traditionalMedicineInterest: factors.includes('traditional_medicine')
    };
  }

  generateCulturallyAppropriateGreeting(factors: string[]): string {
    const context = this.getCulturalContext(factors);
    
    if (context.religiousConsiderations) {
      return "¡Buenos días! Que Dios lo bendiga. Soy el Dr. Simeon, ¿en qué le puedo ayudar?";
    }
    
    if (context.familyOriented) {
      return "¡Buenos días! Espero que usted y su familia se encuentren bien. ¿Cómo le puedo ayudar?";
    }
    
    if (context.ruralBackground) {
      return "¡Buenos días, estimado! ¿Cómo se encuentra? Dígame, ¿en qué le puedo servir?";
    }
    
    return "¡Buenos días! Soy el Dr. Simeon. ¿En qué le puedo ayudar el día de hoy?";
  }

  adaptLanguageComplexity(text: string, needsSimplification: boolean): string {
    if (!needsSimplification) return text;

    // Replace complex medical terms with simpler ones
    const simplifications = {
      'hipertensión': 'presión alta',
      'diabetes mellitus': 'azúcar alta',
      'cefalea': 'dolor de cabeza',
      'gastritis': 'dolor de estómago',
      'artritis': 'dolor en las articulaciones',
      'hipertermia': 'fiebre alta',
      'rinitis': 'alergia nasal',
      'dermatitis': 'irritación en la piel'
    };

    let simplifiedText = text;
    for (const [complex, simple] of Object.entries(simplifications)) {
      simplifiedText = simplifiedText.replace(new RegExp(complex, 'gi'), simple);
    }

    return simplifiedText;
  }

  generateEconomicallySensitiveRecommendations(originalRecommendations: string[]): string[] {
    return originalRecommendations.map(rec => {
      // Add economic considerations to recommendations
      if (rec.includes('medicamento') || rec.includes('medicina')) {
        return `${rec} (Pregunta por opciones genéricas o del cuadro básico del IMSS para reducir costos)`;
      }
      
      if (rec.includes('especialista') || rec.includes('consulta')) {
        return `${rec} (Puedes acudir al centro de salud más cercano o usar tu seguro social)`;
      }
      
      if (rec.includes('estudio') || rec.includes('análisis')) {
        return `${rec} (Estos estudios están disponibles en centros de salud públicos)`;
      }
      
      return rec;
    });
  }
} 