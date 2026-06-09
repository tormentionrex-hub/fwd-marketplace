import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  listarPendingVerifications,
  aprobarSolicitud,
} from '@/server/repositories/pending-verification.repository';
import { enviarEmailInvitacion } from '@/lib/email';

// GET /api/admin/verificaciones
// Lista todas las invitaciones/solicitudes pendientes. Solo admin.
export async function GET() {
  const user = await getUser();
  if (!user || user.roles.nombre !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const pendientes = await listarPendingVerifications();
  return NextResponse.json({ pendientes });
}

// PATCH /api/admin/verificaciones
// Aprueba una solicitud que llegó sin invitación previa:
//   → cierra la fila (pending=false) y envía el email de invitación al estudiante.
// Body: { id: string }
export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user || user.roles.nombre !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Falta el id' }, { status: 400 });
  }

  const verificacion = await aprobarSolicitud(body.id);

  // Enviar invitación para que completen el registro
  await enviarEmailInvitacion(verificacion.email);

  return NextResponse.json({
    ok: true,
    mensaje: `Invitación enviada a ${verificacion.email}.`,
  });
}
