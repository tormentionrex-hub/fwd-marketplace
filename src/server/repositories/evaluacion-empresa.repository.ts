import 'server-only';
import { db } from '@/lib/db';

export function buscarEvaluacionEmpresa(idProyecto: string, idEstudiante: string) {
  return db.evaluaciones_empresa.findUnique({
    where: {
      id_proyecto_id_estudiante: {
        id_proyecto: idProyecto,
        id_estudiante: idEstudiante,
      },
    },
    select: { puntuacion: true, comentario: true },
  });
}

export function upsertEvaluacionEmpresa(datos: {
  idProyecto: string;
  idEstudiante: string;
  idEmpresario: string;
  puntuacion: number;
  comentario: string;
}) {
  return db.evaluaciones_empresa.upsert({
    where: {
      id_proyecto_id_estudiante: {
        id_proyecto: datos.idProyecto,
        id_estudiante: datos.idEstudiante,
      },
    },
    create: {
      id_proyecto: datos.idProyecto,
      id_estudiante: datos.idEstudiante,
      id_empresario: datos.idEmpresario,
      puntuacion: datos.puntuacion,
      comentario: datos.comentario,
    },
    update: {
      puntuacion: datos.puntuacion,
      comentario: datos.comentario,
    },
  });
}

export async function promedioReputacionEmpresa(idEmpresario: string): Promise<number> {
  const result = await db.evaluaciones_empresa.aggregate({
    where: { id_empresario: idEmpresario },
    _avg: { puntuacion: true },
  });
  return Math.round(result._avg.puntuacion ?? 0);
}

export function listarEvaluacionesEmpresa(idEmpresario: string) {
  return db.evaluaciones_empresa.findMany({
    where: { id_empresario: idEmpresario },
    orderBy: { creado: 'desc' },
    select: {
      puntuacion: true,
      comentario: true,
      creado: true,
      perfiles_estudiante: {
        select: { usuarios: { select: { nombre: true } } },
      },
      proyectos: { select: { titulo: true } },
    },
  });
}
