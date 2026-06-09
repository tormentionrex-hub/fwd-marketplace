import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { marcarNotificacionesLeidas } from '@/server/services/notificacion.service';

// PATCH /api/notificaciones/read — marca como leídas todas las del usuario.
export async function PATCH() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const actualizadas = await marcarNotificacionesLeidas(user.id);
  return NextResponse.json({ ok: true, actualizadas });
}
