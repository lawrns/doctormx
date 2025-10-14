import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';

dotenv.config();

const { Client } = pg;

async function setupRLS() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔐 Setting up Row Level Security policies...\n');
    await client.connect();

    const sql = fs.readFileSync('setup-rls-minimal.sql', 'utf8');

    await client.query(sql);

    console.log('\n✅ RLS policies set up successfully!');
    console.log('🔒 All tables now have proper security policies');
    console.log('🎉 Authentication should now work correctly!');

  } catch (error) {
    console.error('❌ Error setting up RLS:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

setupRLS();
