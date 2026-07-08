import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { subirImagenCloudinary, subirVideoCloudinary } from '@/server/storage/cloudinary';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

const MAX_IMAGEN = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO = 50 * 1024 * 1024; // 50 MB
const IMAGENES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEOS = ['video/mp4', 'video/webm', 'video/quicktime'];

// POST /api/noticias/media — sube una imagen o video para adjuntar a una noticia.
// Body: FormData con "archivo" (File). Devuelve { url, tipo }.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);
  const user = await getUser(request);
  if (!user) return error('No autorizado', 401);
  if (user.estado !== 'activo') return error('Tu cuenta no puede subir archivos', 403);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return error('Formato inválido (se esperaba multipart/form-data)', 400);
  }

  const archivo = formData.get('archivo');
  if (!(archivo instanceof File)) return error('Campo "archivo" requerido', 400);

  const esImagen = IMAGENES.includes(archivo.type);
  const esVideo = VIDEOS.includes(archivo.type);
  if (!esImagen && !esVideo) {
    return error('Tipo no permitido. Imágenes: JPEG, PNG, WEBP, GIF. Video: MP4, WEBM, MOV.', 400);
  }
  if (esImagen && archivo.size > MAX_IMAGEN) return error('La imagen no puede superar 5 MB', 400);
  if (esVideo && archivo.size > MAX_VIDEO) return error('El video no puede superar 50 MB', 400);

  try {
    const url = esImagen
      ? await subirImagenCloudinary(archivo, 'fwd/noticias')
      : await subirVideoCloudinary(archivo, 'fwd/noticias');
    if (!url) return error('No se pudo subir el archivo. Intentá de nuevo.', 502);
    return NextResponse.json({ url, tipo: esImagen ? 'imagen' : 'video' }, { status: 201 });
  } catch (e) {
    return errorInterno('POST /api/noticias/media', e);
  }
}
