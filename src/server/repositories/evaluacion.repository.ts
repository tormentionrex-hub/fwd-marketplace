import 'server-only';
import { db } from '@/lib/db';

// Capa de datos: queries Prisma sobre el modelo evaluaciones (calificación final
// que el empresario le da al estudiante al cerrar el proyecto).

// Crea o actualiza la evaluación. La unique key compuesta del schema se expone
// en Prisma como id_proyecto_id_estudiante_id_empresario.
export function upsertEvaluacion(datos: {
  idProyecto: string;
  idEstudiante: string;
  idEmpresario: string;
  puntuacion: number;
  comentario?: string | null;
}) {
  return db.evaluaciones.upsert({
    where: {
      id_proyecto_id_estudiante_id_empresario: {
        id_proyecto: datos.idProyecto,
        id_estudiante: datos.idEstudiante,
        id_empresario: datos.idEmpresario,
      },
    },
    create: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      id_empresario: datos.idEmpresario,
      puntuacion: datos.puntuacion,
      comentario: datos.comentario ?? null,
    },
    update: {
      puntuacion: datos.puntuacion,
      comentario: datos.comentario ?? null,
    },
  });
}

// Promedio de puntuaciones recibidas por un estudiante (para recalcular reputación).
export async function promedioReputacion(idEstudiante: string): Promise<number> {
  const result = await db.evaluaciones.aggregate({
    where: { id_estudiante: idEstudiante },
    _avg: { puntuacion: true },
  });
  return Math.round(result._avg.puntuacion ?? 0);
}

// Busca la evaluación existente de un (proyecto, estudiante, empresario).
export function buscarEvaluacion(
  idProyecto: string,
  idEstudiante: string,
  idEmpresario: string,
) {
  return db.evaluaciones.findUnique({
    where: {
      id_proyecto_id_estudiante_id_empresario: {
        id_proyecto: idProyecto,
        id_estudiante: idEstudiante,
        id_empresario: idEmpresario,
      },
    },
  });
}
