/**
 * Service to process and improve AI responses
 * Eliminates repetition and ensures quality
 */

export interface ProcessedResponse {
  text: string;
  hasRepetition: boolean;
  repetitionFixed: boolean;
  modifications: string[];
}

export class ResponseProcessingService {
  private static responseCache: Map<string, string[]> = new Map();
  private static readonly MAX_CACHE_SIZE = 100;
  
  /**
   * Process response to eliminate repetition and improve quality
   */
  static processResponse(
    response: string,
    sessionId: string = 'default'
  ): ProcessedResponse {
    const result: ProcessedResponse = {
      text: response,
      hasRepetition: false,
      repetitionFixed: false,
      modifications: []
    };
    
    // Step 1: Check for internal repetition (same content repeated in response)
    const processedText = this.removeInternalRepetition(response);
    if (processedText !== response) {
      result.hasRepetition = true;
      result.repetitionFixed = true;
      result.modifications.push('Removed internal repetition');
      result.text = processedText;
    }
    
    // Step 2: Check against recent responses
    const recentResponses = this.responseCache.get(sessionId) || [];
    if (this.isSimilarToRecent(result.text, recentResponses)) {
      result.hasRepetition = true;
      result.text = this.makeResponseUnique(result.text, recentResponses);
      result.repetitionFixed = true;
      result.modifications.push('Modified to avoid repetition with recent responses');
    }
    
    // Step 3: Store in cache
    this.addToCache(sessionId, result.text);
    
    // Step 4: Final quality checks
    result.text = this.applyFinalQualityChecks(result.text);
    
    return result;
  }
  
  /**
   * Remove internal repetition within a single response
   */
  private static removeInternalRepetition(text: string): string {
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const uniqueSentences: string[] = [];
    const seenContent = new Set<string>();
    
    for (const sentence of sentences) {
      const normalized = sentence.trim().toLowerCase();
      // Check if this sentence or a very similar one was already added
      let isDuplicate = false;
      
      for (const seen of seenContent) {
        if (this.calculateSimilarity(normalized, seen) > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate && normalized.length > 10) {
        uniqueSentences.push(sentence.trim());
        seenContent.add(normalized);
      }
    }
    
    return uniqueSentences.join('. ') + '.';
  }
  
  /**
   * Check if response is similar to recent ones
   */
  private static isSimilarToRecent(
    text: string,
    recentResponses: string[]
  ): boolean {
    const normalized = text.toLowerCase();
    
    for (const recent of recentResponses) {
      if (this.calculateSimilarity(normalized, recent.toLowerCase()) > 0.7) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Calculate similarity between two texts (0-1)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    // Simple word-based similarity
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Make response unique compared to recent ones
   */
  private static makeResponseUnique(
    text: string,
    recentResponses: string[]
  ): string {
    // Add variety phrases to make it different
    const varietyPhrases = [
      'Además, ',
      'También es importante mencionar que ',
      'Otro aspecto a considerar es que ',
      'Adicionalmente, ',
      'Por otra parte, '
    ];
    
    // Use a random variety phrase if the response is too similar
    const randomPhrase = varietyPhrases[Math.floor(Math.random() * varietyPhrases.length)];
    
    // For medical responses, add time-based variety
    const timeBasedAdditions = [
      'En este momento, ',
      'Para tu situación actual, ',
      'Considerando lo que describes, ',
      'Basándome en estos síntomas, '
    ];
    
    const randomTime = timeBasedAdditions[Math.floor(Math.random() * timeBasedAdditions.length)];
    
    return randomTime + text.charAt(0).toLowerCase() + text.slice(1);
  }
  
  /**
   * Add response to cache
   */
  private static addToCache(sessionId: string, response: string): void {
    const cache = this.responseCache.get(sessionId) || [];
    cache.push(response);
    
    // Keep only recent responses
    if (cache.length > 10) {
      cache.shift();
    }
    
    this.responseCache.set(sessionId, cache);
    
    // Clean up old sessions if cache is too large
    if (this.responseCache.size > this.MAX_CACHE_SIZE) {
      const oldestKey = this.responseCache.keys().next().value;
      this.responseCache.delete(oldestKey);
    }
  }
  
  /**
   * Apply final quality checks
   */
  private static applyFinalQualityChecks(text: string): string {
    // Remove multiple spaces
    text = text.replace(/\s+/g, ' ');
    
    // Ensure proper sentence ending
    if (!text.match(/[.!?]$/)) {
      text += '.';
    }
    
    // Remove any duplicate punctuation
    text = text.replace(/([.!?])+/g, '$1');
    
    // Ensure first letter is capitalized
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    return text.trim();
  }
  
  /**
   * Clear cache for a session
   */
  static clearCache(sessionId: string = 'default'): void {
    this.responseCache.delete(sessionId);
  }
  
  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalSessions: number;
    totalResponses: number;
  } {
    let totalResponses = 0;
    
    for (const responses of this.responseCache.values()) {
      totalResponses += responses.length;
    }
    
    return {
      totalSessions: this.responseCache.size,
      totalResponses
    };
  }
}