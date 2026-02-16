/**
 * AI Response Parser
 *
 * Utilities for parsing confidence scores from AI text responses.
 */

import type { DiagnosisConfidence } from '../types';
import {
  CONFIDENCE_PARSING_PATTERNS,
  HIGH_CONFIDENCE_PATTERNS,
  MODERATE_CONFIDENCE_PATTERNS,
  LOW_CONFIDENCE_PATTERNS,
  INFERRED_CONFIDENCE_SCORES,
} from '../data';

/**
 * Parse AI text response to extract confidence scores
 */
export function parseAIConfidenceScores(aiResponse: string): DiagnosisConfidence[] {
  const diagnoses: DiagnosisConfidence[] = [];

  // Try pattern-based extraction
  const patternResults = extractFromPatterns(aiResponse);
  diagnoses.push(...patternResults);

  // If no diagnoses found, try language inference
  if (diagnoses.length === 0) {
    const inferred = inferConfidenceFromLanguage(aiResponse);
    diagnoses.push(...inferred);
  }

  return diagnoses.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract diagnoses using regex patterns
 */
function extractFromPatterns(aiResponse: string): DiagnosisConfidence[] {
  const diagnoses: DiagnosisConfidence[] = [];
  const patterns = Object.values(CONFIDENCE_PARSING_PATTERNS);

  for (const pattern of patterns) {
    const matches = extractMatches(aiResponse, pattern);
    
    for (const match of matches) {
      const diagnosis = parseMatch(match, pattern);
      if (diagnosis && !isDuplicate(diagnoses, diagnosis)) {
        diagnoses.push(diagnosis);
      }
    }
  }

  return diagnoses;
}

/**
 * Extract all matches from text using pattern
 */
function extractMatches(text: string, pattern: RegExp): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match;
  
  // Reset lastIndex and create new regex to avoid state issues
  const regex = new RegExp(pattern.source, pattern.flags);
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
    // Prevent infinite loops on zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }
  
  return matches;
}

/**
 * Parse a single regex match into a diagnosis
 */
function parseMatch(match: RegExpExecArray, pattern: RegExp): DiagnosisConfidence | null {
  let condition: string;
  let confidenceStr: string;

  // Determine which capture group is which based on pattern
  if (pattern.source.includes('confident')) {
    confidenceStr = match[1];
    condition = match[2];
  } else {
    condition = match[1];
    confidenceStr = match[2];
  }

  if (!condition || !confidenceStr) return null;

  const confidence = parseFloat(confidenceStr);
  const cleanCondition = cleanConditionName(condition);

  if (isNaN(confidence) || confidence < 0 || confidence > 100) return null;
  if (cleanCondition.length < 3 || cleanCondition.length > 100) return null;

  return {
    condition: cleanCondition,
    confidence: Math.round(confidence),
  };
}

/**
 * Clean up condition name from extracted text
 */
function cleanConditionName(condition: string): string {
  return condition
    .trim()
    .replace(/^(?:diagnosis|assessment|likely)\s*:?\s*/i, '')
    .replace(/\s+/g, ' ');
}

/**
 * Check if diagnosis is already in the list
 */
function isDuplicate(diagnoses: DiagnosisConfidence[], newDiagnosis: DiagnosisConfidence): boolean {
  return diagnoses.some(d => 
    d.condition.toLowerCase() === newDiagnosis.condition.toLowerCase()
  );
}

/**
 * Infer confidence from language patterns when explicit scores aren't provided
 */
function inferConfidenceFromLanguage(text: string): DiagnosisConfidence[] {
  const diagnoses: DiagnosisConfidence[] = [];

  // Extract conditions with inferred confidence levels
  const highConfidenceConditions = extractConditions(text, HIGH_CONFIDENCE_PATTERNS);
  const moderateConfidenceConditions = extractConditions(text, MODERATE_CONFIDENCE_PATTERNS);
  const lowConfidenceConditions = extractConditions(text, LOW_CONFIDENCE_PATTERNS);

  // Add with appropriate confidence scores
  highConfidenceConditions.forEach(condition => {
    diagnoses.push({
      condition,
      confidence: INFERRED_CONFIDENCE_SCORES.HIGH,
      reasoning: 'Inferred from high confidence language',
    });
  });

  moderateConfidenceConditions.forEach(condition => {
    diagnoses.push({
      condition,
      confidence: INFERRED_CONFIDENCE_SCORES.MODERATE,
      reasoning: 'Inferred from moderate confidence language',
    });
  });

  lowConfidenceConditions.forEach(condition => {
    diagnoses.push({
      condition,
      confidence: INFERRED_CONFIDENCE_SCORES.LOW,
      reasoning: 'Inferred from low confidence language',
    });
  });

  return diagnoses;
}

/**
 * Extract conditions matching patterns
 */
function extractConditions(text: string, patterns: RegExp[]): string[] {
  const conditions: string[] = [];

  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      const condition = match[1]?.trim();
      if (condition && condition.length > 3 && condition.length < 100) {
        conditions.push(condition);
      }
      // Prevent infinite loops
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
  });

  return conditions;
}

/**
 * Check if text contains explicit confidence indicators
 */
export function hasExplicitConfidence(text: string): boolean {
  const patterns = Object.values(CONFIDENCE_PARSING_PATTERNS);
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Get confidence extraction quality score
 * Returns a score from 0-100 indicating how reliable the extraction was
 */
export function getExtractionQuality(diagnoses: DiagnosisConfidence[]): number {
  if (diagnoses.length === 0) return 0;

  // Score based on number of diagnoses and average confidence
  const avgConfidence = diagnoses.reduce((sum, d) => sum + d.confidence, 0) / diagnoses.length;
  const countBonus = Math.min(diagnoses.length * 10, 30); // Up to 30 points for multiple diagnoses

  return Math.min(100, avgConfidence + countBonus);
}
