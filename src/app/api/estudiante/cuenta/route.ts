import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/server/auth/get-user';
import {
  actualizarNombre,
  actualizarCorreo,
  actualizarTelefono,
  eliminarCuenta,
} from '@/server/services/cuenta-estudiante.service';
import { error, errorInterno } from '@/server/http/responder';

const patchSchema = z.object({
  campo: z.enum(['nombre', 'correo', 'telefono']),
  valor: z.string().max(254),
});

// PATCH /api/estudiante/cuenta — edita nombre, correo o teléfono (uno por vez).
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return error('Datos inválidos', 422);

  try {
    const { campo, valor } = parsed.data;
    const r =
      campo === 'nombre'
        ? await actualizarNombre(user.id, valor)
        : campo === 'correo'
          ? await actualizarCorreo(user.id, valor)
          : await actualizarTelefono(user.id, valor);

    if (r === 'invalido') return error('El valor ingresado no es válido', 422);
    if (r === 'correo_en_uso') return error('Ese correo ya está en uso', 409);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('PATCH /api/estudiante/cuenta', e);
  }
}

// DELETE /api/estudiante/cuenta — borra la cuenta permanentemente.
export async function DELETE() {
  const user = await getUser();
  if (!user) return error('No autorizado', 401);
  if (user.roles.nombre !== 'estudiante') return error('Solo estudiantes', 403);

  try {
    await eliminarCuenta(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('DELETE /api/estudiante/cuenta', e);
  }
}
