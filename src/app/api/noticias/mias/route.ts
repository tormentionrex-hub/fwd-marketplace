import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { error, errorInterno } from '@/server/http/responder';
import { listarMias } from '@/server/services/noticia.service';

export const dynamic = 'force-dynamic';

// GET /api/noticias/mias — noticias del usuario autenticado (para su panel).
export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  try {
    const noticias = await listarMias(user.id);
    return NextResponse.json({ noticias });
  } catch (e) {
    return errorInterno('GET /api/noticias/mias', e);
  }
}
