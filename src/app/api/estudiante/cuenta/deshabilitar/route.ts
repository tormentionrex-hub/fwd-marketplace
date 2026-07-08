import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { deshabilitarCuenta } from '@/server/services/cuenta-estudiante.service';
import { error, errorInterno } from '@/server/http/responder';

// POST /api/estudiante/cuenta/deshabilitar — deja la cuenta como 'inactivo'.
export async function POST() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  try {
    await deshabilitarCuenta(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('POST /api/estudiante/cuenta/deshabilitar', e);
  }
}
