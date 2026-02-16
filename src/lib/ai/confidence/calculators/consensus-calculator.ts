/**
 * Consensus Calculator
 *
 * Merges multiple AI responses and calculates consensus-based confidence scores.
 */

import type { DiagnosisConfidence, AIResponseSource } from '../types';
import { BaseCalculator } from './base-calculator';

/**
 * Merged diagnosis data structure
 */
interface MergedDiagnosisData {
  totalWeight: number;
  weightedConfidence: number;
  sources: string[];
}

/**
 * Calculator for merging and weighting multiple AI responses
 */
export class ConsensusCalculator extends BaseCalculator {
  /**
   * Merge multiple AI responses with confidence weighting
   */
  mergeResponses(responses: AIResponseSource[]): DiagnosisConfidence[] {
    const merged = this.aggregateDiagnoses(responses);
    return this.calculateWeightedAverages(merged);
  }

  /**
   * Aggregate diagnoses from all responses
   */
  private aggregateDiagnoses(
    responses: AIResponseSource[]
  ): Map<string, MergedDiagnosisData> {
    const merged = new Map<string, MergedDiagnosisData>();

    responses.forEach(response => {
      response.diagnoses.forEach(diagnosis => {
        this.mergeDiagnosis(merged, diagnosis, response);
      });
    });

    return merged;
  }

  /**
   * Merge a single diagnosis into the aggregation
   */
  private mergeDiagnosis(
    merged: Map<string, MergedDiagnosisData>,
    diagnosis: DiagnosisConfidence,
    response: AIResponseSource
  ): void {
    const existing = merged.get(diagnosis.condition);
    const weightedConf = diagnosis.confidence * response.weight;

    if (existing) {
      existing.totalWeight += response.weight;
      existing.weightedConfidence += weightedConf;
      existing.sources.push(response.source);
    } else {
      merged.set(diagnosis.condition, {
        totalWeight: response.weight,
        weightedConfidence: weightedConf,
        sources: [response.source],
      });
    }
  }

  /**
   * Calculate weighted averages from merged data
   */
  private calculateWeightedAverages(
    merged: Map<string, MergedDiagnosisData>
  ): DiagnosisConfidence[] {
    return Array.from(merged.entries())
      .map(([condition, data]) => ({
        condition,
        confidence: Math.round(data.weightedConfidence / data.totalWeight),
        reasoning: this.formatSources(data.sources),
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Format source list for reasoning
   */
  private formatSources(sources: string[]): string {
    return `Aggregated from ${sources.length} source(s): ${sources.join(', ')}`;
  }

  /**
   * Calculate consensus confidence from multiple scores
   * Uses weighted average where higher individual confidences get more weight
   */
  calculateConsensusConfidence(scores: number[]): number {
    if (scores.length === 0) return 0;
    if (scores.length === 1) return scores[0];

    // Weight by confidence squared (higher confidences have more influence)
    const weightedSum = scores.reduce((sum, score) => sum + score * score, 0);
    const totalWeight = scores.reduce((sum, score) => sum + score, 0);

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Calculate agreement level between multiple responses
   * Returns a score from 0-100 indicating how much the responses agree
   */
  calculateAgreementLevel(diagnoses: DiagnosisConfidence[][]): number {
    if (diagnoses.length < 2) return 100;

    // Find common conditions
    const conditionSets = diagnoses.map(ds => 
      new Set(ds.map(d => d.condition.toLowerCase()))
    );

    // Calculate Jaccard similarity for each pair
    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < conditionSets.length; i++) {
      for (let j = i + 1; j < conditionSets.length; j++) {
        const intersection = this.setIntersection(conditionSets[i], conditionSets[j]);
        const union = this.setUnion(conditionSets[i], conditionSets[j]);
        
        totalSimilarity += union.size > 0 ? intersection.size / union.size : 0;
        pairCount++;
      }
    }

    return pairCount > 0 ? Math.round((totalSimilarity / pairCount) * 100) : 100;
  }

  /**
   * Set intersection
   */
  private setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set(Array.from(a).filter(x => b.has(x)));
  }

  /**
   * Set union
   */
  private setUnion<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set(Array.from(a).concat(Array.from(b)));
  }
}
