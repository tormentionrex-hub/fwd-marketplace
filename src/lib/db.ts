import 'server-only';
import { PrismaClient } from '@prisma/client';

// Cliente único de Prisma (singleton). En desarrollo, Next recarga módulos en
// caliente y crearía muchas conexiones; por eso lo cacheamos en globalThis.
// Importá `db` SOLO desde código de servidor (src/server, src/app/api).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
