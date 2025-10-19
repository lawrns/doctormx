import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEnum() {
  console.log('Testing enum values...');
  
  // Test patient role
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: 'test.patient@test.com',
        name: 'Test Patient',
        phone: '+525512345678',
        role: 'patient',
        whatsapp_optin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Patient role error:', error);
    } else {
      console.log('✅ Patient role works');
    }
  } catch (err) {
    console.error('Patient role exception:', err);
  }

  // Test doctor role
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: 'test.doctor@test.com',
        name: 'Test Doctor',
        phone: '+525512345679',
        role: 'doctor',
        whatsapp_optin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Doctor role error:', error);
    } else {
      console.log('✅ Doctor role works');
    }
  } catch (err) {
    console.error('Doctor role exception:', err);
  }

  // Test admin role
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: 'test.admin@test.com',
        name: 'Test Admin',
        phone: '+525512345680',
        role: 'admin',
        whatsapp_optin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Admin role error:', error);
    } else {
      console.log('✅ Admin role works');
    }
  } catch (err) {
    console.error('Admin role exception:', err);
  }

  // Test pharmacy role
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: 'test.pharmacy@test.com',
        name: 'Test Pharmacy',
        phone: '+525512345681',
        role: 'pharmacy',
        whatsapp_optin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Pharmacy role error:', error);
    } else {
      console.log('✅ Pharmacy role works');
    }
  } catch (err) {
    console.error('Pharmacy role exception:', err);
  }
}

testEnum().catch(console.error);

