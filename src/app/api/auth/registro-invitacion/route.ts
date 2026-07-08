import { NextResponse } from 'next/server';
import { registrarConInvitacion } from '@/server/services/auth.service';
import { verificarInvitacion } from '@/server/auth/invite-token';
import { crearCookieSesion } from '@/server/auth/session';
import { rutaPorRol } from '@/server/auth/rutas';
import { permitido } from '@/server/auth/rate-limit';
import { clienteIp, mismoOrigen } from '@/server/http/request';
import { error, errorInterno } from '@/server/http/responder';

export const dynamic = 'force-dynamic';

const QUINCE_MIN = 15 * 60_000;

// POST /api/auth/registro-invitacion
// Completa el registro desde el enlace de invitación. El email y el rol vienen
// del TOKEN firmado (no del cliente) y se re-validan acá. El rol se asigna en el
// servidor. Crea la cuenta + sesión y devuelve el destino según el rol.
// Body: { token, nombre, edad?, password }
export async function POST(request: Request) {
  if (!mismoOrigen(request)) return error('Origen no permitido', 403);

  const ip = clienteIp(request);
  if (!permitido(`registro-invitacion-ip:${ip}`, 10, QUINCE_MIN)) {
    return error('Demasiadas solicitudes. Intentá de nuevo más tarde.', 429);
  }

  // Leer y loggear el body raw y headers para depuración temporal
  let body: { token?: string; nombre?: string; edad?: number | string | null; password?: string };
  try {
    const contentType = request.headers.get('content-type');
    console.log('[registro-invitacion] content-type:', contentType);
    console.log('[registro-invitacion] headers:', Object.fromEntries(request.headers));
    const raw = await request.text();
    console.log('[registro-invitacion] raw body:', raw);
    body = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('[registro-invitacion] error parsing body', e);
    return error('Cuerpo inválido', 400);
  }

  // 1. El token firmado es la fuente de verdad del email + rol.
  const payload = verificarInvitacion(typeof body.token === 'string' ? body.token : '');
  if (!payload) return error('La invitación no es válida o expiró.', 400);

  // 2. Datos del formulario.
  const nombre = String(body.nombre ?? '').trim();
  const password = String(body.password ?? '');
  if (nombre.length < 2) return error('Ingresá tu nombre.', 400);
  if (password.length < 8) return error('La contraseña debe tener al menos 8 caracteres.', 400);

  let edad: number | undefined;
  if (body.edad !== undefined && body.edad !== null && body.edad !== '') {
    const n = Number(body.edad);
    if (!Number.isInteger(n) || n < 0 || n > 120) return error('La edad no es válida.', 400);
    edad = n;
  }

  try {
    const resultado = await registrarConInvitacion({
      email: payload.email,
      rol: payload.rol,
      nombre,
      edad,
      password,
    });

    if (resultado === 'no_invitado') {
      return error('La invitación ya no está disponible o fue revocada.', 403);
    }
    if (resultado === null) {
      return error('Ese correo ya está registrado.', 409);
    }

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
      rol: resultado.usuario.rol,
      redirectTo: rutaPorRol(resultado.usuario.rol),
    });
  } catch (e) {
    return errorInterno('auth/registro-invitacion', e);
  }
}
