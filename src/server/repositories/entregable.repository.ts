import 'server-only';
import { db } from '@/lib/db';

// Capa de datos: queries Prisma sobre el modelo entregables. Solo lee/escribe;
// la lógica de negocio vive en los services.

// Lista los entregables de un proyecto, del más antiguo al más nuevo.
export function listarEntregablesDeProyecto(idProyecto: string) {
  return db.entregables.findMany({
    where: { id_proyecto: idProyecto },
    orderBy: { creado: 'asc' },
  });
}

// Calcula la próxima versión para un (proyecto, estudiante, tipo). Si no hay
// previos devuelve 1. `tipo` puede ser null (la columna es opcional en la DB).
export async function siguienteVersion(
  idProyecto: string,
  idEstudiante: string,
  tipo: string | null,
): Promise<number> {
  const ultimo = await db.entregables.findFirst({
    where: { id_proyecto: idProyecto, id_estudiante: idEstudiante, tipo },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  return (ultimo?.version ?? 0) + 1;
}

// Crea un entregable. El estado usa el default 'enviado' del schema.
export function crearEntregable(datos: {
  idProyecto: string;
  idEstudiante: string;
  tipo: string | null;
  version: number;
  archivoUrl: string;
}) {
  return db.entregables.create({
    data: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      tipo: datos.tipo,
      version: datos.version,
      archivo_url: datos.archivoUrl,
    },
    select: { id: true },
  });
}

// Trae un entregable con el dueño del proyecto, para validar pertenencia en el
// service sin una segunda query.
export function buscarEntregable(id: string) {
  return db.entregables.findUnique({
    where: { id },
    select: {
      id: true,
      estado: true,
      id_proyecto: true,
      proyectos: { select: { id_empresario: true } },
    },
  });
}

// Aprueba un entregable y limpia el comentario previo de "cambios solicitados".
export function aprobarEntregable(id: string) {
  return db.entregables.update({
    where: { id },
    data: { estado: 'aprobado', comentario_empresario: null },
  });
}

// Marca un entregable con cambios solicitados y guarda el comentario del empresario.
export function solicitarCambiosEntregable(id: string, comentario: string) {
  return db.entregables.update({
    where: { id },
    data: { estado: 'cambios_solicitados', comentario_empresario: comentario },
  });
}

// Variante usada por gestion.service (Página 14): marca cambios sin comentario.
export async function marcarCambiosEntregable(id: string) {
  await db.entregables.update({
    where: { id },
    data: { estado: 'cambios_solicitados' },
  });
}

// True si el proyecto ya tiene un entregable final aprobado (requisito para cerrar).
export async function existeFinalAprobado(idProyecto: string): Promise<boolean> {
  const e = await db.entregables.findFirst({
    where: { id_proyecto: idProyecto, tipo: 'final', estado: 'aprobado' },
    select: { id: true },
  });
  return e !== null;
}
