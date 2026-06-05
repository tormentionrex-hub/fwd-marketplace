// Test simple sin Prisma
require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Conexión exitosa a Supabase');
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Hora en BD:', result.rows[0].now);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

test();
