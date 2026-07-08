import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

// Recibe la response que ya generó next-intl y le ADHIERE las cookies de Supabase.
// No crea su propia NextResponse: así no pisa el routing de i18n.
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si aún no hay claves (.env.local sin llenar), auth queda desactivada y la app
  // sigue funcionando. Permite a todo el equipo correr la UI sin claves todavía.
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresca el token si expiró. NO metas lógica entre createServerClient y getUser.
  await supabase.auth.getUser();

  return response;
}
