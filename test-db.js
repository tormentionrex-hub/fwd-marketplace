// Test de conexión a Supabase
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    // Intentar conectarse
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión exitosa a Supabase');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();
