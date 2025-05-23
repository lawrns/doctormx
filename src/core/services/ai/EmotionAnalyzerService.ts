export interface EmotionAnalysisResult {
  primary: 'joy' | 'sadness' | 'fear' | 'anger' | 'surprise' | 'disgust' | 'anxiety' | 'pain';
  intensity: number;
  confidence: number;
  keywords: string[];
}

export class EmotionAnalyzer {
  private emotionalKeywords = {
    pain: ['duele', 'dolor', 'molesta', 'lastima', 'punzada', 'ardor', 'quema', 'pincha'],
    fear: ['miedo', 'asustado', 'nervioso', 'preocupado', 'ansiedad', 'pánico', 'terror'],
    sadness: ['triste', 'deprimido', 'desanimado', 'melancolía', 'llorando', 'lloro'],
    anger: ['enojado', 'furioso', 'molesto', 'irritado', 'coraje', 'rabia'],
    anxiety: ['ansioso', 'nervioso', 'intranquilo', 'agitado', 'estresado', 'tenso'],
    joy: ['feliz', 'contento', 'alegre', 'emocionado', 'bien', 'mejor'],
    surprise: ['sorprendido', 'asombrado', 'impresionado', 'increíble'],
    disgust: ['asco', 'repugnante', 'asqueroso', 'horrible']
  };

  analyzeEmotion(text: string): EmotionAnalysisResult {
    const lowerText = text.toLowerCase();
    let maxMatches = 0;
    let detectedEmotion: EmotionAnalysisResult['primary'] = 'anxiety';
    let matchedKeywords: string[] = [];

    for (const [emotion, keywords] of Object.entries(this.emotionalKeywords)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        detectedEmotion = emotion as EmotionAnalysisResult['primary'];
        matchedKeywords = matches;
      }
    }

    return {
      primary: detectedEmotion,
      intensity: Math.min(maxMatches / 3, 1),
      confidence: maxMatches > 0 ? 0.8 : 0.4,
      keywords: matchedKeywords
    };
  }

  getEmotionalIntensity(text: string): number {
    const intensifiers = ['muy', 'mucho', 'bastante', 'demasiado', 'extremadamente'];
    const minimizers = ['poco', 'algo', 'un poco', 'ligeramente'];
    
    let intensity = 0.5; // base intensity
    
    for (const intensifier of intensifiers) {
      if (text.toLowerCase().includes(intensifier)) {
        intensity += 0.3;
      }
    }
    
    for (const minimizer of minimizers) {
      if (text.toLowerCase().includes(minimizer)) {
        intensity -= 0.2;
      }
    }
    
    return Math.max(0, Math.min(1, intensity));
  }
} 