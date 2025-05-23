// DoctorMX Database Setup Script
// Run this with: node setup-database.js

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMDE2NCwiZXhwIjoyMDU2MTk2MTY0fQ.IZzt64ThZ3fIT3kaeukLa_BcPoulQozfqMGl96bTW-8';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up DoctorMX database...');

  try {
    // Test basic connection first
    console.log('🔍 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_non_existent_table_test_')
      .select('*')
      .limit(1);

    // We expect this to fail, but it should fail with a "relation does not exist" error
    // If we get a different error, there might be an authentication issue
    if (connectionError && !connectionError.message.includes('does not exist')) {
      console.error('❌ Connection test failed. Possible authentication issue:', connectionError);
      throw connectionError;
    } else {
      console.log('✅ Basic connection successful');
    }

    // Insert sample medical knowledge data directly (table might already exist)
    console.log('📚 Attempting to insert sample medical knowledge data...');
    const { error: insertError } = await supabase
      .from('medical_knowledge')
      .upsert([
        {
          terms: 'dolor, dolor de cabeza, cefalea, migraña',
          description: 'Dolor de cabeza común que puede ser causado por tensión, estrés, fatiga o problemas de visión',
          symptoms: ['dolor punzante', 'presión en la cabeza', 'sensibilidad a la luz', 'náuseas'],
          treatments: ['descanso', 'hidratación', 'analgésicos de venta libre', 'compresas frías'],
          severity_level: 3,
          specialty: 'Medicina General'
        },
        {
          terms: 'fiebre, temperatura alta, calentura',
          description: 'Elevación de la temperatura corporal como respuesta del sistema inmune a infecciones',
          symptoms: ['temperatura mayor a 38°C', 'escalofríos', 'sudoración', 'malestar general'],
          treatments: ['reposo', 'hidratación abundante', 'antipiréticos', 'monitoreo de temperatura'],
          severity_level: 5,
          specialty: 'Medicina General'
        },
        {
          terms: 'tos, tos seca, tos con flema',
          description: 'Reflejo natural para limpiar las vías respiratorias de irritantes o secreciones',
          symptoms: ['irritación en garganta', 'expectoración', 'dificultad respiratoria'],
          treatments: ['hidratación', 'miel', 'antitusivos', 'evitar irritantes'],
          severity_level: 3,
          specialty: 'Neumología'
        },
        {
          terms: 'náusea, vómito, nauseas',
          description: 'Sensación de malestar estomacal que puede preceder al vómito',
          symptoms: ['malestar estomacal', 'mareo', 'pérdida de apetito', 'salivación excesiva'],
          treatments: ['dieta blanda', 'hidratación', 'antieméticos', 'reposo'],
          severity_level: 4,
          specialty: 'Gastroenterología'
        }
      ], 
      { 
        onConflict: 'terms',
        ignoreDuplicates: true 
      });

    if (insertError) {
      if (insertError.message?.includes('does not exist')) {
        console.log('ℹ️  medical_knowledge table does not exist yet.');
        console.log('📋 Please run the SQL script manually in your Supabase dashboard:');
        console.log('👉 Go to: https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql');
        console.log('👉 Copy and paste the contents of database-setup.sql');
        console.log('👉 Run the SQL script to create all tables');
        console.log('👉 Then run this setup script again');
        return;
      } else {
        console.error('❌ Error inserting medical knowledge data:', insertError);
        throw insertError;
      }
    } else {
      console.log('✅ Sample medical knowledge data inserted/updated successfully');
    }

    // Test the final connection
    console.log('🔍 Testing final database connection...');
    const { data, error: testError } = await supabase
      .from('medical_knowledge')
      .select('count(*)')
      .single();

    if (testError) {
      console.error('❌ Error in final test:', testError);
      throw testError;
    } else {
      console.log(`✅ Database connection successful! Found ${data.count} medical knowledge entries`);
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. The database is now configured with the correct Supabase credentials');
    console.log('2. Run "npm run dev" to start the development server');
    console.log('3. The AI doctor should now work without 404 errors');

  } catch (error) {
    console.error('💥 Fatal error during database setup:', error);
    console.log('\n🆘 Fallback Instructions:');
    console.log('Since automatic setup failed, please follow these manual steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql');
    console.log('2. Copy the entire contents of database-setup.sql');
    console.log('3. Paste and run it in the SQL Editor');
    console.log('4. Verify tables are created in the Table Editor');
    process.exit(1);
  }
}

// Alternative: Direct table creation (if RPC doesn't work)
async function createTablesDirectly() {
  console.log('🔧 Attempting direct table operations...');
  
  try {
    // Test if we can at least query existing tables
    const { data, error } = await supabase
      .from('medical_knowledge')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.log(`ℹ️  Table medical_knowledge might not exist yet. This is expected for first-time setup.`);
      console.log('📋 Please run the SQL script in your Supabase dashboard:');
      console.log('👉 Go to https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql');
      console.log('👉 Copy and paste the contents of database-setup.sql');
      console.log('👉 Run the SQL script to create all tables');
    } else {
      console.log(`✅ Table medical_knowledge exists with ${data[0]?.count || 0} entries`);
    }
  } catch (err) {
    console.log(`ℹ️  Could not access database. Please run the SQL setup script manually.`);
    console.log('Error details:', err.message);
  }
}

// Run setup
console.log('🏥 DoctorMX Database Setup');
console.log('==========================');

setupDatabase()
  .then(() => {
    console.log('✨ Setup process completed!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.log('⚠️  Primary setup method failed, trying alternative approach...');
    await createTablesDirectly();
    process.exit(0);
  }); 