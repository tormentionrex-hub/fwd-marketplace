import { NextResponse } from 'next/server';
import { borrarCookieSesion } from '@/server/auth/session';

// Cierra la sesión borrando la cookie httpOnly. El cliente, además, limpia el
// perfil público de localStorage y redirige a /login.
export async function POST() {
  await borrarCookieSesion();
  return NextResponse.json({ ok: true });
}
