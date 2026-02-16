/**
 * Confidence Display Utilities
 *
 * Utilities for displaying and formatting confidence information.
 */

import type { 
  ConfidenceLevel, 
  ConfidenceInterval, 
  ConfidenceColorTheme,
  SeverityLevel,
} from '../types';
import {
  CONFIDENCE_LEVEL_THRESHOLDS,
  CONFIDENCE_COLOR_THEMES,
  CONFIDENCE_DESCRIPTIONS,
  CONFIDENCE_RECOMMENDATIONS,
  RECOMMENDATION_THRESHOLDS,
} from '../data';

/**
 * Get confidence level category from score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score < CONFIDENCE_LEVEL_THRESHOLDS.VERY_LOW) return 'very-low';
  if (score < CONFIDENCE_LEVEL_THRESHOLDS.LOW) return 'low';
  if (score < CONFIDENCE_LEVEL_THRESHOLDS.MODERATE) return 'moderate';
  if (score < CONFIDENCE_LEVEL_THRESHOLDS.HIGH) return 'high';
  return 'very-high';
}

/**
 * Get Tailwind color classes for confidence display
 */
export function getConfidenceColor(score: number): ConfidenceColorTheme {
  const level = getConfidenceLevel(score);
  return CONFIDENCE_COLOR_THEMES[level];
}

/**
 * Format confidence interval as human-readable string
 */
export function formatConfidenceRange(interval: ConfidenceInterval): string {
  return `${Math.round(interval.low)}% - ${Math.round(interval.high)}% (expected: ${Math.round(interval.mid)}%)`;
}

/**
 * Format confidence interval as a simple range
 */
export function formatConfidenceRangeSimple(interval: ConfidenceInterval): string {
  return `${Math.round(interval.low)}% - ${Math.round(interval.high)}%`;
}

/**
 * Determine if a human doctor should be recommended
 */
export function shouldRecommendDoctor(
  score: number,
  riskFactorCount: number = 0,
  severity: SeverityLevel = 'low'
): boolean {
  // Critical severity always requires doctor
  if (severity === 'critical') return true;

  // High severity with moderate or lower confidence
  if (severity === 'high' && score < RECOMMENDATION_THRESHOLDS.HIGH_CONFIDENCE) {
    return true;
  }

  // Low confidence thresholds
  if (score < RECOMMENDATION_THRESHOLDS.LOW_CONFIDENCE) return true;

  // Moderate confidence with risk factors
  if (score < RECOMMENDATION_THRESHOLDS.MODERATE_CONFIDENCE && riskFactorCount > 0) {
    return true;
  }

  // Multiple risk factors reduce confidence threshold
  if (riskFactorCount >= RECOMMENDATION_THRESHOLDS.RISK_FACTOR_LIMIT) return true;

  return false;
}

/**
 * Get human-readable description for confidence level
 */
export function getConfidenceDescription(level: ConfidenceLevel): string {
  return CONFIDENCE_DESCRIPTIONS[level];
}

/**
 * Get recommendation action based on confidence
 */
export function getConfidenceRecommendation(score: number): string {
  // Find the highest threshold that the score meets
  for (let i = CONFIDENCE_RECOMMENDATIONS.length - 1; i >= 0; i--) {
    if (score >= CONFIDENCE_RECOMMENDATIONS[i].threshold) {
      return CONFIDENCE_RECOMMENDATIONS[i].message;
    }
  }
  return CONFIDENCE_RECOMMENDATIONS[0].message;
}

/**
 * Format confidence as percentage string
 */
export function formatConfidencePercent(score: number, decimals: number = 0): string {
  return `${score.toFixed(decimals)}%`;
}

/**
 * Get confidence progress bar width
 */
export function getConfidenceProgressWidth(score: number): string {
  return `${Math.min(100, Math.max(0, score))}%`;
}

/**
 * Check if confidence is actionable (high enough to act on)
 */
export function isActionableConfidence(score: number): boolean {
  return score >= CONFIDENCE_LEVEL_THRESHOLDS.MODERATE;
}

/**
 * Get confidence trend indicator
 */
export function getConfidenceTrend(
  current: number,
  previous: number
): { direction: 'up' | 'down' | 'stable'; change: number } {
  const change = current - previous;
  const threshold = 5; // Minimum change to be considered a trend

  if (change > threshold) return { direction: 'up', change };
  if (change < -threshold) return { direction: 'down', change };
  return { direction: 'stable', change };
}
