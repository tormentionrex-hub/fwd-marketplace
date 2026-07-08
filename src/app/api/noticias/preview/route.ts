import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { previewLinkSchema } from '@/server/validation/noticia.schema';
import { obtenerLinkPreview, urlEmbedVideo } from '@/server/services/link-preview.service';

// POST /api/noticias/preview — desde el modal, al pegar un enlace: devuelve el
// preview Open Graph (o el embed de video si es YouTube/Vimeo) para mostrarlo
// en vivo antes de publicar. Requiere sesión (evita usarlo como proxy abierto).
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);

  const parseo = await parsearBody(request, previewLinkSchema);
  if (!parseo.ok) return parseo.respuesta;

  try {
    const embed = urlEmbedVideo(parseo.data.url);
    if (embed) {
      return NextResponse.json({ tipo: 'video', embedUrl: embed, url: parseo.data.url });
    }
    const preview = await obtenerLinkPreview(parseo.data.url);
    if (!preview) return error('No se pudo leer el enlace', 422);
    return NextResponse.json({ tipo: 'link', preview });
  } catch (e) {
    return errorInterno('POST /api/noticias/preview', e);
  }
}
