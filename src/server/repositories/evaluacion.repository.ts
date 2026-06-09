import 'server-only';
import { db } from '@/lib/db';

// Capa de datos (Prisma puro) sobre el modelo evaluaciones.
// Aquí vive la calificación final del estudiante (no en proyectos).

export function buscarEvaluacion(idProyecto: string, idEstudiante: string, idEmpresario: string) {
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

export function upsertEvaluacion(datos: {
  idProyecto: string;
  idEstudiante: string;
  idEmpresario: string;
  puntuacion: number;
  comentario?: string | null;
}) {
  const where = {
    id_proyecto_id_estudiante_id_empresario: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      id_empresario: datos.idEmpresario,
    },
  };
  return db.evaluaciones.upsert({
    where,
    update: { puntuacion: datos.puntuacion, comentario: datos.comentario ?? null },
    create: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      id_empresario: datos.idEmpresario,
      puntuacion: datos.puntuacion,
      comentario: datos.comentario ?? null,
    },
  });
}
