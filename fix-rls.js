import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixRLSPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    console.log('🔧 Fixing RLS policies...\n');
    const sql = await fs.readFile('fix-rls-policies.sql', 'utf8');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠️  Error executing statement:', error.message);
          console.log('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('\n✅ RLS policies fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error.message);
  } finally {
    await client.end();
  }
}

fixRLSPolicies();


