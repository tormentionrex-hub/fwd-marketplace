import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) sobre el modelo entregables.

export function listarEntregablesDeProyecto(idProyecto: string) {
  return db.entregables.findMany({
    where: { id_proyecto: idProyecto },
    orderBy: { creado: 'asc' },
  });
}

export function buscarEntregable(id: string) {
  return db.entregables.findUnique({ where: { id }, select: { id: true, id_proyecto: true } });
}

export async function aprobarEntregable(id: string) {
  await db.entregables.update({ where: { id }, data: { estado: 'aprobado' } });
}

export async function marcarCambiosEntregable(id: string) {
  // TODO: persistir el comentario del empresario cuando exista la columna
  // `comentario_empresario` en entregables (requiere migración — coordinar con el equipo).
  await db.entregables.update({ where: { id }, data: { estado: 'cambios_solicitados' } });
}

export async function existeFinalAprobado(idProyecto: string): Promise<boolean> {
  const e = await db.entregables.findFirst({
    where: { id_proyecto: idProyecto, tipo: 'final', estado: 'aprobado' },
    select: { id: true },
  });
  return e !== null;
}
