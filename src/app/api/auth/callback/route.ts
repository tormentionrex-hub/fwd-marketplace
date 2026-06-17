import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';
import { sincronizarUsuarioOAuth } from '@/server/services/oauth.service';

// GET /api/auth/callback — cierre del flujo OAuth (Google / GitHub).
// Supabase redirige aquí con ?code= tras la autorización del proveedor.
// Intercambia el code por una sesión de Supabase, extrae la identidad,
// crea/recupera el usuario en Prisma y emite la cookie propia fwd_session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const mobile = searchParams.get('mobile');

  if (mobile === 'true') {
    if (errorParam || !code) {
      return NextResponse.redirect(`fwdmarketplace://api/auth/callback?error=${errorParam || 'oauth'}`);
    }
    return NextResponse.redirect(`fwdmarketplace://api/auth/callback?code=${code}`);
  }

  if (errorParam || !code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const email = data.user.email;
  if (!email) {
    // GitHub puede tener el email privado: informar al usuario.
    return NextResponse.redirect(`${origin}/login?error=oauth_email`);
  }

  // Normalizar nombre y apellido desde los metadatos del proveedor.
  // Google: given_name / family_name / picture
  // GitHub: name / avatar_url
  const meta = data.user.user_metadata ?? {};
  const nombre: string =
    (meta.given_name as string | undefined) ??
    ((meta.name as string | undefined)?.split(' ')[0] ?? 'Usuario');
  const apellido: string =
    (meta.family_name as string | undefined) ??
    ((meta.name as string | undefined)?.split(' ').slice(1).join(' ') ?? '');
  const imageUrl: string | undefined =
    (meta.picture as string | undefined) ??
    (meta.avatar_url as string | undefined);

  let resultado: Awaited<ReturnType<typeof sincronizarUsuarioOAuth>>;
  try {
    resultado = await sincronizarUsuarioOAuth({ email, nombre, apellido, imageUrl });
  } catch {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  await crearCookieSesion({
    uid: resultado.uid,
    rol: resultado.rol,
    correo: resultado.correo,
    token: resultado.token,
  });

  // Cerrar la sesión de Supabase: la app usa su propia cookie, no la de Supabase.
  await supabase.auth.signOut();

  return NextResponse.redirect(`${origin}${rutaPorRol(resultado.rol)}`);
}
