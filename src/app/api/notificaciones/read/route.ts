import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  marcarNotificacionesLeidas,
  marcarNotificacionLeida,
} from '@/server/services/notificacion.service';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

// PATCH /api/notificaciones/read — marca notificaciones como leídas.
// Body opcional { id }: si viene, marca solo esa; si no, marca todas.
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  try {
    // Body opcional y tolerante: ausencia/JSON inválido => marcar todas.
    let id: string | undefined;
    try {
      const body = (await request.json()) as { id?: unknown } | null;
      if (body && typeof body.id === 'string' && body.id.trim()) id = body.id.trim();
    } catch {
      /* sin body: marcar todas */
    }

    const actualizadas = id
      ? await marcarNotificacionLeida(user.id, id)
      : await marcarNotificacionesLeidas(user.id);

    return NextResponse.json({ ok: true, actualizadas });
  } catch (e) {
    return errorInterno('notificaciones/read', e);
  }
}
