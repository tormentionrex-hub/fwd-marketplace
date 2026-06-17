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


// Crea una notificación para un usuario. La consumen los flujos que generan
// avisos (solicitudes de mensaje, mensajes nuevos, etc.).
export function crearNotificacion(datos: { idUsuario: string; tipo: string; mensaje: string }) {
  return db.notificaciones.create({
    data: { id_usuario: datos.idUsuario, tipo: datos.tipo, mensaje: datos.mensaje },
    select: { id: true },
  });
}
