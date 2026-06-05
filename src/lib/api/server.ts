import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { API_BASE_URL } from './config';

// Llama a la API de NestJS DESDE el servidor de Next (Server Components /
// Route Handlers). Es el patrón recomendado para páginas públicas con SSR/SEO:
// el HTML sale ya con los datos y no necesita CORS.
//
// Adjunta automáticamente el JWT de Supabase del usuario actual (si hay sesión),
// que el backend valida en su AuthGuard.
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
}
