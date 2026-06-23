import 'server-only';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

// Sesión propia same-origin. La parte PRIVADA del usuario viaja en una cookie
// httpOnly (no accesible por JS): id, rol, correo y el token de 16 chars.
// El perfil PÚBLICO (nombre, foto) lo guarda el cliente en localStorage.
//
// La cookie va FIRMADA con HMAC-SHA256 (mismo AUTH_TOKEN_SECRET que reset-token):
// formato `${base64(payload)}.${HMAC(base64(payload))}`. Sin la firma válida la
// sesión se rechaza, así el `uid` (y todo el payload) no es manipulable desde el
// navegador. El base64 estándar no usa '.', por eso sirve de separador.

const COOKIE = 'fwd_session';

export interface PayloadSesion {
  uid: string;
  rol: string;
  correo: string;
  token: string;
}

// Firma HMAC del valor base64. Prefijo de dominio 'sesion:' para que una firma
// de sesión no sea reutilizable como token de reset (que usa 'reset:').
function firmaSesion(valorBase64: string): string {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) throw new Error('Falta AUTH_TOKEN_SECRET en el entorno (.env)');
  return createHmac('sha256', secret).update(`sesion:${valorBase64}`).digest('hex');
}

export async function crearCookieSesion(payload: PayloadSesion): Promise<void> {
  const valor = Buffer.from(JSON.stringify(payload)).toString('base64');
  const firmado = `${valor}.${firmaSesion(valor)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, firmado, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  cookieStore.set('fwd_new_session', 'true', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60, // 1 minuto es suficiente
  });
}

// Valida y decodifica el valor de la cookie fwd_session.
// Extrae el payload si la firma HMAC es válida, o null si no.
function verificarCookieSesion(cookieValue: string): PayloadSesion | null {
  try {
    const idx = cookieValue.lastIndexOf('.');
    if (idx <= 0) return null;

    const valor = cookieValue.slice(0, idx);
    const sig = cookieValue.slice(idx + 1);

    const recibido = Buffer.from(sig);
    const esperado = Buffer.from(firmaSesion(valor));
    if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) {
      return null;
    }

    const json = Buffer.from(valor, 'base64').toString('utf8');
    const payload = JSON.parse(json) as PayloadSesion;
    return payload?.uid ? payload : null;
  } catch (err) {
    console.error('[session] cookie inválida o secreto ausente', err);
    return null;
  }
}

// Lee la sesión desde cookies() de next/headers (Server Components y páginas).
export async function leerCookieSesion(): Promise<PayloadSesion | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE)?.value;
  if (!cookieValue) return null;
  return verificarCookieSesion(cookieValue);
}

// Lee la sesión directamente desde el header Cookie del Request
// (Route Handlers que tienen acceso al objeto request).
// Evita depender de cookies() de next/headers en contextos API.
export function leerCookieSesionDeRequest(request: Request): PayloadSesion | null {
  const header = request.headers.get('cookie') ?? '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return null;
  const cookieValue = decodeURIComponent(match[1]);
  return verificarCookieSesion(cookieValue);
}

export async function borrarCookieSesion(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
  cookieStore.delete('fwd_new_session');
}
