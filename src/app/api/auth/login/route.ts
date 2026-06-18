import { NextResponse } from 'next/server';
import { login } from '@/server/services/auth.service';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno, parsearBody } from '@/server/http/responder';
import { loginSchema } from '@/server/validation/auth.schema';

const QUINCE_MIN = 15 * 60_000;

export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const parseo = await parsearBody(request, loginSchema);
  if (!parseo.ok) return parseo.respuesta;
  const { email, password } = parseo.data;

  // Rate limit: por correo+IP (fuerza bruta a una cuenta) y por IP (credential
  // stuffing). Se chequea antes del verify (scrypt) para no gastar CPU en spam.
  const ip = clienteIp(request);
  if (
    !permitido(`login:${ip}:${email}`, 8, QUINCE_MIN) ||
    !permitido(`login-ip:${ip}`, 30, QUINCE_MIN)
  ) {
    return error('Demasiados intentos. Esperá unos minutos e intentá de nuevo.', 429);
  }

  try {
    const resultado = await login(email, password);

    if (resultado === null) {
      return error('Correo o contraseña incorrectos', 401);
    }

    // Lo privado (id, rol, correo, token) viaja en la cookie httpOnly firmada.
    await crearCookieSesion({
      uid: resultado.usuario.id,
      rol: resultado.usuario.rol,
      correo: resultado.usuario.correo,
      token: resultado.token,
    });

    // Lo público (nombre, foto) vuelve en el body para localStorage. redirectTo
    // se calcula acá según el rol, así el cliente no necesita conocerlo.
    return NextResponse.json({
      perfil: {
        nombre: resultado.usuario.nombre,
        image_url: resultado.usuario.image_url,
      },
      pendiente: resultado.pendiente ?? false,
      redirectTo: rutaPorRol(resultado.usuario.rol),
    });
  } catch (e) {
    return errorInterno('auth/login', e);
  }
}
