import { NextResponse } from 'next/server';
import { buscarInvitacionPendientePorEmail } from '@/server/repositories/pending-verification.repository';
import { buscarUsuarioPorCorreo } from '@/server/repositories/usuario.repository';

// POST /api/auth/verificar-invitacion
// Verifica que un email:
//   1. Existe en pending_verifications con pending=true (fue invitado)
//   2. Todavía no está registrado en usuarios
// El form de registro usa esto en el paso 1 antes de mostrar los demás campos.
export async function POST(request: Request) {
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

  const invitacion = await buscarInvitacionPendientePorEmail(email);

  if (!invitacion || !invitacion.pending) {
    return NextResponse.json(
      {
        error:
          'Este correo no ha sido invitado aún. Pedile al equipo de FWD una invitación para poder registrarte.',
      },
      { status: 403 }
    );
  }

  // Ya se registró con esta invitación
  const usuarioExistente = await buscarUsuarioPorCorreo(email);
  if (usuarioExistente) {
    return NextResponse.json(
      { error: 'Este correo ya tiene una cuenta registrada. Iniciá sesión.' },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
