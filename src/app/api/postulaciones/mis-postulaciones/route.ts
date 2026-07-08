import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { listarMisPostulaciones } from '@/server/services/postulacion.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/postulaciones/mis-postulaciones — lista las postulaciones del estudiante.
export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  try {
    const postulaciones = await listarMisPostulaciones(user.id);
    return NextResponse.json({ postulaciones });
  } catch (e) {
    return errorInterno('postulaciones/mis-postulaciones', e);
  }
}
