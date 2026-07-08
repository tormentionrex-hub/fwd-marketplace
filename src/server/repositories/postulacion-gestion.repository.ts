import 'server-only';
import { db } from '@/lib/db';

// Capa de datos del flujo empresario (gestión de postulantes de una vacante).
// Separado de postulacion.repository para no acoplar el flujo de envío.

// Lista las postulaciones de una vacante con los datos del estudiante.
export function listarPostulacionesDeVacante(idVacante: string) {
  return db.postulaciones.findMany({
    where: { id_vacante: idVacante },
    select: {
      id: true,
      estado: true,
      mensaje: true,
      cv_url: true,
      creado: true,
      perfiles_estudiante: {
        select: {
          id_usuario: true,
          titulo_profesional: true,
          usuarios: { select: { nombre: true, image_url: true } },
        },
      },
    },
    orderBy: { creado: 'desc' },
  });
}

// Trae la postulación con el dueño (empresario) de su vacante, para validar acceso.
export function buscarPostulacionConVacante(id: string) {
  return db.postulaciones.findUnique({
    where: { id },
    select: {
      id: true,
      id_vacante: true,
      id_estudiante: true,
      vacantes: { select: { id_empresario: true, titulo: true } },
    },
  });
}

// Cambia el estado de una postulación (pendiente/en_revision/aceptado/rechazado).
export function actualizarEstadoPostulacion(id: string, estado: string) {
  return db.postulaciones.update({
    where: { id },
    data: { estado, actualizado: new Date() },
    select: { id: true },
  });
}
