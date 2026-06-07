import 'server-only';
import { leerCookieSesion } from '@/server/auth/session';
import { buscarUsuarioPorId } from '@/server/repositories/usuario.repository';

// Devuelve el usuario autenticado (o null) leyendo la cookie de sesión.
// Toma el id de la cookie y trae el usuario fresco de la DB (con el nombre del
// rol) — la DB es la fuente de verdad, no confiamos en el rol de la cookie para
// autorizar. Úsalo en Server Components y Route Handlers.
//
// Ejemplo en un Route Handler:
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
export async function getUser() {
  const sesion = await leerCookieSesion();
  if (!sesion) return null;

  return buscarUsuarioPorId(sesion.uid);
}
