import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

async function checkEnums() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking enum types...\n');
    await client.connect();

    // Check license_status enum
    const licenseStatus = await client.query(`
      SELECT e.enumlabel as value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'license_status'
      ORDER BY e.enumsortorder;
    `);

    console.log('📋 LICENSE_STATUS ENUM VALUES:');
    licenseStatus.rows.forEach(row => {
      console.log(`  - ${row.value}`);
    });

    // Check role enum
    const roleEnum = await client.query(`
      SELECT e.enumlabel as value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'role'
      ORDER BY e.enumsortorder;
    `);

    console.log('\n📋 ROLE ENUM VALUES:');
    roleEnum.rows.forEach(row => {
      console.log(`  - ${row.value}`);
    });

    // Check gender enum
    const genderEnum = await client.query(`
      SELECT e.enumlabel as value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'gender'
      ORDER BY e.enumsortorder;
    `);

    console.log('\n📋 GENDER ENUM VALUES:');
    genderEnum.rows.forEach(row => {
      console.log(`  - ${row.value}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkEnums();
