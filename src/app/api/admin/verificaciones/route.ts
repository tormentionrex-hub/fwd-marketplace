import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  listarPendingVerifications,
  aprobarSolicitud,
  rechazarSolicitud,
} from '@/server/repositories/pending-verification.repository';
import { enviarEmailInvitacion, enviarEmailInvitacionRechazada } from '@/lib/email';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { aprobarVerificacionSchema } from '@/server/validation/admin.schema';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';

// Ruta admin protegida por cookie: siempre dinámica (sin optimización estática).
export const dynamic = 'force-dynamic';

// GET /api/admin/verificaciones
// Lista todas las invitaciones/solicitudes pendientes. Solo admin.
export async function GET() {
  const user = await getUser();
  if (!user || !puedeAccederPanelAdmin(user.roles.nombre)) return error('No autorizado', 401);

  try {
    const pendientes = await listarPendingVerifications();
    return NextResponse.json({ pendientes });
  } catch (e) {
    return errorInterno('admin/verificaciones/GET', e);
  }
}

// PATCH /api/admin/verificaciones
// Aprueba una solicitud que llegó sin invitación previa:
//   → cierra la fila (pending=false) y envía el email de invitación al estudiante.
// Body: { id: string }
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || !puedeAccederPanelAdmin(user.roles.nombre)) return error('No autorizado', 401);

  const parseo = await parsearBody(request, aprobarVerificacionSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { id } = parseo.data;

  try {
    const verificacion = await aprobarSolicitud(id);

    // Enviar invitación para que completen el registro
    await enviarEmailInvitacion(verificacion.email);

    return NextResponse.json({
      ok: true,
      mensaje: `Invitación enviada a ${verificacion.email}.`,
    });
  } catch (e) {
    return errorInterno('admin/verificaciones/PATCH', e);
  }
}

// DELETE /api/admin/verificaciones
// Rechaza una solicitud de invitación (la borra de pending_verifications y envía email de rechazo)
// Body: { id: string }
export async function DELETE(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || !puedeAccederPanelAdmin(user.roles.nombre)) return error('No autorizado', 401);

  const parseo = await parsearBody(request, aprobarVerificacionSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { id } = parseo.data;

  try {
    const verificacion = await rechazarSolicitud(id);

    // Enviar correo de rechazo
    await enviarEmailInvitacionRechazada(verificacion.email);

    return NextResponse.json({
      ok: true,
      mensaje: `Solicitud de ${verificacion.email} rechazada con éxito.`,
    });
  } catch (e) {
    return errorInterno('admin/verificaciones/DELETE', e);
  }
}
