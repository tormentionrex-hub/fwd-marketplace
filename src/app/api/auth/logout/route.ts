import { NextResponse } from 'next/server';
import { borrarCookieSesion } from '@/server/auth/session';
import { mismoOrigen } from '@/server/http/request';
import { error } from '@/server/http/responder';

// Cierra la sesión borrando la cookie httpOnly. El cliente, además, limpia el
// perfil público de localStorage y redirige a /login.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  await borrarCookieSesion();
  return NextResponse.json({ ok: true });
}
