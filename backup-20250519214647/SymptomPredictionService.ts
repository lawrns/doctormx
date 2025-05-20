// Symptom prediction service for enhanced analysis
import { supabase } from '../lib/supabase';

interface SymptomMatch {
  symptomId: string;
  symptomName: string;
  matchScore: number;
  bodyRegion: string;
}

interface SymptomPrediction {
  primarySymptom: SymptomMatch;
  relatedSymptoms: SymptomMatch[];
  confidence: number;
}

interface TextAnalysisResult {
  detectedSymptoms: SymptomMatch[];
  detectedConditions: {
    conditionId: string;
    conditionName: string;
    probability: number;
  }[];
  extractedData: {
    duration?: string;
    severity?: string;
    location?: string;
    triggers?: string[];
    reliefFactors?: string[];
    aggravatingFactors?: string[];
  };
  redFlags: {
    description: string;
    urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  }[];
}

// Medical ontology and terminology maps
// In a real implementation, these would be much more extensive
const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  'headache': ['dolor de cabeza', 'cefalea', 'migraña', 'jaqueca', 'dolor craneal'],
  'abdominal_pain': ['dolor de estómago', 'dolor abdominal', 'dolor de barriga', 'dolor de vientre', 'cólico', 'malestar abdominal'],
  'chest_pain': ['dolor de pecho', 'dolor torácico', 'opresión en el pecho', 'dolor precordial', 'angina'],
  'back_pain': ['dolor de espalda', 'lumbalgia', 'dolor lumbar', 'dolor de cintura'],
  'sore_throat': ['dolor de garganta', 'irritación de garganta', 'faringitis', 'garganta inflamada', 'carraspera'],
  'cough': ['tos', 'tos seca', 'tos con flema', 'tos persistente'],
  'fever': ['fiebre', 'temperatura alta', 'calentura', 'escalofríos'],
  'fatigue': ['cansancio', 'fatiga', 'agotamiento', 'debilidad', 'falta de energía'],
  'nausea': ['náusea', 'náuseas', 'ganas de vomitar', 'asco'],
  'dizziness': ['mareo', 'vértigo', 'sensación de desmayo', 'aturdimiento']
};

const BODY_REGION_MAP: Record<string, string[]> = {
  'head': ['cabeza', 'cráneo', 'cerebro', 'cuero cabelludo', 'frente', 'cara', 'ojos', 'nariz', 'boca', 'orejas', 'oídos', 'sienes', 'mandíbula'],
  'neck': ['cuello', 'garganta', 'nuca', 'tiroides'],
  'chest': ['pecho', 'tórax', 'esternón', 'costillas', 'corazón', 'pulmones', 'mama', 'senos'],
  'abdomen': ['abdomen', 'estómago', 'vientre', 'barriga', 'intestinos', 'hígado', 'vesícula', 'ombligo'],
  'back': ['espalda', 'columna', 'lumbar', 'lumbares', 'vertebral', 'cervical', 'dorsales'],
  'arm': ['brazo', 'hombro', 'codo', 'antebrazo', 'muñeca', 'mano', 'dedos'],
  'leg': ['pierna', 'muslo', 'rodilla', 'pantorrilla', 'tobillo', 'pie', 'talón', 'dedos del pie'],
  'skin': ['piel', 'cutáneo', 'erupción', 'sarpullido', 'picor', 'comezón', 'ronchas']
};

const DURATION_KEYWORDS: Record<string, string[]> = {
  'acute': ['repentino', 'súbito', 'desde hoy', 'desde ayer', 'desde hace unas horas', 'hace un rato', 'hoy', 'ayer'],
  'subacute': ['hace unos días', 'hace una semana', 'hace dos semanas', 'desde hace días', 'esta semana', 'la semana pasada'],
  'chronic': ['hace meses', 'hace un mes', 'desde hace mucho', 'crónico', 'siempre', 'continuamente', 'hace años']
};

const SEVERITY_KEYWORDS: Record<string, string[]> = {
  'mild': ['leve', 'suave', 'ligero', 'no muy fuerte', 'soportable', 'tolerable'],
  'moderate': ['moderado', 'medio', 'incómodo', 'molesto', 'fastidioso'],
  'severe': ['severo', 'intenso', 'fuerte', 'insoportable', 'terrible', 'insufrible', 'muy doloroso', 'agudo']
};

const RED_FLAG_PATTERNS: {pattern: string[], flag: string, urgency: 'routine' | 'soon' | 'urgent' | 'emergency'}[] = [
  {
    pattern: ['peor dolor de cabeza', 'dolor de cabeza más fuerte', 'dolor de cabeza insoportable'],
    flag: 'Dolor de cabeza severo y repentino',
    urgency: 'emergency'
  },
  {
    pattern: ['no puedo respirar', 'dificultad para respirar', 'falta de aire severa', 'ahogo'],
    flag: 'Dificultad respiratoria severa',
    urgency: 'emergency'
  },
  {
    pattern: ['dolor en el pecho', 'opresión en el pecho', 'dolor precordial'],
    flag: 'Dolor en el pecho que podría indicar problema cardíaco',
    urgency: 'urgent'
  },
  {
    pattern: ['no puedo mover', 'no siento', 'parálisis', 'entumecimiento'],
    flag: 'Pérdida de sensibilidad o movimiento',
    urgency: 'urgent'
  },
  {
    pattern: ['fiebre alta', 'mucha fiebre', 'fiebre 39', 'fiebre 40'],
    flag: 'Fiebre alta persistente',
    urgency: 'soon'
  }
];

class SymptomPredictionService {
  /**
   * Analyze text description to extract symptoms and related information
   */
  async analyzeSymptomText(text: string): Promise<TextAnalysisResult> {
    try {
      // In a real application, this would use NLP and ML models
      // For this demo, we'll use keyword matching and basic text analysis
      
      const normalizedText = text.toLowerCase();
      const detectedSymptoms: SymptomMatch[] = [];
      const redFlags: {description: string; urgency: 'routine' | 'soon' | 'urgent' | 'emergency'}[] = [];
      
      // Detect symptoms
      for (const [symptomId, synonyms] of Object.entries(SYMPTOM_SYNONYMS)) {
        for (const synonym of synonyms) {
          if (normalizedText.includes(synonym)) {
            // Calculate a simple match score
            const matchScore = this.calculateMatchScore(normalizedText, synonym);
            
            // Get symptom name (first synonym is usually the primary name)
            const symptomName = synonyms[0];
            
            // Determine body region
            let bodyRegion = 'general';
            for (const [region, keywords] of Object.entries(BODY_REGION_MAP)) {
              if (keywords.some(keyword => normalizedText.includes(keyword))) {
                bodyRegion = region;
                break;
              }
            }
            
            detectedSymptoms.push({
              symptomId,
              symptomName,
              matchScore,
              bodyRegion
            });
            
            break; // Found a match for this symptom, move to next
          }
        }
      }
      
      // Sort symptoms by match score
      detectedSymptoms.sort((a, b) => b.matchScore - a.matchScore);
      
      // Extract additional data
      const extractedData = {
        duration: this.extractDuration(normalizedText),
        severity: this.extractSeverity(normalizedText),
        location: this.extractLocation(normalizedText),
        triggers: this.extractTriggers(normalizedText),
        reliefFactors: this.extractReliefFactors(normalizedText),
        aggravatingFactors: this.extractAggravatingFactors(normalizedText)
      };
      
      // Check for red flags
      for (const {pattern, flag, urgency} of RED_FLAG_PATTERNS) {
        if (pattern.some(p => normalizedText.includes(p))) {
          redFlags.push({
            description: flag,
            urgency
          });
        }
      }
      
      // Generate potential conditions based on symptoms
      // In a real app, this would use a medical knowledge graph
      const detectedConditions = this.predictPossibleConditions(detectedSymptoms, extractedData);
      
      return {
        detectedSymptoms,
        detectedConditions,
        extractedData,
        redFlags
      };
    } catch (error) {
      console.error('Error analyzing symptom text:', error);
      throw new Error('Failed to analyze symptom description');
    }
  }
  
  /**
   * Predict symptoms based on body region selection
   */
  async predictSymptomsByRegion(bodyRegion: string): Promise<SymptomMatch[]> {
    try {
      // In a real app, this would query a database or API
      // For this demo, we'll return mock data
      const regionSymptoms: Record<string, SymptomMatch[]> = {
        'head': [
          { symptomId: 'headache', symptomName: 'Dolor de cabeza', matchScore: 95, bodyRegion: 'head' },
          { symptomId: 'migraine', symptomName: 'Migraña', matchScore: 85, bodyRegion: 'head' },
          { symptomId: 'sinusitis', symptomName: 'Sinusitis', matchScore: 75, bodyRegion: 'head' }
        ],
        'chest': [
          { symptomId: 'chest_pain', symptomName: 'Dolor de pecho', matchScore: 95, bodyRegion: 'chest' },
          { symptomId: 'cough', symptomName: 'Tos', matchScore: 85, bodyRegion: 'chest' },
          { symptomId: 'shortness_of_breath', symptomName: 'Dificultad para respirar', matchScore: 80, bodyRegion: 'chest' }
        ],
        'abdomen': [
          { symptomId: 'abdominal_pain', symptomName: 'Dolor abdominal', matchScore: 95, bodyRegion: 'abdomen' },
          { symptomId: 'nausea', symptomName: 'Náuseas', matchScore: 85, bodyRegion: 'abdomen' },
          { symptomId: 'bloating', symptomName: 'Hinchazón', matchScore: 80, bodyRegion: 'abdomen' }
        ],
        'back': [
          { symptomId: 'back_pain', symptomName: 'Dolor de espalda', matchScore: 95, bodyRegion: 'back' },
          { symptomId: 'sciatica', symptomName: 'Ciática', matchScore: 80, bodyRegion: 'back' },
          { symptomId: 'muscle_strain', symptomName: 'Distensión muscular', matchScore: 75, bodyRegion: 'back' }
        ],
        'neck': [
          { symptomId: 'neck_pain', symptomName: 'Dolor de cuello', matchScore: 95, bodyRegion: 'neck' },
          { symptomId: 'sore_throat', symptomName: 'Dolor de garganta', matchScore: 90, bodyRegion: 'neck' },
          { symptomId: 'stiff_neck', symptomName: 'Rigidez de cuello', matchScore: 85, bodyRegion: 'neck' }
        ]
      };
      
      return regionSymptoms[bodyRegion] || [];
    } catch (error) {
      console.error('Error predicting symptoms by region:', error);
      return [];
    }
  }
  
  /**
   * Calculate a match score for a symptom based on text context
   */
  private calculateMatchScore(text: string, keyword: string): number {
    // In a real app, this would use more sophisticated NLP techniques
    // For this demo, we'll use a simple heuristic
    
    // Base score if keyword is found
    let score = 70;
    
    // Higher score if keyword appears multiple times
    const keywordRegex = new RegExp(keyword, 'g');
    const matches = text.match(keywordRegex);
    if (matches) {
      score += Math.min(matches.length * 5, 15); // Up to 15 points for repetition
    }
    
    // Higher score if keyword appears early in the text
    const firstIndex = text.indexOf(keyword);
    if (firstIndex < text.length / 3) {
      score += 10;
    } else if (firstIndex < text.length / 2) {
      score += 5;
    }
    
    // Look for intensity modifiers near the keyword
    const contextWindow = 50; // Characters before and after
    const start = Math.max(0, firstIndex - contextWindow);
    const end = Math.min(text.length, firstIndex + keyword.length + contextWindow);
    const context = text.substring(start, end);
    
    // Check for intensifiers
    const intensifiers = ['muy', 'mucho', 'fuerte', 'intenso', 'grave', 'severo'];
    if (intensifiers.some(word => context.includes(word))) {
      score += 10;
    }
    
    return Math.min(score, 100); // Cap at 100
  }
  
  /**
   * Extract duration information from text
   */
  private extractDuration(text: string): string | undefined {
    for (const [key, patterns] of Object.entries(DURATION_KEYWORDS)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return key;
      }
    }
    return undefined;
  }
  
  /**
   * Extract severity information from text
   */
  private extractSeverity(text: string): string | undefined {
    for (const [key, patterns] of Object.entries(SEVERITY_KEYWORDS)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return key;
      }
    }
    return undefined;
  }
  
  /**
   * Extract location information from text
   */
  private extractLocation(text: string): string | undefined {
    for (const [region, keywords] of Object.entries(BODY_REGION_MAP)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return region;
      }
    }
    return undefined;
  }
  
  /**
   * Extract trigger factors from text
   */
  private extractTriggers(text: string): string[] {
    const triggers: string[] = [];
    const triggerPatterns = [
      { pattern: 'cuando como', value: 'Alimentación' },
      { pattern: 'después de comer', value: 'Alimentación' },
      { pattern: 'estrés', value: 'Estrés' },
      { pattern: 'ansiedad', value: 'Ansiedad' },
      { pattern: 'ejercicio', value: 'Ejercicio físico' },
      { pattern: 'actividad física', value: 'Ejercicio físico' },
      { pattern: 'cuando duermo', value: 'Sueño' },
      { pattern: 'al dormir', value: 'Sueño' },
      { pattern: 'alcohol', value: 'Alcohol' },
      { pattern: 'luz', value: 'Luz brillante' },
      { pattern: 'ruido', value: 'Ruido' }
    ];
    
    for (const { pattern, value } of triggerPatterns) {
      if (text.includes(pattern) && !triggers.includes(value)) {
        triggers.push(value);
      }
    }
    
    return triggers;
  }
  
  /**
   * Extract relief factors from text
   */
  private extractReliefFactors(text: string): string[] {
    const factors: string[] = [];
    const reliefPatterns = [
      { pattern: 'mejora con', value: 'Mejora general' },
      { pattern: 'alivia', value: 'Alivio general' },
      { pattern: 'mejor cuando', value: 'Mejora condicional' },
      { pattern: 'desaparece', value: 'Remisión completa' },
      { pattern: 'medicamento', value: 'Medicación' },
      { pattern: 'pastilla', value: 'Medicación' },
      { pattern: 'descanso', value: 'Descanso' },
      { pattern: 'dormir', value: 'Sueño' },
      { pattern: 'frío', value: 'Aplicación de frío' },
      { pattern: 'calor', value: 'Aplicación de calor' }
    ];
    
    for (const { pattern, value } of reliefPatterns) {
      if (text.includes(pattern) && !factors.includes(value)) {
        factors.push(value);
      }
    }
    
    return factors;
  }
  
  /**
   * Extract aggravating factors from text
   */
  private extractAggravatingFactors(text: string): string[] {
    const factors: string[] = [];
    const aggravatingPatterns = [
      { pattern: 'empeora', value: 'Empeoramiento general' },
      { pattern: 'peor cuando', value: 'Empeoramiento condicional' },
      { pattern: 'aumenta', value: 'Aumento de síntomas' },
      { pattern: 'más fuerte', value: 'Intensificación' },
      { pattern: 'movimiento', value: 'Movimiento' },
      { pattern: 'presión', value: 'Presión física' },
      { pattern: 'tocar', value: 'Contacto físico' },
      { pattern: 'comida', value: 'Alimentación' },
      { pattern: 'estrés', value: 'Estrés' },
      { pattern: 'ejercicio', value: 'Ejercicio físico' }
    ];
    
    for (const { pattern, value } of aggravatingPatterns) {
      if (text.includes(pattern) && !factors.includes(value)) {
        factors.push(value);
      }
    }
    
    return factors;
  }
  
  /**
   * Predict possible conditions based on detected symptoms
   */
  private predictPossibleConditions(
    symptoms: SymptomMatch[], 
    extractedData: any
  ): {conditionId: string; conditionName: string; probability: number}[] {
    // In a real app, this would use a medical knowledge graph and ML models
    // For this demo, we'll use a simple rule-based system
    
    const conditions: {conditionId: string; conditionName: string; probability: number}[] = [];
    
    if (symptoms.length === 0) {
      return conditions;
    }
    
    // Simple condition prediction logic based on primary symptom
    const primarySymptom = symptoms[0];
    
    switch (primarySymptom.symptomId) {
      case 'headache':
        conditions.push(
          { conditionId: 'migraine', conditionName: 'Migraña', probability: 0.7 },
          { conditionId: 'tension_headache', conditionName: 'Cefalea tensional', probability: 0.8 },
          { conditionId: 'sinusitis', conditionName: 'Sinusitis', probability: 0.5 }
        );
        break;
        
      case 'chest_pain':
        conditions.push(
          { conditionId: 'angina', conditionName: 'Angina de pecho', probability: 0.5 },
          { conditionId: 'gerd', conditionName: 'Reflujo gastroesofágico', probability: 0.7 },
          { conditionId: 'costochondritis', conditionName: 'Costocondritis', probability: 0.6 }
        );
        break;
        
      case 'abdominal_pain':
        conditions.push(
          { conditionId: 'gastritis', conditionName: 'Gastritis', probability: 0.75 },
          { conditionId: 'ibs', conditionName: 'Síndrome del intestino irritable', probability: 0.65 },
          { conditionId: 'appendicitis', conditionName: 'Apendicitis', probability: 0.3 }
        );
        break;
        
      case 'cough':
        conditions.push(
          { conditionId: 'common_cold', conditionName: 'Resfriado común', probability: 0.8 },
          { conditionId: 'bronchitis', conditionName: 'Bronquitis', probability: 0.6 },
          { conditionId: 'pneumonia', conditionName: 'Neumonía', probability: 0.4 }
        );
        break;
        
      default:
        conditions.push(
          { conditionId: 'general_condition', conditionName: 'Condición no específica', probability: 0.5 }
        );
    }
    
    // Adjust probabilities based on additional symptoms and extracted data
    this.adjustProbabilities(conditions, symptoms, extractedData);
    
    // Sort by probability
    conditions.sort((a, b) => b.probability - a.probability);
    
    return conditions;
  }
  
  /**
   * Adjust condition probabilities based on additional symptoms and data
   */
  private adjustProbabilities(
    conditions: {conditionId: string; conditionName: string; probability: number}[],
    symptoms: SymptomMatch[],
    extractedData: any
  ): void {
    // Check for related symptoms that increase certain condition probabilities
    const hasSymptom = (id: string): boolean => {
      return symptoms.some(s => s.symptomId === id);
    };
    
    // Simple adjustment rules
    for (const condition of conditions) {
      // Migraines are more likely with nausea and light sensitivity
      if (condition.conditionId === 'migraine' && (hasSymptom('nausea') || hasSymptom('light_sensitivity'))) {
        condition.probability += 0.15;
      }
      
      // Sinusitis is more likely with nasal congestion
      if (condition.conditionId === 'sinusitis' && hasSymptom('nasal_congestion')) {
        condition.probability += 0.2;
      }
      
      // Angina is more likely with exertional symptoms
      if (condition.conditionId === 'angina' && extractedData.triggers?.includes('Ejercicio físico')) {
        condition.probability += 0.25;
      }
      
      // GERD is more likely with food-related symptoms
      if (condition.conditionId === 'gerd' && extractedData.triggers?.includes('Alimentación')) {
        condition.probability += 0.2;
      }
      
      // Adjust by chronicity
      if (extractedData.duration === 'chronic') {
        // Chronic conditions become more likely
        if (['tension_headache', 'gerd', 'ibs'].includes(condition.conditionId)) {
          condition.probability += 0.15;
        }
        
        // Acute conditions become less likely
        if (['appendicitis', 'pneumonia'].includes(condition.conditionId)) {
          condition.probability -= 0.2;
        }
      }
      
      // Adjust by severity
      if (extractedData.severity === 'severe') {
        // Serious conditions become more likely
        if (['angina', 'appendicitis', 'pneumonia'].includes(condition.conditionId)) {
          condition.probability += 0.15;
        }
      }
      
      // Cap probability at 0.95 and floor at 0.05
      condition.probability = Math.max(0.05, Math.min(0.95, condition.probability));
    }
  }
}

// Create singleton instance
const symptomPredictionService = new SymptomPredictionService();
export default symptomPredictionService;