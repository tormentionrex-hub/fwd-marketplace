import 'server-only';
import { db } from '@/lib/db';

// Capa de datos del flujo estudiante de postulaciones. Espeja oferta.repository.

// Datos mínimos de la vacante para validar que se puede postular.
export function buscarVacanteParaPostular(id: string) {
  return db.vacantes.findUnique({
    where: { id },
    select: { id: true, estado: true, fecha_cierre: true, id_empresario: true, titulo: true },
  });
}

// Busca si el estudiante ya se postuló a esta vacante (unique compuesto).
export function buscarPostulacionExistente(idVacante: string, idEstudiante: string) {
  return db.postulaciones.findUnique({
    where: {
      id_vacante_id_estudiante: { id_vacante: idVacante, id_estudiante: idEstudiante },
    },
    select: { id: true, estado: true, creado: true },
  });
}

// Crea la postulación en estado 'pendiente'.
export function crearPostulacion(data: {
  idVacante: string;
  idEstudiante: string;
  mensaje: string;
  cvUrl: string | null;
}) {
  return db.postulaciones.create({
    data: {
      id_vacante: data.idVacante,
      id_estudiante: data.idEstudiante,
      mensaje: data.mensaje,
      cv_url: data.cvUrl,
    },
    select: { id: true },
  });
}

// Lista las postulaciones de un estudiante con datos de la vacante y su empresa.
export function listarPostulacionesDeEstudiante(idEstudiante: string) {
  return db.postulaciones.findMany({
    where: { id_estudiante: idEstudiante },
    select: {
      id: true,
      estado: true,
      mensaje: true,
      creado: true,
      vacantes: {
        select: {
          id: true,
          titulo: true,
          area: true,
          modalidad: true,
          tipo_empleo: true,
          estado: true,
          perfiles_empresario: {
            select: {
              nombre_empresa: true,
              usuarios: { select: { nombre: true } },
            },
          },
        },
      },
    },
    orderBy: { creado: 'desc' },
  });
}

// Retira (borra) la postulación propia. Valida pertenencia por id_estudiante.
export async function retirarPostulacion(
  idPostulacion: string,
  idEstudiante: string,
): Promise<'ok' | 'no_encontrada' | 'no_autorizado' | 'ya_resuelta'> {
  const p = await db.postulaciones.findUnique({
    where: { id: idPostulacion },
    select: { id_estudiante: true, estado: true },
  });
  if (!p) return 'no_encontrada';
  if (p.id_estudiante !== idEstudiante) return 'no_autorizado';
  if (p.estado === 'aceptado') return 'ya_resuelta';
  await db.postulaciones.delete({ where: { id: idPostulacion } });
  return 'ok';
}
