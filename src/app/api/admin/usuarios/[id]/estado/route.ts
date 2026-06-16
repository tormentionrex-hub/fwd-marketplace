import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  activarUsuario,
  rechazarUsuario,
} from '@/server/repositories/usuario.repository';

// PATCH /api/admin/usuarios/:id/estado — aprobar o rechazar una cuenta pendiente.
// Protegido: solo un admin autenticado, y nunca sobre su propia cuenta.
// Body: { accion: 'aprobar' | 'rechazar' }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;
  if (id === user.id) {
    return NextResponse.json(
      { error: 'No puedes cambiar el estado de tu propia cuenta' },
      { status: 400 }
    );
  }

  let body: { accion?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (body.accion !== 'aprobar' && body.accion !== 'rechazar') {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  try {
    if (body.accion === 'aprobar') {
      await activarUsuario(id);
    } else {
      await rechazarUsuario(id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo actualizar la cuenta' },
      { status: 500 }
    );
  }
}
