import { supabase } from './supabase-client';

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try a simple query
    const { count, error } = await supabase
      .from('dentists')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase connection successful!');
    console.log('Current dentist count:', count);
    
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

// Run the test
testSupabase().catch(console.error);
