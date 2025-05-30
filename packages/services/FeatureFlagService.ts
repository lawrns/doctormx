/**
 * FeatureFlagService - Gradual rollout and A/B testing service for DoctorMX
 * Enables controlled feature deployment with user-specific and percentage-based rollouts
 */

import { getSupabaseClient } from '../../src/lib/supabase';
import type { FeatureFlags } from '@pkg/types';

// Use the singleton Supabase client to prevent multiple instances
const supabase = getSupabaseClient();

interface FeatureFlagRow {
  id: string;
  flag_name: string;
  enabled: boolean;
  description: string | null;
  rollout_percentage: number;
  user_whitelist: string[] | null;
  created_at: string;
  updated_at: string;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private cache: Map<string, { flags: FeatureFlags; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes for feature flags
  private defaultFlags: FeatureFlags = {
    herbDatabase: false,
    rootCauseAnalysis: false,
    protocolBuilder: false,
    constitutionalAnalysis: false,
    redFlagDetection: true, // Always on for safety
    imageAnalysisV2: false,
    progressTracking: false,
    knowledgeGraph: false,
    expertPortal: false,
    marketplace: false,
    community: false,
    multilingual: false
  };

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Get feature flags for a specific user
   */
  async getFeatureFlags(userId?: string, sessionId?: string): Promise<FeatureFlags> {
    const cacheKey = userId || sessionId || 'anonymous';
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Try to fetch feature flags, but handle missing table gracefully
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*');

      if (error) {
        if (error.code === '42P01') {
          console.info('Feature flags table does not exist, using default flags');
        } else {
          console.warn('Feature flags not accessible, using defaults:', error.message);
        }
        // Cache the default flags to avoid repeated database calls
        this.setCached(cacheKey, this.defaultFlags);
        return this.defaultFlags;
      }

      const flags = this.evaluateFlags(data || [], userId);
      this.setCached(cacheKey, flags);
      return flags;

    } catch (error) {
      console.warn('FeatureFlagService.getFeatureFlags error, using defaults:', error);
      // Cache the default flags to avoid repeated errors
      this.setCached(cacheKey, this.defaultFlags);
      return this.defaultFlags;
    }
  }

  /**
   * Check if a specific feature is enabled for a user
   */
  async isFeatureEnabled(
    flagName: keyof FeatureFlags,
    userId?: string,
    sessionId?: string
  ): Promise<boolean> {
    try {
      const flags = await this.getFeatureFlags(userId, sessionId);
      return flags[flagName] || false;
    } catch (error) {
      console.error(`Error checking feature flag ${flagName}:`, error);
      return false;
    }
  }

  /**
   * Evaluate flags based on rollout rules
   */
  private evaluateFlags(flagRows: FeatureFlagRow[], userId?: string): FeatureFlags {
    const flags = { ...this.defaultFlags };

    for (const row of flagRows) {
      const flagKey = this.mapFlagName(row.flag_name);
      if (!flagKey) continue;

      // If globally disabled, skip
      if (!row.enabled) {
        flags[flagKey] = false;
        continue;
      }

      // If user is in whitelist, enable
      if (userId && row.user_whitelist && row.user_whitelist.includes(userId)) {
        flags[flagKey] = true;
        continue;
      }

      // Check rollout percentage
      if (this.isInRolloutPercentage(userId || 'anonymous', row.rollout_percentage)) {
        flags[flagKey] = true;
      }
    }

    return flags;
  }

  /**
   * Map database flag names to TypeScript enum
   */
  private mapFlagName(dbFlagName: string): keyof FeatureFlags | null {
    const mapping: Record<string, keyof FeatureFlags> = {
      'herb_database': 'herbDatabase',
      'root_cause_analysis': 'rootCauseAnalysis',
      'protocol_builder': 'protocolBuilder',
      'constitutional_analysis': 'constitutionalAnalysis',
      'red_flag_detection': 'redFlagDetection',
      'image_analysis_v2': 'imageAnalysisV2',
      'progress_tracking': 'progressTracking',
      'knowledge_graph': 'knowledgeGraph',
      'expert_portal': 'expertPortal',
      'marketplace': 'marketplace',
      'community': 'community',
      'multilingual': 'multilingual'
    };

    return mapping[dbFlagName] || null;
  }

  /**
   * Determine if user falls within rollout percentage using consistent hashing
   */
  private isInRolloutPercentage(identifier: string, percentage: number): boolean {
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;

    // Simple hash function for consistent assignment
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const normalized = Math.abs(hash) % 100;
    return normalized < percentage;
  }

  /**
   * Update feature flag (admin only)
   */
  async updateFeatureFlag(
    flagName: string,
    updates: Partial<{
      enabled: boolean;
      rollout_percentage: number;
      user_whitelist: string[];
      description: string;
    }>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('flag_name', flagName);

      if (error) {
        console.error('Error updating feature flag:', error);
        return false;
      }

      // Clear cache to force refresh
      this.clearCache();
      return true;

    } catch (error) {
      console.error('FeatureFlagService.updateFeatureFlag error:', error);
      return false;
    }
  }

  /**
   * Get all feature flags with metadata (admin only)
   */
  async getAllFeatureFlags(): Promise<FeatureFlagRow[]> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('FeatureFlagService.getAllFeatureFlags error:', error);
      throw error;
    }
  }

  /**
   * Create new feature flag (admin only)
   */
  async createFeatureFlag(
    flagName: string,
    description: string,
    enabled: boolean = false,
    rolloutPercentage: number = 0
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .insert({
          flag_name: flagName,
          enabled,
          description,
          rollout_percentage: rolloutPercentage,
          user_whitelist: []
        });

      if (error) {
        console.error('Error creating feature flag:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('FeatureFlagService.createFeatureFlag error:', error);
      return false;
    }
  }

  /**
   * Add user to feature flag whitelist
   */
  async addUserToWhitelist(flagName: string, userId: string): Promise<boolean> {
    try {
      // Get current flag
      const { data: currentFlag, error: fetchError } = await supabase
        .from('feature_flags')
        .select('user_whitelist')
        .eq('flag_name', flagName)
        .single();

      if (fetchError) {
        console.error('Error fetching current flag:', fetchError);
        return false;
      }

      const currentWhitelist = currentFlag.user_whitelist || [];
      if (currentWhitelist.includes(userId)) {
        return true; // Already in whitelist
      }

      const newWhitelist = [...currentWhitelist, userId];

      const { error } = await supabase
        .from('feature_flags')
        .update({
          user_whitelist: newWhitelist,
          updated_at: new Date().toISOString()
        })
        .eq('flag_name', flagName);

      if (error) {
        console.error('Error updating whitelist:', error);
        return false;
      }

      // Clear cache to force refresh
      this.clearCache();
      return true;

    } catch (error) {
      console.error('FeatureFlagService.addUserToWhitelist error:', error);
      return false;
    }
  }

  /**
   * Cache management
   */
  private getCached(key: string): FeatureFlags | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.flags;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, flags: FeatureFlags): void {
    this.cache.set(key, { flags, timestamp: Date.now() });

    // Clean old cache entries
    if (this.cache.size > 1000) {
      const oldest = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0];
      this.cache.delete(oldest[0]);
    }
  }

  /**
   * Clear cache (for admin updates)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get feature flag statistics (admin only)
   */
  async getFeatureFlagStats(): Promise<Record<string, {
    enabled: boolean;
    rolloutPercentage: number;
    whitelistCount: number;
    estimatedActiveUsers: number;
  }>> {
    try {
      const flags = await this.getAllFeatureFlags();
      const stats: Record<string, any> = {};

      for (const flag of flags) {
        stats[flag.flag_name] = {
          enabled: flag.enabled,
          rolloutPercentage: flag.rollout_percentage,
          whitelistCount: flag.user_whitelist?.length || 0,
          estimatedActiveUsers: flag.enabled ?
            (flag.rollout_percentage * 0.01 * 1000) + (flag.user_whitelist?.length || 0) : 0
        };
      }

      return stats;

    } catch (error) {
      console.error('FeatureFlagService.getFeatureFlagStats error:', error);
      return {};
    }
  }
}

export const featureFlagService = FeatureFlagService.getInstance();