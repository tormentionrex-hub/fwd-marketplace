import 'server-only';
import {
  crearSolicitud,
  buscarSolicitudPendiente,
  listarSolicitudesDeEstudiante,
  listarSolicitudesDeEmpresario,
  listarSolicitudesDeUsuario,
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
  empresario: { id: string; nombre: string; fotoUrl: string | null; sector: string | null };
  proyecto: { id: string; titulo: string } | null;
}

export type ResultadoEnviarSolicitud = { ok: true; id: string } | 'duplicada';

export type ResultadoResponderSolicitud =
  | { ok: true; estado: 'aceptada' | 'rechazada' }
  | 'no_encontrada'
  | 'no_autorizado'
  | 'ya_resuelta';

// El empresario o estudiante envía una solicitud de contacto. Evita
// duplicar solicitudes pendientes y notifica al receptor.
export async function enviarSolicitud(datos: {
  idEmpresario: string;
  idEstudiante: string;
  idProyecto: string | null;
  asunto: string;
  mensaje: string;
  iniciador: string;
}): Promise<ResultadoEnviarSolicitud> {
  const duplicada = await buscarSolicitudPendiente(
    datos.idEmpresario,
    datos.idEstudiante,
    datos.idProyecto,
  );
  if (duplicada) return 'duplicada';

  const solicitud = await crearSolicitud({
    idEmpresario: datos.idEmpresario,
    idEstudiante: datos.idEstudiante,
    idProyecto: datos.idProyecto,
    asunto: datos.asunto,
    mensaje: datos.mensaje,
    iniciador: datos.iniciador,
  });

  if (datos.iniciador === 'empresario') {
    const empresario = await buscarUsuarioPorId(datos.idEmpresario);
    const nombreEmpresario = empresario?.nombre ?? 'Un empresario';
    await crearNotificacion({
      idUsuario: datos.idEstudiante,
      tipo: 'solicitud_mensaje',
      mensaje: `${nombreEmpresario} desea contactarte para hablar sobre una oportunidad laboral o proyecto.`,
    });
  } else {
    const estudiante = await buscarUsuarioPorId(datos.idEstudiante);
    const nombreEstudiante = estudiante?.nombre ?? 'Un estudiante';
    await crearNotificacion({
      idUsuario: datos.idEmpresario,
      tipo: 'solicitud_mensaje',
      mensaje: `${nombreEstudiante} desea iniciar una conversación contigo.`,
    });
  }

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
      id: s.id_empresario,
      nombre: s.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
      fotoUrl: s.perfiles_empresario?.usuarios?.image_url ?? null,
      sector: s.perfiles_empresario?.sector ?? null,
    },
    proyecto: s.proyectos ? { id: s.proyectos.id, titulo: s.proyectos.titulo } : null,
  }));
}

// Lista las solicitudes que recibió un empresario de parte de estudiantes.
export async function listarSolicitudesEmpresario(idEmpresario: string): Promise<SolicitudDTO[]> {
  const filas = await listarSolicitudesDeEmpresario(idEmpresario);
  return filas.map((s) => ({
    id: s.id,
    asunto: s.asunto,
    mensaje: s.mensaje,
    estado: s.estado,
    creado: s.creado.toISOString(),
    empresario: {
      id: s.id_estudiante,
      nombre: s.perfiles_estudiante?.usuarios?.nombre ?? 'Estudiante',
      fotoUrl: s.perfiles_estudiante?.usuarios?.image_url ?? null,
      sector: 'Estudiante',
    },
    proyecto: s.proyectos ? { id: s.proyectos.id, titulo: s.proyectos.titulo } : null,
  }));
}

// El destinatario (estudiante o empresario) acepta o rechaza una solicitud.
// Valida pertenencia y estado, y notifica al remitente el resultado.
export async function responderSolicitud(
  idUsuario: string,
  idSolicitud: string,
  accion: 'aceptar' | 'rechazar',
): Promise<ResultadoResponderSolicitud> {
  const solicitud = await buscarSolicitudPorId(idSolicitud);
  if (!solicitud) return 'no_encontrada';
  
  // Validar pertenencia según el rol iniciador
  const esDestinatarioEstudiante = solicitud.id_estudiante === idUsuario && solicitud.iniciador === 'empresario';
  const esDestinatarioEmpresario = solicitud.id_empresario === idUsuario && solicitud.iniciador === 'estudiante';
  
  if (!esDestinatarioEstudiante && !esDestinatarioEmpresario) {
    return 'no_autorizado';
  }
  
  if (solicitud.estado !== 'pendiente') return 'ya_resuelta';

  const nuevoEstado = accion === 'aceptar' ? 'aceptada' : 'rechazada';
  await actualizarEstadoSolicitud(idSolicitud, nuevoEstado);

  const nombreEstudiante = solicitud.perfiles_estudiante?.usuarios?.nombre ?? 'El estudiante';
  const idNotificar = solicitud.iniciador === 'empresario' ? solicitud.id_empresario : solicitud.id_estudiante;

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
    
    const mensajeNoti = solicitud.iniciador === 'empresario'
      ? `${nombreEstudiante} ha aceptado tu solicitud de contacto.`
      : `La empresa ha aceptado tu solicitud de contacto.`;
      
    await crearNotificacion({
      idUsuario: idNotificar,
      tipo: 'solicitud_aceptada',
      mensaje: mensajeNoti,
    });
  } else {
    const mensajeNoti = solicitud.iniciador === 'empresario'
      ? `${nombreEstudiante} no aceptó tu solicitud de contacto por ahora.`
      : `La empresa no aceptó tu solicitud de contacto por ahora.`;
      
    await crearNotificacion({
      idUsuario: idNotificar,
      tipo: 'solicitud_rechazada',
      mensaje: mensajeNoti,
    });
  }

  return { ok: true, estado: nuevoEstado };
}

export async function listarTodasLasSolicitudes(idUsuario: string) {
  const filas = await listarSolicitudesDeUsuario(idUsuario);
  
  const recibidas: SolicitudDTO[] = [];
  const enviadas: SolicitudDTO[] = [];
  
  for (const s of filas) {
    if (s.estado !== 'pendiente') continue;
    
    const esEstudiante = s.id_estudiante === idUsuario;
    const esEmpresario = s.id_empresario === idUsuario;
    
    // Tratar iniciador nulo o vacío como 'empresario' (default histórico del sistema)
    const iniciador = s.iniciador || 'empresario';
    
    const esRecibida = (esEstudiante && iniciador === 'empresario') || (esEmpresario && iniciador === 'estudiante');
    
    // El "otro" depende del punto de vista del usuario logueado
    const otroUsuario = esEstudiante
      ? {
          id: s.id_empresario,
          nombre: s.perfiles_empresario?.usuarios?.nombre ?? 'Empresa',
          fotoUrl: s.perfiles_empresario?.usuarios?.image_url ?? null,
          sector: s.perfiles_empresario?.sector ?? null,
        }
      : {
          id: s.id_estudiante,
          nombre: s.perfiles_estudiante?.usuarios?.nombre ?? 'Estudiante',
          fotoUrl: s.perfiles_estudiante?.usuarios?.image_url ?? null,
          sector: 'Estudiante',
        };
        
    const dto: SolicitudDTO = {
      id: s.id,
      asunto: s.asunto,
      mensaje: s.mensaje,
      estado: s.estado,
      creado: s.creado.toISOString(),
      empresario: otroUsuario,
      proyecto: s.proyectos ? { id: s.proyectos.id, titulo: s.proyectos.titulo } : null,
    };
    
    if (esRecibida) {
      recibidas.push(dto);
    } else {
      enviadas.push(dto);
    }
  }
  
  return { recibidas, enviadas };
}
