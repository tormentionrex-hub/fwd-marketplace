import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Almacenamiento del CV en un bucket PRIVADO de Supabase Storage.
// El acceso al archivo es siempre por URL firmada de corta duración (no hay
// URL pública), para impedir el acceso directo por URL.
const BUCKET = 'curriculums';
const TTL_SEGUNDOS = 60 * 10; // 10 minutos

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      'Faltan credenciales de Supabase Storage (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY).',
    );
  }
  return createClient(url, key);
}

export async function subirArchivoCv(
  path: string,
  contenido: Buffer,
  contentType: string,
): Promise<boolean> {
  const { error } = await admin()
    .storage.from(BUCKET)
    .upload(path, contenido, { contentType, upsert: true });
  if (error) console.error('[CV upload]', error.message);
  return !error;
}

/** URL firmada (10 min). Si `descargarComo` se pasa, fuerza descarga con ese nombre. */
export async function urlFirmadaCv(
  path: string,
  descargarComo?: string,
): Promise<string | null> {
  const { data, error } = await admin()
    .storage.from(BUCKET)
    .createSignedUrl(path, TTL_SEGUNDOS, descargarComo ? { download: descargarComo } : undefined);
  return error ? null : data.signedUrl;
}

export async function borrarArchivoCv(path: string): Promise<void> {
  await admin().storage.from(BUCKET).remove([path]);
}

export async function descargarArchivoCv(path: string): Promise<Buffer | null> {
  const { data, error } = await admin().storage.from(BUCKET).download(path);
  if (error || !data) {
    console.error('[CV download]', error?.message);
    return null;
  }
  return Buffer.from(await data.arrayBuffer());
}
