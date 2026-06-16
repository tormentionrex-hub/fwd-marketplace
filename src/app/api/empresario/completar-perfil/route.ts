import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import { completarPerfilEmpresario } from '@/server/services/perfil-empresario.service';

const NAME_RE = /^[\p{L}\s''\-]+$/u;
const nameField = (max = 50) =>
  z.string().trim().min(1).max(max).regex(NAME_RE, 'Solo letras, espacios y guiones');

const completarPerfilSchema = z.object({
  firstName:            nameField(50),
  lastName:             nameField(50),
  segundoNombre:        nameField(50).optional().or(z.literal('').transform(() => undefined)),
  segundoApellido:      nameField(50).optional().or(z.literal('').transform(() => undefined)),
  edad:                 z.coerce.number().int().min(18).max(99).nullable().optional(),
  nombreEmpresa:        z.string().trim().min(2).max(200),
});

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo los empresarios' }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const parsed = completarPerfilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.flatten() }, { status: 422 });
  }

  const resultado = await completarPerfilEmpresario(user.id, parsed.data);

  if (resultado === 'datos_invalidos') return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 });
  if (resultado === 'no_existe') return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
