/**
 * HerbService - Phase 1 medicinal herb database service for DoctorMX
 * Provides search, filtering, and recommendation functionality for herbal medicines
 */

import { getSupabaseClient } from '../../src/lib/supabase';
import type { Herb, HerbSearchFilters, HerbSearchResult } from '@pkg/types';
import { loggingService } from './LoggingService';

const supabase = getSupabaseClient();

export class HerbService {
  private static instance: HerbService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): HerbService {
    if (!HerbService.instance) {
      HerbService.instance = new HerbService();
    }
    return HerbService.instance;
  }

  /**
   * Search herbs by query, uses, and filters
   */
  searchHerbs = loggingService.createErrorHandler(
    'HerbService',
    'searchHerbs',
    async (filters: HerbSearchFilters = {}): Promise<HerbSearchResult> => {
      const startTime = Date.now();
      const cacheKey = JSON.stringify(filters);
      const cached = this.getCached(cacheKey);
      if (cached) {
        loggingService.debug('HerbService', 'searchHerbs cache hit', { filters });
        return cached;
      }

      loggingService.info('HerbService', 'searchHerbs started', { filters });

      try {
      const { 
        query = '', 
        uses = [], 
        evidenceGrade = [], 
        preparation = [], 
        region = [],
        availability = []
      } = filters;

      // Build the query
      let queryBuilder = supabase
        .from('herbs')
        .select('*')
        .eq('feature_enabled', true);

      // Text search across latin name, common names, and traditional uses
      if (query) {
        queryBuilder = queryBuilder.or(
          `latin_name.ilike.%${query}%,` +
          `common_names.cs.{${query}},` +
          `traditional_uses.cs.{${query}}`
        );
      }

      // Filter by traditional uses
      if (uses.length > 0) {
        queryBuilder = queryBuilder.overlaps('traditional_uses', uses);
      }

      // Filter by evidence grade
      if (evidenceGrade.length > 0) {
        queryBuilder = queryBuilder.in('evidence_grade', evidenceGrade);
      }

      // Execute query
      const { data, error, count } = await queryBuilder
        .order('evidence_grade', { ascending: true })
        .order('latin_name', { ascending: true })
        .range(0, 19); // Limit to 20 results for Phase 1

        if (error) {
          loggingService.error('HerbService', 'Database error in searchHerbs', error);
          throw new Error(`Database error: ${error.message}`);
        }

        const result: HerbSearchResult = {
          herbs: data || [],
          total: count || 0,
          page: 1,
          pageSize: 20,
          filters
        };

        this.setCached(cacheKey, result);
        
        const duration = Date.now() - startTime;
        loggingService.logPerformance('HerbService', 'searchHerbs', duration, { 
          resultCount: result.herbs.length, 
          filters 
        });

        return result;

      } catch (error) {
        loggingService.error('HerbService', 'searchHerbs failed', error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    }
  );

  /**
   * Get herb by ID
   */
  async getHerbById(id: string): Promise<Herb | null> {
    const cacheKey = `herb_${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .eq('id', id)
        .eq('feature_enabled', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      this.setCached(cacheKey, data);
      return data;

    } catch (error) {
      console.error('HerbService.getHerbById error:', error);
      throw error;
    }
  }

  /**
   * Get herbs by latin names (for AI service integration)
   */
  async getHerbsByNames(latinNames: string[]): Promise<Herb[]> {
    if (latinNames.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .in('latin_name', latinNames)
        .eq('feature_enabled', true);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('HerbService.getHerbsByNames error:', error);
      throw error;
    }
  }

  /**
   * Get herbs for specific conditions/symptoms
   */
  async getHerbsForCondition(condition: string): Promise<Herb[]> {
    const cacheKey = `condition_${condition.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .contains('traditional_uses', [condition.toLowerCase()])
        .eq('feature_enabled', true)
        .order('evidence_grade', { ascending: true })
        .limit(10);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const result = data || [];
      this.setCached(cacheKey, result);
      return result;

    } catch (error) {
      console.error('HerbService.getHerbsForCondition error:', error);
      throw error;
    }
  }

  /**
   * Get herb recommendations based on symptom analysis
   */
  async getRecommendationsForSymptoms(symptoms: string[]): Promise<{
    primary: Herb[];
    secondary: Herb[];
    cautions: string[];
  }> {
    try {
      const allHerbs: Herb[] = [];
      const cautions: string[] = [];

      // Search for herbs that match each symptom
      for (const symptom of symptoms) {
        const herbs = await this.getHerbsForCondition(symptom);
        allHerbs.push(...herbs);
      }

      // Remove duplicates and sort by evidence grade
      const uniqueHerbs = Array.from(
        new Map(allHerbs.map(herb => [herb.id, herb])).values()
      );

      // Separate by evidence quality
      const primary = uniqueHerbs
        .filter(herb => ['A', 'B'].includes(herb.evidence_grade))
        .slice(0, 3);

      const secondary = uniqueHerbs
        .filter(herb => ['C', 'D'].includes(herb.evidence_grade))
        .slice(0, 2);

      // Collect contraindications
      uniqueHerbs.forEach(herb => {
        if (herb.contraindications.length > 0) {
          cautions.push(`${herb.latin_name}: ${herb.contraindications.join(', ')}`);
        }
      });

      return { primary, secondary, cautions };

    } catch (error) {
      console.error('HerbService.getRecommendationsForSymptoms error:', error);
      throw error;
    }
  }

  /**
   * Get all available herbs (for admin/expert use)
   */
  async getAllHerbs(): Promise<Herb[]> {
    try {
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .eq('feature_enabled', true)
        .order('latin_name', { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('HerbService.getAllHerbs error:', error);
      throw error;
    }
  }

  /**
   * Get herbs with synergistic effects (for protocol building)
   */
  async getSynergisticHerbs(herbId: string): Promise<Herb[]> {
    try {
      const baseHerb = await this.getHerbById(herbId);
      if (!baseHerb || baseHerb.synergies.length === 0) {
        return [];
      }

      // The synergies array contains herb IDs, but for Phase 1 we'll match by latin names
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .in('latin_name', baseHerb.synergies)
        .eq('feature_enabled', true);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('HerbService.getSynergisticHerbs error:', error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean old cache entries (simple LRU)
    if (this.cache.size > 100) {
      const oldest = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0];
      this.cache.delete(oldest[0]);
    }
  }

  /**
   * Clear cache (for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const herbService = HerbService.getInstance();