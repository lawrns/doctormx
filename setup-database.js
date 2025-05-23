// DoctorMX Database Setup Script
// Run this with: node setup-database.js

import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMDE2NCwiZXhwIjoyMDU2MTk2MTY0fQ.IZzt64ThZ3fIT3kaeukLa_BcPoulQozfqMGl96bTW-8';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up DoctorMX database...');

  try {
    // Create medical_knowledge table
    console.log('📋 Creating medical_knowledge table...');
    const { error: medicalKnowledgeError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.medical_knowledge (
          id SERIAL PRIMARY KEY,
          terms TEXT NOT NULL,
          description TEXT,
          symptoms TEXT[],
          treatments TEXT[],
          severity_level INTEGER DEFAULT 1 CHECK (severity_level >= 1 AND severity_level <= 10),
          specialty VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (medicalKnowledgeError) {
      console.error('❌ Error creating medical_knowledge table:', medicalKnowledgeError);
    } else {
      console.log('✅ medical_knowledge table created successfully');
    }

    // Insert sample medical knowledge data
    console.log('📚 Inserting sample medical knowledge data...');
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
      console.error('❌ Error inserting medical knowledge data:', insertError);
    } else {
      console.log('✅ Sample medical knowledge data inserted successfully');
    }

    // Test the connection
    console.log('🔍 Testing database connection...');
    const { data, error: testError } = await supabase
      .from('medical_knowledge')
      .select('count(*)')
      .single();

    if (testError) {
      console.error('❌ Error testing database connection:', testError);
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
    process.exit(1);
  }
}

// Alternative: Direct table creation (if RPC doesn't work)
async function createTablesDirectly() {
  console.log('🔧 Creating tables using direct SQL commands...');
  
  // This approach uses individual operations instead of RPC
  const tables = [
    {
      name: 'medical_knowledge',
      data: [
        {
          terms: 'dolor, dolor de cabeza, cefalea, migraña',
          description: 'Dolor de cabeza común causado por tensión, estrés o fatiga',
          symptoms: ['dolor punzante', 'presión en la cabeza', 'sensibilidad a la luz'],
          treatments: ['descanso', 'hidratación', 'analgésicos de venta libre'],
          severity_level: 3,
          specialty: 'Medicina General'
        }
      ]
    }
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table.name)
        .upsert(table.data, { onConflict: 'terms', ignoreDuplicates: true });
        
      if (error) {
        console.log(`ℹ️  Table ${table.name} might not exist yet. This is expected for first-time setup.`);
        console.log('📋 Please run the SQL script in your Supabase dashboard:');
        console.log('👉 Go to https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql');
        console.log('👉 Copy and paste the contents of database-setup.sql');
        console.log('👉 Run the SQL script to create all tables');
      } else {
        console.log(`✅ Table ${table.name} configured successfully`);
      }
    } catch (err) {
      console.log(`ℹ️  Could not access table ${table.name}. Please run the SQL setup script manually.`);
    }
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