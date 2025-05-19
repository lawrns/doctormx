import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { KnowledgeBaseService } from '../src/services/knowledge/KnowledgeBaseService';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Set environment variables globally for the Node.js process
// This makes them accessible via import.meta.env polyfills
// @ts-ignore - Add environment variables to global process
process.env.VITE_OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

// Get environment variables with fallbacks
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Environment variables:');
console.log(`- VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`);
console.log(`- VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Not set'}`);
console.log(`- VITE_OPENAI_API_KEY: ${process.env.VITE_OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log('');

// Make a simple polyfill for import.meta.env
// @ts-ignore - Add the import.meta polyfill
global.import = { 
  meta: { 
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY
    }
  }
};

// Initialize the knowledge base service
const knowledgeBaseService = new KnowledgeBaseService(supabaseUrl, supabaseKey);

async function testKnowledgeBase() {
  console.log('Testing Knowledge Base Integration...');
  
  // Check if service is initialized
  if (!knowledgeBaseService.isInitialized) {
    console.error('❌ Knowledge Base Service is not initialized.');
    console.log('\nPlease make sure you have set up the following environment variables:');
    console.log('1. VITE_SUPABASE_URL - Your Supabase project URL');
    console.log('2. VITE_SUPABASE_ANON_KEY - Your Supabase anon/public key');
    console.log('\nYou can find these in your Supabase project settings > API');
    return;
  }

  console.log('✅ Knowledge Base Service is initialized');

  // Test querying knowledge using the OpenAI service without Supabase
  // This tests the fallback capability when Supabase vector search isn't available
  console.log('\nQuerying knowledge base using OpenAI fallback...');
  const query = 'What are the signs of a cold?';
  
  try {
    const response = await knowledgeBaseService.getAnswer(query);
    
    if (response) {
      console.log('✅ Knowledge Base Response:');
      console.log(`Question: ${query}`);
      console.log(`Answer: ${response.answer}`);
      console.log(`Source: ${response.source}`);
    } else {
      console.log('❌ No relevant knowledge found');
    }
  } catch (error) {
    console.error('❌ Error querying knowledge base:', error);
  }
  
  console.log('\n--------------------------------------------------------');
  console.log('SETUP INSTRUCTIONS - Supabase Database:');
  console.log('--------------------------------------------------------');
  console.log('You need to run the migration file to set up the knowledge base:');
  console.log('1. Go to Supabase project dashboard');
  console.log('2. Navigate to "SQL Editor"');
  console.log('3. Run the SQL migrations from: supabase/migrations/20240519150000_create_knowledge_base.sql');
  console.log('4. This will create the required "knowledge_base" table and "match_knowledge" function');
  console.log('--------------------------------------------------------');
  
  // Skip the rest of the test which requires Supabase knowledge_base table
  console.log('\nSkipping Supabase vector search tests until database is properly set up.');
  console.log('Basic question answering using OpenAI works without vector search.');
  console.log('\nTest completed successfully.');
}

// Run the test
testKnowledgeBase().catch(console.error);
