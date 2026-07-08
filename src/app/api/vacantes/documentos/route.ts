import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { subirDocumentoCloudinary } from '@/server/storage/cloudinary';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB por documento
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// POST /api/vacantes/documentos — sube un documento (PDF/Word/Excel) a Cloudinary.
// Body: FormData con campo "archivo" (File). Devuelve { url, nombre }. Solo empresarios.
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
    return error('Tipo no permitido. Solo PDF, Word o Excel.', 400);
  }
  if (archivo.size > MAX_BYTES) {
    return error('El documento no puede superar 10 MB', 400);
  }

  try {
    const url = await subirDocumentoCloudinary(archivo, 'fwd/vacantes/documentos');
    if (!url) return error('No se pudo subir el documento. Intenta de nuevo.', 502);
    const nombre = archivo.name.slice(0, 120) || 'documento';
    return NextResponse.json({ ok: true, url, nombre }, { status: 201 });
  } catch (e) {
    return errorInterno('vacantes/documentos/POST', e);
  }
}
