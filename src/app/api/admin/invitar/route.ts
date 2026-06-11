import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  crearInvitacion,
  buscarInvitacionPendientePorEmail,
} from '@/server/repositories/pending-verification.repository';
import { enviarEmailInvitacion } from '@/lib/email';
import { mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { invitarSchema } from '@/server/validation/admin.schema';

// POST /api/admin/invitar
// El admin escribe un email → se guarda en pending_verifications → se envía
// el correo de invitación para que el estudiante complete su registro.
// Body: { email: string }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const user = await getUser();
  if (!user || user.roles.nombre !== 'admin') return error('No autorizado', 401);

  const parseo = await parsearBody(request, invitarSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { email } = parseo.data;

  try {
    // Evitar duplicados: si ya existe una invitación para ese email, no crear otra
    const existente = await buscarInvitacionPendientePorEmail(email);
    if (existente) {
      return error('Ese correo ya tiene una invitación registrada.', 409);
    }

    await crearInvitacion(email);
    await enviarEmailInvitacion(email);

    return NextResponse.json({
      ok: true,
      mensaje: `Invitación enviada a ${email}.`,
    });
  } catch (e) {
    return errorInterno('admin/invitar', e);
  }
}
