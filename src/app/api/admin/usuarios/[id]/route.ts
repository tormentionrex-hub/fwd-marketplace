import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { eliminarUsuario } from '@/server/repositories/usuario.repository';
import { mismoOrigen } from '@/server/http/request';

// DELETE /api/admin/usuarios/:id — elimina un usuario.
// Protegido: solo un admin autenticado puede borrar, y nunca a sí mismo.
// (Las rutas API NO heredan el guard del layout (admin); valida acá.)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

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
      { error: 'No puedes eliminar tu propia cuenta' },
      { status: 400 }
    );
  }

  try {
    await eliminarUsuario(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo eliminar el usuario' },
      { status: 500 }
    );
  }
}
