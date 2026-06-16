import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import {
  obtenerPreferencias,
  guardarPreferencias,
} from '@/server/repositories/perfil-empresario.repository';
import { error } from '@/server/http/responder';

const prefsSchema = z.object({
  notif: z.object({
    ofertas: z.boolean(),
    mensajes: z.boolean(),
    hitos: z.boolean(),
    resumen: z.boolean(),
    marketing: z.boolean(),
  }),
  priv: z.object({
    perfilPublico: z.boolean(),
    mostrarRating: z.boolean(),
    contactoDirecto: z.boolean(),
  }),
});

// GET /api/empresario/configuracion — devuelve las preferencias actuales.
export async function GET() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  const prefs = await obtenerPreferencias(user.id);
  return NextResponse.json(prefs);
}

// PUT /api/empresario/configuracion — guarda las preferencias.
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'empresario') return error('Solo empresarios', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) return error('Datos inválidos', 422);

  await guardarPreferencias(user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
