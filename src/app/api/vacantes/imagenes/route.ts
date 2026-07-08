import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { subirImagenCloudinary } from '@/server/storage/cloudinary';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB por imagen
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/vacantes/imagenes — sube una imagen (logo/portada) a Cloudinary.
// Body: FormData con campo "archivo" (File).
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return error('Formato de cuerpo inválido (se esperaba multipart/form-data)', 400);
  }

  const archivo = formData.get('archivo');
  if (!(archivo instanceof File)) return error('Campo "archivo" requerido', 400);
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return error('Tipo de archivo no permitido. Solo JPEG, PNG, WEBP o GIF.', 400);
  }
  if (archivo.size > MAX_BYTES) {
    return error('La imagen no puede superar 5 MB', 400);
  }

  try {
    const url = await subirImagenCloudinary(archivo, 'fwd/vacantes');
    if (!url) return error('No se pudo subir la imagen. Intenta de nuevo.', 502);
    return NextResponse.json({ ok: true, url }, { status: 201 });
  } catch (e) {
    return errorInterno('vacantes/imagenes/POST', e);
  }
}
