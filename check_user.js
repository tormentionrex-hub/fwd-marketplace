import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const user = await db.usuarios.findUnique({
    where: { correo: 'estudiante@fwd.cr' },
  });
  console.log('User found:', user);
}

main().finally(() => db.$disconnect());
