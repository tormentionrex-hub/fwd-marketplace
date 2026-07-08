import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { moderarNoticia } from '@/server/services/noticia.service';
import { z } from 'zod';

const moderarSchema = z.object({ estado: z.enum(['activa', 'oculta']) });

// POST /api/noticias/[id]/moderar — oculta o reactiva una noticia (solo staff).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);

  const { id } = await params;
  const parseo = await parsearBody(request, moderarSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const resultado = await moderarNoticia(id, user.roles?.nombre ?? '', parseo.data.estado);
    if (resultado === 'no_autorizado') return error('Solo moderación', 403);
    if (resultado === 'no_encontrada') return error('Noticia no encontrada', 404);
    return NextResponse.json({ ok: true, estado: parseo.data.estado });
  } catch (e) {
    return errorInterno('POST /api/noticias/[id]/moderar', e);
  }
}
