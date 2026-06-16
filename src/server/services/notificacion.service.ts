import 'server-only';
import {
  listarNotificacionesDeUsuario,
  contarNoLeidas,
  marcarTodasLeidas,
  marcarUnaLeida,
  crearNotificacion,
} from '@/server/repositories/notificacion.repository';
import { buscarProyectoGestion } from '@/server/repositories/proyecto.repository';
import { buscarUsuarioPorId } from '@/server/repositories/usuario.repository';
import type { NotificacionesPayload } from '@/types/notificacion';

// Lista las notificaciones del usuario + el contador de no leídas.
export async function obtenerNotificaciones(idUsuario: string): Promise<NotificacionesPayload> {
  const [filas, noLeidas] = await Promise.all([
    listarNotificacionesDeUsuario(idUsuario),
    contarNoLeidas(idUsuario),
  ]);

  return {
    notificaciones: filas.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      mensaje: n.mensaje,
      leida: n.leida,
      creado: n.creado.toISOString(),
    })),
    noLeidas,
  };
}

// Marca como leídas todas las notificaciones del usuario. Devuelve cuántas.
export async function marcarNotificacionesLeidas(idUsuario: string): Promise<number> {
  const r = await marcarTodasLeidas(idUsuario);
  return r.count;
}

// Marca UNA notificación como leída (la del usuario). Devuelve cuántas (0 o 1).
export async function marcarNotificacionLeida(
  idUsuario: string,
  idNotificacion: string,
): Promise<number> {
  const r = await marcarUnaLeida(idUsuario, idNotificacion);
  return r.count;
}

// ── Generación de notificaciones (efecto secundario de eventos) ─────────────
// Notifican al EMPRESARIO dueño del proyecto. Son tolerantes a fallos: si algo
// sale mal, lo registran y NO rompen el flujo principal (crear oferta/entrega).

async function notificarEventoEnProyecto(
  idProyecto: string,
  idEstudiante: string,
  tipo: string,
  construirMensaje: (nombreEstudiante: string, tituloProyecto: string) => string,
): Promise<void> {
  try {
    const [proyecto, estudiante] = await Promise.all([
      buscarProyectoGestion(idProyecto), // { id, titulo, estado, id_empresario }
      buscarUsuarioPorId(idEstudiante),
    ]);
    // id_empresario referencia al usuario del empresario (dueño) -> destinatario.
    if (!proyecto?.id_empresario) return;
    const nombre = estudiante?.nombre?.trim() || 'Un estudiante';
    await crearNotificacion(proyecto.id_empresario, tipo, construirMensaje(nombre, proyecto.titulo));
  } catch (e) {
    console.error('[notificacion] no se pudo generar la notificación', e);
  }
}

// Nueva oferta recibida en un proyecto -> avisa al empresario.
export function notificarOfertaRecibida(idProyecto: string, idEstudiante: string): Promise<void> {
  return notificarEventoEnProyecto(
    idProyecto,
    idEstudiante,
    'oferta',
    (nombre, titulo) => `Nueva oferta de ${nombre} en "${titulo}"`,
  );
}

// Nuevo entregable subido en un proyecto -> avisa al empresario.
export function notificarEntregaRecibida(idProyecto: string, idEstudiante: string): Promise<void> {
  return notificarEventoEnProyecto(
    idProyecto,
    idEstudiante,
    'entrega',
    (nombre, titulo) => `${nombre} subió una entrega en "${titulo}"`,
  );
}
