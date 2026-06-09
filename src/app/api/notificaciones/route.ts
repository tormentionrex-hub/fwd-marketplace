import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { obtenerNotificaciones } from '@/server/services/notificacion.service';

// GET /api/notificaciones — notificaciones del usuario autenticado + nº no leídas.
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const data = await obtenerNotificaciones(user.id);
  return NextResponse.json(data);
}
