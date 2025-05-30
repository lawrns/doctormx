/**
 * FeatureFlagAdmin - Admin interface for managing feature flags
 */

import React, { useState, useEffect } from 'react';
import { Settings, Toggle, Users, TrendingUp, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { featureFlagService } from '@svc/FeatureFlagService';
import { loggingService } from '@svc/LoggingService';

interface FeatureFlagData {
  flag_name: string;
  enabled: boolean;
  description: string;
  rollout_percentage: number;
  user_whitelist: string[];
  created_at: string;
  updated_at: string;
}

export default function FeatureFlagAdmin() {
  const [flags, setFlags] = useState<FeatureFlagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadFeatureFlags();
    loadStats();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      setLoading(true);
      const flagData = await featureFlagService.getAllFeatureFlags();
      setFlags(flagData);
      loggingService.info('FeatureFlagAdmin', 'Feature flags loaded', { count: flagData.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load feature flags';
      setError(errorMsg);
      loggingService.error('FeatureFlagAdmin', 'Failed to load feature flags', err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await featureFlagService.getFeatureFlagStats();
      setStats(statsData);
    } catch (err) {
      loggingService.warn('FeatureFlagAdmin', 'Failed to load stats', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const updateFlag = async (flagName: string, updates: Partial<FeatureFlagData>) => {
    try {
      setSaving(flagName);
      const success = await featureFlagService.updateFeatureFlag(flagName, updates);
      
      if (success) {
        setFlags(prev => prev.map(flag => 
          flag.flag_name === flagName 
            ? { ...flag, ...updates, updated_at: new Date().toISOString() }
            : flag
        ));
        
        loggingService.info('FeatureFlagAdmin', 'Feature flag updated', { flagName, updates });
        await loadStats(); // Refresh stats
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update feature flag';
      setError(errorMsg);
      loggingService.error('FeatureFlagAdmin', 'Failed to update feature flag', err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setSaving(null);
    }
  };

  const addUserToWhitelist = async (flagName: string, userId: string) => {
    if (!userId.trim()) return;
    
    try {
      const success = await featureFlagService.addUserToWhitelist(flagName, userId.trim());
      if (success) {
        await loadFeatureFlags(); // Refresh data
        loggingService.info('FeatureFlagAdmin', 'User added to whitelist', { flagName, userId });
      }
    } catch (err) {
      loggingService.error('FeatureFlagAdmin', 'Failed to add user to whitelist', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getStatusColor = (flag: FeatureFlagData) => {
    if (!flag.enabled) return 'text-gray-500';
    if (flag.rollout_percentage >= 100) return 'text-green-600';
    if (flag.rollout_percentage >= 50) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusText = (flag: FeatureFlagData) => {
    if (!flag.enabled) return 'Disabled';
    if (flag.rollout_percentage >= 100) return 'Fully Enabled';
    if (flag.rollout_percentage > 0) return `${flag.rollout_percentage}% Rollout`;
    return 'Whitelist Only';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading feature flags...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Feature Flag Management</h1>
        </div>
        <button
          onClick={() => { loadFeatureFlags(); loadStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 underline text-sm mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Toggle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Flags</p>
              <p className="text-xl font-semibold">{flags.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Enabled</p>
              <p className="text-xl font-semibold text-green-600">
                {flags.filter(f => f.enabled).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">In Rollout</p>
              <p className="text-xl font-semibold text-yellow-600">
                {flags.filter(f => f.enabled && f.rollout_percentage > 0 && f.rollout_percentage < 100).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Disabled</p>
              <p className="text-xl font-semibold text-gray-600">
                {flags.filter(f => !f.enabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {flags.map((flag) => (
            <div key={flag.flag_name} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {flag.flag_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className={`text-sm font-medium ${getStatusColor(flag)}`}>
                      {getStatusText(flag)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{flag.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Enable/Disable Toggle */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateFlag(flag.flag_name, { enabled: !flag.enabled })}
                          disabled={saving === flag.flag_name}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          } ${saving === flag.flag_name ? 'opacity-50' : ''}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              flag.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-600">
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Rollout Percentage */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Rollout Percentage ({flag.rollout_percentage}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rollout_percentage}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          updateFlag(flag.flag_name, { rollout_percentage: value });
                        }}
                        disabled={saving === flag.flag_name}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* User Whitelist */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Whitelist ({flag.user_whitelist?.length || 0} users)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="User ID to add"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            addUserToWhitelist(flag.flag_name, input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          addUserToWhitelist(flag.flag_name, input.value);
                          input.value = '';
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    
                    {flag.user_whitelist && flag.user_whitelist.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {flag.user_whitelist.slice(0, 5).map((userId, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {userId}
                          </span>
                        ))}
                        {flag.user_whitelist.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{flag.user_whitelist.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats for this flag */}
                  {stats[flag.flag_name] && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Estimated active users: ~{stats[flag.flag_name].estimatedActiveUsers}</p>
                      <p>Last updated: {new Date(flag.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {saving === flag.flag_name && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">How to Use Feature Flags</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Disabled:</strong> Feature is completely off for all users</li>
          <li>• <strong>Rollout %:</strong> Percentage of users who get the feature (based on consistent hashing)</li>
          <li>• <strong>Whitelist:</strong> Specific users who always get the feature regardless of rollout percentage</li>
          <li>• <strong>100% Rollout:</strong> Feature is enabled for all users</li>
        </ul>
      </div>
    </div>
  );
}