import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { aprobar, solicitarCambios } from '@/server/services/gestion.service';

// PATCH /api/entregables/[id] — el empresario aprueba o solicita cambios.
// Body JSON: { accion: 'aprobar' | 'cambios', comentario? }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (user.roles.nombre !== 'empresario') {
    return NextResponse.json({ error: 'Solo empresarios' }, { status: 403 });
  }

  const { id } = await params;

  let body: { accion?: string; comentario?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }
  if (body.accion !== 'aprobar' && body.accion !== 'cambios') {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  const r =
    body.accion === 'aprobar'
      ? await aprobar(id, user.id)
      : await solicitarCambios(id, user.id, body.comentario ?? '');

  if (r === 'comentario_requerido') {
    return NextResponse.json({ error: 'El comentario es obligatorio' }, { status: 422 });
  }
  if (r === 'no_autorizado') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  if (r === 'no_encontrado') {
    return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
