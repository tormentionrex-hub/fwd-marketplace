import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  aprobarEntregableService,
  solicitarCambiosService,
  type ResultadoGestion,
} from '@/server/services/gestion.service';

// PATCH /api/entregables/[id]  — Body: { accion: 'aprobar' | 'cambios', comentario? }
// Acciones del empresario sobre un entregable (Página 14, fase 3).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

  let resultado: ResultadoGestion;
  if (body.accion === 'aprobar') {
    resultado = await aprobarEntregableService(id, user.id);
  } else if (body.accion === 'cambios') {
    resultado = await solicitarCambiosService(id, user.id, body.comentario ?? '');
  } else {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  if (resultado === 'no_encontrado') {
    return NextResponse.json({ error: 'Entregable no encontrado' }, { status: 404 });
  }
  if (resultado === 'no_autorizado') {
    return NextResponse.json({ error: 'Este proyecto no es tuyo' }, { status: 403 });
  }
  if (resultado === 'comentario_requerido') {
    return NextResponse.json({ error: 'El comentario es obligatorio' }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
