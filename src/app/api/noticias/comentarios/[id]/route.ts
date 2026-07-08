import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';
import { eliminarComentario } from '@/server/services/noticia.service';

// DELETE /api/noticias/comentarios/[id] — el autor o un moderador borra el comentario.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);

  const { id } = await params;
  try {
    const resultado = await eliminarComentario(id, user.id, user.roles?.nombre ?? '');
    if (resultado === 'no_encontrada') return error('Comentario no encontrado', 404);
    if (resultado === 'no_autorizado') return error('No podés eliminar este comentario', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('DELETE /api/noticias/comentarios/[id]', e);
  }
}
