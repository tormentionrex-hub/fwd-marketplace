import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { obtenerNotificaciones } from '@/server/services/notificacion.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/notificaciones — notificaciones del usuario autenticado + nº no leídas.
export async function GET() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  try {
    const data = await obtenerNotificaciones(user.id);
    return NextResponse.json(data);
  } catch (e) {
    return errorInterno('notificaciones/GET', e);
  }
}
