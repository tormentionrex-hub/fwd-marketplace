import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin, esRolStaff } from '@/server/auth/roles';
import { mismoOrigen } from '@/server/http/request';
import { actualizarUsuario } from '@/server/repositories/usuario.repository';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/mi-perfil
// Body: { nombre, segundoApellido?, imageUrl? }
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!esRolStaff(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  let body: {
    nombre?: string;
    segundoApellido?: string | null;
    imageUrl?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const nombre = body.nombre?.trim();
  if (!nombre) {
    return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });
  }

  try {
    await actualizarUsuario(user.id, {
      nombre,
      segundo_nombre: null,
      segundo_apellido: body.segundoApellido?.trim() || null,
      ...(body.imageUrl !== undefined && { image_url: body.imageUrl }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[API] actualizar mi-perfil:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el perfil.' }, { status: 500 });
  }
}
