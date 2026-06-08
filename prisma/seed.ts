import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

// Seed: crea la cuenta admin directamente en la BD. Idempotente (upsert).
// El hash usa el MISMO algoritmo que src/server/auth/password.ts (scrypt,
// formato salt:hash) — reimplementado inline porque ese módulo es 'server-only'
// y no se puede importar fuera de Next.

const db = new PrismaClient();

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const correo = 'admin@fwd.cr';

  const rolAdmin = await db.roles.findUnique({ where: { nombre: 'admin' } });
  if (!rolAdmin) {
    throw new Error("No existe el rol 'admin' en la tabla roles.");
  }

  const admin = await db.usuarios.upsert({
    where: { correo },
    update: {},
    create: {
      nombre: 'Administrador FWD',
      correo,
      hash_contrasena: hashPassword('FwdAdmin2026!'),
      id_rol: rolAdmin.id,
    },
    select: { id: true, correo: true },
  });

  console.log(`Cuenta admin lista: ${admin.correo} (id ${admin.id})`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
