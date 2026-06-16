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

  // --- Seed Estudiante ---
  const rolEstudiante = await db.roles.findUnique({ where: { nombre: 'estudiante' } });
  if (rolEstudiante) {
    const estudiante = await db.usuarios.upsert({
      where: { correo: 'estudiante@fwd.cr' },
      update: {},
      create: {
        nombre: 'Estudiante Prueba',
        correo: 'estudiante@fwd.cr',
        hash_contrasena: hashPassword('TestPassword123!'),
        id_rol: rolEstudiante.id,
        estado: 'activo',
        perfiles_estudiante: {
          create: {},
        },
      },
      select: { id: true, correo: true },
    });
    console.log(`Cuenta estudiante lista: ${estudiante.correo} (id ${estudiante.id})`);
  }

  // --- Seed Empresario ---
  const rolEmpresario = await db.roles.findUnique({ where: { nombre: 'empresario' } });
  if (rolEmpresario) {
    const empresario = await db.usuarios.upsert({
      where: { correo: 'empresario@fwd.cr' },
      update: {},
      create: {
        nombre: 'Empresario Prueba',
        correo: 'empresario@fwd.cr',
        hash_contrasena: hashPassword('TestPassword123!'),
        id_rol: rolEmpresario.id,
        estado: 'activo',
        perfiles_empresario: {
          create: {
            nombre_empresa: 'Empresa Test S.A.',
          },
        },
      },
      select: { id: true, correo: true },
    });
    console.log(`Cuenta empresario lista: ${empresario.correo} (id ${empresario.id})`);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
