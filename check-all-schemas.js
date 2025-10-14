import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

async function checkAllSchemas() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const tables = ['consults', 'erx', 'referrals', 'appointments'];

    for (const table of tables) {
      const result = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      console.log(`\n📋 ${table.toUpperCase()} TABLE:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAllSchemas();
