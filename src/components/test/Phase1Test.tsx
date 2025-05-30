/**
 * Phase 1 Test Component - Verify herb database and enhanced features
 * Remove after testing is complete
 */

import React, { useState, useEffect } from 'react';
import { herbService } from '@svc/HerbService';
import { featureFlagService } from '@svc/FeatureFlagService';
import { redFlagDetectionService } from '@svc/RedFlagDetectionService';
import type { Herb, FeatureFlags } from '@pkg/types';

export default function Phase1Test() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Feature Flags
      results.push('🚩 Testing Feature Flags...');
      const featureFlags = await featureFlagService.getFeatureFlags();
      setFlags(featureFlags);
      results.push(`✅ Feature flags loaded: ${Object.keys(featureFlags).filter(k => featureFlags[k as keyof FeatureFlags]).length} enabled`);

      // Test 2: Herb Database
      results.push('🌿 Testing Herb Database...');
      const herbSearchResult = await herbService.searchHerbs({ query: 'dolor' });
      setHerbs(herbSearchResult.herbs);
      results.push(`✅ Herb search working: Found ${herbSearchResult.herbs.length} herbs`);

      // Test 3: Red Flag Detection
      results.push('🚨 Testing Red Flag Detection...');
      const redFlags = redFlagDetectionService.analyzeText('Tengo dolor de pecho severo y falta de aire');
      results.push(`✅ Red flag detection working: Found ${redFlags.length} flags`);
      if (redFlags.length > 0) {
        results.push(`   - First flag: ${redFlags[0].description}`);
      }

      // Test 4: Herb Recommendations
      results.push('💊 Testing Herb Recommendations...');
      const recommendations = await herbService.getRecommendationsForSymptoms(['dolor de cabeza', 'ansiedad']);
      results.push(`✅ Herb recommendations working: ${recommendations.primary.length} primary, ${recommendations.secondary.length} secondary`);

      setTestResults(results);
    } catch (error) {
      results.push(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(results);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🧪 Running Phase 1 Tests...</h3>
        <div className="animate-pulse">Testing enhanced features...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h3 className="text-xl font-bold text-gray-900">🧪 Phase 1 Integration Test Results</h3>
      
      {/* Test Results */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Test Log:</h4>
        <div className="space-y-1 text-sm font-mono">
          {testResults.map((result, index) => (
            <div key={index} className={
              result.includes('❌') ? 'text-red-600' :
              result.includes('✅') ? 'text-green-600' :
              result.includes('🚩') || result.includes('🌿') || result.includes('🚨') || result.includes('💊') ? 'text-blue-600 font-semibold' :
              'text-gray-600'
            }>
              {result}
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags Status */}
      {flags && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🚩 Feature Flags Status:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(flags).map(([key, enabled]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                <span className={enabled ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                  {enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Herbs */}
      {herbs.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🌿 Sample Herbs Found:</h4>
          <div className="space-y-2">
            {herbs.slice(0, 3).map((herb) => (
              <div key={herb.id} className="border border-green-200 rounded p-2">
                <div className="font-medium">{herb.commonNames[0] || herb.latinName}</div>
                <div className="text-sm text-gray-600">
                  Latin: {herb.latinName} | Evidence: {herb.evidence_grade}
                </div>
                <div className="text-xs text-gray-500">
                  Uses: {herb.traditionalUses.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">📋 Next Steps:</h4>
        <ul className="text-sm space-y-1">
          <li>• Test the enhanced AI doctor chat</li>
          <li>• Try typing "dolor de pecho" to trigger red flags</li>
          <li>• Search for herbs in the chat</li>
          <li>• Verify emergency detection works</li>
          <li>• Remove this test component before production</li>
        </ul>
      </div>

      <button 
        onClick={runTests}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        🔄 Run Tests Again
      </button>
    </div>
  );
}