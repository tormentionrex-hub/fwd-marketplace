import 'server-only';
import {
  listarNotificacionesDeUsuario,
  contarNoLeidas,
  marcarTodasLeidas,
  marcarUnaLeida,
  crearNotificacion,
  crearNotificacionesEnLote,
} from '@/server/repositories/notificacion.repository';
import { buscarProyectoGestion } from '@/server/repositories/proyecto.repository';
import { buscarUsuarioPorId } from '@/server/repositories/usuario.repository';
import { listarEstudiantesConPreferencias } from '@/server/repositories/perfil-estudiante.repository';
import {
  cargarPreferencias,
  parsearPreferencias,
} from '@/server/services/preferencias-estudiante.service';
import type { NotificacionesPayload } from '@/types/notificacion';
import type { NotifPrefs } from '@/lib/empleabilidad';

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

// Crea una notificación para un ESTUDIANTE solo si su preferencia (notif) lo
// permite. Tolerante: nunca lanza (una notificación no debe romper el flujo
// principal). Si no se pueden leer las preferencias, se envía por defecto
// (fail-open, para no perder avisos por un error de lectura).
export async function crearNotificacionEstudiante(
  idEstudiante: string,
  prefKey: keyof NotifPrefs,
  datos: { tipo: string; mensaje: string },
): Promise<void> {
  try {
    let permitido = true;
    try {
      const { notif } = await cargarPreferencias(idEstudiante);
      permitido = notif[prefKey] !== false;
    } catch {
      permitido = true;
    }
    if (!permitido) return;
    await crearNotificacion({ idUsuario: idEstudiante, tipo: datos.tipo, mensaje: datos.mensaje });
  } catch (e) {
    console.error('[notificacion] no se pudo crear la notificación al estudiante', e);
  }
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
    await crearNotificacion({
      idUsuario: proyecto.id_empresario,
      tipo,
      mensaje: construirMensaje(nombre, proyecto.titulo),
    });
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

// ── Sugerencias de proyecto (al publicar) ───────────────────────────────────
const normalizar = (s: string) => s.trim().toLowerCase();

// Al publicarse un proyecto, avisa a los ESTUDIANTES cuyas preferencias (área o
// tecnologías) coinciden y que tienen activadas las "Sugerencias de proyectos"
// (notif.ofertas). Un solo insert en lote. Tolerante: nunca rompe el publicar.
export async function notificarProyectoConMatch(
  titulo: string,
  area: string | null,
  tecnologias: string[],
): Promise<void> {
  try {
    const areaN = area ? normalizar(area) : null;
    const techN = new Set(tecnologias.map(normalizar));
    if (!areaN && techN.size === 0) return; // sin señal para matchear

    const estudiantes = await listarEstudiantesConPreferencias();
    const destinatarios: string[] = [];
    for (const est of estudiantes) {
      const { empleabilidad, notif } = parsearPreferencias(est.preferencias);
      if (notif.ofertas === false) continue; // desactivó las sugerencias
      const matchArea = areaN ? empleabilidad.areas.some((a) => normalizar(a) === areaN) : false;
      const matchTech = empleabilidad.tecnologias.some((t) => techN.has(normalizar(t)));
      if (matchArea || matchTech) destinatarios.push(est.id_usuario);
    }
    if (destinatarios.length === 0) return;

    await crearNotificacionesEnLote(
      destinatarios,
      'sugerencia_proyecto',
      `Nuevo proyecto que encaja con vos: "${titulo}"`,
    );
  } catch (e) {
    console.error('[notificacion] notificarProyectoConMatch falló', e);
  }
}
