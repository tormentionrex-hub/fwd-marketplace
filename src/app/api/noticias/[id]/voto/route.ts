import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';
import { alternarVoto } from '@/server/services/noticia.service';

// POST /api/noticias/[id]/voto — alterna el upvote del usuario autenticado.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('Iniciá sesión para votar', 401);

  const { id } = await params;
  try {
    const resultado = await alternarVoto(id, user.id);
    if (!resultado) return error('Noticia no encontrada', 404);
    return NextResponse.json(resultado);
  } catch (e) {
    return errorInterno('POST /api/noticias/[id]/voto', e);
  }
}
