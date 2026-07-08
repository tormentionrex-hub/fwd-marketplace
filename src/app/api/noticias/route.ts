import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { crearNoticiaSchema } from '@/server/validation/noticia.schema';
import { listarFeed, publicarNoticia } from '@/server/services/noticia.service';

export const dynamic = 'force-dynamic';

// GET /api/noticias?orden=recientes|populares&categoria=...&cursor=...
// Feed público del foro. Si hay sesión, marca las noticias votadas por el usuario.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ordenParam = searchParams.get('orden');
  const orden = ordenParam === 'populares' ? 'populares' : 'recientes';
  const categoria = searchParams.get('categoria') || undefined;
  const cursor = searchParams.get('cursor') || undefined;

  const user = await getUser(request);

  try {
    const data = await listarFeed({
      orden,
      categoria,
      cursor,
      idUsuario: user?.id ?? null,
    });
    return NextResponse.json(data);
  } catch (e) {
    return errorInterno('GET /api/noticias', e);
  }
}

// POST /api/noticias — publica una noticia. Requiere sesión.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser(request);
  if (!user) return error('Iniciá sesión para publicar', 401);
  // Staff/estudiantes/empresarios pueden publicar; usuarios suspendidos no.
  if (user.estado !== 'activo') return error('Tu cuenta no puede publicar en este momento', 403);

  const parseo = await parsearBody(request, crearNoticiaSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const noticia = await publicarNoticia(user.id, parseo.data);
    return NextResponse.json({ noticia }, { status: 201 });
  } catch (e) {
    return errorInterno('POST /api/noticias', e);
  }
}
