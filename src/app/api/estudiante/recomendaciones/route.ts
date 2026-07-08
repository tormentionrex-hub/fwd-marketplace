import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { recomendarProyectos } from '@/server/services/recomendaciones-estudiante.service';
import { error, errorInterno } from '@/server/http/responder';

// GET /api/estudiante/recomendaciones?offset=0&limit=5 — proyectos del
// marketplace recomendados para el estudiante autenticado (prefiltro
// determinista + explicación con IA). Se pagina de a lotes para carga rápida.
export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);

  const { searchParams } = new URL(req.url);
  const offset = Math.max(0, Number.parseInt(searchParams.get('offset') ?? '0', 10) || 0);
  const limitRaw = Number.parseInt(searchParams.get('limit') ?? '5', 10) || 5;
  const limit = Math.min(10, Math.max(1, limitRaw));

  try {
    const data = await recomendarProyectos(user.id, offset, limit);
    return NextResponse.json(data);
  } catch (e) {
    return errorInterno('estudiante/recomendaciones/GET', e);
  }
}
