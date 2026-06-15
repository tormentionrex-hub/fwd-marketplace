import 'server-only';
import { db } from '@/lib/db';

// Capa de datos de las solicitudes de mensaje (empresario -> estudiante).

export function crearSolicitud(datos: {
  idEmpresario: string;
  idEstudiante: string;
  idProyecto: string | null;
  asunto: string;
  mensaje: string;
}) {
  return db.solicitudes_mensaje.create({
    data: {
      id_empresario: datos.idEmpresario,
      id_estudiante: datos.idEstudiante,
      id_proyecto: datos.idProyecto,
      asunto: datos.asunto,
      mensaje: datos.mensaje,
    },
    select: { id: true },
  });
}

// Busca una solicitud PENDIENTE ya existente para el mismo trío
// (empresario, estudiante, proyecto). Evita duplicados mientras esté pendiente.
export function buscarSolicitudPendiente(
  idEmpresario: string,
  idEstudiante: string,
  idProyecto: string | null,
) {
  return db.solicitudes_mensaje.findFirst({
    where: {
      id_empresario: idEmpresario,
      id_estudiante: idEstudiante,
      id_proyecto: idProyecto,
      estado: 'pendiente',
    },
    select: { id: true },
  });
}

// Lista las solicitudes recibidas por un estudiante, con datos del empresario
// (nombre, foto, sector) y del proyecto relacionado.
export function listarSolicitudesDeEstudiante(idEstudiante: string) {
  return db.solicitudes_mensaje.findMany({
    where: { id_estudiante: idEstudiante },
    orderBy: { creado: 'desc' },
    select: {
      id: true,
      asunto: true,
      mensaje: true,
      estado: true,
      creado: true,
      perfiles_empresario: {
        select: {
          sector: true,
          usuarios: { select: { nombre: true, image_url: true } },
        },
      },
      proyectos: { select: { id: true, titulo: true } },
    },
  });
}

// Trae lo mínimo para validar pertenencia y resolver una solicitud.
export function buscarSolicitudPorId(id: string) {
  return db.solicitudes_mensaje.findUnique({
    where: { id },
    select: {
      id: true,
      id_empresario: true,
      id_estudiante: true,
      id_proyecto: true,
      estado: true,
      perfiles_estudiante: { select: { usuarios: { select: { nombre: true } } } },
    },
  });
}

export function actualizarEstadoSolicitud(id: string, estado: string) {
  return db.solicitudes_mensaje.update({
    where: { id },
    data: { estado, actualizado: new Date() },
    select: { id: true },
  });
}
