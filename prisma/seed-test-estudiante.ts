import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

// Script one-shot para crear un usuario estudiante de prueba.
// Eliminar este archivo y el usuario de BD cuando ya no se necesite.
// Ejecutar: npx tsx prisma/seed-test-estudiante.ts

const db = new PrismaClient();

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const correo = 'estudiante.prueba@fwd.cr';
  const password = 'TestFwd2026!';

  const rolEstudiante = await db.roles.findUnique({ where: { nombre: 'estudiante' } });
  if (!rolEstudiante) {
    throw new Error("No existe el rol 'estudiante' en la tabla roles.");
  }

  const usuario = await db.usuarios.upsert({
    where: { correo },
    update: {},
    create: {
      nombre: 'Estudiante Prueba',
      correo,
      hash_contrasena: hashPassword(password),
      id_rol: rolEstudiante.id,
      estado: 'activo',
      perfiles_estudiante: {
        create: {},
      },
    },
    select: { id: true, correo: true, estado: true },
  });

  console.log('Usuario de prueba listo:');
  console.log(`  Correo:     ${usuario.correo}`);
  console.log(`  Contrasena: ${password}`);
  console.log(`  Estado:     ${usuario.estado}`);
  console.log(`  ID:         ${usuario.id}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
