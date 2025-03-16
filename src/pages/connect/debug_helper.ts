import { SupabaseClient } from '@supabase/supabase-js';

// A utility function to log the structure of the doctors table
export const debugDoctorsTable = async (supabase: SupabaseClient) => {
  try {
    // Get table information
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_definition', {
      table_name: 'doctors'
    });
    
    if (tableError) {
      console.error('Error fetching table definition:', tableError);
      return;
    }
    
    console.log('Doctors table definition:', tableInfo);
    
    // Try to get RLS policies
    const { data: rlsPolicies, error: rlsError } = await supabase.rpc('get_policies', {
      table_name: 'doctors'
    });
    
    if (rlsError) {
      console.error('Error fetching RLS policies:', rlsError);
    } else {
      console.log('Doctors table RLS policies:', rlsPolicies);
    }
    
    // Check if the insert works directly
    const testUser = {
      name: 'Test Doctor',
      specialty: 'Test Specialty',
      user_id: 'test-user-id',
      email: 'test@example.com'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('doctors')
      .insert(testUser)
      .select();
    
    if (insertError) {
      console.error('Test insert error:', insertError);
    } else {
      console.log('Test insert successful:', insertResult);
      
      // Clean up test data
      if (insertResult && insertResult.length > 0) {
        await supabase
          .from('doctors')
          .delete()
          .eq('id', insertResult[0].id);
      }
    }
  } catch (error) {
    console.error('Debug helper error:', error);
  }
};

// Function to test if the RLS policy was correctly applied
export const testDoctorsRlsPolicy = async (supabase: SupabaseClient) => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return;
    }
    
    console.log('Current user:', userData);
    
    // Try an insert with minimal data
    const minimalDoctorData = {
      name: 'Test Doctor',
      specialty: 'Test Specialty',
      user_id: userData.user?.id
    };
    
    console.log('Attempting insert with minimal data:', minimalDoctorData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('doctors')
      .insert(minimalDoctorData)
      .select();
    
    if (insertError) {
      console.error('Minimal insert error:', insertError);
    } else {
      console.log('Minimal insert successful:', insertResult);
      
      // Clean up test data
      if (insertResult && insertResult.length > 0) {
        await supabase
          .from('doctors')
          .delete()
          .eq('id', insertResult[0].id);
      }
    }
  } catch (error) {
    console.error('RLS test error:', error);
  }
};
