'use client';

import { createClient } from '@/lib/supabase/client';
import { API_BASE_URL } from './config';

// Llama a la API de NestJS DESDE el navegador (Client Components), para datos
// interactivos del usuario logueado. Requiere NEXT_PUBLIC_API_URL y CORS
// habilitado en el backend para el dominio del frontend.
//
// Adjunta el JWT de Supabase del usuario actual; el backend lo valida.
export async function apiFetchClient(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const supabase = createClient();
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

  return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
}
