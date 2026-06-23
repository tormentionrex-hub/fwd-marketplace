import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

const QUINCE_MIN = 15 * 60_000;

export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const ip = clienteIp(request);
  if (!permitido(`verif-inv-staff-ip:${ip}`, 20, QUINCE_MIN)) {
    return error('Demasiadas solicitudes. Intentá de nuevo más tarde.', 429);
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return error('Cuerpo inválido', 400);
  }

  const { email } = body;
  if (!email) {
    return error('Datos incompletos', 400);
  }

  const emailNorm = email.trim().toLowerCase();

  try {
    const invitacion = await db.invitaciones_staff.findUnique({
      where: { email: emailNorm }
    });

    if (!invitacion) {
      return error(
        'Este correo no cuenta con una invitación de staff. Contactá al administrador.',
        403
      );
    }

    if (!invitacion.pending) {
      const usuarioExistente = await db.usuarios.findUnique({
        where: { correo: emailNorm }
      });
      if (usuarioExistente) {
        return error('Este correo ya está registrado en la plataforma. Iniciá sesión.', 409);
      }
      return error('Esta invitación ya fue utilizada o no es válida.', 403);
    }

    return NextResponse.json({ ok: true, tipo_staff: invitacion.tipo_staff });
  } catch (e) {
    return errorInterno('auth/verificar-invitacion-staff', e);
  }
}
