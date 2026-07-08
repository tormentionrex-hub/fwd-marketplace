import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearComentarioSchema } from '@/server/validation/noticia.schema';
import { listarComentarios, comentar } from '@/server/services/noticia.service';

export const dynamic = 'force-dynamic';

// GET /api/noticias/[id]/comentarios?cursor=... — hilo paginado (10 raíces por
// página, con sus respuestas). Público.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor') || undefined;
  try {
    const pagina = await listarComentarios(id, cursor);
    return NextResponse.json(pagina);
  } catch (e) {
    return errorInterno('GET /api/noticias/[id]/comentarios', e);
  }
}

// POST /api/noticias/[id]/comentarios — agrega un comentario (requiere sesión).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('Iniciá sesión para comentar', 401);
  if (user.estado !== 'activo') return error('Tu cuenta no puede comentar en este momento', 403);

  const { id } = await params;
  const parseo = await parsearBody(request, crearComentarioSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const comentario = await comentar(id, user.id, parseo.data.texto, parseo.data.idPadre);
    if (!comentario) return error('Noticia no encontrada', 404);
    return NextResponse.json({ comentario }, { status: 201 });
  } catch (e) {
    return errorInterno('POST /api/noticias/[id]/comentarios', e);
  }
}
