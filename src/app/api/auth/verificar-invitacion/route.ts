import { NextResponse } from 'next/server';
import { buscarInvitacionPendientePorEmail } from '@/server/repositories/pending-verification.repository';
import { buscarUsuarioPorCorreo } from '@/server/repositories/usuario.repository';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { verificarInvitacionSchema } from '@/server/validation/auth.schema';

const QUINCE_MIN = 15 * 60_000;

// POST /api/auth/verificar-invitacion
// Verifica que un email: (1) fue invitado (pending=true) y (2) no está registrado.
// El form de registro lo usa en el paso 1 antes de mostrar los demás campos.
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  // Rate limit por IP: evita usar este endpoint para enumerar correos invitados.
  const ip = clienteIp(request);
  if (!permitido(`verif-inv-ip:${ip}`, 20, QUINCE_MIN)) {
    return error('Demasiadas solicitudes. Intentá de nuevo más tarde.', 429);
  }

  const parseo = await parsearBody(request, verificarInvitacionSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { email } = parseo.data;

  try {
    const invitacion = await buscarInvitacionPendientePorEmail(email);
    if (!invitacion || !invitacion.pending) {
      return error(
        'Este correo no ha sido invitado aún. Pedile al equipo de FWD una invitación para poder registrarte.',
        403,
      );
    }

    // Ya se registró con esta invitación
    const usuarioExistente = await buscarUsuarioPorCorreo(email);
    if (usuarioExistente) {
      return error('Este correo ya tiene una cuenta registrada. Iniciá sesión.', 409);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorInterno('auth/verificar-invitacion', e);
  }
}
