import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import { puedeAccederPanelAdmin } from '@/server/auth/roles';
import {
  crearInvitacion,
  buscarInvitacionPendientePorEmail,
  buscarInvitacionPorId,
  eliminarInvitacion,
} from '@/server/repositories/pending-verification.repository';
import { enviarEmailInvitacion } from '@/lib/email';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { invitarSchema, invitacionIdSchema } from '@/server/validation/admin.schema';

// Ruta admin protegida por cookie: siempre dinámica (sin optimización estática).
export const dynamic = 'force-dynamic';

// POST /api/admin/invitar
// El admin escribe un email (y opcionalmente un rol de staff) → se guarda en
// pending_verifications → se envía el correo de invitación para que la persona
// complete su registro. Si se envía `rol`, al registrarse recibirá ese rol.
// Body: { email: string, rol?: 'owner' | 'admin' | 'editor' | 'moderator' }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || !puedeAccederPanelAdmin(user.roles.nombre)) return error('No autorizado', 401);

  const parseo = await parsearBody(request, invitarSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { email, rol } = parseo.data;

  try {
    // Evitar duplicados: si ya existe una invitación para ese email, no crear otra
    const existente = await buscarInvitacionPendientePorEmail(email);
    if (existente) {
      return error('Ese correo ya tiene una invitación registrada.', 409);
    }

    await crearInvitacion(email, rol ?? null);
    await enviarEmailInvitacion(email);

    return NextResponse.json({
      ok: true,
      mensaje: `Invitación enviada a ${email}.`,
    });
  } catch (e) {
    return errorInterno('admin/invitar', e);
  }
}

// PATCH /api/admin/invitar — reenvía el correo de una invitación existente.
// Body: { id: string }
export async function PATCH(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || !puedeAccederPanelAdmin(user.roles.nombre)) return error('No autorizado', 401);

  const parseo = await parsearBody(request, invitacionIdSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { id } = parseo.data;

  try {
    const invitacion = await buscarInvitacionPorId(id);
    if (!invitacion || !invitacion.pending || invitacion.tipo !== 'invitacion') {
      return error('La invitación no existe o ya fue completada.', 404);
    }

    await enviarEmailInvitacion(invitacion.email);

    return NextResponse.json({
      ok: true,
      mensaje: `Invitación reenviada a ${invitacion.email}.`,
    });
  } catch (e) {
    return errorInterno('admin/invitar/PATCH', e);
  }
}

// DELETE /api/admin/invitar — revoca (elimina) una invitación pendiente.
// Body: { id: string }
export async function DELETE(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || !puedeAccederPanelAdmin(user.roles.nombre)) return error('No autorizado', 401);

  const parseo = await parsearBody(request, invitacionIdSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { id } = parseo.data;

  try {
    const invitacion = await buscarInvitacionPorId(id);
    if (!invitacion || !invitacion.pending || invitacion.tipo !== 'invitacion') {
      return error('La invitación no existe o ya fue completada.', 404);
    }

    await eliminarInvitacion(id);

    return NextResponse.json({
      ok: true,
      mensaje: `Invitación de ${invitacion.email} revocada.`,
    });
  } catch (e) {
    return errorInterno('admin/invitar/DELETE', e);
  }
}
