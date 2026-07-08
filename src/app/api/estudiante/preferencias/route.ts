import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  guardarEmpleabilidad,
  guardarNotif,
  guardarPriv,
  guardarConexiones,
} from '@/server/services/preferencias-estudiante.service';
import { error, errorInterno } from '@/server/http/responder';

// PATCH /api/estudiante/preferencias — guarda cualquiera de las secciones de
// preferencias del estudiante. Body: { empleabilidad?, notif?, priv?, conexiones? }.
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  try {
    const b = (body ?? {}) as {
      empleabilidad?: unknown;
      notif?: unknown;
      priv?: unknown;
      conexiones?: unknown;
    };
    const resp: Record<string, unknown> = { ok: true };
    if (b.empleabilidad !== undefined) resp.empleabilidad = await guardarEmpleabilidad(user.id, b.empleabilidad);
    if (b.notif !== undefined) resp.notif = await guardarNotif(user.id, b.notif);
    if (b.priv !== undefined) resp.priv = await guardarPriv(user.id, b.priv);
    if (b.conexiones !== undefined) resp.conexiones = await guardarConexiones(user.id, b.conexiones);
    return NextResponse.json(resp);
  } catch (e) {
    return errorInterno('PATCH /api/estudiante/preferencias', e);
  }
}
