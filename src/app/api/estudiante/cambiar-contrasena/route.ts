import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import { cambiarContrasena } from '@/server/services/cuenta-estudiante.service';
import { error } from '@/server/http/responder';

const bodySchema = z.object({
  actual: z.string().min(1, 'La contraseña actual es obligatoria'),
  nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmar: z.string(),
}).refine((d) => d.nueva === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
});

// POST /api/estudiante/cambiar-contrasena
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.errors[0]?.message ?? 'Datos inválidos', 422);
  }

  const r = await cambiarContrasena(user.id, parsed.data.actual, parsed.data.nueva);
  if (r === 'incorrecta') return error('La contraseña actual es incorrecta', 401);
  if (r === 'invalida') return error('La nueva contraseña no cumple los requisitos', 422);

  return NextResponse.json({ ok: true });
}
