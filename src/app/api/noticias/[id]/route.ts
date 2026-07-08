import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearNoticiaSchema } from '@/server/validation/noticia.schema';
import { obtenerDetalle, eliminarNoticia, actualizarNoticia } from '@/server/services/noticia.service';

export const dynamic = 'force-dynamic';

// GET /api/noticias/[id] — detalle de una noticia.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser(request);
  try {
    const noticia = await obtenerDetalle(id, user?.id ?? null);
    if (!noticia) return error('Noticia no encontrada', 404);
    if (noticia.estado !== 'activa' && noticia.autor.id !== user?.id) {
      return error('Noticia no disponible', 404);
    }
    return NextResponse.json({ noticia });
  } catch (e) {
    return errorInterno('GET /api/noticias/[id]', e);
  }
}

// PATCH /api/noticias/[id] — el autor (o staff) edita la noticia.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);

  const { id } = await params;
  const parseo = await parsearBody(request, crearNoticiaSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const r = await actualizarNoticia(id, user.id, user.roles?.nombre ?? '', parseo.data);
    if (r.estado === 'no_encontrada') return error('Noticia no encontrada', 404);
    if (r.estado === 'no_autorizado') return error('No podés editar esta noticia', 403);
    return NextResponse.json({ noticia: r.noticia });
  } catch (e) {
    return errorInterno('PATCH /api/noticias/[id]', e);
  }
}

// DELETE /api/noticias/[id] — el autor o un moderador elimina la noticia.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);

  const { id } = await params;
  try {
    const resultado = await eliminarNoticia(id, user.id, user.roles?.nombre ?? '');
    if (resultado === 'no_encontrada') return error('Noticia no encontrada', 404);
    if (resultado === 'no_autorizado') return error('No podés eliminar esta noticia', 403);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('DELETE /api/noticias/[id]', e);
  }
}
