import { NextResponse } from 'next/server';
import { registrarEstudiante } from '@/server/services/auth.service';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { registerSchema } from '@/server/validation/auth.schema';

const QUINCE_MIN = 15 * 60_000;

// POST /api/auth/register-estudiante
// Solo acepta correos que ya fueron invitados por el admin (pending_verifications).
// Si fue invitado → crea cuenta activa + sesión inmediata (el admin ya pre-aprobó).
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const ip = clienteIp(request);
  if (!permitido(`register-est-ip:${ip}`, 10, QUINCE_MIN)) {
    return error('Demasiadas solicitudes. Intentá de nuevo más tarde.', 429);
  }

  const parseo = await parsearBody(request, registerSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { firstName, lastName, secondLastName, generationFwd, email, password } = parseo.data;

  const nombre = `${firstName} ${lastName}`.trim();

  try {
    const resultado = await registrarEstudiante(nombre, email, password, {
      segundoApellido: secondLastName,
      generacionFwd: generationFwd,
    });

    if (resultado === 'no_invitado') {
      return error(
        'Este correo no ha sido invitado aún. Pedile al equipo de FWD una invitación.',
        403,
      );
    }
    if (resultado === null) {
      return error('Ese correo ya está registrado', 409);
    }

    // Invitación válida → cuenta creada → sesión inmediata
    await crearCookieSesion({
      uid: resultado.usuario.id,
      rol: resultado.usuario.rol,
      correo: resultado.usuario.correo,
      token: resultado.token,
    });

    return NextResponse.json({
      perfil: {
        nombre: resultado.usuario.nombre,
        image_url: resultado.usuario.image_url,
      },
      redirectTo: rutaPorRol(resultado.usuario.rol),
    });
  } catch (e) {
    return errorInterno('auth/register-estudiante', e);
  }
}
