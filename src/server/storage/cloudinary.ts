import 'server-only';
import crypto from 'crypto';

// Subida de imágenes a Cloudinary vía su API REST (upload firmado), sin SDK.
// Credenciales en .env (server-only, sin prefijo NEXT_PUBLIC_):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
function credenciales() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
}

export function cloudinaryConfigurado(): boolean {
  const { cloudName, apiKey, apiSecret } = credenciales();
  return Boolean(cloudName && apiKey && apiSecret);
}

// Sube una imagen a Cloudinary y devuelve la secure_url pública, o null si falla.
// La firma es SHA-1 de los parámetros a firmar (orden alfabético) + api_secret.
export async function subirImagenCloudinary(
  archivo: File,
  folder = 'fwd',
): Promise<string | null> {
  const { cloudName, apiKey, apiSecret } = credenciales();
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[Cloudinary] Faltan credenciales (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).');
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  // Enviamos el archivo como data URI base64 (la forma más compatible para `file`).
  const buffer = Buffer.from(await archivo.arrayBuffer());
  const dataUri = `data:${archivo.type};base64,${buffer.toString('base64')}`;

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const data: { secure_url?: string; error?: { message?: string } } = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error('[Cloudinary] Error de subida:', data?.error?.message ?? `HTTP ${res.status}`);
      return null;
    }
    return data.secure_url;
  } catch (e) {
    console.error('[Cloudinary] Excepción de subida:', e);
    return null;
  }
}

// Sube un documento (PDF u otro archivo) a Cloudinary como recurso `raw` y
// devuelve la secure_url pública, o null si falla. Se usa para adjuntar
// documentos a las vacantes (folletos, descripciones ampliadas, etc.).
export async function subirDocumentoCloudinary(
  archivo: File,
  folder = 'fwd/vacantes/documentos',
): Promise<string | null> {
  const { cloudName, apiKey, apiSecret } = credenciales();
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[Cloudinary] Faltan credenciales (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).');
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const dataUri = `data:${archivo.type};base64,${buffer.toString('base64')}`;

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: form,
    });
    const data: { secure_url?: string; error?: { message?: string } } = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error('[Cloudinary] Error de subida de documento:', data?.error?.message ?? `HTTP ${res.status}`);
      return null;
    }
    return data.secure_url;
  } catch (e) {
    console.error('[Cloudinary] Excepción de subida de documento:', e);
    return null;
  }
}

// Sube un video a Cloudinary (resource_type=video) y devuelve la secure_url
// pública, o null si falla. Mismo esquema de firma que la subida de imagen.
export async function subirVideoCloudinary(
  archivo: File,
  folder = 'fwd/noticias',
): Promise<string | null> {
  const { cloudName, apiKey, apiSecret } = credenciales();
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[Cloudinary] Faltan credenciales (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).');
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const dataUri = `data:${archivo.type};base64,${buffer.toString('base64')}`;

  const form = new FormData();
  form.append('file', dataUri);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: form,
    });
    const data: { secure_url?: string; error?: { message?: string } } = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error('[Cloudinary] Error de subida de video:', data?.error?.message ?? `HTTP ${res.status}`);
      return null;
    }
    return data.secure_url;
  } catch (e) {
    console.error('[Cloudinary] Excepción de subida de video:', e);
    return null;
  }
}
