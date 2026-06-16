import 'server-only';
import {
  crearSolicitud,
  buscarSolicitudPendiente,
  listarSolicitudesDeEstudiante,
  buscarSolicitudPorId,
  actualizarEstadoSolicitud,
} from '@/server/repositories/solicitud-mensaje.repository';
import { crearNotificacion } from '@/server/repositories/notificacion.repository';
import { buscarUsuarioPorId } from '@/server/repositories/usuario.repository';
import { buscarChatEntre, crearChat } from '@/server/repositories/chat.repository';

export interface SolicitudDTO {
  id: string;
  asunto: string;
  mensaje: string;
  estado: string;
  creado: string;
  empresario: { nombre: string; fotoUrl: string | null; sector: string | null };
  proyecto: { id: string; titulo: string } | null;
}

export type ResultadoEnviarSolicitud = { ok: true; id: string } | 'duplicada';

export type ResultadoResponderSolicitud =
  | { ok: true; estado: 'aceptada' | 'rechazada' }
  | 'no_encontrada'
  | 'no_autorizado'
  | 'ya_resuelta';

// El empresario envía una solicitud de contacto a un estudiante. Evita
// duplicar solicitudes pendientes y notifica al estudiante.
export async function enviarSolicitud(datos: {
  idEmpresario: string;
  idEstudiante: string;
  idProyecto: string | null;
  asunto: string;
  mensaje: string;
}): Promise<ResultadoEnviarSolicitud> {
  const duplicada = await buscarSolicitudPendiente(
    datos.idEmpresario,
    datos.idEstudiante,
    datos.idProyecto,
  );
  if (duplicada) return 'duplicada';

  const solicitud = await crearSolicitud(datos);

  const empresario = await buscarUsuarioPorId(datos.idEmpresario);
  const nombreEmpresario = empresario?.nombre ?? 'Un empresario';
  await crearNotificacion({
    idUsuario: datos.idEstudiante,
    tipo: 'solicitud_mensaje',
    mensaje: `${nombreEmpresario} desea contactarte para hablar sobre una oportunidad laboral o proyecto.`,
  });

  return { ok: true, id: solicitud.id };
}

// Lista las solicitudes que recibió un estudiante (centro de solicitudes).
export async function listarSolicitudesEstudiante(idEstudiante: string): Promise<SolicitudDTO[]> {
  const filas = await listarSolicitudesDeEstudiante(idEstudiante);
  return filas.map((s) => ({
    id: s.id,
    asunto: s.asunto,
    mensaje: s.mensaje,
    estado: s.estado,
    creado: s.creado.toISOString(),
    empresario: {
      nombre: s.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
      fotoUrl: s.perfiles_empresario?.usuarios?.image_url ?? null,
      sector: s.perfiles_empresario?.sector ?? null,
    },
    proyecto: s.proyectos ? { id: s.proyectos.id, titulo: s.proyectos.titulo } : null,
  }));
}

// El estudiante acepta o rechaza una solicitud. Valida pertenencia y estado,
// y notifica al empresario el resultado.
export async function responderSolicitud(
  idEstudiante: string,
  idSolicitud: string,
  accion: 'aceptar' | 'rechazar',
): Promise<ResultadoResponderSolicitud> {
  const solicitud = await buscarSolicitudPorId(idSolicitud);
  if (!solicitud) return 'no_encontrada';
  if (solicitud.id_estudiante !== idEstudiante) return 'no_autorizado';
  if (solicitud.estado !== 'pendiente') return 'ya_resuelta';

  const nuevoEstado = accion === 'aceptar' ? 'aceptada' : 'rechazada';
  await actualizarEstadoSolicitud(idSolicitud, nuevoEstado);

  const nombreEstudiante = solicitud.perfiles_estudiante?.usuarios?.nombre ?? 'El estudiante';
  if (accion === 'aceptar') {
    // Habilita la conversación: crea el chat si aún no existe.
    const existente = await buscarChatEntre(
      solicitud.id_proyecto,
      solicitud.id_estudiante,
      solicitud.id_empresario,
    );
    if (!existente) {
      await crearChat(solicitud.id_proyecto, solicitud.id_estudiante, solicitud.id_empresario);
    }
    await crearNotificacion({
      idUsuario: solicitud.id_empresario,
      tipo: 'solicitud_aceptada',
      mensaje: `${nombreEstudiante} ha aceptado tu solicitud de contacto.`,
    });
  } else {
    await crearNotificacion({
      idUsuario: solicitud.id_empresario,
      tipo: 'solicitud_rechazada',
      mensaje: `${nombreEstudiante} no aceptó tu solicitud de contacto por ahora.`,
    });
  }

  return { ok: true, estado: nuevoEstado };
}
