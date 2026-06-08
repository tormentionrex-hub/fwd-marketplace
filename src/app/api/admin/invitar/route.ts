import { NextResponse } from 'next/server';
import { getUser } from '@/server/auth/get-user';
import {
  crearInvitacion,
  buscarInvitacionPendientePorEmail,
} from '@/server/repositories/pending-verification.repository';
import { enviarEmailInvitacion } from '@/lib/email';

// POST /api/admin/invitar
// El admin escribe un email → se guarda en pending_verifications → se envía
// el correo de invitación para que el estudiante complete su registro.
// Body: { email: string }
export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.roles.nombre !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'Falta el email' }, { status: 400 });
  }

  // Evitar duplicados: si ya existe una invitación para ese email, no crear otra
  const existente = await buscarInvitacionPendientePorEmail(email);
  if (existente) {
    return NextResponse.json(
      { error: 'Ese correo ya tiene una invitación registrada.' },
      { status: 409 }
    );
  }

  await crearInvitacion(email);
  await enviarEmailInvitacion(email);

  return NextResponse.json({
    ok: true,
    mensaje: `Invitación enviada a ${email}.`,
  });
}
