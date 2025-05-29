const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://oxlbametpfubwnrmrbsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDYyMDE2NCwiZXhwIjoyMDU2MTk2MTY0fQ.IZzt64ThZ3fIT3kaeukLa_BcPoulQozfqMGl96bTW-8';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🚀 Starting DoctorMX database setup...');
    
    try {
        // Read the SQL schema file
        const sqlSchema = fs.readFileSync('./production-database-schema.sql', 'utf8');
        
        // Split SQL commands (basic approach - in production you'd want more sophisticated parsing)
        const commands = sqlSchema
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📝 Found ${commands.length} SQL commands to execute`);
        
        // Execute each command
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.includes('CREATE EXTENSION') || 
                command.includes('CREATE TABLE') || 
                command.includes('CREATE INDEX') || 
                command.includes('CREATE POLICY') ||
                command.includes('ALTER TABLE') ||
                command.includes('CREATE OR REPLACE FUNCTION') ||
                command.includes('CREATE TRIGGER') ||
                command.includes('INSERT INTO')) {
                
                console.log(`⏳ Executing command ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: command + ';'
                });
                
                if (error) {
                    console.warn(`⚠️  Command ${i + 1} warning:`, error.message);
                    // Continue with other commands even if some fail
                } else {
                    console.log(`✅ Command ${i + 1} executed successfully`);
                }
                
                // Small delay to avoid overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log('🎉 Database setup completed!');
        
        // Test the setup by checking if tables exist
        console.log('\n🔍 Verifying table creation...');
        
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', [
                'user_profiles', 
                'doctor_profiles', 
                'admin_users', 
                'family_members',
                'medical_history',
                'appointments',
                'prescriptions',
                'lab_results',
                'community_groups',
                'educational_content',
                'conversation_history'
            ]);
        
        if (tablesError) {
            console.error('❌ Error checking tables:', tablesError);
        } else {
            console.log('✅ Tables created:', tables.map(t => t.table_name).join(', '));
        }
        
        // Create initial admin user if auth.users allows it
        console.log('\n👤 Setting up initial data...');
        
        // Since we can't directly create auth users, let's just verify the schema
        const { data: userProfileSchema, error: schemaError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
        
        if (schemaError) {
            console.error('❌ User profiles table not accessible:', schemaError);
        } else {
            console.log('✅ User profiles table is accessible');
        }
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

// Alternative approach: Execute SQL directly using raw SQL
async function executeSQLDirect() {
    console.log('🔄 Trying direct SQL execution approach...');
    
    try {
        // Create user_profiles table
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: `
                -- Enable necessary extensions
                CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
                
                -- User profiles table
                CREATE TABLE IF NOT EXISTS public.user_profiles (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                    email TEXT NOT NULL,
                    full_name TEXT,
                    phone TEXT,
                    date_of_birth DATE,
                    gender TEXT CHECK (gender IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
                    blood_type TEXT,
                    emergency_contact_name TEXT,
                    emergency_contact_phone TEXT,
                    address JSONB,
                    preferences JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(auth_user_id),
                    UNIQUE(email)
                );
                
                -- Enable RLS
                ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
                
                -- Create policies
                CREATE POLICY "Users can view own profile" ON public.user_profiles
                    FOR SELECT USING (auth.uid() = auth_user_id);
                
                CREATE POLICY "Users can update own profile" ON public.user_profiles
                    FOR UPDATE USING (auth.uid() = auth_user_id);
                
                CREATE POLICY "Users can insert own profile" ON public.user_profiles
                    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
            `
        });
        
        if (error) {
            console.error('❌ Direct SQL execution failed:', error);
        } else {
            console.log('✅ Direct SQL execution successful');
        }
        
    } catch (error) {
        console.error('❌ Error in direct SQL execution:', error);
    }
}

// Run setup
if (require.main === module) {
    executeSQLDirect()
        .then(() => {
            console.log('🎉 Database setup process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupDatabase, executeSQLDirect };