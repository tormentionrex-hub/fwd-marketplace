import 'server-only';
import { leerCookieSesion, leerCookieSesionDeRequest } from '@/server/auth/session';
import { buscarUsuarioPorId } from '@/server/repositories/usuario.repository';

// Devuelve el usuario autenticado (o null) leyendo la cookie de sesión.
// En Server Components (sin request): usa cookies() de next/headers.
// En Route Handlers (con request): lee el header Cookie directamente del Request.
// La DB es la fuente de verdad — el rol siempre se trae fresco.
export async function getUser(request?: Request) {
  const sesion = request
    ? leerCookieSesionDeRequest(request)
    : await leerCookieSesion();
  if (!sesion) return null;

  try {
    return await buscarUsuarioPorId(sesion.uid);
  } catch {
    return null;
  }
}
