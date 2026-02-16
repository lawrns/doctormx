/**
 * Utils Barrel Export
 *
 * Utility functions for confidence scoring system.
 */

export {
  getConfidenceLevel,
  getConfidenceColor,
  formatConfidenceRange,
  formatConfidenceRangeSimple,
  shouldRecommendDoctor,
  getConfidenceDescription,
  getConfidenceRecommendation,
  formatConfidencePercent,
  getConfidenceProgressWidth,
  isActionableConfidence,
  getConfidenceTrend,
} from './confidence-display';

export {
  parseAIConfidenceScores,
  hasExplicitConfidence,
  getExtractionQuality,
} from './ai-response-parser';
