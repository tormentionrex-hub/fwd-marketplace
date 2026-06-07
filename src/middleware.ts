import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1) next-intl decide el locale y produce la response (redirects /es, etc.)
  const response = handleI18nRouting(request);
  // 2) Supabase refresca la sesión y pega sus cookies SOBRE esa misma response.
  return await updateSession(request, response);
}

export const config = {
  // Salta archivos estáticos, _next y rutas con extensión.
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
