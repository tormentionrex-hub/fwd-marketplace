import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { marcarNotificacionesLeidas } from '@/server/services/notificacion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// PATCH /api/notificaciones/read — marca como leídas todas las del usuario.
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  try {
    const actualizadas = await marcarNotificacionesLeidas(user.id);
    return NextResponse.json({ ok: true, actualizadas });
  } catch (e) {
    return errorInterno('notificaciones/read', e);
  }
}
