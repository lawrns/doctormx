#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFeatureFlagsFix() {
  console.log('Creating feature flags using direct inserts...');

  try {
    // Since we can't execute DDL directly, let's just insert the feature flags
    // The table should already exist or we'll create it manually in the dashboard

    console.log('Inserting default feature flags...');

    const defaultFlags = [
      { flag_name: 'herb_database', enabled: true, description: 'Enable herb database and search functionality', rollout_percentage: 100 },
      { flag_name: 'root_cause_analysis', enabled: true, description: 'Enable enhanced root cause correlation engine', rollout_percentage: 50 },
      { flag_name: 'protocol_builder', enabled: false, description: 'Enable protocol generation and management', rollout_percentage: 0 },
      { flag_name: 'constitutional_analysis', enabled: false, description: 'Enable constitutional analysis features', rollout_percentage: 25 },
      { flag_name: 'red_flag_detection', enabled: true, description: 'Enable emergency red flag detection', rollout_percentage: 100 },
      { flag_name: 'image_analysis_v2', enabled: false, description: 'Enhanced image analysis with better prompts', rollout_percentage: 25 },
      { flag_name: 'progress_tracking', enabled: false, description: 'Enable treatment progress tracking', rollout_percentage: 0 },
      { flag_name: 'knowledge_graph', enabled: false, description: 'Enable medical knowledge graph features', rollout_percentage: 0 },
      { flag_name: 'expert_portal', enabled: false, description: 'Enable expert consultation portal', rollout_percentage: 0 },
      { flag_name: 'marketplace', enabled: false, description: 'Enable herb marketplace features', rollout_percentage: 0 },
      { flag_name: 'community', enabled: false, description: 'Enable community features', rollout_percentage: 0 },
      { flag_name: 'multilingual', enabled: false, description: 'Enable multilingual support', rollout_percentage: 0 }
    ];

    // Try to insert each flag individually
    for (const flag of defaultFlags) {
      try {
        const { error } = await supabase
          .from('feature_flags')
          .upsert(flag, { onConflict: 'flag_name' });

        if (error) {
          console.error(`Error inserting flag ${flag.flag_name}:`, error);
        } else {
          console.log(`Flag ${flag.flag_name} inserted/updated successfully`);
        }
      } catch (err) {
        console.error(`Exception inserting flag ${flag.flag_name}:`, err);
      }
    }

    // Test feature flags access
    console.log('\nTesting feature flags access...');
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Feature flags test failed:', error);
      console.log('This likely means the table does not exist. Please create it manually in the Supabase dashboard.');
    } else {
      console.log('Feature flags test successful:', data?.length || 0, 'flags found');
      if (data && data.length > 0) {
        console.log('Sample flags:', data.map(f => f.flag_name));
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyFeatureFlagsFix();
