import 'server-only';
import { cookies } from 'next/headers';

// Sesión propia same-origin. La parte PRIVADA del usuario viaja en una cookie
// httpOnly (no accesible por JS): id, rol, correo y el token de 16 chars.
// El perfil PÚBLICO (nombre, foto) lo guarda el cliente en localStorage.

const COOKIE = 'fwd_session';
const UNA_SEMANA = 60 * 60 * 24 * 7;

export interface PayloadSesion {
  uid: string;
  rol: string;
  correo: string;
  token: string;
}

export async function crearCookieSesion(payload: PayloadSesion): Promise<void> {
  const valor = Buffer.from(JSON.stringify(payload)).toString('base64');
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, valor, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: UNA_SEMANA,
  });
}

export async function leerCookieSesion(): Promise<PayloadSesion | null> {
  const cookieStore = await cookies();
  const valor = cookieStore.get(COOKIE)?.value;
  if (!valor) return null;

  try {
    const json = Buffer.from(valor, 'base64').toString('utf8');
    const payload = JSON.parse(json) as PayloadSesion;
    return payload?.uid ? payload : null;
  } catch {
    return null;
  }
}

export async function borrarCookieSesion(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
