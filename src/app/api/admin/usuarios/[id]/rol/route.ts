import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import { mismoOrigen } from '@/server/http/request';
import { buscarRolIdPorNombre, cambiarRolUsuario } from '@/server/repositories/usuario.repository';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Roles que NADIE puede asignar (ni siquiera el owner desde este panel).
const ROL_PROHIBIDO = 'owner';

// Roles que solo el owner puede asignar.
const SOLO_OWNER = ['admin'] as const;

// PATCH /api/admin/usuarios/:id/rol
// Body: { nuevoRol: string }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
  }

  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!puedeAccederPanelAdmin(user.roles.nombre)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { id } = await params;

  // No puede cambiar su propio rol.
  if (id === user.id) {
    return NextResponse.json(
      { error: 'No puedes cambiar tu propio rol.' },
      { status: 400 }
    );
  }

  let body: { nuevoRol?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const nuevoRol = body.nuevoRol?.trim().toLowerCase();
  if (!nuevoRol) {
    return NextResponse.json({ error: 'El nuevo rol es obligatorio.' }, { status: 400 });
  }

  // Nunca asignar owner.
  if (nuevoRol === ROL_PROHIBIDO) {
    return NextResponse.json(
      { error: 'El rol "owner" no puede asignarse desde este panel.' },
      { status: 403 }
    );
  }

  // Solo el owner puede asignar el rol "admin".
  if ((SOLO_OWNER as readonly string[]).includes(nuevoRol) && user.roles.nombre !== 'owner') {
    return NextResponse.json(
      { error: 'Solo el owner puede asignar el rol de administrador.' },
      { status: 403 }
    );
  }

  // Verificar que el usuario objetivo existe.
  const objetivo = await db.usuarios.findUnique({
    where: { id },
    select: { id: true, nombre: true, roles: { select: { nombre: true } } },
  });
  if (!objetivo) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
  }

  // Un admin no puede tocar a otro admin ni a un owner.
  if (
    user.roles.nombre === 'admin' &&
    (objetivo.roles.nombre === 'admin' || objetivo.roles.nombre === 'owner')
  ) {
    return NextResponse.json(
      { error: 'No tienes permiso para cambiar el rol de este usuario.' },
      { status: 403 }
    );
  }

  // Obtener el ID numérico del nuevo rol.
  const idRol = await buscarRolIdPorNombre(nuevoRol);
  if (!idRol) {
    return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 });
  }

  try {
    await cambiarRolUsuario(id, idRol);
    return NextResponse.json({ ok: true, nuevoRol });
  } catch (error) {
    console.error('[API] cambiar rol:', error);
    return NextResponse.json({ error: 'No se pudo cambiar el rol.' }, { status: 500 });
  }
}
