import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { responderSolicitud } from '@/server/services/solicitud-mensaje.service';

// PATCH /api/solicitudes/:id — un estudiante acepta o rechaza una solicitud.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (user.roles.nombre !== 'estudiante') {
    return NextResponse.json({ error: 'Solo los estudiantes' }, { status: 403 });
  }

  const { id } = await params;

  let body: { accion?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (body.accion !== 'aceptar' && body.accion !== 'rechazar') {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  const resultado = await responderSolicitud(user.id, id, body.accion);

  if (resultado === 'no_encontrada') {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }
  if (resultado === 'no_autorizado') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  if (resultado === 'ya_resuelta') {
    return NextResponse.json({ error: 'Esta solicitud ya fue respondida' }, { status: 409 });
  }

  return NextResponse.json({ ok: true, estado: resultado.estado });
}
