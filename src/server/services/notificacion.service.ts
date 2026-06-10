import 'server-only';
import {
  listarNotificacionesDeUsuario,
  contarNoLeidas,
  marcarTodasLeidas,
} from '@/server/repositories/notificacion.repository';
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
