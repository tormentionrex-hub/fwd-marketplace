import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/server/auth/get-user';
import { mismoOrigen } from '@/server/http/request';
import { subirImagenCloudinary } from '@/server/storage/cloudinary';

// Cliente Supabase con service role para bypasear RLS en Storage.
// SUPABASE_SERVICE_ROLE_KEY debe estar en .env (nunca con prefijo NEXT_PUBLIC_).
// Los buckets 'prototipos' y 'documentacion' deben existir en Supabase Storage.
function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const TIPOS_PROTOTIPO = [
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const TIPOS_DOCUMENTACION = ['application/pdf'];
const MAX_PROTOTIPO_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_DOCUMENTACION_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/upload/archivo
// Body: FormData con campos:
//   archivo  → File
//   tipo     → 'prototipo' | 'documentacion'
// Respuesta: { url: string }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 });
  }

  const archivo = formData.get('archivo') as File | null;
  const tipo = formData.get('tipo') as string | null;

  if (!archivo || !tipo) {
    return NextResponse.json({ error: 'Faltan campos: archivo y tipo' }, { status: 400 });
  }

  if (tipo !== 'prototipo' && tipo !== 'documentacion') {
    return NextResponse.json({ error: 'tipo debe ser prototipo o documentacion' }, { status: 400 });
  }

  // Validar tipo MIME
  const tiposPermitidos = tipo === 'prototipo' ? TIPOS_PROTOTIPO : TIPOS_DOCUMENTACION;
  if (!tiposPermitidos.includes(archivo.type)) {
    const permitidos = tipo === 'prototipo'
      ? 'ZIP, PDF, JPG, PNG, GIF, WEBP'
      : 'PDF';
    return NextResponse.json(
      { error: `Formato no permitido. Formatos aceptados: ${permitidos}` },
      { status: 422 }
    );
  }

  // Validar tamaño
  const maxBytes = tipo === 'prototipo' ? MAX_PROTOTIPO_BYTES : MAX_DOCUMENTACION_BYTES;
  if (archivo.size > maxBytes) {
    const maxMB = maxBytes / (1024 * 1024);
    return NextResponse.json(
      { error: `El archivo supera el máximo de ${maxMB} MB` },
      { status: 422 }
    );
  }

  // Las imágenes van a Cloudinary; el resto (ZIP/PDF) a Supabase Storage.
  if (archivo.type.startsWith('image/')) {
    const url = await subirImagenCloudinary(archivo, `fwd/${tipo}`);
    if (!url) {
      return NextResponse.json(
        { error: 'No se pudo subir la imagen a Cloudinary. Revisá las credenciales.' },
        { status: 500 },
      );
    }
    return NextResponse.json({ url });
  }

  // Generar path único: userId/timestamp-nombreOriginal
  const timestamp = Date.now();
  const nombreSeguro = archivo.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 60);
  const path = `${user.id}/${timestamp}-${nombreSeguro}`;
  const bucket = tipo === 'prototipo' ? 'prototipos' : 'documentacion';

  const supabase = getStorageClient();
  const arrayBuffer = await archivo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: archivo.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('[UPLOAD ERROR]', uploadError);
    return NextResponse.json(
      { error: 'No se pudo subir el archivo. Intenta de nuevo.' },
      { status: 500 }
    );
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl.publicUrl });
}
