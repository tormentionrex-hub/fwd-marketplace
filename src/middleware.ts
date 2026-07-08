import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Solo ruteo i18n: next-intl decide el locale y hace los redirects (/ -> /es, etc.).
// La auth de la app es PROPIA (cookie `fwd_session` firmada con HMAC, ver
// src/server/auth/session.ts), NO Supabase Auth. Antes el middleware llamaba a
// supabase.auth.getUser() en CADA navegacion: un round-trip de red cuyo resultado
// nadie consumia. Se quito para eliminar ese delay por click.
// Supabase sigue intacto para la base de datos (Prisma) y el Storage de archivos.
export default createMiddleware(routing);

export const config = {
  // Salta archivos estáticos, _next y rutas con extensión.
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
