import 'server-only';
import { createClient } from '@/lib/supabase/server';

// Devuelve el usuario autenticado (o null) leyendo la cookie de sesión de
// Supabase. Úsalo en Server Components y Route Handlers para saber quién hace la
// petición. No hace falta mandar tokens a mano: todo es same-origin.
//
// Ejemplo en un Route Handler:
//   const user = await getUser();
//   if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
