import 'server-only';
import { db } from '@/lib/db';

// Capa de datos de notificaciones. Todas las consultas se acotan por id_usuario
// (ownership): cada quien ve y modifica únicamente las suyas.

export function listarNotificacionesDeUsuario(idUsuario: string, limite = 20) {
  return db.notificaciones.findMany({
    where: { id_usuario: idUsuario },
    orderBy: { creado: 'desc' },
    take: limite,
    select: { id: true, tipo: true, mensaje: true, leida: true, creado: true },
  });
}

export function contarNoLeidas(idUsuario: string) {
  return db.notificaciones.count({
    where: { id_usuario: idUsuario, leida: false },
  });
}

export function marcarTodasLeidas(idUsuario: string) {
  return db.notificaciones.updateMany({
    where: { id_usuario: idUsuario, leida: false },
    data: { leida: true },
  });
}

// Marca UNA notificación como leída. Acota por id_usuario (ownership): un usuario
// no puede tocar las de otro aunque acierte el id.
export function marcarUnaLeida(idUsuario: string, idNotificacion: string) {
  return db.notificaciones.updateMany({
    where: { id: idNotificacion, id_usuario: idUsuario, leida: false },
    data: { leida: true },
  });
}

// Inserta una notificación para un usuario. La usan los services al ocurrir un
// evento (nueva oferta, entrega, etc.). `leida` y `creado` van por default.
export function crearNotificacion(d: { idUsuario: string; tipo: string; mensaje: string }) {
  return db.notificaciones.create({
    data: { id_usuario: d.idUsuario, tipo: d.tipo, mensaje: d.mensaje },
    select: { id: true },
  });
}
