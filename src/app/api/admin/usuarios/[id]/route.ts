import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { eliminarUsuario, actualizarUsuario } from '@/server/repositories/usuario.repository';
import { mismoOrigen } from '@/server/http/request';
import { editarUsuarioSchema } from '@/server/validation/admin.schema';

// Ruta de mutación protegida por cookie: siempre dinámica (sin optimización
// estática que, en dev con poca memoria, levanta un worker que puede crashear).
export const dynamic = 'force-dynamic';

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
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
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

// PATCH /api/admin/usuarios/:id — edita los datos básicos de un usuario
// (nombre, apellidos, correo, edad). Body validado con editarUsuarioSchema.
export async function PATCH(
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
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;

  let crudo: unknown;
  try {
    crudo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const parseo = editarUsuarioSchema.safeParse(crudo);
  if (!parseo.success) {
    const mensaje = parseo.error.issues[0]?.message ?? 'Datos inválidos';
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  try {
    await actualizarUsuario(id, parseo.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json(
        { error: 'Ese correo ya está en uso por otra cuenta.' },
        { status: 409 }
      );
    }
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    console.error('[admin/usuarios/PATCH]', e);
    return NextResponse.json(
      { error: 'No se pudo actualizar el usuario' },
      { status: 500 }
    );
  }
}
